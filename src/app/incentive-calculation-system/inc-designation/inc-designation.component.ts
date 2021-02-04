import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { Observable , Subject } from 'rxjs';
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
  selector: 'app-inc-designation',
  templateUrl: './inc-designation.component.html',
  styleUrls: ['./inc-designation.component.css']
})
export class IncDesignationComponent implements OnInit {

  @ViewChild(ModalDirective) designationModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Designation"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  designations$: Observable<any[]>;//use to load customer list in ng-select
  designationLoading = false;
  designationInput$ = new Subject<string>();
  selectedDesignation: any[]

  prod_component$: Observable<Array<any>>

  //to manage form error messages
  formFields = {
    emp_designation : '',
    inc_equation_id : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient,  private permissionService : PermissionsService,
    private auth : AuthService, private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.titleService.setTitle("Designation")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'pic-system/designation/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'emp_designation',
      /*error : 'Dep code already exists',*/
      // data : {
      //   inc_designation_equation_id : function(controls){ return controls['inc_designation_equation_id']['value']}
      // }

      data : {
        inc_designation_equation_id : function(controls){ return controls['inc_designation_equation_id']['value']},
        emp_designation_2 : function(controls){
          if (controls['emp_designation']['value']!=null)
          {
            return controls['emp_designation']['value']['des_name']
          }
        else
        return null;
      },
      }
    }



    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      inc_designation_equation_id : 0,
      emp_designation : [null , [Validators.required,Validators.minLength(3)],[primaryValidator.remote(remoteValidationConfig)]],
      inc_equation_id : [null , [Validators.required]],
    })
    this.formValidator = new AppFormValidator(this.formGroup , {});
    //create new validation object
    // this.appValidator = new AppValidator(this.formFields,{},this.formGroup);
    //
    // this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
    //   this.appValidator.validate();
    // })

    if(this.permissionService.hasDefined('INC_DESIGNATION_VIEW')){
      this.createTable() //load data list
      this.loadDesignations1()
    }

    this.prod_component$ = this.getComponent();


    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Production Incentive Calculation System',
      'Master Data',
      'Designation'
    ])

    //listten to the menu collapse and hide button
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

  }

  loadDesignations1(){
    this.designations$=this.designationInput$
    .pipe(
       debounceTime(200),
       distinctUntilChanged(),
       tap(() => this.designationLoading = true),
       switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/designations?type=auto' , {params:{search:term}})
       .pipe(
           //catchError(() => of([])), // empty list on error
           tap(() => this.designationLoading = false)
       ))
    );

  }

  getComponent(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'pic-system/equation?type=pc-list&active=1&fields=inc_equation_id,equation')
      .pipe(map(res => res['data']))
  }

  ngOnDestroy(){
      this.datatable = null
  }

  createTable() { //initialize datatable
     this.datatable = $('#designation_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[4,'desc']],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "pic-system/designation?type=datatable"
        },
        columns: [
            {
              data: "inc_designation_equation_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('INC_DESIGNATION_EDIT')){
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
                if(this.permissionService.hasDefined('INC_DESIGNATION_DELETE')){ //check delete permission
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"data-status="'+full['status']+'" ></i>';
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

          { data: "emp_designation" },
          { data: "inc_equation_id" },
          { data: "created_date" }

       ],
       columnDefs: [
          {
              targets: [ 4 ],visible: false,searchable: false
          }
      ]
     });

     //listen to the click event of edit and delete buttons
     $('#designation_tbl').on('click','i',e => {
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
  saveSilhouette(){
    //this.appValidation.validate();
    let saveOrUpdate$ = null;
    this.processing = true
    let formData = this.formGroup.getRawValue();
    console.log(formData)
    formData['desig_id']=formData['emp_designation']['des_id']
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let thisId = this.formGroup.get('inc_designation_equation_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'pic-system/designation', formData)
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'pic-system/designation/' + thisId , formData)
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.processing=false;
        if(res.data.status=='0'){
          AppAlert.showError({text:res.data.message})
          this.formGroup.reset();
          this.reloadTable()
          this.designationModel.hide()
        }
        else if(res.data.status=='1'){
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.designationModel.hide()
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
    this.http.get(this.apiUrl + 'pic-system/designation/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.designationModel.show()
        this.modelTitle = "Update Designation"
        this.formGroup.setValue({
         'inc_designation_equation_id' : data['inc_designation_equation_id'],
         'emp_designation' : data['emp_designation'],
         'inc_equation_id' : { inc_equation_id : data['inc_equation_id'], equation : data['equation']},
        })
        this.formGroup.get('emp_designation').disable()
        this.saveStatus = 'UPDATE'
      }
    })

  }

  delete(id,status) { //deactivate payment term
    if(status==0){
      return
    }
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Designation ?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'pic-system/designation/' + id)
        .pipe(map(data=>data['data']))
        .subscribe(
            (data) => {
              if(data.status=='0'){
                AppAlert.showError({text:data.message})
                this.reloadTable()
              }
              else if(data.status='1'){
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
    this.formGroup.get('inc_equation_id').enable()
    this.formGroup.get('emp_designation').enable()
    this.formGroup.reset();
    this.modelTitle = "New Designation"
    this.saveStatus = 'SAVE'
  }

  // formValidate(){ //validate the form on input blur event
  //   this.appValidator.validate();
  // }


}
