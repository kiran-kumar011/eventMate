export type Event = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  venueName: string;
  latitude: number | undefined;
  longitude: number | undefined;
  description: string;
  imageUrl: string;
  updatedAt: string;
  status?: 'active' | 'canceled' | 'archived';
  recentlyUpdated?: boolean;
  createdAt: string;
};

export type Pin = {
  id: string;
  lat: number;
  lon: number;
  title?: string;
  address?: string;
  createdAt: string;
  eventId?: string;
};

export type Params = { id?: string };

export type EventMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  title?: string;
  description?: string;
  height?: number;
  zoomDelta?: number;
  borderRadius?: number;
  disableGestures?: boolean;
  setCoords?: (coords: LatLng) => void;
};

export type LatLng = { latitude: number | null; longitude: number | null };
