1 - Draw a static RC filter
2 - Show laplace equation
-- Draw the laplace in Latex
-- Add 3 nodes (currently only support 2 nodes)
-- Add op-amps with R feedback
-- Add user drawing capability
-- Verify laplace is working by testing with big LC filter
-- Fix the MathML renderere


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
- Add a hold button
- [x] Add x-y cursors
- Make graph background transparent
- [x] Prevent user adding multiple Vin or Vout
- [x] Stop it crashing when user drags multiple elements
#### Remaining
- [ ] Add color switcher in top bar
- [ ] Separate page into those nice boxes each with shadow
- [ ] Add comments section
- [ ] Make draggable things into images, not text boxes
- [ ] Add option to rotate components
- [ ] displaying frequency response
- [ ] Add an op-amp 



# Future ideas
- Site to store tiny pieces of data. So this site can have memory and be severless. And smith chart site
- A well documented, crowd sourced algebra library
- A replacement for draw2D without jQuery
