import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(), 
    providePrimeNG({
      theme: {
        preset: Aura, 
        options: {
          darkModeSelector: 'system', // Автоматический выбор светлой/темной темы по настройкам системы
          cssLayer: false
        }
      }
    })
  ]
};