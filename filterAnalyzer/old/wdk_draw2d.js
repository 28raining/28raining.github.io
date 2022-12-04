// declare the namespace for this example
var example = {};

/**
 * 
 * The **GraphicalEditor** is responsible for layout and dialog handling.
 * 
 * @author Andreas Herz
 * @extends draw2d.ui.parts.GraphicalEditor
 */
example.Application = Class.extend(
{
    NAME : "example.Application", 

    /**
     * @constructor
     * 
     * @param {String} canvasId the id of the DOM element to use as paint container
     */
    init : function()
    {
	      this.view    = new example.View("canvas");
          this.toolbar = new example.Toolbar("toolbar",  this.view );
	}


});





example.View = draw2d.Canvas.extend({
	
	init:function(id)
    {
		this._super(id, 2000,2000);
		
		this.setScrollArea("#"+id);
	},

    
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
    onDrop : function(droppedDomNode, x, y, shiftKey, ctrlKey)
    {
        var type = $(droppedDomNode).data("shape");
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

        } else if (type=="cap") {
            var e = new shapeCap({x:x, y:y});
            var inputLocator  = new draw2d.layout.locator.InputPortLocator();
            var outputLocator = new draw2d.layout.locator.OutputPortLocator();
            e.createPort("hybrid",inputLocator);
            e.createPort("hybrid",outputLocator);
        } else if (type=="vin") {
            var e = new shapeVin({x:x, y:y});
            var inputLocator  = new draw2d.layout.locator.InputPortLocator();
            var outputLocator = new draw2d.layout.locator.OutputPortLocator();
            // e.createPort("hybrid",inputLocator);
            e.createPort("hybrid",outputLocator);
        } else if (type=="gnd") {
            var e = new shapeGnd({x:x, y:y});
            var inputLocator  = new draw2d.layout.locator.InputPortLocator();
            var outputLocator = new draw2d.layout.locator.OutputPortLocator();
            // e.createPort("hybrid",inputLocator);
            e.createPort("hybrid",outputLocator);
        }

        // app.view.add( e);

        // var figure = eval("new "+type+"();");
        
        // figure.addEntity("id");
        // figure.setName("NewTable");

        var command = new draw2d.command.CommandAdd(this, e, x, y);
        this.getCommandStack().execute(command);


    }
});

