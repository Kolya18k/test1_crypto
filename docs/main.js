const fiats = [
  {code: 'UAH', name: 'Гривня', icon: 'assets/icons/uah.svg'},
  {code: 'USD', name: 'Долар', icon: 'assets/icons/usd.svg'},
  {code: 'EUR', name: 'Євро', icon: 'assets/icons/eur.svg'}
];
const cryptos = [
  {code: 'BTC', name: 'Bitcoin (BTC)', icon: 'assets/icons/bitcoin-btc-logo.svg'},
  {code: 'ETH', name: 'Ethereum (ETH)', icon: 'assets/icons/ethereum-eth-logo.svg'},
  {code: 'USDT', name: 'Tether (USDT)', icon: 'assets/icons/tether-usdt-logo.svg'},
  {code: 'BNB', name: 'Binance Coin (BNB)', icon: 'assets/icons/binance-coin-bnb-logo.svg'},
  {code: 'SOL', name: 'Solana (SOL)', icon: 'assets/icons/solana-sol-logo.svg'},
  {code: 'TON', name: 'Toncoin (TON)', icon: 'assets/icons/toncoin-ton-logo.svg'}
];

const cgMap = {
  UAH: 'uah',
  USD: 'usd',
  EUR: 'eur',
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  BNB: 'binancecoin',
  SOL: 'solana',
  TON: 'the-open-network'
};

let fiatChoices, cryptoChoices;

function fillChoices(selectId, arr, defaultCode) {
  const select = document.getElementById(selectId);
  select.innerHTML = '';
  arr.forEach(item => {
    const o = document.createElement('option');
    o.value = item.code;
    o.textContent = item.name;
    o.setAttribute('data-custom-properties', JSON.stringify(item));
    if (item.code === defaultCode) o.selected = true;
    select.appendChild(o);
  });
  return new Choices(select, {
    searchEnabled: false,
    itemSelectText: '',
    allowHTML: true,
    placeholder: true,
    callbackOnCreateTemplates: function(template) {
      return {
        item: (classNames, data) => {
          const props = JSON.parse(data.customProperties);
          return template(`
            <div class="${classNames.item} ${classNames.itemSelectable}" data-item data-id="${data.id}" data-value="${data.value}" ${data.active ? 'aria-selected="true"' : ''} ${data.disabled ? 'aria-disabled="true"' : ''}>
              <img src="${props.icon}" style="width:26px;height:26px;margin-right:10px;border-radius:50%;vertical-align:middle">
              <span>${props.name}</span>
            </div>
          `);
        },
        option: (classNames, data) => {
          const props = JSON.parse(data.customProperties);
          return template(`
            <div class="${classNames.item} ${classNames.itemChoice}" data-select-text="" data-choice ${data.disabled ? 'data-choice-disabled aria-disabled="true"' : 'data-choice-selectable'} data-id="${data.id}" data-value="${data.value}" ${data.groupId > 0 ? 'role="treeitem"' : 'role="option"'}>
              <img src="${props.icon}" style="width:26px;height:26px;margin-right:10px;border-radius:50%;vertical-align:middle">
              <span>${props.name}</span>
            </div>
          `);
        }
      };
    }
  });
}

function getCurrency(arr, code) {
  return arr.find(c => c.code === code);
}

async function getExchangeRate(fromCode, toCode) {
  const fromId = cgMap[fromCode], toId = cgMap[toCode];
  if (!fromId || !toId) return null;
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${fromId}&vs_currencies=${toId}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data[fromId][toId];
  } catch (e) {
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fiatChoices = fillChoices('fiat-currency', fiats, 'EUR');
  cryptoChoices = fillChoices('crypto-currency', cryptos, 'BTC');

  document.getElementById('exchange-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    document.getElementById('result-message').textContent = '';
    const fiat = fiatChoices.getValue(true);
    const crypto = cryptoChoices.getValue(true);
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
      <b>${amount} ${getCurrency(fiats, fiat).name}</b> ≈ <b>${result.toFixed(8)} ${getCurrency(cryptos, crypto).name}</b>
    `;
  });
});
