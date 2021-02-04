import { Component, OnInit , ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { map } from 'rxjs/operators';

import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { BasicValidators } from '../../core/validation/basic-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { AppFormValidator } from '../../core/validation/app-form-validator';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: []
})
export class PaymentMethodComponent implements OnInit {

  @ViewChild(ModalDirective) paymentMethodModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Payment Method"
  apiUrl = AppConfig.apiUrl()
  appValidation : AppValidator
  datatable : any=null
  saveStatus = 'SAVE'
  processing : boolean = false
  //to manage form error messages
  formFields = {
    payment_method_code : '',
    payment_method_description : ''
  }

  constructor(private fb:FormBuilder,private http:HttpClient,private titleService: Title, private permissionService : PermissionsService,  private auth : AuthService,
private layoutChangerService : LayoutChangerService) {
  }

  ngOnInit() {
     let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
     //this.titleService.setTitle("payemnt method")
    let remoteValidationConfig = { //configuration for payment term code remote validation
      url:this.apiUrl + 'finance/accounting/payment-methods/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'payment_method_code',
      // error : 'Payment Method Code Already Exits',
      data : {
        payment_method_id : function(controls){
          console.log(controls)
          return controls['payment_method_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({ // create the form
      payment_method_id : 0,
      payment_method_code : [null , [Validators.required , Validators.minLength(2)],[primaryValidator.remote(remoteValidationConfig)]],
      payment_method_description : [null , [Validators.required,PrimaryValidators.noSpecialCharactor]],
    })

    let customErrorMessages  = { //custom error messages
      payment_method_code : { required : 'Payment Method code cannot be empty'},
      payment_method_description : { 'required' : 'Description cannot be empty'  }
    }

    //create new validation object
    this.appValidation = new AppValidator(this.formFields,customErrorMessages,this.formGroup);
    this.formValidator = new AppFormValidator(this.formGroup , {});
    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes

      this.appValidation.validate();
    })

    this.createTable(); //initialize datatable
    //change header nevigation pagePath
  /*  this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'Finance',
      'Payment Method'
    ])*/
    //listten to the menu collapse and hide button
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

  }


  savePaymentMethod() { //save and update payment term
    //this.appValidation.validate();
      let saveOrUpdate$ = null;
      this.processing=true;
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let paymentId = this.formGroup.get('payment_method_id').value;

    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'finance/accounting/payment-methods',this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'finance/accounting/payment-methods/' + paymentId,this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        if(res.data.status=='0'){
          this.processing=false;
          AppAlert.showError({text : res.data.message })
          this.formGroup.reset();
          this.reloadTable()
          this.paymentMethodModel.hide()
        }
        else if(res.data.status=='1'){
        this.processing=false;
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.paymentMethodModel.hide()
      }
      //

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
     this.datatable = $('#tbl_payment_method').DataTable({
     autoWidth: true,
     scrollY: "500px",
     scrollCollapse: true,
     processing: true,
     serverSide: true,
     order:[[0,'desc']],
     ajax: {
          headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
          dataType : 'JSON',
          "url": this.apiUrl + "finance/accounting/payment-methods?type=datatable"
      },
       columns: [
            {
              data: "payment_method_id",
              width: '8%',
              render : (data,arg,full) => {
                var str = ''
                if(this.permissionService.hasDefined('PAYMENT_METHOD_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                }
                if(this.permissionService.hasDefined('PAYMENT_METHOD_DELETE')){ //check delete permission
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
           { data: "payment_method_code" },
           { data: "payment_method_description" },

       ]
     });

     //listen to the click event of edit and delete buttons
     $('#tbl_payment_method').on('click','i',e => {
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
    this.http.get(this.apiUrl + 'finance/accounting/payment-methods/' + id)
    .pipe( map(res => res['data']))
    .subscribe(data => {
      if(data['status'] == '1') {
          this.paymentMethodModel.show()
          this.modelTitle = 'Update Payment Method'
          this.formGroup.setValue({
           'payment_method_id' : data['payment_method_id'],
           'payment_method_code' : data['payment_method_code'],
           'payment_method_description' : data['payment_method_description']
          })
          this.formGroup.get('payment_method_code').disable()
          this.saveStatus = 'UPDATE'
      }
    })
  }

  delete(id,status) { //deactivate payment term
    if(status==0){
      return
    }
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Payment Method?'
    },(result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'finance/accounting/payment-methods/' + id)
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
    //debugger
    this.formGroup.get('payment_method_code').enable()
    this.formGroup.reset();
    this.modelTitle = 'New Payment Method'
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidation.validate();
  }

}
