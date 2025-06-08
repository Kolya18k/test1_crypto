// --- Дані валют ---
const fiatList = [
  { code: 'UAH', name: 'Гривня', icon: 'assets/icons/uah.svg' },
  { code: 'USD', name: 'Долар', icon: 'assets/icons/usd.svg' },
  { code: 'EUR', name: 'Євро', icon: 'assets/icons/eur.svg' }
];
const cryptoList = [
  { code: 'BTC', name: 'Bitcoin', icon: 'assets/icons/btc.svg' },
  { code: 'ETH', name: 'Ethereum', icon: 'assets/icons/eth.svg' },
  { code: 'USDT', name: 'Tether', icon: 'assets/icons/usdt.svg' },
  { code: 'BNB', name: 'Binance Coin', icon: 'assets/icons/bnb.svg' },
  { code: 'SOL', name: 'Solana', icon: 'assets/icons/sol.svg' },
  { code: 'TON', name: 'Toncoin', icon: 'assets/icons/ton.svg' },
];

// --- Choices.js для select-ів з іконками ---
function fillChoices(selectId, list, defaultValue) {
  const select = document.getElementById(selectId);
  select.innerHTML = '';
  list.forEach(item => {
    const o = document.createElement('option');
    o.value = item.code;
    o.textContent = item.name;
    o.setAttribute('data-custom-properties', JSON.stringify(item));
    if (item.code === defaultValue) o.selected = true;
    select.appendChild(o);
  });
  new Choices(select, {
    searchEnabled: false,
    itemSelectText: '',
    allowHTML: true,
    callbackOnCreateTemplates: function(template) {
      return {
        item: (classNames, data) => {
          const props = JSON.parse(data.customProperties);
          return template(`
            <div class="${classNames.item} ${classNames.itemSelectable}" data-item data-id="${data.id}" data-value="${data.value}" ${data.active ? 'aria-selected="true"' : ''} ${data.disabled ? 'aria-disabled="true"' : ''}>
              <img src="${props.icon}" style="width:20px;height:20px;margin-right:8px;border-radius:50%">
              ${props.name}<span style="color:#aaa;font-size:.97em;"> (${props.code})</span>
            </div>
          `);
        },
        option: (classNames, data) => {
          const props = JSON.parse(data.customProperties);
          return template(`
            <div class="${classNames.item} ${classNames.itemChoice}" data-select-text="" data-choice ${data.disabled ? 'data-choice-disabled aria-disabled="true"' : 'data-choice-selectable'} data-id="${data.id}" data-value="${data.value}" ${data.groupId > 0 ? 'role="treeitem"' : 'role="option"'}>
              <img src="${props.icon}" style="width:20px;height:20px;margin-right:8px;border-radius:50%">
              ${props.name}<span style="color:#aaa;font-size:.97em;"> (${props.code})</span>
            </div>
          `);
        }
      };
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fillChoices('fiat-currency', fiatList, 'UAH');
  fillChoices('crypto-currency', cryptoList, 'BTC');
});

// --- Логіка калькулятора ---
const calcForm = document.getElementById('calc-form');
const resultDiv = document.getElementById('result');

async function getExchangeRate(fiat, crypto) {
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
    const rateWithFee = rate * 1.02;
    const cryptoAmount = amount / rateWithFee;
    resultDiv.innerHTML = `
      <b>${amount} ${fiat}</b> ≈ <b>${cryptoAmount.toFixed(6)} ${crypto}</b><br>
      Курс з комісією: <b>1 ${crypto} = ${rateWithFee.toFixed(2)} ${fiat}</b>
    `;
  });
}
