console.log("MewTwo Script Alive");

// Requirements.
lib = {};
lib.fs = require('fs');
lib.vm = require('vm');

modules = [];

// Load Modules.
require('./modules/logger.js');
require('./modules/api.js');


// Start Bot.
log = new Logger("mewtwo.log"); /* Replace with stamp */
log.info("MewTwo bot starting up!");

handlers = {}; // Event Handlers for Plugins.
plugins = [];
log.info("Loading plugins");

lib.fs.readdir("./plugins/", function(err,files){
	if (err) { log.fatal(e.stack); }
	files.forEach(function(f){
		lib.fs.exists("./plugins/"+f+"/module.js",function(r){
			if (r) {
				lib.fs.exists("./plugins/"+f+"/package.json",function(r){
					if (r) {
						lib.fs.readFile("./plugins/"+f+"/package.json",function(err,body){
							try {
								cfg = JSON.parse(body);
							} catch (e) {
								return;
							}
							log.info("Loading plugin",cfg.name)
							lib.fs.readFile("./plugins/"+f+"/module.js",function(err,body){
								if (err) log.fatal(e.stack);
								var plugin = {};
								
								var code = body.toString();
								var context = {};
								
								plugin.path = "./plugins/"+f+"/";
								plugin.context = context;
								plugin.handlers = {};
								plugins.push(plugin);
								context.mew = new mewApi(cfg,plugin);
								plugin.vm = lib.vm.runInNewContext(code,context);
								
								
							});
						});
					} else {
						log.warn("Unable to load '"+f+"', missing package.json file.");
					}
				});
			} else {
				log.warn("Unable to load '"+f+"', missing module.js file.");
			}
		});
	});
});

log.info("Enabling Plugins");
plugins.forEach(function(p){
	console.log(p);
	if (typeof p.handlers['enable'] != "undefined") {
		p.handlers['enable'].forEach(function(cb){
			cb();
		});
	}
});

process.on('exit',function(sig){
	log.info("Process Closing with signal "+sig);
});