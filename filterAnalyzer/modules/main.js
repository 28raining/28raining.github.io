import React from "https://unpkg.com/es-react@latest/dev/react.js";
import ReactDOM from "https://unpkg.com/es-react@latest/dev/react-dom.js";
import PropTypes from "https://unpkg.com/es-react@latest/dev/prop-types.js";
import htm from "https://unpkg.com/htm@latest?module";
import { init_draw2d } from './wdk_draw2d.js'
import { calculateMNA } from './mna.js'
const html = htm.bind(React.createElement);

// Three global variables
export var state = {
  json: [],
  elements: {},
}; //Current state
var debug = {}; //Enable debug

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
  <div className="col-6 col-lg-2 schemHover text-center border-top border-bottom border-end border-dark" onclick="clicked_cell(${element})">
    <p className="m-0">${element}</p>
    <svg viewBox="${elementToSvgLocation(element)} 0 500 500"><use xlink:href="svg/elements_w_custom.svg#rainbow3" alt="${element}" /></svg>
  </div>`
}
function schematicValidator(props) {
  // console.log(element, schematicReadiness[element]);
  if (props.ready)  var color="success"
  else var color="danger"
  return html`
  <div className="col">
    <div className="d-grid gap-2">
      <span className="badge bg-${color}">${props.name} connected</span>
    </div>
  </div>
  `
}

function navBar(props) {
  return html`
    <div className="w-100 p-3 bg-navy text-white">
      <div className="container-xl">
        <div className="row">
          <div className="col-10">
            <h4 className="mb-0"><strong>${props.title}</strong></h4>
          </div>
        </div>
      </div>
    </div>`
}

function SchematicComponents() {
  return html`
  <div className="row">
    <div className="col" >
        <div key="1" data-shape="res" className="btn btn-primary draw2d_droppable" title="dragdrop the table into the canvas..">Resistor</div>
        <div key="2" data-shape="cap" className="btn btn-primary draw2d_droppable" title="dragdrop the table into the canvas..">Capacitor</div>
        <div key="3" data-shape="vin" className="btn btn-primary draw2d_droppable" title="dragdrop the table into the canvas..">Input voltage</div>
        <div key="4" data-shape="gnd" className="btn btn-primary draw2d_droppable" title="dragdrop the table into the canvas..">GND</div>
        <div key="5" data-shape="vout" className="btn btn-primary draw2d_droppable" title="dradrop the table into the canvas..">Vout</div>
    </div>
  </div>
  `
}
function Schematic() {
  return html`
  <div className="row" key="r124">
    <div className="col" style=${{height:"300px"}} id="canvasHolder">
      <div id="canvas" className="bg-light border" style=${{position:'absolute'}} />
    </div>

  </div>
  `
}
function SchematicVal(props) {
  return html`
  <div className="row">
        <${schematicValidator} name="vout" key="vout" ready=${props.schematicReadiness['vout']} />
        <${schematicValidator} name="vin" key="vin" ready=${props.schematicReadiness['vin']} />
        <${schematicValidator} name="gnd" key="gnd" ready=${props.schematicReadiness['gnd']} />
  </div>
  `
}

function FreqResponse() {
  return html`
      <div className="row">
        <div className="col" style=${{height:"400px"}}>
          <div id="tester"  style=style=${{height:'100%', width:'100%'}}></div>
        </div>
      </div>
      `
}

function TransformResults(props) {

  return html`
    <div className="row">
      <div className="col">
        <div className="row text-center">
          <h3>Laplace</h3>
        </div>
        <div className="row">
          <div id="math">
            The answer you provided is: ${MyComponent(props.latex)}
          </div>
        </div>
      </div>
      <div className="col">
        <div className="row text-center">
          <h3>Bilinear Transform</h3>
        </div>
      </div>
      <div className="col">
        <div className="row text-center">
          <h3>State Space</h3>
        </div>
        <div className="row">
          <p>Coming soon, maybe...</p>
        </div>
      </div>
    </div>
  `
}

function selectUnits (name) {
  var resUnits = ['m','','K','M','G']
  var capUnits = ['f','p','n','u','m']
  var unitSize, units;
  var r = [];
  var firstLetter = Array.from(name)[0];
  if (firstLetter == 'R') {
    units = String.fromCharCode(8486);
    unitSize = resUnits;
  } else {
    units = 'F';
    unitSize = capUnits;
  }
  for (const item of unitSize) {
      r.push(html`<option value="${item}" key="${item}">${item}${units}</option>`)
  }
  return r;
}



function createMarkup(latex) {
  return {__html: katex.renderToString(`${latex}`, {
    throwOnError: false
  })};
}

function MyComponent(latex) {
  return html`<div dangerouslySetInnerHTML=${createMarkup(latex)} />`
}

function e1 (props) {
  if (props.idxx >= props.length) return null
  else {
    return html`
      <div className="input-group mt-1">
        <span className="input-group-text">${props.name}</span>
        <input  type="text" className="form-control" value="${props.el.value}" onChange=${(e) => props.onChange(e,props.name)} />
        <select  value=${props.el.unit} className="form-select" onChange=${(e) => props.unitChange(e,props.name)}>
          ${selectUnits(props.name)}
        </select>
      </div>
    `
  }
}

function listElements (props) {
    if( Object.keys(props.e).length === 0) {
      return html`
      <div className="row py-3">
        <div className="col text-center">
          <div className="row"><p>Drag components from the top onto the schematic</p></div>
        </div>
      </div>`
    }

    var elPerRow = 3;
    var r=[]
    var z;
    var keys = Object.keys(props.e);
    const elements = props.e;
    for (z=0; z<keys.length; z=z+elPerRow) {
      r.push(html`
      <div className="row" key=row${z}>
        <div className="col" key=${z}>
          <${e1} name=${keys[z]} el=${elements[keys[z]]} idxx=${z} length=${keys.length} onChange=${props.onChange} unitChange=${props.unitChange} />
        </div>
        <div className="col" key=${z+1}>
          <${e1} name=${keys[z+1]} el=${elements[keys[z+1]]} idxx=${z+1} length=${keys.length} onChange=${props.onChange} unitChange=${props.unitChange} />
        </div>
        <div className="col" key=${z+2}>
          <${e1} name=${keys[z+2]} el=${elements[keys[z+2]]}idxx=${z+2} length=${keys.length} onChange=${props.onChange} unitChange=${props.unitChange} />
        </div>
      </div>`)
    }

    return r;
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      elements: [],
      latex: null
    };
    this.schematicReadiness = {
      vout: false,
      vin: false,
      gnd: false,
    };
  }

  //name it better
  handledropCb (a) {
    console.log("Drop call back does nothing");
    // const elements = this.state.elements.slice();

  }

  handleCanvasChange (canvasState) {
    // console.log("Inside handleCanvasChange");
    var latexResult;
    var newElementMap;
    var elements = this.state.elements;
    [this.schematicReadiness, latexResult, newElementMap] = calculateMNA(canvasState, this.schematicReadiness);

    //add new elements
    for (const key in newElementMap) {
      if ((key=='gnd') || (key=='vout') || (key=='vin')) continue;
      if (!(key in elements)) {
        var firstLetter = Array.from(key)[0];
        if (firstLetter =='R') {
          elements[key] = {
            value: 10,
            unit: 'K',
          };
        } else {
          elements[key] = {
            value: 1,
            unit: 'p',
          };
        }
      }
    }

    //remove old elements
    for (const key in elements) {
      if (!(key in newElementMap)) {
        delete elements[key];
      }
    }

    this.setState({
      elements:elements,
      latex: latexResult
    })
  }

  componentDidMount() {
    // #after dom tree is updated
    this.a = new init_draw2d((a) => this.handledropCb(a), (b) => this.handleCanvasChange(b));
    // pass this.tff as above
    this.a.addEvL(this.a.view, this.a.writer, (canvasState)=>this.handleCanvasChange(canvasState));
  }

  
  handleElChange(e,i) {
    const elements = this.state.elements;
    elements[i].value = e.target.value
    this.setState({
        elements:elements
    })
  }
  
  handleUnitChange(e,i) {
    const elements = this.state.elements;
    elements[i].unit = e.target.value
    this.setState({
        elements:elements
    })
  }



  render() {
    
    // // Use state (variable containing all user inputs) to do MNA (modified nodal analysis)
    // 
  
    // const classes = `header ${
    //   for (const key in state.elements) {
    //     objEditor += '<div className="col">'+key+'</div>';
    //   }
    // }`;
  
    // Update the DOM
    return html`
      <${navBar} title="ONLINE ELECTRONIC CIRCUIT LAPLACE SOLVER" key="navBar"/>
      <div className="w-100 p-3 bg-green" key="1244554">
        <div className="container-xl" key="12445546">
          <${SchematicComponents} key="schemComp"/>
          <${Schematic} key="schem"/>
          <${SchematicVal} key="schemVal" schematicReadiness=${this.schematicReadiness}/>
          <${listElements} e=${this.state.elements} key="valueList" onChange=${(e,i) => this.handleElChange(e,i)} unitChange=${(e,i) => this.handleUnitChange(e,i)}/>
          <${TransformResults} name="World" key="TransformResults" latex=${this.state.latex} />
          <${FreqResponse}  key="FreqResponse"/>
        </div>
      </div>
      `;
  
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
}

ReactDOM.render(
  html`<${Game} key="game"/>`,
  document.getElementById("app")
);
