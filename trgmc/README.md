# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Purpose of this tool
- add refinancing, re-casting, and many overpayments
- more modern & friendly interface
- Saves your calculations for next time (in URL and cookies)
- multi-language?



# Todo

## Important
-- Add a reset button
-- Add a share button
-- save it to cookie
-- Add footer with ym name and link to git
- tax should reduce if loan length decreases
- show new finish date after events
- double check maths against other sites
- get a domain, make the site live
-- google analytics


## Later
-- show standard loan types and autofill length
- hover over explains how th eboxes were calculated
- refinance has option to change loan length
- Show loan length and new monthly payment
- add markers showing when the events happen
- Add recurring overpayment
- add a start date
- get the rates from Zillow API
- make it work in french & other languages
- stop multiple events on sme day
- Add tax appreciation
- Download to Excel
- Refinance shouldn't be in a dropdown
- get tax rate via api https://services.maps.cdtfa.ca.gov
- autofill the address
- add option to chose a monhtly payment
- radio button: What can I afford; How much it costs
- Nice Latex document showing deriving the equations
- build run a strict linter
- put input in URL
- little padlock showing that value won't change?
- typing '.' at the end of homeVal adds a zero to the front?
- setting downpay cash to 15%, make homeValue big, make homeValue small



# Done
- Show breakdown of total repayments
-- fix total repayment when overpayment & refinance added
-- show amount saved by doing overpayment
-- overpayment shows remaining balance reduction

-- new monthly payment when re-cast is chosen
-- show “yearly”, “monthly”
-- move export fn to common file to enable fast refresh
-- add comments section
-- screen vertical too small
-- note that monthly includes all
-- refinance on same date crashes site
-- multiple overpayments on the same date
--- Put events into URL
- state to URL
-- add start date
-- property tax default %/year
- limit % to <100
- Crashes when put a letter into loan length. Or 0
- Fix rounding issue which means final payment != monthly payment
- percents should have 2 decimal points
-- Make sure all numbers are treated as strings
-- no console issues
- test everything
- re-fix all the input boxes
-- Property tax can't be bigger than monthly payment
- all inputs should be string, so middle character can be deleted without cursor moving
- when box contains just 0 and user types '5', display '5' not '05'
-- form validation (no -ve numbers)
-- why "56-" shows NaN
-- All loan maths should happen on first render, and after user input. Not on every render. This means previous results can be saved if invalid input is given
- when edit event then highlight the text temporarily
-- Put all the user changes into a reducer function. This will allow easier flash handling, and less prop drilling
- property tax with monthly input
-- hoa and insurance 
- separate tax, hoa and insurance. Use nice color separation
- RE-FORMAT
-- Finish mobile optimization
- Default show one month per year
- Let user chose monthly payment, or chose home value
-- When monthly payment changes, change all the other numbers
-- Highlight which box is the input, which is derived
- re-cast doesn't work
- Chart x-axis label
- Tax and fee user can chose unit
- Add house taxes hoa and insurance and other stuff
-- Fix percent dropdowns
- fix ability to delete % unit
---- hover color to be more potent
- chart font size
- Add remianing balance to the graph
---- Create table for inputs on one side
---- Create bar graph on the other side 
---- Bar chart goes to length of whole mortgage
---- Bart chart becomes stacked showing principal and interest
---- Allow user to add home value, down payment automatically changes, loan amount automatically changes. Make this into a block
---- add loan term and interest, make the graph change
---- Add stats at the bottom of the page
---- Add mortgate events 
------ over-pay
------ re-cast
------ refinance 
------ You can only re-cast if you do an overpayment first
- Add text explaining recast, over payments and refinance
---- sort the events chronologically
--- check it has all features of competing tools
