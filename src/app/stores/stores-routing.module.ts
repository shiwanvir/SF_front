import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { StorebinComponent } from './storebin/storebin.component';
import { SubstoreComponent } from './substore/substore.component';
import { BinConfigComponent } from './bin-config/bin-config.component';
import { HomeComponent } from '../home/home.component';
import { MrnComponent } from './mrn/mrn.component';
import { RollPlanComponent } from './roll-plan/roll-plan.component';
import {RollPlanDetailsComponent} from './roll-plan/roll-plan-details/roll-plan-details.component';
import { FabricinspectionComponent } from './fabricinspection/fabricinspection.component';
import { FabricinspectionDetailsComponent } from './fabricinspection/fabricinspection-details/fabricinspection-details.component';
import { FabricinspectionHomeComponent } from './fabricinspection/fabricinspection-home/fabricinspection-home.component';
import { ReturnToSupplierComponent } from './return-to-supplier/return-to-supplier.component';
/* import { GeneralprComponent } from './generalpr/generalpr.component'; */
import { GenmrnComponent } from './generalpr/genmrn.component';

import { BinTransferComponent } from './bin-transfer/bin-transfer.component';
import { GrnComponent } from './grn/grn.component';
 import { MaterialTransferInComponent } from './material-transfer-in/material-transfer-in.component';
 import { MeterialTransferInHomeComponent } from './material-transfer-in/meterial-transfer-in-home.component';
 import { MeterialTransferInListComponent} from './material-transfer-in/meterial-transfer-in-list/meterial-transfer-in-list.component';
 import { IssueComponent } from './issue/issue.component';

import { TransferOrderComponent } from './transfer-order/transfer-order.component';
import { TransferLocationComponent } from './transfer-location/transfer-location.component';
import { BinTransferModalComponent } from './bin-transfer/bin-transfer-modal/bin-transfer-modal.component';
import { ReturnToStoresComponent } from './return-to-stores/return-to-stores.component';

import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';
import { IPermissionGuardModel } from '../core/model/ipermission-guard.model';
import { MrnHomeComponent } from './mrn/mrn-home/mrn-home.component';
import{IssueHomeComponent}from'./issue/issue-home/issue-home.component';
import { ReturnToStoresHomeComponent } from './return-to-stores/return-to-stores-home.component';
import { ReturnToSupplierHomeComponent } from './return-to-supplier/return-to-supplier-home.component';
import { TransferLocationHomeComponent } from './transfer-location/transfer-location-home/transfer-location-home.component';
import { BinTransferHomeComponent } from './bin-transfer/bin-transfer-home.component';
import { BinTransferListComponent } from './bin-transfer/bin-transfer-list.component';

const routes: Routes = [
  {path : '' , component : HomeComponent ,children:
    [
      {
        path : 'sub-store-creation' , component : SubstoreComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Sub Store',
          Permission: { Only: ['SUB_STORE_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'storebin' , component : StorebinComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Store Bin',
          Permission: { Only: ['BIN_VIEW'] } as IPermissionGuardModel
        }
      },
    //  {path : 'mrn' , component : MrnComponent, canActivate: [AuthGuard] },
      {
        path : 'roll-plan-update' , component : RollPlanDetailsComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Roll Plan',
          Permission: { Only: ['ROLL_PLAN_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'fabricin-spection' , component : FabricinspectionHomeComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Fabric Inspection',
          Permission: { Only: ['FABRIC_INSPECTION_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'bin-config' , component : BinConfigComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Bin Configuration',
          Permission: { Only: ['FABRIC_INSPECTION_VIEW'] } as IPermissionGuardModel
        }
      },
      /*{
        path : 'generalpr' , component : GenmrnComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Store Bin',
          Permission: { Only: ['BIN_VIEW'] } as IPermissionGuardModel
        }
      },*/
      {
        path :'transfer-location',component:TransferLocationHomeComponent, canActivate: [AuthGuard, /*PermissionGuard*/],
        data : {
          title : 'Location Transafer',
          //Permission: { Only: ['LOC_TRANSFER_VIEW'] } as IPermissionGuardModel
        }
      },
	    {
        path : 'bin-transfer' , component : BinTransferHomeComponent, canActivate: [AuthGuard, /*PermissionGuard*/],
        data : {
          title : 'Bin Transfer',
          //Permission: { Only: ['BIN_TRANSFER_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'grn' , component : GrnComponent, canActivate: [AuthGuard],
        data : {
          title : 'GRN',
          //Permission: { Only: ['GRN_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'transfer-order' , component : TransferOrderComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Order Transfer',
          Permission: { Only: ['ORDER_TRANSFER_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path:'material-transfer-in',component:MeterialTransferInHomeComponent, canActivate: [AuthGuard,/* PermissionGuard*/],
        data : {
          title : 'Material Transfer',
        //  Permission: { Only: ['METERIAL_TRANSFER_IN_VIEW'] } as IPermissionGuardModel
        }
      },
      {path : 'generalpr' , component : GenmrnComponent},
      {path :'transfer-location',component:TransferLocationHomeComponent},
	    {path : 'bin-transfer' , component : BinTransferHomeComponent, canActivate: [AuthGuard] },
      {path : 'grn' , component : GrnComponent, canActivate: [AuthGuard] },
      {path : 'transfer-order' , component : TransferOrderComponent},
      {path:'material-transfer-in',component:MeterialTransferInHomeComponent, canActivate: [AuthGuard] },
      {path : 'issue' , component : IssueHomeComponent},
      {path : 'return-to-stores' , component : ReturnToStoresHomeComponent},
      {path : 'return-to-supplier' , component : ReturnToSupplierHomeComponent},
      {
        path : 'material-issue' , component : IssueHomeComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Issue',
          Permission: { Only: ['ISSUE_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'return-to-stores' , component : ReturnToStoresHomeComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Return To Stores',
          Permission: { Only: ['RETURN_TO_STORES_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'return-to-supplier' , component : ReturnToSupplierHomeComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Return To Supplier',
          Permission: { Only: ['RETURN_TO_SUPPLIER_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path:'mrn',component:MrnHomeComponent,canActivate:[AuthGuard, /*PermissionGuard*/],
        data : {
          title : 'MRN',
          //Permission: { Only: ['STYLE_MRN_VIEW'] } as IPermissionGuardModel
        }
      }

    ]},



/*  {path : 'home' , component : HomeComponent ,children:
      [
        {path : 'mrn' , component : MrnComponent, canActivate: [AuthGuard] },
        /* {path : 'generalpr' , component : GeneralprComponent, canActivate: [AuthGuard]}


    ]

}
*/
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})


export class StoresRoutingModule { }

export const storesRoutingComponets=[
  FabricinspectionHomeComponent,
  FabricinspectionDetailsComponent
]
