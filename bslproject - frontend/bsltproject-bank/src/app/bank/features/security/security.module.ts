import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserPageComponent } from './users/pages/user-page/user-page.component';
import { RolePageComponent } from './roles/pages/role-page/role-page.component';
import { StatePageComponent } from './states/pages/state-page/state-page.component';
import { PermissionPageComponent } from './permissions/pages/permission-page/permission-page.component';
import { SecurityRoutingModule } from './security-routing.module';

@NgModule({
  declarations: [
    UserPageComponent,
    RolePageComponent,
    StatePageComponent,
    PermissionPageComponent,
  ],
  imports: [CommonModule, SecurityRoutingModule],
})
export class SecurityModule {}
