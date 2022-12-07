import { state } from './main.js'

export class View extends draw2d.Canvas {
	
	constructor (id, dropCB)
    {
        var canvasHolder = document.getElementById('canvasHolder');
        var wrapperComputedStyle = window.getComputedStyle(canvasHolder, null);
        var wrapperWidth = canvasHolder.clientWidth;
        wrapperWidth -=
            parseFloat(wrapperComputedStyle.paddingLeft) +
            parseFloat(wrapperComputedStyle.paddingRight)
        console.log("height, width",canvasHolder.offsetHeight,wrapperWidth)
		super(id, wrapperWidth, canvasHolder.offsetHeight);
        this.rCounter = 0;
        this.cCounter = 0;
        this.lCounter = 0;
        this.elements = [];
        this.dropCb = dropCB;
		// this.setScrollArea("#"+id);
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
    onDrop (droppedDomNode, x, y, shiftKey, ctrlKey)
    {
        console.log("yolo")
        var type = $(droppedDomNode).data("shape");
        // console.log(this.rCounter);
        // var figure = eval("new "+type+"();");
        
        // figure.addEntity("id");
        // figure.setName("NewTable");
        
        // // create a command for the undo/redo support
        // var command = new draw2d.command.CommandAdd(this, figure, x, y);
        // this.getCommandStack().execute(command);

        if (type=="res") {
            var e = new shapeRes({x:x, y:y});
            var inputLocator  = new draw2d.layout.locator.InputPortLocator();
            var outputLocator = new draw2d.layout.locator.OutputPortLocator();
            e.createPort("hybrid",inputLocator);
            e.createPort("hybrid",outputLocator);
            e.id = `R${this.rCounter}`;
            this.rCounter = this.rCounter + 1;
        } else if (type=="cap") {
            var e = new shapeCap({x:x, y:y});
            var inputLocator  = new draw2d.layout.locator.InputPortLocator();
            var outputLocator = new draw2d.layout.locator.OutputPortLocator();
            e.createPort("hybrid",inputLocator);
            e.createPort("hybrid",outputLocator);
            e.id = `C${this.cCounter}`;
            this.cCounter = this.cCounter + 1;
        } else if (type=="vin") {
            var e = new shapeVin({x:x, y:y});
            var inputLocator  = new draw2d.layout.locator.InputPortLocator();
            var outputLocator = new draw2d.layout.locator.OutputPortLocator();
            // e.createPort("hybrid",inputLocator);
            e.createPort("hybrid",outputLocator);
            e.id = `vin`;
        } else if (type=="gnd") {
            var e = new shapeGnd({x:x, y:y});
            // var inputLocator  = new draw2d.layout.locator.InputPortLocator();
            var outputLocator = new draw2d.layout.locator.OutputPortLocator();
            // e.createPort("hybrid",inputLocator);
            e.createPort("hybrid",outputLocator);
            e.id = `gnd`;
        } else if (type=="vout") {
            var e = new shapeVout({x:x, y:y});
            var inputLocator  = new draw2d.layout.locator.InputPortLocator();
            e.createPort("hybrid",inputLocator);
            // e.createPort("hybrid",outputLocator);
            e.id = `vout`;
        }

        this.dropCb(e.id);

        // this.elements[e.id] = {};
        // this.elements[e.id]['value'] = 12;

        // app.view.add( e);

        // var figure = eval("new "+type+"();");
        
        // figure.addEntity("id");
        // figure.setName("NewTable");

        // e.resizeable = false;
        e.keepAspectRatio = true;
        // e.width = 50;

        var command = new draw2d.command.CommandAdd(this, e, x, y);
        this.getCommandStack().execute(command);


    }
};

