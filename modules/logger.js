modules.push({"name":"Logger","desc":"mewtwo logging class."});
Logger = function(file) {
	var handle = lib.fs.createWriteStream(file,{flags:'r+'});
	
	this.info = function(str,source){ logLine(str,"info",source); }
	this.warn = function(str,source) { logLine(str,"warn",source); }
	this.fatal = function(str,source) { logLine(str,"fatal",source); }
	
	function logLine(str,type,source) {
		handleLine("["+(typeof source != "undefined" ? source : "CORE")+"] ["+type.toUpperCase()+"] "+str);
		if (type=="fatal") process.exit(1);
	}
	function handleLine(str){
		str = " ["+timestamp()+"] "+str;
		handle.write(str+"\r\n");
		console.log(str);
	}
	function timestamp(){
		var d=new Date();
		
		str=d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
		return str;
	}
}