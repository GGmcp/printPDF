const fs = require("fs");
var odbc = require('odbc');
const PDFDocument = require("pdfkit");
const  loadData = require("./loadData.js");
const conf = require('./config');

//configuration 
var linesOnPage = conf.config.print.linesOnPage;
var topTablePosition = 50;
var fonSize = conf.config.print.fonSize;
var fontSizeBold = conf.config.print.fontSizeBold;
var fontNormal = conf.config.print.fontNormal;
var fontBold = conf.config.print.fontBold;
var fontBarcode = conf.config.print.fontBarcode;
var p = 0;

//

String.CRLF = String.fromCharCode(13,10);
String.TAB = String.fromCharCode(9);

//let lineDetail = { detailText:"" ,    detailFont:"" ,    detailFontSize :"",  detailX :0  };

function LineDetail ( detailText,    detailFont ,    detailFontSize ,  detailX  ) {
  this.detailText = detailText;
  this.detailFont = detailFont;
  this.detailFontSize = detailFontSize;
  this.detailX = detailX;
}

let lineDetails = [];
let linePositions = [];
let rectanglePosition = [];

var skip = 0;
var dot = 0;
var tabName = "";
// Intitializing the readFileLines with the file



async function createPrint(print, path, tableName) {
    let doc = new PDFDocument({ size: "A4", margin: 50 });
    tabName = tableName;
    const res = await loadData.loadDataODBC(print, tableName);
   
    if (print.lines.length  == 0 ) {
      console.log("No records present !!");
      return  false;
    }
    let z = 0;
    print.lines.forEach(element => {
      z=z+1;
      if (parseInt(element.substring(0,3)) > 0 ) {
        
        linePositions.push(parseInt(element.substring(0,3)));
      }
      if(element.indexOf("#10#11#12#15#16") > 0){

        element = element.replace('#10#11#12#15#16','');
      }
      //to determine where to draw rectangle
      if(element.indexOf("----") > 0){
        rectanglePosition.push(z);        
      }


    });

    generatePrintTable(doc, print);
    //generateQr(doc)
    //generateFooter(doc);
  
    doc.end();
    doc.pipe(fs.createWriteStream(path));
  }

  function generateHeader(doc) {
    doc
      .image("logo_roz.png", 50, 45, { width: 100 })
      .fillColor("#444444")
      //.fontSize(12)
      //.text("ROTZLER Deutschland GmbH + Co. KG", 110, 57)
      .fontSize(10)
      .text("ROTZLER Deutschland GmbH + Co. KG", 200, 50, { align: "right" })
      .text("Robert-Bosch-Str. 4", 200, 65, { align: "right" })
      .text("79585 Steinen, Germany", 200, 80, { align: "right" })
      .moveDown();
  }

  function generatePrintTable(doc, print) {
    let i;
    let j =1;
    skip = rectanglePosition[2];
    if (linePositions.length == 0){
      linePositions.push(1);
    } 
    const invoiceTableTop = linePositions[0];

    //generateHr(doc, invoiceTableTop );
    doc.font(fontNormal);
  
    for (i = 0; i < print.lines.length ; i++) {
      
      
      if (j <= linesOnPage) {
        const item = print.lines[i];
        if (item.substring(0,3) == '002'){
          //if ( p > 0) {
            j=1;
            skip = rectanglePosition[2];
            dot = 0;
            doc.addPage();
            console.log("Page added..") 
            p = p+1;
            var s1 = rectanglePosition[1]-rectanglePosition[0];
            var s2 = rectanglePosition[2]-rectanglePosition[0];
            doc.rect(50, 50, 250, s1 * fontSizeBold); //9
            doc.rect(50, 50, 500, s1 * fontSizeBold); //9
            doc.rect( 50,50, 500, s2 * fontSizeBold ); //12 18
            doc.stroke();

          //}          
        }
        else{
          if (parseInt(item.substring(0,3)) > 2 ) {
            j = parseInt(item.substring(0,3));
          }
        }

        var lines = 1;
        if (parseInt(item.substring(3,4)) > 0){
          lines = parseInt(item.substring(3,4));
        }
        

        
        const position = invoiceTableTop + (j + 1) * 15;
        doc.font(fontNormal);

        var row = loadLineDetails(item);
        generateTableRow( doc, position, lineDetails );
      
        if( tabName.indexOf("IVBG") == -1 ){
          if(item.indexOf("----") > 0){
            dot = dot + 1;
            if (dot == 3){
              j = j + 7;
              dot = 100;
            }
  
          }

        }
        

        /*if ( j > skip){
            j = j + 5;
            skip = 100 ;
        } */
        j = j+1;

        if (j  > linesOnPage){
          j=1;
          p = p+1;
          doc.addPage();
          console.log("Page added..")         
        }  
      }
      
      
        
      
    }

    if(p == 0){
      var s1 = rectanglePosition[1]-rectanglePosition[0];
            var s2 = rectanglePosition[2]-rectanglePosition[0];
            doc.rect(50, 50, 250, s1 * fontSizeBold); //9
            doc.rect(50, 50, 500, s1 * fontSizeBold); //9
            doc.rect( 50,50, 500, s2 * fontSizeBold ); //12 18
            doc.stroke();
    }
    //generateHr(doc, doc.page.height - 100);
   
    //generateTest(doc, doc.page.height - 80)
  }


  function generateFooter(doc) {
    doc
      .fontSize(10)
      .text(
        "This can be a footer text....",
        50,
        780,
        { align: "center", width: 500 }
      );
  }

  function generateTableRow(
        doc, 
        y,
        lineDetails
  ) {
    try {
      lineDetails.forEach(element => {
        if(element.detailText.indexOf("!") >= 0){
          element.detailText = element.detailText.replace("!"," ");
          element.detailText = element.detailText.replace("!"," ");
        }
        if(element.detailText.indexOf("__________") >= 0){
          element.detailText = element.detailText.replace("__________","            __________");
          //element.detailText = element.detailText.replace("!"," ");
        }
        doc 
              .font(element.detailFont)
              .fontSize(element.detailFontSize)
              .text(element.detailText, element.detailX , y)
      });
    } catch (error) {
      
    }
    

  }

  function generateHr(doc, y) {
    try {
      doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
    
    } catch (error) {
      console.log(error);
    }
    
  }
  
  function generateQr(doc) {
      const rectXOffset = 25;
      const rectYOffset = 25;
      let rectPosition = 25;
      //doc.rect(25,25, 550, 550).stroke();
      doc.rect(rectXOffset, rectPosition, doc.page.width - rectXOffset * 2 , doc.page.height - rectYOffset * 2).stroke();
    }
  
  function formatCurrency(cents) {
    return "$" + (cents / 100).toFixed(2);
  }
  
  function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
  
    return year + "/" + month + "/" + day;
  }

  function loadLineDetails(item){

    lineDetails.splice(0,lineDetails.length);
    item = item.toString();
    if (parseInt(item.substring(0,3)) > 0 ) {
      item = item.substring(3);  
    }
    if (parseInt(item.substring(3,4)) > 0 ) {
      item = item.substring(4);  
    }
    if(item.indexOf("#10#11#12#15#16") > 0){
      item = item.replace('#10#11#12#15#16','');
    }

    const charArray = item.split("! ");

    if (charArray.length == 4) {
      let i = 0;
      charArray.forEach(element => {   
        if (i==1 ) {
          console.log(element);
          var d = new LineDetail();
          d.detailText = "|";
          d.detailX = 50;
          d.detailFont = fontNormal;
          d.detailFontSize = 10; 
          if(element.indexOf("!") > 0){
            element = element.replace('!','');
          }
          
          //lineDetails.push(d);

          detailsLoad2(element, 65);

        }
        else if ( i==2) {
          console.log(element);
          var d = new LineDetail();
          d.detailText = "|";
          d.detailX = 300;
          d.detailFont = fontNormal;
          d.detailFontSize = 10; 
          if(element.indexOf("!") > 0){
            element = element.replace('!','');
          }
          //lineDetails.push(d); 
          detailsLoad2(element, 315)
        } 
        i=i+1; 
      });
      //console.log(element);
          var d = new LineDetail();
          d.detailText = "|";
          d.detailX = 550;
          d.detailFont = fontNormal;
          d.detailFontSize = 10; 
          
          //lineDetails.push(d);
    } 
    else if (charArray.length == 5){
      let i = 0;
      charArray.forEach(element => {       
        if (i==1) {
          var d = new LineDetail();
          d.detailText = "|";
          d.detailX = 50;
          d.detailFont = fontNormal;
          d.detailFontSize = 10; 
          
          //lineDetails.push(d);
          detailsLoad2(element, 65)
        }
        else if (i==2) {
          var d = new LineDetail();
          d.detailText = "|";
          d.detailX = 216;
          d.detailFont = fontNormal;
          d.detailFontSize = 15; 
          
          lineDetails.push(d);
          detailsLoad2(element, 230)
          
        } else if(i==3) {
          var d = new LineDetail();
          d.detailText = "|";
          d.detailX = 382;
          d.detailFont = fontNormal;
          d.detailFontSize = 15; 
          
          lineDetails.push(d);

          detailsLoad2(element, 400)
        }
        i=i+1;
      });
      //console.log(element);
          var d = new LineDetail();
          d.detailText = "|";
          d.detailX = 550;
          d.detailFont = fontNormal;
          d.detailFontSize = 10; 
          
         // lineDetails.push(d);
    }
    else if (charArray.length == 1 || charArray.length == 2){
      var d = new LineDetail();
      if (item.indexOf("-----") >=0){
        d.detailText = "+" + "-".repeat(145) + "+";
        d.detailFont = fontNormal;
        d.detailFontSize = 10;
        d.detailX = 50;
        //lineDetails.push(d);
        console.log(item);
      }else{
        if(item.indexOf("!") > 0){
          item = item.replace('!','');
        }
        detailsLoad(item);
      }
      
     
      
    }
    else{
      if(item.indexOf("!") > 0){
        item = item.replace('!','');
      }
      var d = new LineDetail();
      d.detailText = item;
      d.detailFont = fontNormal;
      d.detailFontSize = 10;
      d.detailX = 50;
      lineDetails.push(d);
      console.log(item);
    }
    return lineDetails;

  }


  function detailsLoad(item){
    if ((item.indexOf("#13") >=0) && (item.indexOf("#14") >= 0) ){
      var barcode = item.substring(item.indexOf("#13") +3 , item.indexOf("#14")).trim();
      var BeforBC = item.substring( 0 , item.indexOf("#13"));
      var AfterBC = item.substring(item.indexOf("#14") +3 );
      var BarcodeX = item.indexOf("#13") / 82 ;
      var BeforBCX = BeforBC.length / 82 ;
      var AfterBCX = (item.indexOf("#14") +3 )/ 82 ;
      AfterBC = AfterBC.replace("#13", "");
      AfterBC = AfterBC.replace("#14", "");

      console.log(item);
      //console.log( BarcodeX.toString  + " - " + AfterBCX.toString)
      var d = new LineDetail();
      d.detailText = BeforBC.trim();
      d.detailFont = fontNormal;
      d.detailFontSize = 10;
      d.detailX = 50;
      lineDetails.push(d);
      console.log(d.detailX);
      var d = new LineDetail();
      d.detailText = barcode.trim();
      d.detailFont = fontBold
      d.detailFontSize = 18;
      d.detailX =  25 + Math.round(550 *  BarcodeX);
      if (Math.round(d.detailX) < 50) {
        d.detailX = 60;
        console.log('60 set !!');
      }
      lineDetails.push(d);
      console.log(d.detailX);
      var d = new LineDetail();
      d.detailText = AfterBC;
      d.detailFont = fontNormal;
      d.detailFontSize = 10;
      d.detailX =  25 + Math.round(550 * AfterBCX);
      
      
      lineDetails.push(d);
      console.log(d.detailX);
  }
  else if ((item.indexOf("#17") >=0) && (item.indexOf("#18") >= 0) ){
      var boldtxt = item.substring(item.indexOf("#17") +3 , item.indexOf("#18")).trim();
      var BeforBC = item.substring( 0 , item.indexOf("#17"));
      var AfterBC = item.substring(item.indexOf("#18") +3 );
      var BarcodeX =item.indexOf("#17") / 82 ;
      var BeforBC = BeforBC.length / 82 ;
      var AfterBC = (item.indexOf("#18") +3 ) / 82 ;
      AfterBC=AfterBC.replace("#17", "");
      AfterBC=AfterBC.replace("#18", "");
      console.log(item);
      

      var d = new LineDetail();
      d.detailText = BeforBC.trim();
      d.detailFont = fontNormal;
      d.detailFontSize = 10;
      d.detailX = 50;
      lineDetails.push(d);
      console.log(d.detailX);
      var d = new LineDetail();
      d.detailText = boldtxt;
      d.detailFont = fontBold; //fontBarcode;
      d.detailFontSize = 48;
      d.detailX =  25 +  Math.round(550 * BarcodeX);
      lineDetails.push(d);
      console.log(d.detailX);
      var d = new LineDetail();
      d.detailText = AfterBC;
      d.detailFont = fontNormal;
      d.detailFontSize = 10;
      d.detailX =  25 +  Math.round(550 * AfterBCX)
      lineDetails.push(d);
      console.log(d.detailX);
  }
  else{
    var d = new LineDetail();
    d.detailText = item;
    d.detailFont = fontNormal;
    d.detailFontSize = 10;
    d.detailX = 50;
    lineDetails.push(d);
    console.log(item);
  }
  }

  function detailsLoad2( item , y){
    if ((item.indexOf("#13") >=0) && (item.indexOf("#14") >= 0) ){
      var boldtxt = item.substring(item.indexOf("#13") +3 , item.indexOf("#14"));
      console.log(item);
      var d = new LineDetail();
      var beforeCode = item.substring(2 , item.indexOf("#13"));
      d.detailText = beforeCode.trim() + boldtxt.trim(); //
      d.detailFont = fontBold
      d.detailFontSize = 18;
      d.detailX =  y;
          
      lineDetails.push(d);
      console.log(d.detailX);
    }
    else if ((item.indexOf("#17") >=0) && (item.indexOf("#18") >= 0) ){
        var barcode = item.substring(item.indexOf("#17") +3 , item.indexOf("#18"));
        console.log(item);
        var d = new LineDetail();
        var beforeCode = item.substring(2 , item.indexOf("#17"));
        d.detailText = barcode.trim() ; //+ ",{ width: 2}" ; //beforeCode + 
        d.detailFont =  fontBarcode ;
        d.detailFontSize = 48;
        d.detailX =  y;
        lineDetails.push(d);
        console.log(d.detailX);
    }
    else{
      var d = new LineDetail();
      d.detailText = item;
      d.detailFont = fontNormal;
      d.detailFontSize = 10;
      d.detailX = y;
      lineDetails.push(d);
      console.log(item);
    }
  }


  module.exports = {
    createPrint
  };