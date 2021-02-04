import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManualPOComponent } from './manual-po/manual-po.component';
import { InventoryPartPoComponent } from './manual-po/inventory-part-po.component';
import { NonInventoryPoComponent } from './manual-po/non-inventory-po.component';
import { InventoryPartListPoComponent } from './manual-po/inventory-part-po-list.component';
import { NonInventoryPoListComponent } from './manual-po/non-inventory-po-list.component';

import { NonInventoryGrnComponent } from './non-inventory-grn/non-inventory-grn.component';
import { NonInventoryGrnHomeComponent } from './non-inventory-grn/non-inventory-grn-home.component';
import { NonInventoryGrnListComponent } from './non-inventory-grn/non-inventory-grn-list.component';


import { HomeComponent } from '../home/home.component';

import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';
import { IPermissionGuardModel } from '../core/model/ipermission-guard.model';

const routes: Routes = [
  {path : '' , component : HomeComponent ,    canActivate: [AuthGuard] ,children:
  [
    {
      path : 'manual-po' , component : ManualPOComponent, canActivate: [AuthGuard],
      data : { title : 'Manual PO' }
    },
    {
      path : 'non-inventory-grn' , component : NonInventoryGrnComponent, canActivate: [AuthGuard],
      data : { title : 'Non Inventory GRN' }
    },
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevelopmentRoutingModule { }

export const developmentRoutingComponents = [
  ManualPOComponent,
  InventoryPartPoComponent,
  NonInventoryPoComponent,
  InventoryPartListPoComponent,
  NonInventoryPoListComponent,
  NonInventoryGrnComponent,
  NonInventoryGrnHomeComponent,
  NonInventoryGrnListComponent
];
