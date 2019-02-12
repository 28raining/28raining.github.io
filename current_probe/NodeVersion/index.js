var NanoTimer = require('nanotimer');

console.log("Hello, and welcome to node.");
//Connect to the serial device
var SerialPort = require('serialport');
const ByteLength = require('@serialport/parser-byte-length')
var Readline = SerialPort.parsers.Readline
//var portName = process.argv[2];


//Set up the socket to from the server
var WebSocketServer = require('ws').Server;
var SERVER_PORT = 8081;               // port number for the webSocket server
var wss = new WebSocketServer({port: SERVER_PORT}); // the webSocket server
var connections = new Array;          // list of connections to the server
var myPort = "";

function showPortOpen() {
	console.log('port open. Data rate: ' + myPort.baudRate);
	broadcast("COM","COM,OPEN")
}
function readSerialData(data) {
	console.log(data);
	//console.log(data.toString('hex'));
	if (connections.length > 0) {
		broadcast("raw",data);
	}
}
function showPortClose() {
   console.log('port closed.');
   broadcast("COM","COM,CLOSED")
}
 
function showError(error) {
	console.log('Serial port error: ' + error);
	//list serial ports:
	console.log('Note - these are the available serial ports...');
	SerialPort.list(function (err, ports) {
	  ports.forEach(function(port) {
		console.log(port.comName);
	  });
	});
}


//Websocket code
wss.on('connection', handleConnection);

function handleConnection(client) {
	console.log("New Connection"); // you have a new client
	connections.push(client); // add this client to the connections array
	
	client.on('message', msg_from_html); // when a client sends a message,
	 
	client.on('close', function() { // when a client closes its connection
		console.log("connection closed"); // print it out
		var position = connections.indexOf(client); // get the client's position in the array
		connections.splice(position, 1); // and delete it from the array
	});
}

var parser = new Readline()

function msg_from_html(data) {
	var port_list = "COM"
	var rx = data.split(',');
	console.log(rx);
	if (rx[0]=='refresh') {
		counter=0;
		SerialPort.list(function (err, ports) {
			ports.forEach(function(port) {
					port_list = port_list + "," + port.comName;
					console.log(port.comName);
			});
			console.log(port_list);
			broadcast("COM",port_list)
		});
	} else if (rx[0]=="COM") {
		console.log("Connecting to port " + rx[1])
		try {
			myPort = new SerialPort(rx[1], {
				baudRate: 115200
			});
			//const parser = myPort.pipe(new ByteLength({length: 2}))
			myPort.pipe(parser)
			parser.on('data', readSerialData) // will have 8 bytes per data event
			myPort.on('open', showPortOpen);
			myPort.on('close', showPortClose);
			myPort.on('error', showError);
		} catch(err){
			console.log("Had an error... " + err)
		}
	}
}

var data=0;
var counter = 0;
// This function broadcasts messages to all webSocket clients
function broadcast(type,data) {
	for (myConnection in connections) {   // iterate over the array of connections
		//console.log(connections[myConnection].readyState)
		if(connections[myConnection].readyState === 1){
			if (type=="test"){
				connections[myConnection].send(counter+','+data); // send the data to each connection
			} else {
				connections[myConnection].send(data); // send the data to each connection
			}
		 }
	}
	//console.log(counter+','+data);
}

function send_test_data(){
	data = Math.min(Math.max(data + (0.1 - Math.random() / 5), -1), 1);
	broadcast("test",data)
	counter++;
}

var timer = new NanoTimer();
//timer.setInterval(send_test_data, '', '5m');
