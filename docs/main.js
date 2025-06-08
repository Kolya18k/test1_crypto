// --- Дані про фіат та крипту ---
const fiatList = [
  { code: 'UAH', name: 'Гривня', icon: 'assets/icons/uah.svg' },
  { code: 'USD', name: 'Долар', icon: 'assets/icons/usd.svg' },
  { code: 'EUR', name: 'Євро', icon: 'assets/icons/eur.svg' }
];
const cryptoList = [
  { code: 'BTC', name: 'Bitcoin', icon: 'assets/icons/bitcoin-btc-logo.svg' },
  { code: 'ETH', name: 'Ethereum', icon: 'assets/icons/ethereum-eth-logo.svg' },
  { code: 'USDT', name: 'Tether', icon: 'assets/icons/tether-usdt-logo.svg' },
  { code: 'BNB', name: 'Binance Coin', icon: 'assets/icons/binance-coin-bnb-logo.svg' },
  { code: 'SOL', name: 'Solana', icon: 'assets/icons/solana-sol-logo.svg' },
  { code: 'TON', name: 'Toncoin', icon: 'assets/icons/toncoin-ton-logo.svg' },
];

// --- Заповнення селектів та іконок ---
function fillSelects() {
  const fiatSel = document.getElementById('fiat-currency');
  const cryptoSel = document.getElementById('crypto-currency');
  fiatSel.innerHTML = '';
  cryptoSel.innerHTML = '';
  fiatList.forEach(f => {
    const o = document.createElement('option');
    o.value = f.code;
    o.textContent = f.name;
    fiatSel.appendChild(o);
  });
  cryptoList.forEach(c => {
    const o = document.createElement('option');
    o.value = c.code;
    o.textContent = `${c.name} (${c.code})`;
    cryptoSel.appendChild(o);
  });
  fiatSel.value = 'EUR';
  cryptoSel.value = 'BTC';
  updateIcons();
}
function updateIcons() {
  const fiatIcon = document.getElementById('fiat-icon');
  const fiatSel = document.getElementById('fiat-currency');
  const fiat = fiatList.find(f => f.code === fiatSel.value);
  if (fiat) fiatIcon.src = fiat.icon;

  const cryptoIcon = document.getElementById('crypto-icon');
  const cryptoSel = document.getElementById('crypto-currency');
  const crypto = cryptoList.find(c => c.code === cryptoSel.value);
  if (crypto) cryptoIcon.src = crypto.icon;
}

// --- Основна логіка обрахунку (Coingecko API) ---
const coingeckoMap = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  BNB: 'binancecoin',
  SOL: 'solana',
  TON: 'the-open-network'
};

async function fetchRate(crypto, fiat) {
  const cryptoId = coingeckoMap[crypto];
  if (!cryptoId) throw new Error('Криптовалюта не підтримується');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=${fiat.toLowerCase()}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Не вдалося отримати курс');
  const data = await resp.json();
  const rate = data[cryptoId]?.[fiat.toLowerCase()];
  if (!rate) throw new Error('Курс не знайдено');
  return rate * 1.02; // +2% комісії
}

async function calcResult(e) {
  e && e.preventDefault();
  const amount = parseFloat(document.getElementById('fiat-amount').value) || 0;
  const fiat = document.getElementById('fiat-currency').value;
  const crypto = document.getElementById('crypto-currency').value;
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = 'Завантаження...';
  if (!amount || amount <= 0) {
    resultDiv.textContent = 'Введіть суму';
    return;
  }
  try {
    const rate = await fetchRate(crypto, fiat);
    const cryptoAmount = amount / rate;
    resultDiv.textContent =
      `Ви отримаєте ≈ ${cryptoAmount.toFixed(6)} ${crypto}`;
  } catch (e) {
    resultDiv.textContent = 'Не вдалося отримати курс';
  }
}

// --- Обробники ---
document.addEventListener('DOMContentLoaded', () => {
  fillSelects();
  document.getElementById('fiat-currency').addEventListener('change', () => {
    updateIcons();
    calcResult();
  });
  document.getElementById('crypto-currency').addEventListener('change', () => {
    updateIcons();
    calcResult();
  });
  document.getElementById('fiat-amount').addEventListener('input', calcResult);
  document.getElementById('exchange-form').addEventListener('submit', calcResult);
  calcResult();
});
