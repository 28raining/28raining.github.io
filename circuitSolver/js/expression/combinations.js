
// https://lowrey.me/es6-javascript-combination-generator/
// https://www.npmjs.com/package/combinations-generator

function combinations (elements, k) {
  const n = elements.length;
  let indexes = new Array(k + 1).fill(-1);
  let result = new Array(k).fill(undefined);
  let depth = 0;
  let iterator = {
    next: function () {
      while (depth >= 0) {
        if (depth < k) {
          const i = indexes[depth];
          if (i < n - k + depth) {
            indexes[depth] = i + 1;
            result[depth] = elements[i + 1];
            depth += 1;
            indexes[depth] = i + 1;
          } else {
            depth -= 1;
          }
        } else {
          depth -= 1;
          return {value: result.slice(0), done: false};
        }
      }
      return {value: undefined, done: true};
    }
  };
  iterator[globalThis.Symbol.iterator] = function () {
    return this;
  };
  return iterator;
}

export default combinations;
