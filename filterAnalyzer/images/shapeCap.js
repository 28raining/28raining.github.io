var shapeCap = draw2d.SVGFigure.extend({

  init : function(attr)
  {
      this._super(extend({width:32, height:48},attr));
      this.ressvgs = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke="#000" stroke-miterlimit="10" stroke-width="10" d="M33 33v-32" pointer-events="stroke"/>
        <path stroke-linecap="round" stroke="#000" stroke-miterlimit="10" stroke-width="12" d="M1,37h64m-64,20h64" pointer-events="stroke"/>
        <path stroke-linecap="round" stroke="#000" stroke-miterlimit="10" stroke-width="10" d="M33 97v-36" pointer-events="stroke"/>
      </svg>
      `;
  },
  getSVG: function(){
    return this.ressvgs;
  }
});
