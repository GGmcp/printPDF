
// node index.js "rotzler.CLIVBG0003"

const { createPrint } = require("./createPrint.js");

const print = {
        lines: []
};

var sTableName = "";
var printfile = "";
//var sTableName = "ghidu.clel10";

sTableName = "rotzler.CLAL210002";

//sTableName = "rotzler.CLIVBG0003";

function main() {
        //  process.argv
        var args = process.argv.slice(2);
        args.forEach(param => {
                sTableName = param;
                console.log(param);
                //createPrint(print, "print.pdf",sTableName);
        });  
             
}


main();
printfile = sTableName + ".pdf";
createPrint(print, printfile ,sTableName);

