const fiats = {
  UAH: {name: 'Гривня', cg: 'uah'},
  USD: {name: 'Долар', cg: 'usd'},
  EUR: {name: 'Євро', cg: 'eur'}
};
const cryptos = {
  BTC: {name: 'Bitcoin (BTC)', cg: 'bitcoin'},
  ETH: {name: 'Ethereum (ETH)', cg: 'ethereum'},
  USDT: {name: 'Tether (USDT)', cg: 'tether'},
  BNB: {name: 'Binance Coin (BNB)', cg: 'binancecoin'},
  SOL: {name: 'Solana (SOL)', cg: 'solana'},
  TON: {name: 'Toncoin (TON)', cg: 'the-open-network'}
};

async function getExchangeRate(fiatCode, cryptoCode) {
  const fiatId = fiats[fiatCode].cg;
  const cryptoId = cryptos[cryptoCode].cg;
  if (!fiatId || !cryptoId) return null;
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=${fiatId}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data[cryptoId][fiatId];
  } catch (e) {
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('exchange-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    document.getElementById('result-message').textContent = '';
    const fiat = document.getElementById('fiat-currency').value;
    const crypto = document.getElementById('crypto-currency').value;
    let amount = parseFloat(document.getElementById('amount').value);

    if (!amount || amount <= 0) {
      document.getElementById('result-message').textContent = "Введіть коректну суму для обміну.";
      return;
    }
    if (fiat === crypto) {
      document.getElementById('result-message').textContent = "Валюта і криптовалюта мають бути різними!";
      return;
    }

    const rate = await getExchangeRate(fiat, crypto);
    if (!rate) {
      document.getElementById('result-message').textContent = "Курс не знайдено!";
      return;
    }
    let rateWithFee = rate * 1.02;
    let result = amount / rateWithFee;
    document.getElementById('result-message').innerHTML = `
      <b>${amount} ${fiats[fiat].name}</b> ≈ <b>${result.toFixed(8)} ${cryptos[crypto].name}</b>
    `;
  });
});
