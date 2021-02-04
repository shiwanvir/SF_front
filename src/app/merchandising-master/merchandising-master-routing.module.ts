import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerSizeGridComponent } from './customer-size-grid/customer-size-grid.component';
import { ColorOptionsComponent}from'./color-options/color-options.component';
import { CutDirectionComponent}from'./cut-direction/cut-direction.component';
import { BomStageComponent } from './bom-stage/bom-stage.component';
import { RoundComponent } from './round/round.component';
import { MaterialSizeComponent } from './material-size/material-size.component';
import { PositionComponent } from './position/position.component';
import { Searching2Component } from './searching2/searching2.component';
import { BuyMasterComponent } from './buy-master/buy-master.component'

import { HomeComponent } from '../home/home.component';
import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';
import { IPermissionGuardModel } from '../core/model/ipermission-guard.model';

const routes: Routes = [
  {path : '' , component : HomeComponent ,children:
    [
      {
        path : 'bom-stage' , component : BomStageComponent , canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'BOM Stage',
          Permission: { Only: ['BOM_STAGE_VIEW'] } as IPermissionGuardModel
        }
      },
      /*{
        path : 'round' , component : RoundComponent , canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Round',
          Permission: { Only: ['ROUND_MANAGE'] } as IPermissionGuardModel
        }
      },*/
      {
        path : 'customer-size-grid' , component : CustomerSizeGridComponent,
        data : { title : 'Customer Size Grid' }
      },
      {
        path : 'color-options' , component : ColorOptionsComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Color Options',
          Permission: { Only: ['COLOR_OPTION_VIEW'] } as IPermissionGuardModel }
      },
      {
        path :'cut-direction',component:CutDirectionComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Cut Direction',
          Permission: { Only: ['CUT_DIRECTION_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path: 'position',component:PositionComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Fabric Position',
          Permission: { Only: ['FABRIC_POSITION_VIEW'] } as IPermissionGuardModel
         }
      },
      {
        path : 'material-size' , component : MaterialSizeComponent, canActivate: [AuthGuard, PermissionGuard],
        data : { title : 'Material Size',
        Permission: { Only: ['MATERIAL_SIZE_VIEW'] } as IPermissionGuardModel
       }
      },
      {
        path : 'buy-master' , component : BuyMasterComponent , canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Buy Master',
          Permission: { Only: ['BUY_MASTER_VIEW'] } as IPermissionGuardModel
         }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchandisingMasterRoutingModule { }

export const MerchandisingRoutingModuleComponents = [
  Searching2Component,
  BomStageComponent,
  RoundComponent
];
