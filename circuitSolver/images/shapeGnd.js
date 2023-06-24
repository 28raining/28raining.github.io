

var shapeGnd = draw2d.SVGFigure.extend({

  init: function (attr) {
    this._super(extend({ width: 32, height: 32 }, attr));
    this.ressvgs = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke="#000" stroke-miterlimit="10" stroke-width="10" d="M29,21v-16m0,16h22q10,0,4,8l-20,32q-6,8,-12,0l-20,-32q-6,-8,4,-8h22" pointer-events="stroke"/>
      </svg>`;
  },
  getSVG: function () {
    return this.ressvgs;
  }
});