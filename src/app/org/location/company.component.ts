import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';

//models
import { Country } from '../models/country.model';
import { Currency } from '../models/currency.model';
import { Department } from '../models/department.model';
import { Section } from '../models/section.model';


@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['../../../styles/validation.css']
})
export class CompanyComponent implements OnInit {

  @ViewChild(ModalDirective) companyModel: ModalDirective;

  formGroup : FormGroup
  popupHeaderTitle : string = "New Company"
  readonly apiUrl = AppConfig.apiUrl()
  formValidator : AppFormValidator
  datatable:any = null
  saveStatus = 'SAVE'
  initialized : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  processing : boolean = false

  companyList = [];
  clusterList$:Observable<Array<any>>//observable to featch source list

  country$: Observable<Country[]>;
  countryLoading = false;
  countryInput$ = new Subject<string>();
  selectedCountry:Country

  currency$: Observable<Currency[]>;
  currencyLoading = false;
  currencyInput$ = new Subject<string>();
  selectedCurrency:Currency

  departments$: Observable<Department[]> //
  departmentsLoading = false;
  departmentsInput$ = new Subject<string>();
  selectedDepartments: Department[] = <any>[{dep_id:4,dep_name:'HR'}];

  section$: Observable<Section[]>
  sectionsLoading = false;
  sectionsInput$ = new Subject<string>();
  selectedSections: Section[]
  selectedSection:number = 1

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService:PermissionsService, private auth : AuthService) { }

  ngOnInit() {

    this.initializeForm()
    this.loadModelData()

  }

  //load data and initialize forms
  loadModelData() {
    this.loading = true;
    this.loadingCount = 0;
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading data')
    this.loadClusterList()

    if(this.initialized == false){
      this.initializeForm()
      this.loadCurrency()
      this.loadCountry()
      this.loadDepartments()
      this.loadSections()
      this.initialized = true;
    }
  }

  //chek all data were loaded, if loaded active save button
  checkProcessingStatus(){
    if(this.loadingCount >= 1){
      this.loading = false
      this.loadingCount = 0
      setTimeout(() => {
        AppAlert.closeAlert()
      } , 500)
    }
  }

  //create form, initialize the validation and suscribe for form value changes
  initializeForm() {
      let remoteValidationConfig = { //configuration for company code remote validation
        url:this.apiUrl + 'org/companies/validate?for=duplicate',
        /*formFields : null,//this.formFields,*/
        fieldCode : 'company_code',
        error : 'Company code already exists',
        data : {
          company_id : function(controls){ return controls['company_id']['value']}
        }
      }

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

      this.formGroup = this.fb.group({
        company_id : 0,
        group_id : [null, [Validators.required]],
        company_code : [null , [Validators.required,PrimaryValidators.noSpecialCharactor,Validators.minLength(3)],[primaryValidator.remote(remoteValidationConfig)]],
        company_name : [null , [Validators.required,Validators.minLength(4)]],
        company_address_1 : [null , [Validators.required]],
        company_address_2 : null,
        city : [null , [Validators.required]],
        country_code : [null , [Validators.required]],
        company_reg_no :[null , [Validators.required]],
        company_contact_1 :[null , [Validators.required,PrimaryValidators.noSpecialCharactor,PrimaryValidators.isNumber]],
        company_contact_2 : [null , [PrimaryValidators.noSpecialCharactor,PrimaryValidators.noEmptyString,PrimaryValidators.isNumber]],
        company_fax : [null , [PrimaryValidators.noSpecialCharactor,PrimaryValidators.noEmptyString,PrimaryValidators.isNumber]],
        company_email : [null ,[Validators.required,Validators.email]],
        company_web : null,
        company_remarks : null,
        vat_reg_no : [null , [Validators.required]],
        tax_code :  [null , [Validators.required]],
        default_currency : [null , [Validators.required]],
        finance_month : [null, [Validators.required]],
        company_logo : null,
        sections : [null],
        departments : [null]
      })

      //create new validation object
      //this.appValidator = new AppValidator(this.formFields,{},this.formGroup);
      let customErrorMessages = {
        company_name : {
          required : 'Field required'
        }
      }
      this.formValidator = new AppFormValidator(this.formGroup , customErrorMessages)

  }

  ngOnDestroy(){
      this.datatable = null
  }


  //initialize datatable
  createTable() {
     this.datatable = $('#company_tbl').DataTable({
     // autoWidth: true,
     scrollY: "500px",
     scrollX: true,
     scrollCollapse: true,
     processing: true,
     serverSide: true,
     order : [[ 13, 'desc' ]],
     columnDefs:[{
       targets:13,
       render:function(data){
         const date = new Date(data);
         const formattedDate = date.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}).replace(/ /g, '-');
         return formattedDate;
     }},
     {
       orderable: false,
       width: '100px',
       targets: [ 0 ]
     }],
     ajax: {
          headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
          dataType : 'JSON',
          "url": this.apiUrl + "org/companies?type=datatable"
      },
       columns: [
            {
              data: "company_id",
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('COMPANY_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
                if(this.permissionService.hasDefined('COMPANY_DELETE')){
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
             render : function(data){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
          { data: "group_name" },
          { data: "company_code" },
          { data: "company_name" },
          { data: "company_address_1" },
          { data: "company_address_2" },
          { data: "city" },
          { data: "country_description" },
          { data: "company_reg_no" },
          { data: "company_contact_1" },
          { data: "currency_code" },
          { data : 'finance_month'},
          { data: "created_date" }
       ],

     });

     //listen to the click event of edit and delete buttons
     $('#company_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
           this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
           this.delete(att['data-id']['value'], att['data-status']['value']);
        }
     });
  }

  //reload datatable
  reloadTable() {
    this.datatable.ajax.reload(null, false);
  }


  //load country list - ng select plugin
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

   //load currency list - ng select plugin
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

    //load cluster list
    loadClusterList() {
        this.clusterList$ = this.http.get<Array<any>>(this.apiUrl + 'org/clusters?active=1&fields=group_id,group_name')
        .pipe(
          tap(res => {
            this.loadingCount++;
            this.checkProcessingStatus()
          }),
          map( res => res['data'] )
        )
    }


    //load departments - ng select plugin
    loadDepartments() {
         this.departments$ = concat(
             of([]), // default items
             this.departmentsInput$.pipe(
                debounceTime(200),
                distinctUntilChanged(),
                tap(() => this.departmentsLoading = true),
                switchMap(term => this.http.get<Department[]>(this.apiUrl + 'org/departments?type=auto',{params:{search:term}}).pipe(
                    catchError(() => of([])), // empty list on error
                    tap(() => this.departmentsLoading = false)
                ))
             )
         );
     }

     //load sections - ng select plugin
     loadSections() {
          this.section$ = concat(
              of(this.selectedSections), // default items
              this.sectionsInput$.pipe(
                 debounceTime(200),
                 distinctUntilChanged(),
                 tap(() => this.sectionsLoading = true),
                 switchMap(term => this.http.get<Section[]>(this.apiUrl + 'org/sections?type=auto',{params:{search:term}}).pipe(
                     catchError(() => of([])), // empty list on error
                     tap(() => this.sectionsLoading = false)
                 ))
              )
          );
      }


    //save or update company details
    saveCompany() {

      if(!this.formValidator.validate())//if validation faild return from the function
        return;
      this.processing = true
      AppAlert.showMessage('Processing...','Please wait while saving details')

      let formData = this.formGroup.getRawValue()
      formData['country_code'] = formData['country_code']['country_id']
      formData['default_currency'] = formData['default_currency']['currency_id']

      let saveOrUpdate$ = null;
      let companyId = this.formGroup.get('company_id').value
      if(this.saveStatus == 'SAVE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'org/companies', formData)
      }
      else if(this.saveStatus == 'UPDATE'){
        saveOrUpdate$ = this.http.put(this.apiUrl + 'org/companies/' + companyId , formData)
      }

      saveOrUpdate$.subscribe(
        (res) => {
          if(res.data['status']=="0"){
            AppAlert.showError({text:"Company already in use"})
            this.processing = false
            this.formGroup.reset();
            this.reloadTable()
            this.companyModel.hide()
          }else{
            this.processing = false
            this.formGroup.reset();
            this.reloadTable()
            this.companyModel.hide()

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


    //get payment term data and open the model
    edit(id) {
      this.http.get(this.apiUrl + 'org/companies/' + id)
      .pipe(map( data => data['data'] ))
      .subscribe(data => {
        //console.log(data)
        if(data['status'] == '1')
        {
          this.saveStatus = 'UPDATE'
          this.companyModel.show()
          //console.log(data);
          this.formGroup.setValue({
            company_id : data['company_id'],
            group_id : data['group_id'],
            company_code : data['company_code'],
            company_name : data['company_name'],
            company_address_1 : data['company_address_1'],
            company_address_2 : data['company_address_2'],
            city : data['city'],
            country_code : data['country'],
            company_reg_no : data['company_reg_no'],
            company_contact_1 : data['company_contact_1'],
            company_contact_2 : data['company_contact_2'],
            company_fax : data['company_fax'],
            company_email : data['company_email'],
            company_web : data['company_web'],
            company_remarks : data['company_remarks'],
            vat_reg_no : data['vat_reg_no'],
            tax_code :  data['tax_code'],
            default_currency : data['currency'],
            finance_month : data['finance_month'],
            company_logo : '',
            sections : data['sections'],
            departments : data['departments']
          })

        }
      })
    }


    //deactivate payment term
    delete(id, status) {
      if(status == 0)
        return
      AppAlert.showConfirm({
        'text' : 'Do you want to deactivate selected Company?'
      },(result) => {
        if (result.value) {
          AppAlert.showMessage('Processing...','Please wait while deleting company')
          this.http.delete(this.apiUrl + 'org/companies/' + id)
          .subscribe(
              (data) => {
                console.log(data)
                if(data['data']['status'] == "0"){

                    AppAlert.showError({text:"Company already in use"})

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


  //show event of the bs model
  showEvent(event){
    if(this.saveStatus == 'SAVE'){
      this.popupHeaderTitle = 'New Company'
      this.formGroup.get('company_code').enable()
      this.formGroup.reset();
      //this.loadModelData()
    }
    else if(this.saveStatus == 'UPDATE') {
      this.popupHeaderTitle = 'Update Company'
      this.formGroup.get('company_code').disable()
    //  this.loadModelData()
    }
  }

}
