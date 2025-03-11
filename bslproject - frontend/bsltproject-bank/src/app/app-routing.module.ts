import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { routes } from '@app/app.routes';

/**
 * Módulo de enrutamiento de la aplicación
 * 
 * Este módulo existe para mantener compatibilidad con código existente
 * que aún podría estar referenciando el antiguo sistema de módulos.
 * La configuración de rutas real está en app.routes.ts
 */
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// Re-exportamos el AuthModule para mantener compatibilidad
export const AuthModule = {};
