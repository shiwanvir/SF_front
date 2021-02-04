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
  selector: 'app-garment-operation-component',
  templateUrl: './garment-operation-component.component.html',
  styleUrls: ['./garment-operation-component.component.css'],
  providers: [ComponentLoaderFactory,PositioningService]
})
export class GarmentOperationComponentComponent implements OnInit {
  //MODAL FOR DATA ADDING
  @ViewChild(ModalDirective) garmentOperationModel: ModalDirective;

  formValidator : AppFormValidator = null
  formGroup : FormGroup
  modelTitle : string = "New Operation component"
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

        operation_component_code: '',
        operation_component_name:'',
  }



  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService,private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Operation Component")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'ie/garment_operation_components/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'operation_component_code',
      /*error : 'Dep code already exists',*/
      data : {
        operation_component_id : function(controls){ return controls['operation_component_id']['value']}
      }
    }


        let basicValidator = new BasicValidators(this.http)//create object of basic validation class

        this.formGroup = this.fb.group({
          operation_component_id : 0,
          operation_component_code : [null , [Validators.required,Validators.maxLength(15),BasicValidators.noWhitespace,PrimaryValidators.noSpecialCharactor],[primaryValidator.remote(remoteValidationConfig)]],
          operation_component_name:[null , [Validators.required,Validators.maxLength(50)]],
                  })
        this.formValidator = new AppFormValidator(this.formGroup , {});
        //create new validation object
        this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

        this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
          this.appValidator.validate();
        })
        if(this.permissionService.hasDefined('OPERATION_COMPONENT_VIEW')){
        this.createTable() //load data list
      }
        //change header nevigation pagePath
        this.layoutChangerService.changeHeaderPath([
          'Catalogue',
          'IE',
          'Operation Component'
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
            "url": this.apiUrl + "ie/garment_operation_components?type=datatable"
        },
        columns: [
            {
              data: "operation_component_id",
              orderable: true,
              width: '3%',
              render : (data,arg,full)=>{
                var str = '';
                if(this.permissionService.hasDefined('OPERATION_COMPONENT_EDIT')){
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"  data-status="'+full['status']+'" data-approval-status="'+full['approval_status']+'"  ></i>';
                    if( full.status== 0||full.approval_status=="PENDING" ) {
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed;margin-right:3px" data-action="DISABLE" data-id="'+data+'">\n\
                  </i><i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed" data-action="DISABLE" data-id="'+data+'"></i>';
                  }
              }
                if(this.permissionService.hasDefined('OPERATION_COMPONENT_DELETE')){
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
          { data: "operation_component_code"},
          { data: "operation_component_name"},
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
    this.http.get(this.apiUrl + 'ie/garment_operation_components/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      //debugger
      if(data!=null){
        this.garmentOperationModel.show();
        this.formGroup.setValue({
          operation_component_id:data.operation_component_id,
          operation_component_code:data.operation_component_code,
          operation_component_name:data.operation_component_name
        })
        this.formGroup.get('operation_component_code').disable();
        this.modelTitle="Update Operation Component"
        this.saveStatus = 'UPDATE';
      }

    })
  }

  delete(id,status){
    if(status==0){
      return 0;
    }
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Operation Component?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'ie/garment_operation_components/' + id)
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
    let operationComponentId = this.formGroup.get('operation_component_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'ie/garment_operation_components', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'ie/garment_operation_components/' + operationComponentId , this.formGroup.getRawValue())
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
    this.formGroup.get('operation_component_name').enable()
    this.formGroup.reset();
    this.modelTitle = "New Operation Component"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

clear(){

  this.formGroup.get('operation_component_code').enable();
  this.formGroup.reset();
  this.saveStatus = 'SAVE'
}
}
