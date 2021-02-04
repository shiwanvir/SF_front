import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { ModalModule } from 'ngx-bootstrap';
import { BsDatepickerModule,ModalModule,TabsModule } from 'ngx-bootstrap';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';

import { StoresRoutingModule,storesRoutingComponets } from './stores-routing.module';
import { GeneralprComponent } from './generalpr/generalpr.component';
import { HomeModule } from '../home';
import { CoreModule } from '../core';

import { NgSelectModule } from '@ng-select/ng-select';
import { MrnComponent } from './mrn/mrn.component';
import { StorebinComponent } from './storebin/storebin.component';
import { SubstoreComponent } from './substore/substore.component';
import { HotTableModule } from '@handsontable/angular';

import { RollPlanComponent } from './roll-plan/roll-plan.component';
import { FabricinspectionComponent } from './fabricinspection/fabricinspection.component';


import { BinConfigComponent } from './bin-config/bin-config.component';
import { GenmrnComponent } from './generalpr/genmrn.component';
import { GenmrnListComponent } from './generalpr/genmrn-list.component';
import { LengthAuditComponent } from './length-audit/length-audit.component';
import { InspectionSummeryLogComponent } from './inspection-summery-log/inspection-summery-log.component';
import { TransferOrderComponent } from './transfer-order/transfer-order.component';
import { BinTransferModalComponent } from './bin-transfer/bin-transfer-modal/bin-transfer-modal.component';
import { BinTransferComponent } from './bin-transfer/bin-transfer.component';
import { GrnModalComponent } from './grn/grn-modal/grn-modal.component';
import { GrnComponent } from './grn/grn.component';

//import { MaterialTransferInComponent } from './material-transfer-in/material-transfer-in.component';
import { TransferLocationComponent } from './transfer-location/transfer-location.component';

import { MrnTestComponent } from './mrn-test/mrn-test.component';
import { MeterialTransferInListComponent } from './material-transfer-in/meterial-transfer-in-list/meterial-transfer-in-list.component';
import { MaterialTransferInComponent } from './material-transfer-in/material-transfer-in.component';
import { MeterialTransferInHomeComponent } from './material-transfer-in/meterial-transfer-in-home.component';
import { IssueComponent } from './issue/issue.component';
import { GrnListComponent } from './grn/grn-list/grn-list.component';
import{GrnBinComponent} from './grn/grn-bin/grn-bin.component';
import { MrnDetailsComponent } from './mrn/mrn-details/mrn-details.component';
import { MrnHomeComponent } from './mrn/mrn-home/mrn-home.component';
import { RollPlanDetailsComponent } from './roll-plan/roll-plan-details/roll-plan-details.component';
import { RollPlanHomeComponent } from './roll-plan/roll-plan-home/roll-plan-home.component';
import { FabricinspectionDetailsComponent } from './fabricinspection/fabricinspection-details/fabricinspection-details.component';
import { FabricinspectionHomeComponent } from './fabricinspection/fabricinspection-home/fabricinspection-home.component';
import { IssueHomeComponent } from './issue/issue-home/issue-home.component';
import { IssueDetilsComponent } from './issue/issue-detils/issue-detils.component';
import { RedirectService } from '../reports/redirect.service';

import { ReturnToStoresComponent } from './return-to-stores/return-to-stores.component';
import { ReturnToStoresHomeComponent } from './return-to-stores/return-to-stores-home.component';
import { ReturnToStoresListComponent } from './return-to-stores/return-to-stores-list.component';

import { ReturnToSupplierComponent } from './return-to-supplier/return-to-supplier.component';
import { ReturnToSupplierHomeComponent } from './return-to-supplier/return-to-supplier-home.component';
import { ReturnToSupplierListComponent } from './return-to-supplier/return-to-supplier-list.component';
import { TransferLocationHomeComponent } from './transfer-location/transfer-location-home/transfer-location-home.component';
import { TransferLocationDetailsComponent } from './transfer-location/transfer-location-details/transfer-location-details.component';
import { BinTransferHomeComponent } from './bin-transfer/bin-transfer-home.component';
import { BinTransferListComponent } from './bin-transfer/bin-transfer-list.component';

//import { GrnBinComponent } from './grn/grn-bin/grn-bin.component';

@NgModule({
  imports: [
    CommonModule,
    StoresRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HomeModule,
	ModalModule ,
	BsDatepickerModule,
	BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
	TabsModule.forRoot(),
	  CoreModule,
	  FormsModule,
    NgSelectModule,
      HotTableModule.forRoot()
  ],

  declarations: [
    MrnComponent,
    StorebinComponent,
    SubstoreComponent,
    storesRoutingComponets,
    BinConfigComponent,
    GenmrnComponent,
    GeneralprComponent,
    GenmrnListComponent,
    RollPlanComponent,
    TransferLocationComponent,
    BinTransferComponent,
    BinTransferModalComponent,
    GrnComponent,
    GrnModalComponent,
    MrnTestComponent,
    LengthAuditComponent,
    InspectionSummeryLogComponent,
    TransferOrderComponent,
    MaterialTransferInComponent,
    MeterialTransferInListComponent,
    MeterialTransferInHomeComponent,
    IssueComponent,
    ReturnToStoresComponent,
    ReturnToSupplierComponent,
    GrnListComponent,
    GrnBinComponent,
    MrnDetailsComponent,
    MrnHomeComponent,
    RollPlanDetailsComponent,
    RollPlanHomeComponent,
    FabricinspectionDetailsComponent,
    FabricinspectionHomeComponent,
    FabricinspectionComponent,
    IssueHomeComponent,
    IssueDetilsComponent,
    ReturnToStoresHomeComponent,
    ReturnToStoresListComponent,
    ReturnToSupplierHomeComponent,
    ReturnToSupplierListComponent,
    TransferLocationHomeComponent,
    TransferLocationDetailsComponent,
    BinTransferHomeComponent,
    BinTransferListComponent
     //MaterialTransferInComponent
    ],

  exports : [StorebinComponent],

  providers: [RedirectService]

})
export class StoresModule { }
