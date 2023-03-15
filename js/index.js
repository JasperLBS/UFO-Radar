//express för att den behövs vid många steg.
var express = require('express');
var app = express();
const https = require("https");

//body-parser för att kunna parsa API senare.
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

//path så att pathing och URL fungerar.
var path=require("path");
global.appRoot=path.resolve(__dirname);
var newRoot = appRoot.slice(0,appRoot.length-3);
app.get("/", function(request,response){
    response.sendFile(newRoot+"/index.html");
});

//Körs när användaren postar något.
app.post("/", function(req, res) {
    //Skapar konstanter och variabler som används senare.
    let cityData
    let issData
    const city= req.body.cityName;
    const APIkey="50f65bedddf44d367e5c0b5a9c67038f"; 
    const units="metric";
    //API där koordinaterna för staden som användaren skrivit in hittas.
    const urlC = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&units="+units+"&appid="+APIkey+"#";
    https.get(urlC, function(response){
        let result = "";
        response.on("data", function(data){ 
            result += data;
        })
        response.on("end", function() {
            //Parsar APIn så att koden kan arbeta med den.
            cityData = JSON.parse(result)
            //Lägger till 180 grader till koordinaterna så man slipper räkna med negativa tal.
            //Math.round för att ta bort decimalerna så att båda API använder samma mängd decimaler.
            let latC = (Math.round(cityData.coord.lat)+180);
            let lonC = (Math.round(cityData.coord.lon)+180);

            //API där nuvarande koordinaterna på ISS hittas.
            const urlI = "https://api.wheretheiss.at/v1/satellites/25544";
            https.get(urlI, function(response){
                response.on("data", function(data){
                    //Parsar APIn så att koden kan arbeta med den.
                    issData = JSON.parse(data);
                    //Lägger till 180 grader till koordinaterna så man slipper räkna med negativa tal.
                    //Math.round för att ta bort decimalerna så att båda API använder samma mängd decimaler.
                    let latI = (Math.round(issData.latitude)+180);
                    let lonI = (Math.round(issData.longitude)+180);

                    //Tar absolutvärdet av skilnaden mellan staden och ISSs koordinater.
                    //Sedan respondar beroende på hur nära de ligger varandra.
                    if (Math.abs(latC - latI) < 10 && 
                        Math.abs(lonC - lonI) < 10) {
                        res.write("<p>It's just the ISS... &#128511; &#128534; &#128557;</p>")
                    } else {
                        res.write("<p>ITS ALIENS! &#128025; &#129430; &#128125;</p>")
                    }
                    res.send();
                })
            })
        })
    })
})

//Startar servern
app.listen(3000, function(){
    console.log("Server started in port 3000");
    console.log(newRoot);
})


