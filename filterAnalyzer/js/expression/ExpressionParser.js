/*jslint plusplus: true, vars: true, indent: 2 */
  import Expression from './Expression.js';
  import Matrix from './Matrix.js';

  //var isAlpha = function (code) {
  //  return (code >= "a".charCodeAt(0) && code <= "z".charCodeAt(0)) ||
  //         (code >= "A".charCodeAt(0) && code <= "Z".charCodeAt(0));
  //};

  // http://en.wikipedia.org/wiki/Operators_in_C_and_C%2B%2B#Operator_precedence

  var LEFT_TO_RIGHT = 0;
  var RIGHT_TO_LEFT = 1;

  var COMMA_PRECEDENCE = 1;
  var EQUALITY_PRECEDENCE = 2;
  var ADDITIVE_PRECEDENCE = 3;
  var MULTIPLICATIVE_PRECEDENCE = 4;
  var UNARY_PRECEDENCE = 6;

  var UNARY_PRECEDENCE_PLUS_ONE = UNARY_PRECEDENCE + 1; // TODO: remove
  var UNARY_PRECEDENCE_PLUS_TWO = UNARY_PRECEDENCE + 2;

  function Operator(name, arity, rightToLeftAssociative, precedence, i) {
    this.name = name;
    this.arity = arity;
    this.rightToLeftAssociative = rightToLeftAssociative;
    this.precedence = precedence;
    this.i = i;
    //this.xyz = isAlpha(name.charCodeAt(0)) && isAlpha(name.charCodeAt(name.length - 1));
  }

  Operator.trigonometry = function (name) {
    return new Operator(name, 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      a = prepareTrigonometricArgument(a);
      return a[name]();
    });
  };
  Operator.simple = function (name) {
    return new Operator(name, 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      return a[name]();
    });
  };



  var UNARY_PLUS = new Operator("+", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (e) {
    return e;
  });
  var UNARY_MINUS = new Operator("-", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (e) {
    return e.negate();
  });

  var prepareTrigonometricArgument = function (a) {
    if (a instanceof Expression.Integer) {
      return new Expression.Degrees(a);
    }
    if (a instanceof Expression.NonSimplifiedExpression) {
      const isGood = function (a) {
        if (a instanceof Expression.NonSimplifiedExpression) {
          return isGood(a.e);
        }
        if (a instanceof Expression.Integer) {
          return true;
        }
        if (a instanceof Expression.Negation) {
          return isGood(a.b);
        }
        if (a instanceof Expression.Multiplication || a instanceof Expression.Addition) {
          return isGood(a.a) && isGood(a.b);
        }
        return false;
      };
      if (isGood(a)) {
        return toDegrees(a);
      }
    }
    return a;
  };

  var toDegrees = function (a) {
    return a instanceof Expression.NonSimplifiedExpression ? new Expression.NonSimplifiedExpression(new Expression.Degrees(a)) : new Expression.Degrees(a);
  };

  var toRadians = function (a) {
    return a instanceof Expression.NonSimplifiedExpression ? new Expression.NonSimplifiedExpression(new Expression.Radians(a)) : new Expression.Radians(a);
  };

  var notSupported = function (a) {
    throw new TypeError();
  };

  var conjugateTranspose = function (a) {
    return a.transpose().complexConjugate();
  };

  var inequalityOperator = function (name, sign) {
    return new Operator(name, 2, LEFT_TO_RIGHT, EQUALITY_PRECEDENCE, function (a, b) {
      return a.transformInequality(b, sign);//TODO:
    });
  };

  var operations = [
    new Operator("=", 2, LEFT_TO_RIGHT, EQUALITY_PRECEDENCE, function (a, b) {
      return a.transformEquality(b);
    }),

    inequalityOperator('≠', '!='),
    inequalityOperator('!=', '!='),
    inequalityOperator('>', '>'),
    inequalityOperator('<', '<'),
    inequalityOperator('⩽', '>='),
    inequalityOperator('⩾', '<='),

    new Operator(";", 2, LEFT_TO_RIGHT, COMMA_PRECEDENCE, function (a, b) {
      return a.transformComma(b);
    }),
    new Operator(",", 2, LEFT_TO_RIGHT, COMMA_PRECEDENCE, function (a, b) {
      return a.transformComma(b);
    }),

    new Operator("+", 2, LEFT_TO_RIGHT, ADDITIVE_PRECEDENCE, function (a, b) {
      return a.add(b);
    }),
    new Operator("-", 2, LEFT_TO_RIGHT, ADDITIVE_PRECEDENCE, function (a, b) {
      return a.subtract(b);
    }),
    new Operator("*", 2, LEFT_TO_RIGHT, MULTIPLICATIVE_PRECEDENCE, function (a, b) {
      return a.multiply(b);
    }),
    new Operator("/", 2, LEFT_TO_RIGHT, MULTIPLICATIVE_PRECEDENCE, function (a, b) {
      return a.divide(b);
    }),
    new Operator("\\", 2, LEFT_TO_RIGHT, MULTIPLICATIVE_PRECEDENCE, function (a, b) {
      return a.inverse().multiply(b);
    }),
    //new Operator("%", 2, LEFT_TO_RIGHT, MULTIPLICATIVE_PRECEDENCE, function (a, b) {
    //  return a.remainder(b);
    //}),
    //UNARY_PLUS,
    //UNARY_MINUS,
    // Exponentiation has precedence as unary operators
    new Operator("^", 2, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a, b) {
      return a.pow(b);
    }),
    new Operator("**", 2, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a, b) {
      return a.pow(b);
    }),
    new Operator(".^", 2, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a, b) {
      return a.elementWisePower(b);
    }),//?
    new Operator("\u221A", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a) {
      return a.squareRoot();
    }),
    new Operator("sqrt", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      return a.squareRoot();
    }),
    new Operator("radical", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      return a.squareRoot();
    }),
    new Operator("\u221B", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a) {
      return a._nthRoot(3);
    }),
    new Operator("cbrt", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      return a._nthRoot(3);
    }),
    new Operator("\u221C", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a) {
      return a._nthRoot(4);
    }),
    new Operator("rank", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a) {
      return a.rank();
    }),
    new Operator("adj", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a) {//?
      return a.adjugate();
    }),
    new Operator("adjugate", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a) {
      return a.adjugate();
    }),
    //new Operator("trace", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a) {
    //  return Expression.transformTrace(a);
    //}),
    new Operator("inverse", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a) {
      return a.inverse();
    }),
    new Operator("det", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a) {//?
      return a.determinant();
    }),
    new Operator("determinant", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a) {
      return a.determinant();
    }),
    new Operator("row-reduce", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a) {
      return a.rowReduce();
    }),
    new Operator("transpose", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a) {
      return a.transpose();
    }),
    //new Operator("^T", 1, LEFT_TO_RIGHT, UNARY_PRECEDENCE, function (a) {
    //  return a.transpose();
    //}),
    //new Operator("^t", 1, LEFT_TO_RIGHT, UNARY_PRECEDENCE, function (a) {
    //  return a.transpose();
    //}),
    new Operator("'", 1, LEFT_TO_RIGHT, UNARY_PRECEDENCE, function (a) {
      return a.transpose();
    }),
    //TODO: https://en.wikipedia.org/wiki/Conjugate_transpose
    new Operator("^*", 1, LEFT_TO_RIGHT, UNARY_PRECEDENCE, conjugateTranspose),
    new Operator("^{*}", 1, LEFT_TO_RIGHT, UNARY_PRECEDENCE, conjugateTranspose),
    new Operator("⃰", 1, LEFT_TO_RIGHT, UNARY_PRECEDENCE, conjugateTranspose),

    //?
    new Operator("solve", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a) {
      return a.transformNoAnswerExpression("solve");//?
    }),

    new Operator("GF2", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a) {
      return a.GF2();
    }),

    new Operator("°", 1, LEFT_TO_RIGHT, UNARY_PRECEDENCE_PLUS_TWO, function (a) {
      return toDegrees(a);
    }),
    new Operator("deg", 1, LEFT_TO_RIGHT, UNARY_PRECEDENCE_PLUS_TWO, function (a) {
      return toDegrees(a);
    }),
    new Operator("rad", 1, LEFT_TO_RIGHT, UNARY_PRECEDENCE_PLUS_TWO, function (a) {
      return toRadians(a);
    }),

    new Operator("exp", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      return a.exp();
    }),
    new Operator("log", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      return a.logarithm();
    }),
    new Operator("lg", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      return a.logarithm().divide(Expression.TEN.logarithm());
    }),
    new Operator("ln", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      return a.logarithm();
    }),

    new Operator("abs", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      return a.abs();
    }),

    new Operator("min", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      return a.min();
    }),
    new Operator("max", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      return a.max();
    }),
    new Operator("gcd", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      return a.gcd();
    }),

    new Operator("conjugate", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      return a.complexConjugate();
    }),
    new Operator("overline", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      return a.complexConjugate();
    }),

    new Operator("\\left", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      return a;
    }),
    new Operator("\\right", 1, LEFT_TO_RIGHT, UNARY_PRECEDENCE_PLUS_ONE, function (a) {
      return a;
    }),
    new Operator("├", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a) { // like \\left
      return a;
    }),
    new Operator("┤", 1, LEFT_TO_RIGHT, UNARY_PRECEDENCE_PLUS_ONE, function (a) { // like \\right
      return a;
    }),

    new Operator("frac", 2, RIGHT_TO_LEFT, UNARY_PRECEDENCE_PLUS_ONE, function (a, b) {
      return a.divide(b);
    }),

    new Operator("!", 1, LEFT_TO_RIGHT, UNARY_PRECEDENCE, function (a) {
      return a.factorial();
    }),
    new Operator("!!", 1, LEFT_TO_RIGHT, UNARY_PRECEDENCE, notSupported), // to not parse 3!! as (3!)!, see https://en.wikipedia.org/wiki/Double_factorial
    new Operator("!!!", 1, LEFT_TO_RIGHT, UNARY_PRECEDENCE, notSupported),
    
    
    new Operator("pseudoinverse", 1, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a) {
      return a.pseudoinverse();
    })
  ];

  function OperationSearchCache() {
    this.map = {};
    this.re = null;
  }

  OperationSearchCache.prototype.append = function (operator) {
    this.map[operator.name.toLowerCase()] = operator;
    this.re = null;
  };
  OperationSearchCache.prototype.getByName = function (name) {
    return this.map[name.toLowerCase()];
  };
  OperationSearchCache.prototype.getRegExp = function () {
    // https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    var escapeRegExp = function (s) {
      // "-" is not escaped
      return s.replace(/[\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };
    // longest: ? "^T" and "^"
    // ignore case
    if (this.re == null) {//TODO: ?
      var names = [];
      for (var name in this.map) {
        if (Object.prototype.hasOwnProperty.call(this.map, name)) {
          names.push(name);
        }
      }
      names.sort(function (a, b) {
        // longest is lesser then shortest when one of strings is a prefix of another
        return a < b && b.lastIndexOf(a, 0) !== 0 || a.lastIndexOf(b, 0) === 0 ? -1 : +1;
      });
      const separator = String.fromCharCode(0x0000);
      this.re = new RegExp('^(?:' + escapeRegExp(names.join(separator)).split(separator).join('|').replace(/\|ch\|/g, '|ch(?!i)|').replace(/\|th\|/g, '|th(?!eta)|') + ')', 'i');
    }
    return this.re;
  };

  var operationSearchCache = new OperationSearchCache();
  var trigonometryFunctions = {};

  var i = -1;
  while (++i < operations.length) {
    operationSearchCache.append(operations[i]);
  }
  for (const name of 'cos sin tan cot'.split(' ')) {
    operationSearchCache.append(Operator.trigonometry(name));
    trigonometryFunctions[name] = true;
  }
  for (const name of 'cosh sinh tanh coth arccos arcsin arctan arccot arcosh arsinh artanh arcoth'.split(' ')) {
    operationSearchCache.append(Operator.simple(name));
  }

  var nextToken = function (tokenizer) {
    var token = null;
    do {
      token = tokenizer.next();
    } while (token.type === 'whitespace');
    return token;
  };

  var parsePunctuator = function (tokenizer, token, punctuator) {
    if (token.type !== 'punctuator' || token.value !== punctuator) {
      ExpressionParser.startPosition = tokenizer.previousPosition;
      ExpressionParser.endPosition = tokenizer.position;
      ExpressionParser.input = tokenizer.input;
      if (token.type === 'EOF') {
        throw new RangeError("UserError: unexpected end of input, '" + punctuator + "' expected");
      }
      throw new RangeError("UserError: unexpected '" + tokenizer.input.slice(tokenizer.previousPosition, tokenizer.position) + "', '" + punctuator + "' expected");
    }
    token = nextToken(tokenizer);
    return token;
  };

  function ParseResult(result, token) {
    this.result = result;
    this.token = token;
  }

  var parseMatrix = function (tokenizer, token, context) {
    var openingBracket = "{";
    var closingBracket = "}";

    var rows = [];
    var hasNextRow = true;
    while (hasNextRow) {
      token = parsePunctuator(tokenizer, token, openingBracket);
      var row = [];
      var hasNextCell = true;
      while (hasNextCell) {
        var tmp = parseExpression(tokenizer, token, context, COMMA_PRECEDENCE, undefined);
        token = tmp.token;
        row.push(tmp.result);
        if (token.type === 'punctuator' && token.value === ",") {
          hasNextCell = true;
          token = nextToken(tokenizer);
        } else {
          hasNextCell = false;
        }
      }
      token = parsePunctuator(tokenizer, token, closingBracket);
      rows.push(row);
      if (token.type === 'punctuator' && token.value === ",") {
        hasNextRow = true;
        token = nextToken(tokenizer);
      } else {
        hasNextRow = false;
      }
    }
    token = parsePunctuator(tokenizer, token, "}");
    return new ParseResult(context.wrap(Expression.Matrix.fromArray(rows)), token);
  };

  var parseLaTeXMatrix = function (tokenizer, token, context, rowSeparator) {
    var rows = [];
    var firstRow = true;
    while (firstRow || (token.type === 'punctuator' && token.value === rowSeparator)) {
      if (firstRow) {
        firstRow = false;
      } else {
        token = nextToken(tokenizer);
      }
      var row = [];
      var firstCell = true;
      while (firstCell || token.type === 'punctuator' && token.value === "&") {
        if (firstCell) {
          firstCell = false;
        } else {
          token = nextToken(tokenizer);
        }
        var tmp = parseExpression(tokenizer, token, context, COMMA_PRECEDENCE, undefined);
        token = tmp.token;
        row.push(tmp.result);
      }
      rows.push(row);
    }
    return new ParseResult(context.wrap(Expression.Matrix.fromArray(rows)), token);
  };

  var parseLaTeXArgument = function (tokenizer, token, context) {
    return parseExpression(tokenizer, token, context, 0, undefined);
  };

  var getVulgarFraction = function (vulgarFraction) {
    var input = normalizeVulgarFractions(vulgarFraction).replace(/[\u2044]/g, "/");
    var e = Expression.Integer.fromString(input.slice(0, input.indexOf('/'))).divide(Expression.Integer.fromString(input.slice(input.indexOf('/') + '/'.length)));
    return e;
  };

  var getDecimalFraction = function (integerPart, nonRepeatingFractionalPart, repeatingFractionalPart, exponentPart) {
    var numerator = Expression.ZERO;
    var denominator = Expression.ONE;

    if (integerPart != undefined) {
      numerator = Expression.Integer.fromString(integerPart);
    }
    if (nonRepeatingFractionalPart != undefined) {
      var factor = Expression.pow(Expression.TEN, nonRepeatingFractionalPart.length);
      numerator = numerator.multiply(factor).add(Expression.Integer.fromString(nonRepeatingFractionalPart));
      denominator = denominator.multiply(factor);
    }
    if (repeatingFractionalPart != undefined) {
      var factor = Expression.pow(Expression.TEN, repeatingFractionalPart.length).subtract(Expression.ONE);
      numerator = numerator.multiply(factor).add(Expression.Integer.fromString(repeatingFractionalPart));
      denominator = denominator.multiply(factor);
    }
    if (exponentPart != undefined) {
      var exponent = 0 + Number(exponentPart);
      var factor = Expression.pow(Expression.TEN, exponent < 0 ? -exponent : exponent);
      if (exponent < 0) {
        denominator = denominator.multiply(factor);
      } else {
        numerator = numerator.multiply(factor);
      }
    }

    var value = numerator.divide(denominator);
    return value;
  };
  ExpressionParser._getDecimalFraction = getDecimalFraction;

  var parseDecimalFraction = function (tokenizer, token, context) {
    var isOnlyInteger = true;
    var result = undefined;
    if (token.type === 'integerLiteral') {
      result = Expression.Integer.fromString(token.value);
      result = context.wrap(result);
      token = nextToken(tokenizer);
    } else if (token.type === 'numericLiteral') {
      var value = token.value;
      //var match = token.match;
      var match = decimalFractionWithGroups.exec(value);
      isOnlyInteger = false;
      if (!context.needsWrap) {
        result = getDecimalFraction(match[1], match[2], match[3], match[4]);
      } else {
        result = new Expression.DecimalFraction(match[1], match[2], match[3], match[4]);
      }
      result = context.wrap(result);
      token = nextToken(tokenizer);
    }
    //!
    if (isOnlyInteger || result == undefined) {
      if (token.type === 'vulgarFraction') {
        var fraction = context.wrap(getVulgarFraction(token.value, context));
        if (result != undefined) {
          result = result.add(fraction).addPosition(tokenizer.previousPosition, tokenizer.previousPosition, tokenizer.input);
        } else {
          result = fraction;
        }
        token = nextToken(tokenizer);
      }
    }
    return result != undefined ? new ParseResult(result, token) : undefined;
  };

  // TODO: sticky flags - /\s+/y
  var whiteSpaces = /^\s+/;
  var punctuators = /^(?:[,&(){}|■@]|\\\\|(?:\\begin|\\end)(?:\{[bvp]?matrix\})?)/;
  var integerLiteral = /^\d+(?![\d.])(?![eEЕ]|اس)(?!,(?:\d|\(\d+\)))/; // for performance
  var integerLiteralWithoutComma = /^\d+(?![\d.])(?![eEЕ]|اس)/; // for performance
  var decimalFraction = /^(?=[.,]?\d)\d*(?:(?:[.]|[.,](?=\d|\(\d+\)))\d*(?:\(\d+\))?)?(?:(?:[eEЕ]|اس)[\+\-]?\d+)?/;
  var decimalFractionWithoutComma = new RegExp(decimalFraction.source.replace(/,/g, ''));
  // Base Latin, Base Latin upper case, Base Cyrillic, Base Cyrillic upper case, Greek alphabet
  // + https://en.wikipedia.org/wiki/Modern_Arabic_mathematical_notation#Mathematical_letters
  const greek = "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho varsigma sigma tau upsilon phi chi psi omega".split(" ");
  const ARABIC_MATHEMATIC_LETTER = /(?:[\u0627\u066E\u062D\u062F\u0633\u0634\u0635\u0639\u0637\u06BE\u062A]|\u062d\u0640\u0640\u0640\u0640)(?![\u0600-\u06FF])/;
  var symbols = new RegExp(/^(?:GREEK|circ|∞|[a-zA-Zа-яА-Яα-ωß]|ARABIC_MATHEMATIC_LETTER)(?:\_[0-9]+|\_\([a-z0-9]+,[a-z0-9]+\)|[\u2080-\u2089]+)?/.source.replace(/GREEK/g, greek.join('|')).replace(/ARABIC_MATHEMATIC_LETTER/g, ARABIC_MATHEMATIC_LETTER.source));
  var superscripts = /^[\u00B2\u00B3\u00B9\u2070\u2071\u2074-\u207F]+/; // superscript characters "2310i456789+−=()n"
  var vulgarFractions = /^[\u00BC-\u00BE\u2150-\u215E]/;
  //var other = /^\S/u;
  var other = /^(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|\S)/; // should not split surrogate pairs (for Tokenizer and other things)

  var decimalFractionWithGroups = /^(\d+)?(?:[.,](\d+)?(?:\((\d+)\))?)?(?:(?:[eEЕ]|اس)([\+\-]?\d+))?$/;

  // s.normalize("NFKD")
  var normalizeSuperscripts = function (s) {
    return s.replace(/[\u00B2\u00B3\u00B9\u2070\u2071\u2074-\u207F]/g, function (c) {
      var charCode = c.charCodeAt(0);
      if (charCode === 0x00B2) {
        return "2";
      }
      if (charCode === 0x00B3) {
        return "3";
      }
      if (charCode === 0x00B9) {
        return "1";
      }
      var i = charCode - 0x2070;
      return "0i  456789+-=()n".slice(i, i + 1);
    });
  };

  // s.normalize("NFKD")
  var normalizeVulgarFractions = function (s) {
    return s.replace(/[\u00BC-\u00BE\u2150-\u215E]/g, function (c) {
      var charCode = c.charCodeAt(0);
      var i = charCode - 0x2150 < 0 ? (charCode - 0x00BC) * 2 : (3 + charCode - 0x2150) * 2;
      return "141234171911132315253545165618385878".slice(i, i + 2).replace(/^\S/g, "$&\u2044").replace(/1\u20441/g, "1\u204410");
    });
  };

  var normalizeSubscripts = function (s) {
    var i = s.length - 1;
    while (i >= 0 && s.charCodeAt(i) >= 0x2080 && s.charCodeAt(i) <= 0x2089) {
      i -= 1;
    }
    return i === s.length - 1 ? s : s.slice(0, i + 1) + "_" + s.slice(i + 1).replace(/[\u2080-\u2089]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) - 0x2080 + "0".charCodeAt(0));
    });
  };

  var normalizeGreek = function (s) {
    var i = s.indexOf("_");
    var k = i === -1 ? s.length : i;
    if (k > 1) {
      var name = s.slice(0, k);
      var j = greek.indexOf(name);
      if (j !== -1) {
        return String.fromCharCode(0x03B1 + j) + s.slice(k);
      }
    }
    return s;
  };

  var parseExpression = function (tokenizer, token, context, precedence, left) {
    var ok = true;
    var isDecimalFraction = false;
    var tmp = undefined;
    var right = undefined;
    //!

    while (token.type !== 'EOF' && ok) {
      var op = undefined;
      var operand = undefined;

        var bestMatch = token.type === 'operator' || (token.type === 'punctuator' && token.value === ',') ? operationSearchCache.getByName(token.value) : null;
        if (bestMatch != null) {
          op = left == null && bestMatch.name === '+' ? UNARY_PLUS : (left == null && bestMatch.name === '-' ? UNARY_MINUS : bestMatch);
        }
        //  if (Input.startsWith(input, position, '\\begin') || Input.startsWith(input, position, '\\end')) {
        //    op = null;
        //  }

      //if (op != null && op.name === "\\" && Input.startsWith(input, position, "\\\\")) {
      //  if (isMatrixElement) {//TODO: optimize
      //    op = null;
        //} else if (Input.startsWith(input, position + 1, "begin") || Input.startsWith(input, position + 1, "left")) {
        //  op = null;
      //  }
      //}

      if (op != null && op.name === "frac") { // !isAlpha(Input.getFirst(input, position + "frac".length))
        if (!(left == null && precedence <= UNARY_PRECEDENCE_PLUS_ONE || precedence < MULTIPLICATIVE_PRECEDENCE)) {
          ok = false;
        } else {
        // https://en.wikipedia.org/wiki/Operand#Positioning_of_operands - prefix notation

        token = nextToken(tokenizer);
        tmp = parseExpression(tokenizer, token, context, MULTIPLICATIVE_PRECEDENCE, undefined);
        var a = tmp.result;
        token = tmp.token;
        tmp = parseExpression(tokenizer, token, context, MULTIPLICATIVE_PRECEDENCE, undefined);
        var b = tmp.result;
        token = tmp.token;
        // addPosition - ?
        operand = op.i(a, b);
        ok = true;
        }
      } else if (op != undefined) {
        // TODO: check if the checks are needed (tests - ?)
        if (!(left != undefined && (op.arity !== 1 || op.rightToLeftAssociative !== RIGHT_TO_LEFT || precedence < MULTIPLICATIVE_PRECEDENCE) ||
              left == undefined && op.arity === 1 && op.rightToLeftAssociative === RIGHT_TO_LEFT) ||
            //!(!candidate.xyz || !isAlpha(Input.getFirst(input, position + candidate.name.length))) ||//TODO: fix - ExpressionParser.parse("George")
            precedence > op.precedence + (op.rightToLeftAssociative === RIGHT_TO_LEFT ? 0 : -1)) {
          ok = false;
        } else {
          var operatorPosition = tokenizer.previousPosition;
          token = nextToken(tokenizer);
          if (op.arity === 1 && op.rightToLeftAssociative !== RIGHT_TO_LEFT) {
            //TODO: fix
            ExpressionParser.startPosition = operatorPosition;
            ExpressionParser.endPosition = operatorPosition + op.name.length;
            ExpressionParser.input = tokenizer.input;
            left = op.i(left).addPosition(operatorPosition, op.name.length, tokenizer.input);
          } else {
            if (op.arity === 1 && op.rightToLeftAssociative === RIGHT_TO_LEFT && op.precedence === UNARY_PRECEDENCE_PLUS_ONE && op.name.length > 1 &&
                trigonometryFunctions[op.name] === true &&
                (token.type === 'operator' && token.value === '^' || token.type === 'superscript' && /^\d+$/.test(normalizeSuperscripts(token.value)))) {
              // https://en.wikipedia.org/wiki/Exponentiation#Exponential_notation_for_function_names

              // cos^2(x)
              //!new 2017-11-04
              // parse an operator for the exponentiation
              var exponentiationPosition = tokenizer.position;

              var exponentiationLength = 0;
              var middle = null;
              if (token.type === 'superscript') {
                middle = Expression.Integer.fromString(normalizeSuperscripts(token.value));
                exponentiationLength = tokenizer.position - tokenizer.previousPosition;
                token = nextToken(tokenizer);
              } else {
                exponentiationLength = '^'.length;
                token = nextToken(tokenizer);
                if (token.type !== 'integerLiteral') {
                  ok = false;
                } else {
                  tmp = parseExpression(tokenizer, token, context, UNARY_PRECEDENCE, undefined);
                  middle = tmp.result;
                  token = tmp.token;
                }
              }
              if (ok) {
                // parse an operator for the current operator
                tmp = parseExpression(tokenizer, token, context, op.precedence, undefined);
                right = tmp.result;
                token = tmp.token;
                operand = op.i(right).addPosition(operatorPosition, op.name.length, tokenizer.input).pow(middle).addPosition(exponentiationPosition, exponentiationLength, tokenizer.input);
              }
            } else {
              tmp = parseExpression(tokenizer, token, context, op.precedence, undefined);
              right = tmp.result;
              token = tmp.token;
              //TODO: fix `1/(2-2)`
              ExpressionParser.startPosition = operatorPosition;
              ExpressionParser.endPosition = operatorPosition + op.name.length;
              ExpressionParser.input = tokenizer.input;
              if (op.arity === 1) {
                // left <implicit multiplication> operand
                operand = op.i(right).addPosition(operatorPosition, op.name.length, tokenizer.input);
              } else if (op.arity === 2) {
                left = op.i(left, right).addPosition(operatorPosition, op.name.length, tokenizer.input);
              } else {
                throw new RangeError();
              }
            }
          }
        }
      } else if (left == undefined || precedence < MULTIPLICATIVE_PRECEDENCE || (precedence === UNARY_PRECEDENCE_PLUS_ONE && isDecimalFraction && token.type === 'symbol')) {
        if ((tmp = parseDecimalFraction(tokenizer, token, context)) != undefined) {
          operand = tmp.result;
          token = tmp.token;
          isDecimalFraction = true;
        } else if (token.type === 'punctuator' && token.value === "(") {
          token = parsePunctuator(tokenizer, token, "(");
          tmp = parseExpression(tokenizer, token, context, 0, undefined);
          operand = tmp.result;
          token = tmp.token;
          token = parsePunctuator(tokenizer, token, ")");
        } else if (token.type === 'punctuator' && token.value === "{") {
          token = parsePunctuator(tokenizer, token, "{");
          if (token.type === 'punctuator' && token.value === "{") {
            tmp = parseMatrix(tokenizer, token, context);
            operand = tmp.result;
            token = tmp.token;
          } else {
            tmp = parseLaTeXArgument(tokenizer, token, context);
            operand = tmp.result;
            token = tmp.token;
            token = parsePunctuator(tokenizer, token, "}");
          }
        } else if (token.type === 'punctuator' && (token.value === "\\begin{bmatrix}" ||
                                                   token.value === "\\begin{vmatrix}" ||
                                                   token.value === "\\begin{pmatrix}" ||
                                                   token.value === "\\begin{matrix}")) {
          var kind = token.value.slice('\\begin{'.length, -1);
          token = nextToken(tokenizer);
          tmp = parseLaTeXMatrix(tokenizer, token, context, '\\\\');
          operand = tmp.result;
          token = tmp.token;
          if (token.type === 'punctuator' && token.value === "\\end{" + kind + "}") {
            token = nextToken(tokenizer);
          }
          if (kind === 'vmatrix') {
            operand = operand.determinant();//!
          }
        } else if (token.type === 'symbol') {
          var symbolName = token.value;
          symbolName = normalizeSubscripts(symbolName);
          symbolName = normalizeGreek(symbolName);
          operand = context.get(symbolName);
          operand = context.wrap(operand);
          token = nextToken(tokenizer);
        } else if (token.type === 'punctuator' && token.value === "|") {
          if (left == undefined || Expression.isScalar(left) && precedence < COMMA_PRECEDENCE) {//!
            token = parsePunctuator(tokenizer, token, "|");
            tmp = parseExpression(tokenizer, token, context, COMMA_PRECEDENCE, undefined);
            operand = tmp.result;
            token = tmp.token;
            token = parsePunctuator(tokenizer, token, "|");
            if (Expression.isScalar(operand)) {//TODO: !?
              operand = operand.abs();
            } else {
              operand = operand.determinant();//!
            }
          } else if (precedence < COMMA_PRECEDENCE) {
            //TODO: fix
            token = parsePunctuator(tokenizer, token, "|");
            tmp = parseExpression(tokenizer, token, context, 0, undefined);
            operand = tmp.result;
            token = tmp.token;
            operand = left.augment(operand);
            left = undefined;
          } else {
            ok = false;
          }
        } else if (token.type === 'punctuator' && token.value === '■') {
          token = nextToken(tokenizer);
          token = parsePunctuator(tokenizer, token, '(');
          tmp = parseLaTeXMatrix(tokenizer, token, context, '@');
          operand = tmp.result;
          token = tmp.token;
          token = parsePunctuator(tokenizer, token, ')');
        } else {
          ok = false;
        }
      } else {
        ok = false;
      }

      //!TODO: fix
      if (!ok && left != undefined && precedence <= UNARY_PRECEDENCE + (RIGHT_TO_LEFT === RIGHT_TO_LEFT ? 0 : -1)) {
        if (token.type === 'superscript') {
          // implicit exponentiation
          //TODO: check position
          var x = ExpressionParser.parse(normalizeSuperscripts(token.value), context);//?
          left = left.pow(x).addPosition(tokenizer.previousPosition, tokenizer.previousPosition, tokenizer.input);
          token = nextToken(tokenizer);
          ok = true;//!
        }
      }

      if (!ok && token.type === 'operator' && token.value === "\\") { // isAlpha(Input.getFirst(input, position + 1))
        // TODO: LaTeX - ?
        ok = true;
        token = nextToken(tokenizer);
      }

      if (operand != undefined) {
        if (left != undefined) {
          // implied multiplication
          var oldPosition = tokenizer.position;
          tmp = parseExpression(tokenizer, token, context, MULTIPLICATIVE_PRECEDENCE, operand);
          var right1 = tmp.result;
          token = tmp.token;
          left = left.multiply(right1).addPosition(oldPosition, "*".length, tokenizer.input);
        } else {
          left = operand;
        }
      }
    }

    if (left == undefined) {
      ExpressionParser.startPosition = tokenizer.previousPosition;
      ExpressionParser.endPosition = tokenizer.position;
      ExpressionParser.input = tokenizer.input;
      if (token.type === 'EOF') {
        throw new RangeError("UserError: unexpected end of input");//TODO: fix
      }
      //TODO: ?
      throw new RangeError("UserError: unexpected '" + tokenizer.input.slice(tokenizer.previousPosition, tokenizer.position) + "'");//TODO: fix
    }
    return new ParseResult(left, token);
  };

  const decimalNumberRegExp = new RegExp('\\p{Decimal_Number}', 'u');
  const replaceSimpleDigit = function (codePoint) {
    let i = 0;
    while (decimalNumberRegExp.test(String.fromCodePoint(codePoint - i))) {
      i += 1;
    }
    return i === 0 ? -1 : (i - 1) % 10;
  };
  
  const map = {
    ":": "/",
    "[": "(",
    "]": ")",
    "·": "*",
    "×": "*",
    "÷": "/",
    "ˆ": "^",
    "ϕ": "φ",
    "А": "A",
    "В": "B",
    "С": "C",
    "Т": "T",
    "а": "A",
    "в": "B",
    "с": "C",
    "т": "T",
    "،": ",",
    "٫": ",",
    "\u200B": " ",
    "‐": "-",
    "‑": "-",
    "‒": "-",
    "–": "-",
    "—": "-",
    "―": "-",
    "•": "*",
    "\u2061": " ",
    "\u2062": "*",
    "\u2063": ",",
    "\u2064": " ",
    "ⅇ": "e",
    "ⅈ": "i",
    "−": "-",
    "∕": "/",
    "∙": "*",
    "≤": "⩽",
    "≥": "⩾",
    "⋅": "*",
    "│": "|",
    "█": "■",
    "✓": "√",
    "〇": "0",
    "〖": "(",
    "〗": ")",
    "ー": "-",
    "一": "1",
    "七": "7",
    "三": "3",
    "九": "9",
    "二": "2",
    "五": "5",
    "八": "8",
    "六": "6",
    "四": "4"
  };


    //if (charCode === "Х".charCodeAt(0)) {
    //  return "X";
    //}
    //if (charCode === "х".charCodeAt(0)) {
    //  return "X";
    //}
    // 0x003A - Deutsch
    // "\u2064" is replaced by " ", not "+", as "+" has smaller priority
    // "ϕ".normalize("NFKD") === "φ"
    //if (/\p{Cf}/u.test(String.fromCodePoint(codePoint))) {
    //  return " ".charCodeAt(0);
    //}
    // hanidec digits

  const isBidiControl = function (codePoint) {
    // /\p{Bidi_Control}/u.test(String.fromCodePoint(codePoint))
    return codePoint === 0x061C ||
           codePoint === 0x200E ||
           codePoint === 0x200F ||
           codePoint >= 0x202A && codePoint <= 0x202E ||
           codePoint >= 0x2066 && codePoint <= 0x2069;
  };

  var getCodePointReplacement = function (codePoint) {
    if (codePoint >= 0xFF01 && codePoint <= 0xFF5E) {
      // normalize full-width forms:
      return codePoint - 0xFF01 + 0x0021;
    }
    var digit = replaceSimpleDigit(codePoint);
    if (digit !== -1) {
      return digit + "0".charCodeAt(0);
    }
    if (isBidiControl(codePoint)) {
      return " ".charCodeAt(0);
    }
    if (codePoint >= 0x0000 && codePoint <= 0xFFFF) {
      // today map contains only BMP characters in keys and values
      var replacement = map[String.fromCharCode(codePoint)];
      if (replacement != undefined && replacement.length === 1) {
        return replacement.charCodeAt(0);
      }
    }
    return -1;
  };

  //input = input.replace(replaceRegExp, replaceFunction); - slow in Chrome
  var replaceSomeChars = function (input) {
    var lastIndex = 0;
    var result = '';
    var i = 0;
    while (i < input.length) {
      const codePoint = input.codePointAt(i);
      var width = codePoint <= 0xFFFF ? 1 : 2;
      if (codePoint > 0x007F || codePoint === 0x003A || codePoint === 0x005B || codePoint === 0x005D) {
        var x = getCodePointReplacement(codePoint);
        if (x !== -1) {
          if (!(x >= 0x0000 && x <= 0xFFFF)) {
            throw new RangeError(); // assertion
          }
          result += input.slice(lastIndex, i);
          result += String.fromCharCode(x);
          lastIndex = i + width;
        }
      }
      i += width;
    }
    result += input.slice(lastIndex);
    return result;
  };

  var config = [
    {type: 'integerLiteral', re: null},
    {type: 'numericLiteral', re: null},
    {type: 'whitespace', re: whiteSpaces},
    {type: 'punctuator', re: punctuators},
    {type: 'operator', re: null},
    {type: 'symbol', re: symbols},
    {type: 'vulgarFraction', re: vulgarFractions},
    {type: 'superscript', re: superscripts},
    {type: 'OTHER', re: other}
  ];

  function Token(type, value) {
    this.type = type;
    this.value = value;
  }

  Token.EOF = new Token('EOF', '');

  function Tokenizer(input, position, states) {
    this._preparedInput = replaceSomeChars(input.slice(position)); //TODO: fix ???
    this.input = input;
    this._preparedInputPosition = 0;
    this.previousPosition = position;
    this.position = position;
    this.states = states;
  }

  Tokenizer.prototype.next = function () {
    this.previousPosition = this.position;
    if (this.position >= this.input.length) {
      return Token.EOF;
    }
    // iteration by object keys is slower (?)
    for (var i = 0; i < config.length; i += 1) {
      var c = config[i];
      var type = c.type;
      var re = c.re;
      if (re == null) {
        if (type === 'integerLiteral') {
          if (this.states != null && this.states.value === '{}') {
            re = integerLiteralWithoutComma;
          } else {
            re = integerLiteral;
          }
        } else if (type === 'numericLiteral') {
          if (this.states != null && this.states.value === '{}') {
            re = decimalFractionWithoutComma;
          } else {
            re = decimalFraction;
          }
        } else if (type === 'operator') {
          re = operationSearchCache.getRegExp();//?TODO:
        }
      }
      var tmp = re.exec(this._preparedInput.slice(this._preparedInputPosition));
      if (tmp != null) {
        var value = tmp[0];
        if (type === 'punctuator') {
          if (value === '(') {
            this.states = {previous: this.states, value: '()'};
          } else if (value === ')') {
            if (this.states != null && this.states.value === '()') {
              this.states = this.states.previous;
            }
          } else if (value === '{') {
            this.states = {previous: this.states, value: '{}'};
          } else if (value === '}') {
            if (this.states != null && this.states.value === '{}') {
              this.states = this.states.previous;
            }
          }
        }
        for (var j = 0; j < value.length; j += (value.codePointAt(j) <= 0xFFFF ? 1 : 2)) {
          this.position += this.input.codePointAt(this.position) <= 0xFFFF ? 1 : 2;
        }
        this._preparedInputPosition += value.length;
        return new Token(type, value);
      }
    }
    throw new TypeError();
  };

  var fs = {};//!TODO: remove!!!

  function ExpressionParser() {
  }

  ExpressionParser.parse = function (input, context) {
    context = context == undefined ? new ExpressionParser.Context(undefined, false) : context;

    ExpressionParser.startPosition = -1;
    ExpressionParser.endPosition = -1;
    ExpressionParser.input = input; //?

    // TODO: remove
    if (typeof input !== "string") {
      throw new RangeError();
    }

    if (typeof hit === "function" && context.getter != undefined) {
      var re = /[a-z][a-z][a-z\-]+/gi;
      var m = null;
      while ((m = re.exec(input)) != null) {
        var t = m[0];
        if (!(t in fs) && t.indexOf("-") === -1) {
          fs[t] = true;
          hit({fs: t});
        }
      }
    }

    var tokenizer = new Tokenizer(input, 0, null);
    var token = nextToken(tokenizer);
    var tmp = parseExpression(tokenizer, token, context, 0, undefined);
    token = tmp.token;
    if (token.type !== 'EOF') {
      ExpressionParser.startPosition = tokenizer.previousPosition;
      ExpressionParser.endPosition = tokenizer.position;
      ExpressionParser.input = tokenizer.input;
      throw new RangeError("UserError: unexpected '" + tokenizer.input.slice(tokenizer.previousPosition, tokenizer.position) + "'");
    }

    return tmp.result;
  };

  globalThis.Tokenizer = Tokenizer;

  ExpressionParser.startPosition = -1;
  ExpressionParser.endPosition = -1;
  ExpressionParser.input = "";

  var getConstant = function (symbolName) {
    if (symbolName === "pi" || symbolName === "\u03C0" || symbolName === "\u0637") {
      return Expression.PI;
    }
    if (symbolName === "e" || symbolName === "\u06BE") {
      return Expression.E;
    }
    if (symbolName === "i" || symbolName === "\u062A") {
      return Expression.I;
    }
    if (symbolName === "I" || symbolName === "U" || symbolName === "E") {
      return new Expression.IdentityMatrix(symbolName);
    }
    if (symbolName === "circ") { //TODO: ○ - ?
      return Expression.CIRCLE;
    }
    if (symbolName === "∞") {
      return Expression.INFINITY;
    }
    return new Expression.Symbol(symbolName);
  };

  ExpressionParser.Context = function (getter, needsWrap) {
    this.getter = getter;
    this.needsWrap = needsWrap == undefined ? true : needsWrap;
  };
  ExpressionParser.Context.prototype.get = function (symbolName) {
    if (this.getter != undefined) {
      var x = this.getter(symbolName);
      if (x != undefined) {
        return x;
      }
    }
    return getConstant(symbolName);
  };
  ExpressionParser.Context.prototype.wrap = function (e) {
    if (!this.needsWrap) {
      return e;
    }
    return new Expression.NonSimplifiedExpression(e);
  };

  ExpressionParser.addOperation = function (denotation, arity) {
    //TODO: UNARY_PRECEDENCE -> UNARY_PRECEDENCE_PLUS_ONE - ???
    var newOperation = arity === 1 ? new Operator(denotation, arity, RIGHT_TO_LEFT, UNARY_PRECEDENCE, function (a) {
      return a.transformNoAnswerExpression(denotation);
    }) : new Operator(denotation, arity, RIGHT_TO_LEFT, MULTIPLICATIVE_PRECEDENCE, function (a, b) {
      return a.transformNoAnswerExpression(denotation, b);
    });
    //operations.push(newOperation);
    operationSearchCache.append(newOperation);
  };

  ExpressionParser.addDenotations = function (denotationsByOperation) {
    for (var operationName in denotationsByOperation) {
      if (Object.prototype.hasOwnProperty.call(denotationsByOperation, operationName)) {
        var denotations = denotationsByOperation[operationName];
        var operation = operationSearchCache.getByName(operationName);
        var added = {};
        added[operationName] = true;
        for (var key in denotations) {
          if (Object.prototype.hasOwnProperty.call(denotations, key)) {
            var denotation = denotations[key];
            if (added[denotation] == undefined) {
              added[denotation] = true;
              var newOperation = new Operator(denotation, operation.arity, operation.rightToLeftAssociative, operation.precedence, operation.i);
              //operations.push(newOperation);
              operationSearchCache.append(newOperation);
              if (trigonometryFunctions[operationName]) {
                trigonometryFunctions[denotation] = true;
              }
            }
          }
        }
      }
    }
  };

  export default ExpressionParser;
