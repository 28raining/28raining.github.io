import Expression from './Expression.js';
import Polynomial from './Polynomial.js';

function Condition(array) {
  Object.freeze(array);
  this.array = array;
}

Condition.NEZ = " != 0";
Condition.EQZ = " == 0";

Condition.GTZ = " > 0";
//Condition.GTEZ = " >= 0";

Condition.prototype._and = function (operator, e) {
  //console.log('_and', e.toString(), this === Condition.FALSE || this === Condition.TRUE ? '' : this.toString());
  if (operator !== Condition.NEZ && operator !== Condition.EQZ && operator !== Condition.GTZ) {
    throw new TypeError();
  }
  if (e == undefined) {
    throw new RangeError();
  }
  if (this === Condition.FALSE) {
    return this;
  }

  var contains = function (array, operator, e) {
    for (var i = 0; i < array.length; i += 1) {
      if (array[i].operator === operator && array[i].expression.equals(e)) {
        return true;
      }
    }
    return false;
  };

  if (e instanceof Expression.GF2Value) {
    return this._and(operator, e.value === 0 ? Expression.ZERO : Expression.ONE);//?
  }

  var add = function (oldArray, y) {

    //TODO: y is const
    if (contains(oldArray, y.operator, y.expression)) {//!TODO: it should work even without this (?)
      return oldArray;
    }
    if (contains(oldArray, y.operator === Condition.EQZ ? Condition.NEZ : Condition.EQZ, y.expression)) {
      return null;
    }

    var operator = null;// to not use a variable from scope accidently
    var e = y.expression;//!

  //!new 2019-12-15:
  //!substitute:  x = 0, sin(x) != 0
  if (Expression.has(e, Expression.Sin) ||
      Expression.has(e, Expression.Cos) ||
      Expression.has(e, Expression.Exponentiation) ||
      Expression.has(e, Expression.Arctan) ||
      Expression.has(e, Expression.Logarithm) ||
      Expression.has(e, Expression.Abs)) {
    if (oldArray.length > 0) {//TODO: test, fix
    e = Expression._map(function (x) {
      if (x instanceof Expression.Function && !(x instanceof Expression.NthRoot) ||
          x instanceof Expression.Exponentiation && (!(x.b instanceof Expression.Integer) || !(x.a instanceof Expression.Symbol))) {
        var r = x instanceof Expression.Exponentiation ? x.b : x.a;
        var arg = null;
        var array = null;
        if (!(r instanceof Expression.Symbol)) {
          arg = new Expression.Symbol('arg');
          array = add(oldArray, {expression: arg.subtract(r), operator: Condition.EQZ});
          if (array == null) {
            //! TODO: fix, should not happen
            return x;
          }
        } else {
          arg = r;
          array = oldArray;
        }
        for (var i = 0; i < array.length; i += 1) {//TODO: fix
          var y = array[i];
          if (y.operator === Condition.EQZ) {
            var polynomial = Polynomial.toPolynomial(y.expression, arg);
            if (polynomial.getDegree() === 1) {
              var yy = polynomial.getCoefficient(0).negate().divide(polynomial.getCoefficient(1));
              if (!Expression.has(yy, Expression.Function)) {// sin(yy)/cos(yy) is supported
              if (yy.compare4Addition(arg) < 0 && !(yy instanceof Expression.Division) || Expression.isConstant(yy) || Expression.isConstant(yy.divide(Expression.PI))) {//TODO: fix
                if (x instanceof Expression.Exponentiation) {
                  //?TODO: tests
                  return x.a.pow(yy);
                } else if (x instanceof Expression.Arctan) {
                  return yy.arctan();
                } else if (x instanceof Expression.Logarithm) {
                  return yy.logarithm();
                } else if (x instanceof Expression.Abs) {
                  return yy.abs();
                } else {
                  yy = Expression.isConstant(yy) && !(yy.equals(Expression.ZERO)) && !(yy instanceof Expression.Radians) && !Expression.has(yy, Expression.Symbol) ? new Expression.Radians(yy) : yy;
                  if (x instanceof Expression.Sin) {
                    return yy.sin();
                  } else if (x instanceof Expression.Cos) {
                    return yy.cos();
                  } else {
                    throw new TypeError("NotSupportedError");
                  }
                }
              }
              }
            }
          }
        }
        return x;
      }
      return x;
    }, e);
    y = {expression: e, operator: y.operator};//TODO: fix
    }
  }
  //!

    //!new
    if (e.isNegative() && (y.operator === Condition.EQZ || y.operator === Condition.NEZ)) {
      return add(oldArray, {expression: e.negate(), operator: y.operator});
    }

    // (x-1)^(1/2)
    if (e instanceof Expression.Exponentiation// &&
        //e.b.getNumerator() instanceof Expression.Integer &&
        //!e.b.getDenominator().equals(Expression.ONE)
        ) {
      if (y.operator === Condition.EQZ || y.operator === Condition.NEZ) {
        return add(oldArray, {expression: e.a, operator: y.operator});
      }
    }

    // (4*k+1)^(1/2)+1
    if (e instanceof Expression.Addition &&
        e.a instanceof Expression.Exponentiation &&
        Expression.isConstant(e.b) && //!
        e.a.b.getDenominator() instanceof Expression.Integer &&
        !e.a.b.getDenominator().equals(Expression.ONE)) {
      if (e.a.b.getDenominator().remainder(Expression.TWO).equals(Expression.ZERO) && !e.b.isNegative()) {
        return add(oldArray, {expression: Expression.ONE, operator: y.operator});
      }
      //if (!e.b.negate().pow(e.a.b.inverse()).pow(e.a.b).equals(e.b.negate())) {
      //  return add(oldArray, {expression: Expression.ONE, operator: y.operator});
      //}
      //TODO: fix
      return add(oldArray, {expression: e.a.a.pow(e.a.b.getNumerator()).subtract(e.b.negate().pow(e.a.b.getDenominator())), operator: y.operator});
    }

    if (y.expression instanceof Expression.Multiplication && y.expression.b instanceof Expression.IdentityMatrix) {
      return add(oldArray, {expression: y.expression.a, operator: y.operator});
    }
    if (y.expression instanceof Expression.Division) {
      var tmp = oldArray;
      tmp = add(tmp, {expression: y.expression.a, operator: y.operator});
      if (tmp == null) {
        return null;
      }
      tmp = add(tmp, {expression: y.expression.b, operator: Condition.NEZ});
      return tmp;
    }
    /*if (y.expression instanceof Expression.Division && Expression.isConstant(y.expression.b)) {
      y = {
        expression: y.expression.a,
        operator: y.operator
      };
    }*/
    if (y.expression instanceof Expression.Integer || y.expression instanceof Expression.Complex) {
      if (y.operator === Condition.NEZ && y.expression.equals(Expression.ZERO) ||
          y.operator === Condition.EQZ && !y.expression.equals(Expression.ZERO)) {
        return null;
      }
      if (y.operator === Condition.GTZ && y.expression.equals(Expression.ZERO)) {//TODO: fix
        return null;
      }
      if (y.operator === Condition.GTZ && y.expression instanceof Expression.Integer && y.expression.compareTo(Expression.ZERO) < 0) {//TODO: fix
        return null;
      }
      return oldArray;
    }
    //TODO: check code coverage, remove extra branches
    if (Expression.isConstant(y.expression) && !y.expression.equals(Expression.ZERO)) {
      if (y.operator === Condition.NEZ) {
        return oldArray;
      }
      if (y.operator === Condition.EQZ) {
        return null;
      }
    }
    if (y.expression instanceof Expression.Matrix) {
      if (y.expression.matrix.isZero()) {
        if (y.operator === Condition.EQZ) {
          return oldArray;
        }
        if (y.operator === Condition.NEZ) {
          return null;
        }
      }
    }
    if (y.expression instanceof Expression.NthRoot) {
      return add(oldArray, {expression: y.expression.a, operator: y.operator});
    }
    if (y.expression instanceof Expression.Multiplication) {
      if (y.operator === Condition.EQZ) {
        if (y.expression.a instanceof Expression.Integer && !y.expression.a.equals(Expression.ZERO)) {
          //TODO: fix - ?
          y = {
            expression: y.expression.b,
            operator: y.operator
          };
          return add(oldArray, y);
        }
      }
      if (y.operator === Condition.NEZ) {
        var tmp = oldArray;
        tmp = add(tmp, {expression: y.expression.a, operator: Condition.NEZ});
        if (tmp == null) {
          return null;
        }
        tmp = add(tmp, {expression: y.expression.b, operator: Condition.NEZ});
        return tmp;
      }
    }

    var p = Expression.getMultivariatePolynomial(y.expression);
    if (p != null) {
      //!new 2018-12-24
      //TODO: fix (?Polynomial#getContent()?)
        var t = Expression.getNthRootConjugate(p.p.getLeadingCoefficient());
        if (t != undefined && Expression.isConstant(t)) {//TODO: fix
          return add(oldArray, {expression: t.multiply(y.expression), operator: y.operator});
        }
      //!
      var content = p.p.getContent();
      if (!content.equals(Expression.ONE) && !content.equals(Expression.ONE.negate())) {
        // content * y.expression.divide(content)
        if (y.operator === Condition.NEZ) {
          var tmp = add(oldArray, {expression: y.expression.divide(content), operator: Condition.NEZ});
          if (tmp == null) {
            return null;
          }
          return add(tmp, {expression: content, operator: Condition.NEZ});
        }
        while (p != null) {
          if (y.operator === Condition.EQZ) {
            var sf = p.p.getSquareFreePolynomial();
            if (sf.getDegree() !== p.p.getDegree()) {
              //?
              return add(oldArray, {expression: y.expression.divide(p.p.divideAndRemainder(sf).quotient.calcAt(p.v)), operator: Condition.EQZ});
            }
          }
          content = p.p.getContent();
          p = Expression.getMultivariatePolynomial(content);
        }
        //!new
        if (Expression.isConstant(content)) {
          if (!content.equals(Expression.ONE) && !content.equals(Expression.ONE.negate())) {
            return add(oldArray, {expression: y.expression.divide(content), operator: Condition.EQZ});
          }
        }
        //y = {
        //  expression: y.expression.divide(content),
        //  operator: y.operator
        //};
      }
      if (p != null && p.p.getDegree() > 1 && p.p.getCoefficient(0).equals(Expression.ZERO)) {
        if (y.operator === Condition.NEZ) {
          var tmp = add(oldArray, {expression: p.v, operator: Condition.NEZ});
          if (tmp == null) {
            return null;
          }
          return add(tmp, {expression: y.expression.divide(p.v), operator: Condition.NEZ});
        }
      }
    }

    //!new 2019-12-24:
    var p = Expression.getMultivariatePolynomial(y.expression);
    if (p != null && p.p.getDegree() > 1) {
      var sf = p.p.getSquareFreePolynomial();
      if (sf.getDegree() !== p.p.getDegree()) {//TODO: test, fix
        if (y.operator === Condition.EQZ || y.operator === Condition.NEZ) {
          return add(oldArray, {expression: sf.calcAt(p.v), operator: y.operator});
        }
      }
    }
    //!

    var addRest = function (newArray, oldArray, i, other) {
      if (newArray == null) {
        return null;
      }
      for (var j = i + 1; j < oldArray.length; j += 1) {
        newArray = add(newArray, oldArray[j]);
        if (newArray == null) {
          return null;
        }
      }
      if (other != null) {
        newArray = add(newArray, other);
      }
      return newArray;
    };


    var newArray = [];
    for (var i = 0; i < oldArray.length; i += 1) {
      var x = oldArray[i]; // TODO: const


      // (e**(tx)-e**(-tx))/(2i)
      // (e**(tx)+e**(-tx))/2

      // sin(x)=0, cos(x)=0
      //!new 2020-01-01:
      if (Expression.has(x.expression, Expression.Sin) || Expression.has(x.expression, Expression.Cos)) {
        if (Expression.has(y.expression, Expression.Sin) || Expression.has(y.expression, Expression.Cos)) {
          var xx = {
            operator: x.operator,
            expression: Expression._replaceSinCos(x.expression)
          };
          var yy = {
            operator: y.operator,
            expression: Expression._replaceSinCos(y.expression)
          };
          var tmp1 = add([], xx);
          if (tmp1 == null) {
            return null;
          }
          var tmp = add(tmp1, yy);
          if (tmp == null) {
            return null;
          }
          if (tmp.length === 0) {
            return [];//TODO: remove
          }
          if (tmp.length === 1) {
            return addRest(newArray, oldArray, i, {operator: tmp[0].operator, expression: Expression._replaceBySinCos(tmp[0].expression)});
          }
          //TODO: ?
          //for (var i = 0; i < tmp.length; i++) {
          //  newArray = add(newArray, {operator: tmp[i].operator, expression: Expression._replaceBySinCos(tmp[i].expression)});
          //}
          //return addRest(newArray, oldArray, i, {operator: Condition.EQZ, expression: Expression.ZERO});

          // cos(y)=0, r*sin(y)=0
          for (var i = 0; i < tmp.length; i++) {
            if (!Expression.has(tmp[i], Expression.Exponentiation)) {//TODO: ?
              if (tmp[i].expression.gcd(y.expression).equals(tmp[i].expression)) {
                newArray = add(newArray, x);
                return addRest(newArray, oldArray, i, {operator: tmp[i].operator, expression: Expression._replaceBySinCos(tmp[i].expression)});
              }
            }
          }

        }
      }
      //!
      if (Expression.has(x.expression, Expression.Function) || Expression.has(x.expression, Expression.Exponentiation)) {
        if (!(Expression.has(y.expression, Expression.Function) || Expression.has(y.expression, Expression.Exponentiation))) {
          return addRest(add(newArray, y), oldArray, i, x);
        }
      }

      if ((x.operator === Condition.NEZ && y.operator === Condition.EQZ ||
           x.operator === Condition.EQZ && y.operator === Condition.NEZ) &&
           (Expression.isSingleVariablePolynomial(x.expression.multiply(y.expression)) || true)) {
        var g = x.expression.polynomialGCD(y.expression);
        //var g = x.expression.gcd(y.expression);
        while (!g.equals(Expression.ONE) && !g.equals(Expression.ONE.negate())) {
          if (x.operator === Condition.EQZ) {
            x = {
              operator: x.operator,
              expression: x.expression.divide(g)
            };
            // the change may affect all previous conditions:
          } else { // y.operator === Condition.EQZ
            y = {
              operator: y.operator,
              expression: y.expression.divide(g)
            };
            // we have not checked the y agains the branches in the beginning of the "add"
          }
          newArray = add(newArray, x);
          if (newArray == null) {
            return null;
          }
          return addRest(newArray, oldArray, i, y);
          //g = x.expression.gcd(y.expression);
        }
        //if (x.operator === Condition.EQZ) {
        //  var tmp = y;
        //  y = x;
        //  x = tmp;
        //}
        if (x.operator === Condition.EQZ && Expression.isConstant(x.expression)) {
          return null;
        }
        if (y.operator === Condition.EQZ && Expression.isConstant(y.expression)) {
          return null;
        }
        //if (!Expression.isSingleVariablePolynomial(x.expression.multiply(y.expression))) {
        //  if (x.operator === Condition.EQZ) {
        //    newArray.push(y);
        //  } else {
        //    newArray.push(x);
        //  }
        //}
      }
      var newMethodEnabled = true;
      var singleVariablePolynomials = Expression.isSingleVariablePolynomial(x.expression) &&
                                      Expression.isSingleVariablePolynomial(y.expression) &&
                                      Expression.isSingleVariablePolynomial(x.expression.multiply(y.expression));
      if (x.operator === Condition.NEZ && y.operator === Condition.EQZ && singleVariablePolynomials) {
        y = y;
      } else if (x.operator === Condition.EQZ && y.operator === Condition.NEZ && singleVariablePolynomials) {
        y = x;
      } else if (x.operator === Condition.EQZ && y.operator === Condition.EQZ && singleVariablePolynomials) {
        var g = x.expression.polynomialGCD(y.expression);
        //var g = x.expression.gcd(y.expression);
        if (g instanceof Expression.Integer) {
          return null;
        }
        y = {
          operator: y.operator,
          expression: g
        };
        return addRest(newArray, oldArray, i, y);
      } else if (x.operator === Condition.NEZ && y.operator === Condition.NEZ && singleVariablePolynomials) {
        var g = x.expression.gcd(y.expression);
        x = {
          operator: x.operator,
          expression: x.expression.divide(g)
        };
        if (!Expression.isConstant(x.expression)) {
          newArray.push(x);
        }
      } else { // !isSingleVariablePolynomial
        // TODO: use Expression.isSingleVariablePolynomial(x.expression.multiply(y.expression))) here, and remove in the branches above


        //!new 2020-16-02
        var getConstant = function (e) {
          if (e instanceof Expression.Multiplication && e.a instanceof Expression.Matrix) {//TODO: ?
            return e.a.multiply(getConstant(e.b));
          }
          var c = Expression.getConstant(e);
          for (var f of e.divide(c).factors()) {
            if (f instanceof Expression.NthRoot && Expression.isConstant(f.a)) {
              c = c.multiply(f);
            }
          }
          return c;
        };
        var collapse = function (e, candidate) { // sqrt(2)*x*y+2*x*y
          var term0 = candidate.divide(getConstant(candidate));
          var result = Expression.ZERO;
          for (var a of e.summands()) {
            var term = a.divide(getConstant(a));
            if (term.equals(term0)) {
              result = result.add(a);
            }
          }
          return result;
        };
        var getPivotMonomial = function (e) {
          // https://en.wikipedia.org/wiki/Monomial_order#Lexicographic_order
          //TODO: change compare4Addition (?)
          var getExponent = function (x) {
            return x instanceof Expression.Exponentiation ? x.b : Expression.ONE;
          };
          var getBase = function (x) {
            return x instanceof Expression.Exponentiation ? x.a : x;
          };
          var totalDegree = function (e) {
            var result = Expression.ZERO;
            for (var f of e.factors()) {
              if (!Expression.isConstant(f)) {
                var e = getExponent(f);
                //if (e instanceof Expression.Integer) {//?
                  result = result.add(e);
                //}
              }
            }
            return result;
          };
          var compare = function (x, y) {
            //TODO: better order (see Wikipedia)
            var s = totalDegree(x).subtract(totalDegree(y));
            var c = s.isNegative() ? -1 : (s.negate().isNegative() ? +1 : 0);
            if (c !== 0) {
              return c;
            }
            //return x.compare4Addition(y);
            //TODO: change Expression#compare4Addition - ?
            var reversedFactors = function (e) {
              return Array.from(e.divide(Expression.getConstant(e)).factors()).reverse().filter(e => !Expression.isConstant(e)).values();
            };
            var i = reversedFactors(x);
            var j = reversedFactors(y);
            var a = i.next().value;
            var b = j.next().value;
            while (a != null && b != null) {
              var c = (0 - getBase(a).compare4Multiplication(getBase(b))) || getExponent(a).compare4Multiplication(getExponent(b));
              if (c !== 0) {
                return c;
              }
              a = i.next().value;
              b = j.next().value;
            }
            return a != null ? +1 : (b != null ? -1 : 0);
          };
          var candidate = null;
          for (var a of e.summands()) {
            if (candidate == null || compare(a, candidate) > 0) {
              candidate = a;
            }
          }
          return candidate;
        };
        if (newMethodEnabled && x.operator === Condition.EQZ) {
          var pivot = getPivotMonomial(x.expression);
          var p = pivot.divide(getConstant(pivot))._abs();
          pivot = collapse(x.expression, pivot);
          var newYExpression = y.expression;
          var c1 = 0;
          for (var a of y.expression.summands()) {
            if (a.gcd(p)._abs().equals(p)) {
              newYExpression = newYExpression.subtract(a.divide(pivot).multiply(x.expression));
              c1 += 1;
            }
          }
          if (c1 > 0) {
            return addRest(add(newArray, x), oldArray, i, {expression: newYExpression, operator: y.operator});
          }
        }
        if (newMethodEnabled && y.operator === Condition.EQZ) {
          var pivot = getPivotMonomial(y.expression);
          var p = pivot.divide(getConstant(pivot))._abs();
          pivot = collapse(y.expression, pivot);
          for (var a of x.expression.summands()) {
            if (a.gcd(p)._abs().equals(p)) {
              var newXExpression = x.expression.subtract(a.divide(pivot).multiply(y.expression));
              //trying to avoid infinite recursion:
              if (x.operator === Condition.EQZ) {//?
                return addRest(add(newArray, {expression: newXExpression, operator: x.operator}), oldArray, i, y);
              }
              return addRest(add(newArray, y), oldArray, i, {expression: newXExpression, operator: x.operator});
            }
          }
        }
        if (newMethodEnabled && true) {
          // Condition.TRUE.andNotZero(ExpressionParser.parse('b*c-a*d')).andZero(ExpressionParser.parse('2*b*c-2*a*d+b*c*d+c*d-a*d^2')) + ''
          if (x.operator === Condition.NEZ && y.operator === Condition.EQZ) {
            // consider y = x * q + r, where q is not zero (? and x is not zero)
            // then y != r

            var pivot = getPivotMonomial(x.expression);
            var p = pivot.divide(Expression.getConstant(pivot));
            for (var a of y.expression.summands()) {
              if (a.gcd(p).equals(p) || a.gcd(p).equals(p.negate())) {
                var q = a.divide(pivot);
                if (q instanceof Expression.Integer && !q.equals(Expression.ZERO)) {//TODO: when q is a multiplicaiton of other != 0 conditions
                  //?TODO: prevent infinite loop: how?
                  var r = y.expression.subtract(q.multiply(x.expression));
                  var rr = {expression: r, operator: Condition.NEZ};
                  var flag = false;
                  if (true) {
                    //! 2020-07-05
                    var flag = false;
                    for (var ii = 0; ii < oldArray.length; ii++) {
                      var n = oldArray[ii];
                      if (n.operator === Condition.EQZ) {
                        var g = n.expression.gcd(rr.expression);
                        if (!g.equals(Expression.ONE) && !g.equals(Expression.ONE.negate())) {
                          flag = true;
                        }
                      }
                    }
                  }
                  //flag = oldArray.length < add(oldArray.slice(0), rr).length;//?TODO: better way
                  if (flag) {
                    return addRest(add(add(newArray, x), rr), oldArray, i - 1, y);
                  }
                }
              }
            }

          }
        }
        //!
        if (!newMethodEnabled || true) {

        var p = null;
        var pOperator = null;
        var pp = null;
        var other = null;
        var px = Expression.getMultivariatePolynomial(x.expression);
        var py = Expression.getMultivariatePolynomial(y.expression);
        //var xy = Expression.getMultivariatePolynomial(x.expression.multiply(y.expression));

        if (y.operator === Condition.EQZ && py != null && py.p.getDegree() !== 1) {
          var tmp = Expression.getMultivariatePolynomial(py.p.getCoefficient(0));
          if (tmp != null) {
            var v = tmp.v;
            if (v instanceof Expression.Symbol && tmp.p.getDegree() === 1) {
              py = {p: Polynomial.toPolynomial(y.expression, v), v: v};
            }
          }
        }

        //console.assert(px != null && py != null);

        if (//xy != null &&
            //x.operator === Condition.EQZ &&
            //y.operator === Condition.EQZ &&
            px != null && py != null) {


          //!new 2019-24-12
          /*
          //TODO: remove - buggy - ?
          if (!newMethodEnabled && px != null && py != null && px.v.equals(py.v) && px.p.getDegree() !== 1 && py.p.getDegree() !== 1 && x.operator === Condition.EQZ && y.operator === Condition.EQZ) {
            //TODO: test, fix
            var tmp1 = py.p.getDegree() >= px.p.getDegree() ? Polynomial.pseudoRemainder(py.p, px.p) : py.p;
            var tmp2 = tmp1.calcAt(px.v);
            var tmp = {expression: tmp2, operator: y.operator};
            newArray = add(newArray, tmp);
            if (newArray == null) {
              return null;
            }
            return addRest(newArray, oldArray, i, x);
          }
          */
          //!?

          //if (px != null && px.p.getDegree() !== 1 && py == null) {
            //py = {p: Polynomial.toPolynomial(y.expression, px.v), v: px.v};
            //if (xy.v === py.v) {
            //  py = null;
            //}
          //}
          //if (px == null && py != null && py.p.getDegree() !== 1) {
            //px = {p: Polynomial.toPolynomial(x.expression, py.v), v: py.v};
            //if (xy.v === px.v) {
            //  px = null;
            //}
          //}
          //if (px == null && py == null) {//?TODO:
          //  px = {p: Polynomial.toPolynomial(x.expression, xy.v), v: xy.v};
          //  py = {p: Polynomial.toPolynomial(y.expression, xy.v), v: xy.v};
          //}

          if (y.operator === Condition.EQZ && py != null && py.p.getDegree() === 1 &&
              x.operator === Condition.EQZ && px != null && px.p.getDegree() === 1) {
            //TODO: fix !!!
            //TODO: test linear systems
            if (Expression._getReplacement(y.expression, px.v).equals(px.v) && Polynomial.toPolynomial(y.expression, px.v).getDegree() === 0) {
              px = null;
            }
            if (Expression._getReplacement(x.expression, py.v).equals(py.v) && Polynomial.toPolynomial(x.expression, py.v).getDegree() === 0) {
              py = null;
            }

            if (px != null && py != null) { // TODO: ?
              if (!(px.p.getCoefficient(1) instanceof Expression.Integer)) {
                px = null;
              }
              if (!(py.p.getCoefficient(1) instanceof Expression.Integer)) {
                py = null;
              }
            }

            if (px != null && py != null) {

            //if (px.v.symbol < py.v.symbol) {//!
            if (px.v.compare4Addition(py.v) < 0) {
              px = null;
            }
            //}

            }
          }

          if (y.operator === Condition.EQZ && py != null && py.p.getDegree() === 1) {
            pp = py;
            p = x.expression;
            pOperator = x.operator;
            other = y;
          }
          if (x.operator === Condition.EQZ && px != null && px.p.getDegree() === 1) {
            pp = px;
            p = y.expression;
            pOperator = y.operator;
            other = x;
          }
        }
        if (pp != null) {
          var ok = false;
          // x = -b / a if a !== 0
          ok = ok || pp.p.getDegree() === 1 && Expression.isConstant(pp.p.getCoefficient(1)) && Expression.isConstant(pp.p.getCoefficient(0));
          // a * x + 1 = 0 => a !== 0 && x !== 0 => x = -1 / a
          ok = ok || pp.p.getDegree() === 1 && Expression.isConstant(pp.p.getCoefficient(0)) && !pp.p.getCoefficient(0).equals(Expression.ZERO) && Expression.has(p, Expression.Exponentiation);
          //if (Expression.isSingleVariablePolynomial(p) && pp.v instanceof Expression.Symbol && Expression.getVariable(pp.p.getCoefficient(0)) != null && Expression.getVariable(pp.p.getCoefficient(0)).compare4Multiplication(pp.v) > 0) {
          //  ok = ok || pp.p.getDegree() === 1 && Expression.isConstant(pp.p.getCoefficient(1));
          //}
          //if ((pp.p.getCoefficient(1) instanceof Expression.Integer || polynomial.divideAndRemainder(pp.p, "undefined") != undefined || (!pp.p.getCoefficient(0).equals(Expression.ZERO) && Expression.isConstant(pp.p.getCoefficient(0)))) &&
          //    (!newMethodEnabled || Expression.isConstant(pp.p.getCoefficient(0)) || (pp.p.getCoefficient(1) instanceof Expression.Integer && Expression.isSingleVariablePolynomial(polynomial.calcAt(pp.p.getCoefficient(0).negate().divide(pp.p.getCoefficient(1)))))) && //!? new 2020-06-18
          //    !(p instanceof Expression.Symbol) || (polynomial.calcAt(pp.p.getCoefficient(0).negate().divide(pp.p.getCoefficient(1))) instanceof Expression.Integer)) {//TODO: replace only if the result is more simple (?): a*v != 0 or b != 0
          if (ok) {
            var alpha = pp.p.getCoefficient(0).negate().divide(pp.p.getCoefficient(1));
            //var polynomial = Polynomial.toPolynomial(p, pp.v);
            //var a = polynomial.calcAt(alpha);
            var a = Expression._substitute(p, pp.v, alpha, {uniqueObject: 1});
            if (!a.equals(p)) {
              var tmp = {
                operator: pOperator,
                expression: a
              };
              newArray = add(newArray, tmp);
              if (newArray == null) {
                return null;
              }
              if (true) {
                return addRest(newArray, oldArray, i, other);
              } else {
                y = other;
              }
            } else {
              newArray.push(x);
            }
          } else {
            newArray.push(x);
          }
        } else {
          newArray.push(x);
        }
        } else {
          newArray.push(x);
        }
      }
    }
    newArray.push(y);

    /*
    var allNEZ = function* (array) {
      for (var i = 0; i < array.length; i += 1) {
        var y = array[i];
        if (y.operator === Condition.EQZ) {
          for (var j = 0; j < array.length; j += 1) {
            var x = array[j];
            if (x.operator === Condition.NEZ) {
              // Condition.TRUE.andNotZero(ExpressionParser.parse('b*c-a*d')).andZero(ExpressionParser.parse('2*b*c-2*a*d+b*c*d+c*d-a*d^2')) + ''
              // consider y = x * q + r, where q is not zero
              // then y != r

              var pivot = getPivotMonomial(x.expression);
              var p = pivot.divide(Expression.getConstant(pivot));
              for (var a of y.expression.summands()) {
                if (a.gcd(p).equals(p) || a.gcd(p).equals(p.negate())) {
                  var q = a.divide(pivot);
                  if (q instanceof Expression.Integer && !q.equals(Expression.ZERO)) {//TODO: when q is a multiplicaiton of other != 0 conditions
                    //?TODO: prevent infinite loop: how?
                    var r = y.expression.subtract(q.multiply(x.expression));
                    //if (oldArray.length < add(oldArray.slice(0), {expression: r, operator: Condition.NEZ}).length) {//?TODO: better way
                    //  return addRest(add(add(newArray, x), {expression: r, operator: Condition.NEZ}), oldArray, i - 1, y);
                    //}
                    yield r;
                  }
                }
              }
            }
          }
        }
      }

    };

    for (var i = 0; i < newArray.length; i += 1) {
      var y = newArray[i];
      if (y.operator === Condition.EQZ) {
        for (var nez of allNEZ(newArray)) {
          var g = y.expression.gcd(nez);
          if (!g.equals(Expression.ONE) && !g.equals(Expression.ONE.negate())) {
            return add(newArray, {expression: y.expression.divide(g), operator: Condition.EQZ});
          }
        }
      }
    }
    */

    //?
    //TODO: only when multiple variables and has `f != 0`
    //TODO: test with replacements
    //TODO: !!!
    if (newMethodEnabled && true) {
    var base = new Condition(newArray);
    for (var i = 0; i < newArray.length; i += 1) {
      var y = newArray[i];
      if (y.operator === Condition.EQZ) {
        var f = y.expression;
        /*
        //if (!Expression.isSingleVariablePolynomial(f)) {// performace (?)
          if (!Expression.isConstant(f.divide(Expression.simpleDivisor(f)))) {
            while (!Expression.isConstant(f)) {
              var d = Expression.simpleDivisor(f);
              var q = f.divide(d);
              if (new Condition(newArray.slice(0, i).concat(newArray.slice(i + 1))).andZero(d).isFalse()) { // TODO: fix
                return add(newArray, {expression: d, operator: Condition.NEZ});
              }
              f = q;
            }
          }
        //}
        */
          var g = null;
          for (var s of f.summands()) {
            var a = s.divide(Expression.getConstant(s));
            if (g == null) {
              g = a;
            } else {
              g = g.gcd(a);
            }
          }
          if (!g.equals(Expression.ONE) && f instanceof Expression.Addition) {
            // can g be equal to 0 ?
            if (new Condition(newArray.slice(0, i).concat(newArray.slice(i + 1))).andZero(g).isFalse()) { // TODO: fix
              return add(newArray, {expression: g, operator: Condition.NEZ});
            }
          }

      }
    }
    }
    //?

    return newArray;
  };
  
  //!new 2021-10-06
  if (e instanceof Expression.Division) {//TODO: !?
    return this._and(operator, e.getNumerator()).andNotZero(e.getDenominator());
  }
  //TODO: other cases, other types
  var c = this;
  if (true && operator === Condition.EQZ) {
    const getVariable1 = function (e) {
      var candidate = undefined;
      for (var s of e.summands()) {
        for (var f of s.factors()) {
          var b = f instanceof Expression.Exponentiation ? f.a : f;
          if (b instanceof Expression.Symbol) {
            if (candidate == undefined || b.symbol < candidate.symbol) {
              candidate = b;
            }
          }
        }
      }
      return candidate;
    };
    const v = getVariable1(e);
    if (v != undefined && Polynomial.of(e)._hasIntegerLikeCoefficients()) { // a^(1/2) or a/2
      const ep = Polynomial.toPolynomial(e, v);
      for (var x of this.array) {
        if (x.operator === Condition.EQZ) {
          if (Polynomial.of(x.expression)._hasIntegerLikeCoefficients() && getVariable1(x.expression).symbol >= v.symbol) {
            const xp = Polynomial.toPolynomial(x.expression, v);
            if (xp.getDegree() >= 1) {
              var g = Polynomial.polynomialGCD(ep, xp);//TODO: !?
              if (g.getDegree() === 0) { // it is slow to compute resultant, while it should be zero when gcd != 1
                const res = Polynomial.resultant(ep, xp);
                c = c.andZero(res);
                if (c.isFalse()) {
                  return c;
                }
              }
            }
          }
        }
      }
    }
  }
  //!
  
  var newArray = add(c.array, {
    operator: operator,
    expression: e
  });
  if (newArray == null) {
    return Condition.FALSE;
  }
  if (newArray.length === 0) {
    return Condition.TRUE;
  }

  return new Condition(newArray);
};

Condition.prototype.andNotZero = function (e) {
  return this._and(Condition.NEZ, e);
};
Condition.prototype.andZero = function (e) {
  return this._and(Condition.EQZ, e);
};
Condition.prototype.andGreaterZero = function (e) {
  return this._and(Condition.GTZ, e);
};
Condition.prototype.and = function (b) {
  if (!(b instanceof Condition)) {
    throw new TypeError();
  }
  var c = this;
  for (var i = 0; i < b.array.length; i += 1) {
    c = c._and(b.array[i].operator, b.array[i].expression);
  }
  return c;
};
Condition.prototype.isFalse = function () {
  return this === Condition.FALSE;
};
Condition.prototype.isTrue = function () {
  return this === Condition.TRUE;
};
Condition.prototype.toString = function (options) {
  if (this === Condition.TRUE || this === Condition.FALSE) {
    // 1) no need; 2) no way to distinguish TRUE and FALSE
    throw new TypeError();
  }
  if (this.array.length === 0) {
    // assertion
    throw new TypeError();
  }
  var s = '';
  for (var i = 0; i < this.array.length; i += 1) {
    s += (i !== 0 ? ', ' : '') + this.array[i].expression.toString(options) + this.array[i].operator;
  }
  return s;
};

Condition.TRUE = new Condition(new Array(0));
Condition.FALSE = new Condition(undefined);


Condition.prototype.getSolutionFor = function (variable) {
  var condition = this;
  if (condition.array == null) {
    return null;
  }
  for (var i = 0; i < condition.array.length; i += 1) {
    var c = condition.array[i];
    if (c.operator === Condition.EQZ) {
      var p = Polynomial.toPolynomial(c.expression, variable);
      if (p.getDegree() === 1) {
        return p.getroots()[0];
      }
    }
  }
  return null;
};

  Condition.prototype.updateExpression = function (e, options) {
    return this.andNotZero(e).isFalse() ? Expression.ZERO : e;
    //var symbol = new Expression.Symbol('$e');
    //var condition = options && options.flag1 ? this : new Condition(this.array.filter(x => x.expression instanceof Expression.Symbol && x.operator === Condition.EQZ));
    //var c2 = condition.andZero(e.subtract(symbol));
    //return c2.getSolutionFor(symbol);
    //return e;
  };

export default Condition;
