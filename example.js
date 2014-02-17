var remoterclient = require('../remoter-client') ;

var digitalPins = {
	'13':false
} ;

// connecting to remoter on localhost, port 3700 with 'C1B8' as identifier, in the default 'global' room
remoterclient.connect('http://localhost',3700,'C1B8') ;

// registering a command for driving a (fake) digital pin

// After launching this try in the console to send:
// /digitalout/13
// will read the status of digital pin number 13
// /digitalout/13/1 
// will set the status of digital pin number 13 to 1
remoterclient.commands.digitalout = function(identifier,pin,value){
	if (value){
		digitalPins[pin] = value ;
	} else {
		remoterclient.sendMessage('digitalout',pin,digitalPins[pin]);
	}
};