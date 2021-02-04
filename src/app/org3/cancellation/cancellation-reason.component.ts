import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { Observable } from 'rxjs';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

//model
import { CancellationCategory } from '../models/cancellation_category.model';

@Component({
  selector: 'app-cancellation-reason',
  templateUrl: './cancellation-reason.component.html',
  styleUrls: []
})
export class CancellationReasonComponent implements OnInit {

  @ViewChild(ModalDirective) reasonModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Cancellation Reason"
  readonly apiUrl = AppConfig.apiUrl()
  datatable:any = null
  category$ : Observable<CancellationCategory>
  saveStatus = 'SAVE'


  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  constructor(private fb:FormBuilder , private http:HttpClient,private permissionService : PermissionsService, private auth : AuthService,
    private router:Router, private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/cancellation-reasons/validate?for=duplicate',
      fieldCode : 'reason_code',
      data : {
        reason_id : function(controls){ return controls['reason_id']['value']}
      }
    }

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      reason_id : 0,
      reason_code :[null , [Validators.required,Validators.minLength(3), Validators.maxLength(10),PrimaryValidators.noSpecialCharactor] , [primaryValidator.remote(remoteValidationConfig)]],
      reason_description :[null , [Validators.required, Validators.maxLength(100), PrimaryValidators.noSpecialCharactor] ],
      reason_category :  [null , [Validators.required,PrimaryValidators.noSpecialCharactor] ]
    })
    this.formValidator = new AppFormValidator(this.formGroup , {});//creating new validation object

    this.createTable() //load data list
    this.loadCancellationCategoryList()

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
       this.datatable = $('#reason_tbl').DataTable({
       autoWidth: true,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[0,'desc']],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "org/cancellation-reasons?type=datatable"
        },
        columns: [
            {
              data: "reason_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('CANCEL_REASON_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                }
                if(this.permissionService.hasDefined('CANCEL_REASON_DELETE')){ //check delete permission
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
          { data: "reason_code" },
          { data: "category_description" },
          { data: "reason_description" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#reason_tbl').on('click','i',e => {
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
  saveReason(){
    //this.appValidation.validate();
    if(!this.formValidator.validate())//if validation faild return from the function
      return;
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let reasonId = this.formGroup.get('reason_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/cancellation-reasons', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/cancellation-reasons/' + reasonId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.processing = false
        this.formGroup.reset();
          this.reloadTable()
          this.reasonModel.hide()
        //AppAlert.showSuccess({text : res.data.message })
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
    this.http.get(this.apiUrl + 'org/cancellation-reasons/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1') {
        this.reasonModel.show()
        this.modelTitle = "Update Cancellation Reason"
        this.formGroup.setValue({
         'reason_id' : data['reason_id'],
         'reason_code' : data['reason_code'],
         'reason_description' : data['reason_description'],
         'reason_category' : data['reason_category']
        })
        this.formGroup.get('reason_code').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id, status) { //deactivate payment term

    if(status == 0)
      return

    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Cancellation Reason?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/cancellation-reasons/' + id)
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


  loadCancellationCategoryList()
  {
     this.category$ = this.http.get<CancellationCategory>(this.apiUrl + 'org/cancellation-categories?active=1&fields=category_id,category_description')
    .pipe( map(res => res['data']) )

  }


  showEvent(event){ //show event of the bs model
    this.formGroup.get('reason_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Cancellation Reason"
    this.saveStatus = 'SAVE'
  }


}
