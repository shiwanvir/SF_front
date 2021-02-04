import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';


//third part components
import { NgOption } from '@ng-select/ng-select';
import { ModalDirective } from 'ngx-bootstrap/modal';
import {ComponentLoaderFactory} from 'ngx-bootstrap/component-loader';
import {PositioningService} from 'ngx-bootstrap/positioning';
declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { SmvupdateService } from './smvupdate.service';
import { SmvupdateHistoryComponent } from './smvupdate-history.component';

//models
import { Customer } from '../../org/models/customer.model';
import { Division } from '../../org/models/division.model';
import { Silhouette } from '../../org/models/silhouette.model';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-smvupdate',
  templateUrl: './smvupdate.component.html',
  styleUrls: ['./smvupdate.component.css'],
  providers: [ComponentLoaderFactory,PositioningService]
})
export class SmvupdateComponent implements OnInit {


  @ViewChild(ModalDirective) smvupdateModel: ModalDirective;


  formGroup : FormGroup
  modelTitle : string = "New SMV Update"
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  saveStatus = 'SAVE'
  appValidator : AppValidator
  serverUrl = AppConfig.apiServerUrl();
  formValidator : AppFormValidator = null
  customer$: Observable<Customer[]>;//use to load customer list in ng-select
  customerLoading = false;
  customerInput$ = new Subject<string>();
  selectedCustomer: Customer[];
  customerId = null;
  custDivisions$ : Observable<Division[]>
  customerDivisions : Array<any>
  processing : boolean = false
  // custDivision$: Observable<Division[]>;//use to load customer list in ng-select
  // divisionLoading = false;
  // divisionInput$ = new Subject<string>();
  // selectedDivision: Division[];



  productSilhouette$: Observable<Silhouette[]> //use to load silhouette list in ng-select
  productSilhouetteLoading = false;
  productSilhouetteInput$ = new Subject<string>();
  selectedProductSilhouette: Silhouette[];

  //to manage form error messages
  formFields = {
    //customer_name : '',
    //division_id : '',
    product_silhouette_description : '',
    version : '',
    min_smv : '',
    max_smv : '',
    validation_error: ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient, private smvupdateService:SmvupdateService, private permissionService : PermissionsService,
    private auth : AuthService,private layoutChangerService : LayoutChangerService, private titleService: Title ) { }

  ngOnInit() {
    this.titleService.setTitle("SMV Update")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'ie/smvupdates/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'validation_error',
      /*error : 'Dep code already exists',*/
      data : {
        smv_id : function(controls){ return controls['smv_id']['value']},
        product_silhouette_description : function(controls){
          if(controls['product_silhouette_description']['value'] != null)
          {
            return controls['product_silhouette_description']['value']['product_silhouette_id']
          }else{

            return null;
          }
        }
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      smv_id : 0 ,
      //customer_name : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)] ],
      //division_id : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)] ],
      //customer_name :  null ,
      //division_id :  null ,
      product_silhouette_description : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)] ],
      version : [null, [Validators.required]],
      min_smv : [null , [Validators.required,PrimaryValidators.isInRange(0,1000)]],
      max_smv : [null , [Validators.required,PrimaryValidators.isInRange(0,1000)]]

    })
    //this.formValidator = new AppFormValidator(this.formGroup , {});
    this.formValidator = new AppFormValidator(this.formGroup , {min_smv:{rangeValueToSmall:"Incorrect Number"},max_smv:{rangeValueToSmall:"Incorrect Number"}});//form validation class
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,[],this.formGroup);


    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.loadCustomer()
    //this.loadDivision()
    this.loadSilhouette()


    this.createTable() //load data list

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'IE',
      'SMV Update'
    ])


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
    this.datatable = $('#smvupdate_tbl').DataTable({
      autoWidth: true,
      scrollY: "500px",
      scrollCollapse: true,
      processing: true,
      responsive: true,
      serverSide: true,
      order:[[0,'desc']],
      ajax: {
        dataType : 'JSON',
        "url": this.apiUrl + "ie/smvupdates?type=datatable"
      },
      columns: [
        {
          data: "smv_id",
          orderable: false,
          width: '3%',
          render : (data,arg,full)=>{
            var str = '';
            if(this.permissionService.hasDefined('SMV_UPDATE_EDIT')){
              str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
          }
          if(this.permissionService.hasDefined('SMV_UPDATE_DELETE')){
              str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
          }if( full.status== 0 ) {
              str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px;cursor:not-allowed" data-action="DISABLE"></i>';
              str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;cursor:not-allowed" data-action="DISABLE"></i>';
            }


            return str;
          }
        },
      //  {data: "customer_name"},
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
        { data: "version"},
        { data: "product_silhouette_description" },
        {
          data: "min_smv",className: 'dt-body-right',
          render : function(data){
            return parseFloat(data).toFixed(2);
          }
        },
        {
          data: "max_smv",className: 'dt-body-right',
          render : function(data){
            return parseFloat(data).toFixed(2);
          }
        }
        // { data: "min_smv" },
        // { data: "max_smv" }
      ],
    });

    //listen to the click event of edit and delete buttons
    $('#smvupdate_tbl').on('click','i',e => {
      let att = e.target.attributes;
      if(att['data-action']['value'] === 'EDIT'){
        this.edit(att['data-id']['value']);
      }
      else if(att['data-action']['value'] === 'DELETE'){
        this.delete(att['data-id']['value']);
      }
    });
  }

  reloadTable() {//reload datatable
    this.datatable.ajax.reload(null, false);
  }

  //save and update source details
  saveSmvupdate(){
    //this.appValidation.validate();
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let saveOrUpdateHis$ = null;
    let smvupdateId = this.formGroup.get('smv_id').value
    let formData = this.formGroup.getRawValue();
    if(formData['min_smv'] >= formData['max_smv'] ){
      AppAlert.showError({text : "Min smv cann't be greater than max smv." });
      return;
    }
    // debugger
    //formData['customer_id'] = formData['customer_name']['customer_id']
    // formData['division_id'] = formData['division_description']['division_id']
    formData['product_silhouette_id'] = formData['product_silhouette_description']['product_silhouette_id']

    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'ie/smvupdates', formData)
      saveOrUpdateHis$ = this.http.post(this.apiUrl + 'ie/smvupdatehistories', formData)
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'ie/smvupdates/' + smvupdateId , formData)
      saveOrUpdateHis$ = this.http.put(this.apiUrl + 'ie/smvupdatehistories/updates', formData)
    }

    saveOrUpdateHis$.subscribe();
    saveOrUpdate$.subscribe(
      (res) => {
        this.formGroup.reset();
        this.formGroup.enable();
        this.reloadTable()
        this.smvupdateService.changeStatus('RELOAD_TABLE')
        if(this.saveStatus == 'UPDATE'){
          if(res.data.status == '1'){
            AppAlert.showSuccess({text : res.data.message });
          }else{
            AppAlert.showError({text : res.data.message })
          }
        }else{
          AppAlert.showSuccess({text : res.data.message })
        }
        this.smvupdateModel.hide();
      },
      (error) => {
        console.log(error)
      }
    );
  }


  //load customer Divisions
  /*
  loadDivision() {
  this.custDivisions$ = this.http.get<Division>(this.apiUrl + "org/divisions?active=1&fields=division_id,division_description")
  .pipe( map(res => res['data']) )
}
*/
clear(){
  this.formGroup.reset();
  this.formGroup.enable();
}

load_divition(data) {
  //
  //let formData = this.formGroup.getRawValue();

  if(data == undefined){
    this.customerId = null;
  }
  else{
    this.customerId = data.customer_id;

    //this.styleDescription = data.style_description
    //debugger
    this.http.get(this.apiUrl + 'org/customers/'+this.customerId)
    .pipe( map(res => res['data'] ))
    .subscribe(
      data => {
        //console.log(data.divisions)
        //this.customerDetails = data.customer_code + ' / ' + data.customer_name
        this.customerDivisions= data.divisions
      },
      error => {
        //console.log(error)
      }
    )
    //this.customerDetails = ''
  }
  //console.log(data)
}


//load Customer list
/*loadCustomer() {
this.customer$ = this.customerInput$
.pipe(
debounceTime(200),
distinctUntilChanged(),
tap(() => this.customerLoading = true),
switchMap(term => this.http.get<Customer[]>(this.apiUrl + 'org/customers?type=auto' , {params:{search:term}})
.pipe(
//catchError(() => of([])), // empty list on error
tap(() => this.customerLoading = false)
))
);
}*/

loadCustomer() {
  this.customer$ = concat(
    of([]), // default items
    this.customerInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.customerLoading = true),
      switchMap(term => this.http.get<any[]>(this.serverUrl + 'api/getCustomer',{params:{search:term}}).pipe(
        catchError(() => of([])), // empty list on error
        tap(() => this.customerLoading = false)
      ))
    )
  );
  //this.getDivision();
}
//load Customer Division list
// loadDivision() {
//      this.custDivision$ = this.divisionInput$
//      .pipe(
//         debounceTime(200),
//         distinctUntilChanged(),
//         tap(() => this.divisionLoading = true),
//         switchMap(term => this.http.get<Division[]>(this.apiUrl + 'org/divisions?type=auto' , {params:{search:term}})
//         .pipe(
//             //catchError(() => of([])), // empty list on error
//             tap(() => this.divisionLoading = false)
//         ))
//      );
//  }

//load Product Silhouette list
loadSilhouette() {
  this.productSilhouette$ = this.productSilhouetteInput$
  .pipe(
    debounceTime(200),
    distinctUntilChanged(),
    tap(() => this.productSilhouetteLoading = true),
    switchMap(term => this.http.get<Silhouette[]>(this.apiUrl + 'org/silhouettes?type=auto' , {params:{search:term}})
    .pipe(
      //catchError(() => of([])), // empty list on error
      tap(() => this.productSilhouetteLoading = false)
    ))
  );
}

edit(id) { //get SMVUpdate data and open the model
  this.http.get(this.apiUrl + 'ie/smvupdates/' + id )
  .pipe( map(res => res['data']) )
  .subscribe(data => {
    // debugger
    if(data['status'] == '1')
    {
      console.log(data)
      this.smvupdateModel.show()
      this.modelTitle = "Update SMV Update"

      this.formGroup.setValue({

        'smv_id' : data['smv_id'],
        //'customer_name' : data['customer'],
        //'division_id' : data['division_id'],
        'product_silhouette_description' : data['silhouette'],
        'version' : data['version'],
        'min_smv' : data['min_smv'],
        'max_smv' : data['max_smv']


      })
      //Object.entries(obj)
      //this.customerDivisions = [data['division']]
      //this.formGroup.get('customer_name').disable()
      //this.formGroup.get('division_id').disable()
      this.formGroup.get('product_silhouette_description').disable()
      this.formGroup.get('version').disable()
      this.saveStatus = 'UPDATE'
    }
  })
}


delete(id) { //deactivate payment term
  AppAlert.showConfirm({
    'text' : 'Do you want to deactivate selected SMV?'
  },
  (result) => {
    if (result.value) {
      this.http.delete(this.apiUrl + 'ie/smvupdatehistories/' + id).subscribe();
      this.http.delete(this.apiUrl + 'ie/smvupdates/' + id)
      .subscribe(
        (data) => {
          this.reloadTable()
          this.smvupdateService.changeStatus('RELOAD_TABLE')
        },

        (error) => {
          console.log(error)
        }
      )

    }
  })
}


showEvent(event){ //show event of the bs model

  // this.formGroup.get('validation_error').enable()
  this.formGroup.enable();
  this.formGroup.get('version').disable()
  this.formGroup.reset();
  this.modelTitle = "New SMV Update"
  this.saveStatus = 'SAVE'

}

formValidate(){ //validate the form on input blur event
  this.appValidator.validate();
}

}
