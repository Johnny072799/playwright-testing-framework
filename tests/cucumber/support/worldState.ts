export class WorldState {
  private readonly store = new Map<string, unknown>();

  /**
   * Store a value under the given key.
   */
  set<T>(key: string, value: T): void {
    if (!key) {
      throw new Error("WorldState.set: key must be a non-empty string");
    }
    this.store.set(key, value);
  }

  /**
   * Get a value by key, throwing a helpful error if it is missing.
   */
  get<T>(key: string): T {
    if (!key) {
      throw new Error("WorldState.get: key must be a non-empty string");
    }
    if (!this.store.has(key)) {
      throw new Error(`WorldState: key "${key}" was not found. Did you forget to call state.set("${key}", value)?`);
    }
    return this.store.get(key) as T;
  }

  /**
   * Check if a key exists in the state.
   */
  has(key: string): boolean {
    return this.store.has(key);
  }

  /**
   * Remove a key from the state. Returns true if it existed.
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all stored keys and values.
   */
  clear(): void {
    this.store.clear();
  }
}
