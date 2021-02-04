import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import {ComponentLoaderFactory} from 'ngx-bootstrap/component-loader';
import {PositioningService} from 'ngx-bootstrap/positioning';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-garment-operation-master',
  templateUrl: './garment-operation-master.component.html',
  styleUrls: [],
  providers: [ComponentLoaderFactory,PositioningService]
})
export class GarmentOperationMasterComponent implements OnInit {

  @ViewChild(ModalDirective) garmentOperationModel: ModalDirective;

  formValidator : AppFormValidator = null
  formGroup : FormGroup
  modelTitle : string = "New Garment Operation"
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

    garment_operation_name : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService,private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Garment Operation")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'ie/garment_operations/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'garment_operation_name',
      /*error : 'Dep code already exists',*/
      data : {
        garment_operation_id : function(controls){ return controls['garment_operation_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      garment_operation_id : 0,
      garment_operation_name : [null , [Validators.required],[primaryValidator.remote(remoteValidationConfig)]],
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
      'IE',
      'Garment Operation'
    ])
  }

  ngOnDestroy(){
      this.datatable = null
  }

  createTable() { //initialize datatable
     this.datatable = $('#garment_operation_tbl').DataTable({
       autoWidth: true,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[3,'desc']],
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "ie/garment_operations?type=datatable"
        },
        columns: [
            {
              data: "garment_operation_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full)=>{
                var str = '';
                if(this.permissionService.hasDefined('GARMENT_OPERATION_DELETE')){
                   str = '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
              }
                if( full.status== 0 ) {
                   str = '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;cursor:not-allowed" data-action="DISABLE"></i>';
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
          //{ data: "service_type_code" },
          { data: "garment_operation_name" },
          {data:"created_date",
           visible: false,
        }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#garment_operation_tbl').on('click','i',e => {
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
  saveGarmentOpeartion(){
    //this.appValidation.validate();
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let garmentOperationId = this.formGroup.get('garment_operation_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'ie/garment_operations', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'ie/garment_operations/' + garmentOperationId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.processing=false;
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.garmentOperationModel.hide()
     },
     (error) => {
       if(error.status == 422){ //validation error
         AppAlert.showError({title : 'Validation Error' , text : error.error.errors.validationErrorsText })
       }else{
         console.log(error)
         AppAlert.showError({text : 'Process Error' })
       }
     }
   );
  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'ie/garment_operations/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.garmentOperationModel.show()
        this.modelTitle = "Update Service Garment Operation"
        this.formGroup.setValue({
         'garment_operation_id' : data['garment_operation_id'],
         'garment_operation_name' : data['garment_operation_name']
        })
        this.formGroup.get('garment_operation_name').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Garment Operation?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'ie/garment_operations/' + id)
        .pipe(map( data => data['data'] ))
        .subscribe(
            (data) => {
              if(data.status=='1'){
                this.reloadTable()
              }
              else if(data.status=='0'){
                AppAlert.showError({text:data.message})
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
    this.formGroup.get('garment_operation_name').enable()
    this.formGroup.reset();
    this.modelTitle = "New Garment Operation"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }


}
