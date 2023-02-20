  import Expression from './Expression.js';
  import ExpressionParser from './ExpressionParser.js';
  import './sin.js';
  import './GF2.js';

  var idCounter = 0;

  function NonSimplifiedExpression(e, position, length, input) {
    //Expression.call(this);
    this.e = e;
    this.position = position == undefined ? -1 : position;
    this.length = length == undefined ? -1 : length;
    this.input = input == undefined ? "" : input;
    this.id = (idCounter += 1);
  }

  NonSimplifiedExpression.prototype = Object.create(Expression.prototype);

  // same set of public properties (and same order) as for Expressions ...
  NonSimplifiedExpression.prototype.negate = function () {
    return new NonSimplifiedExpression(new Expression.Negation(this));
  };
  NonSimplifiedExpression.prototype.add = function (y) {
    return new NonSimplifiedExpression(new Expression.Addition(this, y));
  };
  NonSimplifiedExpression.prototype.subtract = function (y) {
    return new NonSimplifiedExpression(new Expression.Subtraction(this, y));
  };
  NonSimplifiedExpression.prototype.divide = function (y) {
    return new NonSimplifiedExpression(new Expression.Division(this, y));
  };
  NonSimplifiedExpression.prototype.multiply = function (y) {
    return new NonSimplifiedExpression(new Expression.Multiplication(this, y));
  };
  NonSimplifiedExpression.prototype.pow = function (y) {
    return new NonSimplifiedExpression(new Expression.Exponentiation(this, y));
  };

  NonSimplifiedExpression.prototype.exp = function () {
    return new NonSimplifiedExpression(Expression.E).pow(this);
  };
  NonSimplifiedExpression.prototype.logarithm = function () {
    return new NonSimplifiedExpression(new Expression.Logarithm(this));
  };
  NonSimplifiedExpression.prototype.inverse = function () {
    return new NonSimplifiedExpression(new Expression.Exponentiation(this, Expression.ONE.negate())); // to support the MathML serialization of the `inverse(B)`
    //return new NonSimplifiedExpression(Expression.ONE).divide(this);
  };

  NonSimplifiedExpression.prototype.factorial = function () {
    return new NonSimplifiedExpression(new Expression.Factorial(this));
  };

/*
  NonSimplifiedExpression.prototype.powExpression = function (x) {
    return new NonSimplifiedExpression(new Expression.Exponentiation(x, this));
  };
  NonSimplifiedExpression.prototype.multiplyAddition = function (x) {
    return new NonSimplifiedExpression(new Expression.Multiplication(x, this));
  };
  NonSimplifiedExpression.prototype.multiplyDivision = function (x) {
    return new NonSimplifiedExpression(new Expression.Multiplication(x, this));
  };
  NonSimplifiedExpression.prototype.multiplyMatrix = function (x) {
    return new NonSimplifiedExpression(new Expression.Multiplication(x, this));
  };
  NonSimplifiedExpression.prototype.addDivision = function (x) {
    return new NonSimplifiedExpression(new Expression.Addition(x, this));
  };

  //?
  NonSimplifiedExpression.prototype.addMatrix = function (x) {
    return new NonSimplifiedExpression(new Expression.Addition(x, this));
  };

  NonSimplifiedExpression.prototype.addExpression = function (x) {
    return new NonSimplifiedExpression(new Expression.Addition(x, this));
  };
  NonSimplifiedExpression.prototype.multiplyExpression = function (x) {
    return new NonSimplifiedExpression(new Expression.Multiplication(x, this));
  };
  NonSimplifiedExpression.prototype.divideExpression = function (x) {
    return new NonSimplifiedExpression(new Expression.Division(x, this));
  };
*/

  NonSimplifiedExpression.prototype.addExpression = function (x) {
    throw new TypeError();
  };

  NonSimplifiedExpression.prototype.squareRoot = function () {
    return new NonSimplifiedExpression(new Expression.SquareRoot(this));
  };
  NonSimplifiedExpression.prototype._nthRoot = function (n) {
    return new NonSimplifiedExpression(new Expression.NthRoot(n + "-root", this, n));
  };
  NonSimplifiedExpression.prototype.abs = function () {
    return new NonSimplifiedExpression(new Expression.Function("abs", this));
  };
  NonSimplifiedExpression.prototype.cos = function () {
    return new NonSimplifiedExpression(new Expression.Function("cos", this));
  };
  NonSimplifiedExpression.prototype.sin = function () {
    return new NonSimplifiedExpression(new Expression.Function("sin", this));
  };
  NonSimplifiedExpression.prototype.tan = function () {
    return new NonSimplifiedExpression(new Expression.Function("tan", this));
  };
  NonSimplifiedExpression.prototype.cot = function () {
    return new NonSimplifiedExpression(new Expression.Function("cot", this));
  };
  NonSimplifiedExpression.prototype.cosh = function () {
    return new NonSimplifiedExpression(new Expression.Function("cosh", this));
  };
  NonSimplifiedExpression.prototype.sinh = function () {
    return new NonSimplifiedExpression(new Expression.Function("sinh", this));
  };
  NonSimplifiedExpression.prototype.tanh = function () {
    return new NonSimplifiedExpression(new Expression.Function("tanh", this));
  };
  NonSimplifiedExpression.prototype.coth = function () {
    return new NonSimplifiedExpression(new Expression.Function("coth", this));
  };
  NonSimplifiedExpression.prototype.arccos = function () {
    return new NonSimplifiedExpression(new Expression.Function("arccos", this));
  };
  NonSimplifiedExpression.prototype.arcsin = function () {
    return new NonSimplifiedExpression(new Expression.Function("arcsin", this));
  };
  NonSimplifiedExpression.prototype.arctan = function () {
    return new NonSimplifiedExpression(new Expression.Function("arctan", this));
  };
  NonSimplifiedExpression.prototype.arccot = function () {
    return new NonSimplifiedExpression(new Expression.Function("arccot", this));
  };
  NonSimplifiedExpression.prototype.arcosh = function () {
    return new NonSimplifiedExpression(new Expression.Function("arcosh", this));
  };
  NonSimplifiedExpression.prototype.arsinh = function () {
    return new NonSimplifiedExpression(new Expression.Function("arsinh", this));
  };
  NonSimplifiedExpression.prototype.artanh = function () {
    return new NonSimplifiedExpression(new Expression.Function("artanh", this));
  };
  NonSimplifiedExpression.prototype.arcoth = function () {
    return new NonSimplifiedExpression(new Expression.Function("arcoth", this));
  };
  NonSimplifiedExpression.prototype.rank = function () {
    return new NonSimplifiedExpression(new Expression.Rank(this));
  };
  NonSimplifiedExpression.prototype.determinant = function () {
    return new NonSimplifiedExpression(new Expression.Determinant(this));
  };
  
  Expression.Pseudoinverse.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).pseudoinverse();
  };
  NonSimplifiedExpression.prototype.pseudoinverse = function () {
    return new NonSimplifiedExpression(new Expression.Pseudoinverse(this));
  };

  NonSimplifiedExpression.prototype.rowReduce = function () {
    return new NonSimplifiedExpression(new Expression.RowReduce(this));
  };
  //?
  NonSimplifiedExpression.prototype.GF2 = function () {
    return new NonSimplifiedExpression(new Expression.GF2(this));
  };
  NonSimplifiedExpression.prototype.transpose = function () {
    return new NonSimplifiedExpression(new Expression.Transpose(this));
  };
  NonSimplifiedExpression.prototype.complexConjugate = function () {
    return new NonSimplifiedExpression(new Expression.ComplexConjugate(this));
  };
  NonSimplifiedExpression.prototype.adjugate = function () {
    return new NonSimplifiedExpression(new Expression.Adjugate(this));
  };

  NonSimplifiedExpression.prototype.elementWisePower = function (a) {
    return new NonSimplifiedExpression(new Expression.ElementWisePower(this, a));
  };
  NonSimplifiedExpression.prototype.transformNoAnswerExpression = function (name, second) {
    return new NonSimplifiedExpression(new Expression.NoAnswerExpression(this, name, second));
  };
  NonSimplifiedExpression.prototype.transformEquality = function (b) {
    return new NonSimplifiedExpression(new Expression.Equality(this, b));
  };
  NonSimplifiedExpression.prototype.transformInequality = function (b, sign) {
    return new NonSimplifiedExpression(new Expression.Inequality(this, b, sign));
  };
  NonSimplifiedExpression.prototype.transformComma = function (b) {
    return new NonSimplifiedExpression(new Expression.Comma(this, b));
  };

  NonSimplifiedExpression.prototype.addPosition = function (position, length, input) {
    return new NonSimplifiedExpression(this.e, position, length, input);
  };

  var prepare = function (x, holder) {
    var e = x.simplify();
    ExpressionParser.startPosition = holder.position;
    ExpressionParser.endPosition = holder.position + holder.length;
    ExpressionParser.input = holder.input;
    return e;
  };

  //TODO:
  Expression.prototype.simplifyInternal = function (holder) {
    return this;
  };
  Expression.Exponentiation.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).pow(prepare(this.b, holder));
  };
  Expression.Multiplication.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).multiply(prepare(this.b, holder));
  };
  Expression.Addition.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).add(prepare(this.b, holder));
  };
  Expression.Division.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).divide(prepare(this.b, holder));
  };
  Expression.SquareRoot.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).squareRoot();
  };
  Expression.NthRoot.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder)._nthRoot(this.n);
  };
  Expression.Function.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder)[this.name]();
  };
  Expression.Logarithm.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).logarithm();
  };
  Expression.Rank.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).rank();
  };
  Expression.Determinant.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).determinant();
  };
  Expression.RowReduce.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).rowReduce();
  };
  Expression.GF2.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).GF2();
  };
  Expression.Transpose.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).transpose();
  };
  Expression.ComplexConjugate.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).complexConjugate();
  };
  Expression.Adjugate.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).adjugate();
  };
  Expression.NoAnswerExpression.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).transformNoAnswerExpression(this.name, this.second == undefined ? undefined : prepare(this.second, holder));
  };
  Expression.Equality.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).transformEquality(prepare(this.b, holder));
  };
  Expression.Inequality.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).transformInequality(prepare(this.b, holder), this.sign);
  };
  Expression.Matrix.prototype.simplifyInternal = function (holder) {
    return new Expression.Matrix(this.matrix.map(function (e, i, j) {
      return prepare(e, holder);
    }));
  };

  Expression.Radians.prototype.simplifyInternal = function (holder) {
    return new Expression.Radians(prepare(this.value, holder));
  };

  Expression.Comma.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).transformComma(prepare(this.b, holder));
  };

  Expression.prototype.simplify = function () {
    return this;//? this.simplifyInternal(undefined);
  };
  NonSimplifiedExpression.prototype.simplify = function () {
    //return this.e.simplifyInternal(this);
    //return this.e.simplifyInternal(this).simplifyExpression();//new

    // to get an expression after a double "wrapping"
    return this.e.simplify().simplifyInternal(this).simplifyExpression();//new
  };
  NonSimplifiedExpression.prototype.toString = function (options) {
    return this.e.toString(options);
  };
  NonSimplifiedExpression.prototype.equals = function (y) {
    return this.simplify().equals(y.simplify());
  };

  //!
  NonSimplifiedExpression.prototype.unwrap = function () {
    return this.e;
  };
  Expression.Negation.prototype.simplifyInternal = function (holder) {
    return prepare(this.b, holder).negate();
  };
  Expression.Subtraction.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).subtract(prepare(this.b, holder));
  };
  NonSimplifiedExpression.prototype.isUnaryPlusMinus = function () {
    return this.e.isUnaryPlusMinus();
  };
  NonSimplifiedExpression.prototype.getPrecedence = function () {
    return this.e.getPrecedence();
  };

  Expression.ElementWisePower.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).elementWisePower(prepare(this.b, holder));
  };
  Expression.Factorial.prototype.simplifyInternal = function (holder) {
    return prepare(this.n, holder).factorial();
  };

//?
  NonSimplifiedExpression.prototype.getId = function () {
    return "e" + this.id.toString();
  };
  Expression.prototype.getIds = function () {
    return "";
  };
  Expression.BinaryOperation.prototype.getIds = function () {
    var a = this.a.getIds();
    var b = this.b.getIds();
    return a === "" ? b : (b === "" ? a : a + ", " + b);
  };
  NonSimplifiedExpression.prototype.getIds = function () {
    var a = this.getId();
    var b = this.e.getIds();
    return a === "" ? b : (b === "" ? a : a + ", " + b);
  };

  NonSimplifiedExpression.prototype.isNegative = function () {
    //return this.e.isNegative();
    return false;
  };
  NonSimplifiedExpression.prototype.negateCarefully = function () {
    return new NonSimplifiedExpression(this.e.negateCarefully());
  };
  NonSimplifiedExpression.prototype.isRightToLeftAssociative = function () {
    return this.e.isRightToLeftAssociative();
  };

  NonSimplifiedExpression.prototype.isExact = function () {
    return this.e.isExact();
  };

  Expression.DecimalFraction = function (integer, transient, repetend, exponent) {
    this.integer = integer;
    this.transient = transient;
    this.repetend = repetend;
    this.exponent = exponent;
  };
  Expression.DecimalFraction.prototype = Object.create(Expression.prototype);
  Expression.DecimalFraction.prototype.getPrecedence = function () {
    //TODO: comma may affect precedence - ?
    return 1000;//TODO: ?
  };
  Expression.DecimalFraction.prototype.simplifyInternal = function () {
    return ExpressionParser._getDecimalFraction(this.integer, this.transient, this.repetend, this.exponent);
  };
  Expression.DecimalFraction.prototype.toString = function () {
    return (this.integer || '0') + '.' + (this.transient || '') + (this.repetend != undefined ? '(' + this.repetend + ')' : '') + (this.exponent != undefined ? 'E' + this.exponent : '');
  };

  NonSimplifiedExpression.prototype.augment = function (other) {
    return new NonSimplifiedExpression(new Expression.AugmentedMatrix(this, other));
  };
  Expression.AugmentedMatrix.prototype.simplifyInternal = function (holder) {
    return prepare(this.a, holder).augment(prepare(this.b, holder));
  };

  Expression.NonSimplifiedExpression = NonSimplifiedExpression;

  export default NonSimplifiedExpression;
