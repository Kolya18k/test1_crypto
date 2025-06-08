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
  { code: 'TON', name: 'Toncoin', icon: 'assets/icons/ton.svg' }
];

let fiatChoices, cryptoChoices;

function createChoices(selectId, list, defaultValue) {
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
  return new Choices(select, {
    searchEnabled: false,
    itemSelectText: '',
    allowHTML: true,
    callbackOnCreateTemplates: function(template) {
      return {
        item: (classNames, data) => {
          const props = JSON.parse(data.customProperties);
          return template(`
            <div class="${classNames.item} ${classNames.itemSelectable}" data-item data-id="${data.id}" data-value="${data.value}" ${data.active ? 'aria-selected="true"' : ''} ${data.disabled ? 'aria-disabled="true"' : ''}>
              <img src="${props.icon}" style="width:20px;height:20px;margin-right:8px;border-radius:50%;vertical-align:middle">
              ${props.name}<span style="color:#aaa;font-size:.97em;"> (${props.code})</span>
            </div>
          `);
        },
        option: (classNames, data) => {
          const props = JSON.parse(data.customProperties);
          return template(`
            <div class="${classNames.item} ${classNames.itemChoice}" data-select-text="" data-choice ${data.disabled ? 'data-choice-disabled aria-disabled="true"' : 'data-choice-selectable'} data-id="${data.id}" data-value="${data.value}" ${data.groupId > 0 ? 'role="treeitem"' : 'role="option"'}>
              <img src="${props.icon}" style="width:20px;height:20px;margin-right:8px;border-radius:50%;vertical-align:middle">
              ${props.name}<span style="color:#aaa;font-size:.97em;"> (${props.code})</span>
            </div>
          `);
        }
      };
    }
  });
}

function getListByType(type) {
  return type === 'fiat' ? fiatList : cryptoList;
}
function getChoicesByType(type) {
  return type === 'fiat' ? fiatChoices : cryptoChoices;
}
function setChoicesByType(type, choices) {
  if (type === 'fiat') fiatChoices = choices;
  else cryptoChoices = choices;
}
function getOppositeType(type) {
  return type === 'fiat' ? 'crypto' : 'fiat';
}

document.addEventListener('DOMContentLoaded', () => {
  fiatChoices = createChoices('fiat-currency', fiatList, 'UAH');
  cryptoChoices = createChoices('crypto-currency', cryptoList, 'BTC');

  // Свап
  document.getElementById('swap-btn').addEventListener('click', function() {
    // Беремо поточні значення
    const fiatValue = fiatChoices.getValue(true);
    const cryptoValue = cryptoChoices.getValue(true);

    // Міняємо місцями select-и
    // Для swap: якщо вибрали, наприклад, ETH в крипті і USD у фіаті, то ETH стане фіатом, USD криптою
    const fiatObj = fiatList.find(f => f.code === fiatValue);
    const cryptoObj = cryptoList.find(c => c.code === cryptoValue);

    // Якщо хтось вибирає не-крипту у другому полі — не міняємо!
    if (!cryptoObj || !fiatObj) return;

    // Оновлюємо списки
    fiatChoices.destroy();
    cryptoChoices.destroy();
    fiatChoices = createChoices('fiat-currency', [ ...fiatList, ...cryptoList ], cryptoValue);
    cryptoChoices = createChoices('crypto-currency', [ ...fiatList, ...cryptoList ], fiatValue);
  });
});

// --- Логіка калькулятора ---
const calcForm = document.getElementById('calc-form');
const resultDiv = document.getElementById('result');

// Для Coingecko — map кодів у id
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

async function getExchangeRate(from, to) {
  const fromId = cgMap[from], toId = cgMap[to];
  if (!fromId || !toId) return null;
  // Якщо обидва — крипта, Coingecko підтримує такий запит (btc в eth і т.д.)
  // Якщо один — фіат, інший — крипта: теж ок
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${fromId}&vs_currencies=${toId}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data[fromId][toId];
  } catch (e) {
    return null;
  }
}

if (calcForm) {
  calcForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    resultDiv.textContent = "Завантаження...";
    const amount = parseFloat(document.getElementById('amount').value);
    const from = fiatChoices.getValue(true);
    const to = cryptoChoices.getValue(true);

    if (!amount || amount <= 0) {
      resultDiv.textContent = "Введіть коректну суму.";
      return;
    }
    if (from === to) {
      resultDiv.textContent = "Валюти повинні відрізнятися!";
      return;
    }
    const rate = await getExchangeRate(from, to);
    if (!rate) {
      resultDiv.textContent = "Курс не знайдено.";
      return;
    }
    // Додаємо +2% комісії
    const rateWithFee = rate * 1.02;
    const toAmount = amount / rateWithFee;

    const fromObj = [ ...fiatList, ...cryptoList ].find(x => x.code === from);
    const toObj = [ ...fiatList, ...cryptoList ].find(x => x.code === to);

    resultDiv.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;gap:8px">
        <img src="${fromObj.icon}" style="width:22px;height:22px;border-radius:50%;vertical-align:middle">
        <b>${amount} ${from}</b>
        <span style="color:#aaa">→</span>
        <img src="${toObj.icon}" style="width:22px;height:22px;border-radius:50%;vertical-align:middle">
        <b>${toAmount.toFixed(6)} ${to}</b>
      </div>
      <div style="margin-top:8px">
        Курс з комісією: <b>1 ${to} = ${(1/rateWithFee).toFixed(8)} ${from}</b>
      </div>
    `;
  });
}
