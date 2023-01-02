import Expression from './Expression.js';
import Matrix from './Matrix.js';
import Polynomial from './Polynomial.js';
import SomePolynomialRoot from './SomePolynomialRoot.js';

globalThis.factorsMap = new Map();

Expression.getPolynomialRootsWithSteps = function (polynomial, callback) {
  var roots = polynomial.getroots(callback);

  //TODO: tests
  //!2018-05-28
  //!2018-07-11
  // experimental code
  var zeros = [];
  if (typeof polynomial.getZeros === "function" && roots.length !== polynomial.getDegree()) {
    var p = Polynomial.of(Expression.ONE);
    for (var i = 0; i < roots.length; i += 1) {
      p = p.multiply(Polynomial.of(roots[i].negate(), Expression.ONE));
    }
    var r = polynomial.divideAndRemainder(p).quotient;
    globalThis.factorsMap = new Map();
    const getZerosTricky = function (f) {
      var pp = f.primitivePart();
      if (!pp.hasIntegerCoefficients()) {//TODO: !?
        return f.getZeros(true);
      }
      f = pp;
      
      // https://en.wikipedia.org/wiki/Square-free_polynomial
      var tmp = f.squareFreeFactors();
      var a0 = tmp.a0;
      var a1 = tmp.a1;

      if (a0.getDegree() !== 0) {
        var tmp1 = getZerosTricky(a1); // roots with multiplicity = 1 (?)
        var tmp2 = getZerosTricky(a0);
        var result = [];
        var previous = undefined;
        for (var i = 0; i < tmp2.length; i += 1) {
          var zero = tmp2[i];
          if (zero !== previous) {
            result.push(zero);
            previous = zero;
          }
          result.push(zero);
        }
        return tmp1.concat(result);
      }
      
      var factor = f.factorize();
      if (factor == null) {
        factor = f;
      }
      if (!factor.equals(f)) {
        return getZerosTricky(factor).concat(getZerosTricky(f.divideAndRemainder(factor, "throw").quotient));
      }
      const zeros = factor.getZeros(true);
      for (const zero of zeros) {
        globalThis.factorsMap.set(zero, factor);
      }
      return zeros;
    };
    //zeros = r.getZeros(true);
    zeros = getZerosTricky(r);
    if (callback != undefined) {
      if (zeros.length === r.getDegree()) {//TODO: !!!
        callback({content: Expression.ONE, roots: roots.concat(zeros), newPolynomial: Polynomial.of(polynomial.getLeadingCoefficient()), type: "realRootIsolationAndNewton'sMethod"});
      }
    }
  }
  //!

  // removing of duplicates
  for (var i = 0; i < roots.length; i += 1) {
    var root = roots[i];
    for (var j = 0; j < roots.length; j += 1) {
      if (roots[j].equals(root)) {
        roots[j] = root;
      }
    }
  }

  return roots.concat(zeros);
};

Expression.getEigenvalues = function (matrix, callback) {

  if (!matrix.isSquare()) {
    throw new RangeError("NonSquareMatrixException");
  }
  // TODO: remove Polynomial

  var determinant = matrix.map(function (e, i, j) {
    var p = i === j ? Polynomial.of(e, Expression.ONE.negate()) : (e.equals(Expression.ZERO) ? Polynomial.ZERO : Polynomial.of(e));
    return new Expression.Polynomial(p);
  }).determinant();
  determinant = determinant.polynomial;

  //!new (sin/cos)
  //TODO: fix
  determinant = determinant.map(function (e) { return e.simplifyExpression(); });

  var characteristicPolynomial = determinant;//!TODO: fix
  if (callback != null) {
    callback(characteristicPolynomial);//TODO: !?
  }

//TODO:
  var eigenvalues = Expression.getPolynomialRootsWithSteps(characteristicPolynomial, callback);

  return eigenvalues;
};

// a/b, where a and b are integers
Expression.isRational = function (e) {
  return e instanceof Expression.Integer || e instanceof Expression.BinaryOperation && Expression.isRational(e.a) && Expression.isRational(e.b);
};
Expression.isRationalMatrix = function (A) {
  for (var i = 0; i < A.rows(); i += 1) {
    for (var j = 0; j < A.cols(); j += 1) {
      if (!Expression.isRational(A.e(i, j))) {
        return false;
      }
    }
  }
  return true;
};

Expression.getEigenvectors = function (matrix, eigenvalues, internal = false) {
  if (eigenvalues == undefined) {
    throw new TypeError();//TODO: remove
    eigenvalues = Expression.getEigenvalues(matrix);
  }

  const eigenvectors = new Array(eigenvalues.length).fill(null);
  const uniqueEigenvalues = Expression.unique(eigenvalues);
  
  const setResults = function (eigenvalue, currentEigenvectors) {
    var j = 0;
    for (var k = 0; k < eigenvalues.length && j < currentEigenvectors.length; k += 1) {
      if (eigenvalues[k] === eigenvalue) {
        eigenvectors[k] = currentEigenvectors[j];
        j += 1;
      }
    }
    if (j < currentEigenvectors.length) {
      throw new TypeError("wrong eigenvalues argument: the eigenvalue should appear multiple times");
    }
  };

  if (!internal && matrix.isSquare() && Expression.isRationalMatrix(matrix)) {//todo: complex (?)
    const map = new Map();
    for (const eigenvalue of uniqueEigenvalues) {
      const factor = globalThis.factorsMap.get(eigenvalue);
      if (factor == null || factor.getDegree() <= 1) {
        const currentEigenvectors = Expression.getEigenvectors(matrix, eigenvalues.filter(e => e === eigenvalue), true);
        setResults(eigenvalue, currentEigenvectors);
      } else {
        var currentEigenvectors = map.get(factor);
        if (currentEigenvectors == null) {
          const root = SomePolynomialRoot.create(factor);
          currentEigenvectors = Expression.getEigenvectors(matrix, eigenvalues.filter(e => e === eigenvalue).map(e => root), true);
          map.set(factor, currentEigenvectors);
        }
        var zeroPows = [];
        zeroPows.push(Expression.ONE);
        const subs = function (x) {
          return x instanceof SomePolynomialRoot ? x.calcAt(eigenvalue, zeroPows) : x;
        };
        setResults(eigenvalue, currentEigenvectors.map(v => new Matrix.Vector(v.elements.map(e => subs(e)))));
      }
    }
    
    return eigenvectors;
  }
  
  for (var i = 0; i < uniqueEigenvalues.length; i += 1) {
    const eigenvalue = uniqueEigenvalues[i];
    var n = matrix.cols();
    // matrix - I * eigenvalue
    var currentEigenvectors = Expression.getSolutionSet(matrix.subtract(Matrix.I(n).scale(eigenvalue)));
    setResults(eigenvalue, currentEigenvectors);
    
    let cc = null;
    if (i + 1 < uniqueEigenvalues.length) {
      try {
        cc = eigenvalue.complexConjugate();
      } catch (error) {
        //TODO: remove
        console.error(error);
      }
    }
    //TODO: REMOVE (use the code above)
    if (i + 1 < uniqueEigenvalues.length && cc != null && cc.equals(uniqueEigenvalues[i + 1]) && matrix.eql(matrix.map(e => e.complexConjugate()))) {
      //TODO:!
      const complexConjugate = function (vector) {
        return new Matrix.Vector(vector.elements.map(e => e.complexConjugate()));
      };
      setResults(uniqueEigenvalues[i + 1], currentEigenvectors.map(vector => complexConjugate(vector)));
      i += 1;//TODO: !?
    }
  }
  return eigenvectors;
};

var getInverse = function (A, eigenvalues, T) {
  // https://en.wikipedia.org/wiki/Diagonalizable_matrix : The row vectors of P^−1 are the left eigenvectors of A
  // https://en.wikipedia.org/wiki/Eigenvalues_and_eigenvectors#Left_and_right_eigenvectors :  a left eigenvector of A is the same as the transpose of a right eigenvector of A^T, with the same eigenvalue
  var AT = A.transpose();
  var eigenvectors = Expression.getEigenvectors(AT, eigenvalues);
  var T_INVERSED = Matrix.fromVectors(eigenvectors).transpose();
  return _unscaleInverseMatrix(T_INVERSED, T);
};

var _unscaleInverseMatrix = function (T_INVERSED, T) {
  // we know, that the result is {{s_1, 0, 0, 0}, {0, s_2, 0, 0}, {0, 0, s_3, 0}, {0, 0, 0, s_4}}
  var trickyMultiply = function (a, b) {
    var n = a.rows();
    return Matrix.Zero(n, n).map(function (element, i, j) {
      if (i !== j) {
        return Expression.ZERO;
      }
      var rows = n;
      var k = -1;
      while (++k < rows) {
        var current = a.e(i, k).multiply(b.e(k, j));
        element = k === 0 ? current : element.add(current);
      }
      return element;
    });
  };

  var S = trickyMultiply(T_INVERSED, T);
  var S_INVERSED = S.map(function (e, i, j) {
    return i === j ? e.inverse() : Expression.ZERO;
  });

  return S_INVERSED.multiply(T_INVERSED);
};
Expression._unscaleInverseMatrix = _unscaleInverseMatrix;//TODO: make private

// A = T^-1 L T ,T-matrix of own vectors, L - matrix of own values

Expression.diagonalize = function (matrix, eigenvalues, eigenvectors) {
  if (arguments.length > 3) {
    throw new TypeError();
  }
  if (!matrix.isSquare()) {
    throw new RangeError("NonSquareMatrixException");
  }
  if (eigenvalues.length !== matrix.cols()) {
    throw new RangeError();
  }
  if (eigenvectors.filter(v => v != null).length !== matrix.cols()) {
    throw new RangeError();
  }
  // https://en.wikipedia.org/wiki/Jordan_normal_form
  // A is diagonalizable if and only if, for every eigenvalue λ of A, its geometric and algebraic multiplicities coincide.

  // TODO: text
  //!!!
  var L = Matrix.I(matrix.cols()).map(function (element, i, j) {
    return (i === j ? eigenvalues[i] : Expression.ZERO);
  });
  var T = Matrix.fromVectors(eigenvectors);

  //var T_INVERSED = T.inverse();
  var T_INVERSED = T.isExact() ? T.inverse() : getInverse(matrix, eigenvalues, T);

  return {T: T, L: L, T_INVERSED: T_INVERSED};
};

Expression.LUDecomposition = function (matrix) {
  //https://en.wikipedia.org/wiki/LU_decomposition#Code_examples
  //TODO: remove(?) - matrix.toRowEchelon(...)
  var N = matrix.rows();
  var a = matrix;
  var Lower = Matrix.I(N);
  var P = Matrix.I(N);
  var swapFlag = false;
  var pivotRow = 0;
  for (var n = 0; n < matrix.cols(); n += 1) {
    if (pivotRow < N) {
      var c = pivotRow;
      if (a.e(pivotRow, n).equals(Expression.ZERO)) {
        for (var k = pivotRow + 1; k < N && c === pivotRow; k += 1) {
          if (!a.e(k, n).equals(Expression.ZERO)) {
            c = k;
          }
        }
        if (c !== pivotRow) {
          var S = Matrix.I(N);
          S = S.map(function (element, i, j) {
            return i === pivotRow ? S.e(c, j) : (i === c ? S.e(pivotRow, j) : element);
          });
          a = S.multiply(a);
          Lower = S.multiply(Lower.subtract(Matrix.I(N))).add(Matrix.I(N));
          P = S.multiply(P);
          swapFlag = true;
        }
      }
      if (!a.e(pivotRow, n).equals(Expression.ZERO)) {
        var L = Matrix.I(N).map(function (element, i, j) {
          return j === pivotRow && i >= pivotRow + 1 ? a.e(i, n).divide(a.e(pivotRow, n)).negate() : element;
        });
        a = L.multiply(a);
        Lower = Lower.multiply(L);
        pivotRow += 1;
      }
    }
  }
  Lower = Lower.map(function (element, i, j) {
    return i === j ? element : element.negate();
  });
  return {
    swapFlag: swapFlag,
    P: new Expression.Matrix(P),
    A: new Expression.Matrix(matrix),
    L: new Expression.Matrix(Lower),
    U: new Expression.Matrix(a)
  };
};

Expression.isReal = function (e) {
  var isReal = function (e) {
    if (e instanceof Expression.Integer) {
      return true;
    }
    if (e instanceof Expression.NthRoot) {
      return isReal(e.a);
    }
    if (e instanceof Expression.BinaryOperation) {
      return isReal(e.a) && isReal(e.b);
    }
    if (e === Expression.E || e === Expression.PI) {
      return true;
    }
    if (e instanceof Expression.Function) {
      return isReal(e.a);
    }
    if (e instanceof Expression.PolynomialRootSymbol) {
      return true;//TODO: ?
    }
    if (e instanceof Expression.ExpressionWithPolynomialRoot) {
      return isReal(e.e);
    }
    if (e instanceof Expression.ExpressionPolynomialRoot) {
      return true;
    }
    return false;
  };
  return isReal(e);
};
Expression.isRealMatrix = function (A) {
  for (var i = 0; i < A.rows(); i += 1) {
    for (var j = 0; j < A.cols(); j += 1) {
      if (!Expression.isReal(A.e(i, j))) {
        return false;
      }
    }
  }
  return true;
};
Expression.CholeskyDecomposition = function (matrix) {
  var A = matrix;

  // check if A is square
  if (!A.isSquare()) {
    throw new RangeError("NonSquareMatrixException");
  }

  var n = A.rows();

  // check if A from R
  var isReal = Expression.isRealMatrix(A);

  // check if A is symmetric
  for (var i = 0; i < n; i += 1)  {
    for (var j = i; j < n; j += 1) {
      if (!A.e(i, j).equals(A.e(j, i).complexConjugate())) {
        if (isReal) {
          throw new RangeError("NonSymmetricMatrixException");
        } else {
          throw new RangeError("NonHermitianMatrixException");
        }
      }
    }
  }

  var L = new Array(n);
  for (var i = 0; i < n; i += 1) {
    L[i] = new Array(n);
    for (var j = 0; j < n; j += 1) {
      L[i][j] = Expression.ZERO;
    }
  }

  for (var j = 0; j < n; j += 1) {
    for (var i = j; i < n; i += 1) {
      var e = null;
      if (j === i) {
        var sum = null;
        for (var k = 0; k < j; k += 1) {
          var s = L[j][k].multiply(L[j][k].complexConjugate());
          sum = sum == null ? s : sum.add(s);
        }
        var x = sum == null ? A.e(j, j) : A.e(j, j).subtract(sum);
        //TODO: fix
        if (!Expression._isPositive(x)) {
          throw new RangeError("NonPositiveDefiniteMatrix");
        }
        e = x.squareRoot();
      } else {
        var sum = null;
        for (var k = 0; k < j; k += 1) {
          var x = L[i][k].multiply(L[j][k].complexConjugate());
          sum = sum == null ? x : sum.add(x);
        }
        e = (sum == null ? A.e(i, j) : A.e(i, j).subtract(sum)).divide(L[j][j]);
      }
      L[i][j] = e;
      console.log("l_%d%d = %s", i + 1, j + 1, L[i][j].toString());
    }
  }
  return {
    L: Matrix.padRows(L, null)
  };
};


Matrix.prototype.conjugateTranspose = function () {
  return this.transpose().map(e => e.complexConjugate());
};

Matrix.fromVectors = function (vectors) {
  if (vectors.length === 0) {
    throw new RangeError();
  }
  var dimensions = vectors[0].dimensions();
  for (var i = 0; i < vectors.length; i += 1) {
    if (vectors[i].dimensions() !== dimensions) {
      throw new RangeError();
    }
  }
  return Matrix.Zero(dimensions, vectors.length).map((e, i, j) => vectors[j].e(i));
};

Expression.SVD = function (matrix) {
  // TODO: see email 
  // https://en.wikipedia.org/wiki/Singular_value_decomposition#Calculating_the_SVD
  // TODO: see https://web.mit.edu/be.400/www/SVD/Singular_Value_Decomposition.htm
  // The left-singular vectors of M are a set of orthonormal eigenvectors of MM*.
  var helper = function (matrix, eigenvectors) {
    //console.info('We need to orthonormalize eigenvectors so the matrix with those vectors as columns will be unitary:');
    if (eigenvectors.length > 1) {//TODO: https://math.stackexchange.com/questions/82467/eigenvectors-of-real-symmetric-matrices-are-orthogonal#answer-82471
      eigenvectors = GramSchmidtOrthogonalization(eigenvectors);
    } else {
      //console.debug('Eigenvectors of real symmetric matrices corresponding to distinct eigenvalues are orthogonal'); // no need to show (?)
    }
    return eigenvectors.map(vector => vector.toUnitVector());
  };
  var MstarM = matrix.conjugateTranspose().multiply(matrix);
  var eigenvalues = Expression.getEigenvalues(MstarM); // use MstarM to have zero eigenvalues to make the set of eigenvectors full for V
  //!
  eigenvalues = eigenvalues.map(eigenvalue => eigenvalue instanceof Expression.ExpressionWithPolynomialRoot || eigenvalue instanceof Expression.ExpressionPolynomialRoot ? eigenvalue.upgrade() : eigenvalue);
  //!

  eigenvalues = eigenvalues.slice(0).reverse().sort(function (a, b) {
    var diff = a.subtract(b);
    if (!Expression.isReal(diff)) {
      return NaN;//TODO: !?
    }
    return diff.compareTo(Expression.ZERO) > 0 ? -1 : 1;
  });

  //var Vstar = ExpressionParser.parse(matrix.toString()).transformEquality(ExpressionParser.parse(U.multiply(Sigma).toString() + '*' + 'X', ExpressionParser.parse.c).simplify());
  
  //console.info('M^{*}M (M^T*M) has the same non-negative eigenvalues as M*M^{*} (M*M^T)')
  var V = [];
  var diagonal = [];
  //TODO:
  //console.info('   eigenvectors: ');
  const uniqueEigenvalues = Expression.unique(eigenvalues);
  var eigenvectors = Expression.getEigenvectors(MstarM, eigenvalues);
  for (var eigenvalue of uniqueEigenvalues) {
    var eigenvalueEigenvectors = eigenvectors.filter((v, i) => eigenvalues[i] === eigenvalue);
    V = V.concat(helper(MstarM, eigenvalueEigenvectors));
    var entry = eigenvalue.squareRoot();
    // https://en.wikipedia.org/wiki/Eigenvalues_and_eigenvectors#Eigenspaces,_geometric_multiplicity,_and_the_eigenbasis_for_matrices
    // https://people.math.carleton.ca/~kcheung/math/notes/MATH1107/wk12/12_singular_value_decomposition.html
    // it says, that geometric multiplicity of a _positive_ eigenvalue of A*A^T is the same as geometric multiplicity of A^T*A and same as algebraic multipliciy.
    // and those matrices has the same eigenvalues
    //var geometricMultiplicity = multiplicities[i] === 1 ? 1 : MMstar.cols() - MMstar.subtract(Matrix.I(MMstar.cols()).scale(eigenvalue)).rank();//?
    var geometricMultiplicity = V.length - diagonal.length;
    diagonal = diagonal.concat(new Array(geometricMultiplicity).fill(entry));
  }
  var Sigma = Matrix.Zero(matrix.rows(), matrix.cols()).map((e, i, j) => (i === j && i < diagonal.length ? diagonal[i] : Expression.ZERO));

  // see https://www.d.umn.edu/~mhampton/m4326svd_example.pdf
  //TODO: compute V or U using the property instead of the current variant of computation (?)
  
  console.time('U');
  var U = [];
  for (var i = 0; i < Sigma.rows() && i < Sigma.cols() && !Sigma.e(i, i).equals(Expression.ZERO); i += 1) {
    //TODO: another method when multiplicity is 1 - ? (for performance)
    var u_i = matrix.multiply(V[i]).col(0).scale(Sigma.e(i, i).inverse());
    U.push(u_i);
  }
  if (U.length < matrix.rows()) { // not enough vectors
    //TODO: details
    console.time('U1');
    var MMstar = matrix.multiply(matrix.conjugateTranspose());
    var eigenvectors = Expression.getEigenvectors(MMstar, new Array(matrix.rows()).fill(Expression.ZERO), true).filter(v => v != null);
    var U2b = helper(MMstar, eigenvectors);
    console.timeEnd('U1');
    console.assert(U.length + U2b.length === matrix.rows());
    U = U.concat(U2b);
  }
  console.timeEnd('U');

  //var Vstar = s.multiply(U.inverse().multiply(matrix));
  //var Vstar = U.conjugateTranspose().multiply(matrix);
  //console.log(U.multiply(U.conjugateTranspose()).toString());
  //console.log(Vstar.multiply(Vstar.conjugateTranspose()).toString());

  U = Matrix.fromVectors(U);
  V = Matrix.fromVectors(V);
  return {U: U, Sigma: Sigma, Vstar: V.conjugateTranspose()};
};

Expression.QRDecomposition = function (matrix) {
  var A = matrix;
  // https://en.wikipedia.org/wiki/QR_decomposition#Example
  var columnVectors = new Array(A.cols());
  for (var i = 0; i < A.cols(); i += 1) {
    columnVectors[i] = A.col(i);
  }
  var U = GramSchmidtOrthogonalization(columnVectors).filter(vector => !vector.eql(Matrix.Vector.Zero(vector.dimensions())));
  var Q = Matrix.fromVectors(U.map(vector => vector.toUnitVector()));
  var R = Q.conjugateTranspose().multiply(A);
  console.log(Q);
  return {
    Q: Q,
    R: R
  };
};

