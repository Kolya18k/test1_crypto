const fiats = [
  {code: 'UAH', name: 'Гривня', icon: 'assets/icons/uah.svg'},
  {code: 'USD', name: 'Долар', icon: 'assets/icons/usd.svg'},
  {code: 'EUR', name: 'Євро', icon: 'assets/icons/eur.svg'}
];
const cryptos = [
  {code: 'BTC', name: 'Bitcoin (BTC)', icon: 'assets/icons/bitcoin-btc-logo.svg', cg: 'bitcoin'},
  {code: 'ETH', name: 'Ethereum (ETH)', icon: 'assets/icons/ethereum-eth-logo.svg', cg: 'ethereum'},
  {code: 'USDT', name: 'Tether (USDT)', icon: 'assets/icons/tether-usdt-logo.svg', cg: 'tether'},
  {code: 'BNB', name: 'Binance Coin (BNB)', icon: 'assets/icons/binance-coin-bnb-logo.svg', cg: 'binancecoin'},
  {code: 'SOL', name: 'Solana (SOL)', icon: 'assets/icons/solana-sol-logo.svg', cg: 'solana'},
  {code: 'TON', name: 'Toncoin (TON)', icon: 'assets/icons/toncoin-ton-logo.svg', cg: 'the-open-network'}
];

const cgFiatMap = {
  UAH: 'uah',
  USD: 'usd',
  EUR: 'eur'
};

// Universal custom select
function createCustomSelect(containerId, data, defaultCode) {
  const cont = document.getElementById(containerId);
  cont.innerHTML = "";

  let selected = data.find(item => item.code === defaultCode) || data[0];

  const selectedDiv = document.createElement('div');
  selectedDiv.className = "selected-option";
  selectedDiv.innerHTML = `<img src="${selected.icon}" alt="">${selected.name}`;
  cont.appendChild(selectedDiv);

  const optionsList = document.createElement('div');
  optionsList.className = "options-list";
  data.forEach(item => {
    const opt = document.createElement('div');
    opt.className = "option-item" + (item.code === selected.code ? " active" : "");
    opt.innerHTML = `<img src="${item.icon}" alt="">${item.name}`;
    opt.onclick = () => {
      selected = item;
      selectedDiv.innerHTML = `<img src="${item.icon}" alt="">${item.name}`;
      cont.value = item.code;
      cont.dataset.value = item.code;
      optionsList.querySelectorAll('.option-item').forEach(x=>x.classList.remove('active'));
      opt.classList.add('active');
      cont.classList.remove('open');
    };
    optionsList.appendChild(opt);
  });
  cont.appendChild(optionsList);

  selectedDiv.onclick = () => {
    cont.classList.toggle('open');
  };

  // Click away to close
  document.addEventListener('click', function(e){
    if (!cont.contains(e.target)) cont.classList.remove('open');
  });

  // For form compatibility
  cont.value = selected.code;
  cont.dataset.value = selected.code;
  cont.getValue = () => cont.value;
  cont.setValue = (code) => {
    const item = data.find(i=>i.code===code);
    if (item) {
      selected = item;
      selectedDiv.innerHTML = `<img src="${item.icon}" alt="">${item.name}`;
      cont.value = item.code;
      cont.dataset.value = item.code;
      optionsList.querySelectorAll('.option-item').forEach(x=>x.classList.remove('active'));
      const opt = Array.from(optionsList.children).find(x=>x.textContent===item.name);
      if (opt) opt.classList.add('active');
    }
  };
  return cont;
}

async function getExchangeRate(fiatCode, cryptoCode) {
  const fiatId = cgFiatMap[fiatCode];
  const cryptoObj = cryptos.find(c=>c.code===cryptoCode);
  if (!fiatId || !cryptoObj) return null;
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoObj.cg}&vs_currencies=${fiatId}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data[cryptoObj.cg][fiatId];
  } catch (e) {
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const fiatSelect = createCustomSelect("fiat-select", fiats, "EUR");
  const cryptoSelect = createCustomSelect("crypto-select", cryptos, "BTC");

  document.getElementById('exchange-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    document.getElementById('result-message').textContent = '';
    const fiat = fiatSelect.getValue();
    const crypto = cryptoSelect.getValue();
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
      <b>${amount} ${fiats.find(f=>f.code===fiat).name}</b> ≈ <b>${result.toFixed(8)} ${cryptos.find(c=>c.code===crypto).name}</b>
    `;
  });
});
