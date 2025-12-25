import { discoverEventMarkets } from '../src/services/discoverEventMarkets.ts';

(async () => {
  const sportKey = 'soccer_epl';
  const eventId = '7867392310794b77294b542fcf6940cf';

  const markets = await discoverEventMarkets(sportKey, eventId);
  console.log(JSON.stringify(markets, null, 2));
})();