import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

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

@Component({
  selector: 'app-cancellation-category',
  templateUrl: './cancellation-category.component.html',
  styleUrls: []
})
export class CancellationCategoryComponent implements OnInit {

  @ViewChild(ModalDirective) categoryModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Cancellation Category"
  apiUrl = AppConfig.apiUrl()
  datatable : any = null
  saveStatus = 'SAVE'

  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService:PermissionsService,
    private auth : AuthService, private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/cancellation-categories/validate?for=duplicate',
      fieldCode : 'category_code',
      /*error : 'Group code already exists',*/
      data : {
        category_id : function(controls){ return controls['category_id']['value']}
      }
    }

    this.formGroup = this.fb.group({
      category_id : 0,
      category_code :  [null , [Validators.required,Validators.minLength(3), Validators.maxLength(10), PrimaryValidators.noSpecialCharactor] ,[primaryValidator.remote(remoteValidationConfig)]],
      category_description :[null, [Validators.required, Validators.maxLength(100), PrimaryValidators.noSpecialCharactor]],
    })

    this.formValidator = new AppFormValidator(this.formGroup , {});

    this.createTable()

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
     this.datatable = $('#category_tbl').DataTable({
     autoWidth: true,
     scrollY: "500px",
     scrollCollapse: true,
     processing: true,
     serverSide: true,
     order:[[0,'desc']],
     ajax: {
          headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
          dataType : 'JSON',
          "url": this.apiUrl + "org/cancellation-categories?type=datatable"
      },
       columns: [
            {
              data: "category_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
              if(this.permissionService.hasDefined('CANCEL_CATEGORY_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
              if(this.permissionService.hasDefined('CANCEL_CATEGORY_DELETE')){
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                  data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
              }
                return str;
             }
           },
           {
             data: "status",
             render : function(data){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
          { data: "category_code" },
          { data: "category_description" }
       ]
     });

     //listen to the click event of edit and delete buttons
     $('#category_tbl').on('click','i',e => {
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
  saveCategory(){
    if(!this.formValidator.validate())//if validation faild return from the function
      return;
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let categoryId = this.formGroup.get('category_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/cancellation-categories', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/cancellation-categories/' + categoryId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        if(res.data.status=='0'){
          AppAlert.closeAlert()
          this.processing = false
          this.formGroup.reset();
          AppAlert.showError({text : res.data.message })
          this.reloadTable()
          this.categoryModel.hide()
        }
        else if(res.data.status=='1'){
        AppAlert.closeAlert()
        this.processing = false
        this.formGroup.reset();
        AppAlert.showSuccess({text : res.data.message })
        this.reloadTable()
        this.categoryModel.hide()
      }
        /*setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showSuccess({text : res.data.message })
        } , 500)*/
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
    this.http.get(this.apiUrl + 'org/cancellation-categories/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.categoryModel.show()
        this.modelTitle = "Update Cancellation Category"
        this.formGroup.setValue({
         'category_id' : data['category_id'],
         'category_code' : data['category_code'],
         'category_description' : data['category_description']
        })
        this.formGroup.get('category_code').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }

  delete(id, status) { //deactivate payment

    if(status == 0)
      return

    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Cancellation Category?'
    },(result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/cancellation-categories/' + id)
        .pipe(map(data=>data['data']))
        .subscribe(
            (data) => {
              console.log(data)
                if(data['status'] == "0"){
                  AppAlert.showError({text:data.message})
                  this.reloadTable()
                }
                else if(data['status'] == "1"){
                  //AppAlert.showSuccess({text:data.message})
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
    this.formGroup.get('category_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Cancellation Category"
    this.saveStatus = "SAVE"
  }

}
