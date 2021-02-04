import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HotTableModule } from '@handsontable/angular';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map } from 'rxjs/operators';
import { AuthService } from '../../core/service/auth.service';
declare var $:any;

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
import {ComponentLoaderFactory} from 'ngx-bootstrap/component-loader';
declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { MeterialTranferService} from './meterial-transfer.service';
import { Router } from '@angular/router';
import { PermissionsService } from '../../core/service/permissions.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
@Component({
  selector: 'app-material-transfer-in',
  templateUrl: './material-transfer-in.component.html',
  styleUrls: ['./material-transfer-in.component.css']
})
export class MaterialTransferInComponent implements OnInit {

  @ViewChild(ModalDirective) matTransInModel: ModalDirective;

  formGroup : FormGroup
  readonly apiUrl = AppConfig.apiUrl()
  url = this.apiUrl + 'stores/material-transfer'
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'
  currentDataSetIndex : number = -1
 instance = null
modelTableTitle = ''
  dataset: any[] = [];
  hotOptions: any
  $_userLocation:any
  $_store_id:any
  $_sub_store_id:any


  gatePassNo$:Observable<any[]>;
  gatePassNoLoading=false;
  gatePassNoInput$=new Subject<string>();
  selectedGatePassNo:any[];
  processing : boolean = false
  saved:boolean=false
  isDisableSaveButton:boolean=true

  //to manage form error messages
  formFields = {
  gate_pass_no:''
  }


  constructor(private router:Router,private fb:FormBuilder , private http:HttpClient, private titleService: Title, private hotRegisterer: HotTableRegisterer, private auth:AuthService, private permissionService : PermissionsService,private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
      this.titleService.setTitle("Material Transfer In")//set page title
    this.loadGatepsssNo()
    this.auth.getToken()
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/uom/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'transfer_id',

      data : {
        mat_trans_id : function(controls){ return controls['mat_trans_id']['value']},
        transfer_id : function(controls){ return controls['transfer_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      gate_pass_no :[0 , [Validators.required]],
    })

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    // this.createTable() //load data list
    this.initializeMaterialTransferInTable() //initialize handson table for material transfer in

    this.layoutChangerService.changeHeaderPath([
      'Warehouse Management',
      'Stores',
      'Material Transfer In'
    ])

  }
  //

  initializeMaterialTransferInTable(){
    this.hotOptions = {
      columns: [
      //  { type: 'checkbox', title : 'Action' , readOnly: false , checkedTemplate: 'yes',  uncheckedTemplate: 'no' },
      //  { type: 'text', title : 'Item Code' , data: 'master_code', readOnly: true},
        { type: 'text', title : 'Item Code' , data: 'master_code' , readOnly: true},
        { type: 'text', title : 'Shop Order ID' , data: 'shop_order_id_from' , readOnly: true },
        { type: 'text', title : 'Shop Order Detail ID' , data: 'shop_order_detail_id' , readOnly: true },
        { type: 'text', title : 'Style NO' , data: 'style_no' , readOnly: true },
        { type: 'text', title : 'Item Color' , data: 'color_name' , readOnly: true},
        { type: 'text', title : 'Size' , data: 'size_name' , readOnly: true},
        {
          title : 'Store',
          type: 'autocomplete',
          source:(query, process)=>{
            var url=$('#url').val();
            $.ajax({
              url:this.apiUrl+'stores/material-transfer?type=getStores',
              dataType: 'json',
              data: {
                query: query,
                location:this.$_userLocation,
              },
              success: function (response) {
                  //console.log(response);
                  process(response);
                  }
            });
          },
          strict: true,
          data:'store_name',
          readOnly: false
        },
        {
          title : 'Sub Store',
          type: 'autocomplete',
          source:(query, process)=> {
            var url=$('#url').val();
            //debugger
          //var ve=surce
            $.ajax({
              url:this.apiUrl+'stores/material-transfer?type=getSubStores',
              dataType: 'json',
              data: {
                query: query,
                location:this.$_userLocation,
                store:this.$_store_id
              },
              success: function (response) {
                process(response);

              }
            });
          },
          strict: true,
          data: 'substore_name',
          readOnly: false
        },
        {
          title : 'Bin',
          type: 'autocomplete',
          source:(query, process)=> {
            var url=$('#url').val();
            $.ajax({
                url:this.apiUrl+'stores/material-transfer?type=getBins',
              dataType: 'json',
              data: {
                query: query,
                store:this.$_store_id,
                substore:this.$_sub_store_id
              },
              success: function (response) {
                process(response);

              }
            });
          },
          strict: true,
          data: 'store_bin_name',
          readOnly: false
        },
        { type: 'text', title : 'Inventory UOM' , data: 'uom_code' , readOnly: true},
        { type: 'text', title : 'Shade' , data: 'shade' , readOnly: true},
        { type: 'text', title : 'Width' , data: 'width' , readOnly: true},
        { type: 'text', title : 'Batch NO' , data: 'batch_no' , readOnly: true},
        { type: 'text', title : 'LOT NO' , data: 'lot_no' , readOnly: true},
      /*  { type: 'text', title : 'Stock Balance' , data: 'total_stock_qty_location',readOnly: true },*/
        { type: 'text', title : 'Transfer Qty' , data: 'trns_qty', readOnly: true },
        { type: 'text', title : 'Received Qty' , data: 'received_qty',readOnly: true}
      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 250,
      stretchH: 'all',
      selectionMode: 'range',
      fixedColumnsLeft: 3,
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
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
      afterChange:(changes,surce,row,col,value,prop)=>{
        //debugger
        let x=this.dataset;

        if(surce!=null){
          let row=surce["0"]["0"];

          if(this.dataset[row]["total_qty"]<surce["0"]["3"]){
            AppAlert.showError({text:"Stock Qty Exceeded"});

            this.dataset[row]['trns_qty'] = 0;


           const hotInstance = this.hotRegisterer.getInstance(this.instance);
           hotInstance.render();





          }

      }

        },
        afterSelection :(changes,surce,row,col,value,prop)=>{
          if(row==7){
        //debugger
        this.$_store_id=this.dataset[surce]['store_name']
        if(  this.$_store_id==undefined)
        this.$_store_id=""

      }
      if(row=8){
        //debugger
        this.$_store_id=this.dataset[surce]['store_name']
        this.$_sub_store_id=this.dataset[surce]['substore_name']
        if(this.$_store_id==undefined)
        this.$_store_id=""
        if(this.$_sub_store_id==undefined)
        this.$_sub_store_id=""
      }

        },

    }
  }





  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

loadGatepsssNo(){

  this.gatePassNo$= this.gatePassNoInput$
  .pipe(
     debounceTime(200),
     distinctUntilChanged(),
     tap(() => this.gatePassNoLoading = true),
     switchMap(term => this.http.get<any[]>(this.apiUrl + 'stores/material-transfer?type=auto' , {params:{search:term}})
     .pipe(
         //catchError(() => of([])), // empty list on error
         tap(() => this.gatePassNoLoading = false)
     ))
  );


}
  //save and update source details
  saveUOM(){
    //this.appValidation.validate();
    let saveOrUpdate$ = null;
    let uomId = this.formGroup.get('mat_trans_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/uom', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/uom/' + uomId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.matTransInModel.hide()
     },
     (error) => {
         console.log(error)
     }
   );
  }

/*  loadOrderLineDetails(id){
    this.http.get(this.apiUrl + 'store/mat-trans-in/' + id)
    .pipe( map(res => res['data']))
    .subscribe(data => {
        // this.saveStatusDetails = 'UPDATE'
        this.formGroup.setValue({
          transaction_id : data['transaction_id'],
          doc_num : data['doc_num'],
          style_description : data['style_description'],
          customer_po_id : data['customer_po_id'],
          item_code : data['item_code'],
          material_code : data['material_code'],
          customer_name : data['customer_name'],
          color_name : data['color'],
          size_name : data['size'],
          bin_name : data['bin'],
          uom : data['uom'],
          stock_balance : data['stock_balance'],
          transfer_qty : data['transfer_qty'],
          received_qty : data['received_qty']
        })
    })
  }*/


  // showEvent(event){ //show event of the bs model
  //   this.formGroup.get('uom_code').enable()
  //   this.formGroup.reset();
  //   this.modelTitle = "New UOM"
  //   this.saveStatus = 'SAVE'
  // }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

searchFrom(){
  //debugger
  this.dataset=[];
  var formData=this.formGroup.getRawValue()
  let gatePassNo=formData['gate_pass_no']['gate_pass_id']
        this.dataset = []
      this.http.get(this.apiUrl + 'stores/material-transfer?type=loadDetails&gatePassNo='+gatePassNo)
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      //debugger
      this.dataset = data.dataset
      this.$_userLocation=data.user_location
      var x=this.dataset.length;
      if(x>0){
        this.isDisableSaveButton=false;
      }
      var i;
      //loop through data set for checking null stock values in current location
      for(i=0;i<x;i++){
        //console.log(this.dataset[i]['total_qty']);
        if(this.dataset[i]['total_qty']==null){
            //set 0 for empty valus in stock
          this.dataset[i]['total_qty']=0;
        }
        this.dataset[i]['received_qty']=this.dataset[i]['trns_qty']

        }
        //console.log(this.dataset);
      //var x=this.dataset.length;
      //var i;


})
}

clearData(){
  this.dataset=[];
  this.formGroup.reset();
  const hotInstance = this.hotRegisterer.getInstance(this.instance);
  this.isDisableSaveButton=true;

}

saveDetails(){
  //debugger
  let savedetais$
  this.processing = true
  AppAlert.showMessage('Processing...','Please wait while saving details')
  this.saved=true
  var gate_pass_id ;
  //let gate_pass_id=gate_pass_no['gate_pass_no']['loc_id'];
var formData=this.formGroup.getRawValue()
  var x=this.dataset.length;
  console.log(this.dataset);
  var i;
  //var validator=true
 for(i=0;i<x;i++){
   if(this.dataset[i]['store_name']==null||this.dataset[i]['substore_name']==null||this.dataset[i]['store_bin_name']==null){
     AppAlert.showError({text:"please Enter All Details"})
  //  this.dataset=this.dataset
    //validator=false
     return 0;
   }
   }

   gate_pass_id= formData['gate_pass_no']['gate_pass_id'];
   savedetais$=this.http.post(this.apiUrl+'stores/material-transfer-store',{'data':this.dataset,'gate_pass_id':gate_pass_id});
   savedetais$.subscribe(
     (res) =>{

       AppAlert.showSuccess({text:res.data.message})
       this.clearData()

     },
       (error)=>{
        console.log(error)
      }

   );
  return;


  //AppAlert.showError({text:"please Enter Transfer Qty"})


}


}
