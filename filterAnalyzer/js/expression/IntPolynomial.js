

function modulo(a, b) {
  let x = a % b;
  if (x < 0) {
    x += b; // assuming b > 0
  }
  return x;
}

function check(number) {
  if (typeof number !== "number" || Math.abs(number) > Number.MAX_SAFE_INTEGER) {
    throw new RangeError();
  }
}

function schoolbook(a, b) {
  const c = new Array(a.length === 0 || b.length === 0 ? 0 : (a.length - 1 + b.length - 1 + 1));
  for (let i = 0; i < c.length; i++) {
    const from = Math.max(0, i - (b.length - 1));
    const to = Math.min(i, a.length - 1);
    let s = a[from] * b[i - from];
    for (let j = from + 1; j <= to; j++) {
      s += a[j] * b[i - j];
    }
    c[i] = s;
  }
  return c;
}

function absMax(array) {
  let max = 0;
  for (let i = 0; i < array.length; i++) {
    max = Math.max(max, Math.abs(array[i]));
  }
  return max;
}

function multiply(A, B) {
  check(absMax(A) * absMax(B) * Math.min(A.length, B.length));
  return schoolbook(A, B);
}

  function IntPolynomial(coefficients) {
    let k = coefficients.length;
    while (k > 0 && coefficients[k - 1] == 0) {
      k -= 1;
    }
    coefficients.length = k;
    check(absMax(coefficients));
    this.coefficients = coefficients;
  }
  IntPolynomial.prototype.add = function (other) {
    const a = this.coefficients;
    const b = other.coefficients;
    const c = new Array(Math.max(a.length, b.length));
    for (let i = 0; i < c.length; i += 1) {
      if (i < a.length && i < b.length) {
        c[i] = a[i] + b[i];
      } else if (i < a.length) {
        c[i] = a[i];
      } else {
        c[i] = b[i];
      }
    }
    return new IntPolynomial(c);
  };;
  IntPolynomial.prototype.subtract = function (other) {
    return this.add(other.negate());
  };
  IntPolynomial.prototype.multiply = function (other) {
    const a = this.coefficients;
    const b = other.coefficients;
    return new IntPolynomial(multiply(a, b));
  };
  IntPolynomial.prototype.divideAndRemainderModP = function (other, m) {
    const a = this.coefficients;
    const b = other.coefficients;
    if (a.length < b.length) {
      return {quotient: new IntPolynomial([]), remainder: this.mod(m)};
    }
    if (b.length === 0) {
      throw new RangeError();
    }
    const lc = b[b.length - 1];
    if (lc != 1) {
      throw new RangeError();
    }
    check(m * m * b.length);
    const remainder = new Array(a.length);
    for (let i = 0; i < a.length; i++) {
      remainder[i] = a[i];
    }
    let remainderDegree = remainder.length - 1;
    const quotient = new Array(a.length - b.length + 1);
    const zero = lc - lc;
    for (let i = 0; i < quotient.length; i++) {
      quotient[i] = zero;
    }
    while (remainderDegree >= b.length - 1) {
      const n = remainderDegree - b.length + 1;
      const q = modulo(remainder[remainderDegree], m);
      quotient[n] = q;
      if (q != 0) {
        if (q == 1) {
          for (let j = 0; j < b.length; j += 1) {
            remainder[j + n] -= b[j];
          }
        } else {
          for (let j = 0; j < b.length; j += 1) {
            remainder[j + n] -= q * b[j];
          }
        }
      }
      while (remainderDegree >= 0 && modulo(remainder[remainderDegree], m) == 0) {
        remainder[remainderDegree] = zero;
        remainderDegree -= 1;
      }
    }
    for (let j = 0; j <= remainderDegree; j += 1) {
      remainder[j] = modulo(remainder[j], m);
    }
    return {quotient: new IntPolynomial(quotient), remainder: new IntPolynomial(remainder)};
  };
  IntPolynomial.prototype.negate = function (s) {
    return new IntPolynomial(this.coefficients.map(c => (c - c) - c));
  };
  IntPolynomial.prototype.scale = function (s) {
    return new IntPolynomial(this.coefficients.map(c => c * s));
  };
  IntPolynomial.prototype.getDegree = function () {
    return this.coefficients.length - 1;
  };
  IntPolynomial.prototype.getLeadingCoefficient = function () {
    if (this.coefficients.length === 0) {
      throw new RangeError();
    }
    return this.coefficients[this.coefficients.length - 1];
  };
  IntPolynomial.prototype.getCoefficient = function (degree) {
    if (degree >= this.coefficients.length) {
      throw new RangeError();
    }
    return this.coefficients[degree];
  };
  IntPolynomial.prototype.derive = function (p) {
    let c = new Array(this.coefficients.length - 1);
    for (let i = 0; i < c.length; i += 1) {
      c[i] = (i + 1) * this.coefficients[i + 1];
    }
    return new IntPolynomial(c);
  };
  IntPolynomial.prototype.mod = function (p) {
    return new IntPolynomial(this.coefficients.map(c => modulo(c, p)));
  };
  IntPolynomial.prototype.toString = function () {
    let s = '';
    let c = this.coefficients;
    for (let i = c.length - 1; i >= 0; i--) {
      s += (c[i] >= 0 && i !== c.length ? '+' : '');
      s += c[i].toString();
      if (i === 1) {
        s += 'x';
      } else if (i !== 0) {
        s += 'x^';
        s += i;
      }
    }
    return s;
  };
  IntPolynomial.from = function (coefficients) {
    return new IntPolynomial(coefficients);
  };

export default IntPolynomial;
