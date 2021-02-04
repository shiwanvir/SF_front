import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

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
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: []
})
export class SectionComponent implements OnInit {

  @ViewChild(ModalDirective) sectionModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = "New Section"
  apiUrl = AppConfig.apiUrl()
  formValidator : AppFormValidator = null
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false


  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private router:Router, private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  ngOnInit() {
     this.titleService.setTitle('Section')//change page title

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

      let remoteValidationConfig = { //configuration for location code remote validation
        url:this.apiUrl + 'org/sections/validate?for=duplicate',
        fieldCode : 'section_code',
        /*error : 'Dep code already exists',*/
        data : {
          section_id : function(controls){ return controls['section_id']['value']}
        }
    }

    this.formGroup = this.fb.group({
      section_id : 0,
      section_code :[null , [Validators.required , Validators.minLength(3), Validators.maxLength(50), PrimaryValidators.noSpecialCharactor], [primaryValidator.remote(remoteValidationConfig)]],
      section_name :[null , [Validators.required, Validators.maxLength(50), PrimaryValidators.noSpecialCharactor]],
    })

    this.formValidator = new AppFormValidator(this.formGroup , {});//form validation class

     if(this.permissionService.hasDefined('SECTION_VIEW')){
       this.createTable() //load data list
     }

     //change header nevigation pagePath
     this.layoutChangerService.changeHeaderPath([
       'Catalogue',
       'Application Basic Setup',
       'Section'
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
     this.datatable = $('#section_tbl').DataTable({
       responsve:false,
       autoWidth: true,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[0,'desc']],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "org/sections?type=datatable"
        },
        columns: [
            {
              data: "section_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('SECTION_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                }
                if(this.permissionService.hasDefined('SECTION_DELETE')){
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
          { data: "section_code" },
          { data: "section_name" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#section_tbl').on('click','i',e => {
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
  saveSection(){
    //this.appValidation.validate();
    this.processing = true
    let saveOrUpdate$ = null;
    let sectionId = this.formGroup.get('section_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/sections', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/sections/' + sectionId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.processing = false
        if(res.data.status=='0'){
          AppAlert.showError({text : res.data.message })
          this.formGroup.reset();
          this.reloadTable()
          this.sectionModel.hide()
        }
        else if(res.data.status='1'){
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.sectionModel.hide()
      }
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
    this.http.get(this.apiUrl + 'org/sections/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.sectionModel.show()
        this.modelTitle = "Update Section"
        this.formGroup.setValue({
         'section_id' : data['section_id'],
         'section_code' : data['section_code'],
         'section_name' : data['section_name']
        })
        this.formGroup.get('section_code').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id, status) { //deactivate payment term
    if(status == 0)
      return

    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected section?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/sections/' + id)
        .pipe(map( data => data['data'] ))
        .subscribe(
            (data) => {
              if(data.status==0){
                AppAlert.showError({text:data.message});
                this.reloadTable()
              }
              if(data.status==1){
                //AppAlert.showError({text:data.message});
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
    this.formGroup.get('section_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Section"
    this.saveStatus = "SAVE"
  }

}
