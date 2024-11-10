import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'floppy-fish-db',
        appId: '1:760835551745:web:b70f4c9aa1d373799a4600',
        storageBucket: 'floppy-fish-db.firebasestorage.app',
        apiKey: 'AIzaSyCszz3FWqFBB-QFD79ZItzpxN57YRM5d0g',
        authDomain: 'floppy-fish-db.firebaseapp.com',
        messagingSenderId: '760835551745',
        databaseURL:
          'https://floppy-fish-db-default-rtdb.europe-west1.firebasedatabase.app',
      }),
    ),
    provideDatabase(() => getDatabase()),
  ],
};
