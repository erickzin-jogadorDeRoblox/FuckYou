// Garantir que o script rode perfeitamente independente da ordem de carregamento
(function () {
    // 1. Timer de Namoro (Início: 20/09/2026)
    const startDate = new Date('2026-09-20T00:00:00');

    function updateTimer() {
        const loveTimer = document.getElementById('loveTimer');
        if (!loveTimer) return;

        const now = new Date();
        const diff = now - startDate;

        if (diff < 0) {
            loveTimer.textContent = "Te amo! (O nosso dia está chegando! ❤️)";
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
        const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
        const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

        loveTimer.textContent = `Te amo há ${days} dias, ${hours} horas, ${minutes} minutos e ${seconds} segundos`;
    }

    // Atualiza imediatamente e depois a cada 1 segundo
    updateTimer();
    setInterval(updateTimer, 1000);

    // 2. Botão Surpresa / Easter Egg
    window.addEventListener('DOMContentLoaded', () => {
        const surpriseBtn = document.getElementById('surpriseBtn');
        const secretMessage = document.getElementById('secretMessage');

        if (surpriseBtn && secretMessage) {
            surpriseBtn.addEventListener('click', () => {
                if (secretMessage.style.display === 'block') {
                    secretMessage.style.display = 'none';
                    surpriseBtn.textContent = 'Clique para uma surpresa 🎁';
                } else {
                    secretMessage.style.display = 'block';
                    surpriseBtn.textContent = 'Esconder surpresa 🙈';
                }
            });
        }

        // 3. Gerador de Corações e Estrelinhas Flutuantes
        const heartsContainer = document.getElementById('heartsContainer');
        const symbols = ['🩵', '💜', '✨', '💙', '💖'];

        if (heartsContainer) {
            function createFloatingElement() {
                const el = document.createElement('div');
                el.classList.add('floating-heart');
                el.style.left = Math.random() * 100 + 'vw';
                el.style.animationDuration = (Math.random() * 3 + 3) + 's';
                el.style.fontSize = (Math.random() * 15 + 15) + 'px';
                el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                
                heartsContainer.appendChild(el);

                setTimeout(() => {
                    el.remove();
                }, 6000);
            }

            setInterval(createFloatingElement, 400);
        }
    });
})();