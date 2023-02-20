

var shapeVout = draw2d.SVGFigure.extend({

    init : function(attr)
    {
        this._super(extend({width:48, height:32},attr));
        this.ressvgs = `
        <svg xmlns="http://www.w3.org/2000/svg">
        <path fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="10" d="M0 33h32" pointer-events="stroke"/>
        <circle cx="64" cy="33" r="32" fill="none" stroke="#000" stroke-width="10" pointer-events="all"/>
      </svg>
              `;
    },
    getSVG: function(){
      return this.ressvgs;
    }
});