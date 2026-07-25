import { useEffect, useState } from 'react';
import { fetchLiveAds } from '../utils/publicApi.js';

let cachedAds = null;
let inFlight = null;

function getAdsOnce() {
  if (cachedAds) return Promise.resolve(cachedAds);
  if (!inFlight) {
    inFlight = fetchLiveAds().then((data) => {
      cachedAds = data; // may be null if backend unreachable — callers handle that
      return data;
    });
  }
  return inFlight;
}

/** Returns the live ads array (or null if unavailable/not yet loaded). */
export function useLiveAds() {
  const [ads, setAds] = useState(cachedAds);

  useEffect(() => {
    if (cachedAds) return; // already have it
    let cancelled = false;
    getAdsOnce().then((data) => { if (!cancelled) setAds(data); });
    return () => { cancelled = true; };
  }, []);

  return ads;
}
