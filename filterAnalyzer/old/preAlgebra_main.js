import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';
// import { circuitToLaplace } from './modules/ciruitToLaplace.mjs';

var debugAll = 0;
var debugEliminateEq = 1 && debugAll;

// Initialize htm with Preact
const html = htm.bind(h);

function elementToSvgLocation (element) {
  if (element == "Series Capacitor") return 1000;
  if (element == "Parallel Capacitor") return 500;
  if (element == "Series Inductor") return 2000;
  if (element == "Parallel Inductor") return 1500;
  if (element == "Series Resistor") return 3000;
  if (element == "Series Capacitor") return 2500;
  if (element == "Parallel Resistor") return 3500;
  if (element == "Transmission Line") return 4000;
  console.log("ERROR - YOU CHOSE ELEMENT THAT DOES NOT EXIST")
  return 0;
}


function elementSelector (element) {
  return html`
  <div class="col-6 col-lg-2 schemHover text-center border-top border-bottom border-end border-dark" onclick="clicked_cell(${element})">
    <p class="m-0">${element}</p>
    <svg viewBox="${elementToSvgLocation(element)} 0 500 500"><use xlink:href="svg/elements_w_custom.svg#rainbow3" alt="${element}" /></svg>
  </div>`
}

// function gaussJordan(matrix) {
//   var width = 3;
//   var identity = new Array(width);
//   for (var i = 0; i < width; i++) {
//     identity[i] = new Array(3).fill(0);
//     identity[i][i] = 1;
//   }
// }

function setCharAt(str,index,chr) {
  if(index > str.length-1) return str;
  return str.substring(0,index) + chr + str.substring(index+1);
}

function swapSign(str) {
  // console.log ("pre-print", str);
  if (str[0] == "-") str = setCharAt(str,0,"+");
  else str = setCharAt(str,0,"-");
  // console.log ("post-print", str);
  return str;
}

function gaussJordan(matrix) {
  var i, j, z, q;
  const width = matrix[0].length;

  // var identity = array
  var flipMatrix = new Array(width);
  var identity = new Array(width);
  for (i = 0; i < width; i++) {
    identity[i] = new Array(width).fill("0");
    identity[i][width-1-i] = "1";
    flipMatrix[i] = matrix[width-1-i];
  }
  // console.log (width)
  console.log ("starting", [...flipMatrix])
  // console.log ("starting", identity)
  for (z=0; z<2; z++) {
    //step 1 - eliminate denominators from column z
    for (j=0; j<width; j++) {
      //make flipMatrix[j][0] == (1 or 0 or -1)
      if (flipMatrix[j][z].includes('/')) {
        const denomnSearch = /\/([\w-]+)/g
        for (const match of flipMatrix[j][z].matchAll(denomnSearch)) {
          flipMatrix[j] = multiplyEverything(flipMatrix[j], match[1], true);
          identity[j] = multiplyEverything(identity[j], match[1], true);
          // console.log("bp1. Match = " + match[1] + ", res = " + flipMatrix[j]);
          //step 1.1 - simplify
          flipMatrix[j] = commonEliminate(flipMatrix[j]);
          identity[j] = commonEliminate(identity[j]);
        }
      }
    }

    console.log ("After elimiate denominators in column " + z, [...flipMatrix])


    for (j=0; j<width; j++) {
      //step 2 - eliminate numerators
      //2.1 eliminate sign
      if (flipMatrix[j][z][0] == '-') {
        flipMatrix[j] = multiplyEverything(flipMatrix[j], "-1", true);
        identity[j] = multiplyEverything(identity[j], "-1", true);
      }
      flipMatrix[j] = commonEliminate(flipMatrix[j]);
      identity[j] = commonEliminate(identity[j]);
      //2.2 eliminate value
      if (!((flipMatrix[j][z] == '+(0)') || (flipMatrix[j][z] == '+(1)'))) {
        //FIXME - here - this isn't working!!
        flipMatrix[j] = multiplyEverything(flipMatrix[j], flipMatrix[j][z], false);
        identity[j] = multiplyEverything(identity[j], flipMatrix[j][z], false);
        console.log("bp2. res = " + flipMatrix[j]);
      }
      flipMatrix[j] = commonEliminate(flipMatrix[j]);
      identity[j] = commonEliminate(identity[j]);
    }

    var tmp;
    tmp =  [...flipMatrix];
    console.log ("After elimiate numerators in column " + z, tmp);

    //step 3 - Make column j match the identity matrix. At the moment the column contains 0,1,-1 only.
    for (i=0; i<width; i++) {
      if ((flipMatrix[i][z] != '+(0)') && (flipMatrix[i][z] != '+(1)')) throw 'ERROR - we ended up here that must not happen! This matrix entry is expected to be (1) or (0): ' +  flipMatrix[i][z];
      if ((i!=z) && (flipMatrix[i][z] != '+(0)')) {
        for (q=0; q<width; q++) {
          flipMatrix[i][q] = flipMatrix[i][q] + "-" + flipMatrix[z][q]; 
          identity[i][q] = identity[i][q] + "-" + identity[z][q]; 
        }
        flipMatrix[i] = commonEliminate(flipMatrix[i]);
        identity[i] = commonEliminate(identity[i]);
      }
    }

    console.log ("After row cancellation in column " + z, [...flipMatrix]);


    console.log("ROW NUMBER : ", j);
    console.log("my matrix : ", flipMatrix[j]);
    console.log("my identity : ", identity[j]);
  }

  //since bottom row is always 1 0 0 ... 0, we can create upside down inverse matrix;
}

//adds two arrays element by element
function addRows (row1, row2) {

}

// MNA involves taking iverse of a matrix. But we only care about one entry in that inverse matrix... this function calculates just that one
// Great for a 2-node circuit... not so easy with more nodes
//FIXME - DEPRECATE
function lazyGaussJordan(matrix) {
  // console.log(matrix[0][0])
  //entry -[1][0] / [1][1]
  var res = "("+swapSign(matrix[1][0]) + ")/(" + matrix[1][1]+")";
  // console.log("bpa, " + res);
  return res;
}

// //FIXME - try to depreacte, instead use extractFromParanthesis
// function getInsideParenth (eq, index=0) {
//   // console.lon(eq)
//   var startIndex = index;
//   if (eq[index] != '(') console.log("ERROR - trying to extract parenthesis but there aren't any")
//   var parCnt = 1;
//   index = index+1
//   while (parCnt > 0) {
//     if(index > eq.length-1) {
//       console.log("Couldn't find matching parenthsis inside " + eq + ". Searched to index "+ index)
//       throw '';
//     }
//     if (eq[index] == '(') parCnt = parCnt+1;
//     else if (eq[index] == ')') parCnt = parCnt-1;
//     // console.log ("index = " + index +", character = "+eq[index])
//     index = index + 1;
//   }
//   return [eq.substring(startIndex+1,index-1), index];
// }

// Receives a product of variables (equation only including variable, multiply and divide)
//Cancels out 
// a) excess signs
// b) 1's which are multiplied with variables
// c) variables that exist on top and bottom of equation
// d) 0x something becomes 0.
function eliminateEquation (eq, sign) {
  if(debugEliminateEq) console.log ("Elminate equation. Start -> " + eq);
  //Step 1 - eliminate signs
  var isPositive = true;
  var newEq = "";
  const signSearch = /(-?[A-Z0-9]+)([x\/])?/g
  // console.log(eq.matchAll(signSearch));
  for (const match of eq.matchAll(signSearch)) {
    // console.log(match, newEq)
    if (match[1][0] == '-') {
      isPositive = !isPositive;
      newEq += match[1].substring(1); 
    } else newEq += match[1]
    if (match[2]) newEq += match[2];
  }
  if(debugEliminateEq) console.log ("Elminate equation. After sign elim -> " + newEq + ", (is result positive : " + isPositive +")");

  //Step 2 - remove any '1's
  newEq = newEq.replace ('x1', '');
  const regex1 = /^1x/i;
  newEq = newEq.replace (regex1, '');
  newEq = newEq.replace ('/1', '');
  if(debugEliminateEq) console.log ("Elminate equation. After 1's elim -> " + newEq);


  //Step 3 - remove any 0x... with 0
  const regex2 = /.*x0.*/;
  newEq = newEq.replace (regex2, '0');
  // newEq = newEq.replace ('/1', '');
  if(debugEliminateEq) console.log ("Elminate equation. After 0x elim -> " + newEq);

  //Step 4 - cancel out items on top and bottom
  if (newEq.includes('/')) {
    var top, bottom;
    var index;
    [top, bottom] = newEq.split('/');
      var x = top.split('x');
      var y = bottom.split('x');
      for (var i=0; i<x.length; i++) {
        index = y.indexOf(x[i]);
        if (index >= 0) {
          x.splice(i,1);
          i--; //x has changed so for loop needs to step back
          y.splice(index,1);
        }
      }
      if (x.length > 0) var newTop = x.join('x');
      else var newTop = "1";
      if (y.length>0) newEq = newTop + "/" + y.join('x');
      else newEq = newTop;
  }
  if(debugEliminateEq) console.log ("Elminate equation. After cancel top and bottom -> " + newEq);

  //Step4 - Add the sign back in
  var newsign;
  if (newEq == "0") newsign = "+";
  else if (isPositive && (sign=='-')) newsign = '-';
  else if (!isPositive && (sign=='+')) newsign = '-';
  else newsign = '+';
  newEq = newsign + "(" + newEq + ")";
  // if (!isPositive) newEq = "-" + newEq;
  if(debugEliminateEq) console.log ("Elminate equation. Final result -> " + newEq);


  return newEq;

}

// Extracts contents of 1st level of parenthesis. So (a+(b/c)) / (d+e), it returns res = [a+(b/c), d+e], seperators = [/]
function extractFromParanthesis (eq2) {
  var res = [];
  var seperators = [];
  var tempSep = [];
  var pCnt = 0;
  var pStart = 0;
  var inside = false;
  var tmpPos = true;
  var i, j;
  var eq = String(eq2).replace(/\s/g, "");  //removes whitespace - could do this at the very beginning
  // eq = eq.replace(/\s/g, "");  
  if (!eq.includes('(')) return [[eq], ""];
  for (i=0; i<eq.length; i++) {
    if (eq[i] == '(') {
      if (pCnt == 0) pStart = i;
      pCnt = pCnt+1;
      inside = true;
      for (j=0; j<tempSep.length; j++) if (tempSep[j]=='-') tmpPos = !tmpPos; //go through all the signs between parenthesis, determine final sign
      if (tmpPos) seperators.push("+");
      else seperators.push("-");
      tempSep = [];
      tmpPos = true;
    } 
    else if ((eq[i] == ')')) {
      if (pCnt == 1) {
        res.push(eq.substring(pStart+1,i));
        inside = false;
        // if (i!=(eq.length-1)) seperators.push(eq.substring(i+1,i+2))
      }
      pCnt = pCnt - 1;
    } else if (!inside) tempSep.push(eq.substring(i,i+1))
  }
  return [res, seperators];
}

//FIXME - make a 'solve algebra' function which takes two variable and an operator.
// Move all that code out of here

//multiplies or divides every element in original equation by mx
function multiplyEverything (originalEq, mx, multiply) {
  // console.log("Multiplying ", originalEq, " by ", mx);
  var newEq = [];
  var i, j;
  var res, seperators;
  for (i=0; i<originalEq.length; i++) {
    newEq[i] = "";
    // console.log('pre extract: ' + originalEq[i]);
    if (multiply) {
      [res, seperators] = extractFromParanthesis(originalEq[i])
      for (j=0; j<res.length; j++) {
        newEq[i] += seperators[j]+ "(" + mx + "x" + res[j] + ")";
      }
    } else {
      //it's a divide
      if (originalEq[i].includes('/')) {
        throw 'cant handle this';
        var regex = /(\/.+)/g;
        newEq[i] += seperators[j]+"(" + res[j].replace(regex, "$1x"+mx) + ")";

      } else {
        // throw 'cant handle this - ahhh';
        newEq[i] = originalEq[i] + "/(" + mx + ")";
      }
    }
  }
  return newEq;
}

//Loops thru a matrix row an does a basic simplification eliminateEquation
function commonEliminate (res) {
  var x, y, i, j, index;
  var res2=[];
  var res3=[];
  var plusTerms = []; //list of everything to be added
  var subTerms = []//list of everything to be subtracted
  for (j=0; j<res.length; j++) {
    //simplify the product terms
    [x, y] = extractFromParanthesis(res[j])
    res2[j] = "";
    for (i=0;i<x.length;i++) {
      x[i] = eliminateEquation (x[i], y[i]);
      // res2[j] +=  y[i] + "(" + x[i] + ")";
      res2[j] +=  x[i];
      // if (y[i]) res2[j] += y[i];
    }
    //cancel out the sum terms
    [x, y] = extractFromParanthesis(res2[j])
    plusTerms = []; //list of everything to be added
    subTerms = []//list of everything to be subtracted
    if (x.length==1) {
      //only one element, no cancelling possible
      res3[j] = y[0] + "(" + x[0] + ")";
    } else {
      for (i=0;i<x.length;i++) {
        if (x[i] != "0") {  //if it's 0, remove it
          if (y[i] == "+") plusTerms.push(x[i]);
          else subTerms.push(x[i]);
        }
      }
        //find any terms in both arrays, cancel them out
      for (i=0;i<plusTerms.length;i++) {
        index = subTerms.indexOf(plusTerms[i]);
        if (index >= 0) {
          plusTerms.splice(i,1);
          i--; //x has changed so for loop needs to step back
          subTerms.splice(index,1);
        }
      }
      res3[j] = ""
      if ((plusTerms.length==0) && (subTerms.length==0)) res3[j]="+(0)";
      else {
        for (i=0;i<plusTerms.length;i++) {
          res3[j] = res3[j] + "+("+plusTerms[i]+")"
        }
        for (i=0;i<subTerms.length;i++) {
          res3[j] = res3[j] + "-("+subTerms[i]+")"
        }
      }
    }
    
  }


  return res3;
}

function simplifyEquation (eq) {
  console.log (" ---- ENTERING SPIMPLIFY EQUATION ---- ");
  console.log ('start -> ' + eq)
  var x, y;
  var numerator,denominator,index,i,j;
  var res, seperators;
  [res, seperators] = extractFromParanthesis(eq)

  //Step 1 - remove denominators from the numerator and/or the denominator
  if (res.length>1) {
    //there is a denominator...
    for (i=0; i<2; i++) {
      //searches for / (something), then multiplies everything by (something). 
      //It will make a massive equation
      //later, eliminateEquation will cancel this stuff out
      const denomnSearch = /\/([\w-]+)/g
      for (const match of res[i].matchAll(denomnSearch)) {
        res = multiplyEverything(res, match[1], true);
        console.log("bp1. Match = " + match[1] + ", res = " + res);
      }
      numerator = res[0];
      denominator = res[1];
    }
  } else {
    res[1] = "1"
  }
  numerator = res[0];
  denominator = res[1];
  console.log ("After denom removal: numerator = " + numerator + ", denominator = " + denominator)



  //Step 2 - simplify the contents of each set of parenthesis
  var res2 = commonEliminate(res);
  numerator = res2[0];
  denominator = res2[1];
  console.log ("After mass elimination: numerator = " + numerator + ", denominator = " + denominator)



  //Step 3 - Make the numerator and denominator to a polynomial in form: (1 + as + bs^2)
  for (j=0; j<2; j++) {
    [x, y] = extractFromParanthesis(res2[j])
    for (i=0;i<x.length;i++) {
      if ((!x[i].includes('S')) && (x[i] != '1') && (x[i] != '-1')) {
        var res3 = multiplyEverything(res2, x[i], false);
      }
    }
  }
  // Do another mass elimination
  var res4 = commonEliminate(res3);
  numerator = res4[0];
  denominator = res4[1];
  console.log ("After making standard polynomial, numerator = " + numerator + ", denominator = " + denominator)

}

function App (props) {
  // Circuit is the MNA of the circuit https://lpsa.swarthmore.edu/Systems/Electrical/mna/MNA2.html
  //  "circuit" variable is the following matrix
  //
  //  va  /\    /\        vb
  // ----/  \  /  \  /-----|
  //         \/    \/      |
  //                     -----
  //                     -----
  //                       |
  //                       |
  //                    _______
  //
  //  --      --       --     -- 
  //  | N1  N2 |       |       |   
  //  |        |   x   |CIRCUIT|   = 0          //FIMXE!!         
  //  | N2  N1 |       |       |                
  //  --      --       --     --          
  //                       
  // inside circuit is strings. "P0_R1" means resistor 1. "M1_R2" means -1/R2. ""                      
  // var ciruit = {};

  //RC
  // var circuit =  [["+1/R1",   "+1/C1",        "1"], 
  //                 ["+1/R1",   "(-1/R1)+(-SC1)",    "0"],
  //                 ["1",       "0",            "0"]] 
  // RL
  // var circuit =  [["+1/R1",   "+1/C1",        "1"], 
  //                 ["+1/R1",   "(-1/R1)+(-1/SxL1)",    "0"],
  //                 ["1",       "0",            "0"]] 

  //R-nothing
  var circuit =  [["+1/R1",   "+1/R1",        "1"], 
                  ["+1/R1",   "-1/R1",        "0"],
                  ["1",       "0",            "0"]] 

  // R - R - C
  var circuit =  [["-(1/R1)",    "+(1/R1)",           "+(0)",                "+(1)"], 
                  ["+(1/R1)",    "-(1/R1)+(1/R2)",    "+(1/R2)",             "+(0)"],
                  ["+(0)",       "+(1/R2)",           "+(SC)+(1/R2)",        "+(0)"],
                  ["+(1)",       "+(0)",              "+(0)",                "+(0)"]]; 

  //FIXME - add a sanity check to 'circuit'
  // --All parenthesis should be preceeded with a sign
  // --No whitespace?
  // --Everything in parenthesis
  var tmp = gaussJordan(circuit);
  throw '';
  var laplaceUnsimplified = lazyGaussJordan(circuit);
  //FIXME - document
  //special characters are 'x', '/', '-', '+', '(', ')'. Can only use capitals and numbers
  simplifyEquation(laplaceUnsimplified);


  return html`
    <div class="row"><h1>Hello ${props.name}!</h1></div>
    <div class="row">
      <div class="col">
        <div class="row g-0">
            ${elementSelector("Series Resistor")}
            ${elementSelector("Parallel Capacitor")}
        </div>
      </div>
      <div class="col">
        <div id="tester" style="width:600px;height:250px;"></div>
      </div>
    </div>

    <div class="row text-center">
      <div class="col">
        LAPLACE
      </div>
      <div class="col">
        BILINEAR
      </div>
      <div class="col">
        STATE SPACE
      </div>
    </div>
    `;
}

render(html`<${App} name="World" />`, document.body);

// var a = document.getElementById('tester');
var TESTER = document.getElementById('tester');
Plotly.newPlot( TESTER, [{
x: [1, 2, 3, 4, 5],
y: [1, 2, 4, 8, 16] }], {
margin: { t: 0 } } );