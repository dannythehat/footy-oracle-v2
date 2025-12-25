const BASE_URL = 'https://api.the-odds-api.com/v4';

export async function fetchEventMarkets(
  sportKey: string,
  eventId: string
) {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    throw new Error('ODDS_API_KEY missing');
  }

  const url =
    BASE_URL +
    '/sports/' +
    sportKey +
    '/events/' +
    eventId +
    '/markets?apiKey=' +
    apiKey +
    '&regions=eu';

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Odds API error ' + res.status);
  }

  return res.json();
}