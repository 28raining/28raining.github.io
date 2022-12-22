import nthRoot from './nthRoot.js';
//import bitLength from './bitLength.js';
import QuadraticSieveFactorization from './node_modules/quadraticsievefactorization/QuadraticSieveFactorization.js';
import isPrime from './node_modules/quadraticsievefactorization/isPrime.js';


// https://github.com/tc39/proposal-bigint/issues/205
// https://github.com/tc39/ecma262/issues/1729
// bitLength(a) = floor(log2(a)) + 1 if a > 0
function bitLength(a) {
  const s = a.toString(16);
  const c = 0 + s.charCodeAt(0) - '0'.charCodeAt(0);
  if (c <= 0) {
    throw new RangeError();
  }
  return (s.length - 1) * 4 + (32 - Math.clz32(Math.min(c, 8)));
}

//export default bitLength;

//function min(a, b) {
//  return a < b ? a : b;
//}

const SPLIT = Math.pow(2, Math.ceil(Math.log2((Number.MAX_SAFE_INTEGER + 1) * 2) / 2)) + 1;

function fma(a, b, p) {
  var at = SPLIT * a;
  var ahi = at - (at - a);
  var alo = a - ahi;
  var bt = SPLIT * b;
  var bhi = bt - (bt - b);
  var blo = b - bhi;
  var e = ((ahi * bhi + p) + ahi * blo + alo * bhi) + alo * blo;
  return e;
}

function modMultiplySmall(a, b, m) {
  if (typeof a !== 'number' || typeof b !== 'number' || typeof m !== 'number') {
    throw new TypeError();
  }
  if (!(a >= 0 && b >= 0 && a < m && b < m && m <= Number.MAX_SAFE_INTEGER)) {
    throw new RangeError();
  }
  var p = a * b;
  if (p <= Number.MAX_SAFE_INTEGER) {
    return p - Math.floor(p / m) * m;
  }
  var r1 = fma(a, b, -p);
  var q = (p / m) - (1 + Number.MAX_SAFE_INTEGER) + (1 + Number.MAX_SAFE_INTEGER); // note: this is a confusing line because of the double rounding
  var r2 = 0 - fma(q, m, -p);
  if (r1 > 0) {
    r1 -= m;
  }
  if (r2 < 0) {
    r2 += m;
  }
  var r = r1 + r2;
  if (r < 0) {
    r += m;
  }
  return r;
}

function modPowSmall(base, exponent, modulus) {
  // exponent can be huge, use non-recursive variant
  let accumulator = 1;
  while (exponent !== 0) {
    let q = Math.floor(exponent / 2);
    if (exponent !== q + q) {
      accumulator = modMultiplySmall(accumulator, base, modulus);
    }
    exponent = q;
    base = modMultiplySmall(base, base, modulus);
  }
  return accumulator;
}

function range(start, end) {
  var a = [];
  for (let i = start; i <= end; i += 1) {
    a.push(i);
  }
  return a;
}

// isPrime implementation is stolen from:
// https://github.com/peterolson/BigInteger.js
// https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test#Deterministic_variants
function isPrimeSmall(n) {
  if (typeof n !== 'number') {
    throw new TypeError();
  }
  if (n > Number.MAX_SAFE_INTEGER) {
    throw new RangeError();
  }
  if (n < 2) {
    throw new RangeError();
  }
  if (+primeFactorUsingWheel(n, 2 * 1024) < n) {
    return false;
  }
  if (n < Math.pow(1024, 2)) {
    return true;
  }
  let r = 0;
  let d = n - 1;
  while (d % 2 === 0) {
    d /= 2;
    r += 1;
  }
  // https://en.wikipedia.org/wiki/Miller–Rabin_primality_test#Testing_against_small_sets_of_bases
  const values = [10, 20, 24, 31, 40, 41, 48, 48, 61, 61, 61, 78, 81];
  const primes = [2, 3, 5, 7, 11, 13, 17, 17, 19, 19, 19, 23, 29];
  let i = 0;
  const x = Math.ceil(Math.log2(n));
  while (x > values[i] && i < values.length) {
    i += 1;
  }
  let bases = null;
  if (i < values.length) {
    bases = primes.slice(0, i + 1);
  } else {
    // https://primes.utm.edu/prove/prove2_3.html
    bases = range(2, Math.floor(1 / Math.log(2) * Math.log(n) * Math.log(Math.log(n))));
  }
  console.assert(n > bases[bases.length - 1]);
  for (const a of bases) {
    const adn = modPowSmall(a, d, n);
    if (adn !== 1) {
      for (let i = 0, x = adn; x !== n - 1; i += 1, x = modMultiplySmall(x, x, n)) {
        if (i === r - 1) {
          return false;
        }
      }
    }
  }
  return true;
}


// Pollard's rho implementation is stolen from:
// https://github.com/jiggzson/nerdamer/blob/master/nerdamer.core.js
// https://en.wikipedia.org/wiki/Pollard%27s_rho_algorithm#C_code_sample
// TODO: library (?)
function factorByPollardRho(n, x0 = 2n, c = 1n, maxIterations = 1 / 0) {
  
  const zero = n - n;
  const one = n / n;

  function abs(a) {
    return a < a - a ? -a : a;
  }

  function modMultiply(a, b, mod) {
    if (typeof mod === "number") {
      return modMultiplySmall(a, b, mod);
    }
    return (a * b) % mod;
  }

  function gcd(a, b) {
    while (b !== zero) {
      var r = a % b;
      a = b;
      b = r;
    }
    return a;
  }

  function f(x, c, mod) {
    var y = modMultiply(x, x, mod) - c;
    return y < zero ? y + mod : y;
  }

  if (n % x0 === 0n) {//?
    return x0;
  }

  var xFixed = x0;
  var cycleSize = 2;
  var x = x0;
  while (cycleSize <= Math.pow(2, maxIterations)) {
    var product = one;
    var productStart = x;
    var found = false;
    for (var count = 1; found || count <= cycleSize; count += 1) {
      x = f(x, c, n);
      if (count === cycleSize / 2) {
        productStart = x;
      }
      if (count > cycleSize / 2) { // see https://maths-people.anu.edu.au/~brent/pd/rpb051i.pdf
        //factor = gcd(abs(x - xFixed), n);
        product = found ? abs(x - xFixed) : modMultiply(product, abs(x - xFixed), n);
        if (found || count === cycleSize || count % 128 === 0) {
          // https://en.wikipedia.org/wiki/Pollard%27s_rho_algorithm#Variants
          var factor = gcd(product, n);
          if (factor !== one) {
            if (!found) {
              //cycleSize *= 2;
              x = productStart;
              found = true;
            } else {
              return factor;
            }
          }
          product = one;
          productStart = x;
        }
      }
    }
    cycleSize *= 2;
    xFixed = x;
  }
  return one;
}


function factorByPollardRhoWrapper(n, maxIterations = 1/0) {
  var small = typeof n === "number";
  if (small && isPrimeSmall(n) || !small && isPrime(n)) {
    return n;
  }
  var x0 = 2 - 1;
  var g = n;
  do {
    x0 += 1;
    g = small ? factorByPollardRho(n, x0, 1, maxIterations) : factorByPollardRho(n, BigInt(x0), 1n, maxIterations);
  } while (g === n);
  return g;
}

var WHEEL3 = [1, 2, 2, 4, 2, 4, 2, 4, 6, 2, 6];

function remainder(n, i) {
  // `n % i` is slower in Chrome and Firefox ...
  return n - Math.floor(n / i) * i;
}

function primeFactorUsingWheel(n, max = undefined) {
  var steps = WHEEL3;
  var cycle = 3;
  if (max == undefined) {
    max = Math.floor(Math.sqrt(Number(n) + 0.5));
  }
  var i = 2;
  var s = 0;
  while (i <= max) {
    if (remainder(n, i) === 0) {
      return i;
    }
    i += steps[s];
    s += 1;
    if (s === steps.length) {
      s = cycle;
    }
  }
  return n;
}

function someFactor(n) {
  var x = Number(n);
  if (x < 1) {
    throw new TypeError("primeFactor cannot be called for numbers less than 2");
  }
  if (x === 1) {
    return n;
  }
  //var s = gcd(BigInt(n), BigInt(304250263527210)); // a primorial - https://en.wikipedia.org/wiki/Primorial
  //if (s > 1n) {
    //TODO: use-cases - ?
  //  return s === n ? BigInt(primeFactorUsingWheel(Number(s))) : s;
  //}
  if (x <= Number.MAX_SAFE_INTEGER) {
    var pf = primeFactorUsingWheel(x, 1024);
    if (pf < x) {
      return BigInt(pf);
    }
    if (x <= 1024 * 1024) {
      return BigInt(pf);
    }
    if (x % 2 === 0) {
      return 2n;
    }
  }

  //! optimize n = f**2
  var squareRoot = BigInt(nthRoot(BigInt(n), 2));
  if (squareRoot**2n === n) {
    return squareRoot;
  }
if (x > 5) {
  // https://en.wikipedia.org/wiki/Fermat%27s_factorization_method
  var a = squareRoot + 1n;
  var b2 = a*a - BigInt(n);
  var b = BigInt(nthRoot(BigInt(b2), 2));
  if (b*b === b2) {
    //console.debug("Fermat's method", n, a - b);
    return a - b;
  }
}

  //! optimize n = f**3
  var size = bitLength(BigInt(n));
  for (var k = 3; k <= size / 10; k += 2) {
    var root = BigInt(nthRoot(BigInt(n), k));
    if (root**BigInt(k) === BigInt(n)) {
      return root;
    }
  }

  if (x <= Number.MAX_SAFE_INTEGER) {
    //return BigInt(primeFactorUsingWheel(x));
    return factorByPollardRhoWrapper(x);
  }
  if (true) {
    const L = function (n) {
      const e = Math.max(0, n.toString(16).length * 4 - 48);
      const lnn = (Math.log2(Number(BigInt(n) >> BigInt(e))) + e) * Math.LN2;
      return Math.exp(Math.sqrt(lnn * Math.log(lnn)));
    };
    //TODO: estimate new limit
    var limit = Math.floor(Math.log(L(n)));
    if (Number(n) < 2**64) {
      limit = 1 / 0;
    }
    if (Number(n) >= 2**128) {
      // try 2n**128n + 1n (large factors)
      // try 516580063688473107036756944316883068479010630159425669n (small factor)
      limit -= 3;
    } else if (Number(n) >= 2**96) {
      limit -= 2;
    } else {
      limit -= 1;
    }
    var factor = factorByPollardRhoWrapper(n, limit);
    if (factor !== 1n) {
      return factor;
    }
    if (true) {
      if (globalThis.onerror != null) {
        var size = bitLength(n);
        var error = new TypeError("big size of " + "someFactor " + "bitLength(" + n + ")" + " === " + size);
        globalThis.onerror(error.message, "", 0, 0, error);
      }
    }
    return QuadraticSieveFactorization(n);
  }
  return factorByPollardRhoWrapper(n);
}

  // https://en.wikipedia.org/wiki/Find_first_set#CTZ
  function countTrailingZeros(x, base) {
    //console.log(x, base);
    x = BigInt(x);
    base = BigInt(base);
    if (x < 0n || base < 0n) {
      throw new RangeError();
    }
    if (x === base) {
      return 1;
    }
    //if (base == 2 && typeof x === "bigint") { return bitLength(x & -x) - 1; } //TODO: ?
    if (x === 0n) {
      throw new TypeError();
    }
    if (base === 2n) {
      var k = 32;
      while (BigInt.asUintN(k, x) === 0n) {
        k *= 2;
      }
      var n = 0;
      for (var i = Math.floor(k / 2); i >= 32; i = Math.floor(i / 2)) {
        if (BigInt.asUintN(i, x) === 0n) {
          n += i;
          x >>= BigInt(i);
        }
      }
      const ctz4 = function (x) {
        const n = +x;
        return 32 - (Math.clz32(n & -n) + 1);
      };
      n += ctz4(Number(BigInt.asUintN(32, x)));
      return n;
    }
    var k = 1;
    while (x % base**BigInt(k) === 0n) {
      k *= 2;
    }
    var n = 0;
    for (var i = k / 2; i >= 1; i /= 2) {
      var v = base**BigInt(i);
      var q = x / v;
      var r = x - q * v;
      if (r === 0n) {
        n += i;
        x = q;
      }
    }
    return n;
  }

    primeFactor._rationalNumberToDecimalString = function (n, d, rounding) {
      // 1 / denominator
      const getPeriodOfRepeatingDecimalSegment = function (denominator, limit) {
        // https://softwareengineering.stackexchange.com/a/192081
        // https://en.wikipedia.org/wiki/Repeating_decimal#Other_properties_of_repetend_lengths
        // "If k = 2**a*5**b*n where n > 1 and n is not divisible by 2 or 5, then the length of the transient of 1/k is max(a, b), and the period equals r, where r is the smallest integer such that 10r ≡ 1 (mod n)."
        denominator = BigInt(denominator);
        if (denominator % 2n === 0n || denominator % 5n === 0n) {
          throw new RangeError("should be called with denominator not divible by 2 or 5");
        }
        const n = denominator;
        let period = 0;
        if (n !== 1n) {
          let z = 1n;
          do {
            period += 1;
            z = (10n * z) % n;
          } while (period <= limit && z !== 1n);
        }
        return period;
      };
      const bigDecimalToPlainString = function (significand, exponent, minFraction, minSignificant) {
        let e = exponent + significand.length - 1;
        significand = significand.replace(/0+$/g, '');
        const zeros = Math.max(0, Math.max(e + 1, minSignificant) - significand.length);
        if (e <= -1) {
          significand = "0".repeat(0 - e) + significand;
          e = 0;
        }
        significand += "0".repeat(zeros);
        significand += "0".repeat(Math.max(minFraction - (significand.length - (e + 1)), 0));
        return significand.slice(0, e + 1) + (significand.length > e + 1 ? "." + significand.slice(e + 1) : "");
      };
      // Something like Number#toPrecision: when value is between 10**-6 and 10**p? - to fixed, otherwise - to exponential:
      const toPrecision = function (significand, exponent, minSignificant) {
        const e = exponent + significand.length - 1;
        if (e < -6 || e >= minSignificant) {
          return bigDecimalToPlainString(significand, -(significand.length - 1), 0, minSignificant) + 'e' + (e < 0 ? '-' : '') + Math.abs(e).toString();
        }
        return bigDecimalToPlainString(significand, exponent, 0, minSignificant);
      };
      const digitsToDecimalNumber = function (significand, exponent, rounding) {
        // significand * 10**exponent
        if (rounding.significantDigits != undefined) {
          return toPrecision(significand, exponent, rounding.significantDigits);
        }
        return bigDecimalToPlainString(significand, exponent, rounding.fractionDigits, 0);
      };
      n = BigInt(n);
      d = BigInt(d);
      let sign = +1;
      if (d < 0n) {
        d = -d;
        sign = -sign;
      }
      if (n < 0n) {
        n = -n;
        sign = -sign;
      }
      const floorOfLog10 = function (n, d) {
        //TODO: optimize - ?
        let guess = Math.floor((bitLength(n) - 1 - bitLength(d)) / Math.log2(10));
        while ((guess < 0 ? 10n**BigInt(-guess) * n : n) >= (guess > 0 ? 10n**BigInt(guess) * d : d)) {
          guess += 1;
        }
        return guess - 1;
      };
      const a = primeFactor._countTrailingZeros(d, 2);
      const b = primeFactor._countTrailingZeros(d, 5);
      if (a > 0 && n % 2n === 0n) {
        throw new RangeError("not implemented");
      }
      if (b > 0 && n % 5n === 0n) {
        throw new RangeError("not implemented");
      }
      const d1 = d / (2n**BigInt(a) * 5n**BigInt(b));
      const lengthOfTransient = Math.max(a, b);
      if ((rounding.fractionDigits != undefined && lengthOfTransient <= rounding.fractionDigits || rounding.significantDigits != undefined && lengthOfTransient + (floorOfLog10(n, d) + 1) - primeFactor._countTrailingZeros(n, 10) <= rounding.significantDigits) && n % d1 === 0n) { // exact result
        const scaling = lengthOfTransient;
        const result = ((10n**BigInt(scaling) * n) / d).toString(); //TODO: optimize - ?
        const minRounding = rounding.fractionDigits != undefined ? {fractionDigits: lengthOfTransient} : {significantDigits: lengthOfTransient + (floorOfLog10(n, d) + 1) <= rounding.significantDigits ? lengthOfTransient + (floorOfLog10(n, d) + 1) : lengthOfTransient + (floorOfLog10(n, d) + 1) - primeFactor._countTrailingZeros(n, 10)};
        const f = (sign < 0 ? '-' : '') + digitsToDecimalNumber(result, -scaling, minRounding);
        return f;
      } else {
        const scaling = rounding.fractionDigits != undefined ? rounding.fractionDigits : rounding.significantDigits - (floorOfLog10(n, d) + 1);
        const sn = scaling > 0 ? 10n**BigInt(scaling) * n : n;
        const sd = scaling < 0 ? 10n**BigInt(-scaling) * d : d;
        const result = ((sn + sd / 2n) / sd).toString();
        let f = (sign < 0 ? '-' : '') + digitsToDecimalNumber(result, -scaling, rounding);
        const period = getPeriodOfRepeatingDecimalSegment(d1, f.length);
        ///^0\.(\d+?)(\d*?)(?:\1\2)*\1$/.exec('0.123123')
        if (period !== 0 && period <= f.length) { // a repeating decimal, the result is not exact
          const j = f.indexOf('.'); //?
          let offset = j + 1 + lengthOfTransient - (f.indexOf('e') !== -1 ? -Number(f.slice(f.indexOf('e') + 1)) - 0 : 0) - primeFactor._countTrailingZeros(n, 10);
          if (offset < j + 1) {
            //TODO: fix
            offset = j + 1;//!?
          }
          const lastFractionDigit = f.indexOf('e') !== -1 ? f.indexOf('e') : f.length;
          if (j !== -1 && (offset + period < lastFractionDigit || offset + period === lastFractionDigit && f.charCodeAt(offset) < '5'.charCodeAt(0))) {
            f = f.slice(0, offset) + '(' + f.slice(offset, offset + period) + ')' + f.slice(offset + period);
          }
        }
        if (!/[^0\.]/.test(f) && sign >= 0 && n !== 0n) {
          f = '+' + f;
        }
        return f;
      }
    };

function primeFactor(n) {
  n = BigInt(n);
  var factor = BigInt(someFactor(n));
  if (factor === n) {
    return factor;
  }
  //var otherFactor = n / factor**BigInt(countTrailingZeros(n, factor));
  //if (otherFactor === 1n) {
  //  return primeFactor(factor);
  //}
  //TODO: divide by gcd (?)
  //if (otherFactor < factor) {
  //  var tmp = factor;
  //  factor = otherFactor;
  //  otherFactor = tmp;
  //}
  var a = primeFactor(factor);
  //var b = a > nthRoot(nthRoot(otherFactor, 2), 2) || a > 1e9 ? primeFactor(otherFactor) : primeFactorUsingWheelBig(otherFactor, a);
  //return min(a, b);
  return a;
}

// from https://github.com/juanelas/bigint-mod-arith/blob/master/lib/index.browser.mod.js :
// x * a + y * b = gcd(a, b)
function eGCD_N(a, b) {
  const zero = a - a;
  const one = a / a;
  var [oldR, r] = [a < zero ? zero - a : a, b < zero ? zero - b : b];
  var [oldX, x] = [one, zero];
  var [oldY, y] = [zero, one];
  while (r !== zero) {
    var q = ((oldR - oldR % r) / r);
    [oldR, r] = [r, oldR - q * r];
    [oldX, x] = [x, oldX - q * x];
    [oldY, y] = [y, oldY - q * y];
    if (r > oldR - r) {
      // increase q by 1 and negate coefficients
      r = oldR - r;
      x = oldX - x;
      y = oldY - y;
    }
  }
  return {gcd: oldR, x: oldX, y: oldY};
}

function modInverseN(a, m) {
  const zero = m - m;
  console.assert(a >= zero);
  console.assert(m > zero);
  if (a > m) {
    a = a % m;
  }
  let inv = eGCD_N(a, m).x;
  inv = inv < zero ? inv + m : inv;
  console.assert(inv >= zero && inv < m);
  return inv;
}

function modInverse(a, m) {
  if (typeof m === "number") {
    if (typeof a === "number") {
      return modInverseN(a, m);
    }
    return modInverseN(Number(BigInt(a) % BigInt(m)), m);
  }
  return modInverseN(BigInt(a), BigInt(m));
}

primeFactor._bitLength = bitLength;
primeFactor._isPrime = function (n) {
  var number = Number(n);
  if (number <= Number.MAX_SAFE_INTEGER) {
    return isPrimeSmall(number);
  }
  return isPrime(n);
};
primeFactor._countTrailingZeros = countTrailingZeros;
primeFactor._someFactor = someFactor;
primeFactor._modInverse = modInverse;
primeFactor._integerNthRoot = function (a, n) {
  return nthRoot(BigInt(a), n);
};

primeFactor.testables = {
  factorByPollardRho: factorByPollardRho,
  factorByPollardRhoWrapper: factorByPollardRhoWrapper
};

export default primeFactor;
