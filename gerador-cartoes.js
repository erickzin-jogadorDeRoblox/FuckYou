const validator = require('card-validator');
// Bandeiras suportadas
const bandeiras = [
  { nome: "visa", prefixo: "4", tamanho: 16 },
  { nome: "mastercard", prefixo: "51", tamanho: 16 },
  { nome: "elo", prefixo: "5067", tamanho: 16 },
  { nome: "amex", prefixo: "34", tamanho: 15 }
];
// Gera número aleatório com Algoritmo de Luhn (válido)
function gerarNumeroCartao(prefixo, tamanho) {
  let numero = prefixo;
  // Completa com números aleatórios
  while (numero.length < tamanho - 1) {
    numero += Math.floor(Math.random() * 10);
  }
  // Calcula o dígito verificador (Luhn)
  let soma = 0;
  let dobrar = true;
  for (let i = numero.length - 1; i >= 0; i--) {
    let digito = parseInt(numero[i]);
    if (dobrar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    soma += digito;
    dobrar = !dobrar;
  }
  const digitoVerificador = (10 - (soma % 10)) % 10;
  return numero + digitoVerificador;
}
// Gera um cartão completo
function gerarCartaoAleatorio() {
  const bandeira = bandeiras[Math.floor(Math.random() * bandeiras.length)];
  const numero = gerarNumeroCartao(bandeira.prefixo, bandeira.tamanho);
  const mes = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const ano = String(new Date().getFullYear() + Math.floor(Math.random() * 5) + 1).slice(-2);
  const cvv = bandeira.nome === "amex" 
    ? String(Math.floor(Math.random() * 9000) + 1000) 
    : String(Math.floor(Math.random() * 900) + 100);
  return {
    numero: numero,
    mes: mes,
    ano: ano,
    cvv: cvv,
    bandeira: bandeira.nome
  };
}
// ==================== EXECUTAR ====================
console.log("🔄 Gerando 5 cartões aleatórios válidos...\n");

for (let i = 1; i <= 5; i++) {
  const cartao = gerarCartaoAleatorio();
  console.log(`Cartão ${i}:`);
  console.log(`Número   : ${cartao.numero}`);
  console.log(`Validade : ${cartao.mes}/${cartao.ano}`);
  console.log(`CVV      : ${cartao.cvv}`);
  console.log(`Bandeira : ${cartao.bandeira.toUpperCase()}`);
  // Valida automaticamente com a biblioteca
  const validacao = validator.number(cartao.numero);
  console.log(`Status   : ${validacao.isValid ? "✅ Válido" : "❌ Inválido"}\n`);
}
module.exports = { gerarCartaoAleatorio };