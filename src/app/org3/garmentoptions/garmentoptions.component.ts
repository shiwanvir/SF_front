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

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';



@Component({
  selector: 'app-garmentoptions',
  templateUrl: './garmentoptions.component.html',
  styleUrls: []
})
export class GarmentoptionsComponent implements OnInit {

  @ViewChild(ModalDirective) garmentoptionsModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Garment Option"
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
    garment_options_description : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private titleService: Title,private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.titleService.setTitle("Garment Option")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/garmentoptions/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'garment_options_description',
      /*error : 'Dep code already exists',*/
      data : {
        garment_options_id : function(controls){ return controls['garment_options_id']['value']}
      }
    }
//
    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      garment_options_id : 0,
      garment_options_description : [null , [Validators.required],[primaryValidator.remote(remoteValidationConfig)]],
    })
      this.formValidator = new AppFormValidator(this.formGroup , {});//form validation class
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    if(this.permissionService.hasDefined('GARMENT_OPTION_VIEW')){
      this.createTable() //load data list
    }


    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Master Data',
      'Garment Option'
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
     this.datatable = $('#garmentoptions_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[0,'desc']],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "org/garmentoptions?type=datatable"
        },
        columns: [
            {
              data: "garment_options_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('GARMENT_OPTION_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
                if(this.permissionService.hasDefined('GARMENT_OPTION_DELETE')){ //check delete permission
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'"></i>';
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
          { data: "garment_options_description" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#garmentoptions_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value'],att['data-status']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

  //save and update source details
  saveGarmentoptions(){
    //this.appValidation.validate();
    if(!this.formValidator.validate())//if validation faild return from the function
      return;
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let garmentoptionsId = this.formGroup.get('garment_options_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/garmentoptions', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/garmentoptions/' + garmentoptionsId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
          console.log(res)
        if(res['data']['status'] == 0){
          AppAlert.showError({text:res['data']['message']})
          this.garmentoptionsModel.hide()
          this.reloadTable()
        }else{

          this.processing=false;
          AppAlert.showSuccess({text : res.data.message })
          this.formGroup.reset();
          this.reloadTable()
          this.garmentoptionsModel.hide()

        }

     },
     (error) => {
       this.processing=false;
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

    this.http.get(this.apiUrl + 'org/garmentoptions/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {

      if(data['status'] == '1')
      {
        this.garmentoptionsModel.show()
        this.modelTitle = "Update Garment Option"
        this.formGroup.setValue({
         'garment_options_id' : data['garment_options_id'],
         'garment_options_description' : data['garment_options_description']
        })
        this.saveStatus = 'UPDATE'
      }

    })
  }


  delete(id,status) { //deactivate payment term
    if(status==0){
    return
}
        AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Garment Option?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/garmentoptions/' + id)
        .subscribe(
            (data) => {
              console.log(data)
              if(data['data']['status']==0){
                 AppAlert.showError({text:data['data']['message']})
                  this.reloadTable()
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
    this.formGroup.get('garment_options_description').enable()
    this.formGroup.reset();
    this.modelTitle = "New Garment Option"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }


}
