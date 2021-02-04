import { Component, OnInit } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { NgOption } from '@ng-select/ng-select';
declare var $:any;
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { CustomerService } from './customer.service';

//models
import { GoodsType } from '../models/goods-type.model';
import { ShipTerm } from '../models/ship-term.model';
import { PaymentMethod } from '../../finance/models/payment-method.model';
import { PaymentTerm } from '../../finance/models/payment-term.model';
import { Country } from './../models/country.model';
import { Currency } from './../models/currency.model';

@Component({
  selector: 'app-customer-creation',
  templateUrl: './customer-creation.component.html',
  styleUrls: []
})
export class CustomerCreationComponent implements OnInit {

  formGroup : FormGroup
  readonly apiUrl = AppConfig.apiUrl()
  saveStatus = 'SAVE'
  appValidator : AppValidator
  formValidator : AppFormValidator = null
  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  goodsTypes$ : Observable<GoodsType>
  shipTerms$ : Observable<ShipTerm>
  paymentTerms$ : Observable<PaymentTerm>
  paymentMethods$ : Observable<PaymentMethod>

  country$: Observable<Country[]>;//use to load country list in ng-select
  countryLoading = false;
  countryInput$ = new Subject<string>();
  selectedCountry: Country[] = <any>[];


  currency$: Observable<Currency[]> //use to load currency list in ng-select
  currencyLoading = false;
  currencyInput$ = new Subject<string>();
  selectedCurrency: Currency[] = <any>[];

  //to manage form error messages
  formFields = {
    customer_code : '',
    customer_name : '',
    customer_short_name : '',
    type_of_service : '',
    customer_city : '',
    customer_country : '',
    customer_contact1 : '',
    currency : ''
  }




  constructor(private http:HttpClient , private fb:FormBuilder , private customerService:CustomerService) { }

  ngOnInit() {


    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/customers/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'customer_code',
      /*error : 'Dep code already exists',*/
      data : {
        customer_id : function(controls){ return controls['customer_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      customer_id : 0 ,
      customer_code : [null , [Validators.required,Validators.minLength(3),PrimaryValidators.noSpecialCharactor] , [primaryValidator.remote(remoteValidationConfig)]],
      customer_name : [null , [Validators.required,PrimaryValidators.noSpecialCharactor] ],
      customer_short_name : [null , [Validators.required,PrimaryValidators.noSpecialCharactor] ],
      type_of_service : [null, [Validators.required] ],
      customer_city : [null , [Validators.required,PrimaryValidators.noSpecialCharactor] ],
      customer_country : [null , [Validators.required] ],
      business_reg_no : [null , [PrimaryValidators.noSpecialCharactor] ],
      customer_address1 : [null , [Validators.required,PrimaryValidators.noSpecialCharactor] ],
      customer_address2 : [null , [PrimaryValidators.noSpecialCharactor] ],
      customer_postal_code : [null , [PrimaryValidators.noSpecialCharactor] ],
      customer_state : [null , [PrimaryValidators.noSpecialCharactor] ],
      customer_contact1 : [null , [Validators.required,PrimaryValidators.noSpecialCharactor,PrimaryValidators.isNumber,Validators.maxLength(15),Validators.minLength(10)]],
      customer_contact2 : [null , [PrimaryValidators.noSpecialCharactor,PrimaryValidators.isNumber,Validators.maxLength(15),Validators.minLength(10)]],
      customer_contact3 : [null , [PrimaryValidators.noSpecialCharactor,PrimaryValidators.isNumber,Validators.maxLength(15),Validators.minLength(10)]],
      customer_email : [null , [Validators.email]],
      customer_map_location :  null,
      customer_website : null ,
      company_code :[null , [PrimaryValidators.noSpecialCharactor] ],
      operation_start_date : null ,
      order_destination : null ,
      currency : [null , [Validators.required]] ,
      boi_reg_no :[null , [PrimaryValidators.noSpecialCharactor] ],
      boi_reg_date : null ,
      vat_reg_no : [null , [PrimaryValidators.noSpecialCharactor] ],
      svat_no : [null , [PrimaryValidators.noSpecialCharactor] ],
      managing_director_name :[null , [PrimaryValidators.noSpecialCharactor] ],
      managing_director_email : [null , [Validators.email]],
      finance_director_name :[null , [PrimaryValidators.noSpecialCharactor] ],
      finance_director_email : [null , [Validators.email]],
      finance_director_contact :  [null , [PrimaryValidators.noSpecialCharactor,PrimaryValidators.isNumber]],
      additional_comments :[null , [PrimaryValidators.noSpecialCharactor] ],
      ship_terms_agreed : null ,
      payemnt_terms : null ,
      bank_acc_no : [null , [PrimaryValidators.noSpecialCharactor,PrimaryValidators.isNumber]],
      bank_name : [null , [PrimaryValidators.noSpecialCharactor] ],
      bank_branch :[null , [PrimaryValidators.noSpecialCharactor] ],
      bank_code : [null , [PrimaryValidators.noSpecialCharactor] ],
      bank_swift :  [null , [PrimaryValidators.noSpecialCharactor] ],
      bank_iban :  [null , [PrimaryValidators.noSpecialCharactor] ],
      bank_contact :[null , [PrimaryValidators.noSpecialCharactor,PrimaryValidators.isNumber]],
      intermediary_bank_name :[null , [PrimaryValidators.noSpecialCharactor] ],
      intermediary_bank_address : null ,
      intermediary_bank_contact : [null , [PrimaryValidators.noSpecialCharactor,PrimaryValidators.isNumber]],
      buyer_posting_group : [null , [PrimaryValidators.noSpecialCharactor] ],
      business_posting_group : [null , [PrimaryValidators.noSpecialCharactor] ],
      customer_creation_form : null,
      business_reg_date : null,
      payment_mode : null
    })
    this.formValidator = new AppFormValidator(this.formGroup , { customer_contact1 :{numberRequired:"Incorrect Phone Number"},customer_contact2 :{numberRequired:"Incorrect Phone Number"},customer_contact3 :{numberRequired:"Incorrect Phone Number"},finance_director_contact:{numberRequired:"Incorrect Phone Number"},bank_acc_no:{numberRequired:"Incorrect Bank Account Number"},bank_contact:{numberRequired:"Incorrect Phone Number"},intermediary_bank_contact:{numberRequired:"Incorrect Phone Number"}});//form validation class

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.load_goods_types()
    this.load_shipment_terms()
    this.load_payment_methods()
    this.load_payment_terms()
    this.loadCountry()
    this.loadCurrency()

    //if user click view button of the customer table, this will fire
    this.customerService.customerData.subscribe(data => {
      console.log(data)
      this.formGroup.reset()
      this.viewCustomer(data)
    })


  }


  viewCustomer(data)
  {
    console.log(data);
    if(data != null)
    {
      this.saveStatus = 'UPDATE'

      delete data['approved_by']
      delete data['created_by']
      delete data['created_date']
      delete data['status']
      delete data['system_updated_by']
      delete data['updated_by']
      delete data['updated_date']
      delete data['divisions']
      delete data['user_loc_id']
      delete data['sap_code']

      //data['customer_country'] = data['country']
      data['boi_reg_date'] = new Date(data['boi_reg_date'])
      data['business_reg_date'] = new Date(data['business_reg_date'])
      data['operation_start_date'] = new Date(data['operation_start_date'])
      //delete data['country']
      this.formGroup.get('customer_code').disable()
      this.formGroup.setValue(data)
    }
  }


  saveCustomer() {
    this.appValidator.validate();
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let customerId = this.formGroup.get('customer_id').value
    let formData = this.formGroup.getRawValue();
    formData['currency'] = formData['currency']['currency_id']
    formData['customer_country'] = formData['customer_country']['country_id']
    formData['business_reg_date'] =this.formatFormDate(formData.business_reg_date)
    formData['boi_reg_date'] =this.formatFormDate(formData.boi_reg_date)
    formData['operation_start_date'] =this.formatFormDate(formData.operation_start_date)

    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/customers', formData)
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/customers/' + customerId , formData)
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.processing=false;
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.customerService.changeStatus('RELOAD_TABLE')
        if(this.saveStatus == 'SAVE'){
          this.formGroup.reset();
          this.customerService.tabActive('0')
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


  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }


  //load goods type_of_service
  load_goods_types() {
    this.goodsTypes$ = this.http.get<GoodsType>(this.apiUrl + "finance/goods-types?active=1&fields=goods_type_id,goods_type_description")
    .pipe( map(res => res['data']) )
  }

  //load shipment terms
  load_shipment_terms() {
    this.shipTerms$ = this.http.get<ShipTerm>(this.apiUrl + "finance/ship-terms?active=1&fields=ship_term_id,ship_term_code")
    .pipe( map(res => res['data']) )
  }

  //load payment methods
  load_payment_methods() {
    this.paymentMethods$ = this.http.get<PaymentMethod>(this.apiUrl + "finance/accounting/payment-methods?active=1&fields=payment_method_id,payment_method_code")
    .pipe( map(res => res['data']) )
  }

  //load payment terms
  load_payment_terms() {
    this.paymentTerms$ = this.http.get<PaymentTerm>(this.apiUrl + "finance/accounting/payment-terms?active=1&fields=payment_term_id,payment_code")
    .pipe( map(res => res['data']) )
  }

  //load country list
  loadCountry() {
    this.country$ = this.countryInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.countryLoading = true),
      switchMap(term => this.http.get<Country[]>(this.apiUrl + 'org/countries?type=auto' , {params:{search:term}})
      .pipe(
        //catchError(() => of([])), // empty list on error
        tap(() => this.countryLoading = false)
      ))
    );
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

  new(){
    this.formGroup.get('customer_code').enable()
    this.formGroup.reset()
    this.saveStatus = 'SAVE'
    //this.customerService.changeData(null)
  }


    formatFormDate(_dateObj){
      if(_dateObj != null && _dateObj != ''){
        let _year = _dateObj.getFullYear()
        let _month = (_dateObj.getMonth() < 9) ? '0' + (_dateObj.getMonth() + 1) : (_dateObj.getMonth() + 1)
        let _day = _dateObj.getDate()
        let dateStr = _year + '-' + _month + '-' + _day
        return dateStr
      }
      else{
        return null
      }
    }

}
