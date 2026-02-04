// Placeholder pour la logique d'auth
// À connecter avec Firebase plus tard

export const authUtils = {
  getAccessToken: async (): Promise<string | null> => {
    // TODO: Connecter à Firebase Auth
    // const auth = getAuth();
    // if (auth.currentUser) return auth.currentUser.getIdToken();
    return null;
  },
  
  logout: async () => {
    // TODO: Implémenter le logout
    console.log("Logout triggered");
  }
};
