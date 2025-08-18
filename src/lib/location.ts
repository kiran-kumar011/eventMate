import * as Location from 'expo-location';

export type LatLng = { latitude: number; longitude: number };

export async function ensureLocationPermission() {
  const { status: fg } = await Location.requestForegroundPermissionsAsync();
  if (fg !== 'granted')
    throw new Error('Location permission (foreground) denied');
  let bgGranted = true;
  if (Location?.hasServicesEnabledAsync) {
    const hasServicesEnabledAsync = await Location.hasServicesEnabledAsync();
  }

  return bgGranted;
}

/** One-shot: returns current coordinates (tries last known first for speed). */
export async function getCurrentCoords(
  options: Partial<Location.LocationOptions> = {
    accuracy: Location.Accuracy.Balanced,
  },
): Promise<LatLng | null> {
  try {
    if (!(await ensureLocationPermission())) return null;

    const last = await Location.getLastKnownPositionAsync();
    if (last?.coords) {
      return {
        latitude: last.coords.latitude,
        longitude: last.coords.longitude,
      };
    }

    const pos = await Location.getCurrentPositionAsync(
      options as Location.LocationOptions,
    );
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch (e) {
    console.warn('getCurrentCoords error', e);
    return null;
  }
}

export const isValidCoord = (lat?: number | null, lng?: number | null) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  (lat as number) >= -90 &&
  (lat as number) <= 90 &&
  (lng as number) >= -180 &&
  (lng as number) <= 180;
