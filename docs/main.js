// --- Дані валют ---
const currencies = [
  {code: 'UAH', name: 'Гривня', icon: 'assets/icons/uah.svg'},
  {code: 'USD', name: 'Долар', icon: 'assets/icons/usd.svg'},
  {code: 'EUR', name: 'Євро', icon: 'assets/icons/eur.svg'},
  {code: 'BTC', name: 'Bitcoin', icon: 'assets/icons/btc.svg'},
  {code: 'ETH', name: 'Ethereum', icon: 'assets/icons/eth.svg'},
  {code: 'USDT', name: 'Tether', icon: 'assets/icons/usdt.svg'},
  {code: 'BNB', name: 'Binance Coin', icon: 'assets/icons/bnb.svg'},
  {code: 'SOL', name: 'Solana', icon: 'assets/icons/sol.svg'},
  {code: 'TON', name: 'Toncoin', icon: 'assets/icons/ton.svg'}
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

let fromChoices, toChoices;

function fillChoices(selectId, currList, defaultCode) {
  const select = document.getElementById(selectId);
  select.innerHTML = '';
  currList.forEach(item => {
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
              <img src="${props.icon}" style="width:20px;height:20px;margin-right:8px;border-radius:50%;vertical-align:middle">
              <span>${props.code}</span>
            </div>
          `);
        },
        option: (classNames, data) => {
          const props = JSON.parse(data.customProperties);
          return template(`
            <div class="${classNames.item} ${classNames.itemChoice}" data-select-text="" data-choice ${data.disabled ? 'data-choice-disabled aria-disabled="true"' : 'data-choice-selectable'} data-id="${data.id}" data-value="${data.value}" ${data.groupId > 0 ? 'role="treeitem"' : 'role="option"'}>
              <img src="${props.icon}" style="width:20px;height:20px;margin-right:8px;border-radius:50%;vertical-align:middle">
              <b>${props.code}</b> <span style="color:#aaa;font-size:.97em;">${props.name}</span>
            </div>
          `);
        }
      };
    }
  });
}

function getCurrency(code) {
  return currencies.find(c => c.code === code);
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

function showRateInfo(rate, from, to) {
  const rateWithFee = rate * 1.02;
  document.getElementById('rate-info').innerHTML = `
    <img src="${getCurrency(from).icon}" style="width:18px;height:18px;vertical-align:middle;border-radius:50%;"> 
    1 ${from} ≈ <b>${rateWithFee.toFixed(8)} ${to}</b>
    <img src="${getCurrency(to).icon}" style="width:18px;height:18px;vertical-align:middle;border-radius:50%;"> 
    <span style="color:#aaa">(з комісією 2%)</span>
  `;
}

async function recalc(direction = "from") {
  const from = fromChoices.getValue(true);
  const to = toChoices.getValue(true);
  if (from === to) {
    document.getElementById('rate-info').textContent = "Валюти повинні бути різними!";
    document.getElementById('to-amount').value = "";
    return;
  }
  const rate = await getExchangeRate(from, to);
  if (!rate) {
    document.getElementById('rate-info').textContent = "Курс не знайдено!";
    document.getElementById('to-amount').value = "";
    return;
  }
  showRateInfo(rate, from, to);
  let fromAmount = parseFloat(document.getElementById('from-amount').value);
  let toAmount = parseFloat(document.getElementById('to-amount').value);

  if (direction === "from" && fromAmount > 0) {
    let rateWithFee = rate * 1.02;
    document.getElementById('to-amount').value = (fromAmount / rateWithFee).toFixed(8);
  } else if (direction === "to" && toAmount > 0) {
    let rateWithFee = rate * 1.02;
    document.getElementById('from-amount').value = (toAmount * rateWithFee).toFixed(2);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fromChoices = fillChoices('from-currency', currencies, 'UAH');
  toChoices = fillChoices('to-currency', currencies, 'BTC');
  recalc();

  document.getElementById('from-amount').addEventListener('input', () => recalc("from"));
  document.getElementById('to-amount').addEventListener('input', () => recalc("to"));
  document.getElementById('from-currency').addEventListener('change', () => recalc("from"));
  document.getElementById('to-currency').addEventListener('change', () => recalc("from"));

  document.getElementById('swap-btn').addEventListener('click', () => {
    let from = fromChoices.getValue(true);
    let to = toChoices.getValue(true);

    fromChoices.setChoiceByValue(to);
    toChoices.setChoiceByValue(from);

    let fromA = document.getElementById('from-amount').value;
    let toA = document.getElementById('to-amount').value;
    document.getElementById('from-amount').value = toA;
    document.getElementById('to-amount').value = fromA;

    recalc("from");
  });

  document.getElementById('to-amount').setAttribute('readonly', 'readonly');

  document.getElementById('exchange-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    document.getElementById('result-message').textContent = '';
    const from = fromChoices.getValue(true);
    const to = toChoices.getValue(true);
    let fromA = parseFloat(document.getElementById('from-amount').value);
    let toA = parseFloat(document.getElementById('to-amount').value);

    if (!fromA || fromA <= 0) {
      document.getElementById('result-message').textContent = "Введіть коректну суму для обміну.";
      return;
    }
    if (from === to) {
      document.getElementById('result-message').textContent = "Валюти повинні бути різними!";
      return;
    }
    if (!toA || toA <= 0) {
      document.getElementById('result-message').textContent = "Неможливо розрахувати обмін — спробуйте ще раз.";
      return;
    }
    document.getElementById('result-message').innerHTML = `
      ✅ <b>${fromA} ${from}</b> → <b>${toA} ${to}</b> — заявка на обмін створена!
    `;
  });
});
