mew.Event.on("enable",function(){
	mew.log.info("test plugin alive!");
});
mew.Event.on("ping",function(){
	mew.log.info("PING PONG!");
});
mew.Event.on("message",function(who,dest,message){
	if (message[0] != prefix) return;
	
	mew.log.info("I have a message!");
	//mew.message(dest.name,who.nick+" > "+message);
	
	var ex = message.substr(1).split(" ");
	
	cmds.forEach(function(cmd){
		var args = ex.slice(1);
		if (ex[0].toLowerCase() == cmd.name.toLowerCase()) {
			cmd.trigger(dest,args);
		}
	});
});

prefix = "@";
cmds = [];
Command = function(name){
	this.name = name;
	this.children = [];
	this.trigger = null;
}

var c = new Command("user");
c.trigger = function(dest,args){
	mew.message(dest.name,"Attempting to get user "+args[0]);
	var u = mew.irc.getUser(args[0],true);
	
	mew.message(dest.name,"nick = "+u.nick);
	mew.message(dest.name,"username = "+u.username);
	mew.message(dest.name,"host = "+u.host);
	mew.message(dest.name,"realname = "+u.realname);
}
cmds.push(c);

var c = new Command("chan");
c.trigger = function(dest,args){
	mew.message(dest.name,"Attempting to get channel "+args[0]);
	var u = mew.irc.getChannel(args[0],true);
	
	mew.message(dest.name,"name = "+u.name);
	mew.message(dest.name,"topic = "+u.topic.text);
	mew.message(dest.name,"topic setter = "+u.topic.setter.getMask());
}
cmds.push(c);