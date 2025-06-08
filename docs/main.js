const fiatList = [
  { code: 'UAH', name: 'Гривня', icon: 'assets/icons/UAH.svg' },
  { code: 'USD', name: 'Долар', icon: 'assets/icons/USD.svg' },
  { code: 'EUR', name: 'Євро', icon: 'assets/icons/EUR.svg' }
];
const cryptoList = [
  { code: 'BTC', name: 'Bitcoin', icon: 'assets/icons/bitcoin-btc-logo.svg' },
  { code: 'ETH', name: 'Ethereum', icon: 'assets/icons/ethereum-eth-logo.svg' },
  { code: 'USDT', name: 'Tether', icon: 'assets/icons/tether-usdt-logo.svg' },
  { code: 'BNB', name: 'Binance Coin', icon: 'assets/icons/binance-coin-bnb-logo.svg' },
  { code: 'SOL', name: 'Solana', icon: 'assets/icons/solana-sol-logo.svg' },
  { code: 'TON', name: 'Toncoin', icon: 'assets/icons/toncoin-ton-logo.svg' },
];

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

document.addEventListener('DOMContentLoaded', () => {
  fillSelects();
  document.getElementById('fiat-currency').addEventListener('change', updateIcons);
  document.getElementById('crypto-currency').addEventListener('change', updateIcons);
});
