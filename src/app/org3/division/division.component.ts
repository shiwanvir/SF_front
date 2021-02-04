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
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-division',
  templateUrl: './division.component.html',
  styleUrls: []
})
export class DivisionComponent implements OnInit {

  @ViewChild(ModalDirective) divisionModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New  Customer Division"
  readonly apiUrl = AppConfig.apiUrl()
  datatable:any = null
  saveStatus = 'SAVE'

  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
  private auth : AuthService, private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.titleService.setTitle("Customer Division")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/divisions/validate?for=duplicate',
      fieldCode : 'division_code',
      /*error : 'Dep code already exists',*/
      data : {
        division_id : function(controls){ return controls['division_id']['value']}
      }
    }

    this.formGroup = this.fb.group({
      division_id : 0,
      division_code : [null , [Validators.required,Validators.minLength(2)],[primaryValidator.remote(remoteValidationConfig)]],
      division_description : [null , [Validators.required,PrimaryValidators.noSpecialCharactor]],
    })
    this.formValidator = new AppFormValidator(this.formGroup , {});

    if(this.permissionService.hasDefined('CUSTOMER_DIVISION_VIEW')){
      this.createTable() //load data list
    }
    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'Merchandising',
      'Customer Division'
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
     this.datatable = $('#division_tbl').DataTable({
       autoWidth: true,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[0,'desc']],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "org/divisions?type=datatable"
        },
        columns: [
            {
              data: "division_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('CUSTOMER_DIVISION_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                }
                if(this.permissionService.hasDefined('CUSTOMER_DIVISION_DELETE')){//check delete permission
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
          { data: "division_code" },
          { data: "division_description" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#division_tbl').on('click','i',e => {
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
  saveDivision(){
    AppAlert.showMessage('Processing...','Please wait while saving details')
    this.processing = true
    let saveOrUpdate$ = null;
    let divisionId = this.formGroup.get('division_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/divisions', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/divisions/' + divisionId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.processing = false
        if(res.data.status==0){
        AppAlert.showError({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.divisionModel.hide()
      }
      else if(res.data.status==1){
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.divisionModel.hide()
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
    this.http.get(this.apiUrl + 'org/divisions/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.divisionModel.show()
        this.modelTitle = "Update Customer Division"
        this.formGroup.setValue({
         'division_id' : data['division_id'],
         'division_code' : data['division_code'],
         'division_description' : data['division_description']
        })
        this.formGroup.get('division_code').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id,status) { //deactivate payment term
    if(status == 0)
      return
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Customer Division?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/divisions/' + id)
        .pipe(map( data => data['data'] ))
        .subscribe(
            (data) => {
                if(data.status==0){
                  AppAlert.showError({text:data.message})
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
    this.formGroup.get('division_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Customer Division"
    this.saveStatus = 'SAVE'
  }

}
