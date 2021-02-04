import { Component, OnInit, ViewChild, TemplateRef, Directive, Output, EventEmitter, ChangeDetectionStrategy, QueryList, ViewChildren} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators, FormControl, NgModel, } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat} from 'rxjs';
import {map, startWith, debounceTime, distinctUntilChanged, tap, switchMap, catchError} from 'rxjs/operators';


import { NgOption/*, NgSelectComponent*/ } from '@ng-select/ng-select';
declare var $:any;
import { ModalDirective, BsModalService } from 'ngx-bootstrap';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { AppConfig } from '../../../core/app-config';

import { Style } from '../../models/style.model';
import { Seasons } from '../../models/Season.model';
import { SubCategory } from '../../models/SubCategory.model';
import { StyleItems } from '../../models/StyleItems.model';
import { Suppliers } from '../../models/Suppliers.model';
import { FlashCostSheets } from '../../models/FlashCost.model';

import { AppAlert } from '../../../core/class/app-alert';
import { AppValidator } from '../../../core/validation/app-validator';
import { BasicValidators } from '../../../core/validation/basic-validators';

import { CostCalculations } from '../../cost-sheet/cost_calculations';
import { Common }  from '../../../common';

import * as Handsontable from 'handsontable';

@Component({
  selector: 'app-flash',
  templateUrl: './flash.component.html',
  styleUrls: []
})
export class FlashComponent implements OnInit {

modelTitle:string = "Add Items"
itemAddingType:string = "NEW"

itemadding_modal:BsModalRef;
smvadding_modal:BsModalRef;
template:BsModalRef;
serverUrl = AppConfig.apiServerUrl();

//@ViewChild('template')template : TemplateRef<any>;
//@ViewChildren('seasons')seasons:QueryList<any>;
//@ViewChild('seasons')seasons:NgSelectComponent;
//@ViewChild('itemListing')itemListing:NgSelectComponent;


optionsSelect:Array<any>;

formFields = {
    styleListing : '-1',
    category_code : null,
    StyleList:null,
    SeasonsList:'',
    ctrlStyleDescription:'',
    ctrlProductFeature:'',
    ctrlDivision:'',
    ctrlProductSilhouette:'',
    ctrlCustomer:'',
    product_category:'',
    ctrlFOB:0,
    supplier_code:null,
    uomCtrl:null,
    ctrlSewingSMV:0,
    ctrlPackingSMV:0,

  }

//falshCostingForm:FormGroup
//itemCostingForm:FormGroup
smvAddingForm:FormGroup

StyleList$:Observable<Array<any>>//observable to featch source list
StyleListingLoading = false;
StyleListInput$ = new Subject<string>();
selectedStyle:Style

SeasonsListing$:Observable<Array<any>>//observable to featch source list
SeasonsListLoading = false;
SeasonsListInput$ = new Subject<string>();
selectedSeason:Seasons //[] = <any>[{'season_name':'AW18'}];

subCategory$ : Observable<Array<any>>
SubCategoryLoading = false;
SubcategoryInput$ = new Subject<string>();
selectedSubCategory:SubCategory

StyleItemListing$:Observable<Array<any>>
StyleItemLoading = false;
StyleItemInput$ = new Subject<string>();
selectedItem:StyleItems

SupplierListing$:Observable<Suppliers[]>
SuppliersLoading = false;
SupplierInput$ = new Subject<string>();
selectedSupplier:Suppliers


StyleDetails$ : Observable<any[]>
mainCategory$ : Observable<any[]>
UOMList$ : Observable<any[]>
FlashCostList$ : Observable<any[]>
CostingHeaderDetails$ : Observable<any[]>
CostingLineDetails$ : Observable<any[]>

data = [];

style_code          = -1;
costing_code        = -1;
item_code           = -1;
season_id           = -1;
item_description    = "";
supplier_name       = "";
supplier_code       = -1;
labour_cost         = 0;
corporate_cost      = 0;
total_rm_cost       = 0;
finance_cost        = 0;
EPM_value           = 0;
NP_value            = 0;
editRowId           = 0;
total_cost          = 0;
hot;

productCategory     = "";
styleDescription    = "";
customerName        = "";
productFeature      = "";
styleDivision       = "";
productSilhoutte    = "";

changed = false;

/* must be removed or add value */
flashControl:any
modelSeason:any

constructor(private modalService: BsModalService, private http:HttpClient, private fb:FormBuilder, private titleService: Title) {    }

falshCostingForm = new FormGroup({

    StyleList : new FormControl(-1),
    product_category : new FormControl(-1),
    SeasonsList :  new FormControl(-1),
    ctrlFOB : new FormControl(0),

})

/*itemCostingForm = new FormGroup({
    category_code : new FormControl(null),
    SubCategory : new FormControl(null),
    StyleItems : new FormControl(null),
    conpc : new FormControl(0),
    uomCtrl : new FormControl(-1),
    unitprice : new FormControl(0),
    wastage : new FormControl(0),
    Suppliers : new FormControl(null),
    ctrlStyleItems : new FormControl(null),
 });*/
itemCostingForm = this.fb.group({
    category_code :[null],
    ctrlStyleItems :[null],
    SubCategory : [null],
    conpc : [null],
    uomCtrl : [null],
    unitprice : [null],
    wastage : [null],
    supplier_code:[null],
 });
  ngOnInit() {
    this.titleService.setTitle("Flash Costing")//set page title

    $("#btnRevise").hide();

  this.smvAddingForm = this.fb.group({
        ctrlSewingSMV:[null],
        ctrlPackingSMV:[null],

    });


    this.falshCostingForm = this.fb.group({
        StyleList : [null],
        product_category : [-1],
        SeasonsList : [null],
        ctrlOrderQty : ["0", [Validators.required]],
        flashCostingCtrl:[null],
        ctrlStyleDescription:[""],
        ctrlProductFeature:[""],
        ctrlDivision:[""],
        ctrlProductSilhouette:[""],
        ctrlCustomer:[""],
        ctrlFOB:["0"],
        supplier_code:[null],
    });


    this.data = [
        //{"1":"",2:"",3:"",4:"",5:"",6:"",7:"",8:"",9:"",10:""}
        //{1:"X",2:"X",3:"SINGLE JERSEY 100% COTTON",4:"YRD",5:"0.0035",6:"0.023",7:"5",8:"1230",9:"500",10:"XYZ Compnay"}
      ];

    var container = document.getElementById('gridItems');
    var self = this;

    this.hot = new Handsontable(container, {
        data:this.data,
        columns:[{
            data:'edit',renderer: 'html',
            readOnly:true
        },
        {
            data:'del',renderer: 'html',
            readOnly:true
        },
        {
            data:'item',
            readOnly:true
        },
        {
            data:'uom',
            readOnly:true
        },
        {
            data:'conpc'
        },
        {
            data:'unitprice'
        },
        {
            data:'wastage'
        },
        {
            data:'totqty',
            readOnly:true
        },
        {
            data:'totvalue',
            readOnly:true
        },
        {
            data:'supplier',
            readOnly:true
        }


        ],
        rowHeaders: false,
        //colHeaders: true,
        colWidths: [35, 35, 270, 47, 60, 65, 55, 60, 70,180],
        colHeaders: ["Edit", "Del", "Item Description", "UOM", "Con/Pc", "Unit Price","Wastage", "Total Qty", "Total Value", "Supplier"],
        hiddenColumns:{
            columns: [10]
        },
        currentRowClassName: 'currentRow',
        stretchH: 'all',
        //dropdownMenu: true,
        height:150,
        width:900

      });



    this.LoadStyles();
    this.LoadSeasons();
    this.loadMainCategoryList();
    this.loadUOM();
    this.LoadSuppliers();


    this.hot.addHook('afterOnCellMouseDown', function(event, coords, TD){

        if(coords.col == 0){
            //self.PopUpAddItem(self.template);

            this.editRowId = coords.row;

            let imgElement = self.hot.getDataAtCell(coords.row,coords.col);
            let imgSplitElement = imgElement.split("=");
            let imgId = imgSplitElement[2].split("/>");
            let imgIdSplit = imgId[0].split("_");

            let grid_item_code = imgIdSplit[0];
            let grid_uom_id = imgIdSplit[1];
            let grid_supplier_code = imgIdSplit[2];

            self.editItem(grid_item_code, coords.row);

        }

        if(coords.col == 1){
            AppAlert.showConfirm({text:"Need to remove selected item? "},
                (result) =>{
                    if(result.value){
                      self.RemoveRow(coords.row,);
                    }
                }
            );
        }
    });

    this.hot.addHook('afterSetDataAtCell', function(changes, src){

        if(!self.changed){
            self.changed = true;

            let $RowId          = changes[0][0];
            let $ColumnName     = changes[0][1];
            let $ChangedValue   = changes[0][3];
            let $ColumnNumber   = self.getColumnNumber($ColumnName);

            self.setDataInGrd($ChangedValue, $RowId, $ColumnNumber);
        }
    })
  }

 setDataInGrd(changedValue, rowId, $ColumnNumber){

    let $conPc      = 0;
    let $unitPrice  = 0;
    let $wastage    = 0;

    switch($ColumnNumber){

        case 4:
            $conPc      = changedValue;
            $unitPrice  = this.hot.getDataAtCell(rowId,5);
            $wastage    = this.hot.getDataAtCell(rowId,6);
        break;

        case 5:
            $conPc      = this.hot.getDataAtCell(rowId,4);
            $unitPrice  = changedValue;
            $wastage    = this.hot.getDataAtCell(rowId,6);

        break;

        case 6:
            $conPc      = this.hot.getDataAtCell(rowId,4);
            $unitPrice  = this.hot.getDataAtCell(rowId,5);
            $wastage    = changedValue;
        break;

    }

    //Calculate Requirement Quantity
    //==============================
    let $orderQty:number    = this.falshCostingForm.get('ctrlOrderQty').value;
    let $requirementQty     = $orderQty * $conPc;
    let $wastageQty         = ($requirementQty * $wastage)/100;
    let $totalRequirement   = $requirementQty + $wastageQty;
    let $totalValue         = $totalRequirement * $unitPrice;


    //Set the changed value in the grid
    // ================================
    this.hot.setDataAtCell(rowId,7,$totalRequirement);
    this.hot.setDataAtCell(rowId,8,$totalValue);

    this.changed = false;

    this.calculateRawMaterialCost($orderQty);

 }

 calculateRawMaterialCost($orderQty){

    let $totalRMValue:number = 0;

    for(var $iGridRows = 0; $iGridRows<this.hot.countRows(); $iGridRows++){

        $totalRMValue += this.hot.getDataAtCell($iGridRows,8);
    }

    this.total_rm_cost = $totalRMValue/$orderQty;
    this.calTotalCost();
 }

 getColumnNumber(grdColumnName){

    let $ColumnNumber = 0;

    switch(grdColumnName){

        case "conpc":
            $ColumnNumber = 4
        break;

        case "unitprice":
            $ColumnNumber = 5
        break;

        case "wastage":
            $ColumnNumber = 6
        break;

    }

    return $ColumnNumber;


 }

 editItem(itemcode, gridRow){

   this.modelTitle = "Edit Style Item";
   this.itemAddingType = "EDIT";
   let costingId = this.costing_code.toString();

    this.editRowId = gridRow;

    this.http.get(this.serverUrl + 'api/flashcosting/getcostitems',{params:{"costing_id":costingId, 'item_code':itemcode}}).subscribe(data=>{

        //this.subCategory$ = this.http.get<any[]>(this.serverUrl + 'finance/item/get-subcatby-maincat', {params:{'category_id':data[0]['category_id']}}).pipe(map(subres => subres));
        this.loadSubCategory(data[0]['category_id']);
        this.loadStyleItemsBySubCat(data[0]['subcategory_id']);

        $('#model_item_adding').modal('show');

        //$("#conpc").val(data[0]['conpc']);
        //$("#unitprice").val();
        //$("#wastage").val();

        this.itemCostingForm.setValue({
            category_code:data[0]['category_id'],
            ctrlStyleItems:data[0]['master_id'],
            conpc:data[0]['conpc'],
            uomCtrl:data[0]['uom_id'],
            unitprice:data[0]['unitprice'],
            wastage:data[0]['wastage'],
            supplier_code:data[0]['supplier_id'],
            SubCategory:data[0]['subcategory_id'],
        })
    });


 }

  ngAfterViewInit(){

    //this.selectedSeason.season_id = 1;

    /*this.seasons.forEach((element)=>{
        setTimeout(() => {
            if(element.el.nativeElement.attributes.id.value == 1){
                element.select(1);
            }
        },100);
    });*/
  }

  RemoveRow(rowId){
    this.hot.alter('remove_row',rowId);
   }

  LoadStyles(){

    this.StyleList$ = concat(
        of([]), // default items
        this.StyleListInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.StyleListingLoading = true),
            switchMap(term => this.http.get<Style[]>(this.serverUrl + 'api/loadstyles',{params:{search:term}}).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.StyleListingLoading = false)
            ))
        )
    );
  }

  LoadSeasons(){
    this.SeasonsListing$ = this.http.get<Seasons[]>(this.serverUrl + 'api/seasonlist').pipe(map(res=>res));

  }

  LoadSuppliers(){

   this.SupplierListing$ = this.http.get<Suppliers[]>(this.serverUrl + 'api/org/supplierslist/loadsuppliers').pipe(map(res=>res));
  }


  PopUpAddItem(/*template: TemplateRef<any>*/){

    //this.itemadding_modal =  this.modalService.show(template,{class:'modal-sm'});
    this.itemAddingType = "NEW";
    this.itemCostingForm.reset();
    $('#model_item_adding').modal('show');

  }

  onChange($event){



    this.style_code = $event.style_id;

    //Load style details by selected style
    this.http.get(this.serverUrl + 'api/loadStyleDetails', {params:{'style_id':$event.style_id}})
    .subscribe(data => {

        this.productCategory = data[0]['prod_cat_description'];
        this.styleDescription = data[0]['style_description'];
        this.customerName = data[0]['customer_name'];
        this.productFeature = data[0]['product_feature_description'];
        this.styleDivision = data[0]['division_description'];
        this.productSilhoutte = data[0]['product_silhouette_description'];

        this.falshCostingForm.setValue({
            StyleList:this.style_code,
            product_category:this.productCategory,
            ctrlStyleDescription:this.styleDescription,
            ctrlProductFeature:this.productFeature,
            ctrlDivision:this.styleDivision,
            ctrlProductSilhouette:this.productSilhoutte,
            ctrlCustomer:this.customerName,
            SeasonsList:-1,
            supplier_code:-1,
            ctrlOrderQty:0,
            flashCostingCtrl:-1,
            ctrlFOB:0,
        })

        $("#style_img").prop('src', this.serverUrl+'assets/styleImage/' + data[0]['image']);
    })

    /*this.StyleDetails$ = this.http.get<any[]>(this.serverUrl + 'api/loadStyleDetails', {params:{'style_id':$event.style_id}}).pipe(map(subres => subres));
    this.StyleDetails$.forEach(mainElements=>{

        $("#style_desc").val(mainElements[0]['style_description']);
        $("#customer_name").val(mainElements[0]['customer_name']);
        $("#product_category").val(mainElements[0]['prod_cat_description']);
        $("#product_feature").val(mainElements[0]['product_feature_description']);
        $("#product_silhouette").val(mainElements[0]['product_silhouette_description']);
        $("#division").val(mainElements[0]['division_description']);
        $("#style_img").prop('src', this.serverUrl+'assets/styleImage/' + mainElements[0]['image']);

        $("#order_qty").focus();
    }); */

    // Load existing costing details
    // ==============================
    this.FlashCostList$ = this.http.get<FlashCostSheets[]>(this.serverUrl + 'api/flashcosting/listcosting',{params:{'style_id':$event.style_id}}).pipe(map(res=>res));
 }

 loadMainCategoryList(){
    this.mainCategory$ = this.http.get<any[]>(this.serverUrl + "finance/item/maincategorylist").pipe(map(res => res));
 }

 loadSubCategory(mainCode){

   /* this.subCategory$ = concat(
        of([]), // default items
        this.SubcategoryInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.SubCategoryLoading = true),
            switchMap(term => this.http.get<SubCategory[]>(this.serverUrl + 'finance/item/get-subcatby-maincat',{params:{'category_id':mainCode}}).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.SubCategoryLoading = false)
            ))
        )
    );
   */
    this.subCategory$ = this.http.get<any[]>(this.serverUrl + 'finance/item/get-subcatby-maincat', {params:{'category_id':mainCode}}).pipe(map(subres => subres));
  }


 setFocusConPc(event){

    this.item_description = event.master_description;
    this.item_code = event.master_id;
    $("#conpc").focus();
 }

loadStyleItemsBySubCat(subCategoryId){

    this.StyleItemListing$ = this.http.get<StyleItems[]>(this.serverUrl + 'api/items/itemlist/loadItemsbycat',{params:{'subcatcode':subCategoryId}}).pipe(map(subres => subres));
 }

 loadStyleItems(event){

    this.StyleItemListing$ = concat(
        of([]), // default items
        this.StyleItemInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.StyleItemLoading = true),
            switchMap(term => this.http.get<StyleItems[]>(this.serverUrl + 'api/items/itemlist/loadItemsbycat',{params:{'subcatcode':event.subcategory_id}}).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.StyleItemLoading = false)
            ))
        )
    );
 }


 loadUOM(){
    this.UOMList$ = this.http.get<any[]>(this.serverUrl + "org/uom/list-all").pipe(map(res=>res));
    console.log(this.UOMList$);
 }

onSupplierChange(event){

    this.supplier_name = $("#supplierlist :selected").text();
    this.supplier_code = $("#supplierlist :selected").val();
}

getSeasonDeatils(event){
    //this.season_id = event.season_id;
   this.season_id = $("#seasons :selected").val();

   alert(this.season_id);
}

addItemToGrid(){

    var itemDescription = $("#itemDescription :selected").text();
    var itemCode = $("#itemDescription :selected").val();

    var uom = $("#itemuom :selected").text();
    var uom_id = $("#itemuom :selected").val();

    var conpc:number = Number($("#conpc").val());
    var unit_price:number = Number($("#unitprice").val());
    var wastage:number = Number($("#wastage").val());



    var order_qty:number = Number($("#order_qty").val());

    var tot_req_qty = 0;
    var total_value = 0;

    //Calculate required quantity
    tot_req_qty = CostCalculations.calculateRequiredQty(order_qty, conpc, wastage);

    total_value = CostCalculations.calculateItemValue(tot_req_qty, unit_price);

    if(this.itemAddingType == "NEW"){
        this.data.push({"edit":'<img src="assets/images/edit.jpg" id='+itemCode+"_"+uom_id+"_"+this.supplier_code +  '/>',"del":'<img src="assets/images/delete.jpg" onclick="popupRemove()"/>',"item":itemDescription,"uom":uom,"conpc":conpc,"unitprice":unit_price,"wastage":wastage, "totqty":tot_req_qty, "totvalue":total_value, "supplier": this.supplier_name});
    }else{

        this.hot.alter('remove_row',this.editRowId);
        this.data.push({"edit":'<img src="assets/images/edit.jpg" id='+itemCode+"_"+uom_id+"_"+this.supplier_code +  '/>',"del":'<img src="assets/images/delete.jpg" onclick="popupRemove()"/>',"item":itemDescription,"uom":uom,"conpc":conpc,"unitprice":unit_price,"wastage":wastage, "totqty":tot_req_qty, "totvalue":total_value, "supplier": this.supplier_name});

    }

    for(var datalen = 0; datalen<this.data.length;datalen++){

        this.hot.getData().push(this.data[datalen]);

    }
    this.hot.render();

    let rm_cost = (total_value / order_qty);

    this.total_rm_cost += rm_cost;

    this.calEPM();
    this.calNP();
    this.calTotalCost();

}

save_costing(){

    let order_qty = $("#order_qty").val();
    let order_fob = $("#order_fob").val();
    let order_smv = $("#order_smv").val();
    let order_sewing_smv = this.smvAddingForm.get('ctrlSewingSMV').value;
    let order_pack_smv = this.smvAddingForm.get('ctrlPackingSMV').value;
    let order_efficiency = $("#order_eff").val();

    let fac_cpm = $("#fac_cpm").val();
    let front_cpm = $("#front_cpm").val();
    let finance_rate = $("#finance_perc").val();
    let financeCost = $("#total_fin_cost").val();
    let epm_rate = $("#epm").val();
    let netProfit = $("#np").val();

    this.season_id = $("#seasons :selected").val();



    let costingHeader = [];

    var itemRowCount = this.hot.countRows();

    if(this.style_code == -1){
        AppAlert.showWarning({title:"No style selected from the list "});
        return;
    }

    if(itemRowCount == 0){
        AppAlert.showWarning({title:"No least raw material item in the list "});
        return;
    }


    // Save Flash costing header details
    // =================================
    //let costingHeader = JSON.stringify({"style_code":this.style_code, "order_qty":order_qty, "season_id":this.season_id, "sewing_smv":order_sewing_smv, "packing_smv":order_pack_smv, "order_smv":order_smv, "order_eff":order_efficiency });
    costingHeader.push({"costing_id":this.costing_code, "style_code":this.style_code, "order_qty":order_qty, "season_id":this.season_id, "sewing_smv":order_sewing_smv, "packing_smv":order_pack_smv, "order_smv":order_smv,
                        "order_eff":order_efficiency, "order_fob":order_fob,"labour_cost":this.labour_cost, "finance_cost":financeCost, "corporate_cost":this.corporate_cost, "epm":epm_rate,
                        "np":netProfit, "fac_cpm":fac_cpm, "front_cpm":front_cpm, "fin_rate":finance_rate });
    this.http.post(this.serverUrl + 'api/flashcosting/savecostingheader',costingHeader[0]).subscribe(data =>{

        if(data['status']!='fail'){

            this.costing_code = data['status'];

            //Before save line details check if costing exist and set line items status to zero (inactive mode)
            let costingID$ = [];
            costingID$.push({"costing_id":this.costing_code});

            this.http.post(this.serverUrl + 'api/flashcosting/setinactive',costingID$[0]).subscribe(data =>{

                if(data['status']!='fail'){

                    // Save flash costing line details
                    for(var tblRowCount = 0;tblRowCount<this.hot.countRows();tblRowCount++){

                        //itemGridData = JSON.stringify(this.hot.getDataAtCell(tblRowCount,0));
                        let itemGridData = [];
                        let imgElement = this.hot.getDataAtCell(tblRowCount,0);
                        let imgSplitElement = imgElement.split("=");
                        let imgId = imgSplitElement[2].split("/>");
                        let imgIdSplit = imgId[0].split("_");

                        let grid_item_code = imgIdSplit[0];
                        let grid_uom_id = imgIdSplit[1];
                        let grid_supplier_code = imgIdSplit[2];

                        let grid_conpc = this.hot.getDataAtCell(tblRowCount,4);
                        let grid_unitPrice = this.hot.getDataAtCell(tblRowCount,5);
                        let grid_Wastage = this.hot.getDataAtCell(tblRowCount,6);
                        let grid_totalQty = this.hot.getDataAtCell(tblRowCount,7);
                        let grid_totalValue = this.hot.getDataAtCell(tblRowCount,8);

                        // Push grid data to array to save
                        itemGridData.push({"costing_id":this.costing_code,"style_code":this.style_code,"item_code":grid_item_code,"uom_id":grid_uom_id,"con_pc":grid_conpc,"unit_price":grid_unitPrice,"wastage":grid_Wastage,"total_required_qty":grid_totalQty, "total_value":grid_totalValue,"supplier_id":grid_supplier_code});

                        //Save costing line details
                        this.http.post(this.serverUrl + 'api/flashcosting/savecostingdetails',itemGridData[0]).subscribe(data =>{

                            if(data['status']=='success'){

                                AppAlert.showSuccess({text:"Flash costing save successfully"});
                                return;
                            }else{
                                AppAlert.showError({text:"Error in saving costing details"});
                                return;
                            }
                        });
                    }
                }

            });

        }else{
            AppAlert.showError({text:"Error in saving costing header"});
            return;
        }
    });
}

confirm_costing(){

    let costingHeader = [];

    if(this.costing_code == -1){
        AppAlert.showWarning({title:"Valid costing not selected. "});
        return;
    }

    costingHeader.push({"costing_id":this.costing_code});

    this.http.post(this.serverUrl + 'api/flashcosting/confirmcosting',costingHeader[0]).subscribe(data =>{

        if(data['status']=='success'){
            $("#btnSave").attr('disabled','disabled');
            $("#btnConfirm").hide();
            $("#btnRevise").show();
            AppAlert.showSuccess({text:"Flash costing confirm successfully"});
            this.loadSavedCostingLineDetails(this.costing_code,3);
            return;
        }else{
            AppAlert.showError({text:"Error in confirming costing details"});
            return;
        }
    });


}

calLabourCost(){

    let order_smv:number = Number($("#order_smv").val());
    let cpm_factory:number = Number($("#fac_cpm").val());

    let factory_cost:number = CostCalculations.calculateLabourCost(order_smv, cpm_factory);

    this.labour_cost = factory_cost;

    this.calTotalCost();

}

 calCorporateCost(){
    let order_smv:number = Number($("#order_smv").val());
    let cpm_front:number = Number($("#front_cpm").val());

    let cop_cost:number = CostCalculations.calculateLabourCost(order_smv, cpm_front);

    this.corporate_cost = cop_cost;

    this.calTotalCost();
 }

 calFinanceCost(){

    let finance_per = Number($("#finance_perc").val());
    let tot_rm_cost = Number($("#total_rm_cost").val());

    this.finance_cost = CostCalculations.calculateFinanceCost(finance_per, tot_rm_cost);

    this.calTotalCost();
 }

 calEPM(){

    let orderFOB = Number($("#order_fob").val());
    let totRMCost = Number($("#total_rm_cost").val());
    let orderSMV = Number($("#order_smv").val());

    this.EPM_value = CostCalculations.calculateEPM(orderFOB, totRMCost, orderSMV);

 }

calTotalCost(){

    this.total_cost = this.total_rm_cost + this.finance_cost + this.labour_cost + this.corporate_cost;

}

 calNP(){

    let totRMCost = Number($("#total_rm_cost").val());
    let orderFOB = Number($("#order_fob").val());

    let manufacturingCost = CostCalculations.calculateManufacturingCost(totRMCost,this.labour_cost);
    let totalCost = CostCalculations.calculateTotalCost(manufacturingCost,this.finance_cost, this.corporate_cost);

    this.NP_value = CostCalculations.calculateNP(orderFOB, totalCost);


 }

 getCostingDetails(costingId){

   let orderStatus = 0;
   this.costing_code = costingId;


    this.http.get(this.serverUrl + 'api/flashcosting/listcostingheader',{params:{'costing_id':costingId}})
    .subscribe(data => {

        this.falshCostingForm.setValue({
            StyleList:this.style_code,
            product_category:this.productCategory,
            supplier_code:["-1"],
            flashCostingCtrl:data[0]['costing_id'],
            ctrlStyleDescription:this.styleDescription,
            ctrlProductFeature:this.productFeature,
            ctrlDivision:this.styleDivision,
            ctrlProductSilhouette:this.productSilhoutte,
            ctrlCustomer:this.customerName,
            ctrlOrderQty:data[0]['order_qty'],
            SeasonsList:data[0]['season_id'],
            ctrlFOB:data[0]['order_fob'],
        })

        $("#order_smv").val(data[0]['order_smv']);
        $("#order_eff").val(data[0]['order_eff']);
        $("#fac_cpm").val(data[0]['factory_cpm']);
        $("#front_cpm").val(data[0]['frontend_cpm']);
        $("#finance_perc").val(data[0]['finance_rate']);
        //$("#total_fin_cost").val(data[0]['finance_cost']);
        this.finance_cost = data[0]['finance_cost'];
        $("#labour_cost").val(data[0]['labour_sub_cost']);
        $("#corporate_cost").val(data[0]['corporate_cost']);
        $("#epm").val(data[0]['epm_rate']);
        $("#np").val(data[0]['netprofit']);

        orderStatus = data[0]['order_status'];

        this.smvAddingForm.setValue({
            ctrlSewingSMV:data[0]['sewing_smv'],
            ctrlPackingSMV:data[0]['packing_smv'],
        })

        if(data[0]['order_status'] == 3){
            $("#btnSave").attr('disabled','disabled');
            $("#btnConfirm").hide();
            $("#btnRevise").show();
        }

        this.loadSavedCostingLineDetails(costingId, orderStatus)
    })

    // Load costing header details
    // ============================
    //this.CostingHeaderDetails$ = this.http.get<any[]>(this.serverUrl + 'api/flashcosting/listcostingheader',{params:{'costing_id':costingId}}).pipe(map(res=>res));

    /*this.CostingHeaderDetails$.forEach(headerElements=>{

        $("#order_qty").val(headerElements[0]['order_qty']);
        $("#order_fob").val(headerElements[0]['order_fob']);
        $("#order_smv").val(headerElements[0]['order_smv']);
        $("#order_eff").val(headerElements[0]['order_eff']);
        $("#fac_cpm").val(headerElements[0]['factory_cpm']);
        $("#front_cpm").val(headerElements[0]['frontend_cpm']);
        $("#finance_perc").val(headerElements[0]['finance_rate']);
        $("#total_fin_cost").val(headerElements[0]['finance_cost']);
        $("#labour_cost").val(headerElements[0]['labour_sub_cost']);
        $("#corporate_cost").val(headerElements[0]['corporate_cost']);
        $("#epm").val(headerElements[0]['epm_rate']);
        $("#np").val(headerElements[0]['netprofit']);

        //this.selectedSeason = headerElements[0]['season_id'];
        //SeasonsList =  headerElements[0]['season_id'];



        if(headerElements[0]['order_status'] == 3){
            $("#btnSave").attr('disabled','disabled');
            $("#btnConfirm").hide();
            $("#btnRevise").show();
        }

        this.loadSavedCostingLineDetails(costingId, orderStatus)
    }); */


 }

loadSavedCostingLineDetails(costId, orderStatus){

    while(this.data.length > 0){
        this.data.pop();
    }

    let totalRMValue = 0;
    this.total_rm_cost = 0;
    var order_qty:number = Number($("#order_qty").val());

    // Load costing line details
    // ============================
    this.CostingLineDetails$ = this.http.get<any[]>(this.serverUrl + 'api/flashcosting/listcostinglines',{params:{'costing_id':costId}}).pipe(map(res=>res));

    this.CostingLineDetails$.forEach(lineElements=>{

        for(var lineLength = 0; lineLength<lineElements.length; lineLength++){

            let _itemCode           = lineElements[lineLength]['master_id'];
            let _uomId              = lineElements[lineLength]['uom_id'];
            let _supplierId         = lineElements[lineLength]['supplier_id'];
            let _supplierName       = lineElements[lineLength]['supplier_name'];
            let _itemDescription    = lineElements[lineLength]['master_description'];
            let _uomName            = lineElements[lineLength]['uom_description'];
            let _conPc              = lineElements[lineLength]['conpc'];
            let _unitPrice          = lineElements[lineLength]['unitprice'];
            let _wastage            = lineElements[lineLength]['wastage'];
            let _totReqQty          = lineElements[lineLength]['total_required_qty'];
            let _totValue           = lineElements[lineLength]['total_value'];

            totalRMValue += _totValue;

            if(orderStatus == 3){
                this.data.push({"edit":'',"del":'',"item":_itemDescription,"uom":_uomName,"conpc":_conPc,"unitprice":_unitPrice,"wastage":_wastage, "totqty":_totReqQty, "totvalue":_totValue, "supplier": _supplierName});
            }else{
                this.data.push({"edit":'<img src="assets/images/edit.jpg" id='+_itemCode+"_"+_uomId+"_"+_supplierId +  '/>',"del":'<img src="assets/images/delete.jpg" />',"item":_itemDescription,"uom":_uomName,"conpc":_conPc,"unitprice":_unitPrice,"wastage":_wastage, "totqty":_totReqQty, "totvalue":_totValue, "supplier": _supplierName});
            }
        }

        for(var datalen = 0; datalen<this.data.length;datalen++){

            this.hot.getData().push(this.data[datalen]);

        }
        this.hot.render();

        let rm_cost = (totalRMValue / order_qty);
        this.total_rm_cost += rm_cost;

    });

}

 revise_costing(){

    let costingHeader = [];

    costingHeader.push({"costing_id":this.costing_code});

    this.http.post(this.serverUrl + 'api/flashcosting/revisecosting',costingHeader[0]).subscribe(data =>{

        if(data['status']=='success'){

            AppAlert.showSuccess({text:"Flash costing revised successfully"});

            $("#btnSave").removeAttr('disabled');
            $("#btnRevise").hide();
            $("#btnConfirm").show();

            this.loadSavedCostingLineDetails(this.costing_code,0);

            return;
        }else{
            AppAlert.showError({text:"Error in revising costing details"});
            return;
        }
    });

 }

popUpSMV(){
    if(this.style_code == -1){
        AppAlert.showWarning({title:"No style selected from the list "});
        return;
    }
    $('#model_add_smv').modal('show');
    if(this.costing_code != -1){

    }
    $("#sewingsmv").focus();

}

addSMV(){
   let totalSMV:number = Number(this.smvAddingForm.get('ctrlSewingSMV').value) + Number(this.smvAddingForm.get('ctrlPackingSMV').value);
   $("#order_smv").val(totalSMV);
   this.calEPM();
}

reset_forms(){
    this.falshCostingForm.reset();
    this.itemCostingForm.reset();
    this.smvAddingForm.reset();

    $("#order_smv").val(0);
    $("#order_eff").val(0);
    $("#fac_cpm").val(0);
    $("#front_cpm").val(0);
    $("#finance_perc").val(0);
    this.finance_cost = 0;
    $("#labour_cost").val(0);
    $("#corporate_cost").val(0);
    $("#epm").val(0);
    $("#np").val(0);
    $("#total_rm_cost").val(0);

    this.style_code = -1;


    while(this.data.length > 0){
        this.data.pop();
    }
    this.hot.render();
}


}
