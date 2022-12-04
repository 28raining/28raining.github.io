import { state } from './main.js'
import { View } from './View.js'

export class init_draw2d {
  constructor(dropCb) {
    var routerToUse = new draw2d.layout.connection.InteractiveManhattanConnectionRouter();
    // var app = new example.Application();
    // Draw2D setup
    this.writer = new draw2d.io.json.Writer();
    this.view    = new View("canvas", (a) => {dropCb(a)});
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
  }

  addEvL (vw,wr,cb) {
    // add an event listener to the Canvas for change notifications.
    vw.getCommandStack().addEventListener(function (e) {
      if (e.isPostChangeEvent()) {
        wr.marshal(vw, function (json) {
          console.log('some change')
          cb(json);
        });
      }
    });
  }

}