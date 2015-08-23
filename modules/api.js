// API that provides the plugins with data and hooks.
mewApi = function(cfg,plugin){
	parent=this;
	
	this.self = cfg;
	
	this.log = {
		info:function(str) { log.info(str,parent.self.name); },
		warn:function(str) { log.warn(str,parent.self.name); },
		fatal:function(str) { log.fatal(str,parent.self.name); }
	}
	// Events stuff.
	this.Event = {
		on:function(name,cb){
			if (typeof plugin.handlers[name.toLowerCase()] == "undefined") plugin.handlers[name.toLowerCase()] = [];
			plugin.handlers[name.toLowerCase()].push(cb);
		}
	}
	
	// IRC Stuff
	this.message = function(dest,msg){
		Client.message(dest,msg,parent.self.name);
	}
	
	this.irc = Client;
}