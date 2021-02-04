import { Component, OnInit, TemplateRef,ViewChild,ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, Observable, of, concat} from 'rxjs';
import {map, startWith, debounceTime, distinctUntilChanged, tap, switchMap, catchError} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
//import { Style } from '../models/style.model';
import { HotTableModule } from '@handsontable/angular';
import { ModalDirective/*, BsModalService*/ } from 'ngx-bootstrap/modal';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';

import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { BomService } from './bom.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { AuthService } from '../../core/service/auth.service';
import { ItemSelectorComponent } from '../../shared/components/item-selector/item-selector.component';
import { PermissionsService } from '../../core/service/permissions.service';
//import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

//import { CostSheets } from '../models/Costing.model';
//import { ConsoleService } from '@ng-select/ng-select/ng-select/console.service';
//import { forEach } from '@angular/router/src/utils/collection';
declare var $:any;

@Component({
  selector: 'app-bom',
  templateUrl: './bom.component.html',
  styleUrls: ['./bom.component.css']
})
export class BomComponent implements OnInit {

@ViewChild(ItemSelectorComponent) itemSelectorComponent: ItemSelectorComponent;

bomForm : FormGroup
apiUrl = AppConfig.apiUrl();
readonly url = this.apiUrl + 'merchandising/costing'

scList$:Observable<Array<any>>//observable to featch sc numbers
scListingLoading = false;
scListInput$ = new Subject<string>();

salesOrderDeliveries : Array<any> = []

settingsRM: any = null //for items table
dataRM: any = [] //items list
tblRM : string = 'bomItems' //items table name
tblItemSelectedRange = null

isDeliverySelected : boolean = false
processing : boolean = false
scListselectedDelivery = -1 //used to chek previously selected delivery id
currentlyOpenTab : string = 'ITEM'

showEditButton = false
showSaveButton = false
showConfirmButton = false
showNotifyButton = false
//showExitButton = false
showSendButton = false

feature_component_count : number = 0
feature_components = []

  @ViewChild(ModalDirective) materialRatioModel: ModalDirective;

  constructor(private fb:FormBuilder, private http:HttpClient, private titleService: Title,
    /*private modalService: BsModalService,*/ private bomService : BomService,private authService : AuthService,
    private hotRegisterer: HotTableRegisterer, private layoutChangerService : LayoutChangerService,
    public permissionService:PermissionsService) { }

  ngOnInit() {
    this.titleService.setTitle("Bill Of Material")//set page title
    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Merchandising',
      'Bill Of Material'
    ])

    this.bomForm = this.fb.group({
      bom_id : 0,
      costing_id : null,
      fng_code : null,
      fng : [null],
      country : [null],
      revision : [null],
      status : [null],
      fabric_cost : [null],
      elastic_cost  : [null],
      trim_cost : [null],
      packing_cost : null,
      other_cost : null,
      total_rm_cost : [null],
      epm : [null],
      np_margin : [null],
      total_smv : null,
      fob : null,
      fng_color : null,
      currency_code : '',
      cpm_factory : 0,
      finance_charges : 0,
      labour_cost : 0,
      coperate_cost : 0
    })


    this.bomService.bomId.subscribe(data => { //listning to the bom list show button event
      if(data != null){
        if(this.bomForm.get('bom_id').value > 0) { //has already opend bom
          AppAlert.showConfirm({
            'text' : 'You have already opened bom. Do you want to clear previous one and open bom ('+data+')?'
          },(result) => {
            if (result.value) {
              this.bomForm.get('bom_id').setValue(data)
              this.clearAllData()
              this.loadBom(data)
            }
          })
        }
        else {
          this.bomForm.get('bom_id').setValue(data)
          this.loadBom(data)
        }
      }
    })

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){ return }
        this.reloadTables()
    })

    this.initializeRMGrid()

  }


  onSelect(data: TabDirective): void {
    switch(data.heading){
      case 'Items':
        this.currentlyOpenTab = 'ITEM'
        this.reloadTables()
      break;
      case 'SMV':
        this.currentlyOpenTab = 'SMV'
      break;
      case 'Operation':
        this.currentlyOpenTab = 'OPERATION'
      break;
    }
  }


  reloadTables(){
    let hotInstance = null;
    switch(this.currentlyOpenTab){
      case 'ITEM':
        hotInstance = this.hotRegisterer.getInstance(this.tblRM);
        if(hotInstance != undefined && hotInstance != null){
          setTimeout(() => {
            hotInstance.render() //refresh costing color table
          }, 200)
        }
      break;
      case 'SMV':

      break;
      case 'Operation':

      break;
    }
  }


  initializeRMGrid(){

      if(this.settingsRM != null) {
        return
      }
      this.settingsRM = {
        columns: [
          { type: 'autocomplete', title : 'SFG Code' , data: 'sfg_code', strict:true},
          { type: 'autocomplete', title : 'SFG Color' , data: 'sfg_color_name' },
          { type: 'text', title : 'Product Component' , data: 'product_component_description'},
          { type: 'dropdown', title : 'Product Silhouette' , data: 'product_silhouette_description', /*allowEmpty:false*/},
          { type: 'text', title : 'Material Type' , data: 'category_name' },
          {
            type: 'text', title : 'Artical Number' , data: 'supplier_reference',
          },
          { type: 'text', title : 'Item Code' , data: 'master_code'},
          { type: 'text', title : 'Item Description' , data: 'master_description', className: "htLeft"},
          {
            title : 'Fabric Position',
            type: 'autocomplete',
            source: (query, process) => {
              $.ajax({
                url: this.apiUrl + 'merchandising/position?type=handsontable' ,
                dataType: 'json',
                data: { search: query },
                success: function (response) {
                  process(response['data']);
                }
              });
            },
            strict: true,
            data: 'position',
            readOnly: false
          },
          { type: 'dropdown', title : 'UOM' , data: 'uom_code', allowEmpty:false},
          {
            type: 'text', title : 'Color Code' , data: 'color_code' , /*readOnly: false,strict: true,
            source: (query, process) => {
              $.ajax({
                url: this.url + '?type=getColorForDivision' ,
                dataType: 'json',
                data: {query: query},
                success: function (response) {
                  process(response);
                }
              });
            }*/
          },
          {
            type: 'text', title : 'Supplier' , data: 'supplier_name',
            /*type: 'autocomplete', title : 'Supplier' , data: 'supplier_name' , readOnly: false,strict: true,
            source: (query, process) => {
              $.ajax({
                headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                data: { search: query },
                url: this.apiUrl + 'org/suppliers?type=handsontable' ,
                dataType: 'json',
                success: function (response) {
                  process(response['data']);
                }
              });
            }*/
          },
          {
            type: 'autocomplete', title : 'Origin Type' , data: 'origin_type' , readOnly: false, strict:true, allowEmpty:false,
            source: (query, process) => {
              $.ajax({
                headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                data: { search: query },
                url: this.apiUrl + 'org/origin-types?type=handsontable' ,
                dataType: 'json',
                success: function (response) {
                  process(response['data']);
                }
              });
            }
          },
          {
            type: 'autocomplete', title : 'Garment Option' , data: 'garment_options_description' , readOnly: false, strict:true,
            source: (query, process) => {
              $.ajax({
                headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                data: { search: query },
                url: this.apiUrl + 'org/garmentoptions?type=handsontable' ,
                dataType: 'json',
                success: function (response) {
                  process(response['data']);
                }
              });
            }
          },
          {
            type: 'numeric', title : 'Purchase Price' , data: 'purchase_price' , readOnly: false, allowEmpty:false, className: "htRight"
            /*numericFormat: {
              pattern: '$0,0.0000',
              culture: 'en-US' // this is the default culture, set up for USD
            }*/
          },
          {
            type: 'numeric', title : 'Net Consumption' , data: 'net_consumption' , /*readOnly: false,*/ allowEmpty:false,className: "htRight",
            numericFormat: {pattern: '$0,0.0000'}
          },
          {
            type: 'numeric', title : 'Wastage %' , data: 'wastage' , allowEmpty:false, className: "htRight"
          },
          {
            type: 'numeric', title : 'Gross Consumption' , data: 'gross_consumption' , readOnly: true, className: "htRight"
            /*numericFormat: {pattern: '0,0.000000'}*/
          },
          {
            type: 'dropdown', title : 'Operation' , data: 'garment_operation_id' , readOnly: false, strict:true,
            source: (query, process) => {
              $.ajax({
                headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                data: { search: query },
                url: this.apiUrl + 'ie/garment_operations?type=handsontable' ,
                dataType: 'json',
                success: function (response) {
                  process(response['data']);
                }
              });
            }
          },
          {
            type: 'dropdown', title : 'Order Type' , data: 'meterial_type' , readOnly: false, strict:true, allowEmpty:false,
            source : ['NONE', 'COLOR WISE', 'SIZE WISE', 'BOTH']
          },
          { type: 'numeric', title : 'Freight' , data: 'freight_charges' , readOnly: false, allowEmpty:false, className: "htRight"/*numericFormat: {pattern: '$0,0.0000'}*/},
          { type: 'numeric', title : 'MCQ' , data: 'mcq' , allowEmpty:false, className: "htRight"/*numericFormat: {pattern: '0,0.00'}*/},
          { type: 'numeric', title : 'MOQ' , data: 'moq' , allowEmpty:false, className: "htRight"/*numericFormat: {pattern: '0,0.00'}*/},
          { type: 'numeric', title : 'Surchage' , data: 'surcharge' , readOnly: false, allowEmpty:false, className: "htRight"/*numericFormat: {pattern: '$0,0.0000'}*/},
          { type: 'numeric', title : 'Total Cost' , data: 'total_cost' , readOnly: true, className: "htRight"/*numericFormat: {pattern: '$0,0.0000'}*/},
          {
            type: 'dropdown', title : 'Shipment Mode' , data: 'ship_mode' , readOnly: false, strict:true,
            source: (query, process) => {
              $.ajax({
                headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                data: { search: query },
                url: this.apiUrl + 'org/ship-modes?type=handsontable' ,
                dataType: 'json',
                success: function (response) {
                  process(response['data']);
                }
              });
            }
          },
          {
            type: 'autocomplete', title : 'Shipment Term' , data: 'ship_term_id' , readOnly: false, strict:true,
            source: (query, process) => {
              $.ajax({
                headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                data: { search: query },
                url: this.apiUrl + 'finance/ship-terms?type=handsontable' ,
                dataType: 'json',
                success: function (response) {
                  process(response['data']);
                }
              });
            }
          },
          { type: 'numeric', title : 'Lead Time' , data: 'lead_time' , readOnly: false, className: "htRight"/*numericFormat: {pattern: '0,0.00'}*/},
          {
            type: 'autocomplete', title : 'Country Of Origin' , data: 'country_description' , readOnly: false, strict:true,
            source: (query, process) => {
              $.ajax({
                headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                data: { search: query },
                url: this.apiUrl + 'org/countries?type=handsontable' ,
                dataType: 'json',
                success: function (response) {
                  process(response['data']);
                }
              });
            }
          },
          { type: 'text', title : 'Comments' , data: 'comments' , readOnly: false}
        ],
        contextMenu : {
            callback: function (key, selection, clickEvent) {
              // Common callback for all settings
            },
            items : {
              'Add' : {
                name : 'Add Item',
                hidden: (key, selection, clickEvent) => {
                  return !this.showSaveButton
                },
                callback : (key, selection, clickEvent) => {

                  let product_component_description = ''
                  let product_silhouette_description = ''
                  let product_component_id = null
                  let product_silhouette_id = null

                  if(this.feature_component_count == 1) { //if is a single pack set components
                    product_component_description = this.feature_components[0].product_component_description
                    product_silhouette_description = this.feature_components[0].product_silhouette_description
                    product_component_id = this.feature_components[0].product_component_id
                    product_silhouette_id = this.feature_components[0].product_silhouette_id
                  }

                  this.dataRM.push({
                    bom_detail_id : 0,
                    //sfg_color_name : '',
                    //feature_component_id : this.selectedProductFeatureComponent.feature_component_id,
                    sfg_code : null,
                    product_component_description : product_component_description,
                    product_silhouette_description : product_silhouette_description,
                    product_component_id : product_component_id,
                    product_silhouette_id : product_silhouette_id,
                    bom_id : this.bomForm.get('bom_id').value,
                    inventory_part_id : 0,
                    costing_id : 0,//this.formGroup.get('id').value,
                    category_code : '',
                    category_name : '',
                    supplier_reference : '',
                    master_description : '',
                    position : '',
                    uom_code : '',
                    color_code : '',
                    supplier_name : '',
                    origin_type : '',
                    garment_options_description : '',
                    bom_unit_price : 0,
                    net_consumption : 0,
                    wastage : 0,
                    gross_consumption : 0,
                    meterial_type : 'NONE',
                    freight_charges : '0',
                    mcq : 0,
                    surcharge : 0,
                    total_cost : 0,
                    ship_mode : '',
                    ship_term_id : '',
                    lead_time : 0,
                    country_description : '',
                    comments : '',
                    edited : true,
                    item_type : 'COMPONENT'
                  })
                //  setTimeout(()=>{
                    const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
                    hotInstance2.render()

                    let row = (this.dataRM.length - 1)
                    let start = { row : row, col : 0 }
                    let end = { row : row, col : 0 }
                    //opem popup automatically
                    this.tblItemSelectedRange = { start : start, end : end }
                    this.itemSelectorComponent.openModel()
                  }
              },
              'add_fng_item' : {
                name : 'Add Finish Good Item',
                hidden: (key, selection, clickEvent) => {
                  return !this.showSaveButton
                },
                callback : (key, selection, clickEvent) => {

                  this.dataRM.push({
                    bom_detail_id : 0,
                    sfg_code : null,
                    product_component_description : null,
                    product_silhouette_description : null,
                    product_component_id : null,
                    product_silhouette_id : null,
                    bom_id : this.bomForm.get('bom_id').value,
                    inventory_part_id : 0,
                    costing_id : 0,//this.formGroup.get('id').value,
                    category_code : '',
                    category_name : '',
                    supplier_reference : '',
                    master_description : '',
                    position : '',
                    uom_code : '',
                    color_code : '',
                    supplier_name : '',
                    origin_type : '',
                    garment_options_description : '',
                    bom_unit_price : 0,
                    net_consumption : 0,
                    wastage : 0,
                    gross_consumption : 0,
                    meterial_type : 'NONE',
                    freight_charges : '0',
                    mcq : 0,
                    surcharge : 0,
                    total_cost : 0,
                    ship_mode : '',
                    ship_term_id : '',
                    lead_time : 0,
                    country_description : '',
                    comments : '',
                    edited : true,
                    item_type : 'FNG'
                  })

                    const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
                    hotInstance2.render()

                    let row = (this.dataRM.length - 1)
                    let start = { row : row, col : 0 }
                    let end = { row : row, col : 0 }
                    //opem popup automatically
                    this.tblItemSelectedRange = { start : start, end : end }
                    this.itemSelectorComponent.openModel()
                  }
              },
              'Find' : {
                name : 'Find',
                hidden: (key, selection, clickEvent) => {
                  return !this.showSaveButton
                },
                disabled: function () {
                  let selection = this.getSelectedLast()
                  if(selection[0] == selection[2] && selection[1] == selection[3]){
                    if(selection[1] == 4 || selection[1] == 5 || selection[1] == 6 || selection[1] == 7){
                      return false
                    }
                    else{
                      return true
                    }
                  }
                  else
                    return true
                },
                callback : (key, selection, clickEvent) => {
                  //console.log(selection)
                  if(selection.length > 0){
                    let start = selection[0].start;
                    let end = selection[0].end;
                    if(start.row == end.row){ //chek user select only single row
                      //this.saveItem(start.row) //save single item
                      this.tblItemSelectedRange = {
                        start : start,
                        end : end
                      }
                      this.itemSelectorComponent.openModel()
                    }

                  }
                }
              },
              'Save' : {
                name : 'Save',
                hidden: (key, selection, clickEvent) => {
                  return !this.showSaveButton
                },
                disabled: function () {
                  //let selection = this.getSelectedLast()
                  return false
                },
                callback : (key, selection, clickEvent) => {
                  //console.log(selection)
                  if(selection.length > 0){
                    let start = selection[0].start;
                    let end = selection[0].end;
                    if(start.row == end.row){ //chek user select only single row
                      //this.saveItem(start.row) //save single item
                      if(this.dataRM[start.row]['edited'] == true){
                        this.validateSingleItem(start.row) //validate item data and save
                      }
                    }
                    else{
                      AppAlert.showError({text : 'cannot select multiple rows to save'})
                    }
                  }
                }
              },
              'Copy' : {
                name : 'Copy',
                hidden: (key, selection, clickEvent) => {
                  return !this.showSaveButton
                },
                disabled: function (key, selection, clickEvent) {
                  return false
                },
                callback : (key, selection, clickEvent) => {
                  if(selection.length > 0){
                    let start = selection[0].start;
                    let end = selection[0].end;
                    if(start.row == end.row){//chek only select single row
                      let item = JSON.parse(JSON.stringify(this.dataRM[start.row]))
                      item.bom_detail_id = 0
                      item.edited = true
                      this.dataRM.push(item)
                      const hotInstance = this.hotRegisterer.getInstance(this.tblRM);
                      hotInstance.render()
                      this.calculate_rm_cost()
                      //this.copyItem(this.dataRM[start.row]['bom_detail_id']) //copy single item
                    }
                  }
                }
              },
              'Copy_from' : {
                name : 'Copy Items From',
                hidden: (key, selection, clickEvent) => {
                  return !this.showSaveButton
                },
                disabled: function (key, selection, clickEvent) {
                  return false
                },
                callback : (key, selection, clickEvent) => {
                  if(selection.length > 0){
                    let start = selection[0].start;
                    let end = selection[0].end;
                    if(start.row == end.row){//chek only select single row
                      AppAlert.showInput({ title : 'Copy Items From Another BOM', inputPlaceholder : 'Enter bom id'}, (data) =>{
                        if(data.value != undefined && data.value != null){
                          let _toBomId = this.bomForm.get('bom_id').value
                          let _fromBomId = parseInt(data.value)
                          this.copyAllItemsFrom(_fromBomId, _toBomId)
                        }
                      })
                    }
                  }
                }
              },
              'Remove' : {
                name : 'Remove',
                hidden: (key, selection, clickEvent) => {
                  return !this.showSaveButton
                },
                callback : (key, selection, clickEvent) => {
                  if(selection.length > 0){
                    let start = selection[0].start;
                    let end = selection[0].end;
                    if(start.row == end.row){//check user select single row
                      AppAlert.showConfirm({
                        'text' : 'Do you want to remove this item?'
                      },(result) => {
                        if (result.value) {
                          if(this.dataRM[start.row]['bom_detail_id'] == 0) {//chek is a not saved item
                            this.dataRM.splice(start.row, 1) //delete from array
                            const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
                            hotInstance2.render()
                            this.calculate_rm_cost()
                          }
                          else{
                            this.deleteItem(this.dataRM[start.row]['bom_detail_id']) //delete item from db
                          }
                        }
                      })
                    }
                  }
                }
              },
            }
          },
        mergeCells: [],
        cells: (row, col, prop) => {
          var cellProperties = {};

          if(this.dataRM[row] != undefined){
            if(this.dataRM[row]['edited'] != undefined && this.dataRM[row]['edited'] == 1){ //chek row is edited by user and then change color
              cellProperties['renderer'] = function defaultValueRenderer(tbl, td, row, col, prop, value, cellProperties) {
                var args = arguments;
                td.style.background = '#d1e0e0';
                Handsontable.renderers.TextRenderer.apply(this, args);
              }
            }
            else if(this.dataRM[row]['item_type'] == 'FNG'){
              cellProperties['renderer'] = function defaultValueRenderer(tbl, td, row, col, prop, value, cellProperties) {
                var args = arguments;
                td.style.background = '#ccffcc';
                Handsontable.renderers.TextRenderer.apply(this, args);
              }
            }
            else{
              cellProperties['renderer'] = function defaultValueRenderer(tbl, td, row, col, prop, value, cellProperties) {
                var args = arguments;
                td.style.background = '#fff';
                Handsontable.renderers.TextRenderer.apply(this, args);
              }
            }
          }

          if(col == 0) { //change sfg settings
                if(this.dataRM[row] != undefined && this.dataRM[row]['bom_detail_id']  != null && this.feature_component_count > 1 && this.dataRM[row]['item_type'] == 'COMPONENT'){
                cellProperties['readOnly'] = false;
                cellProperties['strict'] = true
                cellProperties['allowEmpty'] = false
                cellProperties['source'] = (query, process) => {
                  $.ajax({
                    url: this.apiUrl + 'merchandising/bom?type=semi_finish_goods&bom_id=' + this.bomForm.get('bom_id').value,
                    dataType: 'json',
                    data: { search: query },
                    success: function (response) {
                      process(response['data']);
                    }
                  });
                }
              }
              return cellProperties;
          }

          if(col == 9){ //change item uom cell settings
                //if item description cell not empty, load item uoms
                if(this.dataRM[row] != undefined && this.dataRM[row]['bom_detail_id']  != null && this.dataRM[row]['master_description'] != null && this.dataRM[row]['master_description'] != ''){
                cellProperties['readOnly'] = false;
                cellProperties['strict'] = true
                cellProperties['source'] = (query, process) => {
                  $.ajax({
                    url: this.url + '?type=item_uom',
                    dataType: 'json',
                    data: { item_description : this.dataRM[row]['master_description'] },
                    success: function (response) {
                      process(response['data']);
                    }
                  });
                }
              }
              return cellProperties;
          }
          else if(col == 15){ //change net consumption cell settings//
            //if(this.dataRM[row] != undefined && this.dataRM[row]['category_code'] != 'PAC' && this.permissionService.hasDefined('BOM_NET_CONSUMPTION_CHANGE')){
            //  cellProperties['readOnly'] = false;
            //}
            //else if(this.dataRM[row] != undefined && this.dataRM[row]['category_code'] == 'PAC'){
            //  cellProperties['readOnly'] = false;
            //}
            if(this.dataRM[row] != undefined && (this.dataRM[row]['uom_code'] == 'PCS' || this.dataRM[row]['uom_code'] == 'pcs')){
              cellProperties['readOnly'] = false;
            }
            return cellProperties;
          }
          else if(col == 16){
            if(this.dataRM[row] != undefined && (this.dataRM[row]['uom_code'] == 'PCS' || this.dataRM[row]['uom_code'] == 'pcs')){
              cellProperties['readOnly'] = false;
            }
            return cellProperties;
          }
          /*else if(col == 10){ //change item supplier cell settings
            if(this.dataRM[row] != undefined && (this.dataRM[row]['supplier_reference'] == null ||  this.dataRM[row]['supplier_reference'] == '')){
              cellProperties['readOnly'] = false;
            }
            return cellProperties;
          }*/
          /*else if(col == 1) { //change item cell settings
            //if item category cell not empty, then load items
            if(this.dataRM[row] != undefined && this.dataRM[row]['product_component_description'] != null && this.dataRM[row]['product_component_description'] != ''){
              cellProperties['readOnly'] = false;
                cellProperties['source'] = (query, process) => {
                  $.ajax({
                    headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                    data: {
                      search: query,
                      bom_id : this.bomForm.get('bom_id').value,
                      component : this.dataRM[row]['product_component_description']
                    },
                    url: this.apiUrl + 'merchandising/bom?type=style_component_silhouettes' ,
                    dataType: 'json',
                    success: function (response) {
                      process(response['data']);
                    }
                  });
                }
              }
              return cellProperties;
          }*/
          //  else if(col == 9 || col == 10 || col == 11 || col == 12 || col == 13 ){
          //  cellProperties['numericFormat'] = {pattern: '$0,0.0000'}
        //  }
          else{
            return cellProperties;
          }
        },
        /*afterSelectionEnd : () => {
          alert()
        },*/
        /*afterSelectionEnd: (e, row, column, row2, column2) => {
          //  this.colorModel.show()
        },*/
        afterChange : (changes, source) => {
          if(source != null && source.length > 0){
            const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
            //get changed cell value
            //let _cell_value = (source[0][3] == undefined || source[0][3] == null || source[0][3] == '') ? 0 : source[0][3]
            let _row = source[0][0]


            if(source[0][1] == 'net_consumption'){
              // gross consumption = net consumption + (net consumption * wastage) / 100
              let _net_consumption = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
              let _wastage = hotInstance2.getDataAtCell(_row, 16)
              _wastage = (_wastage == '' || isNaN(_wastage)) ? 0 : _wastage
            //  if(_net_consumption == '' || isNaN(_net_consumption)){//chek value and if not a number, then set cell value to 0
            //    _net_consumption = 0
            //    //hotInstance2.setDataAtCell(_row, 10, 0)
            //  }
              let decimalCount = this.dataRM[_row]['is_decimal_allowed'] == 1 ? 4 : 0

              if(_net_consumption < 0){
                hotInstance2.setDataAtCell(_row, 15, 0)
              }
              else if(this.countDecimals(_net_consumption) > decimalCount){
                _net_consumption = this.formatDecimalNumber(_net_consumption, decimalCount)
                hotInstance2.setDataAtCell(_row, 15, _net_consumption)
              }

              let gross_consumption = _net_consumption + ((_net_consumption * _wastage) / 100) //net consumption * wastage
              gross_consumption = this.formatDecimalNumber(gross_consumption, 4)
              hotInstance2.setDataAtCell(_row, 17, gross_consumption)
              hotInstance2.setDataAtCell(_row, 24, this.calculate_item_cost(_row))
            }
            else if(source[0][1] == 'wastage'){
              // gross consumption = net consumption + (net consumption * wastage) / 100
              let _wastage = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
              let _net_consumption = hotInstance2.getDataAtCell(_row, 15)
              _net_consumption = (_net_consumption == '' || isNaN(_net_consumption)) ? 0 : parseFloat(_net_consumption)
              // *if(_wastage == '' || isNaN(_wastage)){//chek value and if not a number, then set cell value to 0
              //  _wastage = 0
            //    //hotInstance2.setDataAtCell(_row, 11, 0)
            //  }
            if(_wastage < 0 ){
              hotInstance2.setDataAtCell(_row, 16, 0)
            }
            else if(this.countDecimals(_wastage) > 4){
              _wastage = this.formatDecimalNumber(_wastage, 4)
              hotInstance2.setDataAtCell(_row, 16, _wastage)
            }

              let gross_consumption = (_net_consumption + ((_net_consumption * _wastage) / 100)).toFixed(4)//net consumption * wastage
              gross_consumption = this.formatDecimalNumber(gross_consumption, 4)
              hotInstance2.setDataAtCell(_row, 17, gross_consumption)
              hotInstance2.setDataAtCell(_row, 24, this.calculate_item_cost(_row))
            }
            else if(source[0][1] == 'freight_charges'){
              let _freight_charges = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]

              if(_freight_charges < 0 ){
                hotInstance2.setDataAtCell(_row, 20, 0)
              }
              else if(this.countDecimals(_freight_charges) > 4){
                _freight_charges = this.formatDecimalNumber(_freight_charges, 4)
                hotInstance2.setDataAtCell(_row, 20, _freight_charges)
              }
              hotInstance2.setDataAtCell(_row, 24, this.calculate_item_cost(_row))
            }
            else if(source[0][1] == 'surcharge'){
              let _surcharge = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]

              if(_surcharge < 0){
                hotInstance2.setDataAtCell(_row, 23, 0)
              }
              else if(this.countDecimals(_surcharge) > 4){
                _surcharge = this.formatDecimalNumber(_surcharge, 4)
                hotInstance2.setDataAtCell(_row, 23, _surcharge)
              }
              hotInstance2.setDataAtCell(_row, 24, this.calculate_item_cost(_row))
            }
            else if(source[0][1] == 'purchase_price'){
              let _purchase_price = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
              let _unit_price = (this.dataRM[_row].bom_unit_price == null || this.dataRM[_row].bom_unit_price == '') ? 0 : parseFloat(this.dataRM[_row].bom_unit_price)

              if(_purchase_price > _unit_price || _purchase_price < 0){
                _purchase_price = source[0][2]
                _purchase_price = this.formatDecimalNumber(_purchase_price, 4)
                hotInstance2.setDataAtCell(_row, 14, _purchase_price)
              }
              else {
                if(this.countDecimals(_purchase_price) > 4){
                  _purchase_price = this.formatDecimalNumber(_purchase_price, 4)
                  hotInstance2.setDataAtCell(_row, 14, _purchase_price)
                }
              }
              /*if(this.countDecimals(_unit_price) > 4){
                _unit_price = this.formatDecimalNumber(_unit_price, 4)
                hotInstance2.setDataAtCell(_row, 13, _unit_price)
              }*/
              hotInstance2.setDataAtCell(_row, 24, this.calculate_item_cost(_row))
            }
            else if(source[0][1] == 'mcq'){
              let _mcq = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
              if(this.countDecimals(_mcq) > 0){
                _mcq = this.formatDecimalNumber(_mcq, 0)
                hotInstance2.setDataAtCell(_row, 21, _mcq)
              }
            }
            else if(source[0][1] == 'lead_time'){
              let _lead_time = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]

              if(_lead_time < 0){
                hotInstance2.setDataAtCell(_row, 27, 0)
              }
              else if(this.countDecimals(_lead_time) > 4){
                _lead_time = this.formatDecimalNumber(_lead_time, 4)
                hotInstance2.setDataAtCell(_row, 27, _lead_time)
              }
            }
            else if(source[0][1] == 'total_cost'){
              this.calculate_rm_cost()
            }
            else if(source[0][1] == 'category_name'){
              if(source[0][2] != source[0][3]){//chek new value and old value
                hotInstance2.setDataAtCell(_row, 8, null)
                hotInstance2.setDataAtCell(_row, 9, null)
              }
              this.calculate_rm_cost()
            }
            else if(source[0][1] == 'master_description'){
              if(source[0][2] != source[0][3]){//chek new value and old value
                hotInstance2.setDataAtCell(_row, 9, null)
              }
            }
            else if(source[0][1] == 'meterial_type'){
              if(source[0][2] != 'NONE' && source[0][2] != 'COLOR WISE' && source[0][2] != 'SIZE WISE' && source[0][2] != 'BOTH'){//chek new value and old value
                hotInstance2.setDataAtCell(_row, 17, 'NONE')
              }
            }
            else if(source[0][1] == 'origin_type'){
              if(source[0][3] == 'IMPORT'){
                hotInstance2.setDataAtCell(_row, 25, 'SEA')
              }
              else{
                hotInstance2.setDataAtCell(_row, 25, null)
              }
            }
            else if(source[0][1] == 'ship_mode'){
              if(source[0][3] == 'SEA'){
                hotInstance2.setDataAtCell(_row, 26, 'FOB')
              }
              else{
                hotInstance2.setDataAtCell(_row, 26, null)
              }
            }
            else if(source[0][1] == 'supplier_reference'){
              if(source[0][3] == null || source[0][3] == ''){ //enable supplier name column
                hotInstance2.setCellMeta(_row, 11, 'readOnly' , 'false')
              }
              else { //disable supplier column
                hotInstance2.setCellMeta(_row, 11, 'readOnly' , 'true')
              }
            }
            else if(source[0][1] == 'sfg_code'){
              if(source[0][3] == null || source[0][3] == ''){
                hotInstance2.setDataAtCell(_row, 2, null)
                hotInstance2.setDataAtCell(_row, 3, null)
              }
              else{
                this.loadComponentDetails(source[0][3], _row)
              }
            }
            else if(source[0][1] == 'comments'){
              if(source[0][3] != null && source[0][3] != ''){ //enable supplier name column
                let str = source[0][3].toUpperCase()
                if(!(str === source[0][3])){
                  hotInstance2.setDataAtCell(_row, 29, str)
                }
              }
            }
            else if(source[0][1] == 'uom_code'){
              if(source[0][3] == null || source[0][3] == ''){
                this.dataRM[_row]['is_decimal_allowed'] = 1
              }
              else {
                this.http.get(this.apiUrl + 'org/uom/' + source[0][3])
                .pipe(map(res => res['data']))
                .subscribe(
                  res => {
                    this.dataRM[_row]['is_decimal_allowed'] = res.is_decimal_allowed
                  },
                  error => {
                    this.dataRM[_row]['is_decimal_allowed'] = 1
                  }
                )

              }
            }

            if(_row != undefined && _row != null && this.dataRM.length > 0 && (source[0][2] != source[0][3])){
              this.dataRM[_row]['edited'] = true //change editaed row status to edit
              hotInstance2.render()
            }
          }
        },
        manualColumnResize: true,
        autoColumnSize : true,
        rowHeaders: true,
        height: 300,
        stretchH: 'all',
        selectionMode: 'single',
        //fixedColumnsLeft: 4,
        //className: 'htCenter htMiddle',
        className: "htLeft",
        readOnly: true,
      }

  }


  loadComponentDetails(_sfg_code, _row){
    this.http.get(this.apiUrl + 'merchandising/bom?type=semi_finish_good_details&sfg_code=' + _sfg_code)
    .subscribe(
      res => {
        if(res['data'] != null){
          const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
          hotInstance2.setDataAtCell(_row, 1, res['data']['color_name'])
          hotInstance2.setDataAtCell(_row, 2, res['data']['product_component_description'])
          hotInstance2.setDataAtCell(_row, 3, res['data']['product_silhouette_description'])
          this.dataRM[_row]['product_component_id'] = res['data']['product_component_id']
          this.dataRM[_row]['product_silhouette_id'] = res['data']['product_silhouette_id']
          this.dataRM[_row]['product_component_line_no'] = res['data']['product_component_line_no']
        }
      },
      error => {

      }
    )
  }


  onSelectItem(data){
    //console.log(data)
    this.itemSelectorComponent.hideModel()
    setTimeout(() => {
      const hotInstance = this.hotRegisterer.getInstance(this.tblRM);
      let rowIndex = this.tblItemSelectedRange.start.row
      hotInstance.setDataAtCell(rowIndex, 4, data.category_name)
      hotInstance.setDataAtCell(rowIndex, 5, data.supplier_reference)
      hotInstance.setDataAtCell(rowIndex, 6, data.master_code)
      hotInstance.setDataAtCell(rowIndex, 7, data.master_description)
      hotInstance.setDataAtCell(rowIndex, 21, data.mcq)
      hotInstance.setDataAtCell(rowIndex, 22, data.moq)
      //hotInstance.setDataAtCell(rowIndex, 9, data.color_code)
      hotInstance.setDataAtCell(rowIndex, 14, data.standard_price)
      //set color if exists
      if(data.color_code != undefined && data.color_code != null){
        hotInstance.setDataAtCell(rowIndex, 10, data.color_code)
      }
      else{
        hotInstance.setDataAtCell(rowIndex, 10, '')
      }
      hotInstance.setDataAtCell(rowIndex, 11, (data.supplier_name == undefined || data.supplier_name == null) ? '' : data.supplier_name)

      this.dataRM[rowIndex]['inventory_part_id'] = data.master_id
      this.dataRM[rowIndex]['category_code'] = data.category_code
      this.dataRM[rowIndex]['bom_unit_price'] = data.standard_price
      //this.dataRM[rowIndex]['supplier_reference'] = data.supplier_reference
      //this.dataRM[rowIndex]['master_description'] = data.master_description
      //this.dataRM[rowIndex]['master_code'] = data.master_code
      //this.dataRM[rowIndex]['category_name'] = data.category_name
      //this.dataRM[rowIndex]['article_no'] = data.article_no
      //hotInstance.render()
    },200)

  //  console.log(this.dataRM[rowIndex])
    //this.calculate_rm_cost()
  }



    calculate_item_cost(_row){
      const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
      // gross consumption = net consumption + (net consumption * wastage) / 100
      let net_consumption = hotInstance2.getDataAtCell(_row, 15)
      if(net_consumption == null || net_consumption == '' || isNaN(net_consumption)){ //check for incorect values
        //hotInstance2.setDataAtCell(_row, 10, 0)
        net_consumption = 0;
      }
      net_consumption = parseFloat(net_consumption)

      let wastage = hotInstance2.getDataAtCell(_row, 16)
      if(wastage == null || wastage == '' || isNaN(wastage)){ //check for incorect values
        //hotInstance2.setDataAtCell(_row, 11, 0)
        wastage = 0;
      }
      wastage = parseFloat(wastage)

      let gross_consumption = net_consumption + ((net_consumption * wastage) / 100)
      gross_consumption = this.formatDecimalNumber(gross_consumption, 4)
      let unit_price = hotInstance2.getDataAtCell(_row, 14)
      if(unit_price == null || unit_price == '' || isNaN(unit_price)){ //check for incorect values
      //  hotInstance2.setDataAtCell(_row, 9, 0)
        unit_price = 0;
      }
      unit_price = parseFloat(unit_price)

      let freight_charges = hotInstance2.getDataAtCell(_row, 20)//parseFloat(hotInstance2.getDataAtCell(_row, 14))
      if(freight_charges == null || freight_charges == '' || isNaN(freight_charges)){ //check for incorect values
        //hotInstance2.setDataAtCell(_row, 14, 0)
        freight_charges = 0;
      }
      else{
        freight_charges = parseFloat(hotInstance2.getDataAtCell(_row, 20))
      }

      let surcharge = hotInstance2.getDataAtCell(_row, 23)//parseFloat(hotInstance2.getDataAtCell(_row, 16))
      if(surcharge == null || surcharge == '' || isNaN(surcharge)){ //check for incorect values
        //hotInstance2.setDataAtCell(_row, 16, 0)
        surcharge = 0;
      }
      else{
        surcharge = parseFloat(hotInstance2.getDataAtCell(_row, 23))
      }

      let total_cost = ((gross_consumption * unit_price) + freight_charges + surcharge)
      total_cost = this.formatDecimalNumber(total_cost, 4)
      return total_cost
    }


    calculate_rm_cost(){
      const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
      let _fabricCost = 0
      let _elastcCost = 0
      let _packingCost = 0
      let _trimCost = 0
      let _otherCost = 0
      let _rmCost = 0

      for(let x = 0 ; x < this.dataRM.length ; x++){
        let itemCost = parseFloat(hotInstance2.getDataAtCell(x, 24))
        if(/*hotInstance2.getDataAtCell(x, 0)*/this.dataRM[x]['category_code'] == 'FAB'){
          _fabricCost += itemCost
        }
        else if(/*hotInstance2.getDataAtCell(x, 0)*/this.dataRM[x]['category_code'] == 'ELA'){
          _elastcCost += itemCost
        }
        else if(/*hotInstance2.getDataAtCell(x, 0)*/this.dataRM[x]['category_code'] == 'PAC'){
          _packingCost += itemCost
        }
        else if(this.dataRM[x]['category_code'] == 'TRM'){
          _trimCost += itemCost
        }
        else if(this.dataRM[x]['category_code'] == 'OTH'){
          _otherCost += itemCost
        }
        _rmCost += itemCost
      }

      let _fob = this.bomForm.get('fob') == null ? 0 : parseFloat(this.bomForm.get('fob').value)
      let _labourCost = this.bomForm.get('labour_cost') == null ? 0 : parseFloat(this.bomForm.get('labour_cost').value)
      //let _cpmFactory = this.bomForm.get('cpm_factory').value
      //let _labourCost = this.bomForm.get('total_smv').value * _cpmFactory
      //let _financeCost = this.bomForm.get('finance_cost') == null ? 0 : this.bomForm.get('finance_cost').value
      let _financeCharges = parseFloat(this.bomForm.get('finance_charges').value)
      let _financeCost = (_financeCharges * _rmCost) / 100
      let _coperateCost = this.bomForm.get('coperate_cost') == null ? 0 : parseFloat(this.bomForm.get('coperate_cost').value)
      let _totalCost = _rmCost + _labourCost + _financeCost + _coperateCost
      let _np = (_fob - _totalCost) / _fob
      let _epm = (_fob - _rmCost) / parseFloat(this.bomForm.get('total_smv').value)

      this.bomForm.get('fabric_cost').setValue(this.formatDecimalNumber(_fabricCost, 4).toFixed(4))
      this.bomForm.get('elastic_cost').setValue(this.formatDecimalNumber(_elastcCost, 4).toFixed(4))
      this.bomForm.get('packing_cost').setValue(this.formatDecimalNumber(_packingCost, 4).toFixed(4))
      this.bomForm.get('trim_cost').setValue(this.formatDecimalNumber(_trimCost, 4).toFixed(4))
      this.bomForm.get('other_cost').setValue(this.formatDecimalNumber(_otherCost, 4).toFixed(4))
      this.bomForm.get('total_rm_cost').setValue(this.formatDecimalNumber(_rmCost, 4).toFixed(4))
      this.bomForm.get('epm').setValue(this.formatDecimalNumber(_epm, 4).toFixed(4))
      this.bomForm.get('np_margin').setValue(this.formatDecimalNumber(_np, 4).toFixed(4))
    }



    //context menu - size
    contextMenuSize(_row){
      let data = this.dataRM[_row]
      this.bomService.changeLineData(data)
    }


    loadBom(_bomId){
      this.processing = true
      AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading bom')
      //load header data
      this.http.get(this.apiUrl + 'merchandising/bom/' + _bomId)
      .pipe( map(res => res['data']) )
      .subscribe(
          data => {
            this.processing = false
            //let headerData = data.header_data
            this.bomForm.patchValue({
              //sc_no : {id : data.bom.costing_id, sc_no : data.bom.sc_no},//set selected sc no
              bom_id : data.bom.bom_id,
              costing_id : data.bom.costing_id,
              fng_code : data.bom.finish_good.master_code,
              fng : data.bom.finish_good.master_description,
              country : data.bom.country.country_description,
              revision : data.bom.revision_no,
              status : data.bom.status,
              fabric_cost : data.bom.fabric_cost,
              elastic_cost  : data.bom.elastic_cost,
              trim_cost : data.bom.trim_cost,
              packing_cost : data.bom.packing_cost,
              other_cost : data.bom.other_cost,
              total_rm_cost : data.bom.total_rm_cost,
              epm : data.bom.epm,
              np_margin : data.bom.np_margin,
              total_smv : data.bom.total_smv,
              fob : data.bom.fob,
              fng_color : data.fng_color.color_code,
              currency_code : data.costing.currency_code,
              finance_charges : data.bom.finance_charges,
              cpm_factory : data.bom.cpm_factory,
              labour_cost : data.bom.labour_cost,
              coperate_cost : data.bom.coperate_cost
            })

            this.feature_component_count = data.feature_component_count //get component count
            this.feature_components = data.feature_components

            this.showEditButton = (data.bom.edit_status == 0 && data.bom.status == 'RELEASED') ? true : false
            //this.showExitButton = (data.bom.edit_status == 1) ? true : false
            this.showSaveButton = (data.bom.edit_status == 1 && data.bom.consumption_added_notification_status == 0) ? true : false
            this.showConfirmButton = (data.bom.consumption_required_notification_status == 0 && data.bom.consumption_added_notification_status == 0 && data.bom.edit_status == 1) ? true : false
            this.showSendButton = (data.bom.status == 'CONFIRM') ? true : false
            this.showNotifyButton = (data.bom.edit_status == 1 && data.bom.consumption_required_notification_status == 1) ? true : false

            //this.salesOrderDeliveries = headerData.deliveries
            //find the array index of selected delivery
            /*for(let x = 0 ; x < this.salesOrderDeliveries.length ; x++){
              if(data.bom.delivery_id == this.salesOrderDeliveries[x]['details_id']){
                //this.selectedDelivery = x //set selected delivery
                let _delivery = this.salesOrderDeliveries[x] //fill data from selected delivery
                this.bomForm.patchValue({
                  deliveries : x,
                  cus_style_manual : _delivery.cus_style_manual,
                  po_no : _delivery.po_no,
                  order_qty : _delivery.order_qty,
                  country_description : _delivery.country_description
                })
                //this.bomForm.get('deliveries').setValue(x) //set selected delivery
                break
              }
            }*/
            //load items
            this.dataRM = data.items //set items
            //const hotInstance = this.hotRegisterer.getInstance(this.tblRM);
            //hotInstance.render()
            setTimeout(() => {
              this.calculate_rm_cost()
              AppAlert.closeAlert()
            }, 500)

        },
        error => {
          this.processing = false
          console.log(error)
          AppAlert.closeAlert()
        }
      )
    }


    onDeliveryChange(e){
      //chek for unsaved data
      let hasUnsavedData = false
      for(let x = 0 ; x < this.dataRM.length ; x++){
        if(this.dataRM[x]['edited'] == true){//get only edited rows
           hasUnsavedData = true
           break
        }
      }
      //if has unsaved data asked to save them
      if(hasUnsavedData){
        AppAlert.showConfirm({
          'text' : 'You have unsaved data. Do you want to continue without saving data?'
        },(result) => {
          if (result.value) {
            //this.selectedDelivery = e.target.value //change current selected delivery id
          //  this.changeDelivery(this.selectedDelivery)
          }
          else{
          //  this.bomForm.get('deliveries').setValue(this.selectedDelivery)
            //this.selectedDelivery = e.target.value//change current selected delivery id
          }
        })
      }
      else{
        //this.selectedDelivery = e.target.value//change current selected delivery id
        this.changeDelivery(e.target.value)
      }
    }


    changeDelivery(_value){
      if(_value < 0) {
        this.bomForm.patchValue({
          cus_style_manual : null,
          po_no : null,
          order_qty : null,
          country_description : null
        })
        this.dataRM = [] //clearitem list
        this.isDeliverySelected = false //hide item table
      }
      else {
        this.processing = true
        AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading items')

        let _delivery = this.salesOrderDeliveries[_value]
        this.bomForm.patchValue({
          cus_style_manual : _delivery.cus_style_manual,
          po_no : _delivery.po_no,
          order_qty : _delivery.order_qty,
          country_description : _delivery.country_description
        })
        this.isDeliverySelected = true //view item table
      //  this.initializeTable()
        setTimeout(() => {
          this.loadItems(_delivery.details_id)
        },500)
      }
    }


    loadItems(_deliveryId) {
      this.http.get(this.apiUrl + 'merchandising/bom?type=items&delivery_id=' + _deliveryId)
      .subscribe(
        data => {
          this.processing = false
          this.dataRM = []
          this.dataRM = data['items']
          const hotInstance = this.hotRegisterer.getInstance(this.tblRM);
          hotInstance.render()
          AppAlert.closeAlert()
        },
        error => {
          this.processing = false
          AppAlert.closeAlert()
          console.log(error)
          AppAlert.showError({ text : 'Error occured while loading items' })
        }
      )
    }


    saveItem(_row){ //save single item
      let _itemData = this.dataRM[_row]
      /*if(this.validateData(_itemData) == false) //validate item
        return
      this.processing = true
      AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Saving...','Please wait while saving item')*/
    //  let saveOrUpdate$ = null;
      //if(_itemData.bom_detail_id <= 0){
      let saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/bom/save-item', { item_data : _itemData } );
      //}
      //else{
      //  saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/costing-items/' + _itemData.bom_detail_id , { item_data : _itemData });
      //}

      saveOrUpdate$.subscribe(
        (res) => {
            this.processing = false
            //this.snotifyService.success(res.data.message, this.tosterConfig)
            if(res['data']['status'] == 'success') {
              this.dataRM[_row] = res['data'].item
              //check bom header status
              this.showNotifyButton = (res['data']['bom']['edit_status'] == 1 && res['data']['bom']['consumption_required_notification_status'] == 1) ? true : false
              this.showSaveButton = (res['data'].bom.edit_status == 1 && res['data'].bom.consumption_added_notification_status == 0) ? true : false
              this.showConfirmButton = (res['data'].bom.consumption_required_notification_status == 0 && res['data'].bom.consumption_added_notification_status == 0 && res['data'].bom.edit_status == 1) ? true : false

              //set bom summery
              this.bomForm.patchValue({
                fabric_cost : res['data']['bom']['fabric_cost'],
                elastic_cost : res['data']['bom']['elastic_cost'],
                packing_cost : res['data']['bom']['packing_cost'],
                trim_cost : res['data']['bom']['trim_cost'],
                total_rm_cost : res['data']['bom']['total_rm_cost'],
                other_cost : res['data']['bom']['other_cost'],
                epm : res['data']['bom']['epm'],
                np_margin : res['data']['bom']['np_margin'],
              })

              const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
              hotInstance2.render()
              //setTimeout(() => {
                AppAlert.closeAlert()
                AppAlert.showSuccess({ text : res['data'].message})
            //  }, 500)
            }
            else {
              AppAlert.closeAlert()
              AppAlert.showError({ text : res['data'].message})
            }
        },
        (error) => {
          this.processing = false
          AppAlert.closeAlert()
          AppAlert.showError({ text: 'Process Error'})
          console.log(error)
        }
      );
    }


    saveAll() {
      this.processing = true
      AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Saving...','Please wait while saving items')
      let unsaved_items = []

      for(let x = 0 ; x < this.dataRM.length ; x++){
        if(this.dataRM[x]['edited'] == true){//get only edited rows
          //validate item data
          if(this.validateData(this.dataRM[x])){ //validate items
            //chek for duplicate items
            /*for(let y = 0 ; y < this.dataRM.length ; y++){
              if(x != y){
                if(this.dataRM[x]['inventory_part_id'] == this.dataRM[y]['inventory_part_id'] && this.dataRM[x]['color_code'] == this.dataRM[y]['color_code']){
                  this.processing = false
                  AppAlert.closeAlert()
                  AppAlert.showError({ text : 'Duplicate Item'})
                  return
                }
              }
            }*/
            unsaved_items.push(this.dataRM[x])
          }
          else{
            this.processing = false
            return
          }
        }
      }

      /*for(let x = 0 ; x < this.dataRM.length ; x++){
        if(this.dataRM[x]['edited'] == true){//get only edited rows
          if(this.validateData(this.dataRM[x])){ //validate items
            unsaved_items.push(this.dataRM[x])
          }
          else {
            this.processing = false
          //  setTimeout(() => { AppAlert.closeAlert() }, 500)
            return
          }
        }
      }*/

      if(unsaved_items.length > 0) {
        const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
        hotInstance2.validateCells((valid) => {
          if (valid) {
            this.saveItemData(unsaved_items)
          }
          else{
            this.processing = false
            AppAlert.closeAlert()
            AppAlert.showError({ html : '<span> Incorrect Item Details </span>'})
          }
        })
      }
      else{
        setTimeout(() => {
          this.processing = false
          AppAlert.closeAlert()
        }, 500)
      }
    }



    saveItemData(_data) {
      this.http.post(this.apiUrl + 'merchandising/bom/save-items', {items : _data})
      .pipe(map(res => res['data']))
      .subscribe(
        data => {
          this.processing = false
          AppAlert.closeAlert()
          if(data.status == 'success'){
            AppAlert.showSuccess({ text : data.message })
            this.dataRM = []
            this.dataRM = data.items

            //check bom header status
            this.showNotifyButton = (data.bom.consumption_required_notification_status == 1) ? true : false
            this.showSaveButton = (data.bom.edit_status == 1 && data.bom.consumption_added_notification_status == 0) ? true : false
            this.showConfirmButton = (data.bom.consumption_required_notification_status == 0 && data.bom.consumption_added_notification_status == 0 && data.bom.edit_status == 1) ? true : false

            //set bom summery
            this.bomForm.patchValue({
              fabric_cost : data.bom.fabric_cost,
              elastic_cost : data.bom.elastic_cost,
              packing_cost : data.bom.packing_cost,
              trim_cost : data.bom.trim_cost,
              total_rm_cost : data.bom.total_rm_cost,
              other_cost :  data.bom.other_cost,
              epm : data.bom['epm'],
              np_margin : data.bom['np_margin'],
            })

            const hotInstance = this.hotRegisterer.getInstance(this.tblRM);
            hotInstance.render()
          }
          else{
            AppAlert.showError({ text : data.message })
          }
        },
        error => {
          this.processing = false
          AppAlert.closeAlert()
          AppAlert.showError({ text : error })
        }
      )
    }


    validateSingleItem(_row) {
      this.processing = true
      AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Saving...','Please wait while saving item')
      let _rowData =  this.dataRM[_row]
      //console.log(_rowData)
      if(this.validateData(_rowData) == true) {
        //check for duplicate items
        /*for(let x = 0 ; x < this.dataRM.length ; x++){
          if(x != _row){
            if(_rowData['master_description'] == this.dataRM[x]['master_description'] && _rowData['color_code'] == this.dataRM[x]['color_code']){
              this.processing = false
              AppAlert.closeAlert()
              AppAlert.showError({ text : 'Duplicate Item'})
              return
            }
          }
        }
        this.saveItem(_row)*/
        const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);//run handson table inbuilt validation
        hotInstance2.validateCells( (valid) => {
          if (valid) {
           this.saveItem(_row)
          }
          else {
            setTimeout(() => {
            this.processing = false
            AppAlert.closeAlert()
             AppAlert.showError({ html : '<span> Incorrect Item Details </span>'})
            }, 500)
          }
        })
      }
    }


    validateData(_itemData) {//validate finish good item list
      let errCount = 0
      let str = ''
      if(_itemData.category_name == null || _itemData.category_name == ''){
        str += 'Incorrect item category name <br>'
        errCount++
      }
      if(_itemData.master_description == null || _itemData.master_description == ''){
        str += 'Incorrect master description <br>'
        errCount++
      }
      if(_itemData.uom_code == null || _itemData.uom_code == ''){
        str += 'Incorrect UOM <br>'
        errCount++
      }
      if(_itemData.supplier_name == null || _itemData.supplier_name == ''){
        str += 'Incorrect supplier <br>'
        errCount++
      }

      if(_itemData.origin_type == null || _itemData.origin_type == ''){
        str += 'Incorrect Origin Type <br>'
        errCount++
      }
      else if(_itemData.origin_type == 'IMPORT' && (_itemData.ship_mode == null || _itemData.ship_mode == '')){
        str += 'Incorrect ship mode <br>'
        errCount++
      }

      if(_itemData.meterial_type == null || _itemData.meterial_type == ''){
        str += 'Incorrect order type <br>'
        errCount++
      }
      if(_itemData.ship_mode == 'SEA' && (_itemData.ship_term_id == null || _itemData.ship_term_id == '')){
        str += 'Incorrect ship term <br>'
        errCount++
      }
      if(!this.validateNumber(_itemData.bom_unit_price)){
        str += 'Incorrect unit price <br>'
        errCount++
      }
      if(!this.validateNumber(_itemData.net_consumption)){
        str += 'Incorrect Net Consumption <br>'
        errCount++
      }
      if(!this.validateNumber(_itemData.wastage)){
        str += 'Incorrect Wastage <br>'
        errCount++
      }
      if(!this.validateNumber(_itemData.gross_consumption)){
        str += 'Incorrect gross consumption <br>'
        errCount++
      }
      if(!this.validateNumber(_itemData.freight_charges)){
        str += 'Incorrect Freight Chargers <br>'
        errCount++
      }
      if(!this.validateNumber(_itemData.mcq)){
        str += 'Incorrect MCQ <br>'
        errCount++
      }
      if(!this.validateNumber(_itemData.surcharge)){
        str += 'Incorrect Surcharge <br>'
        errCount++
      }
      if(!this.validateNumber(_itemData.total_cost)){
        str += 'Incorrect total cost <br>'
        errCount++
      }

      if(errCount > 0){
        AppAlert.closeAlert()
        AppAlert.showError({ html : '<span>' + str + '</span>'})
        return false
      }
      else {
        return true
      }
    }


    deleteItem(_id){ //delete single item
      AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Deleting...','Please wait while deleting item')

      this.http.post(this.apiUrl + 'merchandising/bom/remove-item', {bom_detail_id : _id} )
      .subscribe(res => {
          if(res['data']['status'] == 'success'){
            this.dataRM = res['data']['items']
            const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
            hotInstance2.render()

            this.bomForm.patchValue({
              fabric_cost : res['data']['bom']['fabric_cost'],
              elastic_cost : res['data']['bom']['elastic_cost'],
              packing_cost : res['data']['bom']['packing_cost'],
              trim_cost : res['data']['bom']['trim_cost'],
              total_rm_cost : res['data']['bom']['total_rm_cost'],
              other_cost : res['data']['bom']['other_cost'],
              epm : res['data']['bom']['epm'],
              np_margin : res['data']['bom']['np_margin'],
            })

            this.showNotifyButton = (res['data']['bom']['edit_status'] == 1 && res['data']['bom']['consumption_required_notification_status'] == 1) ? true : false
            this.showSaveButton = (res['data'].bom.edit_status == 1 && res['data'].bom.consumption_added_notification_status == 0) ? true : false
            this.showConfirmButton = (res['data'].bom.consumption_required_notification_status == 0 && res['data'].bom.consumption_added_notification_status == 0 && res['data'].bom.edit_status == 1) ? true : false

            setTimeout(() => {
              AppAlert.closeAlert()
              AppAlert.showSuccess({ text : res['data']['message'] })
            }, 500)
          }
          else {
            AppAlert.closeAlert()
            AppAlert.showError({ text : res['data']['message'] })
          }
        },
        error => {
          console.log(error)
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({ text : error})
          }, 500)
        }
      )
    }


    copyItem(_id){ //copy single item
      AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Copying...','Please wait while copying item')

      this.http.post(this.apiUrl + 'merchandising/bom/copy-item', {bom_detail_id : _id})
      .subscribe(res => {
        if(res['data']['status'] == 'success'){
          this.dataRM.push(res['data']['item'])
          const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
          hotInstance2.render()
          this.calculate_rm_cost()
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({ text : res['data']['message'] })
          }, 500)
        }
        else{
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({ text : 'Process Error'})
          }, 500)
        }
      },
      error => {
        console.log(error)
        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showError({ text : error})
        }, 500)
      }
     )
    }


    copyAllItemsFrom(_fromBomId, _toBomId){ //copy single item
      AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Copying...','Please wait while copying items')

      this.http.post(this.apiUrl + 'merchandising/bom/copy-all-items-from', {from_bom_id : _fromBomId, to_bom_id : _toBomId})
      .subscribe(res => {
        if(res['status'] == 'success'){
          //load table
          this.dataRM = res['items']
          const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
          hotInstance2.render()
          //this.calculate_rm_cost()
          this.bomForm.patchValue({
            fabric_cost : res['bom']['fabric_cost'],
            elastic_cost : res['bom']['elastic_cost'],
            packing_cost : res['bom']['packing_cost'],
            trim_cost : res['bom']['trim_cost'],
            total_rm_cost : res['bom']['total_rm_cost'],
            other_cost : res['bom']['other_cost'],
            epm : res['bom']['epm'],
            np_margin : res['bom']['np_margin']
          })

          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({ text : res['message'] })
          }, 500)
        }
        else {
          AppAlert.closeAlert()
          AppAlert.showError({ text : res['message']})
        }
      },
      error => {
        console.log(error)
        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showError({ text : error})
        }, 500)
      }
     )
    }


    clearAllData(){
      this.bomForm.reset()
      this.dataRM = []
      //this.selectedDelivery = -1
      this.isDeliverySelected = false
      this.processing  = false
    }


    edit(){
      AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading edit mode')
      this.http.post(this.apiUrl + 'merchandising/bom/edit-mode', {bom_id : this.bomForm.get('bom_id').value, edit_status : 1})
      .subscribe(
        res => {
          if(res['status'] == 'success'){
            this.showEditButton = false
            this.showSaveButton = true
            this.showConfirmButton = true
            this.showSendButton = false
            AppAlert.closeAlert()
          }
          else {
            AppAlert.closeAlert()
            AppAlert.showError({ text : res['message'] })
          }
        },
        error => {
          console.log(error)
          AppAlert.closeAlert()
          AppAlert.showError({text : 'Error occured while loading edit mode'})
        }
      )
    }


    confirmBom(){
      AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Waiting...','Please wait while confirm bom.')
      this.http.post(this.apiUrl + 'merchandising/bom/confirm-bom', {bom_id : this.bomForm.get('bom_id').value})
      .subscribe(
        res => {
          if(res['status'] == 'success'){

            this.showEditButton = (res['bom'].edit_status == 0 && res['bom'].status == 'RELEASED') ? true : false
            //this.showExitButton = (res['bom'].edit_status == 1) ? true : false
            this.showSaveButton = (res['bom'].edit_status == 1 && res['data'].bom.consumption_added_notification_status == 0) ? true : false
            this.showConfirmButton = (res['bom'].consumption_required_notification_status == 0 && res['bom'].consumption_added_notification_status == 0 && res['bom'].edit_status == 1) ? true : false
            this.showSendButton = (res['bom'].status == 'CONFIRM') ? true : false
            this.showNotifyButton = (res['bom'].edit_status == 1 && res['bom'].consumption_required_notification_status == 1) ? true : false

            this.bomForm.patchValue({ status : res['bom']['status'], revision : res['bom']['revision_no'] })
            AppAlert.closeAlert()
            AppAlert.showSuccess({ text : res['message'] })
          }
          else {
            AppAlert.closeAlert()
            AppAlert.showError({ text : res['message'] })
          }
        },
        error => {
          console.log(error)
          AppAlert.closeAlert()
          AppAlert.showError({text : 'Error occured while confirm bom'})
        }
      )
    }


    sendForApproval(){
      AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Waiting...','Please wait while sending for approval.')
      this.http.post(this.apiUrl + 'merchandising/bom/send-for-approval', {bom_id : this.bomForm.get('bom_id').value})
      .subscribe(
        res => {
          if(res['status'] == 'success'){
            this.showEditButton = false
            this.showSaveButton = false
            this.showConfirmButton = false
            this.showSendButton = false

            this.bomForm.patchValue({ status : res['bom']['status']})
            AppAlert.closeAlert()
            AppAlert.showSuccess({ text : res['message'] })
          }
          else {
            AppAlert.closeAlert()
            AppAlert.showError({ text : res['message'] })
          }
        },
        error => {
          console.log(error)
          AppAlert.closeAlert()
          AppAlert.showError({text : 'Error occured while sending for approval'})
        }
      )
    }


    exitEditMode(){
      AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Exit...','Please wait while exit from edit mode')
      this.http.post(this.apiUrl + 'merchandising/bom/edit-mode', {bom_id : this.bomForm.get('bom_id').value, edit_status : 0})
      .subscribe(
        res => {
          if(res['status'] == 'success'){
            this.showEditButton = false
            AppAlert.closeAlert()
          }
          else {
            AppAlert.closeAlert()
            AppAlert.showError({ text : res['message'] })
          }
        },
        error => {
          console.log(error)
          AppAlert.closeAlert()
          AppAlert.showError({text : 'Error occured while exit from edit mode'})
        }
      )
    }

    //Notifications ..............................................................

    notifyCadTeam(){
      AppAlert.showConfirm({
        'text' : 'Do you want to notify CAD / IE team?'
      },(result) => {
          if (result.value) {
            this.processing = true
            this.http.post(this.apiUrl + 'merchandising/bom/notify-cad-team', {bom_id : this.bomForm.get('bom_id').value})
            .subscribe(
              res => {
                this.processing = false
                if(res['status'] == 'success') {
                  //this.canNotifyCadTeam = false
                  this.showSaveButton = (res['bom'].edit_status == 1 && res['bom'].consumption_added_notification_status == 0) ? true : false
                  this.showConfirmButton = (res['bom'].consumption_required_notification_status == 0 && res['bom'].consumption_added_notification_status == 0 && res['bom'].edit_status == 1) ? true : false
                  this.showNotifyButton = (res['bom'].edit_status == 1 && res['bom'].consumption_required_notification_status == 1) ? true : false

                  AppAlert.showSuccess({ text : res['message'] })
                }
                else {
                  AppAlert.showError({ text : res['message'] })
                }
              },
              error => {
                this.processing = false
              }
            )
          }
        }
      )
    }

    //utility functions.........................................................

    formatDecimalNumber(_number, _places){
    //  let p = Math.pow(10, _places)
    //  return Math.ceil(_number * p) / p
    let num_val = parseFloat(_number+'e'+_places)//_number.toExponential(2)
    return Number(Math.round(num_val)+'e-'+_places);
    }

    countDecimals(_val) {
     if(Math.floor(_val) === _val) return 0;
     return _val.toString().split(".")[1].length || 0;
    }


    validateNumber(_value){
      if(_value === null || _value === ''){
        return false
      }
      else if(_value == 0){
        return true
      }
      else if(typeof _value != 'number'){
        if(isNaN(_value)){
          return false
        }
        else{
          return true
        }
      }
      else{
        return true
      }
    }



    test(){
      const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
      hotInstance2.render()
      console.log(hotInstance2.getDataAtCell(2,5))
    }



}
