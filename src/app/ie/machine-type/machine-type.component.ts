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
  selector: 'app-machine-type',
  templateUrl: './machine-type.component.html',
  styleUrls: ['./machine-type.component.css']
})
export class MachineTypeComponent implements OnInit {
  //MODAL FOR DATA ADDING
  @ViewChild(ModalDirective) garmentOperationModel: ModalDirective;

  formValidator : AppFormValidator = null
  formGroup : FormGroup
  modelTitle : string = "New Machine Type"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  //appValidator2:
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  //to manage form error messages
  formFields = {

        machine_type_code: '',
        machine_type_name:'',
  }



    constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
      private auth : AuthService,private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Machine Type")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'ie/machine_type/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'machine_type_code',
      /*error : 'Dep code already exists',*/
      data : {
        machine_type_id : function(controls){ return controls['machine_type_id']['value']}
      }
    }


        let basicValidator = new BasicValidators(this.http)//create object of basic validation class

        this.formGroup = this.fb.group({
          machine_type_id : 0,
          machine_type_code : [null , [Validators.required,Validators.maxLength(15),BasicValidators.noWhitespace,PrimaryValidators.noSpecialCharactor],[primaryValidator.remote(remoteValidationConfig)]],
          machine_type_name:[null , [Validators.required,Validators.maxLength(50)]],
                  })
        this.formValidator = new AppFormValidator(this.formGroup , {});
        //create new validation object
        this.appValidator = new AppValidator(this.formFields,{},this.formGroup);


        this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
          this.appValidator.validate();
        })
        if(this.permissionService.hasDefined('MACHINE_TYPE_VIEW')){
        this.createTable() //load data list
      }
        //change header nevigation pagePath
        this.layoutChangerService.changeHeaderPath([
          'Catalogue',
          'IE',
          'Machine Type'
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
     this.datatable = $('#garment_operation_tbl').DataTable({
       autoWidth: true,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       paging:true,
       searching:true,
       order:[[5,'desc']],
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "ie/machine_type?type=datatable"
        },
        columns: [
            {
              data: "machine_type_id",
              orderable: true,
              width: '3%',
              render : (data,arg,full)=>{
                var str = '';
                if(this.permissionService.hasDefined('MACHINE_TYPE_EDIT')){
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'" data-status="'+full['status']+'" data-approval-status="'+full['approval_status']+'"></i>';
                    if( full.status== 0||full.approval_status=="PENDING" ) {
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed;margin-right:3px" data-action="DISABLE" data-id="'+data+'">\n\
                  </i><i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed" data-action="DISABLE" data-id="'+data+'"></i>';
                  }
              }
                if(this.permissionService.hasDefined('MACHINE_TYPE_DELETE')){
                   str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'"></i>';

                   if( full.status== 0||full.approval_status=="PENDING" ) {
                   str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed;margin-right:3px" data-action="DISABLE" data-id="'+data+'">\n\
                 </i><i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed" data-action="DISABLE" data-id="'+data+'"></i>';
                 }
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
          {
            data: "approval_status",
            orderable: true,
            render : function(data){
              if(data == "APPROVED"){
                  return '<span class="label label-success">Approved</span>';
              }
              else if(data == "PENDING"){
                  return '<span class="label label-warning">Pending</span>';
              }
              else{
                return '<span class="label label-danger">Rejected</span>';
              }
            }
         },
          //{ data: "service_type_code" },
          { data: "machine_type_code"},
          { data: "machine_type_name"},
          {data:"created_date",
           visible: false,
        }

       ],
     });

     //listen to the click event of edit and delete buttons
     $('#garment_operation_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value'],att['data-status']['value'],att['data-approval-status']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value'],att['data-status']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }


  edit(id,status,approval_status){
  if(status==0||approval_status=="PENDING"){
      return 0;
    }
    this.http.get(this.apiUrl + 'ie/machine_type/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      //debugger
      if(data!=null){
        this.garmentOperationModel.show();
        this.formGroup.setValue({
          machine_type_id:data.machine_type_id,
          machine_type_code:data.machine_type_code,
          machine_type_name:data.machine_type_name
        })
        this.formGroup.get('machine_type_code').disable();
        this.modelTitle="Update Machine Type"
        this.saveStatus = 'UPDATE';
      }

    })
  }

  delete(id,status){
    if(status==0){
      return 0;
    }
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Machine type?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'ie/machine_type/' + id)
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

  save(){
    this.processing = true
    //AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    //debugger
    let machineTypeId = this.formGroup.get('machine_type_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'ie/machine_type', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'ie/machine_type/' + machineTypeId , this.formGroup.getRawValue())
    }


    saveOrUpdate$.subscribe(
      (res) => {
        if(res.data.status==1){
        this.processing=false;
        AppAlert.showSuccess({text : res.data.message })
       this.clear()
        this.reloadTable()
        this.garmentOperationModel.hide()
      }
      if(res.data.status==0){
        this.processing=false;
        AppAlert.showError({text : res.data.message })
       this.clear()
        this.reloadTable()
        this.garmentOperationModel.hide()
      }
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

  showEvent(event){ //show event of the bs model
    this.formGroup.get('machine_type_name').enable()
    this.formGroup.reset();
    this.modelTitle = "New Machine Type"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

clear(){

  this.formGroup.get('machine_type_code').enable();
  this.formGroup.reset();
  this.saveStatus = 'SAVE'
}

}
