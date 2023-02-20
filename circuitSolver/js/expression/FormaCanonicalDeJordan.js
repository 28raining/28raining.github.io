import Expression from './Expression.js';
import Matrix from './Matrix.js';

// https://ca.wikipedia.org/wiki/Forma_canònica_de_Jordan

// https://es.wikipedia.org/wiki/Forma_canónica_de_Jordan

Expression.getSolutionSet = function getSolutionSet(matrix) {
  var fullMatrix = matrix.augment(Matrix.Zero(matrix.cols(), 1));
  //TODO: Matrix.GaussMontante
  var result = fullMatrix.toRowEchelon(Matrix.GaussJordan, "solving", undefined);
  var tmp = Matrix.solveByGaussNext(result.matrix);
  var basisVectors = Matrix.getSolutionSet(tmp).basisVectors;
  return basisVectors;//?
};

Expression.getFormaDeJordan = function (matrix, eigenvalues, hack) {
  function matrixFromBlocks(blocks) {
    var start = 0;
    var J = Matrix.Zero(n, n);
    for (var i = 0; i < blocks.length; i += 1) {
      var b = blocks[i];
      J = J.map(function (e, i, j) {
        if (i >= start && i < start + b.size) {
          return i === j ? b.eigenvalue : (i !== start + b.size - 1 && j === i + 1 ? Expression.ONE : Expression.ZERO);
        }
        return e;
      });
      start += b.size;
    }
    return J;
  }
  function isSolution(coefficientMatrix, vector) {
    var f = coefficientMatrix.multiply(vector);
    return f.eql(Matrix.Zero(f.rows(), 1));
  }
  function isLinearlyIndependentSet(basis, vectors) {
    // https://math.stackexchange.com/questions/412563/determine-if-vectors-are-linearly-independent
    return Matrix.fromVectors(basis.concat(vectors)).rank() === basis.length + vectors.length;
  }
  
  if (arguments.length > 3 || (arguments[2] !== true && arguments[2] !== undefined)) {
    throw new TypeError();
  }

  var uniqueEigenvalues = Expression.unique(eigenvalues);

  //!TODO: remove
  if (uniqueEigenvalues.length === matrix.rows()) {
    var eigenvectors = Expression.getEigenvectors(matrix, eigenvalues);
    var tmp = Expression.diagonalize(matrix, eigenvalues, eigenvectors);
    var P = tmp.T;
    var J = tmp.L;
    var P_INVERSED = tmp.T_INVERSED;
    //console.log("P=" + P.toString() + ", J=" + J.toString());
    return {
      P: P,
      J: J,
      P_INVERSED: P_INVERSED
    };
  }
  //!

  var A = matrix;
  var n = A.rows();

  var basis = [];
  var blocks = [];
  for (var i = 0; i < uniqueEigenvalues.length; i += 1) {
    // https://en.wikipedia.org/wiki/Generalized_eigenvector#Computation_of_generalized_eigenvectors
    var basisCorrespondingToTheEigenvalue = []; // TODO: optimize (n**3 -> n**2)
    var eigenvalue = uniqueEigenvalues[i];
    var algebraicMultiplicity = eigenvalues.reduce((count, e) => count + (e === eigenvalue ? 1 : 0), 0);
    var B = A.subtract(Matrix.I(n).scale(eigenvalue));
    var m = 1;
    while (B.pow(m).rank() > n - algebraicMultiplicity) {
      m += 1;
    }
    m += 1;
    while (--m >= 1) {
      //var z = 0;
      //var pm = B.pow(m - 1).rank() - 2 * B.pow(m).rank() + B.pow(m + 1).rank();
      var solutionSet = Expression.getSolutionSet(B.pow(m));  // "kernel of A"
      for (var j = 0; j < solutionSet.length; j += 1) {
        var solution = solutionSet[j];
        //if (z < pm) {
        //console.log(B.pow(m).augment(solution).rank(), m, n);
        if (!isSolution(B.pow(m - 1), solution)) {
          var chain = [];
          var s = solution;
          for (var k = 0; k < m; k += 1) {
            chain.push(s);
            s = B.multiply(s).col(0);
          }
          chain.reverse();
          if (isLinearlyIndependentSet(basisCorrespondingToTheEigenvalue, chain)) {
            //z += 1;
            basis = basis.concat(chain);
            basisCorrespondingToTheEigenvalue = basisCorrespondingToTheEigenvalue.concat(chain);
            blocks.push({
              size: m,
              eigenvalue: eigenvalue
            });
          }
        }
        //}
      }
    }
  }
  var J = matrixFromBlocks(blocks);
  if (basis.length !== n) {
    throw new TypeError("assertion failed");
  }
  var P = Matrix.fromVectors(basis);
  //console.log("P=" + P.toString() + ", J=" + J.toString());
  //var P_INVERSED = P.inverse();
  var P_INVERSED = P.isExact() ? P.inverse() : (hack ? null : getInverse(A, eigenvalues, P));
  if (!hack && P.isExact()) {
  if (A.toString() !== P.multiply(J).multiply(P_INVERSED).toString()) {
    throw new TypeError("assertion failed");
  }
  }
  return {
    P: P,
    J: J,
    P_INVERSED: P_INVERSED
  };
};

// A = P*J*P^-1
// A^T = (P^-1)^T*J^T*P^T
// Note:
// (0 0 0 1)         (0 0 0 1)
// (0 0 1 0)         (0 0 1 0)
// (0 1 0 0) * J^T * (0 1 0 0) = J
// (1 0 0 0)         (1 0 0 0)
// where on the left we are doing row spaws, then doing column swaps.
// Note: the inverse of the anti-diagonal unitary matrix is the matrix itself.
// A^T = X*Y*X^-1
// (P^-1)^T*J^T*P^T = X*Y*X^-1
// (P^-1)^T*B^-1*J*B*P^T = X*Y*X^-1
// Then P^-1 = (X*B)^T .

var getInverse = function (A, eigenvalues, P) {
  // https://en.wikipedia.org/wiki/Diagonalizable_matrix : The row vectors of P^−1 are the left eigenvectors of A
  // https://en.wikipedia.org/wiki/Eigenvalues_and_eigenvectors#Left_and_right_eigenvectors :  a left eigenvector of A is the same as the transpose of a right eigenvector of A^T, with the same eigenvalue
  var AT = A.transpose();
  var tmp2 = Expression.getFormaDeJordan(AT, eigenvalues, true);
  var J = tmp2.J;
  var X = tmp2.P;

  var n = A.cols();
  var B = Matrix.Zero(n, n).map(function (e, i, j) {
    function getCurrentBlock() {
      var s = i;
      while (s - 1 >= 0 && s < n && J.e(s - 1, s).equals(Expression.ONE)) {
        s -= 1;
      }
      var e = i;
      while (e + 1 < n && J.e(e, e + 1).equals(Expression.ONE)) {
        e += 1;
      }
      return {s: s, e: e};
    }
    var tmp = getCurrentBlock();
    return tmp.s + tmp.e === i + j ? Expression.ONE : Expression.ZERO;
  });

  var P_INVESRED = X.multiply(B).transpose();
  return Expression._unscaleInverseMatrix(P_INVESRED, P);
};
Expression._getInverse = getInverse;
