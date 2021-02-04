import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-source',
  templateUrl: './source.component.html',
  styleUrls: []
})

export class SourceComponent implements OnInit {

  @ViewChild(ModalDirective) sourceModel: ModalDirective;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    //debugger
  }
  formGroup : FormGroup
  popupHeaderTitle : string = "New Parent Company"
  apiUrl = AppConfig.apiUrl()
  formValidator : AppFormValidator
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false
  public innerWidth: any;

  constructor(private fb:FormBuilder , private http:HttpClient, public permissionService:PermissionsService, private auth : AuthService,
    private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {

    this.initializeForm()
    this.innerWidth = window.innerWidth;

  }


  initializeForm(){
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/sources/validate?for=duplicate',
      /*formFields : this.formFields,*/
      fieldCode : 'source_code',
      error : 'Parent Company Code already exists',
      data : {
        source_id : function(controls){ return controls['source_id']['value']}
      }
    }

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      source_id : 0,
      source_code : [null , [Validators.required, PrimaryValidators.noSpecialCharactor],[primaryValidator.remote(remoteValidationConfig)]],
      source_name : [null , [Validators.required, PrimaryValidators.noSpecialCharactor]]
    })

    //create new validation object
    this.formValidator = new AppFormValidator(this.formGroup, {});

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
     this.datatable = $('#source_tbl').DataTable({
       /*autoWidth: false,*/
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order : [[ 4, 'desc' ]],
       columnDefs:[{
         targets:4,
         render:function(data){
            const date = new Date(data);
            const formattedDate = date.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}).replace(/ /g, '-');
            return formattedDate;
       }}],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "org/sources?type=datatable"
        },

       columns: [
            {
              data: "source_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('SOURCE_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
                if(this.permissionService.hasDefined('SOURCE_DELETE')){
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"data-status="'+full.status+'"></i>';
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
          { data: "source_code" },
          { data: "source_name" },
          { data: "created_date" }


       ],
     });

     //listen to the click event of edit and delete buttons
     $('#source_tbl').on('click','i',e => {
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
      this.datatable.ajax.reload(null, true);
  }


  //save and update source details
  saveSource(){
    if(!this.formValidator.validate())//if validation faild return from the function
      return;

    this.processing = true
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Processing...','Please wait while saving data')
    let saveOrUpdate$ = null;
    let sourceId = this.formGroup.get('source_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/sources', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/sources/' + sourceId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        if(res.data['status']=="0"){
          AppAlert.showError({text:"Parent Company already in use"})
          this.processing = false
          this.formGroup.reset();
          this.reloadTable()
          this.sourceModel.hide()
        }else{

          this.formGroup.reset();
          this.reloadTable()
          this.processing = false
          this.sourceModel.hide()

        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showSuccess({text : res.data.message })
        } , 1000)

      }
     },
     (error) => {
       this.processing = false
       // AppAlert.closeAlert()
       console.log(error)
       if(error.status == 422){ //validation error
         AppAlert.showError({title : 'Validation Error' , text : error.error.errors.validationErrorsText })
       }
       else if(error.status != 403){
         AppAlert.showError({title : 'Access Denied', text : "You don't have permissions to access this functionality" })
       }
     }
   );
  }



  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'org/sources/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1') {
        this.sourceModel.show()
        this.popupHeaderTitle = "Update Parent Company"
        this.formGroup.setValue({
         'source_id' : data['source_id'],
         'source_code' : data['source_code'],
         'source_name' : data['source_name']
        })
        this.formGroup.get('source_code').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id,status) {
     //deactivate payment term
       if(status == '0'){

        //AppAlert.showErrorInactived()
        return 0;
       }
    else {
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Parent Company?'
    },
    (result) => {
      if (result.value) {
        AppAlert.showMessage('Processing...','Please wait while deleting Parent Company')
        this.http.delete(this.apiUrl + 'org/sources/' + id)
        .subscribe(
            (data) => {
              if(data['data']['status'] == "0"){

                  AppAlert.showError({text:"Parent Company already in use"})
                }
                else{
                  this.reloadTable()
                  AppAlert.closeAlert()
                }
            },
            (error) => {
              //AppAlert.closeAlert()
              if(error.status != 403){
                AppAlert.showError({text : "Process Error" })
              }
            }
        )
      }
    })
  }
  }


  showEvent(event){ //show event of the bs model
    this.formGroup.get('source_code').enable()
    this.formGroup.reset();
    this.popupHeaderTitle = "New Parent Company"
    this.saveStatus = 'SAVE'
  }


}
