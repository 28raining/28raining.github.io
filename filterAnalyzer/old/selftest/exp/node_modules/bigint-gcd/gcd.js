/*jshint esversion:11*/

const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);

//TODO: https://en.wikipedia.org/wiki/Euclidean_algorithm#Method_of_least_absolute_remainders
function numbersGCD(a, b) {
  while (b > 0) {
    const q = Math.floor(a / b);
    const r = a - q * b;
    a = b;
    b = r;
  }
  return a;
}

// https://webassembly.studio
let i64gcd = null;
const url = 'data:application/wasm;base64,AGFzbQEAAAABBwFgAn5+AX4DAgEABQMBAAAHEAIDZ2NkAAAGbWVtb3J5AgAKJAEiAQF+A0AgAUIAUgRAIAAgAYIhAiABIQAgAiEBDAELCyAACw';
if (typeof WebAssembly !== "undefined" && WebAssembly.instantiateStreaming != null) {
  WebAssembly.instantiateStreaming(fetch(url)).then(function (result) {
    const f = result.instance.exports.gcd;
    // https://github.com/GoogleChromeLabs/wasm-feature-detect/blob/master/src/detectors/big-int/index.js
    try {
      if (f(0n, 0n) === 0n) {
        i64gcd = f;
      }
    } catch (error) {
      console.error(error);
    }
  });
}

function EuclidsGCD(a, b) {
  while (b > MAX_SAFE_INTEGER) {
    const r = a % b;
    a = b;
    b = r;
  }
  if (b > 0n) {
    if (a > MAX_SAFE_INTEGER) {
      const r = a % b;
      a = b;
      b = r;
    }
    return BigInt(numbersGCD(Number(a), Number(b)));
  }
  return a;
}

// https://github.com/tc39/proposal-bigint/issues/205
// https://github.com/tc39/ecma262/issues/1729
// floor(log2(a)) + 1 if a > 0
function bitLength(a) {
  const s = a.toString(16);
  const c = s.charCodeAt(0) - 0 - '0'.charCodeAt(0);
  if (c <= 0) {
    throw new RangeError();
  }
  return (s.length - 1) * 4 + (32 - Math.clz32(Math.min(c, 8)));
}

// 1 + floor(log2(x))
function log2(x) {
  let e = 0;
  while (x > (1 << 30)) {
    x = Math.floor(x / (1 << 30));
    e += 30;
  }
  e += (32 - Math.clz32(x));
  return e;
}

const LOG2MAX = Math.floor(Math.log2(Number.MAX_SAFE_INTEGER + 1));
let DIGITSIZE = LOG2MAX;
let DIGITSIZE_BIG = BigInt(DIGITSIZE);

let wasmHelper = null;

const url2 = 'data:application/wasm;base64,AGFzbQEAAAABDQFgBX5+fn5+BH5+fn4DAgEABwoBBmhlbHBlcgAACpMDAZADBQR+AX8GfgF/BX5CASEFQgAhBkIAIQdCASEIQQQhCQNAIAUhDCAGIQ0gByEOIAghDyACIQsgACECA0AgAiEAIAshAiAMIQUgDSEGIA4hByAPIQggACACfyEKIAAgAoEhCyAHIQwgCCENIAUgCiAHfn0hDiAGIAogCH59IQ9CACAHfSAHIAdCAFMbeSAKeXxCwgBZQgAgCH0gCCAIQgBTG3kgCnl8QsIAWXFCACALIA58VyALIA58IAIgB3xTcUIAIAsgD3xXIAsgD3wgAiAIfFNxcXEhECAQQQBHDQALIAAgBSAGIAUgBlUbfHkhESACIAcgCCAHIAhVG3x5IRIgESASIBEgElMbIRMgE0IBfSETIBNCACATQgBVGyETIAQgEyATIARVGyETIAQgE30hBCABIASHIRQgAyAEhyEVIAEgFCAEhn0hASADIBUgBIZ9IQMgBSAUfiAGIBV+fCAAIBOGfCEAIAcgFH4gCCAVfnwgAiAThnwhAiAJQQFrIQkgCUEARw0ACyAFIAYgByAICwCGAQRuYW1lAn8BABYAAXgBA3hsbwIBeQMDeWxvBAZsb2JpdHMFAUEGAUIHAUMIAUQJAWkKAXELAnkxDAJBMQ0CQjEOAkMxDwJEMRAMc2FtZVF1b3RpZW50EQ14UGx1c01heEFCY2x6Eg15UGx1c01heENEY2x6EwRiaXRzFAR4bG8xFQR5bG8x';
if (typeof WebAssembly !== "undefined" && WebAssembly.instantiateStreaming != null) {
  WebAssembly.instantiateStreaming(fetch(url2)).then(function (result) {
    const f = result.instance.exports.helper;
    // https://github.com/GoogleChromeLabs/wasm-feature-detect/blob/master/src/detectors/big-int/index.js
    try {
      const [A, B, C, D] = f(1n, 0n, 1n, 0n, 0n);
      if (A === 1n && B === 0n && C === 0n && D === 1n) {
        wasmHelper = f;
        DIGITSIZE = 63;
        DIGITSIZE_BIG = 63n;
      }
    } catch (error) {
      console.error(error);
    }
  });
}

let previousValue = -1;
// some terrible optimization as bitLength is slow
function bitLength2(a) {
  if (previousValue === -1) {
    previousValue = bitLength(a);
    return previousValue;
  }
  if (previousValue <= 1024) {
    let n = Number(BigInt(a));
    let x = Math.log2(n) + 1024 * 4 - 1024 * 4;
    let y = Math.ceil(x);
    if (x !== y) {
      previousValue = y;
      return y;
    }
  }
  let n = Number(a >> BigInt(previousValue - DIGITSIZE));
  if (n < 1 || n >= (Number.MAX_SAFE_INTEGER + 1)) {
    previousValue = -1;
    return bitLength2(a);
  }
  previousValue = previousValue - DIGITSIZE + log2(n);
  return previousValue;
}

// 2**n
function exp2(n) {
  if (n < 0) {
    throw new RangeError();
  }
  let result = 1;
  while (n > 30) {
    n -= 30;
    result *= (1 << 30);
  }
  result *= (1 << n);
  return result;
}

const doubleDigitMethod = true;

function helper(X, Y) {
  const x = doubleDigitMethod ? X >> DIGITSIZE_BIG : X;
  const xlo = doubleDigitMethod ? BigInt.asUintN(DIGITSIZE, X) : 0n;
  const y = doubleDigitMethod ? Y >> DIGITSIZE_BIG : Y;
  const ylo = doubleDigitMethod ? BigInt.asUintN(DIGITSIZE, Y) : 0n;
  if (wasmHelper != null) {
    if (y === 0n) {
      return [1n, 0n, 0n, 1n];
    }
    return wasmHelper(x, xlo, y, ylo, DIGITSIZE_BIG);
  }
  return jsHelper(Number(x), Number(xlo), Number(y), Number(ylo));
}

function jsHelper(x, xlo, y, ylo) {

  // computes the transformation matrix, which is the product of all {{0, 1}, {1, -q}} matrices,
  // where q is the quotient produced by Euclid's algorithm for any pair of integers (a, b),
  // where a within [X << m; ((X + 1) << m) - 1] and b within [Y << m; ((Y + 1) << m) - 1]

  // 2x2-matrix transformation matrix of (x_initial, y_initial) into (x, y):
  let A = 1;
  let B = 0;
  let C = 0;
  let D = 1;

  let lobits = LOG2MAX;
  for (let i = doubleDigitMethod ? 3 : 0; i >= 0; i -= 1) {

    let sameQuotient = y !== 0;
    while (sameQuotient) {
      //console.assert(y > 0);
      const q = Math.floor(+x / y);
      const y1 = x - q * y;
      // Multiply matrix augmented by column (x, y) by {{0, 1}, {1, -q}} from the right:
      const A1 = C;
      const B1 = D;
      const C1 = A - q * C;
      const D1 = B - q * D;
      // The quotient for a point (x_initial + alpha, y_initial + beta), where 0 <= alpha < 1 and 0 <= beta < 1:
      // floor((x + A * alpha + B * beta) / (y + C * alpha + D * beta))
      // As the sign(A) === -sign(B) === -sign(C) === sign(D) (ignoring zero entries) the maximum and minimum values are floor((x + A) / (y + C)) and floor((x + B) / (y + D))

      // floor((x + A) / (y + C)) === q  <=>  0 <= (x + A) - q * (y + C) < (y + C)  <=>  0 <= y1 + C1 < y + C
      // floor((x + B) / (y + D)) === q  <=>  0 <= (x + B) - q * (y + D) < (y + D)  <=>  0 <= y1 + D1 < y + D
      sameQuotient = 0 <= y1 + C1 && y1 + C1 < y + C &&
                     0 <= y1 + D1 && y1 + D1 < y + D;
      if (sameQuotient) {
        x = y;
        y = y1;
        A = A1;
        B = B1;
        C = C1;
        D = D1;
        //gcd.debug(q);
      }
    }

    if (i >= 1) {
      const bits = Math.min(Math.max(LOG2MAX - 0 - log2(Math.max(x + Math.max(A, B), y + Math.max(C, D))), 0), lobits);
      const d = exp2(lobits - bits);
      const xlo1 = Math.floor(xlo / d);
      const ylo1 = Math.floor(ylo / d);
      xlo -= xlo1 * d;
      ylo -= ylo1 * d;
      lobits -= bits;
      const p = exp2(bits);
      x = A * xlo1 + B * ylo1 + x * p;
      y = C * xlo1 + D * ylo1 + y * p;
    }

  }
  return [BigInt(A), BigInt(B), BigInt(C), BigInt(D)];
}

const SUBQUADRATIC_HALFGCD_THRESHOLD = 4096;

function matrixMultiply(A1, B1, C1, D1, A, B, C, D) {
  return [A1 * A + B1 * C, A1 * B + B1 * D,
          C1 * A + D1 * C, C1 * B + D1 * D];
}

function halfgcd(a, b, small) {
  //console.assert(a >= b && b >= 0n);

  // the function calculates the transformation matrix for numbers (x, y), where a <= x < a + 1 and b <= y < b + 1
  // seems, this definition is not the same as in https://mathworld.wolfram.com/Half-GCD.html

  // floor((a + 1) / b) < q = floor(a / b) < floor(a / (b + 1))
  // ([A, B], [C, D]) * (a + x, b + y) = (A*(a+x)+B*(b+y), C*(a+x)+D*(b+y)) = (A*a+B*b, C*a+D*b) + (A*x+B*y, C*x+D*y)
  //Note: for debugging it is useful to compare quotients in simple Euclidean algorithms vs quotients here

  if (small) {
    const [A, B, C, D] = helper(a, b);
    return [A, B, C, D, 0n, 0n];
  }
  const size = bitLength(a);
  const isSmall = size <= SUBQUADRATIC_HALFGCD_THRESHOLD;
  let [A, B, C, D] = [1n, 0n, 0n, 1n]; // 2x2 matrix
  let step = 0;
  while (true) { // Q(T, a + 1n, b) === Q(T, a, b + 1n)
    step += 1;

    //console.assert(A * D >= 0 && B * C >= 0 && A * B <= 0 && D * C <= 0);//TODO: why - ?

    // A*(X+Y) = A*X+A*Y
    //const [a1, b1] = [a + A, b + C]; // T * (a_initial + 1n, b_initial);
    //const [a2, b2] = [a + B, b + D]; // T * (a_initial, b_initial + 1n);
    const n = step === 1 ? size : (isSmall ? bitLength2(a) : bitLength(a));
    //if (!isSmall && n <= size * (2 / 3)) { // TODO: ?, the constant is based on some testing with some example
    //  return [A, B, C, D, a, b];
    //}
    const m = BigInt(isSmall ? Math.max(0, n - DIGITSIZE * (doubleDigitMethod ? 2 : 1)) : n - Math.floor(size / 2));
    if (step !== 1/* && m1 < size / 2*/) {//?
      if (((a + A) >> m) !== ((a + B) >> m) ||
          ((b + C) >> m) !== ((b + D) >> m)) {
        return [A, B, C, D, a, b];
      }
    }
    const [M0, M1, M2, M3, transformedAhi, transformedBhi] = halfgcd(a >> m, b >> m, isSmall);
    const A1 = BigInt(M0);
    const B1 = BigInt(M1);
    const C1 = BigInt(M2);
    const D1 = BigInt(M3);
    if (step === 1) {
      [A, B, C, D] = [A1, B1, C1, D1];
    } else {
      // T = T1 * T:
      const [M4, M5, M6, M7] = matrixMultiply(A1, B1, C1, D1, A, B, C, D);
      A = BigInt(M4);
      B = BigInt(M5);
      C = BigInt(M6);
      D = BigInt(M7);
    }
    if (isSmall) {
      [a, b] = [A1 * a + B1 * b, C1 * a + D1 * b]; // T1 * (a, b)
    } else {
      const alo = BigInt.asUintN(Number(m), a);
      const blo = BigInt.asUintN(Number(m), b);
      [a, b] = [(A1 * alo + B1 * blo) + (transformedAhi << m), (C1 * alo + D1 * blo) + (transformedBhi << m)]; // T * (alo, blo) + T * (ahi, bhi) * 2**m
    }
    console.assert(a > 0n && b >= 0n);
    if (B1 === 0n) {
      console.assert(A1 === 1n && B1 === 0n && C1 === 0n && D1 === 1n);
      if (b !== 0n) {//TODO: ?
        const q = BigInt(a) / b;
        const C2 = A - q * C, D2 = B - q * D, b1 = a - q * b;
        const sameQuotient = b1 + C2 >= 0n && b1 + C2 < b + C &&
                             b1 + D2 >= 0n && b1 + D2 < b + D;
        if (!sameQuotient) {
          return [A, B, C, D, a, b];
        }
        [A, B, C, D] = [C, D, C2, D2]; // {{0, 1}, {1, -q}} * T
        [a, b] = [b, b1]; // {{0, 1}, {1, -q}} * (a, b)
        //gcd.debug(q);
      } else {
        return [A, B, C, D, a, b];
      }
    }
  }
  // see "2. General structure of subquadratic gcd algorithms" in “On Schönhage’s algorithm and subquadratic integer GCD computation” by Möller
  return [A, B, C, D, a, b]; // for performance transformedA and transformedB are returned
}

const SUBQUADRATIC_GCD_THRESHOLD = (32 * 1024);
const LEHMERS_ALGORITHM_THRESHOLD = BigInt(2**68);

// https://en.wikipedia.org/wiki/Lehmer%27s_GCD_algorithm
// https://www.imsc.res.in/~kapil/crypto/notes/node11.html
// this implementation is good after ~80 bits (?)
function LehmersGCD(a, b) {
  if (a < b) {
    const tmp = a;
    a = b;
    b = tmp;
  }

  // Subquadratic Lehmer's algorithm:
  while (BigInt.asUintN(SUBQUADRATIC_GCD_THRESHOLD, b) < b) {
    //console.assert(a >= b);
    const n = bitLength(a);
    const m = BigInt(Math.floor(n / 2));
    const [A1, B1, C1, D1, transformedAhi, transformedBhi] = halfgcd(a >> m, b >> m, false);
    if (B1 === 0n) {
      //console.assert(A1 === 1n && B1 === 0n && C1 === 0n && D1 === 1n);
      //gcd.debug(a / b);
      [a, b] = [b, a % b];
    } else {
      const alo = BigInt.asUintN(Number(m), a);
      const blo = BigInt.asUintN(Number(m), b);
      [a, b] = [(A1 * alo + B1 * blo) + (transformedAhi << m), (C1 * alo + D1 * blo) + (transformedBhi << m)]; // T * (alo, blo) + T * (ahi, bhi) * 2**m
      if (a < 0n || b < 0n) {
        throw new TypeError("assertion");
      }
    }
  }

  // Lehmer's algorithm:
  while (b >= LEHMERS_ALGORITHM_THRESHOLD) {
    //console.assert(a >= b);
    const n = bitLength2(a);
    const m = BigInt(Math.max(0, n - DIGITSIZE * (doubleDigitMethod ? 2 : 1)));
    const [A1, B1, C1, D1] = helper(a >> m, b >> m);
    if (B1 === 0n) {
      //console.assert(A1 === 1n && B1 === 0n && C1 === 0n && D1 === 1n);
      //gcd.debug(a / b);
      [a, b] = [b, a % b];
    } else {
      [a, b] = [A1 * a + B1 * b, C1 * a + D1 * b]; // T * (a, b)
      if (a < 0n || b < 0n) {
        throw new TypeError("assertion");
      }
    }
  }

  return EuclidsGCD(a, b);
}


function abs(a) {
  return a < 0n ? -a : a;
}

function numberCTZ(a) {
  return 32 - (Math.clz32(a & -a) + 1);
}
function ctz(a) {
  const test = BigInt.asUintN(32, a);
  if (test !== 0n) {
    return numberCTZ(Number(test));
  }
  let k = 32;
  while (BigInt.asUintN(k, a) === 0n) {
    k *= 2;
  }
  let n = 0;
  for (let i = Math.floor(k / 2); i >= 32; i = Math.floor(i / 2)) {
    if (BigInt.asUintN(i, a) === 0n) {
      n += i;
      a >>= BigInt(i);
    } else {
      a = BigInt.asUintN(i, a);
    }
  }
  n += numberCTZ(Number(BigInt(BigInt.asUintN(32, a))));
  return n;
}

function bigIntGCD(a, b) {
  const A = abs(BigInt(a));
  const B = abs(BigInt(b));
  const na = Number(A);
  const nb = Number(B);
  if (Math.max(na, nb) <= Number.MAX_SAFE_INTEGER) {
    return BigInt(numbersGCD(na, nb));
  }
  const abmin = Math.min(na, nb);
  if (abmin <= Number.MAX_SAFE_INTEGER) {
    if (abmin === 0) {
      return A + B;
    }
    if (abmin === 1) {
      return 1n;
    }
    return BigInt(numbersGCD(abmin, Math.abs(Number(na < nb ? B % A : A % B))));
  }
  if (i64gcd != null && Math.max(na, nb) < 2**64) {
    return BigInt.asUintN(64, i64gcd(A, B));
  }
  if (abmin > (Number.MAX_SAFE_INTEGER + 1) * (1 << 11)) {
    const c1 = ctz(A);
    const c2 = ctz(B);
    if (c1 + c2 >= 4) {
      const g = LehmersGCD(c1 === 0 ? A : A >> BigInt(c1), c2 === 0 ? B : B >> BigInt(c2));
      const c = Math.min(c1, c2);
      return c === 0 ? g : (BigInt(g) << BigInt(c));
    }
  }
  return LehmersGCD(A, B);
}

export default bigIntGCD;
