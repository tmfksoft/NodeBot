Events = new function(){
	callbacks = {};
	this.on = function(type,cb){
		if (typeof callbacks[type.toLowerCase()] == "undefined") {
			callbacks[type.toLowerCase()] = [];
		}
		callbacks[type.toLowerCase()].push(cb);
	}
	this.invoke = function(type){
		var args = [];
		for (var i in arguments) { args.push(arguments[i]); }
		args.splice(0,1);
		// Core Events
		if (typeof callbacks[type.toLowerCase()] != "undefined") {
			callbacks[type.toLowerCase()].forEach(function(cb){
				cb.apply(cb,args);
			});
		}
	}
	this.invokePlugins = function(type){
		var args = [];
		for (var i in arguments) { args.push(arguments[i]); }
		args.splice(0,1);
		// Plugin Events
		plugins.forEach(function(p){
			if (typeof p.handlers[type.toLowerCase()] != "undefined") {
				p.handlers[type.toLowerCase()].forEach(function(cb){
					cb.apply(cb,args);
				});
			}
		});
	}
}
Events.on('message',function(user,dest,message){
	if (dest instanceof Channel) {
		log.info("["+dest.name+"] <"+user.nick+"> "+message);
	} else {
		log.info("["+dest.nick+"] <"+user.nick+"> "+message);
	}
});