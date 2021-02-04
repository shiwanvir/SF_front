import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeModule } from '../home';
import { CoreModule } from '../core';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';

import { HotTableModule } from '@handsontable/angular';
import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule,ModalModule,TabsModule } from 'ngx-bootstrap';

import { DevelopmentRoutingModule,developmentRoutingComponents } from './development-routing.module';

import { ManualPOComponent } from './manual-po/manual-po.component';
import { InventoryPartPoComponent } from './manual-po/inventory-part-po.component';
import { NonInventoryPoComponent } from './manual-po/non-inventory-po.component';
import { InventoryPartListPoComponent } from './manual-po/inventory-part-po-list.component';
import { NonInventoryPoListComponent } from './manual-po/non-inventory-po-list.component';

import { NonInventoryGrnComponent } from './non-inventory-grn/non-inventory-grn.component';
import { NonInventoryGrnHomeComponent } from './non-inventory-grn/non-inventory-grn-home.component';
import { NonInventoryGrnListComponent } from './non-inventory-grn/non-inventory-grn-list.component';

@NgModule({
  imports: [
    CommonModule,
    HotTableModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    DevelopmentRoutingModule,
    NgSelectModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    HomeModule,
    CoreModule,
    TabsModule.forRoot(),
    SnotifyModule
  ],
  declarations: [
    ManualPOComponent,
    InventoryPartPoComponent,
    NonInventoryPoComponent,
    InventoryPartListPoComponent,
    NonInventoryPoListComponent,
    NonInventoryGrnComponent,
    NonInventoryGrnListComponent,
    NonInventoryGrnHomeComponent
  ]
})
export class DevelopmentModule { }
