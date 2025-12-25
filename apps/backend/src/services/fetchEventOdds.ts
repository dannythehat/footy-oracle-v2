const BASE_URL = 'https://api.the-odds-api.com/v4';

export async function fetchEventOdds(
  sportKey: string,
  eventId: string,
  marketKeys: string[]
) {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    throw new Error('ODDS_API_KEY missing');
  }

  const marketsParam = marketKeys.join(',');

  const url =
    BASE_URL +
    '/sports/' +
    sportKey +
    '/events/' +
    eventId +
    '/odds?apiKey=' +
    apiKey +
    '&regions=eu' +
    '&markets=' +
    marketsParam +
    '&oddsFormat=decimal';

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Odds API error ' + res.status);
  }

  return res.json();
}