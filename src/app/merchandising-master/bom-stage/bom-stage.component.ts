import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
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
  selector: 'app-bom-stage',
  templateUrl: './bom-stage.component.html',
  styleUrls: ['./bom-stage.component.css']
})
export class BomStageComponent implements OnInit {

  @ViewChild(ModalDirective) bomStageModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = "New BOM Stage"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  formValidator : AppFormValidator = null
  datatable:any = null
  saveStatus = 'SAVE'

  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false
  //to manage form error messages
  formFields = {
    bom_stage_description : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("BOM Stage")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'merchandising/bomstages/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'bom_stage_description',
      /*error : 'Dep code already exists',*/
      data : {
        bom_stage_id : function(controls){ return controls['bom_stage_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      bom_stage_id : 0,
      bom_stage_description :[null , [Validators.required, Validators.minLength(3), Validators.maxLength(50), PrimaryValidators.noSpecialCharactor] , [primaryValidator.remote(remoteValidationConfig)]],
    })

      this.formValidator = new AppFormValidator(this.formGroup , { });
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    if(this.permissionService.hasDefined('BOM_STAGE_VIEW')){
      this.createTable() //load data list
    }

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Master Data',
      'BOM Stage'
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
     this.datatable = $('#bomStage_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order : [[ 0, 'desc' ]],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "merchandising/bomstages?type=datatable"
        },
        columns: [
            {
              data: "bom_stage_id",
              orderable: true,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('BOM_STAGE_EDIT')){
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
                if(this.permissionService.hasDefined('BOM_STAGE_DELETE')){ // check delete permission
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
          { data: "bom_stage_description" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#bomStage_tbl').on('click','i',e => {
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
  saveBomStage(){
    //this.appValidation.validate();
    this.processing = true
    let saveOrUpdate$ = null;
    let bomStageId = this.formGroup.get('bom_stage_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/bomstages', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/bomstages/' + bomStageId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.processing = false
        console.log(res.data['status'])
        if(res.data['status']=="0"){
          AppAlert.showError({text:"BOM Stage already in use"})
          this.formGroup.reset();
          this.reloadTable()
          this.bomStageModel.hide()
        }
        else{
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.bomStageModel.hide()
      }
     },
     (error) => {
       this.processing = false
       if(error.status == 422){ //validation error
         AppAlert.showError({title : 'Validation Error' , text : error.error.errors.validationErrorsText })
       }else{
         AppAlert.showError({text : 'Process Error' })
       }
     }
   );
  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'merchandising/bomstages/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.bomStageModel.show()
        this.modelTitle = "Update BOM Stage"
        this.formGroup.setValue({
         'bom_stage_id' : data['bom_stage_id'],
         'bom_stage_description' : data['bom_stage_description']
        })
        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id, status) { //deactivate payment term

    if(status == 0)
        return

    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected BOM Stage?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'merchandising/bomstages/' + id)
          .pipe(map( data => data['data'] ))
        .subscribe(
            (data) => {
              if(data['status'] == '0'){
                  AppAlert.showError({text:"BOM Stage already in use"})
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
    this.formGroup.get('bom_stage_description').enable()
    this.formGroup.reset();
    this.modelTitle = "New BOM Stage"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }


}
