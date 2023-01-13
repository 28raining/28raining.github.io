import simplify_algebra from './simplify_algebra.js'

function arrayContains (list1, item) {
  return list1.findIndex((elem) => (elem.el == item.el) && (elem.port == item.port))
}

function includesElement (list1, item) {
  return list1.findIndex((elem) => (elem.el == item))
}

function processCanvasState(canvasState) {
  var newElementMap = {};
  // var elementsOnNodes = [];
  var nodeMap = [];
  var createNode;
  var end1, end2, i, j, k;
  var optimized;
  var idx;
  var cnt;
  var firstLetter;


  //Create a new node for each component
  canvasState.forEach(item => {
    if (item.type == "draw2d.Connection") {
      //get both ends of the connection
      // end1 = `${item.source.node}.${item.source.port}`
      // end2 = `${item.target.node}.${item.target.port}`
      nodeMap.push([{el: item.source.node, port: item.source.port}, {el: item.target.node, port: item.target.port}])
      // console.log(end1, end2);
    } else {
      //if its not a connection its an element
      firstLetter = Array.from(item.id)[0];
      //cnt is how many connections it's expected
      if ((firstLetter=='L') || (firstLetter=='R') || (firstLetter=='C')) cnt = 2;
      else if (firstLetter=='o') cnt = 3;
      else cnt = 1;
      newElementMap[item.id] = {cnt: cnt};
    }
  });

  //loop through nodeMap and merge nodes which are the same until nodes are no longer optimized out
  do {
    optimized = false;
    loop1:
      for (i = 0; i < nodeMap.length; i++) {
        for (j = 0; j < nodeMap[i].length; j++) {
          for (k = i+1; k < nodeMap.length; k++) {
            // console.log('looking for ',nodeMap[i][j], ' inside ', nodeMap[k])
            // if (nodeMap[k].includes(nodeMap[i][j])) {
            idx = arrayContains(nodeMap[k], nodeMap[i][j])
            if (idx >= 0) {
              // console.log('common node')
              optimized = true;
              //Before concat with K, must remove the element that is about to be duplicated
              // const index = nodeMap[k].indexOf(nodeMap[i][j]);
              // if (index > -1) { // only splice array when item is found
                nodeMap[k].splice(idx, 1); // 2nd parameter means remove one item only
              // }
              nodeMap[i] = nodeMap[i].concat(nodeMap[k]);
              nodeMap.splice(k, 1);
              break loop1;
            }
          }
        }
      }
  } while (optimized==true);

  //loop thru nodemap and remove elements which don't have both ports connected
  for (i = 0; i < nodeMap.length; i++) {
    for (j = 0; j < nodeMap[i].length; j++) {
      newElementMap[nodeMap[i][j].el].cnt -= 1;
    }
  }
  for (const key in newElementMap) {
    if(newElementMap[key].cnt > 0) {
      console.log('removing', key)
      //element must be removed!
      for (i = 0; i < nodeMap.length; i++) {
        for (j = 0; j < nodeMap[i].length; j++) {
          do {
            cnt = includesElement(nodeMap[i], key)
            if (cnt>=0) nodeMap[i].splice(cnt,1)
          } while (cnt >= 0)
          // cnt = includesElement(nodeMap[i], key)
          // newElementMap[nodeMap[i][j].el].cnt -= 1;
        }
      }
      delete newElementMap[key]
    }
  }
  console.log(newElementMap);

  //remove 2-port and 3-port elements that aren't fully connected
  //FIXME - here
  //[x]1 - Change nodemap to an array of object. Kind of dumb to have to keep splitting
  //[x]1a - remove elementsOnNodes
  //[x]2 - create a counter array and count occurances of each element
  //[x]3 - loop thru count array and remove anything which isn't 2 or 3

  //list of elements on nodes, not specifying port
  // var elementsOnNodes = [];
  // var t;
  // for (i = 0; i < nodeMap.length; i++) {
  //   elementsOnNodes[i] = [];
  //   for (j = 0; j < nodeMap[i].length; j++) {
  //     t = nodeMap[i][j]['el']
  //     elementsOnNodes[i].push(t)
  //   }
  // }
  // console.log('newElementMap', newElementMap)

  return [nodeMap, newElementMap]

}


export function calculateMNA(canvasState, schematicReadiness) {
  var nodeMap = [];
  var i, j;
  var vinNode, gndNode, voutNode;
  var elementMap = {};
  var newElementMap = {};
  var element;
  var latexResult = null;

  [nodeMap, newElementMap] = processCanvasState(canvasState);
  console.log("bp1", nodeMap, newElementMap)

  //verify how ready the schematic is
  // All this code is just for that! Can't it be done later, for free? //FIXME

  schematicReadiness = {
    vout: false,
    vin: false,
    gnd: false,
  };
  var tmp;
  for (i = 0; i < nodeMap.length; i++) {
    // if (elementsOnNodes[i].includes('vout')) {
    if (includesElement(nodeMap[i], 'vout') >= 0) {
      schematicReadiness.vout = true;
      //See which nodes are connected together
      var crushedNodes = [i], zz, moreNodes, jj, kk, newNode, elementsOnThisNode = [];
      zz = i;
      moreNodes = [i];
      elementsOnThisNode = [].concat(elementsOnThisNode + nodeMap[i]);
      while (moreNodes.length > 0) {
        moreNodes = [];
        newNode = moreNodes.pop();
        //Search through the node for elements with two ports (starting with the node tied to vout)
        for (jj = 0; jj < nodeMap[i].length; jj++) {
          if (nodeMap[i][jj].el == 'vout') tmp = i;
          else if (nodeMap[i][jj].el == 'vin') tmp = i;
          else if (nodeMap[i][jj].el == 'gnd') tmp = i;
          else {
            //found a two ported element. Add the node on the other end if it isn't already added.
            for (kk = 0; kk < nodeMap.length; kk++) {
              if (!crushedNodes.includes(kk)) {
                crushedNodes.push(kk);
                moreNodes.push(kk);
                elementsOnThisNode = [].concat(elementsOnThisNode, nodeMap[kk]);
              }
            }
            moreNodes = 1;  //wtf does this line do!
          }
        }
      }


      if (includesElement(elementsOnThisNode, 'gnd') >= 0) schematicReadiness.gnd = true;
      if (includesElement(elementsOnThisNode, 'vin') >= 0) schematicReadiness.vin = true;

      break;
    }
  }


  // console.log(json);
  // console.log('nodemap', nodeMap);
  // console.log('elements on node', elementsOnNodes);
  // console.log('all elements on this node', elementsOnThisNode);



  // Build MNA array
  if (schematicReadiness.vout && schematicReadiness.vin && schematicReadiness.gnd) {
    var numOpAmps=0;
    for(const key in newElementMap) if (Array.from(key)[0] == 'o') numOpAmps+=1;
    // Create 2D modified nodal analysis array
    var mnaMatrix = new Array(nodeMap.length + numOpAmps);
    for (i = 0; i < mnaMatrix.length; i++) mnaMatrix[i] = new Array(mnaMatrix.length).fill("0");
    //create node map without gnd node. All nodes might need to shift
    for (i = 0; i < nodeMap.length; i++) {
      if (includesElement(nodeMap[i], 'gnd') >= 0) gndNode = i;
    }
    var nodeMapNoGnd = nodeMap;
    nodeMapNoGnd.splice(gndNode, 1);  //removes the ground node so MNA is arranged properly

    // Step 1 - create map of every element and which node it connects too. Doing this here, after node map is complete and ground node is removed
    for (i = 0; i < nodeMapNoGnd.length; i++) {
      for (j = 0; j < nodeMapNoGnd[i].length; j++) {
        element = nodeMapNoGnd[i][j]['el']
        if (element in elementMap) elementMap[element].push(i)
        else elementMap[element] = [i]
      }
    }
    voutNode = elementMap['vout'][0];
    vinNode = elementMap['vin'][0];

    // Step 2 - loop thru elementMap and start adding things to the MNA
    var laplaceElement, firstLetter;
    for (const key2 in elementMap) {
      if ((key2 != 'vin') && (key2 != 'vout') && (key2 != 'gnd') && (key2 != 'op')) {
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
    numOpAmps = 0;
    for(const key in elementMap) {
      if (Array.from(key)[0] == 'o') {
        numOpAmps = numOpAmps + 1;
        console.log("bp3",numOpAmps,key,elementMap[key] )
        mnaMatrix[nodeMapNoGnd.length + numOpAmps][elementMap[key][0]] = '-1';
        mnaMatrix[nodeMapNoGnd.length + numOpAmps][elementMap[key][1]] = '1';
        mnaMatrix[elementMap[key][2]][nodeMapNoGnd.length + numOpAmps] = '1';
      }
    }


    console.log('elementMap', elementMap);
    // console.log('vin, vout and gnd node', vinNode, voutNode, gndNode);
    console.log('mna ', mnaMatrix);

    var nerdStrArr = [];
    var nerdStr = "";
    for (i = 0; i < mnaMatrix.length; i++) {
      nerdStrArr.push('[' + mnaMatrix[i].join(',') + ']');
    }
    nerdStr = nerdStrArr.join(',');


    //Using algebrite not nerdamer
    Algebrite.eval("clearall");
    Algebrite.eval("mna = [" + nerdStr + "]");
    Algebrite.eval("inv_mna = inv(mna)")
    Algebrite.eval("inv_mna")
    Algebrite.eval("mna_vo_vi = simplify(inv_mna[" + (voutNode + 1) + "][" + (mnaMatrix.length) + "])")
    // Algebrite.eval("mna_vo_vi_num = simplify(numerator(mna_vo_vi))")
    // Algebrite.eval("mna_vo_vi_den = simplify(denominator(mna_vo_vi))")
    // Algebrite.eval("mna_vo_vi_long = simplify(mna_vo_vi_num/mna_vo_vi_den)")
    // console.log('vin node')
    latexResult = Algebrite.run("printlatex(mna_vo_vi)");
    // console.log('Algebrite');
    // console.log(Algebrite.eval("mna").toString());
    // console.log(Algebrite.eval("mna_vo_vi_num").toString());
    // console.log(Algebrite.eval("mna_vo_vi_den").toString());
    // console.log(Algebrite.eval("mna_vo_vi_long").toString());
    var resString, resMathML;
    [resString, resMathML] = simplify_algebra(Algebrite.eval("mna_vo_vi").toString());


    // console.log('ggg', ggg);
    // Algebrite.eval("simplified = " + ggg);
    // latexResult = Algebrite.run("printlatex(mna_vo_vi)");

    // console.log(Algebrite.eval("inv_mna").toString());
    // console.log(Algebrite.eval("mna_vo_vi").toString());
    // console.log(latexResult);
    // console.log(MNA_vo_vi.text());

    // renderPage();

  }

  console.log('bp2', resString)


  return [schematicReadiness, resMathML, newElementMap, latexResult, resString];




}