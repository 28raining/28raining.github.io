

var shapeVin = draw2d.SVGFigure.extend({

    init : function(attr)
    {
        this._super(extend({width:25, height:100},attr));
        this.ressvgs = '\
        <svg xmlns="http://www.w3.org/2000/svg">\
          <circle cx="65" cy="215" r="60" fill="#FFF" stroke="#000" stroke-width="10" pointer-events="all"/>\
          <path fill="none" stroke="#000" stroke-miterlimit="10" d="M65 225v-40m-20 20h40m-40 30h40" pointer-events="stroke"/>\
          <path fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="10" d="M65 435V275m0 160h50q10 0 2 6l-44 38q-8 6-16 0l-44-38q-8-6 2-6h50m0-280V5" pointer-events="stroke"/>\
        </svg>';
    },
    getSVG: function(){
      return this.ressvgs;
    }
});