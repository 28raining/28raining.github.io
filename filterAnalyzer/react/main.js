import React from "https://unpkg.com/es-react@latest/dev/react.js";
import ReactDOM from "https://unpkg.com/es-react@latest/dev/react-dom.js";
import PropTypes from "https://unpkg.com/es-react@latest/dev/prop-types.js";
import htm from "https://unpkg.com/htm@latest?module";
const html = htm.bind(React.createElement);

function e1 (props) {
  return html`<div>Element ${props.name} value is <input type=text value=${props.value} onChange=${(e) => props.onChange(e,props.idxx)} /></div>`
}
function listElements (props) {
  {
    var r = [];
    var z, j;
    for (z=0; z<props.e.length; z++) {
      j = props.e[z];
      r = r.concat([
        html`<${e1} name=${j.name} value=${j.value} key=${z} idxx=${z} onChange=${props.onChange} />`
      ])
    }
    return r;
  }
}

function Square (props) {
  {
    return html`
      <button className="square", onClick=${props.onClick}>
        ${props.value}
      </button>
    `;
  }
}

class Board extends React.Component {

  renderSquare(i) {
    return html`<${Square} value=${this.props.squares[i]} onClick=${() => this.props.onClick(i)} />`;
  }

  render() {

    return html`
      <div>
        <div className="board-row">
          ${this.renderSquare(0)}
          ${this.renderSquare(1)}
          ${this.renderSquare(2)}
        </div>
        <div className="board-row">
          ${this.renderSquare(3)}
          ${this.renderSquare(4)}
          ${this.renderSquare(5)}
        </div>
        <div className="board-row">
          ${this.renderSquare(6)}
          ${this.renderSquare(7)}
          ${this.renderSquare(8)}
        </div>
      </div>
    `
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      history: [{
        squares: Array(9).fill(null),
        elements: []
      }],
      xNext : true,
      elCounter : 0,
    };
  }


  handleClick(i) {
    const history = this.state.history;
    const current = history[history.length -1];
    const squares = current.squares.slice();
    const elements = current.elements.slice();
    squares[i] = this.state.xNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares:squares,
        elements:elements
      }]),
      xNext: !this.state.xNext
    })
  }

  handleElChange(e,i) {
    const history = this.state.history;
    const current = history[history.length -1];
    const squares = current.squares.slice();
    const elements = current.elements.slice();

    console.log(elements);
    elements[i].value = e.target.value


    this.setState({
      elCounter: this.state.elCounter,
      history: history.concat([{
        squares:squares,
        elements:elements
      }]),
    })
  }

  handleAddCompent() {
    const history = this.state.history;
    const current = history[history.length -1];
    const squares = current.squares.slice();
    const elements = current.elements.slice();


    this.setState({
      elCounter: this.state.elCounter+1,
      history: history.concat([{
        squares:squares,
        elements:elements.concat([{
          name:`R${this.state.elCounter}`,
          value: '10'
        }])
      }]),
    })
  }

  render() {
    const history = this.state.history;
    const current = history[history.length -1];
    const status = `Next player: ${this.state.xNext ? 'X' : 'O'}`;

    return html`
      <div className="game">
        <div className="game-board">
          <${Board} squares=${current.squares} onClick=${(i) => this.handleClick(i)}/>
        </div>
        <div className="game-info">
          <div className="status">${status}</div>
          <ol>{/* TODO */}</ol>
          <ol><button onClick=${() => this.handleAddCompent()}>Add a new component</button></ol>
          <p> List of added elements </p>
          <${listElements} e=${current.elements} onChange=${(e,i) => this.handleElChange(e,i)} />
        </div>
      </div>
    `
  }
}

// ========================================

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(html`<${Game} />`);


const App = (props) => {
  return html`<${Game} />`;
}

ReactDOM.render(
  html`<${App} foo=${"bar"} />`,
  document.getElementById("root")
);


