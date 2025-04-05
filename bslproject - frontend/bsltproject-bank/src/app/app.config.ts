import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { userIdInterceptor } from './core/interceptors/user-id.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    // El orden de los interceptores es importante:
    // 1. userIdInterceptor: Añade el ID de usuario a las solicitudes que lo necesiten
    // 2. authInterceptor: Añade el token de autenticación y maneja errores 401/403
    // 3. errorInterceptor: Maneja otros errores HTTP
    provideHttpClient(withInterceptors([userIdInterceptor, authInterceptor, errorInterceptor])),
    importProvidersFrom(
      MatSidenavModule,
      MatToolbarModule,
      MatCardModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatIconModule,
      MatProgressSpinnerModule,
      MatSnackBarModule
    ),
    provideZoneChangeDetection({ eventCoalescing: true })
  ]
};