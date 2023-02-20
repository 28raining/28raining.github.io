/*jslint plusplus: true, vars: true, indent: 2 */

  import Expression from './Expression.js';

  //    API same as http://sylvester.jcoglan.com/api/matrix.html
  //    new Matrix([
  //      [1, 2, 3],
  //      [5, 6, 7],
  //      [7, 8,-1]
  //    ]);

  function Matrix(data) {
    this.a = data;
  }

  Matrix.Zero = function (rows, cols) {
    var row = new Array(cols);
    for (var j = 0; j < cols; j += 1) {
      row[j] = Expression.ZERO;
    }
    var a = new Array(rows);
    for (var i = 0; i < rows; i += 1) {
      a[i] = row;
    }
    return new Matrix(a);
  };

  // identity n x n;
  Matrix.I = function (n) {
    return Matrix.Zero(n, n).map(function (element, i, j) {
      return (i === j ? Expression.ONE : Expression.ZERO);
    });
  };

  //Matrix.Diagonal = function (elements) {
  //  var n = elements.length;
  //  return Matrix.Zero(n, n).map(function (element, i, j) {
  //    return i === j ? elements[i] : Expression.ZERO;
  //  });
  //};

  Matrix.prototype.rows = function () {
    return this.a.length;
  };

  Matrix.prototype.cols = function () {
    return this.a.length > 0 ? this.a[0].length : 0;
  };

  Matrix.prototype.e = function (i, j) {
    return this.a[i][j];
  };

  Matrix.prototype.isSquare = function () {
    return this.rows() > 0 && this.rows() === this.cols();//?
  };

  Matrix.prototype.map = function (callback) {
    var rows = this.rows();
    var cols = this.cols();
    var c = new Array(rows);
    var i = -1;
    while (++i < rows) {
      var x = new Array(cols);
      var j = -1;
      while (++j < cols) {
        var e = callback.call(undefined, this.e(i, j), i, j, this);
        x[j] = e.simplifyExpression();//?
      }
      c[i] = x;
    }
    return new Matrix(c);
  };

  Matrix.prototype.transpose = function () {
    var that = this;
    return Matrix.Zero(that.cols(), that.rows()).map(function (element, i, j) {
      return that.e(j, i);
    });
  };

  Matrix.prototype.scale = function (k) {
    return this.map(function (element, i, j) {
      return element.multiply(k);
    });
  };

  Matrix.prototype.multiply = function (b) {
    var a = this;
    if (a.cols() !== b.rows()) {
      throw new RangeError("DimensionMismatchException");
    }
    return Matrix.Zero(a.rows(), b.cols()).map(function (element, i, j) {
      var rows = b.rows();
      var k = -1;
      while (++k < rows) {
        //! this code is used to show not simplified expressions
        var current = a.e(i, k).multiply(b.e(k, j));
        element = k === 0 ? current : element.add(current);
      }
      return element;
    });
  };

  Matrix.prototype.add = function (b) {
    var a = this;
    if (a.rows() !== b.rows() || a.cols() !== b.cols()) {
      throw new RangeError("MatrixDimensionMismatchException");
    }
    return a.map(function (element, i, j) {
      return element.add(b.e(i, j));
    });
  };

  Matrix.prototype.augment = function (b) { // ( this | m )  m.rows() ==== this.rows()
    if (this.rows() !== b.rows()) {
      //TODO: fix exception
      throw new RangeError("NonSquareMatrixException");
    }
    var a = this;
    return Matrix.Zero(a.rows(), a.cols() + b.cols()).map(function (element, i, j) {
      return (j < a.cols() ? a.e(i, j) : b.e(i, j - a.cols()));
    });
  };

  Matrix.prototype.rowReduce = function (targetRow, pivotRow, pivotColumn, currentOrPreviousPivot) {
    var rows = this.rows();
    var cols = this.cols();
    var c = new Array(rows);
    var i = -1;
    while (++i < rows) {
      if (targetRow === i) {
        var x = new Array(cols);
        var f = currentOrPreviousPivot == undefined ? this.e(targetRow, pivotColumn).divide(this.e(pivotRow, pivotColumn)) : undefined;
        var j = -1;
        while (++j < cols) {
          // (e_ij - e_ic * e_rj / e_rc) * (e_rc / cpp)
          var e = undefined;
          if (currentOrPreviousPivot == undefined) {
            e = this.e(targetRow, j).subtract(f.multiply(this.e(pivotRow, j)));
          } else {
            e = this.e(pivotRow, pivotColumn).multiply(this.e(targetRow, j)).subtract(this.e(targetRow, pivotColumn).multiply(this.e(pivotRow, j))).divide(currentOrPreviousPivot);
            //TODO: 
            //if (e instanceof Expression.Division) {
            //  debugger;
            //}
          }
          x[j] = e.simplifyExpression();
        }
        c[i] = x;
      } else {
        c[i] = this.a[i];
      }
    }
    return new Matrix(c);
  };

  Matrix.prototype.swapRows = function (pivotRow, targetRow, preserveDeterminant) {
    var m = this;
    return m.map(function (e, i, j) {
      if (i === pivotRow) {
        return m.e(targetRow, j);
      }
      if (i === targetRow) {
        return preserveDeterminant ? m.e(pivotRow, j).negate() : m.e(pivotRow, j);
      }
      return e;
    });
  };

  var notEqualsZero = function (e, condition) {//TODO: - ?
    if (condition != undefined) {
      //!update from 2018-16-07
      return condition.andZero(e).isFalse();
    }
    return !e.equals(Expression.ZERO);
  };

  Matrix.check = function (usage, matrix, from, to, condition) {
    for (var i = from; i < to; i += 1) {
      if (usage !== "solving" || notEqualsZero(matrix.e(i, matrix.cols() - 1), condition)) {
        var endColumnIndex = usage === "solving" ? matrix.cols() - 1 : (usage === "determinant" ? matrix.cols() : (usage === "inverse" ? Math.floor(matrix.cols() / 2) : -1));
        var j = 0;
        while (j < endColumnIndex && matrix.e(i, j).equals(Expression.ZERO)) {
          j += 1;
        }
        if (j === endColumnIndex) {
          return i;
        }
      }
    }
    return -1;
  };

  Matrix.toRowEchelonStep = function (m, pivotRow, pivotColumn, pivotOriginRow, previousPivot, options, condition) {
    var oldMatrix = undefined;
    var coefficient = undefined;
    var targetRow = 0;
    if (pivotOriginRow !== pivotRow) {
      oldMatrix = m;
      m = m.swapRows(pivotRow, pivotOriginRow, options.usage === "determinant");
      if (options.callback != undefined) {
        options.callback({previousPivot: undefined, newMatrix: m, oldMatrix: oldMatrix, type: options.usage === "determinant" ? "swap-negate" : "swap", targetRow: pivotRow, pivotRow: pivotOriginRow, pivotColumn: pivotColumn});
      }
    }
    // making zeros under the main diagonal
    if (options.method === Matrix.GaussJordan) {
      if (!m.e(pivotRow, pivotColumn).equals(Expression.ONE)) {
        oldMatrix = m;
        coefficient = Expression.ONE.divide(m.e(pivotRow, pivotColumn));
        m = m.map(function (e, i, j) {
          if (i !== pivotRow) {
            return e;
          }
          return e.multiply(coefficient);
        });
        if (options.callback != undefined) {
          options.callback({previousPivot: undefined, newMatrix: m, oldMatrix: oldMatrix, type: "divide", targetRow: pivotRow, pivotRow: pivotRow, pivotColumn: pivotColumn});
        }
      }
    }
    if (options.method === Matrix.Gauss || options.method === Matrix.GaussJordan) {
      targetRow = pivotRow;
      while (++targetRow < m.rows()) {
        if (!m.e(targetRow, pivotColumn).equals(Expression.ZERO)) {
          oldMatrix = m;
          m = m.rowReduce(targetRow, pivotRow, pivotColumn);
          if (options.callback != undefined) {
            options.callback({previousPivot: undefined, newMatrix: m, oldMatrix: oldMatrix, type: "reduce", targetRow: targetRow, pivotRow: pivotRow, pivotColumn: pivotColumn});
          }
          var stoppedAtRow = Matrix.check(options.usage, m, targetRow, targetRow + 1, condition);
          if (stoppedAtRow !== -1) {
            return {stoppedAtRow: stoppedAtRow, matrix: m};
          }
        }
      }
    }
    if (options.method === Matrix.GaussMontante) {
      oldMatrix = m;
      targetRow = -1;
      while (++targetRow < m.rows()) {
        if (targetRow !== pivotRow) {
          m = m.rowReduce(targetRow, pivotRow, pivotColumn, previousPivot);
        }
      }
      if (options.callback != undefined) {
        options.callback({previousPivot: previousPivot, newMatrix: m, oldMatrix: oldMatrix, type: "pivot", targetRow: -1, pivotRow: pivotRow, pivotColumn: pivotColumn});
      }
      var stoppedAtRow = Matrix.check(options.usage, m, 0, m.rows(), condition);
      if (stoppedAtRow !== -1) {
        return {stoppedAtRow: stoppedAtRow, matrix: m};
      }
    }
    return {stoppedAtRow: -1, matrix: m};
  };

  Matrix.toRowEchelonBackSubstitution = function (m, pivotRow, options) {
    // back-substitution
    if (options.method === Matrix.GaussJordan) {
      while (--pivotRow >= 0) {
        var pivotColumn = 0;
        while (pivotColumn < m.cols() && m.e(pivotRow, pivotColumn).equals(Expression.ZERO)) {
          pivotColumn += 1;
        }
        if (pivotColumn < m.cols()) {
          var targetRow = pivotRow;
          while (--targetRow >= 0) {
            if (!m.e(targetRow, pivotColumn).equals(Expression.ZERO)) {
              var oldMatrix = m;
              m = m.rowReduce(targetRow, pivotRow, pivotColumn);
              if (options.callback != undefined) {
                options.callback({previousPivot: undefined, newMatrix: m, oldMatrix: oldMatrix, type: "reduce", targetRow: targetRow, pivotRow: pivotRow, pivotColumn: pivotColumn});
              }
            }
          }
        }
      }
    }
    return m;
  };

  var isConditionValid = function (condition, matrix) {
    for (var i = 0; i < matrix.rows(); i++) {
      for (var j = 0; j < matrix.cols(); j++) {
        var e = matrix.e(i, j);
        if (!Polynomial._isIntegerLike(e)) {
          if (Polynomial._isIntegerLike(e.getNumerator())) {//!!! for performance
            e = e.getDenominator().inverse();
          }
          if (condition.andZero(e).isFalse() && condition.andNotZero(e).isFalse()) {
            return false;
          }
        }
      }
    }
    return true;
  };

  Matrix.Gauss = "Gauss";
  Matrix.GaussJordan = "Gauss-Jordan";
  Matrix.GaussMontante = "Gauss-Montante";

  function ToRowEchelonOptions(method, usage, callback) {
    if (usage !== "determinant" && usage !== "inverse" && usage !== "solving" && usage !== "LU-decomposition" && usage !== "" && usage !== "row-reduction") {
      throw new RangeError();
    }
    if (method !== Matrix.Gauss && method !== Matrix.GaussJordan && method !== Matrix.GaussMontante) {
      throw new RangeError();
    }
    this.method = method;
    this.usage = usage;
    this.callback = callback;
  }

  Matrix.ToRowEchelonOptions = ToRowEchelonOptions;

  // method === Matrix.GaussJordan - make zeros under diagonal and divide by pivot element, also swap row instead of addition
  // method === Matrix.Montante - https://es.wikipedia.org/wiki/M%C3%A9todo_Montante
  // private
  var COLUMN_LOOP = 0;
  var ZERO = 1;
  var NOT_ZERO = 2;
  Matrix.prototype.toRowEchelon = function (method, usage, callback) {
    var options = new Matrix.ToRowEchelonOptions(method, usage, callback);
    return this.toRowEchelonInternal(options, 0, -1, -1, Expression.ONE, COLUMN_LOOP, undefined);
  };
  Matrix.prototype.toRowEchelonXXX = function (method, usage, callback, condition) {
    var options = new Matrix.ToRowEchelonOptions(method, usage, callback);
    return this.toRowEchelonInternal(options, 0, -1, -1, Expression.ONE, COLUMN_LOOP, condition);
  };
  Matrix.prototype.toRowEchelonInternal = function (options, pivotRow, pivotColumn, pivotOriginRow, previousPivot, state, condition) {
    var matrix = this;

    //2018-09-29
    if (condition != undefined && !condition.isTrue()) {
      matrix = matrix.map(function (e, i, j) {
        // x == 0 && x**2 != 0 is false
        // x == 0 && x**2 == 0 is false
        // x == 0 && y/x != 0 is false
        // x == 0 && y/x == 0 is false
        return condition.updateExpression(e);
      });
      previousPivot = condition.updateExpression(previousPivot);
    }

    var stoppedAtRow = Matrix.check(options.usage, matrix, 0, matrix.rows(), condition);
    if (stoppedAtRow !== -1) {
      return {stoppedAtRow: stoppedAtRow, matrix: matrix, condition: condition};
    }
    if (false) {
      //TODO: remove
    //!2018-16-07 (from trash)
    if (options.usage === "solving" && pivotColumn === matrix.cols() - 1) {
      //TODO: test
      //TODO: test if condition == undefined
      var c = condition.andZero(matrix.e(pivotRow, pivotColumn));
      return {stoppedAtRow: -1, matrix: matrix, condition: c};
    }
    //!
    }
    while (true) {
      switch (state) {
        case COLUMN_LOOP:
          pivotColumn += 1;
          if (pivotColumn >= matrix.cols()) {
            matrix = Matrix.toRowEchelonBackSubstitution(matrix, pivotRow, options);
            return {stoppedAtRow: -1, matrix: matrix, condition: condition};
          }
          if (pivotColumn > pivotRow && (options.usage === "determinant" || options.usage === "inverse")) {
            if (pivotColumn >= Math.floor(matrix.cols() / 2) && options.usage === "inverse") {//TODO: fix
              matrix = Matrix.toRowEchelonBackSubstitution(matrix, pivotRow, options);
              return {stoppedAtRow: -1, matrix: matrix, condition: condition};
            }
            return {stoppedAtRow: pivotRow, matrix: matrix, condition: condition};//? TODO: details - ?
          }
          pivotOriginRow = pivotRow - 1;
          state = ZERO;
        break;
        case ZERO:
          // pivot searching
          // not zero element in a column (starting from the main diagonal);
          if (condition == undefined) {
            pivotOriginRow += 1;
            if (pivotOriginRow < matrix.rows()) {
              if (matrix.e(pivotOriginRow, pivotColumn).equals(Expression.ZERO)) {
                state = ZERO;
              } else {
                state = NOT_ZERO;
              }
            } else {
              state = COLUMN_LOOP;
            }
          } else {
            if (pivotOriginRow >= pivotRow) {
              matrix = pivotRow >= matrix.rows() || matrix.e(pivotRow, pivotColumn).equals(Expression.ZERO) ? matrix : matrix.map(function (e, i, j) { //?
                //return i === pivotOriginRow && j === pivotColumn ? Expression.ZERO : condition.updateExpression(e);
                return condition.updateExpression(e);
              });
              previousPivot = condition.updateExpression(previousPivot);
            }
            var found = false;
            if (pivotOriginRow === pivotRow - 1) {//!
              var row = pivotRow;
              while (row < matrix.rows() && !((condition.andZero(matrix.e(row, pivotColumn)).isFalse() || options.usage === "LU-decomposition") && !matrix.e(row, pivotColumn).equals(Expression.ZERO))) {
                row += 1;
              }
              if (row < matrix.rows()) {
                pivotOriginRow = row;
                found = true;
              }
            }//!
            if (!found) {
              pivotOriginRow += 1;
              if (pivotOriginRow < matrix.rows()) {
                var candidate = matrix.e(pivotOriginRow, pivotColumn);
                var c1 = condition.andNotZero(candidate);
                var c2 = condition.andZero(candidate);

                if (!c2.isFalse()) {
                //!new 2020-01-03
                // condition: r = 0, element = 1/r
                if (!isConditionValid(c2, matrix)) {
                  debugger;
                  c2 = Condition.FALSE;//!!!
                  condition = c1;//!
                }
                //!
                }

                if (c2.isFalse()) {
                  state = NOT_ZERO;
                } else if (c1.isFalse()) {
                  state = ZERO;
                } else {
                  if (options.usage === "row-reduction") {
                    var tmp = Matrix.toRowEchelonStep(matrix, pivotRow, pivotColumn, pivotOriginRow, previousPivot, Object.assign({}, options, {callback: null}), condition);
                    var m = tmp.matrix.slice(pivotOriginRow + 1, matrix.rows(), pivotColumn, matrix.cols()).map(function (e, i, j) {
                      return c2.updateExpression(e);
                    });
                    if (m.eql(Matrix.Zero(m.rows(), m.cols()))) {
                      return matrix.toRowEchelonInternal(options, pivotRow, pivotColumn, pivotOriginRow, previousPivot, NOT_ZERO, condition);
                    }
                  }
                  return {
                    matrix: matrix,
                    c1: c1,
                    a1: function () {
                      return matrix.toRowEchelonInternal(options, pivotRow, pivotColumn, pivotOriginRow, previousPivot, NOT_ZERO, c1);
                    },
                    c2: c2,
                    a2: function () {
                      return matrix.toRowEchelonInternal(options, pivotRow, pivotColumn, pivotOriginRow, previousPivot, ZERO, c2);
                    }
                  };
                }
              } else {
                state = COLUMN_LOOP;
              }
            } else {
              state = NOT_ZERO;
            }
          }
        break;
        case NOT_ZERO:
          var tmp = Matrix.toRowEchelonStep(matrix, pivotRow, pivotColumn, pivotOriginRow, previousPivot, options, condition);
          var stoppedAtRow = tmp.stoppedAtRow;
          matrix = tmp.matrix;
          if (stoppedAtRow !== -1) {
            return {stoppedAtRow: stoppedAtRow, matrix: matrix, condition: condition};
          }
          previousPivot = matrix.e(pivotRow, pivotColumn);
          pivotRow += 1;
          state = COLUMN_LOOP;
        break;
      }
    }
  };

  Matrix.prototype.determinant = function () { // m == n  // via row echelon form
    var n = this.rows();
    if (!this.isSquare() || n === 0) {
      throw new RangeError("NonSquareMatrixException");
    }
    if (false && !Expression.has(this.e(0, 0), Expression.Polynomial)) {
      var tmp = this.toRowEchelon(Matrix.Gauss, "determinant", undefined);
      var stoppedAtRow = tmp.stoppedAtRow;
      var rowEchelonMatrix = tmp.matrix;
      if (stoppedAtRow !== -1) {
        return Expression.ZERO;
      }
      var det = rowEchelonMatrix.e(0, 0);
      for (var j = 1; j < rowEchelonMatrix.rows(); j += 1) {
        det = det.multiply(rowEchelonMatrix.e(j, j));
      }
      return det;
    }
    var tmp = this.toRowEchelon(Matrix.GaussMontante, "determinant", undefined);
    var stoppedAtRow = tmp.stoppedAtRow;
    var rowEchelonMatrix = tmp.matrix;
    if (stoppedAtRow !== -1) {
      return Expression.ZERO;
    }
    return rowEchelonMatrix.e(n - 1, n - 1);
  };

  Matrix.prototype.rank = function () {
    // rank === count of non-zero rows after bringing to row echelon form ...
    //var m = this.toRowEchelon(Matrix.Gauss, "", undefined).matrix;
    var m = this.toRowEchelon(Matrix.GaussMontante, "", undefined).matrix;
    var result = 0;
    var pivotRow = 0;
    var pivotColumn = 0;
    while (pivotRow < m.rows()) {
      while (pivotColumn < m.cols() && m.e(pivotRow, pivotColumn).equals(Expression.ZERO)) {
        pivotColumn += 1;
      }
      if (pivotColumn < m.cols()) {
        result += 1;
      }
      pivotRow += 1;
    }
    return result;
  };

  Matrix.prototype.inverse = function () { // m == n by augmention ...
    if (!this.isSquare()) {
      throw new RangeError("NonSquareMatrixException");
    }
    if (this.rows() === 2) {
      var a = this.e(0, 0);
      var b = this.e(0, 1);
      var c = this.e(1, 0);
      var d = this.e(1, 1);
      var det = a.multiply(d).subtract(b.multiply(c));
      if (det.equals(Expression.ZERO)) {
        throw new RangeError("SingularMatrixException");
      }
      return Matrix.Zero(this.rows(), this.rows()).map(function (e, i, j) {
        return (i === 0 ? (j === 0 ? d : b.negate()) : (j === 0 ? c.negate() : a)).divide(det);
      });
    }
    var m = this.augment(Matrix.I(this.rows()));
    //m = m.toRowEchelon(Matrix.GaussJordan, "inverse", undefined).matrix;
    m = m.toRowEchelon(Matrix.GaussMontante, "inverse", undefined).matrix;

    return Matrix.Zero(m.rows(), m.rows()).map(function (element, i, j) { // splitting to get the second half
      var e = m.e(i, i);
      if (e.equals(Expression.ZERO)) {
        throw new RangeError("SingularMatrixException");
      }
      var x = m.e(i, j + m.rows());
      return e.equals(Expression.ONE) ? x : x.divide(e);
    });
  };

  Matrix.prototype.toString = function (options) {
    var result = "";
    var rows = this.rows();
    var cols = this.cols();
    if (rows === 0 && cols === 0) {
      throw new RangeError();
    }
    var j = -1;
    result += "{";
    while (++j < rows) {
      if (j !== 0) {
        result += ",";
      }
      result += "{";
      var i = -1;
      while (++i < cols) {
        if (i !== 0) {
          result += ",";
        }
        result += this.e(j, i).toString(options);
      }
      result += "}";
    }
    result += "}";
    return result;
  };

  Matrix.prototype.negate = function () {
    return this.map(function (element, i, j) {
      return element.negate();
    });
  };

  Matrix.prototype.subtract = function (b) {
    return this.add(b.negate());
  };

  //?
  // returns an array of arrays of strings
  Matrix.prototype.getElements = function () {
    var rows = this.rows();
    var cols = this.cols();
    var elements = new Array(rows);
    for (var i = 0; i < rows; i += 1) {
      var row = new Array(cols);
      for (var j = 0; j < cols; j += 1) {
        row[j] = this.e(i, j).toString();
      }
      elements[i] = row;
    }
    return elements;
  };

  Matrix.prototype.slice = function (rowsStart, rowsEnd, colsStart, colsEnd) {
    var that = this;
    return Matrix.Zero(rowsEnd - rowsStart, colsEnd - colsStart).map(function (e, i, j) {
      return that.e(i + rowsStart, j + colsStart);
    });
  };

  //TODO:
  Matrix.prototype.isExact = function () {
    var rows = this.rows();
    var cols = this.cols();
    for (var i = 0; i < rows; i += 1) {
      for (var j = 0; j < cols; j += 1) {
        if (!this.e(i, j).isExact()) {
          return false;
        }
      }
    }
    return true;
  };

  Matrix.prototype.eql = function (b) {
    var a = this;
    if (a.rows() !== b.rows() || a.cols() !== b.cols()) {
      return false;
    }
    for (var i = 0; i < a.rows(); i += 1) {
      for (var j = 0; j < a.cols(); j += 1) {
        if (!a.e(i, j).equals(b.e(i, j))) {
          return false;
        }
      }
    }
    return true;
  };

  Matrix.prototype.pow = function (n) {
    if (!(n >= 0 && n <= Number.MAX_SAFE_INTEGER)) {
      throw new RangeError();
    }
    var pow = function (x, count, accumulator) {
      return (count < 1 ? accumulator : (2 * Math.floor(count / 2) !== count ? pow(x, count - 1, accumulator.multiply(x)) : pow(x.multiply(x), Math.floor(count / 2), accumulator)));
    };
    return pow(this, n, Matrix.I(this.rows()));
  };

  /*
  // TODO: remove
  Matrix.prototype.stripZeroRows = function () {
    var rows = this.rows();
    var cols = this.cols();
    var i = rows;
    var j = cols;
    while (j === cols && --i >= 0) {
      j = 0;
      while (j < cols && this.e(i, j).equals(Expression.ZERO)) {
        j += 1;
      }
    }
    i += 1;
    var that = this;
    return i === rows ? this : Matrix.Zero(i, cols).map(function (e, i, j) {
      return that.e(i, j);
    });
  };
  */

  // string -> array of array of strings, find `extraPositionOffset`
  Matrix.split = function (input) {
    input = input.replace(/\b(sin|cos)\x20/g, '$1\u200B');
    var result = [];
    var m = input;
    if (/^\s*\[[^\[\]]*\]\s*$/.exec(m) != undefined) {//!
      m = m.replace(/\[/g, " ");
      m = m.replace(/\]/g, " ");
    }//!
    if (m.replace(/^\s+|\s+$/g, "") !== "") {
      m = m.replace(/;/g, "\n");//? ; -> \n
      m = m.replace(/\r/g, "\n");
      var row = [];
      result.push(row);
      var position = 0;
      var match = undefined;
      while ((match = /^\s*\S+/.exec(m.slice(position))) != undefined) {
        var t = match[0];
        if (t.indexOf("\n") !== -1 && row.length !== 0) {
          row = [];
          result.push(row);
          t = t.replace(/\n/g, " ");
        }
        row.push(t);
        position += t.length;
      }
    }
    return result;
  };

  Matrix.padRows = function (array, convertFunction) {
    var rows = array.length;
    var cols = 0;
    for (var k = 0; k < array.length; k += 1) {
      cols = Math.max(cols, array[k].length);
    }
    var data = new Array(rows);
    for (var i = 0; i < rows; i += 1) {
      var y = array[i];
      var x = new Array(cols);
      for (var j = 0; j < cols; j += 1) {
        x[j] = j < y.length ? (convertFunction != null ? convertFunction(y[j]) : y[j]) : Expression.ZERO;
      }
      data[i] = x;
    }
    return new Matrix(data);
  };

  Matrix.solveByGaussNext = function (m, callback) {
    var pivotRows = new Array(m.cols() - 1);
    for (var k = 0; k < m.cols() - 1; k += 1) {
      pivotRows[k] = -1;
    }
    for (var i = m.rows() - 1; i >= 0; i -= 1) {
      var j = 0;
      while (j < m.cols() - 1 && m.e(i, j).equals(Expression.ZERO)) {
        j += 1;
      }
      // first not zero in a row - main variable
      if (j < m.cols() - 1) {
        pivotRows[j] = i;
        var oldMatrix1 = m;
        // reduce i-th row
        for (var k = j + 1; k < m.cols() - 1; k += 1) {
          if (!m.e(i, k).equals(Expression.ZERO)) {
            var pivotRow = pivotRows[k];
            if (pivotRow !== -1) {
              m = m.rowReduce(i, pivotRow, k);
            }
          }
        }
        var oldMatrix2 = m;
        // divide i-th row by m.e(i, j)
        if (!m.e(i, j).equals(Expression.ONE)) {
          var c = m.e(i, j);
          m = m.map(function (e, row, column) {
            return row === i ? e.divide(c) : e;
          });
        }
        if (callback != undefined) {
          callback(m, oldMatrix1, oldMatrix2, i, j);
        }
      }
    }
    return m;
  };

  //TODO: ?
  Matrix.getPivotRow = function (m, k) {
    var i = m.rows() - 1;
    while (i >= 0 && m.e(i, k).equals(Expression.ZERO)) {
      i -= 1;
    }
    if (i >= 0) {
      var j = k - 1;
      while (j >= 0 && m.e(i, j).equals(Expression.ZERO)) {
        j -= 1;
      }
      if (j < 0) {
        return i;
      }
    }
    return -1;
  };

  //TODO: fix
  Matrix.getSolutionSet = function (m) {
    var result = {
      basisVectors: [],
      variables: []
    };
    for (var k = 0; k < m.cols() - 1; k += 1) {
      if (Matrix.getPivotRow(m, k) === -1) {
        // a basis vector for k-th variable
        var bx = new Array(m.cols() - 1);
        for (var j = 0; j < m.cols() - 1; j += 1) {
          var i = Matrix.getPivotRow(m, j); // a solution row for j-th variable, -1 if it is a free variable
          bx[j] = i !== -1 ? m.e(i, k).negate() : (j === k ? Expression.ONE : Expression.ZERO);
        }
        var basisVector = new Vector(bx);
        result.basisVectors.push(basisVector);
        result.variables.push(k);
      }
    }
    return result;
  };

  Matrix.prototype.minorMatrix = function (k, l) {
    var that = this;
    return Matrix.Zero(this.rows() - 1, this.cols() - 1).map(function (e, i, j) {
      return that.e(i < k ? i : i + 1, j < l ? j : j + 1);
    });
  };

  Matrix.toRowEchelonWithCallback = function (matrix, method, usage, changeCallback, resultCallback) {
    var result = matrix.toRowEchelonXXX(method, usage, changeCallback, Condition.TRUE);
    var w = function (result) {
      if (result.c1 == undefined && result.c2 == undefined) {
        resultCallback(result);
      } else {
        w(result.a1());
        w(result.a2());
      }
    };
    w(result);
  };

  Matrix.prototype.isDiagonal = function () {
    return this.eql(this.map(function (e, i, j) {
      return i !== j ? Expression.ZERO : e;
    }));
  };
  Matrix.prototype.isScalar = function () {
    var that = this;
    return this.eql(this.map(function (e, i, j) {
      return i !== j ? Expression.ZERO : that.e(0, 0);
    }));
  };
  Matrix.prototype.isNilpotent = function () {
    var x = this.map(function (e, i, j) {
      return j <= i ? Expression.ZERO : e;
    });
    if (this.eql(x)) {
      //! This method only tests if it nilpotent based on a property and so may return false for the positive result
      return true;
    }
    //TODO: test case for non-triangular - ?
    return this.pow(this.cols()).eql(Matrix.Zero(this.cols(), this.cols()));
  };
  //TODO: use in solution steps (?)
  Matrix.prototype.isJordanMatrix = function () {//TODO: fix
    var that = this;
    return this.eql(this.map(function (e, i, j) {
      return i === j ? e : (j === i + 1 && that.e(i, i).equals(that.e(i + 1, i + 1)) && !that.e(i, j).equals(Expression.ZERO) ? Expression.ONE : Expression.ZERO);
    }));
  };
  Matrix.prototype.isZero = function () {
    return this.eql(Matrix.Zero(this.rows(), this.cols()));
  };

  function Vector(elements) {
    this.elements = elements;
  }

  Vector.prototype.e = function (index) {
    return this.elements[index];
  };

  Vector.prototype.dimensions = function () {
    return this.elements.length;
  };

  //TODO: ?
  Vector.prototype.rows = function () {
    return this.dimensions();
  };
  Vector.prototype.cols = function () {
    return 1;
  };
  Vector.prototype.isExact = function () {
    for (var i = 0; i < this.dimensions(); i += 1) {
      if (!this.e(i).isExact()) {
        return false;
      }
    }
    return true;
  };

  Vector.prototype.toString = function (options) {
    return Matrix.prototype.toString.call(this, options);
  };

  Vector.prototype.dot = function (other) {
    let result = Expression.ZERO;
    for (let i = 0; i < Math.max(this.dimensions(), other.dimensions()); i += 1) {
      var s = this.e(i).multiply(other.e(i).complexConjugate());
      result = result === Expression.ZERO ? s : result.add(s);
    }
    return result;
  };
  Vector.prototype.toUnitVector = function () {
    var norm = this.dot(this).squareRoot();
    return this.scale(norm.inverse());
  };

  Vector.prototype.scale = function (s) {
    return new Vector(this.elements.map(e => s.multiply(e)));
  };
  Vector.prototype.subtract = function (other) {
    if (this.dimensions() !== other.dimensions()) {
      throw new RangeError("MatrixDimensionMismatchException");
    }
    const n = this.dimensions();
    const result = new Array(n);
    for (let i = 0; i < n; i += 1) {
      result[i] = this.e(i).subtract(other.e(i));
    }
    return new Vector(result);
  };

  Vector.prototype.eql = function (other) {
    if (this.dimensions() !== other.dimensions()) {
      throw new RangeError("MatrixDimensionMismatchException");
    }
    const n = this.dimensions();
    for (var i = 0; i < n; i += 1) {
      if (!this.e(i).equals(other.e(i))) {
        return false;
      }
    }
    return true;
  };
  Vector.Zero = function (n) {
    return new Vector(new Array(n).fill(Expression.ZERO));
  };

  Matrix.Vector = Vector;

  Matrix.prototype.row = function (i) {
    const elements = new Array(this.cols());
    for (let j = 0; j < this.cols(); j += 1) {
      elements[j] = this.e(i, j);
    }
    return new Vector(elements);
  };
  Matrix.prototype.col = function (j) {
    const elements = new Array(this.rows());
    for (let i = 0; i < this.rows(); i += 1) {
      elements[i] = this.e(i, j);
    }
    return new Vector(elements);
  };

  export default Matrix;
