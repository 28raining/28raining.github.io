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

function schematicValidator(props) {
  // console.log(element, schematicReadiness[element]);
  if (props.ready) var color = "success"
  else var color = "danger"
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
        <div key="3" data-shape="ind" className="btn btn-primary draw2d_droppable" title="dragdrop the table into the canvas..">Inductor</div>
        <div key="4" data-shape="vin" className="btn btn-primary draw2d_droppable" title="dragdrop the table into the canvas..">Input voltage</div>
        <div key="5" data-shape="gnd" className="btn btn-primary draw2d_droppable" title="dragdrop the table into the canvas..">GND</div>
        <div key="6" data-shape="vout" className="btn btn-primary draw2d_droppable" title="dradrop the table into the canvas..">Vout</div>
        <div key="7" data-shape="op" className="btn btn-primary draw2d_droppable" title="dradrop the table into the canvas..">OpAmp</div>
    </div>
  </div>
  `
}
function Schematic() {
  return html`
  <div className="row" key="r124">
    <div className="col" style=${{ height: "300px" }} id="canvasHolder">
      <div id="canvas" className="bg-light border" style=${{ position: 'absolute' }} />
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
        <div className="col" style=${{ height: "400px" }}>
          <div id="tester"  style=style=${{ height: '100%', width: '100%' }}></div>
        </div>
      </div>
      `
}

function createGraph(el) {
  Plotly.newPlot(el, [{
    x: [1, 2, 3, 4, 5],
    y: [1, 2, 4, 8, 16]
    // x: freq,
    // y: mag
  }], {
    xaxis: {
      showspikes:true,
      type: 'log',
      autorange: true
    },
    yaxis: {
      showspikes:true,
    },
    hovermode:"y unified",
    autosize: true,
    margin: { t: 0 }
  });
}

function updateGraph(el, freq, mag) {
  if (el) {
    Plotly.react(el, [{
      // x: [1, 2, 3, 4, 5],
      // y: [1, 2, 4, 8, 16]
      x: freq,
      y: mag
    }], {
      xaxis: {
        showspikes:true,
        type: 'log',
        autorange: true
      },
      yaxis: {
        showspikes:true,
      },
      autosize: true,
      margin: { t: 0 }
    });
  }
}


function TransformResults(props) {

  // Old latex
  //   <div className="row">
  //   The answer you provided is: ${MyComponentOLD(props.deleteMeLatex)}
  // </div>

  var z = html`
    <div className="row">
      <div className="col">
        <div className="row text-center">
          <h3>Laplace</h3>
        </div>
        <div className="row">
            ${MyComponent(props.latex)}
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
  // console.log(z);
  return z;
}

function selectUnits(name) {
  var resUnits = ['m', '', 'K', 'M', 'G']
  var capUnits = ['f', 'p', 'n', 'u', 'm']
  var indUnits = ['f', 'p', 'n', 'u', 'm', '', 'K']
  var freqUnits = ['', 'K', 'M', 'G']
  var unitSize, units;
  var r = [];
  var firstLetter = Array.from(name)[0];
  if (firstLetter == 'R') {
    units = String.fromCharCode(8486);
    unitSize = resUnits;
  } else if (firstLetter == 'L') {
    units = 'H';
    unitSize = indUnits;
  } else if (firstLetter == 'f') {
    units = 'Hz';
    unitSize = freqUnits;
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
  return {
    __html: katex.renderToString(`${latex}`, {
      throwOnError: false
    })
  };
}


function MyComponentOLD(latex) {
  return html`<div dangerouslySetInnerHTML=${createMarkup(latex)} />`
}
function MyComponent(latex) {
  // console.log('latex!', latex)
  var z = `<math>
              <mfrac>
                <mrow><mi>V</mi><mn>o</mn></mrow>
                <mrow><mi>V</mi><mn>i</mn></mrow>
              </mfrac>
              <mo>=</mo>
              ${latex}
            </math>`;
  // var zz = htmlToElement(z);
  // console.log(z);
  // return [zz];
  // return html`<math>${latex}</math>`;
  // //FIXME - change latex for MathML
  // return html`<math>${latex}</math>`
  return html`<div dangerouslySetInnerHTML=${{ __html: z }} />`
  // return html`<div dangerouslySetInnerHTML=${createMarkup(latex)} />`
}

function e1(props) {
  if (props.idxx >= props.length) return null
  else {
    return html`
      <div className="input-group mt-1">
        <span className="input-group-text">${props.name}</span>
        <input  type="text" className="form-control" value="${props.el.value}" onChange=${(e) => props.onChange(e, props.name)} />
        <select  value=${props.el.unit} className="form-select" onChange=${(e) => props.unitChange(e, props.name)}>
          ${selectUnits(props.name)}
        </select>
      </div>
    `
  }
}

function listElements(props) {
  if (Object.keys(props.e).length === 0) {
    return html`
      <div className="row py-3">
        <div className="col text-center">
          <div className="row"><p>Drag components from the top onto the schematic</p></div>
        </div>
      </div>`
  }

  var elPerRow = 3;
  var r = []
  var z;
  var keys = Object.keys(props.e);
  const elements = props.e;
  for (z = 0; z < keys.length; z = z + elPerRow) {
    r.push(html`
      <div className="row" key=row${z}>
        <div className="col" key=${z}>
          <${e1} name=${keys[z]} el=${elements[keys[z]]} idxx=${z} length=${keys.length} onChange=${props.onChange} unitChange=${props.unitChange} />
        </div>
        <div className="col" key=${z + 1}>
          <${e1} name=${keys[z + 1]} el=${elements[keys[z + 1]]} idxx=${z + 1} length=${keys.length} onChange=${props.onChange} unitChange=${props.unitChange} />
        </div>
        <div className="col" key=${z + 2}>
          <${e1} name=${keys[z + 2]} el=${elements[keys[z + 2]]}idxx=${z + 2} length=${keys.length} onChange=${props.onChange} unitChange=${props.unitChange} />
        </div>
      </div>`)
  }

  return r;
}

function FreqResponseControllers(props) {
  return html`
  <div className="row">
    <div className="col" key=fmin>
      <div className="input-group mt-1">
        <span className="input-group-text">Fmin</span>
        <input  type="text" className="form-control" value="${props.fminValue}" onChange=${(e) => props.onChange(e, 'fmin')} />
        <select  value=${props.fminUnit} className="form-select" onChange=${(e) => props.unitChange(e, 'fmin')}>
          ${selectUnits('f')}
        </select>
      </div>
    </div>

    <div className="col" key=fmax>
      <div className="input-group mt-1">
        <span className="input-group-text">fmax</span>
        <input  type="text" className="form-control" value="${props.fmaxValue}" onChange=${(e) => props.onChange(e, 'fmax')} />
        <select  value=${props.fmaxUnit} className="form-select" onChange=${(e) => props.unitChange(e, 'fmax')}>
          ${selectUnits('f')}
        </select>
      </div>
    </div>

  </div>
  `
}

function unitStrToVal(unit) {
  if (unit == 'f') return 1e-15;
  if (unit == 'p') return 1e-12;
  if (unit == 'n') return 1e-9;
  if (unit == 'u') return 1e-6;
  if (unit == 'm') return 1e-3;
  if (unit == 'K') return 1e3;
  if (unit == 'M') return 1e6;
  if (unit == 'G') return 1e9;
  if (unit == 'T') return 1e12;
  if (unit == '') return 1
  console.log("You used a unit I don't know about... ", unit)
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      elements: [],
      latex: null,
      deleteMeLatex: null,
      elOnSchematic: [],
      fmin: {
        value: 1,
        unit: 'K'
      },
      fmax: {
        value: 100,
        unit: 'G'
      },
    };
    this.schematicReadiness = {
      vout: false,
      vin: false,
      gnd: false,
    };
    this.TESTER = null;
    this.freq = [];
    this.mag = [];
    this.resString = null;
  }

  //name it better
  handledropCb(a, addToSchematic) {
    // console.log("Drop call back does nothing");
    // console.log("Elements on schematic before this drop are: ", this.state.elOnSchematic, 'element ur dropping is', a);


    //prevent user from having 2x vin or 2x vout elements
    if ((a.id == 'vout') || (a.id == 'vin')) {
      // console.log(this.state.elOnSchematic)
      if (a.id in this.state.elOnSchematic) {
        // console.log('denied');
        return;
      }
    }
    addToSchematic(a);
    // return true;
    // const elements = this.state.elements.slice();

  }

  schematicReady () {
    return (this.schematicReadiness.vout && this.schematicReadiness.vin && this.schematicReadiness.gnd);
  }

  calculateTF() {
    if (!this.schematicReady()) return;
    // console.log(this.state)
    //Convert algebra result into a numerical result
    this.freq = [];
    this.mag = [];
    var scaler;
    var test = this.resString;
    var rep;
    // console.log(this.state.elements)
    for (const key in this.state.elements) {
      scaler = unitStrToVal(this.state.elements[key].unit);
      rep = RegExp(key, 'g')
      test = test.replace(rep, this.state.elements[key].value * scaler);
    }
    // console.log(test, rep)

    //Now only remaining variable is S, substitute that and solve. Also swap power ^ for **
    const re = /S/gi;
    const re2 = /\^/gi;
    var res = test.replace(re2, "**");

    var fmin = this.state.fmin.value * unitStrToVal(this.state.fmin.unit);
    var fmax = this.state.fmax.value * unitStrToVal(this.state.fmax.unit);
    var fstepdB_20 = Math.log10(fmax/fmin) / 100
    var fstep = 10**fstepdB_20;
    // console.log(fmin, fmax, fstep)
    // console.log(fmin, fmax, fstep, fstepdB_20, this.freq)
    
    for (var f = fmin; f < fmax; f = f * fstep) {
      this.freq.push(f);
      this.mag.push(20 * Math.log10(eval(res.replace(re, 2 * Math.PI * f))));
    }
    
    // console.log("response: ", this.freq, this.mag )

    updateGraph(this.TESTER, this.freq, this.mag)
  }

  handleCanvasChange(canvasState) {
    // console.log("Inside handleCanvasChange");
    // console.log(canvasState);
    var latexResult, deleteMeLatex;
    var newElementMap;
    var elements = this.state.elements;
    [this.schematicReadiness, latexResult, newElementMap, deleteMeLatex, this.resString] = calculateMNA(canvasState, this.schematicReadiness);
    this.state.elOnSchematic = newElementMap;

    //add new elements
    for (const key in newElementMap) {
      if ((key == 'gnd') || (key == 'vout') || (key == 'vin')) continue;
      if (!(key in elements)) {
        var firstLetter = Array.from(key)[0];
        if (firstLetter == 'R') {
          elements[key] = {
            value: 10,
            unit: 'K',
          };
        } else if (firstLetter == 'L') {
          elements[key] = {
            value: 1,
            unit: 'u',
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
      elements: elements,
      latex: latexResult,
      deleteMeLatex: deleteMeLatex
    })

    this.calculateTF();
  
    //check canvas for any vertex that are not snapped to the grid
    // var updateCanvas = false;
    // for (const item in canvasState) {

    //   if (canvasState[item].type == "draw2d.Connection") {
    //     for (var i=0; i<canvasState[item]['vertex'].length; i++) {
    //       for (const ax of ['x', 'y']) {
    //         if (canvasState[item]['vertex'][i][ax] % 16 != 0) {
    //           canvasState[item]['vertex'][i][ax] = 16 * Math.round(canvasState[item]['vertex'][i][ax]/16);
    //           updateCanvas = true;
    //           console.log('vertex',  canvasState[item]['vertex'][i])
    //         }
    //       }
    //     } 
    //   }
    // };

    // if (updateCanvas) {
    //   console.log('updating canvas');
    //   reUpdateCanvas(canvasState)
    // }
  }

  componentDidMount() {
    // #after dom tree is updated
    this.a = new init_draw2d((a, b) => this.handledropCb(a, b), (b) => this.handleCanvasChange(b));
    // pass this.tff as above
    this.a.addEvL(this.a.view, this.a.writer, (canvasState) => this.handleCanvasChange(canvasState));
    this.TESTER = document.getElementById('tester');
    createGraph(this.TESTER);
    updateGraph(this.TESTER, this.freq, this.mag)
  }


  handleElChange(e, i) {
    if (i == 'fmin') {
      this.setState({
        fmin: {
          value: e.target.value,
          unit: this.state.fmin.unit
        }
      }, () => this.calculateTF());
    } else if (i == 'fmax') {
      this.setState({
        fmax: {
          value: e.target.value,
          unit: this.state.fmax.unit
        }
      }, () => this.calculateTF());
    } else {
      const elements = this.state.elements;
      elements[i].value = e.target.value
      this.setState({
        elements: elements
      }, () => this.calculateTF());
    }
    // console.log(this.state);
    // this.calculateTF();
  }

  handleUnitChange(e, i) {
    if (i == 'fmin') {
      this.setState({
        fmin: {
          unit: e.target.value,
          value: this.state.fmin.value
        }
      }, () => this.calculateTF());
    } else if (i == 'fmax') {
      this.setState({
        fmax: {
          unit: e.target.value,
          value: this.state.fmax.value
        }
      }, () => this.calculateTF());
    } else {
      const elements = this.state.elements;
      elements[i].unit = e.target.value
      this.setState({
        elements: elements
      }, () => this.calculateTF());
    }
    // console.log(this.state);
    // this.calculateTF();
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
      <div className="w-100 p-3 bg-green">
        <div className="container-xl">
          <${SchematicComponents} key="schemComp"/>
          <${Schematic} key="schem"/>
          <${SchematicVal} key="schemVal" schematicReadiness=${this.schematicReadiness}/>
          <${listElements} e=${this.state.elements} key="valueList" onChange=${(e, i) => this.handleElChange(e, i)} unitChange=${(e, i) => this.handleUnitChange(e, i)}/>
          <${TransformResults} name="World" key="TransformResults" latex=${this.state.latex} deleteMeLatex=${this.state.deleteMeLatex} />
          <${FreqResponse}  key="FreqResponse"/>
          <${FreqResponseControllers}  key="FreqResponseControllers" fminValue=${this.state.fmin.value} fminUnit=${this.state.fmin.unit} fmaxValue=${this.state.fmax.value} fmaxUnit=${this.state.fmax.unit}  onChange=${(e, i) => this.handleElChange(e, i)} unitChange=${(e, i) => this.handleUnitChange(e, i)} />
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

  }
}

ReactDOM.render(
  html`<${Game} key="game"/>`,
  document.getElementById("app")
);
