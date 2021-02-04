import { Component, OnInit , ViewChild} from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';
import Swal from 'sweetalert2';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
//declare var $:any;

import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { AppValidator } from '../../core/validation/app-validator';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import{ NonInvGrnService} from'./non-inv-grn-services.service';

import { Location } from '../../org/models/location.model';
import { Deliverto } from '../../merchandising/models/deliverto.model';
import { Invoiceto } from '../../merchandising/models/invoiceto.model';
import { Po } from './manualpono.model';

@Component({
  selector: 'app-non-inventory-grn-home',
  templateUrl: './non-inventory-grn-home.component.html',
  styleUrls: []
})
export class NonInventoryGrnHomeComponent implements OnInit {

  readonly apiUrl = AppConfig.apiUrl()
  formGroup : FormGroup;
  formValidatorHeader : AppFormValidator;
  appValidator : AppValidator;
  processingHeader : boolean = false;
  saveStatus = 'SAVE';

  formValidatorDetails : AppFormValidator;
  saveStatusDetails = 'SAVE';

  currentDataSetIndex : number = -1
  processingDetails : boolean = false
  hotOptions: any
  instance: string = 'instance'
  dataset: any[] = []
  orderId = 0;
  detailId = 0;
  loadingHeader : boolean = false
  loadingCountHeader : number = 0
  loadingDetails : boolean = false
  loadingCountDetails : number = 0
  initializedDetails : boolean = false
  today : Date;

  poList$: Observable<Po[]>;
  poLoading = false;
  poInput$ = new Subject<string>();

  deliverto$: Observable<Deliverto[]>;
  delivertoLoading = false;
  delivertoInput$ = new Subject<string>();

  invoiceto$: Observable<Invoiceto[]>;
  invoicetoLoading = false;
  invoicetoInput$ = new Subject<string>();
  confirmButtonEnable=false;

  // poList$: Observable<Array<any>>

  formFields = {
    po_no : '',
    sup_name : '',
    invoice_no : '',
    invoiceto : '',
    deliverto : '',
    validation_error:''
  }

  //toster plugin
  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}

  constructor(private fb:FormBuilder , private http:HttpClient , private layoutChangerService : LayoutChangerService,private grnService:NonInvGrnService,private hotRegisterer: HotTableRegisterer, private snotifyService: SnotifyService) {
    this.today = new Date();
    this.today.setDate(this.today.getDate() + 1);
  }

  ngOnInit() {

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    this.grnService.grnData.subscribe(headerData=>{
    if(headerData!=null){
      this.formGroup.setValue({
      'grn_id':headerData.headerData.grn_id,
      'grn_number':headerData.headerData.grn_number,
      'po_no' : headerData.headerData.po_number,
      'po_id':headerData.headerData.po_id,
      'sup_name': headerData.headerData.supplier_name,
      'sup_id': headerData.headerData.sup_id,
      'invoice_no':headerData.headerData.invoice_no,
      'invoiceto':headerData.Invoiceto,
      'invoice_id':headerData.headerData.invoice_id,
      'deliverto' :headerData.deliveryLocation,
      'deliver_id': headerData.headerData.deliver_id,
      'grn_status':headerData.headerData.grn_status,
      'status':1,
      'remark_header':headerData.headerData.remark_header
    })
    this.formGroup.get('po_no').disable()
    this.formGroup.get('sup_name').disable()
    this.formGroup.get('deliverto').disable()
    this.formGroup.get('remark_header').disable()
    this.formGroup.get('invoiceto').disable()
    this.dataset=headerData.detailsData
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    hotInstance.render()
    this.saveStatus="EDIT"
    }
    })

    let remoteValidationConfig = { //configuration for invoice no remote validation
      url:this.apiUrl + 'stores/non_inv_grn/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'invoice_no',
      data : {
        invoice_no : function(controls){ return controls['invoice_no']['value']},
        grn_id:function(controls){if(controls['grn_id']['value']!=null) {return (controls['grn_id']['value'])}
        else
        return null;
      },
    }
  }

  this.formGroup = this.fb.group({
    grn_id:null,
    grn_number:null,
    po_no : [null, [Validators.required]],
    po_id:null,
    sup_name: null,
    sup_id: null,
    invoice_no:[null, [Validators.required], [primaryValidator.remote(remoteValidationConfig)]],
    invoiceto:[null, [Validators.required]],
    invoice_id:null,
    deliverto : [null , [Validators.required]],
    deliver_id: null,
    grn_status:null,
    status:1,
    remark_header:null
  })
  this.formValidatorHeader = new AppFormValidator(this.formGroup , {})

  // this.initializeHeaderForm() //create order header form group
  this.initializeOrderLinesTable()//initialize handson table for order lines
  //create new validation object
  this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

  this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
    this.appValidator.validate();
  });

  //change header nevigation pagePath
  this.layoutChangerService.changeHeaderPath([
    'Product Development',
    'Development',
    'Non Inventory GRN'
  ])

  this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
    if(data == false){return;}
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    if(hotInstance != undefined && hotInstance != null){
      hotInstance.render();
    }
  })


  this.loadCompany();
  this.loadLocation();
  this.loadManualPO();
}

//initialize form group for customer order header
initializeHeaderForm(){

}

loadCompany() {
  this.invoiceto$ = this.invoicetoInput$
  .pipe(
    debounceTime(200),
    distinctUntilChanged(),
    tap(() => this.invoicetoLoading = true),
    switchMap(term => this.http.get<Invoiceto[]>(this.apiUrl + 'merchandising/load_company' , {params:{search:term}})
    .pipe(
      //catchError(() => of([])), // empty list on error
      tap(() => this.invoicetoLoading = false)
    ))
  );
}

//load locations
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

loadManualPO(){
  this.poList$ = this.poInput$
  .pipe(
    debounceTime(200),
    distinctUntilChanged(),
    tap(() => this.poLoading = true),
    switchMap(term => this.http.get<Po[]>(this.apiUrl + 'stores/non_inventory_grn_header?type=loadManualPO' , {params:{search:term}})
    .pipe(
      //catchError(() => of([])), // empty list on error
      tap(() => this.poLoading = false)
    ))
  );
}

loadPoInfo(e){
  let _poNo = this.formGroup.get('po_no').value
  _poNo = (_poNo == null || _poNo == '') ? '' : _poNo.po_id

  this.http.post(this.apiUrl + 'stores/load_po_info' ,{ 'po_no' : _poNo})
  .pipe( map(res => res['data'] ))
  .subscribe(
    data => {
      this.formGroup.patchValue({sup_name:data.order['supplier']['supplier_name'] })
      this.formGroup.patchValue({sup_id:data.order['supplier']['supplier_id'] })
      this.formGroup.patchValue({deliverto:data.order['location']['loc_name']})
      this.formGroup.patchValue({deliver_id:data.order['location']['loc_id'] })
      this.formGroup.patchValue({invoiceto:data.order['company']['company_name']})
      this.formGroup.patchValue({invoice_id:data.order['company']['company_id'] })
      this.formGroup.patchValue({remark_header:data.order['remark_header']})
      this.formGroup.get('deliverto').disable()
      this.formGroup.get('invoiceto').disable()
      this.formGroup.get('sup_name').disable()
      console.log(data.detail)
      this.dataset = data.detail

    },
    error => {
      // console.log(error)
    }
  )
}

//initilize details HotTableRegisterer
initializeOrderLinesTable(){
  this.hotOptions = {
    columns: [
      { type: 'text', title : 'Material Description' , data: 'description', className: "htLeft" },
      { type: 'text', title : 'UOM' , data: 'uom', className: "htLeft"},
      { type: 'numeric', title : 'PO Qty' , data: 'qty', className: "htRight" },
      { type: 'numeric', title : 'Balance Qty' , data: 'balance_qty', className: "htRight",placeholder: '0'},
      { type: 'numeric', title : 'Received Qty' , data: 'received_qty', readOnly:false, className: "htRight",placeholder: '0'},
      { type: 'text', title : 'Remark' , data: 'remark_detail', className: "htLeft"}
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
      if(surce != null && surce.length > 0){
        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        let _row = surce[0][0]
        if(surce[0][1]=='received_qty'){

          let _qty = (surce[0][3] == '' || isNaN(surce[0][3])) ? 0 : surce[0][3]
          if(surce["0"]["3"] <= 0){
            AppAlert.showError({text:"Invalid Qty"});
            this.dataset[_row]['received_qty'] = 0;
            const hotInstance = this.hotRegisterer.getInstance(this.instance);
            hotInstance.render();
            return;
          }
          if(_qty <= this.dataset[_row]['qty']){
            this.dataset[_row]['received_qty'] = _qty
          }else{
            AppAlert.showError({text:"Quantity must be smaller than or equal to PO Qty"})
              this.dataset[_row]['received_qty'] = 0;
          }



          hotInstance.render()
        }

        let x = this.dataset;
        this.setBalanceMainTable(surce);
      }
    },
    cells : function(row, col, prop , value){ //table cell render event. works for every cell in the table
      var cellProperties = {};

      if(col == 1){
        cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
          var args = arguments;

          Handsontable.renderers.TextRenderer.apply(this, args);
        }
      }
      return cellProperties;
    },

  }
}


countDecimals(_val) {
  if(Math.floor(_val) === _val) return 0;
  return _val.toString().split(".")[1].length || 0;
}

formatDecimalNumber(_number, _places){
  let num_val = parseFloat(_number+'e'+_places)//_number.toExponential(2)
  return Number(Math.round(num_val)+'e-'+_places);
}

setBalanceMainTable(surce){
  //debugger
  console.log(this.dataset);
  if(surce != null && surce["0"]["1"] == 'received_qty'){
    var row = surce["0"]["0"]
    var total_grn_qty=parseFloat(this.dataset[row]['total_grn_qty'])
    var po_qty=parseFloat(this.dataset[row]['qty']);
    var previous_received_qty=parseFloat(this.dataset[row]['previous_received_qty'])
    var value = this.dataset[row]['received_qty']
    var cur_bal_qty = po_qty-(total_grn_qty-previous_received_qty+value)

    /*if(bal_qty != null && bal_qty >= value){
      cur_bal_qty = bal_qty - value;
      //cur_bal_qty = oldValue - value;
    }else if(bal_qty == null && oldValue >= value){
      cur_bal_qty = oldValue - value;
    }else if(value <= 0){
      this.dataset[row]['received_qty'] = 0;
    }else{
      cur_bal_qty = bal_qty;
      this.dataset[row]['received_qty'] = 0;
    }*/

    if(this.countDecimals(cur_bal_qty) > 4){
      cur_bal_qty = this.formatDecimalNumber(cur_bal_qty, 4)
    }
    this.dataset[row]['balance_qty'] = cur_bal_qty;

    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    hotInstance.render();
  }

}

clearAll(){
  this.formGroup.reset()
  this.formGroup.enable()
//  this.formGroup.get('grn_no').disable()
  this.formGroup.get('remark_header').disable()
  this.dataset=[]
  this.saveStatus = 'SAVE';
  this.saveStatusDetails = 'SAVE';
  const hotInstance = this.hotRegisterer.getInstance(this.instance);
  hotInstance.render();
}

//save non-inventory-grn
saveGRN(){
  //console.log(this.dataset)
  //return

  if(this.dataset.length == 0){
    AppAlert.showError({text:"No Details to Save"})
    return 0;
  }
  this.processingDetails = true
  AppAlert.showMessage('Processing...','Please wait while saving details')
  let formData = this.formGroup.getRawValue();
  formData['po_id'] = formData['po_no']['po_id']
  var grn_id = formData['grn_id']
  var saveOrUpdate$ = null
  var check = ''

  this.dataset.forEach(element => {
    if(element['received_qty'] != 0 && element['received_qty'] != undefined){
      check = 'true'
    }else{
      if(element['balance_qty'] == 0){
      }else{
        check = 'false'
      }
    }
  });
  const hotInstance = this.hotRegisterer.getInstance(this.instance);
  for(var i=0;i<this.dataset.length;i++){
    hotInstance.setCellMeta(i, 4, 'readOnly' , 'true')
  }

  if(this.saveStatus == 'SAVE'){
    if(check == 'true'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'stores/non_inventory_grn_header',{'header':formData,'dataset':this.dataset})
    }else{
      AppAlert.showError({text : 'Enter Received Qty.'})
    }
  }else if(this.saveStatus == 'EDIT'){

  saveOrUpdate$=this.http.put(this.apiUrl+'stores/non_inventory_grn_header/'+grn_id,{'header':formData,'dataset':this.dataset})
  }

  saveOrUpdate$
  .pipe( map(res => res['data'] ) )
  .subscribe(
    (res) => {
      debugger
      this.formGroup.patchValue({grn_number: res.grn_no});
      this.formGroup.patchValue({grn_id: res.headerData['grn_id']});
      this.saveStatus = 'UPDATE'
      this.confirmButtonEnable=true;
      this.processingDetails = false

      setTimeout(() => {
        AppAlert.closeAlert()
        AppAlert.showSuccess({text : res.message })
      } , 1000)

    },
    (error) => {
      this.processingDetails = false
      setTimeout(() => {
        AppAlert.closeAlert()
        AppAlert.showError({text : 'Process Error' })
      } , 1000)
      console.log(error)
    }
  );

}

//confirm non-inventory grn
confirmGrn(){
  var grn_id = this.formGroup.get('grn_id').value

  AppAlert.showConfirm({
    'text' : 'Do you want to confirm this Non Inventory GRN ?'
  },(result) => {
    if (result.value) {

      this.http.post(this.apiUrl + 'stores/confirm_grn' , { 'grn_id' : grn_id } )
      .pipe( map( res => res['data']) )
      .subscribe(
        data =>
        {
          AppAlert.showSuccess({ text : data.message });
          this.formGroup.patchValue({grn_status: 'CONFIRMED' });
          this.clearAll();
          this.confirmButtonEnable=false
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


}
