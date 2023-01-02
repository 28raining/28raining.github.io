/*jshint esversion:11*/

function modInverse(a, m) {
  if (typeof a !== 'bigint' || typeof m !== 'bigint') {
    throw new TypeError();
  }
  if (a < 0n || a >= m || m <= 0n) {
    throw new RangeError();
  }
  // We use the extended Euclidean algorithm:
  let oldR = a;
  let r = m;
  let oldS = 1n;
  let s = 0n;
  while (r !== 0n) {
    const q = (oldR - oldR % r) / r; // floor(oldR / r)
    const newR = oldR - q * r;
    oldR = r;
    r = newR;
    const newS = oldS - q * s;
    oldS = s;
    s = newS;
  }
  if (oldR !== 1n) {
    return 0n;
  }
  return oldS < 0n ? oldS + m : oldS;
}

function modInverseSmall(a, m) {
  if (typeof a !== 'number' || typeof m !== 'number') {
    throw new TypeError();
  }
  const maxSMI = (~(-1 << 30));
  if (a < 0 || a >= m || m <= 0 || m > maxSMI) {
    throw new RangeError();
  }
  // We use the extended Euclidean algorithm:
  let oldR = a & maxSMI;
  let r = m & maxSMI;
  let oldS = 1;
  let s = 0;
  while (r !== 0) {
    const q = Math.floor(oldR / r);
    const newR = oldR % r;
    oldR = r;
    r = newR;
    const newS = oldS - q * s;
    oldS = s;
    s = newS;
  }
  if (oldR !== 1) {
    return 0;
  }
  return oldS < 0 ? oldS + m : oldS;
}

function ChineseRemainderTheorem(r1, r2, m1, m2) {
  if (typeof r1 !== 'bigint' || typeof r2 !== 'bigint' || typeof m1 !== 'bigint' || typeof m2 !== 'bigint') {
    throw new TypeError();
  }
  // https://en.wikipedia.org/wiki/Chinese_remainder_theorem#Case_of_two_moduli
  // x = r1 (mod m1)
  // x = r2 (mod m2)
  const c = modInverse(m1 % m2, m2);
  return r1 + (((r2 - r1) * c) % m2) * m1;
}

function squareRootsModuloOddPrimesProduct(n, primes, e = 1) {
  // Chinese Remainder Theorem idea from https://en.wikipedia.org/wiki/Quadratic_residue#Complexity_of_finding_square_roots
  let result = [];
  result.push(0n);
  let P = 1n;
  for (let i = 0; i < primes.length; i += 1) {
    const p = BigInt(Math.pow(primes[i], e));
    if (Number(p) > Number.MAX_SAFE_INTEGER) {
      throw new RangeError();
    }
    const x2 = BigInt(squareRootModuloOddPrime(Number(n % p), primes[i], e));
    const result2 = [];
    for (let j = 0; j < result.length; j += 1) {
      const x1 = result[j];
      result2.push(ChineseRemainderTheorem(x1, x2, P, p));
      result2.push(ChineseRemainderTheorem(x1, -x2, P, p));
    }
    P *= p;
    result = result2;
  }
  return result;
}

function squareRootsModuloTwo(n, e = 1) {
  if (e >= 3) {
    if (n % 8 === 1) { // from Cohen H.
      const m = Math.pow(2, e);
      const candidate = +squareRootsModuloTwo(n, e - 1)[0];
      const candidate2 = m / 4 - candidate;
      const r = (candidate * candidate) % m !== n ? candidate2 : candidate;
      return [r, m / 2 - r, m / 2 + r, m - r];
    }
    return [];
  }
  if (e >= 2) {
    if (n % 4 === 1) {
      return [1, 3];
    }
    return [];
  }
  if (e >= 1) {
    return [1];
  }
  return [];
}

function squareRootModuloOddPrime(n, p, e = 1) { // slow for non-small p
  if (typeof n !== 'number' || typeof p !== 'number' || typeof e !== 'number') {
    throw new TypeError();
  }
  const m = Math.pow(p, e);
  if (!(n > 0 && n < m && p > 0 && e >= 1 && +n % +p !== 0 && m < Math.floor(Math.sqrt(Number.MAX_SAFE_INTEGER * 4)))) { // + p is a prime number
    throw new RangeError();
  }
  if (p % 2 === 0) {
    throw new RangeError();
  }
  // r**2 == n (mod p)
  if (e > 1) {
    const x = squareRootModuloOddPrime(n % Math.pow(p, e - 1), p, e - 1);
    // x**2 = n mod p**(e - 1)
    // x1 = x + a * p**(e-1)
    // x1**2 = x**2 + (a * p**(e-1))**2 + 2*x*a*p**(e-1) = n mod p**e
    // a*p**(e-1) = (n - x**2) * (2*x)**-1 mod p**e
    let inv = modInverseSmall(2 * x, m) % m;
    let v = (n - x * x) % m;
    inv = inv > m / 2 ? inv - m : inv; // use sign bit
    v = v > m / 2 ? v - m : v; // use sign bit
    let x1 = x + (v * inv) % m;
    if (x1 >= m) {
      x1 -= m;
    }
    if (x1 < 0) {
      x1 += m;
    }
    if (x1 > m - x1) {
      x1 = m - x1;
    }
    return x1;
  }
  if ((p + 1) % 4 === 0) {
    // from https://en.wikipedia.org/wiki/Quadratic_residue#Prime_or_prime_power_modulus :
    let r = modPowSmall(n, (p + 1) / 4, p);
    if ((r * r) % p === n) {
      if (r > p - r) {
        r = p - r;
      }
      return r;
    }
  }
  let rrmnmodp = 1 - n; // r**2 % p - n
  for (let tworm1 = -1; tworm1 < p; tworm1 += 2) {
    rrmnmodp += tworm1;
    if (rrmnmodp >= p) {
      rrmnmodp -= p;
    }
    if (rrmnmodp === 0) {
      const r = Math.floor((tworm1 + 1) / 2);
      return r;
    }
  }
  throw new RangeError();
}

function bitLength(x) {
  return BigInt(x.toString(16).length * 4);
}

function sqrt(x) {
  if (x < BigInt((Number.MAX_SAFE_INTEGER + 1) / 2)) {
    return BigInt(Math.floor(Math.sqrt(Number(BigInt(x)) + 0.5)));
  }
  const q = (bitLength(x) >> 2n);
  const initialGuess = ((sqrt(x >> (q * 2n)) + 1n) << q);
  let a = initialGuess;
  let b = a + 1n;
  while (a < b) {
    b = a;
    a = (b + x / b) >> 1n;
  }
  return b;
}

function getSmoothFactorization(a, base) {
  let value = BigInt(a);
  if (value === 0n) {
    return [0];
  }
  const result = [];
  if (value < 0n) {
    result.push(-1);
    value = -value;
  }
  let i = 0;

  let fastValue = FastModBigInt(value);
  let isBig = value > BigInt(Number.MAX_SAFE_INTEGER);
  while (i < base.length && isBig) {
    const p = base[i];
    while (FastMod(fastValue, p) === 0) {
      value /= BigInt(p);
      fastValue = FastModBigInt(value);
      isBig = value > BigInt(Number.MAX_SAFE_INTEGER);
      result.push(p);
    }
    i += 1;
  }

  let n = Number(value);
  while (i < base.length) {
    const p = +base[i];
    while (n - Math.floor(n / p) * p === 0) {
      n /= p;
      result.push(p);
    }
    if (n !== 1 && n < p * p) {
      // n should be prime (?)
      const index = indexOf(base, n);
      if (index === -1) {
        return null;
      }
      result.push(n);
      return result;
    }
    i += 1;
  }
  return n === 1 ? result : null;
}

// (X**2 - Y) % N === 0, where Y is a smooth number
function CongruenceOfsquareOfXminusYmoduloN(X, Y, N) {
  this.X = X;
  this.Y = Y;
  this.N = N;
}
CongruenceOfsquareOfXminusYmoduloN.prototype.toString = function () {
  return 'X**2 ≡ Y (mod N)'.replaceAll('X', this.X)
                           .replaceAll('N', this.N)
                           .replaceAll('Y', this.Y.join(' * '));
};

function isQuadraticResidueModuloPrime(a, p) {
  if (typeof a !== 'bigint' || typeof p !== 'number') {
    throw new TypeError();
  }
  if (p === 2) {
    // "Modulo 2, every integer is a quadratic residue." - https://en.wikipedia.org/wiki/Quadratic_residue#Prime_modulus
    return true;
  }
  // https://en.wikipedia.org/wiki/Euler%27s_criterion
  const amodp = Number(BigInt(a) % BigInt(p));
  if (amodp === 0) {
    return true;
  }
  console.assert(p % 2 === 1);
  const value = modPowSmall(amodp, (p - 1) / 2, p);
  console.assert(value === 1 || value === p - 1);
  return value === 1;
}

function log(N) {
  const e = Math.max(Number(bitLength(N)) - 4 * 12, 0);
  const lnn = Math.log(Number(N >> BigInt(e))) + Math.log(2) * e;
  return lnn;
}

function L(N) {  // exp(sqrt(log(n)*log(log(n))))
  const lnn = log(N);
  return Math.exp(Math.sqrt(lnn * Math.log(lnn)));
}

function productModM(array, m) {
  let p = 1n;
  for (let i = 0; i < array.length; i += 1) {
    p = (p * BigInt(array[i])) % m;
  }
  return p;
}

function modPowSmall(base, exponent, modulus) {
  if (typeof base !== 'number' || typeof exponent !== 'number' || typeof modulus !== 'number') {
    throw new TypeError();
  }
  if (Math.max(Math.pow(modulus, 2), Math.pow(base, 2)) > Number.MAX_SAFE_INTEGER) {
    throw new RangeError();
  }
  let accumulator = 1;
  while (exponent !== 0) {
    if (exponent % 2 === 0) {
      exponent /= 2;
      base = (+base * +base) % modulus;
    } else {
      exponent -= 1;
      accumulator = (accumulator * base) % modulus;
    }
  }
  return accumulator;
}

function primes(MAX) {
  // Note: it is slow in Chrome to create array this way when MAX >= 2**25
  const sieve = new Array(MAX + 1).fill(true);
  const result = [];
  result.push(2);
  for (let i = 3; i <= MAX; i += 2) {
    if (sieve[i]) {
      result.push(i);
      if (i <= Math.floor(MAX / i)) {
        for (let j = i * i; j <= MAX; j += 2 * i) {
          sieve[j] = false;
        }
      }
    }
  }
  return result;
}

const BitSetWordSize = 31; // see https://v8.dev/blog/pointer-compression

function packedArray(n) {
  // `%DebugPrint(array)` in `node --allow-native-syntax`
  // see https://v8.dev/blog/elements-kinds
  const array = [];
  for (let i = 0; i < n; i += 1) {
    array.push(0);
  }
  return array.slice(0); // slice to reduce the size of the internal storage
}
function BitSet(size) {
  const n = Math.ceil(size / (4 * BitSetWordSize)) * 4;
  this.data = packedArray(n);
  this.size = size;
}
BitSet.prototype.nextSetBit = function (index) {
  if (+index >= +this.size) {
    return -1;
  }
  const data = this.data;
  let q = Math.floor(index / BitSetWordSize);
  let r = index % BitSetWordSize;
  let x = data[q] >> r;
  while (x === 0) {
    q += 1;
    if (q === data.length) {
      return -1;
    }
    x = data[q];
    r = 0;
  }
  if (x === (-1 << (BitSetWordSize - 1))) {
    // -x overflows
    r += BitSetWordSize - 1;
  } else {
    // https://stackoverflow.com/questions/61442006/whats-the-most-efficient-way-of-getting-position-of-least-significant-bit-of-a
    r += 31 - Math.clz32(x & -(+x));
  }
  return q * BitSetWordSize + r;
};
BitSet.prototype.toggle = function (index) {
  if (+index >= +this.size) {
    throw new RangeError();
  }
  const q = Math.floor(index / BitSetWordSize);
  const r = index % BitSetWordSize;
  this.data[q] ^= (r === BitSetWordSize - 1 ? ((-1) << r) : (1 << r));
};
BitSet.prototype.xor = function (other) {
  const a = this.data;
  const b = other.data;
  const n = a.length;
  if (+n !== +b.length || n % 4 !== 0) {
    throw new RangeError();
  }
  for (let i = 0; i < n; i += 4) {
    a[i + 0] ^= b[i + 0] | 0;
    a[i + 1] ^= b[i + 1] | 0;
    a[i + 2] ^= b[i + 2] | 0;
    a[i + 3] ^= b[i + 3] | 0;
  }
};
BitSet.prototype.toString = function () {
  return this.data.map(x => (x >>> 0).toString(2).padStart(BitSetWordSize, '0').split('').reverse().join('')).join('').slice(0, this.size);
};


// pass factorizations with associated values to the next call
// returns linear combinations of vectors which result in zero vector by modulo 2
// (basis of the kernel of the matrix)
function solve(matrixSize) {
  // We build the augmented matrix in row-echelon form with permuted rows, which can grow up to matrixSize rows:
  // The augmented matrix is stored in the lower triangle!
  const M = new Array(matrixSize).fill(null); // We will fill the matrix so pivot elements will be placed on the diagonal
  const associatedValues = new Array(matrixSize).fill(undefined);
  let nextSolution = null;
  let state = 1;
  const iterator = {
    next: function solve(rawRowAndValue) {
      while (true) {
        if (state === 1) {
          state = 0;
          return {value: nextSolution, done: false};
        }
        state = 1;
        const rawRow = rawRowAndValue[0];
        const associatedValue = rawRowAndValue[1];
        let row = new BitSet(matrixSize);
        const reverseColumns = true; // makes it much faster when the data is more dense from the beginning (?)
        for (let j = 0; j < rawRow.length; j += 1) {
          const unitaryColumn = rawRow[j];
          const c = reverseColumns ? matrixSize - 1 - unitaryColumn : unitaryColumn;
          row.toggle(c);
        }
        // add row to the matrix maintaining it to be in row-echelon form:
        for (let pivotColumn = row.nextSetBit(0); pivotColumn !== -1 && row != null; pivotColumn = row == null ? -1 : row.nextSetBit(pivotColumn + 1)) {
          const pivotRow = M[pivotColumn];
          if (pivotRow != null) {
            // row-reduction:
            row.xor(pivotRow);
            console.assert(+row.nextSetBit(pivotColumn) > +pivotColumn || row.nextSetBit(pivotColumn) === -1);
            row.toggle(pivotColumn);
          } else {
            //row.toggle(matrixSize + pivotColumn);
            associatedValues[pivotColumn] = associatedValue;
            M[pivotColumn] = row;
            row = null;
          }
        }
        if (row != null) {
          // row has a solution
          // extract solution from the augmented part of the matrix:
          const solution = [];
          for (let i = row.nextSetBit(0); i !== -1; i = row.nextSetBit(i + 1)) {
            solution.push(associatedValues[i]);
          }
          solution.push(associatedValue);
          nextSolution = solution;
        } else {
          nextSolution = null;
        }
      }
      //console.log(M.filter(x => x != null).map(x => x.toString()).join('\n').replaceAll('0', ' '))
    }
  };
  iterator[globalThis.Symbol.iterator] = function () {
    return this;
  };
  return iterator;
}

//!copy-paste

function FastModBigInt(a) {
  const array = [];
  while (a !== 0n) {
    const x = Number(BigInt.asUintN(51, a));
    array.push(x);
    a >>= 51n;
  }
  return array;
}
function FastMod(array, integer) {
  const n = array.length - 1;
  let result = array[n];
  const v = integer;
  const inv = (1 + 2**-52) / v;
  result -= Math.floor(result * inv) * v;
  if (n > 0) {
    const x = 2**51 - Math.floor(2**51 * inv) * v;
    let i = n;
    do {
      i -= 1;
      result = result * x + array[i];
      result -= Math.floor(result * inv) * v;
    } while (i !== 0);
  }
  return result;
}

//squareRootModuloOddPrime(4865648, 9749, 2)  // huge size of p**e

function exp2(x) {
  return Math.pow(2, Math.floor(x)) * Math.exp(Math.LN2 * (x - Math.floor(x)));
}

const useMultiplePolynomials = true;

// (A * x + B)**2 - N = A * (A * x**2 + 2 * B * x + C), A * C = B**2 - N
function QuadraticPolynomial(A, B, N, AFactors) {
  if (typeof A !== 'bigint' || typeof B !== 'bigint' || typeof N !== 'bigint') {
    throw new TypeError();
  }
  const AC = (B * B - N);
  if (AC % A !== 0n) {
    throw new TypeError();
  }
  const C = AC / A;
  this.A = A;
  this.B = B;
  this.C = C;
  this.AFactors = AFactors;
  const logA = log(A);
  const u = -Math.exp(log(B) - logA);
  const v = Math.exp(log(N) / 2 - logA);
  this.x1 = u - v;
  this.x2 = u + v;
  this.log2a = logA / Math.LN2;
}
QuadraticPolynomial.generator = function (M, primes, N) {
  // see https://www.cs.virginia.edu/crab/QFS_Simple.pdf for multiple primes optimization
  const getCombinations = function (elements, k) {
    if (elements.length === 0) {
      return [];
    }
    if (k === 0) {
      return [[]];
    }
    if (k === 1) {
      return elements.map(e => [e]);
    }
    return getCombinations(elements.slice(1), k - 1).map(c => [elements[0]].concat(c)).concat(getCombinations(elements.slice(1), k));
  };
  const nthRootApprox = function (A, n) {
    if (typeof A !== 'bigint') {
      throw new TypeError();
    }
    const e = bitLength(A);
    return Math.round(e <= 1023n ? Math.pow(Number(A), 1 / n) : Math.pow(Number(A >> (e - 1023n)), 1 / n) * Math.pow(2, Number(e - 1023n) / n));
  };
  const S = BigInt(sqrt(2n * N)) / BigInt(M);
  const e = log(S) / Math.log(2);
  if (primes.length < 16) {
    throw new TypeError();//TODO:
  }
  const max1 = Math.log2(primes[primes.length - 1]);
  const k = Math.max(2, Math.ceil(e / Math.min(14.5, max1) / 2) * 2); // number of small primes
  //console.debug(k);
  const p = nthRootApprox(S, k);
  let s = 0;
  const nextPrime = function () {
    let p3 = 0;
    do {
      p3 = p - p % 2 + 1 + (s % 2 === 0 ? s : (-1 - s));
      s += 1;
    } while (indexOf(primes, p3) === -1);
    return p3;
  };
  let combinations = [];
  const polynomials = [];
  const elements = [];
  QuadraticSieveFactorization.polynomialsCounter = 0;
  return {
    next: function generator() {
      while (polynomials.length === 0) {
        // There must be at least two different primes from previous selections. - from https://www.rieselprime.de/ziki/Self-initializing_quadratic_sieve
        while (combinations.length === 0) {
          const p3 = nextPrime();
          const p4 = nextPrime();
          console.assert(k % 2 === 0);
          combinations = getCombinations(elements, k / 2 - 1).map(c => [[p3, p4]].concat(c));
          elements.push([p3, p4]);
          //console.log(elements.length, combinations.length, p**k / Number(S));
        }
        const qPrimes = combinations.pop().reduce((array, pair) => array.concat(pair), []);
        const q = BigInt(qPrimes.reduce((p, a) => p * BigInt(a), 1n));
        const qInv = modInverse(q % N, N);
        if (qInv === 0n) {
          //TODO: what to do here - ?
          return this.next();
        }
        const A = q;
        const Bs = squareRootsModuloOddPrimesProduct(N, qPrimes, 1);
        for (let i = 0; i < Bs.length; i += 1) {
          Bs[i] = Bs[i] < 0n ? A - Bs[i] : Bs[i];
        }
        Bs.sort((a, b) => Number(BigInt(a) - BigInt(b)));
        for (let i = 0; i < Bs.length / 2; i += 1) {
          const B = Bs[i];
          polynomials.push(new QuadraticPolynomial(A, B, N, qPrimes));
        }
      }
      QuadraticSieveFactorization.polynomialsCounter += 1;
      return polynomials.shift();
    }
  };
};
QuadraticPolynomial.prototype.X = function (x) {
  return (this.A * BigInt(x) + this.B);
};
QuadraticPolynomial.prototype.Y = function (x, s, primes) {
  if (typeof x !== 'number') {
    throw new TypeError();
  }
  const Y = this.A * (x * x >= 2**53 ? BigInt(x) * BigInt(x) : BigInt(x * x)) + this.B * BigInt(2 * x) + this.C;
  if (Y % s !== 0n) {
    return null;
  }
  const YFactors = getSmoothFactorization(Y / s, primes);
  if (YFactors == null) {
    return null;
  }
  if (YFactors.length === 1 && YFactors[0] === 0) {
    return YFactors;
  }
  return this.AFactors.concat(YFactors);
};
QuadraticPolynomial.prototype.log2AbsY = function (x) {
  if (typeof x !== 'number') {
    throw new TypeError();
  }
  //const v1 = Math.log2(Math.abs(Number(this.Y(x))));
  const v2 =  Math.log2(Math.abs((x - this.x1) * (x - this.x2))) + this.log2a;
  return v2;
};

function thresholdApproximationInterval(polynomial, x, threshold, sieveSize) {
  let w = sieveSize > 2048 ? (sieveSize > 2**18 ? 1024 : 256) : 1;
  while (w >= 2 && Math.abs(polynomial.log2AbsY(x + w) - threshold) > 0.5) {
    w = Math.floor(w / 2);
  }
  return x + w;
}

// https://ru.wikipedia.org/wiki/Алгоритм_Диксона
// https://www.youtube.com/watch?v=TvbQVj2tvgc
// https://www.rieselprime.de/ziki/Self-initializing_quadratic_sieve


function congruencesUsingQuadraticSieve(primes, N, sieveSize0) {
  if (typeof N !== 'bigint') {
    throw new TypeError();
  }
  let sieveSize1 = Number(sieveSize0 || 0);
  if (sieveSize1 === 0) {
    sieveSize1 = 3 * 2**14;
    sieveSize1 = Math.min(sieveSize1, Math.ceil(Math.pow(+primes[primes.length - 1], 1.15)));
    sieveSize1 = Math.max(sieveSize1, primes[primes.length - 1] + 1);
    if (sieveSize1 > 2.75 * 2**17) {
      sieveSize1 = Math.max(2.75 * 2**17, Math.floor(sieveSize1 / 2));
    }
  }
  //console.debug('sieveSize1', Math.log2(sieveSize1));

  const q = Math.ceil(sieveSize1 / (2.75 * 2**17));
  const segmentSize = Math.ceil(Math.ceil(sieveSize1 / q) / 2) * 2;
  const sieveSize = segmentSize * q;
  const SIEVE_SEGMENT1 = [];
  for (let i = 0; i < segmentSize; i += 1) {
    SIEVE_SEGMENT1.push(-0);
  }
  const SIEVE_SEGMENT = SIEVE_SEGMENT1.slice(0);

  const log2B = Math.log2(primes.length === 0 ? Math.sqrt(2) : +primes[primes.length - 1]);
  const twoB = log2B + Math.min(8, log2B);
  const largePrimes = new Map(); // faster (?)

  // see https://www.youtube.com/watch?v=TvbQVj2tvgc
  const wheels0 = [];
  for (let i = 0; i < primes.length; i += 1) {
    const p = +primes[i];
    for (let beta = 1, pInBeta = p; pInBeta <= sieveSize || beta === 1; beta += 1, pInBeta *= p) {
      const nmodpInBeta = Number(N % BigInt(pInBeta));
      if (nmodpInBeta % p === 0) {
        //console.warn('N has a factor in prime base', N, p);
      } else {
        if (p === 2) {
          const roots = squareRootsModuloTwo(nmodpInBeta, beta);
          for (let j = 0; j < Math.ceil(roots.length / 2); j += 1) {
            wheels0.push({step: pInBeta, proot: 0, proot2: 0, p: p, root: roots[j] | 0});
          }
        } else {
          const root = squareRootModuloOddPrime(nmodpInBeta, p, beta);
          wheels0.push({step: pInBeta, proot: 0, proot2: 0, p: p, root: root | 0});
        }
      }
    }
  }
  wheels0.sort((a, b) => +a.step - +b.step);
  const wheels = [];
  const wheelLogs = [];
  const wheelRoots = [];
  const wheelStepInvs = [];
  for (let i = 0; i < wheels0.length; i += 1) {
    const w = wheels0[i];
    wheels.push({step: w.step, proot: 0, proot2: 0});
    wheelLogs.push(Math.log2(w.p) * (w.step === 2 ? 0.5 : 1));
    wheelRoots.push(w.root);
    wheelStepInvs.push((1 + 2**-52) / w.step);
  }

  const lpStrategy = function (p, polynomial, x) {
    // https://ru.wikipedia.org/wiki/Алгоритм_Диксона#Стратегия_LP
    const lp = largePrimes.get(p);
    if (lp == undefined) {
      // storing polynomial + x has smaller memory usage
      largePrimes.set(p, {polynomial: polynomial, x: x});
    } else {
      const s = BigInt(p);
      const sInverse = modInverse(s, N);
      if (sInverse === 0n) {
        return new CongruenceOfsquareOfXminusYmoduloN(s, [0], N);//?
      } else {
        const X = polynomial.X(x);
        const Y = polynomial.Y(x, s, primes);
        const lpX = lp.polynomial.X(lp.x);
        const lpY = lp.polynomial.Y(lp.x, s, primes);
        const X1 = (sInverse * lpX * X) % N;
        if (Y != null && lpY != null) {
          const Y1 = Y.concat(lpY);
          return new CongruenceOfsquareOfXminusYmoduloN(X1, Y1, N);
        }
      }
    }
    return null;
  };

  const polynomialGenerator = useMultiplePolynomials ? QuadraticPolynomial.generator(sieveSize / 2, primes, N) : null;
  let polynomial = null;
  let baseOffsets = null;
  if (!useMultiplePolynomials) {
    const baseOffset = BigInt(sqrt(N)) + 1n;
    polynomial = new QuadraticPolynomial(1n, baseOffset, N, []);
    baseOffsets = packedArray(wheels.length);
    // - Number(baseOffset % BigInt(pInBeta))
    for (let i = 0; i < wheels.length; i += 1) {
      baseOffsets[i] = Number(baseOffset % BigInt(wheels[i].step));
    }
  }

  let invCacheKey = 0n;
  const invCache = packedArray(wheels.length);

  function checkWheels(offset) {
    for (let k = 0; k < wheels.length; k += 1) {
      for (let v = 0; v <= 1; v += 1) {
        const root = (v === 0 ? wheels[k].proot : wheels[k].proot2);
        if (root !== sieveSize) {
          const x = BigInt(+root + offset);
          const X = (polynomial.A * x + polynomial.B);
          const Y = X * X - N;
          if (Y % polynomial.A !== 0n || (Y / polynomial.A) % BigInt(wheels[k].step) !== 0n) {
            throw new Error();
          }
        }
      }
    }
  }

  const updateWheels = function (polynomial, offset) {
    //recalculate roots based on the formula:
    //proot = ((-B + root) * modInv(A, p)) % p;
    //+some optimizations to minimize bigint usage and modInverseSmall calls
    const AA = FastModBigInt(polynomial.A);
    const BB = FastModBigInt(polynomial.B);
    const useCache = BigInt(polynomial.A) === BigInt(invCacheKey);
    for (let i = 0; i < wheels.length; i += 1) {
      const w = wheels[i];
      const p = +w.step;
      const root = +wheelRoots[i];
      const sInv = wheelStepInvs[i];
      if (!useCache) {
        //const a = Number(polynomial.A % BigInt(p));
        const a = FastMod(AA, p);
        invCache[i] = modInverseSmall(a, p);
      }
      const invA = invCache[i];
      //const b = Number(polynomial.B % BigInt(p));
      const b = +FastMod(BB, p);
      if (invA === 0) {
        // single root:
        // x = (2B)^-1*(-C) (mod p)
        // skip as the performance is not better
        w.proot = sieveSize;
        w.proot2 = sieveSize;
      } else {
        const x1 = (p - b + (p + root)) * invA - offset;
        const x2 = (p - b + (p - root)) * invA - offset;
        const r1 = (x1 - Math.floor(x1 * sInv) * p) | 0; // x1 mod p
        const r2 = (x2 - Math.floor(x2 * sInv) * p) | 0; // x2 mod p
        const max = r1 - ((r1 - r2) & ((r1 - r2) >> 31));
        w.proot = r1 + r2 - max;
        w.proot2 = max;
      }
    }
    invCacheKey = polynomial.A;
    //checkWheels(offset);
  };

  const gcd = function (a, b) {
    while (b !== 0) {
      const r = +a % +b;
      a = b;
      b = r;
    }
    return a;
  };
  const lcm = function (a, b) {
    return Math.floor(a / gcd(a, b)) * b;
  };
  const getSmallWheels = function () {
    let p = 1;
    let i = 0;
    while (i < wheels.length && lcm(p, wheels[i].step) <= segmentSize) {
      p = lcm(p, wheels[i].step);
      i += 1;
    }
    return i;
  };
  const smallWheels = getSmallWheels();



  const singleBlockSieve = function (limit, subsegmentEnd, s) {
    if (typeof limit !== 'number' || typeof subsegmentEnd !== 'number' || typeof s !== 'number') {
      throw new TypeError();
    }
    for (let j = smallWheels; j < limit; j += 1) {
      const w = wheels[j];
      const step = w.step;
      const log2p = +wheelLogs[j];
      let kpplusr = w.proot | 0;
      let kpplusr2 = w.proot2 | 0;
      if (kpplusr > kpplusr2) {
        throw new RangeError();
      }
      while (kpplusr2 < subsegmentEnd) {
        SIEVE_SEGMENT[kpplusr] += log2p;
        kpplusr += step;
        SIEVE_SEGMENT[kpplusr2] += log2p;
        kpplusr2 += step;
      }
      if (kpplusr < subsegmentEnd) {
        SIEVE_SEGMENT[kpplusr] += log2p;
        kpplusr += step;
        const tmp = kpplusr;
        kpplusr = kpplusr2;
        kpplusr2 = tmp;
      }
      w.proot = kpplusr - s;
      w.proot2 = kpplusr2 - s;
    }
  };

  const copyWithin = function (array, target, start, end) {
    if (typeof target !== 'number' || typeof start !== 'number' || typeof end !== 'number') {
      throw new TypeError();
    }
    const end2 = end - end % 2;
    let j = start;
    while (j < end2) {
      array[target + j] = array[j];
      j += 1;
      array[target + j] = array[j];
      j += 1;
    }
    if (j < end) {
      array[target + j] = array[j];
      j += 1;
    }
  };

  const updateSieveSegment = function (segmentStart) {
    if (typeof segmentStart !== 'number') {
      throw new TypeError();
    }
    let cycleLength = 1;
    SIEVE_SEGMENT[0] = -0;
    for (let j = 0; j < smallWheels; j += 1) {
      const newCycleLength = +lcm(cycleLength, wheels[j].step);
      for (let i = +cycleLength; i < newCycleLength; i += +cycleLength) {
        copyWithin(SIEVE_SEGMENT, i, 0, Math.min(newCycleLength - i, cycleLength));
      }
      cycleLength = newCycleLength;
      const w = wheels[j];
      const step = w.step | 0;
      const log2p = +wheelLogs[j];
      for (let k = ((w.proot | 0) + newCycleLength - segmentStart % newCycleLength) % step; k < newCycleLength; k += step) {
        SIEVE_SEGMENT[k] += log2p;
      }
      for (let k = ((w.proot2 | 0) + newCycleLength - segmentStart % newCycleLength) % step; k < newCycleLength; k += step) {
        SIEVE_SEGMENT[k] += log2p;
      }
    }
    for (let i = +cycleLength; i < segmentSize; i += +cycleLength) {
      copyWithin(SIEVE_SEGMENT, i, 0, Math.min(segmentSize - i, cycleLength));
    }
    //for (let j = 0; j < segmentSize; j += 1) {
    //  SIEVE_SEGMENT[j] = -0;
    //}
    // "Block Sieving Algorithms" by Georg Wambach and Hannes Wettig May 1995
    const V = 64;
    const S = 2**12 - V * 8;
    let subsegmentEnd = 0;
    while (subsegmentEnd + S <= segmentSize) {
      subsegmentEnd += S;
      singleBlockSieve(V, subsegmentEnd, 0);
    }
    singleBlockSieve(wheels.length, segmentSize, segmentSize);
  };

  const smoothEntries = [];
  const smoothEntries2 = [];
  const findSmoothEntries = function (offset, polynomial) {
    let i = 0;
    let thresholdApproximation = 0.5;
    while (i < segmentSize) {
      // it is slow to compute the threshold on every iteration, so trying to optimize:

      //TODO: the threshold calculation is much more simple in the Youtube videos (?)
      thresholdApproximation = polynomial.log2AbsY(i + offset) - twoB;
      const j = Math.min(segmentSize, thresholdApproximationInterval(polynomial, i + offset, thresholdApproximation + twoB, sieveSize) - offset);

      while (i < j) {
        if (i < j - 1) {
          const tmp = SIEVE_SEGMENT[j - 1];
          SIEVE_SEGMENT[j - 1] = 1/0;
          while (thresholdApproximation >= SIEVE_SEGMENT[i]) {
            i += 1;
          }
          SIEVE_SEGMENT[j - 1] = tmp;
        }
        if (thresholdApproximation < SIEVE_SEGMENT[i]) {
          smoothEntries.push(i + offset);
          smoothEntries2.push(SIEVE_SEGMENT[i]);
        }
        i += 1;
      }
    }
  };

  function checkFactorization(x) {
    let p = 0;
    for (let n = 0; n < wheels.length; n += 1) {
      const w = wheels[n];
      for (let v = 0; v <= 1; v += 1) {
        if ((x - (v === 0 ? (w.proot | 0) : (w.proot2 | 0)) - (n < smallWheels ? 0 : segmentSize)) % w.step === 0) {
          if (polynomial.AFactors.indexOf(w.step) === -1) {
            console.log(w.step);
            p += wheelLogs[n];
          }
        }
      }
    }
    return p;
  }

  QuadraticSieveFactorization.lpCounter = 0;
  let i1 = -1;
  let k = 0;
  const iterator = {
    next: function congruencesUsingQuadraticSieve() {
      while ((useMultiplePolynomials ? 2 : 1/16) * k * sieveSize <= Math.pow(primes[primes.length - 1], 2)) {
        if (i1 === sieveSize) {
          k += 1;
          i1 = -1;
        }
        const offset = useMultiplePolynomials ? -sieveSize / 2 : (k % 2 === 0 ? 1 : -1) * Math.floor((k + 1) / 2) * sieveSize;
        if (i1 === -1) {

          if (useMultiplePolynomials) {
            polynomial = polynomialGenerator.next();
            updateWheels(polynomial, offset);
          } else {
            for (let j = 0; j < wheels.length; j += 1) {
              const w = wheels[j];
              const step = w.step;
              let r1 = (+wheelRoots[j] - baseOffsets[j] - offset) % step;
              r1 += (r1 < 0 ? step : 0);
              let r2 = (-(+wheelRoots[j]) - baseOffsets[j] - offset) % step;
              r2 += (r2 < 0 ? step : 0)
              w.proot = Math.min(r1, r2);
              w.proot2 = Math.max(r1, r2);
            }
          }

          smoothEntries.length = 0;
          smoothEntries2.length = 0;

          for (let segmentStart = 0; segmentStart < sieveSize; segmentStart += segmentSize) {
            updateSieveSegment(segmentStart);
            findSmoothEntries(offset + segmentStart, polynomial);
          }
          
        }


          //Note: separate loop over "smooth entries" is better for performance, seems
          for (let i = i1 + 1; i < smoothEntries.length; i += 1) {
            const x = smoothEntries[i];
            const value = +smoothEntries2[i];
            const threshold = +polynomial.log2AbsY(x);
            if (threshold - value < 1) {
              const X = polynomial.X(x);
              const Y = polynomial.Y(x, 1n, primes);
              if (Y != null) {
                i1 = i;
                return {value: new CongruenceOfsquareOfXminusYmoduloN(X, Y, N), done: false};
              } else {
                console.count('?');
                //console.log(threshold, value, checkFactorization(x - offset));
              }
            } else {
              if (threshold - value < twoB) {
                const p = Math.round(exp2(threshold - value));
                const c = lpStrategy(p, polynomial, x);
                if (c != null) {
                  i1 = i;
                  QuadraticSieveFactorization.lpCounter += 1;
                  return {value: c, done: false};
                }
              }
            }
          }
        i1 = sieveSize;
      }
      return {value: undefined, done: true};
    }
  };
  iterator[globalThis.Symbol.iterator] = function () {
    return this;
  };
  return iterator;
}

function gcd(a, b) {
  while (b !== 0n) {
    const r = BigInt(a) % BigInt(b);
    a = b;
    b = r;
  }
  return a;
}

function abs(x) {
  return x < 0n ? -x : x;
}

function indexOf(sortedArray, x) {
  if (typeof x !== 'number') {
    throw new TypeError();
  }
  let min = 0;
  let max = sortedArray.length - 1;
  while (min < max) {
    const mid = Math.ceil((min + max) / 2);
    if (+sortedArray[mid] > x) {
      max = mid - 1;
    } else {
      min = mid;
    }
  }
  if (+sortedArray[min] === x) {
    return min;
  }
  return -1;
}

function flat(array) {
  const result = [];
  for (let i = 0; i < array.length; i += 1) {
    const sub = array[i];
    for (let j = 0; j < sub.length; j += 1) {
      result.push(sub[j]);
    }
  }
  return result;
}

function squareRootOfPrimesProduct(primes) {
  if (primes.length === 1 && primes[0] === 0) {
    return primes;
  }
  // we cannot just compute product as it is larger 2**(2**20) (max BigInt in Firefox)
  const array = primes.slice(0);
  array.sort((a, b) => +a - +b);
  for (let i = 0; i < array.length; i += 2) {
    if (i + 1 >= array.length || +array[i] !== +array[i + 1]) {
      throw new RangeError();
    }
    array[i] = Math.abs(array[i]);
    array[i + 1] = 1;
  }
  return array;
}

function QuadraticSieveFactorization(N) { // N - is not a prime
  N = BigInt(N);
  for (let k = 1n;; k += 1n) {
    const kN = k * N;
    // https://trizenx.blogspot.com/2018/10/continued-fraction-factorization-method.html#:~:text=optimal%20value :
    const B = Math.max(Math.min(Math.floor(Math.sqrt(L(kN) / 9)), (1 << 25) - 1), 320);
    const primeBase = primes(B).filter(p => isQuadraticResidueModuloPrime(kN, p));
    for (let i = 0; i < primeBase.length; i += 1) {
      if (Number(N % BigInt(primeBase[i])) === 0) {
        return BigInt(primeBase[i]);
      }
    }
    const congruences = congruencesUsingQuadraticSieve(primeBase, kN); // congruences X_k^2 = Y_k mod N, where Y_k is smooth over the prime base
    const solutions = solve(1 + primeBase.length); // find products of Y_k = Y, so that Y is a perfect square
    solutions.next();
    let c = null;
    const start = Date.now();
    let congruencesFound = 0;
    let last = start;
    while ((c = congruences.next().value) != undefined) {
      const t = function () {
        throw new TypeError(N);
      };
      const solution = c.Y.length === 1 && c.Y[0] === 0 ? [c] : solutions.next([c.Y.map(p => (p === -1 ? 0 : 1 + indexOf(primeBase, p) || t())), c]).value;
      if (true) {
        congruencesFound += 1;
        const now = +Date.now();
        if (now - last > 5000 || solution != null) {
          console.debug('congruences found: ', congruencesFound, '/', primeBase.length,
                        'expected time: ', Math.round((now - start) / congruencesFound * primeBase.length),
                        'large prime congruences: ', QuadraticSieveFactorization.lpCounter,
                        'polynomials used: ', QuadraticSieveFactorization.polynomialsCounter);
          last = now;
        }
      }
      if (solution != null) {
        const x = productModM(solution.map(c => c.X), N);
        const Y = flat(solution.map(c => c.Y)); // Y mod N === X^2 mod N
        const y = productModM(squareRootOfPrimesProduct(Y, N), N);
        const g = BigInt(gcd(abs(x + y), N));
        if (g !== 1n && g !== N) {
          return g;
        }
      }
    }
  }
}

QuadraticSieveFactorization.testables = {
  congruencesUsingQuadraticSieve: congruencesUsingQuadraticSieve,
  squareRootModuloOddPrime: squareRootModuloOddPrime,
  isQuadraticResidueModuloPrime: isQuadraticResidueModuloPrime,
  solve: solve,
  QuadraticPolynomial: QuadraticPolynomial,
  thresholdApproximationInterval: thresholdApproximationInterval
};

export default QuadraticSieveFactorization;

// see also https://github.com/danaj/Math-Prime-Util-GMP
