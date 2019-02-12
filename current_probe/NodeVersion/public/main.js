var i_na=0;
var i_ua=0;
var i_ma=0;
var samples_per_grid = 10;
var grids_per_graph = 10;
var samples_per_data_point = 1;
var time_unit = 1000e-6;
var grid_width = 10e-3;
var fps = 10;
var total_points = samples_per_grid * grids_per_graph;
var last_result_time=0;

var y_scaler=1;

var samples = 20;
var speed = 1000;
var values_high = [];
var values_low = [];
var labels = [];
var charts = [];
var value = 1;
var scale = 1;
var unplotted_array = [];
var next_unplotted_array = [];
var i=0;
var result_time=0;
var result_data=0;

var connections = "";          // list of connections to the server

var socket = new WebSocket("ws://localhost:8081");  //opens a socket


/*MUST ADD SOME DEBUG, WHAT IF THE SOCKET DIDN'T OPEN, OR THE RESET DOESN'T WORK?*/
function refresh_npm(){
  if (socket.readyState === WebSocket.OPEN)  {
    console.log("refreshing");
    socket.send("refresh");
    last_result_time=0;
  }
  i_na=0;
  i_ua=0;
  i_ma=0;
  $('#knob_y_offset_ma').val(0).trigger('change');
  $('#knob_y_offset_ua').val(0).trigger('change');
  $('#knob_y_offset_na').val(0).trigger('change');
  $('#knob_time_scale').val(0).trigger('change');
  $('#knob_y_scale').val(0).trigger('change');
  document.getElementById("com_status").innerHTML="COM CLOSED";
}

socket.onconnection=onconnection;
socket.onopen=onopen;
socket.onmessage = showData; // when a client sends a message,
socket.onclose=onclose;
socket.onerror =onerror;

function onconnection() { 
  console.log("New Connection"); 
};
function onopen() { 
  console.log("Socket has been opened, yay!!")
  document.getElementById("node_status").innerHTML="Connected";
  //check if user defined a COM port before - connect to previous port
  refresh_npm()
};
function onclose() { // when a client closes its connection
  console.log("connection closed"); // print it out
  document.getElementById("node_status").innerHTML="Closed";
  $.notify("Disconnected from Node...", "warn");
};

function onerror(evt) {
  $.notify("Failed to connect to Node...\n" + evt, "error");
};

// a function to toggle connection to Node. opens and closes the websocket
function connect_to_node() {
  if (socket.readyState === WebSocket.OPEN)  {
    socket.close();
  } else {
    //socket.close();
    socket = new WebSocket("ws://localhost:8081");  //opens a socket
    socket.onconnection=onconnection;
    socket.onopen=onopen;
    socket.onmessage = showData; // when a client sends a message,
    socket.onclose=onclose  
    socket.onerror=onerror;
  }
}

function select_com(com_id) {
  console.log("Connecting to " + com_id);
  socket.send("COM,"+com_id);
}

function showData(result) {
  // when the server returns, show the result in the div:
  //console.log(result.data);
  split_results=result.data.split(',');
 // console.log("Sensor reading:" + split_results);
  if (split_results[0]=="COM"){
    if (split_results[1]=="OPEN") {
      document.getElementById("com_status").innerHTML="COM OPEN a";
    } else if (split_results[1]=="CLOSED") {
      document.getElementById("com_status").innerHTML="COM CLOSED a";
    } else {
      console.log("GOT A LIST OF COM PORTS",split_results);
      var select = document.getElementById("COM_list");
      select.innerHTML="";
      split_results[0] = "SELECT A COM"
      for(var i=0; i<split_results.length;i++) {
        opt=document.createElement('option');
        opt.value=split_results[i];
        opt.innerHTML = split_results[i]; // whatever property it has
        // then append it to the select element
        select.appendChild(opt);
      }
    }
  } else {
    result_time = Number(split_results[0]);
    result_data = Number(split_results[1]); 
    if ((result_time  % samples_per_data_point)==0) { //!! THIS IS NOT GOOD! LOOK for >!
      //plot the data
      unplotted_array.sort(function(a, b){
        return a - b;
      });
      result_high = unplotted_array[0]/y_scaler;
      result_low = unplotted_array[unplotted_array.length-1]/y_scaler;

      values_high.unshift({
        x: result_time/samples_per_data_point,
        y: result_high
      });
      values_low.unshift({
        x: result_time/samples_per_data_point,
        y: result_low
      });
      if (values_high.length>total_points) {
        values_high.pop();
      }
      if (values_low.length>total_points) {
        values_low.pop();
      }
      unplotted_array = [];
      last_result_time = result_time;
    }
    //add new data to next array
    unplotted_array.push(result_data);
  }
}


//When the user changes a knob, clear the results array and change the axes
function update_settings () {

  samples_per_data_point = (grid_width / samples_per_grid) / time_unit;

  for (i=0;i<=total_points;i++){
    values_high.push({
      x: i,
      y: 0
    });
    values_low.push({
      x: i,
      y: -0.1
    });
    labels.push(i)
  }
}

var options = {
  events: [],
  animation: {
      duration: 0, // general animation time
  },
  hover: {
      animationDuration: 0, // duration of animations when hovering an item
  },
  responsiveAnimationDuration: 0, // animation duration after a resize
  responsive: true,
  legend: false,
  scales: {
    xAxes: [{
      display: true,
      gridlines:{
        display:true,
      },
      ticks: {
        display:true,
        maxTicksLimit:10,
        stepSize:1,
        min:0,
        max:100,
        precision:0,
        beginAtZero:true
      }
    }],
    yAxes: [{
      ticks: {
        max: 70000,
        min: 0
      }
    }]
  }
}

function initialize() {

  update_settings ();

  speed = 1000 / fps; //time between plots in ms

  for (i=0;i<=total_points;i++){
    labels.push(i)
  }


  charts.push(new Chart(document.getElementById("chart0"), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        data: values_high,
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        lineTension: 0,
        pointRadius: 0,
        fill: '+1'
      },{
        data: values_low,
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        lineTension: 0,
        pointRadius: 0,
        fill: '-1'
      }]
    },
    options: options,
  }));
}

function updateCharts(){
  charts.forEach(function(chart) {
    chart.update();
  });
}


function advance() {
  updateCharts();
  
  setTimeout(function() {
	  advance();
  }, speed);
}

function update_time_scale(value) {
  console.log("Time scaler is: " + time_scale_options[value].mx);
  grid_width=time_scale_options[value].mx / 1000;
  update_settings ()
}

function update_y_scale(value) {
  console.log("Y scaler is: " + y_scale_options[value].mx);
  y_scaler = y_scale_options[value].mx;
}

function update_y_offset() {
  var y_offset = (i_na + i_ua*1000 + i_ma*1000000);
  console.log("Y offset is: " + y_offset + "nA");

 /* options.scales.yAxes=[{
    ticks: {
      max: 70000+y_offset,
      min: y_offset
    }
  }];*/

  charts.forEach(function(chart) {
    chart.options.scales.yAxes=
    [{
      ticks: {
        max: 70000+y_offset,
        min: y_offset
      }
    }];
  });

}

var time_scale_options = [
  {text:'5ms',  mx:5},
  {text:'10ms', mx:10},
  {text:'20ms', mx:20},
  {text:'50ms', mx:50},
  {text:'100ms',mx:100},
  {text:'200ms',mx:200},
  {text:'500ms',mx:500},
  {text:'1s',   mx:1000},
  {text:'2s',   mx:2000},
  {text:'5s',   mx:5000},
  {text:'10s',  mx:10000},
  {text:'5ms',  mx:5},
];

var y_scale_options = [
  {text:'10n',  mx:1},
  {text:'20n',  mx:2},
  {text:'50n',  mx:5},
  {text:'100n', mx:10},
  {text:'200n', mx:20},
  {text:'500n', mx:50},
  {text:'1u',   mx:100},
  {text:'2u',   mx:200},
  {text:'5u',   mx:500},
  {text:'10u',  mx:1000},
  {text:'20u',  mx:2000},
  {text:'50u',  mx:5000},
  {text:'100u', mx:10000},
  {text:'200u', mx:20000},
  {text:'500u', mx:50000},
  {text:'1m',   mx:100000},
  {text:'2m',   mx:200000},
  {text:'5m',   mx:500000},
  {text:'10m',  mx:1000000},
  {text:'20m',  mx:2000000},
  {text:'50m',  mx:5000000},
  {text:'100m', mx:10000000},
  {text:'10n',  mx:1},
]


/*Draw the time-scale selector knob*/
$(function() {
  $("#knob_time_scale").knob({
    fgColor:"#222222",
    width:150,
    cursor:20,
    min:0,
    max:11,
    height:150,
    thickness:.3,
    displayPrevious:true,
    release: function() {update_time_scale(this.cv)},
    draw: function() { $(this.i).css('font-size', '22px'); },
    format : function (value) { return time_scale_options[value].text; }
  });
});

/*Draw the y-scale selector knob*/
$(function() {
  $("#knob_y_scale").knob({
    fgColor:"#222222",
    width:150,
    cursor:20,
    min:0,
    max:22,
    height:150,
    thickness:.3,
    displayPrevious:true,
    release: function() {update_y_scale(this.cv)},
    draw: function() { $(this.i).css('font-size', '22px'); },
    format : function (value) { return y_scale_options[value].text; }
  });
});

/*Draw the y-offset selector knobs*/
$(function() {
  var old_val=0;
  var old_old_val=0
  $("#knob_y_offset_ma").knob({
    fgColor:"#222222",
    width:85,
    cursor:20,
    min:0,
    max:20,
    height:85,
    thickness:.3,
    stopper:false,
    displayPrevious:true,
    //displayPrevious:true,
    release: function(value) {
      if((i_ma==0) && (value!=0)) this.val(0).trigger('change');
      update_y_offset()
    },
    draw: function() { $(this.i).css('font-size', '14px'); },
    format: function (value) {
      if ((value>old_val) && (old_val>old_old_val)) {
        if(i_ma<990) i_ma=i_ma+10;
      } else if ((value<old_val) && (old_val<old_old_val)) {
        if(i_ma>0) i_ma=i_ma-10;
       // i_ma=check_dec(i_ma)
       // i=i-10;
      }
      if (value != old_val) {
        old_old_val = old_val;  
        old_val = value;
      }
      return i_ma + 'mA';
    }
  });
});
$(function() {
  var old_val=0;
  var old_old_val=0
  $("#knob_y_offset_ua").knob({
    fgColor:"#222222",
    width:85,
    cursor:20,
    min:0,
    max:20,
    height:85,
    thickness:.3,
    stopper:false,
    displayPrevious:true,
    //displayPrevious:true,
    release: function(value) {
      if((i_ua==0) && (value!=0)) this.val(0).trigger('change');
      update_y_offset()
    },
    draw: function() { $(this.i).css('font-size', '14px'); },
    format: function (value) {
      if ((value>old_val) && (old_val>old_old_val)) {
        if(i_ua<990) i_ua=i_ua+10;
      } else if ((value<old_val) && (old_val<old_old_val)) {
        if(i_ua>0) i_ua=i_ua-10;
        //i_ua=check_dec(i_ua);
      }
      if (value != old_val) {
        old_old_val = old_val;  
        old_val = value;
      }
      return i_ua + 'uA';
    }
  });
});
$(function() {
  var old_val=0;
  var old_old_val=0
  $("#knob_y_offset_na").knob({
    fgColor:"#222222",
    width:85,
    cursor:20,
    min:0,
    max:20,
    height:85,
    thickness:.3,
    displayPrevious:true,
    stopper:false,
    //displayPrevious:true,
    release: function(value) {
      if((i_na==0) && (value!=0)) this.val(0).trigger('change');
      update_y_offset()
    },
    draw: function() { $(this.i).css('font-size', '14px'); },
    format: function (value) {
      if ((value>old_val) && (old_val>old_old_val)) {
        if(i_na<990) i_na=i_na+10;
      } else if ((value<old_val) && (old_val<old_old_val)) {
        if(i_na>0) i_na=i_na-10;
        //i_na = check_dec(i_na);
      }
      if (value != old_val) {
        old_old_val = old_val;  
        old_val = value;
      }
      return i_na + 'nA';
    }
  });
});

function check_dec(val) {
  if (((i_ma*100000) + (i_ua*1000) + i_na) >= 0){
    return val;
  } else {
    console.log("Your number is below 0")
    return val+10;
  }

}


window.onload = function() {
  initialize();
  advance();
};



