import assert from 'assert';
import {overrun, parseCode} from '../src/js/code-analyzer';
let newtestout='op0=>operation: a=1+1\n' +
    'b=1+1+2\n' +
    'c=0\n' +
    '|paintgreen\n' +
    'cond0=>condition: (1+1+2<3)|paintgreen\n' +
    'op1=>operation: 0+5 = 0+5+5\n' +
    '\n' +
    'cond1=>condition: (1+1+2<3*2)|paintgreen\n' +
    'op2=>operation: 0+1+5 = 0+1+5+1+5\n' +
    '|paintgreen\n' +
    'op3=>operation: 0+3+5 = 0+3+5+3+5\n' +
    '\n' +
    'op4=>operation: return 0\n' +
    '|paintgreen\n' +
    'op0->cond0\n' +
    'cond0(yes)->op1\n' +
    'cond0(no)->cond1\n' +
    'op3->op4\n' +
    'op1->op4\n' +
    'cond1(yes)->op2\n' +
    'cond1(no)->op3\n' +
    'op3->op4\n' +
    'op2->op4\n';
let newtestinput='function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '\n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '    }\n' +
    '\n' +
    '    return c;\n' +
    '}\n';
let simplefoo2='function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '\n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '    } \n' +
    '\n' +
    '    return c;\n' +
    '}';
let simplefoo2out='op0=>operation: a=1+1\n' +
    'b=1+1+2\n' +
    'c=0\n' +
    '|paintgreen\n' +
    'cond0=>condition: (1+1+2<3)|paintgreen\n' +
    'op1=>operation: 0+5 = 0+5+5\n' +
    '\n' +
    'op2=>operation: return 0\n' +
    '|paintgreen\n' +
    'op0->cond0\n' +
    'cond0(yes)->op1\n' +
    'cond0(no)->op2\n' +
    'op1->op2\n';

let test5in='function foo(){\n' +
    '   let a =  1;\n' +
    '   let b =  8;\n' +
    '   let c = 0;\n' +
    '   \n' +
    '   while (a < 78) {\n' +
    '       c = a + b;\n' +
    '       b = c * 2;\n' +
    '       a++;\n' +
    '   }\n' +
    '   \n' +
    '   return a;\n' +
    '}\n';
let test5out='op0=>operation: a=1\n' +
    'b=8\n' +
    'c=0\n' +
    '\n' +
    'cond0=>condition: (1<78)\n' +
    'op1=>operation: 1+8 = 1+8\n' +
    '\n' +
    'op2=>operation: 1+8*2 = 1+8*2\n' +
    'return 1\n' +
    '\n' +
    'op0->cond0\n' +
    'cond0(yes)->op1\n' +
    'op2->cond0\n' +
    'cond0(no)->op2\n' +
    'op1->op2\n';

let test6in='function foo(){\n' +
    '   let a =  11;\n' +
    '   let b =  8;\n' +
    '   let c = 0;\n' +
    '   \n' +
    '   while (a < 78) {\n' +
    '       c = a + b;\n' +
    '       b = c * 2;\n' +
    '       a++;\n' +
    '   }\n' +
    '   \n' +
    '   return a;\n' +
    '}\n';
let test6out='op0=>operation: a=11\n' +
    'b=8\n' +
    'c=0\n' +
    '\n' +
    'cond0=>condition: (11<78)\n' +
    'op1=>operation: 11+8 = 11+8\n' +
    '\n' +
    'op2=>operation: 11+8*2 = 11+8*2\n' +
    'return 11\n' +
    '\n' +
    'op0->cond0\n' +
    'cond0(yes)->op1\n' +
    'op2->cond0\n' +
    'cond0(no)->op2\n' +
    'op1->op2\n';

let test7in='function foo(x){\n' +
    '   let a =  x;\n' +
    '   let b =  x+8;\n' +
    '   let c = 0;\n' +
    '   \n' +
    '   while (a < 78) {\n' +
    '       c = a + b;\n' +
    '       b = c * 2;\n' +
    '       a++;\n' +
    '   }\n' +
    '   \n' +
    '   return a;\n' +
    '}\n';
let test7out='op0=>operation: a=1\n' +
    'b=1+8\n' +
    'c=0\n' +
    '\n' +
    'cond0=>condition: (1<78)\n' +
    'op1=>operation: 1+1+8 = 1+1+8\n' +
    '\n' +
    'op2=>operation: 1+1+8*2 = 1+1+8*2\n' +
    'return 1\n' +
    '\n' +
    'op0->cond0\n' +
    'cond0(yes)->op1\n' +
    'op2->cond0\n' +
    'cond0(no)->op2\n' +
    'op1->op2\n';

let test8in='function foo(x, y, z){\n' +
    '   let a = x;\n' +
    '   let b = x + y;\n' +
    '   let c = z;\n' +
    '   \n' +
    '   while (a < z) {\n' +
    '       c = a + b;\n' +
    '       z = c * 2;\n' +
    '       a++;\n' +
    '   }\n' +
    '   \n' +
    '   return z;\n' +
    '}\n';

let test8out='op0=>operation: a=1\n' +
    'b=1+2\n' +
    'c=3\n' +
    '\n' +
    'cond0=>condition: (1<3)\n' +
    'op1=>operation: 1+1+2 = 1+1+2\n' +
    '\n' +
    'op2=>operation: 1+1+2*2 = 1+1+2*2\n' +
    'return 3\n' +
    '\n' +
    'op0->cond0\n' +
    'cond0(yes)->op1\n' +
    'op2->cond0\n' +
    'cond0(no)->op2\n' +
    'op1->op2\n';
let test10in='function foo(x, y, z){\n' +
    '    let a = x + 4;\n' +
    '    let b = a + 7;\n' +
    '    let c = 9;\n' +
    '\n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '    }\n' +
    '\n' +
    '    return c;\n' +
    '}\n';
let test9in='function foo(x, y, z){\n' +
    '   let a = x + 1;\n' +
    '   let b = a + y;\n' +
    '   let c = 0;\n' +
    '   \n' +
    '   while (a < z) {\n' +
    '       c = a + b;\n' +
    '       z = c * 2;\n' +
    '       a++;\n' +
    '   }\n' +
    '   \n' +
    '   return z;\n' +
    '}\n';
let test9out='op0=>operation: a=1+1\n' +
    'b=1+1+2\n' +
    'c=0\n' +
    '\n' +
    'cond0=>condition: (1+1<3)\n' +
    'op1=>operation: 1+1+1+1+2 = 1+1+1+1+2\n' +
    '\n' +
    'op2=>operation: 1+1+1+1+2*2 = 1+1+1+1+2*2\n' +
    'return 3\n' +
    '\n' +
    'op0->cond0\n' +
    'cond0(yes)->op1\n' +
    'op2->cond0\n' +
    'cond0(no)->op2\n' +
    'op1->op2\n';
let test3in='function foo(){\n' +
    '    let a = 2;\n' +
    '    let b = 4;\n' +
    '    let c = 0;\n' +
    '\n' +
    '    if (b < 8) {\n' +
    '        c = c + 5;\n' +
    '    } \n' +
    '\n' +
    '    return 6;\n' +
    '}\n';
let test3out='op0=>operation: a=2\n' +
    'b=4\n' +
    'c=0\n' +
    '|paintgreen\n' +
    'cond0=>condition: (4<8)|paintgreen\n' +
    'op1=>operation: 0+5 = 0+5+5\n' +
    '|paintgreen\n' +
    'op2=>operation: return 6\n' +
    '|paintgreen\n' +
    'op0->cond0\n' +
    'cond0(yes)->op1\n' +
    'cond0(no)->op2\n' +
    'op1->op2\n';
let test4in='function foo(){\n' +
    '    let a = 2;\n' +
    '    let b = 4;\n' +
    '    let c = 0;\n' +
    '\n' +
    '    if (b < 17) {\n' +
    '        c = c + 5;\n' +
    '    } \n' +
    '\n' +
    '    return 6;\n' +
    '}\n';
let test4out='op0=>operation: a=2\n' +
    'b=4\n' +
    'c=0\n' +
    '|paintgreen\n' +
    'cond0=>condition: (4<17)|paintgreen\n' +
    'op1=>operation: 0+5 = 0+5+5\n' +
    '|paintgreen\n' +
    'op2=>operation: return 6\n' +
    '|paintgreen\n' +
    'op0->cond0\n' +
    'cond0(yes)->op1\n' +
    'cond0(no)->op2\n' +
    'op1->op2\n';

let test10out='op0=>operation: a=1+4\n' +
    'b=1+4+7\n' +
    'c=9\n' +
    '|paintgreen\n' +
    'cond0=>condition: (1+4+7<3)|paintgreen\n' +
    'op1=>operation: 9+5 = 9+5+5\n' +
    '\n' +
    'cond1=>condition: (1+4+7<3*2)|paintgreen\n' +
    'op2=>operation: 9+1+5 = 9+1+5+1+5\n' +
    '\n' +
    'op3=>operation: 9+3+5 = 9+3+5+3+5\n' +
    '|paintgreen\n' +
    'op4=>operation: return 9\n' +
    '|paintgreen\n' +
    'op0->cond0\n' +
    'cond0(yes)->op1\n' +
    'cond0(no)->cond1\n' +
    'op3->op4\n' +
    'op1->op4\n' +
    'cond1(yes)->op2\n' +
    'cond1(no)->op3\n' +
    'op3->op4\n' +
    'op2->op4\n';

describe('The javascript parser', () => {
    it('is parsing a another complex func statement correctly', () => {newtest();});
    it('is parsing a another complex func statement correctly', () => {test10();});
    it('is parsing a another simple func statement correctly', () => {test2();});
    it('is parsing a another simple func statement with no args correctly', () => {test3();});
    it('is parsing a another simple func statement with no args correctly', () => {test4();});
    it('is parsing a another while func statement with args correctly', () => {test9();});
    it('is parsing a another while func statement with no args correctly', () => {test5();});
    it('is parsing a another while func statement with no args correctly', () => {test6();});
    it('is parsing a another while func statement with one arg correctly', () => {test7();});
    it('is parsing a another while func statement with no args correctly', () => {test8();});
});
const test3 = ()=>{
    assert.equal(overrun(parseCode(test3in),''), test3out);
};
const test4 = ()=>{
    assert.equal(overrun(parseCode(test4in),''), test4out);
};
const test5 = ()=>{
    assert.equal(overrun(parseCode(test5in),''), test5out);
};
const test6 = ()=>{
    assert.equal(overrun(parseCode(test6in),''), test6out);
};
const test7 = ()=>{
    assert.equal(overrun(parseCode(test7in),'x=1;'), test7out);
};
const test8 = ()=>{
    assert.equal(overrun(parseCode(test8in),'x=1;y=2;z=3;'), test8out);
};
const test9 = ()=>{
    assert.equal(overrun(parseCode(test9in),'x=1;y=2;z=3;'), test9out);
};
const test10 = ()=>{
    assert.equal(overrun(parseCode(test10in),'x=1;y=2;z=3;'), test10out);
};
const newtest = ()=>{
    assert.equal(overrun(parseCode(newtestinput),'x=1;y=2;z=3;'), newtestout);
};
const test2 = ()=>{
    assert.equal(overrun(parseCode(simplefoo2),'x=1;y=2;z=3;'), simplefoo2out);
};


