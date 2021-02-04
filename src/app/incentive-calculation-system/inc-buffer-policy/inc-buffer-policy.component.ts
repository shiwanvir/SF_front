import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
//third part Components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-inc-buffer-policy',
  templateUrl: './inc-buffer-policy.component.html',
  styleUrls: ['./inc-buffer-policy.component.css']
})
export class IncBufferPolicyComponent implements OnInit {
    @ViewChild(ModalDirective) bufferPolicyModel: ModalDirective;

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
      hours : ''
    }

    constructor(private fb:FormBuilder , private http:HttpClient, private layoutChangerService : LayoutChangerService, private permissionService : PermissionsService,
    private auth : AuthService, private titleService: Title) { }

    ngOnInit() {
      this.titleService.setTitle("Buffer Policy")//set page title

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
      let remoteValidationConfig = { //configuration for location code remote validation
        url:this.apiUrl + 'pic-system/buffer-policy/validate?for=duplicate',
        formFields : this.formFields,
        fieldCode : 'hours',
        /*error : 'Dep code already exists',*/
        data : {
          inc_buffer_id : function(controls){ return controls['inc_buffer_id']['value']}
        }
      }

      let basicValidator = new BasicValidators(this.http)//create object of basic validation class

      this.formGroup = this.fb.group({
        inc_buffer_id : 0,
        hours :   [null , [Validators.required, Validators.min(0) ],[primaryValidator.remote(remoteValidationConfig)]],
      })
          this.formValidator = new AppFormValidator(this.formGroup , {});
      //create new validation object
      // this.appValidator = new AppValidator(this.formFields,{},this.formGroup);
      //
      // this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      //   this.appValidator.validate();
      // })
      if(this.permissionService.hasDefined('BUFFER_POLICY_VIEW')){
      this.createTable() //load data list
      }
      //change header nevigation pagePath
      this.layoutChangerService.changeHeaderPath([
        'Production Incentive Calculation System',
        'Master Data',
        'Buffer Policy'
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
       this.datatable = $('#buffer_policy_tbl').DataTable({
         autoWidth: false,
         scrollY: "500px",
         scrollCollapse: true,
         processing: true,
         serverSide: true,
         order:[[0,'desc']],
         ajax: {
           headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
           dataType : 'JSON',
                "url": this.apiUrl + "pic-system/buffer-policy?type=datatable"
          },
          columns: [
              {
                data: "inc_buffer_id",
                orderable: false,
                width: '3%',
                render : (data,arg,full) => {
                  var str = '';
                  if(this.permissionService.hasDefined('BUFFER_POLICY_EDIT')){
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                }
                  // if(this.permissionService.hasDefined('BUFFER_POLICY_DELETE')){
                  //   str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                  //   data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'"></i>';
                  // }
                  if( full.status== 0 ) {
                        str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed;margin-right:3px" data-action="DISABLE" data-id="'+data+'">\n\
  </i><i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed" data-action="DISABLE" data-id="'+data+'"></i>';
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
            { data: "hours" }
         ],
       });

       //listen to the click event of edit and delete buttons
       $('#buffer_policy_tbl').on('click','i',e => {
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
    save(){
      //this.appValidation.validate();
      if(!this.formValidator.validate())//if validation faild return from the function
        return;
      this.processing = true
      AppAlert.showMessage('Processing...','Please wait while saving details')
      let saveOrUpdate$ = null;
      let typeId = this.formGroup.get('inc_buffer_id').value
      if(this.saveStatus == 'SAVE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'pic-system/buffer-policy', this.formGroup.getRawValue())
      }
      else if(this.saveStatus == 'UPDATE'){
        saveOrUpdate$ = this.http.put(this.apiUrl + 'pic-system/buffer-policy/' + typeId , this.formGroup.getRawValue())
      }

      saveOrUpdate$.subscribe(
        (res) => {
          //AppAlert.showSuccess({text : res.data.message })
          this.processing=false;
          this.formGroup.reset();
          this.reloadTable()
          this.bufferPolicyModel.hide()
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
      this.http.get(this.apiUrl + 'pic-system/buffer-policy/' + id)
      .pipe(map( data => data['data'] ))
      .subscribe(data => {
        if(data['status'] == '1')
        {
          this.bufferPolicyModel.show()
          this.modelTitle = "Update Buffer Policy"
          this.formGroup.setValue({
           'inc_buffer_id' : data['inc_buffer_id'],
           'hours' : data['hours']
          })
          //this.formGroup.get('hours').disable()
          this.saveStatus = 'UPDATE'
        }
      })
    }


    delete(id, status) { //deactivate payment term

      if(status == 0)
        return

      AppAlert.showConfirm({
        'text' : 'Do you want to deactivate selected Buffer Policy ?'
      },
      (result) => {
        if (result.value) {
          this.http.delete(this.apiUrl + 'pic-system/buffer-policy/' + id)
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
      //this.formGroup.get('hours').enable()
      this.formGroup.reset();
      this.modelTitle = "New Buffer Policy"
      this.saveStatus = 'SAVE'
    }

    keyPress(event: any) {
          const pattern = /^(([0-9]*)|(([0-9]*)\.([0-9]*)))$/;

          let inputChar = String.fromCharCode(event.charCode);
          if (event.keyCode != 8 && !pattern.test(inputChar)) {
            event.preventDefault();
          }
}

}
