// app.js
const express = require("express");
const https = require("https");
const request = require("request");
const app = express();

// app.js (продолжение)
const cors = require("cors");
app.use(cors());


// Добавляем поддержку JSON и URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключаем dotenv для безопасного хранения API ключей
require("dotenv").config();

// Разрешаем доступ к статическим файлам в папке public
app.use(express.static("public"));

// Главная страница
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

// Эндпоинт для получения данных о погоде
app.get("/weather", function (req, res) {
    const city = req.query.city;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;

    https.get(url, function (response) {
        console.log(response.statusCode);

        response.on("data", function (data) {
            const weatherdata = JSON.parse(data);
            const temp = weatherdata.main.temp;
            const description = weatherdata.weather[0].description;
            const icon = weatherdata.weather[0].icon;
            const imgURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;

            res.write(`<h1>Temperature is ${temp} Celsius in ${city}</h1>`);
            res.write(`<h2>The weather currently is ${description}</h2>`);
            res.write(`<img src=${imgURL}>`);
            res.send();
        });
    });
});

// Эндпоинт для получения координат по названию города
app.get("/coordinates", function (req, res) {
    const city = req.query.city;
    const mapApiKey = process.env.GOOGLE_MAPS_API_KEY;

    // Запрос к Google Geocoding API
    const mapUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${mapApiKey}`;

    request(mapUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const mapData = JSON.parse(body);
            if (mapData.results.length > 0) {
                const location = mapData.results[0].geometry.location;
                res.json({ latitude: location.lat, longitude: location.lng });
            } else {
                res.status(404).json({ error: "Location not found" });
            }
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
});

const axios = require("axios");

app.get("/crypto", async function (req, res) {
    try {
        const cryptoResponse = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd");
        const cryptoData = cryptoResponse.data;
        res.json(cryptoData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/news", async function (req, res) {
    try {
        const newsResponse = await axios.get("https://newsapi.org/v2/top-headlines?country=us&apiKey=4fb91da1f2324d32aca6365cba5392f5");
        const newsData = newsResponse.data;
        res.json(newsData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.listen(3000, function () {
    console.log(`server is running on port 3000`);
});
