import simplify_algebra from './simplify_algebra.js'
function processCanvasState(canvasState) {
  var newElementMap = {};
  // var elementsOnNodes = [];
  var nodeMap = [];
  var createNode;
  var end1, end2, i, j, k;
  var optimized;


  //Create a new node for each component
  canvasState.forEach(item => {
    if (item.type == "draw2d.Connection") {
      //get both ends of the connection
      end1 = `${item.source.node}.${item.source.port}`
      end2 = `${item.target.node}.${item.target.port}`
      nodeMap.push([end1, end2])
      // console.log(end1, end2);
    } else {
      //if its not a connection its an element
      newElementMap[item.id] = {};
    }
  });

  //loop through nodeMap and merge nodes which are the same until nodes are no longer optimized out
  do {
    optimized = false;
    loop1:
      for (i = 0; i < nodeMap.length; i++) {
        for (j = 0; j < nodeMap[i].length; j++) {
          for (k = i+1; k < nodeMap.length; k++) {
            if (nodeMap[k].includes(nodeMap[i][j])) {
              optimized = true;
              //Before concat with K, must remove the element that is about to be duplicated
              const index = nodeMap[k].indexOf(nodeMap[i][j]);
              if (index > -1) { // only splice array when item is found
                nodeMap[k].splice(index, 1); // 2nd parameter means remove one item only
              }
              nodeMap[i] = nodeMap[i].concat(nodeMap[k]);
              nodeMap.splice(k, 1);
              break loop1;
            }
          }
        }
      }
  } while (optimized==true);

  //     //check if either end exists in the nodemap, create a new entry or add to existing entry
  //     createNode = true;
  //     for (i = 0; i < nodeMap.length; i++) {
  //       if (nodeMap[i].includes(end1) && !nodeMap[i].includes(end2)) {
  //         nodeMap[i].push(end2);
  //         createNode = false;
  //         break;
  //       }
  //       else if (!nodeMap[i].includes(end1) && nodeMap[i].includes(end2)) {
  //         nodeMap[i].push(end1);
  //         createNode = false;
  //         break;
  //       }
  //     }
  //     if (createNode) {
  //       nodeMap.push([end1, end2])
  //     }
  //     //Fixme - there needs to be some code here to merge nodes

  //   } else {
  //     //if its not a connection its an element
  //     newElementMap[item.id] = {};
  //   }

  // });

  var elementsOnNodes =[];
  var t;
  for (i = 0; i < nodeMap.length; i++) {
    elementsOnNodes[i] = [];
    for (j = 0; j < nodeMap[i].length; j++) {
      t = nodeMap[i][j].split('.')
      elementsOnNodes[i].push(t[0])
    }
  }
  // console.log('newElementMap', newElementMap)

  return [elementsOnNodes, nodeMap, newElementMap]

}


export function calculateMNA(canvasState, schematicReadiness) {
  var elementsOnNodes = [];
  var nodeMap = [];
  var i, j;
  var vinNode, gndNode, voutNode;
  var elementMap = {};
  var newElementMap = {};
  var element;
  var latexResult = null;

  [elementsOnNodes, nodeMap, newElementMap] = processCanvasState(canvasState);
  console.log("bp1",  elementsOnNodes, nodeMap, newElementMap)

  //verify how ready the schematic is
  // All this code is just for that! Can't it be done later, for free? //FIXME

  schematicReadiness = {
    vout: false,
    vin: false,
    gnd: false,
  };
  var tmp;
  for (i = 0; i < elementsOnNodes.length; i++) {
    if (elementsOnNodes[i].includes('vout')) {
      schematicReadiness.vout = true;
      //See which nodes are connected together
      var crushedNodes = [i], zz, moreNodes, jj, kk, newNode, elementsOnThisNode = [];
      zz = i;
      moreNodes = [i];
      elementsOnThisNode = [].concat(elementsOnThisNode + elementsOnNodes[i]);
      while (moreNodes.length > 0) {
        moreNodes = [];
        newNode = moreNodes.pop();
        //Search through the node for elements with two ports (starting with the node tied to vout)
        for (jj = 0; jj < elementsOnNodes[i].length; jj++) {
          if (elementsOnNodes[i][jj] == 'vout') tmp = i;
          else if (elementsOnNodes[i][jj] == 'vin') tmp = i;
          else if (elementsOnNodes[i][jj] == 'gnd') tmp = i;
          else {
            //found a two ported element. Add the node on the other end if it isn't already added.
            for (kk = 0; kk < elementsOnNodes.length; kk++) {
              if (!crushedNodes.includes(kk)) {
                crushedNodes.push(kk);
                moreNodes.push(kk);
                elementsOnThisNode = [].concat(elementsOnThisNode, elementsOnNodes[kk]);
              }
            }
            moreNodes = 1;  //wtf does this line do!
          }
        }
      }


      if (elementsOnThisNode.includes('gnd')) schematicReadiness.gnd = true;
      if (elementsOnThisNode.includes('vin')) schematicReadiness.vin = true;

      break;
    }
  }


  // console.log(json);
  // console.log('nodemap', nodeMap);
  // console.log('elements on node', elementsOnNodes);
  // console.log('all elements on this node', elementsOnThisNode);



  // Build MNA array
  if (schematicReadiness.vout && schematicReadiness.vin && schematicReadiness.gnd) {
    // Create 2D modified nodal analysis array
    var mnaMatrix = new Array(nodeMap.length);
    for (i = 0; i < nodeMap.length; i++) mnaMatrix[i] = new Array(nodeMap.length).fill("0");
    //create node map without gnd node. All nodes might need to shift
    for (i = 0; i < elementsOnNodes.length; i++) {
      if (elementsOnNodes[i].includes('gnd')) gndNode = i;
    }
    var nodeMapNoGnd = nodeMap;
    var rem = nodeMapNoGnd.splice(gndNode, 1);

    // Step 1 - create map of every element and which node it connects too. Doing this here, after node map is complete and ground node is removed
    for (i = 0; i < nodeMapNoGnd.length; i++) {
      for (j = 0; j < nodeMapNoGnd[i].length; j++) {
        element = nodeMapNoGnd[i][j].split('.')
        if (element[0] in elementMap) elementMap[element[0]].push(i)
        else elementMap[element[0]] = [i]
      }
    }
    voutNode = elementMap['vout'][0];
    vinNode = elementMap['vin'][0];

    // Step 2 - loop thru elementMap and start adding things to the MNA
    var laplaceElement, firstLetter;
    for (const key2 in elementMap) {
      if ((key2 != 'vin') && (key2 != 'vout') && (key2 != 'gnd')) {
        firstLetter = Array.from(key2)[0];
        if (firstLetter == 'R') laplaceElement = key2;
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
    //2.3 Add a 1 in the bottom column indicating which node is Vin connected too
    mnaMatrix[mnaMatrix.length - 1][vinNode] = '1';

    //2.4 Add a 1 in the node connected to Vin to indicate that Iin flows into that node
    mnaMatrix[vinNode][mnaMatrix.length - 1] = '1';

    console.log('elementMap', elementMap);
    console.log('vin, vout and gnd node', vinNode, voutNode, gndNode);
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
    Algebrite.eval("mna_vo_vi = (inv_mna[" + (voutNode + 1) + "][" + (mnaMatrix.length) + "])")
    Algebrite.eval("mna_vo_vi_num = simplify(numerator(mna_vo_vi))")
    Algebrite.eval("mna_vo_vi_den = simplify(denominator(mna_vo_vi))")
    Algebrite.eval("mna_vo_vi_long = simplify(mna_vo_vi_num/mna_vo_vi_den)")
    console.log('vin node')
    // latexResult = Algebrite.run("printlatex(mna_vo_vi)");
    // console.log('Algebrite');
    // console.log(Algebrite.eval("mna").toString());
    console.log(Algebrite.eval("mna_vo_vi_num").toString());
    console.log(Algebrite.eval("mna_vo_vi_den").toString());
    console.log(Algebrite.eval("mna_vo_vi_long").toString());
    var ggg = simplify_algebra(Algebrite.eval("mna_vo_vi").toString());
    // console.log('ggg', ggg);
    // Algebrite.eval("simplified = " + ggg);
    // latexResult = Algebrite.run("printlatex(mna_vo_vi)");

    // console.log(Algebrite.eval("inv_mna").toString());
    // console.log(Algebrite.eval("mna_vo_vi").toString());
    // console.log(latexResult);
    // console.log(MNA_vo_vi.text());

    // renderPage();

  }




  return [schematicReadiness, ggg, newElementMap];




}