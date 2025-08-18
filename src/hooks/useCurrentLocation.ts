import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { LatLng, getCurrentCoords } from 'src/lib/location';

export function useCurrentLocation(
  options?: Location.LocationOptions & {
    distanceInterval?: number;
    timeInterval?: number;
  },
) {
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const c = await getCurrentCoords(options);
    setCoords(c);
    setError(c ? null : 'Unable to get location');
    setLoading(false);
  }, [options]);

  return { coords, loading, error, refresh };
}
