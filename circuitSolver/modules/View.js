import { SelectionMenuPolicy } from './wdk_draw2d.js'

const connectionDefault = {
  type: "draw2d.Connection",
  router: "draw2d.layout.connection.InteractiveManhattanConnectionRouter",
  color: 'black',
  outlineColor: 'black',
  outlineStroke: 1,
  stroke: 3
}

export class View extends draw2d.Canvas {

  constructor(id, dropCB) {
    var canvasHolder = document.getElementById('canvasHolder');
    var wrapperComputedStyle = window.getComputedStyle(canvasHolder, null);
    var wrapperWidth = canvasHolder.clientWidth;
    wrapperWidth -=
      parseFloat(wrapperComputedStyle.paddingLeft) +
      parseFloat(wrapperComputedStyle.paddingRight)
    // console.log("height, width", canvasHolder.offsetHeight, wrapperWidth)
    super(id, wrapperWidth - 2, canvasHolder.offsetHeight - 2);
    // super(id, 2500, 2500);
    this.rCounter = 0;
    this.cCounter = 0;
    this.lCounter = 0;
    this.elements = [];
    this.dropCb = dropCB;
    // this.viewsetScrollArea("#canvas");
    // this.setScrollArea("#canvas");
  }


  /**
   * @method
   * Called if the user drop the droppedDomNode onto the canvas.<br>
   * <br>
   * Draw2D use the jQuery draggable/droppable lib. Please inspect
   * http://jqueryui.com/demos/droppable/ for further information.
   * 
   * @param {HTMLElement} droppedDomNode The dropped DOM element.
   * @param {Number} x the x coordinate of the drop
   * @param {Number} y the y coordinate of the drop
   * @param {Boolean} shiftKey true if the shift key has been pressed during this event
   * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
   * @private
   **/
  onDrop(droppedDomNode, x, y, shiftKey, ctrlKey) {
    var type = $(droppedDomNode).data("shape");
    this.addShapeToSchem(type, x, y);
  }

  addToSchematic(e) {
    var command = new draw2d.command.CommandAdd(this, e, this.x, this.y);
    this.getCommandStack().execute(command);
  }

  addShapeToSchem(type, x, y) {
    // console.log(type, x, y)

    var MyInputPortLocator = draw2d.layout.locator.PortLocator.extend({
      init: function (x, y) {
        this._super();
        this.x = x;
        this.y = y;
      },
      relocate: function (index, figure) {
        var parent = figure.getParent();
        var rotAngle = parent.getRotationAngle();

        if (rotAngle > 0) {
          // var newX = 
          figure.setPosition( this.y, this.x);
        } else {
          figure.setPosition( this.x, this.y);
        }
        // this.applyConsiderRotation(figure, this.x, this.y);
      }
    });


    // console.log(x, y)
    x = 16 * Math.round(x / 16);
    y = 16 * Math.round(y / 16);
    // console.log(x, y)
    if (type == "res") {
      var e = new shapeRes({ x: x, y: y });
      var inputLocator = new MyInputPortLocator(0, 16);
      var outputLocator = new MyInputPortLocator(48, 16);
      e.createPort("hybrid", inputLocator);
      e.createPort("hybrid", outputLocator);
      e.id = `R${this.rCounter}`;
      e.add(new draw2d.shape.basic.Text({ text: e.id, stroke: 0 }), new draw2d.layout.locator.TopLocator());
      this.rCounter = this.rCounter + 1;
      e.installEditPolicy(new SelectionMenuPolicy());
    } else if (type == "cap") {
      var e = new shapeCap({ x: x, y: y });
      var inputLocator = new MyInputPortLocator(16, 0);
      var outputLocator = new MyInputPortLocator(16, 48);
      e.createPort("hybrid", inputLocator);
      e.createPort("hybrid", outputLocator);
      e.id = `C${this.cCounter}`;
      e.add(new draw2d.shape.basic.Text({ text: e.id, stroke: 0 }), new draw2d.layout.locator.RightLocator());
      this.cCounter = this.cCounter + 1;
      e.installEditPolicy(new SelectionMenuPolicy());
    } else if (type == "ind") {
      var e = new shapeInductor({ x: x, y: y });
      var inputLocator = new MyInputPortLocator(-1, 16);
      var outputLocator = new MyInputPortLocator(65, 16);
      e.createPort("hybrid", inputLocator);
      e.createPort("hybrid", outputLocator);
      e.id = `L${this.lCounter}`;
      e.add(new draw2d.shape.basic.Text({ text: e.id, stroke: 0 }), new draw2d.layout.locator.TopLocator());
      this.lCounter = this.lCounter + 1;
      e.installEditPolicy(new SelectionMenuPolicy());
    } else if (type == "vin") {
      var e = new shapeVin({ x: x, y: y });
      var outputLocator = new MyInputPortLocator(16, 0);
      e.createPort("hybrid", outputLocator);
      e.id = `vin`;
    } else if (type == "gnd") {
      var e = new shapeGnd({ x: x, y: y });
      // var inputLocator  = new draw2d.layout.locator.InputPortLocator();
      var outputLocator = new MyInputPortLocator(16, 0);
      // e.createPort("hybrid",inputLocator);
      e.createPort("hybrid", outputLocator);
      e.id = `gnd`;
    } else if (type == "xvout") {
      var e = new shapeVout({ x: x, y: y });
      var inputLocator = new MyInputPortLocator(0, 16);
      e.createPort("hybrid", inputLocator);
      // e.createPort("hybrid",outputLocator);
      e.id = `xvout`;
    } else if (type == "op") {
      var e = new shapeOpamp({ x: x, y: y });
      var inputALocator = new MyInputPortLocator(0, 32);
      var inputBLocator = new MyInputPortLocator(0, 64);
      var outputLocator = new MyInputPortLocator(64, 48);
      e.createPort("hybrid", inputALocator);
      e.createPort("hybrid", inputBLocator);
      e.createPort("hybrid", outputLocator);
      e.id = `op${this.opCounter}`;
      this.opCounter = this.opCounter + 1;
      
    } else console.log('ERROR: You gave a bad type: ', type)

    this.x = x;
    this.y = y;
    e.resizeable = false;
    var add = this.dropCb(e, (a) => this.addToSchematic(a));
    // add = true;
    // console.log('add', add);

    // if (add) {
    //   e.resizeable = false;
    //   // e.keepAspectRatio = true;
    //   console.log(e);
    //   // e.width = 50;

    //   // var command = new draw2d.command.CommandAdd(this, e, x, y);
    //   // this.getCommandStack().execute(command);
    // }
  }



  loadSchematic(startupSchematic) {
    // var connections = []
    // startupSchematic.forEach(item => {
    //   if (item.type == "draw2d.Connection") {
    //     connections.push(item);
    //     //handle this later
    //   } else {
    //     var type;
    //     var firstLetter = Array.from(item.id)[0];
    //     if (firstLetter == 'R') type = "res"
    //     else if (firstLetter == 'C') type = "cap"
    //     else if (firstLetter == 'L') type = "ind"
    //     else if (firstLetter == 'g') type = "gnd"
    //     else if (item.id == 'vin') type = "vin"
    //     else if (item.id == 'vout') type = "vout"

    //     this.addShapeToSchem(type, item.x, item.y);
    //   }
    // });

    // connections.push({
    //   type: "draw2d.Connection",
    //   source: {node: 'C0', port: 'hybrid0'},
    //   target: {node: 'vout', port: 'hybrid0'},
    //   router: "draw2d.layout.connection.InteractiveManhattanConnectionRouter",
    //   color: 'black',
    //   outlineColor: 'black',
    //   outlineStroke: 1,
    //   stroke: 3
    // })

    this.clear();
    this.rCounter = 0;
    this.cCounter = 0;
    this.lCounter = 0;
    this.opCounter = 0;
    console.log('cleared, now adding this', startupSchematic);

    var connections = []
    var id=0;
    startupSchematic.forEach(item => {
      if (item.type == "connection") {
        var newConn = {...connectionDefault};
        newConn.source = item.source;
        newConn.target = item.target;
        // newConn.id = id;
        connections.push(newConn);
        id = id + 1;
      } else {
        var type;
        var firstLetter = item.firstLetter;
        if (firstLetter == 'R') type = "res"
        else if (firstLetter == 'C') type = "cap"
        else if (firstLetter == 'L') type = "ind"
        else if (firstLetter == 'g') type = "gnd"
        else if (firstLetter == 'v') type = "vin"
        else if (firstLetter == 'x') type = "xvout"
        // console.log(item, type)

        this.addShapeToSchem(type, item.x, item.y);
      }
    });

    // console.log(connections);
 
    var reader = new draw2d.io.json.Reader();
    reader.unmarshal(this, connections);

    // var writer = new draw2d.io.json.Writer();
    // writer.marshal(canvas, function(json){
    //   cb(json);
    // });
    // wr.marshal(vw, function (json) {
    //   console.log('some change', json)
    //   cb(json);
    // });

    // this.fireEvent('isPostChangeEvent');
    // this.fireEvent('onisPostChangeEvent');
    // this.fireEvent('onIsPostChangeEvent');
    // this.fireEvent('change');
    // this.fireEvent('Change');
    // this.fireEvent('onChange');
    // this.fireEvent("figure:add");
  }
};

