/*jslint plusplus: true, vars: true, indent: 2 */

//(function (exports) {
  //"use strict";

  function Heap(compareTo) {
    this.data = [];
    this.compareTo = compareTo;
  }

  Heap.prototype.push = function (value) {
    var data = this.data;
    var compareTo = this.compareTo;
    data.push(value);
    // bubbleUp(size - 1)
    var size = data.length;
    var j = size - 1;
    var tmp = data[j];
    var parent = -1;
    while (j > 0 && compareTo(tmp, data[parent = Math.floor((j - 1) / 2)]) < 0) {
      data[j] = data[parent];
      j = parent;
    }
    data[j] = tmp;
  };
  
  Heap.prototype.pop = function () {
    var data = this.data;
    var compareTo = this.compareTo;
    var size = data.length;
    if (size === 0) {
      return undefined;
    }
    if (size === 1) {
      return data.pop();
    }
    var value = data[0];
    data[0] = data.pop();
    --size;
    // bubbleDown(0)
    var j = 0;
    if (j < size) {
      var tmp = data[j];
      do {
        var child = size;
        var t = tmp;
        var c = j * 2;
        if (++c < size && compareTo(data[c], t) < 0) {
          child = c;
          t = data[child];
        }
        if (++c < size && compareTo(data[c], t) < 0) {
          child = c;
          t = data[child];
        }
        data[j] = t;
        j = child;
      } while (j < size);
    }
    return value;
  };

  Heap.prototype.peek = function () {
    var data = this.data;
    return data.length > 0 ? data[0] : undefined;
  };

  Heap.prototype.size = function () {
    var data = this.data;
    return data.length;
  };

  Heap.prototype.replace = function (newItem) {
    this.data.push(newItem);
    return this.pop();
  };

  //exports.Heap = Heap;

//}(this));
export default Heap;
