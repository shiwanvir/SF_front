import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { LayoutChangerService } from '../../core/service/layout-changer.service';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-origin-type',
  templateUrl: './origin-type.component.html',
  styleUrls: []
})
export class OriginTypeComponent implements OnInit {

  @ViewChild(ModalDirective) originTypeModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Origin Type"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'

  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  //to manage form error messages
  formFields = {
    origin_type : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient, private layoutChangerService : LayoutChangerService, private permissionService : PermissionsService,
  private auth : AuthService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Origin Type")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/origin-types/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'origin_type',
      /*error : 'Dep code already exists',*/
      data : {
        origin_type_id : function(controls){ return controls['origin_type_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      origin_type_id : 0,
      origin_type :   [null , [Validators.required, Validators.minLength(3), Validators.maxLength(50), PrimaryValidators.noSpecialCharactor],[primaryValidator.remote(remoteValidationConfig)]],
    })
        this.formValidator = new AppFormValidator(this.formGroup , {});
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.createTable() //load data list

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'Application Basic Setup',
      'Origin Type'
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
     this.datatable = $('#origin_type_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[0,'desc']],
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "org/origin-types?type=datatable"
        },
        columns: [
            {
              data: "origin_type_id",
              orderable: false,
              width: '3%',
              render : function(data,arg,full){
                var str = '';
                //if(this.permissionService.hasDefined('ORIGN_TYPE_DELETE')){
                    str = '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
              //  }
                  return str;
             }
           },
           {
             data: "status",
             orderable: false,
             render : function(data){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
          { data: "origin_type" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#origin_type_tbl').on('click','i',e => {
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

  //save and update source details
  saveOriginType(){
    //this.appValidation.validate();
    if(!this.formValidator.validate())//if validation faild return from the function
      return;
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let originTypeId = this.formGroup.get('origin_type_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/origin-types', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/origin-types/' + originTypeId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        //AppAlert.showSuccess({text : res.data.message })
        this.processing=false;
        this.formGroup.reset();
        this.reloadTable()
        this.originTypeModel.hide()
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
    this.http.get(this.apiUrl + 'org/origin-types/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.originTypeModel.show()
        this.modelTitle = "Update Origin Type"
        this.formGroup.setValue({
         'origin_type_id' : data['origin_type_id'],
         'origin_type' : data['origin_type']
        })
        this.formGroup.get('origin_type').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id, status) { //deactivate payment term

    if(status == 0)
      return

    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Origin Type ?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/origin-types/' + id)
        .pipe(map( data => data['data'] ))
        .subscribe(
            (data) => {
                if(data.status==1){

                this.reloadTable()
              }
              else if(data.status==0){
                AppAlert.showError({text:data.message});
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
    this.formGroup.get('origin_type').enable()
    this.formGroup.reset();
    this.modelTitle = "New Origin Type"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

}
