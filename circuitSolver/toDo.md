

-- Below is done later, after laplace derivation is more thoroughly verified... --
3 - Show bilinear transform equation
4 - Show state space representation
5 - Draw amplitude response of those 3 transforms


# Draw2D
- [x] Add a resistor shape to toolbar
- [x] Add capacitor shape to toolbar
- [x] allow drag + drop + connect
- [x] extract connection map?
- [x] remove all the other unuesd gubbins (port to main site)
- [x] Add vsource and gnd symbol
- [x] Add a checklist of items which need to be done before laplace is calculated
- [x] Build the MNA matrix
- [x] solve the matrix and display the answer
#### STOP - clean up the code! 
- [x] Switch to algebrite -> done - remove nerdamer
- [x] Put the code into js modules
- [x] Use Preact properly
- [x] Displaying latex nicely
- [x] Add capacitors
- [x] Clean up console logging
- [x] Element selector shows whats on schematic
- [x] Load a preset schematic
- [x] Launch the beta version on github
- [x] Fix R-C-R-C laplace result It works!
- [x] Fix R//C-R//C laplace result It works!
- [x] Fix component port location, and make drawings nicer...
- [x] Use Draw2D grid
- [x] Laplace use subscript in number
#### Plotly
- [x] add min-to-max frequency range
- [x] Update when user changes value or unit
- [x] Use units 
- [x] Add x-y cursors
- [x] Prevent user adding multiple Vin or Vout
- [x] Stop it crashing when user drags multiple elements
#### Remaining
- [x] Make draggable things into images, not text boxes
- [x] Add option to rotate components
- [x] displaying frequency response
- [x] Add an op-amp -> done a lot of this already
- [x] the element map has an array of port connections. That needs to go in a specific order, so later we know which op amp port is which
- [x] Move sanity checking into processCanvasState function, add all components fully connected?
- [x] processCanvasState() must also remove nodes that aren't connected to vout (it's already removing elements)
- [x] device can't connect to itself?
- [x] have a separate array just to hold op amps
- [x] Create object of elements, connect each end to a new node. Then delete elements who aren't fully connected, optimize the nodes, and remove nodes that don't have a path to vout
- [x] Every element to show in value selector
- [x] Reset graph when schematic is not good
- [x] Stop it crashing if algebrite can't solve it
- [x] Show graph on load
- [x] Undo and redo buttons
- [x] Separate page into those nice boxes each with shadow
- [x] Add comments section
- [x] On graph add x, y labels
 
# Kind of buggy - will look at in the future
- [ ] Zoom in and out

# Might do in the future
- [ ] Add a hold button
- [ ] Make graph background transparent
- [ ] Add color switcher in top bar



# Future ideas
- Site to store tiny pieces of data. So this site can have memory and be severless. And smith chart site
- A well documented, crowd sourced algebra library
- A replacement for draw2D without jQuery
-- fix rotation
-- be supported