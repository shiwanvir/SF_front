import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';

import { HotTableModule } from '@handsontable/angular';
import { BsDatepickerModule,ModalModule,TabsModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { QueryBuilderModule } from "angular2-query-builder";

import { MerchandisingMasterRoutingModule } from './merchandising-master-routing.module';

import { CustomerSizeGridComponent } from './customer-size-grid/customer-size-grid.component';
import { ColorOptionsComponent } from './color-options/color-options.component';
import { CutDirectionComponent } from './cut-direction/cut-direction.component';
import { BomStageComponent } from './bom-stage/bom-stage.component';
import { RoundComponent } from './round/round.component';
import { SearchingComponent } from './searching/searching.component';
import { Searching2Component } from './searching2/searching2.component';
import { MaterialSizeComponent } from './material-size/material-size.component';
import { PositionComponent } from './position/position.component';
import { BuyMasterComponent } from './buy-master/buy-master.component';

import { HomeModule } from '../home';
import { CoreModule } from '../core';

@NgModule({
  imports: [
    CommonModule,
    MerchandisingMasterRoutingModule,
    HotTableModule.forRoot(),
    ReactiveFormsModule,
    NgSelectModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    QueryBuilderModule,
    FormsModule,
    HomeModule,
    CoreModule
  ],
  declarations: [
    CustomerSizeGridComponent,
    ColorOptionsComponent,
    CutDirectionComponent,
    BomStageComponent,
    RoundComponent,
    BuyMasterComponent,
    PositionComponent,
    SearchingComponent,
    Searching2Component,
    MaterialSizeComponent,
  ]
})
export class MerchandisingMasterModule { }
