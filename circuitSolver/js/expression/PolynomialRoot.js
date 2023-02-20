import primeFactor from './primeFactor.js';

import Expression from './Expression.js'; //TODO: ?
import Polynomial from './Polynomial.js';//TODO: !?

// API:

// a class for real algebraic numbers
// Operations are implemented as described at https://en.wikipedia.org/wiki/Resultant#Number_theory

// "AbstractPolynomialRoot":
//  #toDecimal(precision)
//  #scale(k), k is an "algebraic expression constant"
//  #translate(k), k is an "algebraic expression constant"
//  #multiply(otherPolynomialRoot)
//  #add(otherPolynomialRoot)
//  #negate()
//  #inverse()
//  #sign()
//  #_pow(n), n is an integer
//  #_nthRoot(n), n is an integer
//  #equals(otherPolynomialRoot)

// PolynomialRoot implements AbstractPolynomialRoot - a basic class to represent real algebraic number exactly
//   .polynomial
//   .interval
// LazyPolynomialRoot implements AbstractPolynomialRoot - a class to represent real algebraic number as a rational expression (see https://en.wikipedia.org/wiki/Algebraic_expression )
//   .e
//   ._root

//TODO: remove references to Expression.ExpressionPolynomialRoot (?)

//Note: SimpleFloat is used only internally
function SimpleFloat(significand, exponent) {
  this.significand = significand;
  this.exponent = exponent;
}

SimpleFloat.create = function (e) {
  if (!isRational(e) || !isPowerOf2(e.getDenominator())) {
    throw new TypeError();
  }
  return new SimpleFloat(e.getNumerator(), 0 - (e.getDenominator().bitLength() - 1));
};
SimpleFloat.prototype.toExpression = function () {
  return this.significand.multiply(this.exponent >= 0 ? Expression.TWO._pow(this.exponent) : Expression.TWO._pow(-this.exponent).inverse());
};

SimpleFloat.prototype.multiply = function (other) {
  return new SimpleFloat(this.significand.multiply(other.significand), this.exponent + other.exponent);
};
SimpleFloat.prototype.add = function (other) {
  const min = Math.min(this.exponent, other.exponent);
  return new SimpleFloat(this.significand.leftShift(this.exponent - min).add(other.significand.leftShift(other.exponent - min)), min);
};
SimpleFloat.prototype.negate = function () {
  return new SimpleFloat(this.significand.negate(), this.exponent);
};
SimpleFloat.prototype.sign = function () {
  return this.significand.sign();
};

  var isRational = function (e) {
    return e.getNumerator() instanceof Expression.Integer && e.getDenominator() instanceof Expression.Integer;
  };
  var isPowerOf2 = function (i) {
    return Expression.TWO._pow(i.bitLength() - 1).equals(i);
  };

//Note: SimpleInterval is used only internally
function SimpleInterval(a, b) {
  if (!(a instanceof SimpleFloat) || !(b instanceof SimpleFloat) || a.add(b.negate()).sign() > 0) {
    throw new TypeError();
  }
  this.a = a;
  this.b = b;
}
SimpleInterval.from = function (interval) {
  return new SimpleInterval(SimpleFloat.create(interval.a), SimpleFloat.create(interval.b));
};
SimpleInterval.prototype.toExpressionsInterval = function () {
  return {a: this.a.toExpression(), b: this.b.toExpression()};
};
SimpleInterval.prototype.negate = function () {
  return new SimpleInterval(this.b.negate(), this.a.negate());
};
SimpleInterval.prototype.add = function (other) {
  return new SimpleInterval(this.a.add(other.a), this.b.add(other.b));
};
SimpleInterval.prototype.multiply = function (other) {
  var sign = function (e) {
    return e.sign();
  };
  const f = function (a, b, c, d) {
    return new SimpleInterval(a.multiply(b), c.multiply(d));
  };
  const x1 = this.a;
  const x2 = this.b;
  const y1 = other.a;
  const y2 = other.b;
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
  //TODO: add a test
  const a = x1.multiply(y1);
  const b = x2.multiply(y1);
  const c = x1.multiply(y2);
  const d = x2.multiply(y2);
  var min = function (a, b) {
    return a.subtract(b).sign() < 0 ? a : b;
  };
  var max = function (a, b) {
    return a.subtract(b).sign() < 0 ? b : a;
  };
  const from = min(min(a, b), min(c, d));
  const to = max(max(a, b), max(c, d));
  return new SimpleInterval(from, to);
};
SimpleInterval.prototype.scale = function (s) {
  return this.multiply(SimpleInterval.from({a: s, b: s}));//TODO: ?
};
SimpleInterval.prototype.inverse = function (precision) {
  var sign = function (e) {
    return e.sign();
  };
  if (sign(this.a) < 0 && sign(this.b) > 0) {
    throw new TypeError();
  }
  if (precision == undefined) {
    debugger;
    throw new TypeError();
  }
  var that = this.toExpressionsInterval();//!TODO: REMOVE
  var s = Expression.TWO._pow(precision + Math.max(that.b.getNumerator().abs().bitLength(), that.a.getNumerator().abs().bitLength()));
  var div = function (a, b, roundingMode) {
    if (roundingMode === 'floor') {
      if (b.sign() < 0) {
        a = a.negate();
        b = b.negate();
      }
      return a.sign() >= 0 ? a.truncatingDivide(b) : a.add(Expression.ONE).truncatingDivide(b).subtract(Expression.ONE);
    }
    if (roundingMode === 'ceil') {
      return div(a.negate(), b, 'floor').negate();
    }
    throw new TypeError();
  };
  var f = function (s, x, roundingMode) {
    return div(s, x.getNumerator(), roundingMode).divide(s).multiply(x.getDenominator());
  };
  return SimpleInterval.from({a: f(s, that.b, 'floor'), b: f(s, that.a, 'ceil')});
};
SimpleInterval.prototype._pow = function (n) {
  if (n % 2 === 0) {
    if (n === 0) {
      return SimpleInterval.from({a: Expression.ONE, b: Expression.ONE});
    }
    return this.multiply(this)._pow(n / 2);
  }
  return new SimpleInterval(this.a._pow(n), this.b._pow(n));
};
SimpleInterval.prototype.toString = function () {
  return '[' + this.a.toString() + ';' + this.b.toString() + ']';
};

const intersection = function (a, b) {
  var cmp = function (x1, x2) {
    return x1.subtract(x2).getNumerator().sign();
  };
  var max = function (x1, x2) {
    return cmp(x1, x2) < 0 ? x2 : x1;
  };
  var min = function (x1, x2) {
    return cmp(x1, x2) < 0 ? x1 : x2;
  };
  // https://scicomp.stackexchange.com/a/26260
  if (cmp(b.a, a.b) > 0 || cmp(a.a, b.b) > 0) {
    return null;
  }
  return {
    a: max(a.a, b.a),
    b: min(a.b, b.b)
  };
};

// TODO:
const toSimpleInterval = function (e, precision) { // precision - precision of the computation (?)
  if (e instanceof Expression.Integer) {
    return SimpleInterval.from({a: e, b: e});
  } else if (e instanceof Expression.BinaryOperation) {
    var a = toSimpleInterval(e.a, precision);
    var b = toSimpleInterval(e.b, precision);
    var s = e.getS();
    if (s === "+") {
      return a.add(b);
    } else if (s === "-") {
      return a.add(b.negate());
    } else if (s === "*") {
      return a.multiply(b);
    } else if (s === "/") {//- why was it commented out - ?
      return a.multiply(b.inverse(precision));
    } else if (s === "^") {
      if (e.b instanceof Expression.Integer) {
        var n = e.b.toBigInt();
        return a._pow(n);
      }
    } else {
      debugger;
    }
  } else if (e instanceof Expression.NthRoot) {
    const n = e.n;
    console.assert(n >= 2 && n % 1 === 0);
    if (e.a instanceof Expression.Integer && e.a.sign() > 0) {
      var a = e.a;
      var scale = Expression.TWO._pow(precision);
      var numerator = a.multiply(scale._pow(n))._integerNthRoot(n);
      //TODO: FIX
      return SimpleInterval.from({a: numerator.divide(scale), b: numerator.add(Expression.ONE).divide(scale)});
    }
    var a = toSimpleInterval(e.a, precision);
    if (n % 2 === 0) {
      //TODO: !?!?!
      var i = 2;
      while (a.a.sign() < 0 && a.b.sign() > 0) {
        a = toSimpleInterval(e.a, precision * i);
        i *= 2;
      }
    }
    var f = function (x, n, rounding) {
      var scale = Expression.TWO._pow(precision);
      var e = rounding === 'floor' ? (x.getNumerator().sign() >= 0 ? Expression.ZERO : Expression.ONE.negate()) : (x.getNumerator().sign() < 0 ? Expression.ZERO : Expression.ONE);
      return x.getNumerator().multiply(x.getDenominator()._pow(n - 1)).multiply(scale._pow(n))._integerNthRoot(n).add(e).divide(scale.multiply(x.getDenominator()));
    };
    a = a.toExpressionsInterval();//TODO: !?
    return SimpleInterval.from({a: f(a.a, n, 'floor'), b: f(a.b, n, 'ceil')});
  } else {
  }
  if (e instanceof PolynomialRoot) {
    return SimpleInterval.from(e.toDecimal(precision));
  }
  //TODO: REMOVE(?)
  if (e instanceof Expression.PolynomialRootSymbol) {
    return SimpleInterval.from(e.toDecimal(precision));
  }
  if (e instanceof Expression.ExpressionPolynomialRoot) {
    return SimpleInterval.from(e.root.toDecimal(precision));
  }
  debugger;
  throw new TypeError("?");
};

function Helper(polynomial) {
  this.squareFreeFactors = [];
  var tmp = null;
  const ONE = Polynomial.of(Expression.ONE);
  do {
    tmp = polynomial.squareFreeFactors();
    if (!tmp.a1.equals(ONE)) {//TODO: ?
      this.squareFreeFactors.push(tmp.a1);
    }
    if (tmp.a0.getDegree() !== 0) {
      polynomial = tmp.a0;
    } else {
      polynomial = null;
    }
  } while (polynomial != null);
}
Helper.prototype.calcAt = function (point) {
  var result = Expression.ONE;
  for (var factor of this.squareFreeFactors) {
    result = result.multiply(factor.calcAt(point));
  }
  return result;
};
Helper.prototype.numberOfRoots = function (interval) {
  var result = 0;
  var newFactors = [];
  for (var factor of this.squareFreeFactors) {
    var n = factor.numberOfRoots(interval.toExpressionsInterval());
    result += n;
    if (n > 0) {
      newFactors.push(factor);
    }
  }
  this.squareFreeFactors = newFactors;
  return result;
};
Helper.get = function (that, interval) {
  //TODO: do not call twice
  //for (var factor of that.squareFreeFactors) {
  //  if (factor.numberOfRoots(interval) > 0) {
  //    return factor;
  //  }
  //}
  //return null;
  return that.squareFreeFactors.length === 1 ? that.squareFreeFactors[0] : null;
};

  var calculateNewInterval = function (newPolynomial, zeroFunction) {
    if (!newPolynomial.hasIntegerCoefficients()) {
      throw new RangeError("just a check");
    }
    newPolynomial = new Helper(newPolynomial);//!?!?TODO: REMOVE
    var precision = 1;
    var guess = zeroFunction(precision);
    while ((guess.a.sign() !== guess.b.sign() && !newPolynomial.calcAt(Expression.ZERO).equals(Expression.ZERO)) || newPolynomial.numberOfRoots(guess) > 1) {
      precision *= 2;
      guess = zeroFunction(precision);
      if (precision > 1024) throw new Error();//TODO: ?
    }
    var newInterval = guess;
    newPolynomial = Helper.get(newPolynomial, guess);
    return new PolynomialRoot(newPolynomial, newInterval.toExpressionsInterval());
  };


function PolynomialRoot(polynomial, interval, options = {}) {
  if (!polynomial.hasIntegerCoefficients()) {
    throw new TypeError();
  }
  if (polynomial.getLeadingCoefficient().sign() < 0) {
    return new PolynomialRoot(polynomial.negate(), interval);
  }
  var content = polynomial.getContent();
  if (!content.equals(Expression.ONE)) {
    return new PolynomialRoot(polynomial.scale(content.inverse()), interval);
  }
if (!options.skipFactorization) {//!
  var factor = polynomial.factorize();
  //TODO: pass the zero to help the factorization to return the correct factor:
  // var factor = polynomial.factorize({zero: new PolynomialRoot(polynomial, interval)});
  if (factor != null && !factor.equals(polynomial)) {
    if (factor.numberOfRoots(interval) !== 0) {
      return new PolynomialRoot(factor, interval);
    } else {
      var otherFactor = polynomial.divideAndRemainder(factor, "throw").quotient;
      return new PolynomialRoot(otherFactor, interval);
    }
  }
}
  if (interval instanceof SimpleInterval) {
    throw new TypeError();
  }
  if (interval.a.subtract(interval.b).getNumerator().sign() > 0) {
    throw new TypeError();
  }
  // how to represent zero - ?
  //if ((interval.a.getNumerator().sign() || interval.b.getNumerator().sign()) !== (interval.b.getNumerator().sign() || interval.a.getNumerator().sign())) {
  //  throw new TypeError();
  //}
if (!options.skipFactorization) {//!
  if (polynomial.numberOfRoots(interval) !== 1) {
    throw new TypeError();
  }
}
  if (!polynomial.getContent().equals(Expression.ONE)) {
    throw new TypeError();
  }
  //TODO: factorization
  this.polynomial = polynomial;
  //TODO: https://www.wolframalpha.com/input/?i=x**5%2B7x**3%2Bx**2%2Bx%2B1%3D0
  this.interval = interval;
}

PolynomialRoot.prototype.toDecimal = function (precision) {
  return this.polynomial.getZero(this.interval, precision);
};

PolynomialRoot.prototype.toString = function () {
  // for debugging (?)
  return "[root of " + this.polynomial + " near " + this.interval.a.add(this.interval.b).divide(Expression.TWO).toString() + "]";
};

//TODO: remove (?)
PolynomialRoot.prototype.scale = function (k) {
  //console.assert(k instanceof Expression.Integer || isRational(k));
  // z = k * x, x = z / k
  var newPolynomial = this.polynomial._scaleRoots(k).primitivePart();
  if (!(isRational(k))) { // TODO: remove
    var root = this;
    newPolynomial = toPolynomialWithIntegerCoefficients(newPolynomial);
    return calculateNewInterval(newPolynomial, function (precision) {
      return toSimpleInterval(root, precision).multiply(toSimpleInterval(k, precision));
    });
  }
  //TODO: clean up
  if (!isPowerOf2(k.getDenominator())) {
    // to have interval ends of the form n*2**e
    var root = this;
    return calculateNewInterval(newPolynomial, function (precision) {
      return toSimpleInterval(root, precision).multiply(toSimpleInterval(k, precision));
    });
  }
  var newInterval = SimpleInterval.from(this.interval).scale(k).toExpressionsInterval();
  return new PolynomialRoot(newPolynomial, newInterval);
};

//TODO: remove (?)
PolynomialRoot.prototype.translate = function (k) {
  //console.assert(k instanceof Expression.Integer || isRational(k));//TODO: ???
  // z = x + k, x = z - k
  var newPolynomial = this.polynomial._translateRoots(k).primitivePart();
  // to avoid intervals, which include zero
  var root = this;
  var newInterval = null;
  if (!(isRational(k))) { // TODO: remove
    newPolynomial = toPolynomialWithIntegerCoefficients(newPolynomial);
    return calculateNewInterval(newPolynomial, function (precision) {
      return toSimpleInterval(root, precision).add(toSimpleInterval(k, precision));
    });
  }
  // to avoid intervals, which include zero
  return calculateNewInterval(newPolynomial, function (precision) {
    return toSimpleInterval(root, precision).add(toSimpleInterval(k, precision));
  });
};

PolynomialRoot.prototype.multiply = function (other) {
  var that = this;
  //TODO: remove
if (true) {
  let g = Math.gcd(that.polynomial.getGCDOfTermDegrees(), other.polynomial.getGCDOfTermDegrees());
  if (g > 1) {
    var tmp = that._pow(g).multiply(other._pow(g))._nthRoot(g);
    //TODO: TEST!!!
    if (g % 2 === 0 && that.sign() * other.sign() < 0) {
      tmp = tmp.negate();
    }
    return tmp;
  }
}
  // z = x * y, y = z / x
  //TODO: variable names
  const $z = new Expression.Polynomial(Polynomial.of(Expression.ONE).shift(1));
  const toPInZ = c => new Expression.Polynomial(Polynomial.of(c));
  var second = other.polynomial._exponentiateRoots(-1).map(toPInZ)._scaleRoots($z);
  var newPolynomial = Polynomial.resultant(that.polynomial.map(toPInZ), second).polynomial.primitivePart();
  return calculateNewInterval(newPolynomial, function (precision) {
    return toSimpleInterval(that, precision).multiply(toSimpleInterval(other, precision));
  });
};

PolynomialRoot.prototype.add = function (other) {
  var that = this;
  if (that.polynomial.isEven() && that.polynomial.equals(other.polynomial) && that.equals(other.negate())) {
    return new PolynomialRoot(Polynomial.of(Expression.ONE).shift(1), {a: Expression.ONE.negate(), b: Expression.ONE});
  }
  // z = x + y, y = z - x
  //TODO: variable names
  const $z = new Expression.Polynomial(Polynomial.of(Expression.ONE).shift(1));
  const toPInZ = c => new Expression.Polynomial(Polynomial.of(c));
  var second = other.polynomial._scaleRoots(Expression.ONE.negate()).map(toPInZ)._translateRoots($z);
  var newPolynomial = Polynomial.resultant(that.polynomial.map(toPInZ), second).polynomial.primitivePart();
  return calculateNewInterval(newPolynomial, function (precision) {
    return toSimpleInterval(that, precision).add(toSimpleInterval(other, precision));
  });
};

//TODO: remove (?)
PolynomialRoot.prototype.negate = function () {
  return new PolynomialRoot(this.polynomial._scaleRoots(Expression.ONE.negate()), {b: this.interval.a.negate(), a: this.interval.b.negate()});
};

//TODO: remove (?)
PolynomialRoot.prototype.inverse = function () {
  // z = 1/y, y = 1/z
  var newPolynomial = this.polynomial._exponentiateRoots(-1);
  console.assert(this.interval.a.getNumerator().sign() === this.interval.b.getNumerator().sign());
  var that = this;
  return calculateNewInterval(newPolynomial, function (precision) {
    return toSimpleInterval(that, precision).inverse(precision);
  });
};

PolynomialRoot.prototype.sign = function () {
  if (this.polynomial.getCoefficient(0).equals(Expression.ZERO)) {
    if (this.interval.a.getNumerator().sign() <= 0 && this.interval.b.getNumerator().sign() >= 0) {
      return 0;
    }
  }
  if (this.interval.a.getNumerator().sign() >= 0) {
    return +1;
  }
  if (this.interval.b.getNumerator().sign() <= 0) {
    return -1;
  }
  throw new TypeError("should not happen");
};

PolynomialRoot.prototype._pow = function (n) {
  var pow = function (x, count, accumulator) {
    if (!(count >= 0)) {
      throw new RangeError();
    }
    if (count > Number.MAX_SAFE_INTEGER) {
      throw new RangeError("NotSupportedError");
    }
    return (count < 1 ? accumulator : (2 * Math.floor(count / 2) !== count ? pow(x, count - 1, accumulator.multiply(x)) : pow(x._pow(2), Math.floor(count / 2), accumulator)));
  };
  if (n === 0) {
    return new PolynomialRoot(Polynomial.of(Expression.ONE.negate(), Expression.ONE), SimpleInterval.from({a: Expression.ZERO, b: Expression.TWO})); // x-1=0
  }
  var g = Math.gcd(n, this.polynomial.getGCDOfTermDegrees());
  if (g === 1) {
    //return Expression.prototype._pow.call(this, n);//TODO: ?
    return pow(this, n - 1, this);
  }
  if (g < n) {
    return this._pow(g)._pow(n / g);
  }
  //TODO: faster method
  var newInterval = undefined;
  if (n % 2 === 0 && this.interval.b.getNumerator().sign() <= 0) {
    newInterval = {a: this.interval.b._pow(n), b: this.interval.a._pow(n)};
  } else {
    newInterval = {a: this.interval.a._pow(n), b: this.interval.b._pow(n)}
  }
  //TODO:
  return new PolynomialRoot(this.polynomial._exponentiateRoots(n), newInterval);
};

const $α = function () {
  return new Expression.Symbol('α');
  //return new Expression.Polynomial(Polynomial.of(Expression.ONE).shift(1));
};

PolynomialRoot.prototype._nthRoot = function (n) {
  var newPolynomial = this.polynomial._exponentiateRoots(1 / n);
  var root = this;
  return calculateNewInterval(newPolynomial, function (precision) {
    //TODO: 
    //return root.toDecimal(precision).nthRoot(n);
    return toSimpleInterval(Expression.NthRoot.makeRoot(new Expression.ExpressionPolynomialRoot(new LazyPolynomialRoot(Polynomial.of(Expression.ZERO, Expression.ONE), Polynomial.of(Expression.ONE), root)), n), precision);
  });
};

PolynomialRoot.prototype.equals = function (other) {
  if (this === other) {
    return true;
  }
  if (this.polynomial.getDegree() !== other.polynomial.getDegree()) {
    return false;
  }
  if (this.polynomial.equals(other.polynomial) && this.interval.a.equals(other.interval.a) && this.interval.b.equals(other.interval.b)) {
    return true;
  }
  const i = intersection(this.interval, other.interval);
  if (i == null) {
    return false;
  }
  if (this.polynomial.equals(other.polynomial)) {
    const c = this.polynomial.numberOfRoots(i);
    if (c === 1) {
      return true;
    } else if (c === 0) {
      return false;
    }
    throw new TypeError();
  }
  if (Polynomial.polynomialGCD(this.polynomial, other.polynomial).getDegree() === 0) {
    return false;
  }
  //TODO: ?
  //return this.polynomial.equals(other.polynomial) && intersection(this.interval, other.interval) != null && this.add(other.negate()).equals(Expression.ZERO);
  var interval = this.add(other.negate()).interval;
  return interval.a.getNumerator().sign() <= 0 && interval.b.getNumerator().sign() >= 0;
};

PolynomialRoot._calculateNewInterval = calculateNewInterval;//TODO: remove
LazyPolynomialRoot._calculateNewInterval = calculateNewInterval;//TODO: remove

PolynomialRoot._toSimpleInterval = toSimpleInterval;//TODO: remove
LazyPolynomialRoot._toSimpleInterval = toSimpleInterval;//TODO: remove

var _isSimpleForUpgrade = function (e, root) {
  if (e instanceof Expression.Multiplication) {
    return true;//!?
  }
  if (e instanceof Expression.Addition && !(e.a instanceof Expression.Addition)) {
    return _isSimpleForUpgrade(e.a, root) && _isSimpleForUpgrade(e.b, root);
  }
  //TODO: other variants (?)
  return e.equals(root) ||
         e instanceof Expression.Integer || e instanceof Expression.Complex || e instanceof Expression.NthRoot ||
         e instanceof Expression.Exponentiation && _isSimpleForUpgrade(e.a, root) && e.b instanceof Expression.Integer ||
         e instanceof Expression.Multiplication && _isSimpleForUpgrade(e.a, root) && _isSimpleForUpgrade(e.b, root) ||
         e instanceof Expression.Division && _isSimpleForUpgrade(e.getNumerator(), root) && e.b instanceof Expression.Integer;
};
PolynomialRoot._isSimpleForUpgrade = _isSimpleForUpgrade;
LazyPolynomialRoot._isSimpleForUpgrade = _isSimpleForUpgrade;

function LazyPolynomialRoot(p1, p2, root) {
  //console.assert(e instanceof Expression && (e.getDenominator() instanceof Expression.Integer));//TODO: Expression.Polynomial (?)
  if (!(p1 instanceof Polynomial)) {
    throw new TypeError();
  }
  if (!(p2 instanceof Polynomial) || !(p2.getDegree() === 0)) {
    throw new TypeError();
  }
  if (!p1._testCoefficients(c => !(c instanceof Expression.Division))) {
    throw new TypeError();
  }
  console.assert(root instanceof PolynomialRoot);
  //TODO:
  //console.assert(Expression.isRealAlgebraicNumber(e));
  //this.e = e; // internal symbolic expression with a "root" as a symbol
  this._p1 = p1;
  this._p2 = p2;
  this._root = root;
  //if (Math.random() < 1/1000) {
    //console.debug('LazyPolynomialRoot', p1.getDegree() < 0 ? 0 : p1._log2hypot());
  //}
}

LazyPolynomialRoot.prototype.toDecimal = function (precision) {
  var calcAt = function (polynomial, x, precision) {
    var result = toSimpleInterval(Expression.ZERO, precision);
    for (var i = polynomial.getDegree(); i >= 0; i--) {
      result = result.multiply(x);
      var tmp = toSimpleInterval(polynomial.getCoefficient(i), Math.max(1, precision));
      //TODO: ?
      //if (tmp === "CANNOT_DIVIDE" || tmp == undefined) {
      //  return tmp;
      //}
      result = result.add(tmp);
    }
    return result;
  };
  var alphaValue = toSimpleInterval(this._root, precision);
  var p1 = this._p1;
  var p2 = this._p2;
  var a = calcAt(p1, alphaValue, precision);
  //if (a === "CANNOT_DIVIDE" || a == undefined) {
  //  return a;
  //}
  var b = calcAt(p2, alphaValue, precision);
  //if (b === "CANNOT_DIVIDE" || b == undefined) {
  //  return b;
  //}
  var result = a.multiply(b.inverse(precision));
  //TODO: precision !!!
  return result.toExpressionsInterval();
};

LazyPolynomialRoot.prototype.toString = function () {
  return "[" + this.getAlphaExpression() + ", where " + this._root + "]"; // for debugging
};

function makeExpressionWithPolynomialRoot(p1, p2, root) {

  var v = root;

if (true) {
  if (p2.getDegree() !== 0 || !(p2.getCoefficient(0) instanceof Expression.Integer)) {
    const p2Inv = p2.modularInverse(root.polynomial).primitivePart();
    const newDenominator = p2.multiply(p2Inv).divideAndRemainder(root.polynomial).remainder;
    if (p2.getDegree() > 0) {
      var c = newDenominator.getContent().getDenominator();
      return makeExpressionWithPolynomialRoot(p1.multiply(p2Inv).scale(c), newDenominator.scale(c), root);
    }
  }
}

var reduce = function (p1, p2) {
  if (!(p2.getLeadingCoefficient() instanceof Expression.Integer)) {
    var c = Expression.getConjugate(p2.getLeadingCoefficient());
    return reduce(p1.scale(c), p2.scale(c));
  }
  //var g = p1.shift(p2.getDegree() + 1).add(p2).getContent();
  var g = p1.getContent().gcd(p2.getContent());
  if (!g.equals(Expression.ONE)) {
    p1 = p1.scale(g.inverse());
    p2 = p2.scale(g.inverse());
  }
  return [p1, p2];
};

  //TODO: use cases - ?
  if (p1.equals(Polynomial.ZERO)) {
    return [Polynomial.ZERO, Polynomial.of(Expression.ONE)];
  }
  if (p1.getDegree() === 0 && p2.getDegree() === 0) {
    return reduce(p1, p2);
  }
  //!

/*
  var c = function (x) {
    //!new 2020-08-27
    //TODO: remove
    //TODO: optimize
    //!new 2022-07-06 disabled as it is too slow and I do not know how to optimize it
    if (false &&
        !(x instanceof Expression.Integer) &&
        !(x instanceof Expression.Multiplication && x.a === Expression.I && x.b === v) &&
        !(x instanceof Expression.Exponentiation)) {
      var p1 = Polynomial.toPolynomial(x.subtract(new Expression.Symbol('$n')), variable);
      //var test = v.polynomial.divideAndRemainder(p1).remainder;
      if (p1.getDegree() >= v.polynomial.getDegree()) {
        p1 = Polynomial.pseudoRemainder(p1, v.polynomial);
      }
      var test = v.polynomial.getDegree() >= p1.getDegree() ? Polynomial.pseudoRemainder(v.polynomial, p1) : v.polynomial;
      if (test.getDegree() === 0) {
        //(x**2-2)(x**2+x-1) = 0
        var pn0 = Polynomial.toPolynomial(test.calcAt(Expression.ZERO).getNumerator(), new Expression.Symbol('$n'));
        var pn = Polynomial.toPolynomial(Expression.getConjugateExpression(test.calcAt(Expression.ZERO).getNumerator()), new Expression.Symbol('$n'));
        //pn = pn.scale(pn.getLeadingCoefficient().inverse());
        pn = pn.primitivePart();
        var tmp = pn.squareFreeFactors();
        var f = tmp.a0;
        if (tmp.a0.getDegree() === 0) {
          f = tmp.a1;
        }
        if (f.getDegree() <= 2) {//TODO: ?
          const roots = f.getroots();
          let c = [];
          let fractionDigits = 3;
          do {
            c.splice(0, c.length);
            for (const root of roots) {
              if (Expression.has(root, Expression.Complex) === Expression.has(x, Expression.Complex)) {
                if (root.getNumerator().toMathML({rounding: {fractionDigits: fractionDigits}}) === new Expression.Multiplication(x, root.getDenominator()).toMathML({rounding: {fractionDigits: fractionDigits}})) {
                  c.push(root);
                }
              }
            }
            fractionDigits *= 2;
          } while (c.length > 2);
          if (c.length === 1) {
            console.debug('c[0]:', c[0].toString());
            return c[0];
          }
        }
        var lc = pn.getLeadingCoefficient();
        //TODO: Expression.isConstant(x) is not working when x contains alpha (ExpressionPolynomialRoot)
        if (lc instanceof Expression.Integer && Expression.isConstant(x)) {//TODO: ? - this is a filter to avoid infinite computation
          var s = toDecimalStringInternal(x.multiply(lc), {fractionDigits: 0});
          var n = Number(s);//TODO: complex - ?
          if (!Number.isNaN(n)) {
            var q = Expression.Integer.fromString(s).divide(lc);
            if (pn.calcAt(q).equals(Expression.ZERO) && pn0.calcAt(q).equals(Expression.ZERO)) {
              const tmp = Expression.ONE.divide(Expression.TWO).divide(lc);
              const interval = {a: q.subtract(tmp), b: q.add(tmp)};
              if (pn.numberOfRoots(interval) === 1) {
                console.debug('q.toString():', q.toString());
                return q;
              }
              //TODO: ?
              //if (pn0.numberOfRoots(interval) === 1) {
              //  debugger;
              //  console.debug('q.toString():', q.toString());
              //  return q;
              //}
            }
          }
        }
      }
    }
    var px = Polynomial.toPolynomial(x, variable);
    if (false) {
      if (v.polynomial.getDegree() === 6 && v.polynomial.getCoefficient(1).equals(Expression.ZERO) && v.polynomial.getCoefficient(2).equals(Expression.ZERO) && v.polynomial.getCoefficient(4).equals(Expression.ZERO) && v.polynomial.getCoefficient(5).equals(Expression.ZERO)) {
        if (px.getDegree() >= 3) {
          var alpha = c(v._pow(3));
          var dv = Polynomial.of(alpha.negate(), Expression.ZERO, Expression.ZERO, Expression.ONE);
          return px.divideAndRemainder(dv).remainder.calcAt(variable);
        }
      }
    }
    //!
    return px.divideAndRemainder(v.polynomial).remainder.calcAt(variable);
  };
*/

  var c = function (p) {
    return p.divideAndRemainder(v.polynomial).remainder;
  };

  /*e = p1.calcAt(variable).divide(p2.calcAt(variable));
  var oldE = e;
  e = c(e.getNumerator()).divide(c(e.getDenominator()));
  if (!oldE.equals(e)) {
    var tmp = (!(oldE.getDenominator() instanceof Expression.Integer) || !(e.getDenominator() instanceof Expression.Integer));
    if (tmp) {
      e = c(e.getNumerator()).divide(c(e.getDenominator())); // something may change after the previous step
    }
  }*/
  
  p1 = c(p1);
  p2 = c(p2);
  
  //TODO: !?
  var s = p1.map(c => c.getDenominator().inverse()).getContent().getDenominator();
  p1 = p1.scale(s);
  p2 = p2.scale(s);

if (!p1.hasIntegerCoefficients()) { // integer polynomial may not be a factor of v.polynomial if the last one is minimal
//TODO: !?
var ok = true;
if (root instanceof PolynomialRoot) {
  var interval = new LazyPolynomialRoot(p1, Polynomial.of(Expression.ONE), root).toDecimal(53);//!new - trying to optimize (!)
  ok = interval.b.sign() >= 0 && interval.a.sign() <= 0;
}
if (ok) {

  //TODO: use polynomial from the start - ?
  if (p1.hasRoot(v)) {//Note: slow
    return [Polynomial.ZERO, Polynomial.of(Expression.ONE)];
  }
  
}
}

  return reduce(p1, p2);
}

PolynomialRoot._makeExpressionWithPolynomialRoot = makeExpressionWithPolynomialRoot;
LazyPolynomialRoot._makeExpressionWithPolynomialRoot = makeExpressionWithPolynomialRoot;

function simplifyExpressionWithPolynomialRoot(p1, p2, root) {
  const tmp = makeExpressionWithPolynomialRoot(p1, p2, root);
  return new LazyPolynomialRoot(tmp[0], tmp[1], root);
}
PolynomialRoot.create = function (polynomial, interval, options) {
  return new PolynomialRoot(polynomial, interval, options);
};
LazyPolynomialRoot.create = function (polynomial, interval, options) {
  return fromRoot(new PolynomialRoot(polynomial, interval, options));
};
function fromRoot(root) {
  return new LazyPolynomialRoot(Polynomial.of(Expression.ZERO, Expression.ONE), Polynomial.of(Expression.ONE), root);
}
LazyPolynomialRoot.prototype.scale = function (k) {
  console.assert(Expression.isRealAlgebraicNumber(k));
  var result1 = this._p1.scale(k.getNumerator());
  var result2 = this._p2.scale(k.getDenominator());
  return k instanceof Expression.Integer ? new LazyPolynomialRoot(result1, result2, this._root) : simplifyExpressionWithPolynomialRoot(result1, result2, this._root);
};
LazyPolynomialRoot.prototype.translate = function (k) {
  console.assert(Expression.isRealAlgebraicNumber(k));
  return simplifyExpressionWithPolynomialRoot(this._p1.scale(k.getDenominator()).add(this._p2.scale(k.getNumerator())), this._p2.scale(k.getDenominator()), this._root);
};

var toPolynomialWithIntegerCoefficients = function (polynomial) {
  if (!polynomial.hasIntegerCoefficients()) {
    var variable = new Expression.Symbol('$$');
    var e = polynomial.calcAt(variable);
    var c = Expression.getConjugateExpression(e);
    if (c != null && !c.equals(e)) {
      //TODO: what if multiple (?) - ?
      return Polynomial.toPolynomial(c, variable);
    }
  }
  return polynomial;
};

function upgrade(root, p1, p2) {

  if (p1.getDegree() === 1 && p1.getCoefficient(0).equals(Expression.ZERO) && p1.getCoefficient(1).equals(Expression.ONE)) { // short path
    if (p2.getDegree() === 0) {
      if (p2.getCoefficient(0).equals(Expression.ONE)) {
        return root;
      }
      return root.scale(p2.getCoefficient(0).inverse()); // short path 2
    }
  }
  if (p1.equals(Polynomial.ZERO)) {
    return PolynomialRoot.create(Polynomial.of(Expression.ZERO, Expression.ONE), {a: Expression.ZERO, b: Expression.ZERO});
  }
  if (p1.getDegree() === 0 && p2.getDegree() === 0 && p2.getCoefficient(0).equals(Expression.ONE)) {
    const x = p1.getCoefficient(0);
    return PolynomialRoot.create(Polynomial.of(x.negate(), Expression.ONE), {a: x, b: x});
  }
  //TODO: !?
  // e = (ax^n + b) / c
  // root._pow(n).scale(a).translate(b).scale(c.inverse())
  if (p2.getDegree() === 0 &&
      p2.getCoefficient(0).equals(Expression.ONE) &&
      p1.getDegree() === p1.getGCDOfTermDegrees() &&
      p1.getLeadingCoefficient().equals(Expression.ONE) &&
      p1.getCoefficient(0).equals(Expression.ZERO) &&
      p1.getDegree() === root.polynomial.getGCDOfTermDegrees()) {//TODO: other cases !!!
    return root._pow(p1.getDegree());
  }
  if (p2.getDegree() === 0 && p2.getCoefficient(0).equals(Expression.ONE) && p1.getDegree() === 1 && p1.getCoefficient(1).equals(Expression.ONE)) {
    return root.translate(p1.getCoefficient(0));
  }
  if (p2.getDegree() === 0 && p1.getDegree() === 1 && p1.getCoefficient(0).equals(Expression.ZERO)) {
    return root.scale(p1.getCoefficient(1).divide(p2.getCoefficient(0)));
  }
  var scale = Expression.ONE;
  if (p2.getDegree() === 0 && p2.hasIntegerCoefficients()) {
    scale = p2.getLeadingCoefficient();
    p2 = Polynomial.of(Expression.ONE);
  }
  var polynomial = p1.subtract(Polynomial.of(new Expression.Symbol('β')).multiply(p2));
  polynomial = toPolynomialWithIntegerCoefficients(polynomial);//TODO: ???
  const toPInBeta = c => new Expression.Polynomial(Polynomial.of(c));
  polynomial = polynomial.map(c => new Expression.Polynomial(Polynomial.toPolynomial(c, new Expression.Symbol('β'))));//TODO: ?
  var newPolynomial = Polynomial.resultant(polynomial, root.polynomial.map(toPInBeta)).polynomial.primitivePart();
  if (scale !== Expression.ONE) {
    // "unscale"
    newPolynomial = newPolynomial._scaleRoots(scale.inverse()).primitivePart();
  }
  return PolynomialRoot._calculateNewInterval(newPolynomial, function (precision) {
    return toSimpleInterval(new Expression.ExpressionPolynomialRoot(new LazyPolynomialRoot(p1, p2.scale(scale), root)), precision);
  });
}
LazyPolynomialRoot.prototype.multiply = function (other) {
  if (this._root.equals(other._root)) {
    return simplifyExpressionWithPolynomialRoot(this._p1.multiply(other._p1), this._p2.multiply(other._p2), this._root);
  }
  var root = upgrade(this._root, this._p1, this._p2).multiply(upgrade(other._root, other._p1, other._p2));
  return fromRoot(root);
};
LazyPolynomialRoot.prototype.add = function (other) {
  if (this._root.equals(other._root)) {
    var g = other._p2.getContent().gcd(this._p2.getContent());
    return simplifyExpressionWithPolynomialRoot(this._p1.multiply(other._p2.scale(g.inverse())).add(other._p1.multiply(this._p2.scale(g.inverse()))), this._p2.scale(g.inverse()).multiply(other._p2.scale(g.inverse())).scale(g), this._root);
  }
  var root = upgrade(this._root, this._p1, this._p2).add(upgrade(other._root, other._p1, other._p2));
  return fromRoot(root);
};
LazyPolynomialRoot.prototype.negate = function () {
  return new LazyPolynomialRoot(this._p1.negate(), this._p2, this._root);
};
LazyPolynomialRoot.prototype.inverse = function () {
  return simplifyExpressionWithPolynomialRoot(this._p2, this._p1, this._root);
};
LazyPolynomialRoot.prototype.sign = function () {
  if (this._p1.equals(Polynomial.ZERO)) {
    return 0;
  }
  //return this.e;
  //?
  //TODO: ???
  //var s = toDecimalStringInternal(new Expression.ExpressionPolynomialRoot(this), {significantDigits: 1});
  //return s.startsWith('-') ? -1 : +1;
  let precision = 1;
  while (true) {
    var interval = this.toDecimal(precision);
    if (interval.a.getNumerator().sign() >= 0) {
      return +1;
    }
    if (interval.b.getNumerator().sign() <= 0) {
      return -1;
    }
    precision *= 2;
    if (precision > 8) {
      console.debug('hm...');
    }
  }
};
LazyPolynomialRoot.prototype._pow = function (n) {
  //TODO: modular exponentiation (?)
  return simplifyExpressionWithPolynomialRoot(this._p1._pow(n), this._p2._pow(n), this._root);
};
LazyPolynomialRoot.prototype._nthRoot = function (n) {//?
  if (this._p2.getDegree() === 0 && this._p2.getCoefficient(0).equals(Expression.ONE) &&
      this._p1.getDegree() === 1 && this._p1.getCoefficient(0).equals(Expression.ZERO) && this._p1.getCoefficient(1).equals(Expression.ONE)) {//TODO: ?
    var newRoot = this._root._nthRoot(n);
    return new LazyPolynomialRoot(Polynomial.of(Expression.ZERO, Expression.ONE), Polynomial.of(Expression.ONE), newRoot);
  }
  var getPerfectPower = function (p, n) {
    var root = p.getSquareFreePolynomial();
    return root._pow(n).equals(p) ? root : null;
  };
  var root = getPerfectPower(this._p1, n);
  const c = this._p2.getCoefficient(0);
  if (root != null && this._p2.getDegree() === 0 && c instanceof Expression.Integer && c.sign() > 0) {
    return simplifyExpressionWithPolynomialRoot(root, Polynomial.of(c._nthRoot(n)), this._root);
  }
  return this.upgrade()._nthRoot(n);
};
LazyPolynomialRoot.prototype.equals = function (other) {
  if (this._root.equals(other._root)) {
    //TODO:? ?
    return this._p1.equals(other._p1) && this._p2.equals(other._p2) || this.add(other.negate()).sign() === 0;
  }
  //!TODO: remove (hack to avoid error)
  if (toDecimalStringInternal(new Expression.ExpressionPolynomialRoot(this), {significantDigits: 3}) !== toDecimalStringInternal(new Expression.ExpressionPolynomialRoot(other), {significantDigits: 3})) {
    return false;
  }
  //!
  var result = upgrade(this._root, this._p1, this._p2).equals(upgrade(other._root, other._p1, other._p2));
  return result;
};

PolynomialRoot.prototype.upgrade = function () {
  return this;
};
LazyPolynomialRoot.prototype.upgrade = function () {
  return fromRoot(upgrade(this._root, this._p1, this._p2));
};

PolynomialRoot.prototype._calc = function (polynomial) {
  return upgrade(this, polynomial.calcAt($α()));
};
LazyPolynomialRoot.prototype._calc = function (polynomial) {
  var e = polynomial.calcAt(this.getAlphaExpression());
  return simplifyExpressionWithPolynomialRoot(Polynomial.toPolynomial(e.getNumerator(), $α()), Polynomial.toPolynomial(e.getDenominator(), $α()), this._root);
};

PolynomialRoot.prototype.getAlpha = function (polynomial) {
  // simple object is returned to not expose the PolynomialRoot
  return {
    polynomial: this.polynomial,
    interval: this.interval
  };
};
LazyPolynomialRoot.prototype.getAlpha = function (polynomial) {
  return this._root.getAlpha();
};
//TODO: return polynomials (?)
PolynomialRoot.prototype.getAlphaExpression = function (polynomial) {
  return $α();
};
LazyPolynomialRoot.prototype.getAlphaExpression = function (polynomial) {
  return this._p1.calcAt($α()).divide(this._p2.calcAt($α()));
};

PolynomialRoot.prototype.getAlphaPolynomial = function (polynomial) {
  return Polynomial.of(Expression.ZERO, Expression.ONE);
};
LazyPolynomialRoot.prototype.getAlphaPolynomial = function (polynomial) {
  return [this._p1, this._p2];
};

//LazyPolynomialRoot.PolynomialRoot = PolynomialRoot;//TODO: REMOVE!!!

globalThis.testables = globalThis.testables || {};
globalThis.testables.LazyPolynomialRoot = LazyPolynomialRoot;
globalThis.testables.PolynomialRoot = PolynomialRoot;
globalThis.testables.toSimpleInterval = toSimpleInterval;
globalThis.testables.SimpleInterval = SimpleInterval;

if (true) {//TODO: move to tests
  console.assert(Object.keys(PolynomialRoot).join(' ') === Object.keys(LazyPolynomialRoot).join(' '));
  console.assert(Object.keys(PolynomialRoot.prototype).join(' ') === Object.keys(LazyPolynomialRoot.prototype).join(' '));
  console.assert(PolynomialRoot.prototype.__proto__ === LazyPolynomialRoot.prototype.__proto__);
}

//export default PolynomialRoot;
export default LazyPolynomialRoot;
