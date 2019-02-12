//Plotly.newPlot('myDiv', data, {paper_bgcolor: 'rgba(255,255,255,0.2)', plot_bgcolor: 'rgba(255,255,255,0.0)', showlegend: false,margin:layout.margin, height:layout.height,width:layout.width,hovermode:layout.hovermode,xaxis:layout.xaxis,yaxis:layout.yaxis,shapes:layout.shapes.concat(layout_shapes)});	

function rand() {
    return Math.random();
  }
  
  Plotly.plot('myDiv', [{
    y: [1,2,3].map(rand),
    mode: 'lines',
    line: {color: '#80CAF6'}
  }]);
  
  var cnt = 0;
  
  var interval = setInterval(function() {
  
    Plotly.extendTraces('myDiv', {
      y: [[rand()]]
    }, [0])
    cnt = cnt+1;
    if(cnt === 100) clearInterval(interval);
  }, 30);

  var device;

document.getElementById("ble_button").addEventListener('pointerup', function(event) {
    navigator.usb.requestDevice({ filters: [{ vendorId: 0x2341 }] })
    .then(selectedDevice => {
    device = selectedDevice;
    return device.open(); // Begin a session.
    })
    .then(() => device.selectConfiguration(1)) // Select configuration #1 for the device.
    .then(() => device.claimInterface(2)) // Request exclusive control over interface #2.
    .then(() => device.controlTransferOut({
        requestType: 'class',
        recipient: 'interface',
        request: 0x22,
        value: 0x01,
        index: 0x02})) // Ready to receive data
    .then(() => device.transferIn(5, 64)) // Waiting for 64 bytes of data from endpoint #5.
    .then(result => {
    let decoder = new TextDecoder();
    console.log('Received: ' + decoder.decode(result.data));
    })
    .catch(error => { console.log(error); });
});


// document.getElementById("ble_button").addEventListener('pointerup', function(event) {
//     navigator.bluetooth.requestDevice({
//         acceptAllDevices: true,
//         optionalServices: ['battery_service']
//         })
//         .then(device => {console.log(device.name);})
//         .catch(error => { console.log(error); });
// });