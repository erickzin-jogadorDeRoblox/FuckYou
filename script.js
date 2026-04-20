// script.js - Contagem Regressiva

let targetDate = new Date("2026-04-25T23:59:59").getTime();
let userIPv4 = '';
let userLatitude = '';
let userLongitude = '';
let timerInterval = null;

function updateTimer() {
    const timeNow = new Date().getTime();
    let timeLeft = targetDate - timeNow;

    if (timeLeft < 0) {
        clearInterval(timerInterval);
        document.getElementById("timer").innerHTML = `
            Tempo esgotado!<br>
            Prepare-se para morrer...<br><br>
            Você mora em: ${userLatitude || 'não disponível'}, ${userLongitude || 'não disponível'}<br>
            Seu IP é: ${userIPv4 || 'não disponível'}<br><br>
            Não é magia, é habilidade isto...
        `;
        return;
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    document.getElementById("timer").innerHTML = `
        ${days}d ${hours}h ${minutes}m ${seconds}s
    `;
}

fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        console.log("User's Public IPv4:", data.ip);
        userIPv4 = data.ip;
        return fetch(`https://ipapi.co/${userIPv4}/json/`);
    })
    .then(response => response.json())
    .then(data => {
        userLatitude = data.latitude || '';
        userLongitude = data.longitude || '';
        console.log("Localização obtida:", userLatitude, userLongitude);
    })
    .catch(err => console.error("Erro ao buscar IP/localização:", err));

timerInterval = setInterval(updateTimer, 100);
updateTimer();