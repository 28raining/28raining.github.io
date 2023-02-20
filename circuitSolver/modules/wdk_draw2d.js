import { View } from './View.js'

export class init_draw2d {
  constructor(dropCb, handleCanvasChange, schematic) {
    var routerToUse = new draw2d.layout.connection.InteractiveManhattanConnectionRouter();
    // var app = new example.Application();
    // Draw2D setup
    this.writer = new draw2d.io.json.Writer();
    this.view = new View("canvas", (a, b) => { dropCb(a, b) });
    // this.view.setScrollArea("#canvas");

    // var reader = new draw2d.io.json.Reader();
    // reader.unmarshal(this.view, startupSchematic);
    this.view.loadSchematic(schematic);
    // this.handleCanvasChange = () => handleCanvasChange();
    //The first load needs to trigger the calculateTF function
    this.writer.marshal(this.view, function (json) {
      handleCanvasChange(json);
    });


    this.view.installEditPolicy(new draw2d.policy.connection.DragConnectionCreatePolicy({
      createConnection: function () {
        var connection = new draw2d.Connection({
          stroke: 3,
          outlineStroke: 1,
          outlineColor: "#303030",
          color: "91B93E",
          router: routerToUse
        });
        return connection;
      }
    }));

    this.view.installEditPolicy(new draw2d.policy.canvas.SnapToGridEditPolicy(16)); //each grid is a 16x16

    this.view.installEditPolicy(new draw2d.policy.canvas.SingleSelectionPolicy());
    // this.view.setScrollArea("#canvas");
    // this.view.setZoom(this.view.getZoom()*0.7,true);

  }

  reUpdateCanvas(canvasState, handleCanvasChange) {
    // startupSchematic = canvasState;
    this.view.loadSchematic(canvasState);
    this.writer.marshal(this.view, function (json) {
      handleCanvasChange(json);
    });
  }

  addEvL(vw, wr, cb) {
    // add an event listener to the Canvas for change notifications.
    vw.getCommandStack().addEventListener(function (e) {
      if (e.isPostChangeEvent()) {
        wr.marshal(vw, function (json) {
          // console.log('some change', json)
          cb(json);
        });
      }
    });
  }

}


export var SelectionMenuPolicy = draw2d.policy.figure.SelectionPolicy.extend({
  NAME: "SelectionMenuPolicy",

  init: function (attr, setter, getter) {
    this.overlay = null; // div DOM node

    this._super(attr, setter, getter);
  },

  /**
   * @method
   *
   * @template
   * @param {draw2d.Canvas} canvas the related canvas
   * @param {draw2d.Figure} figure the selected figure
   * @param {boolean} isPrimarySelection
   */
  onSelect: function (canvas, figure, isPrimarySelection) {
    // console.log('11111')
    this._super(canvas, figure, isPrimarySelection);

    if (this.overlay === null) {
      //rotate icon from bootstrap
      this.overlay = $(
        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
        </svg>`);
      $("#canvasHolder").append(this.overlay);
      this.overlay.on("click", function () {

        // use a Command and CommandStack for undo/redo support
        //
        // var command = new draw2d.command.CommandDelete(figure);
        // canvas.getCommandStack().execute(command);
        var w = figure.getWidth( );
        var h = figure.getHeight( );
        var a = (figure.getRotationAngle( )+270)%540;
        var id = figure.getId()
        // var letters = Array.from(id);
        var rot = ((a==0) ^ (id[0]=='C')) ? new draw2d.layout.locator.TopLocator() : new draw2d.layout.locator.RightLocator()
        // console.log(figure.getChildren())
        figure.resetChildren();

        figure.add(new draw2d.shape.basic.Text({text:id, stroke:0}), rot);
        console.log(a,h,w)
        figure.attr({angle:a, width: h, height: w});
      })
    }
    this.posOverlay(figure);
  },


  /**
   * @method
   *
   * @param {draw2d.Canvas} canvas the related canvas
   * @param {draw2d.Figure} figure the unselected figure
   */
  onUnselect: function (canvas, figure) {
    this._super(canvas, figure);

    this.overlay.remove();
    this.overlay = null;
  },


  onDrag: function (canvas, figure) {
    this._super(canvas, figure);
    this.posOverlay(figure);
  },

  posOverlay: function (figure) {
    this.overlay.css({
      "position": 'relative',
      "top": figure.getAbsoluteY() - 20,
      "left": figure.getAbsoluteX() + figure.getWidth() + 10
    });
  }
});
