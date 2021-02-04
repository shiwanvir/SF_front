import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '../home/home.component';
import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';
import { IPermissionGuardModel } from '../core/model/ipermission-guard.model';

import  {FabricInspectionComponent}from'./fabric-inspection/fabric-inspection.component';
import { FabricInspectionHomeComponent } from './fabric-inspection/fabric-inspection-home/fabric-inspection-home.component';
import { FabricInspectionDetailsComponent } from './fabric-inspection/fabric-inspection-details/fabric-inspection-details.component';
import { TrimInspectionComponent } from './trim-inspection/trim-inspection.component';
import { TrimInspectionHomeComponent } from './trim-inspection/trim-inspection-home/trim-inspection-home.component';

const routes: Routes = [
  {path : '' , component : HomeComponent ,children:
    [
      {
        path : 'fabric-inspection' , component : FabricInspectionHomeComponent, canActivate: [AuthGuard],
        data : {
          title : 'Fabric Inspection',
          Permission: { Only: ['FABRIC_INSPECTION_VIEW'] } as IPermissionGuardModel
         }
      },
      {
        path : 'trim-inspection' , component : TrimInspectionHomeComponent, canActivate: [AuthGuard],
        data : {
          title : 'Trim Inspection',
          Permission: { Only: ['TRIM_INSPECTION_VIEW'] } as IPermissionGuardModel
         }
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InspectionRoutingModule {

 }

export const InspectionRoutingModules =[
  FabricInspectionComponent,


]
