/*jshint esversion:6*/
import Polynomial from './Polynomial.js';
import Expression from './Expression.js';

//! deprecated

globalThis.SturmSequence = SturmSequence;//TODO: ???

  // https://math.stackexchange.com/questions/309178/polynomial-root-finding
  function SturmSequence(f) {
    f = f.primitivePart();
    var d = f.derive();
    //d = d.primitivePart();
    d = d.scale(d.getContent().abs());// do not change the sign
      // https://en.wikipedia.org/wiki/Sturm%27s_theorem#Use_of_pseudo-remainder_sequences
    var s = [];
    s.push(f);
    s.push(d);
    // "subresultant" is slower
    //TODO: is primitive pseudo-remainder sequence always working?
    for (var tmp of Polynomial._pseudoRemainderSequence(f, d, "primitive", true)) {
      if (tmp.R.getDegree() >= 0) {
        s.push(tmp.R);
      }
    }
    var gcd = s[s.length - 1];
    if (gcd.getDegree() > 0) {
      console.error("it is faster to use square-free polynomials");
    }
    this.s = s;
  }

  SturmSequence.prototype.signChanges = function (x) {
    let result = 0;
    let sign = 0;
    for (let i = 0; i < this.s.length; i += 1) {
      const p = this.s[i];
      //const v = p.calcAt(x);
      const v = p._scaleRoots(x.getDenominator()).calcAt(x.getNumerator());
      const s = v.compareTo(Expression.ZERO);
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

  // return the number of distict roots on the half-open interval (a, b] (see Wikipedia's article)
  // the polynomial should be square free or should not have roots on interval ends
  SturmSequence.prototype.numberOfRoots = function (interval) {
    if (interval.a.equals(interval.b)) {
      throw new TypeError();
    }
    return this.signChanges(interval.a) - this.signChanges(interval.b);
  };


  Polynomial.prototype.getRootIntervals3 = function () {
    if (!this.isSquareFreePolynomial()) {
      throw new RangeError();
    }
    if (this.calcAt(Expression.ZERO).equals(Expression.ZERO)) {
      throw new RangeError();
    }
    const polynomial = this;
    var sturmSequence = new SturmSequence(this);
    var interval = {a: this._scaleRoots(Expression.ONE.negate()).getPositiveRealRootsBound().negate(), b: this.getPositiveRealRootsBound()};
    var getIntervals = function (interval, rootsAfterA, rootsAfterB, valueAtA, valueAtB) {
      //var n = sturmSequence.numberOfRoots(interval);
      var n = rootsAfterA - rootsAfterB;
      if (valueAtA.equals(Expression.ZERO)) {
        if (n > 0) {
          n = 1/0;
        }
      }
      if (valueAtB.equals(Expression.ZERO)) {
        if (n === 1) {
          return [{a: interval.b, b: interval.b}];
        }
        console.assert(n > 1);
      }
      if (n === 1) {
        return [interval];
      }
      if (n > 1) {
        var middle = interval.a.add(interval.b).divide(Expression.TWO);
        var rootsAfterM = sturmSequence.signChanges(middle);
        var valueAtM = polynomial.calcAt(middle);
        var a = getIntervals({a: interval.a, b: middle}, rootsAfterA, rootsAfterM, valueAtA, valueAtM);
        var b = getIntervals({a: middle, b: interval.b}, rootsAfterM, rootsAfterB, valueAtM, valueAtB);
        return a.concat(b);
      }
      return [];
    };
    var negative = getIntervals({a: interval.a, b: Expression.ZERO}, sturmSequence.signChanges(interval.a), sturmSequence.signChanges(Expression.ZERO), polynomial.calcAt(interval.a), polynomial.calcAt(Expression.ZERO));
    var positive = getIntervals({a: Expression.ZERO, b: interval.b}, sturmSequence.signChanges(Expression.ZERO), sturmSequence.signChanges(interval.b), polynomial.calcAt(Expression.ZERO), polynomial.calcAt(interval.b));
    return negative.concat(positive);
  };

  // get number of distinct roots on the closed interval [a, b]
  Polynomial.prototype.numberOfRoots3 = function (interval = null) {
    if (interval == null) {
      interval = {a: this._scaleRoots(Expression.ONE.negate()).getPositiveRealRootsBound().negate(), b: this.getPositiveRealRootsBound()};//TODO: use (-1/0; +1/0)
    }
    var p = this;
    var aIsARoot = false;
    while (p.calcAt(interval.a).equals(Expression.ZERO)) {
      p = p.divideAndRemainder(Polynomial.of(interval.a.getNumerator().negate(), interval.a.getDenominator())).quotient;
      aIsARoot = true;
    }
    var bIsARoot = false;
    while (p.calcAt(interval.b).equals(Expression.ZERO)) {
      p = p.divideAndRemainder(Polynomial.of(interval.b.getNumerator().negate(), interval.b.getDenominator())).quotient;
      bIsARoot = true;
    }
    var sturmSequence = new SturmSequence(p);
    return (aIsARoot ? 1 : 0) + (bIsARoot ? 1 : 0) + sturmSequence.numberOfRoots(interval);
  };

export default SturmSequence;
