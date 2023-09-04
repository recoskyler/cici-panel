/* eslint-disable no-unused-vars */

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import('$lib/server/lucia').Auth;
  type DatabaseUserAttributes = {
    email: string;
    verified: boolean;
    displayName: string;
    firstName: string;
    lastName: string;
    mobile: string;
  };
  // eslint-disable-next-line @typescript-eslint/ban-types
  type DatabaseSessionAttributes = {};
}

declare module '@fortawesome/free-solid-svg-icons/index.es' {
  export * from '@fortawesome/free-solid-svg-icons';
}

export {};
