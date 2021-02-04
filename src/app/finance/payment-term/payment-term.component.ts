import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { BasicValidators } from '../../core/validation/basic-validators';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';


//import { PaymentTerm } from '../models/payment-term.model';

@Component({
  selector: 'app-payment-term',
  templateUrl: './payment-term.component.html',
  styleUrls: []
})
export class PaymentTermComponent implements OnInit {

  @ViewChild(ModalDirective) paymentTermModel: ModalDirective;

  formValidator : AppFormValidator = null
  formGroup : FormGroup
  modelTitle : string = "New Payment Term"
  apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable : any = null
  saveStatus = 'SAVE'

  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false


  //to manage form error messages
  formFields = {
    payment_code : '',
    payment_description : '',
    validation_error:''
  }

  constructor(private fb : FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService,private titleService: Title,private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
  //this.titleService.setTitle("Payment Term")
 let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
  let remoteValidationConfig = { //configuration for payment term code remote validation
    url:this.apiUrl + 'finance/accounting/payment-terms/validate?for=duplicate',
    formFields : this.formFields,
    fieldCode : 'payment_code',
    /*error : 'Payment code already exists',*/
    data : {
      payment_term_id : function(controls){
        console.log(controls)
        return controls['payment_id']['value']}
    }
  }

  let basicValidator = new BasicValidators(this.http)//create object of basic validation class

  this.formGroup = this.fb.group({ // create the form
    payment_id : 0,
    payment_code : [null , [Validators.required,Validators.minLength(3)],[primaryValidator.remote(remoteValidationConfig)]],
    payment_description : [null , [Validators.required,PrimaryValidators.noSpecialCharactor] ],
  })

  let customErrorMessages  = { //custom error messages
    payment_code : { required : 'Payment code cannot be empty'},
    payment_description : { 'required' : 'Description cannot be empty'  }
  }

  //create new validation object
  this.appValidator = new AppValidator(this.formFields,customErrorMessages,this.formGroup);
  this.formValidator = new AppFormValidator(this.formGroup , {});
  this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
    //console.log(data)
    this.appValidator.validate();
  })

  this.createTable() //initialize datatable
  //this.titleService.setTitle("Payment Term")//set page title
  /*this.layoutChangerService.changeHeaderPath([
    'Catalogue',
    'Finance',
    'Payment Term'
  ])*/
  //listten to the menu collapse and hide button
  this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
    if(data == false){return;}
    if(this.datatable != null){
      this.datatable.draw(false);
    }
  })

  }

  savePaymentTerm() { //save and update payment term

    this.appValidator.validate();
    let saveOrUpdate$ = null;
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let paymentId = this.formGroup.get('payment_id').value;

    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'finance/accounting/payment-terms',this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'finance/accounting/payment-terms/' + paymentId,this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        if(res.data.status=='0'){
        this.processing = false
        AppAlert.showError({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.paymentTermModel.hide()
        }
        else if(res.data.status=='1'){
        this.processing = false
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.paymentTermModel.hide()
      }
     },
     (error) => {
       AppAlert.closeAlert()
       console.log(error)
       if(error.status == 422){ //validation error
         AppAlert.showError({title : 'Validation Error' , text : error.error.errors.validationErrorsText })
       }
       else{
         AppAlert.showError({text : 'Process Error' })
       }
     }
   );
  }

  ngOnDestroy(){
    this.datatable = null
  }

  createTable() { //initialize datatable
     this.datatable = $('#tbl_payment_term').DataTable({
     autoWidth: false,
     scrollY: "500px",
     //scrollX:true,
     scrollCollapse: true,
     processing: true,
     serverSide: true,
     order:[[0,'desc']],
     ajax: {
          headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
          dataType : 'JSON',
          "url": this.apiUrl + "finance/accounting/payment-terms?type=datatable"
     },
       columns: [
            {
              data: "payment_term_id",
              //orderable: false,
              width: '8%',
              render : (data,arg,full) => {
                var str = ''
                if(this.permissionService.hasDefined('PAYMENT_TERM_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                }
                if(this.permissionService.hasDefined('PAYMENT_TERM_DELETE')){ //check delete permission
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"data-status="'+full['status']+'" ></i>';
                }

                return str;
             }
           },
           {
             data: "status",
             render : function(data){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
           { data: "payment_code" },
           { data: "payment_description" },

       ]
     });

     //listen to the click event of edit and delete buttons
     $('#tbl_payment_term').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value'],att['data-status']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
  	 this.datatable.ajax.reload(null, false);
  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'finance/accounting/payment-terms/' + id)
    .pipe( map(res => res['data']))
    .subscribe(data => {
      if(data['status'] == '1') {
        this.paymentTermModel.show()
        this.modelTitle = 'Update Payment Term'
        this.formGroup.setValue({
         'payment_id' : data['payment_term_id'],
         'payment_code' : data['payment_code'],
         'payment_description' : data['payment_description']
        })
        this.formGroup.get('payment_code').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id,status) { //deactivate payment term
    if(status==0){
      return
    }
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Payment Term?'
    },(result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'finance/accounting/payment-terms/' + id)
        .pipe(map( data => data['data'] ))
        .subscribe(
            (data) => {
              if(data.status=='0'){
                AppAlert.showError({text:data.message})
                this.reloadTable()
              }
              else if(data.status=='1')
                this.reloadTable()
            },
            (error) => {
              console.log(error)
            }
        )
      }
    })
  }

 //show event of the bs model
 showEvent(event){
   this.formGroup.get('payment_code').enable()
   this.formGroup.reset();
   this.modelTitle = 'New Payment Term'
   this.saveStatus = 'SAVE'
 }

 formValidate(){ //validate the form on input blur event
   this.appValidator.validate();
 }

 onResize(event) {
     if(this.datatable!=null){
    this.reloadTable()
   //event.target.innerWidth;
 }
}
}
