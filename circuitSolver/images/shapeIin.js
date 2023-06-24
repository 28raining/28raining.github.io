

var shapeIin = draw2d.SVGFigure.extend({

  init: function (attr) {
    this._super(extend({ width: 32, height: 80 }, attr));
    this.ressvgs = `
    <svg xmlns="http://www.w3.org/2000/svg">
      <circle cx="33" cy="64" r="32" fill="#FFF" stroke="#000" stroke-width="10" pointer-events="all"/>
      <path stroke-linecap="round" fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="10" d="M33,32v-32m0,112v-16m0,16h22q10,0,4,8l-20,32q-6,8,-12,0l-20,-32q-6,-8,4,-8h22" pointer-events="stroke"/>
      <path stroke-linecap="round" fill="none" stroke="#000" stroke-miterlimit="10" d="M33,80v-32m-12,20l12,12m0,0l12,-12" pointer-events="stroke"/>
    </svg>
      `;
  },
  getSVG: function () {
    return this.ressvgs;
  }
});