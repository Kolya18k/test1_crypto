// Список валют і шляхи до їх SVG-іконок
const currencies = [
  // Крипто
  { code: "BTC", name: "Bitcoin", icon: "assets/icons/bitcoin-btc-logo.svg" },
  { code: "ETH", name: "Ethereum", icon: "assets/icons/ethereum-eth-logo.svg" },
  { code: "BNB", name: "Binance Coin", icon: "assets/icons/binance-coin-bnb-logo.svg" },
  { code: "ADA", name: "Cardano", icon: "assets/icons/cardano-ada-logo.svg" },
  { code: "XRP", name: "XRP", icon: "assets/icons/xrp-xrp-logo.svg" },
  { code: "DOT", name: "Polkadot", icon: "assets/icons/polkadot-new-dot-logo.svg" },
  { code: "SOL", name: "Solana", icon: "assets/icons/solana-sol-logo.svg" },
  { code: "LTC", name: "Litecoin", icon: "assets/icons/litecoin-ltc-logo.svg" },
  { code: "DOGE", name: "Dogecoin", icon: "assets/icons/dogecoin-doge-logo.svg" },
  { code: "TRX", name: "Tron", icon: "assets/icons/tron-trx-logo.svg" },
  { code: "TON", name: "Toncoin", icon: "assets/icons/toncoin-ton-logo.svg" },
  { code: "USDT", name: "Tether", icon: "assets/icons/tether-usdt-logo.svg" },
  // Фіат
  { code: "USD", name: "US Dollar", icon: "assets/icons/usd.svg" },
  { code: "UAH", name: "Hryvnia", icon: "assets/icons/uah.svg" },
  { code: "EUR", name: "Euro", icon: "assets/icons/eur.svg" },
  { code: "PLN", name: "Polish Zloty", icon: "assets/icons/pln.svg" },
  { code: "GBP", name: "British Pound", icon: "assets/icons/gbp.svg" },
  { code: "CHF", name: "Swiss Franc", icon: "assets/icons/chf.svg" },
  { code: "CAD", name: "Canadian Dollar", icon: "assets/icons/cad.svg" },
  { code: "CZK", name: "Czech Koruna", icon: "assets/icons/czk.svg" },
  { code: "SEK", name: "Swedish Krona", icon: "assets/icons/sek.svg" }
];

const fiatOnKraken = ["USD", "EUR", "PLN", "GBP", "CHF", "CAD", "CZK", "SEK"]; // Fiats, які є на Кракені

// Вставка валют у селекти
function fillCurrencySelects() {
  const fromSelect = document.getElementById("from-currency");
  const toSelect = document.getElementById("to-currency");
  currencies.forEach(cur => {
    const opt1 = document.createElement("option");
    opt1.value = cur.code;
    opt1.innerHTML = `<span class="currency-option"><img src="${cur.icon}" alt="">${cur.code}</span> ${cur.name}`;
    fromSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = cur.code;
    opt2.innerHTML = `<span class="currency-option"><img src="${cur.icon}" alt="">${cur.code}</span> ${cur.name}`;
    toSelect.appendChild(opt2);
  });
  fromSelect.value = "BTC";
  toSelect.value = "UAH";
}

// Формує тикер для Kraken API (наприклад: XXBTZUSD, XETHZEUR, ...)
// Таблиця мапінгу для деяких валют:
const krakenMap = {
  BTC: "XBT",
  DOGE: "XDG",
  USDT: "USDT",
  TON: "TON",
  XRP: "XRP",
  ADA: "ADA",
  BNB: "BNB",
  DOT: "DOT",
  ETH: "ETH",
  LTC: "LTC",
  SOL: "SOL",
  TRX: "TRX"
};
// Фіати пишуться так як є (USD, EUR, PLN, тощо)

function krakenPair(from, to) {
  // Kraken не підтримує всі прямі пари, але основні є.
  let a = krakenMap[from] || from;
  let b = krakenMap[to] || to;
  if (a === "UAH" || b === "UAH") return null; // UAH нема на Kraken
  // Kraken має специфічні префікси для деяких валют
  // Наприклад: XBT -> XXBTZUSD
  let left = a.match(/^(USD|EUR|PLN|GBP|CHF|CAD|CZK|SEK)$/) ? a : "X" + a;
  let right = b.match(/^(USD|EUR|PLN|GBP|CHF|CAD|CZK|SEK)$/) ? b : "X" + b;
  // USDT, ADA, TON, DOT, XRP, DOGE, TRX, SOL, BNB, LTC можуть бути без X
  if (a === "USDT" || a === "ADA" || a === "TON" || a === "DOT" || a === "XRP" || a === "DOGE" || a === "TRX" || a === "SOL" || a === "BNB" || a === "LTC") left = a;
  if (b === "USDT" || b === "ADA" || b === "TON" || b === "DOT" || b === "XRP" || b === "DOGE" || b === "TRX" || b === "SOL" || b === "BNB" || b === "LTC") right = b;
  // Формуємо пару
  return left + right;
}

async function fetchKrakenRate(pair) {
  const url = `https://api.kraken.com/0/public/Ticker?pair=${pair}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Не вдалося отримати курси з Kraken");
  const data = await resp.json();
  if (!data.result || Object.keys(data.result).length === 0) throw new Error("Курс не знайдено");
  const res = data.result[Object.keys(data.result)[0]];
  return parseFloat(res.c[0]); // c[0] — останній курс
}

// Якщо немає прямої пари, пробуємо через USD (наприклад BTC→UAH: BTC→USD x USD→UAH)
async function getRate(from, to) {
  if (from === to) return 1;
  // UAH нема на Kraken, тому UAH тільки через USD (курс USD/UAH беремо з банку)
  if (from === "UAH" || to === "UAH") {
    // Курс USD→UAH з Monobank API
    const resp = await fetch("https://api.monobank.ua/bank/currency");
    if (!resp.ok) throw new Error("Не вдалося отримати курс UAH");
    const data = await resp.json();
    const usd = data.find(c => c.currencyCodeA === 840 && c.currencyCodeB === 980);
    if (!usd) throw new Error("Курс USD-UAH не знайдено");
    let usdToUah = usd.rateSell || usd.rateCross || usd.rateBuy;
    // Якщо from UAH → to BTC/ETH/..., то ділимо на USD→UAH та множимо на курс to/USD
    if (from === "UAH") {
      const pair = krakenPair("USD", to);
      if (!pair) throw new Error("Обрана пара недоступна");
      const rate = await fetchKrakenRate(pair);
      return (1 / usdToUah) * rate;
    } else {
      // from BTC/ETH/... → UAH: курс from→USD * USD→UAH
      const pair = krakenPair(from, "USD");
      if (!pair) throw new Error("Обрана пара недоступна");
      const rate = await fetchKrakenRate(pair);
      return rate * usdToUah;
    }
  } else {
    // Обидві валюти є на Kraken
    const pair = krakenPair(from, to);
    if (pair) {
      return await fetchKrakenRate(pair);
    }
    // Якщо немає прямої пари, пробуємо через USD
    const pair1 = krakenPair(from, "USD");
    const pair2 = krakenPair("USD", to);
    if (pair1 && pair2) {
      const rate1 = await fetchKrakenRate(pair1);
      const rate2 = await fetchKrakenRate(pair2);
      return rate1 * rate2;
    }
    throw new Error("Обрана пара недоступна");
  }
}

async function recalc() {
  const from = document.getElementById("from-currency").value;
  const to = document.getElementById("to-currency").value;
  const amount = parseFloat(document.getElementById("from-amount").value) || 0;
  document.getElementById("error-message").textContent = "";
  document.getElementById("rate-info").textContent = "Оновлення курсу...";
  document.getElementById("to-amount").value = "";

  try {
    const rate = await getRate(from, to);
    document.getElementById("to-amount").value = (amount * rate).toFixed(6);
    document.getElementById("rate-info").textContent = `1 ${from} = ${rate.toFixed(6)} ${to}`;
  } catch (e) {
    document.getElementById("error-message").textContent = e.message;
    document.getElementById("rate-info").textContent = "";
  }
}

// Додаємо іконки в селекти
function decorateSelects() {
  document.querySelectorAll("select").forEach(select => {
    select.innerHTML = "";
    currencies.forEach(cur => {
      const opt = document.createElement("option");
      opt.value = cur.code;
      opt.innerHTML = `${cur.code}`;
      select.appendChild(opt);
    });
  });
}

// SVG іконки в option — через JS (для всіх браузерів)
function addSVGIconsToSelects() {
  document.querySelectorAll("select").forEach(select => {
    select.querySelectorAll("option").forEach(option => {
      const cur = currencies.find(c => c.code === option.value);
      if (cur) {
        option.innerHTML = "";
        const span = document.createElement("span");
        span.className = "currency-option";
        const img = document.createElement("img");
        img.src = cur.icon;
        img.alt = cur.code;
        span.appendChild(img);
        const txt = document.createElement("span");
        txt.textContent = " " + cur.code;
        span.appendChild(txt);
        option.appendChild(span);
      }
    });
  });
}

// --- INIT ---
fillCurrencySelects();
addSVGIconsToSelects();
document.getElementById("from-currency").addEventListener("change", recalc);
document.getElementById("to-currency").addEventListener("change", recalc);
document.getElementById("from-amount").addEventListener("input", recalc);

// Перший раз
recalc();
