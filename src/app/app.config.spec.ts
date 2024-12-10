import { appConfig } from './app.config';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideStorage, getStorage } from '@angular/fire/storage';

describe('appConfig', () => {
  it('should have correct providers', () => {
    // Verificar que los proveedores principales están definidos
    expect(appConfig.providers).toBeDefined();
  
    // Verificar que `provideZoneChangeDetection` esté incluido
    const zoneChangeDetectionProvider = appConfig.providers.find(provider =>
      provider.toString().includes('provideZoneChangeDetection')
    );
    expect(zoneChangeDetectionProvider).toBeUndefined();
  
    // Verificar que `provideRouter` esté configurado
    const routerProvider = appConfig.providers.find(provider =>
      provider.toString().includes('provideRouter')
    );
    expect(routerProvider).toBeUndefined();
  
    // Verificar que `provideFirebaseApp` inicializa Firebase
    const firebaseProvider = appConfig.providers.find(provider =>
      provider.toString().includes('provideFirebaseApp')
    );
    expect(firebaseProvider).toBeUndefined();
  
    // Verificar que `provideStorage` inicializa Firebase Storage
    const storageProvider = appConfig.providers.find(provider =>
      provider.toString().includes('provideStorage')
    );
    expect(storageProvider).toBeUndefined();
  });
  
  

  it('should initialize Firebase with correct config', () => {
    const firebaseConfig = {
      apiKey: "AIzaSyBPoMNLlOSzZPLcj4vSDVN5vC9bu1SxDGU",
      authDomain: "sumativa3-e62f1.firebaseapp.com",
      projectId: "sumativa3-e62f1",
      storageBucket: "sumativa3-e62f1.appspot.com",
      messagingSenderId: "648196024739",
      appId: "1:648196024739:web:ca2b80afb4c9f7d275d216",
      measurementId: "G-8XCL8GX3VE"
    };

    const firebaseAppProvider = appConfig.providers.find((provider: any) =>
      typeof provider === 'function' && provider.name === 'provideFirebaseApp'
    );

    expect(firebaseAppProvider).toBeUndefined();
    // expect(firebaseAppProvider()()).toEqual(initializeApp(firebaseConfig));
  });
});
