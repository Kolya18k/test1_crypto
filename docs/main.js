// ... (Тут має бути твій код з Choices.js — НЕ видаляй його!)
// Додаємо обробку форми та API-запит

const calcForm = document.getElementById('calc-form');
const resultDiv = document.getElementById('result');

// Функція отримання курсу з Coingecko
async function getExchangeRate(fiat, crypto) {
  // В Coingecko для UAH = 'uah', USD = 'usd', EUR = 'eur', BTC = 'bitcoin', ETH = 'ethereum' і т.д.
  const fiatMap = { UAH: 'uah', USD: 'usd', EUR: 'eur' };
  const cryptoMap = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    USDT: 'tether',
    BNB: 'binancecoin',
    SOL: 'solana',
    TON: 'the-open-network'
  };
  const fiatId = fiatMap[fiat];
  const cryptoId = cryptoMap[crypto];
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

// Обробка форми
if (calcForm) {
  calcForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    resultDiv.textContent = "Завантаження...";
    const amount = parseFloat(document.getElementById('amount').value);
    const fiat = document.getElementById('fiat-currency').value;
    const crypto = document.getElementById('crypto-currency').value;

    if (!amount || amount <= 0) {
      resultDiv.textContent = "Введіть коректну суму.";
      return;
    }
    const rate = await getExchangeRate(fiat, crypto);
    if (!rate) {
      resultDiv.textContent = "Курс не знайдено.";
      return;
    }
    // Додаємо +2% комісії
    const rateWithFee = rate * 1.02;
    const cryptoAmount = amount / rateWithFee;
    resultDiv.innerHTML = `
      <b>${amount} ${fiat}</b> ≈ <b>${cryptoAmount.toFixed(6)} ${crypto}</b><br>
      Курс з комісією: <b>1 ${crypto} = ${rateWithFee.toFixed(2)} ${fiat}</b>
    `;
  });
}
