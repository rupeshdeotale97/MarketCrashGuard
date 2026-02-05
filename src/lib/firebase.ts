
// Firebase initialization is disabled to resolve API key errors in the prototype.
// Authentication and Database are mocked using local storage for this version.

export const auth: any = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('crashguard_admin_user');
      callback(user ? JSON.parse(user) : null);
    }
    return () => {};
  },
  signOut: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crashguard_admin_user');
    }
  }
};

export const db: any = {};
