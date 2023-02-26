// import React from "https://unpkg.com/es-react@latest/dev/react.js";
// import ReactDOM from "https://unpkg.com/es-react@latest/dev/react-dom.js";
import React from "https://unpkg.com/es-react@latest/react.js";
import ReactDOM from "https://unpkg.com/es-react@latest/react-dom.js";
import htm from "/circuitSolver/js/htm.js";
const html = htm.bind(React.createElement);

function navBar(props) {
  return html`
    <div className="w-100 p-3 bg-navy text-white">
      <div className="container-xl">
        <div className="row">
          <div className="col">
            <h4 className="mb-0"><strong>${props.title}</strong></h4>
          </div>
          <div className="col d-grid d-md-flex justify-content-md-end">
            <a className="btn btn-light py-0" title="home" href="../">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi" viewBox="0 0 16 16">
                <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
              </svg>
            </a>
            <a className="btn btn-light mx-1 py-0" href="../smith_chart" title="Go to the smith chart tool">Smith Chart</a>
            <a className="btn btn-light py-0" href="../circuitSolver" title="Go to the circuit solver tool">Circuit Solver</a>
          </div>
        </div>
      </div>
    </div>`
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.randomVar = 27;
  }


render() {
  // Update the DOM
  return html`
    <${navBar} title="HOME" key="navBar"/>
    <div className="w-100 p-2 bg-green" key="wrapper">
      <div className="container-xl" key="topContainer">
        <div className="row shadow-sm rounded bg-lightgreen my-2 py-1" id="schematic">
          <div className="col">
            <h3>Hi</h3>
            <p>I've had some fun building a couple of webtools! People seem to like the Smith Chart tool that gets around 4000 users a month - and students keep sending me their homework questions 😆</p>
            <p>Recently (early 2023) the 'circuit solver' was created as I was not aware of any existing tool that will find the laplace transform of a drawn circuit. With bigger circuits this is super hard / error-prone to do by hand, and I personally wanted a tool to find the bilinear transform (to aid in circuit modeling). The tool is built on Modified Nodal Analysis. I put a lot of work into the tool to get it to this state, but it still has some problems like it's hella slow when the circuit gets big</p>    
            <h3>Future coding ideas</h3>
            <p>Recently on the circuit solver I realized there's some tools missing from the huge Javascript ecosystem</p>
            <ul>
              <li><b>Algebra Solver</b> - There are two highly featured algebra solvers out there; Nerdamer and Algebrite. They have so many functions (for example matrix inversion) but are totally flawed because they can't simplify simple Algebra! On Algegrite.org you can test it can't solve ths simple case: simplify((1/(x-1)) + 1/(1-x)). Same for Neramer. Neither library are well supported anymore and tbh I think the developers are afraid to dig into this as its such fundamental flaw. Anyway, I ended up using https://github.com/Yaffle/Expression (thankfully someone did the work for me lol) which is teribly documented and only half finished</li>
              <li><b>Microsoft Visio in JS</b> - I'm using Draw2D which is has been excellent. It is kind of old though, it uses Jquery still and the issues on github are sitting there unattended. It has some basic bugs like crashing when you drag multiple objects, and not showing the grid when zooming. Alternatives like gojs.net cost loads of money</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    `;
}
}

ReactDOM.render(
html`<${Game} key="game"/>`,
document.getElementById("app")
);