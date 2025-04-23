import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserPageComponent } from './users/pages/user-page/user-page.component';
import { RolePageComponent } from './roles/pages/role-page/role-page.component';
import { StatePageComponent } from './states/pages/state-page/state-page.component';
import { PermissionPageComponent } from './permissions/pages/permission-page/permission-page.component';

const routes: Routes = [
  { path: 'usuarios', component: UserPageComponent },
  { path: 'roles', component: RolePageComponent },
  { path: 'estados', component: StatePageComponent },
  { path: 'permisos', component: PermissionPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecurityRoutingModule {}
