import { Component, OnInit , ViewChild, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgOption } from '@ng-select/ng-select';
declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { BasicValidators } from '../../core/validation/basic-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
//import {MatDatepickerModule} from '@angular/material/datepicker';


//models
import { Currency } from '../../org/models/currency.model';

@Component({
  selector: 'app-exchange-rate',
  templateUrl: './exchange-rate.component.html',
  styleUrls: []
})
export class ExchangeRateComponent implements OnInit {

  @ViewChild(ModalDirective) goodsTypeModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = "New Exchange rate"
  apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'

  currency$: Observable<Currency[]> //use to load currency list in ng-select
  currencyLoading = false;
  currencyInput$ = new Subject<string>();
  selectedCurrency: Currency[] = <any>[];
  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  //to manage form error messages
  formFields = {
    currency : '',
    valid_from : '',
    rate : '',
    validation_error : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private titleService: Title,private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.titleService.setTitle("Exchange Rate")//set page title

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'finance/exchange-rates/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'validation_error',
      data : {
        id : function(controls){ return controls['id']['value'] },
        valid_from : function(controls){ return new Date(controls['valid_from']['value']).toISOString() },
        currency : function(controls){ return controls['currency']['value']['currency_id'] }
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({ // create the form
      id : 0,
      currency : [null , [Validators.required] , [basicValidator.remote(remoteValidationConfig)]],
      valid_from : [null , [Validators.required] , [basicValidator.remote(remoteValidationConfig)]],
      rate : [null , [Validators.required] ]
    })

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,[],this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

     if(this.permissionService.hasDefined('EXCHANGE_RATE_VIEW')){
       this.createTable(); //initialize datatable
       this.loadCurrency()
     }
     this.layoutChangerService.changeHeaderPath([
       'Catalogue',
       'Finance',
       'Exchange Rate'
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
     this.datatable = $('#rate_tbl').DataTable({
       autoWidth: true,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order : [[ 0, 'desc' ]],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "finance/exchange-rates?type=datatable"
        },
        columns: [
            {
              data: "id",
              orderable: false,
              width: '8%',
              render : (data,arg,full) => {
                var str = ''
                if(this.permissionService.hasDefined('EXCHANGE_RATE_EDIT')){
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
                if(this.permissionService.hasDefined('EXCHANGE_RATE_DELETE')){ //check delete permission
                    str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
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
             orderable: true,
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
           { data: "from_date" },
           { data: "rate", className: "text-right" },

       ],
     });

     //listen to the click event of edit and delete buttons
     $('#rate_tbl').on('click','i',e => {
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


  saveGoodsType() { //save and update goods type
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let date;
    let rateId = this.formGroup.get('id').value
    let formData = this.formGroup.getRawValue()
    formData['currency'] = formData['currency']['currency_id']
    formData['valid_from']=formData['valid_from'].toLocaleString().split(',')[0]
    //date=JASON.Stringify(formData['valid_from'])
    //console.log(formData['valid_from'].toLocaleString().split(',')[0])
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'finance/exchange-rates',formData)
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'finance/exchange-rates/' + rateId,formData)
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.processing = false
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.goodsTypeModel.hide()
     },
     (error) => {
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
    this.http.get(this.apiUrl + 'finance/exchange-rates/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
        if(data['status'] == '1') {
          this.goodsTypeModel.show()
          this.modelTitle = "Update Exchange Rate"
          this.formGroup.setValue({
           'id' : data['id'],
           'currency' : data['currency'],
           'valid_from' : new Date(data['valid_from']),
           'rate' : data['rate']
          })
          //console.log( new Date(data['valid_from'])
          this.saveStatus = 'UPDATE'
        }
      })
  }


  delete(id,status) { //deactivate payment term
    if(status==0){
      return
    }
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Exchange Rate?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'finance/exchange-rates/' + id)
        .subscribe(
            (data) => {
                this.reloadTable()
            },
            (error) => {
              console.log(error)
            }
        )
      }
    })
  }


  //load currency list
  loadCurrency() {
       this.currency$ = this.currencyInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.currencyLoading = true),
          switchMap(term => this.http.get<Currency[]>(this.apiUrl + 'finance/currencies?type=auto',{params:{search:term}})
           .pipe(
              //catchError(() => of([])), // empty list on error
              tap(() => this.currencyLoading = false)
          ))
       );
   }

  showEvent(event){ //show event of the bs model
    this.formGroup.reset();
    this.modelTitle = "New Exchange Rate"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }


}
