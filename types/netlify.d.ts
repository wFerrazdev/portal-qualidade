declare global {
  interface Window {
    netlifyIdentity: {
      init: () => void;
      open: () => void;
      close: () => void;
      logout: () => void;
      on: (event: string, callback: (user: any) => void) => void;
      currentUser: () => any;
    };
  }
}

export {};
