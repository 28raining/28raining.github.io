  import Expression from './Expression.js';

  function GF2(a) {
    this.a = a;
  }
  GF2.prototype = Object.create(Expression.prototype);

  Expression.GF2 = GF2;
  Expression.GF2.prototype.toString = function (options) {
    return "GF2(" + this.a.toString(Expression.setTopLevel(true, options)) + ")";
  };

  function GF2Value(value) {
    //Expression.call(this);
    this.value = value;
  }
  Expression.GF2Value = GF2Value;

  GF2Value.prototype = Object.create(Expression.prototype);
  Expression.GF2Value.prototype.equals = function (b) {
    if (Expression.ZERO === b) {
      return this.value === 0;//!
    }
    return false;//?
  };
  Expression.GF2Value.prototype.negate = function () {
    return new GF2Value(this.value === 0 ? 0 : 2 - this.value);
  };

  GF2Value.prototype.add = function (x) {
    if (x === Expression.ZERO) {
      return new GF2Value(this.value);
    }
    if (!(x instanceof GF2Value)) {
      throw new RangeError();
    }
    var v = this.value - 2 + x.value;
    return new GF2Value(v >= 0 ? v : v + 2);
  };

  GF2Value.prototype.multiply = function (x) {
    if (x === Expression.ZERO) {
      return new GF2Value(0);
    }
    if (!(x instanceof GF2Value)) {
      throw new RangeError();
    }
    var v = this.value * x.value;
    return new GF2Value(v - 2 * Math.floor(v / 2));
  };

  GF2Value.prototype.divide = function (x) {
    //if (!(x instanceof GF2Value)) {
    //  throw new RangeError();
    //}
    return new GF2Value(this.value);
  };

  Expression.prototype.GF2 = function () {
    var x = this;
    if (!(x instanceof Expression.Matrix)) {
      throw new RangeError("NotSupportedError");//?
    }
    return new Expression.Matrix(x.matrix.map(function (e, i, j) {
      if (!(e.equals(Expression.ZERO) || e.equals(Expression.ONE))) {
        throw new TypeError();
      }
      return new Expression.GF2Value(e.equals(Expression.ZERO) ? 0 : 1);
    }));
  };

  GF2Value.prototype.toString = function (options) {
    return this.value.toString();
  };
