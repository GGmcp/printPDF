
const fs = require("fs");
const odbc = require('odbc');
const conf = require('./config');

//var server = conf.config.db.server;
//var user = conf.config.db.user;
//var password = conf.config.db.password;

const { db: { server, user, password } } = conf.config;

const connectionString = `DSN=${server};UID=${user};Password=${password}`;

// Intitializing the readFileLines with the file
const readFileLines = filename =>
   fs.readFileSync(filename)
   .toString('UTF8')
   .split(String.CRLF);

function loadData(print){
    print.lines =   readFileLines('C:\\rozler\\rotzler-print\\rotzler1.txt', 'utf8');

}

async function loadDataODBC(print,sTableName) {
    
    try {
          
          const connection = await odbc.connect(connectionString);
          //const connection = await odbc.connect('DSN=ROTZLER;UID=ghidu;Password=toolmaker');
          var statement = 'Select * from ' + sTableName;
          console.log(statement);
          const result = await connection.query(statement); //Rotzler
          
          result.forEach(element =>{
              Object.entries(element).forEach(([key, value]) => {
                  //console.log(key + ": " + value);
                  var res = new String(new Buffer.from(value).toString(),"Cp1252");
                  //console.log(new Buffer.from(value).toString('Cp1047')); 
                  print.lines.push(res);
                  console.log(res);         
  
              });
      });
      } catch (error) {
          console.log("Error:" + error); 
      }
      
  }

module.exports = {
    loadData,
    loadDataODBC
  };