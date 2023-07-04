var shapeIprobe = draw2d.SVGFigure.extend({
  init: function (attr) {
    this._super(extend({ width: 64, height: 32 }, attr));
    this.ressvgs = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 139 71">
          <path stroke-linecap="round" fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="10" d="M2,60h48m32,0h48m-80,-16v16m32,-16v16" pointer-events="stroke"/>
          <path stroke-linecap="round" fill="#FFF" stroke="#000" stroke-width="10" d="M26,0h80v44h-80z" pointer-events="all"/>
        </svg>
              `;
  },
  getSVG: function () {
    return this.ressvgs;
  },
});
