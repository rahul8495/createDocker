const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function getPort() {
    return new Promise(resolve => {
        fs.readFile('port.txt', 'utf8' , (err, data) => {
            if (err) {
              console.error(err)
              resolve(0);
            }
            else{
            console.log(data)
             resolve(data);

             fs.writeFile('port.txt',String(Number(data)+1), (err, data)=> {
                 if(err){
                     console.log(err)
                     return
                 }
                 console.log("successfully file updated");
             })
            }
          })
    })
    
} 

app.post("/writedocker", async (req,res)=> {

     const port = await getPort();

    console.log("port ;- " ,port);
    if(port === 0){
        console.log("this is not a valid port");
        res.status(500).send("Internal error due to port");
        return 
    }

    var portNo = port;
    var botId = req.body.botId
console.log(req.body)
    const content = `version: '3',
    services:
        rasa:
          container_name: "${botId}",
          build:
            context: backend
          ports:
            - "${portNo}:${portNo}"`;

    fs.writeFile('D:/officeprojects/docker-compose.yml', content, err => {
        if (err) {
          console.error(err)
          return
        }
      })

      const content2 = `FROM rasa/rasa:1.5.0

      WORKDIR /app
      COPY . /app
      COPY ./data /app/data
      
      RUN  rasa train
      
      VOLUME /app
      VOLUME /app/data
      VOLUME /app/models
      
      
      CMD [ "run","-m", "/app/models","--enable-api","--cors","*","--debug", "-p","${portNo}" ]`

      fs.writeFile('Dockerfile', content2, err => {
        if (err) {
          console.error(err)
          return
        }
        console.log("file written successfully");
      })

    res.send("working..............");
})

console.log("listening on port 3005");
app.listen(3005);