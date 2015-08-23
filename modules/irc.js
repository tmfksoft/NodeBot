IRC = function(){
	this.sock = null;
	this.channels = []; // All channels the bot is in.
	this.users = []; // All known users (Online?)
	
	// Self
	this.nick = "";
	this.username = "";
	this.realname = "";
	
	// Some magic
	this.pref = "IRC"; /* Logging prefix */
	
	this.connect = function(options){
		var def = {};
		def.host = "irc.smallirc.in";
		def.port = "6667";
		client=this;
		for (var i in options) {
			def[i] = options[i];
		}
		this.sock = lib.net.connect(def,function(){
			log.info("Connecting to "+def.host+":"+def.port,client.pref);
		});
		this.sock.on('connect',function(){
			log.info("Socket Connected!",client.pref);
			client.write("NICK "+client.nick);
			client.write("USER "+client.username+" 0 * :"+client.realname);
		});
		this.sock.on('data',function(d){
			var lines = d.toString().split("\n");
			lines.forEach(function(l){
				var line = l.trim();
				if (line=="") return;
				if (!client.onLine(line)) log.info("[<] "+line,client.pref);
			});
		});
	}
	
	this.write = function(str){
		// Accepts templating!
		if (this.sock == null) {
			log.warn("Unable to write data to socket. Not connected!",this.log);
			return;
		}
		//log.info("[>] "+str,this.pref);
		this.sock.write(str+"\n");
	}
	this.onLine = function(str){
		var ex = str.split(" ");
		if (ex[0] == "PING") {
			this.write("PONG "+ex[1]);
			Events.invoke("ping");
			return true;
		}
		if (ex.length > 1) {
			if (ex[1] == "PRIVMSG") {
				var message = ex.slice(3).join(" ").substr(1);
				var dest;
				if (ex[2][0] == "#") {
					dest = this.getChannel(ex[2]);
				} else {
					dest = this.getUser(ex[2]); // Always myself but C:
				}
				var user = this.getUser(ex[0].substr(1),true);
				
				console.log(user);
				
				Events.invoke("message",user,dest,message);
				Events.invokePlugins("message",user,dest,message);
				return true;
			}
			
			// MOTD
			if (ex[1] == "372") {
				var message = ex.slice(3).join(" ").substr(1);
				log.info("[MOTD] "+message);
				return true;
			}
			
			// WHOIS
			if (ex[1] == "311") {
				var nick = ex[3];
				var u = this.getUser(nick);
				u.nick = nick; // Whois corrects casing
				u.username = ex[4];
				u.host = ex[5];
				u.realname = ex.slice(7).join(" ").substr(1);
			}
			
			// TOPIC
			if (ex[1] == "332") {
				var ch = this.getChannel(ex[3],true);
				ch.topic.text = ex.slice(4).join(" ").substr(1);
				log.info("["+ex[3]+"] Topic is '"+ch.topic.text+"'");
				return true;
			}
			if (ex[1] == "333") {
				var ch = this.getChannel(ex[3],true);
				ch.topic.setter = this.getUser(ex[4],true);
				ch.topic.stamp = ex[5];
				log.info("["+ex[3]+"] Set by "+ex[4]);
				return true;
			}
		}
		
		return false;
	}
	this.getChannel = function(name,insert){
		// Tries to get a channel if it fails it creates a new one.
		for (var i in this.channels) {
			if (this.channels[i].name.toLowerCase() == name.toLowerCase()) {
				return this.channels[i];
			}
		}
		var n = new Channel();
		n.name = name;
		
		if (typeof insert != "undefined" && insert) this.channels.push(n);
		return n;
	}
	this.getUser = function(mask,insert){
		var nick = "*";
		var username = "*";
		var host = "*";
		
		if (mask.indexOf("!") >= 0) {
			// It's most likely a mask.
			var ex = mask.split("!");
			var nick = ex[0];
			
			if (ex[1].indexOf("@") >= 0) {
				ex = ex[1].split("@");
				var username = ex[0];
				var host = ex[1];
			}
			
		} else {
			// Just a nickname
			nick = mask;
		}
		
		for (var i in this.users) {
			// Magic.
			var user = this.users[i];
			
			var nMatch = false;
			var hMatch = false;
			var uMatch = false;
			
			if (nick == "*") {
				nMatch=true;
			} else {
				if (user.nick.toLowerCase() == nick.toLowerCase()) {
					nMatch=true;
				}
			}
			
			if (host=="*") {
				hMatch=true;
			} else {
				if (host != "") {
					if (user.host.toLowerCase() == host.toLowerCase()) {
						hMatch=true;
					}
				}
			}
			
			if (username="*") {
				uMatch=true;
			} else {
				if (username != "") {
					if (user.username.toLowerCase() == username.toLowerCase()) {
						uMatch=true;
					}
				}
			}
			
			if (uMatch && hMatch && nMatch) return user;
			
		}
		// No such user, create them
		var u = new User();
		u.nick = nick;
		u.host = host;
		u.username = username;
		if (typeof insert != "undefined" && insert) {
			this.users.push(u);
			this.write("WHOIS "+nick);
		}
		return u;
	}
	
	
	// IRC Functions
	this.message = function(dest,msg,plugin){
		if (typeof plugin == "undefined") plugin=null;
		this.write("PRIVMSG "+dest+" :"+msg);
		
		var user = this.getUser(this.nick); // Myself
		if (dest[0] == "#") {
			var dest = this.getChannel(dest);
		} else {
			var dest = this.getUser(dest);
		}
		
		Events.invoke("message",user,dest,msg);
	}
};

// Types.
Channel = function(){
	this.name = null;
	this.topic = {"text":null,"setter":null,"stamp":null};
	this.userlist = [];
	this.modes = [];
	this.bans = []; // Not in use yet.
	this.history = []; // Chat history.
}
User = function(){
	this.nick = "";
	this.username = "";
	this.host = "";
	this.realname = "";
	this.channels = [];
	this.modes = [];
	
	this.getMask = function(){
		return this.nick+"!"+this.username+"@"+this.host;
	}
}
Message = function(){
	this.user = null; /* OfflineUser */
	this.text = ""; /* Content */
	this.modes = []; /* Channel modes of the user */
	this.stamp = null;
}