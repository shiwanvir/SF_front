import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CancellationComponent } from './cancellation/cancellation.component';
import { CustomerComponent } from './customer/customer.component';
import { DivisionComponent } from './division/division.component';
import { GarmentoptionsComponent } from './garmentoptions/garmentoptions.component';
import { RequestTypeComponent } from './request-type/request-type.component';
import { StoresComponent } from './stores/stores/stores.component';
import { SupplierHomeComponent } from './supplier/supplier-home.component';

import { HomeComponent } from '../home/home.component';
import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';
import { IPermissionGuardModel } from '../core/model/ipermission-guard.model';

const routes: Routes = [
  {path : '' , component : HomeComponent , canActivate: [AuthGuard], children:
    [
      {
        path : 'cancellation-reason' , component : CancellationComponent, canActivate: [AuthGuard, PermissionGuard],
        data: {
          tabName : 'CANCELLATIONREASON', title : 'Cancellation Reason',
          Permission: { Only: ['CANCEL_REASON_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'cancellation-category' , component : CancellationComponent, canActivate: [AuthGuard, PermissionGuard],
        data: {
          tabName : 'CANCELLATIONCATEGORY', title : 'Cancellation Category',
          Permission: { Only: ['CANCEL_CATEGORY_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'customer' , component : CustomerComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Customer',
          Permission: { Only: ['CUSTOMER_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'division' , component: DivisionComponent , canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Division',
          Permission: { Only: ['CUSTOMER_DIVISION_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'garment-options' , component : GarmentoptionsComponent, canActivate: [AuthGuard, PermissionGuard],
        data: {
          title : 'Garment Options',
          Permission: { Only: ['GARMENT_OPTION_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'request-type' , component : RequestTypeComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Request Type',
          Permission: { Only: ['REQUEST_TYPE_VIEW'] } as IPermissionGuardModel
         }
      },
      {
        path : 'store-creation' , component : StoresComponent , canActivate: [AuthGuard, PermissionGuard],
        data: {
          title : 'Store',
          Permission: { Only: ['STORE_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'supplier' , component : SupplierHomeComponent , canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Supplier',
          Permission: { Only: ['SUPPLIER_VIEW'] } as IPermissionGuardModel
         }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Org3RoutingModule { }
