import { Component, OnInit,ChangeDetectionStrategy, ViewChild,OnDestroy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { NgOption } from '@ng-select/ng-select';
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';

//models
import { Country } from './../models/country.model';
import { Currency } from './../models/currency.model';
import { CostCenter } from './../models/cost-center.model';


@Component({
  selector: 'app-company-location',
  templateUrl: './company-location.component.html',
  styleUrls: ['../../../styles/validation.css']
})
export class CompanyLocationComponent implements OnInit {

  @ViewChild(ModalDirective) locationModel: ModalDirective;

  modelTitle:string = "New Location"
  apiUrl:string = AppConfig.apiUrl()
  formGroup:FormGroup = null
  formValidator : AppFormValidator = null
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  mainCompanyList$ : Observable<any[]>
  locationTypeList$ : Observable<any[]>
  propertyTypeList$ : Observable<any[]>


  country$: Observable<Country[]>;//use to load country list in ng-select
  countryLoading = false;
  countryInput$ = new Subject<string>();
  selectedCountry: Country[]

  currency$: Observable<Currency[]> //use to load currency list in ng-select
  currencyLoading = false;
  currencyInput$ = new Subject<string>();
  selectedCurrency: Currency[] = <any>[];

  costCenters$: Observable<CostCenter[]> //
  costCentersLoading = false;
  costCentersInput$ = new Subject<string>();
  selectedCostCenters: CostCenter[] = <any>[];

  constructor(private fb:FormBuilder,private http:HttpClient, private permissionService:PermissionsService, private auth : AuthService) { }

  ngOnInit() {

      this.initializeForm()
      this.loadModelData()
  }


  initializeForm(){
    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/locations/validate?for=duplicate',
      //formFields : this.formFields,
      fieldCode : 'loc_code',
      /*error : 'custome error 123',*/
      data : {
        loc_id : function(controls){ return controls['loc_id']['value']}
      }
    }

    this.formGroup = this.fb.group({ //generate angular reactive form
      loc_id : 0,
      company_id : [null , [Validators.required]],
      type_of_loc : [null , [Validators.required]],
      loc_code : [null , [Validators.required , Validators.minLength(3),PrimaryValidators.noSpecialCharactor], [primaryValidator.remote(remoteValidationConfig)]],
      loc_name : [null , [Validators.required]],
      loc_type : [null , [Validators.required]],
      loc_address_1 : [null , Validators.required],
      loc_address_2 : null,
      city : [null , [Validators.required,PrimaryValidators.noSpecialCharactor]],
      postal_code : null,
      state_Territory : [null , [Validators.required,PrimaryValidators.noSpecialCharactor]],
      country_code : [null , Validators.required],
      loc_phone : [null , [Validators.required,PrimaryValidators.noSpecialCharactor,PrimaryValidators.isNumber]],
      loc_fax : [null , [Validators.required,PrimaryValidators.noSpecialCharactor,PrimaryValidators.isNumber]],
      loc_email : [null ,[Validators.required,Validators.email]],
      loc_web : null,
      loc_google : null,
      land_acres : null,
      type_property : [null,[Validators.required]],
      opr_start_date : [null , [Validators.required]],
      latitude : null,
      longitude : null,
      currency_code : [null , [Validators.required]],
      time_zone : [null , [Validators.required]],
      cost_centers : []
    })

    this.formValidator = new AppFormValidator(this.formGroup , {loc_phone:{numberRequired:"Incorrect Phone Number"},loc_fax:{numberRequired:"Incorrect Fax Number"}});//form validation class
  }


  loadModelData() {
    this.loading = true
    this.loadingCount = 0
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading data')
    this.loadCompanies();
    this.loadPropertyTypeList();
    this.loadLocationTypes();

    if(this.initialized == false){
      this.loadCountry()
      this.loadCurrency()
      this.loadCostCenters()
      this.initialized = true;
    }
  }


  //chek all data were loaded, if loaded active save button
  checkProcessingStatus(){
    if(this.loadingCount >= 3){
      this.loading = false
      this.loadingCount = 0
      setTimeout(() => {
        AppAlert.closeAlert()
      } , 500)
    }
  }

  ngOnDestroy(){
      this.datatable = null
  }


  createTable() { //initialize datatable
     this.datatable = $('#sub_location_tbl').DataTable({
     // autoWidth: true,
     scrollY: "500px",
     scrollX: true,
     scrollCollapse: true,
     processing: true,
     responsive: true,
     serverSide: true,
     order : [[ 4, 'desc' ]],
     columnDefs:[{
       targets:16,
       render:function(data){
         const date = new Date(data);
         const formattedDate = date.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}).replace(/ /g, '-');
         return formattedDate;

     }},{
       orderable: false,
       width: '100px',
       targets: [ 0 ]
     }],
     ajax: {
          headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
          dataType : 'JSON',
          "url": this.apiUrl + "org/locations?type=datatable"
      },
       columns: [
            {
              data: "loc_id",
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('LOCATION_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
                if(this.permissionService.hasDefined('LOCATION_DELETE')){//check permission
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
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
          { data: "loc_code" },
          { data: "company_name" },
          { data: "loc_name" },
          { data: "loc_type" },
          { data: "loc_address_1" },
          { data: "loc_address_2" },
          { data: "city" },
          { data: "country_description" },
          { data: "loc_phone" },
          { data: "loc_fax" },
          { data: "loc_email" },
          { data: "loc_web" },
          { data: "time_zone" },
          { data: "currency_code" },
          { data: "created_date" }
       ],


     });

     //listen to the click event of edit and delete buttons
     $('#sub_location_tbl').on('click','i',e => {
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

  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'org/locations/' + id )
    .pipe(map( data => data['data'] ))
    .subscribe(data => {

      console.log(data)

      if(data['status'] == '1')
      {
        this.saveStatus = 'UPDATE'
        this.locationModel.show()
        this.modelTitle = "Update Location"
        this.formGroup.setValue({
         loc_id : data['loc_id'],
         company_id : data['company_id'],
         type_of_loc : data['type_of_loc'],
         loc_code : data['loc_code'],
         loc_name : data['loc_name'],
         loc_type : data['loc_type'],
         loc_address_1 : data['loc_address_1'],
         loc_address_2 : data['loc_address_2'],
         city : data['city'],
         postal_code : data['postal_code'],
         state_Territory : data['state_Territory'],
         country_code : data['country'],
         //country_code : data['country_code'],
         loc_phone : data['loc_phone'],
         loc_fax : data['loc_fax'],
         loc_email : data['loc_email'],
         loc_web : data['loc_web'],
         loc_google : data['loc_google'],
         land_acres : data['land_acres'],
         type_property : data['type_property'],
         opr_start_date : new Date(data['opr_start_date']),
         latitude : data['latitude'],
         longitude : data['longitude'],
         currency_code :data['currency'],
         //currency_code :data['currency_code'],
         time_zone : data['time_zone'],
         cost_centers : data['cost_centers'],
       })

       this.formGroup.get('loc_code').disable()
       //this.saveStatus = 'UPDATE'
      }

    })
  }

  delete(id, status) {
    if(status == 0)
      return
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Location?'
    },(result) => {
      if (result.value) {
        AppAlert.showMessage('Processing...','Please wait while deleting Location')
        this.http.delete(this.apiUrl + 'org/locations/' + id)
        .subscribe(
            (data) => {
              //console.log(data)
              if(data['data']['status'] == "0"){

                  AppAlert.showError({text:"Location already in use"})

              }else{
                this.reloadTable()
                AppAlert.closeAlert()
              }


            },
            (error) => {
              AppAlert.closeAlert()
              AppAlert.showError({ text : 'Process Error' })
              //console.log(error)
            }
        )
      }
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
               switchMap(term => this.http.get<Country[]>(this.apiUrl + 'org/countries?type=auto',{params:{search:term}}).pipe(
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
                switchMap(term => this.http.get<Currency[]>(this.apiUrl + 'finance/currencies?type=auto',{params:{search:term}}).pipe(
                    catchError(() => of([])), // empty list on error
                    tap(() => this.currencyLoading = false)
                ))
             )
         );
     }

  save(){
    if(!this.formValidator.validate())//if validation faild return from the function
      return;
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')

    let saveOrUpdate$ = null;
    let formData = this.formGroup.getRawValue();
    formData['currency_code'] = formData['currency_code']['currency_id']
    formData['country_code'] = formData['country_code']['country_id']
    //formData['opr_start_date'] = formData['opr_start_date'].toISOString().split("T")[0]

    formData['opr_start_date']=formData['opr_start_date'].toLocaleString().split(',')[0]

    let locId = this.formGroup.get('loc_id').value

    console.log(formData)
    //return

    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/locations', formData)
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/locations/' + locId , formData)
    }

    saveOrUpdate$.subscribe(
      (res) => {

        if(res.data['status']=="0"){
          AppAlert.showError({text:"location already in use"})
          this.processing = false
          this.formGroup.reset();
          this.reloadTable()
          this.locationModel.hide()
        }else{
          this.processing = false
          this.formGroup.reset();
          this.reloadTable()
          this.locationModel.hide()
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({text : res.data.message })
          } , 500)

      }
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

  //load main company list
  loadCompanies(){
      this.mainCompanyList$ = this.http.get<any[]>(this.apiUrl + 'org/companies?active=1&fields=company_id,company_name')
      .pipe(
        map(res => res['data']),
        tap(res => {
          this.loadingCount++;
          this.checkProcessingStatus()
        })
      )
  }

  //load location type list
  loadLocationTypes(){
      this.locationTypeList$ = this.http.get<any[]>(this.apiUrl + 'org/location-types?active=1&fields=type_loc_id,type_location',{})
      .pipe(
        map(res => res['data']),
        tap(res => {
          this.loadingCount++;
          this.checkProcessingStatus()
        })
      )
  }

  //load propert types
  loadPropertyTypeList(){
      this.propertyTypeList$ = this.http.get<any[]>(this.apiUrl + 'org/property-types?active=1&fields=type_prop_id,type_property',{})
      .pipe(
        map(res => res['data']),
        tap(res => {
          this.loadingCount++;
          this.checkProcessingStatus()
        })
      )
  }


  /*openModel(){
    this.modelTitle = "New Location"
    this.formGroup.reset();
    this.formGroup.get('loc_code').enable()
    $('#model_location').modal('show');
    this.saveStatus = 'SAVE'
    this.loadModelData()
  }*/


  //load cost centers
  loadCostCenters() {
       this.costCenters$ = concat(
           of([]), // default items
           this.costCentersInput$.pipe(
              debounceTime(200),
              distinctUntilChanged(),
              tap(() => this.currencyLoading = true),
              switchMap(term => this.http.get<CostCenter[]>(this.apiUrl + 'finance/accounting/cost-centers?type=auto',{params:{search:term}}).pipe(
                  catchError(() => of([])), // empty list on error
                  tap(() => this.currencyLoading = false)
              ))
           )
       );
   }


   //show event of the bs model
   showEvent(event){
     if(this.saveStatus == 'SAVE'){
       this.modelTitle = 'New Location'
       this.formGroup.get('loc_code').enable()
       this.formGroup.reset();
       //this.loadModelData()
     }
     else if(this.saveStatus == 'UPDATE') {
       this.modelTitle = 'Update Location'
       this.formGroup.get('loc_code').disable()
       //this.loadModelData()
     }
   }

   model_hide(){
     this.locationModel.hide()
   }

}
