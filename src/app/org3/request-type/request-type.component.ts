import { Component, OnInit ,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

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
  selector: 'app-request-type',
  templateUrl: './request-type.component.html',
  styleUrls: ['./request-type.component.css']
})


export class  RequestTypeComponent  implements OnInit {

@ViewChild(ModalDirective) requestTypeModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Request Type"
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

  request_type: ''
  }

    constructor(private fb:FormBuilder , private http:HttpClient, private layoutChangerService : LayoutChangerService, private permissionService : PermissionsService,
    private auth : AuthService, private titleService: Title) { }


      ngOnInit() {
          this.titleService.setTitle("Request Type")//set page titl

          let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
          let remoteValidationConfig = { //configuration for location code remote validation
          url:this.apiUrl + 'org/requestType/validate?for=duplicate',
          formFields : this.formFields,
          fieldCode : 'request_type',
          /*error : 'Dep code already exists',*/
          data : {
            request_type_id : function(controls){ return controls['request_type_id']['value']}
          }
        }

        let basicValidator = new BasicValidators(this.http)//create object of basic validation class

        this.formGroup = this.fb.group({
          request_type_id : 0,
          request_type:  [null , [Validators.required,PrimaryValidators.noSpecialCharactor],[primaryValidator.remote(remoteValidationConfig)]],

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
          'Request Type'
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
         this.datatable = $('#request_type_table').DataTable({
           autoWidth: true,
           scrollY: "500px",
           scrollCollapse: true,
           processing: true,
           serverSide: true,
           order:[[0,'desc']],
           ajax: {
                dataType : 'JSON',
                "url": this.apiUrl + "org/requestType?type=datatable"
            },
            columns: [
                {
                  data: "request_type_id",
                  orderable: false,
                  width: '3%',
                  render :(data,arg,full) =>{
                    var str = '';
                  if(this.permissionService.hasDefined('REQUEST_TYPE_DELETE')){
                      str = '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                    data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
                  }
                    return str;
                 }
               },
               {
                 data: "status",
                 /*orderable: false,*/
                 render : function(data){
                   if(data == 1){
                       return '<span class="label label-success">Active</span>';
                   }
                   else{
                     return '<span class="label label-default">Inactive</span>';
                   }
                 }
              },

              { data: "request_type" }
           ],
         });

         //listen to the click event of edit and delete buttons
         $('#request_type_table').on('click','i',e => {
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
      saveRequestType(){
        //this.appValidation.validate();
        if(!this.formValidator.validate())//if validation faild return from the function
          return;
        this.processing = true
        AppAlert.showMessage('Processing...','Please wait while saving details')
        let saveOrUpdate$ = null;
        let colOptId = this.formGroup.get('request_type_id').value
        if(this.saveStatus == 'SAVE'){
          saveOrUpdate$ = this.http.post(this.apiUrl + 'org/requestType', this.formGroup.getRawValue())
        }
        else if(this.saveStatus == 'UPDATE'){
          saveOrUpdate$ = this.http.put(this.apiUrl + 'org/requestType/' + colOptId , this.formGroup.getRawValue())
        }

        saveOrUpdate$.subscribe(
          (res) => {
            //AppAlert.showSuccess({text : res.data.message })
            this.processing=false;
            this.formGroup.reset();
            this.reloadTable()
            this.requestTypeModel.hide()
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
          this.http.get(this.apiUrl + 'org/requestType/' + id )
          .pipe( map(res => res['data']) )
          .subscribe(data => {
            if(data['status'] == '1')
            {
              this.requestTypeModel.show()
              this.modelTitle = "Update Request Type"
              this.formGroup.setValue({
               'request_type_id' : data['request_type_id'],
               'request_type' : data['request_type']
              })
              this.formGroup.get('request_type').disable();
              this.saveStatus = 'UPDATE'
            }
          })
        }

        delete(id, status) { //deactivate Request Type
          if(status == 0)
            return

          AppAlert.showConfirm({
            'text' : 'Do you want to deactivate selected Request Type?'
          },
          (result) => {
            if (result.value) {
              this.http.delete(this.apiUrl + 'org/requestType/' + id)
              .subscribe(
                  (data) => {
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
          this.formGroup.get('request_type').enable()
          this.formGroup.reset();
          this.modelTitle = "New Request Type"
          this.saveStatus = 'SAVE'
        }

          formValidate(){ //validate the form on input blur event
            this.appValidator.validate();
          }


}
