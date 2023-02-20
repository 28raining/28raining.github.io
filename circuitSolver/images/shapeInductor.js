

var shapeInductor = draw2d.SVGFigure.extend({

    init : function(attr)
    {
        this._super(extend({width:64, height:16},attr));
        this.ressvgs = `
        <svg xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="10" d="M1,30h16m0,0l12,-23q4,-9,8,0l12,23m64,0h16m-80,0l12,-23q4,-9,8,0l12,23m0,0l12,-23q4,-9,8,0l12,23" pointer-events="stroke"/>
      </svg>
                    `;
    },
    getSVG: function(){
      return this.ressvgs;
    }
});