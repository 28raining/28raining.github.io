//I used this website to translate from absolute path to relative path. What a pain in the bum!
// https://lea.verou.me/2019/05/utility-convert-svg-path-to-all-relative-or-all-absolute-commands/

var shapeRes = draw2d.SVGFigure.extend({

    init : function(attr)
    {
        this._super(extend({width:48, height:32},attr));
        // this.ressvgs = '\
        // <svg xmlns="http://www.w3.org/2000/svg">\
        //   <path stroke="#000" stroke-miterlimit="10" stroke-linecap="round" stroke-width="10" d="M15 5 5 35M15 5l20 60M55 5l20 60M95 5l20 60M55 5 35 65M95 5 75 65m50-30-10 30"/>\
        // </svg>';
        this.ressvgs = '\
        <svg xmlns="http://www.w3.org/2000/svg">\
          <path stroke-linecap="round" stroke="#000" stroke-miterlimit="10" stroke-width="10" d="M9,0l-8,32m8,-32l16,64m16,-64l16,64m16,-64l16,64m-48,-64l-16,64m48,-64l-16,64m40,-32l-8,32"/>\
        </svg>';

        // this.ressvgs = '\
        // <svg xmlns="http://www.w3.org/2000/svg">\
        //   <path stroke-linecap="round" stroke="#000" stroke-miterlimit="10" stroke-width="10" d="M13 5 5 37m8-32 16 64M45 5l16 64M77 5l16 64M45 5 29 69M77 5 61 69m40-32-8 32"/>\
        // </svg>';
    },
    getSVG: function(){
      return this.ressvgs;
    }
});