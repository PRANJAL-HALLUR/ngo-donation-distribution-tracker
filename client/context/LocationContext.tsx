import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCurrentLocation,
  watchLocation,
  clearWatchLocation,
  getLocationFromCoordinates,
  type LocationData,
} from '@/lib/location';

interface LocationContextType {
  location: LocationData | null;
  locationName: string | null;
  permissionGranted: boolean;
  permissionAsked: boolean;
  loading: boolean;
  error: string | null;
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationData>;
  stopTracking: () => void;
  startTracking: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const LOCATION_PERMISSION_KEY = 'location_permission_granted';
const LOCATION_PERMISSION_ASKED_KEY = 'location_permission_asked';
const LAST_LOCATION_KEY = 'last_known_location';

function getStoredPermission(): boolean {
  const stored = localStorage.getItem(LOCATION_PERMISSION_KEY);
  return stored === 'true';
}

function getPermissionAsked(): boolean {
  const stored = localStorage.getItem(LOCATION_PERMISSION_ASKED_KEY);
  return stored === 'true';
}

function savePermission(granted: boolean) {
  localStorage.setItem(LOCATION_PERMISSION_KEY, String(granted));
  localStorage.setItem(LOCATION_PERMISSION_ASKED_KEY, 'true');
}

function getStoredLocation(): LocationData | null {
  const stored = localStorage.getItem(LAST_LOCATION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function saveLocation(location: LocationData) {
  localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location));
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(getStoredLocation());
  const [locationName, setLocationName] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(getStoredPermission());
  const [permissionAsked, setPermissionAsked] = useState(getPermissionAsked());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number>(-1);

  const updateLocationName = useCallback(async (loc: LocationData) => {
    if (loc.city) {
      setLocationName(loc.city + (loc.country ? `, ${loc.country}` : ''));
      return;
    }

    try {
      const nameData = await getLocationFromCoordinates(loc.lat, loc.lng);
      const formatted = `${nameData.city}${nameData.country ? ', ' + nameData.country : ''}`;
      setLocationName(formatted);
    } catch (err) {
      console.warn('Failed to get location name:', err);
      setLocationName(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
    }
  }, []);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const loc = await getCurrentLocation();
      saveLocation(loc);
      setLocation(loc);
      setPermissionGranted(true);
      setPermissionAsked(true);
      savePermission(true);

      // Update location name asynchronously without blocking
      updateLocationName(loc).catch((err) => {
        console.warn('Failed to get location name:', err);
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get location';
      console.error('Location permission error:', message);
      setError(message);
      setPermissionGranted(false);
      setPermissionAsked(true);
      savePermission(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, [updateLocationName]);

  const getLocationCallback = useCallback(async (): Promise<LocationData> => {
    if (!permissionGranted) {
      throw new Error('Location permission not granted');
    }

    setLoading(true);
    try {
      const loc = await getCurrentLocation();
      saveLocation(loc);
      setLocation(loc);
      await updateLocationName(loc);
      return loc;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get location';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [permissionGranted, updateLocationName]);

  const startTracking = useCallback(async () => {
    if (!permissionGranted || watchId >= 0) return;

    const id = await watchLocation(
      async (loc) => {
        saveLocation(loc);
        setLocation(loc);
        await updateLocationName(loc);
      },
      (err) => {
        console.warn('Location tracking error:', err);
        setError(err.message);
      }
    );

    if (id > 0) {
      setWatchId(id);
    }
  }, [permissionGranted, watchId, updateLocationName]);

  const stopTracking = useCallback(() => {
    if (watchId >= 0) {
      clearWatchLocation(watchId);
      setWatchId(-1);
    }
  }, [watchId]);

  // Restore location name when location updates
  useEffect(() => {
    if (location && !locationName) {
      updateLocationName(location);
    }
  }, [location, locationName, updateLocationName]);

  const value: LocationContextType = {
    location,
    locationName,
    permissionGranted,
    permissionAsked,
    loading,
    error,
    requestLocationPermission,
    getCurrentLocation: getLocationCallback,
    stopTracking,
    startTracking,
  };

  return (
    <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
