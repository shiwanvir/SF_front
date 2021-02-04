import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service'
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: []
})
export class CurrencyComponent implements OnInit {

  @ViewChild(ModalDirective) currencyModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Currency"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'

  processing : boolean = false

  //to manage form error messages
  formFields = {
    currency_code : '',
    currency_description : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Currency")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'finance/currencies/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'currency_code',
      /*error : 'Dep code already exists',*/
      data : {
        currency_id : function(controls){ return controls['currency_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      currency_id : 0,
      currency_code :[null , [Validators.required,Validators.minLength(3), Validators.maxLength(10)],[primaryValidator.remote(remoteValidationConfig)]],
      currency_description : [null , [Validators.required, Validators.maxLength(100), PrimaryValidators.noSpecialCharactor]],
    })

    this.formValidator = new AppFormValidator(this.formGroup , {supplier_contact1:{numberRequired:"Incorrect Phone Number"},supplier_contact2:{numberRequired:"Incorrect Phone Number"},supplier_contact3:{numberRequired:"Incorrect Phone Number"}, bank_contact:{numberRequired:"Incorrect Phone Number"},intermediary_bank_contact:{numberRequired:"Incorrect Phone Number"},});//form validation class
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    if(this.permissionService.hasDefined('CURRENCY_VIEW')){
      this.createTable() //load data list
    }

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'Finance',
      'Currency'
    ])

    //listten to the menu collapse and hide button
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

  }

  ngOnDestroy(){
      this.datatable = null
  }


  createTable() { //initialize datatable
     this.datatable = $('#currency_tbl').DataTable({
       autoWidth: true,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[0,'desc']],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "finance/currencies?type=datatable"
        },
        columns: [
            {
              data: "currency_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('CURRENCY_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                }
                if(this.permissionService.hasDefined('CURRENCY_DELETE')){ //check delete permission
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                  data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'"></i>';
                }
                if( full.status== 0 ) {
                str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed;margin-right:3px" data-action="DISABLE" data-id="'+data+'">\n\
              </i><i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed" data-action="DISABLE" data-id="'+data+'"></i>';
              }
                return str;
             }
           },
           {
             data: "status",
             /*orderable: false,*/
             render : function(data){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
          { data: "currency_code" },
          { data: "currency_description" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#currency_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value'], att['data-status']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

  //save and update source details
  saveCurrency(){
    //this.appValidation.validate();
    this.processing = true
    let saveOrUpdate$ = null;
    let currencyId = this.formGroup.get('currency_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'finance/currencies',this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'finance/currencies/' + currencyId,this.formGroup.getRawValue())
    }

    saveOrUpdate$
    .pipe( map(res => res['data']) )
    .subscribe(
      data => {
        this.processing = false
        if(data.status==0){
          AppAlert.showError({text:data.message});
          this.reloadTable()
          this.reloadTable()
          this.currencyModel.hide()
        }
        if(data.status==1){
        AppAlert.showSuccess({text : data['message'] })
        this.formGroup.reset();
        this.reloadTable()
        this.currencyModel.hide()
      }
     },
     error => {
       this.processing = false
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


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'finance/currencies/' + id)
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.currencyModel.show()
        this.modelTitle = "Update Currency"
        this.formGroup.setValue({
         'currency_id' : data['currency_id'],
         'currency_code' : data['currency_code'],
         'currency_description' : data['currency_description']
        })
        this.formGroup.get('currency_code').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id, status) { //deactivate payment term

    if(status == 0)
      return

    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Currency?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'finance/currencies/' + id)
        .pipe(map(data=>data['data']))
        .subscribe(
          data => {
            if(data.status==0){
              AppAlert.showError({text:data.message});
              this.reloadTable()
            }
            if(data.status==1){
            this.reloadTable()
          }
        },
        error => {
          console.log(error)
        }
      )
      }
    })
  }


  showEvent(event){ //show event of the bs model
    this.formGroup.get('currency_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Currency"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

}
