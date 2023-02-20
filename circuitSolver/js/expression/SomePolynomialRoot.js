import Expression from './Expression.js';
import Polynomial from './Polynomial.js';//TODO: !?


function SomePolynomialRoot(e, polynomial) {
  this.e = e; // internal symbolic expression with a "root" as a symbol
  this.polynomial = polynomial;
}

SomePolynomialRoot.prototype = Object.create(Expression.Symbol.prototype);

function alpha() {
  return new Expression.Symbol('alpha');
}

SomePolynomialRoot.create = function (polynomial) {
  return new SomePolynomialRoot(alpha(), polynomial);
};

SomePolynomialRoot.prototype.isExact = function () {
  return false;
};

function simplifyExpressionWithPolynomialRoot(e, polynomial) {
  
  var n = Polynomial.toPolynomial(e.getNumerator(), alpha()).divideAndRemainder(polynomial).remainder;
  var d = Polynomial.toPolynomial(e.getDenominator(), alpha()).divideAndRemainder(polynomial).remainder;
  if (d.getDegree() > 0) {
    var scale = d.modularInverse(polynomial).primitivePart();
    d = d.multiply(scale).divideAndRemainder(polynomial).remainder;
    n = n.multiply(scale).divideAndRemainder(polynomial).remainder;
  }
  var e1 = n.calcAt(alpha()).divide(d.calcAt(alpha()));
  if (e1 instanceof Expression.Integer) {
    return e1;
  }
  return new SomePolynomialRoot(e1, polynomial);
}

SomePolynomialRoot.prototype.negate = function () {
  return simplifyExpressionWithPolynomialRoot(this.e.negate(), this.polynomial);
};
SomePolynomialRoot.prototype.equals = function (other) {
  if (other === Expression.ZERO) {
    return false;
  }
  return this.subtract(other).equals(Expression.ZERO);
};
SomePolynomialRoot.prototype.simplifyExpression = function () {
  return this;
};

SomePolynomialRoot.prototype.toString = function (options) {
  throw new TypeError();
};

SomePolynomialRoot.prototype.toMathML = function (options) {
  throw new TypeError();
};

SomePolynomialRoot.prototype.multiply = function (other) {
  if (other instanceof SomePolynomialRoot) {
    if (!this.polynomial.equals(other.polynomial)) {
      throw new TypeError();
    }
    return simplifyExpressionWithPolynomialRoot(this.e.multiply(other.e), this.polynomial);
  }
  return simplifyExpressionWithPolynomialRoot(this.e.multiply(other), this.polynomial);
};
SomePolynomialRoot.prototype.add = function (other) {
  if (other instanceof SomePolynomialRoot) {
    if (!this.polynomial.equals(other.polynomial)) {
      throw new TypeError();
    }
    return simplifyExpressionWithPolynomialRoot(this.e.add(other.e), this.polynomial);
  }
  return simplifyExpressionWithPolynomialRoot(this.e.add(other), this.polynomial);
};
SomePolynomialRoot.prototype.inverse = function () {
  return simplifyExpressionWithPolynomialRoot(this.e.inverse(), this.polynomial);
};

SomePolynomialRoot.prototype.divide = function (other) {
  return this.multiply(other.inverse());
};

SomePolynomialRoot.prototype.divideExpression = function (other) {
  return other.multiply(this.inverse());
};
SomePolynomialRoot.prototype.multiplyExpression = function (other) {
  return simplifyExpressionWithPolynomialRoot(other.multiply(this.e), this.polynomial);
};
SomePolynomialRoot.prototype.addExpression = function (other) {
  return simplifyExpressionWithPolynomialRoot(other.add(this.e), this.polynomial);
};

SomePolynomialRoot.prototype.getPrecedence = function () {
  throw new TypeError();
};
SomePolynomialRoot.prototype.isRightToLeftAssociative = function () {
  throw new TypeError();
};
SomePolynomialRoot.prototype.isUnaryPlusMinus = function () {
  throw new TypeError();
};
SomePolynomialRoot.prototype.isNegative = function () {
  throw new TypeError();
};


SomePolynomialRoot.prototype._nthRoot = function (n) {//?
  throw new TypeError();
};
SomePolynomialRoot.prototype.pow = function (count) {
  throw new TypeError();
};
SomePolynomialRoot.prototype._pow = function (count) {
  throw new TypeError();
};


SomePolynomialRoot.prototype.calcAt = function (x, xPows) {
  var c = function (e) {
    var p = Polynomial.toPolynomial(e, alpha());
    //return p.calcAt(root);
    var s = Expression.ZERO;
    var start = Date.now();
    while (xPows.length <= p.getDegree()) {
      xPows.push(xPows[xPows.length - 1].multiply(x));
    }
    var end = Date.now();
    if (end - start > 10) {
      console.log('xPows', end - start);
    }
    for (var i = 0; i <= p.getDegree(); i += 1) {
      s = s.add(p.getCoefficient(i).multiply(xPows[i]));
    }
    return s;
  };
  var e = this.e;
  var e1 = c(e.getNumerator()).divide(c(e.getDenominator()));
  return e1;
};

export default SomePolynomialRoot;
