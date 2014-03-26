var http     = require('http'),
    sockjs   = require('sockjs'),
    exec     = require('child_process').exec,
    socket   = sockjs.createServer(),
    config   = require('./config'),
    PlugAPI  = require('plugapi'),
    bot      = new PlugAPI(config.user.key, config.user.updatecode);

socket.on('connection',function(client) {
    child = exec('curl -s -o /dev/null -w "%{http_code}" http://plug.dj', function(err, stdout, stderr){
        if(err !== null) console.log('[Exec Error]: ' + err);
        if (stdout) {
            console.log(stdout);
            if (stdout === '200') {
                bot.connect(config.user.room);
                    bot.on('error',function(e) {
                        console.log('[Connect Error]: ', e);
                        client.write(JSON.stringify({type: 'status', data:{status:stdout,canConnect: 'false'}}))
                        client.close()
                    });
                    bot.on('connected',function() {
                        client.write(JSON.stringify({type: 'status', data:{status:stdout,canConnect: 'true'}}))
                        client.close()
                        bot.disconnect();
                    });
            } else {
                client.write(JSON.stringify({type: 'status', data:{status:stdout,canConnect:'false'}}))
                client.close()
            }
        }
    });
});

var server = http.createServer(function(request,response) {
   response.writeHead(200,{'Content-type':'text/plain'});
   response.end("Hello World");
});

socket.installHandlers(server, {prefix:'/gateway'});
server.listen(2324);
socket.on('error',function(e) { console.error("[SJS Error]: ",e)});
server.on('error',function(e) { console.error("[HTTP Error]: ",e)});
console.log("PlugStatus Utilities online!");