//saker som behövs impteras för att koden ska funka.
import express from 'express';
import fetch from "node-fetch"
import sqlite from "better-sqlite3"
import bodyParser from 'body-parser';
import path from "path";

const app = express()

//databas setup och så att databasen finns.
//"SQlite viewer" behövs för att kunna läsa den som en människa.
const db = sqlite('sightings.db');
db.prepare(`
    CREATE TABLE IF NOT EXISTS sightings (
        date    TIMESTAMP NOT NULL DEFAULT current_timestamp,
        city    TEXT NOT NULL,
        lon     INT NOT NULL,
        lat     INT NOT NULL,
        isAlien BOOL NOT NULL
    )
`).run()

//body-parser för att kunna parsa API senare.
app.use(bodyParser.urlencoded({extended:true}));


//path så att pathing och URL fungerar.
const appRoot = path.resolve();
app.get("/", function(request,response){
    response.sendFile(appRoot+"/html/index.html");
});

//för att få css att fungera.
app.get("/css/style.css", function(request,response){
    response.sendFile(appRoot+"/css/style.css");
})

//för att få UFO bilden att fungera.
app.get("/images/ufo.svg", function(request,response){
    response.sendFile(appRoot+"/images/ufo.svg");
})

//körs när användaren postar något.
app.post("/", async function(req, res) {
    //Skapar konstanter som används senare.
    const city = req.body.cityName;
    const apikey = "50f65bedddf44d367e5c0b5a9c67038f"; 
    const units = "metric";
    //API där koordinaterna för staden som användaren skrivit in hittas.
    const urlC = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&units="+units+"&appid="+apikey+"#";
    const resultC = await fetch(urlC)
    const cityData = await resultC.json()

    //kollar om det finns en stad som matchar med user input och ger user en error message om den inte gör det.
    if (cityData?.cod === "404") {
        console.log("error invalid input")
        res.sendFile(appRoot+"/html/indexerror.html");
    } else {
        //mer constanter som behövs
        //lägger till 180 så man slipper ha negativa tal i räkningen
        const latC = (Math.round(cityData.coord.lat)+180);
        const lonC = (Math.round(cityData.coord.lon)+180);
        const cityC = (cityData.name);
        const urlI = "https://api.wheretheiss.at/v1/satellites/25544";
        const resultI = await fetch(urlI);
        const issData = await resultI.json();
        //lägger till 180 så man slipper ha negativa tal i räkningen
        const latI = (Math.round(issData.latitude)+180);
        const lonI = (Math.round(issData.longitude)+180);

        //Tar absolutvärdet av skilnaden mellan staden och ISSs koordinater.
        //Sedan respondar beroende på hur nära de ligger varandra.
        //Lagrar koordinater och tidspunkt på staden och om det är en alien sighting eller inte i en databas.
        //tar bort 180 så att databasen får rätt koordinater.
        const dbStatement = db.prepare("INSERT INTO sightings (city, lat, lon, isAlien) VALUES (?, ?, ?, ?)")
        if (Math.abs(latC - latI) < 10 && 
            Math.abs(lonC - lonI) < 10) {
                dbStatement.run(cityC, latC - 180, lonC - 180, 0);
            res.sendFile(appRoot+"/html/iss.html");
        } else {
            dbStatement.run(cityC, latC - 180, lonC - 180, 1);
            res.sendFile(appRoot+"/html/alien.html");
        }
    }
})

//Startar servern med terminalen genom att skriva "node js\index.js".
app.listen(3000, function(){
    console.log("Server started in port 3000");
    console.log(appRoot);
})


