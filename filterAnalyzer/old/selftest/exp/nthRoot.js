
// floor(S**(1/n)), S >= 1, n >= 2
// https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method
// https://stackoverflow.com/a/15979957/839199y
function nthRoot(S, n) {
  if (typeof S !== 'bigint' || typeof n !== 'number' || Math.floor(n) !== n || n < 1 || n > Number.MAX_SAFE_INTEGER) {
    throw new RangeError();
  }
  if (n === 1) {
    return S;
  }
  const s = Number(S + 0n);
  if (s === 0) {
    return 0n;
  }
  if (s < 0) {
    if (n % 2 === 0) {
      throw new RangeError();
    }
    return -BigInt(nthRoot(-S, n));
  }
  const B = Number.MAX_SAFE_INTEGER + 1;
  const E = Math.floor(B / (n === 2 ? 2 : Math.pow(2, 1 + Math.ceil(Math.log2(Math.log2(B))))));
  if (s < E) {
    //var test = function (n, f) { var i = 1; while (f(i**n - 1) === i - 1 && f(i**n) === i) { i += 1; } var a = i**n; while (f(a - 1) === i) { a -= 2**25; } console.log(n, Math.log2(a), a); };
    //test(2, a => Math.floor(Math.sqrt(a + 0.5)));
    //for (var n = 3; n <= 53; n++) { test(n, a => Math.floor(Math.exp(Math.log(a + 0.5) / n))); }
    const g = n === 2 ? Math.floor(Math.sqrt(s + 0.5)) : Math.floor(Math.exp(Math.log(s + 0.5) / n));
    return BigInt(g);
  }
  const g = (n === 2 ? Math.sqrt(s) : Math.exp(Math.log(s) / n));
  if (g < E) {
    if (Math.floor(g - g / E) === Math.floor(g + g / E)) {
      return BigInt(Math.floor(g));
    }
    const y = BigInt(Math.floor(g + 0.5));
    return S < y**BigInt(n) ? y - 1n : y;
  }
  const size = S.toString(16).length * 4; // TODO: bitLength(S)
  if (size <= n) {
    return 1n;
  }
  const half = Math.floor((Math.floor(size / n) + 1) / 2);
  let x = (BigInt(nthRoot(S >> BigInt(half * n), n)) + 1n) << BigInt(half);
  let xprev = -1n;
  do {
    xprev = x;
    if (n === 2) {
      x = (x + S / x) >> 1n;
    } else {
      x = (BigInt(n - 1) * x + S / x**BigInt(n - 1)) / BigInt(n);
    }
  } while (x < xprev);
  return xprev;
}

export default nthRoot;
