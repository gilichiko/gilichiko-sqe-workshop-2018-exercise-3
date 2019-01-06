/* eslint-disable no-console */
import * as esprima from 'esprima';
import {generate} from 'escodegen';
//import * as estraverse from 'estraverse';
//const esgraph = require('esgraph');

let args4graph=[];
let newargs4G=[];
let edges=[];
let task1model;
let oldcolor;
let havewhile=false;
let currscope=0;
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc:true});
};
let globalcolor='green';
let data=[];
let inred=false;
const overrun=(json,d)=>{
    maplocal={};mapglobal={};opcounter=0;condcounter=0;havewhile=false;edges=[];data=d;args4graph=[];newargs4G=[];edges=[];mapnodes=[];indexforlines=0;maplocal={};infunc=false;task1scope=0; indexforedges=0;
    createmodel(json);
    runoverjson(json);
    makerealnodes();
    makegraph(newargs4G);
    marklines();
    makedges();
    if(!havewhile) colorthenodes();
    let ret=makemakestring4g();
    console.log(ret);
    return ret;
};
const marklines=()=>{
    let indexmodel=0;
    mapnodes.forEach(function (element) {
        for (let i=0;i<element['arrlines'].length;i++){
            task1model[indexmodel]['nodename']=element['name'];
            if(task1model[indexmodel]['Type']==='else statement') i--;
            indexmodel++;
        }
    });
};
let indexforlines=0;
const makerealnodes=()=>{
    let value2push='',currcolor='green',mcurrscope=0,i=0;
    args4graph.forEach(function (element) {
        if(element['type']!='IfStatement'&&element['type']!='WhileStatement'){
            value2push=value2push+element['value']+'\n';i++;
        }
        else {
            handleneeded(value2push,currcolor,element,i);value2push='';i++;
        }
        if (comlexcondchecker(value2push,currcolor,element,mcurrscope,i)){
            Npusharg(value2push,'ops',currcolor,makearrtil(i));value2push='';
        }
        currcolor=element['color'];mcurrscope=element['scope'];
    });
    if(value2push!='')Npusharg(value2push,'ops',currcolor,makearrtil(i));value2push='';
};
const makearrtil=(n)=>{
    let ret=[];
    for (let i=indexforlines;i<n;i++) ret.push(i);
    indexforlines=n;
    return ret;
};
const handleneeded=(value2push,currcolor,element,i)=>{
    if(value2push!=''){
        Npusharg(value2push,'ops',currcolor,makearrtil(i));
    }
    Npusharg(element['value'],element['type'],element['color'],makearrtil(i+1));
};
const comlexcondchecker =(value2push,currcolor,element,mcurrscope)=>{
    return (value2push!=''&&(element['scope']!=mcurrscope||element['color']!=currcolor));
};
const runoverjson =(json)=>{
    let type=json.type;
    functions[type](json);
    return json;
};



const handleProgram = (json)=>{
    let list=json.body;
    list.forEach(function (element) {
        runoverjson(element);
    });
};


const handlecheck = (json)=>{
    if(json.type==='Literal') ;
    else if(json.type==='Identifier') handleidentifeir(json);
    else{
        if(json.type==='BinaryExpression'){handleBINexp(json);}
    }
};

const getval = (json)=>{
    let cond;
    if(json.type==='Literal') cond=json.raw;
    else{
        if(json.type==='Identifier') return getvalidentifier(json);
        else{
            cond=handleBINexpval(json);
        }
    }
    return cond;
};

const getvalidentifier=(json)=>{
    let iname = json.name;
    if(iname in maplocal) return maplocal[iname];
    else{
        if(iname in mapglobal) return mapglobal[iname];
        else return iname;
    }
};

const handleBINexpval = (json)=>{
    let conl=getval(json.left);
    let conr=getval(json.right);
    let op=json.operator;
    let ret =conl.concat(op).concat(conr);
    return ret;
};

const handleBINexp = (json)=>{
    handlecheck(json.left);handlecheck(json.right);
};

const getStringdecl = (json)=>{
    return json.id.name+'='+getval(json.init);
};

const handleVaribledec = (json)=>{
    //model.push("handle-VARdecs");
    let list=json.declarations ;
    let toadd='';
    list.forEach(function(element){
        handleVaribledector(element);
        toadd=toadd+getStringdecl(element);
    });
    pusharg(toadd,'VariableDeclaration',globalcolor);
};

const handleVaribledector = (json)=>{
    let name=json.id.name;
    let val=json.init;
    if(infunc){
        maplocal[name]=getval(val);
    }
    else{
        mapglobal[name]=getval(val);
    }
};

const getStringcond=(json)=>{
    return '('+getval(json)+')';
};

const handleIf = (json)=>{
    let beforeifcolor=globalcolor;
    pusharg(getStringcond(json.test),'IfStatement',globalcolor);
    handlecheck(json.test);
    let doelse=false;
    if (beforeifcolor==='red') inred=true;
    globalcolor=evalgili(getStringcond(json.test));currscope++;
    if(globalcolor==='red'&&beforeifcolor!='red'){
        inred=true;
        envrun(json.consequent);
        inred=false;
        globalcolor='green';
        doelse=true;
    }
    else envrun(json.consequent);
    if(json.alternate!=null) runelse(json,doelse);
    globalcolor=beforeifcolor;currscope--;
};
const runelse =(json,doelse)=>{
    if (!doelse){
        oldcolor='green';
        globalcolor='red';
        inred=true;
        envrun(json.alternate);
        globalcolor=oldcolor;
        inred=false;
    }
    else {
        oldcolor='red';
        globalcolor='green';
        envrun(json.alternate);
        globalcolor=oldcolor;
    }
};

const envrun =(json) =>{
    let temp1={};
    let temp2={};
    saveenv(temp1,temp2);
    runoverjson(json);
    resotrenv(temp1,temp2);
};

const saveenv=(temp1,temp2)=>{
    oldcolor=globalcolor;
    for (var i in maplocal) temp1[i]=maplocal[i];
    for (var j in mapglobal) temp2[j]=mapglobal[j];
};

const resotrenv=(temp1,temp2)=>{
    maplocal={};
    mapglobal={};
    globalcolor=oldcolor;
    for ( var j in temp2) mapglobal[j]=temp2[j];
    for (var i in temp1) maplocal[i]=temp1[i];
};

const handleWhile = (json)=>{
    pusharg(getStringcond(json.test),'WhileStatement',globalcolor);
    handlecheck(json.test);
    //globalcolor=evalgili(getStringcond(json.test));
    havewhile=true;
    currscope++;
    let list=json.body;
    envrun(list);
    currscope--;
    //incond=false;
};

const handleVaribledectorasparam = (json)=>{
    let name=json.name;

    let parsedata=esprima.parseScript(data);

    parsedata.body.forEach(function(element){
        let el=element.expression;
        if(el.left.name===name) mapglobal[name]=getval(el.right);
    });

};
//above

const getStringasm =(json)=>{
    return getval(json.left)+' = '+getval(json.right);
};

const handleVarassign = (json)=>{
    let name=json.left.name;
    let val=json.right;
    if(name in maplocal) maplocal[name]=getval(val);
    else mapglobal[name]=getval(val);
    pusharg(getStringasm(json),'AssignmentExpression',globalcolor);
};
const handleRet = (json)=>{
    pusharg('return '+getval(json.argument),'ReturnStatement',globalcolor);
    handlecheck(json.argument);
};
//const handleunarrexp= (json)=>{
//   if(json.argument.type==='Identifier') handleidentifeir(json.argument);
//};
const handleidentifeir = (json)=>{
    let name=json.name;
    if(name in maplocal){
        json.name=maplocal[name];
    }
    if (name in mapglobal) json.name=mapglobal[name];
};
const handleFuncdec = (json)=>{
    let params=json.params;
    params.forEach(function(element){
        handleVaribledectorasparam(element);
    });
    let block=json.body;
    infunc=true;
    runoverjson(block);
    //removeline(block);
};
const handleBlockstatment = (json)=>{
    let list=json.body;
    list.forEach(function(element){
        runoverjson(element);
    });

};
const handleExp = (json)=>{
    let type=json.expression.type;
    if(type==='AssignmentExpression') handleVarassign(json.expression);
    if(type==='SequenceExpression') handleSeqEXP(json.expression);
    if(type==='Identifier') handleidentifeir(json.expression);
};
const handleSeqEXP = (json)=>{
    let list=json.expressions;
    list.forEach(function(element){
        runoverjson(element);
    });
};

const pusharg=(value,type,color)=>{
    let topush={};
    topush['value']=value;
    topush['type']=type;
    topush['color']=color;
    topush['scope']=currscope;
    args4graph.push(topush);
};
const Npusharg=(value,type,color,arrlines)=>{
    let topush={};
    topush['value']=value;
    topush['type']=type;
    topush['color']=color;
    topush['arrlines']=arrlines;
    newargs4G.push(topush);
};
let functions=[];
functions['ExpressionStatement']= handleExp;
functions['BlockStatement']= handleBlockstatment;
functions['Program']= handleProgram;
functions['FunctionDeclaration']= handleFuncdec;
functions['WhileStatement']= handleWhile;
functions['ReturnStatement']= handleRet;
functions['IfStatement']= handleIf;
functions['VariableDeclaration']= handleVaribledec;
functions['SequenceExpression']= handleSeqEXP;
functions['AssignmentExpression']= handleVarassign;
functions['Identifier']= handleidentifeir;
let mapglobal={};
const evalgili=(toeval)=>{
    if(inred) return 'red';
    try {
        if(eval(toeval)) return 'green';
        else return 'red';
    }
    catch (err){
        return 'white';
    }
};
let maplocal={};
let infunc=false;
export {parseCode};
export {overrun};
const makegraph= (args)=>{
    let ret='';
    let type;
    args.forEach(function (element) {
        type=element['type'];
        ret=ret+Gfunctions[type](element)+'\n';
    });
    return ret;
};
let opcounter=0;
let condcounter=0;

const nocondhandle=(arg)=>{

    Gpusharg('op'+opcounter,arg['type'],arg['value'],false,isgreen(arg['color']),arg['arrlines']);
    opcounter++;
};
const condhandler=(arg)=>{
    Gpusharg('cond'+condcounter,arg['type'],arg['value'],reteval(arg['value']),isgreen(arg['color']),arg['arrlines']);
    condcounter++;
};
const isgreen=()=>{
    //return (color==='green' &&!havewhile);
    return false;
};
const reteval=(value)=>{
    return evalgili(value)==='green';
};

let mapnodes=[];
const Gpusharg=(name,type,content,evalval,isgreen,arrlines)=>{
    let topush={};
    topush['name']=name;
    topush['type']=type;
    topush['content']=content;
    topush['evalval']=evalval;
    topush['isgreen']=isgreen;
    topush['arrlines']=arrlines;
    mapnodes.push(topush);
};
let Gfunctions=[];
Gfunctions['VariableDeclaration']= nocondhandle;
Gfunctions['ops']= nocondhandle;
Gfunctions['IfStatement']= condhandler;
Gfunctions['WhileStatement']= condhandler;
Gfunctions['AssignmentExpression']=nocondhandle;
Gfunctions['ReturnStatement']=nocondhandle;

const createmodel = (parsedcode) => {
    //.log(task1model);
    task1model=[];
    modelforview(parsedcode);
    return task1model;
};
let task1scope=0;





const modelforview =(json)=>{
    let type=json.type;
    //task1model.push(type);
    task1functions[type](json);
    //return task1model;
};
const task1handleProgram = (json)=>{
    let list=json.body;
    list.forEach(function (element) {
        modelforview(element);
    });

};

const task1handlecheck = (json)=>{
    let cond;
    //console.log(json);
    if(json.type==='Literal') cond=json.raw;
    else if(json.type==='Identifier') cond=json.name;
    else{
        cond=task1handleBINexp(json);
    }
    return cond;
};

const task1handleBINexp = (json)=>{
    //console.log(json.operator);
    let cond;
    let concat1=task1handlecheck(json.left),concat2=task1handlecheck(json.right),op;
    op=json.operator;
    cond=concat1.concat(op).concat(concat2);
    return cond;
};

const task1handleIf = (json)=>{
    let cond=task1handlecheck(json.test);
    let stringif=task1checkifelse(json);
    let topush=task1makeTopush(json.loc.start.line,stringif,'',cond,'',cond);
    task1model.push(topush);
    task1scope++;
    modelforview(json.consequent);
    if(json.alternate!=null) task1handleELse(json.alternate );
    task1scope--;
};
const task1checkifelse =(json)=>{
    if(json.alternate!=null) return 'if statement';
    else return 'if statement with no else';
};
const task1handleELse = (json)=>{
    task1scope--;
    let topush2=task1makeTopush(json.loc.start.line,'else statement','','','','');task1scope++;
    task1model.push(topush2);
    if(json.type==='IfStatement'){
        let cond=task1handlecheck(json.test),stringif='else'+task1checkifelse(json);
        let topush=task1makeTopush(json.loc.start.line,stringif,'',cond,'',cond);
        task1model.push(topush);
        task1scope++;
        modelforview(json.consequent);
        if(json.alternate!=null) {
            task1scope--;
            topush2=task1makeTopush(json.alternate.loc.start.line,'else statement','','','','');task1scope++;
            task1model.push(topush2);
            modelforview(json.alternate );
        }
        task1scope--;
    }
    else modelforview(json);
};
const task1handleWhile = (json)=>{
    let cond=task1handlecheck(json.test);
    let topush=task1makeTopush(json.loc.start.line,'while statement','',cond,'',cond);
    task1model.push(topush);
    task1scope++;
    let list=json.body;
    modelforview(list);
    task1scope--;
};
const task1handleVaribledec = (json)=>{
    //task1model.push("handle-VARdecs");
    let list=json.declarations ;
    list.forEach(function(element){
        task1handleVaribledector(element);
    });
};
const task1handleVaribledector = (json)=>{
    let topush=task1makeTopush(json.loc.start.line,'variable declaration',json.id.name,'','',generate(json));
    task1model.push(topush);
};

const task1handleVarassign = (json)=>{
    let val=task1handlecheck(json.right);
    let topush=task1makeTopush(json.loc.start.line,'assignment expression',json.left.name,'',val,generate(json));
    task1model.push(topush);
};
const task1handleRet = (json)=>{
    let val;
    if(json.argument.type==='BinaryExpression')val=task1handlecheck(json.argument);
    else {
        if (json.argument.type==='Literal') val=json.argument.raw;
        else {
            if(json.argument.type==='Identifier') val=json.argument.name;
            else val=task1handleunarrexp(json.argument);
        }
    }
    task1model.push(task1makeTopush(json.loc.start.line,'return statement','','',val,generate(json)));
};
const task1handleunarrexp= (json)=>{
    let val,op;
    if(json.operator==='-') op='-';
    else op='';
    if(json.argument.type==='Literal') val=json.argument.raw;
    else val=json.argument.name;
    return op.concat(val);
};
const task1handleFuncdec = (json)=>{
    //task1model.push(task1makeTopush(json.id.loc.start.line,'FunctionDeclaration',json.id.name,'',''));
    let block=json.body;
    modelforview(block);
};
const task1handleBlockstatment = (json)=>{
    let list=json.body;
    list.forEach(function(element){
        modelforview(element);
    });
};
const task1handleExp = (json)=>{
    let type=json.expression.type;
    if(type==='AssignmentExpression') task1handleVarassign(json.expression);
    if(type==='SequenceExpression') task1handleSeqEXP(json.expression);
};
const task1handleSeqEXP = (json)=>{
    let list=json.expressions;
    list.forEach(function(element){
        modelforview(element);
    });
};
const task1makeTopush = (line, type, name, cond, val,content) =>{
    let topush={};
    topush['nodename']='';
    topush['Line']=line;
    topush['Type']=type;
    topush['Name']=name;
    topush['Condition']=cond;
    topush['Value']=val;
    topush['task1scope']=task1scope;
    topush['content']=content;
    return topush;
};
let task1functions=[];
task1functions['ExpressionStatement']= task1handleExp;
task1functions['BlockStatement']= task1handleBlockstatment;
task1functions['Program']= task1handleProgram;
task1functions['FunctionDeclaration']= task1handleFuncdec;
task1functions['WhileStatement']= task1handleWhile;
task1functions['ReturnStatement']= task1handleRet;
task1functions['IfStatement']= task1handleIf;
task1functions['VariableDeclaration']= task1handleVaribledec;
task1functions['SequenceExpression']= task1handleSeqEXP;
task1functions['AssignmentExpression']= task1handleVarassign;

let indexforedges=0;
const makedges=()=>{
    let element,newname='';
    for(indexforedges=0;indexforedges<task1model.length;indexforedges++){
        element=task1model[indexforedges];
        if(incondforedge(element)){
            handleforedges();
        }
        else{
            if(element['Type']!='else statement'){
                newname=findnewname(element['nodename'],indexforedges);
                if(newname!=null) edges.push(edgespush(element['nodename'],newname));
            }
        }
    }
};
const findnewname=(name,i)=>{
    for( indexforedges=indexforedges+1;indexforedges<task1model.length;indexforedges++){
        if(task1model[indexforedges]['nodename']!=name){
            if(task1model[indexforedges]['task1scope']!= task1model[i]['task1scope']){
                indexforedges--;
                return null;
            }
            else {
                let ret=task1model[indexforedges]['nodename'];
                indexforedges--;
                return ret;
            }
        }
    }
};
const handleforedges=()=>{
    edges.push(edgespush(task1model[indexforedges]['nodename']+'(yes)',task1model[indexforedges+1]['nodename']));
    let afterifname=findafterif(task1model[indexforedges]['task1scope']),lastinif=findlastinscope(task1model[indexforedges+1]['task1scope']);
    if(task1model[indexforedges]['Type'].indexOf('if')!=-1){
        if(task1model[indexforedges]['Type'].indexOf('no')!=-1)edges.push(edgespush(task1model[indexforedges]['nodename']+'(no)',afterifname));
        else {
            let firstinelse=findmyelse(task1model[indexforedges]['task1scope']),firstelseindex=getindexofmymyelse(task1model[indexforedges]['task1scope']);
            edges.push(edgespush(task1model[indexforedges]['nodename']+'(no)',firstinelse));
            let lastinelse=findlastinelse(task1model[firstelseindex+1]['task1scope'],firstelseindex);
            edges.push(edgespush(lastinelse,afterifname));
        }
        edges.push(edgespush(lastinif,afterifname));
    }
    else{
        edges.push(edgespush(lastinif,task1model[indexforedges]['nodename']));
        edges.push(edgespush(task1model[indexforedges]['nodename']+'(no)',afterifname));
    }
};
const findlastinelse=(scope,beginindex)=>{
    let funcindex=beginindex+1;
    let ret=task1model[funcindex]['nodename'];
    for (let i=funcindex;i<task1model.length;i++){
        if(task1model[funcindex]['nodename']!=task1model[i]['nodename']&&task1model[i]['task1scope']>=scope) ret= task1model[i]['nodename'];
        if(task1model[i]['task1scope']<scope) break;
    }
    return ret;
};
const findmyelse=(scope)=>{
    for (let i=indexforedges;i<task1model.length;i++){
        if(task1model[i]['Type']==='else statement'&&task1model[i]['task1scope']===scope) return task1model[i]['nodename'];
    }
};
const getindexofmymyelse=(scope)=>{
    for (let i=indexforedges;i<task1model.length;i++){
        if(task1model[i]['Type']==='else statement'&&task1model[i]['task1scope']===scope) return i;
    }
};
const findlastinscope=(scope)=>{
    let ret=task1model[indexforedges+1]['nodename'];
    for (let i=indexforedges+1;i<task1model.length;i++){
        if(task1model[indexforedges+1]['nodename']!=task1model[i]['nodename']&&task1model[i]['task1scope']===scope) ret= task1model[i]['nodename'];
        if(task1model[i]['task1scope']<scope) break;
    }
    return ret;
};
const findafterif=(scope)=>{
    for (let i=indexforedges+1;i<task1model.length;i++){
        if(task1model[i]['Type']!='else statement'&&task1model[i]['task1scope']<=scope) return task1model[i]['nodename'];
    }
};
const incondforedge=(element)=>{
    let type=element['Type'];
    return (type.indexOf('if')!=-1 ||type==='while statement');
};
const edgespush = (src,dest) =>{
    let topush={};
    topush['src']=src;
    topush['dest']=dest;
    return topush;
};
const makemakestring4g=()=>{
    let ret='',con,t;
    mapnodes.forEach(function(element){
        con=element['content'];
        if(element['type']==='ops') t='operation';
        else t='condition';
        if(element['isgreen']) ret=ret+element['name']+'=>'+t+': '+con+'|paintgreen'+'\n';
        else ret=ret+element['name']+'=>'+t+': '+con+'\n';
    });
    edges.forEach(function(element){
        ret=ret+element['src']+'->'+element['dest']+'\n';
    });
    return ret;
};
const getnode=(getnodewithname)=>{
    let newname,i=0;
    if(getnodewithname.indexOf('(')!=-1) newname=getnodewithname.substring(0,getnodewithname.indexOf('('));
    else newname=getnodewithname;
    for ( i =0;i<mapnodes.length;i++){
        if (mapnodes[i]['name']===newname){
            console.log(mapnodes[i]);
            console.log('yyyya');
            return mapnodes[i];
        }
    }
};
const colorthenodes=()=>{
    mapnodes[0]['isgreen']=true;
    let src,dest;
    edges.forEach(function(element){
        src=getnode(element['src']);
        dest=getnode(element['dest']);
        if(src['type']==='ops'){
            if(src['isgreen']) dest['isgreen']=true;
        }
        else{
            let yespath=(element['src'].indexOf('no')===-1);
            if(yespath===src['evalval']) dest['isgreen']=true;
        }
    });
};
