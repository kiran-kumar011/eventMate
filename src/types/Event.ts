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
  // createdAt: string; could be easy to implement the timestamps for referencing
};
