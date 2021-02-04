import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../../core/validation/primary-validators';
import { AppValidator } from '../../../core/validation/app-validator';
import { BasicValidators } from '../../../core/validation/basic-validators';
import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';

import { PermissionsService } from '../../../core/service/permissions.service';
import { AuthService } from '../../../core/service/auth.service';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';

//model
import { Location } from '../../models/location.model';
import { Section } from '../../models/section.model';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.component.html',
  styleUrls: []
})
export class StoresComponent implements OnInit {

  @ViewChild(ModalDirective) storesModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Store"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  locationList$ : Observable<Location>
  sectionList$ : Observable<Section>
  saveStatus = 'SAVE'
  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  //to manage form error messages
  formFields = {
    loc_id : '',
    store_name : '',
    store_address : '',
    section : '',
    email:'',
  }

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  ngOnInit() {
      this.titleService.setTitle("Store Creation")//set page title

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/stores/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'store_name',
      data : {
        store_id : function(controls){ return controls['store_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      store_id : 0,
      loc_id : [0 , [Validators.required]],
      section : [null , [Validators.required]],
      store_name : [null , [Validators.required,Validators.minLength(3)],[primaryValidator.remote(remoteValidationConfig)]],
      store_address : [null , [Validators.required]],
      store_phone : [null , [PrimaryValidators.noSpecialCharactor,PrimaryValidators.isNumber]],
      store_fax :  [null , [PrimaryValidators.noSpecialCharactor,PrimaryValidators.isNumber]],
      email : [null , [Validators.email]],
    })
    //create new validation object
      this.formValidator = new AppFormValidator(this.formGroup , {});
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    if(this.permissionService.hasDefined('STORE_VIEW')){
      this.createTable() //load data list
      this.loadLocations()
      this.loadSections()
    }
  //  this.createTable()
    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'Warehouse',
      'Store Creation'
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
     this.datatable = $('#stores_tbl').DataTable({
       autoWidth: false,
       scrollY : "500px",
       scrollX: true,
       sScrollXInner: "100%",
       scrollCollapse: true,
       //processing: true,
       serverSide: true,
       paging:true,
       searching:true,
       order : [[ 0, 'desc' ]],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "org/stores?type=datatable"
        },
        columns: [
            {
              data: "store_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('STORE_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
                if(this.permissionService.hasDefined('STORE_DELETE')){ //check delete permission
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'" data-status="'+full.status+'"></i>';
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
          { data: "loc_name" },
          { data: "store_name" },
          { data: "store_address" },
          { data: "store_phone" },
          { data: "store_fax" },
          { data: "email" },
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#stores_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
             this.delete(att['data-id']['value'],att['data-status']['value']);
        }
     });
  }



    reloadTable() {//reload datatable
        this.datatable.ajax.reload(null, false);
    }


    //save and update source details
    saveStores(){
      //this.appValidation.validate();
      if(!this.formValidator.validate())//if validation faild return from the function
        return;
      this.processing = true
      AppAlert.showMessage('Processing...','Please wait while saving details')

      let saveOrUpdate$ = null;
      let storeId = this.formGroup.get('store_id').value
      if(this.saveStatus == 'SAVE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'org/stores', this.formGroup.getRawValue())
      }
      else if(this.saveStatus == 'UPDATE'){
        saveOrUpdate$ = this.http.put(this.apiUrl + 'org/stores/' + storeId , this.formGroup.getRawValue())
      }

      saveOrUpdate$.subscribe(
        (res) => {
          //AppAlert.showSuccess({text : res.data.message })
          this.processing=false;
            if(res.data.status=='0'){
              this.formGroup.reset();
              this.reloadTable()
              this.storesModel.hide()
              setTimeout(() => {
                AppAlert.closeAlert()
                AppAlert.showError({text : res.data.message })
              } , 500)
            }
            if(res.data.status=='1'){
              this.formGroup.reset();
              this.reloadTable()
              this.storesModel.hide()
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

    edit(id) { //get payment term data and open the model
      this.http.get(this.apiUrl + 'org/stores/' + id)
      .pipe(map( data => data['data'] ))
      .subscribe(data => {
        if(data['status'] == '1') {
          this.storesModel.show()
          this.modelTitle = "Update Store"

          for(var key in data){
            if(!this.formGroup.controls.hasOwnProperty(key)){
                delete data[key]
            }
          }
          this.formGroup.setValue(data)
          this.formGroup.get('store_name').disable()
          this.saveStatus = 'UPDATE'
        }
      })
    }


    delete(id,status) { //deactivate payment term
      if(status==0){
        return
      }
      else if(status!=0){
      AppAlert.showConfirm({
        'text' : 'Do you want to deactivate selected Store?'
      },
      (result) => {
        if (result.value) {
          this.http.delete(this.apiUrl + 'org/stores/' + id)
          .pipe(map( data => data['data'] ))
          .subscribe(
              (data) => {
                // console.log(data)
                   if(data.status==0){
                    AppAlert.showError({text:data.message})
                   }
                //   else if(data.status==1){
                //     this.reloadTable()
                //   }

                this.reloadTable()

              },
              (error) => {
                console.log(error)
              }
          )
        }
      })
    }
    }
//

    loadLocations() {
      this.locationList$ = this.http.get<Location>(this.apiUrl + 'org/locations?active=1&fields=loc_id,loc_name')
      .pipe( map(res => res['data']) )
    }


    loadSections() {
      this.sectionList$ = this.http.get<Section>(this.apiUrl + 'org/sections?active=1&fields=section_id,section_name')
      .pipe( map(res => res['data']) )
    }


    showEvent(event){ //show event of the bs model
      this.formGroup.get('store_name').enable()
      this.formGroup.reset();
      this.modelTitle = "New Store"
      this.saveStatus = 'SAVE'
    }

    formValidate(){ //validate the form on input blur event
      this.appValidator.validate();
    }



}
