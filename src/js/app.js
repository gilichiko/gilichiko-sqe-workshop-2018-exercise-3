import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {overrun} from './code-analyzer';
import * as flowchart from 'flowchart.js';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let data=$('#gili').val();
        let string4g=overrun(parsedCode,data);
        $('#image').empty();
        flowchart.parse(string4g).drawSVG('image',{ 'flowstate': { 'paintgreen': { 'fill': '#21fb10' } }, 'yes-text': 'T', 'no-text': 'F' });
    });
});

