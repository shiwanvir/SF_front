import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';
//import { HttpClientModule } from '@angular/common/http';

import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule,ModalModule,TabsModule } from 'ngx-bootstrap';


import { FinanceRoutingModule,financeRoutingComponents } from './finance-routing.module';
import { TarnsactionComponent } from './tarnsaction/tarnsaction.component';
import { AccountingRulesComponent } from './accounting-rules/accounting-rules.component';
import { PaymentTermComponent } from './payment-term/payment-term.component';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { CostCenterComponent } from './cost-center/cost-center.component';
import { ItemFabricComponent } from './item-fabric/item-fabric.component';
import { HomeModule } from '../home/home.module';
import { CoreModule } from '../core';
import { SharedModule } from '../shared';
import { GoodsTypeComponent } from './goods-type/goods-type.component';
import { ShipmentTermComponent } from './shipment-term/shipment-term.component';
import { ExchangeRateComponent } from './exchange-rate/exchange-rate.component';
import { CostComponent } from './cost/cost.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    //HttpClientModule,
    FinanceRoutingModule,
    NgSelectModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    HomeModule,
    CoreModule,
    SharedModule,
    TabsModule.forRoot(),
  ],
  declarations: [
    financeRoutingComponents,
    TarnsactionComponent,
    PaymentMethodComponent,
    PaymentTermComponent,
    CostCenterComponent,
    CostComponent
  ],
  providers : [],
  exports : [
    AccountingRulesComponent,
    PaymentTermComponent,
    PaymentMethodComponent,
    CostCenterComponent,
    ItemFabricComponent,
    GoodsTypeComponent,
    ShipmentTermComponent,
    ExchangeRateComponent
  ],


})
export class FinanceModule { }
