import Expression from './Expression.js';
import primeFactor from './primeFactor.js';
import {BigDecimal, BigFloat} from './node_modules/@yaffle/bigdecimal/BigDecimal.js';

const BASE = 2;
//const BASE = 10;

function MakeMath(BigDecimal, BASE) {
  function BigDecimalMath() {
  }
  BigDecimalMath.nextAfter = function (a, rounding) {
    if (rounding == undefined) {
      throw new RangeError();
    }
    if (rounding.roundingMode !== 'floor' && rounding.roundingMode !== 'ceil') {
      throw new RangeError();
    }
    var t = BigDecimal.round(a, rounding);
    if (!BigDecimal.equal(a, t)) {
      return t;
    }
    var _nextAfter = function (a, k, v, rounding) {
      var small = BigDecimal.multiply(BigDecimal.BigDecimal(rounding.roundingMode === 'floor' ? -1 : 1), exponentiateBase(-k));
      var aim = BigDecimal.multiply(BigDecimal.abs(v), small);
      return BigDecimal.add(a, aim, rounding);
    };
    if (rounding.maximumFractionDigits != undefined) {
      return _nextAfter(a, rounding.maximumFractionDigits, BigDecimal.BigDecimal(1), rounding);
    }
    if (rounding.maximumSignificantDigits != undefined) {
      // a * (1 + 1 / 2**maximumSignificantDigits)
      return _nextAfter(a, rounding.maximumSignificantDigits, a, rounding);
    }
    throw new RangeError();
  };
  //TODO: remove
  //BigDecimalMath.fma = function (a, b, c, rounding) { // a * b + c
  //  return BigDecimal.round(BigDecimal.add(BigDecimal.multiply(a, b), c), rounding);
  //};
  var exponentiateBase = function (n) {
    var BIG_DECIMAL_BASE = BigDecimal.round(BigDecimal.BigDecimal(BASE), {maximumSignificantDigits: 1, roundingMode: 'half-even'});
    var a = BIG_DECIMAL_BASE;
    if (n < 0) {
      return BigDecimal.divide(BigDecimal.BigDecimal(1), exponentiateBase(-n), null);
    }
    var y = BigDecimal.BigDecimal(1);
    while (n >= 1) {
      if (0 === n % 2) {
        a = BigDecimal.multiply(a, a);
        n = n / 2;
      } else {
        y = y == undefined ? a : BigDecimal.multiply(a, y);
        n = n - 1;
      }
    }
    return y;
  };
  return BigDecimalMath;
}

const BigDecimalMath = MakeMath(BigDecimal, 10);
const BigFloatMath = MakeMath(BigFloat, 2);

//BigDecimalMath.nthRoot(BigDecimal.BigDecimal(2), 2, 3);






// https://en.wikipedia.org/wiki/Interval_arithmetic
function Interval(a, b) {
  if (BigFloat.greaterThan(a, b)) {
    throw new TypeError();
  }
  this.a = a;
  this.b = b;
}
Interval._rounding = function (baseRounding, roundingMode) {
  if (baseRounding == null) {
    return null;
  }
  return baseRounding.maximumFractionDigits != undefined
          ? {maximumFractionDigits: baseRounding.maximumFractionDigits, roundingMode: roundingMode}
          : {maximumSignificantDigits: baseRounding.maximumSignificantDigits, roundingMode: roundingMode};
};
Interval.unaryMinus = function (x) {
  return new Interval(BigFloat.unaryMinus(x.b), BigFloat.unaryMinus(x.a));
};
Interval.add = function (x, y, rounding = null) {
  return new Interval(BigFloat.add(x.a, y.a, Interval._rounding(rounding, 'floor')), BigFloat.add(x.b, y.b, Interval._rounding(rounding, 'ceil')));
};
Interval.subtract = function (x, y, rounding = null) {
  return new Interval(BigFloat.subtract(x.a, y.b, Interval._rounding(rounding, 'floor')), BigFloat.subtract(x.b, y.a, Interval._rounding(rounding, 'ceil')));
};
Interval._multiply = function (x1, x2, y1, y2, f) {
  const sign = BigFloat.sign;
  const sx1 = sign(x1);
  const sx2 = sign(x2);
  const sy1 = sign(y1);
  const sy2 = sign(y2);
  if (sx1 >= 0) {
    if (sy1 >= 0) {
      return f(x1, y1, x2, y2);
    }
    if (sy2 <= 0) {
      return f(x2, y1, x1, y2);
    }
    // y1 < 0 && y2 > 0
    return f(x2, y1, x2, y2);
  }
  if (sx2 <= 0) {
    if (sy2 <= 0) {
      return f(x2, y2, x1, y1);
    }
    if (sy1 >= 0) {
      return f(x1, y2, x2, y1);
    }
    // y1 < 0 && y2 > 0
    return f(x1, y2, x1, y1);
  }
  if (sy1 >= 0) {// x1 < 0 && x2 > 0
    return f(x1, y2, x2, y2);
  }
  if (sy2 <= 0) {// x1 < 0 && x2 > 0
    return f(x2, y1, x1, y1);
  }
  // x1 < 0 && x2 > 0 && y1 < 0 && y2 > 0
  var interval1 = f(x1, y2, x1, y1);
  var interval2 = f(x2, y1, x2, y2);
  return new Interval(BigFloat.min(interval1.a, interval2.a),
                      BigFloat.max(interval1.b, interval2.b));
};
Interval.multiply = function (x, y, rounding = null) {
  var floorRounding = Interval._rounding(rounding, 'floor');
  var ceilRounding = Interval._rounding(rounding, 'ceil');
  if (BigFloat.equal(x.a, x.b) && BigFloat.equal(y.a, y.b)) {
    var product = BigFloat.multiply(x.a, y.a);
    return new Interval(BigFloat.round(product, floorRounding), BigFloat.round(product, ceilRounding));
  }
  var f = function (a, b, c, d) {
    return new Interval(BigFloat.multiply(a, b, floorRounding), BigFloat.multiply(c, d, ceilRounding));
  };
  return Interval._multiply(x.a, x.b, y.a, y.b, f);
};
Interval.divide = function (x, y, rounding) {
  var floorRounding = Interval._rounding(rounding, 'floor');
  var ceilRounding = Interval._rounding(rounding, 'ceil');
  if (BigFloat.sign(y.a) <= 0 && BigFloat.sign(y.b) >= 0) {
    if (BigFloat.equal(y.a, y.b)) {
      throw new RangeError();
    }
    return "CANNOT_DIVIDE";//TODO: FIX
  }
  if (BigFloat.equal(x.a, x.b) && BigFloat.equal(y.a, y.b)) {
    //TODO: is it faster in all cases - ?
    var q = BigFloat.divide(x.a, y.a, floorRounding);
    var r = BigFloat.subtract(x.a, BigFloat.multiply(y.a, q));
    return new Interval(q, !BigFloat.equal(r, BigFloat.BigFloat(0)) ? BigFloatMath.nextAfter(q, ceilRounding) : q);
  }
  var f = function (a, d, c, b) {
    //Note: b and d are swapped
    return new Interval(BigFloat.divide(a, b, floorRounding), BigFloat.divide(c, d, ceilRounding));
  };
  return Interval._multiply(x.a, x.b, y.a, y.b, f);
};
Interval.sqrt = function (x, rounding) {
  if (BigFloat.sign(x.a) < 0 && BigFloat.sign(x.b) >= 0) {
    return "CANNOT_DIVIDE";//TODO: FIX
  }
  if (BigFloat.equal(x.a, x.b)) {
    var ya = BigFloat.sqrt(x.a, Interval._rounding(rounding, 'floor'));
    var yb = BigFloat.equal(BigFloat.multiply(ya, ya), x.b) ? ya : BigFloatMath.nextAfter(ya, Interval._rounding(rounding, 'ceil'));
    return new Interval(ya, yb);
  }
  return Interval._map(x, function (x, rounding) {
    return BigFloat.sqrt(x, rounding);
  }, rounding);
};
Interval.exp = function (x, rounding) {
  return Interval._map(x, BigFloat.exp, rounding);
};
Interval.log = function (x, rounding) {
  if (BigFloat.sign(x.a) <= 0 && BigFloat.sign(x.b) > 0) {
    return "CANNOT_DIVIDE";//TODO: FIX
  }
  if (BigFloat.equal(x.a, x.b) && BigFloat.equal(x.b, BigFloat.BigFloat(1))) {
    return new Interval(BigFloat.BigFloat(0), BigFloat.BigFloat(0));
  }
  return Interval._map(x, BigFloat.log, rounding);
};
Interval.atan = function (x, rounding) {
  return Interval._map(x, BigFloat.atan, rounding);
};
Interval._mapValue = function (value, callback, rounding) {
  var c = callback(value, Interval._rounding(rounding, 'floor')); // TODO: ?
  //var a = BigFloatMath.nextAfter(c, Interval._rounding(rounding, 'floor'));
  var a = c;
  var b = c;
  if (!BigFloat.equal(value, BigFloat.BigFloat(0))) {
    b = BigFloatMath.nextAfter(c, Interval._rounding(rounding, 'ceil'));
  }
  return new Interval(a, b);
};
Interval._map = function (x, callback, rounding) {
  if (BigFloat.equal(x.a, x.b)) {
    return Interval._mapValue(x.a, callback, rounding);
  }
  var a = callback(x.a, Interval._rounding(rounding, 'floor'));
  var b = callback(x.b, Interval._rounding(rounding, 'ceil'));
  return new Interval(a, b);
};
Interval._trigonometry = function (x, which, rounding) {
  if (BigFloat.equal(x.a, x.b)) {
    return Interval._mapValue(x.a, which === 'sin' ? BigFloat.sin : BigFloat.cos, rounding);
  }
  var anyRounding = Object.assign({}, Interval._rounding(rounding, 'floor'), {roundingMode: 'half-even'});
  var tau = BigFloat.multiply(BigFloat.BigFloat(8), BigFloat.atan(BigFloat.BigFloat(1), anyRounding));
  if (!BigFloat.lessThan(BigFloat.subtract(x.b, x.a), tau)) {
    return new Interval(BigFloat.BigFloat(-1), BigFloat.BigFloat(+1));
  }
  var f = function (x, rounding) {
    return which === 'sin' ? BigFloat.sin(x, rounding) : BigFloat.cos(x, rounding);
  };
  var middle = BigFloat.divide(BigFloat.add(x.a, x.b), BigFloat.BigFloat(2), anyRounding); // with rounding it works better in case the interval has huge significant digits difference
  var extremumPoint = function (q) {
    var shift = BigFloat.multiply(BigFloat.divide(BigFloat.BigFloat(q), BigFloat.BigFloat(4), anyRounding), tau);
    var k = BigFloat.round(BigFloat.divide(BigFloat.subtract(middle, shift, anyRounding), tau, anyRounding), {
      maximumFractionDigits: 0,
      roundingMode: 'half-even'
    });
    return BigFloat.add(BigFloat.multiply(tau, k), shift);
  };
  var minimumPoint = extremumPoint(which === 'sin' ? 3 : 2);
  var maximumPoint = extremumPoint(which === 'sin' ? 1 : 0);
  const floorRounding = Interval._rounding(rounding, 'floor');
  const ceilRounding = Interval._rounding(rounding, 'ceil');
  var fmin = BigFloat.lessThan(minimumPoint, x.a) ? f(x.a, floorRounding) : (BigFloat.greaterThan(minimumPoint, x.b) ? f(x.b, floorRounding) : BigFloat.BigFloat(-1));
  var fmax = BigFloat.lessThan(maximumPoint, x.a) ? f(x.a, ceilRounding) : (BigFloat.greaterThan(maximumPoint, x.b) ? f(x.b, ceilRounding) : BigFloat.BigFloat(+1));
  /**/
  return new Interval(fmin, fmax);
};
Interval.sin = function (x, rounding) {
  return Interval._trigonometry(x, 'sin', rounding);
};
Interval.cos = function (x, rounding) {
  return Interval._trigonometry(x, 'cos', rounding);
};
/*Interval.fromInteger = function (a) {
  if (BASE !== 2) {
    var abs = function (a) {
      return a < 0 ? BigInteger.unaryMinus(a) : a;
    };
    var k = a != 0 ? bitLength(abs(a)) - Math.ceil(Math.log2(10) * Interval._rounding(rounding, 'floor').maximumSignificantDigits) : 0;
    if (k > 42) {
      //TODO: move to BigFloat.round - ?
      // for performance
      var p2k = BigInteger.exponentiate(BigInteger.BigInt(2), BigInteger.BigInt(k));
      var q = BigInteger.divide(a, p2k);
      var from = a < 0 ? BigInteger.subtract(q, BigInteger.BigInt(1)) : q;
      var to = a < 0 ? q : BigInteger.add(q, BigInteger.BigInt(1));
      return Interval.multiply(Interval.fromIntegers(from, to), Interval.exponentiate(Interval.fromIntegers(2, 2), k));
    }
  }
  //var x = BigFloat.BigFloat(a);
  //if (BigInteger.equal(BigInteger.BigInt(BigFloat.toBigInt(x)), a)) { // TODO: ?
  //  return new Interval(x, x);
  //}
  a = BigFloat.BigFloat(a);
  return new Interval(a, a);
  //return Interval.fromIntegers(a, a);
};*/
Interval.fromIntegers = function (a, b) {
  var a1 = BigFloat.BigFloat(a);
  var b1 = BigFloat.BigFloat(b);
  //TODO: test case (!!!)
  console.assert(!BigFloat.lessThan(b1, a1));
  return new Interval(a1, b1);
};
Interval.abs = function (x) {
  if (BigFloat.lessThan(x.a, BigFloat.BigFloat(0))) {
    if (BigFloat.lessThan(x.b, BigFloat.BigFloat(0))) {
      return new Interval(BigFloat.unaryMinus(x.b), BigFloat.unaryMinus(x.a));
    } else {
      return new Interval(BigFloat.BigFloat(0), BigFloat.max(BigFloat.unaryMinus(x.a), x.b));
    }
  }
  return x;
};
Interval.exponentiate = function (x, n, contextRounding) {
  var y = undefined;
  while (n >= 1) {
    if (n === 2 * Math.floor(n / 2)) {
      x = Interval.multiply(x, x, contextRounding);
      n = Math.floor(n / 2);
    } else {
      y = y == undefined ? x : Interval.multiply(x, y, contextRounding);
      n -= 1;
    }
  }
  return y;
};

//?

      // todo: for exact notation (?):
      // 10000 -> 10**4
      // 15000 -> 15*10**3
      // 0.00015 -> 15*10**(-5)



Interval.formatToDecimal = function (x, rounding) {
  // assume, that the value is not exact
  var signA = BigFloat.sign(x.a);
  var signB = BigFloat.sign(x.b);
  var sign = (signA || signB) === (signB || signA) ? (signA || signB) : 0;
  x = Interval.abs(x);
  var stringify = function (a, roundingMode) {
    if (rounding.fractionDigits != undefined) {
      return a.toFixed(rounding.fractionDigits, roundingMode);
    }
    return a.toPrecision(rounding.significantDigits, roundingMode);
  };
  var a = stringify(x.a, "half-up");
  var b = BigFloat.equal(x.a, x.b) ? a : stringify(x.b, "half-down");
  var isZero = function (a) {
    return !/[^0\.]/.test(a);
  };
  if (a === b && (sign !== 0 || isZero(a) && isZero(b))) {
    return (sign < 0 ? '-' : (sign > 0 && isZero(a) && isZero(b) ? '+' : '')) + a;
  }
  return undefined;
};
Interval.prototype.toString = function () {
  return "[" + this.a.toString() + ";" + this.b.toString() + "]";
};

var calcAt = function (polynomial, x, contextRounding) {
  var result = evaluateExpression(Expression.ZERO, contextRounding);
  for (var i = polynomial.getDegree(); i >= 0; i--) {
    result = Interval.multiply(result, x, contextRounding);
    var tmp = evaluateExpression(polynomial.getCoefficient(i), contextRounding);
    if (tmp === "CANNOT_DIVIDE" || tmp == undefined) {
      return tmp;
    }
    result = Interval.add(result, tmp, contextRounding);
  }
  return result;
};


var evaluateExpression = function (e, contextRounding) {
  if (e instanceof Expression.Integer) {
    var n = e.value;
    return Interval.fromIntegers(n, n);
  } else if (e instanceof Expression.NthRoot) {
    var a = e.a;
    var n = e.n;
    var y = evaluateExpression(a, contextRounding);
    if (y === "CANNOT_DIVIDE" || y == undefined) {
      return y;
    }
    if (n == 2) {
      return Interval.sqrt(y, contextRounding);
    }
    return Interval.exp(Interval.divide(Interval.log(y, contextRounding), Interval.fromIntegers(n, n), contextRounding), contextRounding);
  } else if (e instanceof Expression.BinaryOperation) {
    // slow for some cases:
    if (e instanceof Expression.Addition && Expression.has(e, Expression.PolynomialRootSymbol)) {
      var root = Expression.getVariable(e);//?
      var p = Polynomial.toPolynomial(e, root);
      if (p.hasIntegerCoefficients()) {// trying to avoid slow cases (?)
        //TODO: https://en.wikipedia.org/wiki/Horner%27s_method - ?
        var zero = evaluateExpression(root, contextRounding);
        //return evaluateExpression(p.calcAt(), contextRounding);
        return calcAt(p, zero, contextRounding);
      }
    }
    if (e.a === Expression.E && e.getS() === "^") {
      var b = evaluateExpression(e.b, contextRounding);
      if (b === "CANNOT_DIVIDE" || b == undefined) {
        return b;
      }
      return Interval.exp(b, contextRounding);
    }

    var a = evaluateExpression(e.a, contextRounding);
    if (a === "CANNOT_DIVIDE" || a == undefined) {
      return a;
    }
    var b = evaluateExpression(e.b, contextRounding);
    if (b === "CANNOT_DIVIDE" || b == undefined) {
      return b;
    }
    var operator = e.getS();
    if (operator === "+") {
      return Interval.add(a, b, contextRounding);
    } else if (operator === "-") {
      return Interval.subtract(a, b, contextRounding);
    } else if (operator === "*") {
      return Interval.multiply(a, b, contextRounding);
    } else if (operator === "/") {
      return Interval.divide(a, b, contextRounding);
    } else if (operator === "^") { // Expression.PolynomialRootSymbol^3, pi^2, 2**(sqrt(3)), (log(2))^2
      //TODO: to polynomial
      if (!(e.b instanceof Expression.Integer) || e.b.toNumber() <= 0 || e.b.toNumber() > Number.MAX_SAFE_INTEGER) {
        //throw new TypeError();
        var log = Interval.log(a, contextRounding);
        if (log === "CANNOT_DIVIDE") {
          return log;
        }
        return Interval.exp(Interval.multiply(log, b, contextRounding), contextRounding);
      }
      var n = e.b.toNumber();//TODO: FIX!
      return Interval.exponentiate(a, n, contextRounding);
    }
  } else if (e instanceof Expression.PolynomialRootSymbol || e instanceof Expression.ExpressionPolynomialRoot) {
    var i = (e instanceof Expression.ExpressionPolynomialRoot ? e.root : e).toDecimal(contextRounding.maximumSignificantDigits || contextRounding.maximumFractionDigits);
    // "lcm" is too slow to compute (?)
    /*if (true) {
      var a = BigFloat.divide(BigFloat.BigFloat(i.a.getNumerator().value), BigFloat.BigFloat(i.a.getDenominator().value), context.floorRounding);
      var b = BigFloat.divide(BigFloat.BigFloat(i.b.getNumerator().value), BigFloat.BigFloat(i.b.getDenominator().value), context.ceilRounding);
      return new Interval(a, b);
    }*/
    const d = i.a.getDenominator().multiply(i.b.getDenominator()).value;
    return Interval.divide(Interval.fromIntegers(i.b.getDenominator().multiply(i.a.getNumerator()).value,
                                                 i.a.getDenominator().multiply(i.b.getNumerator()).value),
                          Interval.fromIntegers(d, d),
                          contextRounding);
  } else if (e === Expression.E) {
    return Interval.exp(Interval.fromIntegers(1, 1), contextRounding);
  } else if (e === Expression.PI) {
    return Interval.multiply(Interval.fromIntegers(4, 4), Interval.atan(Interval.fromIntegers(1, 1), contextRounding));
  } else if (e instanceof Expression.Function) {
    var x = evaluateExpression((e instanceof Expression.Sin || e instanceof Expression.Cos) && e.a instanceof Expression.Radians ? e.a.value : e.a, contextRounding);
    if (x === "CANNOT_DIVIDE" || x == undefined) {
      return x;
    }
    if (e instanceof Expression.Sin) {
      return Interval.sin(x, contextRounding);
    }
    if (e instanceof Expression.Cos) {
      return Interval.cos(x, contextRounding);
    }
    if (e instanceof Expression.Logarithm) {
      return Interval.log(x, contextRounding);
    }
    if (e instanceof Expression.Arctan) {
      return Interval.atan(x, contextRounding);
    }
  } else if (e instanceof Expression.ExpressionWithPolynomialRoot) {
    return evaluateExpression(e.e, contextRounding);
  }

  return undefined;
};

var decimalToString = function (decimal) {
  return decimal.replace(/[eE]/g, '*10^');
};

var complexToString = function (real, imaginary) {
  return real + (/^[\-\+]/.test(imaginary) ? imaginary.replace(/^([\-\+])[\s\S]+/g, '$1') : (real !== '' ? '+' : '')) + (imaginary !== '1' && imaginary !== '-1' ? imaginary.replace(/^[\-\+]/g, '') + '*' + 'i' : 'i');
};

  //? ((n * 10**(fractionDigits + 1)) ~/ d + 5) ~/ 10

var toDecimalStringInternal = function (expression, rounding, decimalToStringCallback, complexToStringCallback) {
  decimalToStringCallback = decimalToStringCallback || decimalToString;
  complexToStringCallback = complexToStringCallback || complexToString;
  if (rounding.fractionDigits == undefined && rounding.significantDigits == undefined ||
      rounding.fractionDigits != undefined && rounding.significantDigits != undefined) {//?
    throw new RangeError();
  }
  if (rounding.fractionDigits != undefined && (rounding.fractionDigits < 0 || rounding.fractionDigits > Number.MAX_SAFE_INTEGER) ||
      rounding.significantDigits != undefined && (rounding.significantDigits < 1 || rounding.significantDigits > Number.MAX_SAFE_INTEGER) ||
      rounding.roundingMode != undefined) {
    throw new RangeError();
  }

  if (expression instanceof Expression.Complex || Expression.has(expression, Expression.Complex)) {//?TODO: ?
    var numerator = expression.getNumerator();//.unwrap();
    var denominator = expression.getDenominator();//.unwrap();
    if (denominator instanceof Expression.Integer ||
        Expression.has(denominator, Expression.PolynomialRootSymbol) ||
        Expression.has(denominator, Expression.ExpressionPolynomialRoot) ||
        Expression._isPositive(denominator)) { // e^2
      if (numerator instanceof Expression.Addition || numerator instanceof Expression.Multiplication || numerator instanceof Expression.Complex) {
        const tmp = Expression.getComplexNumberParts(numerator);
        let realValue = tmp.real;
        let imaginaryValue = tmp.imaginary;
        if (!imaginaryValue.equals(Expression.ZERO)) {
          realValue = realValue.divide(denominator);
          imaginaryValue = imaginaryValue.divide(denominator);
          var real = realValue.equals(Expression.ZERO) ? '' : toDecimalStringInternal(realValue, rounding, decimalToStringCallback, complexToStringCallback);
          var imaginary = toDecimalStringInternal(imaginaryValue, rounding, decimalToStringCallback, complexToStringCallback);
          return complexToStringCallback(real, imaginary);
        }
      }
    }
  }
   
  if (expression instanceof Expression.Integer || expression instanceof Expression.Division && expression.a instanceof Expression.Integer && expression.b instanceof Expression.Integer) {
    //TODO: ?
    if (true) {//TODO: ?
      return decimalToStringCallback(primeFactor._rationalNumberToDecimalString(expression.getNumerator().toBigInt(), expression.getDenominator().toBigInt(), rounding));
    }
  }
  //TODO: remove - ?
  /*TODO: enable
  if (expression instanceof Expression.NthRoot) {
    var a = expression.a;//.unwrap();
    if (a instanceof Expression.Integer) {
      var A = a.value;
      var n = expression.n;
      var scale = BigInteger.exponentiate(BigInteger.BigInt(10), BigInteger.BigInt(fractionDigits));
      var sA = BigInteger.multiply(A, BigInteger.exponentiate(scale, BigInteger.BigInt(n)));

      var x0 = nthRoot(sA, n);
      var x1 = BigInteger.lessThan(BigInteger.exponentiate(x0, BigInteger.BigInt(n)), sA) ? BigInteger.add(x0, BigInteger.BigInt(1)) : x0;

      // root - x0 < x1 - root
      // 2root < x0 + x1
      // 2**n * A < (x0 + x1)**n
      var nearest = BigInteger.lessThan(BigInteger.multiply(BigInteger.exponentiate(BigInteger.BigInt(2), BigInteger.BigInt(n)), sA), BigInteger.exponentiate(BigInteger.add(x0, x1), BigInteger.BigInt(n))) ? x0 : x1;
      //return toDecimalStringInternal(new Expression.Division(new Expression.Integer(nearest), new Expression.Integer(scale)), fractionDigits, decimalToStringCallback, complexToStringCallback);
      var context = new Interval.Context(fractionDigits + 1);
      var a = BigFloat.divide(BigFloat.BigFloat(nearest), BigFloat.BigFloat(scale));
      var result = Interval.formatToDecimal(new Interval(a, BigFloatMath.nextAfter(a, {maximumFractionDigits: fractionDigits + 1, roundingMode: 'ceil'})), fractionDigits);
      return decimalToStringCallback(result);
    }
  }
  */
  //---
  console.assert(BASE % 2 === 0);
  var result = undefined;
  var guessedPrecision = 1; //TODO: ?
  //!new
  //TODO: !!!
  //if (expression instanceof Expression.Multiplication && expression.a instanceof Expression.Integer && rounding.fractionDigits != undefined) {
    //guessedPrecision = 2 * bitLength(expression.a.toBigInt());
    //guessedPrecision  = 128;
  //}
  //!
  var flag0 = Expression.has(expression, Expression.Function) || Expression.has(expression, Expression.Exponentiation);
  while (result == undefined) {
    if (guessedPrecision > 60000 && guessedPrecision > (rounding.fractionDigits || rounding.significantDigits) * 4 * Math.log2(10)) {
      debugger;
      throw new TypeError();
    }
    //if (guessedPrecision > 1024) throw new Error();
    const contextRounding = flag0 ? {maximumSignificantDigits: guessedPrecision} : {maximumFractionDigits: guessedPrecision - 1};
    var x = evaluateExpression(expression, contextRounding);
    if (x == undefined) {
      return undefined;
    }
    if (x !== "CANNOT_DIVIDE") { // continue the loop otherwise
      result = Interval.formatToDecimal(x, rounding);
    }
    if (guessedPrecision > 1  && result == undefined) {
      //console.count('guessedPrecision > 1  && result == undefined');
    }
    if (x !== "CANNOT_DIVIDE" && result == undefined && rounding.fractionDigits != undefined && guessedPrecision === 1) {//TODO: ?
      var log10OfValue = BigFloat.max(BigFloat.abs(x.a), BigFloat.abs(x.b)).toFixed(0).length;
      guessedPrecision = Math.ceil(Math.max(log10OfValue * Math.log2(10), 2) / 2 + Math.log2(10) * rounding.fractionDigits / 2 * 2);
    }
    if (x !== "CANNOT_DIVIDE" && result == undefined && rounding.significantDigits != undefined && guessedPrecision === 1) {//TODO: ?
      if (BigFloat.sign(x.a) === BigFloat.sign(x.b)) { // zero is not part of the interval, so we know the minimal value
        var tmp = BigFloat.log(BigFloat.min(BigFloat.abs(x.a), BigFloat.abs(x.b)), {maximumSignificantDigits: 1, roundingMode: 'half-even'}).toFixed(0).length;
        guessedPrecision = Math.max(Math.ceil(tmp * Math.log2(10) / 2), 1);
      }
    }
    guessedPrecision *= 2;
  }
  if (guessedPrecision !== 256) {
    //console.log(guessedPrecision);
  }
  return decimalToStringCallback(result);
};

export default toDecimalStringInternal;

toDecimalStringInternal.testables = {
  BigDecimalMath: BigDecimalMath,
  BigDecimal: BigDecimal,
  BigFloat: BigFloat,
  Interval: Interval
};
