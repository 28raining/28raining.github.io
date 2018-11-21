var timing_diagram = {
    selected_row:0,
    selected_brick:0,
    canvas:[
        {
            row_height:50,
            current_x:0,
            y_offset:0,
            shapes:[]     
        },
        {
            row_height:50,
            current_x:0,
            y_offset:0,
            shapes:[]     
        }
    ],
    arrows:[],
    selected_arrow:-1,
    highlighted_arrow:-1,
    canvas_width:800,
    xdiv_spacing:100
};
var last_move=[];
var drag_row_num=0;
var arrow_select = {
    fresh:false,
    is_waiting:false,
    side:0,
    id:0
}
//because of device scaling we have a global ctx with the same scaling. see the initialise function
var ctx = "";
var dpr = 4;
var padding = 2;   //padding between wave and top/bottom
var row_seperator_height=2;

function draw_timing_diagram () {
    console.log(timing_diagram);
    var canvas = document.getElementById('main_canvas');
    //var ctx = canvas.getContext("2d");
    var label_list="";
    var sum_heights=0;
    var y_offset=0;
    var row_height=0;
    var hover_divs="";
    var style="";
    
    //draw the labels,drag bars. Reset some variables
    for (i=0;i<timing_diagram.canvas.length;i++) {
        label_list += '<p id="row'+i+'_label" class="label" onclick="row_select('+i+')">Row'+i+'</p>';
        label_list += '<div id="row'+i+'_bar" class="row_bar" draggable="true" ondragstart="drag(event)"></div>'
        sum_heights += timing_diagram.canvas[i].row_height; 
        timing_diagram.canvas[i].current_x=1;
    }

    //add the HTML
    document.getElementById('canvas_labels').innerHTML = label_list;
    canvas.height = sum_heights*dpr;
    ctx.clearRect(0,0,canvas.width,sum_heights);
    ctx.scale(4, 4);
    
    for (i=0;i<timing_diagram.canvas.length;i++){
        //size the label and the drag bars
        row_height = timing_diagram.canvas[i].row_height;
        document.getElementById('row'+i+'_label').setAttribute("style", "height:"+row_height+"px;");
        document.getElementById('row'+i+'_bar').setAttribute("style", "top:"+(row_height+y_offset)+"px;");   
        for (j=0; j<timing_diagram.canvas[i].shapes.length;j++) {
            //draw shapes on the canvas
            start_x=timing_diagram.canvas[i].current_x;
            timing_diagram.canvas[i].shapes[j].draw(ctx, y_offset, i, j);
            console.log(timing_diagram.canvas,i)
            end_x=timing_diagram.canvas[i].current_x;
            //draw divs which highlight on hover
            style = '"height:'+row_height+'px; width:'+(end_x-start_x)+'px; top:'+y_offset+'px; left:'+(start_x+canvas.offsetLeft)+'px;"'
            var brick = "'brick'";
            hover_divs += '<div class="hover_div" onclick="select_brick('+brick+','+i+','+j+')" style='+style+'></div>'
        }
        y_offset += row_height;
        ctx.stroke();
    }  
    ctx.stroke();

    //Draw the arrows
    for (i=0;i<timing_diagram.arrows.length;i++) {
        draw_arrow(ctx,i);
    }
    row_select(timing_diagram.selected_row);
    document.getElementById('canvas_hover_divs').innerHTML = hover_divs;

    //Draw the x-axis dividers
    var num_dividers = timing_diagram.canvas_width/timing_diagram.xdiv_spacing;
    //console.log(timing_diagram.canvas_width,timing_diagram.xdiv_spacing);
    //ctx.beginPath();
    for (i=0; i<num_dividers; i+=1) {
        ctx.beginPath();
        ctx.moveTo(i*timing_diagram.xdiv_spacing,0);
        ctx.lineTo(i*timing_diagram.xdiv_spacing,y_offset); 
        ctx.strokeStyle = "#b4b4b4";
        ctx.closePath();
        ctx.stroke();  
    }
    //ctx.globalAlpha = 0.3;
    //ctx.closePath();
    ctx.stroke(); 

}

function draw_arrow(ctx,id) {
    var px = timing_diagram.arrows[id].x;
    var py = [0,0];
    //var end_x = timing_diagram.arrows[id].x[1];
    var offset_s_y = 0;
    var offset_e_y = 0;

    //First draw the line. The line scales with the variable height of each rows
    var r_n = timing_diagram.arrows[id].row_num[0];
    for(row_num=0;row_num<r_n;row_num++) offset_s_y += timing_diagram.canvas[row_num].row_height;
    py[0] = offset_s_y + timing_diagram.canvas[r_n].row_height * timing_diagram.arrows[id].y_percent[0];

    r_n = timing_diagram.arrows[id].row_num[1];
    for(row_num=0;row_num<r_n;row_num++) offset_e_y += timing_diagram.canvas[row_num].row_height;
    py[1] = offset_e_y + timing_diagram.canvas[r_n].row_height * timing_diagram.arrows[id].y_percent[1];

    //change color of line if highlighted
    if (id == timing_diagram.highlighted_arrow) {
        ctx.strokeStyle = '#ff0000';
    } else if ((id == timing_diagram.selected_arrow) && (timing_diagram.highlighted_arrow == -1)) {
        ctx.strokeStyle = '#ff0000';
    } else ctx.strokeStyle = '#000000';

    


    var line_length = 8;
    var arrow_angle = 30;
    var start2end_angle = Math.atan(Math.abs((py[1]-py[0])/(px[1]-px[0]))) * 180/Math.PI;
    if ((px[1] < px[0]) && (py[1] < py[0]))      start2end_angle=180-start2end_angle;
    else if ((px[1] < px[0]) && (py[1] > py[0])) start2end_angle+=180;
    else if ((px[1] > px[0]) && (py[1] > py[0])) start2end_angle=360-start2end_angle;

    //arrow head at one end
    var l1_angle=[0,0];
    var l2_angle=[0,0];
    var x1=[0,0];
    var y1=[0,0];
    var x2=[0,0];
    var y2=[0,0];
    l1_angle[0] = (start2end_angle - arrow_angle) % 360;
    l2_angle[0] = (start2end_angle + arrow_angle) % 360;
    l1_angle[1] = (start2end_angle + 180 - arrow_angle) % 360;
    l2_angle[1] = (start2end_angle + 180 + arrow_angle) % 360;
    
    //draw the arrow line
    ctx.beginPath();
    ctx.moveTo(px[0],py[0]);
    ctx.lineTo(px[1],py[1]);  
    ctx.closePath();
    ctx.stroke(); 

    //now draw the arrow ends
    for (j=0;j<2;j++) {
        x1[j] = line_length*Math.cos(l1_angle[j] * Math.PI/180);
        y1[j] = line_length*Math.sin(l1_angle[j] * Math.PI/180);
        x2[j] = line_length*Math.cos(l2_angle[j] * Math.PI/180);
        y2[j] = line_length*Math.sin(l2_angle[j] * Math.PI/180);
        switch (timing_diagram.arrows[id].end) {
            case 1:
                ctx.beginPath();
                ctx.moveTo(px[j],py[j]);
                ctx.lineTo(px[j]+x1[j],py[j]-y1[j]);
                ctx.moveTo(px[j],py[j]);
                ctx.lineTo(px[j]+x2[j],py[j]-y2[j]);
                ctx.closePath();
                ctx.stroke();
                break;
            case 2:
                //solid triangle
                ctx.beginPath();
                ctx.moveTo(px[j],py[j]);
                ctx.lineTo(px[j]+x1[j],py[j]-y1[j]);
                ctx.lineTo(px[j]+x2[j],py[j]-y2[j]);
                ctx.closePath();
                // the outline
                ctx.lineWidth = 5;
                ctx.strokeStyle = '#666666';
                ctx.stroke();
                // the fill color
                ctx.fillStyle = "#FFCC00";
                ctx.fill();
                ctx.lineWidth = 1;
                break;
        }
    }
    //return settings to normal
    ctx.strokeStyle = '#666666';
}

function generate_arrow_dropdown() {
    var arrow_id = timing_diagram.selected_arrow;
    var inner_html="";
    inner_html='<div id="sel_arr" class="wrapper-dropdown-5" tabindex="1" onclick="change_class(this.id)">';
    if (timing_diagram.arrows.length > 0) {
        if (arrow_id < 0) inner_html+='<div>Select Arrow</div>';
        else inner_html+='<div>arrow '+arrow_id+'</div>';
    }
    else inner_html+='<div>Add arrow first</div>';
    inner_html+='<ul class="dropdown"><li onclick="select_arrow(parentElement.parentElement.id,-1)" onmouseover="highlight_arrow(-1)"><a href="#">Select Arrow</a></li>';
    for (i=0;i<timing_diagram.arrows.length; i++) {
        inner_html+='<li onclick="select_arrow(parentElement.parentElement.id,'+i+')" onmouseover="highlight_arrow('+i+')"><a href="#">arrow '+i+'</a></li>';
    }
    inner_html+='</ul></div>'							
	return inner_html;		
}

function generate_arrow_end_dropdown() {
    var inner_html='<div id="sel_arr_end" class="wrapper-dropdown-5" tabindex="1" onclick="change_class(this.id)">';
    if (timing_diagram.arrows.length > 0) inner_html+='<div>Chose arrow end</div><ul class="dropdown">';
    else inner_html+='<div>Add arrow first</div><ul class="dropdown">';
    inner_html+='<li onclick="change_arrow_end(1)"><div id="arrow_line_r"></div><a href="#">line</a></li>';
    inner_html+='<li onclick="change_arrow_end(2)"><div id="arrow_line_r"></div><a href="#">solid</a></li>';    
    inner_html+='</ul></div>';						
	return inner_html;
}

function change_arrow_end(end_id) {
    timing_diagram.arrows[timing_diagram.selected_arrow].end=end_id
}
function select_arrow(id, arrow_num) {
    if (arrow_num >= 0) document.getElementById(id).children[0].innerText="arrow "+arrow_num;
    else document.getElementById(id).children[0].innerText="Select Arrow";
    timing_diagram.selected_arrow=arrow_num;
}

function initialise_draw(canvas_id) {
    var canvas = document.getElementById(canvas_id);
    var ctx = "";
    canvas.width = 50 * dpr;
    canvas.height = 50 * dpr;
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    switch (canvas_id) {
        case "canvas_d_pos":
            ctx.moveTo(0,50);
            ctx.lineTo(0,0);
            ctx.lineTo(25,0);
            ctx.lineTo(25,50);
            ctx.lineTo(50,50);
            break;
        case "canvas_d_neg":
            ctx.moveTo(0,0);
            ctx.lineTo(0,50);
            ctx.lineTo(25,50);
            ctx.lineTo(25,0);
            ctx.lineTo(50,0);
            break;
        case "canvas_arrow":
            ctx.moveTo(0,0);
            ctx.lineTo(50,50);
            ctx.lineTo(48,45);
            ctx.lineTo(50,50);
            ctx.lineTo(45,48);
            break;
    }

    ctx.stroke();
}

function ana_sine(ctx,start_y,row_num,shape_num) {
    var i=0;
    var z=0;
    var start_x=0,old_x=0,old_y=0;
    if (row_num==0) {
        height = timing_diagram.canvas[row_num].row_height - (2*padding);
        start_y = start_y + padding;
    } else {
        height = timing_diagram.canvas[row_num].row_height - (2*padding) - row_seperator_height;  
        start_y = start_y + row_seperator_height + padding;
    }  
    //var height = timing_diagram.canvas[row_num].row_height;
    var freq = timing_diagram.canvas[row_num].shapes[shape_num].freq;
    var repeats = timing_diagram.canvas[row_num].shapes[shape_num].repeats;
    var phase = timing_diagram.canvas[row_num].shapes[shape_num].phase * 2*Math.PI / 360;
    for (z=0; z<=repeats; z++) {
        start_x = timing_diagram.canvas[row_num].current_x;
        old_x = start_x;
        old_y = start_y + ((0.5+Math.sin(phase)/2) * height);
        ctx.moveTo(old_x,old_y);
        for (i=0;i<=100/freq;i++) {
            new_y=(0.5+Math.sin(phase + freq*2*Math.PI*i/100)/2) * height;
            //ctx.lineTo(start_x + i,start_y + new_y);
            ctx.quadraticCurveTo(old_x,old_y,start_x + i,start_y + new_y);
            old_x=start_x + i;
            old_y=start_y + new_y;
        }
        timing_diagram.canvas[row_num].current_x += i-1;
    }
}

function dig_pclk(ctx,start_y,row_num,shape_num){
    //calculate height scaler and y_offset
    if (row_num==0) {
        height = timing_diagram.canvas[row_num].row_height - (2*padding);
        start_y = start_y + padding;
    } else {
        height = timing_diagram.canvas[row_num].row_height - (2*padding) - row_seperator_height;  
        start_y = start_y + row_seperator_height + padding;
    }  
    period = 1/timing_diagram.canvas[row_num].shapes[shape_num].freq;
    repeats = timing_diagram.canvas[row_num].shapes[shape_num].repeats;
    y_offset = 0;
    

    for (z=0;z<=repeats;z++) {
        start_x_int = timing_diagram.canvas[row_num].current_x;
        ctx.moveTo(start_x_int,start_y + height + y_offset);
        ctx.lineTo(start_x_int,start_y + y_offset);
        ctx.lineTo(start_x_int+25*period,start_y + y_offset);
        ctx.lineTo(start_x_int+25*period,start_y + height + y_offset);
        ctx.lineTo(start_x_int+50*period,start_y+ height + y_offset);
        timing_diagram.canvas[row_num].current_x += 50*period;

        if (timing_diagram.canvas[row_num].shapes[shape_num].up_arrow) {
            ctx.moveTo(start_x-5, start_y + (height + y_offset)*0.5 + 5);
            ctx.lineTo(start_x  , start_y + (height + y_offset)*0.5 - 5);
            ctx.lineTo(start_x+5, start_y + (height + y_offset)*0.5 + 5);
        }
        if (timing_diagram.canvas[row_num].shapes[shape_num].down_arrow) {
            ctx.moveTo(start_x+25*period-5, start_y + (height + y_offset)*0.5 - 5);
            ctx.lineTo(start_x+25*period  , start_y + (height + y_offset)*0.5 + 5);
            ctx.lineTo(start_x+25*period+5, start_y + (height + y_offset)*0.5 - 5);
        }
    }
}

function initialise() {
    initialise_draw("canvas_d_pos"); 
    initialise_draw("canvas_arrow"); 
    //initialise_draw("canvas_d_neg");

    change_tab("tab_main");

    var canvas = document.getElementById('main_canvas');
    ctx = setupCanvas(canvas);

    draw_timing_diagram();

}

function setupCanvas(canvas) {
    // Get the device pixel ratio, falling back to 1.
    //var dpr = window.devicePixelRatio || 1;

    // Get the size of the canvas in CSS pixels.
    var rect = canvas.getBoundingClientRect();
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx = canvas.getContext('2d');
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    ctx.scale(dpr, dpr);
    return ctx;
  }

//User has clicked on brick, need to add it to timing diagram
function add(brick){
    var selected_row=timing_diagram.selected_row;
    //add brick to timing diagram object
    switch (brick) {
        case "canvas_d_pos":
            timing_diagram.canvas[selected_row].shapes.push({
                type:"clk_pos",
                freq:1,
                up_arrow:false,
                down_arrow:false,
                repeats:0,
                draw:function temp(ctx,start_y,selected_row,shape_num) {dig_pclk(ctx,start_y,selected_row,shape_num)}
            })
            select_brick ("brick",selected_row, timing_diagram.canvas[selected_row].shapes.length-1);
            break;
        case "canvas_arrow":
            timing_diagram.arrows.push({
                row_num:[0,0],
                y_percent:[0,0],
                x:[0,0],
                end:1
            })
            //select_brick ("arrow", timing_diagram.arrows.length-1);
            timing_diagram.selected_arrow=timing_diagram.arrows.length-1;
            select_brick ("arrow");
            break;
        case "canvas_ana_sine":
            timing_diagram.canvas[selected_row].shapes.push({
                type:"sine",
                phase:0,
                repeats:0,
                freq:1,
                clip_x:-1,
                draw:function temp(ctx,start_y,selected_row,shape_num) {ana_sine(ctx,start_y,selected_row,shape_num)}
            });
            break;
    }
    draw_timing_diagram();
    //last_move.push({type:"add_brick",row:selected_row});
}

function select_brick (type, row, shape) {
    var inner_html = ""
    if ((type=="brick") && (timing_diagram.canvas[row].shapes.length>0)) {
        switch (timing_diagram.canvas[row].shapes[shape].type) {
            case "clk_pos":
                inner_html += '<div class="brick_control">Selected clk-pos</div>';
                inner_html += '<div class="brick_control"><label>Frequency:</label><input type="number" value=1 onchange="mod_change_freq('+row+','+shape+',this.value)"></div>';    
                inner_html += '<div class="brick_control"><label>Up arrow?:</label><input type="checkbox" onclick="mod_up_arrow('+row+','+shape+',this.checked)"></div>';    
                inner_html += '<div class="brick_control"><label>Down arrow?:</label><input type="checkbox" onclick="mod_down_arrow('+row+','+shape+',this.checked)"></div>';    
                inner_html += '<div class="brick_control"><label># Repeats?:</label><input type="number" value=0 onchange="mod_repeat_shape('+row+','+shape+',this.value)"></div>';  
                inner_html += '<div class="brick_control"><label onclick="mod_remove_brick('+row+','+shape+')">Remove brick:</label></div>';      
            break;
            case "sine":
                inner_html += '<div class="brick_control"><label>Frequency:</label><input type="number" value=1 onchange="mod_change_freq('+row+','+shape+',this.value)"></div>';    
                inner_html += '<div class="brick_control"><label>Phase Shift:</label><input type="number" value=1 onchange="mod_change_phase('+row+','+shape+',this.value)"></div>';    
                inner_html += '<div class="brick_control"><label># Repeats?:</label><input type="number" value=0 onchange="mod_repeat_shape('+row+','+shape+',this.value)"></div>';    
            break;
        }
        document.getElementById("tab_brick").innerHTML = inner_html;
        change_tab("tab_brick");
    } else if (type=="arrow") {
        if (timing_diagram.arrows.length==0) {
            inner_html = "After you have added an arrow, modify its properties here."
        } else {
            inner_html += '<div class="brick_control"><label onclick="mod_chose_hook(0,'+timing_diagram.selected_arrow+')">Chose location of left hook</label></div>';    
            inner_html += '<div class="brick_control"><label onclick="mod_chose_hook(1,'+timing_diagram.selected_arrow+')">Chose location of right hook</label></div>';    
            inner_html += '<div class="brick_control"><label>Select arrow to modify</label></div>';
            inner_html += '<div class="brick_control"><label>'+generate_arrow_dropdown()+'</label></div>';
            inner_html += '<div class="brick_control"><label onclick="delete_arrow()">Delete selected arrow</label></div>';
            inner_html += '<div class="brick_control"><label>'+generate_arrow_end_dropdown()+'</label></div>';
            if (timing_diagram.selected_arrow > -1) {
                arrow_select.fresh=true;
                mod_chose_hook (0,timing_diagram.selected_arrow);
            }
        }
        document.getElementById("tab_arrow").innerHTML = inner_html;
        change_tab("tab_arrow");
    }
}

function delete_arrow() {
    if (timing_diagram.selected_arrow > -1) {
        timing_diagram.arrows.splice(timing_diagram.selected_arrow,1)
        timing_diagram.selected_arrow=-1;
        draw_timing_diagram();
        select_brick ("arrow");
    }
}

function change_class(this_id) {
    document.getElementById(this_id).classList.toggle("active");
    timing_diagram.highlighted_arrow=-1;
    draw_timing_diagram();
}

function highlight_arrow(arrow_id) {
    if (arrow_id != timing_diagram.highlighted_arrow) {
        timing_diagram.highlighted_arrow = arrow_id;
        draw_timing_diagram();
    }
}

function mod_chose_hook (side,id) {
    if (side==0) {
    //    toastr["info"]("Click on the timing diagram to define the 1st arrow anchor", "Anchor 1")
    } else {
     //   toastr["info"]("Click on the timing diagram to define the 2nd arrow anchor", "Anchor 2")
    }
    arrow_select.is_waiting=true;
    arrow_select.side=side;
    arrow_select.id=id;
}

function mod_remove_brick(row,shape) {
    timing_diagram.canvas.splice(timing_diagram.row.shape,1); 
    draw_timing_diagram();    
}

function canvas_click(evt) {
    var offtop = document.getElementById('canvas_holder').offsetTop;
    var canvas = document.getElementById('main_canvas');
    //var arrow_select = window.arrow_select;
    //coordsDiv.value = (evt.clientX - canvas.offsetLeft) + ' ' + (evt.clientY-offtop);
    if (arrow_select.is_waiting) {
        //find row number of where the user just clicked. Then save to the global variable
        var row_num=0;
        var sum_of_heights=0;
        var row_height=0;
        for (i=0;i<timing_diagram.canvas.length;i++){
            row_height = timing_diagram.canvas[i].row_height;
            if ((evt.clientY-offtop) < sum_of_heights+row_height) {
                row_num = i;
                break;
            }
            sum_of_heights += row_height;
        }
        timing_diagram.arrows[arrow_select.id].row_num[arrow_select.side] = row_num;
        timing_diagram.arrows[arrow_select.id].y_percent[arrow_select.side] = ((evt.clientY-offtop)-sum_of_heights)/row_height;
        timing_diagram.arrows[arrow_select.id].x[arrow_select.side] = evt.clientX - canvas.offsetLeft - canvas.parentElement.offsetLeft;
        if (arrow_select.fresh == true) {
            mod_chose_hook(1,arrow_select.id);
            arrow_select.fresh=false;
        }
        else arrow_select.is_waiting=false;
    }
    draw_timing_diagram();
}

function highlight_under_hover(evt){
    var coordsDiv = document.getElementById('coords');
    var canvas = document.getElementById('main_canvas');
    var offtop = document.getElementById('canvas_holder').offsetTop;
    //var el1 = document.getElementById('main_canvas');

    //console.log(canvas.offsetTop-offtop);

    coordsDiv.value = (evt.clientX - canvas.offsetLeft - canvas.parentElement.offsetLeft) + ' ' + (evt.clientY-offtop);
    
    
    //var ctx = canvas.getContext("2d"); 
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    drag_id = ev.target.id;
    temp =  ev.target.id.split("row")
    drag_row_num = Number(temp[1][0]);
}

function drop(ev) {
    ev.preventDefault();
    var offtop = document.getElementById('canvas_holder').offsetTop;
    
    //calculate sum of heights of previous rows
    var sum_heights=0;
    for (i=0;i<drag_row_num;i++) {
        sum_heights += timing_diagram.canvas[i].row_height;
    }
    var new_height = Math.min(Math.max(ev.clientY - offtop - sum_heights,20),300); //new height can't be less than 10 or >300
    timing_diagram.canvas[drag_row_num].row_height = new_height;

    draw_timing_diagram();
}

function row_select(rownum) {
    for (i=0; i<timing_diagram.canvas.length;i++) {
        if (i==rownum){
            timing_diagram.selected_row=i;
            document.getElementById("row"+i+"_label").classList.add("selected");
        } else {
            document.getElementById("row"+i+"_label").classList.remove("selected");
        }
    }
}

function addRowAbove() {
    addToIndex(timing_diagram.selected_row)
}
function addRowBelow() {
    addToIndex(timing_diagram.selected_row+1)
}
function deleteRow() {
    timing_diagram.canvas.splice(timing_diagram.selected_row,1); 
    draw_timing_diagram();
}

function addToIndex(i) {
    timing_diagram.canvas.splice(i, 0, 
    {
        row_height:50,
        current_x:0,
        y_offset:0,
        shapes:[]     
    },);
    draw_timing_diagram();
}

function KeyPress(e) {
    var evtobj = window.event ? event : e
    if (evtobj.keyCode == 90 && evtobj.ctrlKey) undo();
    if (evtobj.keyCode == 89 && evtobj.ctrlKey) redo();
}

document.onkeydown = KeyPress;

function undo() {
    if (last_move.length>0) {
        to_undo=last_move.pop();
        if (to_undo.type == "add_brick") {
            console.log(to_undo);
            timing_diagram.canvas[to_undo.row].shapes.pop();
        }
        draw_timing_diagram();
        //console.log(last_move);
    }
}

function mod_change_freq(row,shape,new_freq) {
    if (new_freq>0) {
        timing_diagram.canvas[row].shapes[shape].freq=new_freq;
        draw_timing_diagram();
    } else {
        error_message('Frequency must be greater than 0...')
    }
}

function mod_change_phase(row,shape,new_phase) {
    //if (new_phase>0) {
        timing_diagram.canvas[row].shapes[shape].phase=new_phase;
        draw_timing_diagram();
    //} else {
    //    error_message('Phase must be greater than 0...')
    //}
}

function mod_repeat_shape(row,shape,repeats) {
    if (repeats>0) {
        timing_diagram.canvas[row].shapes[shape].repeats=parseInt(repeats);
        draw_timing_diagram();
    } else {
        error_message('Number of repeats must be greater than 0...')
        
    }
}

//display an error message and wipe the canvas
function error_message(msg) {
    swal({
        type: 'error',
        title: 'Oops...',
        text: msg,
        footer: 'Please fix the error'
    })
   // var canvas = document.getElementById('main_canvas');
   // var ctx = canvas.getContext("2d");
   // ctx.clearRect(0,0,canvas.width,canvas.height);
   // ctx.stroke();
}

function mod_up_arrow(row,shape,checked) {
    timing_diagram.canvas[row].shapes[shape].up_arrow=checked;
    draw_timing_diagram();
}

function mod_down_arrow(row,shape,checked) {
    timing_diagram.canvas[row].shapes[shape].down_arrow=checked;
    draw_timing_diagram();
}

function download(){
   // image=document.getElementById("canvas_holder")
   // image.toDataURL("image/png");

    var canvas = document.getElementById("main_canvas");
    var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); //Convert image to 'octet-stream' (Just a download, really)
    window.location.href = image;
}

function change_tab(tab_id) {
    //hide all the tabbed elements, and then display the selected one
    document.getElementById("tab_main").style.display = "none";
    document.getElementById("tab_arrow").style.display = "none";
    document.getElementById("tab_brick").style.display = "none";

    document.getElementById("tab_tab_main").style.backgroundColor = "#2c3e50";
    document.getElementById("tab_tab_arrow").style.backgroundColor = "#2c3e50";
    document.getElementById("tab_tab_brick").style.backgroundColor = "#2c3e50";
    
    document.getElementById(tab_id).style.display = "block";
    document.getElementById("tab_"+tab_id).style.backgroundColor = "#000000";
}