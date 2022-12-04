var shapeCap = draw2d.SVGFigure.extend({

  init : function(attr)
  {
      this._super(extend({width:30, height:65},attr));
      this.ressvgs = '\
      <svg xmlns="http://www.w3.org/2000/svg">\
      <path fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="10" d="M76 145V5" pointer-events="stroke"/>\
      <path fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="12" d="M6 145h140M6 175h140" pointer-events="stroke"/>\
      <path fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="10" d="M76 325V175" pointer-events="stroke"/>\
      </svg>';
  },
  getSVG: function(){
    return this.ressvgs;
  }
});
