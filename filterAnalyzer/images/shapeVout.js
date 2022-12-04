

var shapeVout = draw2d.SVGFigure.extend({

    init : function(attr)
    {
        this._super(extend({width:62, height:30},attr));
        this.ressvgs = '\
        <svg xmlns="http://www.w3.org/2000/svg">\
          <path fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="10" d="M5 45h100" pointer-events="stroke"/>\
          <circle cx="145" cy="45" r="40" fill="none" stroke="#000" stroke-width="10" pointer-events="all"/>\
        </svg>';
    },
    getSVG: function(){
      return this.ressvgs;
    }
});