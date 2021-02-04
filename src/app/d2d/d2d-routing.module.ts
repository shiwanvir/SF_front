import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '../home/home.component';
import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';
import { IPermissionGuardModel } from '../core/model/ipermission-guard.model';

import { LoginD2dIntimatesComponent } from './login-d2d-intimates/login-d2d-intimates.component';


const routes: Routes = [
  //{path : 'location' , component : LocationComponent,outlet:'login'},
    {path : '' , component : HomeComponent ,children:
      [
        {
          path : 'd2d-login-intimates' , component : LoginD2dIntimatesComponent, canActivate: [AuthGuard],
          data : { title : 'LOGIN D2D INTIMATES' }
        }

      ]

}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class D2dRoutingModule { }
