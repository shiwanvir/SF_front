import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgOption } from '@ng-select/ng-select';
declare var $:any;
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

import { Store} from '../../org/models/store.model';
import { SubStore} from '../../org/models/sub-store.model';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';


@Component({
  selector: 'app-storebin',
  templateUrl: './storebin.component.html',
  styleUrls: ['./storebin.component.css']
})
export class StorebinComponent implements OnInit {

  @ViewChild(ModalDirective) binModel: ModalDirective;

//
  formGroup : FormGroup
  modelTitle : string = "New Bin"
  formValidator : AppFormValidator = null
  apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'
  url =  this.apiUrl + 'store/storebin'


  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  storeList$:Observable<Array<any>>
  storeLoading = false;
  storeInput$ = new Subject<string>();
  selectedStore: Store[]

  subStoreList$:Observable<Array<any>>
  subStoreLoading = false;
  subStoreInput$ = new Subject<string>();
  selectedSubstore: SubStore[]

  formFields = {
    //store_bin_id: '',
    store_name: '',
    substore_name: '',
    store_bin_name : '',
    store_bin_description : '',
    validation_error :''
  }

  public storeList ;
//
  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private titleService: Title,private layoutChangerService : LayoutChangerService ) { }

  ngOnInit() {
      this.titleService.setTitle("Bin Creation")//set page title

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for goods type description remote validation
      url:this.apiUrl + 'stores/subStoreBin/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'validation_error',
      /*error : 'Goods type description already exists',*/
      data : {
        id : function(controls){return controls['store_bin_id']['value']},

        store_name:function(controls){if (controls['store_name']['value']!=null){return(controls['store_name']['value']['store_id'])}
        else
        return null;
      },
      substore_name:function(controls){if (controls['substore_name']['value']!=null){return(controls['substore_name']['value']['substore_id'])}
      else
      return null;
    },
    store_bin_name:function(controls){if (controls['store_bin_name']['value']!=null){return(controls['store_bin_name']['value'])}
    else
    return null;
  },


      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({ // create the form
      store_bin_id : 0,
      store_name:[null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
      substore_name:[null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
      store_bin_name :[null , [Validators.required,PrimaryValidators.minLength(3)],[primaryValidator.remote(remoteValidationConfig)]],
      store_bin_description : null,
    })

    this.formValidator = new AppFormValidator(this.formGroup , {});
 //create new validation object
 this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    if(this.permissionService.hasDefined('BIN_VIEW')){
      this.createTable() //initialize datatable
      this.loadStore()
      this.loadSubStore()
    }
    //this.createTable()
    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'Warehouse',
      'Bin Creation'
    ])

    //this.storeList$ = this.getStoreList()
    //this.subStoreList$ = this.getSubStoreList()
  }

/*  getStoreList():Observable<Array<any>>{
      return this.http.get<any[]>( this.apiUrl + 'store/stores?active=1&fields=store_id,store_name')
      .pipe( map( res => res['data']) )
  }
*/

  //load country list
  loadStore() {
       this.storeList$= this.storeInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.storeLoading  = true),
          switchMap(term => this.http.get<Store[]>(this.apiUrl + 'store/stores?type=auto' , {params:{search:term}})
          .pipe(
              //catchError(() => of([])), // empty list on error
              tap(() => this.storeLoading = false)
          ))
       );
   }

   loadSubStore() {

      let objectArr = null;
      objectArr = this.formGroup.getRawValue();
       if(objectArr['store_name']!=null){
         objectArr['store_id'] = objectArr['store_name']['store_id'];
       }
       else{
         objectArr['store_id'] = null;
       }
        this.subStoreList$= this.subStoreInput$
        .pipe(

           debounceTime(200),
           distinctUntilChanged(),
           tap(() => {this.subStoreLoading  = true
           }),
           switchMap(term => this.http.get<SubStore[]>(this.apiUrl + 'store/substore?type=auto' , {params:{search:term,storeId:this.formGroup.get('store_name').value.store_id}})
           .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.subStoreLoading = false)
           ))
        );
    }



/*  getSubStoreList():Observable<Array<any>>{
      return this.http.get<any[]>( this.apiUrl + 'store/substore?active=1&fields=substore_id,substore_name')
      .pipe( map( res => res['data']) )
  }
*/
ngOnDestroy(){
    this.datatable = null
}
  createTable() { //initialize datatable
     this.datatable = $('#data_tbl').DataTable({
       autoWidth: true,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order : [[ 0, 'desc' ]],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.url +"?type=datatable"

        },
        columns: [
            {
              data: "store_bin_id",
              orderable: false,
              width: '10%',
              render : (data,arg,full) => {
                if(this.permissionService.hasDefined('BIN_EDIT')){
                var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
                if(this.permissionService.hasDefined('BIN_DELETE')){ //check delete permission
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
                }
                if( full.status== 0 ) {
                  var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px;cursor:not-allowed" data-action="DISABLE"></i>';
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;cursor:not-allowed" data-action="DISABLE"></i>';
                }
                return str;
             }
           },
           {
             data: "status",
             render : function(data,arg,full){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
           { data: "store_bin_name" },
           { data: "store_bin_description" },
           { data: "store_name" },
           { data: "substore_name" },

       ],
     });

     //listen to the click event of edit and delete buttons
     $('#data_tbl').on('click','i',e => {
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


  saveSubstore() { //save and update goods type

    let saveOrUpdate$ = null;
  let id = this.formGroup.get('store_bin_id').value
  let objectArr = null;


  objectArr = this.formGroup.getRawValue();


    objectArr['store_id'] = objectArr['store_name']['store_id'];
    objectArr['substore_id'] = objectArr['substore_name']['substore_id'];
    console.log(objectArr);

    //debugger

   if(this.saveStatus == 'SAVE'){
     this.processing = true
     AppAlert.showMessage('Processing...','Please wait while saving details')
      saveOrUpdate$ = this.http.post(this.apiUrl + 'stores/substore', objectArr );
      saveOrUpdate$.subscribe
      (
        (res) => {
          AppAlert.showSuccess({text : res.data.message })
          //this.formGroup.reset();
          this.processing=false;
          this.reloadTable();
          this.formGroup.reset();
          this.reloadTable();
          this.binModel.hide()
          //this.binModel.hide()
       },
       (error) => {
           console.log(error)
       }
     );
    }
    else if(this.saveStatus == 'UPDATE'){
      this.processing = true
      AppAlert.showMessage('Processing...','Please wait while saving details')
      saveOrUpdate$ = this.http.put(this.apiUrl + 'stores/substore/' + id , objectArr );
      saveOrUpdate$.subscribe(
        (res) => {
          this.processing=false;
          //debugger
          if(res.data.status=='0'){
            AppAlert.showError({text : res.data.message })
          }
          else if(res.data.status=='1'){
            AppAlert.showSuccess({text : res.data.message })
          }
          this.formGroup.reset();
          this.reloadTable();
          this.binModel.hide()
       },
       (error) => {
         this.processing = false
         AppAlert.closeAlert()
         if(error.status == 422){ //validation error
           AppAlert.showError({title : 'Validation Error' , text : error.error.errors.validationErrorsText })
         }else{
           AppAlert.showError({text : 'Process Error' })
           console.log(error)
         }
       }
     );
    }







  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'stores/substore/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      //  if(data['status'] == '1') {
          this.binModel.show()
          this.modelTitle = "Update Bin"
          this.formGroup.setValue({
           'store_bin_id' : data['store_bin_id'],
           'store_name' : data['store'],
           'substore_name' : data['substore'],
           'store_bin_name' : data['store_bin_name'],
           'store_bin_description' : data['store_bin_description']
         })
          this.saveStatus = 'UPDATE'
          this.formGroup.get('store_bin_name').disable();
          this.formGroup.get('store_name').disable()
          this.formGroup.get('substore_name').disable()

      })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do You Want To Deactivate Selected Bin?'
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
    this.formGroup.get('store_bin_name').enable();
    this.formGroup.get('store_name').enable();
    this.formGroup.get('substore_name').enable();
    this.formGroup.reset();
    //this.getStoreList();
    //this.getSubStoreList();
    this.modelTitle = "New Bin"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

  reset() {
    this.modelTitle = "New Bin"
    this.formGroup.reset();
  }

  clearName() {
      this.formGroup.controls['store_bin_name'].reset();
      this.formGroup.controls['store_bin_description'].reset();
  }

}
