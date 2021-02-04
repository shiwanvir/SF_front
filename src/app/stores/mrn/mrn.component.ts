import {Component, OnInit} from '@angular/core';
import { Title } from '@angular/platform-browser';
import {FormBuilder, FormGroup, FormControl, Validators, FormArray} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
//import {map} from 'rxjs/operators';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
import { MRNService } from './mrn.service';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';
//third pirt routingComponents
declare var $: any;

import {AppFormValidator} from '../../core/validation/app-form-validator';
import {AppValidator} from '../../core/validation/app-validator';
import {BasicValidators} from '../../core/validation/basic-validators';
import {AppAlert} from '../../core/class/app-alert';
import {AppConfig} from '../../core/app-config';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
//import { debounceTime } from 'rxjs/internal/operators/debounceTime';
//import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
//import { tap } from 'rxjs/internal/operators/tap';
//import { switchMap } from 'rxjs/internal/operators/switchMap';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { ViewChild } from '@angular/core';
@Component({
    selector: 'app-mrn',
    templateUrl: './mrn.component.html',
    styleUrls: ['./mrn.component.css']
})
export class MrnComponent implements OnInit {
  constructor(private http: HttpClient,private mrnService: MRNService, private fb: FormBuilder, private titleService: Title,private hotRegisterer: HotTableRegisterer,private layoutChangerService : LayoutChangerService) {
  }
    modalGroup: FormGroup
    mrnGroup: FormGroup
    modelTitle: string = "New Style MRN"
    readonly apiUrl = AppConfig.apiUrl()
    appValidator: AppValidator
    formValidator: AppFormValidator
    datatable: any = null
    saveStatus = 'SAVE'
    initialized: boolean = false
    loading: boolean = false
    dissableSerachButton: boolean = true
    loadingCount: number = 0
    processing: boolean = false
    currentDataSetIndex : number = -1
    instance: string = 'instance';
    hotOptions: any
    dataset: any[] = [];

    instanceSearchBox: string = 'instanceSearchBox';
    //instanceDetails: string = 'instanceDetails';
    hotOptionsSearchBox: any
    datasetSearchBox: any[] = [];


    itemFormValidator : AppFormValidator = null

    location$: Observable<any[]>;//use to load location list in ng-select
    locationLoading = false;
    locationInput$ = new Subject<string>();
    selectedLocation: any[]

    section$: Observable<any[]>;//use to load Section list in ng-select
    sectionLoading = false;
    sectionInput$ = new Subject<string>();
    selectedSection: any[]

    requestType$: Observable<any[]>;//use to load requestType list in ng-select
    requestTypeLoading = false;
    requestTypeInput$ = new Subject<string>();
    selectedRequestType: any[]

    styleNo$: Observable<any[]>;
    styleNoLoading = false;
    styleNoInput$ = new Subject<string>();
    selectedStyleNo: any[]

    itemCodeFilter$: Observable<any[]>;//use to load main category list in ng-select
    itemCodefilterLoading = false;
    itemCodefilterInput$ = new Subject<string>();
    selecteditemCodefilter: any[]

    customerPoFilter$: Observable<any[]>;
    customerPoFilterLoading = false;
    customerPoFilterInput$ = new Subject<string>();
    selectedCustomerPoFilter: any[]

    shopOrderFlter$: Observable<any[]>;
    shopOrderFilterLoading = false;
    shopOrderFilterInput$ = new Subject<string>();
    selectedShopOrderFilter: any[]

    shopOrder$: Observable<any[]>;//use to load customer list in ng-select
    shopOrderLoading = false;
    shopOrderInput$ = new Subject<string>();
    selectedShopOrder: Location[]

    grnTypelist$: Observable<any[]>;//use to load customer list in ng-select
    grnTypeLoading = false;
    grnTypeInput$ = new Subject<string>();
    selectedGrnType: any[]

    itemCode$: Observable<any[]>;//use to load main category list in ng-select
    itemCodeLoading = false;
    itemCodeInput$ = new Subject<string>();
    selecteditemCode: any[]
    isManul=false;


  @ViewChild('potabs') potabs: TabsetComponent;
    formFields = {
        mrn_no: '',
        loc_name: '',
        sec_name: '',
        line_no: '',
        request_type: '',
        category_name: '',
        subcategory_name: '',
        style_no: '',
        sc: '',
        so_no:'',
        so_detail_id:'',
        customer_po: '',
        validation_error: '',
        order_qty:'',
        cut_qty:'',
        shop_order_id:'',
        grn_type_code:'',
        item_code:''


    }



    ngOnInit() {
        this.titleService.setTitle("Style MRN")//set page title

        this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
          if(data == false){return;}
              const hotInstance = this.hotRegisterer.getInstance(this.instance);
              if(hotInstance != undefined && hotInstance != null){
                hotInstance.render(); //refresh fg items table
              }

        })


        this.layoutChangerService.changeHeaderPath([
          'Warehouse Management',
          'Stores',
          'Style MRN'
        ])
        let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
        this.section$ = this.loadSection()

        this.mrnGroup = this.fb.group({ // create the form
            mrn_id:0,
            mrn_no: [0,[Validators.required]],
            grn_type_code: [null, [Validators.required]],
            sec_name: [null,[Validators.required]],
            item_code:[],
            style_no: [null],
            request_type: [null,[Validators.required]],
            line_no:[null],
            cut_qty:[null,[Validators.required,PrimaryValidators.isNumber]],
            shop_order_id: [null],
          /*  so_no:[],
            so_detail_id:[],
            line_no:[],
            category_code:  [null, [Validators.required]],
            sub_category_code: [null, [Validators.required]],
            req_qty: [null, [Validators.required]],
            customer_po:[null, [Validators.required]],
            color:[null, [Validators.required]],*/

        })

        this.appValidator = new AppValidator(this.formFields,{},this.mrnGroup);
        this.mrnGroup.valueChanges.subscribe(data => { //validate form when form value changes
        //  debugger
          this.mrnGroup
          this.appValidator.validate();
        });

        this.mrnGroup.get("mrn_no").disable()
        this.modalGroup = this.fb.group({ // create the form
            filter_id: [],
            shop_order_filter: [],
            item_code_filter: [],
            customer_po_filter: [],
                })
        this.loadRequestType();
        //this.loadSalesOrderNO();
        //this.loadSalesOrderDetailsIDs();
        //this.loadMainCategoryList();
        this.loadStylesList();
        this.loadItemFilter();
        this.loadShopOrder();
        this.initializeDetailsTable();
        this.initializeSearchBoxTable();
        this.loadCustomerPo();
        this.loadShopOrderFrom();
        this.loadGrnType()
        this.loadItemCode()

          this.itemFormValidator = new AppFormValidator(this.mrnGroup, {})
          this.mrnService.mrnData.subscribe(data=>{
            //
        if(data!=null){
          this.clearData()
          this.dataset=data.dataDetails
          if(data.mrn_type=="AUTO"){
          this.mrnGroup.setValue({
              'mrn_id':data.dataHeader.mrn_id,
              'mrn_no':data.dataHeader.mrn_no,
              'sec_name':data.section,
              'line_no':data.dataHeader.line_no,
              'request_type':data.requestType,
              'style_no':data.style,
              'cut_qty':data.dataHeader.cut_qty,
              'shop_order_id':data.shopOrderId,
              'grn_type_code':data.dataHeader,
              'item_code':null

          })
        }

        else if(data.mrn_type=="MANUAL"){
        this.mrnGroup.setValue({
            'mrn_id':data.dataHeader.mrn_id,
            'mrn_no':data.dataHeader.mrn_no,
            'sec_name':data.section,
            'line_no':data.dataHeader.line_no,
            'request_type':data.requestType,
            'style_no':data.style,
            'cut_qty':data.dataHeader.cut_qty,
            'shop_order_id':data.shopOrderId,
            'grn_type_code':data.dataHeader,
            'item_code':data.dataDetails[0],

        })
      }
          this.mrnGroup.disable()
        }
          })
    }

    formValidate(){ //validate the form on input blur event
      this.appValidator.validate();
    }


    initializeDetailsTable(){
      var clipboardCache = '';
    //var sheetclip = new sheetclip();
      this.hotOptions = {
        columns: [
          { type: 'text', title : 'Shop Order ID' , data: 'shop_order_id',className: "htLeft"},
          { type: 'text', title : 'Shop Order Detail ID' , data: 'shop_order_detail_id',className: "htLeft"},
          { type: 'text', title : 'Item Code' , data: 'master_code',className: "htLeft"},
          { type: 'text', title : 'Item Description' , data: 'master_description',className: "htLeft"},
          { type: 'text', title : 'Item Color' , data: 'color_name',className: "htLeft"},
          { type: 'text', title : 'Size' , data: 'size_name',className: "htLeft"},
          { type: 'text', title : 'Purchase UOM' , data: 'uom_code',className: "htLeft"},
          { type: 'text', title : 'Inventory UOM' , data: 'inventory_uom',className: "htLeft"},
          { type: 'text', title : 'Gross Consumption' , data: 'gross_consumption',className: "htRight"},
          { type: 'text', title : 'Wastage%' , data: 'wastage',className: "htRight"},
          { type: 'numeric', title : 'Order Qty' , data: 'order_qty',className: "htRight"},
          { type: 'numeric', title : 'Required Qty' , data: 'required_qty',className: "htRight"},
          { type: 'numeric', title : 'Requested Qty' , data: 'requested_qty',readOnly: false,className: "htRight"},
          { type: 'numeric', title : 'Shop Order Assign Qty' , data: 'asign_qty',className: "htRight"},
          { type: 'numeric', title : 'Balance to Issue' , data: 'balance_to_issue_qty',className: "htRight"},
          { type: 'numeric', title : 'Stock Qty' , data: 'total_qty',className: "htRight"},


        ],
        manualColumnResize: true,
        autoColumnSize : true,
        rowHeaders: true,
        colHeaders: true,
        //nestedRows: true,
        height: 250,
        copyPaste: true,
        stretchH: 'all',
        selectionMode: 'range',
        fixedColumnsLeft: 3,
        /*columnSorting: true,*/
        className: 'htCenter htMiddle',
        readOnly: true,
        mergeCells:[],
        afterChange:(changes,surce,row,col,value,prop)=>{

          let x=this.dataset;
          //assss
          if(surce != null && surce.length > 0){
            //debugger
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          let _row = surce[0][0]
          if(surce[0][1]=='requested_qty'){
              let _qty = (surce[0][3] == '' || isNaN(surce[0][3])) ? 0 : surce[0][3]
            if(this.countDecimals(_qty) > 4){
              _qty = this.formatDecimalNumber(_qty, 4)

            }
            this.dataset[_row]['requested_qty']=_qty
            if(this.dataset[_row]['requested_qty']>this.dataset[_row]['asign_qty']&&this.dataset[_row]['asign_qty']>=0){
              AppAlert.showError({text:"Qty Exceed the Assign Qty"})
              this.dataset[_row]['requested_qty']=0;
            }
            else if(this.dataset[_row]['requested_qty']>this.dataset[_row]['total_qty']){
                    AppAlert.showError({text:"Qty Exceed the Stock Qty"})
                    this.dataset[_row]['requested_qty']=0;
                  }
            hotInstance.render()
          }

        }


            },
          afterCreateRow:(index,amount,source)=>{
            //console.log(index);




          },
          afterPaste:(changes)=>{

              const hotInstance = this.hotRegisterer.getInstance(this.instance);
                hotInstance.render();
                console.log('im here.....')
                console.log(this.dataset)
          },

        cells : function(row, col, prop , value){ //table cell render event. works for every cell in the table
          var cellProperties = {};
          //var data = this.dataset;//this.instance.getData();
          if(col == 1){
            cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
              var args = arguments;
              if(prop == 'type_created' && value == 'GFM'){
                td.style.background = '#ffcccc';
              }
              else if(prop == 'type_created' && value == 'GFS'){
                td.style.background = '#b3ff66';
              }
              Handsontable.renderers.TextRenderer.apply(this, args);
            }
          }

          return cellProperties;
        },
        contextMenu : {
            callback: function (key, selection, clickEvent) {
              // Common callback for all options
            },
            items : {

              'delete' : {
                name : 'Delete',
                disabled: function (key, selection, clickEvent) {
                  // Disable option when first row was clicked
                  return this.getSelectedLast() == undefined // `this` === hot3
                },
                callback : (key, selection, clickEvent) => {
                  if(selection.length > 0){
                    let start = selection[0].start;
                    this.contextMenuDeletemainDataset(start.row)
                  }
                }
              },


            }
        }
      }
    }


        initializeSearchBoxTable(){
          var clipboardCache = '';
        //var sheetclip = new sheetclip();
          this.hotOptionsSearchBox = {
            columns: [
              //{ type: 'checkbox', title : 'Action' , readOnly: false, data : 'connected' , checkedTemplate: 1,  uncheckedTemplate: 0 },
              { type: 'text', title : 'Shop Order ID' , data: 'shop_order_id',className: "htLeft"},
              { type: 'text', title : 'Shop Order Detail ID' , data: 'shop_order_detail_id',className: "htLeft"},
              { type: 'text', title : 'Item Code' , data: 'master_code',className: "htLeft"},
              { type: 'text', title : 'Item Description' , data: 'master_description',className: "htLeft"},
              { type: 'text', title : 'Item Color' , data: 'color_name',className: "htLeft"},
              { type: 'text', title : 'Size' , data: 'size_name',className: "htLeft"},
              { type: 'text', title : 'Purchase UOM' , data: 'uom_code',className: "htLeft"},
              { type: 'text', title : 'Inventory UOM' , data: 'inventory_uom',className: "htLeft"},
              { type: 'text', title : 'Gross Consumption' , data: 'gross_consumption',className: "htRight"},
              { type: 'text', title : 'Wastage%' , data: 'wastage',className: "htRight"},
              { type: 'numeric', title : 'Order Qty' , data: 'order_qty',className: "htRight"},
              { type: 'numeric', title : 'Required Qty' , data: 'required_qty',className: "htRight"},
              //{ type: 'numeric', title : 'Requested Qty' , data: 'requested_qty',readOnly: false},
              { type: 'numeric', title : 'Shop Order Assigned Qty' , data: 'asign_qty',className: "htRight"},
              { type: 'numeric', title : 'Balance to Issue' , data: 'balance_to_issue_qty',className: "htRight"},
              { type: 'numeric', title : 'Stock Qty' , data: 'total_qty',className: "htRight"},

//
            ],
            manualColumnResize: true,
            autoColumnSize : true,
            rowHeaders: true,
            colHeaders: true,
            //nestedRows: true,
            height: 250,
            copyPaste: true,
            stretchH: 'all',
            selectionMode: 'range',
            fixedColumnsLeft: 3,
            /*columnSorting: true,*/
            className: 'htCenter htMiddle',
            readOnly: true,
            mergeCells:[],
            afterChange:(changes,surce,row,col,value,prop)=>{


                },
              afterCreateRow:(index,amount,source)=>{
                //console.log(index);

                let x=this.dataset;



              },
              afterPaste:(changes)=>{

                  const hotInstance = this.hotRegisterer.getInstance(this.instance);
                    hotInstance.render();
                    console.log('im here.....')
                    console.log(this.dataset)
              },

            cells : function(row, col, prop , value){ //table cell render event. works for every cell in the table
              var cellProperties = {};
              //var data = this.dataset;//this.instance.getData();
              if(col == 1){
                cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
                  var args = arguments;
                  if(prop == 'type_created' && value == 'GFM'){
                    td.style.background = '#ffcccc';
                  }
                  else if(prop == 'type_created' && value == 'GFS'){
                    td.style.background = '#b3ff66';
                  }
                  Handsontable.renderers.TextRenderer.apply(this, args);
                }
              }

              return cellProperties;
            },
            contextMenu : {
                callback: function (key, selection, clickEvent) {
                  // Common callback for all options
                },
                items : {

                  'delete' : {
                    name : 'Delete',
                    disabled: function (key, selection, clickEvent) {
                      // Disable option when first row was clicked
                      return this.getSelectedLast() == undefined // `this` === hot3
                    },
                    callback : (key, selection, clickEvent) => {
                      if(selection.length > 0){
                        let start = selection[0].start;
                        this.contextMenuDelete(start.row)
                      }
                    }
                  },

                 'Add Line':{
                    name:'Add Line',
                    disabled: function (key, selection, clickEvent){
                       // Disable option when first row was clicked
                       console.log("im firing")
                       console.log(selection)
                       console.log(this.getSelectedLast()[1])
                      // var line=this.getSelectedLast()[1]
                       //return this.checkCopyStatus()==false
                       //this.testMethod(line, selection, clickEvent)
                       //console.log(this.dataset)
                       //const hotInstance = this.hotRegisterer.getInstance(this.instance);
                       //console.log(this.instance)
                       return this.getSelectedLast()[1]==0

                     },
                    callback:(key, selection, clickEvent)=> {
                     this.addLine(key, selection, clickEvent)


                    }

                  },


      //

                  /*'remove_row' : {
                    name : 'Remove Delivery',
                    callback : (key, selection, clickEvent) => {
                      if(selection.length > 0){
                        let start = selection[0].start;
                        this.contextMenuRemove(start.row)
                      }
                    }
                  }*/
                }
            }
          }
        }



        addLine(key, selection, clickEvent){
        //debugger
          var addAll=0
        var row =selection[0]['end']['row']
        console.log(this.dataset[row])
        /*
        for(var i=0;i<this.dataset.length;i++){
          if(this.dataset[i]['checked']=!undefined && this.dataset[i]['checked']==1){
            addAll=1
            break;
          }
        }*/
        if(addAll==1){
        /*  for(var j=0;j<this.dataset.length;j++){
              for(var i=0;i<this.datasetDetails.length;i++){

                if(this.datasetDetails[i]['id']==this.dataset[j]['id']){
                //this.snotifyService.error("Can't Delete", this.tosterConfig);
                break
                }
                if(this.datasetDetails[i]['id']!=this.dataset[j]['id']){
                   var ab=this.findId(this.dataset[j]['id'])
                if(ab==true){
                this.dataset[j]['bal_qty']=0
                this.datasetDetails.push(this.dataset[j])
                this.dataset.splice(j,1);
                this.dataset.length
                this.dataset
                break
              }
              }
              }



          }
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          hotInstance.render();*/
        }

        if(addAll==0){

          let formData = this.mrnGroup.getRawValue();
        var grn_type=formData['grn_type_code']['grn_type_code']
        for(var i=0;i<this.dataset.length;i++){
          if(grn_type=="AUTO"){
          if(this.dataset[i]['shop_order_detail_id']==this.datasetSearchBox[row]['shop_order_detail_id']){
          AppAlert.showError({text:"Line Already Added"})

          return 0;

        }
      }
      else if(grn_type=="MANUAL"){
      if(this.dataset[i]['inventory_part_id']==this.datasetSearchBox[row]['inventory_part_id']){
      AppAlert.showError({text:"Line Already Added"})

      return 0;

    }
  }
    }
      //  debugger

        var cut_qty=formData['cut_qty'];
      if(grn_type=="AUTO"){
        var _qty =(cut_qty)*parseFloat(this.datasetSearchBox[row]['gross_consumption'])
        this.datasetSearchBox[row]['requested_qty']=this.formatDecimalNumber(_qty, 4)
      }
      else if(grn_type="MANUAL"){
        this.datasetSearchBox[row]['requested_qty']=this.formatDecimalNumber(cut_qty, 4)
      }
        this.dataset.push(this.datasetSearchBox[row])

        if(selection.length > 0){
          let start = selection[0].start;
          this.contextMenuDelete(start.row)
        }

        }

        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        hotInstance.render();
        addAll=0



        }

        contextMenuDelete(row){
          let selectedRowData = this.datasetSearchBox[row]
          this.currentDataSetIndex = row
          this.datasetSearchBox.splice(row,1);
          console.log(this.dataset);
          const hotInstance = this.hotRegisterer.getInstance(this.instanceSearchBox);
          hotInstance.render();



        }

        contextMenuDeletemainDataset(row){
          let selectedRowData = this.dataset[row]
          this.currentDataSetIndex = row
          this.dataset.splice(row,1);
          console.log(this.dataset);
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          hotInstance.render();



        }

    loadSection(): Observable<Array<any>> {
        return this.http.get<any[]>(this.apiUrl + 'org/sections?active=1$fields=section_name,section_id')
            .pipe(map(res => res['data']))
    }

    loadCustomerPo(){

      this.customerPoFilter$= this.customerPoFilterInput$
      .pipe(
         debounceTime(200),
         distinctUntilChanged(),
         tap(() => this.customerPoFilterLoading = true),
         switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/customer-order-details?type=auto' , {params:{search:term}})
         .pipe(
             //catchError(() => of([])), // empty list on error
             tap(() => this.customerPoFilterLoading = false)
         ))
      );


    }
loadShopOrder(){

  this.shopOrderFlter$ = this.shopOrderFilterInput$
  .pipe(
     debounceTime(200),
     distinctUntilChanged(),
     tap(() => this.shopOrderFilterLoading = true),
     switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/shop-orders?type=auto' , {params:{search:term}})
     .pipe(
         //catchError(() => of([])), // empty list on error
         tap(() => this.shopOrderFilterLoading = false)
     ))
  );

}

loadShopOrderFrom(){
//debugger
  this.shopOrder$ = this.shopOrderInput$
  .pipe(
     debounceTime(200),
     distinctUntilChanged(),
     tap(() => this.shopOrderLoading = true),
     switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/shop-orders?type=auto' , {params:{search:term}})
     .pipe(
         //catchError(() => of([])), // empty list on error
         tap(() => this.shopOrderLoading = false)
     ))
  );

}

changeFiledsSettings(){
  this.resetOtherFields()
}

resetOtherFields(){
  //debugger
this.selectedStyleNo=null;
this.selecteditemCode=null;
this.selectedShopOrder=null;
var fomData=this.mrnGroup.getRawValue()
var mrn_code=fomData['grn_type_code']['grn_type_code']
if(mrn_code=="AUTO"){
  this.mrnGroup.get('item_code').disable()
  this.mrnGroup.get('style_no').enable()
  this.mrnGroup.get('shop_order_id').enable()
}
else if(mrn_code=="MANUAL"){
  this.mrnGroup.get('style_no').disable()
  this.mrnGroup.get('shop_order_id').disable()
  this.mrnGroup.get('item_code').enable()
}

}

changeSearchButtonStatus(){
  //debugger
  this.dissableSerachButton=true
  var fomData=this.mrnGroup.getRawValue()
  if(fomData['grn_type_code']!=undefined){
  var mrn_code=fomData['grn_type_code']['grn_type_code']
  if(mrn_code==undefined){
    this.dissableSerachButton=true
  }
  else if(mrn_code!=undefined){

  var x=  fomData['shop_order_id']
  if(mrn_code=="AUTO"){
    this.isManul=false;
    if(fomData['grn_type_code']!=null&&fomData['request_type']!=null&&fomData['style_no']!=null&&fomData['shop_order_id']!=null&&fomData['cut_qty']!=null&&fomData['sec_name']!=null)
    this.dissableSerachButton=false
  }
  if(mrn_code=="MANUAL"){
    this.isManul=true;
    if(fomData['grn_type_code']!=null&&fomData['request_type']!=null&&fomData['item_code']!=null&&fomData['cut_qty']!=null&&fomData['sec_name']!=null)
    this.dissableSerachButton=false
  }
}
}
}
    searchItems(e){
        var dataArr =  this.modalGroup.value;
        this.http.post(this.apiUrl + 'stores/load-stock-for-mrn', dataArr).subscribe(data => {
            var count = Object.keys(data['data']).length;

            for (var i = 0; i < count; i++) {
                const controll = new FormGroup({
                    'item_code': new FormControl(data['data'][i]['master_id']),
                    'description': new FormControl(data['data'][i]['master_description']),
                    'color': new FormControl(data['data'][i]['color_name']),
                    'size': new FormControl(data['data'][i]['size_name']),
                    'cus_po': new FormControl(data['data'][i]['po_no']),
                    'uom': new FormControl(data['data'][i]['uom_code']),
                    'avl_qty': new FormControl(data['data'][i]['qty'])
                });
            }
            //(<FormArray>this.modalGroup.get('item_list')).push(controll);
        })

    }

    loadGrnType(){

      this.grnTypelist$ = this.grnTypeInput$
      .pipe(
         debounceTime(200),
         distinctUntilChanged(),
         tap(() => this.grnTypeLoading = true),
         switchMap(term => this.http.get<any[]>(this.apiUrl + 'stores/grn?type=load_grn_type' , {params:{search:term}})
         .pipe(
             //catchError(() => of([])), // empty list on error
             tap(() => this.grnTypeLoading = false)
         ))
      );
    }

    showEvent(e) {
        this.styleNo$ = this.http.get(this.apiUrl + 'merchandising/style?status=1&fields=style_id,style_no&type=select', ).pipe( map( res => res['data']) )
    }

    loadSCList(){
        //this.sc$ = this.http.get(this.apiUrl + 'merchandising/customer-orders?fields=order_id,order_code', ).pipe( map( res => res['data']) )
    }

    loadRequestType(){

      this.requestType$ = this.requestTypeInput$
      .pipe(
         debounceTime(200),
         distinctUntilChanged(),
         tap(() => this.requestTypeLoading = true),
         switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/requestType?type=auto' , {params:{search:term}})
         .pipe(
             //catchError(() => of([])), // empty list on error
             tap(() => this.requestTypeLoading = false)
         ))
      );
     }
  /*    loadSalesOrderNO(){
        this.soNo$ = this.soNoInput$
        .pipe(
           debounceTime(200),
           distinctUntilChanged(),
           tap(() => this.soNoLoading = true),
           switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/customer-orders?type=auto' , {params:{search:term}})
           .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.soNoLoading = false)
           ))
        );
      }*/

  /*    loadSalesOrderDetailsIDs(){
        this.soDetailId$ = this.soDetailIdInput$
        .pipe(
           debounceTime(200),
           distinctUntilChanged(),
           tap(() => this.soDetailIdLoading = true),
           switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/customer-order-details?type=auto_detail_id' , {params:{search:term}})
           .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.soDetailIdLoading = false)
           ))
        );
      }*/

    /*  loadMainCategoryList(){
        this.mainCategory$ = this.http.get<any[]>(this.apiUrl + "merchandising/item-categories").pipe(map(res => res['data']));
      }

      loadSubCategory(_category){
            this.subCategory$ = this.http.get<any[]>(this.apiUrl + 'merchandising/item-sub-categories?type=sub_category_by_category', {params:{'category_id':_category}})
        .pipe(map(res => res['data']));
      }
*/
      loadStylesList(){
      //  debugger
        this.styleNo$ = this.styleNoInput$
        .pipe(
           debounceTime(200),
           distinctUntilChanged(),
           tap(() => this.styleNoLoading = true),
           switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/customer-orders?type=style' , {params:{search:term}})
           .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.styleNoLoading = false)
           ))
        );
      }

      loadItemFilter(){
        this.itemCodeFilter$= this.itemCodefilterInput$
        .pipe(
           debounceTime(200),
           distinctUntilChanged(),
           tap(() => this.itemCodefilterLoading = true),
           switchMap(term => this.http.get<any[]>(this.apiUrl + 'store/mrn?type=items_for_manual_mrn' , {params:{search:term}})
           .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.itemCodefilterLoading = false)
           ))
        );

      }

      loadItemCode(){
        this.itemCode$= this.itemCodeInput$
        .pipe(
           debounceTime(200),
           distinctUntilChanged(),
           tap(() => this.itemCodeLoading = true),
           switchMap(term => this.http.get<any[]>(this.apiUrl + 'store/mrn?type=items_for_manual_mrn' , {params:{search:term}})
           .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.itemCodeLoading = false)
           ))
        );

      }
      //load styles list
    /*  loadStyles() {
           this.style$ = this.styleInput$
           .pipe(
              debounceTime(200),
              distinctUntilChanged(),
              tap(() => this.styleLoading = true),
              switchMap(term => this.http.get<Style[]>(this.apiUrl + 'merchandising/customer-orders?type=style' , {params:{search:term}})
              .pipe(
                  //catchError(() => of([])), // empty list on error
                  tap(() => this.styleLoading = false)
              ))
           );
       }


  /*    loadCustomerPo(){

        this.customerPo$= this.customerPoInput$
        .pipe(
           debounceTime(200),
           distinctUntilChanged(),
           tap(() => this.customerPoLoading = true),
           switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/customer-order-details?type=auto' , {params:{search:term}})
           .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.customerPoLoading = false)
           ))
        );


      }

      loadColor(){

        this.color$ = this.colorInput$
        .pipe(
           debounceTime(200),
           distinctUntilChanged(),
           tap(() => this.colorLoading = true),
           switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/colors?type=auto' , {params:{search:term}})
           .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.colorLoading = false)
           ))
        );


      }*/
      searchDetails(){
        //debugger
          let search$ = null;
          //this.dataset=[];
          const hotInstance = this.hotRegisterer.getInstance(this.instanceSearchBox);
          hotInstance.render();
          let formData = this.mrnGroup.getRawValue();
          this.mrnGroup.disable()
          formData['grn_type']=formData['grn_type_code']['grn_type_code']
          if(formData['grn_type']=="AUTO"){
          formData['style_no']=formData['style_no']['style_id']
          formData['shop_order_id']=formData['shop_order_id']['shop_order_id']

          }
          if(formData['grn_type']=="MANUAL"){
          formData['item_id']=formData['item_code']['master_id']
          this.mrnGroup.get('item_code').enable()
          this.mrnGroup.get('cut_qty').enable()
          this.modalGroup.disable()
         }
          this.http.post(this.apiUrl + 'store/mrn/loadDetails?style_id',formData)
        .pipe( map(res => res['data']) )
       .subscribe(data=>{
        // this.mrnGroup.disable();
         //this.isbalanceQtyNull(data)
          this.datasetSearchBox=data

          console.log(this.datasetSearchBox)
           })
    }


    filterData(){
      //debugger
      let formGroup=this.mrnGroup.getRawValue();
      if(formGroup['style_no']!=null){
        let filterData=this.modalGroup.getRawValue();
        filterData['style_id']=formGroup['style_no']['style_id'];
        if(formGroup!=undefined){
          filterData['shop_order_filter']=formGroup['shop_order_id']['shop_order_id'];
        }
          if(filterData['item_code_filter']!=null){
            filterData['item_code_filter']=filterData['item_code_filter']['master_id'];
          }
          if(filterData['customer_po_filter']!=null){
            filterData['customer_po_filter']=filterData['customer_po_filter']['order_id'];
          }

          this.http.post(this.apiUrl + 'store/mrn/filterData' ,filterData )
          .pipe( map(res => res['data']) )
          .subscribe(data => {
                      this.datasetSearchBox=data
            const hotInstance = this.hotRegisterer.getInstance(this.instanceSearchBox);
            hotInstance.render();
            //console.log(formData)

        });




      }


    }

    formatDecimals(e){
    var value=this.mrnGroup.getRawValue();
    var _qty=value['cut_qty']
      if(this.countDecimals(_qty) > 4){
      _qty = this.formatDecimalNumber(_qty, 4)
      this.mrnGroup.patchValue({
        cut_qty:_qty
      })
      }
    }
    saveMrnDetails(){
      //debugger
        var saveOrUpdate$=null
      let formData = this.mrnGroup.getRawValue();
      var mrnID=formData.mrn_id;
      for(var i=0;i<this.dataset.length;i++){
          if(this.dataset[i]['requested_qty']>parseFloat(this.dataset[i]['total_qty'])){
          AppAlert.showError({text:"Stock Qty Exceed"})
          return 0;
        }
      }
      this.processing = true
      AppAlert.showMessage('Processing...','Please wait while saving details')
      if(formData.mrn_id==0||formData.mrn_id==null){
      saveOrUpdate$ =this.http.post(this.apiUrl + 'store/mrn',{'header':formData,'dataset':this.dataset})
      .pipe( map(res => res['data']) )
    }
    else if(formData.mrn_id!=0){
      saveOrUpdate$ =this.http.put(this.apiUrl + 'store/mrn/'+mrnID,{'header':formData,'dataset':this.dataset})

      .pipe( map(res => res['data']) )
    }

      saveOrUpdate$.subscribe(data=>{
        //debugger
        if(data.status=='0'){
          //debugger
          AppAlert.showError({text:data.item_code+" "+data.message})

        }
        else if(data.status=='1'){
        AppAlert.showSuccess({text:data.message1+data.mrnNo+data.message2});
        this.clearData();

      }

    })



    }

clearData(){
  this.dataset=[]
  this.mrnGroup.enable()
  this.mrnGroup.reset();
  this.modalGroup.reset();
  this.mrnGroup.patchValue({
    'mrn_no':'0'
  })

  this.mrnGroup.get("mrn_no").disable()
  const hotInstance = this.hotRegisterer.getInstance(this.instance);
  hotInstance.render();
}

countDecimals(_val) {
 if(Math.floor(_val) === _val) return 0;
 return _val.toString().split(".")[1].length || 0;
}

formatDecimalNumber(_number, _places){
  let num_val = parseFloat(_number+'e'+_places)//_number.toExponential(2)
  return Number(Math.round(num_val)+'e-'+_places);
}

}
