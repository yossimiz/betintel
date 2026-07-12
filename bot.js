const fs = require('node:fs');
const path = require('node:path');

const OUTPUT_FILE = path.join(__dirname, 'data.json');
const REQUEST_TIMEOUT_MS = 15000;

// Replace affiliateLink values with your approved affiliate tracking URLs.
const operators = [
  {
    name: '888 Casino',
    url: 'https://www.888casino.com/',
    affiliateLink: 'https://www.888casino.com/',
    fallbackBonus: 'Check the official site for the current welcome offer.'
  },
  {
    name: 'LeoVegas',
    url: 'https://www.leovegas.com/',
    affiliateLink: 'https://www.leovegas.com/',
    fallbackBonus: 'Check the official site for the current welcome offer.'
  },
  {
    name: 'Unibet',
    url: 'https://www.unibet.com/',
    affiliateLink: 'https://www.unibet.com/',
    fallbackBonus: 'Check the official site for the current welcome offer.'
  },
  {
    name: 'Bet365',
    url: 'https://www.bet365.com/',
    affiliateLink: 'https://www.bet365.com/',
    fallbackBonus: 'Check the official site for the current welcome offer.'
  },
  {
    name: 'Mr Green',
    url: 'https://www.mrgreen.com/',
    affiliateLink: 'https://www.mrgreen.com/',
    fallbackBonus: 'Check the official site for the current welcome offer.'
  },
  {
    name: 'Stake.com',
    url: 'https://stake.com/',
    affiliateLink: 'https://stake.com/',
    fallbackBonus: 'Check the official site for the current welcome offer.'
  }
];

function decodeHtmlEntities(text) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&euro;/gi, '€')
    .replace(/&pound;/gi, '£')
    .replace(/&dollar;/gi, '$');
}

function htmlToText(html) {
  return decodeHtmlEntities(
    html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
  ).trim();
}

function extractBonus(html) {
  const text = htmlToText(html);
  const patterns = [
    /(?:welcome|new player|first deposit)[^.?!]{0,120}(?:bonus|free spins|match)[^.?!]{0,120}/i,
    /(?:up to|receive|get|claim)\s*(?:€|£|\$)?\s*[\d,.]+%?[^.?!]{0,100}(?:bonus|free spins|match)[^.?!]{0,100}/i,
    /\d+\s*free spins[^.?!]{0,120}/i,
    /\d+%\s*(?:deposit|match)\s*bonus[^.?!]{0,120}/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].replace(/\s+/g, ' ').trim().slice(0, 220);
    }
  }
  return null;
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; BetIntelBonusMonitor/1.0; +https://github.com/)',
        accept: 'text/html,application/xhtml+xml'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function inspectOperator(operator) {
  try {
    const html = await fetchHtml(operator.url);
    const extracted = extractBonus(html);

    return {
      name: operator.name,
      url: operator.url,
      bonus: extracted || operator.fallbackBonus,
      affiliateLink: operator.affiliateLink,
      status: extracted ? 'scraped' : 'needs-review',
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    console.warn(`Could not inspect ${operator.name}: ${error.message}`);
    return {
      name: operator.name,
      url: operator.url,
      bonus: operator.fallbackBonus,
      affiliateLink: operator.affiliateLink,
      status: 'unavailable',
      checkedAt: new Date().toISOString()
    };
  }
}

async function run() {
  console.log('Checking operator pages...');
  const results = [];

  // Sequential requests reduce the chance of rate limiting.
  for (const operator of operators) {
    const result = await inspectOperator(operator);
    results.push(result);
    console.log(`${result.status.padEnd(12)} ${result.name}`);
  }

  const data = {
    lastUpdated: new Date().toISOString(),
    notice: 'Offers can change and may depend on country, age and eligibility. Verify all offers on the operator website before publishing.',
    operators: results,
    promoCodes: []
  };

  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Updated ${OUTPUT_FILE}`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
