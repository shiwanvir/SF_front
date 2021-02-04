import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StyleCreationComponent } from './style-creation/style-creation.component';
import { StyleBuyerPoHomeComponent } from './style-buyer-po/style-buyer-po-home.component';
//import { TnaComponent } from './tna/tna.component';
//import { MasterEventComponent } from './master-event/master-event.component';
import { ReportFlashComponent } from './cost-sheet/report-flash/report-flash.component';
import { PurchaseRequisitionLinesComponent } from './purchase-requisition-lines/purchase-requisition-lines.component';
import { PurchaseOrderRevisionComponent } from './purchase-order-revision/purchase-order-revision.component';
//import { CombineSo } from './combine-so/combine-so.component';
import { FlashComponent } from './cost-sheet/flash/flash.component';
import { BomHomeComponent } from './bom/bom-home/bom-home.component';
//import { OperationStyleMapComponent } from './operation-style-map/operation-style-map.component';

import { HomeComponent } from '../home/home.component';
import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';
import { IPermissionGuardModel } from '../core/model/ipermission-guard.model';
import { StyleCreationHomeComponent } from './style-creation/style-creation-home/style-creation-home.component';

import { CostSheetHomeComponent } from './cost-sheet/cost-sheet-home/cost-sheet-home.component'
import { ConsumptionUpdateComponent } from './cost-sheet/consumption-update/consumption-update.component'
import { BomConsumptionUpdateComponent } from './bom/bom-consumption-update/bom-consumption-update.component'

import { ShopOrderComponent } from './shop-order/shop-order.component';
import { ProductAverageEfficiencyComponent } from './product-average-efficiency/product-average-efficiency.component';
import { ProductAverageEfficiencyListComponent } from './product-average-efficiency/product-average-efficiency-list.component';
import { ProductAverageEfficiencyHistoryComponent } from './product-average-efficiency/product-average-efficiency-history.component';

const routes: Routes = [
  {path : '' , component : HomeComponent ,children:
    [
      {
        path : 'style-creation' , component : StyleCreationHomeComponent , canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Style Creation',
          Permission: { Only: ['STYLE_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'sales-order' , component : StyleBuyerPoHomeComponent , canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Sales Order',
          Permission: { Only: ['SALES_ORDER_VIEW'] } as IPermissionGuardModel
        }
      },
      //{path : 'tna' , component : TnaComponent },
      //{path : 'tna-master' , component : MasterEventComponent },
      /*{
        path : 'bulk' , component : BulkComponent,
        data : { title : 'Costing'}
      },*/
      {path : 'flashcosting' , component : FlashComponent, canActivate: [AuthGuard, PermissionGuard]},
      //{path : 'operation-style-map' , component : OperationStyleMapComponent },
	    {path : 'report-flash' , component : ReportFlashComponent, canActivate: [AuthGuard, PermissionGuard]},
      {
        path : 'bom' , component : BomHomeComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Bill Of Material',
          Permission: { Only: ['BOM_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'purchase-requisition-lines' , component : PurchaseRequisitionLinesComponent , canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Purchase Order',
          Permission: { Only: ['PO_VIEW'] } as IPermissionGuardModel
        }
      },
      /*{
        path : 'combine-so' , component : CombineSo , canActivate: [AuthGuard],
        data : { title : 'Combine Sales Order' }
      },*/
      {
        path : 'purchase-order-revision' , component : PurchaseOrderRevisionComponent , canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Purchase Order Revision',
          Permission: { Only: ['PO_REVISION_VIEW'] } as IPermissionGuardModel
         }
      },
      {
        path : 'cost-sheet' , component : CostSheetHomeComponent , canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Costing',
          Permission: { Only: ['COSTING_VIEW'] } as IPermissionGuardModel
         }
      },
      {
        path : 'shop-order' , component : ShopOrderComponent , canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Shop Order',
          Permission: { Only: ['SHOP_ORDER_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'product-average-efficiency' , component : ProductAverageEfficiencyComponent , canActivate: [AuthGuard],
        data : { title : 'Product Average Efficiency' }
      },
      {
        path : 'costing-consumption-update' , component : ConsumptionUpdateComponent , canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Costing Consumption Update',
          Permission: { Only: ['COSTING_NET_CONSUMPTION_CHANGE'] } as IPermissionGuardModel
        }
      },
      {
        path : 'bom-consumption-update' , component : BomConsumptionUpdateComponent , canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'BOM Consumption Update',
          Permission: { Only: ['BOM_NET_CONSUMPTION_CHANGE'] } as IPermissionGuardModel
        }
      }
    ]
  },

];
// const routes: Routes = [
//   {path : 'style-creation' , component : StyleCreationComponent },
//   {path : 'tna' , component : TnaComponent },
//   {path : 'tna-master' , component : MasterEventComponent }
// ];

@NgModule({
  //imports: [RouterModule.forRoot(routes)],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchandisingRoutingModule { }

export const MerchandisingRoutingModuleComponents = [
  StyleCreationComponent,
  StyleBuyerPoHomeComponent,
  ProductAverageEfficiencyComponent,
  ProductAverageEfficiencyListComponent,
  ProductAverageEfficiencyHistoryComponent
  /*Searching2Component,
  BomStageComponent,
  RoundComponent*/
];
