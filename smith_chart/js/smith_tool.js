//parameters
var resolution = 100;// 100; //number of points per arc
var span_resolution = 20;
var precision = 3;
var spanChanged = false;

//code to save the state to jsonBin - cool! (and free)
var toastElList = [].slice.call(document.querySelectorAll('.toast'))
var toastList = toastElList.map(function (toastEl) {
  return new bootstrap.Toast(toastEl)
})
var saveLocDom = document.getElementById('jsonBinSaveLoc')
function saveToJsonBin() {
  var req = new XMLHttpRequest();
  req.onreadystatechange = () => {
    if (req.readyState == XMLHttpRequest.DONE) {
      const objBin = JSON.parse(req.responseText);
      console.log(req.responseText, objBin);
      saveLocDom.innerHTML = (`https://www.will-kelsey.com/smith_chart?jsonBin=${objBin.metadata.id}`)
      saveLocDom.setAttribute('href', `https://www.will-kelsey.com/smith_chart?jsonBin=${objBin.metadata.id}`);
      toastList[0].show()
    }
  };
  req.open("POST", "https://api.jsonbin.io/v3/b", true);
  req.setRequestHeader("Content-Type", "application/json");
  req.setRequestHeader("X-Access-Key", "$2b$10$g4l2/VPaJA6ycDnnpbJYHuv6IHi.zrVwO/xLOiiYByrJ9Vcecqhqq");
  req.send(JSON.stringify(schematic));
}
function readFromJsonBin(id) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = () => {
    if (req.readyState == XMLHttpRequest.DONE) {
      const objBin = JSON.parse(req.responseText);
      console.log(req.responseText, objBin);
      schematic = objBin.record;
      updateFromOldState();
    }
  };
  req.open("GET", `https://api.jsonbin.io/v3/b/${id}/latest`, true);
  req.setRequestHeader("X-Access-Key", "$2b$10$g4l2/VPaJA6ycDnnpbJYHuv6IHi.zrVwO/xLOiiYByrJ9Vcecqhqq");
  req.send();
}


// document.getElementById('file').addEventListener('change', readFile, false);
//get dom elements
var vmin_distanceEl = document.getElementById('vmin_distance');
var vmax_distanceEl = document.getElementById('vmax_distance');

function expo(x, f) {
  return Number.parseFloat(x).toExponential(f);
}

function toggle_color_scheme() {
  var element = document.getElementById("mainSection");
  var x = document.getElementsByClassName("bg-white");
  if (x.length > 0) {
    element.classList.remove("bg-white");
    element.classList.add("bg-green");
    // document.getElementsByTagName('section')[0].style["background-color"] = "rgb(184, 255, 241)";  
    // document.getElementsByTagName('section')[0].style.color = "rgb(37, 50, 64)";
    document.getElementById('hollowed_circle').style["boxShadow"] = "0px 0px 0px 2000px rgb(184, 255, 241)";
  } else {
    element.classList.add("bg-white");
    element.classList.remove("bg-green");
    // document.getElementsByTagName('section')[0].style["background-color"] = "white";
    // document.getElementsByTagName('section')[0].style.color = "black";
    document.getElementById('hollowed_circle').style["boxShadow"] = "0px 0px 0px 2000px white";
  }

  if (color_of_smith_curves == 'bland') {
    color_of_smith_curves = 'colorful';
  } else {
    color_of_smith_curves = 'bland';
  }

  update_smith_chart();
}

var show_labels_DP = true;
var show_labels_adm = true;
var show_labels_res = true;
var show_circles_adm = true;
var show_circles_res = true;

function toggle_zoom_en() {
  var element = document.getElementById("smithChartOverlay");
  element.classList.toggle("noPointerClass");
}

function toggle_labels_DP() {
  show_labels_DP = !show_labels_DP;
  update_smith_chart();
}

function toggle_labels_imag() {
  show_labels_adm = !show_labels_adm;
  update_smith_chart();
}

function toggle_labels_real() {
  show_labels_res = !show_labels_res;
  update_smith_chart();
}

function toggle_circles_adm() {
  show_circles_adm = !show_circles_adm;
  update_smith_chart();
}

function toggle_circles_res() {
  show_circles_res = !show_circles_res;
  update_smith_chart();
}

function addCustomMarker() {
  var real = document.getElementById('customMarkerRe').value;
  var imaginary = document.getElementById('customMarkerIm').value;
  if (real) {
    real = Number(real);
  } else real = 0;

  if (imaginary) {
    imaginary = Number(imaginary);
  } else imaginary = 0;

  customMarkers.push({ re: real, im: imaginary });

  update_smith_chart();

}

function delCustomMarker(i) {
  customMarkers.splice(i, 1);
  update_smith_chart();
}

//Draw a couple of tables in the HTML page
//#1 - Custom impedances that the user has added
//#2 - Impedance at each Data Point (DP)
function drawMakerTable() {
  var table = document.getElementById("customMarkerTable");
  var inner = "<table class='table table-striped table-sm'><tr><th>Real</th><th>Imaginary</th><th>Name</th><th></th></tr>"
  inner += "<tr><td><input type='text' id='customMarkerRe' style='width:75px'></td><td><input type='text' id='customMarkerIm' style='width:75px'></td><td></td><td><button onclick=addCustomMarker()>add</button></td></tr>"
  var i = 0;
  for (i = 0; i < customMarkers.length; i++) {
    inner += "<tr><td>" + customMarkers[i].re + "</td><td>" + customMarkers[i].im + "</td><td>MP" + i + "</td><td><button onClick='delCustomMarker(" + i + ")')>Remove</button></td></tr>"
  }
  table.innerHTML = inner + "</table>";


  //#2nd table
  table = document.getElementById("DPImpedance");
  inner = "<table class='table table-striped'><tr><th>Data Point (DP)</th><th>Real</th><th>Imaginary</th></tr>"
  for (i = 0; i < dataPoints.length; i++) {
    inner += "<tr><td>" + (i + 1) + "</td><td>" + dataPoints[i].re + "</td><td>" + dataPoints[i].im + "</td></tr>"
  }
  table.innerHTML = inner + "</table>";
}

function freqUnitToText(multiplier) {
  if (multiplier == 1) return 'Hz';
  else if (multiplier == 1e3) return 'KHz';
  else if (multiplier == 1e6) return 'MHz';
  else if (multiplier == 1e9) return 'GHz';
  else if (multiplier == 1e12) return 'THz';
  else return 'Hz'
}

fileDom = document.getElementById('file');
domFreq = document.getElementById('freq');
domFreqSel = document.getElementById('freq_sel');
domSpanSel = document.getElementById('span_sel');
domSpan = document.getElementById('span');
domZo = document.getElementById('zo');
domEr = document.getElementById('er');

function readFile() {
  var files = fileDom.files;
  var file = files[0];
  var reader = new FileReader();
  var i;
  reader.onload = function (event) {

    schematic = JSON.parse(event.target.result);
    console.log("READING", schematic);
    updateFromOldState()
  }
  reader.readAsText(file);
}

function updateFromOldState() {
  //check for old version of file
  for (i = 1; i < schematic.length; i++) {
    if (!(Array.isArray(schematic[i].abs))) {
      schematic[i].abs = [schematic[i].abs];
    }
    if ('abs_bb_i' in schematic[i]) schematic[i].abs.push(schematic[i].abs_bb_i);
    if (!(Array.isArray(schematic[i].unit))) {
      schematic[i].unit = [schematic[i].unit];
    }
  }

  //update freq units
  var opts = domFreqSel.options;
  for (var opt, j = 0; opt = opts[j]; j++) {
    if (opt.value == freqUnitToText(schematic[0].freq_unit.multiplier)) {
      domFreqSel.selectedIndex = j;
      break;
    }
  }
  opts = domSpanSel.options;
  for (opt, j = 0; opt = opts[j]; j++) {
    if (opt.value == freqUnitToText(schematic[0].span_unit.multiplier)) {
      domSpanSel.selectedIndex = j;
      break;
    }
  }

  domFreq.value = Number(schematic[0].freq);
  domSpan.value = Number(schematic[0].span);
  domEr.value = Number(schematic[0].er);
  zo = Number(schematic[0].zo);
  domZo.value = zo;
  updateFromDom();
}


function updateFromDom() {
  schematic[0].freq = Number(domFreq.value);
  spanChanged = !(schematic[0].span == Number(domSpan.value))
  schematic[0].span = Number(domSpan.value)
  zo = Number(domZo.value);
  schematic[0].zo = Number(domZo.value);
  schematic[0].er = Number(domEr.value);

  //dropdowns
  if (domFreqSel.value == 'Hz') schematic[0]['freq_unit'].multiplier = 1;
  else if (domFreqSel.value == 'KHz') schematic[0]['freq_unit'].multiplier = 1e3;
  else if (domFreqSel.value == 'MHz') schematic[0]['freq_unit'].multiplier = 1e6;
  else if (domFreqSel.value == 'GHz') schematic[0]['freq_unit'].multiplier = 1e9;
  else if (domFreqSel.value == 'THz') schematic[0]['freq_unit'].multiplier = 1e12;

  if (domSpanSel.value == 'Hz') schematic[0]['span_unit'].multiplier = 1;
  else if (domSpanSel.value == 'KHz') schematic[0]['span_unit'].multiplier = 1e3;
  else if (domSpanSel.value == 'MHz') schematic[0]['span_unit'].multiplier = 1e6;
  else if (domSpanSel.value == 'GHz') schematic[0]['span_unit'].multiplier = 1e9;
  else if (domSpanSel.value == 'THz') schematic[0]['span_unit'].multiplier = 1e12;

  update_smith_chart()
}

function updatespan(sch_num, obj, unitIndex = 0) {
  // if ((this_val[this_val.length-2]+this_val[this_val.length-1])=='Hz') {
  // 	if      (this_val == 'Hz') freq_multiplier = 1;
  // 	else if (this_val == 'KHz') freq_multiplier = 1e3;
  // 	else if (this_val == 'MHz') freq_multiplier = 1e6;
  // 	else if (this_val == 'GHz') freq_multiplier = 1e9;
  // 	else if (this_val == 'THz') freq_multiplier = 1e12;		
  //   schematic[0][element].unit=this_val;
  //   schematic[0][element].multiplier=freq_multiplier;
  // } else {
  // var sch_num = this_id.split('_')[1];
  schematic[sch_num].unit[unitIndex] = obj.value;
  // is_active[sch_num]="active";
  // }
  // document.getElementById(this_id).children[0].innerText=this_val;	
  update_smith_chart()
  // is_active=[];
}

var schematic = [];
var dataPoints = [];
var vswr = 0.0;
var constQ = 0.0;
var zo = 50;
var fontsize = 12;
var color_of_smith_curves = "colorful";

//Add custom markers from the user, to help matching to exact impedances
var customMarkers = [];

schematic.push({ type: 'raw', zo: 50, freq: 2440, er: 1, freq_unit: { multiplier: 1e6 }, span: 0.0, span_unit: { multiplier: 1e6 } });
schematic.push({ type: 'bb', real: 1, imaginary: 0, abs: [50, 0], unit: 'null', tol: 0 });

function one_over_complex(real, imaginary) {
  var realn = real / (real * real + imaginary * imaginary);
  var imaginaryn = -imaginary / (real * real + imaginary * imaginary);
  return [realn, imaginaryn];
}

function clicked_cell(type) {
  if (type == "pr") {
    schematic.push({ type: 'pr', real: 0, imaginary: 0, abs: [50], unit: ['Ω'], tol: 0 });
  } else if (type == "sr") {
    schematic.push({ type: 'sr', real: 0, imaginary: 0, abs: [50], unit: ['Ω'], tol: 0 });
  } else if (type == "si") {
    schematic.push({ type: 'si', real: 0, imaginary: 0, abs: [1], unit: ['nH'], tol: 0 });
  } else if (type == "pi") {
    schematic.push({ type: 'pi', real: 0, imaginary: 0, abs: [1], unit: ['nH'], tol: 0 });
  } else if (type == "sc") {
    schematic.push({ type: 'sc', real: 0, imaginary: 0, abs: [1], unit: ['pF'], tol: 0 });
  } else if (type == "pc") {
    schematic.push({ type: 'pc', real: 0, imaginary: 0, abs: [1], unit: ['pF'], tol: 0 });
  } else if (type == "tl") {
    schematic.push({ type: 'tl', line_length: 1e-3, abs: [1], line_zo: 50, unit: ['mm'], real: 0, imaginary: 0, tol: 0 });
  } else if (type == "ss") {
    schematic.push({ type: 'ss', line_length: 1e-3, abs: [1], line_zo: 50, unit: ['mm'], real: 0, imaginary: 0, tol: 0 });
  } else if (type == "so") {
    schematic.push({ type: 'so', line_length: 1e-3, abs: [1], line_zo: 50, unit: ['mm'], real: 0, imaginary: 0, tol: 0 });
  } else if (type == "rc") {
    schematic.push({ type: 'rc', real: 0, imaginary: 0, abs: [50, 1], unit: ['Ω', 'pF'], tol: 0 });
  } else if (type == "rl") {
    schematic.push({ type: 'rl', real: 0, imaginary: 0, abs: [50, 1], unit: ['Ω', 'nH'], tol: 0 });
  } else if (type == "rlc") {
    schematic.push({ type: 'rlc', real: 0, imaginary: 0, abs: [50, 1, 1], unit: ['Ω', 'nH', 'pF'], tol: 0 });
  } else if (type == "customZ") {
    schematic.push({ type: 'customZ', real: 0, imaginary: 0, abs: [50, 1, 1], unit: ['Ω', 'nH', 'pF'], lut: [[2440e6, 50, 50]], interp: "linear", raw: "2440e6,50,50", tol: 0 });
  }
  update_smith_chart();
}

function update_schem_abs(target_num, obj, absCounter) {
  var complex = obj.name;
  // console.log('dbg0',target_num, obj.value, complex)
  switch (schematic[target_num].type) {
    // case ("bb") :
    //   // console.log('dbg1',target_num, obj.value, complex)
    // 	if (complex=="abs") schematic[target_num].abs[absCounter] = Number(obj.value);
    //   // else schematic[target_num].abs_bb_i = Number(obj.value);
    // 	break;
    case ("tl"):
    case ("ss"):
    case ("so"):
      if (complex == "abs") schematic[target_num].abs[absCounter] = Number(obj.value);
      else if (complex == "line_zo") schematic[target_num].line_zo = Number(obj.value);
      break;
    case ("rc"):
    case ("rl"):
    case ("rlc"):
    case ("bb"):
    case ("sr"):
    case ("pr"):
    case ("pc"):
    case ("sc"):
    case ("pi"):
    case ("si"):
      schematic[target_num].abs[absCounter] = Number(obj.value)
      break;
  }
  update_smith_chart();
}

function pad(n) {
  return n < 10 ? '0' + n : n
}

function unitTextToNum(unit, freq_here) {
  if (unit[0] == 'f') return 1e-15;
  else if (unit[0] == 'p') return 1e-12;
  else if (unit[0] == 'n') return 1e-9;
  else if (unit[0] == 'u') return 1e-6;
  else if (unit == 'm') return 1;       //tl can have unit of meters
  else if (unit[0] == 'm') return 1e-3;	  //milli...
  else if (unit[0] == 'K') return 1e3;
  else if (unit[0] == 'M') return 1e6;
  else if (unit[0] == 'λ') return (3e8 / (freq_here * Math.sqrt(schematic[0].er)));
  else return 1;
}

function update_schem_component(freq_here, save_impedance, sch_index) {
  var re_here = 0;
  var im_here = 0;
  var ln_here = 0;
  var scaler = [];
  var i = 0;
  for (i = 0; i < schematic[sch_index].unit.length; i++) {
    scaler[i] = unitTextToNum(schematic[sch_index].unit[i], freq_here);
  }

  switch (schematic[sch_index].type) {
    case ("bb"):
      re_here = (schematic[sch_index].abs[0] / zo);
      im_here = (schematic[sch_index].abs[1] / zo);
      break;
    case ("sr"):
    case ("pr"):
      re_here = (schematic[sch_index].abs[0] * scaler[0] / zo);
      break;
    case ("pc"):
    case ("sc"):
      im_here = -(1 / (schematic[sch_index].abs[0] * scaler[0] * 2 * Math.PI * freq_here * zo));
      break;
    case ("pi"):
    case ("si"):
      im_here = (schematic[sch_index].abs[0] * scaler[0] * 2 * Math.PI * freq_here / zo);
      break;
    case ("rlc"):
      re_here = schematic[sch_index].abs[0] * scaler[0] / zo;
      im_here = ((schematic[sch_index].abs[1] * scaler[1] * 2 * Math.PI * freq_here) - (1 / (schematic[sch_index].abs[2] * scaler[2] * 2 * Math.PI * freq_here))) / zo;
      break;
    case ("rl"):
      re_here = schematic[sch_index].abs[0] * scaler[0] / zo;
      im_here = ((schematic[sch_index].abs[1] * scaler[1] * 2 * Math.PI * freq_here)) / zo;
      break;
    case ("rc"):
      re_here = schematic[sch_index].abs[0] * scaler[0] / zo;
      im_here = - (1 / (schematic[sch_index].abs[1] * scaler[1] * 2 * Math.PI * freq_here)) / zo;
      break;
    case ("tl"):
    case ("ss"):
    case ("so"):
      ln_here = schematic[sch_index].abs[0] * scaler[0];
      break;
    case ("customZ"):
      const searchFn = (element) => element[0] > freq_here;  //finds the index which is greater that freq_here
      var indexRes = schematic[sch_index].lut.findIndex(searchFn);
      var lutLen = schematic[sch_index].lut.length;
      if (indexRes == -1) { //frequency is greater than largest value in lut
        // console.log('bpa', schematic[sch_index].lut, schematic[sch_index].lut.length - 1 )
        re_here = schematic[sch_index].lut[lutLen - 1][1];
        im_here = schematic[sch_index].lut[lutLen - 1][2];
      } else if (indexRes == 0) {
        re_here = schematic[sch_index].lut[0][1];
        im_here = schematic[sch_index].lut[0][2];
      } else {
        var f1 = schematic[sch_index].lut[indexRes - 1][0];
        var f2 = schematic[sch_index].lut[indexRes][0];
        var frac = (freq_here - f1) / (f2 - f1);
        if (schematic[sch_index].interp == "sah") frac = 0;
        re_here = schematic[sch_index].lut[indexRes - 1][1] + frac * (schematic[sch_index].lut[indexRes][1] - schematic[sch_index].lut[indexRes - 1][1]);
        im_here = schematic[sch_index].lut[indexRes - 1][2] + frac * (schematic[sch_index].lut[indexRes][2] - schematic[sch_index].lut[indexRes - 1][2]);
      }
      //ToDo - use LUT to find impedance at this frequency
      re_here = re_here / zo;
      im_here = im_here / zo;
      break;
  }

  if (save_impedance) {
    if ((Math.abs(re_here) < 0.1) && (re_here != 0)) schematic[sch_index].real = expo(re_here, 2);
    else schematic[sch_index].real = Number(re_here).toPrecision(precision);

    if ((Math.abs(im_here) < 0.1) && (im_here != 0)) schematic[sch_index].imaginary = expo(im_here, 2);
    else schematic[sch_index].imaginary = Number(im_here).toPrecision(precision);

    schematic[sch_index].line_length = ln_here;
  }

  return [re_here, im_here, ln_here]
  //}
  //}
  //schematic[i].imaginary = schematic[i].imaginary.toFixed(2);
  //schematic[i].real = schematic[i].imaginary.real(2);
  //update_smith_chart();
}

function impedanceToReflectionCoefficient(real_old, imag_old, zo) {
  //Calculate the reflection coefficient -current_admittance (zo-zimp) / (zo+zimp)
  var bot_real, bot_imag;
  temp_array = one_over_complex(real_old * zo + zo, imag_old * zo);
  bot_real = temp_array[0];
  bot_imag = temp_array[1];
  var reflectio_coeff_real = ((real_old * zo - zo) * bot_real) - ((imag_old * zo) * bot_imag);
  var reflectio_coeff_imag = ((imag_old * zo) * bot_real) + ((real_old * zo - zo) * bot_imag);
  var reflection_mag = Math.sqrt((reflectio_coeff_real * reflectio_coeff_real) + (reflectio_coeff_imag * reflectio_coeff_imag));
  if (reflectio_coeff_real == 0) var reflection_phase = 0;
  else var reflection_phase = 360 * Math.atan(reflectio_coeff_imag / reflectio_coeff_real) / (2 * Math.PI);
  if (reflectio_coeff_real < 0) reflection_phase += 180;
  if (reflection_phase < 0) reflection_phase = 360 + reflection_phase;
  return [reflectio_coeff_real, reflectio_coeff_imag, reflection_mag, reflection_phase];
}

//TODO - A big improvement here would be to separate out the impedance calculation and arc drawing. It should calculate impedances, then calculate points along the arc
function update_smith_chart() {
  //Update the layout variable
  layout.shapes = configure_layout_shapes();
  //Calculate and verify freqeuencies...
  freq = schematic[0].freq * schematic[0].freq_unit.multiplier;
  span_freq = schematic[0].span * schematic[0].span_unit.multiplier;
  //console.log(schematic[0].freq * schematic[0].freq_unit.multiplier,schematic[0].span * schematic[0].span_unit.multiplier)
  if ((freq < span_freq) && spanChanged) {
    swal({
      type: 'error',
      title: 'Oops...',
      text: 'Span is larger than frequency, this will result in -ve frequencies and likely you did not mean this',
      footer: 'Reduce your span frequency'
    })
  }

  //Save first point, which must come from a black box
  console.log(schematic);
  var trace = [];
  var layout_shapes = [];
  var textbox_trace = [];
  var span_impedance_re = [];
  var span_impedance_im = [];
  var end_x_coord = 0;
  var end_y_coord = 0
  if (span_freq == 0) {
    span_res = 0
  } else {
    span_res = span_resolution;
  }


  var real_old = 0.0;
  var imag_old = 0.0;
  var x;
  var y;
  var x0, x1, y0, y1;

  //update black box
  update_schem_component(0, true, 1);
  var schemEl = document.getElementById("schematic");
  schemEl.innerHTML = "";
  var newDiv = draw_schematic(1);
  schemEl.appendChild(newDiv);


  //Create an array of all different arcs to draw. There will be 1 + 2 ^ (number of tolerances) arcs (every max and min combination, plus the ideal case)
  var originalSchematic = JSON.parse(JSON.stringify(schematic));
  var tolElements = []; //always 1 arc
  var numTolElements = 0;
  var i, j, x;
  for (i = 1; i < schematic.length; i++) if (schematic[i].tol > 0) numTolElements++;
  var arrLen = Math.pow(2, numTolElements);
  var tolJumper = 2;
  for (i = 1; i < schematic.length; i++) {
    tolElements[i] = Array(arrLen);
    tolElements[i].fill(1);
    if (schematic[i].tol > 0) {
      tolElements[i] = Array(arrLen);
      tolElements[i].fill(1);
      for (x = 0; x < tolJumper / 2; x++) {
        for (j = x; j < arrLen; j += tolJumper) {
          tolElements[i][j] = 1 + schematic[i].tol / 100;
        }
      }
      for (x = 0; x < tolJumper / 2; x++) {
        for (j = x + tolJumper / 2; j < arrLen; j += tolJumper) {
          tolElements[i][j] = 1 - schematic[i].tol / 100;
        }
      }
      tolJumper = tolJumper * 2;
    }
    if (arrLen > 1) tolElements[i].push(1); //this setting uses ideal components
  }
  // console.log(tolElements);


  var idealArc = false;
  for (xx = 0; xx < tolElements[1].length; xx++) {
    if (xx == (tolElements[1].length - 1)) idealArc = true;
    if (idealArc) var arcColor = 'rgb(0, 0, 0)';
    else var arcColor = 'rgb(100, 100, 100)';

    //for each 'corner' set every component to min, max or ideal
    for (i = 1; i < schematic.length; i++) {
      for (j = 0; j < schematic[i].abs.length; j++) {
        // console.log("overwrite vals",tolElements[i][xx],originalSchematic[i].abs[j]);
        schematic[i].abs[j] = tolElements[i][xx] * originalSchematic[i].abs[j];
      }
    }

    dataPoints = [];
    update_schem_component(0, true, 1);
    for (i = 0; i <= span_res * 2; i++) {
      span_impedance_re[i] = Number(schematic[1].real);
      span_impedance_im[i] = Number(schematic[1].imaginary);
    }
    for (i = 2; i < schematic.length; i++) {
      //If tol is defined, loop this 3 times with min, typ and max value
      // Create some values to be fed into update_schem_component

      for (sp = 0; sp <= 2 * span_res; sp++) {
        if ((!idealArc) || (span_freq == 0)) sp = span_res; //if trying different tolerances, don't compute all the spans 
        //frequency at this point in the frequency span
        if (span_res == 0) frequency_at_sp = freq;
        else frequency_at_sp = freq + (span_freq * (sp - span_res) / span_res)

        //calcuate re and im values of component at this frequency
        //if sp offset is at the original frequency, calculate a lot more points
        if (sp == span_res) {
          num_points = resolution;
          var temp_array = update_schem_component(frequency_at_sp, true, i)
        } else {
          num_points = 1;
          var temp_array = update_schem_component(frequency_at_sp, false, i)
        }
        var re = Number(temp_array[0]);
        var im = Number(temp_array[1]);
        var ln_length = Number(temp_array[2]);

        var temp_trace = {}
        var x_points, y_points;
        var start = [];
        var start_impedance = [];

        if ((schematic[i].type == 'ss') || (schematic[i].type == 'so')) {
          //if the stub is longer than 0.5 waves then there is a full circle. Trim to 1 wave so user can see if there are multiple loops
          var wave_length = 3e8 / (frequency_at_sp * Math.sqrt(schematic[0].er));
          //if (ln_length>wave_length) ln_length = wave_length + ln_length % wave_length;   
          //for "ss" matching, can't assume that we start at 0 length
          if (ln_length < (0.5 * wave_length)) var start_at_qtr_wl = wave_length / 4;
          else start_at_qtr_wl = 0;
          start_impedance[0] = span_impedance_re[sp];
          start_impedance[1] = span_impedance_im[sp];
          start = one_over_complex(span_impedance_re[sp], span_impedance_im[sp]);
          var temp_array = arc_smith_points(start[0], start[1], ln_length, schematic[i].line_zo, schematic[i].type, true, 2 * Math.PI * frequency_at_sp * Math.sqrt(schematic[0].er) / 3e8, start_at_qtr_wl);
          var schem_inv = one_over_complex(temp_array[4], temp_array[5]);
          span_impedance_re[sp] = schem_inv[0];
          span_impedance_im[sp] = schem_inv[1];

        } else if ((schematic[i].type[0] == 'p') || (schematic[i].type == 'rlc') || (schematic[i].type == 'rc') || (schematic[i].type == 'rl')) {
          //For parallel elements plotted on rotated graph....
          start_impedance[0] = span_impedance_re[sp];
          start_impedance[1] = span_impedance_im[sp];
          start = one_over_complex(span_impedance_re[sp], span_impedance_im[sp]);
          var schem_inv = one_over_complex(re, im);
          var temp_array = arc_smith_points(start[0], start[1], start[0] + schem_inv[0], start[1] + schem_inv[1], schematic[i].type, true);
          var schem_inv = one_over_complex(start[0] + schem_inv[0], start[1] + schem_inv[1]);
          span_impedance_re[sp] = schem_inv[0];
          span_impedance_im[sp] = schem_inv[1];
        } else if ((schematic[i].type[0] == 's') || (schematic[i].type[0] == 'b') || (schematic[i].type == 'customZ')) {
          //For series elements plotted on normal curves....
          start_impedance[0] = span_impedance_re[sp];
          start_impedance[1] = span_impedance_im[sp];
          var temp_array = arc_smith_points(span_impedance_re[sp], span_impedance_im[sp], re + span_impedance_re[sp], im + span_impedance_im[sp], "impedance", false);
          span_impedance_re[sp] = span_impedance_re[sp] + re;
          span_impedance_im[sp] = span_impedance_im[sp] + im;
        } else if (schematic[i].type == 'tl') {
          //For transmission lines...
          start_impedance[0] = span_impedance_re[sp];
          start_impedance[1] = span_impedance_im[sp];
          var temp_array = arc_smith_points(span_impedance_re[sp], span_impedance_im[sp], ln_length, schematic[i].line_zo, "transmission_line", false, 2 * Math.PI * frequency_at_sp * Math.sqrt(schematic[0].er) / 3e8);
          span_impedance_re[sp] = temp_array[4];
          span_impedance_im[sp] = temp_array[5];
        }

        //If at original frequency, save and plot the data points
        if (sp == span_res) {
          x_points = temp_array[0];
          y_points = temp_array[1];
          end_x_coord = temp_array[2];
          end_y_coord = temp_array[3];
          real_old = span_impedance_re[sp];
          imag_old = span_impedance_im[sp];
          var start_x_coord = temp_array[6];
          var start_y_coord = temp_array[7];
          temp_trace = {
            x: x_points,
            y: y_points,
            line: {
              color: arcColor,
              width: 4
            },
            mode: 'lines',
            type: 'scatter'
          };
          trace.push(temp_trace);

          //add a data point rectangle to the smith chart
          dataPoints.push({ 're': (zo * Number(start_impedance[0])).toPrecision(3), 'im': (zo * Number(start_impedance[1])).toPrecision(3) });
          if (show_labels_DP) {
            layout_shapes.push({ type: "circle", fillcolor: arcColor, line: { color: arcColor }, x0: Number(start_x_coord) - 0.01, y0: Number(start_y_coord) - 0.01, x1: Number(start_x_coord) + 0.01, y1: Number(start_y_coord) + 0.01 });
            if (idealArc) textbox_trace.push({ x: [Number(start_x_coord) + 0.04], y: [Number(start_y_coord) - 0.03], text: ["DP" + (i - 1)], mode: 'text' });
          }
        }
        if ((!idealArc) || (span_freq == 0)) break; //if trying different tolerances, don't compute all the spans 
      }


    }

    //If only the black box exists...
    if (schematic.length == 2) {
      temp_array = []
      temp_array = find_smith_coord(schematic[1].real, schematic[1].imaginary, false);
      real_old = schematic[1].real;
      imag_old = schematic[1].imaginary;
      end_x_coord = temp_array[0];
      end_y_coord = temp_array[1];
    }

    //Create rectangles indicating end data points
    if (show_labels_DP) {
      layout_shapes.push({ type: "circle", fillcolor: arcColor, line: { color: arcColor }, x0: Number(end_x_coord) - 0.01, y0: Number(end_y_coord) - 0.01, x1: Number(end_x_coord) + 0.01, y1: Number(end_y_coord) + 0.01 });
      if (idealArc) textbox_trace.push({ x: [Number(end_x_coord) + 0.04], y: [Number(end_y_coord) - 0.03], text: ["DP" + (i - 1)], mode: 'text' });
    }
  }

  //draw the components
  for (i = 2; i < schematic.length; i++) {
    newDiv = draw_schematic(i);
    schemEl.appendChild(newDiv);
  }

  dataPoints.push({ 're': (zo * Number(real_old)).toPrecision(3), 'im': (zo * Number(imag_old)).toPrecision(3) });


  //Update the impedance box
  var txt = "<div class=\"text_box\">";
  txt += (real_old * zo).toPrecision(3);
  if (imag_old < 0) txt += " - ";
  else txt += " + ";
  txt += Math.abs(imag_old * zo).toPrecision(3) + "j</div>";
  document.getElementById("current_impedance").innerHTML = txt;

  //Calculate the admittance
  var admittance_real, admittance_imaginary;
  temp_array = one_over_complex(real_old * zo, imag_old * zo);
  admittance_real = temp_array[0];
  admittance_imaginary = temp_array[1];
  txt = "<div class=\"text_box\">" + (admittance_real).toPrecision(3);
  if (admittance_imaginary < 0) txt += " - ";
  else txt += " + ";
  txt += Math.abs(admittance_imaginary).toPrecision(3) + "j</div>";
  document.getElementById("current_admittance").innerHTML = txt

  //Calculate the reflection coefficient -current_admittance (zo-zimp) / (zo+zimp)
  var reflectio_coeff_real, reflectio_coeff_imag, reflection_mag, reflection_phase;
  [reflectio_coeff_real, reflectio_coeff_imag, reflection_mag, reflection_phase] = impedanceToReflectionCoefficient(real_old, imag_old, zo)
  txt = "<div class=\"text_box\">" + (reflectio_coeff_real).toPrecision(3);
  if (reflectio_coeff_imag < 0) txt += " - ";
  else txt += " + ";
  txt += Math.abs(reflectio_coeff_imag).toPrecision(3) + "j</div>";
  document.getElementById("current_reflection").innerHTML = txt;
  txt = "<div class=\"text_box\">" + reflection_mag.toPrecision(3);
  txt += " &ang; ";
  txt += (reflection_phase).toPrecision(3) + "&deg; </div>";
  document.getElementById("current_reflection_mag").innerHTML = txt;

  //calculate VSWR (1+r) / (1-r)
  var vswr_live = (1 + reflection_mag) / (1 - reflection_mag);
  document.getElementById("vswr_live").innerHTML = "<div class=\"text_box\">" + vswr_live.toPrecision(3) + "</div>";

  //populate vmin_distanceEl and vmax_distanceEl
  vmax_distanceEl.value = (0.5 * reflection_phase / 360).toPrecision(precision);

  if (reflection_phase > 180) vmin_distanceEl.value = (0.5 * (reflection_phase - 180) / 360).toPrecision(precision);
  else vmin_distanceEl.value = (0.5 * (reflection_phase + 180) / 360).toPrecision(precision);



  //redefine the labels in case zo has changed
  define_labels();

  //draw span curve
  var sp_coord_x = [], sp_coord_y = [];
  var refl_mag = [], refl_phase = [];
  var temp_refl_re, temp_refl_im, temp_refl_ph;
  for (i = 0; i < span_impedance_re.length; i++) {
    sp_coord = find_smith_coord(span_impedance_re[i], span_impedance_im[i], false);
    sp_coord_x.push(sp_coord[0]);
    sp_coord_y.push(sp_coord[1]);

    temp_array = one_over_complex(span_impedance_re[i] * zo + zo, span_impedance_im[i] * zo);
    bot_real = temp_array[0];
    bot_imag = temp_array[1];
    temp_refl_re = ((span_impedance_re[i] * zo - zo) * bot_real) - ((span_impedance_im[i] * zo) * bot_imag);
    temp_refl_im = ((span_impedance_im[i] * zo) * bot_real) + ((span_impedance_re[i] * zo - zo) * bot_imag);
    refl_mag.push(Number(Math.sqrt((temp_refl_re * temp_refl_re) + (temp_refl_im * temp_refl_im))));
    if (temp_refl_re == 0) var temp_refl_ph = 0;
    else var temp_refl_ph = 360 * Math.atan(temp_refl_im / temp_refl_re) / (2 * Math.PI);
    if (temp_refl_re < 0) temp_refl_ph += 180;
    refl_phase.push(temp_refl_ph);

  }
  span_trace = {
    x: sp_coord_x,
    y: sp_coord_y,
    line: {
      color: 'rgb(200, 0, 0)',
      width: 4
    },
    mode: 'lines',
    type: 'scatter'
  };
  if (span_impedance_re.length > 1) {
    if (Number(sp_coord_y[0]) < Number(sp_coord_y[1])) y_off = 0.04;
    else y_off = -0.04;
    if (Number(sp_coord_x[0]) < Number(sp_coord_x[1])) x_off = 0.03;
    else x_off = -0.03;
    //draw a data box at each end of the span curve

    layout_shapes.push({ type: "rectangle", x0: Number(sp_coord_x[0]) - 0.01, y0: Number(sp_coord_y[0]) - 0.01, x1: Number(sp_coord_x[0]) + 0.01, y1: Number(sp_coord_y[0]) + 0.01 });
    textbox_trace.push({ x: [Number(sp_coord_x[0]) - x_off], y: [Number(sp_coord_y[0]) - y_off], text: ["F-span"], mode: 'text' });

    layout_shapes.push({ type: "rectangle", x0: Number(sp_coord_x[span_impedance_re.length - 1]) - 0.01, y0: Number(sp_coord_y[span_impedance_re.length - 1]) - 0.01, x1: Number(sp_coord_x[span_impedance_re.length - 1]) + 0.01, y1: Number(sp_coord_y[span_impedance_re.length - 1]) + 0.01 });
    textbox_trace.push({ x: [Number(sp_coord_x[span_impedance_re.length - 1]) + x_off], y: [Number(sp_coord_y[span_impedance_re.length - 1]) + y_off], text: ["F+span"], mode: 'text' });
  }
  //console.log(span_impedance_re,span_impedance_im,span_trace)

  //Add custom markers so user can specify specific impedances which they could aim for
  for (i = 0; i < customMarkers.length; i++) {
    sp_coord = find_smith_coord(customMarkers[i].re / zo, customMarkers[i].im / zo, false);
    x = Number(sp_coord[0]);
    y = Number(sp_coord[1]);
    layout_shapes.push({ type: "circle", line: { color: 'red' }, x0: x - 0.01, y0: y - 0.01, x1: x + 0.01, y1: y + 0.01 });
    textbox_trace.push({ x: [x + 0.06], y: [y], text: ["MP" + i], mode: 'text' });
  }

  //Add a VSWR circle, which is a new circle centered in the middle of the Smith Chart, with radius defined by VSWR
  if (vswr != 0.0) {
    //get coord of middle of smith chart (could search in the code but I'm lazy)
    center_coord = find_smith_coord(1, 0, false);
    //get the radius of the VSWR 
    vswr_rad = find_smith_coord(vswr, 0, false);
    x0 = 2 * Number(center_coord[0]) - Number(vswr_rad[0]);
    x1 = Number(vswr_rad[0]);
    y0 = Number(vswr_rad[0]);
    y1 = 2 * Number(center_coord[1]) - Number(vswr_rad[0]);
    if (color_of_smith_curves == 'colorful') var vswr_color = 'lime'
    else var vswr_color = 'green';
    layout_shapes.push({ type: "circle", line: { color: vswr_color }, x0: x0, y0: y0, x1: x1, y1: y1 });
  }
  if (constQ != 0.0) {
    //Create a 100-point line from Z=0 to Z=20*zo with logarithmic steps
    var constQZArray = [0]
    var step = Math.log(20) / 200;
    var constQ_trace_x = []
    var constQ_trace_y = [];
    for (i = 1; i < 200; i++) {
      constQZArray.push((Math.E ** (i * step)) - 1);
    }
    constQZArray.push(1e10); //~inf
    //convert impedances to coordinates
    for (i = 0; i < constQZArray.length; i++) {
      sp_coord = find_smith_coord(constQZArray[i], constQZArray[i] * constQ, false);
      constQ_trace_x.push(sp_coord[0]);
      constQ_trace_y.push(sp_coord[1]);
    }
    for (i = constQZArray.length - 1; i >= 0; i--) {
      sp_coord = find_smith_coord(constQZArray[i], -constQZArray[i] * constQ, false);
      constQ_trace_x.push(sp_coord[0]);
      constQ_trace_y.push(sp_coord[1]);
    }
    var constQ_trace = {
      x: constQ_trace_x,
      y: constQ_trace_y,
      line: {
        color: 'black',
        width: 4
      },
      mode: 'lines',
      type: 'scatter'
    };

  } else var constQ_trace = {};

  var data = trace.concat(textbox_trace, trace_im_neg, trace_im_pos, trace_real, trace_adm, trace_sus_pos, trace_sus_neg, span_trace, constQ_trace);

  //
  //Create a plot for reflection coefficient plotted on its own
  //
  var exWidth = document.getElementById("myDiv").offsetWidth
  // var exWidth = document.getElementById("myDiv").offsetWidth
  var PlLayout = {
    paper_bgcolor: 'rgba(255,255,255,0.2)',
    plot_bgcolor: 'rgba(255,255,255,0.0)',
    showlegend: false,
    margin: layout.margin,
    height: exWidth,
    width: exWidth,
    hovermode: layout.hovermode,
    xaxis: layout.xaxis,
    yaxis: layout.yaxis,
    shapes: layout.shapes.concat(layout_shapes)
  };
  var config = {
    displayModeBar: false, // this is the line that hides the hover bar.
  };
  Plotly.react('myDiv', data, PlLayout, config);




  // var data_polar = [
  //   {
  //     type: "scatterpolargl",
  //     r: [Number(reflection_mag)],
  //     theta: [reflection_phase],
  //     marker: {
  //       color: "black",
  //       symbol: "square",
  //       size: 8
  //     },
  //     subplot: "polar"
  //   }
  // ]

  // for(i=0;i<refl_mag.length;i++){
  //   data_polar.push(
  //     {
  //       type: "scatterpolargl",
  //       r: [refl_mag[i]],
  //       theta: [refl_phase[i]],
  //       marker: {
  //         color: 'rgb(200, 0, 0)',
  //         symbol: "circle",
  //         size: 4
  //       },
  //       subplot: "polar"
  //     }
  //   )
  // }


  // var layout_polar = {
  //   hovermode: false,
  //   showlegend: false,
  //   paper_bgcolor: 'rgba(0,0,0,0)',
  //   plot_bgcolor: 'rgba(0,0,0,0)',
  //   polar: {
  //     radialaxis: {
  //       tickfont: {
  //         size: 12
  //       },
  //       range: [0, 1],
  //       gridcolor: "rgba(145, 145, 145, 0.75)",
  //       dtick:'0.2'
  //     },
  //     angularaxis: {
  //       tickfont: {
  //         size: 12
  //       },
  //       gridcolor: "rgba(145, 145, 145, 0.75)",
  //       dtick:'15'
  //     },
  //     bgcolor:'rgba(255,255,255,0.2)',
  //   }
  // };

  //   var polarWidth = document.getElementById("smith_polar").offsetWidth
  //   layout_polar.width = polarWidth;
  //   layout_polar.height = polarWidth;
  // Plotly.react('PolarPlot', data_polar, layout_polar, config)

  //
  //Create a plots for distance to Vmax and Vmin
  //
  var markX, markY;
  [markX, markY] = find_smith_coord(real_old, imag_old, false)

  //Create 2 arcs, one to Vmax and one to Vmin
  var arcRad = 1.1;
  var arcStartAng = reflection_phase * Math.PI / 180;
  var arcStartX = Math.cos(arcStartAng) * arcRad;
  var arcStartY = Math.sin(arcStartAng) * arcRad;
  var pathMax = "M " + arcStartX + " " + arcStartY;
  var arcAng;
  for (i = 100; i >= 0; i--) {
    arcAng = arcStartAng * i / 100;
    arcStartX = Math.cos(arcAng) * arcRad;
    arcStartY = Math.sin(arcAng) * arcRad;
    pathMax += " L " + arcStartX + " " + arcStartY;
  }
  pathMax += " L " + (arcRad + 0.05) + " 0.05";
  pathMax += " M " + arcRad + " 0";
  pathMax += " L " + (arcRad - 0.05) + " 0.05";



  arcRad = 1.2;
  if (arcStartAng < Math.PI) arcStartAng = arcStartAng + 2 * Math.PI;
  arcStartX = Math.cos(arcStartAng) * arcRad;
  arcStartY = Math.sin(arcStartAng) * arcRad;
  var pathMin = "M " + arcStartX + " " + arcStartY;
  for (i = 0; i < 101; i++) {
    arcAng = arcStartAng - (arcStartAng - Math.PI) * i / 100;
    arcStartX = Math.cos(arcAng) * arcRad;
    arcStartY = Math.sin(arcAng) * arcRad;
    pathMin += " L " + arcStartX + " " + arcStartY;
  }
  pathMin += " L " + (-arcRad - 0.05) + " -0.05";
  pathMin += " M " + -arcRad + " 0";
  pathMin += " L " + (-arcRad + 0.05) + " -0.05";
  // console.log(pathMax);



  var layout_lambda = {
    autosize: true,
    margin: {
      l: 20,
      r: 20,
      b: 20,
      t: 20
    },
    hovermode: false,
    showlegend: false,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: {
      range: [-1.3, 1.3],
      zeroline: false,
      showgrid: false,
      visible: false,
      fixedrange: true,
    },
    yaxis: {
      range: [-1.3, 1.3],
      zeroline: false,
      showgrid: false,
      visible: false,
      fixedrange: true,
    },
    shapes: [
      //draw the perimiter
      {
        type: 'circle',
        xref: 'x',
        yref: 'y',
        x0: -1,
        y0: -1,
        x1: 1,
        y1: 1,
        line: {
          color: 'black'
        }
      },
      //draw an arc
      {
        type: 'path',
        path: pathMax,
        line: {
          color: 'rgb(93, 164, 214)'
        }
      },
      {
        type: 'path',
        path: pathMin,
        line: {
          color: 'rgb(93, 164, 214)'
        }
      }
    ]
  }


  var data_lambda = [
    //show the data marker
    {
      x: [0],
      y: [0],
      mode: 'markers',
      marker: {
        size: 20,
      },
    },
    {
      x: [markX],
      y: [markY],
      mode: 'markers',
      marker: {
        size: 20,
        symbol: 'x',
        color: 'rgb(37, 50, 64)'
      },
    },
    //dashed line from 0,0, thru point, to rotation
    {
      x: [0, Math.cos(arcStartAng) * arcRad],
      y: [0, Math.sin(arcStartAng) * arcRad],
      line: {
        dash: 'dot',
        width: 1,
        color: 'black'
      },
      mode: 'lines',
      type: 'scatter'
    },
    //Vmin and Vmax labels
    {
      x: [0.9, -0.9],
      y: [0, 0],
      text: ["Vmax", "Vmin"],
      mode: 'text',
      textfont: {
        size: fontsize
      }
    }
  ];


  var smith_lambda = document.getElementById("smith_lambda").offsetWidth;
  layout_lambda.width = smith_lambda;
  layout_lambda.height = smith_lambda;
  Plotly.react('LambdaPlot', data_lambda, layout_lambda, config);

  //
  //Create a plots showing the S-parameters
  //
  var traceS11 = {
    line: {
      color: 'blue',
    },
    name: 'Magnitude',
    type: 'scatter'
  };

  var traceS11Ph = {
    line: {
      color: 'red',
    },
    name: 'Phase',
    yaxis: 'y2',
    type: 'scatter'
  };

  var sParamLayout = {
    yaxis: {
      tickfont: { color: 'blue' },
      zeroline: false,
      showgrid: true,
      gridcolor: "rgb(37, 50, 64)",
      fixedrange: true,
      title: 'S11 (dB)',
      automargin: true,
    },
    yaxis2: {
      tickfont: { color: 'red' },
      side: 'right',
      zeroline: false,
      // showgrid: true,
      gridcolor: "rgb(37, 50, 64)",
      fixedrange: true,
      title: 'Phase (deg)',
      automargin: true,
    },
    xaxis: {
      automargin: true,
      title: 'frequency (' + domFreqSel.value + ')',
      zeroline: false,
      showgrid: false,
      fixedrange: true,
    },
    autosize: true,
    margin: {
      l: 20,
      r: 20,
      b: 20,
      t: 20
    },
    hovermode: false,
    showlegend: false,
    // legend: {
    //   x: 1,
    //   xanchor: 'right',
    //   y: 1
    // },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',

  };

  var scaledFreq = freq / schematic[0].freq_unit.multiplier;
  //just show 1 point
  traceS11.y = [];
  traceS11Ph.y = [];
  if (span_freq == 0) {
    var newSpanFreq = 1
    traceS11.x = [scaledFreq];
    traceS11Ph.x = [scaledFreq];
    if (reflection_mag == 0) {
      traceS11.y.push(0);
      traceS11Ph.y.push(0);
    } else {
      traceS11.y.push(20 * Math.log10(reflection_mag));
      traceS11Ph.y.push(reflection_phase);
    }
    // traceS22.x = [scaledFreq];
    // traceS22.y = [0.5];
    // sParamLayout.yaxis.range = [0, 2];
    // sParamLayout.yaxis2.range = [0, 2];
  } else {
    // [reflectio_coeff_real, reflectio_coeff_imag, reflection_mag, reflection_phase] = impedanceToReflectionCoefficient (real_old, imag_old, zo) 
    traceS11.x = [];
    traceS11Ph.x = [];
    for (i = 0; i < span_impedance_re.length; i++) {
      [reflectio_coeff_real, reflectio_coeff_imag, reflection_mag, reflection_phase] = impedanceToReflectionCoefficient(span_impedance_re[i], span_impedance_im[i], zo)
      if (reflection_mag == 0) {
        traceS11.y.push(0);
        traceS11Ph.y.push(0);
      } else {
        traceS11.y.push(20 * Math.log10(reflection_mag));
        traceS11Ph.y.push(reflection_phase);
      }
      traceS11.x.push((freq + span_freq * (i - span_res) / span_res) / schematic[0].freq_unit.multiplier);
      traceS11Ph.x.push((freq + span_freq * (i - span_res) / span_res) / schematic[0].freq_unit.multiplier);
    }
    newSpanFreq = span_freq / schematic[0].freq_unit.multiplier;
  }

  sParamLayout.xaxis.range = [scaledFreq - newSpanFreq, scaledFreq + newSpanFreq];

  // var data = [traceS11, traceS22];
  var data = [traceS11, traceS11Ph];
  // var smith_lambda = document.getElementById("SParamPlot").offsetWidth;
  // sParamLayout.width = smith_lambda;
  // sParamLayout.height = smith_lambda;

  Plotly.react('SParamPlot', data, sParamLayout, config);


  //update the HTML tables
  drawMakerTable();
}

function update_schem_tol(i, tol) {
  schematic[i].tol = Math.abs(tol.value);
  update_smith_chart();
}

function draw_schematic(i) {

  //Add the element to the schematic view
  var div = document.createElement("div");
  unit = [];
  div.setAttribute('class', 'col-6 col-lg-2 g-0');
  //Add a close button, but can't remove black boxes...
  var innerText = ""
  // if (schematic[i].type!='bb') div.innerHTML += "<div class=\"rem\" onclick=\"schematic.splice("+i+",1); update_smith_chart()\"><div class=\"dp_txt\">DP"+i+"</div><div class=\"close-button\"></div></div>";
  // else div.innerHTML += "<div class=\"rem\">DP"+i+"</div>"; 
  if (schematic[i].type != 'bb') innerText += '<div class="row me-2 ms-2" style="height: 26px;"><div class="col"><small>DP' + i + '</small></div><div class="col text-end"><button type="button" class="btn-close" onclick="schematic.splice(' + i + ',1); update_smith_chart()"></button></div></div>'
  else innerText += '<div class="row me-2 ms-2" style="height: 26px;"><small>DP' + i + '</small></div>';
  var rows_to_create = []
  switch (schematic[i].type) {
    case ("bb"):
      sch_label = "Black Box";
      sch_imag = true;
      sch_real = true;
      sch_abs = true;
      sch_icon = "black_box";
      sch_svg = 0;
      rows_to_create = [['Impedance'], ['abs', 'abs'], ['tol']];
      break;
    case ("customZ"):
      sch_label = "Custom";
      sch_imag = true;
      sch_real = true;
      sch_abs = true;
      sch_icon = "CustomZ";
      sch_svg = 6500;
      rows_to_create = [['blank-impedance'], ['custom']];
      break;
    case ("pr"):
      rows_to_create = [['Impedance'], ['abs', 'unit_0'], ['tol']];
      sch_label = "Parallel Resistor";
      sch_imag = false;
      sch_real = true;
      sch_abs = true;
      unit = [['mΩ', 'Ω', 'KΩ', 'MΩ']];
      sch_icon = "resistor_parallel";
      sch_svg = 2500;
      break;
    case ("sr"):
      rows_to_create = [['Impedance'], ['abs', 'unit_0'], ['tol']];
      sch_label = "Series Resistor";
      sch_imag = false;
      sch_real = true;
      sch_abs = true;
      unit = [['mΩ', 'Ω', 'KΩ', 'MΩ']];
      sch_icon = "resistor_series";
      sch_svg = 3000;
      break;
    case ("pc"):
      rows_to_create = [['Impedance'], ['abs', 'unit_0'], ['tol']];
      sch_label = "Parallel Capacitor";
      sch_imag = true;
      sch_real = false;
      sch_abs = true;
      unit = [['mF', 'uF', 'nF', 'pF', 'fF']];
      sch_icon = "capacitor_parallel";
      sch_svg = 500;
      break;
    case ("sc"):
      rows_to_create = [['Impedance'], ['abs', 'unit_0'], ['tol']];
      sch_label = "Series Capacitor";
      sch_imag = true;
      sch_real = false;
      sch_abs = true;
      unit = [['mF', 'uF', 'nF', 'pF', 'fF']];
      sch_icon = "capacitor_series";
      sch_svg = 1000;
      break;
    case ("pi"):
      rows_to_create = [['Impedance'], ['abs', 'unit_0'], ['tol']];
      sch_label = "Parallel Inductor";
      sch_imag = true;
      sch_real = false;
      sch_abs = true;
      unit = [['H', 'mH', 'uH', 'nH', 'pH']];
      sch_icon = "inductor_parallel";
      sch_svg = 1500;
      break;
    case ("si"):
      rows_to_create = [['Impedance'], ['abs', 'unit_0'], ['tol']];
      sch_label = "Series Inductor";
      sch_imag = true;
      sch_real = false;
      sch_abs = true;
      unit = [['H', 'mH', 'uH', 'nH', 'pH']];
      sch_icon = "inductor_series";
      sch_svg = 2000;
      break;
    case ("tl"):
      rows_to_create = [['blank-impedance'], ['abs', 'unit_0'], ['line_zo'], ['tol']];
      sch_label = "Transmission Line";
      sch_imag = false;
      sch_real = false;
      sch_abs = true; //is actually length
      unit = [[' m', 'mm', 'um', 'λ']];
      sch_icon = "transmission_line";
      sch_svg = 3500;
      break;
    case ("ss"):
      rows_to_create = [['blank-impedance'], ['abs', 'unit_0'], ['line_zo']];
      sch_label = "Short Stub";
      sch_imag = false;
      sch_real = false;
      sch_abs = true; //is actually length
      unit = [[' m', 'mm', 'um', 'λ']];
      sch_icon = "stub_short";
      sch_svg = 4500;
      break;
    case ("so"):
      rows_to_create = [['blank-impedance'], ['abs', 'unit_0'], ['line_zo']];
      sch_label = "Open Stub";
      sch_imag = false;
      sch_real = false;
      sch_abs = true; //is actually length
      unit = [[' m', 'mm', 'um', 'λ']];
      sch_icon = "stub_open";
      sch_svg = 4000;
      break
    case ("rc"):
      rows_to_create = [['Impedance'], ['abs', 'unit_0'], ['abs', 'unit_1'], ['tol']];
      sch_label = "Capacitor w/ ESR";
      sch_imag = true;
      sch_real = true;
      sch_abs = true;
      unit = [['mΩ', 'Ω', 'KΩ', 'MΩ'], ['mF', 'uF', 'nF', 'pF', 'fF']];
      sch_icon = "black_box";
      sch_svg = 5000;
      break;
    case ("rl"):
      rows_to_create = [['Impedance'], ['abs', 'unit_0'], ['abs', 'unit_1'], ['tol']];
      sch_label = "Inductor w/ ESR";
      sch_imag = true;
      sch_real = true;
      sch_abs = true;
      unit = [['mΩ', 'Ω', 'KΩ', 'MΩ'], ['H', 'mH', 'uH', 'nH', 'pH']];
      sch_icon = "black_box";
      sch_svg = 5500;
      break;
    case ("rlc"):
      rows_to_create = [['Impedance'], ['abs', 'unit_0'], ['abs', 'unit_1'], ['abs', 'unit_2'], ['tol']];
      sch_label = "Inductor w/ ESR";
      sch_imag = true;
      sch_real = true;
      sch_abs = true;
      unit = [['mΩ', 'Ω', 'KΩ', 'MΩ'], ['H', 'mH', 'uH', 'nH', 'pH'], ['mF', 'uF', 'nF', 'pF', 'fF']];
      sch_icon = "black_box";
      sch_svg = 6000;
      break;
  }
  innerText += '<div class="row"><div class="col"><svg viewBox="' + sch_svg + ' 0 500 500"><use xlink:href="svg/elements_w_custom.svg#rainbow3" alt="' + sch_label + '" /></svg></div></div>';

  var cntR, cntC, ittUnit, boxType, varSelect, unitIndex;
  var absCounter = 0;
  for (cntR = 0; cntR < rows_to_create.length; cntR++) {
    innerText += '<div class="row ms-3 me-3"><div class="input-group mb-1 p-0">'
    for (cntC = 0; cntC < rows_to_create[cntR].length; cntC++) {
      boxType = rows_to_create[cntR][cntC];
      if (boxType == 'tol') {
        innerText += '<span class="input-group-text">tol &plusmn; </span>'
        innerText += '<input type="text" class="form-control" value="' + schematic[i].tol + '" name="tol" onchange="update_schem_tol(' + i + ',this)">'
        innerText += '<span class="input-group-text">%</span>'
      } else
        if (boxType == 'blank-impedance') {
          innerText += '<div class="fst-italic m-auto">&nbsp</div>';
        } else if (boxType == 'Impedance') {
          innerText += '<div class="fst-italic m-auto">Z = '
          if (sch_real) innerText += Number(((schematic[i].real * zo)).toPrecision(precision))
          if (sch_real && sch_imag) {
            if (schematic[i].imaginary * zo >= 0) innerText += ' + '
            else innerText += ' - '
          }
          if (sch_imag) innerText += Number((Math.abs(schematic[i].imaginary * zo)).toPrecision(precision)) + 'j'
          innerText += '</div>'
        } else if (boxType == 'custom') {
          innerText += '<button type="button" class="btn btn-secondary m-auto" data-bs-toggle="modal" data-bs-target="#customZModal" onclick="createCustomZModal(' + i + ')">Impedance Table</button>';
        } else if (boxType == 'line_zo') {
          innerText += '<span class="input-group-text">Zo = </span>'
          innerText += '<input type="text" class="form-control" value=' + schematic[i][boxType] + ' name="' + boxType + '" onchange="update_schem_abs(' + i + ',this,0)">'
        } else if ((boxType == 'unit_0') || (boxType == 'unit_1') || (boxType == 'unit_2')) {
          unitIndex = boxType.split('_')[1];
          innerText += '<select class="form-select" onchange="updatespan(' + i + ', this, ' + unitIndex + ')">'
          for (ittUnit = 0; ittUnit < unit[unitIndex].length; ittUnit++) {
            if (unit[unitIndex][ittUnit] == schematic[i].unit[unitIndex]) varSelect = "selected"
            else varSelect = ""
            innerText += '<option value=' + unit[unitIndex][ittUnit] + ' ' + varSelect + '>' + unit[unitIndex][ittUnit] + '</option>'
          }
          innerText += '</select>'
          // console.log('Unit', schematic[i].unit[unitIndex], innerText);
        } else {
          if (cntC > 0) innerText += '<span class="input-group-text">+</span>'
          innerText += '<input type="text" class="form-control inputMW" value=' + schematic[i][boxType][absCounter] + ' name="' + boxType + '" onchange="update_schem_abs(' + i + ',this,' + absCounter + ')">'
          if (cntC > 0) innerText += '<span class="input-group-text ps-2 pe-2">j</span>'
          if (boxType == 'abs') absCounter = absCounter + 1;
        }
    }
    innerText += '</div></div>'
  }

  div.innerHTML = innerText;
  return div;
  // console.log("appending this:", div)
  // document.getElementById("schematic").appendChild(div);


}

var lastCustomModal = 0;

function createCustomZModal(index) {
  var modalTitle = document.getElementById('customZModalTitle');
  var modalBody = document.getElementById('customZModalBody');
  modalTitle.innerHTML = "Impedance Table for element #" + index;
  modalBody.value = schematic[index].raw
  lastCustomModal = index;
  checkCustomZValid();
}

const regexCustomZ = /[^0-9,eE\s\-\+\.]/;  //list of acceptable characters
const regexCustomZComma = /[,]/;
var customZImpedanceTable = [];

function checkCustomZValid() {
  var warn = document.getElementById('customZValidWarning');
  var textbox = document.getElementById('customZModalBody');
  var saveButton = document.getElementById('saveLUT');
  var regexRes = textbox.value.match(regexCustomZ);
  var regexResComma = textbox.value.match(regexCustomZComma);
  var customZPrevFreq = 0;
  var customZImpedanceTable = []
  // if (regexResComma == null) var splitStr = ','
  // else var splitStr = ''
  var allLinesHave3Values = true;
  var allvaluesAreNotBlank = true;
  var frequencyIncreases = true;
  var lines = textbox.value.split(/\r?\n/);
  var splitLines;
  //ToDo - remove trailing blanklines
  for (var i = 0; i < lines.length; i++) {
    lines[i] = lines[i].trim();
    if (lines[i] == '') console.log('blank line found');
    else {
      if (regexResComma == null) splitLines = lines[i].split(/\s+/);
      else splitLines = lines[i].split(',');
      if (splitLines.length == 3) {
        if ((splitLines[0] == '') || (splitLines[1] == '') || (splitLines[2] == '')) allvaluesAreNotBlank = false
        else {
          splitLines[0] = Number(splitLines[0]);
          splitLines[1] = Number(splitLines[1]);
          splitLines[2] = Number(splitLines[2]);
          if ((i > 0) && (splitLines[0] <= customZPrevFreq)) frequencyIncreases = false;
          else {
            customZImpedanceTable.push(splitLines);
            customZPrevFreq = Number(splitLines[0]);
          }
        }
      } else allLinesHave3Values = false;
    }

  }
  if ((regexRes == null) && allLinesHave3Values && allvaluesAreNotBlank && frequencyIncreases) {
    textbox.classList.remove("is-invalid");
    textbox.classList.add("is-valid");
    saveButton.classList.remove("disabled");
    warn.style.display = "none";
    schematic[lastCustomModal].lut = customZImpedanceTable;
    schematic[lastCustomModal].raw = textbox.value;
    if (document.getElementById('customz_interp_sah').checked) schematic[lastCustomModal].interp = 'sah';
    else schematic[lastCustomModal].interp = 'linear';
    plotCustomZ();
    // console.log('Pass',splitLines);
  } else {
    textbox.classList.remove("is-valid");
    textbox.classList.add("is-invalid");
    saveButton.classList.add("disabled");
    warn.style.display = "block"
    // console.log('FAIL', regexRes,allLinesHave3Values, splitLines);
  }
}

function removeCustom() {
  schematic.splice(lastCustomModal, 1);
  update_smith_chart()
}

function plotCustomZ() {
  var x = [];
  var y = [];
  var mag;
  var temp;
  // console.log('plotting lut', schematic[lastCustomModal].lut, schematic[lastCustomModal].lut.length);
  for (var i = 0; i < schematic[lastCustomModal].lut.length; i++) {
    temp = schematic[lastCustomModal].lut[i];
    x.push(temp[0])
    mag = Math.sqrt(temp[1] * temp[1] + temp[2] * temp[2]);
    y.push(mag);
  }
  var trace = {
    x: x,
    y: y,
    mode: 'lines+markers'
  };
  if (document.getElementById('customz_interp_sah').checked) trace.line = { shape: 'hv' };
  var data = [trace];
  var layout = {
    title: 'mag(Impedance) vs Frequency'
  };
  Plotly.react('plotlyCustomZplot', data, layout);
}

var trace_im_neg, trace_im_pos, trace_real, trace_adm, trace_sus_pos, trace_sus_neg = {};

function define_labels() {

  trace_im_neg = {};
  trace_im_pos = {};
  trace_real = {};
  trace_adm = {};
  trace_sus_pos = {};
  trace_sus_neg = {};

  // console.log(color_of_smith_curves);
  if (color_of_smith_curves == 'bland') {
    color_im = 'rgba(0, 0, 0,0.5)';
    color_real = 'rgba(0, 0, 0,0.5)';
    color_adm = 'rgba(0, 0, 0,0.3)';
    color_sus = 'rgba(0, 0, 0,0.3)';
  } else {
    color_im = 'rgba(252, 114, 2,0.5)';
    color_real = 'rgba(150, 0, 0,0.5)';
    color_adm = 'rgba(0, 10, 163,0.3)';
    color_sus = 'rgba(255, 0, 250,0.3)';
  }

  if (show_labels_res) {
    trace_im_pos = {
      x: [0.95, 0.9, 0.63, 0.05, -0.54, -0.86],
      y: [0.14, 0.33, 0.73, 0.95, 0.8, 0.4],
      text: ["<b>" + 10 * zo + "</b>", "<b>" + 5 * zo + "</b>", "<b>" + 2 * zo + "</b>", "<b>" + 1 * zo + "</b>", "<b>" + 0.5 * zo + "</b>", "<b>" + 0.2 * zo + "</b>"],
      mode: 'text',
      textfont: {
        color: color_im,
        size: fontsize
      }
    };

    trace_im_neg = {
      x: [0.95, 0.9, 0.63, 0.05, -0.54, -0.86],
      y: [-0.14, -0.33, -0.73, -0.95, -0.8, -0.4],
      text: ["<b>" + 10 * zo + "</b>", "<b>" + 5 * zo + "</b>", "<b>" + 2 * zo + "</b>", "<b>" + 1 * zo + "</b>", "<b>" + 0.5 * zo + "</b>", "<b>" + 0.2 * zo + "</b>"],
      mode: 'text',
      textfont: {
        color: color_im,
        size: fontsize
      }
    };
  }

  if (show_labels_res) {

    trace_real = {
      x: [0.96, 0.88, 0.66, 0.38, 0.05, -0.29, -0.62, -0.98],
      y: [0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03],
      text: ["<b>∞</b>", "<b>" + 10 * zo + "</b>", "<b>" + 4 * zo + "</b>", "<b>" + 2 * zo + "</b>", "<b>" + 1 * zo + "</b>", "<b>" + 0.5 * zo + "</b>", "<b>" + 0.2 * zo + "</b>", "<b>0</b>"],
      mode: 'text',
      textfont: {
        color: color_real,
        size: fontsize
      }
    };
  }
  if (show_labels_adm) {
    trace_adm = {
      x: [0.53, 0.26, -0.07, -0.4, -0.74, -0.88],
      y: [-0.03, -0.03, -0.03, -0.03, -0.03, -0.03, -0.03],
      text: ["<b>" + (1000 / 4 / zo).toPrecision(3) + "</b>m", "<b>" + (1000 / 2 / zo).toPrecision(3) + "</b>m", "<b>" + (1000 / zo).toPrecision(3) + "</b>m", "<b>" + (1000 * 2 / zo).toPrecision(3) + "</b>m", "<b>" + (1000 * 5 / zo).toPrecision(3) + "</b>m", "<b>" + (1000 * 10 / zo).toPrecision(3) + "</b>m"],
      mode: 'text',
      textfont: {
        color: color_adm,
        size: fontsize
      }
    };
  }

  if (show_labels_adm) {
    trace_sus_pos = {
      x: [0.86, 0.53, -0.07, -0.62, -0.89, -0.92],
      y: [0.4, 0.79, 0.97, 0.72, 0.31, 0.15],
      text: ["<b>" + (1000 / 5 / zo).toPrecision(3) + "</b>m", "<b>" + (1000 / 2 / zo).toPrecision(3) + "</b>m", "<b>" + (1000 / zo).toPrecision(3) + "</b>m", "<b>" + (1000 * 2 / zo).toPrecision(3) + "</b>m", "<b>" + (1000 * 5 / zo).toPrecision(3) + "</b>m", "<b>" + (1000 * 10 / zo).toPrecision(3) + "</b>m"],
      mode: 'text',
      textfont: {
        color: color_sus,
        size: fontsize
      }
    };

    trace_sus_neg = {
      x: [0.86, 0.53, -0.07, -0.62, -0.89, -0.92],
      y: [-0.4, -0.79, -0.97, -0.72, -0.31, -0.15],
      text: ["<b>" + (1000 / 5 / zo).toPrecision(3) + "</b>m", "<b>" + (1000 / 2 / zo).toPrecision(3) + "</b>m", "<b>" + (1000 / zo).toPrecision(3) + "</b>m", "<b>" + (1000 * 2 / zo).toPrecision(3) + "</b>m", "<b>" + (1000 * 5 / zo).toPrecision(3) + "</b>m", "<b>" + (1000 * 10 / zo).toPrecision(3) + "</b>m"],
      mode: 'text',
      textfont: {
        color: color_sus,
        size: fontsize
      }
    };
  }
}

//function intersectTwoCircles(x1,y1,r1, x2,y2,r2) {
// Finds the intersection between two circles, one with magnitude 'real', the other with 'imaginary'
function find_smith_coord(real, imaginary, rotate) {

  //to prevent divide by zero errors...
  if (imaginary > 0) imaginary = Math.max(imaginary, 0.001);
  else imaginary = Math.min(imaginary, -0.001);
  real = Math.max(real, 0.001);

  if (rotate == true) {
    var realn = real / (real * real + imaginary * imaginary);
    var imaginaryn = imaginary / (real * real + imaginary * imaginary);
    //window.alert([real,imaginary,realn,imaginaryn]);
    real = realn;
    imaginary = imaginaryn;
  }

  //to prevent weird anomolys in the plot
  if (imaginary > 0) imaginary = Math.max(imaginary, 0.001);
  else imaginary = Math.min(imaginary, -0.001);
  real = Math.max(real, 0.001);

  //window.alert([realn,imaginaryn]);


  if (rotate == true) var x1 = -real / (real + 1);
  else var x1 = real / (real + 1);
  var y1 = 0;
  var r1 = 1 / (real + 1)
  if (rotate == true) var x2 = -1;
  else var x2 = 1;
  var y2 = 1 / imaginary;
  var r2 = 1 / Math.abs(imaginary);

  var centerdx = x1 - x2;
  var centerdy = y1 - y2;
  var R = Math.sqrt(centerdx * centerdx + centerdy * centerdy);
  if (!(Math.abs(r1 - r2) <= R && R <= r1 + r2)) { // no intersection
    return []; // empty list of results
  }
  // intersection(s) should exist

  var R2 = R * R;
  var R4 = R2 * R2;
  var a = (r1 * r1 - r2 * r2) / (2 * R2);
  var r2r2 = (r1 * r1 - r2 * r2);
  var c = Math.sqrt(2 * (r1 * r1 + r2 * r2) / R2 - (r2r2 * r2r2) / R4 - 1);

  var fx = (x1 + x2) / 2 + a * (x2 - x1);
  var gx = c * (y2 - y1) / 2;
  var ix1 = (fx + gx).toFixed(5);
  var ix2 = (fx - gx).toFixed(5);

  var fy = (y1 + y2) / 2 + a * (y2 - y1);
  var gy = c * (x1 - x2) / 2;
  var iy1 = (fy + gy).toFixed(5);
  var iy2 = (fy - gy).toFixed(5);

  if (iy1 == 0) { iy = iy2; ix = ix2; }
  else { iy = iy1; ix = ix1; }

  // note if gy == 0 and gx == 0 then the circles are tangent and there is only one solution
  // but that one solution will just be duplicated as the code is currently written
  if (rotate == true) { iy = -iy, ix = -ix; };

  return [ix, iy];
}
//plots an arc with 'resolution' points between previous impedance x1,y1 and next impedance x2,y2
function arc_smith_points(x1, y1, x2, y2, type, rotate, beta, start_at_qtr_wl) {

  var x_coord = [];
  var y_coord = [];
  var end_x_coord = 0;
  var end_y_coord = 0;
  var temp_array = [];
  temp_array = find_smith_coord(x1, y1, rotate);
  var start_x_coord = temp_array[0];
  var start_y_coord = temp_array[1];
  var real_old = 0;
  var imag_old = 0;
  var tan_beta = 0;
  var stub_admittance_im = 0;

  //used for transmission lines and stubs
  var line_zo = y2;
  var line_length = x2;
  var top_real_temp = x1 * line_zo;

  for (i = 0; i < resolution + 1; i++) {
    if (type == "transmission_line") {
      tan_beta = Math.tan(beta * i * line_length / resolution);
      var top_imag_temp = (y1 * zo + line_zo * tan_beta) * line_zo / zo;
      var bot_real_temp = line_zo - y1 * tan_beta * zo;
      var bot_imag_temp = x1 * tan_beta * zo;
      var temp_array = one_over_complex(bot_real_temp, bot_imag_temp);
      var bot_real = temp_array[0];
      var bot_imag = temp_array[1];
      var real_answer = (top_real_temp * bot_real) - (top_imag_temp * bot_imag);
      var imag_answer = (top_real_temp * bot_imag) + (top_imag_temp * bot_real);
      temp_array = find_smith_coord(real_answer, imag_answer, rotate);
      x_coord[i] = temp_array[0];
      y_coord[i] = temp_array[1];

    } else if (type == "ss") {
      if (start_at_qtr_wl == 0) tan_beta = Math.tan(beta * i * line_length / resolution);
      else tan_beta = Math.tan(beta * (start_at_qtr_wl + i * (line_length - start_at_qtr_wl) / resolution));
      stub_admittance_im = -1 / (tan_beta * line_zo / zo);
      temp_array = find_smith_coord(x1, y1 + stub_admittance_im, rotate);
      x_coord[i] = temp_array[0];
      y_coord[i] = temp_array[1];
    } else if (type == "so") {
      tan_beta = Math.tan(beta * i * line_length / resolution);
      stub_admittance_im = tan_beta / (line_zo / zo);
      temp_array = find_smith_coord(x1, y1 + stub_admittance_im, rotate);
      x_coord[i] = temp_array[0];
      y_coord[i] = temp_array[1];
    } else {
      temp_array = find_smith_coord(x1 + (x2 - x1) * i / resolution, y1 + (y2 - y1) * i / resolution, rotate);
      x_coord[i] = temp_array[0];
      y_coord[i] = temp_array[1];
    }
  }

  if (type == "transmission_line") {
    temp_array = find_smith_coord(real_answer, imag_answer, rotate);
    real_old = real_answer;
    imag_old = imag_answer;
  }
  else if ((type == "so") || (type == "ss")) {
    real_old = x1;
    imag_old = y1 + stub_admittance_im;
  }/*
    temp_array=find_smith_coord(x1,imag_answer,rotate);
  } else {
    temp_array=find_smith_coord(x2, y2,rotate);
  }*/

  end_x_coord = temp_array[0];
  end_y_coord = temp_array[1];

  return [x_coord, y_coord, end_x_coord, end_y_coord, real_old, imag_old, start_x_coord, start_y_coord, x1, y1, x2, y2];
}

// function download_state() {
// 	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schematic, null, "\t"));
// 	//var dlAnchorElem = document.getElementById('downloadAnchorElem');
// 	//dlAnchorElem.setAttribute("href",     dataStr     );
// 	var myDate = new Date();
// 	var date = myDate.getDate();
// 	var month = myDate.getMonth();
// 	var year = myDate.getFullYear();
// 	var hour = myDate.getHours();
// 	var minutes = myDate.getMinutes();
// 	var seconds = myDate.getSeconds();

// 	var ddmmyyyy = year + pad(month + 1) + pad(date) + pad(hour) + pad(minutes) + pad(seconds);
// 	//dlAnchorElem.setAttribute("download", "online_smith_tool_"+ddmmyyyy+".json");
// 	download(dataStr,"online_smith_tool_"+ddmmyyyy+".json","text/plain");
// }

var layout = {
  title: 'Circles',
  hovermode: false,
  xaxis: {
    range: [-1, 1],
    zeroline: false,
    showgrid: false
  },
  yaxis: {
    range: [-1, 1],
    showgrid: false
  },
  width: 650,
  height: 650,
  showgrid: false,
  margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 0
  }
}

function configure_layout_shapes() {
  // console.log(color_of_smith_curves);
  if (color_of_smith_curves == 'bland') {
    color_resistance_real = 'rgba(255, 0, 0, 0.2)';
    color_resistance_imaginary = 'rgba(255, 0, 0,0.3)';
    color_admittance_real = 'rgba(0, 0, 255,0.2)';
    color_admittance_imaginary = 'rgba(0, 0, 255,0.3)';
  } else {
    color_resistance_real = 'rgba(150, 0, 0, 0.2)';
    color_resistance_imaginary = 'rgba(252, 114, 2,0.3)';
    color_admittance_real = 'rgba(255, 0, 250,0.2)';
    color_admittance_imaginary = 'rgba(0, 10, 163,0.3)';
  }

  var shapes_omni = [
    {
      type: 'circle',
      x0: -1,
      y0: -1,
      x1: 1,
      y1: 1,
      line: {
        color: color_resistance_real
      }
    },
  ];

  var shapes_res = [

    ///RESISTANCE CIRCLES
    {
      type: 'circle',
      x0: -0.666,
      y0: -0.833,
      x1: 1,
      y1: 0.833,
      line: {
        color: color_resistance_real
      }
    },
    {
      type: 'circle',
      x0: -0.333,
      y0: -0.666,
      x1: 1,
      y1: 0.666,
      line: {
        color: color_resistance_real
      }
    },
    {
      type: 'circle',
      x0: 0,
      y0: -0.5,
      x1: 1,
      y1: 0.5,
      line: {
        color: color_resistance_real
      }
    },
    {
      type: 'circle',
      x0: 0.333,
      y0: -0.333,
      x1: 1,
      y1: 0.333,
      line: {
        color: color_resistance_real
      }
    },
    {
      type: 'circle',
      x0: 0.6,
      y0: -0.2,
      x1: 1,
      y1: 0.2,
      line: {
        color: color_resistance_real
      }
    },
    {
      type: 'circle',
      x0: 0.818,
      y0: -0.0909,
      x1: 1,
      y1: 0.0909,
      line: {
        color: color_resistance_real
      }
    }
  ];


  ///ADMITTANCE CIRCLES
  var shapes_adm = [
    {
      type: 'circle',
      x0: 0.6,
      y0: -0.8,
      x1: -1,
      y1: 0.8,
      line: {
        color: color_admittance_real
      }
    },
    {
      type: 'circle',
      x0: 0.333,
      y0: -0.666,
      x1: -1,
      y1: 0.666,
      line: {
        color: color_admittance_real
      }
    },
    {
      type: 'circle',
      x0: -1,
      y0: -0.5,
      x1: 0,
      y1: 0.5,
      line: {
        color: color_admittance_real
      }
    },
    {
      type: 'circle',
      x0: -1,
      y0: -0.333,
      x1: -0.333,
      y1: 0.333,
      line: {
        color: color_admittance_real
      }
    },
    {
      type: 'circle',
      x0: -1,
      y0: -0.166,
      x1: -0.666,
      y1: 0.166,
      line: {
        color: color_admittance_real
      }
    },
    {
      type: 'circle',
      x0: -1,
      y0: -0.0909,
      x1: -0.818,
      y1: 0.0909,
      line: {
        color: color_admittance_real
      }
    },
  ];

  ///REACTANCE CIRCLES
  var shapes_rea = [
    {
      type: 'circle',
      x0: 0.9,
      y0: 0,
      x1: 1.1,
      y1: 0.2,
      line: {
        color: color_resistance_imaginary
      }
    },
    {
      type: 'circle',
      x0: 0.8,
      y0: 0,
      x1: 1.2,
      y1: 0.4,
      line: {
        color: color_resistance_imaginary
      }
    },
    {
      type: 'circle',
      x0: 0.5,
      y0: 0,
      x1: 1.5,
      y1: 1,
      line: {
        color: color_resistance_imaginary
      }
    },
    {
      type: 'circle',
      x0: 0,
      y0: 0,
      x1: 2,
      y1: 2,
      line: {
        color: color_resistance_imaginary
      }
    },
    {
      type: 'circle',
      x0: -1,
      y0: 0,
      x1: 3,
      y1: 4,
      line: {
        color: color_resistance_imaginary
      }
    },
    {
      type: 'circle',
      x0: -4,
      y0: 0,
      x1: 6,
      y1: 10,
      line: {
        color: color_resistance_imaginary
      }
    },

    //imaginary
    {
      type: 'circle',
      x0: 0.9,
      y0: 0,
      x1: 1.1,
      y1: -0.2,
      line: {
        color: color_resistance_imaginary
      }
    },
    {
      type: 'circle',
      x0: 0.8,
      y0: 0,
      x1: 1.2,
      y1: -0.4,
      line: {
        color: color_resistance_imaginary
      }
    },
    {
      type: 'circle',
      x0: 0.5,
      y0: 0,
      x1: 1.5,
      y1: -1,
      line: {
        color: color_resistance_imaginary
      }
    },
    {
      type: 'circle',
      x0: 0,
      y0: 0,
      x1: 2,
      y1: -2,
      line: {
        color: color_resistance_imaginary
      }
    },
    {
      type: 'circle',
      x0: -1,
      y0: 0,
      x1: 3,
      y1: -4,
      line: {
        color: color_resistance_imaginary
      }
    },
    {
      type: 'circle',
      x0: -4,
      y0: 0,
      x1: 6,
      y1: -10,
      line: {
        color: color_resistance_imaginary
      }
    }
  ];



  ///SUSCEPTANCE CIRCLES
  var shapes_sus = [
    {
      type: 'circle',
      x0: -1.1,
      y0: 0,
      x1: -0.9,
      y1: 0.2,
      line: {
        color: color_admittance_imaginary
      }
    },
    {
      type: 'circle',
      x0: -1.2,
      y0: 0,
      x1: -0.8,
      y1: 0.4,
      line: {
        color: color_admittance_imaginary
      }
    },
    {
      type: 'circle',
      x0: -1.5,
      y0: 0,
      x1: -0.5,
      y1: 1,
      line: {
        color: color_admittance_imaginary
      }
    },
    {
      type: 'circle',
      x0: -2,
      y0: 0,
      x1: -0,
      y1: 2,
      line: {
        color: color_admittance_imaginary
      }
    },
    {
      type: 'circle',
      x0: -3,
      y0: 0,
      x1: 1,
      y1: 4,
      line: {
        color: color_admittance_imaginary
      }
    },
    {
      type: 'circle',
      x0: -6,
      y0: 0,
      x1: 4,
      y1: 10,
      line: {
        color: color_admittance_imaginary
      }
    },
    //negative
    {
      type: 'circle',
      x0: -1.1,
      y0: 0,
      x1: -0.9,
      y1: -0.2,
      line: {
        color: color_admittance_imaginary
      }
    },
    {
      type: 'circle',
      x0: -1.2,
      y0: 0,
      x1: -0.8,
      y1: -0.4,
      line: {
        color: color_admittance_imaginary
      }
    },
    {
      type: 'circle',
      x0: -1.5,
      y0: 0,
      x1: -0.5,
      y1: -1,
      line: {
        color: color_admittance_imaginary
      }
    },
    {
      type: 'circle',
      x0: -2,
      y0: 0,
      x1: -0,
      y1: -2,
      line: {
        color: color_admittance_imaginary
      }
    },
    {
      type: 'circle',
      x0: -3,
      y0: 0,
      x1: 1,
      y1: -4,
      line: {
        color: color_admittance_imaginary
      }
    },
    {
      type: 'circle',
      x0: -6,
      y0: 0,
      x1: 4,
      y1: -10,
      line: {
        color: color_admittance_imaginary
      }
    },

  ];
  if (!show_circles_adm) shapes_adm = []
  if (!show_circles_adm) shapes_sus = []
  if (!show_circles_res) shapes_res = []
  if (!show_circles_res) shapes_rea = []

  var shapes = [].concat(shapes_res, shapes_sus, shapes_rea, shapes_adm, shapes_omni);
  return shapes;
}


function download2() {
  var myDate = new Date();
  var date = myDate.getDate();
  var month = myDate.getMonth();
  var year = myDate.getFullYear();
  var hour = myDate.getHours();
  var minutes = myDate.getMinutes();
  var seconds = myDate.getSeconds();

  var ddmmyyyy = year + pad(month + 1) + pad(date) + pad(hour) + pad(minutes) + pad(seconds);

  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(schematic, null, "\t")));
  element.setAttribute('download', "online_smith_tool_" + ddmmyyyy + ".json");

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}


//run when resize is finished
function resizedw() {
  update_smith_chart();
}

var doit;
window.onresize = function () {
  clearTimeout(doit);
  doit = setTimeout(resizedw, 200);
};

//functions that are run at startup
update_smith_chart();
drawMakerTable();

//Get a previous state if user requested it
urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('jsonBin')) {
  const jsonBin = urlParams.get('jsonBin')
  readFromJsonBin(jsonBin);
}
