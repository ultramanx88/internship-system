// Development helpers

export const DevHelpers = {
  /**
   * Clear all localStorage data (development only)
   */
  clearStorage: () => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      localStorage.clear();
      console.log('🧹 localStorage cleared');
      window.location.reload();
    }
  },

  /**
   * Show current localStorage data
   */
  showStorage: () => {
    if (typeof window !== 'undefined') {
      console.log('📦 localStorage data:', {
        user: localStorage.getItem('internship-flow-user'),
        version: localStorage.getItem('internship-flow-version'),
        profileImages: Object.keys(localStorage)
          .filter(key => key.startsWith('profile-image-'))
          .reduce((acc, key) => ({ ...acc, [key]: localStorage.getItem(key) }), {})
      });
    }
  },

  /**
   * Reset to fresh state
   */
  resetApp: () => {
    if (process.env.NODE_ENV === 'development') {
      DevHelpers.clearStorage();
    }
  }
};

// Make available in browser console for development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).DevHelpers = DevHelpers;
}