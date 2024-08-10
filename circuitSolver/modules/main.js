// import React from "https://unpkg.com/es-react@16.13.1/dev/react.js";
// import ReactDOM from "https://unpkg.com/es-react@16.13.1/dev/react-dom.js";
import React from "https://unpkg.com/es-react@16.13.1/react.js";
import ReactDOM from "https://unpkg.com/es-react@16.13.1/react-dom.js";

import htm from "../js/htm.js";
import { init_draw2d } from "./wdk_draw2d.js";
import { calculateMNA, calcBilinear } from "./mna.js";

const html = htm.bind(React.createElement);

function navBar(props) {
  return html` <div className="w-100 p-3 bg-navy text-white" key="cont_w100">
    <div className="container-xl" key="cont">
      <div className="row" key="r1">
        <div className="col" key="title">
          <h4 className="mb-0" key="head"><strong>${props.title}</strong></h4>
        </div>
        <div className="col-1" key="undo">
          <button type="button" className="btn btn-secondary py-0" title="undo" onClick=${(e) => props.onClickUndo(e)} key="undoB">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="bi">
              <path d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"></path>
              <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"></path>
            </svg>
          </button>
        </div>
        <div className="col d-grid d-md-flex justify-content-md-end" key="navButtons">
          <a className="btn btn-light py-0" title="home" href="../" key="home">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi" viewBox="0 0 16 16">
              <path
                d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z" />
            </svg>
          </a>
          <a className="btn btn-light mx-1 py-0" href="../smith_chart" title="Go to the smith chart tool" key="smith">Smith Chart</a>
          <a className="btn btn-light py-0" href="../circuitSolver" title="Go to the circuit solver tool" key="circuit">Circuit Solver</a>
        </div>
      </div>
    </div>
  </div>`;
}

function Toasts({ toastMxVIsource, toastCopiedLatex, toastCopiedMathML }) {
  return html`
    <div className="toast-container position-fixed top-0 end-0 p-3">
      <div id="liveToast" className="toast bg-warning" role="alert" ref=${toastMxVIsource}>
        <div className="toast-header">
          <strong className="me-auto">Warning</strong>
          <button type="button" className="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div className="toast-body">You can only have one Voltage Source or Current Source. Also only one voltage probe, and one current probe</div>
      </div>

      <div id="liveToast" className="toast bg-success text-white" role="alert" ref=${toastCopiedLatex}>
        <div className="toast-header">
          <strong className="me-auto">Copied to clipboard</strong>
          <button type="button" className="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div className="toast-body">
          Copied to your clipboard. Here's a free online latex editor:
          <a className="text-white" href="https://latexeditor.lagrida.com/" target="_blank">https://latexeditor.lagrida.com/</a>
        </div>
      </div>

      <div id="liveToast" className="toast bg-success text-white" role="alert" ref=${toastCopiedMathML}>
        <div className="toast-header">
          <strong className="me-auto">Copied to clipboard</strong>
          <button type="button" className="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div className="toast-body">
          Copied to your clipboard. Here's a free online MathML editor:
          <a className="text-white" href="https://codepen.io/bqlou/pen/yOgbmb" target="_blank">https://codepen.io/bqlou/pen/yOgbmb</a>
        </div>
      </div>
    </div>
  `;
}

function Comments() {
  return html`
    <!-- <giscus-widget
      repo="28raining/28raining.github.io"
      repo-id="MDEwOlJlcG9zaXRvcnkxMjcyMzY4NjM="
      category-id="DIC_kwDOB5V6_84CUAVa"
      mapping="number"
      term="1"
      strict="0"
      reactions-enabled="0"
      data-reactions-enabled="0"
      emit-metadata="0"
      input-position="top"
      theme="light"
      lang="en"
      loading="lazy">
    </giscus-widget> -->
  <div className="giscus"></div>
  `;
}

function SchematicComponents() {
  return html`
    <div className="row py-1">
      <div className="col">
        <div className="d-grid gap-2">
          <div
            key="1"
            data-shape="res"
            className="btn btn-primary draw2d_droppable py-0"
            title="drag element onto the schematic.."
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Drag onto the schematic">
            resistor
          </div>
        </div>
      </div>
      <div className="col">
        <div className="d-grid gap-2">
          <div
            key="2"
            data-shape="cap"
            className="btn btn-primary draw2d_droppable py-0"
            title="drag element onto the schematic.."
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Drag onto the schematic">
            capacitor
          </div>
        </div>
      </div>
      <div className="col">
        <div className="d-grid gap-2">
          <div
            key="3"
            data-shape="ind"
            className="btn btn-primary draw2d_droppable py-0"
            title="drag element onto the schematic.."
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Drag onto the schematic">
            inductor
          </div>
        </div>
      </div>
      <div className="col">
        <div className="d-grid gap-2">
          <div
            key="7"
            data-shape="op"
            className="btn btn-primary draw2d_droppable py-0"
            title="drag element onto the schematic.."
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Drag onto the schematic">
            op-amp
          </div>
        </div>
      </div>
      <div className="col">
        <div className="d-grid gap-2">
          <div
            key="4"
            data-shape="vin"
            className="btn btn-info draw2d_droppable py-0"
            title="drag element onto the schematic.."
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Drag onto the schematic">
            voltage input
          </div>
        </div>
      </div>
      <div className="col">
        <div className="d-grid gap-2">
          <div
            key="4"
            data-shape="iin"
            className="btn btn-info draw2d_droppable py-0"
            title="drag element onto the schematic.."
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Drag onto the schematic">
            current input
          </div>
        </div>
      </div>
      <div className="col">
        <div className="d-grid gap-2">
          <div
            key="6"
            data-shape="xvout"
            className="btn btn-warning draw2d_droppable py-0"
            title="drag element onto the schematic.."
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Drag onto the schematic">
            voltage prb
          </div>
        </div>
      </div>
      <div className="col">
        <div className="d-grid gap-2">
          <div
            key="6"
            data-shape="iprobe"
            className="btn btn-warning draw2d_droppable py-0"
            title="drag element onto the schematic.."
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Drag onto the schematic">
            current prb
          </div>
        </div>
      </div>
      <div className="col">
        <div className="d-grid gap-2">
          <div
            key="5"
            data-shape="gnd"
            className="btn btn-danger draw2d_droppable py-0"
            title="drag element onto the schematic.."
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Drag onto the schematic">
            gnd
          </div>
        </div>
      </div>
    </div>
  `;
}
function Schematic() {
  return html`
    <div className="row py-1" key="r124">
      <div className="col" style=${{ height: "512" + "px" }} id="canvasHolder">
        <div id="canvas" className="bg-light border" style=${{ position: "absolute", overflow: "auto", width: "2500", height: "2500" }} />
      </div>
    </div>
  `;
}

function schematicValidator(props) {
  if (props.ready) var color = "success";
  else var color = "danger";
  return html`
    <div className="col">
      <div className="d-grid gap-2">
        <span className="badge bg-${color}">${props.name}</span>
      </div>
    </div>
  `;
}
function SchematicVal(props) {
  return html`
    <div className="row py-1">
      <${schematicValidator} name="vout connected" key="vout" ready=${props.schematicReadiness["vout"]} />
      <${schematicValidator} name="vin or iin connected" key="vin" ready=${props.schematicReadiness["vin"]} />
      <${schematicValidator} name="gnd connected" key="gnd" ready=${props.schematicReadiness["gnd"]} />
      <${schematicValidator} name="solvable" key="solvable" ready=${props.schematicReadiness["solvable"]} />
    </div>
  `;
}

function FreqResponse() {
  return html`
    <div className="row">
      <div className="col" style=${{ height: "400" + "px" }}>
        <div id="tester" style=${{ height: "100" + "%", width: "100" + "%" }}></div>
      </div>
    </div>
  `;
}

// tickformat: "$.2s", // want to show B instead of G for billions
var plotlyLayout = {
  xaxis: {
    showspikes: true,
    type: "log",
    autorange: true,
    tickformat: ".2s",
    title: "frequency (Hz)",
  },
  yaxis: {
    showspikes: true,
    title: "amplitude (dB)",
  },
  hovermode: "y unified",
  autosize: true,
  margin: { t: 0 },
};

function createGraph(el) {
  Plotly.newPlot(
    el,
    [
      {
        x: [0],
        y: [0],
        // x: freq,
        // y: mag
      },
    ],
    plotlyLayout
  );
}

function updateGraph(el, freq, mag) {
  // console.log('thinking about it')
  if (el) {
    // console.log('doing it', freq, mag)

    Plotly.react(
      el,
      [
        {
          // x: [1, 2, 3, 4, 5],
          // y: [1, 2, 4, 8, 16]
          x: freq,
          y: mag,
        },
      ],
      plotlyLayout
    );
  }
}

function TransformResults(props) {
  // console.log(props)
  const mathMlString = `<math>${
    props.chosen == "vo"
      ? `<mfrac><mrow><mi>V</mi><mn>o</mn></mrow><mrow><mi>${props.iinOrVin == "vin" ? "V" : "I"}</mi><mn>i</mn></mrow></mfrac>`
      : `<msub><mi>I</mi><mn>prb0</mn></msub>`
  }<mo>=</mo>${props.latex}</math>`;
  var z = html`
    <div key="c1" className="col-12">
      <div key="r1" className="row">
        <div key="title" className="col-6 text-start">
          <h3>${props.title} Transform</h3>
        </div>
        <div key="select" className="col-6 text-end">
          <div className="form-check form-check-inline">
            <input
              key="radio"
              className="form-check-input"
              type="radio"
              name="${`${props.title}inlineRadioOptions`}"
              value="vo"
              checked=${props.chosen == "vo"}
              onChange=${(e) => props.handlePlotChange(e)} />
            <label key="lable" className="form-check-label">${props.iinOrVin == "vin" ? "Vo/Vi" : "Vo/Ii"}</label>
          </div>
          ${props.iprbList.map((Y) => {
            return html`
              <div className="form-check form-check-inline" key="iprb${Y}">
                <input
                  key="radio"
                  className="form-check-input"
                  type="radio"
                  name="${`${props.title}inlineRadioOptions`}"
                  value="Y${Y}"
                  checked=${props.chosen == `Y${Y}`}
                  onChange=${(e) => props.handlePlotChange(e)} />
                <label key="lable" className="form-check-label">Iprb${Y}</label>
              </div>
            `;
          })}
        </div>
      </div>
      <div key="r2" className="row text-center fs-3 py-2">
        ${props.latex || props.title == "Laplace"
          ? html` <div key="c1" className="col-10">${MyComponent(mathMlString)}</div>
              <div key="c2" className="col-2">
                <div key="c3" className="d-grid gap-1">
                  <button
                    type="button"
                    className="btn btn-outline-primary py-0"
                    onClick=${() => {
                      const newLatex = MathML2LaTeX.convert(mathMlString);
                      navigator.clipboard.writeText(newLatex);
                      props.copiedToast.show();
                    }}>
                    Copy LaTeX
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary py-0"
                    onClick=${() => {
                      navigator.clipboard.writeText(mathMlString);
                      props.copiedToastML.show();
                    }}>
                    Copy MathML
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary py-0"
                    onClick=${() => {
                      // const newLatex = MathML2LaTeX.convert(mathMlString);
                      var encoded_latex = encodeURIComponent(props.resString);
                      var newURL = `https://www.wolframalpha.com/input?i2d=true&i=${encoded_latex}`
                      window.open(newURL, '_blank');
                    }}>
                    Wolfram Alpha
                  </button>
                </div>
              </div>`
          : html`<button
              type="button"
              className="btn btn-outline-primary py-0"
              onClick=${() => {
                props.handleRequestBilin();
              }}>
              Calculate bilinear transform
            </button>`}
      </div>
    </div>
  `;
  // console.log(z);
  return z;
}

function selectUnits(name) {
  var resUnits = ["m", "", "K", "M", "G"];
  var capUnits = ["f", "p", "n", "u", "m"];
  var indUnits = ["f", "p", "n", "u", "m", "", "K"];
  var freqUnits = ["", "K", "M", "G"];
  var unitSize, units;
  var r = [];
  var firstLetter = Array.from(name)[0];
  if (firstLetter == "R") {
    units = String.fromCharCode(8486);
    unitSize = resUnits;
  } else if (firstLetter == "L") {
    units = "H";
    unitSize = indUnits;
  } else if (firstLetter == "f") {
    units = "Hz";
    unitSize = freqUnits;
  } else {
    units = "F";
    unitSize = capUnits;
  }
  for (const item of unitSize) {
    r.push(html`<option value="${item}" key="${item}">${item}${units}</option>`);
  }
  return r;
}

function MyComponent(latex) {
  if (!latex) return null;
  return html`<div dangerouslySetInnerHTML=${{ __html: latex }} />`;
}

function e1(props) {
  if (props.idxx >= props.length) return null;
  else {
    var name = props.keys[props.idxx];
    var el = props.elements[name];
    return html`
      <div className="input-group mt-1">
        <input type="text" className="form-control bg-secondary-subtle" value=${el.displayName} onChange=${(e) => props.nameChange(e, name)} />
        <input type="text" className="form-control" value="${el.value}" onChange=${(e) => props.onChange(e, name)} />
        <select value=${el.unit} className="form-select" onChange=${(e) => props.unitChange(e, name)}>
          ${selectUnits(name)}
        </select>
      </div>
    `;
  }
}

function listElements(props) {
  if (Object.keys(props.e).length === 0) {
    return html` <div className="row py-1" key="r1">
      <div className="col text-center" key="c1">
        <p>Drag components from the top onto the schematic</p>
      </div>
    </div>`;
  }
  var elPerRow = 5;
  var r = [];
  var z;
  var keys = Object.keys(props.e);
  const elements = props.e;
  for (z = 0; z < keys.length; z = z + elPerRow) {
    r.push(html` <div className="row py-1" key="row${z}">
      <div className="col" key=${z}>
        <${e1}
          key=${z}
          keys=${keys}
          elements=${elements}
          idxx=${z}
          length=${keys.length}
          onChange=${props.onChange}
          unitChange=${props.unitChange}
          nameChange=${props.nameChange} />
      </div>
      <div className="col" key=${z + 1}>
        <${e1}
          key=${z + 1}
          keys=${keys}
          elements=${elements}
          idxx=${z + 1}
          length=${keys.length}
          onChange=${props.onChange}
          unitChange=${props.unitChange}
          nameChange=${props.nameChange} />
      </div>
      <div className="col" key=${z + 2}>
        <${e1}
          key=${z + 2}
          keys=${keys}
          elements=${elements}
          idxx=${z + 2}
          length=${keys.length}
          onChange=${props.onChange}
          unitChange=${props.unitChange}
          nameChange=${props.nameChange} />
      </div>
      <div className="col" key=${z + 3}>
        <${e1}
          key=${z + 3}
          keys=${keys}
          elements=${elements}
          idxx=${z + 3}
          length=${keys.length}
          onChange=${props.onChange}
          unitChange=${props.unitChange}
          nameChange=${props.nameChange} />
      </div>
      <div className="col" key=${z + 4}>
        <${e1}
          key=${z + 4}
          keys=${keys}
          elements=${elements}
          idxx=${z + 4}
          length=${keys.length}
          onChange=${props.onChange}
          unitChange=${props.unitChange}
          nameChange=${props.nameChange} />
      </div>
    </div>`);
  }

  return r;
}

function FreqResponseControllers(props) {
  return html`
    <div className="row">
      <div className="col" key="fmin">
        <div className="input-group mt-1">
          <span className="input-group-text">f<sub>min</sub></span>
          <input type="text" className="form-control" value="${props.fminValue}" onChange=${(e) => props.onChange(e, "fmin")} />
          <select value=${props.fminUnit} className="form-select" onChange=${(e) => props.unitChange(e, "fmin")}>
            ${selectUnits("f")}
          </select>
        </div>
      </div>

      <div className="col" key="fmax">
        <div className="input-group mt-1">
          <span className="input-group-text">f<sub>max</sub></span>
          <input type="text" className="form-control" value="${props.fmaxValue}" onChange=${(e) => props.onChange(e, "fmax")} />
          <select value=${props.fmaxUnit} className="form-select" onChange=${(e) => props.unitChange(e, "fmax")}>
            ${selectUnits("f")}
          </select>
        </div>
      </div>
    </div>
  `;
}

function unitStrToVal(unit) {
  if (unit == "f") return 1e-15;
  if (unit == "p") return 1e-12;
  if (unit == "n") return 1e-9;
  if (unit == "u") return 1e-6;
  if (unit == "m") return 1e-3;
  if (unit == "K") return 1e3;
  if (unit == "M") return 1e6;
  if (unit == "G") return 1e9;
  if (unit == "T") return 1e12;
  if (unit == "") return 1;
  console.log("You used a unit I don't know about ", unit);
}

function centerSchematic(schem) {
  var canvasHolder = document.getElementById("canvasHolder");
  // var wrapperComputedStyle = window.getComputedStyle(canvasHolder, null);
  var wrapperWidth = canvasHolder.clientWidth - 26;
  var wrapperHeight = canvasHolder.offsetHeight;
  var centerX = (wrapperWidth - 64) / 2;
  var centerY = (wrapperHeight - 128) / 2;
  // console.log(centerX,centerY);
  var minX = 0;
  var maxX = 0;
  var minY = 0;
  var maxY = 0;
  //find min and max x coordinates
  schem.forEach((item) => {
    if (item.type != "connection") {
      if (minX == 0 || item.x < minX) minX = item.x;
      if (maxX == 0 || item.x > maxX) maxX = item.x;
      if (minY == 0 || item.y < minY) minY = item.y;
      if (maxY == 0 || item.y > maxY) maxY = item.y;
    }
  });
  var schemX = (maxX + minX) / 2.0;
  var schemY = (maxY + minY) / 2.0;
  if (centerX < schemX || centerY < schemY) return schem;
  var xShift = 16 * Math.round((centerX - schemX) / 16);
  var yShift = 16 * Math.round((centerY - schemY) / 16);
  schem.forEach((item) => {
    if (item.type != "connection") {
      item.x = item.x + xShift;
      item.y = item.y + yShift;
    }
  });
  // console.log(xShift, yShift, maxX, minX, schem);
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
            unit: "K",
          },
          fmax: {
            value: 100,
            unit: "G",
          },
          schematic: startupSchematic,
        },
      ],
      latex: null,
      iinOrVin: "vin",
      iprbList: [],
      bilinearMathML: null,
      elOnSchematic: [],
      schematicReadiness: {
        vout: false,
        vin: false,
        gnd: false,
        solvable: false,
      },
      chosenPlot: "vo",
    };

    this.TESTER = null;
    this.freq = [];
    this.mag = [];
    this.resString = null;
    this.preventNewState = false;
    this.toastMxVIsource = React.createRef();
    this.toastCopiedLatex = React.createRef();
    this.toastCopiedMathML = React.createRef();
  }

  schematicReady() {
    // const current = this.state.history[history.length - 1];
    // console.log(this.state.schematicReadiness, this.state.schematicReadiness.vout && this.state.schematicReadiness.vin && this.state.schematicReadiness.gnd && this.state.schematicReadiness.solvable)
    return (
      this.state.schematicReadiness.vout && this.state.schematicReadiness.vin && this.state.schematicReadiness.gnd && this.state.schematicReadiness.solvable
    );
  }

  calculateTF() {
    const current = this.state.history[this.state.history.length - 1];
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
      rep = RegExp(key, "g");
      test = test.replace(rep, current.elements[key].value * scaler);
    }
    // console.log(test, rep)

    //Now only remaining variable is S, substitute that and solve. Also swap power ^ for **
    const re = /s/gi;
    const re2 = /\^/gi;
    var res = test.replace(re2, "**");

    var fmin = current.fmin.value * unitStrToVal(current.fmin.unit);
    var fmax = current.fmax.value * unitStrToVal(current.fmax.unit);
    var fstepdB_20 = Math.log10(fmax / fmin) / 100;
    var fstep = 10 ** fstepdB_20;
    // console.log(fmin, fmax, fstep)
    // console.log(fmin, fmax, fstep, fstepdB_20, this.freq)
    // console.log('bp9', this.resString, res)

    for (var f = fmin; f < fmax; f = f * fstep) {
      this.freq.push(f);
      this.mag.push(20 * Math.log10(Math.abs(eval(res.replace(re, 2 * Math.PI * f)))));
    }

    // console.log("response: ", this.freq, this.mag )

    updateGraph(this.TESTER, this.freq, this.mag);
  }

  //name it better
  handledropCb(a, addToSchematic) {
    //prevent user from having 2x vin or 2x vout elements

    if (a.id == "xvout" || a.id == "vin" || a.id == "iin") {
      if (a.id in this.state.elOnSchematic) {
        this.bsToast.show();
        return;
      } else if (a.id == "iin" && "vin" in this.state.elOnSchematic) {
        this.bsToast.show();
        return;
      } else if (a.id == "vin" && "iin" in this.state.elOnSchematic) {
        this.bsToast.show();
        return;
      }
    }

    //prevent multiple current probes
    var allLetters = Array.from(a.id);
    if (allLetters[0] == "Y") {
      for (const e in this.state.elOnSchematic) {
        allLetters = Array.from(e);
        if (allLetters[0] == "Y") {
          this.bsToast.show();
          return;
        }
      }
    }
    addToSchematic(a);
  }

  handleCanvasChange(canvasState) {
    if (canvasState.length == 0) {
      console.log("schematic has been emptied", this.state);
      return;
    }
    // console.log("Inside handleCanvasChange");
    var current = JSON.parse(JSON.stringify(this.state.history[this.state.history.length - 1]));

    var mathMlResult, bilinearMathML;
    var newElementMap;
    var elements = current.elements;
    var schematicReadiness;
    var iinOrVin;
    var iprbList;
    [schematicReadiness, mathMlResult, newElementMap, this.resString, iinOrVin, iprbList] = calculateMNA(canvasState, this.state.chosenPlot);
    this.state.elOnSchematic = newElementMap;

    var schematicState = [];

    //add new elements
    //handle the parameter input
    for (const key in newElementMap) {
      if (key == "gnd" || key == "xvout" || key == "vin" || key[0] == "o" || key[0] == "Y") continue;
      var allLetters = Array.from(key);
      var firstLetter = allLetters[0];
      if (!(key in elements)) {
        if (firstLetter == "R") {
          elements[key] = {
            value: 10,
            unit: "K",
            displayName: key,
          };
        } else if (firstLetter == "L") {
          elements[key] = {
            value: 1,
            unit: "u",
            displayName: key,
          };
        } else {
          elements[key] = {
            value: 1,
            unit: "p",
            displayName: key,
          };
        }
      } else {
        //handle renaming
        if (elements[key].displayName != key) {
          var dispLetters = Array.from(elements[key].displayName);
          mathMlResult = mathMlResult.replaceAll(
            `<mi>${firstLetter}</mi><mn>${allLetters.slice(1, allLetters.length).join("")}</mn>`,
            `<mi>${firstLetter}</mi><mn>${dispLetters.slice(1, dispLetters.length).join("")}</mn>`
          );
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
    canvasState.forEach((item) => {
      if (item.type == "draw2d.Connection") {
        // newConn.source = item.source,
        // target: {node: 'vout', port: 'hybrid0'},
        schematicState.push({
          type: "connection",
          source: item.source,
          target: item.target,
        });
        //handle this later
      } else {
        schematicState.push({
          type: "component",
          id: item.id,
          x: item.x,
          y: item.y,
        });
      }
    });

    // console.log('schstate', schematicState);

    // console.log('newElementMap', newElementMap, elements)
    current.elements = elements;
    current.schematic = schematicState;

    // console.log(schematicReadiness);

    if (this.preventNewState) {
      this.setState(
        {
          iinOrVin: iinOrVin,
          iprbList: iprbList,
          latex: mathMlResult,
          bilinearMathML: bilinearMathML,
          schematicReadiness: schematicReadiness,
        },
        this.calculateTF
      );
    } else {
      // console.log(iprbList, iprbList.length);
      if (iprbList.length == 0) this.setState({ chosenPlot: "vo" });
      this.setState(
        {
          history: this.state.history.concat([current]),
          latex: mathMlResult,
          bilinearMathML: bilinearMathML,
          schematicReadiness: schematicReadiness,
          iinOrVin: iinOrVin,
          iprbList: iprbList,
        },
        this.calculateTF
      );
    }
  }

  getElements() {
    return this.state.history[this.state.history.length - 1].elements;
  }

  componentDidMount() {
    var current = this.state.history[this.state.history.length - 1];
    centerSchematic(current.schematic);
    // #after dom tree is updated
    this.wdk_draw2d = new init_draw2d(
      (a, b) => this.handledropCb(a, b),
      (b) => this.handleCanvasChange(b),
      current.schematic,
      () => this.getElements()
    );
    // pass this.tff as above
    this.wdk_draw2d.addEvL(this.wdk_draw2d.view, this.wdk_draw2d.writer, (canvasState) => this.handleCanvasChange(canvasState));
    this.TESTER = document.getElementById("tester");
    createGraph(this.TESTER);
    // updateGraph(this.TESTER, this.freq, this.mag)

    //enable the toasts
    this.bsToast = bootstrap.Toast.getOrCreateInstance(this.toastMxVIsource.current);
    this.copiedToast = bootstrap.Toast.getOrCreateInstance(this.toastCopiedLatex.current);
    this.copiedToastML = bootstrap.Toast.getOrCreateInstance(this.toastCopiedMathML.current);

    //enable tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
  }

  handleElChange(e, i) {
    var current = JSON.parse(JSON.stringify(this.state.history[this.state.history.length - 1]));

    if (i == "fmin") {
      current.fmin.value = e.target.value;
    } else if (i == "fmax") {
      current.fmax.value = e.target.value;
    } else {
      current.elements[i].value = e.target.value;
    }

    this.setState(
      {
        history: this.state.history.concat([current]),
      },
      this.calculateTF
    );
  }

  handlePlotChange(e) {
    var current = JSON.parse(JSON.stringify(this.state.history[this.state.history.length - 1]));

    // console.log(e.target.value);
    // return;
    this.setState(
      {
        chosenPlot: e.target.value,
      },
      () => this.redrawSchematic(current)
    );
  }

  handleUnitChange(e, i) {
    var current = JSON.parse(JSON.stringify(this.state.history[this.state.history.length - 1]));

    if (i == "fmin") {
      current.fmin.unit = e.target.value;
    } else if (i == "fmax") {
      current.fmax.unit = e.target.value;
    } else {
      current.elements[i].unit = e.target.value;
    }

    this.setState(
      {
        history: this.state.history.concat([current]),
      },
      this.calculateTF
    );
  }

  redrawSchematic(current) {
    this.preventNewState = true;
    this.state.elOnSchematic = {};
    this.wdk_draw2d.reUpdateCanvas(current.schematic, (b) => this.handleCanvasChange(b));
    this.preventNewState = false;
    this.calculateTF;
  }

  handleNameChange(e, i) {
    if (e.target.value.length < 1) return;
    var firstLetter = Array.from(e.target.value)[0];
    if (!["C", "L", "R"].includes(firstLetter)) return; //if name no longer starts with...

    var current = JSON.parse(JSON.stringify(this.state.history[this.state.history.length - 1]));
    current.elements[i].displayName = e.target.value;

    //change the state (part name) then redraw the entire canvas
    this.setState(
      {
        history: this.state.history.concat([current]),
      },
      // this.redrawSchematic(current)
      () => this.redrawSchematic(current)
      // {
      //   this.preventNewState = true;
      //   this.state.elOnSchematic = {};
      //   this.wdk_draw2d.reUpdateCanvas(current.schematic, (b) => this.handleCanvasChange(b));
      //   this.preventNewState = false;
      //   this.calculateTF;
      // }
    );

    // this.setState(
    //   {
    //     history: this.state.history.concat([current]),
    //   },
    //   this.calculateTF
    // );
  }

  handleUndo(deleteOld) {
    if (this.state.history.length > 2) {
      if (deleteOld) {
        var a = this.state.history.pop();
        console.log("here", this.state.history, a);
      }

      this.preventNewState = true;
      this.state.elOnSchematic = {};

      this.wdk_draw2d.reUpdateCanvas(this.state.history[this.state.history.length - 1].schematic, (b) => this.handleCanvasChange(b));
      this.preventNewState = false;
      this.setState({
        history: this.state.history,
      });

      // this.setState(
      //   {
      //     history: this.state.history.concat([current]),
      //   },
      //   // this.redrawSchematic(current)
      //   () => this.redrawSchematic(current)
      // this.preventNewState = true;
      // this.state.elOnSchematic = {};
      // this.wdk_draw2d.reUpdateCanvas(current.schematic, (b) => this.handleCanvasChange(b));
      // this.preventNewState = false;
      // this.calculateTF;
    }
  }

  handleRequestBilin() {
    this.setState({ bilinearMathML: calcBilinear() });
  }

  render() {
    const current = this.state.history[this.state.history.length - 1];
    // console.log(this.state)

    // // Use state (variable containing all user inputs) to do MNA (modified nodal analysis)
    //

    // Update the DOM
    return html`
      <${navBar} title="ONLINE CIRCUIT SOLVER" key="navBar" onClickUndo=${() => this.handleUndo(true)} />
      <${Toasts} key="toasts" toastMxVIsource=${this.toastMxVIsource} toastCopiedLatex=${this.toastCopiedLatex} toastCopiedMathML=${this.toastCopiedMathML} />
      <div className="w-100 p-2 bg-green" key="wrapper">
        <div className="container-xl" key="topContainer">
          <div className="row">
            <div className="col">
              <p className="my-0">
                This free online circuit solver tool can calculate the transfer function of circuits built from resistors, capacitors, inductors and op-amps.
                The user can quickly explore different topologies and find their Laplace transform
              </p>
            </div>
          </div>
          <div className="row shadow-sm rounded bg-lightgreen my-2 py-1" id="schematic">
            <div className="col">
              <${SchematicComponents} key="schemComp" />
              <${Schematic} key="schem" />
              <${SchematicVal} key="schemVal" schematicReadiness=${this.state.schematicReadiness} />
              <${listElements}
                e=${current.elements}
                key="valueList"
                onChange=${(e, i) => this.handleElChange(e, i)}
                unitChange=${(e, i) => this.handleUnitChange(e, i)}
                nameChange=${(e, i) => this.handleNameChange(e, i)} />
            </div>
          </div>
          <div key="lapl" className="row my-2 py-1 shadow-sm rounded bg-lightgreen">
            <${TransformResults}
              name="World"
              key="TransformResults"
              title="Laplace"
              latex=${this.state.latex}
              iinOrVin=${this.state.iinOrVin}
              iprbList=${this.state.iprbList}
              copiedToast=${this.copiedToast}
              copiedToastML=${this.copiedToastML}
              resString=${this.resString}
              handlePlotChange=${(e) => this.handlePlotChange(e)}
              chosen=${this.state.chosenPlot} />

            <div className="col-12 pt-2">
              <${FreqResponse} key="FreqResponse" />
              <${FreqResponseControllers}
                key="FreqResponseControllers"
                fminValue=${current.fmin.value}
                fminUnit=${current.fmin.unit}
                fmaxValue=${current.fmax.value}
                fmaxUnit=${current.fmax.unit}
                onChange=${(e, i) => this.handleElChange(e, i)}
                unitChange=${(e, i) => this.handleUnitChange(e, i)} />
            </div>
          </div>
          <div key="bilin" className="row my-2 py-1 shadow-sm rounded bg-lightgreen">
            <${TransformResults}
              name="World"
              key="TransformResultsBilin"
              title="Bilinear"
              latex=${this.state.bilinearMathML}
              iinOrVin=${this.state.iinOrVin}
              iprbList=${[]}
              copiedToast=${this.copiedToast}
              handleRequestBilin=${() => this.handleRequestBilin()}
              copiedToastML=${this.copiedToastML}
              handlePlotChange=${(e) => this.handlePlotChange(e)}
              chosen=${this.state.chosenPlot} />
          </div>
          <div key="comments" className="row my-2 py-1 shadow-sm rounded bg-lightgreen">
            <${Comments} key="comments" />
          </div>
        </div>
      </div>
    `;
  }
}

ReactDOM.render(html`<${Game} key="game" />`, document.getElementById("app"));
