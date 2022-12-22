
function log2(x) {
  return BigInt(x.toString(16).length * 4);
}

function modPow(base, exponent, modulus) {
  let accumulator = 1n;
  while (exponent !== 0n) {
    if (BigInt.asUintN(1, exponent) === 1n) {
      exponent -= 1n;
      accumulator = (accumulator * base) % modulus;
    }
    exponent >>= 1n;
    base = (base * base) % modulus;
  }
  return accumulator;
}

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

function range(start, end) {
  var a = [];
  for (let i = start; i <= end; i += 1) {
    a.push(i);
  }
  return a;
}

function isPrime(n) {
  if (typeof n !== "bigint") {
    throw new RangeError();
  }
  if (n < 2n) {
    throw new RangeError();
  }

  const s = Number(n % 30n);
  if (s % 2 === 0) {
    return n === 2n;
  }
  if (s % 3 === 0) {
    return n === 3n;
  }
  if (s % 5 === 0) {
    return n === 5n;
  }
  const wheel3 = [0, 4, 6, 10, 12, 16, 22, 24, 24];
  const N = FastModBigInt(n);
  for (let i = 7, max = Math.min(1024, Math.floor(Math.sqrt(Number(n)))); i <= max; i += 30) {
    for (let j = 0; j < wheel3.length; j += 1) {
      const p = i + wheel3[j];
      if (FastMod(N, p) === 0) {
        return false;
      }
    }
  }
  if (Number(n) < 1024 * 1024) {
    return true;
  }

  // https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test#Deterministic_variants
  let r = 0;
  let d = n - 1n;
  while (d % 2n === 0n) {
    d /= 2n;
    r += 1;
  }
  // https://en.wikipedia.org/wiki/Miller–Rabin_primality_test#Testing_against_small_sets_of_bases
  const values = [10, 20, 24, 31, 40, 41, 48, 48, 61, 61, 61, 78, 81];
  const primes = [2, 3, 5, 7, 11, 13, 17, 17, 19, 19, 19, 23, 29];
  let i = 0;
  const x = Math.ceil(Math.log2(Number(n)));
  while (x > values[i] && i < values.length) {
    i += 1;
  }
  let bases = null;
  if (i < values.length) {
    bases = primes.slice(0, i + 1);
  } else {
    // https://primes.utm.edu/prove/prove2_3.html
    const lnN = Number(log2(n)) * Math.log(2);
    bases = range(2, Math.floor(1 / Math.log(2) * lnN * Math.log(lnN)));
  }
  for (const a of bases) {
    let x = modPow(BigInt(a), d, n);
    if (x !== 1n) {
      for (let i = r - 1; i > 0 && x !== n - 1n; i -= 1) {
        x = (x * x) % n;
      }
      if (x !== n - 1n) {
        return false;
      }
    }
  }
  return true;
}

export default isPrime;