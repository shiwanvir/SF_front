import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SmvupdateHomeComponent } from '../ie/smvupdate/smvupdate-home.component';
import { SmvupdateCostingComponent } from './smvupdate-costing/smvupdate-costing.component';
import { ServiceTypesComponent } from './service-types/service-types.component';
import { GarmentOperationMasterComponent } from './garment-operation-master/garment-operation-master.component';
import {ComponentSmvComponent}from'./component-smv/component-smv.component';
import {ComponentSmvDetailsComponent}from'./component-smv/component-smv-details/component-smv-details.component';

import { HomeComponent } from '../home/home.component';
import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';
import { IPermissionGuardModel } from '../core/model/ipermission-guard.model';
import { ComponentSmvHomeComponent } from './component-smv/component-smv-home/component-smv-home.component';
import { GarmentOperationComponentComponent } from './garment-operation-component/garment-operation-component.component';
import { OperationSubComponentComponent } from './operation-sub-component/operation-sub-component.component';
import { MachineTypeComponent } from './machine-type/machine-type.component';
import { SmvToolBoxHomeComponent } from './smv-tool-box/smv-tool-box-home/smv-tool-box-home.component';
import { SilhouetteOperationMappingComponent } from './silhouette-operation-mapping/silhouette-operation-mapping.component';


const routes: Routes = [
  //{path : 'location' , component : LocationComponent,outlet:'login'},
    {path : '' , component : HomeComponent ,children:
      [
        {
          path : 'smvupdate' , component : SmvupdateHomeComponent, canActivate: [AuthGuard, PermissionGuard],
          data : {
            title : 'SMV Update',
            Permission: { Only: ['SMV_UPDATE_VIEW'] } as IPermissionGuardModel
           }
        },
        /*{
          path : 'smvupdate-costing' , component : SmvupdateCostingComponent, canActivate: [AuthGuard, PermissionGuard],
          data : {
            title : 'SMV Update For Costing',
            Permission: { Only: ['SERVICE_TYPE_MANAGE'] } as IPermissionGuardModel
           }
        },*/
        {
          path : 'service-types' , component : ServiceTypesComponent, canActivate: [AuthGuard, PermissionGuard],
          data : {
            title : 'Service Type',
            Permission: { Only: ['SERVICE_TYPE_VIEW'] } as IPermissionGuardModel
          }
        },
        {
          path:'garment-operation-master',component:GarmentOperationMasterComponent,canActivate:[AuthGuard],
          data : {
            title : 'Garment Operation',
            Permission: { Only: ['GARMENT_OPERATION_VIEW'] } as IPermissionGuardModel
          }
        },
        {
          path:'component-smv',component:ComponentSmvHomeComponent,canActivate:[AuthGuard],
          data : {
            title : 'Component SMV',
            Permission: { Only: ['SMV_COMPONENT_VIEW'] } as IPermissionGuardModel
          }
        },
        {
          path:'garment-operation-component',component:GarmentOperationComponentComponent,canActivate:[AuthGuard],
          data : {
            title : 'Operation Component',
            Permission: { Only: ['OPERATION_COMPONENT_VIEW'] } as IPermissionGuardModel
          }
        },
        {
          path:'operation-sub-component',component:OperationSubComponentComponent,canActivate:[AuthGuard],
          data : {
            title : 'Operation Sub Component',
            Permission: { Only: ['OPERATION_SUB_COMPONENT_VIEW'] } as IPermissionGuardModel
          }
        },
        {
          path:'machine-type',component:MachineTypeComponent,canActivate:[AuthGuard],
          data : {
            title : 'Machine Type',
            Permission: { Only: ['MACHINE_TYPE_VIEW'] } as IPermissionGuardModel
          }
        },
        {
          path:'smv-tool-box',component:SmvToolBoxHomeComponent,canActivate:[AuthGuard],
          data : {
            title : 'Smv Tool Box',
            Permission: { Only: ['SMV_TOOL_BOX_VIEW'] } as IPermissionGuardModel
          }
        },
        {
          path:'silhouette-operation-mapping',component:SilhouetteOperationMappingComponent,canActivate:[AuthGuard],
          data : {
            title : 'Silhouette Operation Mapping',
            Permission: { Only: ['SIL_OPE_MAPPING_VIEW'] } as IPermissionGuardModel
          }
        }

      ]

}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IeRoutingModule { }

export const ieRoutingComponents =[

    SmvupdateHomeComponent,
    SmvupdateCostingComponent,
    ServiceTypesComponent,
    GarmentOperationMasterComponent,
    ComponentSmvComponent,
    ComponentSmvHomeComponent,
    ComponentSmvDetailsComponent

]
