#!/usr/bin/env node
var sys = require("sys");
var tcp = require("tcp");
var test = require("mjsunit");

var stream = [
    ["server", "38 00 00 00"],
    ["server", "0a 35 2e 31 2e 34 33 2d 6c 6f 67 00 7d 13 00 00 52 7a 33 2a 76 38 51 6d 00 ff f7 08 02 00 00 00 00 00 00 00 00 00 00 00 00 00 00 53 39 60 58 79 77 69 2b 36 6f 4e 78 00"],
    ["client", "4f 00 00 01 0d a2 00 00 00 00 00 40 21 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 6e 6f 64 65 6a 73 5f 6d 79 73 71 6c 00 14 3a 92 54 0d f9 cc b8 79 34 04 6c f4 2d a0 69 58 4e cc 01 40 6e 6f 64 65 6a 73 5f 6d 79 73 71 6c 00"], 
    ["sleep", 10*1000],
/*
    ["server", "07 00 00 02"],
    ["server", "00 00 00 02 00 00 00"],
    ["client", "11 00 00 00 03 53 45 54 20 4e 41 4d 45 53 20 27 75 74 66 38 27"],
    ["server", "07 00 00 01"],
    ["server", "00 00 00 02 00 00 00"]
*/
];

var hex2bin = function(str) {
    return str.split(' ').map(function(s){return String.fromCharCode(parseInt(s,16));}).join('');
}

var server = tcp.createServer(function (socket) {
    var write_process = function() {
	if(stream.length>0) {
	    if(stream[0][0]=="server") {
		var line = stream.shift();
		sys.puts("Server> "+line[1]);
		socket.write(hex2bin(line[1]));
		write_process();
	    }
	    else if(stream[0][0]=="sleep") {
		var line = stream.shift();
		sys.puts("Sleep> "+line[1]);
		setTimeout(write_process, line[1]);
	    }
	}
    }
    
    socket.setEncoding("binary");
    socket.addListener("connect", function () {
	sys.puts("Connect");
	write_process(socket);
    });
    socket.addListener("data", function (data) {
	sys.puts("Client< "+data.split('').map(function(s){return ((s.charCodeAt(0)<16?"0":'')+s.charCodeAt(0).toString(16)).substring();}).join(' '));
	var line = stream.shift();
	if(line[0]=="server") {
	    return test.fail();
	}
	if(hex2bin(line[1])!=data) {
	    return test.fail();
	}
      write_process(socket);
    });
    socket.addListener("end", function () {
	socket.close();
	sys.puts("Closed\n");
    });
});
server.listen(33306, "localhost");
