

var shapeRes = draw2d.SVGFigure.extend({

    init : function(attr)
    {
        this._super(extend({width:40, height:25},attr));
        this.ressvgs = '\
        <svg xmlns="http://www.w3.org/2000/svg">\
          <path stroke="#000" stroke-miterlimit="10" stroke-width="10" d="M15 5 5 35M15 5l20 60M55 5l20 60M95 5l20 60M55 5 35 65M95 5 75 65m50-30-10 30"/>\
        </svg>';
    },
    getSVG: function(){
      return this.ressvgs;
    }
});