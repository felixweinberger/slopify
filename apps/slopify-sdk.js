/**
 * Slopify SDK - Client-side data persistence for Slopify apps
 *
 * Usage:
 *   const sdk = new SlopifySDK('my-app');
 *   await sdk.init();
 *
 *   // Check if user is logged in
 *   if (sdk.user) {
 *     const count = await sdk.get('count') ?? 0;
 *     await sdk.set('count', count + 1);
 *   }
 */
class SlopifySDK {
  constructor(appId) {
    this.appId = appId;
    this.user = null;
    this._ready = false;
  }

  /**
   * Initialize the SDK - fetches user info
   * @returns {Promise<SlopifySDK>}
   */
  async init() {
    try {
      const response = await fetch('/api/me');
      const data = await response.json();
      this.user = data.user;
    } catch (err) {
      console.warn('Slopify SDK: Failed to fetch user', err);
      this.user = null;
    }
    this._ready = true;
    return this;
  }

  /**
   * Get a value from the backend
   * @param {string} key
   * @returns {Promise<any>} The value, or null if not found/not logged in
   */
  async get(key) {
    if (!this.user) return null;

    try {
      const response = await fetch(`/api/data/${this.appId}/${key}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.value;
    } catch (err) {
      console.warn('Slopify SDK: Failed to get', key, err);
      return null;
    }
  }

  /**
   * Get all data for this app
   * @returns {Promise<Record<string, any>>} Object with all key-value pairs
   */
  async getAll() {
    if (!this.user) return {};

    try {
      const response = await fetch(`/api/data/${this.appId}`);
      if (!response.ok) return {};
      const data = await response.json();
      return data.data ?? {};
    } catch (err) {
      console.warn('Slopify SDK: Failed to getAll', err);
      return {};
    }
  }

  /**
   * Save a value to the backend
   * @param {string} key
   * @param {any} value - Any JSON-serializable value
   * @returns {Promise<boolean>} True if saved successfully
   */
  async set(key, value) {
    if (!this.user) return false;

    try {
      const response = await fetch(`/api/data/${this.appId}/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      return response.ok;
    } catch (err) {
      console.warn('Slopify SDK: Failed to set', key, err);
      return false;
    }
  }

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  get isLoggedIn() {
    return this.user !== null;
  }
}

// Export for use in apps
if (typeof window !== 'undefined') {
  window.SlopifySDK = SlopifySDK;
}
