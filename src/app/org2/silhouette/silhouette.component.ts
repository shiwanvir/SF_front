
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
  selector: 'app-silhouette',
  templateUrl: './silhouette.component.html',
  styleUrls: []
})
export class SilhouetteComponent implements OnInit {

  @ViewChild(ModalDirective) divisionModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Product Silhouette"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  prod_component$: Observable<Array<any>>

  //to manage form error messages
  formFields = {
    product_silhouette_description : '',
    silhouette_code : '',
    product_component : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient,  private permissionService : PermissionsService,
    private auth : AuthService, private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.titleService.setTitle("Product Silhouette")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/silhouettes/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'product_silhouette_description',
      /*error : 'Dep code already exists',*/
      data : {
        product_silhouette_id : function(controls){ return controls['product_silhouette_id']['value']}
      }
    }

    let remoteValidationConfigCode = { //configuration for location code remote validation
      url:this.apiUrl + 'org/silhouettes/validate?for=duplicate-code',
      formFields : this.formFields,
      fieldCode : 'silhouette_code',
      /*error : 'Dep code already exists',*/
      data : {
        product_silhouette_id : function(controls){ return controls['product_silhouette_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      product_silhouette_id : 0,
      product_silhouette_description : [null , [Validators.required,Validators.minLength(3)],[primaryValidator.remote(remoteValidationConfig)]],
      silhouette_code : [null , [Validators.required, PrimaryValidators.noSpecialCharactor],[primaryValidator.remote(remoteValidationConfigCode)]],
      product_component : [null , [Validators.required]],
    })
    this.formValidator = new AppFormValidator(this.formGroup , {});
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    if(this.permissionService.hasDefined('PROD_SILHOUETTE_VIEW')){
      this.createTable() //load data list
    }

    this.prod_component$ = this.getComponent();

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Master Data',
      'Product Silhouette'
    ])

    //listten to the menu collapse and hide button
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

  }

  getComponent(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'org/silhouettes?type=pc-list&active=1&fields=product_component_id,product_component_description')
      .pipe(map(res => res['data']))
  }

  ngOnDestroy(){
      this.datatable = null
  }

  createTable() { //initialize datatable
     this.datatable = $('#silhouette_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[0,'desc']],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "org/silhouettes?type=datatable"
        },
        columns: [
            {
              data: "product_silhouette_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('PROD_SILHOUETTE_EDIT')){
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
                if(this.permissionService.hasDefined('PROD_SILHOUETTE_DELETE')){ //check delete permission
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
          { orderable: true,data: "silhouette_code" },
          { data: "product_silhouette_description" },
          { data: "product_component_description" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#silhouette_tbl').on('click','i',e => {
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
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let silhouetteId = this.formGroup.get('product_silhouette_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/silhouettes', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/silhouettes/' + silhouetteId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.processing=false;
        if(res.data.status=='0'){
          AppAlert.showError({text:res.data.message})
          this.formGroup.reset();
          this.reloadTable()
          this.divisionModel.hide()
        }
        else if(res.data.status=='1'){
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.divisionModel.hide()
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
    this.http.get(this.apiUrl + 'org/silhouettes/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.divisionModel.show()
        this.modelTitle = "Update Product Silhouette"
        this.formGroup.setValue({
         'product_silhouette_id' : data['product_silhouette_id'],
         'silhouette_code' : data['silhouette_code'],
         'product_silhouette_description' : data['product_silhouette_description'],
         'product_component' : { product_component_id : data['product_component'], product_component_description : data['product_component_description']},
        })
        this.formGroup.get('silhouette_code').disable()
        this.saveStatus = 'UPDATE'
      }
    })

  }

  delete(id,status) { //deactivate payment term
    if(status==0){
      return
    }
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Product Silhouette?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/silhouettes/' + id)
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
    this.formGroup.get('product_silhouette_description').enable()
    this.formGroup.get('silhouette_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Product Silhouette"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }



}
