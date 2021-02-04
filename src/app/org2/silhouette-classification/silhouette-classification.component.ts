import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
//third part Components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
//import { NgOption } from '@ng-select/ng-select';
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
  selector: 'app-silhouette-classification',
  templateUrl: './silhouette-classification.component.html',
  styleUrls: ['./silhouette-classification.component.css']
})
export class SilhouetteClassificationComponent implements OnInit {

  @ViewChild(ModalDirective) silhouetteClassModel: ModalDirective;

  formGroup : FormGroup
  formGroupPopup:FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Silhouette Classification "
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  saveStatus = 'SAVE'

  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  formFields = {
      sil_class_description: '',
      validation_error :''
  }

  constructor(private fb:FormBuilder,private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private layoutChangerService : LayoutChangerService, private titleService: Title) { }


  //let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

  ngOnInit() {
    this.titleService.setTitle("Silhouette Classification")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    let remoteValidationConfig={
      url:this.apiUrl + 'org/silhouette-classification/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'sil_class_description',
      /*error : 'Dep code already exists',*/
      data : {
      sil_class_id: function(controls){ return controls['sil_class_id']['value'] },
      sil_class_description : function(controls){if(controls['sil_class_description']['value']!=null){ return controls['sil_class_description']['value']}
      else
      return null;
    },
  }
  }


    let basicValidator = new BasicValidators(this.http)//create object of basic validation class
    this.formGroup = this.fb.group({
      sil_class_id : 0,
          sil_class_description : [null , [Validators.required,Validators.minLength(3), Validators.maxLength(50)],[primaryValidator.remote(remoteValidationConfig)]],
        })
   this.formValidator = new AppFormValidator(this.formGroup , {});
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

  if(this.permissionService.hasDefined('PROD_CLASIFICATION_VIEW')){
    this.createTable()
  }

  //change header nevigation pagePath
  this.layoutChangerService.changeHeaderPath([
    'Product Development',
    'Master Data',
    'Silhouette Classification'
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
     this.datatable = $('#sil-class-table').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[0,'desc']],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "org/silhouette-classification?type=datatable"
        },
        columns: [
            {
              data: "sil_class_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('PROD_CLASIFICATION_EDIT')){
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
                if(this.permissionService.hasDefined('PROD_CLASIFICATION_DELETE')){ //check delete permission
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                  data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'"></i>';
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
             { data: "sil_class_description" }

       ],
     });

     //listen to the click event of edit and delete buttons
     $('#sil-class-table').on('click','i',e => {
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
    saveTm(){
      //this.appValidation.validate();
      if(!this.formValidator.validate())//if validation faild return from the function
        return;
      this.processing = true
      AppAlert.showMessage('Processing...','Please wait while saving details')

      let saveOrUpdate$ = null;
      let silClassId = this.formGroup.get('sil_class_id').value
      if(this.saveStatus == 'SAVE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'org/silhouette-classification', this.formGroup.getRawValue())
      }
      else if(this.saveStatus == 'UPDATE'){
        saveOrUpdate$ = this.http.put(this.apiUrl + 'org/silhouette-classification/' + silClassId , this.formGroup.getRawValue())
      }




      saveOrUpdate$.subscribe(
        (res) => {
          //AppAlert.showSuccess({text : res.data.message })
          this.processing=false;
          this.formGroup.reset();
          this.reloadTable()
          this.silhouetteClassModel.hide()
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({text : res.data.message })
          } , 500)
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
      this.http.get(this.apiUrl + 'org/silhouette-classification/' + id)
      .pipe(map( data => data['data'] ))
      .subscribe(data => {
          if(data['status'] == '1') {
            this.silhouetteClassModel.show()
            this.modelTitle = "Update Silhouette Classification"
            this.formGroup.setValue({
             'sil_class_id' : data['sil_class_id'],
             'sil_class_description' : data['sil_class_description']
            })
            //this.formGroup.get('trans_code').disable()
            this.saveStatus = 'UPDATE'
          }
        })

    }
    delete(id, status) { //deactivate payment term

      if(status == 0)
        return

      AppAlert.showConfirm({
        'text' : 'Do you want to deactivate selected  Silhouette Classification?'
      },
      (result) => {
        if (result.value) {
          this.http.delete(this.apiUrl + 'org/silhouette-classification/' + id)
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
      this.formGroup.get('sil_class_id').enable()
      this.formGroup.reset();
      this.modelTitle = "New Silhouette Classification"
      this.saveStatus = 'SAVE'
    }

    formValidate(){ //validate the form on input blur event
      this.appValidator.validate();
    }

}
