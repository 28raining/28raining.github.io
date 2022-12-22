  import Expression from './Expression.js';
  import QuadraticInteger from './QuadraticInteger.js';

  var Integer = Expression.Integer;

  function Complex(real, imaginary) {
    //Expression.call(this);
    if (!(real instanceof Integer) || !(imaginary instanceof Integer) || imaginary.compareTo(Expression.ZERO) === 0) {
      throw new RangeError();
    }
    this.real = real;
    this.imaginary = imaginary;
  }

  Complex.prototype = Object.create(Expression.prototype);

  Expression.I = new Complex(Expression.ZERO, Expression.ONE);
  Expression.Complex = Complex;

  Complex.prototype.add = function (y) {
    return y.addComplex(this);
  };
  Expression.prototype.addComplex = function (x) {
    return this.addExpression(x);
  };
  Integer.prototype.addComplex = function (x) {
    return new Complex(x.real.add(this), x.imaginary);
  };
  Complex.prototype.addComplex = function (x) {
    var real = x.real.add(this.real);
    var imaginary = x.imaginary.add(this.imaginary);
    return imaginary.compareTo(Expression.ZERO) === 0 ? real : new Complex(real, imaginary);
  };
  Complex.prototype.addInteger = function (x) {
    return new Complex(x.add(this.real), this.imaginary);
  };

  Complex.prototype.equals = function (y) {
    return y instanceof Complex && this.real.equals(y.real) && this.imaginary.equals(y.imaginary) ? true : false;
  };

  Complex.prototype.compare4AdditionSymbol = function (x) {
    return +1;
  };
  Complex.prototype.compare4MultiplicationNthRoot = function (x) {
    return +1;
  };
  Complex.prototype.compare4Addition = function (y) {
    if (y instanceof Complex) {
      if (this.equals(y)) {
        return 0;
      }
      return this.real.compareTo(y.real) || this.imaginary.compareTo(y.imaginary);
    }
    if (y instanceof Integer) {
      return +1;
    }
    if (y instanceof Expression.Division) {
      return Expression.prototype.compare4Addition.call(this, y);
    }
    if (y instanceof Expression.Exponentiation) {
      return Expression.prototype.compare4Addition.call(this, y);
    }
    if (y instanceof Expression.Matrix) {
      return Expression.prototype.compare4Addition.call(this, y);
    }
    return -1;
  };
  // ? zero in case of same "base"
  Complex.prototype.compare4Multiplication = function (y) {
    if (y instanceof Complex) {
      if (y.equals(this)) {
        return 0;
      }
      return this.real.abs().compareTo(y.real.abs()) || this.imaginary.abs().compareTo(y.imaginary.abs());
      //return 0;
      //TODO: fix
      //throw new RangeError("NotSupportedError");//TODO:
    }
    return y.compare4MultiplicationComplex(this);
  };
  Expression.prototype.compare4MultiplicationComplex = function (x) {
    return -1;//?
  };
  Complex.prototype.compare4MultiplicationSymbol = function (x) {
    return +1;
  };
  Complex.prototype.multiply = function (y) {
    return y.multiplyComplex(this);
  };
  Complex.prototype.multiplyComplex = function (x) {
    var real = x.real.multiply(this.real).subtract(x.imaginary.multiply(this.imaginary));
    var imaginary = x.real.multiply(this.imaginary).add(x.imaginary.multiply(this.real));
    return imaginary.compareTo(Expression.ZERO) === 0 ? real : new Complex(real, imaginary);
  };
  Expression.prototype.multiplyComplex = function (x) {
    return this.multiplyExpression(x);
  };
  Integer.prototype.multiplyComplex = function (x) {
    if (this.compareTo(Expression.ZERO) === 0) {
      return this;
    }
    return new Complex(x.real.multiply(this), x.imaginary.multiply(this));
  };
  Complex.prototype.multiplyInteger = function (x) {
    if (x.compareTo(Expression.ZERO) === 0) {
      return x;
    }
    return new Complex(x.multiply(this.real), x.multiply(this.imaginary));
  };

  Complex.prototype.conjugate = function () {
    return new Complex(this.real, this.imaginary.negate());
  };
  //Complex.prototype.divideExpression = function (x) {
  //  var y = this;
  //  return x.multiply(y.conjugate()).divide(y.multiply(y.conjugate()));
  //};
  Complex.prototype.getPrecedence = function () {
    return this.real.equals(Expression.ZERO) ? (this.imaginary.equals(Expression.ONE) ? 1000 : 3) : 2; // precedence.binary['+']
  };

  Complex.prototype.truncatingDivide = function (f) {
    if (f instanceof Integer) {
      return new Complex(this.real.truncatingDivide(f), this.imaginary.truncatingDivide(f));
    }
    return this.multiply(f.conjugate()).truncatingDivide(f.multiply(f.conjugate()));
  };

  Complex.prototype.toStringInternal = function (options, times, i, minus, plus, start, end, toString) {
    if (this.real.equals(Expression.ZERO)) {
      if (this.imaginary.equals(Expression.ONE)) {
        return i;
      }
      if (this.imaginary.equals(Expression.ONE.negate())) {
        return start + minus + i + end;
      }
      return start + toString(this.imaginary, options) + times + i + end;
    }
    var isNegative = this.imaginary.isNegative();
    var imaginary = (isNegative ? this.imaginary.negateCarefully() : this.imaginary);
    var si = (imaginary.equals(Expression.ONE) ? i : start + toString(imaginary, options) + times + i + end);
    var sr = toString(this.real, options);
    return start + sr + (isNegative ? minus : plus) + si + end;
  };

  Complex.prototype.toString = function (options) {
    return this.toStringInternal(options, "", "i", "-", "+", "", "", function (x, options) { return x.toString(options); });
  };

  Complex.prototype.compare4MultiplicationInteger = function (x) {
    return +1;
  };

  Complex.prototype.remainderInteger = function (x) {
    return Complex.prototype.remainder.call(x, this);
  };

  Complex.prototype.remainder = function (y) {
    function norm(x) {
      return x instanceof Expression.Integer ? x.multiply(x) : x.multiply(x.conjugate());
    }
    function roundDivision(a, b) {
      if (b.compareTo(Expression.ZERO) < 0) {
        b = b.negate();
        a = a.negate();
      }
      var e = b.truncatingDivide(Expression.TWO);
      if (a.compareTo(Expression.ONE) < 0) {
        e = e.negate();
      }
      return a.add(e).truncatingDivide(b);
    }
    var x = this;
    var n = y instanceof Expression.Integer ? x : x.multiply(y.conjugate());
    var d = y instanceof Expression.Integer ? y : y.multiply(y.conjugate());
    //TODO: fix
    var q1 = roundDivision(n instanceof Complex ? n.real : n, d);
    var q2 = roundDivision(n instanceof Complex ? n.imaginary : Expression.ZERO, d);
    var q = q2.compareTo(Expression.ZERO) === 0 ? q1 : new Complex(q1, q2);
    var r =  x.subtract(y.multiply(q));
    if (norm(r).compareTo(norm(y)) >= 0) {
      throw new TypeError();
    }
    return r;
  };

  Complex.prototype.primeFactor = function () {
    return QuadraticInteger._complexIntegerPrimeFactor(this.real.toBigInt(), this.imaginary.toBigInt());
  };

  Expression.Complex = Complex;

Expression.Complex.prototype.complexConjugate = function () {
  return this.conjugate();
};

/*
//!
Expression.Complex.prototype.isValid = function () {
  return true;
};
//!
Expression.Complex.prototype.isPositive = function () {
  return this.imaginary.compareTo(Expression.ZERO) > 0;// || (this.imaginary.compareTo(Expression.ZERO) === 0 && this.real.compareTo(Expression.ZERO) > 0);
};
Expression.Complex.prototype.isUnit = function () {
  return this.multiply(this.conjugate()).equals(Expression.ONE);
};
Expression.Complex.prototype.truncatingDivideInteger = function (x) {
  debugger;
  return x.multiply(this.conjugate()).divide(this.multiply(this.conjugate()));
};

Expression.Complex.prototype.isDivisibleBy = function (y) {
  return !(this.divide(y) instanceof Expression.Division);
};
Expression.Complex.prototype.isDivisibleByInteger = function (x) {
  return !(x.multiply(this.conjugate()).divide(this.multiply(this.conjugate())) instanceof Expression.Division);
};
Expression.Complex.prototype.toExpression = function () {
  return this;
};
*/
