import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
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
  selector: 'app-position',
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.css']
})
export class PositionComponent implements OnInit {
@ViewChild(ModalDirective) colorOptionModel: ModalDirective;

formGroup : FormGroup
modelTitle : string = "New Fabric Position"
readonly apiUrl = AppConfig.apiUrl()
formValidator : AppFormValidator = null
appValidator : AppValidator
datatable:any = null
saveStatus = 'SAVE'

processing : boolean = false
loading : boolean = false
loadingCount : number = 0
initialized : boolean = false

//to manage form error messages
formFields = {
  position : ''
}


  constructor(private fb:FormBuilder , private http:HttpClient, private layoutChangerService : LayoutChangerService, private permissionService : PermissionsService,
  private auth : AuthService, private titleService: Title ) { }


   ngOnInit() {
        this.titleService.setTitle("Fabric Position")//set page title

        let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
     let remoteValidationConfig = { //configuration for location code remote validation
       url:this.apiUrl + 'merchandising/position/validate?for=duplicate',
       formFields : this.formFields,
       fieldCode : 'position',
       /*error : 'Dep code already exists',*/
       data : {
         position_id : function(controls){ return controls['position_id']['value']}
       }
     }

     let basicValidator = new BasicValidators(this.http)//create object of basic validation class

     this.formGroup = this.fb.group({
       position_id: 0,
       position :  [null , [Validators.required , Validators.maxLength(100), PrimaryValidators.noSpecialCharactor], [primaryValidator.remote(remoteValidationConfig)]],

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
       'Fabric Position'
     ])

     //listten to the menu collapse and hide button
     this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
       if(data == false){return;}
       this.datatable.draw(false);
     })
   }

   ngOnDestroy(){
       this.datatable = null
   }

   createTable() { //initialize datatable
      this.datatable = $('#col_opt_table').DataTable({
        autoWidth: true,
        scrollY: "500px",
        scrollCollapse: true,
        processing: true,
        serverSide: true,
        order:[[0,'desc']],
        ajax: {
             dataType : 'JSON',
             "url": this.apiUrl + "merchandising/position?type=datatable"
         },
         columns: [
             {
               data: "position_id",
               orderable: false,
               width: '3%',
               render : (data,arg,full)=>{
                 var str = '';
                 if(this.permissionService.hasDefined('FABRIC_POSITION_DELETE')){
                     str = '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                 data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'"></i>';
               }
                 if( full.status== 0 ) {
                     str = '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed" data-action="DISABLE" data-id="'+data+'"></i>';
                 }
               //}
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

           { data: "position" }
        ],
      });

      //listen to the click event of edit and delete buttons
      $('#col_opt_table').on('click','i',e => {
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
   saveUOM(){
     //this.appValidation.validate();
     this.processing = true
     let saveOrUpdate$ = null;
     let positionId= this.formGroup.get('position_id').value
     if(this.saveStatus == 'SAVE'){
       saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/position', this.formGroup.getRawValue())
     }
     else if(this.saveStatus == 'UPDATE'){
       saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/position/' + positionId , this.formGroup.getRawValue())
     }

     saveOrUpdate$.subscribe(
       (res) => {
         this.processing=false;
         //AppAlert.showSuccess({text : res.data.message })
         this.formGroup.reset();
         this.reloadTable()
         this.colorOptionModel.hide()
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
     this.http.get(this.apiUrl + 'merchandising/position/' + id )
     .pipe( map(res => res['data']) )
     .subscribe(data => {
       if(data['status'] == '1')
       {
         this.colorOptionModel.show()
         this.modelTitle = "Update Fabric Position"
         this.formGroup.setValue({
          'position_id' : data['position_id'],
          'position' : data['position']
         })
         this.formGroup.get('position')
         this.saveStatus = 'UPDATE'
       }
     })
   }

   delete(id, status) { //deactivate payment term

     if(status == 0)
      return

     AppAlert.showConfirm({
       'text' : 'Do you want to deactivate selected Fabric Position?'
     },
     (result) => {
       if (result.value) {
         this.http.delete(this.apiUrl + 'merchandising/position/' + id)
         .pipe(map(data=>data['data']))
         .subscribe(
             (data) => {
               if(data.status==0){
                 AppAlert.showError({text:data.message})
                  this.reloadTable()
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
     this.formGroup.get('position').enable()
     this.formGroup.reset();
     this.modelTitle = "New Fabric Position"
     this.saveStatus = 'SAVE'
   }

   formValidate(){ //validate the form on input blur event
     this.appValidator.validate();
   }
}
