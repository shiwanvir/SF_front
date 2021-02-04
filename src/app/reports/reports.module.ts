import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core';
import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';
import { HomeModule } from '../home'
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';
import { BsDatepickerModule,ModalModule,TabsModule } from 'ngx-bootstrap';
import { HotTableModule } from '@handsontable/angular';
import { RedirectService } from './redirect.service';

import { ReportsRoutingModule, ReportsRoutingComponent } from './reports-routing.module';
import { PoDetailsComponent } from './po-details/po-details.component';
import { PoHeaderComponent } from './po-header/po-header.component';
import { CostSheetComponent } from './cost-sheet/cost-sheet.component';
import { CostSheetVarianceComponent } from './cost-sheet-variance/cost-sheet-variance.component';
import { SalesReportComponent } from './sales-report/sales-report.component';
import { InventoryAgeingComponent } from './inventory-ageing/inventory-ageing.component';
import { PickListComponent } from './pick-list/pick-list.component';
import { FabricRollBarcodeComponent } from './fabric-roll-barcode/fabric-roll-barcode.component';
import { StyleListComponent } from './style-list/style-list.component';
// Import ngx-barcode module
import { NgxBarcodeModule } from 'ngx-barcode';
import { MSRReportComponent } from './msr-report/msr-report.component';
import { IssueanceReportComponent } from './issueance-report/issueance-report.component';
import { MRNNoteComponent } from './mrn-note/mrn-note.component';
import { DailyReceivingReportComponent } from './daily-receiving-report/daily-receiving-report.component';
import { BomReportComponent } from './bom-report/bom-report.component';
import { InventoryPartInStockComponent } from './inventory-part-in-stock/inventory-part-in-stock.component';
import { SupplierPODetailsComponent } from './supplier-po-details/supplier-po-details.component';
import { StyleStatusReportComponent } from './style-status-report/style-status-report.component';
import { SalesFreezeReportComponent } from './sales-freeze-report/sales-freeze-report.component';
import { SalesActualReportComponent } from './sales-actual-report/sales-actual-report.component';
import { SalesRMCReportComponent } from './sales-rmc-report/sales-rmc-report.component';
import { PreOrderVsPostOrderAnalysisReportComponent } from './pre-order-vs-post-order-analysis-report/pre-order-vs-post-order-analysis-report.component';

import { InventoryScarpComponent } from './inventory-scarp/inventory-scarp.component';
import { InventoryScarpSummeryComponent } from './inventory-scarp/inventory-scarp-summery.component';
import { InventoryScarpHomeComponent } from './inventory-scarp/inventory-scarp-home.component';

import { GRNStatusReportComponent } from './grn-status-report/grn-status-report.component';
import { CustomerPOStatusReportComponent } from './customer-po-status-report/customer-po-status-report.component';
import { ManualPOListInventoryComponent } from './manual-po-list-inventory/manual-po-list-inventory.component';
import { IssuingStatusReportComponent } from './issuing-status-report/issuing-status-report.component';
import { ManualPOListNonInventoryComponent } from './manual-po-list-non-inventory/manual-po-list-non-inventory.component';
import { StandardVsPurchasePriceReportComponent } from './standard-vs-purchase-price-report/standard-vs-purchase-price-report.component';
import { YarnCountDetailReportComponent } from './yarn-count-detail-report/yarn-count-detail-report.component';

import { ApprovalsComponent } from './approvals/approvals.component';

@NgModule({
  imports: [
    CommonModule,
    HomeModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    NgMultiSelectDropDownModule,
    CoreModule,
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ReportsRoutingModule,
    NgxBarcodeModule,
    HotTableModule.forRoot(),
  ],
  declarations: [
    ReportsRoutingComponent,
    PoDetailsComponent,
    PoHeaderComponent,
    CostSheetComponent,
    CostSheetVarianceComponent,
    SalesReportComponent,
    InventoryAgeingComponent,
    PickListComponent,
    FabricRollBarcodeComponent,
    StyleListComponent,
    InventoryScarpComponent,
    InventoryScarpSummeryComponent,
    InventoryScarpHomeComponent,
    MSRReportComponent,
    IssueanceReportComponent,
    MRNNoteComponent,
    DailyReceivingReportComponent,
    BomReportComponent,
    InventoryPartInStockComponent,
    SupplierPODetailsComponent,
    StyleStatusReportComponent,
    SalesFreezeReportComponent,
    SalesActualReportComponent,
    SalesRMCReportComponent,
    PreOrderVsPostOrderAnalysisReportComponent,
    GRNStatusReportComponent,
	CustomerPOStatusReportComponent,
	ManualPOListInventoryComponent,
  IssuingStatusReportComponent,
  ManualPOListNonInventoryComponent,
  StandardVsPurchasePriceReportComponent,
  YarnCountDetailReportComponent,
  ApprovalsComponent
  ],
  providers: [RedirectService],
})
export class ReportsModule { }
