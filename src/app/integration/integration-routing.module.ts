import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '../home/home.component';
import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';
import { IPermissionGuardModel } from '../core/model/ipermission-guard.model';

import { FastReactComponent } from './fast-react/fast-react.component';
import { FastReactOrdersComponent } from './fast-react-orders/fast-react-orders.component';

const routes: Routes = [
  //{path : 'location' , component : LocationComponent,outlet:'login'},
    {path : '' , component : HomeComponent ,children:
      [
        {
          path : 'fr-products' , component : FastReactComponent, canActivate: [AuthGuard],
          data : { title : 'FR PRODUCTS' }
        },
        {
          path : 'fr-orders' , component : FastReactOrdersComponent , canActivate: [AuthGuard],
          data : { title : 'FR ORDERS' }
        }

      ]

}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IntegrationRoutingModule { }
