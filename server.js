console.log("=== SERVER START ===");
const http = require('http');
const port = process.env.PORT || 3000;
http.createServer((req,res)=>{
  res.writeHead(200);
  res.end("Bot is running");
}).listen(port, ()=> console.log("Listening on "+port));

setInterval(()=> console.log("شغال... " + new Date().toLocaleTimeString()), 5000);
