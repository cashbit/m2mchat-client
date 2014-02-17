var remoterclient = require('../remoter-client') ;

// utility function
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// setting up simulation variables
var TempSetPoint = 21 ;
var ClimateSystemOn = false ;
var centInternalTemp = getRandomInt(10,25) * 100 ;

var warmingUp = false ;

var centDegreePerSecondOnWarmingUp = 10;
var centDegreePerSecondOnCoolingDown = -20 ;

// simulation function
function simulateWarming(){
	var deltaTemp = centDegreePerSecondOnCoolingDown ;
	if (warmingUp){
		deltaTemp = centDegreePerSecondOnWarmingUp ;
	}
	centInternalTemp = centInternalTemp + deltaTemp ;
	lastwarmingUp = warmingUp ;
	warmingUp = (centInternalTemp / 100 < TempSetPoint) && ClimateSystemOn ;
	if (warmingUp != lastwarmingUp){
		remoterclient.sendMessage('warmingUp',warmingUp) ;
	}
	remoterclient.sendMessage('internalTemp',centInternalTemp/100) ;
}

// connecting to the remoter with 'thermoregulator' as identifier and 'com.cashbit.home' as room (see websocket rooms)
remoterclient.connect('http://localhost',3700,'thermoregulator','com.cashbit.home') ;

// registering handler for temperature set point reading and setting
remoterclient.commands.temperature = function(identifier,command,value){
	if (command === 'set'){
		TempSetPoint = value ;
	} else if (command === 'read'){
		remoterclient.sendMessage('temperature',TempSetPoint);
	}
};

// registering handler for power on/off
remoterclient.commands.power = function(identifier,command,value){
	if (command === 'set'){
		ClimateSystemOn = value ;
	} else if (command === 'read'){
		remoterclient.sendMessage('power',ClimateSystemOn);
	}
};

// launching simulation
setInterval(function(){
	simulateWarming();
},2000);

