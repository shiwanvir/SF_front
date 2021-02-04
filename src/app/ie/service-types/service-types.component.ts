import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import {ComponentLoaderFactory} from 'ngx-bootstrap/component-loader';
import {PositioningService} from 'ngx-bootstrap/positioning';


declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-service-types',
  templateUrl: './service-types.component.html',
  styleUrls: [],
  providers: [ComponentLoaderFactory,PositioningService]
})
export class ServiceTypesComponent implements OnInit {

  @ViewChild(ModalDirective) serviceTypesModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = "New Service Type"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'

  processing:boolean = false

  //to manage form error messages
  formFields = {
    service_type_code : '',
    service_type_description : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService:PermissionsService,
    private auth : AuthService, private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Service Types")//set page title

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'ie/servicetypes/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'service_type_code',
      /*error : 'Dep code already exists',*/
      data : {
        service_type_id : function(controls){ return controls['service_type_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      service_type_id : 0,
      service_type_code : [null , [Validators.required,Validators.minLength(2), Validators.maxLength(10)],[basicValidator.remote(remoteValidationConfig)]],
      service_type_description : [null , [Validators.required, Validators.maxLength(100)]]
    })

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    if(this.permissionService.hasDefined('SERVICE_TYPE_VIEW')){
      this.createTable() //load data list
    }

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'Merchandising',
      'Service Types'
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
     this.datatable = $('#service_types_tbl').DataTable({
       autoWidth: true,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[0,'desc']],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "ie/servicetypes?type=datatable"
        },
        columns: [
            {
              data: "service_type_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('SERVICE_TYPE_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                }
                if(this.permissionService.hasDefined('SERVICE_TYPE_DELETE')){ //check delete permission
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                  data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
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
          { data: "service_type_code" },
          { data: "service_type_description" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#service_types_tbl').on('click','i',e => {
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
  saveServiceType(){
    //this.appValidation.validate();
    this.processing=true;
   AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let serviceTypeId = this.formGroup.get('service_type_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'ie/servicetypes', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'ie/servicetypes/' + serviceTypeId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.processing = false
        if(res.data.status=='0'){
          AppAlert.showError({text:res.data.message})
          this.formGroup.reset();
          this.reloadTable()
          this.serviceTypesModel.hide()
        }
        else if(res.data.status=='1'){
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.serviceTypesModel.hide()
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
    this.http.get(this.apiUrl + 'ie/servicetypes/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.serviceTypesModel.show()
        this.modelTitle = "Update Service Type"
        this.formGroup.setValue({
         'service_type_id' : data['service_type_id'],
         'service_type_code' : data['service_type_code'],
         'service_type_description' : data['service_type_description']
        })
        this.formGroup.get('service_type_code').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id, status) { //deactivate payment term
    console.log(id)
    if(status == 0)
      return
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Service Type?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'ie/servicetypes/' + id)
        .pipe( map(res => res['data']) )
        .subscribe(
            (data) => {
              if(data.status==0 ){
                AppAlert.showError({'text':data.message})
              }
                this.reloadTable()
            },
            (error) => {
              console.log(error)
            }
        )
      }
    })
  }


  showEvent(event){ //show event of the bs model
    this.formGroup.get('service_type_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Service Type"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

}
