import Expression from './Expression.js';
import Matrix from './Matrix.js';
import Polynomial from './Polynomial.js';
import toDecimalStringInternal from './toDecimalString.js';
import primeFactor from './primeFactor.js';
import './polynomialFactorization.js';
import ExpressionParser from './ExpressionParser.js';
import ExpressionWithPolynomialRoot from './ExpressionWithPolynomialRoot.js';
import LazyPolynomialRoot from './PolynomialRoot.js';


/*
Expression.PolynomialRootSymbol = function () {
  throw new TypeError();
};
function ExpressionWithPolynomialRoot() {
  throw new TypeError();
}
*/

Expression.ExpressionWithPolynomialRoot = ExpressionWithPolynomialRoot;


// wrapper around PolynomialRoot
function ExpressionPolynomialRoot(root) {
  const alpha = root.getAlpha();
  const [p1, p2] = root.getAlphaPolynomial();
  const polynomial = alpha.polynomial;
  const interval = alpha.interval;
  if (p1.getDegree() <= 0 && p2.getDegree() <= 0) {
    return p1.getCoefficient(0).divide(p2.getCoefficient(0));
  }
  if (polynomial.getDegree() === 1 || polynomial.getDegree() === 2 || (polynomial.getDegree() === 4 && false) || polynomial.getDegree() === polynomial.getGCDOfTermDegrees()) {//TODO: other - ? like biqudratic - ?
    var roots = polynomial.getDegree() === polynomial.getGCDOfTermDegrees() && polynomial.getDegree() % 2 === 1 ? [polynomial.getCoefficient(0).negate().divide(polynomial.getLeadingCoefficient())._nthRoot(polynomial.getDegree())] : polynomial.getroots();
    for (var rr of roots) {
      if (!Expression.has(rr, ExpressionPolynomialRoot)) {//?
        if (Expression._isPositive(rr.subtract(interval.a)) && Expression._isPositive(rr.subtract(interval.b).negate()) || rr.equals(interval.b) || rr.equals(interval.a)) {
          if (p1.getDegree() === 1 && p1.getCoefficient(0).equals(Expression.ZERO) && p1.getCoefficient(1).equals(Expression.ONE) && p2.getDegree() === 0 && p2.getCoefficient(0).equals(Expression.ONE)) {//TODO: ???
            return rr;//TODO: MOVE!
          } else {
            var n = p1.calcAt(rr);
            var d = p2.calcAt(rr);
            return n.divide(d);
          }
        }
      }
    }
  }
  if (polynomial.getDegree() < 3) {
    throw new TypeError();
  }
  if (polynomial.getDegree() / polynomial.getGCDOfTermDegrees() > 64 * 2 * 32) {
    throw new Error();//TODO: too long
  }
  Expression.Symbol.call(this, null); // root.toString() - slow
  this.root = root;
  Object.freeze(this);
}
ExpressionPolynomialRoot.prototype = Object.create(Expression.Symbol.prototype);

ExpressionPolynomialRoot.create = function (polynomial, interval, options) {
  return new ExpressionPolynomialRoot(LazyPolynomialRoot.create(polynomial, interval, options));
};

ExpressionPolynomialRoot.prototype.multiplyInteger = function (x) {
  return x.multiplyPolynomialRoot(this);
};
ExpressionPolynomialRoot.prototype.multiply = function (e) {
  return e.multiplyPolynomialRoot(this);
};
ExpressionPolynomialRoot.prototype.multiplyExpression = function (e) {
  if (e.equals(Expression.ONE)) {
    return this;
  }
  //?
  //TODO: fix
  if (Expression.isConstant(e) && !Expression.has(e, Expression.Complex)) {
    return this.multiply(e);
  }
  return Expression.Symbol.prototype.multiplyExpression.call(this, e);
};
ExpressionPolynomialRoot.prototype.multiplyAddition = function (e) { // for performance (?) when `e` is a constant
  if (Expression.isConstant(e) && !Expression.has(e, Expression.Complex)) {
    return this.multiplyExpression(e);
  }
  return Expression.Symbol.prototype.multiplyAddition.call(this, e);
};
ExpressionPolynomialRoot.prototype.multiplyComplex = function (x) {
  return this.multiply(x);
};
Expression.prototype.multiplyPolynomialRoot = function (root) {
  if (Expression.isRealAlgebraicNumber(this) &&
      !Expression.has(this, Expression.ExpressionWithPolynomialRoot)) {
    const k = this;
    if (k.equals(Expression.ZERO)) {
      return k;
    }
    if (k.equals(Expression.ONE)) {
      return root;
    }
    return new ExpressionPolynomialRoot(root.root.scale(k));
  }
  if (this instanceof Expression.Complex && !this.imaginary.equals(Expression.ONE)) {
    return this.imaginary.multiply(root).multiply(Expression.I).add(this.real.multiply(root));
  }
  //TODO: ?
  //throw new Error();
  return this.multiplyExpression(root);
};
ExpressionPolynomialRoot.prototype._pow = function (n) {
  return new ExpressionPolynomialRoot(this.root._pow(n));
};
ExpressionPolynomialRoot.prototype.pow = function (e) {
  if (e instanceof Expression.Integer) {
    return this._pow(e.toNumber());
  }
  //TODO: upgrade (?)
  //TODO: ?
  if (e instanceof Expression.Division && e.getDenominator() instanceof Expression.Integer) {
    //TODO: verify
    return this._nthRoot(e.getDenominator().toNumber()).pow(e.getNumerator());
  }
  return Expression.Symbol.prototype.pow.call(this, e);
};
ExpressionPolynomialRoot.prototype.multiplyPolynomialRoot = function (x) {
  var y = this;
  return new ExpressionPolynomialRoot(x.root.multiply(y.root));
};
ExpressionPolynomialRoot.prototype.add = function (e) {
  return e.addPolynomialRoot(this);
};
ExpressionPolynomialRoot.prototype.addPolynomialRoot = function (x) {
  var y = this;
  return new ExpressionPolynomialRoot(x.root.add(y.root));
};
Expression.prototype.addPolynomialRoot = function (root) {
  if (Expression.isRealAlgebraicNumber(this) &&
      !Expression.has(this, Expression.ExpressionWithPolynomialRoot)) {
    const k = this;
    if (k.equals(Expression.ZERO)) { // for performance
      return root;
    }
    return new ExpressionPolynomialRoot(root.root.translate(k));
  }
  //throw new Error();
  return this.addExpression(root);
};
ExpressionPolynomialRoot.prototype.addExpression = function (e) {
  return this.add(e);//!?
};
ExpressionPolynomialRoot.prototype.divide = function (e) {
  //if (e.equals(Expression.ONE)) {
  //  return this;
  //}
  //if (!(e instanceof ExpressionPolynomialRoot) && !Expression.isConstant(e) || Expression.has(e, Expression.Matrix) || Expression.has(e, Expression.MatrixSymbol)) {
    //TODO: why - ?
  //  throw new Error();
  //}
  if (e instanceof Expression.Exponentiation) {
    return e.divideExpression(this);//?TODO: HACKs
  }
  if (e instanceof Expression.Multiplication && e.a instanceof Expression.Integer && e.b instanceof Expression.Exponentiation) {//TODO: ?
    return this.multiply(e.a.inverse()).divide(e.b);
  }
  return this.multiply(e.inverse());
};
ExpressionPolynomialRoot.prototype.divideExpression = function (x) {
  return x.multiply(this.inverse());
};
ExpressionPolynomialRoot.prototype.inverse = function () {
  return new ExpressionPolynomialRoot(this.root.inverse());
};
ExpressionPolynomialRoot.prototype.sign = function () {
  return this.root.sign();
};
var toRadicalExpression = function (root) {
  root = root.upgrade();
  const polynomialRoot = root.getAlpha();
  //TODO: root.getAlphaExpression()
  if (polynomialRoot.polynomial.getDegree() === 1) {
    //TODO: ???
    return polynomialRoot.polynomial.getroots()[0];
  }
  //TODO: ?
  var g = polynomialRoot.polynomial.getGCDOfTermDegrees();
  if (g > 1) {
    const v = toRadicalExpression(root._pow(g));
    if (v != null) {
      const vg = Expression.NthRoot.makeRoot(v, g);
      return g % 2 === 1 || root.sign() > 0 ? vg : new Expression.Negation(vg);
    }
  }
  // convert to depressed:
  var h = polynomialRoot.polynomial._getShiftToDepressed();
  if (!h.equals(Expression.ZERO)) {
    var tmp = toRadicalExpression(root.translate(h));
    if (tmp != null) {
      return new Expression.Addition(tmp, h.negate());
    }
  }
  return null;
};

ExpressionPolynomialRoot.prototype.toString = function (options) {
  //return new ExpressionWithPolynomialRoot(this, this).toString(options);
  options = options || {};
  if (options.rounding == null) {
    var p = this.root.getAlpha().polynomial;
    if (p.getDegree() / p.getGCDOfTermDegrees() < 10 && LazyPolynomialRoot._isSimpleForUpgrade(this.root.getAlphaExpression(), new Expression.Symbol('α'))) { //TODO: REMOVE !!!
      var re = toRadicalExpression(this.root);
      if (re != null) {
        return re.toString(options);
      }
    }
  }
  return toDecimalStringInternal(this, options.rounding || {fractionDigits: 3});
};
ExpressionPolynomialRoot.prototype.equals = function (other) {
  if (other instanceof ExpressionPolynomialRoot) {
    return this.root.equals(other.root);
  }
  // optimization
  if (other instanceof Expression.Integer) {
    if (other.equals(Expression.ZERO)) {
      return false;
    }
  }
  if (!Expression.isRealAlgebraicNumber(other)) {//to avoid bugs with i**n
    return false;
  }
  /*if (Expression.isConstant(other)) {
    if (!this.root.polynomial.calcAt(other).equals(Expression.ZERO)) {
      return false;
    }
    var withinInterval = function (x, interval) {
      return Expression._isPositive(x.subtract(interval.a)) && Expression._isPositive(x.subtract(interval.b).negate());
    };
    return withinInterval(other, this.interval);
  }*/
  //TODO: optimize
  return this.subtract(other).equals(Expression.ZERO);
};
ExpressionPolynomialRoot.prototype.compare4MultiplicationComplex = function (x) {
  return -1;
  //return +1;
};
ExpressionPolynomialRoot.prototype.compare4MultiplicationNthRoot = function (x) {
  return 0;
};
ExpressionPolynomialRoot.prototype.compare4Multiplication = function (y) {
  if (y instanceof Expression.Complex) {
    return +1;
    //return -1;
  }
  if (y instanceof Expression.Integer) {
    return +1;
  }
  if (y instanceof ExpressionPolynomialRoot) {
    return 0;
  }
  if (y instanceof Expression.NthRoot) {
    return 0;//?
  }
  if (y instanceof Expression.Symbol) {
    return -1;
  }
  return Expression.Symbol.prototype.compare4Multiplication.call(this, y);
};
ExpressionPolynomialRoot.prototype.compare4MultiplicationSymbol = function (x) {
  return +1;
};
ExpressionPolynomialRoot.prototype.compare4Addition = function (y) {
  if (y instanceof ExpressionPolynomialRoot) {
    return 0;//?
  }
  if (y instanceof Expression.Symbol) {
    return +1;
  }
  if (y instanceof Expression.NthRoot) {
    return 0;//?
  }
  if (Expression.isRealAlgebraicNumber(y)) {
    return 0;//?
  }
  return Expression.Symbol.prototype.compare4Addition.call(this, y);
};
ExpressionPolynomialRoot.prototype.compare4AdditionSymbol = function (x) {
  return -1;
};
ExpressionPolynomialRoot.prototype.compare4AdditionNthRoot = function (x) {
  return 0;
};

ExpressionPolynomialRoot.prototype._nthRoot = function (n) {//?
  if (this.root.sign() < 0 && n % 2 === 0) {
    if (n !== 2) {
      throw new RangeError("NotSupportedError");
    }
    //TODO: check
    return Expression.I.multiply(this.negate()._nthRoot(n));
  }
  return new ExpressionPolynomialRoot(this.root._nthRoot(n));
};

ExpressionPolynomialRoot.prototype.upgrade = function () {
  return new ExpressionPolynomialRoot(this.root.upgrade());//TODO: ?
};

ExpressionPolynomialRoot.prototype.isNegative = function () {
  return this.root.sign() < 0;
};

Expression.prototype.upgrade = function () { //TODO: remove !!!
  return this;
};

ExpressionPolynomialRoot.prototype.isExact = function () {
  //TODO: fix - ?
  return false;
};

ExpressionPolynomialRoot.prototype.negate = function () {
  return new ExpressionPolynomialRoot(this.root.negate()); // for performance
};

ExpressionPolynomialRoot.prototype.simplifyExpression = function () {//TODO: remove - ?
  return this;
};

ExpressionPolynomialRoot.prototype.toMathML = function (options) {
  options = options || {};
  if (options.rounding == null) {
    var p = this.root.getAlpha().polynomial;
    if (p.getDegree() / p.getGCDOfTermDegrees() < 10 && LazyPolynomialRoot._isSimpleForUpgrade(this.root.getAlphaExpression(), new Expression.Symbol('α'))) { //TODO: REMOVE !!!
      var re = toRadicalExpression(this.root);
      if (re != null) {
        return re.toMathML(options);
      }
    }
  }
  return toDecimalStringInternal(this, options.rounding || {fractionDigits: 3}, Expression._decimalToMathML, Expression._complexToMathML);
};

//TODO: ?????
ExpressionPolynomialRoot.prototype.getPrecedence = function () {
  //TODO: avoid (?)
  if (true) {
    var p = this.root.getAlpha().polynomial;
    if (p.getDegree() / p.getGCDOfTermDegrees() < 10 && LazyPolynomialRoot._isSimpleForUpgrade(this.root.getAlphaExpression(), new Expression.Symbol('α'))) { //TODO: REMOVE !!!
      var re = toRadicalExpression(this.root);
      if (re != null) {
        return re.getPrecedence();
      }
    }
  }
  return 1000;
};
ExpressionPolynomialRoot.prototype.isRightToLeftAssociative = function () {
  return true;
};
ExpressionPolynomialRoot.prototype.isUnaryPlusMinus = function () {
  return true;//TODO: !?
};

//ExpressionPolynomialRoot.prototype.complexConjugate = function () {//TODO: test
//  return this;
//};

ExpressionPolynomialRoot.prototype._calc = function (polynomial) {
  return new ExpressionPolynomialRoot(this.root._calc(polynomial));
};

Expression.ExpressionPolynomialRoot = ExpressionPolynomialRoot;

Expression.toPolynomialRoot = function (e) {
  var x = e instanceof Expression.NthRoot ? e.a : e;//TODO: remove
  var n = e instanceof Expression.NthRoot ? e.n : 1;//TODO: remove
  var symbol = new Expression.Symbol('x');
  if (!(x.getDenominator() instanceof Expression.Integer)) {
    throw new TypeError();
  }
  var p = Polynomial.toPolynomial(Expression.getConjugateExpression(symbol._pow(n).subtract(x).getNumerator()), symbol);
  //TODO: remove:
  if (p.getDegree() <= 8 && (true || isSmall(p))) {//TODO: ?
    var factor = p.factorize();
    if (factor != null && factor.getDegree() < p.getDegree() && factor.getDegree() === 4) {//?
      var roots = Polynomial.polynomialGCD(factor, Polynomial.toPolynomial(symbol._pow(n).subtract(x), symbol)).getroots();
      for (const root of roots) {
        if (root._pow(n).equals(x)) {
          //debugger;
          return Expression._isPositive(root) || n % 2 !== 0 ? root : root.negate();
        }
      }
    }
  }
  while (p.getDegree() > 0) {
    //var root = Expression.toPolynomialRoot(x)._nthRoot(n);
    
    //TODO: Expression#toPolynomialRoot() - ?
    //TODO: move up (!?)
    //p = p.squareFreeFactors().a1;//TODO: which one (?)
    var factor = p.factorize() || p;
    const isComplex = n === 2 && Expression.has(e.radicand, Expression.Complex);
    var zeros = factor.getZeros(isComplex);
    if (n % 2 === 0 && zeros.length === 2) {
      //TODO: remove
      if (Expression._isPositive(zeros[1]) && Expression._isPositive(x)) {
        return zeros[1];
      }
    }
    //TODO: find zero only on interval
    for (var zero of zeros) {
      if (zero.root != null && Expression._isPositive(zero) || isComplex && Expression._isPositive(Expression.getComplexNumberParts(zero).real)) {
        if (zero._pow(n).equals(x)) {
          return zero;
        }
      }
    }
    //TODO: ?
    p = p.divideAndRemainder(factor, "throw");
  }
  console.error(e.toString());
  return undefined;
};



  Polynomial.prototype.signVariations = function () {
    let result = 0;
    let sign = 0;
    for (let i = this.a.size - 1; i >= 0; i -= 1) {
      const s = this.a.coefficient(i).sign();
      if (s !== 0) {
        if (sign === 0) {
          sign = s;
        } else {
          if (sign !== s) {
            sign = s;
            result += 1;
          }
        }
      }
    }
    return result;
  };

  Polynomial.prototype._getNonNegativeRealRootIntervals = function () {
    // The polynomial should be square free, the check is commented out for performance
    //if (!this.isSquareFreePolynomial()) {
    //  throw new RangeError();
    //}
    // https://en.wikipedia.org/wiki/Real-root_isolation#Pseudocode
    const B = this.getPositiveRealRootsBound();
    if (B.equals(Expression.ZERO)) {
      return [];
    }
    // https://en.wikipedia.org/wiki/Real-root_isolation#Bisection_method
    const p = this._scaleRoots(B.inverse()); // map [0; B] to [0; 1]
    const maxPositiveRealRoots = (this.getCoefficient(0).equals(Expression.ZERO) ? 1 : 0) + this.signVariations();
    const L = function (a, b, q) { // get root intervals of q on [0; 1]
      const zero = q.getCoefficient(0).equals(Expression.ZERO);
      const newQ = zero ? q.divideAndRemainder(Polynomial.of(Expression.ZERO, Expression.ONE), "throw").quotient : q;
      const qq = newQ._exponentiateRoots(-1)._translateRoots(Expression.ONE.negate());
      //TODO: what is wrong with Wikipedia - ?
      let v = qq.signVariations();
      if (v === 1 && zero) {
        v = 0/0;//!?
      }
      if (v === 0 && zero) {
        return [{a: a, b: a}];
      }
      if (v === 1 && qq.getCoefficient(0).equals(Expression.ZERO)) {
        v = 0/0;//!?
      }
      if (v === 1) {
        return [{a: a, b: b}];
      } else if (v !== 0) {
        var firstQ = q._scaleRoots(Expression.TWO);
        var middle = a.add(b).divide(Expression.TWO);
        var first = L(a, middle, firstQ);
        if (first.length >= maxPositiveRealRoots) {
          return first;//!
        }
        var secondQ = firstQ._translateRoots(Expression.ONE.negate());
        var second = L(middle, b, secondQ);
        return first.concat(second);
      }
      return [];
    };
    return L(Expression.ZERO, Expression.ONE, p).map(entry => ({a: entry.a.multiply(B), b: entry.b.multiply(B)}));
  };

  Polynomial.prototype.getRootIntervals = function () {
    return this._scaleRoots(Expression.ONE.negate())._getNonNegativeRealRootIntervals().map(entry => ({a: entry.b.negate(), b: entry.a.negate()})).reverse().concat(this._getNonNegativeRealRootIntervals());
  };

  Polynomial.prototype.getPositiveRealRootsBound = function () {
    //TODO: only integer coefficients (?)
    // https://en.wikipedia.org/wiki/Sturm%27s_theorem#Number_of_real_roots
    // https://en.wikipedia.org/wiki/Geometrical_properties_of_polynomial_roots#Bounds_of_positive_real_roots
    let M = null;
    //TODO: fix the iteration
    const n = this.getDegree();
    const an = this.getLeadingCoefficient();
    for (let i = 0; i <= this.getDegree() - 1; i += 1) {
      const v = this.getCoefficient(i).negate().truncatingDivide(an);
      if (v.sign() >= 0) {
        const c = Expression.TWO.multiply(v._integerNthRoot(n - i).add(Expression.ONE));
        if (M == null || M.compareTo(c) < 0) {
          M = c;
        }
      }
    }
    if (M == null) {
      return Expression.ZERO;
    }
    //!2020-12-19
    // round to a power of two:
    M = Expression.TWO._pow(M.getNumerator().bitLength() - M.getDenominator().bitLength() + 1);
    //!
    return M;
  };

  //TODO: BigDecimal - ?, rounding - ?
  Polynomial.prototype.getZero = function (interval, precision) {
    var floorDiv = function (a, b) {
      if (b.compareTo(Expression.ZERO) < 0) {
        a = a.negate();
        b = b.negate();
      }
      return a.compareTo(Expression.ZERO) >= 0 ? a.truncatingDivide(b) : a.add(Expression.ONE).truncatingDivide(b).subtract(Expression.ONE);
    };
    var roundFloor = function (point, e) {
      var n = point.getNumerator().multiply(e);
      var d = point.getDenominator();
      return floorDiv(n, d);
    };
    const sign = function (v) {
      return Math.sign(v.getNumerator().compareTo(Expression.ZERO));
    };
    //const BASE = Expression.TEN;
    const BASE = Expression.TWO;
    const e = Expression.pow(BASE, precision); // epsilon^-1
    if (!(e instanceof Expression.Integer)) {
      throw new RangeError("epsilon^-1 is not an integer");
    }
    var a = interval.a;
    var b = interval.b;
    // (b - a) * 10**precision > min(abs(a), abs(b))
    // (b - a) * 10**fractionDigits > 1
    //TODO: fix to use precision, not fractionDigits
    // e * (b - a) > 0:
    if (e.multiply(a.getDenominator().multiply(b.getNumerator()).subtract(b.getDenominator().multiply(a.getNumerator()))).compareTo(b.getDenominator().multiply(a.getDenominator())) > 0) {
      //TODO:
      var tmp = true && precision >= 16 / Math.log10(BASE.toNumber()) ? this.getZero(interval, Math.floor(precision / 4)) : interval;
      a = tmp.a;
      b = tmp.b;

      var n = this.getDegree();
      var p = this._scaleRoots(e);
      p = p.primitivePart();//?
      const sa = roundFloor(a, e).add(Expression.ONE); // a.getNumerator().multiply(e).truncatingDivide(a.getDenominator()).add(Expression.ONE);//?
      const sb = roundFloor(b, e); // b.getNumerator().multiply(e).truncatingDivide(b.getDenominator());//?
      console.assert(sa.multiply(a.getDenominator()).subtract(a.getNumerator().multiply(e)).compareTo(Expression.ZERO) >= 0); // sa/e >= a
      console.assert(sb.multiply(b.getDenominator()).subtract(b.getNumerator().multiply(e)).compareTo(Expression.ZERO) <= 0); // sb/e <= b
      //TODO: bigdecimal - ?
      // remember values at boundaries to reuse in the loop:
      let pa = p.calcAt(sa);
      let pb = p.calcAt(sb);
      const spb = sign(pb);
      const spa = sign(pa);
      if (spa === 0) {
        return {a: sa.divide(e), b: sa.divide(e)};
      }
      if (spb === 0) {
        return {a: sb.divide(e), b: sb.divide(e)};
      }
      if (spa === spb) {
        if (spa !== (sign(this.calcAt(a)) || sign(this.calcAt(b).negate()) || spa)) {
          return {a: a, b: sa.divide(e)};
        }
        if (spb !== sign(this.calcAt(b))) {
          return {a: sb.divide(e), b: b};
        }
        throw new RangeError();//?
      }
      a = sa;
      b = sb;
      // bisection method
      var cc = 0;
      var d = p.derive();
      var width = b.subtract(a);
      while (width.compareTo(Expression.ONE) > 0) {// b - a > 1
        var middle = a.add(width.truncatingDivide(Expression.TWO));
        //console.log(eval(a.divide(e).toString()) + ' - ' + eval(b.divide(e).toString()));
        //?
        if (cc % 3 !== 2 && width.compareTo(a.abs()) < 0) {// TODO: test for the case when a < 0
          // TODO: better guesses
          // Newton's method
          var x = cc % 3 === 1 ? a : b;
          var px = x === a ? pa : (x === b ? pb : undefined);
          var c = d.calcAt(x);
          if (!c.equals(Expression.ZERO)) {
            x = x.subtract(px.truncatingDivide(c));
            if (x.compareTo(a) <= 0) {
              x = a.add(Expression.ONE);
            }
            if (x.compareTo(b) >= 0) {
              x = b.subtract(Expression.ONE);
            }
            //console.log("N: " + a + "  - " + x);
            middle = x;
          }
        }
        cc += 1;
        //?
        var v = p.calcAt(middle);
        var sv = sign(v);
        if (sv === spb) {
          b = middle;
          pb = v;
        } else if (sv === spa) {
          a = middle;
          pa = v;
        } else {
          a = middle;
          b = middle;
          pa = v;
          pb = v;
        }
        width = b.subtract(a);
      }
      //console.debug(cc);
      a = a.divide(e);
      b = b.divide(e);
    }
    return {a: a, b: b};
  };

  Polynomial.prototype.hasRoot = function (polynomialRoot) {
    var f = this;
    if (f.equals(Polynomial.ZERO)) {
      return true;
    }
    //!new 2021-02-20 (TODO: CHECK)
    if (!f.hasIntegerCoefficients() && f.hasComplexCoefficients()) {
      return f.map(c => c instanceof Expression.Integer ? c : c.real).hasRoot(polynomialRoot) && f.map(c => c instanceof Expression.Integer ? Expression.ZERO : c.imaginary).hasRoot(polynomialRoot);
    }
    //!
    
    if (!f.hasIntegerCoefficients() &&
        !f.hasComplexCoefficients() &&
        !f._testCoefficients(c => !Expression.has(c, Expression.Complex)) &&
        f._testCoefficients(c => Expression.isConstant(c))) { // x-i^n
      return f.map(c => Expression.getComplexNumberParts(c).real).hasRoot(polynomialRoot) &&
             f.map(c => Expression.getComplexNumberParts(c).imaginary).hasRoot(polynomialRoot);
    }

    var p = polynomialRoot.polynomial;
    var g = null;
    //!
    if (!f.hasIntegerCoefficients()) {
      var variable = new Expression.Symbol('~');
      var ff = f.calcAt(variable);
      var tmp = Expression.getMultivariatePolynomial(ff);
      if (tmp != null && !tmp.v.equals(variable) && tmp.v instanceof Expression.Symbol) {
        g = Polynomial.polynomialGCD(Polynomial.toPolynomial(tmp.p.getContent(), variable), p);
      }
    }
    if (g == null) {
      g = Polynomial.polynomialGCD(f, p);
    }
    //!
    if (g.getDegree() < 1) {
      return false;
    }
    var i = polynomialRoot.interval;

    if (!g.hasIntegerCoefficients()) {
      //TODO: BUG?
      //?new
      var variable = new Expression.Symbol('$$');
      var e = g.calcAt(variable);
      var c = Expression.getComplexNumberParts(e);
      if (c != null && !c.imaginary.equals(Expression.ZERO)) {
        g = Polynomial.toPolynomial(c.real.subtract(c.imaginary.multiply(Expression.I)).multiply(e), variable).getSquareFreePolynomial();
      }
      //?
    }

    // https://en.wikipedia.org/wiki/Budan%27s_theorem#Budan's_statement
    // as we used gcd the number of roots should be <= 0 on this interval for g and so:
    var n = g._translateRoots(i.a.negate()).signVariations() - g._translateRoots(i.b.negate()).signVariations();
    return n % 2 === 1;
    //return g.numberOfRoots(i) === 1;
  };

  // get number of distinct roots on the closed interval [a, b]
  Polynomial.prototype.numberOfRoots = function (interval = null) {
    if (!this.hasIntegerCoefficients()) {
      //debugger;
      //return this.numberOfRoots3(interval);
      throw new RangeError();
    }
    if (interval == null) {
      interval = {a: this._scaleRoots(Expression.ONE.negate()).getPositiveRealRootsBound().negate(), b: this.getPositiveRealRootsBound()};
    }
    var p = this;
    if (!interval.a.equals(Expression.ZERO)) {
      p = p._scaleRoots(interval.a.inverse())
           ._translateRoots(Expression.ONE.negate());
      interval = {
        a: Expression.ZERO,
        b: interval.b.divide(interval.a).subtract(Expression.ONE)
      };
      if (interval.b.getNumerator().sign() < 0) {
        interval = {a: interval.a, b: interval.b.negate()};
        p = p._scaleRoots(Expression.ONE.negate());
      }
    }
    console.assert(interval.a.equals(Expression.ZERO));
    var zeros = 0;
    while (p.getCoefficient(zeros).equals(Expression.ZERO)) {
      zeros += 1;
    }
    if (zeros > 1) {
      throw new RangeError();
    }
    if (zeros > 0) {
      p = p.divideAndRemainder(Polynomial.of(Expression.ONE).shift(zeros), "throw").quotient;
    }
    return (zeros > 0 ? 1 : 0) + 
           p._exponentiateRoots(-1)
            ._scaleRoots(interval.b)
            ._translateRoots(Expression.ONE.negate())
            ._getNonNegativeRealRootIntervals().length;
  };

  // Polynomial.toPolynomial(ExpressionParser.parse("x^3-8x^2+21x-18"), ExpressionParser.parse("x")).getZeros().toString()
  Polynomial.prototype.getZeros = function (complex = false) {
    if (this.getCoefficient(0).equals(Expression.ZERO)) {
      if (this.getLeadingCoefficient().equals(Expression.ZERO)) {
        throw new TypeError();
      }
      var i = 0;
      while (this.getCoefficient(i).equals(Expression.ZERO)) {
        i += 1;
      }
      var tmp = this.divideAndRemainder(Polynomial.of(Expression.ONE).shift(i)).quotient.getZeros(complex);
      return tmp.concat(new Array(i).fill(Expression.ZERO));
    }
    //TODO: test
    var content = this.getContent();
    var f = this.scale(content.getDenominator()).divideAndRemainder(Polynomial.of(content.getNumerator()), "throw").quotient;

    // https://en.wikipedia.org/wiki/Square-free_polynomial
    var tmp = f.squareFreeFactors();
    var a0 = tmp.a0;
    var a1 = tmp.a1;

    if (a0.getDegree() !== 0) {
      var tmp1 = a1.getZeros(complex); // roots with multiplicity = 1 (?)
      var tmp2 = a0.getZeros(complex);
      var result = [];
      var previous = undefined;
      for (var i = 0; i < tmp2.length; i += 1) {
        var zero = tmp2[i];
        if (zero !== previous) {
          result.push(zero);
          previous = zero;
        }
        result.push(zero);
      }
      return tmp1.concat(result);
    }

    var p = f;
    if (p.getDegree() === 0) {
      return [];
    }

    //!
    p = p.scale(p.getContent().inverse());
    //!

    if (!f.hasIntegerCoefficients()) {
      
      var toPolynomialWithIntegerCoefficients = function (polynomial) {
        if (!polynomial.hasIntegerCoefficients()) {
          var variable = new Expression.Symbol('$$');
          var e = polynomial.calcAt(variable);
          var c = Expression.getConjugateExpression(e);
          if (c != null && !c.equals(e)) {
            //TODO: what if multiple (?) - ?
            return Polynomial.toPolynomial(c, variable);
          }
          
          //!new 2022-08-28
          // p_1(x, alpha) = 0
          // p_2(alpha) = 0
          // Res_alpha(p_1, p_2) = 0
          var root = null;
          for (var i = 0; i < polynomial.getDegree(); i += 1) {
            var c = polynomial.getCoefficient(i);
            if (c instanceof Expression.ExpressionPolynomialRoot) {
              debugger;
              var alpha = c.root.upgrade().getAlpha();
              var v = new Expression.Symbol("$a");
              var p_1 = Polynomial.toPolynomial(polynomial.map(cc => cc === c ? v : cc).calcAt(new Expression.Symbol('$$')), v);
              var p_2 = alpha.polynomial;
              var res = Polynomial.toPolynomial(Polynomial.resultant(p_1, p_2), new Expression.Symbol("$$")).primitivePart();
              return toPolynomialWithIntegerCoefficients(res);
            }
          }
        }
        return polynomial;
      };

      //?new
      const f1 = toPolynomialWithIntegerCoefficients(f);
      if (!f1.equals(f)) {
        var result = [];
        var tmp = f1.getZeros(complex);
        console.time('checking roots');
        //TODO: do not check conjugate pairs (?) when polynomial has no integer factor
        for (var i = 0; i < tmp.length; i += 1) {
          var zero = tmp[i];
          if (zero instanceof ExpressionPolynomialRoot && zero.root.getAlphaExpression().equals(new Expression.Symbol('α')) ? f.hasRoot(zero.root.getAlpha()) :
              zero instanceof ExpressionWithPolynomialRoot && zero.e === zero.root ? f.hasRoot(zero.root) :
              (zero instanceof ExpressionWithPolynomialRoot ? zero._calc(f) : f.calcAt(zero)).equals(Expression.ZERO)) {
            result.push(zero);
          } else {
            //TODO:?
            console.debug(zero.root);
          }
        }
        console.timeEnd('checking roots');
        return result;
      }
      //!new
      // u * x + v = t
      // u**n*x**n = a_n*x**n, u = a_n**(1/n)
      // u**(n-1)*x**(n-1)*v*n+u**(n-1)*x**(n-1) = a_(n-1)*x**(n-1)
      var u = Polynomial.of(Expression.ONE).shift(f.getDegree()).subtract(Polynomial.of(f.getLeadingCoefficient())).getroots();
      if (u.length !== 0) {
        u = u[0];
        var v = f.getCoefficient(f.getDegree() - 1).divide(u._pow(f.getDegree() - 1)).subtract(Expression.ZERO).divide(Expression.Integer.fromNumber(f.getDegree()));
        var x = new Expression.Symbol('$$');//?
        var pt = Polynomial.toPolynomial(p.calcAt(x.subtract(v).divide(u)).getNumerator(), x);
        if (pt.hasIntegerCoefficients()) {//TODO: ?
          return pt.getZeros(complex).map(function (zero) {
            return zero.subtract(v).divide(u);
          });
        }
      }
      //!
      //?
      console.debug('not all roots were found!!!');
      return [];
    }

    //!new
    if (p.getDegree() === 3) {
      //?
    }
    //!

    // https://en.wikipedia.org/wiki/Sturm%27s_theorem
    var intervals = p.getRootIntervals();

    // https://math.stackexchange.com/questions/309178/polynomial-root-finding
    // "it is guaranteed that there is a sign change inside every interval (because there are no repeated zeroes)"
    var result = new Array(intervals.length);
    var enableNewClass = true;//TODO: ?
    for (var i = 0; i < intervals.length; i += 1) {
      var zero = p.getZero(intervals[i], 0);//TODO: !?
      if (zero.a.equals(zero.b)) {
        result[i] = zero.a;//TODO: fix
      } else {
        //! p, not f, as f may have roots with multiplicity > 1
        if (!enableNewClass) {
          var root = new Expression.PolynomialRootSymbol(p, zero);
          result[i] = new ExpressionWithPolynomialRoot(root, root);
        } else {
          //TODO: why skipFactorization if getZeros does not check for primitive polynomial
          const root = ExpressionPolynomialRoot.create(p, zero, {skipFactorization: true});
          //result[i] = new ExpressionWithPolynomialRoot(new Expression.Symbol('$α'), root);
          result[i] = root;
        }
      }
    }
    //return result;

    //!new
    //var p = np;
    if (intervals.length !== p.getDegree() && true && complex) {
      //!new
      if (p.getDegree() >= 4) {//?
        var factor = p.factorize();
        if (factor != null) {
          //TODO: remove double work
          return factor.getZeros(complex).concat(p.divideAndRemainder(factor, "throw").quotient.getZeros(complex));
        }
      }
      //!
      if (p.isEven()) {
        //debugger;
        const zeros = p._exponentiateRoots(2).getZeros(complex);
        for (var zero of zeros) {
          //var z = zero.squareRoot();
          // https://en.wikipedia.org/wiki/Complex_number#Square_root
          var squareRoot = function (z) {
            var tmp = Expression.getComplexNumberParts(z);
            var a = tmp.real;
            var b = tmp.imaginary;
            var aapbb = a._pow(2).add(b._pow(2)).squareRoot();
            var γ = a.add(aapbb).divide(Expression.TWO).squareRoot();
            var sign = (b.compareTo(Expression.ZERO) > 0 ? Expression.ONE : Expression.ONE.negate());
            var tmp = a.negate().add(aapbb).divide(Expression.TWO);
            //debugger;
            var δ = sign.multiply(tmp.squareRoot());
            return γ.add(δ.multiply(Expression.I));
          };
          //zero = zero instanceof ExpressionWithPolynomialRoot ? zero.upgrade() : zero;
          if (!Expression._isPositive(zero)) {
            var z = squareRoot(zero.e != null ? zero.upgrade() : zero);
            result.push(z);
            result.push(z.negate());
          }
        }
        return result;
      }
      //var p = stringToPolynomial("x^5+2*x^2+2*x+3");

      var e = p.calcAt(new Expression.Symbol("a").add(new Expression.Symbol("b").multiply(Expression.I)));
      var ce = Expression.getComplexNumberParts(e);
      const cpa = ce.real;//TODO: ?
      const cpb = ce.imaginary.divide(new Expression.Symbol('b'));
      const getZeros1 = function (p) {//TODO: !? use everywhere (?)
        var tmp = p.squareFreeFactors();
        if (tmp.a0.getDegree() !== 0) {
          return getZeros1(tmp.a0).concat(getZeros1(tmp.a1));
        }
        var factor = p.factorize();
        if (factor != null) {
          //TODO: remove double work
          //return factor.getZeros(false).concat(p.divideAndRemainder(factor, "throw").quotient.getZeros(false));
          var tmp = getZeros1(factor);
          var t = p.divideAndRemainder(factor, "throw").quotient;
          if (0 === t._getNonNegativeRealRootIntervals().length) {
            return tmp// do not call factorize as it is slow for large polynomials
          }
          return tmp.concat(getZeros1(t));
        }
        return p.getZeros(false);
      };

      //!TODO: 
      //!new 2021-01-03
      if (result.length < p.getDegree()) {
        //console.count('yyy');
        var resultant = function (v1, v2) {
          var A = Polynomial.toPolynomial(cpa, new Expression.Symbol(v1));
          var B = Polynomial.toPolynomial(cpb, new Expression.Symbol(v1));
          return Polynomial.toPolynomial(Polynomial.resultant(A, B), new Expression.Symbol(v2)).primitivePart();
        };
        var bCandidates = getZeros1(resultant('a', 'b'));
        bCandidates = bCandidates.filter(c => Expression._isPositive(c));//!?
        bCandidates = bCandidates.map(c => c instanceof ExpressionWithPolynomialRoot && c.root.polynomial.getDegree() / c.root.polynomial.getGCDOfTermDegrees() <= 2 ? c.upgrade() : c);//TODO: !?
        //!new
        if (true) {
          var A = Polynomial.toPolynomial(cpa, new Expression.Symbol('a')).map(c => Polynomial.toPolynomial(c, new Expression.Symbol('b')));
          var B = Polynomial.toPolynomial(cpb, new Expression.Symbol('a')).map(c => Polynomial.toPolynomial(c, new Expression.Symbol('b')));
          //var g0 = Polynomial.polynomialGCD(A, B);
          //console.log(g0.toString());
          var gp = undefined;
          var previousPolynomial = Polynomial.ZERO;//TODO: !?
          for (var b of bCandidates) {
            var g = null;
            //TODO: fix access to private properties (!!!)
            if ((!(b instanceof ExpressionWithPolynomialRoot) || !b.e.equals(b.root)) &&
                (!(b instanceof ExpressionPolynomialRoot) || !b.root.getAlphaExpression().equals(new Expression.Symbol('α')))) { //TODO: ?
              var A1 = A.map(c => c.calcAt(b));
              var B1 = B.map(c => c.calcAt(b));
              g = Polynomial.polynomialGCD(A1, B1);
            } else {
              const bRootPolynomial = (b instanceof ExpressionPolynomialRoot ? b.root.upgrade().getAlpha() : b.root).polynomial;
              if (!previousPolynomial.equals(bRootPolynomial)) {
                gp = polynomialGCDModuloPolynomial(A, B, bRootPolynomial);
                gp = gp.map(c => c.polynomial);
                previousPolynomial = bRootPolynomial;
              }
              //g = gp.map(c => c.calcAt(b));
              g = gp.map(c => b._calc(c));
              
              //debugger;
              //var res = Polynomial.toPolynomial(Polynomial.resultant(gp.map(c => new Expression.Polynomial(c)).calcAt(new Expression.Polynomial(Polynomial.of(RPN('a')))).polynomial.primitivePart(), bRootPolynomial), new Expression.Symbol("a")).primitivePart();
              //res.getZeros();
              //console.log(res.getDegree(), A.getDegree(), B.getDegree());
            }
            //TODO: g.getDegree() > 1 is possible (!!!)
            if (g.getDegree() >= 3) {
              console.log('g!!!', g.toString());
              var polynomial0 = this;
              window.setTimeout(function () {
                throw new TypeError("good test: " + polynomial0.toString());
              }, 0);
            }
            const getroots0 = function (np) {//TODO: REMOVE (g.getroots()) can be too slow
              var p = np.getCoefficient(1).divide(np.getCoefficient(2));
              var q = np.getCoefficient(0).divide(np.getCoefficient(2));
              var pOver2Negate = p.divide(Expression.TWO).negate();
              var sD = pOver2Negate._pow(2).subtract(q).squareRoot();
              var x1 = pOver2Negate.subtract(sD);
              var x2 = pOver2Negate.add(sD);
              return [x1, x2];
            };
            if (g.getDegree() <= 2) {
              //const roots = g.getroots();
              const roots = g.getDegree() === 2 ? getroots0(g) : g.getroots();
              for (var a of roots) {
                if (!Expression.has(a, Expression.Complex)) {
                  var candidate = a.add(b.multiply(Expression.I));
                  result.push(candidate);
                  result.push(candidate.complexConjugate());
                }
              }
            } else {
              //debugger;
              //TODO: ?
            }
          }
        }
        
        if (result.length < p.getDegree()) {
          //debugger;
          result = result.filter(root => Expression.isReal(root));
        var aCandidates = getZeros1(resultant('b', 'a'));
          
        //!
        //console.log(bCandidates.map(x =>  typeof x.upgrade === 'function' ?  x.upgrade() : x).toString());
        //console.log(aCandidates.map(x =>  typeof x.upgrade === 'function' ?  x.upgrade() : x).toString());
        // https://en.wikipedia.org/wiki/Resultant#Application_to_polynomial_systems
        //debugger;
        for (var a of aCandidates) {
          for (var b of bCandidates) {
            var candidate = a.add(b.multiply(Expression.I));
            if (p.calcAt(candidate).equals(Expression.ZERO)) {
              result.push(candidate);
              result.push(candidate.complexConjugate());
            }
          }
        }
        
        }
      }
    }
    //!

    return result;
  };

function pseudoRemainderSequence(A, B, type = "primitive", produceSturmSequence = false) {
  let g = Math.gcd(A.getGCDOfTermDegrees(), B.getGCDOfTermDegrees());
  if (g > 1) {
    console.error('g > 1');
  }
  let first = true;
  let phi = Expression.ONE;
  var iterator = {
    next: function () {
      console.assert(A.getDegree() >= B.getDegree());
      if (!B.equals(Polynomial.ZERO)) {
        const d = A.getDegree() - B.getDegree();
        const scale = B.getLeadingCoefficient()._pow(d + 1);
        const tmp = A.scale(produceSturmSequence ? scale.abs() : scale).divideAndRemainder(B, B._hasIntegerLikeCoefficients() ? "throw" : undefined);
        const q = tmp.quotient;
        const r = tmp.remainder;
        let α = Expression.ONE;
        if (type === "trivial") {
          // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#Trivial_pseudo-remainder_sequence
          α = Expression.ONE;
        } else if (type === "primitive") {
          // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#Primitive_pseudo-remainder_sequence
          α = r.getContent();
        } else if (type === "subresultant") {
          // For the explanation and proof see Donald E. Knuth The Art of computer programming Third Edition, Volume 2 (Seminumerical algorithms), page 428.
          // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#Subresultant_pseudo-remainder_sequence
          α = first ? Expression.ONE : A.getLeadingCoefficient().multiply(phi._pow(d));
          first = false;
          phi = d === 0 ? phi : B.getLeadingCoefficient()._pow(d).divide(phi._pow(d).divide(phi));
        } else {
          throw new RangeError(type);
        }
        //const R = r.divideAndRemainder(Polynomial.of(produceSturmSequence ? α.abs().negate() : α), "throw").quotient;
        const R = r.map(c => c.divide(produceSturmSequence ? α.abs().negate() : α));
        const value = {R: R, q: q, α: α};
        A = B;
        B = R;
        return {value: value, done: false};
      }
      return {value: undefined, done: true};
    }
  };
  iterator[globalThis.Symbol.iterator] = function () {
    return this;
  };
  return iterator;
}

Polynomial._pseudoRemainderSequence = pseudoRemainderSequence;

Polynomial._resultantUsingSubresultantPseudoRemainderSequence = function (A, B) {
  function toMultivariatePolynomial(p1, p2) {
    if (p1.getLeadingCoefficient() instanceof Expression.Polynomial ||
        p2.getLeadingCoefficient() instanceof Expression.Polynomial) {
      return {variables: [], A: p1, B: p2};//TODO: fix !!!
    }
    var set = {};
    var variables = [];
    var v = function (e) {
      for (var s of e.summands()) {
        for (var f of s.factors()) {
          if (f instanceof Expression.Exponentiation) {
            f = f.a;//TODO: !
          }
          if (f instanceof Expression.Symbol && Object.getPrototypeOf(f) === Expression.Symbol.prototype) {//TODO: !?
            if (set[f.symbol] == undefined) {
              variables.push(f);
              set[f.symbol] = true;
            }
          }
        }
      }
    };
    for (var i = 0; i < p1.a.size; i += 1) {
      v(p1.a.coefficient(i));
    }
    for (var i = 0; i < p2.a.size; i += 1) {
      v(p2.a.coefficient(i));
    }
    //debugger;
    var f = function (p, index) {
      if (index === variables.length) {
        console.assert(p.hasIntegerCoefficients());
        return p;
      }
      var v = variables[index];
      return p.map(c => new Expression.Polynomial(f(Polynomial.toPolynomial(c, v), index + 1)));
    };
    return {variables: variables, A: f(p1, 0), B: f(p2, 0)};
  }
  function toExpression(variables, p) {
    if (p.equals(Expression.ZERO)) {
      return p;//!?
    }
    if (variables.length === 0) {
      return p;
    }
    return p.polynomial.map(c => toExpression(variables.slice(1), c)).calcAt(variables[0]);
  }
  if (A.getDegree() === Polynomial.ZERO.getDegree() || B.getDegree() === Polynomial.ZERO.getDegree()) {
    return Expression.ZERO;
  }
  var g = Math.gcd(A.getGCDOfTermDegrees(), B.getGCDOfTermDegrees());
  if (g > 1) {
    // why is this true?
    var tmp = Polynomial._resultantUsingSubresultantPseudoRemainderSequence(A._exponentiateRoots(g), B._exponentiateRoots(g));
    //TODO: ?
    return tmp._pow(g);
  }
  var tmp1 = toMultivariatePolynomial(A, B);
  A = tmp1.A;
  B = tmp1.B;
  var AA = A;
  var BB = B;
  var start = Date.now();
  var resultantSign = 1;
  if (A.getDegree() < B.getDegree()) {
    const tmp = A;
    A = B;
    B = tmp;
    resultantSign *= Math.pow(Math.pow(-1, A.getDegree()), B.getDegree()); // https://en.wikipedia.org/wiki/Resultant#Characterizing_properties
  }
  const resultant2 = [];
  var isPseudoRemainderSequence = true;
  // https://en.wikipedia.org/wiki/Resultant#Invariance_under_change_of_polynomials
  for (var tmp of Polynomial._pseudoRemainderSequence(A, B, "subresultant")) {
    var R = tmp.R;
    var α = tmp.α;
    // Seems, all the properties can be seen when looking what happens with the determinant:
    if (B.getDegree() > 0) {
      if (R.getDegree() < 0) {
        while (resultant2.length > 0) {
          resultant2.pop();
        }
        resultant2.push({base: Expression.ZERO, exponent: 1});
      } else {
        if (!α.equals(Expression.ONE)) {
          if (resultant2.length > 0) {
            const previous = resultant2.pop();
            resultant2.push({base: previous.base, exponent: previous.exponent + 2 * B.getDegree()});
            resultant2.push({base: α.divide(previous.base._pow(2)), exponent: B.getDegree()});
          } else {
            resultant2.push({base: α, exponent: B.getDegree()});
          }
        }
        resultant2.push({base: B.getLeadingCoefficient(), exponent: (A.getDegree() - R.getDegree()) - (isPseudoRemainderSequence ? B.getDegree() * (A.getDegree() - B.getDegree() + 1) : 0)});
        resultantSign *= Math.pow(Math.pow(-1, A.getDegree()), B.getDegree()); // https://en.wikipedia.org/wiki/Resultant#Characterizing_properties
      }
    } else {
      console.assert(B.getDegree() === 0 && R.getDegree() < 0);
      resultant2.push({base: B.getLeadingCoefficient(), exponent: A.getDegree()});
    }
    A = B;
    B = R;
  }
  let resultant = resultantSign === -1 ? Expression.ONE.negate() : Expression.ONE;
  for (const x of resultant2) {
    if (x.exponent < 0) {
      resultant = resultant.divide(x.base._pow(-x.exponent));
    } else if (x.exponent > 0) {
      resultant = resultant.multiply(x.base._pow(x.exponent));
    }
  }
  var end = Date.now();
  if (end - start > 250) {
    console.log(end - start, AA.toString(), BB.toString());
  }
  resultant = toExpression(tmp1.variables, resultant);
  return resultant;
};

Expression._FIELD = {
  ONE: Expression.ONE,
  sub: function (a, b) { return a.subtract(b); },
  mul: function (a, b) { return a.multiply(b); },
  div: function (a, b) { return a.divide(b); },
  scale: function (a, s) { return a.multiply(Expression.Integer.fromBigInt(s)); }
};

Polynomial.resultant = function (p, q) {
  //TODO: do not multiply
  //return Polynomial._resultantByModularAlgorithm(p, q);
  return Polynomial._resultantUsingSubresultantPseudoRemainderSequence(p, q);
};



//TODO: remove (use Polynomial#_scaleRoots, Polynomial#_exponentiateRoots, Polynomial#_translateRoots instead)
//Polynomial.prototype.subs = function (variableMapFunction) {
//  var variable = new Expression.Symbol('$x');//TODO:
//  return Polynomial.toPolynomial(this.calcAt(variableMapFunction(variable)).getNumerator(), variable);
//};

function GramSchmidtOrthogonalization(vectors) {
  if (false) {
    //TODO: remove (?)
    const V = vectors;
    const n = V[0].dimensions();
    const k = V.length;
    const U = new Array(k).fill(null).map(x => new Matrix.Vector(new Array(n).fill(Expression.ZERO)));;
    U[0] = V[0];
    for (let i = 1; i < k; i += 1) {
        U[i] = V[i];
        for (let j = 0; j < i; j += 1) {
            U[i] = U[i].subtract(U[j].scale(U[i].dot(U[j]).divide(U[j].dot(U[j]))));
        }
    }
    return U;
  }
  // https://en.wikipedia.org/wiki/Gram%E2%80%93Schmidt_process#Via_Gaussian_elimination
  var rowVectorsMatrix = Matrix.fromVectors(vectors).transpose();
  var A = rowVectorsMatrix;
  var matrix = A.multiply(A.conjugateTranspose()).augment(A).toRowEchelon(Matrix.Gauss, "row-reduction").matrix;
  var tmp = matrix.slice(0, matrix.rows(), A.rows(), matrix.cols());
  var result = new Array(tmp.rows());
  for (var i = 0; i < tmp.rows(); i += 1) {
    result[i] = tmp.row(i);
  }
  return result;
}

globalThis.GramSchmidtOrthogonalization = GramSchmidtOrthogonalization;

Expression.Complex.prototype.abs = function () {
  // https://en.wikipedia.org/wiki/Absolute_value#Complex_numbers
  return this.multiply(this.conjugate()).squareRoot();
};
Expression.Division.prototype.abs = function () {
  return this.getNumerator().abs().divide(this.getDenominator().abs());
};
Expression.prototype.abs = function () {//TODO: remove - ?
  if (this instanceof Expression.Symbol) {
    return new Expression.Abs(this);//TODO: !?
  }
  if (this instanceof Expression.ComplexConjugate) {
    return this.a.abs();
  }
  if (this instanceof Expression.Multiplication) {
    return this.a.abs().multiply(this.b.abs());
  }
  if (this instanceof Expression.Abs) {
    return this;
  }
  if (this.compareTo(Expression.ZERO) < 0) {
    return this.negate();
  }
  return this;
};
Expression.prototype.compareTo = function (other) {//TODO: remove - ?
  if (other.equals(Expression.ZERO)) {
    if (Expression._isPositive(this)) {
      return +1;
    }
    if (Expression._isPositive(this.negate())) {
      return -1;
    }
    throw new TypeError(this.toString());
  }
  return this.subtract(other).getNumerator().compareTo(Expression.ZERO);
};
Expression.prototype.sign = function () {
  return this.compareTo(Expression.ZERO);
};
Expression.prototype.round = function () {//TODO: remove - ?
  //TODO: half away from zero - ?
  //console.log(this.getNumerator(), this.getDenominator());
  //return this.getNumerator().add(this.getDenominator().truncatingDivide(Expression.TWO)).truncatingDivide(this.getDenominator());
  return ExpressionParser.parse(toDecimalStringInternal(this, {fractionDigits: 0}));
};

//console.assert(GramSchmidtOrthogonalization(new Matrix([[Expression.Integer.fromNumber(3), Expression.Integer.fromNumber(1)], [Expression.Integer.fromNumber(2), Expression.Integer.fromNumber(2)]])).toString() === '{{3,1},{-2/5,6/5}}');
//console.assert(GramSchmidtOrthogonalization(new Matrix([[Expression.Integer.fromNumber(3), Expression.Integer.fromNumber(1)], [Expression.Integer.fromNumber(2), Expression.Integer.fromNumber(2)], [new Expression.Integer(0), new Expression.Integer(0)]])).toString() === '{{3,1},{-2/5,6/5},{0,0}}');
//throw new Error();


// Math.log2(Math.hypot.apply(null, coefficients))
Polynomial.prototype._log2hypot = function () {
  let max = Expression.ZERO;
  for (let i = 0; i < this.a.size; i += 1) {
    const c = this.a.coefficient(i).abs();
    if (c.compareTo(max) > 0) {
      max = c;
    }
  }
  const shift = Math.max(max.bitLength() - ((1024 - 53 - 1) / 2), 0);
  const unscale = Expression.TWO._pow(shift);
  let s = 0;
  for (let i = 0; i < this.a.size; i += 1) {
    s += Math.pow(this.a.coefficient(i).truncatingDivide(unscale).toNumber(), 2);
  }
  return shift + Math.log2(Math.sqrt(s));
};

Polynomial.prototype._log2OfBoundForCoefficientsOfFactor = function (factorDegreeBound, factorLeadingCoefficientBound) {
  // https://en.wikipedia.org/wiki/Geometrical_properties_of_polynomial_roots#:~:text=This%20bound%20is%20also%20useful%20to%20bound%20the%20coefficients%20of%20a%20divisor%20of%20a%20polynomial%20with%20integer%20coefficients:
  // see also
  // The art of computer programming. Vol.2: Seminumerical algorithms
  // exersize 20, page 458
  // which gives better result (~2 times smaller)
  if (factorDegreeBound == undefined) {
    factorDegreeBound = this.getDegree();
  }
  if (factorDegreeBound === 0) {
    return 0;
  }
  if (factorLeadingCoefficientBound == undefined) {
    factorLeadingCoefficientBound = this.getLeadingCoefficient().abs();
  }
  var log2 = function (integer) {
    var e = integer.bitLength();
    if (e <= 53) {
      return Math.log2(integer.toNumber());
    }
    return (e - 53) + Math.log2(integer.truncatingDivide(Expression.TWO._pow(e - 53)).toNumber());
  };
  var centralBinomialCoefficientBound = function (n) {
    return (n - Math.log2(Math.sqrt(Math.PI * Math.ceil(n / 2))));
  };
  var m = factorDegreeBound;
  var e = centralBinomialCoefficientBound(m) + (log2(factorLeadingCoefficientBound.abs()) - log2(this.getLeadingCoefficient().abs())) + this._log2hypot();
  return e;
};


Polynomial.prototype.isDivisibleBy = function (guess) {
  var w = undefined;
  var s = Expression.ONE;
  if (this._hasIntegerLikeCoefficients() &&
      guess._hasIntegerLikeCoefficients()) {
    // for performance
    // https://en.wikipedia.org/wiki/Gauss%27s_lemma_(polynomials) - ?
    w = "undefined";
    s = guess.getContent();
  }
  var tmp = this.scale(s).divideAndRemainder(guess, w);
  return tmp != null && tmp.remainder.equals(Polynomial.ZERO);
};


// returns a GCD of polynomials where coefficients are polynomials modulo polynomial M, leading coefficient is set to 1
function polynomialGCDModuloPolynomial(A, B, M) {
  function modulo(B, M) { // Note: this may increase the coefficient because of the scaling and so make the execution slower
    var BmodM = B.map(c => new Expression.Polynomial(c.polynomial.divideAndRemainder(M).remainder));
    var d = BmodM.map(c => c.polynomial.getContent()).getContent().inverse(); //TODO: ?
    return BmodM.scale(new Expression.Polynomial(Polynomial.of(d)));
  }
  function toMonic(A, M) {
    //Note: it is faster for some polynomials to make A modulo M at first
    if (A.getDegree() < 0) {
      return A;
    }
    return modulo(A.scale(new Expression.Polynomial(A.getLeadingCoefficient().polynomial.primitivePart().modularInverse(M).primitivePart())), M);
  }
  A = A.map(c => new Expression.Polynomial(c));
  B = B.map(c => new Expression.Polynomial(c));
  if (A.getDegree() < B.getDegree()) {
    var tmp = A;
    A = B;
    B = tmp;
  }
  if (B.getDegree() >= 0 && modulo(Polynomial.of(B.getLeadingCoefficient()), M).equals(Polynomial.ZERO)) {
    return polynomialGCDModuloPolynomial(modulo(A, M).map(c => c.polynomial), modulo(B, M).map(c => c.polynomial), M);
  }
  for (var tmp of Polynomial._pseudoRemainderSequence(A, B, "subresultant")) {
    var newR = tmp.R;
    A = B;
    B = newR;
    if (B.getDegree() >= 0 && modulo(Polynomial.of(B.getLeadingCoefficient()), M).equals(Polynomial.ZERO)) {
      return polynomialGCDModuloPolynomial(modulo(A, M).map(c => c.polynomial), modulo(B, M).map(c => c.polynomial), M);
    }
  }
  return toMonic(modulo(A, M), M);
}

globalThis.testables = globalThis.testables || {};
globalThis.testables.polynomialGCDModuloPolynomial = polynomialGCDModuloPolynomial;

