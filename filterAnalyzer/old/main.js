import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';
import { init_draw2d } from './wdk_draw2d.js'


var schematicReadiness = {
  vout: false,
  vin: false,
  gnd: false,
};

// Three global variables
export var state = {
  json: [],
  elements: {},
}; //Current state
var debug = {}; //Enable debug

// Initialize htm with Preact
const html = htm.bind(h);

function elementToSvgLocation(element) {
  if (element == "Series Capacitor") return 1000;
  if (element == "Parallel Capacitor") return 500;
  if (element == "Series Inductor") return 2000;
  if (element == "Parallel Inductor") return 1500;
  if (element == "Series Resistor") return 3000;
  if (element == "Series Capacitor") return 2500;
  if (element == "Parallel Resistor") return 3500;
  if (element == "Transmission Line") return 4000;
  console.log("ERROR - YOU CHOSE ELEMENT THAT DOES NOT EXIST", element)
  return 0;
}


function elementSelector(element) {
  return html`
  <div class="col-6 col-lg-2 schemHover text-center border-top border-bottom border-end border-dark" onclick="clicked_cell(${element})">
    <p class="m-0">${element}</p>
    <svg viewBox="${elementToSvgLocation(element)} 0 500 500"><use xlink:href="svg/elements_w_custom.svg#rainbow3" alt="${element}" /></svg>
  </div>`
}
function schematicValidator(element) {
  // console.log(element, schematicReadiness[element]);
  if (schematicReadiness[element]) return html`<li class="list-group-item list-group-item-success">${element} Connected</li>`
  else return html`<li class="list-group-item list-group-item-danger">${element} Connected</li>`
}

function navBar(props) {
  return html`
    <div class="w-100 p-3 bg-navy text-white">
      <div class="container-xl">
        <div class="row">
          <div class="col-10">
            <h4 class="mb-0"><strong> ${props.title} </strong></h4>
          </div>
        </div>
      </div>
    </div>`
}

function Schematic() {
  return html`
  <div class="row">
    <div class="col-2" >
    <div class="d-grid">
      <div data-shape="res" class="btn btn-primary draw2d_droppable" title="drag&amp;drop the table into the canvas..">Resistor</div>
      <div data-shape="cap" class="btn btn-primary draw2d_droppable" title="drag&amp;drop the table into the canvas..">Capacitor</div>
      <div data-shape="vin" class="btn btn-primary draw2d_droppable" title="drag&amp;drop the table into the canvas..">Input voltage</div>
      <div data-shape="gnd" class="btn btn-primary draw2d_droppable" title="drag&amp;drop the table into the canvas..">GND</div>
      <div data-shape="vout" class="btn btn-primary draw2d_droppable" title="drag&amp;drop the table into the canvas..">Vout</div>
    </div>
    </div>

    <div class="col-10" style="height:300px;" id="canvasHolder">
      <div id="canvas" class="bg-light border" style="position:absolute">
      </div>
    </div>

  </div>
  <div class="row">

      <ul class="list-group list-group-horizontal">
        ${schematicValidator("vout")}
        ${schematicValidator("vin")}
        ${schematicValidator("gnd")}
      </ul>

  </div>
  `
}

function FreqResponse() {
  return html`
      <div class="row">
        <div class="col" style="height:400px;">
          <div id="tester"  style="height:100%;width:100%;"></div>
        </div>
      </div>
      `
}

function TransformResults() {

  return html`
    <div class="row">
      <div class="col">
        <div class="row text-center">
          <h3>Laplace</h3>
        </div>
        <div class="row">
          <div id="math">
            The answer you provided is: \({ }\).
          </div>
        </div>
      </div>
      <div class="col">
        <div class="row text-center">
          <h3>Bilinear Transform</h3>
        </div>
      </div>
      <div class="col">
        <div class="row text-center">
          <h3>State Space</h3>
        </div>
        <div class="row">
          <p>Coming soon, maybe...</p>
        </div>
      </div>
    </div>
  `
}

function temp (e1,e){
  console.log(e1);
  console.log(e);
  console.log("ehehe");
}

class Counter {
  state = {
    value: 0
  };

  increment = () => {
    console.log("hi",  this.state.value)
    this.state.value += 1;
  };

  render(props, state) {
    return html`
      <div>
        <p>Counter: ${state.value}</p>
        <button onClick=${this.increment}>Increment</button>
      </div>
    `;
  }
}

function updateComponent (e, val) {
  state.elements[e].value = val;
  renderPage();
}

function compRow() {
  if( Object.keys(state.elements).length === 0) return html`<div class="row">Add components to the schematic by dragging from the left</div>`
  //push 3 or 4 elements per row
  return html`<div class="row">${componentValues()}</div>`
}

//Boxes for users to add components
function componentValues() {
  var elements = state.elements;
  var objEditor = []
  for (const key in elements) {
    var z = new Counter;
    objEditor.push(z);
    // objEditor.push(html`
    // <div class="col">
    //   <div class="input-group mb-3">
    //     <span class="input-group-text">${key}</span>
    //     <input type="text" class="form-control" value="${elements[key].value}" onchange=${temp(4)}/>
    //   </div>
    // </div>`);
  }
  return objEditor;
}

export function renderPage() {
  // Use state (variable containing all user inputs) to do MNA (modified nodal analysis)
  var y = calculateMNA();
  // var x = componentValues();

  // const classes = `header ${
  //   for (const key in state.elements) {
  //     objEditor += '<div class="col">'+key+'</div>';
  //   }
  // }`;

  // Update the DOM
  var g = html`
  <${navBar} title="ONLINE ELECTRONIC CIRCUIT LAPLACE SOLVER" />
  <div class="w-100 p-3 bg-green">
    <div class="container-xl">
      <${Counter} />
      <${Schematic} />
      <${compRow} />
      <${FreqResponse} />
      <${TransformResults} name="World" />
    </div>
  </div>
    ` 
    console.log("g", g);
  render(g,
    document.getElementById("app"));

    if (y) {

    //
    //  Get the MathML input string, and clear any previous output
    //
    var output = document.getElementById('math');
    output.innerHTML = '';
    //
    //  Convert the MathMl to an HTML node and append it to the output
    //


    // var ztex = nerdamer.convertToLaTeX(MNA_vo_vi.text());
    // output.appendChild(MathJax.tex2svg(ztex.toString()));
    output.appendChild(MathJax.tex2svg(y));
    //
    //  Then update the document to include the adjusted CSS for the
    //    content of the new equation.
    //
    // MathJax.startup.document.clear();
    // MathJax.startup.document.updateDocument();
    }

  //Update plotly
  var TESTER = document.getElementById('tester');
  Plotly.newPlot(TESTER, [{
    x: [1, 2, 3, 4, 5],
    y: [1, 2, 4, 8, 16]
  }], {
    autosize: true,
    margin: { t: 0 }
  });
}

//Draw2D stuff
document.addEventListener("DOMContentLoaded", function () {
  init_draw2d();
});

function calculateMNA(canvas) {
  var elementsOnNodes = [];
  var nodeMap = [];
  var conList = [];
  var i, j;
  var createNode;
  var vinNode, gndNode, voutNode;
  var elementMap = {};
  var newElementMap = {};
  var end1Node;
  var element;


  // var writer = new draw2d.io.json.Writer();
  // writer.marshal(canvas, function (json) {
    console.log(state);
    state.json.forEach(item => {
      if (item.type == "draw2d.Connection") {
        conList.push(item);
        //get both ends of the connection
        var end1 = `${item.source.node}.${item.source.port}`
        var end2 = `${item.target.node}.${item.target.port}`

        //check if either end exists in the nodemap, create a new entry or add to existing entry
        createNode = true;
        for (i = 0; i < nodeMap.length; i++) {
          if (nodeMap[i].includes(end1) && !nodeMap[i].includes(end2)) {
            nodeMap[i].push(end2);
            elementsOnNodes[i].push(item.target.node)
            createNode = false;
            end1Node = i;
            break;
          }
          else if (!nodeMap[i].includes(end1) && nodeMap[i].includes(end2)) {
            nodeMap[i].push(end1);
            elementsOnNodes[i].push(item.source.node)
            createNode = false;
            end1Node = i;
            break;
          }
        }
        if (createNode) {
          nodeMap.push([end1, end2])
          elementsOnNodes.push([item.source.node, item.target.node])
          end1Node = nodeMap.length - 1;
        }
        //Fixme - there needs to be some code here to merge nodes


      } else {
        //if its not a connection its an element
        newElementMap[item.id] = {};
        newElementMap[item.id]['value'] = 10;
      }

    });


    //verify how ready the schematic is
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
    console.log('conlist', conList);
    console.log('nodemap', nodeMap);
    console.log('elements on node', elementsOnNodes);
    console.log('all elements on this node', elementsOnThisNode);



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
    console.log('removed', rem);

    // Step 1 - create map of every element and which node it connects too. Doing this here, after node map is complete and ground node is removed
    for (i = 0; i < nodeMapNoGnd.length; i++) {
      for (j = 0; j < nodeMapNoGnd[i].length; j++) {
        element = nodeMapNoGnd[i][j].split('.')
        if (element[0] in elementMap) elementMap[element[0]].push(i)
        else elementMap[element[0]] = [i]
      }
    }
    console.log('elementMap', elementMap);
    voutNode = elementMap['vout'][0];
    vinNode = elementMap['vin'][0];

    // Step 2 - loop thru elementMap and start adding things to the MNA
    for (const key in elementMap) {
      if ((key != 'vin') && (key != 'vout') && (key != 'gnd')) {
        //2.1 in the diagonal is the sum of all impedances connected to that node
        for (j = 0; j < elementMap[key].length; j++) {
          mnaMatrix[elementMap[key][j]][elementMap[key][j]] += "+" + key + "^(-1)"
        }
        //2.2 elements connected between two nodes need to appear off the diagonals
        if (elementMap[key].length > 1) {
          mnaMatrix[elementMap[key][0]][elementMap[key][1]] += "-" + key + "^(-1)"
          mnaMatrix[elementMap[key][1]][elementMap[key][0]] += "-" + key + "^(-1)"
        }
      }
    }
    //2.3 Add a 1 in the bottom column indicating which node is Vin connected too
    mnaMatrix[mnaMatrix.length - 1][vinNode] = '1';

    //2.4 Add a 1 in the node connected to Vin to indicate that Iin flows into that node
    mnaMatrix[vinNode][mnaMatrix.length - 1] = '1';

    console.log('vin, vout and gnd node', vinNode, voutNode, gndNode);
    console.log('mna ', mnaMatrix);

    var nerdStrArr = [];
    var nerdStr = "";
    for (i = 0; i < mnaMatrix.length; i++) {
      nerdStrArr.push('[' + mnaMatrix[i].join(',') + ']');
    }
    nerdStr = nerdStrArr.join(',');

    console.log('nerdStr ', nerdStr);


    //Using algebrite not nerdamer
    // var t = "mna = ["+nerdStr+"]";
    // console.log("t",t);
    Algebrite.eval("mna = [" + nerdStr + "]");
    Algebrite.eval("inv_mna = inv(mna)")
    Algebrite.eval("inv_mna")
    Algebrite.eval("mna_vo_vi = simplify(inv_mna[" + (voutNode + 1) + "][3])")
    var y = Algebrite.run("printlatex(mna_vo_vi)");
    console.log('Algebrite');
    console.log(Algebrite.eval("mna").toString());
    console.log(Algebrite.eval("inv_mna").toString());
    console.log(Algebrite.eval("mna_vo_vi").toString());
    console.log(y);
    // console.log(MNA_vo_vi.text());

    // renderPage();

  }




  return y;




}



renderPage()
