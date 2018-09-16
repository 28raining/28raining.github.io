
document.getElementById('file').addEventListener('change', readFile, false);

function readFile (evt) {
	var files = evt.target.files;
	var file = files[0];           
	var reader = new FileReader();
	reader.onload = function(event) {
		//console.log(event.target.result); 
		schematic = JSON.parse(event.target.result);
		freq_no_unit = Number(schematic[0].freq);
		document.getElementById('freq').value=freq_no_unit;
		zo=Number(schematic[0].zo);
		document.getElementById('zo').value=zo;
		updatespan('freq_sel',schematic[0].unit);
	}
	reader.readAsText(file);
}

function change_class(this_id) {
	document.getElementById(this_id).classList.toggle("active");
}

function updatespan(this_id,this_val) {
	if ((this_val[this_val.length-2]+this_val[this_val.length-1])=='Hz') {
		if      (this_val == 'Hz') freq_multiplier = 1;
		else if (this_val == 'KHz') freq_multiplier = 1e3;
		else if (this_val == 'MHz') freq_multiplier = 1e6;
		else if (this_val == 'GHz') freq_multiplier = 1e9;
		else if (this_val == 'THz') freq_multiplier = 1e12;		
		schematic[0].unit=this_val;
	} else {
		var sch_num = this_id.split('_')[1];
		schematic[sch_num].unit = this_val;
		is_active[sch_num]="active";
	}
	//console.log(this_id);
	document.getElementById(this_id).children[0].innerText=this_val;
	update_schem();
	is_active=[];
}

function updatespan_span(this_id,this_val) {
	//if ((this_val[this_val.length-2]+this_val[this_val.length-1])=='Hz') {
	if      (this_val == 'Hz') span_multiplier = 1;
	else if (this_val == 'KHz') span_multiplier = 1e3;
	else if (this_val == 'MHz') span_multiplier = 1e6;
	else if (this_val == 'GHz') span_multiplier = 1e9;
	else if (this_val == 'THz') span_multiplier = 1e12;		
	schematic[0].span_unit=this_val;
	//console.log(this_id);
	document.getElementById(this_id).children[0].innerText=this_val;
//	update_schem();
//	is_active=[];
}

  var num_elements=2;
  var schematic = [];
  var zo=50;
  var freq_no_unit=2440;
	var freq_multiplier=1e6;
	var span_multiplier=1e6;
  var freq=2440e6;
  var is_active=[];
  var precision=3;
  var start_x_coord=0;
  var start_y_coord=0;
  var end_x_coord=0.0;
  var end_y_coord=0.0;
	var real_old,imag_old=0.0;
	var resolution = 100;
	var span_resolution = 10;
  
  schematic.push({num: 0, type:'raw', zo : 50, freq:2440, unit:'MHz', span:0, span_unit:'MHz'});
  schematic.push({num : 1, type:'bb',real:1,imaginary:0,abs:50,abs_bb_i:0,unit:'null'});
  
function one_over_complex(real, imaginary) {
	var realn = real/(real*real + imaginary*imaginary);
	var imaginaryn = -imaginary/(real*real + imaginary*imaginary);
	return [realn,imaginaryn];
}

function clicked_cell(type) {
	if (type == "pr") {
		//div.innerHTML = "<p>Parallel Resistor</p><p><input type=\"number\" value=0 onchange=\"update_schem("+num_elements+",this,'real')\"></input></p><img src=\"icons/resistor_parallel.png\" alt=\"Parallel Resistor\">";
		schematic.push({num : num_elements, type:'pr',real:0,imaginary:0,abs:1,unit:'Ω'});
	} else if (type=="sr") {
		//div.innerHTML = "<p>Series Resistor</p><p><input type=\"number\" value=0 onchange=\"update_schem("+num_elements+",this,'real')\"></input></p><img src=\"icons/resistor_series.png\" alt=\"Series Resistor\">";
		schematic.push({num : num_elements, type:'sr',real:0,imaginary:0,abs:1,unit:'Ω'});
	} else if (type=="si") {
		//div.innerHTML = "<p>Series Inductor</p><p><input type=\"number\" value=0 onchange=\"update_schem("+num_elements+",this,'imag')\"></input></p><img src=\"icons/inductor_series.png\" alt=\"Series Inductor\">";
		schematic.push({num : num_elements, type:'si',real:0,imaginary:0,abs:1,unit:'nH'});
	} else if (type=="pi") {
		//div.innerHTML = "<p>Parallel Inductor</p><p><input type=\"number\" value=0 onchange=\"update_schem("+num_elements+",this,'imag')\"></input></p><img src=\"icons/inductor_parallel.png\" alt=\"Parallel Inductor\">";
		schematic.push({num : num_elements, type:'pi',real:0,imaginary:0,abs:1,unit:'nH'});
	} else if (type=="sc") {
		//div.innerHTML = "<p>Series Capacitor</p><p><input type=\"number\" value=0 onchange=\"update_schem("+num_elements+",this,'imag')\"></input></p><img src=\"icons/capacitor_series.png\" alt=\"Series Capacitor\">";
		schematic.push({num : num_elements, type:'sc',real:0,imaginary:0,abs:1,unit:'pF'});
	} else if (type=="pc") {
		//div.innerHTML = "<p>Parallel Capacitor</p><p><input type=\"number\" value=0 onchange=\"update_schem("+num_elements+",this,'imag')\"></input></p><img src=\"icons/capacitor_parallel.png\" alt=\"Parallel Capacitor\">";
		schematic.push({num : num_elements, type:'pc',real:0,imaginary:0,abs:1,unit:'pF'});
	} else if (type=="tl") {
		//div.innerHTML = "<p>Parallel Capacitor</p><p><input type=\"number\" value=0 onchange=\"update_schem("+num_elements+",this,'imag')\"></input></p><img src=\"icons/capacitor_parallel.png\" alt=\"Parallel Capacitor\">";
		schematic.push({num : num_elements, type:'tl',line_length:1e-3,abs:1,line_zo:50,er:4,unit:'mm',real:0,imaginary:0});
	//} else if (type=="bb") {
	//	//div.innerHTML = "<p>Black Box</p><p>null</p><p><input type=\"number\" value=0 onchange=\"update_schem("+num_elements+",this,'real')\"></input></p><p><input type=\"number\" value=0 onchange=\"update_schem("+num_elements+",this,'imag')\"></input></p><img src=\"icons/black_box.png\" alt=\"Black Box\">";
	//	schematic.push({num : num_elements, type:'bb',real:0,imaginary:0,abs:0,abs_bb_i:0,unit:'null'});
	}
	//console.log(schematic);
	update_schem();
	num_elements=num_elements+1;
}

function update_schem_abs(target_num, obj, complex) {
	switch(schematic[target_num].type) {
		case ("bb") :
			if (complex=="abs") schematic[target_num].abs = Number(obj.value);
			else schematic[target_num].abs_bb_i = Number(obj.value);
			break;
		case ("tl") :
			if (complex=="abs") schematic[target_num].abs = Number(obj.value);
			else if (complex=="line_zo") schematic[target_num].line_zo = Number(obj.value);
			else if (complex=="er") schematic[target_num].er = Number(obj.value);
			break;
		case ("sr") :
		case ("pr") :
		case ("pc"):
		case ("sc"):
		case ("pi"):
		case ("si"):
			schematic[target_num].abs = Number(obj.value)
			/*
			if      (schematic[target_num].unit[0] == 'f') schematic[target_num].abs = Number(obj.value) * 1e-15;
			else if (schematic[target_num].unit[0] == 'p') schematic[target_num].abs = Number(obj.value) * 1e-12;
			else if (schematic[target_num].unit[0] == 'n') schematic[target_num].abs = Number(obj.value) * 1e-9;
			else if (schematic[target_num].unit[0] == 'u') schematic[target_num].abs = Number(obj.value) * 1e-6;
			else if (schematic[target_num].unit[0] == 'm') schematic[target_num].abs = Number(obj.value) * 1e-3;
			else if (schematic[target_num].unit[0] == 'K') schematic[target_num].abs = Number(obj.value) * 1e3;
			else if (schematic[target_num].unit[0] == 'M') schematic[target_num].abs = Number(obj.value) * 1e6;
	*/
			break;
	}
	update_schem();
}

function pad(n) {
		return n<10 ? '0'+n : n
}

function update_schem() {
	freq = freq_no_unit * freq_multiplier;
	var absolute_val = 0;
	for (i=1;i<schematic.length;i++) {
		//if (schematic[i].abs != 0) { 
			if      (schematic[i].unit[0] == 'f') absolute_val = schematic[i].abs * 1e-15;
			else if (schematic[i].unit[0] == 'p') absolute_val = schematic[i].abs * 1e-12;
			else if (schematic[i].unit[0] == 'n') absolute_val = schematic[i].abs * 1e-9;
			else if (schematic[i].unit[0] == 'u') absolute_val = schematic[i].abs * 1e-6;
			else if (schematic[i].unit[0] == 'm') absolute_val = schematic[i].abs * 1e-3;	//tl can have unit of meters
			else if (schematic[i].unit[0] == 'K') absolute_val = schematic[i].abs * 1e3;
			else if (schematic[i].unit[0] == 'M') absolute_val = schematic[i].abs * 1e6;
			else if (schematic[i].unit[0] == 'λ') absolute_val = schematic[i].abs * (3e8/freq);
			else                                  absolute_val = schematic[i].abs;
			
			switch(schematic[i].type) {
				case ("bb") :
					schematic[i].real = (schematic[i].abs / zo);
					schematic[i].imaginary = (schematic[i].abs_bb_i / zo);
					break;
				case ("sr") :
				case ("pr") :
					schematic[i].real = (absolute_val / zo);
					break;
				case ("pc"):
				case ("sc"):
					schematic[i].imaginary = -(1 / (absolute_val * 2 * Math.PI * freq * zo));
					break;
				case ("pi"):
				case ("si"):
					schematic[i].imaginary = (absolute_val * 2 * Math.PI * freq / zo);
					break;
				case ("tl"):
					schematic[i].line_length = absolute_val;
					break;
			}
			
			schematic[i].real = Number(schematic[i].real).toPrecision(precision);
			schematic[i].imaginary = Number(schematic[i].imaginary).toPrecision(precision);
			
			if ((Math.abs(schematic[i].real) < 0.1) && (schematic[i].real != 0)) schematic[i].real = Number(schematic[i].real).toExponential();
			if ((Math.abs(schematic[i].imaginary) < 0.1) && (schematic[i].imaginary != 0)) schematic[i].imaginary = Number(schematic[i].imaginary).toExponential();
		//}
	}
	//schematic[i].imaginary = schematic[i].imaginary.toFixed(2);
	//schematic[i].real = schematic[i].imaginary.real(2);
	update_smith_chart();
}

function update_smith_chart() {
	//Save first point, which must come from a black box
	console.log(schematic);
	var trace = [];
	var layout_shapes = [];
	var textbox_trace = [];
	// var span_impedance_re = [];
	// var span_impedance_im = [];
	// if (schematic[0].span == 0) {
	// 	span_res == 0
	// } else {
	// 	span_res = span_resolution;
	// }
	
	var myNode = document.getElementById("schematic");
	myNode.innerHTML = '';
	var point_div = document.createElement("div");
	point_div.setAttribute('class', 'cell-picker-text');
	point_div.innerHTML += "<b class=\"star-light arrow fa-1x\"></b><b>Your system</b><b class=\"star-light arrow fa-1x\"></b>";
	document.getElementById("schematic").appendChild(point_div);
	real_old = Number(schematic[1].real);
	imag_old = Number(schematic[1].imaginary);
	// for (var i= 0; i < span_res*2; i++) {
	// 	span_impedance_re[i] = real_old;
	// 	span_impedance_im[i] = imag_old;
	// }
		
	for (var i = 1; i < schematic.length; i++) {
		
		//Add the element to the schematic view
		var div = document.createElement("div");
		unit=[];
		div.setAttribute('class', 'cell');
			
		switch(schematic[i].type) {
			case ("bb") :
				sch_label="Black Box";
				sch_imag=true;
				sch_real=true;
				sch_abs=true;
				sch_icon="black_box";
				break;
			case ("pr") :
				sch_label="Parallel Resistor";
				sch_imag=false;
				sch_real=true;
				sch_abs=true;
				unit = ['mΩ','Ω','KΩ','MΩ'];
				sch_icon="resistor_parallel";
				break;
			case ("sr") :
				sch_label="Series Resistor";
				sch_imag=false;
				sch_real=true;
				sch_abs=true;
				unit = ['mΩ','Ω','KΩ','MΩ'];
				sch_icon="resistor_series";
				break;
			case ("pc") :
				sch_label="Parallel Capacitor";
				sch_imag=true;
				sch_real=false;
				sch_abs=true;
				unit = ['mF','uF','nF','pF','fF'];
				sch_icon="capacitor_parallel";
				break;
			case ("sc") :
				sch_label="Series Capacitor";
				sch_imag=true;
				sch_real=false;
				sch_abs=true;
				unit = ['mF','uF','nF','pF','fF'];
				sch_icon="capacitor_series";
				break;
			case ("pi") :
				sch_label="Parallel Inductor";
				sch_imag=true;
				sch_real=false;
				sch_abs=true;
				unit = ['H','mH','uH','nH','pH'];
				sch_icon="inductor_parallel";
				break;
			case ("si") :
				sch_label="Series Inductor";
				sch_imag=true;
				sch_real=false;
				sch_abs=true;
				unit = ['H','mH','uH','nH','pH'];
				sch_icon="inductor_series";
				break;
			case ("tl") :
				sch_label="Transmission Line";
				sch_imag=false;
				sch_real=false;
				sch_abs=true; //is actually length
				unit = [' m','mm','um','λ'];
				sch_icon="transmission_line";
				break;
		}
		//div.innerHTML = "<p>"+sch_label+"</p>";
		div.innerHTML += "<img src=\"icons/"+sch_icon+".png\" alt="+sch_label+">";
		//if (sch_abs) {
			var dropdown_menu = "<div class=\"abs_box\"><div class=\"spacer\"></div><input type=\"number\" value="+schematic[i].abs+" onchange=\"update_schem_abs("+i+",this,'abs')\"></input>";
			dropdown_menu += "<div class=\"spacer\"></div>";
			if (schematic[i].type=='bb') {
				var divclass = 'complex_box';
				dropdown_menu += "<input type=\"number\" value="+schematic[i].abs_bb_i+" onchange=\"update_schem_abs("+i+",this,'abs_bb_i')\"></input>";
				dropdown_menu += "<div class=\"spacer\">j</div>";
			} else {
				var divclass = 'complex_box_wide';
				//Add units selector
				dropdown_menu += "<div id=\"sch_"+i+"\" class=\"wrapper-dropdown-5 "+is_active[i]+"\" tabindex=\"1\" onclick=\"change_class(this.id)\"><div>"+schematic[i].unit+"</div><ul class=\"dropdown\">";
				for (j=0;j<unit.length;j++) {
					dropdown_menu += "<li onclick=\"updatespan(parentElement.parentElement.id,'"+unit[j]+"')\"><a href=\"#\">"+unit[j]+"</a></li>";
				}
				dropdown_menu +="</ul></div>";
			}
			div.innerHTML +=dropdown_menu + "</div>";
		//}
		//} else if (schematic[i].type=='bb') {
			if (sch_real || sch_imag) var complex_box = "<div class=\"trans\"><div class=\"spacer\"></div>";
			
			if (sch_real) {
				complex_box += "<div class=\""+divclass+"\">" + schematic[i].real + "</div><div class=\"spacer\"></div>";
			}
			if (sch_imag) {
				if (schematic[i].imaginary>=0) {
					var sign = '+';
					var imag_val = schematic[i].imaginary;
				} else {
					var sign = '-';
					var imag_val = Number((schematic[i].imaginary*-1).toPrecision(precision));
					if ((Math.abs(imag_val) < 0.1) && (imag_val != 0)) imag_val = Number(imag_val).toExponential();
				}
				complex_box += "<div class=\"spacer\">"+sign+"</div><div class=\"spacer\"></div>";
				complex_box += "<div class=\""+divclass+"\">" + imag_val + "</div><div class=\"spacer\">j</div>";
			}
			if (sch_real || sch_imag) complex_box += "</div>";
			if (sch_real || sch_imag) div.innerHTML += complex_box;
			if (schematic[i].type=='tl') {
				div.innerHTML +=  "<div class=\"global_inputs\"><div class=\"trans\"><p>Zo=</p><input class=\"trans\" type=\"text\" value="+schematic[i].line_zo+" onchange=\"update_schem_abs("+i+",this,'line_zo')\"></input></div>";
				div.innerHTML +=  "<div class=\"global_inputs\"><div class=\"trans\"><p>e<sub>r</sub>=</p><input class=\"trans\" type=\"text\" value="+schematic[i].er+" onchange=\"update_schem_abs("+i+",this,'er')\"></input></div>";
			}
		//}	}
//		if (sch_real) div.innerHTML += "<p"+schematic[i].real+"<b>j</b></p>";
//		if (sch_real) div.innerHTML += "<p"+schematic[i].imaginary+"<b>j</b></p>";

		//div.innerHTML += "<div class=\"datapoint\">DP"+i+"</div>";

		//can't remove black boxes...
		if (schematic[i].type!='bb') div.innerHTML += "<div class=\"rem\" onclick=\"schematic.splice("+i+",1); update_smith_chart()\">DP"+i+"&nbsp &nbsp &nbsp X</div>";
		else div.innerHTML += "<div class=\"rem\">DP"+i+"&nbsp &nbsp &nbsp &nbsp</div>";
		//else  div.innerHTML += "<p>&nbsp</p>";
		document.getElementById("schematic").appendChild(div);

		
		//Add the arc to the smith chart
		if ( i > 1) {
			var temp_trace = {}
			var x_points, y_points;
			
			if ((schematic[i].type[0]=='s') || (schematic[i].type[0]=='b')) {
				//For series elements plotted on normal curves....
				var re = Number(schematic[i].real);
				var im = Number(schematic[i].imaginary);
				var temp_array = arc_smith_points(real_old,imag_old,re+real_old,im+imag_old,false);
				x_points=temp_array[0];
				y_points=temp_array[1];
				real_old = re+real_old;
				imag_old = im+imag_old;
			} else if (schematic[i].type=='tl') {
				//For transmission lines...
				var temp_array=arc_smith_points(real_old,imag_old,schematic[i].line_length,schematic[i].line_zo,"transmission_line",schematic[i].er);
				x_points=temp_array[0];
				y_points=temp_array[1];
			}  else {
				//For parallel elements plotted on rotated graph....
				var start = one_over_complex(real_old,imag_old);
				//if ((Math.abs(schematic[i].real) < 0.001) && (Math.abs(schematic[i].imaginary) < 0.001)) {
					//don't plot this point...
				//} else {
                    if ((Math.abs(schematic[i].real) < 0.001) && (schematic[i].real != 0.0)) schematic[i].real=0.001;
                    if ((Math.abs(schematic[i].imaginary) < 0.001) && (schematic[i].imaginary != 0.0)) schematic[i].imaginary=0.001;
					var schem_inv = one_over_complex(schematic[i].real,schematic[i].imaginary);
					var temp_array = arc_smith_points(start[0],start[1],start[0]+schem_inv[0],start[1]+schem_inv[1],true);
					x_points=temp_array[0];
					y_points=temp_array[1];
					temp_array=one_over_complex(start[0]+schem_inv[0],start[1]+schem_inv[1]);
					real_old = temp_array[0];
					imag_old = temp_array[1];
				//}
			}
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
			layout_shapes.push({type: "rectangle", x0:Number(start_x_coord)-0.01,y0:Number(start_y_coord)-0.01,x1:Number(start_x_coord)+0.01,y1:Number(start_y_coord)+0.01});
			textbox_trace.push({x:[Number(start_x_coord)+0.04],y:[Number(start_y_coord)-0.03],text:["DP"+(i-1)],mode:'text'});
		}
	}
	
	var temp_array = []
	if (schematic.length == 2) {
		temp_array = find_smith_coord(schematic[1].real,schematic[1].imaginary,false);
		end_x_coord=temp_array[0];
		end_y_coord=temp_array[1];
	}
	//console.log(schematic[1].real,schematic[0].imaginary,end_x_coord,end_y_coord)
	layout_shapes.push({type: "rectangle", x0:Number(end_x_coord)-0.01,y0:Number(end_y_coord)-0.01,x1:Number(end_x_coord)+0.01,y1:Number(end_y_coord)+0.01});
	textbox_trace.push({x:[Number(end_x_coord)+0.04],y:[Number(end_y_coord)-0.03],text:["DP"+(i-1)],mode:'text'});
	
	//Update the impedance box
	document.getElementById("current_impedance").innerHTML = "<div class=\"text_box\">"+(real_old*zo).toPrecision(3)+"</div>";
	if (imag_old < 0) document.getElementById("current_impedance").innerHTML += "<div class=\"text_box\">-</div>";
	else document.getElementById("current_impedance").innerHTML += "<div class=\"text_box\">+</div>";
	document.getElementById("current_impedance").innerHTML += "<div class=\"text_box\">"+Math.abs(imag_old*zo).toPrecision(3) + "j</div>";
	
	//Calculate the admittance
	var admittance_real,admittance_imaginary;
	temp_array =  one_over_complex(real_old*zo,imag_old*zo);
	admittance_real=temp_array[0];
	admittance_imaginary=temp_array[1];
	document.getElementById("current_admittance").innerHTML = "<div class=\"text_box\">"+(admittance_real).toPrecision(3)+"</div>";
	if (admittance_imaginary < 0) document.getElementById("current_admittance").innerHTML += "<div class=\"text_box\">-</div>";
	else document.getElementById("current_admittance").innerHTML += "<div class=\"text_box\">+</div>";
	document.getElementById("current_admittance").innerHTML += "<div class=\"text_box\">"+Math.abs(admittance_imaginary).toPrecision(3) + "j</div>";
	
	//Calculate the reflection coefficient -current_admittance (zo-zimp) / (zo+zimp)
	var bot_real,bot_imag;
	temp_array = one_over_complex(zo + real_old*zo,imag_old*zo);
	bot_real= temp_array[0];
	bot_imag = temp_array[1];

	var reflectio_coeff_real = ((zo - real_old*zo) * bot_real) + ((imag_old*zo)*bot_imag);
	var reflectio_coeff_imag = ((imag_old*zo) * bot_real) + ((zo - real_old*zo) * bot_imag);
	document.getElementById("current_reflection").innerHTML = "<div class=\"text_box\">"+(reflectio_coeff_real).toPrecision(3)+"</div>";
	if (imag_old < 0) document.getElementById("current_reflection").innerHTML += "<div class=\"text_box\">-</div>";
	else document.getElementById("current_reflection").innerHTML += "<div class=\"text_box\">+</div>";
	document.getElementById("current_reflection").innerHTML += "<div class=\"text_box\">"+Math.abs(reflectio_coeff_imag).toPrecision(3) + "j</div>";
	
	//plot reflection coefficient magnitude

	document.getElementById("current_reflection_mag").innerHTML = "<div class=\"text_box\">"+Math.sqrt((reflectio_coeff_real*reflectio_coeff_real)+(reflectio_coeff_imag*reflectio_coeff_imag)).toPrecision(3)+"</div>";
	document.getElementById("current_reflection_mag").innerHTML += "<div class=\"text_box\">&ang;</div>";
	document.getElementById("current_reflection_mag").innerHTML += "<div class=\"text_box\">"+(360*Math.atan(reflectio_coeff_real/reflectio_coeff_imag)/(2*Math.PI)).toPrecision(3) + "&deg; </div>";
	
	//redefine the labels in case zo has changed
	define_labels();

	//draw span
	
	var data = trace.concat(textbox_trace,trace_im_neg,trace_im_pos,trace_real,trace_adm,trace_sus_pos,trace_sus_neg);

	//console.log("data");
	//console.log(data);
	//console.log(layout);
	//console.log(layout_shapes);
	Plotly.newPlot('myDiv', data, {paper_bgcolor: 'rgba(255,255,255,0.2)', plot_bgcolor: 'rgba(255,255,255,0.0)', showlegend: false,margin:layout.margin, height:layout.height,width:layout.width,hovermode:layout.hovermode,xaxis:layout.xaxis,yaxis:layout.yaxis,shapes:layout.shapes.concat(layout_shapes)});	
	
}

var trace_im_neg,trace_real,trace_adm,trace_sus_pos,trace_sus_neg = {};

function define_labels () {
 
	trace_im_pos = {
	  x: [0.95,0.9,0.63,0.05,-0.54,-0.86],
	  y: [0.14,0.33,0.73,0.95,0.8,0.4],
	  text: ["<b>"+10*zo+"</b>","<b>"+5*zo+"</b>","<b>"+2*zo+"</b>","<b>"+1*zo+"</b>","<b>"+0.5*zo+"</b>","<b>"+0.2*zo+"</b>"],
	  mode: 'text',
	  textfont: {
		color: 'rgba(252, 114, 2,0.5)'
	  }
	};

	trace_im_neg = {
	  x: [0.95,0.9,0.63,0.05,-0.54,-0.86],
	  y: [-0.14,-0.33,-0.73,-0.95,-0.8,-0.4],
	  text: ["<b>"+10*zo+"</b>","<b>"+5*zo+"</b>","<b>"+2*zo+"</b>","<b>"+1*zo+"</b>","<b>"+0.5*zo+"</b>","<b>"+0.2*zo+"</b>"],
	  mode: 'text',
	  textfont: {
		color: 'rgba(252, 114, 2,0.5)'
	  }
	};

	trace_real = {
	  x: [0.96,0.88,0.66,0.38,0.05,-0.29,-0.62,-0.98],
	  y: [0.03,0.03,0.03,0.03,0.03,0.03,0.03,0.03,0.03],
	  text: ["<b>∞</b>","<b>"+10*zo+"</b>","<b>"+4*zo+"</b>","<b>"+2*zo+"</b>","<b>"+1*zo+"</b>","<b>"+0.5*zo+"</b>","<b>"+0.2*zo+"</b>","<b>0</b>"],
	  mode: 'text',
	  textfont: {
		color: 'rgba(150, 0, 0,0.5)'
	  }
	};

	trace_adm = {
	  x: [0.53,0.26,-0.07,-0.4,-0.74,-0.88],
	  y: [-0.03,-0.03,-0.03,-0.03,-0.03,-0.03,-0.03],
	  text: ["<b>"+(1000/5/zo).toPrecision(3)+"</b>m","<b>"+(1000/2/zo).toPrecision(3)+"</b>m","<b>"+(1000/zo).toPrecision(3)+"</b>m","<b>"+(1000*2/zo).toPrecision(3)+"</b>m","<b>"+(1000*5/zo).toPrecision(3)+"</b>m","<b>"+(1000*10/zo).toPrecision(3)+"</b>m"],
	  mode: 'text',
	  textfont: {
		color: 'rgba(0, 10, 163,0.3)'
	  }
	};

	trace_sus_pos = {
	  x: [0.86,0.53,-0.07,-0.62,-0.89,-0.92],
	  y: [0.4,0.79,0.97,0.72,0.31,0.15],
	  text: ["<b>"+(1000/5/zo).toPrecision(3)+"</b>m","<b>"+(1000/2/zo).toPrecision(3)+"</b>m","<b>"+(1000/zo).toPrecision(3)+"</b>m","<b>"+(1000*2/zo).toPrecision(3)+"</b>m","<b>"+(1000*5/zo).toPrecision(3)+"</b>m","<b>"+(1000*10/zo).toPrecision(3)+"</b>m"],
	  mode: 'text',
	  textfont: {
		color: 'rgba(255, 0, 250,0.3)'
	  }
	};

	trace_sus_neg = {
	  x: [0.86,0.53,-0.07,-0.62,-0.89,-0.92],
	  y: [-0.4,-0.79,-0.97,-0.72,-0.31,-0.15],
	  text: ["<b>"+(1000/5/zo).toPrecision(3)+"</b>m","<b>"+(1000/2/zo).toPrecision(3)+"</b>m","<b>"+(1000/zo).toPrecision(3)+"</b>m","<b>"+(1000*2/zo).toPrecision(3)+"</b>m","<b>"+(1000*5/zo).toPrecision(3)+"</b>m","<b>"+(1000*10/zo).toPrecision(3)+"</b>m"],
	  mode: 'text',
	  textfont: {
		color: 'rgba(255, 0, 250,0.3)'
	  }
	};
}

//function intersectTwoCircles(x1,y1,r1, x2,y2,r2) {
function find_smith_coord(real,imaginary,rotate) {

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

function arc_smith_points(x1,y1,x2,y2,rotate,er) {
	
	//console.log("inside smith");
	//console.log(x1,y1,x2,y2,rotate);
	var x_coord=[];
	var y_coord=[];
	var temp_array=[];
	temp_array=find_smith_coord(x1, y1,rotate);
	start_x_coord=temp_array[0];
	start_y_coord=temp_array[1];

	if (rotate == "transmission_line") {
		var line_zo=y2;
		var line_length=x2;
		var rt_er=Math.sqrt(er);
		var beta = 2*Math.PI*freq*rt_er/3e8;
		var top_real_temp = x1 * line_zo;
	}
	
	for (i=0;i<resolution+1;i++) {
		if (rotate == "transmission_line") {
		//	console.log("here");
			var tan_beta = Math.tan(beta * i*line_length/resolution);
			var top_imag_temp = (y1*zo + line_zo*tan_beta)* line_zo/zo;
			var bot_real_temp = line_zo-y1*tan_beta*zo;
			var bot_imag_temp = x1*tan_beta*zo;
			var temp_array=one_over_complex(bot_real_temp,bot_imag_temp);
			var bot_real=temp_array[0];
			var bot_imag=temp_array[1];
			var real_answer = (top_real_temp*bot_real)-(top_imag_temp*bot_imag);
			var imag_answer = (top_real_temp*bot_imag)+(top_imag_temp*bot_real);
			//console.log(real_answer,imag_answer,tan_beta);
			temp_array=find_smith_coord(real_answer,imag_answer,false);
			x_coord[i]=temp_array[0];
			y_coord[i]=temp_array[1];
		} else {
				temp_array=find_smith_coord(x1 + (x2-x1)*i/resolution, y1 + (y2-y1)*i/resolution,rotate);
				x_coord[i]=temp_array[0];
				y_coord[i]=temp_array[1];
		}	
	}
	
	if (rotate == "transmission_line") {
		temp_array=find_smith_coord(real_answer, imag_answer,false);
		end_x_coord=temp_array[0];
		end_y_coord=temp_array[1];
		real_old = real_answer;
		imag_old = imag_answer;
	} else {
		temp_array=find_smith_coord(x2, y2,rotate);
		end_x_coord=temp_array[0];
		end_y_coord=temp_array[1];
	}
	
	//console.log([x_coord,y_coord]);
	return [x_coord,y_coord];
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
  },
  shapes: [
  
	///RESISTANCE CIRCLES
    {
      type: 'circle',
      x0: -1,
      y0: -1,
      x1: 1,
      y1: 1,
      line: {
        color: 'rgba(150, 0, 0, 0.4)'
      }
    },
	{
      type: 'circle',
      x0: -0.666,
      y0: -0.833,
      x1: 1,
      y1: 0.833,
      line: {
        color: 'rgba(150, 0, 0, 0.4)'
      }
    },
	{
      type: 'circle',
      x0: -0.333,
      y0: -0.666,
      x1: 1,
      y1: 0.666,
      line: {
        color: 'rgba(150, 0, 0, 0.4)'
      }
    },
    {
      type: 'circle',
      x0: 0,
      y0: -0.5,
      x1: 1,
      y1: 0.5,
      line: {
        color: 'rgba(150, 0, 0, 0.4)'
      }
    },
    {
      type: 'circle',
      x0: 0.333,
      y0: -0.333,
      x1: 1,
      y1: 0.333,
      line: {
        color: 'rgba(150, 0, 0, 0.4)'
      }
    },
	{
      type: 'circle',
      x0: 0.6,
      y0: -0.2,
      x1: 1,
      y1: 0.2,
      line: {
        color: 'rgba(150, 0, 0, 0.4)'
      }
    },
	{
      type: 'circle',
      x0: 0.818,
      y0: -0.0909,
      x1: 1,
      y1: 0.0909,
      line: {
        color: 'rgba(150, 0, 0, 0.4)'
      }
    },
	
	
	///ADMITTANCE CIRCLES
	{
      type: 'circle',
      x0: 0.6,
      y0: -0.8,
      x1: -1,
      y1: 0.8,
      line: {
        color: 'rgba(0, 10, 163,0.2)'
      }
    },
	{
      type: 'circle',
      x0: 0.333,
      y0: -0.666,
      x1: -1,
      y1: 0.666,
      line: {
        color: 'rgba(0, 10, 163,0.2)'
      }
    },
	{
      type: 'circle',
      x0: -1,
      y0: -0.5,
      x1: 0,
      y1: 0.5,
      line: {
        color: 'rgba(0, 10, 163,0.2)'
      }
    },
    {
      type: 'circle',
      x0: -1,
      y0: -0.333,
      x1: -0.333,
      y1: 0.333,
      line: {
        color: 'rgba(0, 10, 163,0.2)'
      }
    },
	{
      type: 'circle',
      x0: -1,
      y0: -0.166,
      x1: -0.666,
      y1: 0.166,
      line: {
        color: 'rgba(0, 10, 163,0.2)'
      }
    },
	{
      type: 'circle',
      x0: -1,
      y0: -0.0909,
      x1: -0.818,
      y1: 0.0909,
      line: {
        color: 'rgba(0, 10, 163,0.2)'
      }
    },
	
	///REACTANCE CIRCLES
    {
      type: 'circle',
      x0: 0.9,
      y0: 0,
      x1: 1.1,
      y1: 0.2,
      line: {
        color: 'rgba(252, 114, 2,0.4)'
      }
    },
    {
      type: 'circle',
      x0: 0.8,
      y0: 0,
      x1: 1.2,
      y1: 0.4,
      line: {
        color: 'rgba(252, 114, 2,0.4)'
      }
    },
    {
      type: 'circle',
      x0: 0.5,
      y0: 0,
      x1: 1.5,
      y1: 1,
      line: {
        color: 'rgba(252, 114, 2,0.4)'
      }
    },
	{
      type: 'circle',
      x0: 0,
      y0: 0,
      x1: 2,
      y1: 2,
      line: {
        color: 'rgba(252, 114, 2,0.4)'
      }
    },
	{
      type: 'circle',
      x0: -1,
      y0: 0,
      x1: 3,
      y1: 4,
      line: {
        color: 'rgba(252, 114, 2,0.4)'
      }
    },
	{
      type: 'circle',
      x0: -4,
      y0: 0,
      x1: 6,
      y1: 10,
      line: {
        color: 'rgba(252, 114, 2,0.4)'
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
        color: 'rgba(252, 114, 2,0.4)'
      }
    },
    {
      type: 'circle',
      x0: 0.8,
      y0: 0,
      x1: 1.2,
      y1: -0.4,
      line: {
        color: 'rgba(252, 114, 2,0.4)'
      }
    },
	{
      type: 'circle',
      x0: 0.5,
      y0: 0,
      x1: 1.5,
      y1: -1,
      line: {
        color: 'rgba(252, 114, 2,0.4)'
      }
    },
    {
      type: 'circle',
      x0: 0,
      y0: 0,
      x1: 2,
      y1: -2,
      line: {
        color: 'rgba(252, 114, 2,0.4)'
      }
    },
	{
      type: 'circle',
      x0: -1,
      y0: 0,
      x1: 3,
      y1: -4,
      line: {
        color: 'rgba(252, 114, 2,0.4)'
      }
    },
		{
      type: 'circle',
      x0: -4,
      y0: 0,
      x1: 6,
      y1: -10,
      line: {
        color: 'rgba(252, 114, 2,0.4)'
      }
    },
	
	
	///SUSCEPTANCE CIRCLES
	
	{
      type: 'circle',
      x0: -1.1,
      y0: 0,
      x1: -0.9,
      y1: 0.2,
      line: {
        color: 'rgba(255, 0, 250,0.2)'
      }
    },
    {
      type: 'circle',
      x0: -1.2,
      y0: 0,
      x1: -0.8,
      y1: 0.4,
      line: {
        color: 'rgba(255, 0, 250,0.2)'
      }
    },
	{
      type: 'circle',
      x0: -1.5,
      y0: 0,
      x1: -0.5,
      y1: 1,
      line: {
        color: 'rgba(255, 0, 250,0.2)'
      }
    },
    {
      type: 'circle',
      x0: -2,
      y0: 0,
      x1: -0,
      y1: 2,
      line: {
        color: 'rgba(255, 0, 250,0.2)'
      }
    },
	{
      type: 'circle',
      x0: -3,
      y0: 0,
      x1: 1,
      y1: 4,
      line: {
        color: 'rgba(255, 0, 250,0.2)'
      }
    },
	{
      type: 'circle',
      x0: -6,
      y0: 0,
      x1: 4,
      y1: 10,
      line: {
        color: 'rgba(255, 0, 250,0.2)'
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
        color: 'rgba(255, 0, 250,0.2)'
      }
    },
    {
      type: 'circle',
      x0: -1.2,
      y0: 0,
      x1: -0.8,
      y1: -0.4,
      line: {
        color: 'rgba(255, 0, 250,0.2)'
      }
    },
	{
      type: 'circle',
      x0: -1.5,
      y0: 0,
      x1: -0.5,
      y1: -1,
      line: {
        color: 'rgba(255, 0, 250,0.2)'
      }
    },
    {
      type: 'circle',
      x0: -2,
      y0: 0,
      x1: -0,
      y1: -2,
      line: {
        color: 'rgba(255, 0, 250,0.2)'
      }
    },
	{
      type: 'circle',
      x0: -3,
      y0: 0,
      x1: 1,
      y1: -4,
      line: {
        color: 'rgba(255, 0, 250,0.2)'
      }
    },
	{
      type: 'circle',
      x0: -6,
      y0: 0,
      x1: 4,
      y1: -10,
      line: {
        color: 'rgba(255, 0, 250,0.2)'
      }
    },
	 
  ]
};

  update_schem();