// import React from "https://unpkg.com/es-react@latest/dev/react.js";
// import ReactDOM from "https://unpkg.com/es-react@latest/dev/react-dom.js";
import React from "https://unpkg.com/es-react@latest/react.js";
import ReactDOM from "https://unpkg.com/es-react@latest/react-dom.js";
// import PropTypes from "https://unpkg.com/es-react@latest/dev/prop-types.js";
import htm from "../js/htm.js";
import { init_draw2d } from './wdk_draw2d.js'
import { calculateMNA } from './mna.js'
const html = htm.bind(React.createElement);

function navBar(props) {
  return html`
    <div className="w-100 p-3 bg-navy text-white">
      <div className="container-xl">
        <div className="row">
          <div className="col-10">
            <h4 className="mb-0"><strong>${props.title}</strong></h4>
          </div>
          <div className="col-1">
            <button type="button" className="btn btn-secondary" onClick=${(e) => props.onClickUndo(e)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"></path>
                <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>`
}

//redo button
{/* <div className="col-1">
  <button type="button" className="btn btn-secondary">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"></path>
      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"></path>
    </svg>
  </button>
</div> */}

function Comments() {
  return html`
  <giscus-widget
      repo="28raining/28raining.github.io"
      repo-id="MDEwOlJlcG9zaXRvcnkxMjcyMzY4NjM="
      category-id="DIC_kwDOB5V6_84CUAVa"
      mapping="number"
      term="1"
      strict="0"
      reactions-enabled="0"
      emit-metadata="0"
      input-position="top"
      theme="light"
      lang="en"
      loading="lazy"
      >
  </giscus-widget>
`
}


function SchematicComponents() {
  return html`
  <div className="row py-1">
    <div className="col" >
      <div className="d-grid gap-2" >
          <div key="1" data-shape="res" className="btn btn-primary draw2d_droppable py-0" title="drag element onto the schematic..">resistor</div>
      </div>
    </div>
    <div className="col" >
      <div className="d-grid gap-2" >
          <div key="2" data-shape="cap" className="btn btn-primary draw2d_droppable py-0" title="drag element onto the schematic..">capacitor</div>
      </div>
    </div>
    <div className="col" >
      <div className="d-grid gap-2" >
          <div key="3" data-shape="ind" className="btn btn-primary draw2d_droppable py-0" title="drag element onto the schematic..">inductor</div>
      </div>
    </div>
    <div className="col" >
      <div className="d-grid gap-2" >
          <div key="7" data-shape="op" className="btn btn-primary draw2d_droppable py-0" title="drag element onto the schematic..">op-amp</div>
      </div>
    </div>
    <div className="col" >
      <div className="d-grid gap-2" >
          <div key="4" data-shape="vin" className="btn btn-primary draw2d_droppable py-0" title="drag element onto the schematic..">voltage input</div>
      </div>
    </div>
    <div className="col" >
      <div className="d-grid gap-2" >
        <div key="6" data-shape="xvout" className="btn btn-primary draw2d_droppable py-0" title="drag element onto the schematic..">voltage probe</div>
      </div>
    </div>
    <div className="col" >
      <div className="d-grid gap-2" >
          <div key="5" data-shape="gnd" className="btn btn-primary draw2d_droppable py-0" title="drag element onto the schematic..">gnd</div>
      </div>
    </div>
    </div>
  `
}
function Schematic() {
  return html`
  <div className="row py-1" key="r124">
    <div className="col" style=${{ height: "512px" }} id="canvasHolder">
      <div id="canvas" className="bg-light border" style=${{ position: 'absolute', overflow: 'auto', width:'2500', height:'2500' }} />
    </div>

  </div>
  `
}

function schematicValidator(props) {
  if (props.ready) var color = "success"
  else var color = "danger"
  return html`
  <div className="col">
    <div className="d-grid gap-2">
      <span className="badge bg-${color}">${props.name}</span>
    </div>
  </div>
  `
}
function SchematicVal(props) {
  return html`
  <div className="row py-1">
        <${schematicValidator} name="vout connected" key="vout" ready=${props.schematicReadiness['vout']} />
        <${schematicValidator} name="vin connected" key="vin" ready=${props.schematicReadiness['vin']} />
        <${schematicValidator} name="gnd connected" key="gnd" ready=${props.schematicReadiness['gnd']} />
        <${schematicValidator} name="solvable" key="solvable" ready=${props.schematicReadiness['solvable']} />
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

// tickformat: "$.2s", // want to show B instead of G for billions
var plotlyLayout = {
  xaxis: {
    showspikes:true,
    type: 'log',
    autorange: true,
    tickformat: ".2s",
    title: 'frequency (Hz)'
  },
  yaxis: {
    showspikes:true,
    title: 'amplitude (dB)'

  },
  hovermode:"y unified",
  autosize: true,
  margin: { t: 0 }
}

function createGraph(el) {
  Plotly.newPlot(el, [{
    x: [0],
    y: [0]
    // x: freq,
    // y: mag
  }], plotlyLayout);
}

function updateGraph(el, freq, mag) {
  // console.log('thinking about it')
  if (el) {
    // console.log('doing it', freq, mag)

    Plotly.react(el, [{
      // x: [1, 2, 3, 4, 5],
      // y: [1, 2, 4, 8, 16]
      x: freq,
      y: mag
    }], plotlyLayout);
  }
}


function TransformResults(props) {


  var z = html`

    <div className="row my-2 py-1 shadow-sm rounded bg-white me-2">
      <div className="col">
        <div className="row text-center">
          <h3>${props.title} Transform</h3>
        </div>
        <div className="row text-center fs-3 py-2">
            ${MyComponent(props.latex)}
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
    var name = props.keys[props.idxx];
    var el = props.elements[name];
    return html`
      <div className="input-group mt-1">
        <span className="input-group-text">${name}</span>
        <input  type="text" className="form-control" value="${el.value}" onChange=${(e) => props.onChange(e, name)} />
        <select  value=${el.unit} className="form-select" onChange=${(e) => props.unitChange(e, name)}>
          ${selectUnits(name)}
        </select>
      </div>
    `
  }
}

function listElements(props) {
  if (Object.keys(props.e).length === 0) {
    return html`
      <div className="row py-1">
        <div className="col text-center">
          <div className="row"><p>Drag components from the top onto the schematic</p></div>
        </div>
      </div>`
  }

  var elPerRow = 5;
  var r = []
  var z;
  var keys = Object.keys(props.e);
  const elements = props.e;
  for (z = 0; z < keys.length; z = z + elPerRow) {
    r.push(html`
      <div className="row py-1" key=row${z}>
        <div className="col" key=${z}>
          <${e1} keys=${keys} elements=${elements} idxx=${z} length=${keys.length} onChange=${props.onChange} unitChange=${props.unitChange} />
        </div>
        <div className="col" key=${z + 1}>
          <${e1} keys=${keys} elements=${elements} idxx=${z + 1} length=${keys.length} onChange=${props.onChange} unitChange=${props.unitChange} />
        </div>
        <div className="col" key=${z + 2}>
          <${e1} keys=${keys} elements=${elements} idxx=${z + 2} length=${keys.length} onChange=${props.onChange} unitChange=${props.unitChange} />
        </div>
        <div className="col" key=${z + 3}>
          <${e1} keys=${keys} elements=${elements} idxx=${z + 3} length=${keys.length} onChange=${props.onChange} unitChange=${props.unitChange} />
        </div>
        <div className="col" key=${z + 4}>
          <${e1} keys=${keys} elements=${elements} idxx=${z + 4} length=${keys.length} onChange=${props.onChange} unitChange=${props.unitChange} />
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
        <span className="input-group-text">f<sub>min</sub></span>
        <input  type="text" className="form-control" value="${props.fminValue}" onChange=${(e) => props.onChange(e, 'fmin')} />
        <select  value=${props.fminUnit} className="form-select" onChange=${(e) => props.unitChange(e, 'fmin')}>
          ${selectUnits('f')}
        </select>
      </div>
    </div>

    <div className="col" key=fmax>
      <div className="input-group mt-1">
        <span className="input-group-text">f<sub>max</sub></span>
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
  console.log("You used a unit I don't know about ", unit)
}

function centerSchematic (schem) {
  var canvasHolder = document.getElementById('canvasHolder');
  // var wrapperComputedStyle = window.getComputedStyle(canvasHolder, null);
  var wrapperWidth = canvasHolder.clientWidth - 26;
  var wrapperHeight = canvasHolder.offsetHeight;
  var centerX = (wrapperWidth-64) / 2;
  var centerY = (wrapperHeight-128) / 2;
  console.log(centerX,centerY);
  var minX=0;
  var maxX=0;
  var minY=0;
  var maxY=0;
  //find min and max x coordinates
  schem.forEach(item => {
    if (item.type != "connection") {
      if ((minX==0) || (item.x < minX)) minX = item.x;
      if ((maxX==0) || (item.x > maxX)) maxX = item.x;
      if ((minY==0) || (item.y < minY)) minY = item.y;
      if ((maxY==0) || (item.y > maxY)) maxY = item.y;
    }
  });
  var schemX = (maxX+minX)/2.0;
  var schemY = (maxY+minY)/2.0;
  if ((centerX < schemX) || (centerY < schemY)) return schem;
  var xShift = 16 * Math.round((centerX - schemX)/16);
  var yShift = 16 * Math.round((centerY - schemY)/16);
  schem.forEach(item => {
    if (item.type != "connection") {
      item.x = item.x + xShift;
      item.y = item.y + yShift;
    }
  });
  console.log(xShift, yShift, maxX, minX, schem);
  return schem;

}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          elements: {},
          fmin: {
            value: 1,
            unit: 'K'
          },
          fmax: {
            value: 100,
            unit: 'G'
          },
          schematic:startupSchematic
        }
      ],
      latex: null,
      bilinearMathML: null,
      elOnSchematic: [],
      schematicReadiness : {
        vout: false,
        vin: false,
        gnd: false,
        solvable: false,
      }
    };

    this.TESTER = null;
    this.freq = [];
    this.mag = [];
    this.resString = null;
    this.preventNewState = false;
  }

  schematicReady () {
    // const current = this.state.history[history.length - 1];
    // console.log(this.state.schematicReadiness, this.state.schematicReadiness.vout && this.state.schematicReadiness.vin && this.state.schematicReadiness.gnd && this.state.schematicReadiness.solvable)
    return (this.state.schematicReadiness.vout && this.state.schematicReadiness.vin && this.state.schematicReadiness.gnd && this.state.schematicReadiness.solvable);
  }

  calculateTF() {
    const current = this.state.history[this.state.history.length - 1];
    // console.log(this.schematicReady())
    if (!this.schematicReady()) {
      // console.log('thhhhh')
      updateGraph(this.TESTER, [], []);
      return;
    } 
    //Convert algebra result into a numerical result
    this.freq = [];
    this.mag = [];
    var scaler;
    var test = this.resString;
    var rep;
    for (const key in current.elements) {
      scaler = unitStrToVal(current.elements[key].unit);
      rep = RegExp(key, 'g')
      test = test.replace(rep, current.elements[key].value * scaler);
    }
    // console.log(test, rep)

    //Now only remaining variable is S, substitute that and solve. Also swap power ^ for **
    const re = /S/gi;
    const re2 = /\^/gi;
    var res = test.replace(re2, "**");

    var fmin = current.fmin.value * unitStrToVal(current.fmin.unit);
    var fmax = current.fmax.value * unitStrToVal(current.fmax.unit);
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

  //name it better
  handledropCb(a, addToSchematic) {

    //prevent user from having 2x vin or 2x vout elements
    if ((a.id == 'xvout') || (a.id == 'vin')) {
      if (a.id in this.state.elOnSchematic) {
        console.log('prevented')
        return;
      }
    }
    addToSchematic(a);

  }

  handleCanvasChange(canvasState) {
    if (canvasState.length == 0) {
      console.log('schematic has been emptied')
      return;
    }
    // console.log("Inside handleCanvasChange");
    var current = JSON.parse(JSON.stringify(this.state.history[this.state.history.length - 1]));

    var latexResult, deleteMeLatex, bilinearMathML;
    var newElementMap;
    var elements = current.elements;
    var schematicReadiness;
    [schematicReadiness, latexResult, newElementMap, deleteMeLatex, this.resString, bilinearMathML] = calculateMNA(canvasState);
    this.state.elOnSchematic = newElementMap;

    var schematicState = [];

    //add new elements
    //handle the parameter input
    for (const key in newElementMap) {
      if ((key == 'gnd') || (key == 'xvout') || (key == 'vin') || (key[0] == 'o')) continue;
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


    //build up a simplified schematic state
    canvasState.forEach(item => {
      if (item.type == "draw2d.Connection") {
        // newConn.source = item.source,
        // target: {node: 'vout', port: 'hybrid0'},
        schematicState.push({
          type: 'connection',
          source: item.source,
          target: item.target          
        });
        //handle this later
      } else {
        var firstLetter = Array.from(item.id)[0];
        schematicState.push({
          type: 'component',
          firstLetter: firstLetter,
          x: item.x,
          y: item.y
        })

        // this.addShapeToSchem(type, item.x, item.y);
      }
    });

    // console.log('schstate', schematicState);
 

    // console.log('newElementMap', newElementMap, elements)
    current.elements = elements;
    current.schematic = schematicState;

    // console.log(schematicReadiness);

    if (this.preventNewState) {
      this.setState({
        latex: latexResult,
        bilinearMathML: bilinearMathML,
        schematicReadiness: schematicReadiness
      }, this.calculateTF);
    } else {
      this.setState({
        history: this.state.history.concat([current]),
        latex: latexResult,
        bilinearMathML: bilinearMathML,
        schematicReadiness: schematicReadiness
      }, this.calculateTF);
    }
    
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
    var current = this.state.history[this.state.history.length - 1];
    centerSchematic(current.schematic);
    // #after dom tree is updated
    this.a = new init_draw2d((a, b) => this.handledropCb(a, b), (b) => this.handleCanvasChange(b), current.schematic);
    // pass this.tff as above
    this.a.addEvL(this.a.view, this.a.writer, (canvasState) => this.handleCanvasChange(canvasState));
    this.TESTER = document.getElementById('tester');
    createGraph(this.TESTER);
    // updateGraph(this.TESTER, this.freq, this.mag)
  }


  handleElChange(e, i) {
    var current = JSON.parse(JSON.stringify(this.state.history[this.state.history.length - 1]));

    if (i == 'fmin') {
      current.fmin.value = e.target.value;
    } else if (i == 'fmax') {
      current.fmax.value = e.target.value;
    } else {
      current.elements[i].value = e.target.value
    }

    this.setState({
      history: this.state.history.concat([current])
    }, this.calculateTF);
  }

  handleUnitChange(e, i) {
    var current = JSON.parse(JSON.stringify(this.state.history[this.state.history.length - 1]));

    if (i == 'fmin') {
        current.fmin.unit = e.target.value;
    } else if (i == 'fmax') {
      current.fmax.unit = e.target.value;
    } else {
      current.elements[i].unit = e.target.value
    }

    this.setState({
      history: this.state.history.concat([current])
    }, this.calculateTF);
  }

  handleUndo() {
    if (this.state.history.length > 2) {
      var a = this.state.history.pop();
      
      console.log('here', this.state.history, a)
      this.preventNewState = true;
      this.state.elOnSchematic = {};

      this.a.reUpdateCanvas(this.state.history[this.state.history.length - 1].schematic, (b) => this.handleCanvasChange(b));
      this.preventNewState = false;
      this.setState({
        history: this.state.history
      });
      console.log("111");
    }
  }





  render() {
    const current = this.state.history[this.state.history.length - 1];
    // console.log(this.state)

    // // Use state (variable containing all user inputs) to do MNA (modified nodal analysis)
    // 

    // Update the DOM
    return html`
      <${navBar} title="ONLINE ELECTRONIC CIRCUIT LAPLACE SOLVER" key="navBar" onClickUndo=${(e) => this.handleUndo(e)}/>
      <div className="w-100 p-2 bg-green" key="wrapper">
        <div className="container-xl" key="topContainer">
          <div className="row shadow-sm rounded bg-white my-2 py-1" id="schematic">
            <div className="col">
              <${SchematicComponents} key="schemComp"/>
              <${Schematic} key="schem"/>
              <${SchematicVal} key="schemVal" schematicReadiness=${this.state.schematicReadiness}/>
              <${listElements} e=${current.elements} key="valueList" onChange=${(e, i) => this.handleElChange(e, i)} unitChange=${(e, i) => this.handleUnitChange(e, i)}/>
            </div>
          </div>
          <${TransformResults} name="World" key="TransformResults" title="Laplace" latex=${this.state.latex} bilinearMathML=${this.state.bilinearMathML} />
          <div className="row shadow-sm rounded bg-white my-2 py-1" id="schematic">
            <div className="col">
            <${FreqResponse}  key="FreqResponse"/>
            <${FreqResponseControllers}  key="FreqResponseControllers" fminValue=${current.fmin.value} fminUnit=${current.fmin.unit} fmaxValue=${current.fmax.value} fmaxUnit=${current.fmax.unit}  onChange=${(e, i) => this.handleElChange(e, i)} unitChange=${(e, i) => this.handleUnitChange(e, i)} />
            </div>
          </div>
          <${TransformResults} name="World" key="TransformResultsBilin" title="Bilinear" latex=${this.state.bilinearMathML}/>
          <${Comments} key='comments' />
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


  }
}

ReactDOM.render(
  html`<${Game} key="game"/>`,
  document.getElementById("app")
);
