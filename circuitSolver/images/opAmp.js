

var shapeOpamp = draw2d.SVGFigure.extend({

    init : function(attr)
    {
        this._super(extend({width:64, height:80},attr));
        this.ressvgs = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 139 170">
        <path stroke-linecap="round" stroke="#000" stroke-miterlimit="10" stroke-width="10" d="m34,16l80,80l-80,80z"/>
        <path stroke-linecap="round" stroke="#000" stroke-miterlimit="10" stroke-width="5" d="M58,76v-24m-12,12h24m-24,64h24"/>
        <path stroke-linecap="round" stroke="#000" stroke-miterlimit="10" stroke-width="10" d="M2,128h28m-28,-64h28m80,32h20"/>
      </svg>
        `;
    },
    getSVG: function(){
      return this.ressvgs;
    }
});