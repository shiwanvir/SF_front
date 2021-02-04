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

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-color-options',
  templateUrl: './color-options.component.html',
  styleUrls: ['./color-options.component.css']
})
export class ColorOptionsComponent implements OnInit {

@ViewChild(ModalDirective) colorOptionModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Color Type"
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

    color_option : ''
  }

    constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
      private auth : AuthService, private layoutChangerService : LayoutChangerService, private titleService: Title) { }


      ngOnInit() {
          this.titleService.setTitle("Color Type")//set page title

          let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

        let remoteValidationConfig = { //configuration for location code remote validation
          url:this.apiUrl + 'merchandising/color-options/validate?for=duplicate',
          formFields : this.formFields,
          fieldCode : 'color_option',
          /*error : 'Dep code already exists',*/
          data : {
            col_opt_id : function(controls){ return controls['col_opt_id']['value']}
          }
        }

        let basicValidator = new BasicValidators(this.http)//create object of basic validation class

        this.formGroup = this.fb.group({
          col_opt_id : 0,
          color_option :[null , [Validators.required, Validators.minLength(1), Validators.maxLength(4), PrimaryValidators.noSpecialCharactor], [primaryValidator.remote(remoteValidationConfig)]],

        })

        this.formValidator = new AppFormValidator(this.formGroup , {});
            //create new validation object
        this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

        this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
          this.appValidator.validate();
        })

        if(this.permissionService.hasDefined('COLOR_OPTION_VIEW')){
          this.createTable() //load data list
        }

        //change header nevigation pagePath
        this.layoutChangerService.changeHeaderPath([
          'Product Development',
          'Master Data',
          'Color Type'
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
         this.datatable = $('#col_opt_table').DataTable({
           autoWidth: false,
           scrollY: "500px",
           scrollCollapse: true,
           processing: true,
           serverSide: true,
           order:[[0,'desc']],
           ajax: {
                headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
                dataType : 'JSON',
                "url": this.apiUrl + "merchandising/color-options?type=datatable"
            },
            columns: [
                {
                  data: "col_opt_id",
                  orderable: false,
                  width: '3%',
                  render : (data,arg,full) => {
                    var str = '';
                    if(this.permissionService.hasDefined('COLOR_OPTION_EDIT')){
                      str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                  }
                    if(this.permissionService.hasDefined('COLOR_OPTION_DELETE')){ //chek delete permission
                      str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                      data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
                    }
                    if( full.status== 0 ) {
                      str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed;margin-right:3px" data-action="DISABLE" data-id="'+data+'">\n\
              </i><i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed" data-action="DISABLE" data-id="'+data+'"></i>';
                    }
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

              { data: "color_option" }
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
        if(!this.formValidator.validate())//if validation faild return from the function
          return;
        this.processing = true
        AppAlert.showMessage('Processing...','Please wait while saving details')
        let saveOrUpdate$ = null;
        let colOptId = this.formGroup.get('col_opt_id').value
        if(this.saveStatus == 'SAVE'){
          saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/color-options', this.formGroup.getRawValue())
        }
        else if(this.saveStatus == 'UPDATE'){
          saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/color-options/' + colOptId , this.formGroup.getRawValue())
        }

        saveOrUpdate$.subscribe(
          (res) => {
            //AppAlert.showSuccess({text : res.data.message })
              this.processing=false;
              if(res.data.status=='0'){
                AppAlert.showError({text:res.data.message})
                this.formGroup.reset();
                this.reloadTable();
                this.colorOptionModel.hide();
              }
              else if(res.data.status=='1'){
            this.formGroup.reset();
            this.reloadTable()
            this.colorOptionModel.hide()
            setTimeout(() => {
              AppAlert.closeAlert()
              AppAlert.showSuccess({text : res.data.message })
            } , 500)
          }
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



        edit(id) { //get payment term data and open the model
          this.http.get(this.apiUrl + 'merchandising/color-options/' + id )
          .pipe( map(res => res['data']) )
          .subscribe(data => {
            if(data['status'] == '1')
            {
              this.colorOptionModel.show()
              this.modelTitle = "Update Color Type"
              this.formGroup.setValue({
               'col_opt_id' : data['col_opt_id'],
               'color_option' : data['color_option']
              })
              this.formGroup.get('color_option')
              this.saveStatus = 'UPDATE'
            }
          })
        }

        delete(id, status) { //deactivate payment term

          if(status == 0)
            return//

          AppAlert.showConfirm({
            'text' : 'Do you want to deactivate selected Color Type?'
          },
          (result) => {
            if (result.value) {
              this.http.delete(this.apiUrl + 'merchandising/color-options/' + id)
              .pipe(map(data=>data['data']))
              .subscribe(
                  (data) => {
                    if(data.status=='0'){
                      AppAlert.showError({text:data.message})
                    }
                    else if(data.status=='1'){
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
          this.formGroup.get('color_option').enable()
          this.formGroup.reset();
          this.modelTitle = "New Color Type"
          this.saveStatus = 'SAVE'
        }

          formValidate(){ //validate the form on input blur event
            this.appValidator.validate();
          }


}
