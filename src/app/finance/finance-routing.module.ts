import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountingRulesComponent } from '../finance/accounting-rules/accounting-rules.component';
import { PaymentMethodComponent } from '../finance/payment-method/payment-method.component';
import { PaymentTermComponent } from '../finance/payment-term/payment-term.component';
import { CostCenterComponent } from '../finance/cost-center/cost-center.component';
import { ItemFabricComponent } from '../finance/item-fabric/item-fabric.component';
import { GoodsTypeComponent } from '../finance/goods-type/goods-type.component';
import { ShipmentTermComponent } from './shipment-term/shipment-term.component';
import { TarnsactionComponent } from './tarnsaction/tarnsaction.component';
import { ExchangeRateComponent } from './exchange-rate/exchange-rate.component';
import { CostComponent } from './cost/cost.component';


import { HomeComponent } from '../home/home.component';

import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';
import { IPermissionGuardModel } from '../core/model/ipermission-guard.model';

const routes: Routes = [
  {path : '' , component : HomeComponent ,    canActivate: [AuthGuard] ,children:
    [
      /*{path : 'accounting-rules' , component : AccountingRulesComponent },*/
      {
        path : 'payment-method' , component : AccountingRulesComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          tabName : 'PAYMENTMETHOD', title : 'Payment Method',
          Permission: { Only: ['PAYMENT_METHOD_VIEW'] } as IPermissionGuardModel
         }
      },
      {
        path : 'payment-term' , component : AccountingRulesComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          tabName : 'PAYMENTTERM', title : 'Payment Term',
          Permission: { Only: ['PAYMENT_TERM_VIEW'] } as IPermissionGuardModel
         }
      },
      {
        path : 'cost-center' , component : AccountingRulesComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          tabName : 'COSTCENTER', title : 'Cost Center',
          Permission: { Only: ['COST_CENTER_VIEW'] } as IPermissionGuardModel
         }
      },
      {
        path : 'item/fabric' , component : ItemFabricComponent,
        data : { title : 'Fabric Creation' }
      },
      {
        path : 'goods-type' , component : GoodsTypeComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Goods Types',
          Permission: { Only: ['GOODS_TYPE_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'shipment-term' , component : ShipmentTermComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Shipment Term',
          Permission: { Only: ['PAYMENT_TERM_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'transaction' , component : TarnsactionComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Transaction',
          Permission: { Only: ['TRANSACTION_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'exchange-rate' , component : ExchangeRateComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Exchange Rate',
          Permission: { Only: ['EXCHANGE_RATE_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'finance-cost' , component : CostComponent,
        data : {
          title : 'Finance Cost',
          Permission: { Only: ['FINANCE_COST_VIEW'] } as IPermissionGuardModel
        }
      }

    ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceRoutingModule { }

export const financeRoutingComponents = [
  AccountingRulesComponent ,
  PaymentMethodComponent ,
  PaymentTermComponent ,
  CostCenterComponent,
  ItemFabricComponent,
  GoodsTypeComponent,
  ShipmentTermComponent,
  TarnsactionComponent,
  ExchangeRateComponent
];
