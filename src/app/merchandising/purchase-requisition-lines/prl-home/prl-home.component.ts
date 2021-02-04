import { Component, OnInit , ViewChild} from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
//declare var $:any;

import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
//import { AppValidator } from '../../core/validation/app-validator';
import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../../core/validation/primary-validators';
import { PrlService } from '../prl.service';
import { Customer } from '../../../org/models/customer.model';
import { Po_type } from '../../../merchandising/models/po_type.model';
import { Supplier } from '../../../org/models/supplier.model';

import { Deliverto } from '../../../merchandising/models/deliverto.model';
import { Invoiceto } from '../../../merchandising/models/invoiceto.model';
import { Ship_mode } from '../../../merchandising/models/ship_mode.model';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
import { AuthService } from '../../../core/service/auth.service';



@Component({
  selector: 'app-prl-home',
  templateUrl: './prl-home.component.html',
  styleUrls: ['./prl-home.component.css']
})
export class PrlHomeComponent implements OnInit {

  @ViewChild(ModalDirective) detailsModel: ModalDirective;
  instance2: string = 'instance2';
  readonly apiUrl = AppConfig.apiUrl()


  formHeader : FormGroup
  formValidatorHeader : AppFormValidator
  saveStatus = 'SAVE'
  saveDetailsStatus = 'SAVE'
  initializedHeader : boolean = false
  loadingHeader : boolean = false
  loadingCountHeader : number = 0
  processingHeader : boolean = false
  currentDataSetIndex : number = -1
  currencyId = null;
  orderId = ''
  poid = ''
  mergeid = null
  modelTableTitle = ''
  currencyDivisions : Array<Customer>
  currencyDivisions2 : Array<Customer>
  currency_load = ''

  processingDetails : boolean = false
  processingConfirm : boolean = true
  processingprint : boolean = true
  processdetails : boolean = false

  dataset2: any[] = [];
  hotOptions2: any
  today : Date

  // po_type$: Observable<Po_type[]>;//use to load style list in ng-select
  // po_typeLoading = false;
  // po_typeInput$ = new Subject<string>();
  // selectedPo_type : any[];
  BomStage$: Observable<Array<any>> //used to load bom stages in ng-select
  bomstageLoading = false;
  bomstageInput$ = new Subject<string>();
  selectedBomStage : any[];

  // PurchaseUom$: Observable<Array<any>> //used to load bom stages in ng-select
  // purchaseUomLoading = false;
  // purchaseUomInput$ = new Subject<string>();
  // selectedPurchaseUom : any[];


  supplier$: Observable<Supplier[]>;//use to load style list in ng-select
  supplierLoading = false;
  supplierInput$ = new Subject<string>();
  selectedSupplier : any[];

  deliverto$: Observable<Deliverto[]>;//use to load style list in ng-select
  delivertoLoading = false;
  delivertoInput$ = new Subject<string>();
  selectedDeliverto : any[];

  invoiceto$: Observable<Invoiceto[]>;//use to load style list in ng-select
  invoicetoLoading = false;
  invoicetoInput$ = new Subject<string>();
  selectedInvoiceto : any[];

  ship_mode$: Observable<Ship_mode[]>;//use to load style list in ng-select
  ship_modeLoading = false;
  ship_modeInput$ = new Subject<string>();
  selectedShip_mode : any[];

  PurchaseUom$: Observable<any[]>;//use to load revision reason list in ng-select
  purchaseUomLoading = false;
  purchaseUomInput$ = new Subject<string>();
  selectedPurchaseUom : any[];

  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}
  mycurrentDate = new Date();

  constructor(private fb:FormBuilder , private http:HttpClient , private hotRegisterer: HotTableRegisterer ,
   private snotifyService: SnotifyService, private prlService : PrlService,private auth : AuthService,private layoutChangerService : LayoutChangerService) {
   this.today = new Date(); }

  ngOnInit() {

    this.initializePRLTable()
    this.loadHeaderFormData()
    this.initializeHeaderForm()

    this.formHeader.get('po_type').disable()
    this.formHeader.get('ship_mode').disable()
    this.formHeader.get('supplier').disable()
    //this.formHeader.get('ship_term').disable()
    this.formHeader.get('deliverto').disable()
    this.formHeader.get('invoiceto').disable()

    this.prlService.lineData.subscribe(data => {
      if(data != null){
        this.formHeader.patchValue({prl_id: data });

        if(this.mergeid != null && (this.mergeid != data)){
           return
        }

        //this.formHeader.reset();
        this.mergeid = data
        this.orderId = data
        this.saveStatus = 'SAVE'
        this.saveDetailsStatus = 'SAVE'
        this.processingDetails = false
        this.processdetails = false
        this.dataset2=[];
        this.viewHeader(this.orderId)
        this.processingConfirm = true
        this.processingprint = true
        //console.log(this.orderId)

      }
    })
    this.prlService.loadDatas.subscribe(data => {
          if(data != null){

            this.formHeader.patchValue({prl_id: data });
            this.orderId = data
            //this.viewHeader2(this.orderId)
            //this.saveStatus = 'UPDATE'
            this.saveStatus = 'SAVE'
            this.saveDetailsStatus = 'SAVE'
            this.processingDetails = false
            this.processdetails = false
            this.dataset2=[];
            this.viewHeader(this.orderId)


            }
          })

          this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
            if(data == false){return;}
                const hotInstance = this.hotRegisterer.getInstance(this.instance2);
                if(hotInstance != undefined && hotInstance != null){
                  hotInstance.render(); //refresh fg items table
                }

          })
    }

  initializePRLTable(){
    this.hotOptions2 = {
      columns: [
        //{ type: 'checkbox', title : 'Action' , readOnly: false , checkedTemplate: 'yes',  uncheckedTemplate: 'no' },
        //{ type: 'text', title : 'Type' , data: 'type_created'},
        { type: 'text', title : 'Material' , data: 'category_name' , readOnly: true},
        { type: 'text', title : 'Item  Description' , data: 'master_description' , readOnly: true,className: "htLeft" },
        { type: 'text', title : 'Inventory UOM' , data: 'uom_code' },
        { type: 'text', title : 'Purchase UOM' , data: 'pur_uom_code' },
        { type: 'text', title : 'Color' , data: 'color_name',className: "htLeft" },
        { type: 'text', title : 'Material Size' , data: 'size_name' },
        { type: 'text', title : 'Currency Price' , data: 'cur_value' },
        //{ type: 'text', title : 'USD Price' , data: 'ori_unit_price' },
        //{ type: 'numeric', title : 'Revise Price', data: 'base_unit_price_revise' },
        //{ type: 'text', title : 'USD Price' , data: 'purchase_price' },
        { type: 'numeric', title : 'Purchase Price', data: 'sumunit_price',numericFormat:{ pattern: '0.0000', culture: 'en-US'} },
        { type: 'text', title : 'Unit Price $' , data: 'unit_price' },
        { type: 'text', title : 'Qty' , data: 'bal_order' },
        { type: 'numeric', title : 'Revise Qty' ,readOnly: false, data: 'tra_qty' },
        { type: 'text', title : 'Value' , data: 'value_sum' }

      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 250,
      stretchH: 'all',
      selectionMode: 'range',
      // fixedColumnsLeft: 3,
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
      afterChange:(changes,surce,row,col,value,prop)=>{

      let x=this.dataset2;
      if(surce!=null){
      let y=surce["0"]["0"];


if(surce["0"]["1"] == 'tra_qty')
{
  this.dataset2[y]['value_sum'] = (this.dataset2[y]['sumunit_price'] * this.dataset2[y]['tra_qty']).toFixed(4);

  var sum_value = 0;
  for (var _i = 0; _i < x.length; _i++)
  {
       if(x[_i].value_sum == '' || x[_i].value_sum == null){ x[_i].value_sum = 0; }
       sum_value += parseFloat(x[_i].value_sum);
  }
  //console.log(sum_value)
  var k = parseFloat(sum_value.toString()).toFixed(4);
  //console.log(k)
  var element1 = <HTMLInputElement> document.getElementById("sum_total");
  element1.value = Number(k).toLocaleString('en', {minimumFractionDigits: 4, maximumFractionDigits: 4});
  //console.log(Number(k).toLocaleString('en', {minimumFractionDigits: 4, maximumFractionDigits: 4}))

  const hotInstance = this.hotRegisterer.getInstance(this.instance2);
  hotInstance.render()

  if(this.dataset2[y]["req_qty"]<surce["0"]["3"]){
    AppAlert.showError({text:"Invalid Qty"});
    this.dataset2[y]['tra_qty'] = this.dataset2[y]['req_qty'];
    this.dataset2[y]['value_sum'] = (this.dataset2[y]['sumunit_price'] * this.dataset2[y]['req_qty']).toFixed(4);

    var sum_value = 0;
    for (var _i = 0; _i < x.length; _i++)
    {
         if(x[_i].value_sum == '' || x[_i].value_sum == null){ x[_i].value_sum = 0; }
         sum_value += parseFloat(x[_i].value_sum);
    }
    var k = parseFloat(sum_value.toString()).toFixed(4);
    var element1 = <HTMLInputElement> document.getElementById("sum_total");
    element1.value = Number(k).toLocaleString('en', {minimumFractionDigits: 4, maximumFractionDigits: 4});

    const hotInstance = this.hotRegisterer.getInstance(this.instance2);
    hotInstance.render()

      }

  if(surce["0"]["3"] <= 0){
    AppAlert.showError({text:"Invalid Qty"});
    this.dataset2[y]['tra_qty'] = this.dataset2[y]['req_qty'];
    this.dataset2[y]['value_sum'] = (this.dataset2[y]['sumunit_price'] * this.dataset2[y]['req_qty']).toFixed(4);

    var sum_value = 0;
    for (var _i = 0; _i < x.length; _i++)
    {
         if(x[_i].value_sum == '' || x[_i].value_sum == null){ x[_i].value_sum = 0; }
         sum_value += parseFloat(x[_i].value_sum);
    }
    var k = parseFloat(sum_value.toString()).toFixed(4);
    var element1 = <HTMLInputElement> document.getElementById("sum_total");
    element1.value = Number(k).toLocaleString('en', {minimumFractionDigits: 4, maximumFractionDigits: 4});

    const hotInstance = this.hotRegisterer.getInstance(this.instance2);
    hotInstance.render()

      }
}

if(surce["0"]["1"] == 'base_unit_price_revise')
{
  this.dataset2[y]['sumunit_price'] = (this.dataset2[y]['cur_value'] * this.dataset2[y]['base_unit_price_revise']).toFixed(4);
  //const hotInstance = this.hotRegisterer.getInstance(this.instance);
//  hotInstance.render()

  this.dataset2[y]['value_sum'] = (this.dataset2[y]['sumunit_price'] * this.dataset2[y]['tra_qty']).toFixed(4);

  var sum_value = 0;
  for (var _i = 0; _i < x.length; _i++)
  {
       if(x[_i].value_sum == '' || x[_i].value_sum == null){ x[_i].value_sum = 0; }
       sum_value += parseFloat(x[_i].value_sum);
  }
  var k = parseFloat(sum_value.toString()).toFixed(4);
  var element1 = <HTMLInputElement> document.getElementById("sum_total");
  element1.value = Number(k).toLocaleString('en', {minimumFractionDigits: 4, maximumFractionDigits: 4});

  const hotInstance = this.hotRegisterer.getInstance(this.instance2);
  hotInstance.render()

  if(this.dataset2[y]['ori_unit_price'] < surce["0"]["3"]){
    AppAlert.showError({text:"Cannot Exceeded more than USD Price"});
    this.dataset2[y]['base_unit_price_revise'] = this.dataset2[y]['ori_unit_price'];
    this.dataset2[y]['sumunit_price'] = (this.dataset2[y]['cur_value'] * this.dataset2[y]['ori_unit_price']).toFixed(4);
    this.dataset2[y]['value_sum'] = (this.dataset2[y]['sumunit_price'] * this.dataset2[y]['tra_qty']).toFixed(4);

    var sum_value = 0;
    for (var _i = 0; _i < x.length; _i++)
    {
         if(x[_i].value_sum == '' || x[_i].value_sum == null){ x[_i].value_sum = 0; }
         sum_value += parseFloat(x[_i].value_sum);
    }
    var k = parseFloat(sum_value.toString()).toFixed(4);
    var element1 = <HTMLInputElement> document.getElementById("sum_total");
    element1.value = Number(k).toLocaleString('en', {minimumFractionDigits: 4, maximumFractionDigits: 4});

    const hotInstance = this.hotRegisterer.getInstance(this.instance2);
    hotInstance.render()

      }

      if(surce["0"]["3"] <= 0){

        AppAlert.showError({text:"Cannot Decrease"});
        this.dataset2[y]['base_unit_price_revise'] = this.dataset2[y]['ori_unit_price'];
        this.dataset2[y]['value_sum'] = (this.dataset2[y]['sumunit_price'] * this.dataset2[y]['tra_qty']).toFixed(4);

        var sum_value = 0;
        for (var _i = 0; _i < x.length; _i++)
        {
             if(x[_i].value_sum == '' || x[_i].value_sum == null){ x[_i].value_sum = 0; }
             sum_value += parseFloat(x[_i].value_sum);
        }
        var k = parseFloat(sum_value.toString()).toFixed(4);
        var element1 = <HTMLInputElement> document.getElementById("sum_total");
        element1.value = Number(k).toLocaleString('en', {minimumFractionDigits: 4, maximumFractionDigits: 4});

        const hotInstance = this.hotRegisterer.getInstance(this.instance2);
        hotInstance.render()



      }



}


        }

      },
      cells : function(row, col, prop , value){ //table cell render event. works for every cell in the table
        var cellProperties = {};

        if(col == 10){
          cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
            var args = arguments;
            if(prop == 'tra_qty'){
              td.style.background = '#D1E0E0';
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
            'split' : {
              name : 'Delivery Split',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  let data = this.dataset2[start.row]
                  this.prlService.changeContextMenuSplit(data)
                }
              }
            },

          }
      }

    }
  }

  initializeHeaderForm(){
    this.formHeader = this.fb.group({
      po_id: 0,
      prl_id : 0,
      po_type : [null , [Validators.required]],
      purchase_uom : [null , [Validators.required]],
      po_date : this.mycurrentDate,
      supplier : [null , [Validators.required]],
      currency : [null , [Validators.required]],
      delivery_date : [null , [Validators.required]],
      deliverto : [null , [Validators.required]],
      invoiceto : [null , [Validators.required]],
      special_ins : null,
      pay_mode : [null , [Validators.required]],
      pay_term : [null , [Validators.required]],
      ship_mode : [null , [Validators.required]],
      ship_term : [null , [Validators.required]],
      po_number : null,
      po_status : null
    })
    this.formValidatorHeader = new AppFormValidator(this.formHeader , {})
  }


  loadHeaderFormData()
  {

    this.BomStage$ = this.getBomStage();
    this.loadPurchaseUom()
    this.loadSuppliers()
    this.loadLocation()
    this.loadCompany()
    this.loadShipMode()

  }

  viewHeader(id) {

    let loaddatapor$
    loaddatapor$=this.http.post(this.apiUrl + 'merchandising/po-manual/prl_header_load' ,{ 'PORID' : id })
    loaddatapor$.subscribe(
      (data) =>{

        let sup_list = null
        let currency_n = null
        let p_mode = null
        let p_terms = null
        let s_terms = null

        if(data.data['load_cur'] != null){
          if(data.data['load_cur_check'] == 'ALL'){
            this.formHeader.get('currency').enable()
            this.formHeader.get('pay_mode').disable()
            this.formHeader.get('pay_term').disable()
            this.formHeader.get('ship_term').disable()
            this.currency_load = data.data['load_cur'][0]['currency_code']
             currency_n = null
             p_mode = null
             p_terms = null
             s_terms = null
          }else{
            this.formHeader.get('currency').disable()
            this.currency_load = data.data['load_cur'][0]['currency_code']
             currency_n = data.data['load_cur'][0]['currency_id']
             p_mode = data.data['load_cur'][0]['payment_method_id']
             p_terms = data.data['load_cur'][0]['payemnt_terms']
             s_terms = data.data['load_cur'][0]['ship_term_id']
          }

        }else{
           currency_n = null
           p_mode = null
           p_terms = null
           s_terms = null
        }

        if(data.data['load_sup'] != null){
           sup_list = data.data['load_sup'][0]
        }else{
           sup_list = null
        }

        console.log(data.data['stage'])

        if(data.data['stage'][0]['category_id'] =='FAB')
        {
          this.formHeader.get('purchase_uom').enable()
        }else{
          this.formHeader.get('purchase_uom').disable()
        }

         this.formHeader.setValue({
           po_id: 0,
           prl_id : id,
           po_type :data.data['stage'][0],
           po_date : this.mycurrentDate,
           supplier : sup_list,
           currency : currency_n,
           delivery_date : null,
           deliverto : data.data['deli_loc'][0],
           invoiceto : data.data['deli_com'][0],
           special_ins : null,
           pay_mode : p_mode,
           pay_term : p_terms,
           ship_mode : data.data['ship'][0],
           ship_term : s_terms,
           po_number : null,
           po_status : null,
           purchase_uom :null
        })
        this.formHeader.get('po_type').disable()
        this.formHeader.get('ship_mode').disable()
        this.formHeader.get('supplier').disable()
        //this.formHeader.get('ship_term').disable()
        this.formHeader.get('deliverto').disable()
        this.formHeader.get('invoiceto').disable()
        this.currencyDivisions = data.data['load_cur']
        this.currencyDivisions2 = data.data['load_cur']

        //auto connect this.saveHeader()

           },
         (error)=>{
           console.log(error)
           }
        );

    }




   getBomStage(): Observable<Array<any>> {
     return this.http.get<any[]>(this.apiUrl + 'merchandising/bomstages?active=1&fields=bom_stage_id,bom_stage_description')
         .pipe(map(res => res['data']))
   }


    loadPurchaseUom(){
       this.PurchaseUom$ = this.purchaseUomInput$
         .pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.purchaseUomLoading = true),
            switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/po-manual?type=loadPurchaseUom' , {params:{search:term, category_code : 'COSTING'}})
            .pipe(
                tap(() => this.purchaseUomLoading = false)
            ))
         );
     }



   loadSuppliers() {
        this.supplier$ = this.supplierInput$
        .pipe(
           debounceTime(200),
           distinctUntilChanged(),
           tap(() => this.supplierLoading = true),
           switchMap(term => this.http.get<Supplier[]>(this.apiUrl + 'org/suppliers?type=currency' , {params:{search:term}})
           .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.supplierLoading = false)
           ))
        );
    }

    load_list_of_details(data){

      let formData = this.formHeader.getRawValue();
      console.log(formData)

      let loaddatapor$
      loaddatapor$=this.http.post(this.apiUrl + 'merchandising/po-manual/change_load_methods' ,{ 'formData' : formData })
      loaddatapor$.subscribe(
        (data) =>{
           console.log(data)
          let p_mode = null
          let p_terms = null
          let s_terms = null
          let currency_n = null

          p_mode = data.data['load_cur'][0]['payment_method_id']
          p_terms = data.data['load_cur'][0]['payemnt_terms']
          s_terms = data.data['load_cur'][0]['ship_term_id']
          //currency_n = data.data['load_cur'][0]['currency_id']

           this.formHeader.patchValue({
             pay_mode : p_mode,
             pay_term : p_terms,
             //currency : currency_n,
             ship_term : s_terms

          })

          this.formHeader.get('pay_mode').enable()
          this.formHeader.get('pay_term').enable()
          this.formHeader.get('ship_term').enable()
          this.currencyDivisions = data.data['load_cur']
          //this.currencyDivisions = data.data['load_cur_2']
             },
           (error)=>{
             console.log(error)
             }
          );
    }

    load_currency(data) {
      if(data == undefined){
        this.currencyId = null;
      }
      else{

        this.currencyId = data.supplier_id;
        //this.styleDescription = data.style_description
      //  this.http.get(this.apiUrl + 'org/suppliers/load_currency?id='+this.currencyId)
        this.http.post(this.apiUrl + 'org/suppliers/load_currency' , { 'curid' : this.currencyId } )
        .pipe( map(res => res['data'] ))
        .subscribe(
          data => {
            //console.log(data.currency)
            //this.customerDetails = data.customer_code + ' / ' + data.customer_name
            this.currencyDivisions = data.currency
            this.currencyDivisions2 = data.currency

          },
          error => {
            console.log(error)
          }
        )
        //this.customerDetails = ''
      }
      //console.log(data)
    }


    loadCompany() {
         this.deliverto$ = this.delivertoInput$
         .pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.delivertoLoading = true),
            switchMap(term => this.http.get<Deliverto[]>(this.apiUrl + 'org/locations?type=auto' , {params:{search:term}})
            .pipe(
                //catchError(() => of([])), // empty list on error
                tap(() => this.delivertoLoading = false)
            ))
         );
     }

    loadLocation() {
         this.invoiceto$ = this.invoicetoInput$
         .pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.invoicetoLoading = true),
            switchMap(term => this.http.get<Invoiceto[]>(this.apiUrl + 'org/companies?type=auto' , {params:{search:term}})
            .pipe(
                //catchError(() => of([])), // empty list on error
                tap(() => this.invoicetoLoading = false)
            ))
         );
     }


     loadShipMode() {
          this.ship_mode$ = this.ship_modeInput$
          .pipe(
             debounceTime(200),
             distinctUntilChanged(),
             tap(() => this.ship_modeLoading = true),
             switchMap(term => this.http.get<Ship_mode[]>(this.apiUrl + 'org/ship-modes?type=auto' , {params:{search:term}})
             .pipe(
                 //catchError(() => of([])), // empty list on error
                 tap(() => this.ship_modeLoading = false)
             ))
          );
      }

      //save customer order header details
      saveHeader() {

        //console.log(this.saveStatus)
        this.processingHeader = true
        //AppAlert.showMessage('Processing...','Please wait while saving details')
        let saveOrUpdate$ = null;
        let ordId = this.formHeader.get('po_id').value
        let formData = this.formHeader.getRawValue();
        formData['po_sup_code'] = formData['supplier']['supplier_id']
        formData['po_def_cur'] = formData['currency']
        formData['po_date'] = formData['po_date'].toISOString().split("T")[0]
        formData['delivery_date'] = formData['delivery_date'].toISOString().split("T")[0]
        formData['po_deli_loc'] = formData['deliverto']['loc_id']
        formData['invoice_to'] = formData['invoiceto']['company_id']
        //debugger
        if(this.saveStatus == 'SAVE') {
          this.processingDetails = true
          saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/po-manual', formData)
          //this.dataset = [] //clear order details table
        }
        else if(this.saveStatus == 'UPDATE') {
          if(!this.formValidatorHeader.validate())//if validation faild return from the function
          return;
          //console.log(formData)
          this.processingDetails = true
          AppAlert.showMessage('Processing...','Please wait while saving details')

          formData['po_type'] = formData['po_type']['po_type']
          formData['po_deli_loc'] = formData['deliverto']['loc_id']
          //formData['delivery_date'] = formData['delivery_date'].toISOString().split("T")[0]
          formData['ship_mode'] = formData['ship_mode']['ship_mode']
          formData['invoice_to'] = formData['invoiceto']['company_id']
          formData['po_sup_code'] = formData['supplier']['supplier_id']
          formData['po_def_cur'] = formData['supplier']['currency']
          formData['pay_mode'] = formData['supplier']['payment_mode']
          formData['pay_term'] = formData['supplier']['payemnt_terms']
          formData['ship_term'] = formData['supplier']['ship_terms_agreed']

          saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/po-manual/' + ordId , formData)
        }

        saveOrUpdate$
        .pipe( map(res => res['data'] ) )
        .subscribe(
          (res) => {
            //console.log(res)
            this.dataset2 = []
            this.formHeader.patchValue({po_number: res.newpo });
            this.formHeader.patchValue({po_status: res.savepo['po_status'] });
            this.formHeader.patchValue({po_id: res.savepo['po_id'] });
            this.formHeader.get('purchase_uom').disable()

            if(this.saveStatus == 'SAVE')
            {
              this.saveStatus = 'UPDATE'
              this.loadTable()
            }

            if(this.saveStatus == 'UPDATE')
            {
              this.loadTable_2()
            }

         },
         (error) => {
           this.processingHeader = false
           setTimeout(() => {
             AppAlert.closeAlert()
             AppAlert.showError({text : 'Process Error' })
           } , 1000)
             console.log(error)
         }
       );
      }


      loadTable(){
        this.dataset2 = []
        let formData = this.formHeader.getRawValue();

        AppAlert.showMessage('Processing...','Please wait while saving details')
        this.http.post(this.apiUrl + 'merchandising/po-manual-details/load_reqline' , formData)
        .subscribe(data => {

           let count_ar =  data['data']['count']
           //console.log(data['data'])
           var sum_value_load = 0;
           for (var _i = 0; _i < count_ar; _i++)
          {
             var uom = data['data']['load_list'][_i].uom_code
             var purchase_uom = data['data']['load_list'][_i].pur_uom_code
             var fractions  = data['data']['load_list'][_i].fractions
             var present_factor = data['data']['load_list'][_i].present_factor
             var gsm = data['data']['load_list'][_i].gsm
             var width = data['data']['load_list'][_i].width
             var if_inch = data['data']['load_list'][_i].for_calculation
             var category_name = data['data']['load_list'][_i].category_name

             //console.log(fractions)

             if(category_name == "FABRIC" && uom != purchase_uom){
               if(fractions == "N"){
                 var convert =  parseFloat(present_factor)/(parseFloat(gsm)*parseFloat(width)*parseFloat(if_inch))
               }else if(fractions == "D"){
                 var convert =  (parseFloat(gsm)*parseFloat(width)*parseFloat(if_inch))/parseFloat(present_factor)
               }else if(fractions == null || fractions == ''){
                 var convert =  parseFloat(present_factor)

               }
             }else{
                 var convert = 1;
             }

             console.log(convert)
             console.log(data['data']['load_list'][_i].purchase_price)
             // var tot_unit_price = parseFloat(data['data']['load_list'][_i].purchase_price) * parseFloat(data['data']['load_list'][_i].cur_value) * convert
             // data['data']['load_list'][_i]['sumunit_price'] = parseFloat(tot_unit_price.toString()).toFixed(4);

             var tot_unit_price = parseFloat(data['data']['load_list'][_i].purchase_price)  * convert
             data['data']['load_list'][_i]['sumunit_price'] = parseFloat(tot_unit_price.toString()).toFixed(4);

             var convert_unit_price = parseFloat(data['data']['load_list'][_i].unit_price) * convert
             data['data']['load_list'][_i]['unit_price'] = parseFloat(convert_unit_price.toString()).toFixed(4);

             var convert_payment_price = parseFloat(data['data']['load_list'][_i].purchase_price) * convert
             data['data']['load_list'][_i]['purchase_price'] = parseFloat(convert_payment_price.toString()).toFixed(4);

             var balance_qty = parseFloat(data['data']['load_list'][_i].bal_order) / convert
             data['data']['load_list'][_i]['bal_order'] = parseFloat(balance_qty.toString()).toFixed(4);

             var transfer_qty = parseFloat(data['data']['load_list'][_i].tra_qty) / convert
             data['data']['load_list'][_i]['tra_qty'] = parseFloat(transfer_qty.toString()).toFixed(4);

             var tot_value_sum = tot_unit_price * transfer_qty
             data['data']['load_list'][_i]['value_sum'] = parseFloat(tot_value_sum.toString()).toFixed(4);


             this.dataset2.push(data['data']['load_list'][_i])

             sum_value_load += parseFloat(data['data']['load_list'][_i].value_sum);
             var k = parseFloat(sum_value_load.toString()).toFixed(4);
             var element1 = <HTMLInputElement> document.getElementById("sum_total");
             element1.value = Number(k).toLocaleString('en', {minimumFractionDigits: 4, maximumFractionDigits: 4});
            // const hotInstance = this.hotRegisterer.getInstance(this.instance2);
            // hotInstance.render()


           }
           //console.log(this.dataset2)

            this.savedetails()

         setTimeout(() => { AppAlert.closeAlert() } , 1000)
          },
         error => {
           //this.snotifyService.error('Inserting Error', this.tosterConfig)
           setTimeout(() => { AppAlert.closeAlert() } , 1000)
         })


      }

      savedetails(){
        let savedetais$
        let arr=[]
        var x=this.dataset2.length;var i;
        let formData = this.formHeader.getRawValue();
        formData['delivery_date'] = formData['delivery_date'].toISOString().split("T")[0]

        console.log(this.dataset2)
        console.log(formData)
      //  console.log(x)


      for(i=0;i<x;i++){
      if(this.dataset2[i]['tra_qty']!=0){

        if(this.saveDetailsStatus == 'SAVE')
        {
          console.log(this.dataset2)
           savedetais$=this.http.post(this.apiUrl + 'merchandising/po-manual-details/save_line_details' ,
           { 'lines' : this.dataset2 ,'formData':formData });
        }

        if(this.saveDetailsStatus == 'UPDATE')
        {
           console.log(this.dataset2)
           savedetais$=this.http.post(this.apiUrl + 'merchandising/po-manual-details/update_line_details' ,
           { 'lines' : this.dataset2 ,'formData':formData });
        }


        savedetais$.subscribe(
          (res) => {

            if(res.data.status == 'error'){
              AppAlert.showError({text:res.data.message})
              this.processdetails = true
              this.processingConfirm = false
              this.processingprint = false
              this.loadTable_2()


            }else{

              AppAlert.showSuccess({text:res.data.message})
              if(this.saveDetailsStatus == 'SAVE')
              {
                //this.processingDetails = false
                this.loadTable_2()
              }
              if(this.saveDetailsStatus == 'UPDATE') {

                this.processdetails = true
                this.processingConfirm = false
                this.processingprint = false
                this.loadTable_2()
              }

              this.saveDetailsStatus = 'UPDATE'


            }





          },
            (error)=>{
              console.log(error)
            }

        );
        return;
      }


    }
    AppAlert.showError({text:"please Enter Transfer Qty"})




    }


    confirmdetails(){
      let formData = this.formHeader.getRawValue();
      AppAlert.showConfirm({
        'text' : 'Do You Want To Confirm This Purchase Order ?'
            },(result) => {
        if (result.value) {

          this.http.post(this.apiUrl + 'merchandising/po-manual-details/confirm_po' , { 'formData' : formData } )
          .pipe( map( res => res['data']) )
          .subscribe(
           data =>
           {
             AppAlert.showSuccess({ text : data.message });
             this.formHeader.patchValue({po_status: 'CONFIRMED' });
             this.processingDetails = true
             this.processdetails = true
             this.processingConfirm = true
            },
             error => {
                 setTimeout(() => {
                 AppAlert.closeAlert()
                 AppAlert.showError({ text : 'Process Error' });
               } , 1000)

            }
          )

        }
        if (result.dismiss) {

        }

      })
    }


    printdetails(){
      let save$
      let formData = this.formHeader.getRawValue();
      console.log(formData)
      window.open(AppConfig.POReport()+"?po_no="+formData['po_number'], '_blank');
      if(formData['po_status'] == 'CONFIRMED'){

        this.http.post(this.apiUrl + 'merchandising/po-manual-details/save_print_status' , { 'formData' : formData } )
        .pipe( map( res => res['data']) )
        .subscribe(
         data  => { },
         error => { }
        )

      }




    }




    loadTable_2(){

      this.dataset2=[];
      let formData = this.formHeader.getRawValue();
      //console.log(formData)
      this.http.post(this.apiUrl + 'merchandising/po-manual-details/load_reqline_2' , formData)
      .subscribe(data => {

         let count_ar =  data['data']['count']
         //console.log(data['data']['load_list'])
         var sum_value_load = 0;
         for (var _i = 0; _i < count_ar; _i++)
        {

          var tot_unit_price = parseFloat(data['data']['load_list'][_i].purchase_price) * parseFloat(data['data']['load_list'][_i].cur_value)
          data['data']['load_list'][_i]['sumunit_price'] = parseFloat(tot_unit_price.toString()).toFixed(4);

          var tot_value_sum = tot_unit_price * parseFloat(data['data']['load_list'][_i].tra_qty)
          data['data']['load_list'][_i]['value_sum'] = parseFloat(tot_value_sum.toString()).toFixed(4);

          this.dataset2.push(data['data']['load_list'][_i])

          sum_value_load += parseFloat(data['data']['load_list'][_i].value_sum);
          var k = parseFloat(sum_value_load.toString()).toFixed(4);
          var element1 = <HTMLInputElement> document.getElementById("sum_total");
          element1.value = Number(k).toLocaleString('en', {minimumFractionDigits: 4, maximumFractionDigits: 4});

          this.mergeid = null;

          const hotInstance = this.hotRegisterer.getInstance(this.instance2);
          hotInstance.render()


         }

         AppAlert.closeAlert()


        },
       error => {
         //this.snotifyService.error('Inserting Error', this.tosterConfig)

       })


    }





}
