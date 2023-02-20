import Expression from './Expression.js';
import NonSimplifiedExpression from './Expression.js';

//! deprecated, convert MathML to LaTeX instead

Expression.prototype.toLaTeX = function (options) {
  throw new RangeError();
};

Expression.Integer.prototype.toLaTeX = function (options) {
  return this.value.toString();
};
Expression.Function.prototype.toLaTeX = function (options) {
  return "\\" + this.name + "\\left(" + this.a.toLaTeX(options) + "\\right)";
};
Expression.SquareRoot.prototype.toLaTeX = function (options) {
  return "\\sqrt{" + this.a.toLaTeX(options) + "}";
};
Expression.NthRoot.prototype.toLaTeX = function (options) {
  return "\\sqrt[" + this.n + "]{" + this.a.toLaTeX(options) + "}";
};
Expression.BinaryOperation.prototype.toLaTeX = function (options) {
  var a = this.a.unwrap();
  var b = this.b.unwrap();
  var fa = a.getPrecedence() + (a.isRightToLeftAssociative() ? -1 : 0) < this.getPrecedence();
  var fb = this.getPrecedence() + (this.isRightToLeftAssociative() ? -1 : 0) >= b.getPrecedence();
  fa = fa || a.isUnaryPlusMinus();
  fb = fb || b.isUnaryPlusMinus(); // 1*-3 -> 1*(-3)
  fa = fa || (this instanceof Expression.Exponentiation && a instanceof Expression.Function); // cos(x)^(2+3)
  return (fa ? "\\left(" : "") + a.toLaTeX(options) + (fa ? "\\right)" : "") +
         this.getS() +
         (fb ? "\\left(" : "") + b.toLaTeX(options) + (fb ? "\\right)" : "");
};
Expression.Negation.prototype.toLaTeX = function (options) {
  var b = this.b;
  var fb = this.getPrecedence() + (this.isRightToLeftAssociative() ? -1 : 0) >= b.getPrecedence();
  fb = fb || b.isUnaryPlusMinus();
  // assert(fa === false);
  return "-" + (fb ? "\\left(" : "") + b.toLaTeX(options) + (fb ? "\\right)" : "");
};
Expression.Division.prototype.toLaTeX = function (options) {
  return "\\frac{" + this.a.toLaTeX(options) + "}{" + this.b.toLaTeX(options) + "}";
};
Expression.Symbol.prototype.toLaTeX = function (options) {
  var i = this.symbol.indexOf('_');
  var symbol = i === -1 ? this.symbol : this.symbol.slice(0, i);
  var index = i === -1 ? '' : this.symbol.slice(i + 1);
  if (symbol === '\u2147') {
    symbol = 'e';
  } else if (symbol === '\u2148') {
    symbol = 'i';
  }
  if (symbol.length === 1 && symbol.charCodeAt(0) >= 0x03B1 && symbol.charCodeAt(0) <= 0x03B1 + 24) {
    var greek = " alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho varsigma sigma tau upsilon phi chi psi omega ";
    symbol = greek.split(' ')[symbol.charCodeAt(0) - 0x03B1 + 1];
    symbol = '\\' + symbol;
  }
  return symbol + (index !== '' ? '_' : '') + (index.length > 1 ? '{' + index.replace(/\(|\)/g, '') + '}' : index);
};
Expression.Matrix.prototype.toLaTeX = function (options) {
  var isDeterminant = this instanceof Expression.Determinant;
  var x = isDeterminant ? this.a.unwrap().matrix : this.matrix;
  var s = "";
  s += "\\begin{" + (isDeterminant ? 'vmatrix' : 'pmatrix') + "}\n";
  for (var i = 0; i < x.rows(); i += 1) {
    for (var j = 0; j < x.cols(); j += 1) {
      var e = x.e(i, j);
      s += e.toLaTeX(options) + (j + 1 < x.cols() ? " & " : (i + 1 < x.rows() ? " \\\\" : "") + "\n");
    }
  }
  s += "\\end{" + (isDeterminant ? 'vmatrix' : 'pmatrix') + "}";
  return s;
};
Expression.Determinant.prototype.toLaTeX = function (options) {
  if (this.a.unwrap() instanceof Expression.Matrix) {
    return Expression.Matrix.prototype.toLaTeX.call(this, options);
  }
  return Expression.Function.prototype.toLaTeX.call(this, options);
};
Expression.Complex.prototype.toLaTeX = function (options) {
  return this.toString(options);
};
NonSimplifiedExpression.prototype.toLaTeX = function (options) {
  return this.e.toLaTeX(options);
};
