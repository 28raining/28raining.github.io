
document.getElementById('file').addEventListener('change', readFile, false);

function expo(x, f) {
  return Number.parseFloat(x).toExponential(f);
}

function toggle_color_scheme(){
  var element = document.getElementById("mainSection");
  var x = document.getElementsByClassName("bg-white");
  if (x.length > 0){
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

var show_labels_DP=true;
var show_labels_adm=true;
var show_labels_res=true;
var show_circles_adm=true;
var show_circles_res=true;

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

  customMarkers.push({re:real, im:imaginary});

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
  var inner = "<table class='table table-striped'><tr><th>Real</th><th>Imaginary</th><th width='100px'>Name</th><th width='100px'>add/remove</th></tr>"
  inner += "<tr><td><input type='text' id='customMarkerRe'></td><td><input type='text' id='customMarkerIm'></td><td></td><td><button onclick=addCustomMarker()>add</button></td></tr>"
  var i=0;
  for (i=0; i<customMarkers.length; i++) {
    inner += "<tr><td>"+ customMarkers[i].re +"</td><td>"+customMarkers[i].im+"</td><td>MP"+i+"</td><td><button onClick='delCustomMarker("+i+")')>Remove</button></td></tr>"
  }
  table.innerHTML = inner + "</table>";


  //#2nd table
  table = document.getElementById("DPImpedance");
  inner = "<table class='table table-striped'><tr><th>Data Point (DP)</th><th>Real</th><th>Imaginary</th></tr>"
  for (i=0; i<dataPoints.length; i++) {
    inner += "<tr><td>"+(i+1)+"</td><td>"+ dataPoints[i].re +"</td><td>"+dataPoints[i].im+"</td></tr>"
  }
  table.innerHTML = inner + "</table>";
}

function readFile (evt) {
	var files = evt.target.files;
	var file = files[0];           
	var reader = new FileReader();
	reader.onload = function(event) {
		schematic = JSON.parse(event.target.result);
    document.getElementById('freq').value=Number(schematic[0].freq);
    document.getElementById('span').value=Number(schematic[0].span);
		zo=Number(schematic[0].zo);
		document.getElementById('zo').value=zo;
    updateFromDom();
	}
	reader.readAsText(file);
}

// function change_class(this_id) {
// 	document.getElementById(this_id).classList.toggle("active");
// }

domFreq = document.getElementById('freq');
domFreqSel = document.getElementById('freq_sel');
domSpan = document.getElementById('span');
domZo = document.getElementById('zo');
domEr = document.getElementById('er');
function updateFromDom () {
  schematic[0].freq=Number(domFreq.value);
  schematic[0].span=Number(domSpan.value)
  zo=Number(domZo.value); 
  schematic[0].zo=Number(domZo.value);
  schematic[0].er=Number(domEr.value);

  //dropdowns
  if      (domFreqSel.value == 'Hz') schematic[0]['freq_unit'].multiplier = 1;
  else if (domFreqSel.value == 'KHz') schematic[0]['freq_unit'].multiplier = 1e3;
  else if (domFreqSel.value == 'MHz') schematic[0]['freq_unit'].multiplier = 1e6;
  else if (domFreqSel.value == 'GHz') schematic[0]['freq_unit'].multiplier = 1e9;
  else if (domFreqSel.value == 'THz') schematic[0]['freq_unit'].multiplier = 1e12;

  if      (domFreqSel.value == 'Hz') schematic[0]['span_unit'].multiplier = 1;
  else if (domFreqSel.value == 'KHz') schematic[0]['span_unit'].multiplier = 1e3;
  else if (domFreqSel.value == 'MHz') schematic[0]['span_unit'].multiplier = 1e6;
  else if (domFreqSel.value == 'GHz') schematic[0]['span_unit'].multiplier = 1e9;
  else if (domFreqSel.value == 'THz') schematic[0]['span_unit'].multiplier = 1e12;

  update_smith_chart()
}

function updatespan(sch_num, obj, unitIndex=0) {
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
  var vswr=0.0;
  var zo=50;
	//var freq_multiplier=1e6;
	//var span_multiplier=1e6;
  // var is_active=[];
  var precision=3;
  // var start_x_coord=0;
  // var start_y_coord=0;
 //var end_x_coord=0.0;
 // var end_y_coord=0.0;
//var real_old,imag_old=0.0;
	var resolution = 100;
  var span_resolution = 10;
  var fontsize=12;
  var color_of_smith_curves = "colorful";

  //Add custom markers from the user, to help matching to exact impedances
  var customMarkers = [];
  
  schematic.push({type:'raw', zo : 50, freq:2440, er : 1, freq_unit:{unit:'MHz',multiplier:1e6}, span:0.0, span_unit:{unit:'MHz',multiplier:1e6}});
  schematic.push({type:'bb',real:1,imaginary:0,abs:[50,0],unit:'null'});
  
function one_over_complex(real, imaginary) {
	var realn = real/(real*real + imaginary*imaginary);
	var imaginaryn = -imaginary/(real*real + imaginary*imaginary);
	return [realn,imaginaryn];
}

function clicked_cell(type) {
	if (type == "pr") {
		schematic.push({type:'pr',real:0,imaginary:0,abs:[50],unit:['Ω']});
	} else if (type=="sr") {
		schematic.push({type:'sr',real:0,imaginary:0,abs:[50],unit:['Ω']});
	} else if (type=="si") {
		schematic.push({type:'si',real:0,imaginary:0,abs:[1],unit:['nH']});
	} else if (type=="pi") {
		schematic.push({type:'pi',real:0,imaginary:0,abs:[1],unit:['nH']});
	} else if (type=="sc") {
		schematic.push({type:'sc',real:0,imaginary:0,abs:[1],unit:['pF']});
	} else if (type=="pc") {
		schematic.push({type:'pc',real:0,imaginary:0,abs:[1],unit:['pF']});
	} else if (type=="tl") {
		schematic.push({type:'tl',line_length:1e-3,abs:[1],line_zo:50,unit:['mm'],real:0,imaginary:0});
	} else if (type=="ss") {
		schematic.push({type:'ss',line_length:1e-3,abs:[1],line_zo:50,unit:['mm'],real:0,imaginary:0});
	} else if (type=="so") {
		schematic.push({type:'so',line_length:1e-3,abs:[1],line_zo:50,unit:['mm'],real:0,imaginary:0});
	} else if (type=="rc") {
		schematic.push({type:'rc',real:0,imaginary:0,abs:[50,1],unit:['Ω','pF']});
	} else if (type=="rl") {
		schematic.push({type:'rl',real:0,imaginary:0,abs:[50,1],unit:['Ω','nH']});
	} else if (type=="rlc") {
		schematic.push({type:'rlc',real:0,imaginary:0,abs:[50,1,1],unit:['Ω','nH','pF']});
	}
	update_smith_chart();
}

function update_schem_abs(target_num, obj, absCounter) {
  var complex = obj.name;
  // console.log('dbg0',target_num, obj.value, complex)
	switch(schematic[target_num].type) {
		// case ("bb") :
    //   // console.log('dbg1',target_num, obj.value, complex)
		// 	if (complex=="abs") schematic[target_num].abs[absCounter] = Number(obj.value);
    //   // else schematic[target_num].abs_bb_i = Number(obj.value);
		// 	break;
    case ("tl") :
    case ("ss") :
    case ("so") :
			if (complex=="abs") schematic[target_num].abs[absCounter] = Number(obj.value);
			else if (complex=="line_zo") schematic[target_num].line_zo = Number(obj.value);
			break;
		case ("rc") :
		case ("rl") :
		case ("rlc") :
		case ("bb") :
		case ("sr") :
		case ("pr") :
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
		return n<10 ? '0'+n : n
}

function unitTextToNum (unit, freq_here) {
  if      (unit[0][0] == 'f') return 1e-15;
  else if (unit[0][0] == 'p') return 1e-12;
  else if (unit[0][0] == 'n') return 1e-9;
  else if (unit[0][0] == 'u') return 1e-6;
  else if (unit[0][0] == 'm') return 1e-3;	//tl can have unit of meters
  else if (unit[0][0] == 'K') return 1e3;
  else if (unit[0][0] == 'M') return 1e6;
  else if (unit[0][0] == 'λ') return (3e8/freq_here);
  else                        return 1;
}

function update_schem_component(freq_here,save_impedance,sch_index) {
    var re_here = 0;
    var im_here = 0;
    var ln_here = 0;
    var scaler = [];
    var i = 0;
    for (i=0; i<schematic[sch_index].unit.length; i++) {
      scaler[i] = unitTextToNum(schematic[sch_index].unit[i], freq_here);
    }

    switch(schematic[sch_index].type) {
        case ("bb") :
            re_here = (schematic[sch_index].abs[0] / zo);
            im_here = (schematic[sch_index].abs[1] / zo);
            break;
        case ("sr") :
        case ("pr") :
            re_here = (schematic[sch_index].abs[0] * scaler[0]/ zo);
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
            re_here = schematic[sch_index].abs[0] * scaler[0]/ zo;
            im_here = ((schematic[sch_index].abs[1] * scaler[1] * 2 * Math.PI * freq_here) - (1 / (schematic[sch_index].abs[2] * scaler[2] * 2 * Math.PI * freq_here))) / zo;
            break;
        case ("rl"):
            re_here = schematic[sch_index].abs[0] * scaler[0]/ zo;
            im_here = ((schematic[sch_index].abs[1] * scaler[1] * 2 * Math.PI * freq_here)) / zo;
            break;
        case ("rc"):
            re_here = schematic[sch_index].abs[0] * scaler[0]/ zo;
            im_here =  - (1 / (schematic[sch_index].abs[1] * scaler[1] * 2 * Math.PI * freq_here)) / zo;
            break;
        case ("tl"):
        case ("ss") :
        case ("so") :
            ln_here = schematic[sch_index].abs[0] * scaler[0];
            break;
    }
    
    if (save_impedance) {
        if ((Math.abs(re_here) < 0.1) && (re_here != 0)) schematic[sch_index].real = expo(re_here,2);
        else schematic[sch_index].real = Number(re_here).toPrecision(precision);
        
        if ((Math.abs(im_here) < 0.1) && (im_here != 0)) schematic[sch_index].imaginary = expo(im_here,2);
        else schematic[sch_index].imaginary = Number(im_here).toPrecision(precision);

        schematic[sch_index].line_length = ln_here;
    }

    return [re_here,im_here,ln_here]
		//}
	//}
	//schematic[i].imaginary = schematic[i].imaginary.toFixed(2);
	//schematic[i].real = schematic[i].imaginary.real(2);
	//update_smith_chart();
}

function update_smith_chart() {
  //Update the layout variable
  layout.shapes = configure_layout_shapes();
  //Calculate and verify freqeuencies...
  freq = schematic[0].freq * schematic[0].freq_unit.multiplier;
  span_freq = schematic[0].span * schematic[0].span_unit.multiplier;
  //console.log(schematic[0].freq * schematic[0].freq_unit.multiplier,schematic[0].span * schematic[0].span_unit.multiplier)
  if (freq < span_freq) {
    swal({
      type: 'error',
      title: 'Oops...',
      text: 'Span is larger than frequency, this will result in -ve frequencies and is not allowed..."',
      footer: '<a href>Reduce your span frequency</a>'
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
  var x0,x1,y0,y1;
  
  //update black box
  update_schem_component(freq,true,1);
  var schemEl = document.getElementById("schematic");
  schemEl.innerHTML="";
  var newDiv = draw_schematic(1);
  schemEl.appendChild(newDiv);

	for (var i= 0; i <= span_res*2; i++) {
		span_impedance_re[i] = Number(schematic[1].real);
		span_impedance_im[i] = Number(schematic[1].imaginary);
  }    
	
  dataPoints = [];
	for (var i = 2; i < schematic.length; i++) {
		//Add the arc to the smith chart
        for (sp = 0; sp <= 2*span_res; sp++) {
            //frequency at this point in the frequency span
            if (span_res==0) frequency_at_sp = freq;
            else frequency_at_sp = freq + (span_freq * (sp-span_res)/span_res)

            //calcuate re and im values of component at this frequency
            //if sp offset is at the original frequency, calculate a lot more points
            if (sp == span_res) {
                num_points = resolution;
                var temp_array = update_schem_component(frequency_at_sp,true,i)
            } else {
                num_points = 1;
                var temp_array = update_schem_component(frequency_at_sp,false,i)
            }
            var re = Number(temp_array[0]);
            var im = Number(temp_array[1]);
            var ln_length = Number(temp_array[2]);

            var temp_trace = {}
            var x_points, y_points;
            var start=[];
            var start_impedance=[];

            if ((schematic[i].type=='ss') || (schematic[i].type=='so')) {
              //if the stub is longer than 0.5 waves then there is a full circle. Trim to 1 wave so user can see if there are multiple loops
              var wave_length = 3e8 / (frequency_at_sp*Math.sqrt(schematic[0].er));
              //if (ln_length>wave_length) ln_length = wave_length + ln_length % wave_length;   
              //for "ss" matching, can't assume that we start at 0 length
              if (ln_length<(0.5*wave_length)) var start_at_qtr_wl = wave_length/4;
              else start_at_qtr_wl = 0;
              start_impedance[0]=span_impedance_re[sp];
              start_impedance[1]=span_impedance_im[sp];
              start = one_over_complex(span_impedance_re[sp],span_impedance_im[sp]);
              var temp_array = arc_smith_points(start[0],start[1],ln_length,schematic[i].line_zo,schematic[i].type,true,2*Math.PI*frequency_at_sp*Math.sqrt(schematic[0].er)/3e8,start_at_qtr_wl);
              var schem_inv = one_over_complex(temp_array[4],temp_array[5]);
              span_impedance_re[sp] = schem_inv[0];
              span_impedance_im[sp] = schem_inv[1];

            } else if ((schematic[i].type[0]=='p') || (schematic[i].type=='rlc') || (schematic[i].type=='rc') || (schematic[i].type=='rl')) {
              //For parallel elements plotted on rotated graph....
              start_impedance[0]=span_impedance_re[sp];
              start_impedance[1]=span_impedance_im[sp];
              start = one_over_complex(span_impedance_re[sp],span_impedance_im[sp]);
              var schem_inv = one_over_complex(re,im);
              var temp_array = arc_smith_points(start[0],start[1],start[0]+schem_inv[0],start[1]+schem_inv[1],schematic[i].type,true);
              var schem_inv = one_over_complex(start[0]+schem_inv[0],start[1]+schem_inv[1]);
              span_impedance_re[sp] = schem_inv[0];
              span_impedance_im[sp] = schem_inv[1];
            } else if ((schematic[i].type[0]=='s') || (schematic[i].type[0]=='b')) {
              //For series elements plotted on normal curves....
              start_impedance[0] = span_impedance_re[sp];
              start_impedance[1] = span_impedance_im[sp];
              var temp_array = arc_smith_points(span_impedance_re[sp],span_impedance_im[sp],re+span_impedance_re[sp],im+span_impedance_im[sp],"impedance",false);
              span_impedance_re[sp] = span_impedance_re[sp] + re;
              span_impedance_im[sp] = span_impedance_im[sp] + im;
            } else if (schematic[i].type=='tl') {
              //For transmission lines...
              start_impedance[0] = span_impedance_re[sp];
              start_impedance[1] = span_impedance_im[sp];
              var temp_array = arc_smith_points(span_impedance_re[sp],span_impedance_im[sp],ln_length,schematic[i].line_zo,"transmission_line",false,2*Math.PI*frequency_at_sp*Math.sqrt(schematic[0].er)/3e8);
              span_impedance_re[sp] = temp_array[4];
              span_impedance_im[sp] = temp_array[5];
            }

            //If at original frequency, save and plot the data points
            if (sp == span_res) {
                x_points=temp_array[0];
                y_points=temp_array[1];
                end_x_coord=temp_array[2];
                end_y_coord=temp_array[3];
                real_old = span_impedance_re[sp];
                imag_old = span_impedance_im[sp];
                var start_x_coord = temp_array[6];
                var start_y_coord = temp_array[7];
                temp_trace = {
                    x: x_points,
                    y: y_points,
                    line: {
                        color: 'rgb(0, 0, 0)',
                        width: 4
                    },
                    mode: 'lines',
                    type: 'scatter'
                };
                trace[i-2]=temp_trace;
            
                //add a data point rectangle to the smith chart
                dataPoints.push({'re': (zo*Number(start_impedance[0])).toPrecision(3), 'im': (zo*Number(start_impedance[1])).toPrecision(3)});
                if (show_labels_DP) {
                  layout_shapes.push({type: "rectangle", x0:Number(start_x_coord)-0.01,y0:Number(start_y_coord)-0.01,x1:Number(start_x_coord)+0.01,y1:Number(start_y_coord)+0.01});
                  textbox_trace.push({x:[Number(start_x_coord)+0.04],y:[Number(start_y_coord)-0.03],text:["DP"+(i-1)],mode:'text'});
                }
            }
        }
        newDiv = draw_schematic(i);
        schemEl.appendChild(newDiv);
	}
	
  //If only the black box exists...
	if (schematic.length == 2) {
    temp_array = []
    temp_array = find_smith_coord(schematic[1].real,schematic[1].imaginary,false);
    real_old = schematic[1].real;
    imag_old = schematic[1].imaginary;
		end_x_coord=temp_array[0];
		end_y_coord=temp_array[1];
  }


  
    //Create rectangles indicating end data points
  dataPoints.push({'re': (zo*Number(real_old)).toPrecision(3), 'im': (zo*Number(imag_old)).toPrecision(3)});
  if (show_labels_DP) {
    layout_shapes.push({type: "rectangle", x0:Number(end_x_coord)-0.01,y0:Number(end_y_coord)-0.01,x1:Number(end_x_coord)+0.01,y1:Number(end_y_coord)+0.01});
    textbox_trace.push({x:[Number(end_x_coord)+0.04],y:[Number(end_y_coord)-0.03],text:["DP"+(i-1)],mode:'text'});
  }

  //Update the impedance box
	var txt = "<div class=\"text_box\">";
	txt += (real_old*zo).toPrecision(3);
	if (imag_old < 0) txt += " - ";
	else txt += " + ";
	txt += Math.abs(imag_old*zo).toPrecision(3) + "j</div>";
	document.getElementById("current_impedance").innerHTML = txt;
	
	//Calculate the admittance
	var admittance_real,admittance_imaginary;
	temp_array =  one_over_complex(real_old*zo,imag_old*zo);
	admittance_real=temp_array[0];
	admittance_imaginary=temp_array[1];
	txt = "<div class=\"text_box\">"+(admittance_real).toPrecision(3);
	if (admittance_imaginary < 0) txt += " - ";
	else txt += " + ";
	txt += Math.abs(admittance_imaginary).toPrecision(3) + "j</div>";
  document.getElementById("current_admittance").innerHTML = txt
	
	//Calculate the reflection coefficient -current_admittance (zo-zimp) / (zo+zimp)
	var bot_real,bot_imag;
  temp_array = one_over_complex(real_old*zo + zo,imag_old*zo);
	bot_real= temp_array[0];
	bot_imag = temp_array[1];
	var reflectio_coeff_real = ((real_old*zo - zo) * bot_real) - ((imag_old*zo)*bot_imag);
	var reflectio_coeff_imag = ((imag_old*zo) * bot_real) + ((real_old*zo - zo) * bot_imag);
	txt = "<div class=\"text_box\">"+(reflectio_coeff_real).toPrecision(3);
	if (reflectio_coeff_imag < 0) txt += " - ";
	else txt += " + ";
	txt += Math.abs(reflectio_coeff_imag).toPrecision(3) + "j</div>";
	document.getElementById("current_reflection").innerHTML = txt;
	
	//plot reflection coefficient magnitude
  //console.log(reflectio_coeff_imag,reflectio_coeff_real);
  var reflection_mag = Math.sqrt((reflectio_coeff_real*reflectio_coeff_real)+(reflectio_coeff_imag*reflectio_coeff_imag));
	txt = "<div class=\"text_box\">"+reflection_mag.toPrecision(3);
  txt += " &ang; ";
  if (reflectio_coeff_real == 0)  var reflection_phase = 0;
  else  var reflection_phase = 360*Math.atan(reflectio_coeff_imag/reflectio_coeff_real)/(2*Math.PI);
  if (reflectio_coeff_real < 0) reflection_phase += 180;
	txt += (reflection_phase).toPrecision(3) + "&deg; </div>";
	document.getElementById("current_reflection_mag").innerHTML = txt;
	
  //calculate VSWR (1+r) / (1-r)
  var vswr_live = (1+reflection_mag)/(1-reflection_mag);
  document.getElementById("vswr_live").innerHTML = "<div class=\"text_box\">"+vswr_live.toPrecision(3)+"</div>"; 


	//redefine the labels in case zo has changed
	define_labels();

  //draw span curve
  var sp_coord_x=[],sp_coord_y=[];
  var refl_mag=[], refl_phase=[];
  var temp_refl_re, temp_refl_im, temp_refl_ph;
  for (i=0; i<span_impedance_re.length;i++) {
      sp_coord = find_smith_coord(span_impedance_re[i],span_impedance_im[i],false);
      sp_coord_x.push(sp_coord[0]);
      sp_coord_y.push(sp_coord[1]);

      temp_array = one_over_complex(span_impedance_re[i]*zo + zo,span_impedance_im[i]*zo);
      bot_real= temp_array[0];
      bot_imag = temp_array[1];
      temp_refl_re = ((span_impedance_re[i]*zo - zo) * bot_real) - ((span_impedance_im[i]*zo)*bot_imag);
      temp_refl_im = ((span_impedance_im[i]*zo) * bot_real) + ((span_impedance_re[i]*zo - zo) * bot_imag);
      refl_mag.push(Number(Math.sqrt((temp_refl_re*temp_refl_re)+(temp_refl_im*temp_refl_im))));
      if (temp_refl_re == 0)  var temp_refl_ph = 0;
      else  var temp_refl_ph = 360*Math.atan(temp_refl_im/temp_refl_re)/(2*Math.PI);
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

        layout_shapes.push({type: "rectangle", x0:Number(sp_coord_x[0])-0.01,y0:Number(sp_coord_y[0])-0.01,x1:Number(sp_coord_x[0])+0.01,y1:Number(sp_coord_y[0])+0.01});
        textbox_trace.push({x:[Number(sp_coord_x[0])-x_off],y:[Number(sp_coord_y[0])-y_off],text:["F-span"],mode:'text'});
  
        layout_shapes.push({type: "rectangle", x0:Number(sp_coord_x[span_impedance_re.length-1])-0.01,y0:Number(sp_coord_y[span_impedance_re.length-1])-0.01,x1:Number(sp_coord_x[span_impedance_re.length-1])+0.01,y1:Number(sp_coord_y[span_impedance_re.length-1])+0.01});
        textbox_trace.push({x:[Number(sp_coord_x[span_impedance_re.length-1])+x_off],y:[Number(sp_coord_y[span_impedance_re.length-1])+y_off],text:["F+span"],mode:'text'});  
  }
  //console.log(span_impedance_re,span_impedance_im,span_trace)

  //Add custom markers so user can specify specific impedances which they could aim for
  for (i=0; i<customMarkers.length; i++) {
    sp_coord = find_smith_coord(customMarkers[i].re/zo,customMarkers[i].im/zo,false);
    x = Number(sp_coord[0]);
    y = Number(sp_coord[1]);
    layout_shapes.push({type: "circle", line: {color: 'red'}, x0:x-0.01,y0:y-0.01,x1:x+0.01,y1:y+0.01});
	  textbox_trace.push({x:[x+0.06],y:[y],text:["MP"+i],mode:'text'});
  }
  
  //Add a VSWR circle, which is a new circle centered in the middle of the Smith Chart, with radius defined by VSWR
  if (vswr != 0.0) {
    //get coord of middle of smith chart (could search in the code but I'm lazy)
    center_coord = find_smith_coord(1,0,false);
    //get the radius of the VSWR 
    vswr_rad = find_smith_coord(vswr,0,false);
    x0 = 2*Number(center_coord[0]) - Number(vswr_rad[0]);
    x1 = Number(vswr_rad[0]);
    y0 = Number(vswr_rad[0]);
    y1 = 2*Number(center_coord[1])-Number(vswr_rad[0]);
    if (color_of_smith_curves == 'colorful') var vswr_color = 'lime'
    else var vswr_color = 'green';
    layout_shapes.push({type: "circle", line: {color: vswr_color}, x0:x0,y0:y0,x1:x1,y1:y1});
  }
	
	var data = trace.concat(textbox_trace,trace_im_neg,trace_im_pos,trace_real,trace_adm,trace_sus_pos,trace_sus_neg,span_trace);

	//console.log(data, layout, layout_shapes);
  var exWidth = document.getElementById("myDiv").offsetWidth
  // var exWidth = document.getElementById("myDiv").offsetWidth
  var PlLayout = {
    paper_bgcolor: 'rgba(255,255,255,0.2)', 
    plot_bgcolor: 'rgba(255,255,255,0.0)', 
    showlegend: false,
    margin:layout.margin, 
    height:exWidth,
    width:exWidth,
    hovermode:layout.hovermode,
    xaxis:layout.xaxis,
    yaxis:layout.yaxis,
    shapes:layout.shapes.concat(layout_shapes)
  };
  var config = {
    displayModeBar: false, // this is the line that hides the bar.
  };
	Plotly.react('myDiv', data, PlLayout, config);	
  



  var data_polar = [
    {
      type: "scatterpolargl",
      r: [Number(reflection_mag)],
      theta: [reflection_phase],
      marker: {
        color: "black",
        symbol: "square",
        size: 8
      },
      subplot: "polar"
    }
  ]

  for(i=0;i<refl_mag.length;i++){
    data_polar.push(
      {
        type: "scatterpolargl",
        r: [refl_mag[i]],
        theta: [refl_phase[i]],
        marker: {
          color: 'rgb(200, 0, 0)',
          symbol: "circle",
          size: 4
        },
        subplot: "polar"
      }
    )
  }

  var polarWidth = document.getElementById("smith_polar").offsetWidth
  layout_polar.width = polarWidth;
  layout_polar.height = polarWidth;
  Plotly.react('PolarPlot', data_polar, layout_polar, config)
  

  //update the HTML tables
  drawMakerTable();


}

// function createAbsBox(i,content) {
//   return "<div class=\"abs_box\"><input type=\"text\" value="+schematic[i].abs+" onchange=\"update_schem_abs("+i+",this,'abs')\"></input>" + content + "</div>";
// }

// function createDropdown (i,unit, unitIndex=0) {
//   //Add units selector
//   var content = "<div id=\"sch_"+i+"_"+unitIndex+"\" class=\"wrapper-dropdown-5 \" tabindex=\"1\"><div>"+schematic[i].unit[unitIndex]+"</div><ul class=\"dropdown\">";
//   for (j=0;j<unit.length;j++) {
//     content += "<li onclick=\"updatespan(parentElement.parentElement.id,'"+unit[j]+"',"+unitIndex+")\"><a href=\"#\">"+unit[j]+"</a></li>";
//   }
//   content +="</ul></div>";
//   return createAbsBox(i,content);
// }

function draw_schematic(i) {

    //Add the element to the schematic view
    var div = document.createElement("div");
    unit=[];
    div.setAttribute('class', 'col-6 col-lg-2 g-0');
    //Add a close button, but can't remove black boxes...
    var innerText = ""
    // if (schematic[i].type!='bb') div.innerHTML += "<div class=\"rem\" onclick=\"schematic.splice("+i+",1); update_smith_chart()\"><div class=\"dp_txt\">DP"+i+"</div><div class=\"close-button\"></div></div>";
    // else div.innerHTML += "<div class=\"rem\">DP"+i+"</div>"; 
    if (schematic[i].type!='bb') innerText += '<div class="row me-2 ms-2" style="height: 26px;"><div class="col"><small>DP'+i+'</small></div><div class="col text-end"><button type="button" class="btn-close" onclick="schematic.splice('+i+',1); update_smith_chart()"></button></div></div>'
    else innerText += '<div class="row me-2 ms-2" style="height: 26px;"><small>DP'+i+'</small></div>';
    var rows_to_create = []
    switch(schematic[i].type) {
        case ("bb") :
            sch_label="Black Box";
            sch_imag=true;
            sch_real=true;
            sch_abs=true;
            sch_icon="black_box";
            sch_svg=0;
            rows_to_create = [['abs','abs'],['Impedance']];
            break;
        case ("pr") :
            rows_to_create = [['abs','unit_0'],['Impedance']];
            sch_label="Parallel Resistor";
            sch_imag=false;
            sch_real=true;
            sch_abs=true;
            unit = [['mΩ','Ω','KΩ','MΩ']];
            sch_icon="resistor_parallel";
            sch_svg=2500;
            break;
        case ("sr") :
            rows_to_create = [['abs','unit_0'],['Impedance']];
            sch_label="Series Resistor";
            sch_imag=false;
            sch_real=true;
            sch_abs=true;
            unit = [['mΩ','Ω','KΩ','MΩ']];
            sch_icon="resistor_series";
            sch_svg=3000;
            break;
        case ("pc") :
            rows_to_create = [['abs','unit_0'],['Impedance']];
            sch_label="Parallel Capacitor";
            sch_imag=true;
            sch_real=false;
            sch_abs=true;
            unit = [['mF','uF','nF','pF','fF']];
            sch_icon="capacitor_parallel";
            sch_svg=500;
            break;
        case ("sc") :
            rows_to_create = [['abs','unit_0'],['Impedance']];
            sch_label="Series Capacitor";
            sch_imag=true;
            sch_real=false;
            sch_abs=true;
            unit = [['mF','uF','nF','pF','fF']];
            sch_icon="capacitor_series";
            sch_svg=1000;
            break;
        case ("pi") :
            rows_to_create = [['abs','unit_0'],['Impedance']];
            sch_label="Parallel Inductor";
            sch_imag=true;
            sch_real=false;
            sch_abs=true;
            unit = [['H','mH','uH','nH','pH']];
            sch_icon="inductor_parallel";
            sch_svg=1500;
            break;
        case ("si") :
            rows_to_create = [['abs','unit_0'],['Impedance']];
            sch_label="Series Inductor";
            sch_imag=true;
            sch_real=false;
            sch_abs=true;
            unit = [['H','mH','uH','nH','pH']];
            sch_icon="inductor_series";
            sch_svg=2000;
            break;
        case ("tl") :
            rows_to_create = [['abs','unit_0'],['line_zo']];
            sch_label="Transmission Line";
            sch_imag=false;
            sch_real=false;
            sch_abs=true; //is actually length
            unit = [[' m','mm','um','λ']];
            sch_icon="transmission_line";
            sch_svg=3500;
            break;
        case ("ss") :
            rows_to_create = [['abs','unit_0'],['line_zo']];
            sch_label="Short Stub";
            sch_imag=false;
            sch_real=false;
            sch_abs=true; //is actually length
            unit = [[' m','mm','um','λ']];
            sch_icon="stub_short";
            sch_svg=4500;
            break;
        case ("so") :
            rows_to_create = [['abs','unit_0'],['line_zo']];
            sch_label="Open Stub";
            sch_imag=false;
            sch_real=false;
            sch_abs=true; //is actually length
            unit = [[' m','mm','um','λ']];
            sch_icon="stub_open";
            sch_svg=4000;
            break
        case ("rc") :
            rows_to_create = [['abs','unit_0'],['abs','unit_1'],['Impedance']];
            sch_label="Capacitor w/ ESR";
            sch_imag=true;
            sch_real=true;
            sch_abs=true;
            unit = [['mΩ','Ω','KΩ','MΩ'],['mF','uF','nF','pF','fF']];
            sch_icon="black_box";
            sch_svg=5000;
            break;
        case ("rl") :
            rows_to_create = [['abs','unit_0'],['abs','unit_1'],['Impedance']];
            sch_label="Inductor w/ ESR";
            sch_imag=true;
            sch_real=true;
            sch_abs=true;
            unit = [['mΩ','Ω','KΩ','MΩ'],['H','mH','uH','nH','pH']];
            sch_icon="black_box";
            sch_svg=5500;
            break;
        case ("rlc") :
            rows_to_create = [['abs','unit_0'],['abs','unit_1'],['abs','unit_2'],['Impedance']];
            sch_label="Inductor w/ ESR";
            sch_imag=true;
            sch_real=true;
            sch_abs=true;
            unit = [['mΩ','Ω','KΩ','MΩ'],['H','mH','uH','nH','pH'],['mF','uF','nF','pF','fF']];
            sch_icon="black_box";
            sch_svg=6000;
            break;
    }
    //div.innerHTML = "<p>"+sch_label+"</p>";
    // div.innerHTML += "<img src=\"icons/"+sch_icon+".png\" alt="+sch_label+">";
    innerText += '<div class="row"><svg viewBox="'+sch_svg+' 0 500 500"><use xlink:href="svg/elements.svg#rainbow3" alt='+sch_label+' /></svg></div>';

    var cntR, cntC, ittUnit, boxType, varSelect, unitIndex;
    var absCounter = 0;
    for (cntR=0; cntR<rows_to_create.length; cntR++){
      innerText += '<div class="row ms-3 me-3"><div class="input-group mb-1 p-0">'
      for (cntC=0; cntC<rows_to_create[cntR].length;cntC++) {
        boxType = rows_to_create[cntR][cntC];
        if (boxType == 'Impedance') {
          innerText += '<div class="row ms-3">Impedance = '
          if (sch_real) innerText += Number(((schematic[i].real*zo)).toPrecision(precision))
          if (sch_real && sch_imag) {
            if (schematic[i].imaginary*zo >= 0) innerText += ' + '
            else innerText += ' - '
          }
          if (sch_imag) innerText += Number((Math.abs(schematic[i].imaginary*zo)).toPrecision(precision)) + 'j'
          innerText += '</div>'
        } else if (boxType == 'line_zo') {
          innerText += '<span class="input-group-text">Zo = </span>'
          innerText += '<input type="text" class="form-control" value='+schematic[i][boxType]+' name="'+boxType+'" onchange="update_schem_abs('+i+',this,0)">'
        } else if ((boxType == 'unit_0') || (boxType == 'unit_1') || (boxType == 'unit_2')) {
          unitIndex = boxType.split('_')[1];
          innerText += '<select class="form-select" onchange="updatespan('+i+', this, '+unitIndex+')">'
          for (ittUnit=0; ittUnit<unit[unitIndex].length; ittUnit++) {
            if (unit[unitIndex][ittUnit] == schematic[i].unit[unitIndex]) varSelect = "selected"
            else varSelect = ""
            innerText += '<option value='+unit[unitIndex][ittUnit]+' '+varSelect+'>'+unit[unitIndex][ittUnit]+'</option>'
          }
          innerText += '</select>'
        } else {
          if (cntC>0) innerText += '<span class="input-group-text">+</span>'
          innerText += '<input type="text" class="form-control" value='+schematic[i][boxType][absCounter]+' name="'+boxType+'" onchange="update_schem_abs('+i+',this,'+absCounter+')">'
          if (cntC>0) innerText += '<span class="input-group-text">j</span>'
          if (boxType == 'abs') absCounter=absCounter+1;
        }
      }
      innerText += '</div></div>'
    }

    div.innerHTML = innerText;
    return div;
    // console.log("appending this:", div)
    // document.getElementById("schematic").appendChild(div);


}

var trace_im_neg,trace_im_pos,trace_real,trace_adm,trace_sus_pos,trace_sus_neg = {};

function define_labels () {

  trace_im_neg = {};
  trace_im_pos ={};
  trace_real={}; 
  trace_adm ={}; 
  trace_sus_pos={};
  trace_sus_neg = {};

  // console.log(color_of_smith_curves);
  if (color_of_smith_curves == 'bland') {
    color_im =   'rgba(0, 0, 0,0.5)';
    color_real = 'rgba(0, 0, 0,0.5)';
    color_adm =  'rgba(0, 0, 0,0.3)';
    color_sus =  'rgba(0, 0, 0,0.3)';
  } else {
    color_im = 'rgba(252, 114, 2,0.5)';
    color_real = 'rgba(150, 0, 0,0.5)';
    color_adm = 'rgba(0, 10, 163,0.3)';
    color_sus = 'rgba(255, 0, 250,0.3)';
  }

  if (show_labels_res) {
    trace_im_pos = {
      x: [0.95,0.9,0.63,0.05,-0.54,-0.86],
      y: [0.14,0.33,0.73,0.95,0.8,0.4],
      text: ["<b>"+10*zo+"</b>","<b>"+5*zo+"</b>","<b>"+2*zo+"</b>","<b>"+1*zo+"</b>","<b>"+0.5*zo+"</b>","<b>"+0.2*zo+"</b>"],
      mode: 'text',
      textfont: {
        color: color_im,
        size:fontsize
      }
    };

    trace_im_neg = {
      x: [0.95,0.9,0.63,0.05,-0.54,-0.86],
      y: [-0.14,-0.33,-0.73,-0.95,-0.8,-0.4],
      text: ["<b>"+10*zo+"</b>","<b>"+5*zo+"</b>","<b>"+2*zo+"</b>","<b>"+1*zo+"</b>","<b>"+0.5*zo+"</b>","<b>"+0.2*zo+"</b>"],
      mode: 'text',
      textfont: {
        color: color_im,
        size:fontsize
      }
    };
  }

  if (show_labels_res) {

    trace_real = {
      x: [0.96,0.88,0.66,0.38,0.05,-0.29,-0.62,-0.98],
      y: [0.03,0.03,0.03,0.03,0.03,0.03,0.03,0.03,0.03],
      text: ["<b>∞</b>","<b>"+10*zo+"</b>","<b>"+4*zo+"</b>","<b>"+2*zo+"</b>","<b>"+1*zo+"</b>","<b>"+0.5*zo+"</b>","<b>"+0.2*zo+"</b>","<b>0</b>"],
      mode: 'text',
      textfont: {
        color: color_real,
        size:fontsize
      }
    };
  }
  if (show_labels_adm) {
    trace_adm = {
      x: [0.53,0.26,-0.07,-0.4,-0.74,-0.88],
      y: [-0.03,-0.03,-0.03,-0.03,-0.03,-0.03,-0.03],
      text: ["<b>"+(1000/4/zo).toPrecision(3)+"</b>m","<b>"+(1000/2/zo).toPrecision(3)+"</b>m","<b>"+(1000/zo).toPrecision(3)+"</b>m","<b>"+(1000*2/zo).toPrecision(3)+"</b>m","<b>"+(1000*5/zo).toPrecision(3)+"</b>m","<b>"+(1000*10/zo).toPrecision(3)+"</b>m"],
      mode: 'text',
      textfont: {
        color: color_adm,
        size:fontsize
      }
    };
  }

  if (show_labels_adm) {
    trace_sus_pos = {
      x: [0.86,0.53,-0.07,-0.62,-0.89,-0.92],
      y: [0.4,0.79,0.97,0.72,0.31,0.15],
      text: ["<b>"+(1000/5/zo).toPrecision(3)+"</b>m","<b>"+(1000/2/zo).toPrecision(3)+"</b>m","<b>"+(1000/zo).toPrecision(3)+"</b>m","<b>"+(1000*2/zo).toPrecision(3)+"</b>m","<b>"+(1000*5/zo).toPrecision(3)+"</b>m","<b>"+(1000*10/zo).toPrecision(3)+"</b>m"],
      mode: 'text',
      textfont: {
        color: color_sus,
        size:fontsize
      }
    };

    trace_sus_neg = {
      x: [0.86,0.53,-0.07,-0.62,-0.89,-0.92],
      y: [-0.4,-0.79,-0.97,-0.72,-0.31,-0.15],
      text: ["<b>"+(1000/5/zo).toPrecision(3)+"</b>m","<b>"+(1000/2/zo).toPrecision(3)+"</b>m","<b>"+(1000/zo).toPrecision(3)+"</b>m","<b>"+(1000*2/zo).toPrecision(3)+"</b>m","<b>"+(1000*5/zo).toPrecision(3)+"</b>m","<b>"+(1000*10/zo).toPrecision(3)+"</b>m"],
      mode: 'text',
      textfont: {
        color: color_sus,
        size:fontsize
      }
    };
  }
}

//function intersectTwoCircles(x1,y1,r1, x2,y2,r2) {
// Finds the intersection between two circles, one with magnitude 'real', the other with 'imaginary'
function find_smith_coord(real,imaginary,rotate) {

  //to prevent divide by zero errors...
	if (imaginary > 0) imaginary = Math.max(imaginary,0.001);
	else 			   imaginary = Math.min(imaginary,-0.001);
  real = Math.max(real,0.001);
  
	if (rotate==true) {
		var realn = real/(real*real + imaginary*imaginary);
		var imaginaryn = imaginary/(real*real + imaginary*imaginary);
		//window.alert([real,imaginary,realn,imaginaryn]);
		real = realn;
		imaginary = imaginaryn;
  }

  //to prevent weird anomolys in the plot
	if (imaginary > 0) imaginary = Math.max(imaginary,0.001);
	else 			   imaginary = Math.min(imaginary,-0.001);
  real = Math.max(real,0.001);
	
	//window.alert([realn,imaginaryn]);

  
  if (rotate==true) var x1 = -real / (real+1);
  else		 var x1 = real / (real+1);
  var y1 = 0;
  var r1 = 1 / (real+1)
  if (rotate==true) var x2 = -1;
  else 		 var x2 = 1;
  var y2 = 1 / imaginary;
  var r2 = 1 / Math.abs(imaginary);
  
  var centerdx = x1 - x2;
  var centerdy = y1 - y2;
  var R = Math.sqrt(centerdx * centerdx + centerdy * centerdy);
  if (!(Math.abs(r1 - r2) <= R && R <= r1 + r2)) { // no intersection
    return []; // empty list of results
  }
  // intersection(s) should exist

  var R2 = R*R;
  var R4 = R2*R2;
  var a = (r1*r1 - r2*r2) / (2 * R2);
  var r2r2 = (r1*r1 - r2*r2);
  var c = Math.sqrt(2 * (r1*r1 + r2*r2) / R2 - (r2r2 * r2r2) / R4 - 1);

  var fx = (x1+x2) / 2 + a * (x2 - x1);
  var gx = c * (y2 - y1) / 2;
  var ix1 = (fx + gx).toFixed(5);
  var ix2 = (fx - gx).toFixed(5);

  var fy = (y1+y2) / 2 + a * (y2 - y1);
  var gy = c * (x1 - x2) / 2;
  var iy1 = (fy + gy).toFixed(5);
  var iy2 = (fy - gy).toFixed(5);
  
  if (iy1 == 0) {  iy = iy2; ix=ix2; }
  else {  iy = iy1; ix=ix1; }

  // note if gy == 0 and gx == 0 then the circles are tangent and there is only one solution
  // but that one solution will just be duplicated as the code is currently written
  if (rotate==true) { iy=-iy, ix=-ix; };

  return [ix, iy];
}
//plots an arc with 'resolution' points between previous impedance x1,y1 and next impedance x2,y2
function arc_smith_points(x1,y1,x2,y2,type,rotate,beta,start_at_qtr_wl) {
	
	var x_coord=[];
  var y_coord=[];
  var end_x_coord = 0;
  var end_y_coord = 0;
	var temp_array=[];
	temp_array=find_smith_coord(x1, y1,rotate);
	var start_x_coord=temp_array[0];
  var start_y_coord=temp_array[1];
  var real_old = 0;
  var imag_old = 0;
  var tan_beta=0;
  var stub_admittance_im=0;

	//used for transmission lines and stubs
  var line_zo=y2;
  var line_length=x2;
  var top_real_temp = x1 * line_zo;
	
	for (i=0;i<resolution+1;i++) {
		if (type == "transmission_line") {
			tan_beta = Math.tan(beta * i*line_length/resolution);
			var top_imag_temp = (y1*zo + line_zo*tan_beta)* line_zo/zo;
			var bot_real_temp = line_zo-y1*tan_beta*zo;
			var bot_imag_temp = x1*tan_beta*zo;
			var temp_array=one_over_complex(bot_real_temp,bot_imag_temp);
			var bot_real=temp_array[0];
			var bot_imag=temp_array[1];
			var real_answer = (top_real_temp*bot_real)-(top_imag_temp*bot_imag);
			var imag_answer = (top_real_temp*bot_imag)+(top_imag_temp*bot_real);
			temp_array=find_smith_coord(real_answer,imag_answer,rotate);
			x_coord[i]=temp_array[0];
      y_coord[i]=temp_array[1];

    } else if (type=="ss") {
      if (start_at_qtr_wl==0) tan_beta = Math.tan(beta * i*line_length/resolution);
      else tan_beta = Math.tan(beta * (start_at_qtr_wl + i*(line_length-start_at_qtr_wl)/resolution));
      stub_admittance_im = -1/(tan_beta*line_zo/zo);
      temp_array=find_smith_coord(x1, y1 + stub_admittance_im,rotate);
      x_coord[i]=temp_array[0];
      y_coord[i]=temp_array[1];
    } else if (type=="so") {
      tan_beta = Math.tan(beta * i*line_length/resolution);
      stub_admittance_im = tan_beta/(line_zo/zo);
      temp_array=find_smith_coord(x1, y1 + stub_admittance_im,rotate);
      x_coord[i]=temp_array[0];
      y_coord[i]=temp_array[1];
 		} else {
      temp_array=find_smith_coord(x1 + (x2-x1)*i/resolution, y1 + (y2-y1)*i/resolution,rotate);
      x_coord[i]=temp_array[0];
      y_coord[i]=temp_array[1];
		}	
  }
	
	if (type == "transmission_line")  {
		temp_array=find_smith_coord(real_answer,imag_answer,rotate);
		real_old = real_answer;
		imag_old = imag_answer;
  } 
  else if ((type=="so") || (type=="ss")) {
    real_old = x1;
    imag_old = y1 + stub_admittance_im;
  }/*
    temp_array=find_smith_coord(x1,imag_answer,rotate);
  } else {
		temp_array=find_smith_coord(x2, y2,rotate);
  }*/
  
  end_x_coord=temp_array[0];
  end_y_coord=temp_array[1];
	
	return [x_coord,y_coord,end_x_coord,end_y_coord,real_old,imag_old,start_x_coord,start_y_coord,x1,y1,x2,y2];
}

function download_state() {
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schematic, null, "\t"));
	//var dlAnchorElem = document.getElementById('downloadAnchorElem');
	//dlAnchorElem.setAttribute("href",     dataStr     );
	var myDate = new Date();
	var date = myDate.getDate();
	var month = myDate.getMonth();
	var year = myDate.getFullYear();
	var hour = myDate.getHours();
	var minutes = myDate.getMinutes();
	var seconds = myDate.getSeconds();

	var ddmmyyyy = year + pad(month + 1) + pad(date) + pad(hour) + pad(minutes) + pad(seconds);
	//dlAnchorElem.setAttribute("download", "online_smith_tool_"+ddmmyyyy+".json");
	download(dataStr,"online_smith_tool_"+ddmmyyyy+".json","text/plain");
}

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
    showgrid:false
    },
    width: 650,
    height: 650,
    showgrid:false,
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
    color_admittance_real  = 'rgba(0, 0, 255,0.2)';
    color_admittance_imaginary = 'rgba(0, 0, 255,0.3)'; 
  } else {
    color_resistance_real = 'rgba(150, 0, 0, 0.2)';
    color_resistance_imaginary = 'rgba(252, 114, 2,0.3)';
    color_admittance_real  = 'rgba(255, 0, 250,0.2)';
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

var layout_polar = {
  hovermode: false,
  showlegend: false,
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  polar: {
    radialaxis: {
      tickfont: {
        size: 12
      },
      range: [0, 1],
      gridcolor: "rgba(145, 145, 145, 0.75)",
      dtick:'0.2'
    },
    angularaxis: {
      tickfont: {
        size: 12
      },
      gridcolor: "rgba(145, 145, 145, 0.75)",
      dtick:'15'
    },
    bgcolor:'rgba(255,255,255,0.2)',
  }
};


function resize_fn(x) {
  if (window.matchMedia("(max-width: 300px)").matches) { // If media query matches
    // layout.width = 200;
    // layout.height = 200;
    // layout_polar.width = 200;
    // layout_polar.height = 200;
    fontsize = 7;
  } else if (window.matchMedia("(max-width: 350px)").matches) { 
    // layout.width = 290;
    // layout.height = 290;
    // layout_polar.width = 290;
    // layout_polar.height = 290;
    fontsize = 8;
  } else if (window.matchMedia("(max-width: 400px)").matches) { 
    // layout.width = 340;
    // layout.height = 340;
    // layout_polar.width = 340;
    // layout_polar.height = 340;
    fontsize = 8;
  } else if (window.matchMedia("(max-width: 600px)").matches) { 
    // layout.width = 390;
    // layout.height = 390;
    // layout_polar.width = 390;
    // layout_polar.height = 390;
    fontsize = 10;
  } else if (window.matchMedia("(max-width: 800px)").matches) { 
    // layout.width = 525;
    // layout.height = 525;
    // layout_polar.width = 525;
    // layout_polar.height = 525;
    fontsize = 12;
  } else {
    // layout.width = 650;
    // layout.height = 650;
    // layout_polar.width = 650;
    // layout_polar.height = 650;
    fontsize = 12;
  }
  var smith_holder = document.getElementById("smith_chart");
  // smith_holder.style.width = layout.width + "px";
  // smith_holder.style.height = layout.height + "px";
  // var cartesian_holder = document.getElementById("smith_polar");
  // cartesian_holder.style.width = layout.width + "px";
  // cartesian_holder.style.height = layout.height + "px";
  update_smith_chart();
 // console.log("executing a resize");
}

///------ Items below are run at power up


// var layout = configure_layout_shapes('colorful');

//var size_gt_800 = window.matchMedia("(min-width: 800px)");
var size_lt_800 = window.matchMedia("(max-width: 800px)");
var size_lt_600 = window.matchMedia("(max-width: 600px)");
var size_lt_400 = window.matchMedia("(max-width: 400px)");
var size_lt_350 = window.matchMedia("(max-width: 350px)");
var size_lt_300 = window.matchMedia("(max-width: 300px)");
resize_fn(size_lt_800) // Call listener function at run time
size_lt_800.addListener(resize_fn); // Attach listener function on state changes
size_lt_600.addListener(resize_fn); // Attach listener function on state changes
size_lt_400.addListener(resize_fn);
size_lt_350.addListener(resize_fn);
size_lt_300.addListener(resize_fn);

//functions that are run at startup
update_smith_chart();
drawMakerTable();