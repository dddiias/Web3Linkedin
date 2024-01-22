// public/core.js
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const cityInput = document.getElementById("city");
        const city = cityInput.value;

        // Получение координат по названию города
        fetch(`/coordinates?city=${city}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                const coordinatesDiv = document.getElementById("coordinates");
                coordinatesDiv.innerHTML = `<p>Latitude: ${data.latitude}, Longitude: ${data.longitude}</p>`;
            })
            .catch(error => console.error(error));

        // Получение данных о криптовалюте
        fetch("/crypto")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                const cryptoDiv = document.getElementById("crypto-data");
                cryptoDiv.innerHTML = `<p>Bitcoin Price: $${data.bitcoin.usd}, Ethereum Price: $${data.ethereum.usd}</p>`;
            })
            .catch(error => console.error(error));

        // Получение новостей
        fetch("/news")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                const newsDiv = document.getElementById("news");
                const articles = data.articles;
                const newsList = articles.map(article => `<li><strong>${article.title}</strong>: ${article.description}</li>`).join("");
                newsDiv.innerHTML = `<ul>${newsList}</ul>`;
            })
            .catch(error => console.error(error));

        // Получение данных о погоде
        fetch(`/weather?city=${city}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                const weatherDiv = document.getElementById("weather-data");
                weatherDiv.innerHTML = data;
            })
            .catch(error => console.error(error));
    });
});
