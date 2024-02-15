document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const cityInput = document.getElementById("city");
        const city = cityInput.value;


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
