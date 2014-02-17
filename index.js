var localStatus = {
	// when starting up, if we not have a definitive room we go to global room
	identifier : 'r2d2',
	actualRoom : 'global'
} ;

var readyParties = {

} ;

var commands = {
	echo: function(identifier,value){
		sendMessage('echo','Hello, I\'m ' + localStatus.identifier + ', you said: ' + value) ;
	},
	room: function(action,value){
		if (action === 'goto'){
			socket.emit('unsubscribe',{room:localStatus.actualRoom});
			localStatus.actualRoom = value ;
			socket.emit('subscribe',{room:localStatus.actualRoom});
			sendMessage('ready',localStatus.identifier) ;
		}
	},
	ready: function(identifier){
		// dummy command
		readyParties[identifier] = true ;
	},
	404: function(error){
		explain('Received error 404: '+error) ;
	},
	500: function(error){
		explain('Received error 500: '+error) ;
	}
};

function explain(data){
	var util = require('util') ;
	console.log('----- Explaining -----\n' + util.inspect(data) + '\n===== Explaining =====') ;
}

function parseMessage(data){
	// es: /echo/ciao
	// reply with /echo/ciao
	// or
	// es: /digitalout/13
	// reply with the value of the pin 13 in digital mode....
	// or 
	// es: /digitalout/13/1
	// sets the value to on of the pin 13
	// or
	// es: /camera/snapshot
	// takes a photo with the camera

	// changing to a room
	// /room/goto/<roomname>

	explain('RX: ' + data.message + ' from: ' + data.identifier) ;

	var elements = data.message.split('/') ;
	explain('Elements:' + elements);

	var commandName = elements[1] ;

	if (commands[commandName] === undefined){
		return sendError(404,'unknown command: ' + commandName) ;
	}

	var paramName = elements[2] ;

	if (elements.length == 3){
		// executes the received command
		try{
			commands[commandName](data.identifier,paramName) ;
		} catch (err){
			sendError(500,err.message) ;
		}
	} else if (elements.length == 4){
		var paramValue = elements[3] ;
		// executes the received command
		try{
			commands[commandName](data.identifier,paramName,paramValue) ;
		} catch (err){
			sendError(500,err.message) ;
		}
	}
}

function sendError(code,error){

	var message = '/'+code+'/'+error ;
	var data = {
		identifier : localStatus.identifier,
		message : message
	} ;
	explain('Error: ' + message) ;
	socket.emit('message',data) ;
}

function sendMessage(commandName,paramName,paramValue){
	var message = '/'+commandName+'/'+paramName ;
	if (paramValue !== undefined){
		message += '/'+paramValue ;
	}
	explain('TX: ' + message) ;
	var data = {
		identifier : localStatus.identifier,
		message : message
	} ;
	socket.emit('message',data) ;
}

function connect(hostname,hostport,identifier,room){

	localStatus.identifier = identifier || localStatus.identifier ;
	localStatus.actualRoom = room || localStatus.actualRoom ;

	var io = require('socket.io-client');
	socket = io.connect(hostname, {
	    port: hostport
	});

	socket.on('connect', function () {
		explain('socket connected');

		socket.on('disconnect', function(){
			explain('disconnect') ;
		});

		socket.on('message',function(data){
			parseMessage(data) ;
		});
	});

	commands.room('goto',localStatus.actualRoom) ;
}

module.exports.connect = connect ;
module.exports.commands = commands ;
module.exports.localStatus = localStatus ;
module.exports.sendMessage = sendMessage ;


