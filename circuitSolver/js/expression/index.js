// npm install . --save

//TODO: fix imports with side-effects - ?
import primeFactor from './primeFactor.js';
import nthRoot from './nthRoot.js';
import Expression from './Expression.js';
import toDecimalStringInternal from './toDecimalString.js';
import './GF2.js';
import './sin.js';
import './complex.js';
import NonSimplifiedExpression from './NonSimplifiedExpression.js';
import ExpressionParser from './ExpressionParser.js';
import Polynomial from './Polynomial.js';
import Matrix from './Matrix.js';
//import './toLaTeX.js';
import './polynomial-roots-finding.js';
import './FormaCanonicalDeJordan.js';
import './ExpressionExtensions.js';
import Condition from './Condition.js';
import './toMathML.js';

const isPrime = primeFactor._isPrime;

export {
  primeFactor,
  isPrime,
  nthRoot,
  Expression,
  toDecimalStringInternal,
  NonSimplifiedExpression,
  ExpressionParser,
  Polynomial,
  Matrix,
  Condition
};
