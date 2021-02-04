import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { Store} from '../../org/models/store.model';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-substore',
  templateUrl: './substore.component.html',
  styleUrls: ['./substore.component.css']
})
export class SubstoreComponent implements OnInit {

  @ViewChild(ModalDirective) substoreModel: ModalDirective;


  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Sub Store"
  apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'
  url =  this.apiUrl + 'store/substore'

  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  storeList$:Observable<Array<any>>
  storeLoading = false;
  storeInput$ = new Subject<string>();
  selectedStore: Store[]


  formFields = {
    substore_id: 0,
    store_name:'',
    substore_name : '',
    validation_error :''
  }

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private titleService: Title,private layoutChangerService : LayoutChangerService ) { }

    ngOnInit() {
      this.titleService.setTitle("Sub Store Creation")//set page title

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
      let remoteValidationConfig = { //configuration for goods type description remote validation
        url:this.apiUrl + 'store/substore/validate?for=duplicate',

        formFields : this.formFields,
        fieldCode : 'substore_name',
        /*error : 'Goods type description already exists',*/
        data : {
          id : function(controls){ return controls['substore_id']['value']},
          store_name:function(controls){
            if (controls['store_name']['value']!=null)
            {
              return(controls['store_name']['value']['store_id'])
            }
          else
          return null;
        },
      }


    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({ // create the form
      substore_id : 0,
      store_name:[null , [Validators.required]],
      substore_name : [null , [Validators.required , Validators.minLength(3), PrimaryValidators.noSpecialCharactor],[primaryValidator.remote(remoteValidationConfig)]]
    })


    this.formValidator = new AppFormValidator(this.formGroup , {});
    //create new validation object
    //this.appValidator = new AppValidator(this.formFields,[],this.formGroup);

    //this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
    //  this.appValidator.validate();
    //})

    if(this.permissionService.hasDefined('SUB_STORE_VIEW')){
      //this.createTable(); //initialize datatable
      //this.loadStore();
    }
    this.createTable();
    this.loadStore();
    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'Warehouse',
      'Sub Store Creation'
    ])

    //this.createTable()

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
    this.datatable = $('#substore_tbl').DataTable({
      autoWidth: true,
      scrollY: "500px",
      scrollCollapse: true,
      processing: true,
      serverSide: true,
      order: [[ 0, "desc" ]],
      ajax: {
        headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
        dataType : 'JSON',
        "url": this.url +"?type=datatable"
      },
      columns: [
        {
          data: "substore_id",
          orderable: false,
          width: '10%',
          render : (data,arg,full) => {
            if(this.permissionService.hasDefined('SUB_STORE_EDIT')){
            var str = '<i class="icon-pencil" style="border-style:solid;margin-left:15px; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
          }
            if(this.permissionService.hasDefined('SUB_STORE_DELETE')){ //CHECK DELETE PERMISSION
              str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
            }
            if( full.status== 0 ) {
              var str = '<i class="icon-pencil" style="border-style:solid;;margin-left:15px; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px;cursor:not-allowed" data-action="DISABLE"></i>';
              str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;cursor:not-allowed" data-action="DISABLE"></i>';
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
        {
          data: "substore_name"
        },
        { data: "store_name" }
      ],
    });

    //listen to the click event of edit and delete buttons
    $('#substore_tbl').on('click','i',e => {
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
  //
  //
  //
  loadStore() {
    //debugger
    this.storeList$= this.storeInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.storeLoading  = true),
      switchMap(term => this.http.get<Store[]>(this.apiUrl + 'store/stores?type=auto' , {params:{search:term}})
      .pipe(
        //catchError(() => of([])), // empty list on error

        tap(() =>
               this.storeLoading = false)
      ))
    );
  }


  saveSubstore() { //save and update goods type
    if(!this.formValidator.validate())//if validation faild return from the function
    return;
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let id = this.formGroup.get('substore_id').value
    let formData= this.formGroup.getRawValue();
    formData['store_id']=formData['store_name']['store_id'];
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.url, formData)
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.url + '/' + id,formData)
    }


    saveOrUpdate$.subscribe(
      (res) => {
        //AppAlert.showSuccess({text : res.data.message })
        this.processing=false;
        this.formGroup.reset();
        this.reloadTable()
        this.substoreModel.hide()
        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showSuccess({text : res.data.message })
        } , 500)
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
    this.http.get(this.url + '/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      //  if(data['status'] == '1') {
      this.substoreModel.show()
      this.modelTitle = "Update Substore"
      this.formGroup.setValue({
        'substore_id' : data['substore_id'],
        'substore_name' : data['substore_name'],
        'store_name':data['store_name']
      })
      this.saveStatus = 'UPDATE'
      this.formGroup.get('store_name').disable()

    })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to Deactivate selected Sub Store?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.url + '/' + id)
        .pipe(map( data => data['data'] ))
        .subscribe(
          (data) => {
            if(data.status==0){
              AppAlert.showError({text:data.message})
            }
            else if(data.status==1){
              this.reloadTable()
            }

          },
          (error) => {
            console.log(error)
          }
        )
      }
    })
  }

  showEvent(event){ //show event of the bs model
    this.formGroup.get('store_name').enable()
    this.formGroup.reset();
    this.modelTitle = "New Sub Store"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

  reset() {
    this.modelTitle = "New Sub Store"
    this.formGroup.reset();
  }


}
