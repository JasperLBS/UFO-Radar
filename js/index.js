// THIS FILE SHOULD BE IN THE ROOT OF YOUR PROJECT!

// Overall:
// Consider using `let` and `const` instead of `var`!
// Be consistent in the use of semicolons! Either use them or not. Don't mix. 

//express för att den behövs vid många steg.
var express = require('express');
var app = express();
const https = require("https");

//body-parser för att kunna parsa API senare.
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));


// Consider finding a more elegant and eas-to-read solution to this:
//path så att pathing och URL fungerar.
var path=require("path");
global.appRoot=path.resolve(__dirname);
var newRoot = appRoot.slice(0,appRoot.length-3);
app.get("/", function(request,response){
    response.sendFile(newRoot+"/html/index.html");
});


// Consider using `express.static()` for this:
//för att få css att fungera.
app.get("/css/style.css", function(request,response){
    response.sendFile(newRoot+"/css/style.css")
})
app.get("/images/1F6F8.svg", function(request,response){
    response.sendFile(newRoot+"/images/1F6F8.svg")
})



//Körs när användaren postar något.
app.post("/", function(req, res) {
    //Skapar konstanter och variabler som används senare.
    let cityData // Consider renaming this, maybe? E.g. `userPosition`?
    let issData // Consider same here? `issPosition`?
    const city= req.body.cityName;
    const apikey="50f65bedddf44d367e5c0b5a9c67038f"; 
    const units="metric";
    //API där koordinaterna för staden som användaren skrivit in hittas.
    const urlC = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&units="+units+"&appid="+apikey+"#";

    // Consider finding a more elegant and easy-to-read solution to this.
    // Consider looking into `node-fetch` and `Promise`. 
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
                // This is not safe. You need to use the same structure as above with `response.on("data")` and `response.on("end")`.
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
                        res.sendFile(newRoot+"/html/iss.html");
                    } else {
                        //lägg till kod som sparar nuvarande koordinaterna som "alien sightings"
                        res.sendFile(newRoot+"/html/alien.html");
                    }
                })
            })
        })
    })
})

//Startar servern med terminalen genom att skriva "node js\index.js".
app.listen(3000, function(){
    console.log("Server started in port 3000");
    console.log(newRoot);
})


