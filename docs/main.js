// Список фіатних валют з іконками
const fiatList = [
  { code: 'UAH', name: 'Гривня', icon: 'assets/icons/uah.svg' },
  { code: 'USD', name: 'Долар', icon: 'assets/icons/usd.svg' },
  { code: 'EUR', name: 'Євро', icon: 'assets/icons/eur.svg' }
];
// Список криптовалют з іконками
const cryptoList = [
  { code: 'BTC', name: 'Bitcoin', icon: 'assets/icons/bitcoin-btc-logo.svg' },
  { code: 'ETH', name: 'Ethereum', icon: 'assets/icons/ethereum-eth-logo.svg' },
  { code: 'USDT', name: 'Tether', icon: 'assets/icons/tether-usdt-logo.svg' },
  { code: 'BNB', name: 'Binance Coin', icon: 'assets/icons/binance-coin-bnb-logo.svg' },
  { code: 'SOL', name: 'Solana', icon: 'assets/icons/solana-sol-logo.svg' },
  { code: 'TON', name: 'Toncoin', icon: 'assets/icons/toncoin-ton-logo.svg' }
];

// Функція для ініціалізації select з іконками через Choices.js
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
  fillChoices('fiat-currency', fiatList, 'EUR');
  fillChoices('crypto-currency', cryptoList, 'BTC');
});
