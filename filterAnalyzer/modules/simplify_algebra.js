import Expression from '../js/expression/Expression.js';
import '../js/expression/complex.js';
import ExpressionParser from '../js/expression/ExpressionParser.js';
import Polynomial from '../js/expression/Polynomial.js';
import '../js/expression/polynomial-roots-finding.js';
import '../js/expression/toMathML.js';

export default function simplify_algebra_x(expr) {
    var z = expr.replace(/([a-zA-RT-Z]+)([0-9]*)/g,"$1_$2");   //Swap R0 for R_0 so this new library can consume it //not S
    // console.log("i'm here!", expr,  z);
    var matrix = ExpressionParser.parse(z);  
    var t = matrix.toString();
    var t2 = t.replace(/([a-zA-RT-Z]+)_([0-9]*)/g,"$1$2");   //Swap R_0 for R0 so this new library can consume it //not S

    // console.log(matrix.toMathML())
    // var zz = t.replace(/([a-zA-Z]+)_([0-9]*)/g,"$1$2")
    // var matrix = ExpressionParser.parse('-1/(ab(-1/(ab)-1/(ac)-1/(bc)))-1/(ac(-1/(ab)-1/(ac)-1/(bc)))');  
    return [t2, matrix.toMathML()];
}