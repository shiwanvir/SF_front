import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';
import { IPermissionGuardModel } from '../core/model/ipermission-guard.model';
import { HomeComponent } from '../home/home.component';

import { PoDetailsComponent } from './po-details/po-details.component';
import { PoHeaderComponent } from './po-header/po-header.component';
import { CostSheetComponent } from './cost-sheet/cost-sheet.component';
import { CostSheetVarianceComponent } from './cost-sheet-variance/cost-sheet-variance.component';
import { SalesReportComponent } from './sales-report/sales-report.component';
import { InventoryAgeingComponent } from './inventory-ageing/inventory-ageing.component';
import { PickListComponent } from './pick-list/pick-list.component';
import { FabricRollBarcodeComponent } from './fabric-roll-barcode/fabric-roll-barcode.component';
import { StyleListComponent } from './style-list/style-list.component';
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
import { InventoryScarpHomeComponent } from './inventory-scarp/inventory-scarp-home.component';
import { GRNStatusReportComponent } from './grn-status-report/grn-status-report.component';
import { CustomerPOStatusReportComponent } from './customer-po-status-report/customer-po-status-report.component';
import { ManualPOListInventoryComponent } from './manual-po-list-inventory/manual-po-list-inventory.component';
import { IssuingStatusReportComponent } from './issuing-status-report/issuing-status-report.component';
import { ManualPOListNonInventoryComponent } from './manual-po-list-non-inventory/manual-po-list-non-inventory.component';
import { StandardVsPurchasePriceReportComponent } from './standard-vs-purchase-price-report/standard-vs-purchase-price-report.component';
import { YarnCountDetailReportComponent } from './yarn-count-detail-report/yarn-count-detail-report.component';
import { ApprovalsComponent } from './approvals/approvals.component';

const routes: Routes = [
  {path : '' , component : HomeComponent ,children:
  [
    {
      path : 'po-details' , component : PoDetailsComponent,
    },
    {
      path : 'po-summary' , component : PoHeaderComponent,
    },
    {
      path : 'cost-sheet' , component : CostSheetComponent,
    },
    {
      path : 'cost-sheet-variance' , component : CostSheetVarianceComponent,
    },
    {
      path : 'sales-report' , component : SalesReportComponent,
    },
    {
      path : 'inventory-ageing' , component : InventoryAgeingComponent,
    },
    {
      path: 'pick-list' , component : PickListComponent,
    },
    {
      path : 'fabric-roll-barcode' , component : FabricRollBarcodeComponent,
    },
    {
      path : 'style-list' , component : StyleListComponent,
    },
    {
      path : 'inventory-scarp' , component : InventoryScarpHomeComponent,
    },
    {
      path : 'msr-report' , component : MSRReportComponent,
    },
    {
      path : 'issueance-report' , component : IssueanceReportComponent,
    },
    {
      path : 'mrn-note' , component : MRNNoteComponent,
    },
    {
      path : 'daily-receiving-report' , component : DailyReceivingReportComponent,
    },
    {
      path : 'bom-report' , component : BomReportComponent,
    },
    {
      path : 'inventory-part-in-stock' , component : InventoryPartInStockComponent,
    },
    {
      path : 'supplier-po-details' , component : SupplierPODetailsComponent,
    },
    {
      path : 'style-status-report' , component : StyleStatusReportComponent,
    },
    {
      path : 'sales-freeze-report' , component : SalesFreezeReportComponent,
    },
    {
      path : 'sales-actual-report' , component : SalesActualReportComponent,
    },
    {
      path : 'sales-rmc-report' , component : SalesRMCReportComponent,
    },
    {
      path : 'pre-order-vs-post-order-analysis-report' , component : PreOrderVsPostOrderAnalysisReportComponent,
    },
    {
      path : 'grn-status-report' , component : GRNStatusReportComponent,
    },
	{
      path : 'customer-po-status-report' , component : CustomerPOStatusReportComponent,
	},
	{
      path : 'manual-po-list-inventory' , component : ManualPOListInventoryComponent,
	},
	{
      path : 'issuing-status-report' , component : IssuingStatusReportComponent,
	},
	{
      path : 'manual-po-list-non-inventory' , component : ManualPOListNonInventoryComponent,
	},
	{
      path : 'standard-vs-purchase-price-report' , component : StandardVsPurchasePriceReportComponent,
	},
	{
      path : 'yarn-count-detail-report', component : YarnCountDetailReportComponent,
  },
  {
      path : 'approvals-list', component : ApprovalsComponent,
  }



  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }

export const ReportsRoutingComponent = [
  GRNStatusReportComponent,
  CustomerPOStatusReportComponent,
  ManualPOListInventoryComponent,
  IssuingStatusReportComponent,
  ManualPOListNonInventoryComponent,
  StandardVsPurchasePriceReportComponent,
  YarnCountDetailReportComponent
];
