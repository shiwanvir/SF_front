import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';
//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
import { TabsetComponent,TabDirective } from 'ngx-bootstrap';
//declare var $:any;

import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../../core/validation/primary-validators';
import { PorevisionService } from '../po-revision.service';
//import { PrlService } from '../../purchase-requisition-lines/prl.service';

import { Deliverto } from '../../../merchandising/models/deliverto.model';
import { Invoiceto } from '../../../merchandising/models/invoiceto.model';
import { Ship_mode } from '../../../merchandising/models/ship_mode.model';

import { AuthService } from '../../../core/service/auth.service';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
@Component({
  selector: 'app-po-revision-1',
  templateUrl: './po-revision.component.html',
  styleUrls: ['./po-revision.component.css']
})
export class PoRevisionComponent1 implements OnInit {
    @ViewChild('sotabs') tabs: TabsetComponent;

  apiUrl:string = AppConfig.apiUrl()
  instance: string = 'hot';
  instance2: string = 'instance2';
  formHeader : FormGroup
  formValidatorHeader : AppFormValidator
  saveStatus = 'UPDATE'
  initializedHeader : boolean = false
  loadingHeader : boolean = false
  loadingCountHeader : number = 0
  processingHeader : boolean = false
  processingDetails : boolean = false
  processingConfirm : boolean = true
  processingprint : boolean = true
  processdetails : boolean = false
  processsendtoapp : boolean = true

  currentDataSetIndex : number = -1
  dataset: any[] = [];
  dataset2: any[] = [];
  hotOptions: any
  hotOptions2: any
  orderId = ''
  poid = ''
  modelTableTitle = ''
  currency_load = ''

  paymodeDivisions : Array<any>
  paytermDivisions : Array<any>
  shiptermDivisions : Array<any>

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

tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}

  constructor(private fb:FormBuilder , private http:HttpClient , private hotRegisterer: HotTableRegisterer, private snotifyService: SnotifyService,
    private porevisionService : PorevisionService,private auth : AuthService,private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {

    this.initializeHeaderForm()
    this.loadHeaderFormData()
    this.initializePORTable()

    this.porevisionService.lineData.subscribe(data => {
      //alert('ddd')
      if(data != null  && data != ''){
        this.saveStatus = 'UPDATE'
        this.orderId = data
      //  alert(this.orderId)
        this.processingConfirm = true
        this.processingprint = true
        this.processdetails = false
        this.processsendtoapp = true
        this.viewHeader(this.orderId)

        //this.loadOrderDetails(this.orderId)
        //const hotInstance = this.hotRegisterer.getInstance(this.instance);
        //hotInstance.render()
      }
    })

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          if(hotInstance != undefined && hotInstance != null){
            hotInstance.render(); //refresh fg items table
          }

    })
  }

  initializePORTable(){
    this.hotOptions = {
      columns: [
        //{ type: 'checkbox', title : 'Action' , readOnly: false , checkedTemplate: 'yes',  uncheckedTemplate: 'no' },
        //{ type: 'text', title : 'Type' , data: 'type_created'},
        { type: 'text', title : 'Status' , data: 'po_status'},
        { type: 'text', title : 'Material' , data: 'category_name' , readOnly: true,className: "htLeft"},
        { type: 'text', title : 'Item  Description' , data: 'master_description' , readOnly: true,className: "htLeft" },
        { type: 'text', title : 'UOM' , data: 'uom_code',className: "htLeft" },
        { type: 'text', title : 'Purchase UOM' , data: 'purchase_uom' ,className: "htLeft"},
        { type: 'text', title : 'Item Color' , data: 'color_name',className: "htLeft" },
        { type: 'text', title : 'Size' , data: 'size_name',className: "htLeft" },
        { type: 'text', title : 'RM IN Date' , data: 'rm_in_date',className: "htLeft" },
        { type: 'text', title : 'Revised RM IN Date' , data: 'rm_revised_in_date',className: "htLeft" },
        { type: 'text', title : 'Purchase Price' , data: 'purchase_price',className: "htRight" },
        //{ type: 'numeric', title : 'Revise Price' ,readOnly: false, data: 'base_unit_price_revise' },
        //{ type: 'numeric', title : 'Revise Price' , data: 'base_unit_price_revise' },
        { type: 'text', title : 'Std price' , data: 'unit_price',className: "htRight" },
        { type: 'text', title : 'Qty' , data: 'req_qty',className: "htRight" },
        { type: 'numeric', title : 'Revise Qty' ,readOnly: false, data: 'tra_qty',className: "htRight" },
        { type: 'text', title : 'Value' , data: 'value_sum',className: "htRight" }

      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 250,
      stretchH: 'all',
      selectionMode: 'range',
      //fixedColumnsLeft: 1,
      //fixedColumnsRight: 2,
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
      cells : function(row, col, prop , value){ //table cell render event. works for every cell in the table
        var cellProperties = {};

        // if(col == 0){
        //   cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
        //     var args = arguments;
        //     if(prop == 'polineststus' && value == 'ACTIVE'){
        //       td.style.background = '#22B998';
        //       td.style.color = '#FFFFFF';
        //       //td.value = 'Active';
        //     }
        //     else if(prop == 'polineststus' && value == 'INACTIVE'){
        //       td.style.background = '#BFC3C4';
        //       td.style.color = '#FFFFFF';
        //     }
        //     Handsontable.renderers.TextRenderer.apply(this, args);
        //   }
        // }

        if(col == 12){
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
      afterChange:(changes,surce,row,col,value,prop)=>{

      let x=this.dataset;
      if(surce!=null){
      let y=surce["0"]["0"];
      //console.log(changes);
      //console.log(y);
      //console.log(x);
      //console.log(surce);
      //console.log(surce["0"]["1"]);
      //console.log(this.dataset2[y]["total_qty"]);
      if(surce["0"]["1"] == 'tra_qty')
      {
        this.dataset[y]['value_sum'] = (this.dataset[y]['purchase_price'] * this.dataset[y]['tra_qty']).toFixed(4);

        var sum_value = 0;
        for (var _i = 0; _i < x.length; _i++)
        {
             if(x[_i].value_sum == '' || x[_i].value_sum == null){ x[_i].value_sum = 0; }
             sum_value += parseFloat(x[_i].value_sum);
        }
        var k = parseFloat(sum_value.toString()).toFixed(4);
        var element1 = <HTMLInputElement> document.getElementById("sum_total");
        element1.value = Number(k).toLocaleString('en', {minimumFractionDigits: 4, maximumFractionDigits: 4});

        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        hotInstance.render()

        if(this.dataset[y]["req_qty"]<surce["0"]["3"]){
          AppAlert.showError({text:"Cannot Exceed more than PO Qty"});
          this.dataset[y]['tra_qty'] = this.dataset[y]['req_qty'];
          this.dataset[y]['value_sum'] = (this.dataset[y]['purchase_price'] * this.dataset[y]['req_qty']).toFixed(4);

          var sum_value = 0;
          for (var _i = 0; _i < x.length; _i++)
          {
               if(x[_i].value_sum == '' || x[_i].value_sum == null){ x[_i].value_sum = 0; }
               sum_value += parseFloat(x[_i].value_sum);
          }
          var k = parseFloat(sum_value.toString()).toFixed(4);
          var element1 = <HTMLInputElement> document.getElementById("sum_total");
          element1.value = Number(k).toLocaleString('en', {minimumFractionDigits: 4, maximumFractionDigits: 4});

          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          hotInstance.render()

            }

        if(surce["0"]["3"] <= 0){
          AppAlert.showError({text:"Stock Qty Exceed"});
          this.dataset[y]['tra_qty'] = this.dataset[y]['req_qty'];
          this.dataset[y]['value_sum'] = (this.dataset[y]['purchase_price'] * this.dataset[y]['req_qty']).toFixed(4);

          var sum_value = 0;
          for (var _i = 0; _i < x.length; _i++)
          {
               if(x[_i].value_sum == '' || x[_i].value_sum == null){ x[_i].value_sum = 0; }
               sum_value += parseFloat(x[_i].value_sum);
          }
          var k = parseFloat(sum_value.toString()).toFixed(4);
          var element1 = <HTMLInputElement> document.getElementById("sum_total");
          element1.value = Number(k).toLocaleString('en', {minimumFractionDigits: 4, maximumFractionDigits: 4});

          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          hotInstance.render()

            }
      }

      if(surce["0"]["1"] == 'base_unit_price_revise')
      {
        this.dataset[y]['unit_price'] = (this.dataset[y]['cur_value'] * this.dataset[y]['base_unit_price_revise']).toFixed(4);
        //const hotInstance = this.hotRegisterer.getInstance(this.instance);
      //  hotInstance.render()

        this.dataset[y]['value_sum'] = (this.dataset[y]['purchase_price'] * this.dataset[y]['tra_qty']).toFixed(4);

        var sum_value = 0;
        for (var _i = 0; _i < x.length; _i++)
        {
             if(x[_i].value_sum == '' || x[_i].value_sum == null){ x[_i].value_sum = 0; }
             sum_value += parseFloat(x[_i].value_sum);
        }
        var k = parseFloat(sum_value.toString()).toFixed(4);
        var element1 = <HTMLInputElement> document.getElementById("sum_total");
        element1.value = Number(k).toLocaleString('en', {minimumFractionDigits: 4, maximumFractionDigits: 4});

        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        hotInstance.render()

        if(this.dataset[y]['base_unit_price'] < surce["0"]["3"]){
          AppAlert.showError({text:"Cannot Exceed more than USD Price"});
          this.dataset[y]['base_unit_price_revise'] = this.dataset[y]['base_unit_price'];
          this.dataset[y]['unit_price'] = (this.dataset[y]['cur_value'] * this.dataset[y]['base_unit_price']).toFixed(4);
          this.dataset[y]['value_sum'] = (this.dataset[y]['purchase_price'] * this.dataset[y]['tra_qty']).toFixed(4);

          var sum_value = 0;
          for (var _i = 0; _i < x.length; _i++)
          {
               if(x[_i].value_sum == '' || x[_i].value_sum == null){ x[_i].value_sum = 0; }
               sum_value += parseFloat(x[_i].value_sum);
          }
          var k = parseFloat(sum_value.toString()).toFixed(4);
          var element1 = <HTMLInputElement> document.getElementById("sum_total");
          element1.value = Number(k).toLocaleString('en', {minimumFractionDigits: 4, maximumFractionDigits: 4});

          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          hotInstance.render()

            }

            if(surce["0"]["3"] <= 0){

              AppAlert.showError({text:"Cannot Exceed"});
              this.dataset[y]['base_unit_price_revise'] = this.dataset[y]['base_unit_price'];
              this.dataset[y]['value_sum'] = (this.dataset[y]['purchase_price'] * this.dataset[y]['tra_qty']).toFixed(4);

              var sum_value = 0;
              for (var _i = 0; _i < x.length; _i++)
              {
                   if(x[_i].value_sum == '' || x[_i].value_sum == null){ x[_i].value_sum = 0; }
                   sum_value += parseFloat(x[_i].value_sum);
              }
              var k = parseFloat(sum_value.toString()).toFixed(4);
              var element1 = <HTMLInputElement> document.getElementById("sum_total");
              element1.value = Number(k).toLocaleString('en', {minimumFractionDigits: 4, maximumFractionDigits: 4});

              const hotInstance = this.hotRegisterer.getInstance(this.instance);
              hotInstance.render()



            }



      }





        }

      },
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
          },
          items : {
            'remove' : {
              name : 'Line Cancellation',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.instance);
                let sel_row = hotInstance.getSelectedLast()[0];
                let dible_row= this.dataset[sel_row]['po_status'];
                console.log(dible_row);

                if(dible_row == 'CLOSED'){ return hotInstance.getSelectedLast()[0] === sel_row }

              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let row = selection[0].start.row;
                  this.contextLineRemove(row)
                }
              }
            },
            'split' : {
              name : 'Delivery Split',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.instance);
                let sel_row = hotInstance.getSelectedLast()[0];
                let dible_row= this.dataset[sel_row]['po_status'];
                console.log(dible_row);

                if(dible_row == 'CLOSED'){ return hotInstance.getSelectedLast()[0] === sel_row }

              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  let data = this.dataset[start.row]
                  this.porevisionService.changeContextMenuSplit(data)
                }
              }
            },

            'close' : {
              name : 'Close',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.instance);
                let sel_row = hotInstance.getSelectedLast()[0];
                let dible_row= this.dataset[sel_row]['po_status'];
                console.log(dible_row);

                if(dible_row == 'CLOSED'){ return hotInstance.getSelectedLast()[0] === sel_row }

              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let row = selection[0].start.row;
                  this.contextLineClosed(row)
                }
              }
            },

          }
      }
    }


    this.hotOptions2 = {
      columns: [
        { type: 'text', title : 'Material' , data: 'category_name' , readOnly: true,className: "htLeft"},
        { type: 'text', title : 'Status' , data: 'po_status' , readOnly: true,className: "htLeft"},
        { type: 'text', title : 'Item  Description' , data: 'master_description' , readOnly: true,className: "htLeft" },
        { type: 'text', title : 'UOM' , data: 'uom',className: "htLeft" },
        { type: 'text', title : 'Purchase UOM' , data: 'purchase_uom' ,className: "htLeft"},
        { type: 'text', title : 'Item Color' , data: 'item_code',className: "htLeft" },
        { type: 'text', title : 'Material Size' , data: 'size',className: "htLeft" },
        { type: 'text', title : 'RM IN Date' , data: 'rm_in_date',className: "htLeft" },
        { type: 'text', title : 'Revised RM IN Date' , data: 'rm_revised_in_date',className: "htLeft" },
        { type: 'text', title : 'Unit price $' , data: 'unit_price',className: "htRight" },
        { type: 'text', title : 'Qty' , data: 'req_qty',className: "htRight" },
        { type: 'text', title : 'Value' , data: 'tot_qty',className: "htRight" }


      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 250,
      stretchH: 'all',
      selectionMode: 'range',
      //fixedColumnsLeft: 0,
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,

    }
  }

  initializeHeaderForm(){
    this.formHeader = this.fb.group({
      po_id: 0,
      prl_id : 0,
      po_type : [null , [Validators.required]],
      po_date : null,
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
      po_status : null,
      approval_status : null
    })
    this.formValidatorHeader = new AppFormValidator(this.formHeader , {})
  }

  loadHeaderFormData()
  {

    //this.Loadpotype()
    //this.loadSuppliers()
    this.loadCompany()
    this.loadLocation()
    this.loadShipMode()



  }

  loadLocation() {
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

   loadCompany() {
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


  viewHeader(id) {
    let loaddatapor$
    loaddatapor$=this.http.post(this.apiUrl + 'merchandising/po-manual/revision_header' ,{ 'POID' : id })
    loaddatapor$.subscribe(
      (data) =>{

        this.currency_load = data.data['order_details'][0]['currency_code']
        if(data.data['order_details'][0]['po_status']=='PLANNED'){
          this.processingConfirm = false
        }
        console.log(data.data['order_details'][0]['deli_date2'])
        this.formHeader.setValue({
          po_id: data.data['order_details'][0]['po_id'],
          prl_id : data.data['order_details'][0]['prl_id'],
          po_type : data.data['order_details'][0]['bom_stage_description'],
          po_date : new Date(data.data['order_details'][0]['po_date']),
          supplier : data.data['order_details'][0]['supplier_name'],
          currency : data.data['order_details'][0]['currency_code'],
          delivery_date : new Date(data.data['order_details'][0]['deli_date2']),
          deliverto : data.data['deli_loc'][0],
          invoiceto : data.data['inv_loc'][0],
          special_ins : data.data['order_details'][0]['special_ins'],
          pay_mode : data.data['pay_mode'][0]['payment_mode'],
          pay_term : data.data['pay_term'][0]['payemnt_terms'],
          ship_mode : data.data['ship_mode'][0],
          ship_term : data.data['ship_term'][0]['ship_terms_agreed'],
          po_number : data.data['order_details'][0]['po_number'],
          po_status : data.data['order_details'][0]['po_status'],
          approval_status : data.data['order_details'][0]['approval_status']
        })

         this.paymodeDivisions = data.data['pay_mode']
         this.paytermDivisions = data.data['pay_term']
         this.shiptermDivisions = data.data['ship_term']

         this.formHeader.get('pay_mode').disable()
         this.formHeader.get('pay_term').disable()
         this.formHeader.get('ship_term').disable()

         //console.log(this.formHeader['value']['po_status'])
         if(this.formHeader['value']['po_status']=='CONFIRMED'){
           this.processdetails = true
           this.processsendtoapp = false
         }
         if(this.formHeader['value']['po_status']=='CANCELLED'){
           this.processdetails = true
           this.processingConfirm = true
           this.processingprint = true
         }
         //

         this.loadTable()



          },
        (error)=>{
          console.log(error)
          }
        );

    }

    loadTable(){
      this.dataset.splice(0)
      let formData = this.formHeader.getRawValue();
      //console.log(formData)

      AppAlert.showMessage('Processing...','Please wait while saving details')
      this.http.post(this.apiUrl + 'merchandising/po-manual-details/load_por_line' , formData)
      .subscribe(data => {

        //console.log(data);

         let count_ar =  data['data']['count']

         if(count_ar == 0){
           this.dataset.splice(0);
           const hotInstance = this.hotRegisterer.getInstance(this.instance);
           hotInstance.render()
         }
         //console.log(data['data']['load_list'])
         var sum_value_load = 0;
         for (var _i = 0; _i < count_ar; _i++)
            {
           this.dataset.push(data['data']['load_list'][_i])

           sum_value_load += parseFloat(data['data']['load_list'][_i].value_sum);
           var k = parseFloat(sum_value_load.toString()).toFixed(4);
           var element1 = <HTMLInputElement> document.getElementById("sum_total");
           element1.value = Number(k).toLocaleString('en', {minimumFractionDigits: 4, maximumFractionDigits: 4});

           const hotInstance = this.hotRegisterer.getInstance(this.instance);
           hotInstance.render()
            }


       setTimeout(() => { AppAlert.closeAlert() } , 1000)
        },
       error => {
         //this.snotifyService.error('Inserting Error', this.tosterConfig)
         setTimeout(() => { AppAlert.closeAlert() } , 1000)
       })


    }

    contextLineClosed(row){
      let closedetais$
      let data = this.dataset[row]
      //console.log(data)

      AppAlert.showConfirm({text : 'Do you want to Close this line?'},(result) => {
        if(result.value){

          closedetais$=this.http.post(this.apiUrl + 'merchandising/po-manual-details/close_line_details' ,
          { 'line_id' : data.id });
          closedetais$.subscribe(
            (res) =>{

              if(res['data']['status']=="error")
              {
                //this.snotifyService.error(data['data']['message'], this.tosterConfig)
                  AppAlert.showError({text:res['data']['message']})
              }
              else
              {

              AppAlert.showSuccess({text:res.data.message})
              this.processdetails = true
              this.processingprint = false

              this.loadTable();

              }

            },
              (error)=>{
                console.log(error)
              }

          );


        }
      })



    }

    //remove Lines from po
    contextLineRemove(row){
      let data = this.dataset[row]
      //alert(data.id)
      AppAlert.showConfirm({text : 'Do you want to remove this line?'},(result) => {
        if(result.value){
          this.http.delete(this.apiUrl + 'merchandising/po-manual-details/' + data.id)
          .subscribe(
            (data) => {
              //console.log(data)
              if(data['data']['status']=="error")
              {
                // this.snotifyService.error(data['data']['message'], this.tosterConfig)
                   AppAlert.showError({text:data['data']['message']})
              }
              else if(data['data']['status']=="succes")
              {
                //this.snotifyService.success('Line was removed successfully', this.tosterConfig);
                AppAlert.showSuccess({text:'Selected Line(s) Cancelled Successfully.'})
                this.dataset.splice(row, 1)
                const hotInstance = this.hotRegisterer.getInstance(this.instance);
                hotInstance.render()

                if(data['data']['Check_PO'] == 0){
                  this.formHeader.patchValue({po_status: 'CANCELLED' });
                  this.processdetails = true
                  this.processingConfirm = true
                  this.processingprint = true
                }
              }


            },
            (error) => {
              AppAlert.showError({text : 'Process Error'})
            }
          )
        }
      })
    }


    send_to_approval(){
      let savedetais$
      let formData = this.formHeader.getRawValue();
      console.log(formData)
      if(formData['approval_status'] != 'PENDING'){
        let lines = this.dataset
        this.processsendtoapp = true

        if(formData['po_status']=="CONFIRMED"){

          savedetais$=this.http.post(this.apiUrl + 'merchandising/po-manual-details/send_to_approval' ,
          { 'lines' : lines ,'formData':formData });
          savedetais$.subscribe(
            (res) => {

              //this.processsendtoapp = false
              AppAlert.showSuccess({text: 'Approval Sent Successfully'})

            },
              (error)=>{
                console.log(error)
              }

          );

        }

      }else{
         AppAlert.showError({ text : 'Already Send For Approval' });
      }

    }

    updatedetails()
    {
      let savedetais$
      let arr=[]
      var x=this.dataset.length;
      var i;
      let formData = this.formHeader.getRawValue();
      formData['delivery_date'] = formData['delivery_date'].toISOString().split("T")[0]

      //console.log(formData);
      //console.log(this.dataset);

      for(i=0;i<x;i++){
    //  if(this.dataset2[i]['tra_qty']!=0){

        savedetais$=this.http.post(this.apiUrl + 'merchandising/po-manual-details/save_line_details_revision' ,
        { 'lines' : this.dataset ,'formData':formData });
        savedetais$.subscribe(
          (res) =>{

            if(res['data']['status']=="error")
            {
              //this.snotifyService.error(data['data']['message'], this.tosterConfig)
                AppAlert.showError({text:res['data']['message']})
            }
            else
            {

            AppAlert.showSuccess({text:res.data.message})
            this.processdetails = true
            this.processingprint = false

            this.loadTable();

            }

          },
            (error)=>{
              console.log(error)
            }

        );
        return;
      //}


    }
    AppAlert.showError({text:"please Enter Revise Qty"})

    }


    confirmdetails(){
      let formData = this.formHeader.getRawValue();
      AppAlert.showConfirm({
        'text' : 'Do you want to confirm this purchase order?'
            },(result) => {
        if (result.value) {

          this.http.post(this.apiUrl + 'merchandising/po-manual-details/confirm_po' , { 'formData' : formData } )
          .pipe( map( res => res['data']) )
          .subscribe(
           data =>
           {
             AppAlert.showSuccess({ text : data.message });
             this.formHeader.patchValue({po_status: 'CONFIRMED' });
             this.processdetails = true
             this.processingConfirm = true
             this.processingprint = false
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
      let formData = this.formHeader.getRawValue();
      //console.log(formData)
      window.open(AppConfig.POReport()+"?po_no="+formData['po_number'], '_blank');
      //AppConfig.POReport()+"?po_no="+formData['po_number'];


    }

    onSelect(data: TabDirective): void {

      if(data.heading == 'Purchase Orders'){
        //debugger
        setTimeout(() => {
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          hotInstance.render()
        } , 1000)

      }




      if(data.heading == 'Purchase Orders History'){

        this.dataset2=[];

        let formData = this.formHeader.getRawValue();
        console.log(formData);
        // if(this.shopOrderId != null)
        // {
         this.http.post(this.apiUrl + 'merchandising/load_po_history' ,{ 'formData' : formData })
         .pipe( map(res => res['data'] ))
         .subscribe(
           data => {

             console.log(data['load_history'])

            let count_his =  data['load_history']['length']
               for (var _k = 0; _k < count_his; _k++)
                   {
                     this.dataset2.push(data['load_history'][_k])
                   }

               const hotInstance2 = this.hotRegisterer.getInstance(this.instance2);
               hotInstance2.render()

            }, error => {


               }
            )

        //   }

      }

    }








}
