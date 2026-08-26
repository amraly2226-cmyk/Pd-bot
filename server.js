   const express = require('express');
   const app = express();
   const PORT = process.env.PORT || 3000;
   app.get('/', (req,res)=>res.send('PD-Bot LIVE - No crash!'));
   app.listen(PORT, ()=>console.log('✅ Server started on ' + PORT));
