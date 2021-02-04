import { Component, OnInit,ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { NgOption } from '@ng-select/ng-select';
declare var $:any;
import Swal from 'sweetalert2'
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';

import { AppValidator } from '../../core/validation/app-validator';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { BasicValidators } from '../../core/validation/basic-validators';

//models
import { Country } from './../models/country.model';
import { Currency } from './../models/currency.model';
import { CostCenter } from './../models/cost-center.model';


@Component({
  selector: 'app-main-location',
  templateUrl: './main-location.component.html',
  styleUrls: ['../../../styles/validation.css']
})
export class MainLocationComponent implements OnInit {

  modelTitle:string = "Add Main Location"
  serverUrl:string = AppConfig.apiServerUrl()
  formGroup:FormGroup = null
  appValidator = null
  formValidator : AppFormValidator
  //processing : boolean = false

  initialized : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  processing : boolean = false
  mainLocationList = [] // for load datatable

  mainCompanyList$ : Observable<any[]>
  locationTypeList$ : Observable<any[]>
  propertyTypeList$ : Observable<any[]>

  formFields = { // store form validation errors
    company_id :'',
    type_of_loc : '',
    loc_code : '',
    loc_name : '',
    loc_type : '',
    city : '',
    loc_address_1 : '',
    country_code : '',
    loc_phone : '',
    loc_email : '',
    type_property : '',
    opr_start_date : '',
    currency_code : ''
  }

  country$: Observable<Country[]>;//use to load country list in ng-select
  countryLoading = false;
  countryInput$ = new Subject<string>();
  selectedCountry: Country[] =[{country_id:1,country_description:'Sri Lanka'}];

  currency$: Observable<Currency[]> //use to load currency list in ng-select
  currencyLoading = false;
  currencyInput$ = new Subject<string>();
  selectedCurrency: Currency[] = <any>[];

  costCenters$: Observable<CostCenter[]> //
  costCentersLoading = false;
  costCentersInput$ = new Subject<string>();
  selectedCostCenters: CostCenter[] = <any>[];

  aaa:number=0

  constructor(private fb:FormBuilder,private http:HttpClient) { }

  ngOnInit() {

    this.initializeForm();


  }


  loadModelData() {
    this.loading = true;
    this.loadingCount = 0;
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading data')


  if(this.initialized == false){

    this.initializeForm()

  this.loadCountry()

    this.loadCurrency()

    this.loadMainCompanies();

    this.loadPropertyTypeList();

    this.getSubLocationList()

    this.loadLocationTypes();

    this.loadCostCenters();
      this.initialized = true;
  }

  }
initializeForm(){

  let basicValidator = new BasicValidators(this.http)//create object of basic validation class

  let remoteValidationConfig = { //configuration for location code remote validation
    url:this.serverUrl+'MainSubLocation.check_code',
    formFields : this.formFields,
    fieldCode : 'loc_code',
    error : 'custome error 123',
    data : {
      idcode : function(controls){ return controls['loc_id']['value']}
    }
  }

  this.formGroup = this.fb.group({ //generate angular reactive form
    loc_id : 0,
    company_id : [0 , [Validators.required]],
    type_of_loc : [null , [Validators.required]],
    loc_code : [null , [Validators.required , Validators.minLength(3),PrimaryValidators.noSpecialCharactor], [basicValidator.remote(remoteValidationConfig)]],
    loc_name : [null , [Validators.required]],
    loc_type : [null , [Validators.required]],
    loc_address_1 : [null , Validators.required],
    loc_address_2 : null,
    city : [null , [Validators.required]],
    postal_code : null,
    state_Territory : null,
    country_code : [null , Validators.required],
    loc_phone : [null , [Validators.required]],
    loc_fax : null,
    loc_email : [null , [Validators.required]],
    loc_web : null,
    loc_google : null,
    land_acres : null,
    type_property : [null,[Validators.required]],
    opr_start_date : [null , [Validators.required]],
    latitude : null,
    longitude : null,
    currency_code : [null , [Validators.required]],
    time_zone : [null , [Validators.required]],
    type_center : []
  })

  this.appValidator = new AppValidator(this.formFields,{},this.formGroup);//form validation class
  //create new validation object
  this.formValidator = new AppFormValidator(this.formGroup, {});

  this.formGroup.valueChanges.subscribe(data => { //listen to changes of the form and validate fields
    //console.log(this.formGroup.value)
    this.appValidator.validate();
  })


}




  createTable() { //initialize datatable
     $('#sub_location_tbl').DataTable({
        // autoWidth: true,
        order: [[ 1, "asc" ]],
        scrollY: "300px",
        scrollX: true,
        scrollCollapse: true,
        fixedColumns:   {
        leftColumns: 2
      },//
       columns: [
            {
              data: "loc_id",
              render : function(data,arg,full){
                var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
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
          { data: "loc_code" },
          { data: "company_name" },
          { data: "loc_name" },
          { data: "loc_type" },
          { data: "loc_address_1" },
          { data: "loc_address_2" },
          { data: "city" },
          { data: "country_code" },
          { data: "loc_phone" },
          { data: "loc_fax" },
          { data: "loc_email" },
          { data: "loc_email" },
          { data: "loc_web" },
          { data: "time_zone" }
       ],
       columnDefs: [{
         orderable: false,
         width: '100px',
         targets: [ 0 ]
       }],
       data: this.mainLocationList,
       dom: '<"datatable-header"fl><"datatable-scroll"t><"datatable-footer"pi>',
     });

     //listen to the click event of edit and delete buttons
     $('#sub_location_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
          this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
          //  this.delete(att['data-id']['value']);
        }
     });
  }

  reloadTable(dataset) {//reload datatable
  	  var tbl = $('#sub_location_tbl').dataTable();
  	  tbl.fnClearTable();
  	  tbl.fnDraw();
  	  if(dataset != null && dataset.length != 0)
  	      tbl.fnAddData(dataset);
  }

  edit(id) { //get payment term data and open the model
    this.http.get(this.serverUrl + 'MainSubLocation.edit',{ params : {'company_id' : id }})
    .subscribe(data => {
      $('#model_main_location').modal('show');
      console.log(data)
      let sl_hd = data['sl_hd'][0];
      this.formGroup.setValue({
       loc_id : sl_hd['loc_id'],
       company_id : sl_hd['company_id'],
       type_of_loc : sl_hd['type_of_loc'],
       loc_code : sl_hd['loc_code'],
       loc_name : sl_hd['loc_name'],
       loc_type : sl_hd['loc_type'],
       loc_address_1 : sl_hd['loc_address_1'],
       loc_address_2 : sl_hd['loc_address_2'],
       city : sl_hd['city'],
       postal_code : sl_hd['postal_code'],
       state_Territory : sl_hd['state_Territory'],
       country_code : sl_hd['country_code'],
       loc_phone : sl_hd['loc_phone'],
       loc_fax : sl_hd['loc_fax'],
       loc_email : sl_hd['loc_email'],
       loc_web : sl_hd['loc_web'],
       loc_google : sl_hd['loc_google'],
       land_acres : sl_hd['land_acres'],
       type_property : sl_hd['type_property'],
       opr_start_date : sl_hd['opr_start_date'],
       latitude : sl_hd['latitude'],
       longitude : sl_hd['longitude'],
       currency_code :sl_hd['currency_code'],
       time_zone : sl_hd['time_zone'],
       type_center : [],
     })
     this.formGroup.get('company_id').patchValue(14)
     this.formGroup.get('loc_code').disable()

    })
  }

  getSubLocationList() { //get payment term list
    this.http.get<any[]>(this.serverUrl + 'MainSubLocation.loaddata')
    .subscribe(data => {
      this.mainLocationList = data;
      this.reloadTable(this.mainLocationList)
    })
  }

   //load country list
   loadCountry() {
        this.country$ = concat(
            of([]), // default items
            this.countryInput$.pipe(
               debounceTime(200),
               distinctUntilChanged(),
               tap(() => this.countryLoading = true),
               switchMap(term => this.http.get<Country[]>(this.serverUrl+'Mainlocation.load_country',{params:{search:term}}).pipe(
                   catchError(() => of([])), // empty list on error
                   tap(() => this.countryLoading = false)
               ))
            )
        );
    }



    //load currency list
    loadCurrency() {
         this.currency$ = concat(
             of([]), // default items
             this.currencyInput$.pipe(
                debounceTime(200),
                distinctUntilChanged(),
                tap(() => this.currencyLoading = true),
                switchMap(term => this.http.get<Currency[]>(this.serverUrl + 'Mainlocation.load_currency',{params:{search:term}}).pipe(
                    catchError(() => of([])), // empty list on error
                    tap(() => this.currencyLoading = false)
                ))
             )
         );
     }

  save(){
    //this.appValidator.validate();
    this.http.post(this.serverUrl + 'MainSubLocation.postdata',this.formGroup.value)
    .subscribe(
      data => {
      console.log(data['status'] + data['message']);
      if(data['status'] == 'success'){
        Swal({
          type : 'success',
          title : 'Success',
          text : data['message'],
          confirmButtonColor: "#66BB6A"
        });
        //this.formGroup.reset();
      //  $('#model_payment_term').modal('hide');
      }
    },
    error => {
      if(error.status == 422){ //validation error
        AppAlert.showError({title : 'Validation Error' , text : error.error.errors.validationErrorsText })
      }
      else{
        AppAlert.showError({text : 'Process Error' })
      }
    }
  );
  }

  //load main company list
    loadMainCompanies(){
      this.mainCompanyList$ = this.http.get<any[]>(this.serverUrl + 'MainSubLocation.load_list')
      .pipe( map(res => res['items']) )
  }

  //load location type list
  loadLocationTypes(){
      this.locationTypeList$ = this.http.get<any[]>(this.serverUrl + 'MainSubLocation.type_of_loc',{})
      .pipe(map(res => res['items']))
  }

  //load propert types
  loadPropertyTypeList(){
      this.propertyTypeList$ = this.http.get<any[]>(this.serverUrl + 'MainSubLocation.load_property',{})
      .pipe( map(res => res['items']) )
  }

  formValidate(){
    this.appValidator.validate();
  }

  openModel(){
    this.formGroup.reset();
    this.formGroup.get('loc_code').enable()
    $('#model_main_location').modal('show');

    this.loadModelData()
  }

  //........................................................

  //load cost centers
  loadCostCenters() {
       this.costCenters$ = concat(
           of([]), // default items
           this.costCentersInput$.pipe(
              debounceTime(200),
              distinctUntilChanged(),
              tap(() => this.currencyLoading = true),
              switchMap(term => this.http.get<CostCenter[]>(this.serverUrl + 'MainSubLocation.load_cost_center',{params:{search:term}}).pipe(
                  map(res => res['items']),
                  catchError(() => of([])), // empty list on error
                  tap(() => this.currencyLoading = false)
              ))
           )
       );
   }

}
