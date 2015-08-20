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
	this.Events = {
		register:function(name,cb){
			if (typeof plugin.handlers[name.toLowerCase()] == "undefined") plugin.handlers[name.toLowerCase()] = [];
			plugin.handlers[name.toLowerCase()].push(cb);
		}
	}
}