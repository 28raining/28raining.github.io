

var shapeGnd = draw2d.SVGFigure.extend({

    init : function(attr)
    {
        this._super(extend({width:25, height:42},attr));
        this.ressvgs = '\
        <svg xmlns="http://www.w3.org/2000/svg">\
          <path fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="10" d="M65 155V5m0 150h50q10 0 2 6l-44 38q-8 6-16 0l-44-38q-8-6 2-6h50" pointer-events="stroke"/>\
        </svg>';
    },
    getSVG: function(){
      return this.ressvgs;
    }
});