// eslint-disable-next-line @typescript-eslint/no-var-requires
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { events } from '@assets/data/events.json';
import type { Event as BaseEvent, Pin } from 'src/types/Event';

import basePkg from '@assets/data/events.json';

type Event = BaseEvent & { recentlyUpdated?: boolean };

type State = {
  events: Event[];
  planIds: string[];
  lastKnownLocation: { latitude: number; longitude: number } | null;
  meta: {
    eventsVersion: number;
    lastUpdateScanAt?: string;
    hasUpdated: boolean;
  };
  __originals?: Record<string, Event | undefined>;
  __updatedEvents?: Event[] | [];
  pins?: Pin[];
};

type Actions = {
  addToPlan: (id: string) => void;
  removeFromPlan: (id: string) => void;
  togglePlan: (id: string) => void;
  addDraft: (e: Event) => void;
  setLastKnownLocation: (lat: number, lon: number) => void;
  hydrateFromAssets: () => void;
  applyUpdatesFromAssetsByUpdatedAt: () => number;
  clearUpdatedFlags: () => void;
  updateSeen: (id: string) => void;
  updateEvent: (e: Event) => void;
  updateWithUpdatedEvents: () => void;
};

const baseEvents: Event[] = (basePkg as any).events ?? [];
const baseMetaVersion: number = (basePkg as any).meta?.version ?? 0;

export const useEvents = create<State & Actions>()(
  persist(
    (set, get) => ({
      events: events as Event[],
      planIds: [],
      lastKnownLocation: null,
      meta: { eventsVersion: baseMetaVersion, hasUpdated: false },

      togglePlan: async (id) =>
        set((s) => ({
          planIds: s.planIds.includes(id)
            ? s.planIds.filter((x) => x !== id)
            : [...s.planIds, id],
        })),
      addToPlan: (id) =>
        set((s) =>
          s.planIds.includes(id) ? s : { planIds: [...s.planIds, id] },
        ),

      removeFromPlan: (id) =>
        set((s) => ({ planIds: s.planIds.filter((x) => x !== id) })),

      addDraft: (e) => set((s) => ({ events: [e, ...s.events] })),
      setLastKnownLocation: (latitude, longitude) =>
        set({ lastKnownLocation: { latitude, longitude } }),

      // NEW: If app/OTA ships a higher base version, replace local cache with the new base
      hydrateFromAssets: () => {
        const { meta } = get();
        const bundledVersion = baseMetaVersion;
        if ((meta.eventsVersion ?? 0) < bundledVersion) {
          set({
            events: baseEvents.map((e) => ({ ...e, recentlyUpdated: false })),
            meta: { ...meta, eventsVersion: bundledVersion },
          });
        }
      },
      // NEW: Compare updates file against local cache by updatedAt; upsert newer; flag as recentlyUpdated
      applyUpdatesFromAssetsByUpdatedAt: () => {
        const updatesPayload = require('@assets/data/events_updates.json');
        const updates = updatesPayload?.events ?? [];
        const state = get();

        if (!updates?.length) {
          set({
            meta: { ...state.meta, lastUpdateScanAt: new Date().toISOString() },
          });
          return 0;
        }

        const next = [...state.events];
        let changed = 0;

        for (const incoming of updates) {
          const idx = next.findIndex((e) => e.id === incoming.id);
          const incUpdAt = Date.parse(incoming.updatedAt ?? '');
          const curUpdAt =
            idx >= 0 ? Date.parse(next[idx].updatedAt ?? '') : -1;

          if (
            idx === -1 ||
            (Number.isFinite(incUpdAt) && incUpdAt > curUpdAt)
          ) {
            const merged =
              idx === -1 ? incoming : { ...next[idx], ...incoming };
            next[idx === -1 ? next.length : idx] = {
              ...merged,
              recentlyUpdated: true,
            };
            changed++;
          }
        }

        set({
          meta: {
            ...state.meta,
            lastUpdateScanAt: new Date().toISOString(),
            hasUpdated: changed > 0,
          },
          __updatedEvents: next,
        });
        return changed;
      },
      updateWithUpdatedEvents: () =>
        set((s) => ({
          events: [...(s.__updatedEvents ?? [])],
          __updatedEvents: [],
          meta: { ...s.meta, hasUpdated: false },
        })),

      // NEW: Clear the “updated” badge/flag (e.g., after user sees the list)
      clearUpdatedFlags: () =>
        set((s) => ({
          events: s.events.map((e) =>
            e.recentlyUpdated ? { ...e, recentlyUpdated: false } : e,
          ),
        })),

      updateSeen: (id) =>
        set((s) => ({
          events: s.events.map((e) =>
            id === e.id ? { ...e, recentlyUpdated: false } : e,
          ),
        })),
      updateEvent: (event) =>
        set((s) => {
          const idx = s.events.findIndex((e) => e.id === event.id);
          const now = new Date().toISOString();

          if (idx === -1) {
            return s;
          }

          const curr = s.events[idx];
          const next = [...s.events];
          next[idx] = {
            ...curr,
            ...event,
            updatedAt: now,
          };
          return { events: next };
        }),
    }),
    {
      name: 'eventmate',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        events: s.events,
        planIds: s.planIds,
        lastKnownLocation: s.lastKnownLocation,
        meta: s.meta,
      }),
      migrate: (persisted: any, fromVersion) => {
        if (fromVersion < 2) {
          return {
            ...persisted,
            meta: { eventsVersion: baseMetaVersion },
          };
        }
        return persisted;
      },
    },
  ),
);
