import { Component, OnInit,ViewChild,AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { Router } from '@angular/router'
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { NgOption } from '@ng-select/ng-select';
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { SupplierService } from './supplier.service';

//models
import { GoodsType } from '../models/goods-type.model';
import { ShipTerm } from '../models/ship-term.model';
import { PaymentMethod } from '../../finance/models/payment-method.model';
import { PaymentTerm } from '../../finance/models/payment-term.model';
import { Country } from './../models/country.model';
import { Currency } from './../models/currency.model';
import {SupplierTolaranceComponent} from './supplier-tolarance/supplier-tolarance.component';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: []
})
export class SupplierComponent implements OnInit,AfterViewInit{

  @ViewChild( SupplierTolaranceComponent) suppliertolarance:  SupplierTolaranceComponent;

  formGroup : FormGroup
  formGroupPopup:FormGroup
  formValidator : AppFormValidator = null
  readonly apiUrl = AppConfig.apiUrl()
  saveStatus = 'SAVE'
  appValidator : AppValidator

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
  selectedCountry: Country[]

  currency$: Observable<Currency[]> //use to load currency list in ng-select
  currencyLoading = false;
  currencyInput$ = new Subject<string>();
  selectedCurrency: Currency[] = <any>[];

  //to manage form error messages
  formFields = {
    supplier_code : '',
    supplier_name : '',
    supplier_short_name : '',
    type_of_service : '',
    supplier_city : '',
    supplier_country : '',
    supplier_contact1 : '',
    currency : '',
    validation_error:''

  }


  constructor(private router: Router,private http:HttpClient , private fb:FormBuilder , private customerService:SupplierService, private titleService: Title) { }

  redirectRegister() {
    this.router.navigate(['org/supplier/']);
  }
  ngOnInit() {
    this.titleService.setTitle("Supplier")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/suppliers/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode :'supplier_code',
      //error : 'Dep code already exists',
      data : {
        supplier_id : function(controls){ return controls['supplier_id']['value']}
      }

    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      supplier_id : 0 ,
      supplier_code :  [null , [Validators.required,Validators.minLength(3)],[primaryValidator.remote(remoteValidationConfig)]],
      supplier_name : [null , [Validators.required/*,PrimaryValidators.noSpecialCharactor*/]],
      supplier_short_name : [null , [Validators.required,PrimaryValidators.noSpecialCharactor]],
      type_of_service : [null , [Validators.required] ],
      supplier_city : [null , [Validators.required,PrimaryValidators.noSpecialCharactor] ],
      supplier_country : [null , [Validators.required] ],
      business_reg_no : null ,
      supplier_address1 : null ,
      supplier_address2 : null ,
      supplier_postal_code :[null , [PrimaryValidators.noSpecialCharactor] ],
      supplier_state : [null , [PrimaryValidators.noSpecialCharactor] ],
      supplier_contact1 : [null , [Validators.required,PrimaryValidators.noSpecialCharactor,PrimaryValidators.isNumber,Validators.maxLength(15),Validators.minLength(10)]],
      supplier_contact2 : [null , [PrimaryValidators.noSpecialCharactor,PrimaryValidators.isNumber,Validators.maxLength(15),Validators.minLength(10)]],
      supplier_contact3 : [null , [PrimaryValidators.noSpecialCharactor,PrimaryValidators.isNumber,Validators.maxLength(15),Validators.minLength(10)]],
      supplier_email : [null , [Validators.required,Validators.email]],
      supplier_map_location : null ,
      supplier_website : null ,
      company_code : [null , [PrimaryValidators.noSpecialCharactor] ],
      operation_start_date : null ,
      order_destination : null ,
      currency : [null , [Validators.required]] ,//
      boi_reg_no :[null , [PrimaryValidators.noSpecialCharactor] ],
      boi_reg_date : null ,
      vat_reg_no : [null , [PrimaryValidators.noSpecialCharactor] ],
      svat_no :[null , [PrimaryValidators.noSpecialCharactor] ],
      managing_director_name : [null , [PrimaryValidators.noSpecialCharactor] ],
      managing_director_email : [null , [Validators.required,Validators.email]],
      finance_director_name :[null , [PrimaryValidators.noSpecialCharactor] ],
      finance_director_email : [null , [Validators.required,Validators.email]],
      finance_director_contact :  [null , [PrimaryValidators.noSpecialCharactor,PrimaryValidators.isNumber]],
      additional_comments : null ,
      ship_terms_agreed :  [null,[Validators.required] ],
      payemnt_terms : [null,[Validators.required] ],
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
      payment_mode :  [null,[Validators.required] ],
    })

    this.formValidator = new AppFormValidator(this.formGroup , {supplier_contact1:{numberRequired:"Incorrect Phone Number"},supplier_contact2:{numberRequired:"Incorrect Phone Number"},supplier_contact3:{numberRequired:"Incorrect Phone Number"}, bank_contact:{numberRequired:"Incorrect Phone Number"},intermediary_bank_contact:{numberRequired:"Incorrect Phone Number"},});//form validation class


    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    });





    this.load_goods_types()
    this.load_shipment_terms()
    this.load_payment_methods()
    this.load_payment_terms()
    this.loadCountry()
    this.loadCurrency()

    //if user click view button of the customer table, this will fire
    this.customerService.supplierData.subscribe(data => {
      console.log(data);
      this.formGroup.reset()
      this.viewSupplier(data)
    })


  }

  ngAfterViewInit(){






  }




  viewSupplier(data)
  {
     console.log(data);
    if(data != null)
    {
      this.saveStatus = 'UPDATE'
      // console.log(this.saveStatus);
      delete data['approved_by']
      delete data['created_by']
      delete data['created_date']
      delete data['status']
      delete data['system_updated_by']
      delete data['updated_by']
      delete data['updated_date']
      data['supplier_country'] = data['country']
      if(data['boi_reg_date'] != null){
        data['boi_reg_date'] = new Date(data['boi_reg_date'])
      }
      if(data['business_reg_date'] != null){
        data['business_reg_date'] = new Date(data['business_reg_date'])
      }
      if(data['operation_start_date'] != null){
        data['operation_start_date'] = new Date(data['operation_start_date'])
      }
      delete data['country']
      delete data['user_loc_id']
      this.formGroup.get('supplier_code').disable()
      this.formGroup.setValue(data);
      // console.log(this.formGroup);
    }
  }


  saveCustomer() {
    this.appValidator.validate();
    this.processing = true
    let saveOrUpdate$ = null;
    let supplierId = this.formGroup.get('supplier_id').value
    let formData = this.formGroup.getRawValue();
    console.log(this.formGroup.getRawValue())
    formData['currency'] = formData['currency']['currency_id']
    formData['supplier_country'] = formData['supplier_country']['country_id']
    formData['business_reg_date'] =this.formatFormDate(formData.business_reg_date)
    formData['boi_reg_date'] =this.formatFormDate(formData.boi_reg_date)
    formData['operation_start_date'] =this.formatFormDate(formData.operation_start_date)
    console.log(formData)
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/suppliers', formData)
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/suppliers/' + supplierId , formData)
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.processing = false
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.formGroup.enable();
        this.customerService.changeStatus('RELOAD_TABLE')
        if(this.saveStatus == 'SAVE'){
          // this.customerService.tabs.tabs[0].active = true;
          this.customerService.tabActive('0')
        }
        else if(this.saveStatus == 'UPDATE'){
          this.customerService.tabActive('0')
          // this.customerService.tabs.tabs[2].active = true;
        }
      },
      (error) => {
        this.processing = false
        console.log(error)
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
    this.formGroup.get('supplier_code').enable()
    this.formGroup.patchValue({supplier_id : null})
    this.formGroup.reset()
    this.saveStatus = 'SAVE'


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
