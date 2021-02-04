import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';
//import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';

import { HotTableModule } from '@handsontable/angular';
import { BsDatepickerModule,ModalModule,TabsModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
//import { QueryBuilderModule } from "angular2-query-builder";

import { MerchandisingRoutingModule , MerchandisingRoutingModuleComponents } from './merchandising-routing.module';
//import { KeysPipe } from './pips/keys.pipe';

//import { TnaComponent } from './tna/tna.component';
//import { MasterEventComponent } from './master-event/master-event.component';
import { StyleBuyerPoComponent } from './style-buyer-po/style-buyer-po.component';
import { StyleBuyerPoListComponent } from './style-buyer-po/style-buyer-po-list.component';
import { StyleBuyerPoHomeComponent } from './style-buyer-po/style-buyer-po-home.component';

import { StyleCreationComponent } from './style-creation/style-creation.component';
import { FlashComponent } from './cost-sheet/flash/flash.component';
import { ReportFlashComponent } from './cost-sheet/report-flash/report-flash.component';

import { BuyerPoSizeComponent } from './style-buyer-po/buyer-po-size/buyer-po-size.component';
import { PoSplitComponent } from './style-buyer-po/po-split/po-split.component';
import { PoRevisionComponent } from './style-buyer-po/po-revision/po-revision.component';


//import { FlashComponent } from './costing/flash/flash.component';

//import { BulkComponent } from './costing/bulk/bulk.component';
import { BomComponent } from './bom/bom.component';

import { HomeModule } from '../home';
import { CoreModule } from '../core';
import { SharedModule } from '../shared';
//import { CostingModule } from './costing/costing.module';

import { PurchaseRequisitionLinesComponent } from './purchase-requisition-lines/purchase-requisition-lines.component';
import { PrlListComponent } from './purchase-requisition-lines/prl-list/prl-list.component';

//import { CombineSo } from './combine-so/combine-so.component';
//import { CombineSoModal } from './combine-so/combine-so-modal/combine-so-modal.component';
import { PrlHomeComponent } from './purchase-requisition-lines/prl-home/prl-home.component';
//import { OperationStyleMapComponent } from './operation-style-map/operation-style-map.component';
import { PurchaseOrderRevisionComponent } from './purchase-order-revision/purchase-order-revision.component';
import { PurchaseListComponent } from './purchase-order-revision/purchase-list/purchase-list.component';
import { PoRevisionComponent1 } from './purchase-order-revision/po-revision/po-revision.component';
import { PrlSplitComponent } from './purchase-requisition-lines/prl-split/prl-split.component';
import { PrlPoListComponent } from './purchase-requisition-lines/prl-po-list/prl-po-list.component';
import { PorSplitComponent } from './purchase-order-revision/por-split/por-split.component';
import { StyleCreationHomeComponent } from './style-creation/style-creation-home/style-creation-home.component';
import { StyleCreationMainComponent } from './style-creation/style-creation-main/style-creation-main.component';
import { StyleCreationPopupComponent } from './style-creation/style-creation-popup/style-creation-popup.component';

import { MatratioComponent } from './bom/matratio/matratio.component';
import { BomHomeComponent } from './bom/bom-home/bom-home.component';
import { BomListComponent } from './bom/bom-list/bom-list.component';

import { StyleCreationImageCropperComponent } from './style-creation/style-creation-image-cropper/style-creation-image-cropper.component'
import { ImageCropperModule } from 'ngx-image-cropper';

import { CostSheetComponent } from './cost-sheet/cost-sheet/cost-sheet.component'
import { CostSheetHomeComponent } from './cost-sheet/cost-sheet-home/cost-sheet-home.component'
import { CostSheetListComponent } from './cost-sheet/cost-sheet-list/cost-sheet-list.component'
import { ConsumptionUpdateComponent } from './cost-sheet/consumption-update/consumption-update.component'
import { BomConsumptionUpdateComponent } from './bom/bom-consumption-update/bom-consumption-update.component'
import { ShopOrderComponent } from './shop-order/shop-order.component';
import { ShopOrderListComponent } from './shop-order/shop-order-list/shop-order-list.component';
import { ShopOrderHomeComponent } from './shop-order/shop-order-home/shop-order-home.component'

import { ProductAverageEfficiencyComponent } from './product-average-efficiency/product-average-efficiency.component';
import { ProductAverageEfficiencyListComponent } from './product-average-efficiency/product-average-efficiency-list.component';
import { ProductAverageEfficiencyHistoryComponent } from './product-average-efficiency/product-average-efficiency-history.component';

@NgModule({
  imports: [
    CommonModule,
    HomeModule,
    CoreModule,
    SharedModule,
    MerchandisingRoutingModule,
    HotTableModule.forRoot(),
    ReactiveFormsModule,
    NgSelectModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    SnotifyModule,
    //CostingModule,
    FormsModule,
    NgMultiSelectDropDownModule.forRoot(),
    //QueryBuilderModule,
    ImageCropperModule
  ],
 //declarations: [StyleCreationComponent,KeysPipe, TnaComponent, MasterEventComponent, FlashComponent],
 // declarations: [StyleCreationComponent, TnaComponent, MasterEventComponent],

  // declarations: [StyleCreationComponent, StyleBuyerPoComponent, TnaComponent],
 declarations: [
   MerchandisingRoutingModuleComponents,
   StyleBuyerPoComponent,
   //KeysPipe,
   //TnaComponent,
   //MasterEventComponent,
   StyleBuyerPoListComponent,
   StyleCreationComponent,
   StyleCreationComponent,
   FlashComponent,
   ReportFlashComponent,
   StyleBuyerPoHomeComponent,
   BuyerPoSizeComponent,
   PoSplitComponent,
   PoRevisionComponent,
   PoRevisionComponent1,
   PurchaseRequisitionLinesComponent,
   PrlListComponent,
   PrlHomeComponent,
   BomComponent,
   // OperationStyleMapComponent,
   PurchaseOrderRevisionComponent,
   PurchaseListComponent,
   PrlSplitComponent,
   PrlPoListComponent,
   PorSplitComponent,
   StyleCreationHomeComponent,
   StyleCreationMainComponent,
   StyleCreationPopupComponent,
   MatratioComponent,
   BomHomeComponent,
   BomListComponent,
   BomConsumptionUpdateComponent,
   StyleCreationImageCropperComponent,
   CostSheetComponent,
   CostSheetHomeComponent,
   CostSheetListComponent,
   ConsumptionUpdateComponent,
   ShopOrderComponent,
   ShopOrderListComponent,
   ShopOrderHomeComponent,
   ProductAverageEfficiencyComponent,
   ProductAverageEfficiencyListComponent,
   ProductAverageEfficiencyHistoryComponent
 ],

  providers : [
    { provide: 'SnotifyToastConfig', useValue: ToastDefaults},
    SnotifyService
  ],
  exports : [/*StyleCreationComponent*/]
})
export class MerchandisingModule { }
