export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationData extends Coordinates {
  city?: string;
  country?: string;
  address?: string;
  timestamp: number;
}

const GEOCODE_CACHE_KEY = 'location_geocode_cache';

interface GeocodeCache {
  [key: string]: {
    city: string;
    country: string;
    address?: string;
    timestamp: number;
  };
}

function getGeocodeCache(): GeocodeCache {
  const stored = localStorage.getItem(GEOCODE_CACHE_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveGeocodeCache(cache: GeocodeCache) {
  localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
}

export async function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({
          lat: latitude,
          lng: longitude,
          timestamp: Date.now(),
        });
      },
      (error) => {
        reject(new Error(`Failed to get location: ${error.message}`));
      }
    );
  });
}

export async function watchLocation(
  callback: (location: LocationData) => void,
  errorCallback: (error: Error) => void
): Promise<number> {
  if (!('geolocation' in navigator)) {
    errorCallback(new Error('Geolocation is not supported by your browser'));
    return -1;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      callback({
        lat: latitude,
        lng: longitude,
        timestamp: Date.now(),
      });
    },
    (error) => {
      errorCallback(new Error(`Location tracking error: ${error.message}`));
    },
    {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
    }
  );
}

export function clearWatchLocation(watchId: number) {
  if (watchId > 0) {
    navigator.geolocation.clearWatch(watchId);
  }
}

export async function getLocationFromCoordinates(
  lat: number,
  lng: number
): Promise<{ city: string; country: string; address?: string }> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cache = getGeocodeCache();

  if (cache[cacheKey]) {
    return {
      city: cache[cacheKey].city,
      country: cache[cacheKey].country,
      address: cache[cacheKey].address,
    };
  }

  try {
    // Using OpenStreetMap Nominatim API for reverse geocoding (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json();
    const address = data.address || {};

    const locationInfo = {
      city: address.city || address.town || address.village || 'Unknown City',
      country: address.country || 'Unknown Country',
      address: data.display_name || undefined,
    };

    cache[cacheKey] = {
      ...locationInfo,
      timestamp: Date.now(),
    };

    saveGeocodeCache(cache);
    return locationInfo;
  } catch (error) {
    console.warn('Geocoding failed, using default location:', error);
    return {
      city: 'Unknown City',
      country: 'Unknown Country',
    };
  }
}

export function formatLocationDisplay(location: LocationData): string {
  if (location.city && location.country) {
    return `${location.city}, ${location.country}`;
  }
  return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
}

export function getCoordinateString(coords: Coordinates): string {
  return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
}
