
// Example:
// let N = NewtonInterpolation();
// N.next();
// console.log(N.next([1,1]).value); // y = 1
// console.log(N.next([2,4]).value); // y = 3x - 2
// console.log(N.next([3,9]).value); // y = x^2

const DefaultYField = {
  ONE: 1,
  sub: function (a, b) { return a - b; },
  mul: function (a, b) { return a * b; },
  div: function (a, b) { return a / b; },
  scale: function (a, s) { return a * Number(s); }
};

let yField = DefaultYField;

// An iterator which returns an updated Newton interpolation polynomial
// Polynomial is returned as an array of coefficients
function NewtonInterpolation() {
  let coefficients = function () {
    let x = [];
    let diagonal = []; // [y_k], [y_(k-1), y_k], ..., [y_0, y_1, ..., y_k]
    let equidistantly = true;
    let hInKTimeskFactorial = yField.ONE; // h**k * k!
    let c = yField.ONE;
    let firstTime = true;
    const iterator = {
      next: function (point) {
        while (true) {
          if (firstTime) {
            firstTime = false;
            return {value: c, done: false};
          }
          const [xi, yi] = point;
          if (equidistantly && x.length >= 2 && x[x.length - 1] - x[x.length - 2] !== xi - x[x.length - 1]) {
            // https://en.wikipedia.org/wiki/Divided_differences#:~:text=The%20relationship%20between%20divided%20differences%20and%20forward%20differences%20is[4]
            const h = x[x.length - 1] - x[x.length - 2];
            hInKTimeskFactorial = yField.ONE;
            for (let k = 1; k < diagonal.length; k += 1) {
              hInKTimeskFactorial = yField.scale(hInKTimeskFactorial, h * k);
              diagonal[k] = yField.div(diagonal[k], hInKTimeskFactorial);
            }
            equidistantly = false;
          }
          let value = yi;
          for (let i = 0; i < diagonal.length; i += 1) {
            // https://en.wikipedia.org/wiki/Divided_differences#Example
            let difference = yField.sub(value, diagonal[i]);
            if (!equidistantly) {
              difference = yField.div(difference, yField.scale(yField.ONE, xi - x[x.length - 1 - i]));
            }
            diagonal[i] = value;
            value = difference;
          }
          diagonal.push(value);
          x.push(xi);
          c = diagonal[diagonal.length - 1];
          if (equidistantly && x.length >= 2) {
            const k = diagonal.length - 1;
            const h = x[x.length - 1] - x[x.length - 2];
            hInKTimeskFactorial = yField.scale(hInKTimeskFactorial, h * k);
            c = yField.div(c, hInKTimeskFactorial);
          }
          return {value: c, done: false};
        }
      }
    };
    iterator[globalThis.Symbol.iterator] = function () {
      return this;
    };
    return iterator;
  };
  const yZERO = yField.sub(yField.ONE, yField.ONE);
  const yONE = yField.ONE;
  let a = coefficients();
  a.next();
  // https://en.wikipedia.org/wiki/Newton_polynomial#Definition
  let basisPolynomial = [yONE]; // n_j(x)
  let N = [];
  let firstTime = true;
  const iterator = {
    next: function (point) {
      while (true) {
        if (firstTime) {
          firstTime = false;
          return {value: N, done: false};
        }
        const [xi, yi] = point;
        const c = yField.sub(yZERO, a.next([xi, yi]).value);
        // N = N + c * basisPolynomial
        N.push(yZERO);
        for (let i = basisPolynomial.length - 1; i >= 0; i -= 1) {
          N[i] = yField.sub(N[i], yField.mul(basisPolynomial[i], c));
        }
        //console.log(N.join(" "));
        // basisPolynomial = basisPolynomial * (x - xi)
        basisPolynomial.push(yZERO);
        for (let i = basisPolynomial.length - 1; i >= 0; i -= 1) {
          basisPolynomial[i] = yField.sub(i >= 1 ? basisPolynomial[i - 1] : yZERO, yField.scale(basisPolynomial[i], xi));
        }
        return {value: N, done: false};
      }
    }
  };
  iterator[globalThis.Symbol.iterator] = function () {
    return this;
  };
  return iterator;
}

NewtonInterpolation.setField = function (newYField) {
  yField = newYField || DefaultYField;
};

globalThis.NewtonInterpolation = NewtonInterpolation;
export default NewtonInterpolation;
