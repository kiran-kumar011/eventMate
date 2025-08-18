import { useEvents } from 'src/store/useEvents';

export async function runEventAssetUpdate() {
  const s = useEvents.getState();
  await s.hydrateFromAssets();
  await s.applyUpdatesFromAssetsByUpdatedAt();
}
