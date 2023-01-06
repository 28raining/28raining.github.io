import { state } from './main.js'
import { View } from './View.js'

export class init_draw2d {
  constructor(dropCb, handleCanvasChange) {
    var routerToUse = new draw2d.layout.connection.InteractiveManhattanConnectionRouter();
    // var app = new example.Application();
    // Draw2D setup
    this.writer = new draw2d.io.json.Writer();
    this.view    = new View("canvas", (a) => {dropCb(a)});

    // var reader = new draw2d.io.json.Reader();
    // reader.unmarshal(this.view, startupSchematic);
    this.view.loadSchematic();
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
 
  }

  addEvL (vw,wr,cb) {
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