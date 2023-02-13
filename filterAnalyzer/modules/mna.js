import simplify_algebra from './simplify_algebra.js'

function arrayContains(list1, item) {
  return list1.findIndex((elem) => (elem.el == item.el) && (elem.port == item.port))
}

function includesElement(list1, item) {
  return list1.findIndex((elem) => (elem.el == item))
}

function processCanvasState(canvasState) {
  var usedElements = {};
  var allElements = {};
  // var elementsOnNodes = [];
  var nodeMap = [];
  var createNode;
  var end1, end2, i, j, k, z, ps, pt;
  var optimized;
  var idx;
  var cnt;
  var letters;
  var opAmpsMap = [];


  //Create a new node for each component
  canvasState.forEach(item => {
    if (item.type == "draw2d.Connection") {
      //get both ends of the connection
      // end1 = `${item.source.node}.${item.source.port}`
      // end2 = `${item.target.node}.${item.target.port}`
      ps = Array.from(item.source.port);
      pt = Array.from(item.target.port);
      nodeMap.push([{ el: item.source.node, port: ps[ps.length-1] }, { el: item.target.node, port: pt[pt.length-1] }])
      // console.log(end1, end2);
    } else {
      //if its not a connection its an element
      letters = Array.from(item.id);
      //cnt is how many connections it's expected
      if ((letters[0] == 'L') || (letters[0] == 'R') || (letters[0] == 'C')) cnt = 2;
      else if (letters[0] == 'o') cnt = 3;
      else cnt = 1;
      allElements[item.id] = { cnt: cnt };
      // usedElements[item.id] = { cnt: cnt };
    }
  });

  //loop through nodeMap and merge nodes which are the same until nodes are no longer optimized out
  do {
    optimized = false;
    loop1:
    for (i = 0; i < nodeMap.length; i++) {
      for (j = 0; j < nodeMap[i].length; j++) {
        for (k = i + 1; k < nodeMap.length; k++) {
          idx = arrayContains(nodeMap[k], nodeMap[i][j])
          if (idx >= 0) {
            optimized = true;
            //Before concat with K, must remove the element that is about to be duplicated
            nodeMap[k].splice(idx, 1); // 2nd parameter means remove one item only
            nodeMap[i] = nodeMap[i].concat(nodeMap[k]);
            nodeMap.splice(k, 1);
            break loop1;
          }
        }
      }
    }
  } while (optimized == true);

  //loop thru nodemap and remove elements which don't have both ports connected
  for (i = 0; i < nodeMap.length; i++) {
    for (j = 0; j < nodeMap[i].length; j++) {
      allElements[nodeMap[i][j].el].cnt -= 1;
    }
  }
  for (const key in allElements) {
    if (allElements[key].cnt > 0) {
      //element must be removed!
      console.log('removing', key)
      for (i = 0; i < nodeMap.length; i++) {
        for (j = 0; j < nodeMap[i].length; j++) {
          do {
            cnt = includesElement(nodeMap[i], key)
            if (cnt >= 0) nodeMap[i].splice(cnt, 1)
          } while (cnt >= 0)
        }
      }
      // delete usedElements[key]
    } else usedElements[key] = {};
  }
  // console.log(usedElements);


  //Create an array of all nodes connected to Vout.
  var nodeVin, nodeVout, nodeGnd;
  var connectedNodes = [];
  var node;
  for (i = 0; i < nodeMap.length; i++) if (includesElement(nodeMap[i], 'xvout') >= 0) connectedNodes = [i];
  i = 0;
  while (i < connectedNodes.length) {
    node = connectedNodes[i];
    for (z = 0; z < nodeMap.length; z++) {
      if (connectedNodes.includes(z)) continue; //node already detected to be connected
      for (j = 0; j < nodeMap[z].length; j++) {
        if (includesElement(nodeMap[node], nodeMap[z][j].el) >= 0) {
          connectedNodes.push(z);
          break;
        }
      }
    }
    i++;
  }

  //check if vout, vin and gnd are connected together
  var schematicReadiness = {
    vout: false,
    vin: false,
    gnd: false,
    solvable: false,
  };

  //Create a node map used for mna. Dosen't include non-connected nodes, and doesn't include the ground node
  var mnaNodeMap = [];
  for (const node of connectedNodes) {
    if (includesElement(nodeMap[node], 'gnd') < 0) mnaNodeMap.push(nodeMap[node]);
    else schematicReadiness.gnd = true;
  }

  
  for (z = 0; z < mnaNodeMap.length; z++) {
    if (includesElement(mnaNodeMap[z], 'xvout') >= 0) schematicReadiness.vout = true;
    if (includesElement(mnaNodeMap[z], 'vin') >= 0)  schematicReadiness.vin = true;
    // if (includesElement(mnaNodeMap[z], 'gnd') >= 0)  schematicReadiness.gnd = true;
  }
  
  // console.log(mnaNodeMap, schematicReadiness);




  // console.log('usedElements', usedElements)
  // console.log('allElements', allElements)
  // console.log('vout node', nodeMap)
  // console.log('schematicReadiness', schematicReadiness)

  return [mnaNodeMap, usedElements, connectedNodes, schematicReadiness, allElements]

}


export function calculateMNA(canvasState) {
  var nodeMap = [];
  var i, j;
  var vinNode, gndNode, voutNode;
  var elementMap = {};
  var allElements = {};
  var usedElements = {};
  var element;
  var latexResult = null;
  var connectedNodes = [];
  var schematicReadiness;
  var opAmpsMap;

  [nodeMap, usedElements, connectedNodes, schematicReadiness, allElements] = processCanvasState(canvasState);
  // console.log("bp1", nodeMap, usedElements)

  // console.log(json);
  // console.log('nodemap', nodeMap);
  // console.log('elements on node', elementsOnNodes);
  // console.log('all elements on this node', elementsOnThisNode);



  // Build MNA array
  if (schematicReadiness.vout && schematicReadiness.vin && schematicReadiness.gnd) {
    var numOpAmps = 0;
    for (const key in usedElements) if (Array.from(key)[0] == 'o') numOpAmps += 1;
    // Create 2D modified nodal analysis array
    var mnaMatrix = new Array(nodeMap.length + 1 + numOpAmps);
    for (i = 0; i < mnaMatrix.length; i++) mnaMatrix[i] = new Array(mnaMatrix.length).fill("0");
    //create node map without gnd node. All nodes might need to shift
    // for (i = 0; i < nodeMap.length; i++) {
    //   if (includesElement(nodeMap[i], 'gnd') >= 0) gndNode = i;
    // }
    // var nodeMapNoGnd = nodeMap;
    // nodeMapNoGnd.splice(gndNode, 1);  //removes the ground node so MNA is arranged properly

    // Step 1 - create map of every element and which node it connects too. Doing this here, after node map is complete and ground node is removed
    var opAmpsMap = {};
    var letters, ll;
    for (i = 0; i < nodeMap.length; i++) {
      for (j = 0; j < nodeMap[i].length; j++) {
        element = nodeMap[i][j].el
        if (element in elementMap) elementMap[element].push(i)
        else elementMap[element] = [i]
        letters = Array.from(element);
        ll = letters[letters.length - 1];
        if (letters[0] == 'o') {
          if (!(ll in opAmpsMap)) opAmpsMap[ll] = [null, null, null]
          // console.log(opAmpsMap, letters, nodeMap[i][j]);
          opAmpsMap[ll][nodeMap[i][j].port] = i;     
        }
      }
    }
    voutNode = elementMap['xvout'][0];
    vinNode = elementMap['vin'][0];

    // Step 2 - loop thru elementMap and start adding things to the MNA
    var laplaceElement, firstLetter;
    for (const key2 in elementMap) {
      letters = Array.from(key2);
      if ((letters[0] != 'v') && (letters[0] != 'g') && (letters[0] != 'o') && (letters[0] != 'x')) {
        firstLetter = Array.from(key2)[0];
        if (firstLetter == 'R') laplaceElement = key2;
        else if (firstLetter == 'L') laplaceElement = "(S*" + key2 + ")";
        else laplaceElement = "1/(S*" + key2 + ")";

        //2.1 in the diagonal is the sum of all impedances connected to that node
        for (j = 0; j < elementMap[key2].length; j++) {
          mnaMatrix[elementMap[key2][j]][elementMap[key2][j]] += "+" + laplaceElement + "^(-1)"
        }
        //2.2 elements connected between two nodes need to appear off the diagonals
        if (elementMap[key2].length > 1) {
          mnaMatrix[elementMap[key2][0]][elementMap[key2][1]] += "-" + laplaceElement + "^(-1)"
          mnaMatrix[elementMap[key2][1]][elementMap[key2][0]] += "-" + laplaceElement + "^(-1)"
        }
      }
    }
    //2.3 Add a 1 in the bottom row indicating which node is Vin connected too
    mnaMatrix[mnaMatrix.length - 1 - numOpAmps][vinNode] = '1';

    //2.4 Add a 1 in the node connected to Vin to indicate that Iin flows into that node
    mnaMatrix[vinNode][mnaMatrix.length - 1 - numOpAmps] = '1';

    //2.5 For each op-amp add some 1's. It says that 2 nodes are equal to each other, and that 1 node has a new ideal current source
    // var opAmp = 0;
    //port 0 -> +
    //port 1 -> - 
    //port 2 -> out
    // console.log('pre-op', mnaMatrix);
    var idx;
    for (const key in opAmpsMap) {
      idx = parseInt(key);
      // console.log('setting ', idx, nodeMap.length + 1 + idx, mnaMatrix)
      if (opAmpsMap[key][0] != null) mnaMatrix[nodeMap.length + 1 + idx][opAmpsMap[idx][0]] = '1';
      if (opAmpsMap[key][1] != null) mnaMatrix[nodeMap.length + 1 + idx][opAmpsMap[idx][1]] = '-1';
      if (opAmpsMap[key][2] != null) mnaMatrix[opAmpsMap[idx][2]][nodeMap.length + 1 + idx] = '1';
      // console.log('post-op', mnaMatrix, mnaMatrix[opAmpsMap[idx][2]][nodeMap.length + 1 + idx], opAmpsMap[idx][2], nodeMap.length + 1 + idx);

      // if (Array.from(key)[0] == 'o') {
      //   opAmp = opAmp + 1;
      //   console.log("bp3", opAmp, key, elementMap[key])
      //   mnaMatrix[nodeMap.length + 1 + opAmp][elementMap[key][0]] = '-1';
      //   mnaMatrix[nodeMap.length + 1 + opAmp][elementMap[key][1]] = '1';
      //   mnaMatrix[elementMap[key][2]][nodeMap.length + 1 + opAmp] = '1';
      // }
    }
    



    // console.log('elementMap', elementMap);
    // // console.log('vin, vout and gnd node', vinNode, voutNode, gndNode);
    // console.log('mna ', mnaMatrix);

    var nerdStrArr = [];
    var nerdStr = "";
    for (i = 0; i < mnaMatrix.length; i++) {
      nerdStrArr.push('[' + mnaMatrix[i].join(',') + ']');
    }
    nerdStr = nerdStrArr.join(',');
    // console.log(mnaMatrix);


    //Using algebrite not nerdamer
    Algebrite.eval("clearall");
    Algebrite.eval("mna = [" + nerdStr + "]");
    try {
      Algebrite.eval("inv_mna = inv(mna)")
      Algebrite.eval("inv_mna")
      Algebrite.eval("mna_vo_vi = simplify(inv_mna[" + (voutNode + 1) + "][" + (mnaMatrix.length-numOpAmps) + "])")
      Algebrite.eval("bilinear = subst((2/T)*(Z-1)/(Z+1),S,mna_vo_vi)")
      // latexResult = Algebrite.run("printlatex(mna_vo_vi)");
      // console.log(Algebrite.eval("bilinear").toString());
      var resString, resMathML;
      [resString, resMathML] = simplify_algebra(Algebrite.eval("mna_vo_vi").toString());
      schematicReadiness.solvable = true;
    } catch {
      schematicReadiness.solvable = false;
      resMathML = "<mtext>Schematic currently invalid</mtext>"
    }

    var discard, bilinearMathML;
    try {
      [discard, bilinearMathML] = simplify_algebra(Algebrite.eval("bilinear").toString());
    } catch {
      bilinearMathML = "<mtext>Having trouble calculating bilinear transform</mtext>"
    }






    // console.log('ggg', ggg);
    // Algebrite.eval("simplified = " + ggg);
    // latexResult = Algebrite.run("printlatex(mna_vo_vi)");

    // console.log(Algebrite.eval("inv_mna").toString());
    // console.log(Algebrite.eval("mna_vo_vi").toString());
    // console.log(latexResult);
    // console.log(MNA_vo_vi.text());

    // renderPage();

  } else {
    resMathML = "<mtext>Schematic currently invalid</mtext>"
    bilinearMathML = "<mtext>Schematic currently invalid</mtext>"
    schematicReadiness.solvable = false;
  }

  // console.log('bp2', resString)


  return [schematicReadiness, resMathML, allElements, latexResult, resString, bilinearMathML];




}