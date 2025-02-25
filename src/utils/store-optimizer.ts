import { useEffect, useRef } from 'react';
import type { StoreApi, UseBoundStore } from 'zustand';

interface StoreOptimizer<T> {
  subscribe: UseBoundStore<StoreApi<T>>['subscribe'];
  getState: UseBoundStore<StoreApi<T>>['getState'];
}

export function createSelector<T, U>(
  store: StoreOptimizer<T>,
  selector: (state: T) => U
): () => U {
  return () => selector(store.getState());
}

export function useShallowSelector<T, U>(
  store: StoreOptimizer<T>,
  selector: (state: T) => U
): U {
  const ref = useRef<U>();
  const getCurrentValue = () => selector(store.getState());

  useEffect(() => {
    ref.current = getCurrentValue();
    return store.subscribe(() => {
      const newValue = getCurrentValue();
      if (JSON.stringify(ref.current) !== JSON.stringify(newValue)) {
        ref.current = newValue;
      }
    });
  }, []);

  return getCurrentValue();
}

export function useDeepSelector<T, U>(
  store: StoreOptimizer<T>,
  selector: (state: T) => U,
  deps: unknown[] = []
): U {
  const ref = useRef<U>();
  const getCurrentValue = () => selector(store.getState());

  useEffect(() => {
    ref.current = getCurrentValue();
    return store.subscribe(() => {
      const newValue = getCurrentValue();
      if (JSON.stringify(ref.current) !== JSON.stringify(newValue)) {
        ref.current = newValue;
      }
    });
  }, deps);

  return getCurrentValue();
}

export function createPersistentStore<T>(
  store: StoreOptimizer<T>,
  key: string
): void {
  // Load persisted state
  const persistedState = localStorage.getItem(key);
  if (persistedState) {
    try {
      const state = JSON.parse(persistedState);
      const currentState = store.getState() as Record<string, unknown>;
      const typedState = state as Record<string, unknown>;
      Object.assign(currentState, typedState);
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    }
  }

  // Subscribe to changes and persist
  store.subscribe((state) => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  });
}

export function createSlicedStore<T, K extends keyof T>(
  store: StoreOptimizer<T>,
  keys: K[]
): Pick<T, K> {
  const state = store.getState();
  return keys.reduce((acc, key) => {
    acc[key] = state[key];
    return acc;
  }, {} as Pick<T, K>);
}
