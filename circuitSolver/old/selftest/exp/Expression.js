/*jslint plusplus: true, vars: true, indent: 2 */

// Thanks to Eduardo Cavazos
// see also https://github.com/dharmatech/Symbolism/blob/master/Symbolism/Symbolism.cs
// see also "Computer Algebra and Symbolic Computation: Elementary Algorithms" by Joel S. Cohen

// public API:
// Expression.prototype.add
// Expression.prototype.subtract
// Expression.prototype.multiply
// ...
// protected API:
// Expression.prototype.addExpression
// Expression.prototype.addInteger

  //import BigInteger from './BigInteger.js';
  import SmallBigInt from './SmallBigInt.js';
  import Polynomial from './Polynomial.js';
  import Matrix from './Matrix.js';
  import primeFactor from './primeFactor.js';
  import QuadraticInteger from './QuadraticInteger.js';

  import bigIntGCD from './node_modules/bigint-gcd/gcd.js';
  import toDecimalStringInternal from './toDecimalString.js';

  function gcdOfSafeIntegers(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const r = a - Math.floor(a / b) * b;
      a = b;
      b = r;
    }
    return a;
  }

  Math.gcd = function (a, b) {
    if (typeof a !== "number" &&
        typeof b !== "number") {
      throw new RangeError();
    }
    const maxSMI = 1073741823;
    if ((a | 0) === a && Math.abs(a) <= maxSMI &&
        (b | 0) === b && Math.abs(b) <= maxSMI) {
      let A = Math.abs(a);
      let B = Math.abs(b);
      while (B !== 0) {
        const R = A % B;
        A = B;
        B = R;
      }
      return A;
    }
    return gcdOfSafeIntegers(a, b);
  };
  
  function integerMin(a, b) {
    return a.compareTo(b) < 0 ? a : b;
  }

  function bigIntGCDWrapper2(a, b) {
    if (Math.abs(SmallBigInt.toNumber(a)) >= 1/0 && Math.abs(SmallBigInt.toNumber(b)) >= 1/0) {
      var size = integerMin(Expression.Integer.fromBigInt(a).abs(), Expression.Integer.fromBigInt(b).abs()).bitLength();
      size = Math.pow(2, Math.ceil(Math.log2(size)));
      if (size >= 128 * 1024) {
        if (size > lastMaxSize) {
          lastMaxSize = size;
          var error = new TypeError("big size of " + "gcd" + " " + size);
          if (globalThis.onerror != null) {
            globalThis.onerror(error.message, "", 0, 0, error);
          }
        }
      }
    }
    return bigIntGCD(SmallBigInt.BigInt(a), SmallBigInt.BigInt(b));
  }

  function bigIntGCDWrapper(a, b) {
    if (typeof a === "number" && typeof b === "number") {
      return Math.gcd(a, b);
    }
    return bigIntGCDWrapper2(a, b);
  }

  var pow = function (x, count, accumulator) {
    if (!(count >= 0)) {
      throw new RangeError();
    }
    if (count > Number.MAX_SAFE_INTEGER) {
      throw new RangeError("NotSupportedError");
    }
    return (count < 1 ? accumulator : (2 * Math.floor(count / 2) !== count ? pow(x, count - 1, accumulator.multiply(x)) : pow(x.multiply(x), Math.floor(count / 2), accumulator)));
  };

  // https://stackoverflow.com/a/15302448/839199
  var binomialCoefficient = function (n, k) { // binomail coefficient
    return k === 0 ? Expression.ONE : n.multiply(binomialCoefficient(n.subtract(Expression.ONE), k - 1)).divide(Integer.fromNumber(k));
  };

/*
  var powerOfJordanForm = function (J, N) {
    return J.map(function (e, i, j) {
      if (i > j) {
        return Expression.ZERO;
      }
      if (i === j) {
        return J.e(i, i).equals(Expression.ZERO) ? Expression.ZERO : J.e(i, i).pow(N);
      }
      if (J.e(i, i + 1).equals(Expression.ZERO)) {
        return Expression.ZERO;
      }
      var m = j - i;
      for (var k = 0; k < m; k += 1) {
        if (!J.e(j - 1 - k, j - k).equals(Expression.ONE)) { // outside of a block
          return Expression.ZERO;
        }
      }
      return J.e(i, i).equals(Expression.ZERO) ? Expression.ZERO : binomialCoefficient(N, m).multiply(J.e(i, i).pow(N.subtract(Expression.Integer.fromNumber(m))));
    });
  };
*/

  var matrixInN = function (matrix, n) {
    var condition = -1;
    /*
    if (matrix.isDiagonal()) {
      for (var i = 0; i < matrix.cols(); i += 1) {
        if (matrix.e(i, i).equals(Expression.ZERO)) {
          condition = 0;//?
        }
      }
      var result = matrix.map(function (e, i, j) {
        return i === j ? (e.equals(Expression.ZERO) ? Expression.ZERO : e.pow(n)) : Expression.ZERO;
      });
      var an = new Expression.Matrix(result);
      return condition !== -1 ? new ExpressionWithCondition(an, Condition.TRUE.andGreaterZero(n.subtract(Expression.Integer.fromNumber(condition)))) : an;
    }
    */
    /*
    if (matrix.isJordanMatrix()) {
      for (var i = 0; i < matrix.cols(); i += 1) {
        if (matrix.e(i, i).equals(Expression.ZERO)) {
          condition = Math.max(condition, 0);
          // should be Jordan block size minus one (?)
          for (var j = 0; i + j + 1 < matrix.cols(); j += 1) {
            if (matrix.e(i + j, i + j + 1).equals(Expression.ONE)) {
              condition = Math.max(condition, j + 1);
            }
          }
        }
      }
      var an = new Expression.Matrix(powerOfJordanForm(matrix, n));
      if (condition > 0) {//TODO: remove(merge)
        var cases = [];
        cases.push(new ExpressionWithCondition(an, Condition.TRUE.andGreaterZero(n.subtract(Integer.fromNumber(condition)))));
        for (var i = 1; i <= condition; i += 1) {
          cases.push(new ExpressionWithCondition(new Expression.Matrix(matrix.pow(i)), Condition.TRUE.andZero(n.subtract(Integer.fromNumber(i)))));
        }
        return new Expression.Cases(cases);
      }
      return condition !== -1 ? new ExpressionWithCondition(an, Condition.TRUE.andGreaterZero(n.subtract(Integer.fromNumber(condition)))) : an;
    }
    */
    //!
    var D = matrix.map(function (e, i, j) {
      return i === j ? e : Expression.ZERO;
    });
    var N = matrix.subtract(D);
    if (N.isNilpotent()) {//TODO: fix Matrix#isNilpotent
      if (D.multiply(N).eql(N.multiply(D))) {// D and N commute
        //Note: covers diagonal matrices and Jordan matrices
        for (var k = 0; k < D.cols(); k += 1) {
          if (D.e(k, k).equals(Expression.ZERO)) {
            var index = 1;
            while (!N.pow(index).map(function (e, i, j) { return i !== k ? Expression.ZERO : e; }).isZero()) {
              if (index >= N.cols()) {
                throw new TypeError("assertion");
              }
              index += 1;
            }
            condition = Math.max(condition, index - 1);//?
          }
        }
        var result = Matrix.Zero(N.cols(), N.cols());
        for (var k = 0; k < N.cols() && (k === 0 || !N.isZero()); k += 1) {
          var Dnmk = D.map(function (e, i, j) {
            return i === j ? (e.equals(Expression.ZERO) ? Expression.ZERO : e.pow(n.subtract(Expression.Integer.fromNumber(k)))) : Expression.ZERO;
          });
          result = result.add(Dnmk.multiply(N.pow(k)).scale(binomialCoefficient(n, k)));
        }
        var an = new Expression.Matrix(result);
        if (condition > 0) {//TODO: remove(merge)
          var cases = [];
          cases.push(new ExpressionWithCondition(an, Condition.TRUE.andGreaterZero(n.subtract(Integer.fromNumber(condition)))));
          for (var i = 1; i <= condition; i += 1) {
            cases.push(new ExpressionWithCondition(new Expression.Matrix(matrix.pow(i)), Condition.TRUE.andZero(n.subtract(Integer.fromNumber(i)))));
          }
          return new Expression.Cases(cases);
        }
        return condition !== -1 ? new ExpressionWithCondition(an, Condition.TRUE.andGreaterZero(n.subtract(Integer.fromNumber(condition)))) : an;
      }
    }
    //!
    var canExponentiate = function (k) {
      if (enableAN && k instanceof Expression.Symbol) {
        return true;
      }
      if (k instanceof Exponentiation && getBase(k) instanceof Integer && getBase(k).compareTo(Expression.ONE) > 0 && isIntegerOrN(getExponent(k).inverse())) {//TODO: remove (no need if to change other codes) of fix `isConstant`?
        return true;
      }
      return isConstant(k) || isConstant(k.divide(Expression.E));
    };
    //Note: experimental
    // {{1,0,0},{0,1,1},{0,0,1}}^n === {{1,0,0},{0,1,n},{0,0,1}}
    // A
    var a = matrix;
    // A^(n-1)
    var symbolName = "aa";
    var anm1 = matrix.map(function (e, i, j) {
      return new Expression.Symbol(symbolName + "_(" + i + "," + j + ")");
    });
    var anm1previous = anm1.map(function (e, i, j) {
      return Expression.ZERO;
    });
    var an = undefined;
    var iteration = -1;
    while (!anm1.eql(anm1previous)) {
      iteration += 1;
      anm1previous = anm1;
      // A^(n) = A^(n-1) * A;
      an = anm1.multiply(a);
      anm1 = an.map(function (e, i, j) {
        var isSymbol = anm1.e(i, j) instanceof Expression.Symbol && anm1.e(i, j).symbol.slice(0, symbolName.length) === symbolName;
        if (!isSymbol) {
          return anm1.e(i, j);//?
        }
        // an: {{1,0,0},{0,1,1+aa_23},{0,0,1}}
        // a_n = n + a_(n-1)
        // a_n = k * a_(n-1) + c * k**(n-(m+1)) * choose(n-1, m)
        // =>
        // a_n = c * k**(n-(m+1)) * choose(n, m+1)
        // Note: choose(n-1, m) + choose(n-2, m) + choose(n-3, m) + ... = choose(n, m+1)
        // choose(n-1, m+1) + choose(n-1, m) = choose(n, m+1)
        if (!(e instanceof Integer)) {
          var m = Polynomial.toPolynomial(e.getNumerator(), n).getDegree();
          var previous = anm1.e(i, j);
          var p = Polynomial.toPolynomial(e.getNumerator(), previous);
          var k = p.getLeadingCoefficient().divide(e.getDenominator());
          if (m !== 0 &&
              p.getDegree() === 1 &&
              a.e(i, j).equals(Expression.ZERO) && //TODO: remove
              (k instanceof Integer || k instanceof Expression.Complex || canExponentiate(k))) { //TODO: fix
            var f = k.pow(n).divide(k.pow(Integer.fromNumber(m + 1))).multiply(binomialCoefficient(n.subtract(Expression.ONE), m));
            var c = e.subtract(k.multiply(previous)).divide(f);
            //TODO: remove `k instanceof Integer`
            if (c instanceof Integer) {//?TODO: ?
              console.log("!", e.toString());
              // a.e(i, j).add()
              return c.multiply(k.pow(n).divide(k.pow(Integer.fromNumber(m + 2))).multiply(binomialCoefficient(n.subtract(Expression.ONE), m + 1)));
            }
          }
        }
        // a_n = a_(n-1)
        if (e.equals(anm1.e(i, j))) {
          return a.e(i, j);
        }
        // a_n = k * a_(n-1) + b => a_n = k**(n - 1) * a_1 + b * (1-k**(n-2))/(1-k)
        if (anm1.e(i, j) instanceof Expression.Symbol && anm1.e(i, j).symbol === symbolName + "_(" + i + "," + j + ")" && !e.equals(Expression.ZERO)) {
          var previous = anm1.e(i, j);
          var p = Polynomial.toPolynomial(e.getNumerator(), previous);
          var k = p.getLeadingCoefficient().divide(e.getDenominator());
          var b = p.getCoefficient(0).divide(e.getDenominator());
          if (!Expression.has(b, Expression.Symbol) && //TODO: !!!
              e.equals(k.multiply(previous).add(b))) {
            var s = k.equals(Expression.ONE) ? b.multiply(n.subtract(Expression.TWO)) : b.multiply(Expression.ONE.subtract(k.pow(n.subtract(Expression.TWO))).divide(Expression.ONE.subtract(k)));
            return k.pow(n.subtract(Expression.TWO)).multiply(a.e(i, j)).add(s);
          }
        }
        if (anm1.e(i, j) instanceof Expression.Symbol && anm1.e(i, j).symbol === symbolName + "_(" + i + "," + j + ")" && e.equals(Expression.ZERO)) {
          //!TODO: conditions.push(iteration); //? n > 0 && n <= 3 , n > 3 - ?
          condition = iteration;
          return Expression.ZERO;
        }
        // a_n = a_(n-1) + b => a_n = a_1 + b*(n-1)
        var sub = e.subtract(anm1.e(i, j));
        if (sub instanceof Integer) {
          return a.e(i, j).add(sub.multiply(n.subtract(Expression.TWO)));
        }
        var dpnm1pda = function (k) { // k**(n-1) + k * a_(n-1)
          if (!canExponentiate(k)) {//TODO: remove
            return Expression.ZERO;// cannot do k.pow(n)
          }
          var previous = anm1.e(i, j);
          return k.pow(n.subtract(Expression.ONE)).add(k.multiply(previous));
        };
        // a_n = d**(n-1) + d * a_(n-1)
        // a_n = d**(n-1) + d * a_(n-1) = 2 * d**(n-1) + d**2 * a_(n-2) = ... = n * d**(n-1) + d**n
        if (!e.equals(Expression.ZERO)) {
          var previous = anm1.e(i, j);
          var p = Polynomial.toPolynomial(e.getNumerator(), previous);
          var k = p.getLeadingCoefficient().divide(e.getDenominator());
          var d = k;
          if (e.equals(dpnm1pda(d))) {
            return d.pow(n.subtract(Expression.TWO)).multiply(n.subtract(Expression.TWO).add(a.e(i, j)));
          }
          var d = k.negate();
          if (e.equals(dpnm1pda(d))) {
            return d.pow(n.subtract(Expression.TWO)).multiply(n.subtract(Expression.TWO).add(a.e(i, j)));
          }
        }

        return anm1.e(i, j);
      });
    }
    for (var i = 0; i < anm1.rows(); i += 1) {
      for (var j = 0; j < anm1.cols(); j += 1) {
        var e = anm1.e(i, j);
        if (e instanceof Expression.Symbol && e.symbol.slice(0, symbolName.length) === symbolName) {
          return undefined;
        }
      }
    }
    if (condition > 0) {
      var cases = [];
      cases.push(new ExpressionWithCondition(new Expression.Matrix(an), Condition.TRUE.andGreaterZero(n.subtract(Integer.fromNumber(condition)))));
      for (var i = 1; i <= condition; i += 1) {
        cases.push(new ExpressionWithCondition(new Expression.Matrix(a.pow(i)), Condition.TRUE.andZero(n.subtract(Integer.fromNumber(i)))));
      }
      return new Expression.Cases(cases);
    }
    var e = new Expression.Matrix(an);
    return condition !== -1 ? new ExpressionWithCondition(e, Condition.TRUE.andGreaterZero(n.subtract(Integer.fromNumber(condition)))) : e;
  };

  var enableEX = true;
  var enable2X = true;
  var enableEC = true;
  var enableAN = true;

  var isPositiveQuick = function (x) {
    if (x instanceof Integer) {
      return x.compareTo(Expression.ZERO) > 0;
    }
    if (x instanceof NthRoot) {
      return isPositiveQuick(x.a);//?
    }
    if ((x instanceof Multiplication || x instanceof Division) && !x.a.equals(Expression.ONE.negate()) && !x.b.equals(Expression.ONE.negate())) {
      return (isPositiveQuick(x.a) && isPositiveQuick(x.b)) || (isPositiveQuick(x.a.negate()) && isPositiveQuick(x.b.negate()));//? bug - ?
    }
    if (x instanceof Addition) {
      return isPositiveQuick(x.a) && isPositiveQuick(x.b);
    }
    if (x instanceof Expression.PolynomialRootSymbol) {
      return isPositiveQuick(x.interval.a) && isPositiveQuick(x.interval.b);
    }
    if (x instanceof Expression.Multiplication && x.a.equals(Expression.ONE.negate()) && x.b instanceof Expression.PolynomialRootSymbol) {
      return !isPositiveQuick(x.b.interval.a) && !isPositiveQuick(x.b.interval.b);
    }
    //TODO: ?
    /*if (x instanceof Expression.ExpressionPolynomialRoot) {
      return isPositiveQuick(x.root.interval.a) && isPositiveQuick(x.root.interval.b);
    }
    if (x instanceof Expression.Multiplication && x.a.equals(Expression.ONE.negate()) && x.b instanceof Expression.ExpressionPolynomialRoot) {
      return !isPositiveQuick(x.b.root.interval.a) && !isPositiveQuick(x.b.root.interval.b);
    }
    if (x instanceof Expression.ExpressionWithPolynomialRoot) {
      return isPositiveQuick(x.e);
    }*/
    return false;
  };

  var isPositive = function (x) {
    if (x.equals(Expression.ZERO)) {
      return false;
    }
    if (isPositiveQuick(x)) {
      return true;
    }
    if (isPositiveQuick(x.negate())) {
      return false;
    }
    if (x instanceof Expression.Symbol && !(x instanceof Expression.PolynomialRootSymbol) && !(x instanceof Expression.ExpressionPolynomialRoot) && !(x instanceof Expression.ExpressionWithPolynomialRoot)) {
      if (x === Expression.PI || x === Expression.E) {
        return true;
      }
      return false;
    }
    if (x instanceof Expression.Complex) {
      return false;
    }
    if (Expression.has(x, Expression.Complex)) {//???
      return false;
    }
    //TODO:
    //if (x instanceof ExpressionPolynomialRoot) {
    //  var tmp = x.sign();
    //  return tmp > 0;
    //}
    if (x instanceof Addition || x instanceof Expression.Cos || x instanceof Expression.Sin || x instanceof Expression.Exponentiation || x instanceof Expression.Multiplication || x instanceof Expression.PolynomialRootSymbol || x instanceof Expression.ExpressionPolynomialRoot || x instanceof Expression.ExpressionWithPolynomialRoot || x instanceof Expression.Division) {
      var tmp = toDecimalStringInternal(x, {significantDigits: 1});
      var value = tmp == undefined ? 0/0 : Number(tmp.replace(/\((\d+)\)/g, '$1').replace(/\*10\^/g, 'e'));
      if (!Number.isNaN(value)) {
        return value > 0;
      }
    }
    if (x instanceof Expression.ExponentiationOfMinusOne) {
      return false;
    }
    if (x instanceof Expression.Exponentiation && getExponent(x) instanceof Expression.Integer) {
      return isPositive(x.a); // x**2
    }
    if (Expression.has(x, Expression.Symbol)) {
      return false;//?
    }
    //TODO: tests, fix for algebraic numbers (?)
    if (x instanceof Expression.Logarithm) {
      return isPositive(x.a.subtract(Expression.ONE));
    }
    throw new TypeError("!" + x);
  };

  Expression._isPositive = isPositive;




  var isIntegerOrN = function (e) {
    if (e instanceof Integer) {
      return true;
    }
    if (e instanceof Expression.Symbol && (e.symbol === "n" || e.symbol === "k")) {
      return true;
    }
    if (e instanceof Expression.Addition || e instanceof Expression.Multiplication || e instanceof Expression.Exponentiation) {
      return isIntegerOrN(e.a) && isIntegerOrN(e.b);
    }
    //TODO: factorial - ?
    //TODO: n*(n+1)/2
    return false;
  };

  var isGoodPolynomial = function (x) {
    if (x instanceof Expression.Exponentiation) {
      return false;
    }
    var v = getVariableInternal(getLastMultiplicationOperand(getFirstAdditionOperand(x))).next().value.v; // avoid square roots
    if (v instanceof Expression.Symbol) {
      var p = Polynomial.toPolynomial(x, v);
      if (p.getDegree() === 1 && p.getCoefficient(0) instanceof Expression.Integer && p.getCoefficient(1) instanceof Expression.Integer) {
        if (p.getContent().equals(Expression.ONE)) {
          return true;
        }
      }
    }
    return false;
  };

  const isMatrixSymbolTranspose = function (e) {
    if (e instanceof Expression.Exponentiation) {
      if (getBase(e) instanceof Expression.MatrixSymbol) {
        const exp = getExponent(e);
        if (exp instanceof Expression.Symbol && exp.symbol === "T") {
          return true;
        }
        if (exp instanceof Expression.Multiplication && exp.a instanceof Expression.Integer && exp.b instanceof Expression.Symbol && exp.b.symbol === "T") {
          return true;
        }
      }
    }
    return false;
  };

  Expression.prototype.powExpression = function (x) {
    var y = this;
    
    if (y === Expression.INFINITY) {
      if (Expression.isReal(x)) {
        if (x.compareTo(Expression.ONE) > 0) {
          //TODO: !? more arithmetic support for infinities (?)
          //return Expression.INFINITY;
          throw new RangeError("NotSupportedError");
        }
        if (x.compareTo(Expression.ONE) === 0) {
          return Expression.ONE;
        }
        if (x.compareTo(Expression.ONE.negate()) > 0) {
          return Expression.ZERO;
        }
        throw new RangeError("NotSupportedError");
      }
      var tmp = Expression.getComplexNumberParts(x);
      if (Expression.isReal(tmp.real) && Expression.isReal(tmp.imaginary)) {
        var rhorho = tmp.real._pow(2).add(tmp.imaginary._pow(2));
        if (rhorho.compareTo(Expression.ONE) < 0) {
          return Expression.ZERO;
        }
      }
    }

    if (y instanceof Expression.Symbol && (y.symbol === "t" || y.symbol === "T")) {
      if (Expression.has(x, MatrixSymbol) || Expression.has(x, Expression.Matrix)) {//TODO: fix
        return x.transpose();
      }
    }
    if (y instanceof Expression.Multiplication && y.a instanceof Expression.Integer && y.b instanceof Expression.Symbol && (y.b.symbol === "t" || y.b.symbol === "T")) {
      if (Expression.has(x, MatrixSymbol) || Expression.has(x, Expression.Matrix)) {//TODO: fix
        return x.pow(y.a).transpose();
      }
    }

    //!
    if (y instanceof Division && y.a instanceof Integer && y.b instanceof Integer && x !== Expression.E && !(x instanceof Expression.Symbol) && !Expression.has(x, Expression.Symbol)) {
      if (typeof hit === "function") {
        hit({powExpression: y.toString()});
      }
      var n = y.b.toNumber();
      //if (n >= 2 && n <= Number.MAX_SAFE_INTEGER) {//TODO:
        var q = y.a.truncatingDivide(y.b);
        var r = y.a.subtract(q.multiply(y.b));
        if (q.equals(Expression.ZERO)) {// to avoid multiplication event
          return x.pow(r)._nthRoot(n);
        }
        return x.pow(q).multiply(x.pow(r)._nthRoot(n));
      //}
    }
    //!

    if (x instanceof Expression.Integer && y === Expression.CIRCLE) {
      return new Expression.Degrees(x);
    }

    //!new 2017-05-08
    if (enableEX) {
      if (x === Expression.E || (enable2X && x instanceof Integer && x.compareTo(Expression.ONE) > 0 && integerPrimeFactor(x).compareTo(x) === 0)) {
        var isValid = function (y) {
          if (y instanceof Expression.Symbol) {
            return true;
          }
          if (y instanceof Addition) {
            return isValid(y.a) && isValid(y.b);
          }
          if ((y instanceof Integer || y instanceof NthRoot) && (x === Expression.E || (x instanceof Integer && y instanceof NthRoot))) {//TODO: fix
            return true;
          }
          if (y instanceof Multiplication || y instanceof Exponentiation) {
            for (var f of y.factors()) {
              var b = getBase(f);
              if (!(b instanceof Integer || b instanceof NthRoot || b instanceof Expression.Symbol)) {
                if (!isValid(b)) {
                  return false;
                }
              }
            }
            return true;
          }
          if ((x === Expression.E || x instanceof Integer && x.compareTo(Expression.ONE) > 0) && y instanceof Division && y.b instanceof Integer) {//!new 2019-08-08
            return isValid(y.a);//?
          }
          return false;
        };
        if (y.getNumerator() instanceof Addition && (y.getNumerator().a.isNegative() || y.getNumerator().b.isNegative())) { // e**(x-y)
          return Expression.ONE.divide(x.pow(y.getNumerator().a.negate().divide(y.getDenominator())).divide(x.pow(y.getNumerator().b.divide(y.getDenominator()))));
        }
        if (isValid(y)) {
          if (y.isNegative()) {
            return Expression.ONE.divide(new Expression.Exponentiation(x, y.negate()));
          }
          //!new
          if (y instanceof Expression.ExpressionWithPolynomialRoot) {
            return x.pow(y.upgrade());
          }
          return new Expression.Exponentiation(x, y);
        }
      }
      if (enable2X && x instanceof Integer && x.compareTo(Expression.ONE) > 0) {
        if (y instanceof Addition && (y.a instanceof Integer || y.b instanceof Integer)) {
          return x.pow(y.a).multiply(x.pow(y.b));
        }
        var xf = integerPrimeFactor(x);
        if (xf.equals(x)) {
          if (y instanceof Division && y.b instanceof Integer) {
            var n = y.b.toNumber();
            if (n >= 2 && n <= Number.MAX_SAFE_INTEGER) {
              return x.pow(y.a)._nthRoot(n);
            }
          }
          //!new 2020-18-01
          if (y instanceof Division && isIntegerOrN(y.a) && isIntegerOrN(y.b)) {
            if (x.compareTo(Expression.ONE) > 0) {
              return new Expression.Exponentiation(x, y);//?
            }
          }
          //!
        } else {
          if (!Expression.has(y, Expression.Logarithm)) {//TODO: ?
          var ctz = primeFactor._countTrailingZeros(x.toBigInt(), xf.toBigInt());
          return xf.pow(y.multiply(Integer.fromNumber(ctz))).multiply(x.divide(xf._pow(ctz)).pow(y));
          }
        }
      }
    }
    //!

    if (enableEX) {
      //TODO: - ?
      if (x instanceof Integer && x.equals(Expression.ONE)) {
        return Expression.ONE;
      }
      if (x instanceof Division || x instanceof Multiplication && (y.getDenominator().equals(Expression.ONE) || isPositive(x.a) || isPositive(x.b))) {
        if (x instanceof Division) {
          return x.a.pow(y).divide(x.b.pow(y));
        }
        if (enable2X) {
          if (x instanceof Multiplication) {
            return x.a.pow(y).multiply(x.b.pow(y));
          }
        }
      }
    }

    var yn = y.getNumerator();
    var yd = y.getDenominator();
    if (x === Expression.E && yn instanceof Multiplication && yn.a instanceof Expression.Complex && yn.a.real.equals(Expression.ZERO) && yn.b instanceof Expression.Symbol) {
      var t = y.multiply(Expression.I.negate());
      return t.cos().add(Expression.I.multiply(t.sin()));
    }
    if (x === Expression.E && getConstant(yn) instanceof Expression.Complex && yd instanceof Expression.Integer) {
      var c = getConstant(yn);
      if (c.real.equals(Expression.ZERO)) {
        var t = y.multiply(Expression.I.negate());
        t = Expression.has(y, Expression.Symbol) ? t : new Expression.Radians(t);
        return t.cos().add(Expression.I.multiply(t.sin()));
      }
      return x.pow(c.real.divide(yd)).multiply(x.pow(c.imaginary.multiply(Expression.I).multiply(yn.divide(c)).divide(yd)));
    }
    if (x === Expression.E && yn instanceof Expression.Addition && yd instanceof Expression.Integer) {
      return x.pow(yn.a.divide(yd)).multiply(x.pow(yn.b.divide(yd)));
    }

    //TODO:
    if (x instanceof Expression.Matrix && (isIntegerOrN(y) || y === Expression.INFINITY)) {
      if (!x.matrix.isSquare()) {
        throw new RangeError("NonSquareMatrixException");
      }
      var an = matrixInN(x.matrix, y);
      if (an != undefined) {
        //?
        var D = x.matrix.map(function (e, i, j) {
          return i === j ? e : Expression.ZERO;
        });
        var N = x.matrix.subtract(D);
        if (x.matrix.isDiagonal()) {
        //  if (Expression.callback != undefined) {
        //    Expression.callback(new Expression.Event("diagonal-matrix-pow", x));
        //  }
        //} else if (x.matrix.isJordanMatrix()) {
        //  if (Expression.callback != undefined) {
        //    Expression.callback(new Expression.Event("Jordan-matrix-pow", x));
        //  }
        } else if (N.isNilpotent() && D.multiply(N).eql(N.multiply(D))) {
          if (Expression.callback != undefined) {
            Expression.callback(new Expression.Event("DpN-matrix-pow", x));
          }
        }

        return an;
      }

      //! 2018-08-26
      if (true) {
        var eigenvalues = Expression.getEigenvalues(x.matrix);
        if (eigenvalues.length === x.matrix.cols()) {
          var eigenvectors = Expression.getEigenvectors(x.matrix, eigenvalues);
          if (eigenvectors.filter(v => v != null).length === x.matrix.cols()) {
            var tmp = Expression.diagonalize(x.matrix, eigenvalues, eigenvectors);
            var L = tmp.L;
            var SL = matrixInN(L, y);
            if (SL != undefined) {
              if (Expression.callback != undefined) {
                Expression.callback(new Expression.Event("pow-using-diagonalization", x));
              }
              if (Expression.callback != undefined) {
                //TODO more details (A=P*D*P^-1 => A^n=P*D*P^-1 * ... * P*D*P^-1=P*D^n*P^1
                Expression.callback(new Expression.Event("diagonalize", x));
              }
              return new Expression.Matrix(tmp.T).multiply(SL).multiply(new Expression.Matrix(tmp.T_INVERSED));
            }
          } else {
            var tmp = Expression.getFormaDeJordan(x.matrix, eigenvalues);
            var JN = matrixInN(tmp.J, y);
            if (JN != undefined) {
              if (Expression.callback != undefined) {
                Expression.callback(new Expression.Event("pow-using-Jordan-normal-form", x));
              }
              if (Expression.callback != undefined) {
                //TODO more details (A=P*D*P^-1 => A^n=P*D*P^-1 * ... * P*D*P^-1=P*D^n*P^1
                Expression.callback(new Expression.Event("Jordan-decomposition", x));
              }
              //TODO: details !!!
              return new Expression.Matrix(tmp.P).multiply(JN).multiply(new Expression.Matrix(tmp.P_INVERSED));
            }
          }
        }
      }
      //!
    }

    if (Expression.ExponentiationOfMinusOne != null) {
      if (x instanceof Integer && x.compareTo(Expression.ZERO) < 0 || x.equals(Expression.E.negate())) {
        if (y instanceof Expression.Symbol && (y.symbol === "n" || y.symbol === "k")) {
          return new Expression.ExponentiationOfMinusOne(Expression.ONE.negate(), y).multiply(x.negate().pow(y));
        }
        if (y instanceof Addition && y.a instanceof Expression.Symbol && (y.a.symbol === "n" || y.a.symbol === "k") && y.b instanceof Integer) {
          return new Expression.ExponentiationOfMinusOne(Expression.ONE.negate(), y.a).multiply(Expression.ONE.negate().pow(y.b)).multiply(x.negate().pow(y));
        }
        if (y instanceof Multiplication) {
          return x.pow(y.a).pow(y.b);
        }
        if (y instanceof Addition && y.b instanceof Integer) {
          return x.pow(y.a).multiply(x.pow(y.b));
        }
      }
    }

    if (Expression.ExponentiationOfImaginaryUnit != null) {
      if (x instanceof Expression.Complex && x.equals(Expression.I.negate())) {
        return Expression.ONE.negate().pow(y).multiply(x.negate().pow(y));
      }
      if (x instanceof Expression.Complex && (x.equals(Expression.I) || x.real.compareTo(Expression.ZERO) > 0 && x.primeFactor().equals(x))) {//TODO: -i, other complex numbers - ?
        if (y instanceof Expression.Symbol && (y.symbol === "n" || y.symbol === "k")) {
          return new Expression.ExponentiationOfImaginaryUnit(x, y);
        }
        if (y instanceof Addition && y.a instanceof Expression.Symbol && (y.a.symbol === "n" || y.a.symbol === "k") && y.b instanceof Integer) {
          //var t = x.pow(y.b);
          //return new Expression.ExponentiationOfImaginaryUnit(x, t instanceof Expression.Complex ? y.a.add(Expression.ONE) : y.a).multiply(t instanceof Expression.Complex ? t.divide(x) : t);
          return x.pow(y.a).multiply(x.pow(y.b));
        }
        if (y instanceof Multiplication) {
          return x.pow(y.a).pow(y.b);
        }
        if (y instanceof Addition && y.b instanceof Integer) {
          return x.pow(y.a).multiply(x.pow(y.b));
        }
      }
      if (x instanceof Expression.Complex && x.real.equals(Expression.ZERO) && !x.imaginary.equals(Expression.ONE)) {//TODO: -i, other complex numbers - ?
        if (y instanceof Expression.Symbol && (y.symbol === "n" || y.symbol === "k")) {
          return x.imaginary.pow(y).multiply(Expression.I.pow(y));
        }
        if (y instanceof Multiplication) {
          return x.pow(y.a).pow(y.b);
        }
        if (y instanceof Addition) {
          return x.pow(y.a).multiply(x.pow(y.b));
        }
      }
      if (x instanceof Expression.Complex) {//TODO: ?
        var pf = x.primeFactor();
        return x.divide(pf).pow(y).multiply(pf.pow(y));//TODO: test ?
      }

      //TODO:
      if (x instanceof Expression.Integer && y instanceof Division && y.getDenominator() instanceof Integer && y.getNumerator() instanceof Expression.Symbol &&
          (y.getNumerator().symbol === "n" || y.getNumerator().symbol === "k")) {
        return x.pow(Expression.ONE.divide(y.getDenominator())).pow(y.getNumerator());
      }
      //?
      if (x instanceof Expression.Integer && y instanceof Division && y.getDenominator() instanceof Integer && y.getNumerator() instanceof Addition) {
        return x.pow(Expression.ONE.divide(y.getDenominator())).pow(y.getNumerator());
      }
    }

    if (x === Expression.E && y instanceof Expression.Matrix) {
      if (!y.matrix.isSquare()) {
        throw new RangeError("NonSquareMatrixException");
      }
      // https://en.wikipedia.org/wiki/Matrix_exponential#Using_the_Jordan_canonical_form
      var eigenvalues = Expression.getEigenvalues(y.matrix);
      if (eigenvalues.length === y.matrix.cols()) {
        var tmp = Expression.getFormaDeJordan(y.matrix, eigenvalues);
        // exp(A) = exp(P*J*P^-1) = P*exp(D + N)*P^-1 = P*exp(D)*exp(N)*P^-1
        var D = tmp.J.map(function (e, i, j) {
          return i === j ? e : Expression.ZERO;
        });
        var N = tmp.J.map(function (e, i, j) {
          return i !== j ? e : Expression.ZERO;
        });
        var exp = function (N) {
          // https://en.wikipedia.org/wiki/Matrix_exponential#Nilpotent_case
          var z = Matrix.Zero(N.cols(), N.cols());
          var s = z;
          var p = Matrix.I(N.cols());
          var k = 0;
          var f = 1;
          while (!p.eql(z)) {
            var summand = p.scale(Expression.ONE.divide(Integer.fromNumber(f)));
            s = s.add(summand);
            p = p.multiply(N);
            k += 1;
            f *= k;
          }
          return s;
        };
        if (Expression.callback != undefined) {
          Expression.callback(new Expression.Event("exponential-using-Jordan-canonical-form", y));
        }
        //if (Expression.callback != undefined) {
        //  Expression.callback(new Expression.Event("Jordan-decomposition", y));
        //}
        return new Expression.Matrix(tmp.P.multiply(D.map(function (e, i, j) {
          return i === j ? Expression.E.pow(e) : Expression.ZERO;
        }).multiply(exp(N))).multiply(tmp.P_INVERSED));
      }
    }

    //!2019-04-22
    if (x instanceof NthRoot && x.a instanceof Integer) {
      return x.a.pow(y.divide(Expression.Integer.fromNumber(x.n)));
    }

    if (enableEC) {
      if (x === Expression.E && isConstant(y) && !has(y, Expression.Complex) && !has(y, Expression.Logarithm)) {
        return new Expression.Exponentiation(x, y);
      }
      if ((x instanceof Expression.Symbol || Expression.has(x, Expression.Symbol)) && y instanceof Expression.Division && y.getDenominator() instanceof Integer) {
        return x.pow(y.getNumerator())._nthRoot(y.getDenominator().toNumber());
      }
      if (x instanceof Expression.Symbol && y instanceof Expression.Division && isIntegerOrN(y.getNumerator()) && isIntegerOrN(y.getDenominator())) {
        return new Expression.Exponentiation(x, y);
      }
      if (x === Expression.E && y instanceof Expression.Addition) {
        return x.pow(y.a).multiply(x.pow(y.b));
      }
      if (x instanceof Exponentiation && getBase(x) === Expression.E) {//?
        return getBase(x).pow(getExponent(x).multiply(y));
      }
      if (isGoodPolynomial(x) && y instanceof Expression.Division && isIntegerOrN(y.getNumerator()) && isIntegerOrN(y.getDenominator())) {
        return new Expression.Exponentiation(x, y);
      }
    }

    if (x instanceof Expression.Matrix && y instanceof Expression.Addition) {
      return x.pow(y.a).multiply(x.pow(y.b));
    }
    if (x instanceof Expression.Matrix && y instanceof Expression.Multiplication && y.a instanceof Expression.Integer) {
      return x.pow(y.a).pow(y.b);
    }
    if (x instanceof Expression.Matrix && y instanceof Expression.Division) {
      //?
      if (y.getNumerator().equals(Expression.ONE) && y.getDenominator() instanceof Expression.Symbol && (y.getDenominator().symbol === "n" || y.getDenominator().symbol === "k")) {
        return x._nthRoot(y.getDenominator());//TODO: ?
      }
      if (isIntegerOrN(y.getNumerator()) && isIntegerOrN(y.getDenominator())) {
        return x.pow(y.getNumerator()).pow(Expression.ONE.divide(y.getDenominator()));
      }
    }

    //?
    if (y instanceof Expression.Symbol && (y.symbol === "n" || y.symbol === "k")) {
      var qi = QuadraticInteger.toQuadraticInteger(x);//?
      if (qi != null && /*qi.equals(qi.primeFactor()) &&*/ Number(qi.a.toString()) > 0 && qi.D > 0 && (qi.isValid() || true)) {
        if (Number(qi.b.toString()) > 0) {
          return new Expression.ExponentiationOfQuadraticInteger(x, y);
        }
        if (Number(qi.b.toString()) < 0) {
          var xc = qi.conjugate().toExpression();
          return x.multiply(xc).pow(y).divide(xc.pow(y));
        }
      }
      if (qi != null && Number(qi.a.toString()) < 0) {
        return Expression.ONE.negate().pow(y).multiply(qi.toExpression().negate().pow(y));
      }
      /*
      if (qi != null) {
        if (x._nthRoot(2) instanceof Expression.Addition) {//TODO: remove
          var t = x._nthRoot(2).pow(y);
          return new Expression.ExponentiationOfQuadraticInteger(x._nthRoot(2), y.multiply(Expression.TWO));
        }
      }
      */
    }
    /*
    if (y instanceof Multiplication && y.a instanceof Integer && y.b instanceof Expression.Symbol) {
      return x.pow(y.a).pow(y.b);
    }
    */
    //?

    if (enableAN) {
      if (isIntegerOrN(y)) {
        if (y instanceof Addition) {
          for (var s of y.summands()) {
            if (s.isNegative()) {
              return x.pow(y.subtract(s)).divide(x.pow(s.negate()));
            }
          }
        }
        if (y.isNegative()) {
          return Expression.ONE.divide(x.pow(y.negate()));
        }
        // (1+sqrt(2))**(2n) - ((1+sqrt(2))**2)**(n)
        if (Expression.isConstant(x) && !getConstant(y).equals(Expression.ONE)) {//?
          return x.pow(getConstant(y)).pow(y.divide(getConstant(y)));
        }
        var goodX = x instanceof Expression.Symbol || x instanceof Expression.Addition && !(Expression.has(x, Expression.Sin) || Expression.has(x, Expression.Cos));
        if (goodX) {
          return new Expression.Exponentiation(x, y);
        }
      }
      if (x instanceof Exponentiation && getBase(x) instanceof Integer && getBase(x).compareTo(Expression.ONE) > 0 && isIntegerOrN(getExponent(x).getNumerator()) && isIntegerOrN(getExponent(x).getDenominator())) {//TODO: FIX
        return getBase(x).pow(getExponent(x).multiply(y));
      }
      if (x instanceof Exponentiation && isGoodPolynomial(getBase(x)) &&
          isIntegerOrN(getExponent(x)) &&
          isIntegerOrN(y)) {//TODO: FIX
        return getBase(x).pow(getExponent(x).multiply(y));
      }
      if (x instanceof Exponentiation && isGoodPolynomial(getBase(x)) &&
          isIntegerOrN(getExponent(x).inverse()) &&
          isIntegerOrN(y.inverse())) {//TODO: FIX
        return getBase(x).pow(getExponent(x).multiply(y));
      }
    }

    if (Expression.has(x, Expression.Sin) || Expression.has(x, Expression.Cos)) {
      return Expression._replaceBySinCos(Expression._replaceSinCos(x).pow(y));
    }

    if (x === Expression.E && y instanceof Expression.Logarithm) {
      return y.a;
    }
    if (x === Expression.E && y instanceof Expression.Multiplication && y.a instanceof Integer && y.b instanceof Expression.Logarithm) {
      return x.pow(y.b).pow(y.a);
    }
    if (x === Expression.E && y instanceof Expression.Multiplication && y.a instanceof Expression.Symbol && y.b instanceof Expression.Logarithm) {
      return x.pow(y.b).pow(y.a);
    }
    if (x instanceof Expression.Integer && Expression.has(y, Expression.Logarithm)) {//?
      return Expression.E.pow(x.logarithm().multiply(y));
    }

    //!new 2020-12-11
    if (x instanceof Exponentiation && getBase(x) instanceof Integer && getBase(x).compareTo(Expression.TWO) >= 0 && isIntegerOrN(y)) { // (3^x)^k
      // https://en.wikipedia.org/wiki/Exponentiation#Identities_and_properties
      //TODO: positive real base check - ?
      return getBase(x).pow(getExponent(x).multiply(y));
    }
    //!
    
    //!new 2022-07-26
    //TODO: more cases
    if (x === Expression.E && y instanceof Expression.ComplexConjugate && y.a instanceof Expression.Symbol) {
      return new Expression.Exponentiation(x, y);
    }

    throw new RangeError("NotSupportedError");
  };

  // compare two expression, which are factors (multiplicaiton operands) of terms (addition operands)
  Expression.prototype.compare4Addition = function (y) {
    var x = this;
    if (x instanceof Integer && y instanceof Integer) {
      return x.compareTo(y);
    }
    if (x instanceof Expression.Symbol && y instanceof Integer) {
      return +1;
    }
    if (x instanceof Integer && y instanceof Expression.Symbol) {
      return -1;
    }
    if (x instanceof Expression.Symbol && y instanceof Expression.Symbol) {
      return x.symbol < y.symbol ? -1 : (y.symbol < x.symbol ? +1 : 0);
    }
    //!
    if (x instanceof Expression.Matrix && y instanceof MatrixSymbol) {
      return +1;
    }
    if (x instanceof MatrixSymbol && y instanceof Expression.Matrix) {
      return -1;
    }
    if (x instanceof Expression.Matrix && y instanceof Expression.Matrix) {
      /*
      if (x.matrix.rows() === y.matrix.rows() &&
          x.matrix.cols() === y.matrix.cols()) {
        var rows = x.matrix.rows();
        var cols = x.matrix.cols();
        for (var i = 0; i < rows; i += 1) {
          for (var j = 0; j < cols; j += 1) {
            var c = x.matrix.e(i, j).compare4Addition(y.matrix.e(i, j));
            if (c !== 0) {
              return c;
            }
          }
        }
      }
      */
      return 0;
    }

    //!new 2016-12-17
    //NOTE: the `x instanceof Addition || y instanceof Addition` should be used before `x instanceof Multiplication || y instanceof Multiplication`
    if (x instanceof Addition || y instanceof Addition) {
      return Addition.compare4Addition(x, y);
    }

    //!new 2016-10-09
    if (x instanceof Multiplication || y instanceof Multiplication) {
      return Multiplication.compare4Addition(x, y);
    }


    //!new 2018-10-11
    if (x instanceof Integer && y instanceof Expression.Function) {
      return -1;
    }

    //!new 2018-11-12
    if (x instanceof Division && y instanceof Division) {
      return x.a.compare4Addition(y.a) || x.b.compare4Addition(y.b);//?
    }
    if (x instanceof Expression && y instanceof Division) {
      return +1;//?
    }
    if (x instanceof Division && y instanceof Expression) {
      return -1;//?
    }

    if (x instanceof Expression.Matrix) {
      return -1;
    }
    if (y instanceof Expression.Matrix) {
      return +1;
    }

    //!2019-02-18
    if (x instanceof Integer && y instanceof Expression.Complex) {
      return -1;//?
    }
    if (x instanceof Expression.Complex && y instanceof Integer) {
      return +1;//?
    }
    //!

    if (x.equals(y)) {
      return 0;//!
    }

    if (x instanceof Expression.Exponentiation || y instanceof Expression.Exponentiation) {
      return getBase(x).compare4Addition(getBase(y)) || (0 - getExponent(x).compare4Addition(getExponent(y)));
    }

    //!new 2017-02-10
    if (y instanceof Expression.Symbol) {
      return -1;
    }

    //!
    throw new RangeError();
  };

  var compare = function (x, y) {
    return x.compare4Addition(y);
  };

  var compare4Multiplication = function (x, y) {
    //TODO: Exponentiation + Exponentiation, Exponentiation + Symbol, Symbol + Exponentiation
    return x.compare4Multiplication(y);
  };

  var getBase = function (x) {
    //TODO: ?
    //if (x instanceof NthRoot) {
    //  return x.a;
    //}
    return x instanceof Exponentiation ? x.a : x;
  };
  var getExponent = function (x) {
    //TODO: ?
    //if (x instanceof NthRoot) {
    //  return Expression.Integer.fromNumber(x.n);
    //}
    return x instanceof Exponentiation ? x.b : Expression.ONE;
  };

  // use getContent instead (?)
  var getConstant = function (e, allowExpressionPolynomialRoot = undefined) {
    if (e instanceof Integer) {
      return e;
    } else if (e instanceof Expression.Complex) {
      return e;
    } else if (e instanceof Expression.ExpressionPolynomialRoot) {
      if (allowExpressionPolynomialRoot) {
        return e;
      }
    } else if (e instanceof Multiplication) {
      var c = undefined;
      var x = e;
      for (var y of x.factors()) {
        var t = getConstant(y, allowExpressionPolynomialRoot);
        c = c == undefined ? t : t.multiply(c);
      }
      if (c != undefined) {
        return c;
      }
    } else if (e instanceof Addition) { // -5*x+15
      var c = undefined;
      for (var x of e.summands()) {
        var t = getConstant(x, allowExpressionPolynomialRoot);
        //c = c == undefined ? t : integerGCD(t, c);
        c = c == undefined ? t : complexGCD(t, c);
      }
      if (c != undefined) {
        return c;
      }
    }
    return Expression.ONE;
  };
  var getTerm = function (x, flag0) {
  // TODO: fix performance ?
    if (x instanceof Integer) {
      return undefined;
    } else if (x instanceof Expression.Complex) {
      return undefined;
    } else if (x instanceof Expression.ExpressionPolynomialRoot) {
      if (flag0) {
        return undefined;
      }
    } else if (x instanceof Multiplication) {
      var terms = [];
      for (var y of x.factors()) {
        var t = getTerm(y, flag0);
        if (t != undefined) {
          terms.push(t);
        }
      }
      var result = undefined;
      for (var j = terms.length - 1; j >= 0; j -= 1) {
        result = result == undefined ? terms[j] : new Multiplication(result, terms[j]);
      }
      return result;
    } else if (x instanceof Addition) {
      return x.divide(getConstant(x));
    }
    return x;
  };

  Expression.getConstant = getConstant;

  var multiplyByInteger = function (x, y) {
    if (x.compareTo(Expression.ZERO) === 0) {
      return x;
    }
    if (x.compareTo(Expression.ONE) === 0) {
      return y;
    }
    return new Multiplication(x, y);
  };

  Expression.prototype.multiplyExpression = function (x) {
    var y = this;

    if (x instanceof Expression && y instanceof Multiplication) {
      return x.multiply(y.a).multiply(y.b);
    }
    if (x instanceof Multiplication && y instanceof Expression) {
      var c = compare4Multiplication2(x.b, y);
      if (c === 0) {
        return x.a.multiply(x.b.multiply(y));
      }
      return c > 0 ? x.a.multiply(y).multiply(x.b) : new Multiplication(x, y);
    }

    //!
    /*
    if (x instanceof IdentityMatrix && y instanceof MatrixSymbol) {
      return y;
    }
    if (y instanceof IdentityMatrix && x instanceof MatrixSymbol) {
      return x;
    }
    */
    //!
    // rest

    var c = 0;
    if (x instanceof Integer && y instanceof Expression.Symbol) {
      return multiplyByInteger(x, y);
    }
    if (x instanceof Expression.Symbol && y instanceof Integer) {
      return multiplyByInteger(y, x);
    }
    if (x instanceof Expression.Symbol && y instanceof Expression.Symbol) {
      c = compare4Multiplication(x, y);
      if (c === 0) {
        return x.pow(Expression.TWO);
      }
      return c > 0 ? new Multiplication(y, x) : new Multiplication(x, y);
    }
    if (x instanceof Integer && y instanceof Exponentiation) {
      return multiplyByInteger(x, y);
    }
    if (x instanceof Exponentiation && y instanceof Integer) {
      return multiplyByInteger(y, x);
    }
    //!new 2022-06-20
    //TODO: FIX
    if (getBase(x) instanceof Expression.MatrixSymbol || getBase(y) instanceof Expression.MatrixSymbol) {
      c = compare4Multiplication(getBase(x), getBase(y));
      if (c === 0) {
        if (getExponent(x).equals(new Expression.Symbol("T")) || getExponent(y).equals(new Expression.Symbol("T"))) {
          return new Multiplication(x, y);
        }
      }
    }
    if (x instanceof Exponentiation && y instanceof Expression.Symbol) {
      c = compare4Multiplication(getBase(x), y);
      if (c === 0) {
        return y.pow(getExponent(x).add(Expression.ONE));
      }
      return c > 0 ? new Multiplication(y, x) : new Multiplication(x, y);
    }
    if (x instanceof Expression.Symbol && y instanceof Exponentiation) {
      c = compare4Multiplication(x, getBase(y));
      if (c === 0) {
        return x.pow(getExponent(y).add(Expression.ONE));
      }
      return c > 0 ? new Multiplication(y, x) : new Multiplication(x, y);
    }
    if (x instanceof Exponentiation && y instanceof Exponentiation) {
      c = compare4Multiplication(getBase(x), getBase(y));
      if (c === 0) {
        return getBase(x).pow(getExponent(x).add(getExponent(y)));
      }
      return c > 0 ? new Multiplication(y, x) : new Multiplication(x, y);
    }

    if (x instanceof SquareRoot && y instanceof SquareRoot) {
      if (x.a instanceof Integer && y.a instanceof Exponentiation) {//TODO: fix
        return new Multiplication(x, y);
      }
      // optimization:
      var g = x.a.gcd(y.a);
      return g.multiply(x.a.divide(g).multiply(y.a.divide(g)).squareRoot());
      //return x.a.multiply(y.a).squareRoot();
    }
    if (x instanceof NthRoot && x.n === 3 && y instanceof NthRoot && y.n === 3) {
      // optimization:
      //var g = x.a.gcd(y.a);
      //return g.pow(2/3).multiply(x.a.divide(g).multiply(y.a.divide(g))._nthRoot(3));
      return x.a.multiply(y.a)._nthRoot(3);
    }
    if (x instanceof NthRoot && y instanceof NthRoot) {
      //if (x.n === y.n) {
      //  return x.a.multiply(y.a)._nthRoot(x.n);
      //}
      //!2021-02-02 - hack
      if (x.a instanceof Integer && !(y.a instanceof Integer) && x.n < y.n && getVariable(y.a)._pow(2).gcd(x.a).equals(x.a)) {
        if (Expression.isConstant(x) && Expression.isConstant(y)) {
          return y.multiply(x);
        }
      }
      //!
      var ng = Math.gcd(x.n, y.n);
      //TODO: remove check for integers (?)
      if (!(x.a instanceof Integer) && (!(y.a instanceof Integer) || !x.a._pow(2).gcd(y.a).equals(Expression.ONE) || getVariable(x.a)._pow(2).gcd(y.a).equals(getVariable(x.a)._pow(2))) || !x.a.gcd(y.a).equals(Expression.ONE)) {
        var v = Expression.pow(x.a, y.n / ng).multiply(Expression.pow(y.a, x.n / ng));
        var nn = x.n / ng * y.n;
        return v._nthRoot(nn);
      }
      if (!(x.a instanceof Integer) && x.n === 2 && y.a instanceof Integer && y.n === 4 && !(getConstant(x.a.getNumerator()).multiply(y.a)._nthRoot(y.n) instanceof NthRoot)) {//HACK
        return x.a.multiply(y.a._nthRoot(2))._nthRoot(2);
      }
      return x.n < y.n ? new Multiplication(x, y) : (x.n > y.n ? new Multiplication(y, x) : x.a.multiply(y.a)._nthRoot(x.n));
    }

    //!
    if (x instanceof MatrixSymbol && y instanceof Expression.Matrix) {
      return new Multiplication(x, y);
    }
    if (x instanceof Expression.Matrix && y instanceof MatrixSymbol) {
      return new Multiplication(x, y);
    }
    if (has(x, MatrixSymbol) && y instanceof Expression.Matrix) { // X^2*{{1,2},{3,4}}
      return new Multiplication(x, y);
    }
    if (x instanceof Expression.Matrix && has(y, MatrixSymbol)) { // {{1,2},{3,4}}*X^2
      return new Multiplication(x, y);
    }

    //!
    //throw new RangeError();
    if (x instanceof Integer && y instanceof Expression) {
      if (x.compareTo(Expression.ZERO) === 0) {
        return x;
      }
      if (x.compareTo(Expression.ONE) === 0) {
        return y;
      }
    }
    if (x instanceof Expression && y instanceof Integer) {
      if (y.compareTo(Expression.ZERO) === 0) {
        return y;
      }
      if (y.compareTo(Expression.ONE) === 0) {
        return x;
      }
    }

/*
    // TODO: remove
    if (x instanceof Expression.Complex && y instanceof Expression.ExponentiationOfImaginaryUnit) {
      //!hack
      //TODO: remove
      if (x.real.equals(Expression.ZERO)) {
        if (!x.equals(Expression.I)) {
        //if (x.primeFactor().equals(y.a)) {//TODO: fix
        if (y.a.equals(Expression.I)) {//TODO: fix
        return x.imaginary.multiply(y.multiply(Expression.I));
        }
        //}
        }
      } else {
        if (getBase(y).equals(Expression.I)) {//TODO: remove
          return x.imaginary.multiply(Expression.I).multiply(y).add(x.real.multiply(y));
        }
      }
    }
    if (x instanceof Expression.ExponentiationOfImaginaryUnit && y instanceof Expression.Complex) {
      //!hack
      //TODO: remove
      if (y.real.equals(Expression.ZERO)) {
        if (!y.equals(Expression.I)) {
        return y.imaginary.multiply(x.multiply(Expression.I));
        }
      } else {
        if (getBase(x).equals(Expression.I)) {//TODO: remove
        return y.imaginary.multiply(Expression.I).multiply(x).add(y.real.multiply(x));
        }
      }
    }
*/

    //var cmp = x instanceof Expression.Complex && y instanceof Expression.ExponentiationOfImaginaryUnit && !x.equals(getBase(y)) ? -1 : (x instanceof Expression.ExponentiationOfImaginaryUnit && y instanceof Expression.Complex && !y.equals(getBase(x)) ? +1 : compare4Multiplication(getBase(x), getBase(y)));
    var cmp = x instanceof Expression.Complex && y instanceof Expression.ExponentiationOfImaginaryUnit ? -1 : (x instanceof Expression.ExponentiationOfImaginaryUnit && y instanceof Expression.Complex ? +1 : compare4Multiplication(getBase(x), getBase(y)));
    if (cmp === 0) {
      return getBase(x).pow(getExponent(x).add(getExponent(y)));
    }
    if (cmp < 0) {
      return new Multiplication(x, y);
    }
    if (cmp > 0) {
      return new Multiplication(y, x);
    }

  };

  function Iterator() {
  }
  if ("\v" !== "v") {
    Object.defineProperty(Iterator.prototype, "done", {
      get: function () {
        return this.value == null;
      }
    });
  }
  Iterator.prototype[globalThis.Symbol.iterator] = function () {
    return this;
  };

  function TermFactorsIterator(e) {
    this.value = undefined;
    this.e = e;
  }
  TermFactorsIterator.prototype = Object.create(Iterator.prototype);
  TermFactorsIterator.prototype.next = function () {
    this.value = this.e instanceof Multiplication ? this.e.b : (this.e instanceof Integer || this.e instanceof Expression.Complex || this.e instanceof Expression.ExpressionPolynomialRoot ? null : this.e);
    this.e = this.e instanceof Multiplication ? this.e.a : undefined;
    return this;
  };

  function termFactors(e) {
    return new TermFactorsIterator(e);
  }

  var compare4Addition = function (x, y) {
    // undefined | Symbol | Exponentiation | Multiplication
    var i = termFactors(x);
    var j = termFactors(y);
    var a = i.next().value;
    var b = j.next().value;
    while (a != null && b != null) {

      //!
      // x^3*y^2, x^2*y^3
      var cmp = 0 - compare(getBase(a), getBase(b));
      if (cmp === 0) {
        cmp = compare(getExponent(a), getExponent(b));
      }
      if (cmp !== 0) {
        return cmp;
      }
      a = i.next().value;
      b = j.next().value;
    }
    //!new 2020-02-13
    if (a instanceof Expression.Matrix || b instanceof Expression.Matrix) {
      if (y instanceof Integer && x instanceof Multiplication) {
        return +1;//?
      }
      if (x instanceof Integer && y instanceof Multiplication) {
        return -1;//?
      }
      if (a != null && i.next().value != null) {
        return +1;
      }
      if (b != null && j.next().value != null) {
        return -1;
      }
      return 0;
    }
    //!
    return a != null ? +1 : (b != null ? -1 : 0);
  };

  var addSimilar = function (x, y) {
    if (x instanceof Expression.Matrix && y instanceof Expression.Matrix) {
      return x.add(y);
    }
    var c1 = getConstant(x);//TODO: remove (?)
    var c2 = getConstant(y);
    var i = termFactors(getTerm(x));
    var j = termFactors(getTerm(y));
    var a = i.next().value;
    var b = j.next().value;
    var result = Expression.ONE;
    var added = false;
    while (a != null || b != null) {
      var f = null;
      if (a instanceof Expression.Matrix &&
          a.matrix.isScalar() &&
          isScalar(a.matrix.e(0, 0)) && !a.matrix.e(0, 0).equals(Expression.ZERO) && //TODO: !?
          b instanceof Expression.Matrix &&
          b.matrix.isScalar() &&
          isScalar(b.matrix.e(0, 0)) && !b.matrix.e(0, 0).equals(Expression.ZERO) && //TODO: !?
          a.matrix.rows() === b.matrix.rows() && a.matrix.cols() === b.matrix.cols() &&
          !a.equals(b)) {
        var f = function (a, x) {
          //return Expression._map(e => e.equals(a) ? a.matrix.divide(a.matrix.e(0, 0)) : e, a.matrix.e(0, 0).multiply(x));
          return a.matrix.e(0, 0).multiply(x).multiply(a.inverse());
        };
        return addSimilar(f(a, x), f(b, y));
      } else if (!added && (a instanceof Expression.Matrix || b instanceof Expression.Matrix) && (a == null || b == null || !a.equals(b))) {
        added = true;
        f = (a == null ? c1 : a.multiply(c1)).add(b == null ? c2 : b.multiply(c2));
        c1 = Expression.ONE;
        c2 = Expression.ONE;
      } else {
        if (!a.equals(b)) {
          //throw new TypeError();
          return null;
        }
        f = a;
      }
      result = f.multiply(result);//!TODO: depends on the iteration order !!!
      a = i.next().value;
      b = j.next().value;
    }
    if (!added) {
      result = c1.add(c2).multiply(result);
    }
    return result;
  };

  Expression.getComplexNumberParts = function (e) {
    if (e instanceof Expression.Division) {
      var tmp = Expression.getComplexNumberParts(e.getNumerator());
      return {real: tmp.real.divide(e.getDenominator()), imaginary: tmp.imaginary.divide(e.getDenominator())};
    }
    if (!Expression.has(e, Expression.Complex)) {
      return {real: e, imaginary: Expression.ZERO};
    }
    var real = [];
    var imaginary = [];
    for (var x of e.summands()) {
      var c = undefined;
      for (let y of x.factors()) {
        if (c == undefined && y instanceof Expression.Complex) {
          c = y;
        }
      }
      if (c == undefined) {
        real.push(x);
      } else if (c.real.equals(Expression.ZERO)) {
        imaginary.push(x.multiply(Expression.I.negate()));
      } else {
        var r = null;
        if (x !== c) {
          for (var y of x.factors()) {
            if (y !== c) {
              r = r == null ? y : r.multiply(y);
            }
          }
        }
        if (r == null) {
          //TODO: !?
          real.push(c.real);
          imaginary.push(c.imaginary);
        } else {
          real.push(r.multiply(c.real));
          imaginary.push(r.multiply(c.imaginary));
        }
      }
    }
    return {
      real: _sum(real),
      imaginary: _sum(imaginary)
    };
  };

  Expression.prototype.addExpression = function (x) {
    var y = this;
    if (x.equals(Expression.ZERO)) {
      return y;
    }
    if (y.equals(Expression.ZERO)) {
      return x;
    }

    //!2019-02-16
    if (x instanceof Multiplication && x.b instanceof IdentityMatrix) {
      var t = getIdentityMatrixCoefficient(y);
      if (t != null) {
        return x.a.add(t).multiply(x.b);
      }
    } else if (x instanceof IdentityMatrix) {
      var t = getIdentityMatrixCoefficient(y);
      if (t != null) {
        return Expression.ONE.add(t).multiply(x);
      }
    }
    if (y instanceof Multiplication && y.b instanceof IdentityMatrix) {
      var t = getIdentityMatrixCoefficient(x);
      if (t != null) {
        return t.add(y.a).multiply(y.b);
      }
    } else if (y instanceof IdentityMatrix) {
      var t = getIdentityMatrixCoefficient(x);
      if (t != null) {
        return t.add(Expression.ONE).multiply(y);
      }
    }
    //!2019-02-16

    //!new 2019-09-30
    /*
    if (x instanceof Expression.Addition && y instanceof Expression.Matrix) {//TODO:
      return x.a.add(x.b.add(y));
    }
    if (x instanceof Expression.Matrix && y instanceof Expression.Addition) {
      return x.add(y.a).add(y.b);
    }
    if (x instanceof Expression.Addition && y instanceof Expression.Addition) {
      if (x.b instanceof Expression.Matrix && y.b instanceof Expression.Matrix) {
        return x.a.add(x.b.add(y));
      }
    }
    */

    // rest
    
    //!new 2020-12-26
    if (/*Expression.isConstant(x) && Expression.isConstant(y) && */
        (has2(x, Expression.Complex) || has2(y, Expression.Complex)) &&
        (has2(x, Expression.ExpressionPolynomialRoot) || has2(y, Expression.ExpressionPolynomialRoot))) {
      var tmp = Expression.getComplexNumberParts(x);
      var tmp1 = Expression.getComplexNumberParts(y);
      var re = tmp.real.add(tmp1.real);
      var im = tmp.imaginary.add(tmp1.imaginary);
      if (im.equals(Expression.ZERO)) {
        return re;
      }
      if (!(im instanceof Expression.Addition)) {
        if (re.equals(Expression.ZERO)) {
          return im.multiply(Expression.I);
        }
        if (!has2(re, Expression.ExpressionPolynomialRoot) &&
            !has2(im, Expression.ExpressionPolynomialRoot)) {
          return re.add(im.multiply(Expression.I));
        }
        return new Expression.Addition(re, im.multiply(Expression.I));
      }
    }
    //!

    var i = x.summands();
    var j = y.summands();
    var a = i.next().value;
    var dontMove = 0;
    var b = j.next().value;
    var s = [];
    //a + b, compare4Addition("a", "b") > 0
    while (a != null && b != null) {
      var c = compare4Addition(a, b);
      if (c < 0) {
        s.push(a);
        a = i.next().value;
      } else if (c > 0) {
        s.push(b);
        b = j.next().value;
      } else {
        if (has2(a, Expression.Matrix) || has2(b, Expression.Matrix)) {
          var last = addSimilar(a, b);
          if (last != null) {
            if (!last.equals(Expression.ZERO)) {
              s.push(last);
            }
          } else {
            //TODO: fix
            s.push(a);
            s.push(b);
          }
        } else {
          const constantA = getConstant(a, true);
          const constantB = getConstant(b, true);
          const termA = getTerm(a, true) || Expression.ONE;
          const termB = getTerm(b, true) || Expression.ONE;
          const constant = (termA.equals(termB) ? constantA : constantA.multiply(termA.divide(termB))).add(constantB);
          const last = termB === Expression.ONE ? constant : (constant instanceof Expression.Addition ? new Expression.Multiplication(constant, termB) : constant.multiply(termB));
          dontMove = 0;
          if (!last.equals(Expression.ZERO)) {
            if (Expression.has(last, Expression.ExpressionPolynomialRoot)) {
              if (Expression.has(a, Expression.ExpressionPolynomialRoot)) {
                a = last;
                dontMove = 1;
              } else {
                b = last;
                dontMove = 2;
              }
            } else {
              s.push(last);
            }
          }
        }
        if (dontMove !== 1) {
          a = i.next().value;
        }
        if (dontMove !== 2) {
          b = j.next().value;
        }
      }
    }
    while (a != null) {
      s.push(a);
      a = i.next().value;
    }
    while (b != null) {
      s.push(b);
      b = j.next().value;
    }
    if (s.length === 0) {
      return Expression.ZERO;
    }
    var accumulator = s[s.length - 1];
    for (var k = s.length - 2; k >= 0; k -= 1) {
      var currentValue = s[k];
      accumulator = new Addition(accumulator, currentValue);
    }
    return accumulator;
  };

  var divideByInteger = function (e, f) {
    if (f.equals(Expression.ZERO)) {
      throw new TypeError("ArithmeticException");
    }
    var result = [];
    for (var x of e.summands()) {
      var rest = Expression.ONE;
      var t = undefined;
      // TODO: check, fix?
      for (var y of x.factors()) {
        var z = y;
        if (z instanceof Integer || z instanceof Expression.Complex || z instanceof Expression.ExpressionPolynomialRoot) {
          if (t != undefined) {
            console.warn("!");
            t = t.multiply(z);
          } else {
            t = z;
          }
        } else {
          if (rest === Expression.ONE) {
            rest = z;
          } else {
            rest = z.multiply(rest);
          }
        }
      }
      if (!(t instanceof Expression.Complex)) {
      if (!(t instanceof Integer)) {
      if (!(t instanceof Expression.ExpressionPolynomialRoot)) {
        throw new RangeError();
      }
      }
      }
      var summand = null;
      if (t instanceof Expression.ExpressionPolynomialRoot) {//TODO: 
        summand = t.divide(f).multiply(rest);
      } else {
        summand = t.truncatingDivide(f).multiply(rest);
      }
      result.push(summand);
    }
    return _sum(result);
  };

  Expression.getCoefficients = function (e, v) {
    if (e.equals(Expression.ZERO)) {
      return [];
    }
    var result = [];
    for (var x of e.summands()) {
      var d = Expression.ZERO;
      var c = Expression.ONE;
      for (var y of x.factors()) {
        var t = y;
        for (var ve of getVariableInternal(t)) {
          if (ve.v.equals(v)) {
            d = d.add(ve.e);
          } else {
            c = c.multiply(ve.e === Expression.ONE ? ve.v : ve.v.pow(ve.e));
          }
        }
      }
      var degree = d.toNumber();
      result.push({
        degree: degree,
        coefficient: c
      });
    }
    result.sort((a, b) => b.degree - a.degree);
    var k = -1;
    for (var i = 0; i < result.length; i += 1) {
      var x = result[i];
      if (k === -1 || x.degree !== result[k].degree) {
        k += 1;
        result[k] = {
          degree: x.degree,
          coefficient: []
        };
      }
      result[k].coefficient.push(x.coefficient);
    }
    result.length = k + 1;
    for (var i = 0; i < result.length; i += 1) {
      result[i] = {
        degree: result[i].degree,
        coefficient: _sum(result[i].coefficient)
      };
    }
    return result;
  };

  //TODO: remove
  var getFirstAdditionOperand = function (x) {
    var result = x;
    while (result instanceof Addition) {
      result = result.a;
    }
    return result;
  };
  //TODO: remove
  var getLastMultiplicationOperand = function (x) {
    var result = x;
    while (result instanceof Multiplication) {
      result = result.b;
    }
    return result;
  };

  function VIterator(v) {
    if (v == undefined) {
      throw new TypeError();
    }
    this.value = undefined;
    this.v = v;
  }
  VIterator.prototype = Object.create(Iterator.prototype);
  VIterator.prototype.next = function () {
    this.value = this.v;
    this.v = undefined;
    return this;
  };

  function VariablesIterator(v, additions) {
    if (additions == undefined) {
      throw new TypeError();
    }
    this.value = undefined;
    this.v = v;
    this.additions = additions;
  }
  VariablesIterator.prototype = Object.create(Iterator.prototype);
  VariablesIterator.prototype.next = function () {
    var x = this.additions.next().value;
    var value = null;
    if (x == null) {
      value = null;
    } else if (x instanceof Expression.Symbol) {
      value = {v: new Exponentiation(this.v, x), e: Expression.ONE};
    } else if (x instanceof Expression.NthRoot) {//!new 2019-11-30
      value = {v: new Exponentiation(this.v, x), e: Expression.ONE};
    } else if (x instanceof Expression.Exponentiation) {//!new 2019-12-01
      value = {v: new Exponentiation(this.v, x), e: Expression.ONE};
    } else if (x instanceof Multiplication && x.a instanceof Integer) {
      value = {v: new Exponentiation(this.v, x.b), e: x.a};
    } else if (x instanceof Multiplication) {
      value = {v: new Exponentiation(this.v, getTerm(x)), e: getConstant(x)};
    } else if (x instanceof Integer) {
      value = {v: this.v, e: x};
    } else if (x instanceof Expression.Division && x.a instanceof Integer && x.b instanceof Integer) {//!new 2019-06-16
      value = {v: this.v, e: x};
    } else if (x instanceof Expression.Division && x.a instanceof NthRoot && x.b instanceof Integer) {//!new 2019-12-01
      //value = {v: new Exponentiation(this.v, x.a), e: x.getDenominator()};
      value = {v: new Exponentiation(this.v, x.getNumerator()), e: Expression.ONE.divide(x.getDenominator())};
    } else if (x instanceof Expression.Division && x.a instanceof Multiplication && x.a.a instanceof Integer && x.b instanceof Integer) {//!new 2019-06-16
      if (this.v instanceof Integer) {
        value = {v: new Exponentiation(this.v, x.a.b), e: x.divide(x.a.b)};
      } else {
      value = {v: this.v, e: x};//?
      }
    } else {
      // this.v instanceof Integer &&
      // && x.a instanceof Expression.Symbol
      if (x instanceof Division && x.b instanceof Integer) {
        var t = getTerm(x.a);
        value = {v: new Exponentiation(this.v, t), e: x.divide(t)};
      } else {
        if (x instanceof Division && x.a instanceof Integer && x.b instanceof Expression.Symbol && (this.v instanceof Integer || this.v instanceof Expression.Symbol || isGoodPolynomial(this.v))) {//TODO: fix ? 2**(1/n)
          var t = Expression.ONE.divide(x.b);
          value = {v: new Exponentiation(this.v, t), e: x.divide(t)};
        } else {
      throw new RangeError();
        }
      }
    }
    this.value = value;
    return this;
  };

  function NumeratorSummandsIterator(e) {
    this.value = undefined;
    this.internal = e.getNumerator().summands();
    this.denominator = e.getDenominator();
  }
  NumeratorSummandsIterator.prototype = Object.create(Iterator.prototype);
  NumeratorSummandsIterator.prototype.next = function () {
    var next = this.internal.next().value;
    this.value = next == null ? null : next.divide(this.denominator);
    return this;
  };

  var getVariableInternal = function (t) {
    if (t instanceof Expression.ExponentiationOfMinusOne) {//TODO: ?
      return new VIterator({v: t, e: Expression.ONE});
    }
    if (t instanceof Expression.ExponentiationOfImaginaryUnit) {//TODO: ?
      return new VIterator({v: t, e: Expression.ONE});
    }
    var v = getBase(t);
    var e = getExponent(t);

    //!new 2017-05-08
    if (enableEX) {
      if (!(e instanceof Integer)) {
        var additions = new NumeratorSummandsIterator(e);
        return new VariablesIterator(v, additions);
      }
    }
    //!
    return new VIterator({v: v, e: e});
  };

  var getVariable = function (e, options = null) {
    if (options == null || !options.avoidNthRoots) {
    //? square roots at first
    for (var x of e.summands()) {
      for (var y of x.factors()) {
        if (y instanceof NthRoot) {
        //TODO: assert(y instanceof Integer)
          return y;
        }
      }
    }
    //?
    }

    var result = getVariableInternal(getLastMultiplicationOperand(getFirstAdditionOperand(e))).next().value.v;
    //!?
    //if (result instanceof NthRoot) {
    //  return undefined;
    //}
    //
    if (result instanceof Expression.Complex) {
      return undefined;//?
    }
    if (result instanceof Integer) {
      return undefined;//?
    }
    if (options != null && options.avoidNthRoots) {
      if (result instanceof NthRoot) {
        return undefined;
      }
    }
    return result;
  };

  Expression.getVariable = getVariable;

  var lastMaxSize = 1;
  var integerGCD = function (x, y) {
    if (x instanceof Expression.Complex && x.real.equals(Expression.ZERO)) {
      x = x.imaginary;
    }
    if (y instanceof Expression.Complex && y.real.equals(Expression.ZERO)) {
      y = y.imaginary;
    }
    if (x instanceof Expression.Integer && y instanceof Expression.Integer) {
      return Expression.Integer.fromBigInt(bigIntGCDWrapper(x.value, y.value));
    }
    var a = x;
    var b = y;
    while (!b.equals(Expression.ZERO)) {
      var r = a.remainder(b);
      a = b;
      b = r;
    }
    return a;
  };

  //var getIntegerContent = function (x) {
  //  return x instanceof Expression.Complex ? integerGCD(x.real, x.imaginary) : x;
  //};

  var complexGCD = function (a, b) {//?
    if (a instanceof Expression.ExpressionPolynomialRoot) {
      var x = a.root.getAlphaExpression();
      return complexGCD(Expression.getConstant(x.getNumerator()), b);
    }
    if (b instanceof Expression.ExpressionPolynomialRoot) {
      var x = b.root.getAlphaExpression();
      return complexGCD(a, Expression.getConstant(x.getNumerator()));
    }

    /*if ((a instanceof Expression.ExpressionPolynomialRoot) && b instanceof Integer) {
      return b;
    }
    if (a instanceof Integer && (b instanceof Expression.ExpressionPolynomialRoot)) {
      return a;
    }
    if (a instanceof Expression.ExpressionPolynomialRoot && b instanceof Expression.ExpressionPolynomialRoot) {
      //TODO: ???
      return Expression.ONE;
    }*/
    // return integerGCD(getIntegerContent(a), getIntegerContent(b));
    var x = integerGCD(a, b);
    if (x instanceof Expression.Complex) {
      //TODO: ?
      if (x.real.compareTo(Expression.ZERO) === 0) {
        return x.imaginary;
      }
    }
    if (x instanceof Expression.Integer) {
      if (x.compareTo(Expression.ZERO) < 0) {
        x = x.negate();
      }
    }
    return x;
  };

  var nthRootCommonFactor = function (a, b) {
    if (a instanceof Expression.NthRoot && b instanceof Expression.NthRoot) {//TODO: ?
      // gcd(a**(1/n), b**(1/k)) = gcd(a**(lcm(n,k)/n/lcm(n,k)), b**(lcm(n,k)/k/lcm(n,k))) = gcd(a**(lcm(n,k)/n), b**(lcm(n,k)/k))**(1/lcm(n,k))
      var lcm = a.n / Math.gcd(a.n, b.n) * b.n;
      // gcd(a**n, b**k) = gcd((gcd(a, b)*a/gcd(a, b))**n, (gcd(a, b)*b/gcd(a, b))**k) = gcd(a, b)**min(n, k)
      var radicandsGCD = a.radicand.gcd(b.radicand);
      var min = Math.min(lcm / a.n, lcm / b.n);
      var g = Math.gcd(lcm, min);
      return radicandsGCD._pow(min / g)._nthRoot(lcm / g);
    }
    return null;
  };

  // http://www-troja.fjfi.cvut.cz/~liska/ca/node33.html
  var gcd = function (a, b, v) {
    if (v == undefined) {
      //!TODO: (2020-06-13)
      if (getTerm(a) instanceof Expression.NthRoot && getTerm(b) instanceof Expression.NthRoot) {//TODO: remove (?)
        return gcd(getConstant(a), getConstant(b)).multiply(gcd(a.divide(getConstant(a)), b.divide(getConstant(b))));
      }
      //?
      return complexGCD(getConstant(a, true), getConstant(b, true));
    }

    var r = getReplacement(a, getReplacement(b, v));
    if (!r.equals(v)) {
      return substitute(substitute(a, v, r, inverseReplacement(r, v)).gcd(substitute(b, v, r, inverseReplacement(r, v))), v, inverseReplacement(r, v), r);
    }

    return Polynomial.polynomialGCD(Polynomial.toPolynomial(a, v), Polynomial.toPolynomial(b, v)).calcAt(v);
  };

  // ! new 21.12.2013 (square roots)

  var getConjugateFactor = function (e) {
    var r = -1 / 0;
    for (var x of e.summands()) {
      for (var y of x.factors()) {
        if (y instanceof NthRoot) {
          var degree = y.degree;
          if (r < degree) {
            r = degree;
          }
          if (!(y.a instanceof Integer)) {
            r = 1 / 0;
          }
        }
      }
    }
    var p = undefined;
    for (var x of e.summands()) {
      for (var y of x.factors()) {
        if (y instanceof NthRoot) {
          var degree = y.degree;
          var i = y.a instanceof Integer ? y.a : null;
          if (i == null) {
            i = QuadraticInteger.toQuadraticInteger(y.a);
            if (i != null && p == undefined) {
              var pf = i.primeFactor();
              while (pf.toExpression() instanceof Expression.SquareRoot) {
                i = i.truncatingDivide(pf);
                pf = i.primeFactor();
              }
              i = pf;
            }
          }
          if (i == null) {
            throw new TypeError();
          }
          if (r === 1 / 0 && !(y.a instanceof Integer)) {
            r = degree;
          }
          if (r % degree === 0) {
            if (p == undefined) {
              p = i;
            }
            //TODO: assert(y instanceof Integer)
            if (i != null) {
              var z = integerGCD(p, i);
              if (!z.isUnit()) {
                p = z;//!
              }
              if (z.isUnit() && !(z instanceof Integer) && (p.isUnit() || i.isUnit())) {
                p = z;//?
              }
            } else {
              throw new TypeError();
            }
          }
        }
      }
    }
    //!new 2020-12-16 - ExpressionParser.parse('1/(x+cbrt(18)+cbrt(12))')
    if (p != undefined) {
      if (p instanceof Integer) {//TODO: ?
      p = p.primeFactor();
      }
    }
    //!
    return {p: p, degree: r};
  };

  // TODO: test
  var getConjugate = function (a) {
    var e = undefined;
    e = Expression.getComplexNumberParts(a);
    if (e != undefined && !e.imaginary.equals(Expression.ZERO)) {
      return e.real.subtract(e.imaginary.multiply(Expression.I));
    }
    e = Expression.getNthRootConjugate(a);
    if (e != undefined) {
      if (e.equals(a) && a instanceof Addition) {
        throw new TypeError();
      }
      return e;
    }
    return undefined;
  };

  Expression.getConjugate = getConjugate;

  Expression.getConjugateExpression = function (e) {//?
    try {
      var c = Expression.getConjugate(e);
      if (c != null) {
        return Expression.getConjugateExpression(c.multiply(e));
      }
      return e;
    } catch (error) {
      //TODO: FIX!!!
      console.error(error);
    }
    return null;
  };

  var getPolynomialRelativeToNthRoot = function (e, p, r) {
    // Make a polynomial, with a variable = p**(1/r):
    var polynomial = Polynomial.of();
    for (var x of e.summands()) {
      var degree = 0;
      var coefficient = Expression.ONE;
      for (var y of x.factors()) {
        if (y instanceof NthRoot && (r === y.degree || r % y.degree === 0 && p instanceof Integer)) {
          var i = y.a instanceof Integer ? y.a : null;
          if (i == null) {
            i = QuadraticInteger.toQuadraticInteger(y.a);
          }
          if (i != null) {
            var j = 0;
            var a = i;
            if (p.isUnit()) {
              if (a.isUnit()) {
                j = 1;
                a = a.truncatingDivide(p);
                // a == 3+sqrt(2), p == 1+sqrt(2)
                while (a.primeFactor().equals(p)) {
                  j += 1;
                  a = a.truncatingDivide(p);
                }
              } else {
                if (!(a instanceof Integer)) {
                //TODO: ?
                //throw new TypeError();
                  var tmp = a.truncatingDivide(p);
                  if (!(tmp instanceof Expression.Integer)) {
                    if (Number.isNaN(Number(tmp.a.toString()) * Number(tmp.b.toString()))) {
                      throw new TypeError();//TODO: FIX
                    }
                  }
                  if (tmp instanceof Expression.Integer || Number(tmp.a.toString()) * Number(tmp.b.toString()) >= 0) {
                    j = 1;
                    a = tmp;
                  }
                }
              }
            } else {
              //TODO: optimize using ctz
              while (a.isDivisibleBy(p) && j < y.degree) {//?
                a = a.truncatingDivide(p);
                j += 1;
              }
            }
            a = a.toExpression();
            coefficient = coefficient.multiply(a._nthRoot(y.degree));
            degree += j * (r / y.degree);
          } else {
            throw new TypeError();
          }
        } else {
          coefficient = coefficient.multiply(y);
        }
      }
      //TODO: efficiency ?
      polynomial = polynomial.add(Polynomial.of(coefficient).shift(degree));
    }
    return polynomial;
  };

  // https://en.wikipedia.org/wiki/Conjugate_(square_roots)
  Expression.getNthRootConjugate = function (e) {
    const expression = e;
    if (e instanceof Integer) {
      //optimize to not stop the debugger at common code
      return null;
    }
    if (e instanceof NthRoot) {
      //optimize to not stop the debugger at common code
      return e._pow(e.n - 1);
    }
    if (e instanceof Multiplication && e.a instanceof Integer) {
      //optimize to not stop the debugger at common code
      return Expression.getNthRootConjugate(e.b);
    }
    //!2019-10-20 a workaround
    if (e instanceof Addition &&
        e.a instanceof Multiplication && e.a.a instanceof Integer && e.a.b instanceof NthRoot && e.a.b.n === 3 &&
        e.b instanceof Multiplication && e.b.a instanceof Integer && e.b.b instanceof NthRoot && e.b.b.n === 3) {
      // (aa-ab+bb)
      return e.a._pow(2).subtract(e.a.multiply(e.b)).add(e.b._pow(2));
    }
    //!
    //?
    //if (e instanceof Expression.Exponentiation && getExponent(e).equals(Expression.ONE.divide(Expression.TWO))) {//TODO: FIX
      //return e;//?
    //}
    //?

  //TODO: fix
    var tmp = getConjugateFactor(e);
    var p = tmp.p;
    var r = tmp.degree;
    if (p == undefined) {
      return undefined;
    }
    var polynomial = getPolynomialRelativeToNthRoot(e, p, r);
    polynomial = polynomial.divideAndRemainder(Polynomial.of(polynomial.getContent()), "throw").quotient;//!new
    const x = p.toExpression();
    const mod = Polynomial.of(Expression.ONE).shift(r).subtract(Polynomial.of(x));
    const conjugate2 = polynomial.modularInverse(mod).primitivePart();
    return conjugate2.calcAt(x._nthRoot(r));
  };

  // without the checks
  Expression.collectLinearEquationVariables = function (e) {
    if (e instanceof Division) {
      throw new RangeError();
    }
    var list = [];
    for (var x of e.summands()) {
      var v = undefined;
      var c = Expression.ONE;
      var NO_VARIABLE = "";
      for (var y of x.factors()) {
        if (y instanceof Expression.Symbol && v == undefined) {
          v = y;
        } else {
          if (!(y instanceof Integer) && !(y instanceof NthRoot)) {
            if (v == undefined) {
              v = NO_VARIABLE;
            }
          }
          c = c.multiply(y);
        }
      }
      if (v == undefined) {
        v = NO_VARIABLE;
      }
      var variable = v === NO_VARIABLE ? "" : v.toString();
      list.push({c: c, v: variable});
    }
    return list;
  };

  var has = function (e, Class) {
    if (e instanceof Class) {
      return true;
    }
    if (e instanceof BinaryOperation) {
      if (e instanceof Addition) {
        while (e instanceof Addition) {
          if (has(e.b, Class)) {
            return true;
          }
          e = e.a;
        }
        return has(e, Class);
      }
      if (has(e.b, Class)) {
        return true;
      }
      return has(e.a, Class);
    }
    if (e instanceof Negation) {
      return has(e.b, Class);
    }

    if (e instanceof Expression.Function) {
      return has(e.a, Class);
    }
    return false;//?
  };
  Expression.has = has;

  var has2 = function (e, Class) {
    do {
      var e1 = null;
      if (e instanceof Addition) {
        e1 = e.b;
        e = e.a;
      } else {
        e1 = e;
        e = null;
      }
      do {
        var e2 = null;
        if (e1 instanceof Multiplication) {
          e2 = e1.b;
          e1 = e1.a;
        } else {
          e2 = e1;
          e1 = null;
        }
        if (e2 instanceof Class) {
          return true;
        }
      } while (e1 != null);
    } while (e != null);
    return false;
  };

  var inverseReplacement = function (e, v) {
    var t = v;
    while (!e.equals(v)) {
      if (e instanceof Expression.Exponentiation && e.b instanceof Multiplication && v instanceof Exponentiation) {
        t = t.pow(e.b.a.inverse());
        e = e.pow(e.b.a.inverse());
      } else if (e instanceof Expression.Exponentiation) {
        t = t.pow(getExponent(e).inverse());
        e = getBase(e);
      } else if (e instanceof Addition) {
        if (!(e.b instanceof Integer)) {
          throw new RangeError();
        }
        t = t.subtract(e.b);
        e = e.a;
      } else if (e instanceof Multiplication) {
        if (!(e.a instanceof Integer)) {
          throw new RangeError();
        }
        t = t.divide(e.a);
        e = e.b;
      } else if (e instanceof Division) {
        if (!(e.b instanceof Integer)) {
          throw new RangeError();
        }
        t = t.multiply(e.b);
        e = e.a;
      } else {
        if ((Expression.E === e) || (e instanceof Integer && e.compareTo(Expression.ONE) > 0) && getBase(v).equals(e)) {//!new 2019-09-23
          t = t.pow(getExponent(v));
          e = v;
        } else {
          throw new TypeError();
        }
      }
    }
    return t;
  };

  var h = function (e, n, q) {
    for (var x of e.summands()) {
      for (var y of x.factors()) {
        if (getBase(q).equals(getBase(y))) {
          n = n.lcm(getExponent(y).getDenominator());
        }
      }
    }
    return n;
  };

  // t=sqrt(x**2+1)
  Replacement._counter = 0;
  function Replacement(from) {
    this.from = getBase(from);
    this.to = new Expression.Symbol("$t" + (++Replacement._counter)).pow(getExponent(from).getDenominator());
  }
  Replacement.prototype.apply = function (e) {
    var from = this.from;
    var to = this.to;
    var variable = getVariable(from);
    var p1 = Polynomial.toPolynomial(from.subtract(to), variable);
    
    return Expression._map(function (x) {
      if (!Expression.has(x, Expression.Division)) {
        var p2 = Polynomial.toPolynomial(x, variable);
        return p2.divideAndRemainder(p1).remainder.calcAt(variable);
      }
      return x;
    }, e);
  };
  Replacement.prototype.undo = function (e) {
    var variable = getBase(this.to);
    var r = this.from.pow(getExponent(this.to).inverse());
    return Expression._map(function (x) {
      if (x.equals(variable)) {
        return r;
      }
      return x;
    }, e);
  };
  Replacement.prototype.equals = function () {
    return true;//TODO: ?
  };

  // a^(2/3)+a^(1/3), a->a**3
  // -2*(-1)^n*3^(n/2)+2*3^(n/2), 3^n -> 3^(2*n)
  // (4*k+1)^(1/2)-1, k->(k^2-1)/4
  var getReplacement = function (e, v, originalVariable) {
    if (v instanceof Replacement) {
      return v;
    }
    for (var x of e.summands()) {
      for (var y of x.factors()) {
        if (y instanceof Expression.Exponentiation && (Expression.has(y.a, Expression.Symbol) || y.a instanceof Integer && y.a.compareTo(Expression.ONE) > 0) && y.b instanceof Expression.Division) {
          if (getBase(v).equals(y.a)) {
            //v = new Expression.Exponentiation(y.a, y.b.b.lcm(getExponent(v).getNumerator()));
            v = new Expression.Exponentiation(y.a, getConstant(y.b.b).lcm(getExponent(v).getNumerator()).divide(getExponent(v).getDenominator()));
          } else if (getBase(v) instanceof Expression.Symbol) {
            if ((y.a instanceof Expression.Addition && y.a.a.divide(getBase(v)) instanceof Integer && y.a.b instanceof Integer) && (y.b instanceof Division && y.b.a instanceof Integer && y.b.b instanceof Integer)) {
              var n = y.b.getDenominator();
              n = h(e, n, y);//!
              //TODO: ?
              //debugger;
              // sqrt(y.a.a + y.a.b) = t
              // k * v = y.a.a = t**2 - y.a.b
              // v = (t**2 - y.a.b) / (y.a.a / v)
              var t = getBase(v).pow(n).subtract(y.a.b).divide(y.a.a.divide(getBase(v)));
              return t;
            } else {
              //TODO: test
              //throw new TypeError();
              if (originalVariable != null && originalVariable.equals(y.a)) {
                return new Replacement(y);
              }
            }
          }
        }
      }
    }
    return v;
  };

  Expression._getReplacement = getReplacement;

  var substitute = function (e, a, b, inv) {
    if (e.equals(a)) {
      return b;
    }
    if (e instanceof Expression.Exponentiation) {
      if (e.equals(inv)) {
        return a;
      }
      if (getBase(e).equals(getBase(inv))) {//!new 2019-09-23
        return a.pow(getExponent(e).divide(getExponent(inv)));
        //TODO: add an assertion below
      }
    }

    if (e instanceof Expression.Addition) {
      return substitute(e.a, a, b, inv).add(substitute(e.b, a, b, inv));
    }
    if (e instanceof Expression.Multiplication) {
      return substitute(e.a, a, b, inv).multiply(substitute(e.b, a, b, inv));
    }
    if (e instanceof Expression.Exponentiation) {
      var x = substitute(e.a, a, b, inv);
      var y = substitute(e.b, a, b, inv);
      //console.log(x + ' ' + y + ' ' + a + ' ' + b + ' ' + inv);
      if (x instanceof Expression.Exponentiation &&
          getBase(x).equals(getBase(inv)) &&
          getExponent(inv).getDenominator().remainder(Expression.TWO).equals(Expression.ZERO)) {
        //TODO: FIX
        return getBase(x).pow(getExponent(x).multiply(y));
      }
      return x.pow(y);
    }
    //return e;

    //! for sin.js:
    if (e instanceof Division) {
      return substitute(e.a, a, b, inv).divide(substitute(e.b, a, b, inv));
    }
    if (e instanceof Expression.Sin) {
      return substitute(e.a, a, b, inv).sin();
    }
    if (e instanceof Expression.Cos) {
      return substitute(e.a, a, b, inv).cos();
    }
    return e;
  };

  Expression._substitute = substitute;

  Expression.prototype.divideExpression = function (x) {
    var y = this;

    //if (Expression.getIdentityMatrixCoefficient(x) != undefined) {
    //  if (y instanceof Expression.Matrix) {
    //    return Expression.getIdentityMatrixCoefficient(x).divide(y);
    //  }
    //  return Expression.makeIdentityMatrixWithCoefficient(Expression.getIdentityMatrixCoefficient(x).divide(y));
    //}
    //if (Expression.getIdentityMatrixCoefficient(y) != undefined) {
    //  if (x instanceof Expression.Matrix) {
    //    return x.divide(Expression.getIdentityMatrixCoefficient(y));
    //  }
    //  return Expression.makeIdentityMatrixWithCoefficient(x.divide(Expression.getIdentityMatrixCoefficient(y)));
    //}

    //if (has(x, IdentityMatrix)) {//?
    //  throw new RangeError("NotSupportedError");
    //}
    //if (has(x, MatrixSymbol)) {
    //  throw new RangeError("NotSupportedError");
    //}

if (simplifyIdentityMatrixPower) {
    if (x instanceof Multiplication && x.b instanceof IdentityMatrix) {
      return x.b.equals(y) ? x.a : x.a.divide(y).multiply(x.b);
    } else if (x instanceof IdentityMatrix) {
      return Expression.ONE.divide(y).multiply(x);
    }
    if (y instanceof Multiplication && y.b instanceof IdentityMatrix) {
      return x.divide(y.a).multiply(y.b);
    } else if (y instanceof IdentityMatrix) {
      return x.multiply(y);
    }
}

    if (has(y, MatrixSymbol)) {
      //!?
      var tmp = getBase(y) instanceof MatrixSymbol ? y.pow(Expression.ONE.negate()) : new Expression.Exponentiation(y, Expression.ONE.negate());
      if (x.equals(Expression.ONE)) {
        if (y instanceof Multiplication) {
          //!?
          //TODO: info about properties of the Matrix Inversion
          if (Expression.callback != undefined) {
            Expression.callback(new Expression.Event("property-inverse-of-multiplication", {matrix: "{{0}}"}));
          }
          return x.multiply(Expression.ONE.divide(y.b).multiply(Expression.ONE.divide(y.a)));
        }
        if (y instanceof Addition && !has(y, Expression.Matrix)) {
          var f = Expression.simpleDivisor(y);
          if (f != null && !f.equals(Expression.ONE) && isScalar(f) && !gcd(f, y).equals(Expression.ONE)) {
            return x.multiply(Expression.ONE.divide(f).multiply(Expression.ONE.divide(y.divide(f))));
          }
        }
        return tmp;
      }
      //return x.multiply(tmp);
      //return new Expression.Multiplication(x, tmp);
      //throw new RangeError("NotSupportedError");
    }

    if (x instanceof Expression.Matrix && y instanceof Expression.Matrix) {
      // TODO: callback ???
      return new Expression.Matrix(x.matrix.multiply(y.matrix.inverse()));
    }
    if (x instanceof Expression.Matrix && y instanceof Expression) {
      //return new Expression.Matrix(x.matrix.scale(y.inverse()));
      return x.multiply(y.inverse());
    }
    if (x instanceof Expression && y instanceof Expression.Matrix) {
      if (Expression.callback != undefined) {
        Expression.callback(new Expression.Event(y.matrix.getDeterminantEventType("inverse").type, y));
      }
      //return new Expression.Matrix(y.matrix.inverse().scale(x));
      return new Expression.Matrix(y.matrix.inverse()).multiply(x);
    }

    if (y.equals(Expression.ZERO)) {
      //TODO: fix?
      throw new TypeError("ArithmeticException");
    }
    if (x.equals(Expression.ZERO)) {
      return Expression.ZERO;
    }
    if (y.equals(Expression.ONE)) {
      return x;
    }
    
    //!!! new (2021-04-05)
    // hack!
    //TODO: remove - ?
    var term = getTerm(y);
    if (term instanceof Expression.Exponentiation && getBase(term) === Expression.E && (getExponent(term) instanceof Expression.ExpressionPolynomialRoot)) {
      //if (Expression.isConstant(term.b.e)) {
        if (getTerm(x) instanceof Expression.Exponentiation && getExponent(getTerm(x)) instanceof Expression.ExpressionPolynomialRoot) {
          if ((x instanceof Expression.Exponentiation || x instanceof Expression.Multiplication) && (y instanceof Expression.Exponentiation || y instanceof Expression.Multiplication)) {
            return getExponent(getTerm(x)).subtract(getExponent(getTerm(y))).exp().multiply(getConstant(x).divide(getConstant(y)));
          }
        }
        if (getExponent(getTerm(y)).isNegative()) {
        return x.multiply(term.inverse()).divide(y.divide(term));
        }
      //}
    }
    //!!!

    //!!! new (21.12.2013)
    if (true) { //TODO: remove hack!
      var e = getConjugate(y);
      if (e != undefined) {
        if (e.equals(Expression.ONE)) {
          //!
          if (Expression.isConstant(y)) {
            return x.multiply(Expression._map(function (x) { return x instanceof NthRoot ? Expression.toPolynomialRoot(x) : x; }, y).inverse());
          }
          //!
          throw new TypeError(); // "assertion"
        }
        //TODO: fix for g+i*g
        if (e instanceof Expression.Multiplication && e.a instanceof Expression.Complex) {
          e = e.a;
        }
        return x.multiply(e).divide(y.multiply(e));
      }
    }

    if (Expression.has(x, Expression.Complex)) {//!new 2017-11-25
      var tmp = Expression.getComplexNumberParts(x);
      if (tmp != undefined && !tmp.imaginary.equals(Expression.ZERO)) {
        var a = tmp.real;
        var b = tmp.imaginary;
        var g = (a.equals(Expression.ZERO) ? y : a.gcd(y)).gcd(b)._abs();
        if (!g.equals(Expression.ONE)) {
          x = a.divide(g).add(b.divide(g).multiply(Expression.I));
          y = y.divide(g);
        }
        if (y.isNegative()) {
          x = x.negate();
          y = y.negate();
        }
        return y.equals(Expression.ONE) ? x : new Division(x, y);
      }
    }//!

    //!2020-06-07
    if (!getConstant(y).equals(y) && x.divide(getConstant(x)).equals(y.divide(getConstant(y)))) {
      return getConstant(x).divide(getConstant(y));
    }

    // check if y is instance of Integer to avoid issues with nth-roots (?) - see a test
    //TODO: investigate
    var v = y instanceof Integer ? undefined : getVariable(x);//???
    //var v = getVariable(x);//???
    //TODO: move?

    if (has(v, MatrixSymbol) && isScalar(y)) {//TODO: fix ?
      v = getVariable(y);
    }

    //!2019-06-16
    if (v != null) { // e**(1/2)
      var originalVariable = v;
      v = getVariable(v);
      var r = getReplacement(y, getReplacement(x, v, originalVariable), originalVariable);
      if (r instanceof Replacement) {
        //debugger;
        var a = r.apply(x);
        var b = r.apply(y);
        var c = a.divide(b);
        var n = r.undo(c.getNumerator());
        var d = r.undo(c.getDenominator());
        //debugger;
        return d.equals(Expression.ONE) ? n : new Expression.Division(n, d);
      }
      if (!r.equals(v)) {
        var ir = inverseReplacement(r, v);
        var a = substitute(x, v, r, ir);
        var b = substitute(y, v, r, ir);
        //console.log(a + ' ' + b);
        var t = a.divide(b);
        a = substitute(t.getNumerator(), v, ir, r);
        b = substitute(t.getDenominator(), v, ir, r);
        return b.equals(Expression.ONE) ? a : new Expression.Division(a, b);
      }
    }


    // gcd
    var px = undefined;
    var py = undefined;
    if (v != undefined) {
      px = Polynomial.toPolynomial(x, v);
      py = Polynomial.toPolynomial(y, v);
      if (px.getDegree() === 0 && py.getDegree() === 0) {
        v = undefined;
      }
    }
    if (v == undefined) {
      var g = complexGCD(getConstant(x, true), getConstant(y, true));
      if (!g.equals(Expression.ONE)) {
        x = divideByInteger(x, g);
        y = divideByInteger(y, g);
        return x.divide(y);
      }
    } else {
      //!TODO: remove - performance optimization
      var t = px.divideAndRemainder(py, "undefined");
      if (t != undefined && t.remainder.equals(Polynomial.ZERO)) {
        return t.quotient.calcAt(v);
      }
      //!
      var g = Polynomial.polynomialGCD(px, py);
      if (g.getDegree() !== 0 || !g.getLeadingCoefficient().equals(Expression.ONE)) { // g !== 1
        var x2 = px.divideAndRemainder(g, "throw").quotient;
        var y2 = py.divideAndRemainder(g, "throw").quotient;
        return x2.calcAt(v).divide(y2.calcAt(v));
      }
    }

    //var lc = getConstant(getLeadingCoefficient(y, v));
    //var lc = getConstant(getLeadingCoefficient(y, getVariable(y)));
    var lc = getConstant(getFirstAdditionOperand(y));
    if (lc.compareTo(Expression.ZERO) < 0) {
      return x.negate().divide(y.negate());
    }
    if (has(y, MatrixSymbol)) {//?
      return new Expression.Multiplication(x, new Expression.Exponentiation(y, Expression.ONE.negate()));//?
    }//?
    return new Division(x, y);
  };

  function Expression() {
    throw new TypeError("Do not call for better performance");
  }

  Expression.callback = undefined;
  Expression.Event = function (type, data, second) {
    second = second == undefined ? undefined : second;
    this.type = type;
    this.data = data;
    this.second = second;
  };

  Expression.prototype.compare4Multiplication = function (y) {
    throw new TypeError(this.toString());
  };
  Expression.prototype.compare4MultiplicationInteger = function (x) {
    throw new TypeError();
  };
  Expression.prototype.compare4MultiplicationSymbol = function (x) {
    throw new TypeError();
  };
  Expression.prototype.compare4MultiplicationNthRoot = function (x) {
    throw new TypeError();
  };

  Expression.prototype.negate = function () {
    return Expression.ONE.negate().multiply(this);
  };
  Expression.prototype.add = function (y) {
    return y.addExpression(this);
  };
  Expression.prototype.subtract = function (y) {
    return this.add(y.negate());
  };
  Expression.prototype.divide = function (y) {
    //!2019-04-22
    if (!(y instanceof Expression.Matrix)) {
      if (this.equals(y)) { //!TODO: remove - a hack to avoid some exceptions
        //if (this instanceof IdentityMatrix) {
        //  return this;
        //}
        return Expression.ONE;
      }
      if (this.equals(y.negate())) {
        return Expression.ONE.negate();
      }
    }
    return y.divideExpression(this);
  };
  Expression.prototype.multiply = function (y) {
    return y.multiplyExpression(this);
  };
  Expression.prototype.pow = function (y) {
    return y.powExpression(this);
  };
  Expression.prototype.getDenominator = function () {
    //TODO: FIX!!!!
    return this instanceof Division ? this.b : Expression.ONE;
  };
  Expression.prototype.getNumerator = function () {
    //TODO: FIX!!!!
    return this instanceof Division ? this.a : this;
  };
  Expression.prototype.inverse = function () {
    return Expression.ONE.divide(this);
  };
  Expression.prototype.exp = function () {
    return Expression.E.pow(this);
  };


  //TODO: use in Expression#getCoefficients -?
  var variables = function (e) {
    var result = [];
    for (var x of e.summands()) {
      for (var y of x.factors()) {
        for (var ve of getVariableInternal(y)) {
          if (!(ve.v instanceof Integer)) {
            result.push(ve.v);
          }
        }
      }
    }
    return result;
  };

  //TODO: remove - performance optimization
  var getCommonVariable = function (x, y) {
    var a = variables(x);
    var b = variables(y);
    for (var i = 0; i < a.length; i += 1) {
      if (a[i] instanceof NthRoot) {
        return a[i];
      }
    }
    for (var i = 0; i < b.length; i += 1) {
      if (b[i] instanceof NthRoot) {
        return b[i];
      }
    }
    for (var i = 0; i < a.length; i += 1) {
      if (a[i] instanceof Addition) {
        //return variables(a[i])[0];//TODO: fix
        a = a.concat(variables(a[i]));
        a[i] = null;
      }
    }
    for (var i = 0; i < b.length; i += 1) {
      if (b[i] instanceof Addition) {
        //return variables(b[i])[0];//TODO: fix
        b = b.concat(variables(b[i]));
        b[i] = null;
      }
    }
    for (var i = 0; i < a.length; i += 1) {
      for (var j = 0; j < b.length; j += 1) {
        if (a[i] != null && b[j] != null) {
        if (a[i].equals(b[j])) {
          return a[i];
        }
        }
      }
    }
    return null;
  };

  // TODO: fix or remove ?
  Expression.prototype.gcd = function (x) {
    if (this.equals(Expression.ONE)) {
      return this;
    }
    //if (this.equals(x)) {
      //return this;//?
    //}
    if (this instanceof Integer && x instanceof Integer) {
      return integerGCD(this, x);//performance
    }
    if (!(this instanceof Integer) && !(x instanceof Integer)) {
    //TODO: fix
    //return gcd(this, x, getVariable(this) || getVariable(x));
    //TODO: remove this block (a workaround for buggy gcd)
    var t1 = getTerm(this);
    var t2 = getTerm(x);
    if (t1 != null && t2 != null && t1.equals(t2)) {
      return getConstant(this).gcd(getConstant(x)).multiply(t2);
    }
    //!2020-11-05 more workarounds:
    t1 = getTerm(getFirstAdditionOperand(this));
    t2 = getTerm(getFirstAdditionOperand(x));
    if (t1 != null && t2 != null && t1.equals(t2)) {
      var c1 = getConstant(getFirstAdditionOperand(this));
      var c2 = getConstant(getFirstAdditionOperand(x));
      if (c1 instanceof Integer && c2 instanceof Integer) {
        var alpha = c1.truncatingDivide(c2);
        if (alpha instanceof Expression.Integer && alpha.multiply(c2).equals(c1)) {
          return this.subtract(x.multiply(alpha)).gcd(x);
        }
        var alpha = c2.truncatingDivide(c1);
        if (alpha instanceof Expression.Integer && alpha.multiply(c1).equals(c2)) {
          return this.gcd(x.subtract(this.multiply(alpha)));
        }
      }
    }
    }
    if (this.equals(Expression.ZERO) || x.equals(Expression.ZERO)) {
      return this.add(x);
    }
    //!
    var result = gcd(this, x, getCommonVariable(this, x));
    return result;
  };
  // Least common multiple
  Expression.prototype.lcm = function (x) {
    if (x.equals(Expression.ONE)) {
      return this;//performance
    }
    return this.divide(this.gcd(x)).multiply(x);
  };

  //!new 2020-07-21
  Expression.prototype.polynomialGCD = function (b) {
    var a = this;

    var v = getVariableInternal(getLastMultiplicationOperand(getFirstAdditionOperand(a))).next().value.v; // avoid square roots
    if (v instanceof Expression.Symbol) {
      var r = getReplacement(a, getReplacement(b, v));
      if (!r.equals(v)) {
        return substitute(substitute(a, v, r, inverseReplacement(r, v)).polynomialGCD(substitute(b, v, r, inverseReplacement(r, v))), v, inverseReplacement(r, v), r);
      }

      return Polynomial.polynomialGCD(Polynomial.toPolynomial(a, v), Polynomial.toPolynomial(b, v)).calcAt(v);
    }
    return a.gcd(b);//?
  };

  //TODO: merge with ExpressionParser.js ?!?
  var precedence = {
    binary: {
      ".^": 5,
      "^": 5,
      "*": 3,
      "/": 3,
      "+": 2,
      "-": 2
    },
    unary: {
      "-": 5//HACK
    }
  };

  var Symbol = null;

  Expression.Symbol = function (symbol) {
    //Expression.call(this);
    this.symbol = symbol;
  };

  Expression.Symbol.prototype = Object.create(Expression.prototype);

  Expression.Symbol.prototype.compare4Multiplication = function (y) {
    return y.compare4MultiplicationSymbol(this);
  };
  Expression.Symbol.prototype.compare4MultiplicationInteger = function (x) {
    return -1;
  };
  Expression.Symbol.prototype.compare4MultiplicationSymbol = function (x) {
    return x.symbol < this.symbol ? -1 : (this.symbol < x.symbol ? +1 : 0);
  };
  Expression.Symbol.prototype.compare4MultiplicationNthRoot = function (x) {
    return -1;
  };

  Expression.Symbol.prototype.toString = function (options) {
    if (this.symbol === '\u2147') {
      return 'e';//!
    }
    return this.symbol;
  };

  Expression.Symbol.prototype._pow = function (count) {
    if (count > 1) {
      return new Expression.Exponentiation(this, Expression.Integer.fromNumber(count));
    }
    return Expression.prototype._pow.call(this, count);
  };

  Expression.prototype.addInteger = function (x) {
    return this.addExpression(x);
  };
  Expression.prototype.multiplyInteger = function (x) {
    if (x === Expression.ONE) {
      return this;
    }
    return this.multiplyExpression(x);
  };
  Expression.prototype.divideInteger = function (x) {
    return this.divideExpression(x);
  };

  var simplifyIdentityMatrixPower = true; //! TODO:

  function Integer(value) {
    //Expression.call(this);
    this.value = value;
  }

  Integer.prototype = Object.create(Expression.prototype);

  Integer.prototype.powExpression = function (x) {
    var y = this;
    if (x instanceof IdentityMatrix) {
      if (simplifyIdentityMatrixPower) {
        return new IdentityMatrix(x.symbol);
      }
    }
    if (x instanceof MatrixSymbol) {
      if (y.equals(Expression.ZERO)) {
        return Expression.ONE;
      }
      if (y.equals(Expression.ONE)) {
        return x;
      }
      return new Exponentiation(x, y);//?
    }
    //!new 2019-12-16
    if (x instanceof Exponentiation && getExponent(x) instanceof Integer && y instanceof Integer) {//? (X**2)**(-1)
      return getBase(x).pow(getExponent(x).multiply(y));
    }
    //!
    //!new 2020-03-02
    if (x instanceof Exponentiation && getTerm(getExponent(x)) instanceof Expression.Symbol) {//? (X**2)**(-1)
      return getBase(x).pow(getExponent(x).multiply(y));
    }
    //!

    if (y.compareTo(Expression.ZERO) < 0) {
      return Expression.ONE.divide(x.pow(y.negate()));
    }
    if (x instanceof Expression.Matrix) {
      if (y.compareTo(Expression.ONE) > 0) {
        if (!x.matrix.isDiagonal()) {
          if (Expression.callback != undefined) {
            Expression.callback(new Expression.Event("pow", x, new Expression.Matrix(Matrix.I(1).map(function () { return y; }))));
          }
        }
      }
      var powMatrix = function (matrix, n) {
        if (n.toNumber() > Number.MAX_SAFE_INTEGER) {
          return powMatrix(matrix, n.truncatingDivide(Expression.TWO)).pow(2).multiply(matrix.pow(n.remainder(Expression.TWO).toNumber()));
        }
        return matrix.pow(n.toNumber());
      };
      return new Expression.Matrix(powMatrix(x.matrix, y));
    }
    if (y.equals(Expression.ZERO)) {
      return Expression.ONE;
    }
    if (y.equals(Expression.ONE)) {
      return x;
    }

    if (x instanceof Expression.Symbol) {
      return new Exponentiation(x, y);
    }
    if (x instanceof Exponentiation) {
      var t = x.b.multiply(y);
      if (t.getNumerator() instanceof Integer && t.getDenominator() instanceof Integer) {//TODO: ?
        var i = t.getNumerator().truncatingDivide(t.getDenominator());
        if (i.compareTo(Expression.ZERO) > 0) {
          return x.a.pow(i).multiply(x.a.pow(t.subtract(i)));
        }
      }
      return x.a.pow(x.b.multiply(y));
    }
    if (x instanceof Integer && (x.compareTo(Expression.ZERO) === 0 || x.compareTo(Expression.ONE) === 0 || x.compareTo(Expression.ONE.negate()) === 0)) {
      return y.remainder(Expression.TWO).compareTo(Expression.ZERO) === 0 ? x.multiply(x) : x;
    }
    if (x.equals(Expression.I)) {
      y = y.remainder(Expression.TWO.add(Expression.TWO));
      return Expression.pow(x, y.toNumber());
    }
    // assert(x instanceof Operation || x instanceof Integer);
    return Expression.pow(x, y.toNumber());
  };

  Integer.prototype.compare4Multiplication = function (y) {
    return y.compare4MultiplicationInteger(this);
  };
  Integer.prototype.compare4MultiplicationInteger = function (x) {
    return x.compareTo(this);
    //return 0;
  };
  Integer.prototype.compare4MultiplicationSymbol = function (x) {
    return +1;
  };
  Integer.prototype.compare4MultiplicationNthRoot = function (x) {
    return +1;
  };

  Integer.prototype.negate = function () {
    return new Integer(SmallBigInt.unaryMinus(this.value));
  };
  Integer.prototype.isUnit = function () {
    return this.equals(Expression.ONE) || this.equals(Expression.ONE.negate());
  };
  Expression.prototype.toExpression = function () {
    return this;
  };
  Integer.prototype.compareTo = function (y) {
    if (y instanceof Expression.Integer) {
      var b = y.value;
      var a = this.value;
      return SmallBigInt.lessThan(a, b) ? -1 : (SmallBigInt.lessThan(b, a) ? +1 : 0);
    }
    return Expression.prototype.compareTo.call(this, y);
  };
  Integer.prototype.abs = function () {
    return SmallBigInt.toNumber(this.value) < 0 ? this.negate() : this;
  };
  Integer.prototype.sign = function () {
    return Math.sign(SmallBigInt.toNumber(this.value));
  };
  Integer.prototype.add = function (y) {
    if (this === Expression.ZERO) {
      return y;
    }
    return y.addInteger(this);
  };
  Integer.prototype.addInteger = function (x) {
    return new Integer(SmallBigInt.add(x.value, this.value));
  };
  Integer.prototype.multiply = function (y) {
    return y.multiplyInteger(this);
  };
  Integer.prototype.multiplyInteger = function (x) {
    if (x === Expression.ONE) {
      return this;
    }
    return new Integer(SmallBigInt.multiply(x.value, this.value));
  };
  Integer.prototype.divide = function (y) {
    return y.divideInteger(this);
  };
  //! for performance only
  Integer.prototype.divideInteger = function (x) {
    var y = this;
    var a = x.value;
    var b = y.value;
    //if (a == b) { // for performance
    //  return Expression.ONE;
    //}
    if (SmallBigInt.toNumber(b) === 0) {
      //TODO: fix?
      throw new TypeError("ArithmeticException");
    }
    if (typeof b === "number" && b === 1) {
      return x;//!!!
    }
    var q = SmallBigInt.divide(a, b);
    var r = SmallBigInt.subtract(a, SmallBigInt.multiply(q, b));
    if (SmallBigInt.toNumber(r) === 0) {
      return new Integer(q);
    }
    var g = SmallBigInt.BigInt(bigIntGCDWrapper(r, b));
    //if (BigInteger.notEqual(g, Expression.ONE.value)) {
      a = SmallBigInt.divide(a, g);
      b = SmallBigInt.divide(b, g);
    //}
    if (SmallBigInt.toNumber(b) < 0) {
      a = SmallBigInt.unaryMinus(a);
      b = SmallBigInt.unaryMinus(b);
    }
    return /*BigInteger.equal(b, Expression.ONE.value) ? new Integer(a) : */new Division(new Integer(a), new Integer(b));
  };
  Integer.prototype.truncatingDivide = function (y) {
    if (y.equals(Expression.ONE)) {
      return this;
    }
    return y.truncatingDivideInteger(this);
  };
  Integer.prototype.truncatingDivideInteger = function (x) {
    var y = this;
    return new Integer(SmallBigInt.divide(x.value, y.value));
  };
  Integer.prototype.isDivisibleBy = function (y) {
    return y.isDivisibleByInteger(this);
  };
  Integer.prototype.isDivisibleByInteger = function (x) {
    return x.remainder(this).equals(Expression.ZERO);
  };
  Integer.prototype.remainder = function (y) {
    return y.remainderInteger(this);
  };
  Integer.prototype.remainderInteger = function (x) {
    var y = this;
    var r = SmallBigInt.remainder(x.value, y.value);
    return r === 1 ? Expression.ONE : new Integer(r);
  };
  Integer.prototype.primeFactor = function () {
    return integerPrimeFactor(this);
  };
  Integer.prototype.toNumber = function () {
    return SmallBigInt.toNumber(this.value);
  };
  Integer.prototype.toBigInt = function () {
    return this.value;
  };
  Integer.prototype.toString = function (options) {
    return this.value.toString();
  };
  Integer.prototype.valueOf = function () {
    console.error("!");
    //throw new TypeError("");
    return this;
  };
  Integer.prototype.leftShift = function (n) {
    return new Integer(SmallBigInt.leftShift(this.value, n));
  };

  Integer.fromNumber = function (n) {
    return new Integer(SmallBigInt.BigInt(n));
  };
  Integer.fromString = function (s) {
    return new Integer(SmallBigInt.BigInt(s));
  };
  Integer.fromBigInt = function (i) {
    return new Integer(SmallBigInt.BigInt(i));
  };

  Expression.ZERO = Integer.fromNumber(0);
  Expression.ONE = Integer.fromNumber(1);
  Expression.TWO = Integer.fromNumber(2);
  Expression.TEN = Integer.fromNumber(10);

  Expression.Matrix = function (matrix) {
    //Expression.call(this);
    this.matrix = matrix;
  };

  Expression.Matrix.fromArray = function (rows) {
    return new Expression.Matrix(Matrix.padRows(rows, null));
  };

  Expression.Matrix.prototype = Object.create(Expression.prototype);

  Expression.Matrix.prototype.augment = function (other) {
    if (other instanceof Expression.IdentityMatrix) {
      return new Expression.Matrix(this.matrix.augment(Matrix.I(this.matrix.cols())));
    }
    return new Expression.Matrix(this.matrix.augment(other.matrix));
  };

  Expression.Matrix.prototype.equals = function (x) {
    //!new 2019-12-03
    if (x === Expression.ZERO) {
      return this.matrix.isSquare() && this.matrix.eql(this.matrix.map(function (e, i, j) {
        return Expression.ZERO;
      }));
    }
    //!
    if (!(x instanceof Expression.Matrix)) {
      return false;
    }
    return this.matrix.eql(x.matrix);
  };

  Expression.Matrix.prototype.compare4Multiplication = function (y) {
    if (y instanceof Expression.Matrix) {
      return 0;
    }
    if (y instanceof MatrixSymbol) {
      // https://math.stackexchange.com/a/1698005/116680
      if (this.matrix.isSquare() && this.matrix.isDiagonal()) {//?
        const element = this.matrix.e(0, 0);
        if (this.matrix.eql(Matrix.Zero(this.matrix.rows(), this.matrix.cols()).map((e, i, j) => i === j ? element : Expression.ZERO))) {
          return +1;
        }
      }
      return -1;
    }
    return +1;
  };
  Expression.Matrix.prototype.compare4MultiplicationNthRoot = function (x) {
    return +1;
  };

  Expression.Matrix.prototype.multiply = function (y) {
    return y.multiplyMatrix(this);
  };
  Expression.prototype.multiplyMatrix = function (x) {
    var t = getIdentityMatrixCoefficient(this);
    if (t != undefined) {
      return new Expression.Matrix(x.matrix.scale(t));
    }
    if (x.equals(Expression.ZERO)) {//!TODO: TEST, TODO: sizes are lost
      return x;
    }
    return this.multiplyExpression(x);
  };
  Expression.Matrix.prototype.multiplyExpression = function (x) {
    var t = getIdentityMatrixCoefficient(x);
    if (t != undefined) {
      return new Expression.Matrix(this.matrix.scale(t));
    }
    return Expression.prototype.multiplyExpression.call(this, x);
  };
  Expression.Matrix.prototype.multiplyMatrix = function (x) {
    if (Expression.callback != undefined) {
      Expression.callback(new Expression.Event("multiply", x, this));
    }
    return new Expression.Matrix(x.matrix.multiply(this.matrix));
  };
  Expression.Matrix.prototype.compare4MultiplicationSymbol = function (x) {
    return +1;
  };
  Expression.Matrix.prototype.multiplyDivision = Expression.Matrix.prototype.multiplyExpression;
  Expression.Matrix.prototype.add = function (y) {
    return y.addMatrix(this);
  };
  Expression.Matrix.prototype.addMatrix = function (x) {
    if (Expression.callback != undefined) {
      Expression.callback(new Expression.Event("add", x, this));
    }
    return new Expression.Matrix(x.matrix.add(this.matrix));
  };

  var isScalar = function (x) {
    if (x instanceof Integer) {
      return true;
    }
    if (x instanceof Expression.Complex) {
      return true;
    }
    if (x instanceof MatrixSymbol) {
      return false;
    }
    if (x instanceof Expression.ExpressionWithPolynomialRoot) {
      return isScalar(x.e);
    }
    if (x instanceof Expression.Symbol) {
      return true;
    }
    if (x instanceof BinaryOperation) {
      return isScalar(x.a) && isScalar(x.b);
    }
    if (x instanceof Negation) {
      return isScalar(x.b);
    }
    if (x instanceof Expression.Function) {
      return isScalar(x.a);
    }
    if (x instanceof Expression.NonSimplifiedExpression) {//TODO: ?
      return isScalar(x.unwrap());
    }
    return false;//?
  };

  Expression.isScalar = isScalar;

  var getIdentityMatrixCoefficient = function (x) {
    var t = undefined;
    if (x instanceof Multiplication && x.b instanceof IdentityMatrix) {
      t = x.a;
    } else if (x instanceof IdentityMatrix) {
      t = Expression.ONE;
    } else if (isScalar(x)) {
      t = x;
    } else if (x instanceof Addition) {
      if (Expression.has(x, IdentityMatrix)) {//TODO: fix
        var ca = getIdentityMatrixCoefficient(x.a);
        var cb = getIdentityMatrixCoefficient(x.b);
        if (ca != undefined && cb != undefined) {
          t = ca.add(cb);
        }
      }
    }
    return t;
  };

  Expression.prototype.addMatrix = function (x) {
    var t = getIdentityMatrixCoefficient(this);
    if (t != undefined) {
      //?
      if (x.matrix.isSquare()) {
        return new Expression.Matrix(Matrix.I(x.matrix.rows()).scale(t)).add(x);
      } else {
        throw new RangeError("NonSquareMatrixException");
      }
    }
    return this.addExpression(x);
  };
  Expression.Matrix.prototype.addExpression = function (x) {
    var t = getIdentityMatrixCoefficient(x);
    if (t != undefined) {
      //?
      if (this.matrix.isSquare()) {
        return this.add(new Expression.Matrix(Matrix.I(this.matrix.rows()).scale(t)));
      } else {
        throw new RangeError("NonSquareMatrixException");
      }
    }
    return Expression.prototype.addExpression.call(this, x);
  };

  Expression.Matrix.prototype.toString = function (options) {
    return this.matrix.toString(setTopLevel(true, options));
  };

  Expression.Matrix.prototype.isExact = function () {
    return this.matrix.isExact();
  };

  function BinaryOperation(a, b) {
    //Expression.call(this);
    this.a = a;
    this.b = b;
  }

  BinaryOperation.prototype = Object.create(Expression.prototype);

  BinaryOperation.prototype.isNegation = function () {
    // TODO: What about NonSimplifiedExpression(s) ?
    //if (this instanceof Multiplication && this.a instanceof NonSimplifiedExpression && this.a.e instanceof Integer && this.a.e.equals(Expression.ONE.negate())) {
    //  return true;
    //}
    return (this instanceof Multiplication && this.a instanceof Integer && this.a.equals(Expression.ONE.negate()));
  };

  var setTopLevel = function (isTopLevel, options) {
    return options == undefined ? {isTopLevel: isTopLevel} : Object.assign({}, options, {isTopLevel: isTopLevel});
  };

  Expression.setTopLevel = setTopLevel;

  BinaryOperation.prototype.toString = function (options) {
    //if (this instanceof Division && this.isNegative()) {
    //  return '-' + this.negateCarefully().toString(options);
    //}
    var a = this.a;
    var b = this.b;
    var isSubtraction = false;
    // TODO: check
    /*
    if (Expression.simplification && this instanceof Addition && a.isNegative()) {
      var tmp = b;
      b = a;
      a = tmp;
    }*/

    if (this instanceof Addition && b.isNegative()) {
      isSubtraction = true;
      b = b.negateCarefully();//?
    }
    var fa = a.getPrecedence() + (a.isRightToLeftAssociative() ? -1 : 0) < this.getPrecedence();
    var fb = this.getPrecedence() + (this.isRightToLeftAssociative() ? -1 : 0) >= b.getPrecedence();
    if (options != undefined && options.isTopLevel != undefined && options.isTopLevel === false) {
      fa = fa || a.isUnaryPlusMinus();
    }
    fb = fb || b.isUnaryPlusMinus(); // 1*-3 -> 1*(-3)
    fb = fb || (this.unwrap() instanceof Exponentiation && b.unwrap() instanceof Exponentiation); // 2^3^4
    fa = fa || (this.unwrap() instanceof Exponentiation && a.unwrap() instanceof Expression.Function); // cos(x)^(2+3)
    var s = isSubtraction ? "-" : this.getS();
    //TODO: fix spaces (matrix parsing)
    if (this.isNegation()) {
      // assert(fa === false);
      return "-" + (fb ? "(" : "") + b.toString(setTopLevel(fb, options)) + (fb ? ")" : "");
    }
    return (fa ? "(" : "") + a.toString(setTopLevel(fa || options == undefined || options.isTopLevel, options)) + (fa ? ")" : "") +
           s +
           (fb ? "(" : "") + b.toString(setTopLevel(fb, options)) + (fb ? ")" : "");
  };

  //?
  Expression.prototype.unwrap = function () {
    return this;
  };

  function Exponentiation(a, b) {
    BinaryOperation.call(this, a, b);
  }

  Exponentiation.prototype = Object.create(BinaryOperation.prototype);

  //TODO: remove - ?
  Exponentiation.prototype.compare4Multiplication = function (y) {
    return y.compare4MultiplicationExponentiation(this);
  };
  Exponentiation.prototype.compare4MultiplicationInteger = function (x) {
    return -1;
  };

  Exponentiation.prototype.compare4MultiplicationExponentiation = function (x) {
    var y = this;
    return getBase(x).compare4Multiplication(getBase(y)) || getExponent(x).compare4Multiplication(getExponent(y));
  };
  BinaryOperation.prototype.compare4MultiplicationExponentiation = function () {
    return -1;//TODO: !?
  };

  function Multiplication(a, b) {
    BinaryOperation.call(this, a, b);
  }

  Multiplication.prototype = Object.create(BinaryOperation.prototype);

  Multiplication.prototype.multiply = function (y) {
    return y.multiplyExpression(this);
  };
  //TODO:
  var compare4Multiplication2 = function (x, y) {//TODO: fix

//  && x.n !== y.n
    if (x instanceof NthRoot && y instanceof NthRoot) {//TODO: fix
      var test = x.multiply(y);
      // instanceof is needeed to avoid ExpressionWithPolynomialRoot#equals, which cause an infinite loop
      if (test instanceof Expression.Multiplication) {
        if (test.equals(new Expression.Multiplication(x, y))) {
          return -1;
        }
        if (test.equals(new Expression.Multiplication(y, x))) {
          return +1;
        }
      }
      return 0;
    }
/*
    //!2019-04-22
    if (x instanceof NthRoot && y instanceof NthRoot && x.n === y.n) {//TODO: fix
      if (x.a instanceof Integer && y.a instanceof Integer) {
        return 0;
      }
      if (x.a instanceof Addition && y.a instanceof Integer) {
        return 0;//TODO: fix
      }
      if (x.a instanceof Integer && y.a instanceof Addition) {
        return 0;//TODO: fix
      }
      // -(2^0.5+1)^0.5*(2*2^0.5+2)^0.5
      if (x.a instanceof Addition && y.a instanceof Addition) {
        return 0;//TODO: fix
      }
      // 3 and 3^n
      return compare4Multiplication(x.a, y.a);
    }
  */
    if (x instanceof Integer && y instanceof Exponentiation) {
      return -1;//?
    }
    if (x instanceof Exponentiation && y instanceof Integer) {
      return +1;//?
    }
    if (x instanceof Expression.Complex && y instanceof Exponentiation) {
      return -1;//?
    }
    if (x instanceof Exponentiation && y instanceof Expression.Complex) {
      return +1;//?
    }

    return compare4Multiplication(getBase(x), getBase(y));
  };

  function Negation(b) {
    //Expression.call(this);
    this.b = b;
  }

  Negation.prototype = Object.create(Expression.prototype);

  Expression.prototype.equalsNegation = function (x) {
    return false;
  };
  Negation.prototype.equalsNegation = function (b) {
    return this.b.equals(b.b);
  };
  Negation.prototype.equals = function (b) {
    return b.equalsNegation();
  };
  Negation.prototype.toString = function (options) {
    var b = this.b;
    var fb = this.getPrecedence() + (this.isRightToLeftAssociative() ? -1 : 0) >= b.getPrecedence();
    fb = fb || b.isUnaryPlusMinus();
    // assert(fa === false);
    return "-" + (fb ? "(" : "") + b.toString(setTopLevel(fb, options)) + (fb ? ")" : "");
  };

  function Subtraction(a, b) {
    BinaryOperation.call(this, a, b);
  }

  Subtraction.prototype = Object.create(BinaryOperation.prototype);

  Subtraction.prototype.getS = function () {
    return "-";
  };

  //

  function Addition(a, b) {
    BinaryOperation.call(this, a, b);
  }

  Addition.prototype = Object.create(BinaryOperation.prototype);
  Addition.prototype.multiply = function (y) {
    return y.multiplyAddition(this);
  };
  var _multiplyAddition = function (value, addition, fromLeft) {
    // optimization (to avoid stack overflow when addition has a lot of summands (?))
    var result = [];
    for (var s of addition.summands()) {
      var v = fromLeft ? value.multiply(s) : s.multiply(value);
      result.push(v);
    }
    return _sum(result);
  };
  var _sum = function (summands) {
    var k = summands.length;
    if (k === 0) {
      return Expression.ZERO;
    }
    while (k > 1) {
      for (var i = 0; 2 * i < k; i += 1) {
        summands[i] = 2 * i + 1 < k ? summands[2 * i + 1].add(summands[2 * i]) : summands[2 * i];
      }
      k = Math.ceil(k / 2);
    }
    return summands[0];
  };
  Expression.prototype.multiplyAddition = function (x) {
    return _multiplyAddition(this, x, false);
    //return x.a.multiply(this).add(x.b.multiply(this));
  };
  Addition.prototype.multiplyExpression = function (x) {
    return _multiplyAddition(x, this, true);
    //return x.multiply(this.a).add(x.multiply(this.b));
  };

  function Division(a, b) {
    BinaryOperation.call(this, a, b);
  }

  Division.prototype = Object.create(BinaryOperation.prototype);
  Division.prototype.multiply = function (y) {
    return y.multiplyDivision(this);
  };
  Expression.prototype.multiplyDivision = function (x) {
    return x.a.multiply(this).divide(x.b);
  };
  Division.prototype.multiplyDivision = function (x) { // for performance
    return x.a.multiply(this.a).divide(x.b.multiply(this.b));
  };
  Division.prototype.multiplyExpression = function (x) {
    return x.multiply(this.a).divide(this.b);
  };
  Division.prototype.add = function (y) {
    return y.addDivision(this);
  };
  Expression.prototype.addDivision = function (x) {
    return x.a.add(this.multiply(x.b)).divide(x.b);
  };
  Division.prototype.addDivision = function (x) {
    if (x.b.equals(this.b)) {
      return x.a.add(this.a).divide(this.b);
    }
    //return BinaryOperation.prototype.addDivision.call(this, x);
    return x.a.multiply(this.b).add(x.b.multiply(this.a)).divide(x.b.multiply(this.b));
  };
  Division.prototype.addExpression = function (x) {
    return x.multiply(this.b).add(this.a).divide(this.b);
  };
  Division.prototype.divide = function (y) {
    return this.a.divide(this.b.multiply(y));
  };
  Division.prototype.divideExpression = function (x) {
    return x.multiply(this.b).divide(this.a);
  };
  //? not needed, but looks appropriate
  Division.prototype.multiplyAddition = function (x) {
    return x.multiply(this.a).divide(this.b);
  };

  // TODO: move
  Expression.prototype.equals = function (b) {
    throw new RangeError();//?
  };
  Expression.prototype.equalsInteger = function (x) {
    if (this instanceof Expression.ExpressionWithPolynomialRoot || this instanceof Expression.ExpressionPolynomialRoot) {
      return this.equals(x);
    }
    return false;
  };
  const _isNumberTypeUsedForSmall = SmallBigInt.BigInt(0) === 0;
  Integer.prototype.equals = function (y) {
    // TODO: fix
    //if (y == undefined) {
    //  return false;
    //}
      if (y === Expression.ZERO) {
        if (_isNumberTypeUsedForSmall) {
          return typeof this.value === "number" && this.value === 0;
        }
      }
      if (y === Expression.ONE) {
        if (_isNumberTypeUsedForSmall) {
          return typeof this.value === "number" && this.value === 1;
        }
      }
    return y.equalsInteger(this);
  };
  Integer.prototype.equalsInteger = function (x) {
    return x.compareTo(this) === 0;
    // performance:
    //return x.value == this.value;
  };
  Expression.Symbol.prototype.equals = function (b) {
    return b instanceof Expression.Symbol && this.symbol === b.symbol;
  };
  BinaryOperation.prototype.equals = function (b) {
    if (b instanceof Addition && Expression.has(b, Expression.ExpressionPolynomialRoot)) { // not e^(alpha) or -1 * e^(alpha)
      //console.assert(false, '!!!');
      return this.subtract(b).equals(Expression.ZERO);
    }
    if (b instanceof Addition && this instanceof Multiplication && Expression.has(this, Expression.ExpressionPolynomialRoot) ||
        this instanceof Addition && b instanceof Multiplication && Expression.has(b, Expression.ExpressionPolynomialRoot)) { // alpha * x and sqrt(2) * x + sqrt(3) * x
      //console.assert(false, '!!!');
      return this.subtract(b).equals(Expression.ZERO);
    }
    if (this instanceof Addition && b instanceof Addition) {
      //HACK TO not call Expression.has each time!!! (three lines before)
      var x = this;
      var y = b;
      var i = x.summands();
      var j = y.summands();
      var a = i.next().value;
      var b = j.next().value;
      while (a != null && b != null) {
        if (!a.equals(b)) {
          return false;
        }
        a = i.next().value;
        b = j.next().value;
      }
      return a != null ? false : (b != null ? false : true);
    }
    if (b instanceof Expression.ExpressionWithPolynomialRoot || b instanceof Expression.ExpressionPolynomialRoot) {
      //console.assert(false, '!!!');
      return b.equals(this);
    }
    return b instanceof BinaryOperation && this.getS() === b.getS() && this.a.equals(b.a) && this.b.equals(b.b);
  };

  function MatrixSymbol(symbol) {//TODO: only for square matrix !!!
    Expression.Symbol.call(this, symbol);
  }
  MatrixSymbol.prototype = Object.create(Expression.Symbol.prototype);

  Exponentiation.prototype.inverse = function () {
    return this.pow(Expression.ONE.negate());
  };
  MatrixSymbol.prototype.inverse = function () {//TODO: only for square matrix !!!
    return this.pow(Expression.ONE.negate());
  };
  MatrixSymbol.prototype.compare4Multiplication = function (y) {
    return y.compare4MultiplicationMatrixSymbol(this);
  };
  Expression.prototype.compare4MultiplicationMatrixSymbol = function (x) {
    return +1;
  };
  Addition.prototype.compare4MultiplicationMatrixSymbol = function (x) { // (X+{{1}})*X
    return -1;
  };
  Expression.Matrix.prototype.compare4MultiplicationMatrixSymbol = function (x) {
    return x instanceof IdentityMatrix ? +1 : -1;//?
  };
  MatrixSymbol.prototype.compare4MultiplicationMatrixSymbol = function (x) {
    var c = Expression.Symbol.prototype.compare4MultiplicationSymbol.call(this, x);
    return c === +1 ? -1 : c;
  };
  MatrixSymbol.prototype.compare4MultiplicationSymbol = function (x) {
    return -1;
  };
  MatrixSymbol.prototype.equals = function (b) {
    return b instanceof MatrixSymbol && Expression.Symbol.prototype.equals.call(this, b);
  };
  MatrixSymbol.prototype.transpose = function () {
    // quick solution:
    return new Expression.Exponentiation(this, new Expression.Symbol("T")); // TODO: fix
  };
  //...

  Expression.MatrixSymbol = MatrixSymbol;

  function IdentityMatrix(symbol) {
    MatrixSymbol.call(this, symbol);
  }
  IdentityMatrix.prototype = Object.create(MatrixSymbol.prototype);
  //IdentityMatrix.prototype.multiply = function (y) {
  //  return y.multiplyIdentityMatrix(this);
  //};

  //TODO: move to MatrixSymbol - ?
  IdentityMatrix.prototype.multiplyAddition = function (x) {
    if (isScalar(x)) {
      return new Multiplication(x, this);
    }
    return Expression.prototype.multiplyAddition.call(this, x);
  };

  //Expression.prototype.multiplyIdentityMatrix = function (x) {
  //  return this.multiplyExpression(x);
  //};
  //IdentityMatrix.prototype.multiplyIdentityMatrix = function (x) {
  //  return new IdentityMatrix(this.symbol);
  //};
  IdentityMatrix.prototype.addMatrix = function (x) {
    return x.add(new Expression.Matrix(Matrix.I(x.matrix.rows())));
  };
  IdentityMatrix.prototype.add = function (y) {
    return y.addIdentityMatrix(this);
  };
  Expression.prototype.addIdentityMatrix = function (x) {
    return this.addExpression(x);//?
  };
  Expression.Matrix.prototype.addIdentityMatrix = function (x) {
    return new Expression.Matrix(Matrix.I(this.matrix.rows())).add(this);
  };

  IdentityMatrix.prototype.multiplyDivision = function (x) {
    if (isScalar(x)) {
      return new Multiplication(x, this);
    }
    return Expression.prototype.multiplyExpression.call(this, x);
  };

  IdentityMatrix.prototype.compare4MultiplicationMatrixSymbol = function (x) {
    var y = this;
    return x instanceof IdentityMatrix ? (x.symbol < y.symbol ? -1 : (y.symbol < x.symbol ? +1 : 0)) : +1;
  };

  Expression.IdentityMatrix = IdentityMatrix;

  BinaryOperation.prototype.getS = function () {
    throw new TypeError("abstract");
  };
  Exponentiation.prototype.getS = function () {
    return "^";
  };
  Multiplication.prototype.getS = function () {
    return "*";
  };
  Negation.prototype.getS = function () {
    return "-";
  };
  Addition.prototype.getS = function () {
    return "+";
  };
  Division.prototype.getS = function () {
    return "/";
  };

  // unary argument function, fix Expression.Function#compare4Addition for multiple argument functions (!)
  Expression.Function = function (name, a) {
    //Expression.call(this);
    this.name = name;
    this.a = a;
  };
  Expression.Function.prototype = Object.create(Expression.prototype);
  Expression.Function.prototype.toString = function (options) {
    //?
    return this.name + "(" + this.a.toString(setTopLevel(true, options)) + ")";
  };
  Expression.Function.prototype.equals = function (b) {
    return b instanceof Expression.Function && this.name === b.name && this.a.equals(b.a);
  };

  Negation.prototype.isUnaryPlusMinus = function () {
    return true;
  };
  BinaryOperation.prototype.isUnaryPlusMinus = function () {
    return this.isNegation();
  };
  Expression.Function.prototype.isUnaryPlusMinus = function () {
    return false;//!
  };
  Expression.prototype.isUnaryPlusMinus = function () {
    return false;
  };
  Integer.prototype.isUnaryPlusMinus = function () {//?
    return this.compareTo(Expression.ZERO) < 0;
  };

  Negation.prototype.getPrecedence = function () {
    return precedence.unary["-"];
  };
  BinaryOperation.prototype.getPrecedence = function () {
    return this.isNegation() ? precedence.unary["-"] : precedence.binary[this.getS()];
  };
  Expression.Function.prototype.getPrecedence = function () {
    return precedence.unary["-"];
  };
  Expression.prototype.getPrecedence = function () {
    return 1000;
  };
  Integer.prototype.getPrecedence = function () {//?
    return this.compareTo(Expression.ZERO) < 0 ? precedence.unary["-"] : 1000;
  };

  //! Note: this function is more for canonical order(?) or output(?), to check if a numeric expression is negative you should use Expression#sign()
  Expression.prototype.isNegative = function () {
    var x = this;
    if (x instanceof Integer) {
      return x.compareTo(Expression.ZERO) < 0;
    }
    if (x instanceof Expression.Complex) {
      return x.real.compareTo(Expression.ZERO) < 0 || (x.real.compareTo(Expression.ZERO) === 0 && x.imaginary.compareTo(Expression.ZERO) < 0);
    }
    if (x instanceof Addition) {
      var e = x;
      do {
        e = e.a;
      } while (e instanceof Addition);
      return e.isNegative();
      //return x.a.isNegative();
      //return x.a.isNegative() && x.b.isNegative();
    }
    if (x instanceof Multiplication) {
      return x.a.isNegative() !== x.b.isNegative();
    }
    if (x instanceof Division) {
      return x.a.isNegative() !== x.b.isNegative();
    }
    if (x instanceof Negation) {
      //return !x.b.isNegative();
      return true;
    }
    if (x instanceof Expression.Radians) {
      return x.value.isNegative();
    }
    return false;
  };

  //TODO: remove
  Expression.prototype.negateCarefully = function () {
    if (this instanceof Integer) {
      return this.negate();
    }
    if (this instanceof Addition) {
      return new Addition(this.a.negateCarefully(), this.b.negateCarefully());
    }
    if (this instanceof Multiplication) {
      return this.b.isNegative() ? new Multiplication(this.a, this.b.negateCarefully()) : (this.a.negateCarefully().equals(Expression.ONE) ? this.b : new Multiplication(this.a.negateCarefully(), this.b));
    }
    if (this instanceof Division) {
      return this.b.isNegative() ? new Division(this.a, this.b.negateCarefully()) : new Division(this.a.negateCarefully(), this.b);
    }
    if (this instanceof Negation) {
      return this.b;//!
    }
    return this.negate();
  };

  // https://en.wikipedia.org/wiki/Nth_root#Simplified_form_of_a_radical_expression
  // https://en.wikipedia.org/wiki/Factorization#Sum.2Fdifference_of_two_cubes

  function NthRoot(name, a, n) {
    Expression.Function.call(this, name, a);
    this.n = n;//TODO: remove
    this.degree = n;
    this.radicand = a;
    //this.index = n;
    console.assert(name === (n === 2 ? "sqrt" : n + "-root")); // otherwise it is not unary argument function (!)
  }

  NthRoot.prototype = Object.create(Expression.Function.prototype);

  NthRoot.prototype.compare4Multiplication = function (y) {
    return y.compare4MultiplicationNthRoot(this);
  };
  NthRoot.prototype.compare4MultiplicationInteger = function (x) {
    return -1;
  };
  NthRoot.prototype.compare4MultiplicationSymbol = function (x) {
    return +1;
  };
  NthRoot.prototype.compare4MultiplicationNthRoot = function (x) {
    return x.n < this.n ? -1 : (x.n > this.n ? + 1 : 0);
  };

  NthRoot.prototype.toString = function (options) {
    var fa = this.a.getPrecedence() <= this.getPrecedence();
    return (fa ? "(" : "") + this.a.toString(setTopLevel(fa || options == undefined || options.isTopLevel, options)) + (fa ? ")" : "") + "^" + (this.n === 2 ? "0.5" : "(1/" + this.n + ")");
  };

  var isCommutative = function (e) {
    return !Expression.has(e, Expression.Matrix) && !Expression.has(e, Expression.MatrixSymbol);
  };

  NthRoot.prototype.getDegree = function () {
    console.error('deprecated');
    return this.n;
  };
  NthRoot.prototype.multiplyExpression = function (x) {
    if (x instanceof Multiplication && isCommutative(this) && this.a instanceof Expression.Integer) {//TODO: fix
      for (var y of x.factors()) {
        if (y instanceof NthRoot && y.a instanceof Expression.Integer && compare4Multiplication2(y, this) === 0) {
          var multiplied = false;
          var result = Expression.ONE;
          for (var y1 of x.factors()) {
            var y2 = y1;
            if (!multiplied && y === y1) {
              y2 = y.multiply(this);
              multiplied = true;
            }
            result = result.multiply(y2);
          }
          return result;
        }
      }
    }
    return Expression.prototype.multiplyExpression.call(this, x);
  };

  NthRoot.prototype.equals = function (b) {
    if (b instanceof Expression.ExpressionWithPolynomialRoot || b instanceof Expression.ExpressionPolynomialRoot) {
      return b.equals(this);
    }
    return Expression.Function.prototype.equals.call(this, b);
  };

  //function isPrime(n) {
    //if (typeof n === "bigint") {//TODO: ?
    //  return n === BigInt(primeFactor(BigInt(n.toString())).toString());
    //}
    //return n == primeFactor(n);
  //}

  function isPerfectCube(n) {
    return SmallBigInt.toNumber(SmallBigInt.subtract(SmallBigInt.exponentiate(n._integerNthRoot(3).toBigInt(), SmallBigInt.BigInt(3)), n.toBigInt())) === 0;
  }
  function isPerfectSquare(n) {
    return SmallBigInt.toNumber(SmallBigInt.subtract(SmallBigInt.exponentiate(n._integerNthRoot(2).toBigInt(), SmallBigInt.BigInt(2)), n.toBigInt())) === 0;
  }
  var makeRoot = function (i, n) {
    return n === 1 ? i : (n === 2 ? new SquareRoot(i) : new NthRoot(n + "-root", i, n));
  };
  NthRoot.makeRoot = makeRoot;

  Expression.prototype._nthRoot = function (n) {
    if (typeof n === "number") {
      if (n < 1 || n > Number.MAX_SAFE_INTEGER || Math.floor(n) !== n) {
        throw new RangeError("NotSupportedError");
      }
    } else {
      if (!(this instanceof Expression.Matrix)) {
        throw new RangeError("NotSupportedError");
      }
    }
    var x = this;

    if (n === 2) {
      if (x instanceof Addition) {
        if ((x.a instanceof SquareRoot || x.a instanceof Multiplication && x.a.a instanceof Integer && x.a.b instanceof SquareRoot) && x.b instanceof Integer) {
          // (5^0.5+3)/2 or (-5^0.5+3)/2
          var u = x.a;
          var v = x.b;
          // (a+b)^2 = aa+2ab+bb = u+v
          // 2ab = u, b = u/(2a)
          // aa+bb = v, 4aaaa - 4vaa + uu = 0
          // t = sqrt(v*v-u*u);
          // a = sqrt(v+t)/sqrt(2)
          // b = sqrt(v-t)/sqrt(2)
          var tt = v.multiply(v).subtract(u.multiply(u));
          if (tt instanceof Integer && !isPerfectSquare(tt.abs())) {
            tt = null;
          }
          var t = tt instanceof Integer && tt.compareTo(Expression.ZERO) >= 0 ? tt.squareRoot() : undefined;
          if (t != undefined && (t instanceof Integer)) {//?
            var aa = v.add(t);
            var a = aa.compareTo(Expression.ZERO) >= 0 ? aa.squareRoot().divide(Expression.TWO.squareRoot()) : undefined;
            if (a != undefined) {
              var b = u.divide(Expression.TWO.multiply(a));
              return a.add(b);
            }
          }
        }
        //TODO: https://brownmath.com/alge/nestrad.htm  - √(√392 + √360)
        if ((x.a instanceof SquareRoot || x.a instanceof Multiplication && x.a.a instanceof Integer && x.a.b instanceof SquareRoot) &&
            (x.b instanceof SquareRoot || x.b instanceof Multiplication && x.b.a instanceof Integer && x.b.b instanceof SquareRoot)) {
          var a = x.a;
          var b = x.b;
          var aa = a.multiply(a);
          var bb = b.multiply(b);
          var g = aa.gcd(bb).squareRoot();
          if (!g.equals(Expression.ONE)) {
            var v = a.divide(g).add(b.divide(g)).squareRoot().multiply(g.squareRoot());
            if (typeof hit === "function") {
              hit({rootFromAddition: x.toString()});
            }
            return v;
          }
        }
        if (Expression._isPositive(x)) {//?
          var tmp = getConjugateFactor(x);
          if (tmp.p != null) {
            var t = tmp.p.toExpression()._nthRoot(tmp.degree);
            var polynomial = getPolynomialRelativeToNthRoot(x, tmp.p, tmp.degree);
            var u = polynomial.getCoefficient(1).multiply(t.toExpression());
            var v = polynomial.getCoefficient(0);
            var D = v.multiply(v).subtract(u.multiply(u));
            var f1 = function (aa) {
              var tmp = aa.divide(getConstant(aa));
              var c = Expression.getConjugate(tmp);
              return c != null && c.multiply(tmp) instanceof Integer && isPerfectSquare(c.multiply(tmp).abs());
            };
            if (D instanceof Integer || f1(D)) {//TODO: FIX
              var sD = D.squareRoot();
              var aa = v.add(sD);
              if (aa instanceof Integer || f1(aa)) {
                //console.log('aa', aa + '');
                var a = aa.squareRoot().divide(Expression.TWO.squareRoot());
                var b = u.divide(Expression.TWO.multiply(a));
                return a.add(b);
              }
            }
          }
        } else if (Expression._isPositive(x.negate()) && n === 2) {
          return Expression.I.multiply(x.negate()._nthRoot(2));
        }
      }
    }
    if (n === 3) {//? new: 2019-08-18
      if (x instanceof Addition) {
        if ((x.a instanceof SquareRoot && x.a.a instanceof Integer || x.a instanceof Multiplication && x.a.a instanceof Integer && x.a.b instanceof SquareRoot) && x.b instanceof Integer) {
          // (5^0.5+3)/2 or (-5^0.5+3)/2
          var u = x.a;
          var v = x.b;
          var d = u.multiply(u).subtract(v.multiply(v));
          if (isPerfectCube(d)) {//?
            // (a+b)^3 = aaa+3aab+3bba+bbb = u+v
            // aaa+3bba = v, bb=(v-aaa)/(3a)
            // 3aab+bbb = u, b(3aa+bb)=u, b=u/(3aa+bb), bb=u**2/(3aa+bb)**2
            // (9aaa+(v-aaa))**2*(v-aaa) = 27*aaa*u**2

            // t = aaa
            // (9t+(v-t))**2*(v-t) = 27*t*u**2

            var t = new Expression.Symbol('t');
            //var eq = ExpressionParser.parse('(9t+(v-t))**2*(v-t) - 27*t*u**2', new ExpressionParser.Context(function (id) {
            //  return id === 'v' ? v : (id === 'u' ? u : (id === 't' ? t : undefined));
            //})).simplify();
            var NINE = Expression.Integer.fromNumber(9);
            var TWENTY_SEVEN = Expression.Integer.fromNumber(27);
            var eq = Expression.pow(NINE.multiply(t).add(v.subtract(t)), 2).multiply(v.subtract(t)).subtract(TWENTY_SEVEN.multiply(t).multiply(Expression.pow(u, 2)));
            var p = Polynomial.toPolynomial(eq, t);
            p = p.scale(p.getContent().inverse());
            var t = p.doRationalRootTest();
            if (t != null) {
              var a = t._nthRoot(3);
              var b = u.divide(u.abs()).multiply(v.subtract(t).divide(Expression.Integer.fromNumber(3).multiply(a))._nthRoot(2));
              return a.add(b);
            }
          }
        }
      }
    }

    //?
    if (x instanceof NthRoot) {
      if (typeof hit === "function") {
        hit({rootFromRoot: ""});
      }
      return x.a._nthRoot(x.n * n);
    }
    if (x instanceof Division || x instanceof Multiplication) {
      if (n % 2 !== 0 || x.a instanceof Integer && x.a.compareTo(Expression.ZERO) > 0 || // sqrt(-x) = sqrt(-1 * -1) = i * i = -1
                         x.b instanceof Integer && x.b.compareTo(Expression.ZERO) > 0 || //TODO: fix
                         x.a instanceof Integer && isConstant(x.b) ||
                         isConstant(x) ||
                         isPositive(x.a) ||
                         isPositive(x.b) || // -sqrt(7)
                         //isPositive(x.a.negate()) ||
                         isPositive(x.b.negate())) {
        if (x instanceof Division) {
          return x.a._nthRoot(n).divide(x.b._nthRoot(n));
        }
        if (x instanceof Multiplication) {
          return x.a._nthRoot(n).multiply(x.b._nthRoot(n));
        }
      }
    }
    var qi = x instanceof Integer ? x : null;
    var qq = QuadraticInteger.toQuadraticInteger(x);
    // sqrt(2sqrt(2)+2) "(2*2^0.5+2)^0.5"
    // sqrt(sqrt(2)+2) "(2^0.5+1)^0.5*2^(1/4)"
    // sqrt(4sqrt(2)+4) 2*(2^0.5+1)^0.5
    // sqrt(2sqrt(2)+4) (2*2^0.5+2)^0.5*2^(1/4)

    //TODO: fix for !isPrime(qq.D)
    //if (qq != null && (isPrime(qq.D) && (qq.a / Math.gcd(qq.a, qq.b)) % qq.D == 0 || !isPrime(qq.D) && qq.a % qq.D == 0 && Math.gcd(qq.a, qq.b) % qq.D != 0)) {
      //var D = Expression.Integer.fromNumber(qq.D)._nthRoot(2);
      //return D._nthRoot(n).multiply(x.divide(D)._nthRoot(n));
    //}

    //!
    if (qq == null && x instanceof Expression.Addition) {
      if (x.a instanceof Multiplication && x.b instanceof Multiplication) {
        var g = x.a.pow(Expression.TWO).gcd(x.b.pow(Expression.TWO)).squareRoot();
        if (!g.equals(Expression.ONE)) {
          return g._nthRoot(n).multiply(x.divide(g)._nthRoot(n));
        }
      }
    }
    //!

    if (qq != null) {
      if (n !== 2 && n % 2 === 0) {
        //TODO: check
        var tmp = x.squareRoot();
        if (!(tmp instanceof Expression.SquareRoot)) {
          return tmp._nthRoot(n / 2);
        }
      }
      if ((n === 2 || n === 3) && qq.isValid()) {//Note: isValid should be checked here
      //if (qq.norm() === -1 * Math.pow(Math.gcd(qq.a, qq.b), 2)) {
        if (qq.isPositive()) {
        qi = qq;
        //!new 2020-12-31
        if (qq.norm != null && Math.abs(Number(qq.norm().toString())) > Number.MAX_SAFE_INTEGER) {
          qi = null;//!
        }
        //!
        } else {
          return Expression.ONE.negate()._nthRoot(n).multiply(this.negate()._nthRoot(n));
        }
      //}
      }
    }
    if (qi != null) {
      x = qi;//TODO:
      if (x instanceof Integer && x.compareTo(Expression.ZERO) < 0) {
        if (n % 2 === 0) {
          if (n === 2) {//TODO: ?
            return Expression.I.multiply(this.negate()._nthRoot(n));
          }
          throw new RangeError("NotSupportedError");
        }
        return this.negate()._nthRoot(n).negate();
      }
      if (x.equals(Expression.ZERO)) {
        return this;
      }
      var roots = [];
      var i = x;
      while (!i.equals(Expression.ONE)) {
        var d = i.primeFactor();
        if (d instanceof QuadraticInteger) {
          if (n !== 2 && n !== 3) {
            throw new TypeError(); // "assertion"
          }
          //if (Math.abs(Number(d.norm().toString())) === 1) {//!new
          //TODO: why is it here?
          // sqrt(sqrt(2)-1) = (sqrt(2)-1)*sqrt(sqrt(2)+1)
          if (Number(d.a.toString()) < 0 && Number(d.b.toString()) > 0 || Number(d.a.toString()) > 0 && Number(d.b.toString()) < 0) {
            var a = (n % 2 === 0 ? d.abs() : d);
            return x.toExpression().divide(a.toExpression()._pow(n))._nthRoot(n).multiply(a.toExpression());
          }
          //}
          var s = d.norm();
          // https://brownmath.com/alge/nestrad.htm#SurveyDoable
          //TODO: s >= 0 - ?
          if (Number(d.b.toString()) !== 0 && Number(d.a.toString()) !== 0 && Number(s.toString()) >= 0 && isPerfectSquare(Integer.fromBigInt(s))) {
            if (n === 2) {
            return x.toExpression().divide(d.toExpression())._nthRoot(2).multiply(d.toExpression()._nthRoot(2));
            }
          }
        }
        var ctz = i instanceof Expression.Integer && d instanceof Expression.Integer ? primeFactor._countTrailingZeros(i.value, d.value) : -1;
        var e = 0;
        if (ctz !== -1) {
          e = ctz;
          i = i.truncatingDivide(d._pow(ctz));
        } else {
        if (i.isUnit()) {
          //TODO:
          // d should be a https://en.wikipedia.org/wiki/Fundamental_unit_(number_theory)
          while (!i.equals(Expression.ONE)) {
            i = i.truncatingDivide(d);
            e += 1;
          }
        } else {
          while (i.isDivisibleBy(d)) {
            i = i.truncatingDivide(d);
            e += 1;
          }
        }
        }
        //if (ctz !== -1) {
        //  console.assert(ctz === e);
        //}
        d = d.toExpression();
        var nn = n;
        if (d instanceof NthRoot) {
          nn *= d.n;
          d = d.a;
        }
        var t = Math.gcd(nn, e);
        nn /= t;//?
        e /= t;//?

        while (e !== 0) {
          //var g = e;
          //while (nn % g !== 0) {
          //  g -= 1;
          //}
          var g = e >= nn ? nn : 1;

          var e1 = Math.floor(e / g);
          var k = Math.floor(nn / g);
          roots.push(Object.freeze({
            degree: k,
            radicand: Expression.pow(d, e1)
          }));

          e = e - g * e1; // e = e % g;
        }
      }
      var y = Expression.ONE;
      roots.sort((a, b) => a.degree - b.degree);
      var k = -1;
      for (var i = 0; i < roots.length; i += 1) {
        if (k === -1 || roots[i].degree !== roots[k].degree) {
          k += 1;
          roots[k] = roots[i];
        } else {
          roots[k] = Object.freeze({
            degree: roots[i].degree,
            radicand: roots[k].radicand.multiply(roots[i].radicand)
          });
        }
      }
      roots.length = k + 1;
      //for (var j = 1; j <= n; j += 1) {
      //}
      // `for-in` loop is used to have better performance for "a sparse array"
      var f = null;
      for (var jj = 0; jj < roots.length; jj += 1) {//TODO: fix the iteration order
          var degree = roots[jj].degree;
        if (degree !== 1) {
          var radicand = roots[jj].radicand;
          //y = y.multiply(makeRoot(radicand, j));
          var x = makeRoot(radicand, degree);
          if (y !== Expression.ONE) {
            y = new Expression.Multiplication(y, x);
          } else {
            y = x;
          }
        } else {
          f = roots[jj].radicand;
        }
      }
      if (f != null) {
        y = f.multiply(y);
      }
      return y;
    }
    if (x instanceof Expression.Matrix) {
      if (typeof hit === "function") {
        hit(n === 2 ? {squareRoot: "matrix"} : {nthRoot: "Matrix^(1/" + n + ")"});
      }
      var eigenvalues = Expression.getEigenvalues(x.matrix);
      var N = typeof n === "number" ? Expression.Integer.fromNumber(n) : n;
      if (eigenvalues.length === x.matrix.cols()) {
        var eigenvectors = Expression.getEigenvectors(x.matrix, eigenvalues);
        if (eigenvectors.filter(v => v != null).length === x.matrix.cols()) {
          if (!x.matrix.isDiagonal()) {
            if (Expression.callback != undefined) {
              Expression.callback(new Expression.Event("nth-root-using-diagonalization", x));
            }
            if (Expression.callback != undefined) {//TODO: remove - ?
              Expression.callback(new Expression.Event("diagonalize", x));
            }
          }
          var tmp = Expression.diagonalize(x.matrix, eigenvalues, eigenvectors);
          var L = tmp.L;
          var SL = L.map(function (e, i, j) {
            return i === j ? e.pow(Expression.ONE.divide(N)) : e;
          });
          return new Expression.Matrix(tmp.T.multiply(SL).multiply(tmp.T_INVERSED));
        } else {
          if (!x.matrix.isJordanMatrix()) {
            if (Expression.callback != undefined) {
              Expression.callback(new Expression.Event("nth-root-using-Jordan-normal-form", x));
            }
            if (Expression.callback != undefined) {//TODO: remove - ?
              Expression.callback(new Expression.Event("Jordan-decomposition", x));
            }
          } else {
            if (Expression.callback != undefined) {
              Expression.callback(new Expression.Event("Jordan-matrix-nth-root", x));
            }
          }
          var rootOfJordanForm = function (J, N) {
            var tmp = J.map(function (e, i, j) {
              if (i > j) {
                return Expression.ZERO;
              }
              if (i === j) {
                return J.e(i, j).pow(Expression.ONE.divide(N));
              }
              if (J.e(i, i + 1).equals(Expression.ZERO)) {
                return Expression.ZERO;
              }
              if (!J.e(i, i + 1).equals(Expression.ONE)) {
                throw new TypeError("assertion");
              }
              //if (i + 1 === j) {
                //return J.e(i, i).pow(Expression.ONE.divide(N)).divide(N.multiply(J.e(i, i)));
                //return J.e(i, i + 1).divide(N.multiply(J.e(i, i).pow(Expression.ONE.divide(N)).pow(N.subtract(Expression.ONE))));
              //}
              //return new Expression.Symbol('aa_(' + (j - i) + ',' + j + ')');
              var m = j - i;
              for (var k = 0; k < m; k += 1) {
                if (!J.e(j - 1 - k, j - k).equals(Expression.ONE)) { // outside of a block
                  return Expression.ZERO;
                }
              }
              // 1/n(1/n-1)(1/n-2)(1/n-3)/(4!*λ**4) * λ**(1/n)
              var f = Expression.ONE;
              for (var k = 0; k < m; k += 1) {
                f = f.multiply(Expression.ONE.divide(N).subtract(Expression.Integer.fromNumber(k))).divide(Expression.Integer.fromNumber(k + 1));
              }
              return f.divide(J.e(i, i)._pow(m)).multiply(J.e(i, i).pow(Expression.ONE.divide(N)));
            });

            /*
            for (var k = 2; k < J.cols(); k += 1) {
              //var x = tmp.pow(N);
              var x = new Expression.Matrix(tmp).pow(N).matrix;//!?
              tmp = tmp.map(function (e, i, j) {
                if (i + k === j) {
                  if (x.e(i, j).equals(Expression.ZERO)) {
                    return Expression.ZERO;
                  }
                  var s = new Expression.Symbol('aa_(' + (j - i) + ',' + j + ')');
                  var p = Polynomial.toPolynomial(x.e(i, j).getNumerator(), s);
                  if (p.getDegree() === 0) {
                    return x.e(i, j);
                  }
                  if (p.getDegree() !== 1) {
                    throw new TypeError("!");
                  }
                  var y = p.getCoefficient(0).negate().divide(p.getCoefficient(1));
                  return y;
                }
                return e;
              });
            }
            */
            return tmp;
          };
          var tmp = Expression.getFormaDeJordan(x.matrix, eigenvalues);
          var JN = rootOfJordanForm(tmp.J, N);
          //TODO: details - ?
          return new Expression.Matrix(tmp.P.multiply(JN).multiply(tmp.P_INVERSED));
        }
      }
      //TODO: using Jordan normal form -?
    }
    //!2019-04-22
    if (x instanceof Exponentiation && x.a instanceof Integer && x.a.compareTo(Expression.ZERO) > 0) {
      //if (n === 2) {//TODO:
        if (x.b instanceof Expression.Symbol) {
          if (x.a instanceof Expression.Integer && integerPrimeFactor(x.a).equals(x.a)) {
            //return new SquareRoot(x);
            return new Expression.Exponentiation(x.a, x.b.divide(Expression.Integer.fromNumber(n)));
          }
        } else {
          return x.a.pow(x.b.divide(Expression.Integer.fromNumber(n)));
        }
      //}
    }

    //!2019-16-06
    if (x instanceof Exponentiation && x.a === Expression.E) {
      return x.a.pow(x.b.divide(Expression.Integer.fromNumber(n)));
    }
    if (x instanceof Exponentiation && getBase(x) instanceof Expression.Logarithm && getBase(x).a instanceof Expression.Integer) {//TODO: ?
      return x.a.pow(x.b.divide(Expression.Integer.fromNumber(n)));
    }
    if (x instanceof IdentityMatrix) {
      if (simplifyIdentityMatrixPower) {
        return x;
      }
    }
    //!2019-17-06
    if (x instanceof Expression.Symbol) {
      return new Expression.Exponentiation(x, Expression.ONE.divide(Expression.Integer.fromNumber(n)));
    }
    if (x instanceof Exponentiation &&
        (x.a instanceof Expression.Symbol || isGoodPolynomial(x.a)) &&
        (n % 2 === 1 || (x.b.getNumerator() instanceof Integer && x.b.getNumerator().remainder(Expression.TWO).equals(Expression.ONE)))) {
      //TODO: fix condition for n % 2 === 0
      var b = x.b.divide(Expression.Integer.fromNumber(n));
      return b.equals(Expression.ONE) ? x.a : new Expression.Exponentiation(x.a, b);
    }

    //!2019-06-20
    //var v = getVariable(x);
    var v = getVariableInternal(getLastMultiplicationOperand(getFirstAdditionOperand(x))).next().value.v; // avoid square roots
    if (v instanceof Expression.Symbol || (v instanceof Expression.Logarithm && v.a instanceof Expression.Integer) && (n === 2 || n === 3 || true)) {//TODO: other n's
      var p = Polynomial.toPolynomial(x, v);
      var c = p.getContent();
      if (c.isNegative()) {
        c = c.negate();
      }
      if (isPositive(c) && !c.equals(Expression.ONE)) {
        return x.divide(c)._nthRoot(n).multiply(c._nthRoot(n));
      }
      if (p.getDegree() === 1 && p.getCoefficient(0) instanceof Integer && !p.getCoefficient(0).equals(Expression.ZERO) && p.getCoefficient(1) instanceof Integer) {
        //TODO:
        if (p.getCoefficient(1).compareTo(Expression.ZERO) > 0) {
          var N = n instanceof Expression.Symbol ? n : Expression.Integer.fromNumber(n);//TODO: ?
          return new Expression.Exponentiation(x, Expression.ONE.divide(N));
        } else {
          //!TODO: fix
          if (n % 2 !== 0) {
            return Expression.ONE.negate()._nthRoot(n).multiply(new Expression.Exponentiation(x.negate(), Expression.ONE.divide(Expression.Integer.fromNumber(n))));
          }
        }
      }
      if (p.getDegree() > 1 && !p.getCoefficient(0).equals(Expression.ZERO)) {
        //TODO: check
        var N = p.getDegree();
        var t = v.multiply(p.getCoefficient(N)._nthRoot(N)).add(p.getCoefficient(0)._nthRoot(N));
        if (x.equals(t._pow(N))) {
          //!TODO: remove
          if (N >= n && (n % 2 !== 0 || Expression._isPositive(v))) {
            return t.pow(Expression.ONE).multiply(t._pow(N - n)._nthRoot(n));
          }
          //!
          if (n % 2 !== 0 || Expression._isPositive(v)) {
            return new Expression.Exponentiation(t, Expression.Integer.fromNumber(N).divide(Expression.Integer.fromNumber(n)));
          }
        }
        //TODO: (ax+b)**(n+1)
        if (p.getDegree() > 1 && p.getSquareFreePolynomial().equals(p) && n === 2) {//TODO: fix ?
          return new Expression.Exponentiation(x, Expression.ONE.divide(Expression.Integer.fromNumber(n)));
        }
        if (p.getDegree() > 1 && n === 3) {
          var d = simpleDivisor(x);
          return x.divide(d)._nthRoot(n).multiply(d._nthRoot(n));
        }
      }
    }

    if (n % 2 !== 0 && x instanceof Expression.ExponentiationOfMinusOne) {//?
      return getBase(x).pow(getExponent(x).divide(Expression.Integer.fromNumber(n)));
    }

    if (x instanceof Addition && x.b instanceof NthRoot && x.a instanceof NthRoot) {//TODO: ? multiple operands - ?
      var g = nthRootCommonFactor(x.a, x.b);
      if (!g.equals(Expression.ONE)) {
        return g._nthRoot(n).multiply(x.divide(g)._nthRoot(n));
      }
    }

    if (x instanceof Exponentiation && n === 3 && getExponent(x).equals(Integer.fromNumber(3))) {//TODO: other degrees (?)
      return getBase(x);
    }
    if (x instanceof Exponentiation && n === 2 && getExponent(x).equals(Integer.fromNumber(2))) {//TODO: other degrees (?)
      if (isPositive(getBase(x))) {
        return getBase(x);
      }
      if (isPositive(getBase(x).negate())) {
        return getBase(x).negate();
      }
    }

    var sd = simpleDivisor(x);
    if (!sd.equals(x)) {//TODO: FIX
      //debugger;
      //console.log(sd + '');
      //console.log(isPositive(sd));
      console.log(sd.toString());
      if (isPositive(sd) && (!(sd instanceof Addition) || !(x.divide(sd) instanceof Addition))) {
        if (!(sd._nthRoot(n) instanceof NthRoot)) {//TODO: !?
        return sd._nthRoot(n).multiply(x.divide(sd)._nthRoot(n));
        }
      }
    }

    const allowComplexSqrt = true;
    const isComplexNumber = function (x) {
      return Expression.isConstant(x) && !Expression.has(x, Expression.Sin) && !Expression.has(x, Expression.Cos);
    };
    if (typeof n === "number" && !isPositive(x) && allowComplexSqrt && isComplexNumber(x) && n === 2) {
      // https://en.wikipedia.org/wiki/Complex_number#Square_root
      const tmp = Expression.getComplexNumberParts(x);
      const a = tmp.real;
      const b = tmp.imaginary;
      //debugger;
      const tmp2 = a._pow(2).add(b._pow(2)).squareRoot();
      const gamma = a.add(tmp2).divide(Expression.TWO).squareRoot();
      const delta = Expression.Integer.fromNumber(b.sign()).multiply(a.negate().add(tmp2).divide(Expression.TWO).squareRoot());
      const result = gamma.add(delta.multiply(Expression.I));
      return result;
    }
    if (typeof n === "number" && (isPositive(x) || allowComplexSqrt && isComplexNumber(x) && n === 2)) {//?TODO: FIX
      var tmp = Expression.toPolynomialRoot(makeRoot(x, n));
      if (tmp != undefined) {
        return tmp;
      }
    }
    if (typeof n === "number" && isPositive(x.negate())) {
      var tmp = Expression.toPolynomialRoot(makeRoot(x.negate(), n));
      if (tmp != undefined) {
        return tmp.negate();
      }
    }

    if (getBase(x) instanceof Expression.Symbol && getBase(x).symbol.startsWith('$t') && typeof n === "number") {
      return getBase(x).pow(getExponent(x).divide(Expression.Integer.fromNumber(n)));
    }
    
    //!new
    //TODO: remove (move)
    if (Expression.isReal(x) && typeof n === "number") {
      if (isPositive(x)) {
        return new Expression.Exponentiation(x, Expression.Integer.fromNumber(n).inverse());//?
      } else {
        debugger;
      }
    }
    //!
    
    //TODO: !?
    if (n === 2 && !(this instanceof Expression.Exponentiation)) {
      console.log(this.toString());
      //debugger;
      if (Expression.has(this, Expression.Symbol)) {
        return new Expression.Exponentiation(x, Expression.Integer.fromNumber(n).inverse());
      }
      return NthRoot.makeRoot(this, n);
    }
    
    throw new RangeError("NotSupportedError");
  };

  function SquareRoot(a) {
    NthRoot.call(this, "sqrt", a, 2);
  }

  SquareRoot.prototype = Object.create(NthRoot.prototype);
  //!
  SquareRoot.prototype.divideInteger = function (x) {
    //TODO: check
    return x.multiply(this).divide(this.a);
  };

  Expression.prototype.squareRoot = function () {
    return this._nthRoot(2);
  };

  Expression.Rank = function (matrix) {
    Expression.Function.call(this, "rank", matrix);
  };
  Expression.Rank.prototype = Object.create(Expression.Function.prototype);

  Expression.prototype.rank = function () {
    var x = this;
    if (!(x instanceof Expression.Matrix)) {
      throw new RangeError("NotSupportedError:matrixArgExpected");//?
    }
    //!
    if (Expression.callback != undefined) {
      Expression.callback(new Expression.Event("rank", x));
    }
    //TODO: fix
    var cases = [];
    var rank = undefined;
    Matrix.toRowEchelonWithCallback(x.matrix, Matrix.GaussMontante, "", undefined, function (result) {
      var condition = result.condition;
      if (!condition.isTrue()) {
        var resultMatrix = result.matrix;
        cases.push(new ExpressionWithCondition(Integer.fromNumber(resultMatrix.rank()), condition));
      } else {
        rank = result.matrix.rank();
      }
    });
    if (cases.length !== 0) {
      return new Expression.Cases(cases);
    }
    //!
    return Integer.fromNumber(rank);
  };
  Expression.Determinant = function (matrix) {
    Expression.Function.call(this, "determinant", matrix);
  };
  Expression.Determinant.prototype = Object.create(Expression.Function.prototype);
  function isSquareMatrix(x) {
    if (x instanceof Expression.Matrix && x.matrix.isSquare()) {
      return true;
    }
    if (x instanceof Expression.Exponentiation && x.a instanceof Expression.MatrixSymbol && isIntegerOrN(x.b)) {
      return true;
    }
    return false;
  }
  Expression.prototype.determinant = function () {
    var x = this;
    if (x instanceof Expression.Multiplication && (isSquareMatrix(x.a) || isSquareMatrix(x.b))) {
      //TODO: ?
      if (Expression.callback != undefined) {
        Expression.callback(new Expression.Event("property-determinant-of-multiplication", {matrix: "{{0}}"}));
      }
      return x.a.determinant().multiply(x.b.determinant());
    }
    if (x instanceof Expression.Exponentiation && x.a instanceof Expression.MatrixSymbol && isIntegerOrN(x.b)) {
      //TODO: ?
      if (Expression.callback != undefined) {
        Expression.callback(new Expression.Event("property-determinant-of-multiplication", {matrix: "{{0}}"}));
      }
      return x.a.determinant().pow(x.b);
    }
    if (x instanceof Expression.MatrixSymbol) {
      return new Expression.Determinant(x);//?
    }
    if (isMatrixSymbolTranspose(x)) {//TODO: other cases
      return x.transpose().determinant();
    }
    if (!(x instanceof Expression.Matrix)) {
      throw new RangeError("NotSupportedError:matrixArgExpected");//?
    }
    //!
    if (Expression.callback != undefined) {
      Expression.callback(new Expression.Event(x.matrix.getDeterminantEventType("determinant").type, x));
    }
    return x.matrix.determinant();
  };
  Expression.RowReduce = function (matrix) {
    Expression.Function.call(this, "row-reduce", matrix);
  };
  Expression.RowReduce.prototype = Object.create(Expression.Function.prototype);
  Expression.prototype.rowReduce = function () {
    var x = this;
    if (!(x instanceof Expression.Matrix)) {
      throw new RangeError("NotSupportedError:matrixArgExpected");//?
    }
    //!
    if (Expression.callback != undefined) {
      Expression.callback(new Expression.Event("row-reduce".type, x));
    }
    //TODO: Matrix.GaussMontante
    return new Expression.Matrix(x.matrix.toRowEchelon(Matrix.GaussJordan, "", null).matrix);
  };
  Expression.Transpose = function (matrix) {
    Expression.Function.call(this, "transpose", matrix);
  };
  Expression.Transpose.prototype = Object.create(Expression.Function.prototype);
  Expression.prototype.transpose = function () {
    var x = this;
    if (x instanceof Expression.Multiplication) {
      //TODO: info about properties of the Matrix Transpose
      if (Expression.callback != undefined) {
        Expression.callback(new Expression.Event("property-transpose-of-multiplication", {matrix: "{{0}}"}));
      }
      return x.b.transpose().multiply(x.a.transpose());//TODO: ?
    }
    if (x instanceof Expression.Addition) {
      return x.a.transpose().add(x.b.transpose());
    }
    if (isScalar(x)) {
      return x;
    }
    if (!(getBase(x) instanceof MatrixSymbol) && x instanceof Expression.Exponentiation && x.b.equals(Expression.ONE.negate())) {
      //TODO: (X^-2)^T
      return x.a.transpose().pow(x.b);
    }
    if (x instanceof Expression.Exponentiation && x.b.equals(new Expression.Symbol("T"))) {
      //TODO: (X**2)^T
      return x.a;
    }
    if (getBase(x) instanceof MatrixSymbol) {
      var e = getExponent(x).multiply(new Expression.Symbol("T"));
      //TODO: ?
      var p = Polynomial.toPolynomial(e, new Expression.Symbol("T"));
      if (p.getDegree() >= 2) {
        e = e.subtract(p.getCoefficient(2).multiply(new Expression.Symbol("T")._pow(2))).add(p.getCoefficient(2));
      }
      return new Expression.Exponentiation(getBase(x), e);
    }
    if (!(x instanceof Expression.Matrix)) {
      throw new RangeError("NotSupportedError");//?
    }
    return new Expression.Matrix(x.matrix.transpose());
  };
  Expression.Adjugate = function (matrix) {
    Expression.Function.call(this, "adjugate", matrix);
  };
  Expression.Adjugate.prototype = Object.create(Expression.Function.prototype);
  Expression.prototype.adjugate = function () {
    var x = this;
    const property = function () {
      //TODO: ?
      if (Expression.callback != undefined) {
        Expression.callback(new Expression.Event("property-adjugate-of-multiplication", {matrix: "{{0}}"}));
      }
    };
    if (x instanceof Expression.Multiplication && (isSquareMatrix(x.a) || isSquareMatrix(x.b))) {
      property();
      return x.b.adjugate().multiply(x.a.adjugate());
    }
    if (x instanceof Expression.Exponentiation && x.a instanceof Expression.MatrixSymbol && isIntegerOrN(x.b)) {
      property();
      return x.a.adjugate().pow(x.b);
    }
    if (isMatrixSymbolTranspose(x)) {
      property();
      return x.transpose().adjugate().transpose();
    }
    if (x instanceof Expression.MatrixSymbol) {
      //TODO: ?
      //assuming x is an invertible square matrix
      return x.determinant().multiply(x.inverse());
      //TODO: ?
      //return new Expression.Cases([
      //  new ExpressionWithCondition(new Expression.Adjugate(x), Condition.TRUE.andZero(new Expression.Determinant(x))),
      //  new ExpressionWithCondition(x.determinant().multiply(x.inverse()), Condition.TRUE.andNotZero(new Expression.Determinant(x)))
      //]);
    }
    if (!(x instanceof Expression.Matrix)) {
      throw new RangeError("NotSupportedError:matrixArgExpected");//?
    }
    if (Expression.callback != undefined) {
      Expression.callback(new Expression.Event("adjugate", x));
    }
    if (x.matrix.rows() === 1 && x.matrix.cols() === 1) {
      return new Expression.Matrix(Matrix.I(1));
    }
    var det = x.matrix.determinant();
    if (Expression.isScalar(det) && !det.equals(Expression.ZERO)) {//TODO: other cases
      return new Expression.Matrix(x.matrix.inverse().scale(det));
    }
    //TODO: optimize
    var C = x.matrix.map(function (element, i, j, matrix) {
      return ((i + j) - 2 * Math.floor((i + j) / 2) === 1 ? Expression.ONE.negate() : Expression.ONE).multiply(matrix.minorMatrix(i, j).determinant());
    });
    var CT = new Expression.Matrix(C.transpose());
    return CT;
  };

  Expression.NoAnswerExpression = function (matrix, name, second) {
    Expression.Function.call(this, name, matrix);
    this.second = second;
  };
  Expression.NoAnswerExpression.prototype = Object.create(Expression.Function.prototype);
  //TODO: remove secondArgument (?)
  Expression.prototype.transformNoAnswerExpression = function (name, second) {
    second = second == undefined ? undefined : second;
    if (!(this instanceof Expression.Matrix)) {
      throw new RangeError("NotSupportedError");//?
    }
    if (name === "solve") {
      if (Expression.callback != undefined) {
        Expression.callback(new Expression.Event("solve", this));
      }
    }
    return new Expression.NoAnswerExpression(this, name, second);
  };

  //Expression.NoAnswerExpression.prototype.multiplyExpression =
  //Expression.NoAnswerExpression.prototype.multiplyMatrix =
  //Expression.NoAnswerExpression.prototype.multiplySymbol =
  //Expression.NoAnswerExpression.prototype.multiplyInteger =
  Expression.NoAnswerExpression.prototype.multiply = function () {
    throw new RangeError("NotSupportedError");
  };
  Expression.NoAnswerExpression.prototype.add = function () {
    throw new RangeError("NotSupportedError");
  };

  //TODO: remove (only for second)
  Expression.NoAnswerExpression.prototype.toString = function (options) {
    if (this.second == undefined) {
      return Expression.Function.prototype.toString.call(this, options);
    }
    return this.a.toString(setTopLevel(true, options)) + " " + this.name + " " + this.second.toString(setTopLevel(true, options));
  };


  Expression.ElementWisePower = function (a, b) {
    BinaryOperation.call(this, a, b);
  };
  Expression.ElementWisePower.prototype = Object.create(BinaryOperation.prototype);
  Expression.ElementWisePower.prototype.getS = function () {
    return ".^";
  };
  Expression.prototype.elementWisePower = function (e) {
    if (!(this instanceof Expression.Matrix)) {
      throw new RangeError("NotSupportedError");//?
    }
    return new Expression.Matrix(this.matrix.map(function (element, i, j) {
      return element.pow(e);
    }));
  };

  Expression.prototype.isRightToLeftAssociative = function () {
    var x = this;
    if (x instanceof Integer) {
      return x.compareTo(Expression.ZERO) < 0;
    }
    if (x instanceof Negation) {
      return true;
    }
    if (x instanceof BinaryOperation) {
      if (x.isNegation()) {
        return true;
      }
      return x instanceof Exponentiation;
    }
    return false;
  };

  var integerPrimeFactor = function (n) {
    return Integer.fromBigInt(primeFactor(n.value));
  };

  //?
  var simpleDivisor = function (e) {
    if (e instanceof Division) {
      throw new RangeError();
    }
    if (e instanceof Expression.Matrix) {
      throw new RangeError();
    }
    if (e instanceof Expression.Symbol) {
      return e;
    }
    if (e instanceof Integer) {
      var x = e;
      var i = x.compareTo(Expression.ZERO) < 0 ? x.negate() : x;
      if (i.compareTo(Expression.ONE) > 0) {
        return integerPrimeFactor(i);
      }
      return null;
    }
    if (e instanceof Expression.Complex) {
      //TODO: (!)
      var f = e.primeFactor();
      if (!f.equals(e) && e.divide(f) instanceof Expression.Integer) {
        f = f.multiply(Expression.I);
      }
      return f;
      /*
      var g = integerGCD(e.real, e.imaginary);
      var t = simpleDivisor(g);
      if (t != null) {
        return t;
      }
      if (typeof hit === "function") {
        hit({everySimpleDivisor: e.toString()});
      }
      return e;
      */
    }
    //var v = getVariable(e);
    // To avoid square roots / nth roots:
    var v = getVariableInternal(getLastMultiplicationOperand(getFirstAdditionOperand(e))).next().value.v;
    //if (v instanceof NthRoot || v instanceof Integer || v instanceof Expression.Complex) {
    //  v = undefined;
    //}
    if (v instanceof NthRoot && v.a instanceof Integer && v.n === 2) {//TODO: ???
      var p = getPolynomialRelativeToNthRoot(e, v.a, v.n);
      var f = p.getContent();
      if (!f.equals(Expression.ONE) && !f.equals(Expression.ONE.negate())) {
        return simpleDivisor(f);
      }
    }
    if (v != undefined) {
      v = getVariable(v);//!?TODO: FIX
      var r = getReplacement(e, v);
      if (!r.equals(v)) {
        return substitute(simpleDivisor(substitute(e, v, r, inverseReplacement(r, v))), v, inverseReplacement(r, v), r);
      }

      var np = Polynomial.toPolynomial(e, v);

      var content = np.getContent();
      var t = simpleDivisor(content);
      if (t != null) {
        return t;
      }
      var c = getConstant(np.getLeadingCoefficient());
      if (c instanceof Expression.Complex && c.real.equals(Expression.ZERO)) {
        return Expression.I;//!?
      }

      //?
      if (np.getCoefficient(0).equals(Expression.ZERO)) {
        return v;
      }

      if (np.getDegree() >= 2) {
        //TODO: square free polynomial - ?
        var root = np.doRationalRootTest();
        if (root != null) {
          var t = v.multiply(root.getDenominator()).subtract(root.getNumerator());
          return t;
        }
      }

      if (np.getDegree() >= 2 && np._hasIntegerLikeCoefficients()) {
        //TODO: TEST COVERAGE (!)
        var t = np.factorize();
        if (t != null) {
          //TODO: write a test case
          return simpleDivisor(t.calcAt(v));
        }
      }

      if (np.getDegree() >= 2 && !np._hasIntegerLikeCoefficients()) {
        //TODO: TEST COVERAGE (!)
        var t = np.squareFreeFactors();
        if (t.a0.getDegree() !== 0) {
          //TODO: write a test case
          return t.a0.scale(t.a0.getLeadingCoefficient().inverse()).calcAt(v);
        }
      }
      /*
      if (np.getDegree() >= 2) {
        var roots = np.getroots();
        if (roots.length > 0) {
          var root = roots[0];
          return v.subtract(root);
        }
      }
      */

      e = np.calcAt(v);
      if (e.isNegative()) {//TODO: remove - ?
        e = e.negate();//!?
      }
      return e;
    }
    throw new RangeError();//?
  };
  Expression.simpleDivisor = simpleDivisor;

  Expression.everyDivisor = function (e, callback) {
    if (e.equals(Expression.ZERO)) {
      return true;
    }
    if (!callback(Expression.ONE)) {
      return false;
    }
    var divisors = [];
    var rec = function (start, n, s) {
      if (n >= 0) {
        var x = divisors[n];
        for (var i = start; i <= x.e; i += 1) {
          if (!rec(0, n - 1, s.multiply(Expression.pow(x.d, i)))) {
            return false;
          }
        }
      } else {
        if (!callback(s)) {
          return false;
        }
      }
      return true;
    };
    while (!e.equals(Expression.ONE) && !e.equals(Expression.ONE.negate())) {
      var d = simpleDivisor(e);
      if (divisors.length === 0 || !divisors[divisors.length - 1].d.equals(d)) {
        divisors.push({
          d: d,
          e: 0
        });
      }
      divisors[divisors.length - 1].e += 1;
      if (!rec(divisors[divisors.length - 1].e, divisors.length - 1, Expression.ONE)) {
        return false;
      }
      e = e.divide(d);
    }
    return true;
  };

  Expression.Integer = Integer;
  Expression.NthRoot = NthRoot;
  Expression.SquareRoot = SquareRoot;
  Expression.Negation = Negation;
  Expression.Subtraction = Subtraction;
  Expression.BinaryOperation = BinaryOperation;
  Expression.Exponentiation = Exponentiation;
  Expression.Multiplication = Multiplication;
  Expression.Addition = Addition;
  Expression.Division = Division;
  //TODO: remove
  Expression.pow = function (x, count) {
    return x._pow(count);
  };
  Expression.prototype._pow = function (count) {
    return pow(this, count, Expression.ONE);
  };
  Expression.Integer.prototype._pow = function (count) {
    // for performance (?)
    if (typeof count === "number" && Math.floor(count) === count && count >= 0 && count <= Number.MAX_SAFE_INTEGER) {
      return new Integer(SmallBigInt.exponentiate(this.value, SmallBigInt.BigInt(count)));
    }
    return Expression.prototype._pow.call(this, count);
  };
  Expression.Integer.prototype._nthRoot = function (n) {
    // for performance (?)
    //TODO: fix (more cases)
    if (typeof n === "number" && n === 2 && this.equals(this.abs()) && isPerfectSquare(this)) {
      return this._integerNthRoot(2);
    }
    if (typeof n === "number" && n === 3 && isPerfectCube(this)) {
      return this._integerNthRoot(3);
    }
    //TODO: move !!!
    if (typeof n === "number" && n === 2 && this.equals(this.abs())) {
      var x = this;
      var a = Expression.ONE;
      var s = Expression.ONE;
      while (!isPerfectSquare(x)) {
        var f = Integer.fromBigInt(primeFactor(x.toBigInt()));
        var multiplicity = primeFactor._countTrailingZeros(x.toBigInt(), f.toBigInt());
        x = x.divide(f._pow(multiplicity));
        if (multiplicity % 2 === 1) {
          //var g = a.gcd(f);
          //if (!g.equals(Expression.ONE)) {
          //  f = f.divide(g);
          //  a = a.divide(g);
          //  a = a.multiply(g);
          //}
          //s.push(f);
          s = s.multiply(f);
          multiplicity -= 1;
        }
        a = a.multiply(f._pow(multiplicity / 2));
      }
      return x.squareRoot().multiply(a).multiply(new SquareRoot(s));
    }
    return Expression.prototype._nthRoot.call(this, n);
  };
  Expression.Integer.prototype._isPerfectSquare = function () {
    if (this.sign() < 0) {
      return false;
    }
    return isPerfectSquare(this);
  };
  Integer.prototype._integerNthRoot = function (n) {
    return new Integer(SmallBigInt.BigInt(primeFactor._integerNthRoot(this.toBigInt(), n)));
  };
  Integer.prototype.bitLength = function () {
    return primeFactor._bitLength(this.toBigInt());
  };
  Integer.prototype.modInverse = function (p) {
    return Expression.Integer.fromBigInt(primeFactor._modInverse(this.toBigInt(), p.toBigInt()));
  };
  Integer.prototype.modulo = function modulo(p) {
    const r = this.remainder(p);
    return r.compareTo(Expression.ZERO) < 0 ? r.add(p) : r;
  };
  // ---





  Expression.Equality = function (a, b) {
    BinaryOperation.call(this, a, b);
  };

  Expression.Equality.prototype = Object.create(BinaryOperation.prototype);
  Expression.Equality.prototype.getS = function () {
    return "=";
  };

  Expression.Inequality = function (a, b, sign) {
    BinaryOperation.call(this, a, b);
    this.sign = sign;
  };

  Expression.Inequality.prototype = Object.create(BinaryOperation.prototype);
  Expression.Inequality.prototype.getS = function () {
    return this.sign;
  };

  function AdditionIterator(e) {
    if (e == undefined) {
      throw new TypeError();
    }
    this.value = undefined;
    this.e = e;
  }
  AdditionIterator.prototype = Object.create(Iterator.prototype);
  AdditionIterator.prototype.next = function () {
    this.value = this.e instanceof Addition ? this.e.b : this.e;
    this.e = this.e instanceof Addition ? this.e.a : undefined;
    return this;
  };

  function MultiplicationIterator(e) {
    if (e == undefined) {
      throw new TypeError();
    }
    this.value = undefined;
    this.e = e;
  }
  MultiplicationIterator.prototype = Object.create(Iterator.prototype);
  MultiplicationIterator.prototype.next = function () {
    this.value = this.e instanceof Multiplication ? this.e.b : this.e;
    this.e = this.e instanceof Multiplication ? this.e.a : null;
    return this;
  };

  Expression.prototype.summands = function () {
    return new AdditionIterator(this);
  };

  Expression.prototype.factors = function () {
    return new MultiplicationIterator(this);
  };

  var splitX = function (e) {
    var scalar = undefined;
    var l = undefined;
    var r = undefined;
    var xx = undefined;
    for (var x of e.summands()) {
      //TODO: why iteration by additions - (?)
      var state = 0;
      for (var y of x.factors()) {
        var factor = y;
        var factorBase = getBase(y);
        var factorExponent = getExponent(y);
        /*if ((!(factorBase instanceof Integer) && !(factorBase instanceof Expression.Symbol) && !(factorBase instanceof Expression.Matrix)) ||
            !(factorExponent instanceof Integer) && !(factorExponent instanceof Expression.Symbol && factorExponent.toString() === "T")) {//TODO: fix
          throw new RangeError("NotSupportedError");
        }*/
        var s = factorBase instanceof Expression.Symbol ? factorBase.toString() : "";
        if (s === "X" && state === 0) {
          state = 1;
          xx = factor;
        } else {
          if (isScalar(factor)) {
            scalar = scalar == undefined ? factor: factor.multiply(scalar);
          } else {
            if (state === 0) {
              r = r == undefined ? factor : factor.multiply(r);
            }
            if (state === 1) {
              l = l == undefined ? factor : factor.multiply(l);
            }
          }
        }
      }
    }
    scalar = scalar == undefined ? Expression.ONE : scalar;
    return {s: scalar, l: l, r: r, x: xx};
  };
  Expression.splitX = splitX;
  var groupX = function (a, b) {
    var tmp1 = splitX(a);
    var tmp2 = splitX(b);
    var s1 = tmp1.s;
    var l1 = tmp1.l;
    var r1 = tmp1.r;
    var s2 = tmp2.s;
    var l2 = tmp2.l;
    var r2 = tmp2.r;
    if (r1 == undefined && r2 == undefined && tmp1.x.equals(tmp2.x)) {
      l1 = l1 == undefined ? new IdentityMatrix("I") : l1;
      l2 = l2 == undefined ? new IdentityMatrix("I") : l2;
      return new Multiplication(s1.multiply(l1).add(s2.multiply(l2)), tmp1.x);
    }
    if (l1 == undefined && l2 == undefined && tmp1.x.equals(tmp2.x)) {
      r1 = r1 == undefined ? new IdentityMatrix("I") : r1;
      r2 = r2 == undefined ? new IdentityMatrix("I") : r2;
      return new Multiplication(tmp1.x, s1.multiply(r1).add(s2.multiply(r2)));
    }
    return undefined;
  };

  //TODO: remove (replace with a Condition) - ?
  //?
  var getExpressionWithX = function (e) {
    if (e instanceof Division) {
      if (e.getDenominator() instanceof Expression.Integer) {
        e = e.getNumerator();//!
      } else {
        return {withX: undefined, withoutX: undefined};
      }
    }

    var withX = undefined;
    var withoutX = undefined;
    for (var x of e.summands()) {
      var summand = x;
      var hasX = false;
      for (var y of x.factors()) {
        var factor = y;
        var factorBase = getBase(factor);
        //!new2019-12-03
        if (factorBase instanceof Addition && getExponent(factor).isNegative()) { // (<matrix addition>)**-1 (?)
          //TODO: fix
          var q = null; // e.subtract(x)
          for (var x1 of e.summands()) {
            if (x1 !== x) {
              q = q == null ? x1 : q.add(x1);
            }
          }
          var exponent = getExponent(factor).negate();
          var e1 = q.multiply(factorBase.pow(exponent)).add(x.multiply(new Expression.Exponentiation(factorBase, exponent)));
          var z2 = e1.transformEquality(Expression.ZERO);
          //TODO:
          //var tmp = Polynomial.toPolynomial(factorBase, z2.a).calcAt(z2.b);
          var variable = getExponent(z2.a) instanceof Expression.Symbol ? z2.a : getBase(z2.a);
          var tmp = Polynomial.toPolynomial(factorBase, variable).divideAndRemainder(Polynomial.toPolynomial(z2.a.subtract(z2.b), variable)).remainder.calcAt(variable);
          var d = tmp instanceof Expression.Matrix ? tmp.determinant() : null;
          if (!Expression.isConstant(d)) {//TODO: ?
            return {withX: undefined, withoutX: undefined};
          }
          if (d.equals(Expression.ZERO)) {
            return {withX: Expression.ZERO, withoutX: Expression.ONE};//TODO: no solutions
          }
          return getExpressionWithX(e1);//!hack
        }
        //!
        //!2020-06-14
        if (factorBase instanceof MatrixSymbol && getExponent(factor).isNegative()) { // (<matrix addition>)**-1 (?)
          var exponent = getExponent(factor).negate();
          // if the multiplication will "remove" the factor
          var e1 = x.b.equals(factor) ? e.multiply(factorBase.pow(exponent)) : (Array.from(factorBase.pow(exponent).multiply(x).factors()).length < Array.from(x.factors()).length ? factorBase.pow(exponent).multiply(e) : null);
          //TODO: determinant(X) != 0
          //?
          /*
          var g = null;
          for (var x of e1.summands()) {
            var y = x.factors().next().value;
            if (getBase(y) instanceof Expression.MatrixSymbol) {//TODO: FIX
              g = g == null ? y : y.gcd(g);
            } else {
              g = Expression.ONE;
            }
          }
          if (g != null && !g.equals(Expression.ONE)) {
            e1 = e1.multiply(g.inverse());//!?
          }
          */
          //?
          if (e1 != null) {
            return getExpressionWithX(e1);
          }
        }
        //!
        if (!(factorBase instanceof Integer) && !(factorBase instanceof Expression.Symbol)) {
          if (!(factorBase instanceof Expression.Matrix)) {//?
          if (!(factorBase instanceof NthRoot)) {//?TODO: remove - ?
          if (factorBase instanceof Expression.Determinant && factorBase.a.toString() === "X") {//TODO: wrong
            return {withX: null, withoutX: null};
          }
          if (Expression.has(factorBase, Expression.MatrixSymbol)) {//?
            throw new RangeError("NotSupportedError");
          }
          }
          }
        }
        if (factorBase instanceof Expression.Symbol) {
          var s = factorBase.toString();
          if (s === "X") {
            if (hasX) {
              //throw new RangeError("NotSupportedError");
              return {withX: null, withoutX: null};
            }
            hasX = true;
          }
        }
      }
      if (hasX) {
        if (withX != undefined) {
          withX = groupX(withX, summand);
          if (withX == null) {
            //throw new RangeError("NotSupportedError");
            return {withX: null, withoutX: null};
          }
          //throw new RangeError("NotSupportedError");
        } else {
          withX = summand;
        }
      }
      if (!hasX) {
        withoutX = withoutX == undefined ? summand.negate() : withoutX.subtract(summand);
      }
    }
    return {withX: withX, withoutX: withoutX};
  };

  // Some number, including e and pi
  var isConstant = function (e) {
    if (e instanceof Expression.BinaryOperation) {
      return isConstant(e.b) && isConstant(e.a);
    } else if (e instanceof Expression.Integer) {
      return true;
    } else if (e instanceof Expression.PolynomialRootSymbol) { // note: e instanceof Expression.Symbol for now (!) so this check should go first
      return true;
    } else if (e instanceof Expression.ExpressionWithPolynomialRoot) {
      return isConstant(e.e);
    } else if (e instanceof Expression.ExpressionPolynomialRoot) { // note: e instanceof Expression.Symbol for now (!) so this check should go first
      return true;
    } else if (e instanceof Expression.Symbol) {
      return e === Expression.E || e === Expression.PI;
    } else if (e instanceof Expression.Complex) {
      return true;
    } else if (e instanceof Expression.NthRoot) {
      return isConstant(e.a);
    } else if (e instanceof Expression.Sin || e instanceof Expression.Cos || e instanceof Expression.Arctan) {
      return isConstant(e.a);
    } else if (e instanceof Expression.Radians) {
      return isConstant(e.value);
    //TODO:
    } else if (e instanceof Expression.Logarithm) {
      return isConstant(e.a);//TODO: test
    } else if (e === Expression.E || e === Expression.PI) {
      return true;
    }
    return false;
  };
  
  Expression.isConstant = isConstant;

  Expression.getMultivariatePolynomial = function (e) {
    if (e instanceof Expression.Division) {
      return undefined;
    }
    //var v = Expression.getVariable(e);
    // To avoid square roots / nth roots:
    var v = getVariableInternal(getLastMultiplicationOperand(getFirstAdditionOperand(e))).next().value.v;
    if (v instanceof NthRoot || v instanceof Integer || v instanceof Expression.Complex) {
      v = undefined;
    }
    if (v == undefined) {
      //throw new TypeError("undefined");
      return undefined;
    }
    //?
    if (v instanceof Expression.Addition) {
      v = getVariableInternal(getLastMultiplicationOperand(getFirstAdditionOperand(v))).next().value.v;
    }
    //?

    //TODO:
    var r = getReplacement(e, v);
    if (!r.equals(v)) {
      e = substitute(e, v, r, inverseReplacement(r, v));
      if (e instanceof Expression.Division && e.b instanceof Expression.Integer) {
        e = e.a;//!
      }
    }

    var p = Polynomial.toPolynomial(e, v);
    if (p.getDegree() === 0) {
      console.warn('Expression.getMultivariatePolynomial');
      return undefined;
    }
    //TODO: iteration by sparse coefficients
    for (var i = 0; i <= p.getDegree(); i += 1) {
      var c = p.getCoefficient(i);
      if (!isConstant(c)) {
        var pc = Expression.getMultivariatePolynomial(c);
        if (pc == undefined) {
          return undefined;
        }
      }
    }
    return {p: p.map(function (c) { return substitute(c, v, inverseReplacement(r, v), r); }), v: inverseReplacement(r, v)};
  };
  Expression.isSingleVariablePolynomial = function (e) {
    var tmp = Expression.getMultivariatePolynomial(e);
    if (tmp == null) {
      return false;
    }
    var p = tmp.p;
    //TODO: iteration by sparse coefficients
    for (var i = 0; i <= p.getDegree(); i += 1) {
      var c = p.getCoefficient(i);
      if (!isConstant(c)) {
        return false;
      }
    }
    return true;
  };

  // TODO: NotSupportedError
  Expression.prototype.transformEquality = function (b) {
    var e = this.subtract(b);
    var tmp = getExpressionWithX(e);
    var withX = tmp.withX;
    var withoutX = tmp.withoutX;
    if (withX == undefined) {
      if (e.getDenominator() instanceof Integer &&
          !(e.getNumerator() instanceof Expression.Matrix) &&
          !Expression.has(e, Expression.MatrixSymbol) &&
          !e.equals(Expression.ZERO)) {
        if (typeof e.upgrade === "function") {//TODO:
          e = e.upgrade();
        }
        //TODO: tests
        //TODO: fix, TODO: for 'y'
        var tmpv = new Expression.Symbol('x');
        var tmp = {p: Polynomial.toPolynomial(e.getNumerator(), tmpv), v: tmpv};
        if (tmp.p.getDegree() === 0 || Expression.has(e, Expression.Function)) {//TODO: FIX!!!
          tmp = Expression.getMultivariatePolynomial(e.getNumerator());
        }
        if (tmp != undefined && tmp.v instanceof Expression.Symbol) {
          var p = tmp.p;
          var v = tmp.v;
          var m = Matrix.Zero(1, p.getDegree() + 1).map(function (e, i, j) {
            return p.getCoefficient(p.getDegree() - j);
          });
          return new Expression.NoAnswerExpression(new Expression.Matrix(m), "polynomial-roots", {polynomial: p, variable: v});
        }
      }
      if (e instanceof Expression.Matrix) {
        if (this instanceof Expression.Matrix && (b instanceof Expression.Matrix || b instanceof Expression.IdentityMatrix)) {
          return Expression.SystemOfEquations.from([{left: this, right: b}]);
        }
        //TODO: other things - ?
      }
      if (true) {//!new 2019-11-27
        //TODO: fix
        return Expression.SystemOfEquations.from([{left: this, right: b}]);
      }
      throw new RangeError("NotSupportedError");
    }

    if (withoutX == undefined) {
      withoutX = Expression.ZERO;//?
    }
    //console.log(withX.toString() + "=" + withoutX.toString());

    var left = withX;
    var right = withoutX;

    var isToTheLeft = false;
    var x = withX;
    for (var y of x.factors()) {
      var factor = y;
      var factorBase = getBase(factor);
      //if (!(factorBase instanceof Integer) && !(factorBase instanceof Expression.Symbol)) {
      //  if (!(factorBase instanceof Expression.Matrix)) {//?
      //    throw new RangeError("NotSupportedError");
      //  }
      //}
      var isX = false;
      if (factorBase instanceof Expression.Symbol) {
        var s = factorBase.toString();
        if (s === "X") {
          isX = true;
          isToTheLeft = true;
        }
      }
      if (!isX) {
        if (factor instanceof Expression.Matrix && (!(factor.matrix.cols() === factor.matrix.rows()) || factor.determinant().equals(Expression.ZERO))) {
          //TODO: when determinant is not constant - ?
          return Expression.SystemOfEquations.from([{left: withX, right: withoutX}]);
        }
        var f = factor.inverse();
        //  console.log(isToTheLeft, f.toString());
        if (isToTheLeft) {
          right = f.multiply(right);
          //left = f.multiply(left);
        } else {
          right = right.multiply(f);
          //left = left.multiply(f);
        }
      } else {
        left = factor;
      }
    }

    //console.log(left.toString() + "=" + right.toString());
    if (left instanceof Expression.Exponentiation && getExponent(left).equals(Expression.ONE.negate())) {//TODO: FIX!!!
      if (right instanceof Expression.Matrix && !right.determinant().equals(Expression.ZERO)) {//TODO: condition - ?
        left = left.inverse();
        right = right.inverse();
        //TODO: add a step (?)
        //console.log(left.toString() + "=" + right.toString());
      }
    }
    return new Expression.Equality(left, right);
  };

  Expression.prototype.transformInequality = function (b, sign) {//TODO: ?
    var a = this;
    /*var c = Condition.TRUE;
    if (sign === '>') {
      c = c.andGreaterZero(a.subtract(b));
    } else if (sign === '<') {
      c = c.andGreaterZero(a.subtract(b).negate());
    //} else if (sign === '>=') {
    //  c = c.andGreaterZero(a.subtract(b).negate());
    //} else if (sign === '<=') {
    //  c = c.andGreaterZero(a.subtract(b));
    } else if (sign === '!=') {
      c = c.andNotZero(a.subtract(b));
    } else {
      throw new TypeError();
    }
    */
    //return new ExpressionWithCondition(Expression.ZERO, c);//TODO: ?
    return new Expression.Inequality(a, b, sign);
  };

  Expression.simplifications = [];
  Expression.prototype.simplifyExpression = function () {
    var e = this;
    for (var i = 0; i < Expression.simplifications.length; i += 1) {
      e = Expression.simplifications[i](e);
    }
    return e;
  };

  Expression.prototype.isExact = function () {
    //TODO: it is used in diagonalization (!!!), which is not good for performance (?)
    return !Expression.has(this, Expression.PolynomialRootSymbol) && !Expression.has(this, Expression.ExpressionPolynomialRoot);
  };

  //Expression.Complex = function () {
  //};

  Expression.PI = new Expression.Symbol("\u03C0"); // PI
  Expression.E = new Expression.Symbol("\u2147"); // EulerNumber
  Expression.I = new Expression.Symbol("\u2148"); // ImaginaryUnit

  Expression.CIRCLE = new Expression.Symbol("○");
  Expression.INFINITY = new Expression.Symbol("∞");

  Expression.prototype.addPosition = function () {
    return this;
  };

  //! 2018-09-30
  Expression.SystemOfEquations = function (equations) {
    throw new TypeError();
    this.equations = equations;
  };
  Expression.SystemOfEquations.from = function (equations) {
    return new Expression.NoAnswerExpression({matrix: null}, "system-of-equations", {equations: equations});
  };

  Expression.ExponentiationOfMinusOne = function (x, y) {
    Expression.Exponentiation.call(this, x, y);
  };
  Expression.ExponentiationOfMinusOne.prototype = Object.create(Expression.Exponentiation.prototype);
  Expression.ExponentiationOfMinusOne.prototype.divideExpression = function (x) {
    return x.multiply(this);
  };

  Expression.ExponentiationOfImaginaryUnit = function (x, y) {
    Expression.Exponentiation.call(this, x, y);
  };
  Expression.ExponentiationOfImaginaryUnit.prototype = Object.create(Expression.Exponentiation.prototype);
  Expression.ExponentiationOfImaginaryUnit.prototype.divideExpression = function (x) {
    var c = getConjugate(getBase(this)).pow(getExponent(this));
    return x.multiply(c).divide(this.multiply(c));
  };

  Expression.ExponentiationOfQuadraticInteger = function (x, y) {
    Expression.Exponentiation.call(this, x, y);
  };
  Expression.ExponentiationOfQuadraticInteger.prototype = Object.create(Expression.ExponentiationOfImaginaryUnit.prototype);
  Expression.ExponentiationOfQuadraticInteger.prototype.divideExpression = function (x) {
    return Expression.Exponentiation.prototype.divideExpression.call(this, x);
  };

  //!
  Expression.Division.prototype.negate = function () {
    return new Expression.Division(this.a.negate(), this.b);
  };

  Expression.Polynomial = function (polynomial) {
    this.polynomial = polynomial;
  };
  Expression.Polynomial.prototype = Object.create(Expression.prototype);
  Expression.Polynomial.prototype.gcd = function (other) {
    if (other instanceof Expression.Polynomial) {
      return new Expression.Polynomial(Polynomial.polynomialGCD(this.polynomial, other.polynomial));
    }
    if (other.equals(Expression.ZERO)) {
      return this;
    }
    throw new TypeError();
  };
  Expression.Polynomial.prototype.equals = function (y) {
    return y.equalsPolynomial(this);
  };
  Expression.Polynomial.prototype.equalsPolynomial = function (x) {
    //TODO: test case
    return x.polynomial.equals(this.polynomial);
  };
  Expression.prototype.equalsPolynomial = function (x) {
    return (x.polynomial.equals(Polynomial.ZERO) && this.equals(Expression.ZERO)) || (x.polynomial.getDegree() === 0 && this.equals(x.polynomial.getCoefficient(0)));
  };
  Expression.Polynomial.prototype.multiply = function (p) {
    if (p === Expression.ONE) {
      return this;
    }
    return p.multiplyPolynomial(this);
  };
  Expression.Polynomial.prototype.multiplyPolynomial = function (x) {
    return new Expression.Polynomial(x.polynomial.multiply(this.polynomial));
  };
  Expression.Division.prototype.multiplyPolynomial = function (p) {
    return this.multiplyExpression(p);
  };
  Expression.Integer.prototype.multiplyPolynomial = function (p) {
    return new Expression.Polynomial(p.polynomial.scale(this));
  };
  Expression.Polynomial.prototype.multiplyInteger = function (x) {
    return new Expression.Polynomial(this.polynomial.scale(x));
  };
  Expression.Polynomial.prototype.divide = function (l) {
    if (l.equals(Expression.ONE)) {
      return this;
    }
    if (l.equals(Expression.ONE.negate())) {
      return this.negate();
    }
    if (l instanceof Expression.Integer) {//TODO: ?
      return new Expression.Polynomial(this.polynomial.scale(l.inverse()));
    }
    return l.dividePolynomial(this);
  };
  Expression.Division.prototype.dividePolynomial = function (p) {
    return this.divideExpression(p);
  };
  Expression.Polynomial.prototype.dividePolynomial = function (x) {
    var y = this;
    var a = x.polynomial;
    var b = y.polynomial;
    if (a.getDegree() < 0 && b.getDegree() >= 0) {
      return new Expression.Polynomial(a);
    }
    //TODO: ?
    var tmp = a.divideAndRemainder(b);
    if (tmp.remainder.equals(Polynomial.ZERO)) {
      return new Expression.Polynomial(tmp.quotient);
    }
    var ca = a.getContent();
    if (!ca.getDenominator().equals(Expression.ONE)) {
      return y.multiply(ca.getDenominator()).dividePolynomial(x.multiply(ca.getDenominator()));
    }
    var cb = b.getContent();
    if (!cb.getDenominator().equals(Expression.ONE)) {
      return y.multiply(cb.getDenominator()).dividePolynomial(x.multiply(cb.getDenominator()));
    }
    var gcd = Polynomial.polynomialGCD(a, b);
    //TODO:
    if (y.polynomial.equals(gcd)) {
      return new Expression.Polynomial(x.polynomial.divideAndRemainder(gcd).quotient);
    }
    return new Expression.Division(new Expression.Polynomial(x.polynomial.divideAndRemainder(gcd).quotient), new Expression.Polynomial(y.polynomial.divideAndRemainder(gcd).quotient));
  };
  Expression.Polynomial.prototype.negate = function () {
    return new Expression.Polynomial(this.polynomial.negate());
  };
  Expression.Polynomial.prototype.add = function (y) {
    return y.addPolynomial(this);
  };
  Expression.Polynomial.prototype.addPolynomial = function (x) {
    return new Expression.Polynomial(x.polynomial.add(this.polynomial));
  };
  Expression.prototype.addPolynomial = function (x) {
    if (this.equals(Expression.ZERO)) {
      return x;
    }
    throw new RangeError();
  };
  Expression.Polynomial.prototype.getPrecedence = function () {
    var d = this.polynomial.getDegree();
    var count = 0;
    for (var i = 0; i <= d; i += 1) {
      if (!this.polynomial.getCoefficient(i).equals(Expression.ZERO)) {
        count += 1;
      }
    }
    return (count < 2 ? (this.polynomial.getLeadingCoefficient().equals(Expression.ONE) ? new Expression.Symbol("x") : new Expression.Multiplication(Expression.ONE, Expression.ONE)) : new Expression.Addition(Expression.ONE, Expression.ONE)).getPrecedence();
  };
  Expression.Polynomial.prototype.modulo = function (p) {
    if (p instanceof Expression.Polynomial) {
      return new Expression.Polynomial(this.polynomial.divideAndRemainder(p.polynomial).remainder);
    }
    throw new TypeError();
  };
  Expression.Polynomial.prototype.modInverse = function (p) {
    if (p instanceof Expression.Polynomial) {
      return new Expression.Polynomial(this.polynomial.primitivePart().modularInverse(p.polynomial).primitivePart().scale(this.polynomial.getContent().inverse()));
    }
    throw new TypeError();
  };
  Expression.Polynomial.prototype.isDivisibleBy = function (other) {
    if (other instanceof Expression.Polynomial) {
      return this.polynomial.isDivisibleBy(other.polynomial);
    }
    throw new TypeError();
  };

  Expression.unique = function (array) {
    var result = [];
    for (var i = 0; i < array.length; i += 1) {
      var value = array[i];
      var found = false;
      for (var j = 0; j < result.length; j += 1) {
        if (result[j] === value) {
          found = true;
        }
      }
      if (!found) {
        result.push(value);
      }
    }
    return result;
  };

Expression.Multiplication.prototype.compare4Multiplication = function (y) {
  var x = this;
  if (y instanceof Addition) {//TODO: fix
    return 0 - y.compare4Multiplication(x);
  }
  var i = x.factors();
  var j = y.factors();
  var a = i.next().value;
  var b = j.next().value;
  while (a != null && b != null) {
    var c = a.compare4Multiplication(b);
    if (c !== 0) {
      return c;
    }
    a = i.next().value;
    b = j.next().value;
  }
  return a != null ? +1 : (b != null ? -1 : 0);
};

Expression.Multiplication.compare4Addition = function (x, y) {
  var i = x.factors();
  var j = y.factors();
  var a = i.next().value;
  var b = j.next().value;
  while (a != null && b != null) {
    var c = a.compare4Addition(b);
    if (c !== 0) {
      return c;
    }
    a = i.next().value;
    b = j.next().value;
  }
  return a != null ? +1 : (b != null ? -1 : 0);
};


// cos(2 * x) * cos(x)
Expression.Multiplication.prototype.compare4MultiplicationSymbol = function (x) {
  return 0 - this.compare4Multiplication(x);
};

Expression.Function.prototype.compare4Addition = function (y) {
  if (y instanceof Expression.Function) {
    return this.name < y.name ? -1 : (y.name < this.name ? +1 : this.a.compare4Addition(y.a));
  }
  if (y instanceof Multiplication) {
    var x = this;
    return Multiplication.compare4Addition(x, y);
  }
  if (y instanceof Addition) {
    var x = this;
    return Addition.compare4Addition(x, y);
  }
  return +1;
};

Expression.NthRoot.prototype.compare4Addition = function (y) {
  return y.compare4AdditionNthRoot(this);
};
Expression.prototype.compare4AdditionNthRoot = function (x) {
  return Expression.Function.prototype.compare4Addition.call(x, this);
};
Expression.NthRoot.prototype.compare4AdditionNthRoot = function (x) {
  return (this.n - x.n) || x.a.compare4Addition(this.a);
};

Expression.prototype.compare4AdditionSymbol = function (x) {
  var y = this;
  if (y instanceof Expression.Function) {
    return -1;
  }
  return Expression.prototype.compare4Addition.call(x, y);
};

Expression.Symbol.prototype.compare4Addition = function (y) {
  return y.compare4AdditionSymbol(this);
};
Expression.Symbol.prototype.compare4AdditionSymbol = function (x) { // for performance
  var y = this;
  return x.symbol < y.symbol ? -1 : (y.symbol < x.symbol ? +1 : 0);
};

Expression.Function.prototype.compare4Multiplication = function (y) {
  if (y instanceof Expression.NthRoot) {
    return +1;
  }
  if (y instanceof Expression.Function) {
    return this.name < y.name ? -1 : (y.name < this.name ? +1 : getBase(this.a).compare4Multiplication(getBase(y.a)) || getExponent(this.a).compare4AdditionSymbol(getExponent(y.a)));
  }
  if (y instanceof Expression.MatrixSymbol) {
    return -1;
  }
  return +1;
};

Expression.Function.prototype.compare4MultiplicationInteger = function (x) {
  return 0 - this.compare4Multiplication(x);
};

Expression.Function.prototype.compare4MultiplicationSymbol = function (x) {
  return -1;//?
};

Expression.Function.prototype.compare4MultiplicationNthRoot = function (x) {
  return 0 - this.compare4Multiplication(x);
};

Expression.Function.prototype.pow = function (y) {
  if (this instanceof Expression.NthRoot) {
    return Expression.prototype.pow.call(this, y);
  }
  if (y instanceof Expression.Integer) {
    if (y.compareTo(Expression.ONE) > 0) {
      return new Expression.Exponentiation(this, y);
    }
    return Expression.prototype.pow.call(this, y);
  }
  if (isIntegerOrN(y) && y instanceof Expression.Symbol) {//TODO: !?
    return new Expression.Exponentiation(this, y);
  }
  throw new RangeError("NotSupportedError");
};

function ExpressionWithCondition(e, condition) {
  this.e = e;
  this.condition = condition;
}
ExpressionWithCondition.prototype = Object.create(Expression.prototype);
ExpressionWithCondition.prototype.toString = function () {
  return this.e.toString() + '; ' + this.condition.toString();
};
ExpressionWithCondition.prototype.toMathML = function (options) {
  return this.e.toMathML(options) + '<mtext>; </mtext>' + this.condition.toMathML(options);
};

ExpressionWithCondition.prototype.multiplyExpression =
ExpressionWithCondition.prototype.multiplyMatrix = function (x) {
  //TODO: apply condition - ?
  return new ExpressionWithCondition(x.multiply(this.e), this.condition);
};
ExpressionWithCondition.prototype.multiply = function (y) {
  return y.multiplyExpressionWithCondition(this);
};
ExpressionWithCondition.prototype.multiplyExpressionWithCondition = function (x) {
  throw new TypeError("TODO:");
};
Expression.prototype.multiplyExpressionWithCondition = function (x) {
  //TODO: apply condition - ?
  return new ExpressionWithCondition(x.e.multiply(this), x.condition);
};

ExpressionWithCondition.prototype.add = function (y) {
  return y.addExpressionWithCondition(this);
};
ExpressionWithCondition.prototype.addExpressionWithCondition = function (x) {
  throw new TypeError("TODO:");
};
Expression.prototype.addExpressionWithCondition = function (x) {
  //TODO: apply condition - ?
  return new ExpressionWithCondition(x.e.add(this), x.condition);
};

Expression.ExpressionWithCondition = ExpressionWithCondition;

  export default Expression;

  //TODO: ?
  Addition.prototype.compare4MultiplicationNthRoot = function (x) {
    return +1;
  };
  Multiplication.prototype.compare4MultiplicationNthRoot = function (x) {
    return -1;//TODO: ?
  };



// piecewise functions
// https://en.wikipedia.org/wiki/Piecewise
// https://en.wikibooks.org/wiki/LaTeX/Advanced_Mathematics#The_cases_environment

function Cases(cases) {
  this.cases = cases;
}

Cases.prototype = Object.create(Expression.prototype);

Cases.prototype._cross = function (x, f) {
  var y = this;
  var result = [];
  for (var i = 0; i < x.cases.length; i += 1) {
    for (var j = 0; j < y.cases.length; j += 1) {
      var condition = x.cases[i].condition.and(y.cases[j].condition);
      //TODO: check
      if (!condition.isFalse()) {
        var e = f(x.cases[i].e, y.cases[j].e);
        result.push(new ExpressionWithCondition(e, condition));
      }
    }
  }
  return new Expression.Cases(result);
};

Cases.prototype.multiply = function (y) {
  return y.multiplyCases(this);
};
Cases.prototype.multiplyCases = function (x) {
  return this._cross(x, function (a, b) {
    return a.multiply(b);
  });
};
Cases.prototype.toString = function () {//TODO: ?
  var s = '';
  for (var i = 0; i < this.cases.length; i += 1) {
    s += '(' + this.cases[i].toString() + ')' + ',';
  }
  return '{{' + s.slice(0, -1) + '}}';
};
Expression.prototype.multiplyCases = function (x) {
  var y = this;
  return new Cases(x.cases.map(function (c) {
    return c.multiply(y);
  }));
};

Cases.prototype.multiplyExpression =
Cases.prototype.multiplyMatrix = function (x) {
  return new Cases(this.cases.map(function (c) {
    return x.multiply(c);
  }));
};

Cases.prototype.add = function (y) {
  return y.addCases(this);
};
Cases.prototype.addCases = function (x) {
  return this._cross(x, function (a, b) {
    return a.add(b);
  });
};
Expression.prototype.addCases = function (x) {
  var y = this;
  return new Cases(x.cases.map(function (c) {
    return c.add(y);
  }));
};

Cases.prototype.equals = function (b) {
  var a = this;
  if (a === b) {
    return true;
  }
  if (!(b instanceof Cases)) {
    //TODO: check that zero becomes zero
    return false;
  }
  //TODO: fix
  throw new TypeError();
  //return false;
};

Cases.prototype.toMathML = function (printOptions) {
  // https://www.w3.org/TR/2006/NOTE-arabic-math-20060131/#Moroccan
  var s = '';
  s += '<mrow>';
  s += '<mo>{</mo>';
  s += '<mtable rowspacing="0ex" columnalign="left">';
  for (var i = 0; i < this.cases.length; i += 1) {
    var x = this.cases[i];
    s += '<mtr>';
    s += '<mtd>';
    s += x.e.toMathML(printOptions);
    s += '</mtd>';
    s += '<mtd>';
    // <mtext> if </mtext> - ?
    s += x.condition.toMathML(printOptions);
    s += '</mtd>';
    s += '</mtr>';
  }
  s += '</mtable>';
  s += '</mrow>';
  return s;
};

Expression.Cases = Cases;


Expression.Factorial = function (n) {
  this.n = n;
};
Expression.Factorial.prototype = Object.create(Expression.prototype);

Expression.prototype.factorial = function () {
  //a = a.unwrap();
  var n = this;
  if (!(n instanceof Expression.Integer)) {
    throw new TypeError("NotSupportedError");
  }
  if (n.compareTo(Expression.ZERO) < 0) {
    throw new TypeError("NotSupportedError");
  }
  var f = Expression.ONE;
  for (var i = n; i.compareTo(Expression.ONE) >= 0; i = i.subtract(Expression.ONE)) {
    f = f.multiply(i);
  }
  return f;
};

Expression.prototype._abs = function () {
  return this.isNegative() ? this.negate() : this;
};


  //?
  Expression.Comma = function (a, b) {
    BinaryOperation.call(this, a, b);
  };
  Expression.Comma.prototype = Object.create(BinaryOperation.prototype);
  Expression.Comma.prototype.getS = function () {
    return ",\u200B ";
  };
  Expression.prototype.transformComma = function (b) {
    var a = this;
    var equations = function (e) {
      if (e instanceof Expression.Equality) {
        return [{left: e.a, right: e.b}];
      }
      if (e instanceof Expression.NoAnswerExpression && e.name === 'system-of-equations') {
        return e.second.equations;
      }
      if (e instanceof Expression.Inequality) {
        return [{left: e.a, right: e.b, sign: e.sign}];
      }
      if (e instanceof Expression.NoAnswerExpression && e.name === 'polynomial-roots') {
        var ee = e.second.polynomial.calcAt(e.second.variable);
        //TODO: use original input expression
        return [{left: ee, right: Expression.ZERO}];
      }
      return null;
    };
    var ae = equations(a);
    var be = equations(b);
    //TODO: do not use NonSimplifiedExpression - ? and systemo-of-equations (?) or change (!)
    if (ae != null && be != null) {
      return Expression.SystemOfEquations.from(ae.concat(be));
    }
    if (ae == null && be == null) {
      return new Expression.List((a instanceof Expression.List ? a.list : [a]).concat(b instanceof Expression.List ? b.list : [b]));
    }
    throw new TypeError("NotSupportedError");
  };

  Expression.List = function (list) {
    this.list = list;
  };
  Expression.List.prototype = Object.create(Expression.prototype);
  Expression.List.prototype.min = function () {
    return this.list.reduce((result, value) => result.compareTo(value) > 0 ? value : result);
  };
  Expression.List.prototype.max = function () {
    return this.list.reduce((result, value) => result.compareTo(value) < 0 ? value : result);
  };
  Expression.List.prototype.gcd = function () {
    return this.list.reduce((result, value) => result.gcd(value));
  };

Expression.Logarithm = function (argument) {
  Expression.Function.call(this, "log", argument);
};
Expression.Logarithm.prototype = Object.create(Expression.Function.prototype);
Expression.prototype.logarithm = function () {
  var arg = this;
  if (arg instanceof Expression.Integer) {
    if (arg.compareTo(Expression.ZERO) <= 0) {
      throw new TypeError("ArithmeticException");//TODO: better message
    }
    if (arg.compareTo(Expression.ONE) === 0) {
      return Expression.ZERO;
    }
    var p = integerPrimeFactor(arg);
    if (p.equals(arg)) {
      return new Expression.Logarithm(arg);
    }
    var ctz = primeFactor._countTrailingZeros(arg.toBigInt(), p.toBigInt());
    return p.logarithm().multiply(Integer.fromNumber(ctz)).add(arg.truncatingDivide(p._pow(ctz)).logarithm());
  }
  if (arg instanceof Expression.Division) {
    var n = arg.getNumerator();
    var d = arg.getDenominator();
    if (d instanceof Integer || isConstant(n)) {
      return n.logarithm().subtract(d.logarithm());
    }
  }
  if (arg instanceof Expression.Multiplication) {
    var c = arg.a;
    if (isConstant(c)) {
      return c.logarithm().add(arg.divide(c).logarithm());
    }
    var c = getConstant(arg);
    if (c instanceof Integer && !c.equals(Expression.ONE)) {
      return c.logarithm().add(arg.divide(c).logarithm());
    }
    if (arg.b instanceof Expression.MatrixSymbol) {//?
      return arg.a.logarithm().add(arg.b.logarithm());
    }
  }
  if (arg instanceof Expression.ExpressionWithPolynomialRoot) {
    arg = arg.upgrade();//?
  }
  if (arg instanceof Expression.ExpressionPolynomialRoot) {
    var g = arg.root.upgrade().getAlpha().polynomial.getGCDOfTermDegrees();
    if (g > 1) {
      return arg._pow(g).logarithm().divide(Expression.Integer.fromNumber(g));
    }
  }
  //TODO: other kinds of polynomial roots (?)
  if (arg instanceof Expression.Symbol) {
    if (arg === Expression.E) {//?
      return Expression.ONE;
    }
    return new Expression.Logarithm(arg);
  }
  if (arg instanceof Expression.NthRoot) {
    var a = arg.a;
    var n = arg.n;
    if (a instanceof Expression.Integer && a.compareTo(Expression.ONE) > 0) {
      return a.logarithm().divide(Expression.Integer.fromNumber(n));
    }
    if (isPositive(a)) {
      return a.logarithm().divide(Expression.Integer.fromNumber(n));
    }
  }
  if (arg instanceof Expression.Exponentiation) {
    var b = getBase(arg);
    var e = getExponent(arg);
    if (b === Expression.E) {//?
      return e;
    }
    if (b instanceof Expression.MatrixSymbol && e instanceof Integer) {//?
      return b.logarithm().multiply(e);
    }
    if (b instanceof Expression.Integer) {
      return b.logarithm().multiply(e);
    }
  }
  if (arg instanceof Expression.Matrix) {
    var matrix = arg.matrix;
    if (matrix.isDiagonal()) {
      return new Expression.Matrix(matrix.map(function (e, i, j) {
        return i === j ? e.logarithm() : Expression.ZERO;
      }));
    }
    var eigenvalues = Expression.getEigenvalues(matrix);
    if (eigenvalues.length === matrix.cols()) {
      var eigenvectors = Expression.getEigenvectors(matrix, eigenvalues);
      if (eigenvectors.filter(v => v != null).length === matrix.cols()) {
        if (Expression.callback != undefined) {
          Expression.callback(new Expression.Event("logarithm-using-diagonalization", new Expression.Matrix(matrix)));//TODO:
        }
        var tmp = Expression.diagonalize(matrix, eigenvalues, eigenvectors);
        // https://en.wikipedia.org/wiki/Logarithm_of_a_matrix#Calculating_the_logarithm_of_a_diagonalizable_matrix
        return new Expression.Matrix(tmp.T).multiply(new Expression.Matrix(tmp.L).logarithm()).multiply(new Expression.Matrix(tmp.T_INVERSED));
      } else {
        var tmp = Expression.getFormaDeJordan(matrix, eigenvalues);
        // https://en.wikipedia.org/wiki/Logarithm_of_a_matrix#The_logarithm_of_a_non-diagonalizable_matrix
        var J = tmp.J;
        var logarithmOfJordanBlockMatrix = function (B) {
          var K = B.map(function (e, i, j) {
            return i !== j ? e.divide(B.e(i, i)) : Expression.ZERO;
          });
          var S = B.map(function (e, i, j) {
            return i === j ? e.logarithm() : Expression.ZERO;
          });
          var n = B.cols();
          for (var i = 1; i < n; i += 1) {
            var x = K.pow(i).scale(Expression.ONE.divide(Expression.Integer.fromNumber(i)));
            S = i % 2 === 1 ? S.add(x) : S.subtract(x);
          }
          return S;
        };
        var LJ = logarithmOfJordanBlockMatrix(J);
        //if (!J.eql(matrix)) {
        //TODO:
        if (Expression.callback != undefined) {
          Expression.callback(new Expression.Event("logarithm-using-Jordan-canonical-form", new Expression.Matrix(matrix)));
        }
        //}
        return new Expression.Matrix(tmp.P).multiply(new Expression.Matrix(LJ)).multiply(new Expression.Matrix(tmp.P_INVERSED));
      }
    }
  }
  if (arg instanceof Expression.Addition) {
    var c = getConstant(arg);
    if (!c.equals(Expression.ONE)) {
      return c.logarithm().add(arg.divide(c).logarithm());
    }
    if (arg.a instanceof Expression.Symbol && arg.b instanceof Expression.Integer) {
      return new Expression.Logarithm(arg);
    }
    var v = getVariableInternal(getLastMultiplicationOperand(getFirstAdditionOperand(arg))).next().value.v; // avoid square roots
    if (v instanceof Expression.Symbol) {
      var p = Polynomial.toPolynomial(arg, v);
      var c = p.getContent();
      if (c.isNegative()) {
        c = c.negate();
      }
      if (isPositive(c) && !c.equals(Expression.ONE)) {
        return arg.divide(c).logarithm().add(c.logarithm());
      }
      //TODO: check
      var sf = p.getSquareFreePolynomial();
      var n = Math.floor(p.getDegree() / sf.getDegree());
      if (n > 1 && sf.calcAt(v)._pow(n).equals(arg)) {
        return Expression.Integer.fromNumber(n).multiply(sf.calcAt(v).logarithm());
      }
    }
    if (isGoodPolynomial(arg)) {//?
      return new Expression.Logarithm(arg);
    }
  }
  var qi = QuadraticInteger.toQuadraticInteger(arg);//?
  if (qi != null && (Number(qi.a.toString()) > 0 || Number(qi.b.toString()) > 0) && qi.D > 0 && (qi.isValid() || qi.D === 5 || qi.D === 37)) {
    var f = qi.primeFactor();
    if (f.toExpression().equals(Expression.TWO)) {//TODO: !?
      qi = qi.truncatingDivide(f);
      f = qi.primeFactor();
    }
    if (!f.equals(qi)) {
      return f.toExpression().logarithm().add(arg.divide(f.toExpression()).logarithm());
    }
    if (Number(qi.a.toString()) > 0 && Number(qi.b.toString()) > 0) {
      //return new Expression.ExponentiationOfQuadraticInteger(x, y);
      return new Expression.Logarithm(arg);
    }
    if (Number(qi.a.toString()) < 0 || Number(qi.b.toString()) < 0) {
      var xc = qi.conjugate().toExpression();
      if (xc.isNegative()) {
        xc = xc.negate();
      }
      return arg.multiply(xc).logarithm().subtract(xc.logarithm());
    }
  }
  if (arg instanceof Addition && arg.b instanceof NthRoot && arg.a instanceof NthRoot) {//TODO: ? multiple operands - ?
    var g = nthRootCommonFactor(arg.a, arg.b);
    if (!g.equals(Expression.ONE) && isPositive(g)) {
      return g.logarithm().add(arg.divide(g).logarithm());
    }
  }
  if (Expression.isConstant(arg)) {
    var sd = simpleDivisor(arg);
    if (!sd.equals(arg)) {
      return sd.logarithm().add(arg.divide(sd).logarithm());
    }
  }
  throw new TypeError("NotSupportedError");
};


//!new
NthRoot.prototype.compare4MultiplicationExponentiation = Exponentiation.prototype.compare4MultiplicationExponentiation;
Expression.Symbol.prototype.compare4MultiplicationExponentiation = Exponentiation.prototype.compare4MultiplicationExponentiation;


//!new
Expression.prototype.complexConjugate = function () {
  throw new TypeError("NotSupportedError");
};
Expression.Integer.prototype.complexConjugate = function () {
  return this;
};
// https://en.wikipedia.org/wiki/Complex_conjugate#Properties
Expression.Division.prototype.complexConjugate = function () {
  return this.getNumerator().complexConjugate().divide(this.getDenominator().complexConjugate());
};
Expression.Multiplication.prototype.complexConjugate = function () {
  return this.a.complexConjugate().multiply(this.b.complexConjugate());
};
Expression.Addition.prototype.complexConjugate = function () {
  return this.a.complexConjugate().add(this.b.complexConjugate());
};
Expression.Function.prototype.complexConjugate = function () {
  if (this.a instanceof Integer || Expression.isReal(this)) {
    return this;
  }
  throw new TypeError("NotSupportedError");//TODO: ?
};
Expression.Matrix.prototype.complexConjugate = function () {
  var a = this;
  return new Expression.Matrix(a.matrix.map(x => x.complexConjugate()));
};
Expression.Symbol.prototype.complexConjugate = function () {
  if (this === Expression.E || this === Expression.PI || Expression.isReal(this)) {
    return this;
  }
  return new Expression.ComplexConjugate(this);
};
//TODO: complexConjugate(log(z)) = log(complexConjugate(z))
Expression.Exponentiation.prototype.complexConjugate = function () {
  // complexConjugate(exp(z)) = exp(complexConjugate(z))
  if (getBase(this) === Expression.E) {
    return getBase(this).pow(getExponent(this).complexConjugate());
  }
  // complexConjugate(z**n) = complexConjugate(z)**n
  if (isIntegerOrN(getExponent(this))) {//?
    return getBase(this).complexConjugate().pow(getExponent(this));
  }
  if (isMatrixSymbolTranspose(this)) {
    //return getBase(this).complexConjugate().pow(getExponent(this));
    return new Expression.Exponentiation(getBase(this).complexConjugate(), getExponent(this));
  }
  if (Expression.isReal(this)) {
    return this;
  }
  throw new TypeError("NotSupportedError");//TODO: ?
};
Expression.Logarithm.prototype.complexConjugate = function () {
  return this.a.complexConjugate().logarithm();
};


  Expression.ComplexConjugate = function (a) {
    Expression.Function.call(this, "conjugate", a);
  };
  Expression.ComplexConjugate.prototype = Object.create(Expression.Function.prototype);

  Expression.ComplexConjugate.prototype.complexConjugate = function () {
    return this.a;
  };

  Expression.AugmentedMatrix = function (A, B) {
    Expression.Function.call(this, "augment", null);
    this.a = A;
    this.b = B;
  };
  Expression.AugmentedMatrix.prototype = Object.create(Expression.Function.prototype);
  Expression.AugmentedMatrix.prototype.toString = function (options) {
    //TODO:
    return '(' + this.a.toString(options) + '|' + this.b.toString(options) + ')';
  };
  Expression.AugmentedMatrix.prototype.toMathML = function (options) {
    //TODO:
    return '<mrow>' + '<mo>(</mo>' + this.a.toMathML(options) + '<mo>|</mo>' + this.b.toMathML(options) + '<mo>)</mo>' + '</mrow>';
  };

  Expression.Abs = function (a) {
    Expression.Function.call(this, "abs", a);
  };
  Expression.Abs.prototype = Object.create(Expression.Function.prototype);
  Expression.Abs.prototype.toMathML = function (options) {
    //TODO:
    return '<mrow>' + '<mo stretchy="false">|</mo>' + this.a.toMathML(options) + '<mo stretchy="false">|</mo>' + '</mrow>';
  };
  Expression.Abs.prototype.complexConjugate = function () {
    return this;
  };


  Expression.Matrix.prototype.pseudoinverse = function () {
    const tmp = Expression.SVD(this.matrix);
    // https://en.wikipedia.org/wiki/Moore–Penrose_inverse#Singular_value_decomposition_(SVD)
    return new Expression.Matrix(tmp.Vstar.conjugateTranspose().multiply(tmp.Sigma.map(e => e.equals(Expression.ZERO) ? Expression.ZERO : e.inverse())).multiply(tmp.U.conjugateTranspose()));
  };
  Expression.Pseudoinverse = function (matrix) {
    Expression.Function.call(this, "pseudoinverse", matrix);
  };
  Expression.Pseudoinverse.prototype = Object.create(Expression.Function.prototype);
