import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
//third part Components
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
  selector: 'app-product-specification',
  templateUrl: './product-specification.component.html',
  styleUrls: ['./product-specification.component.css']
})
export class ProductSpecificationComponent implements OnInit {

  @ViewChild(ModalDirective) productSpecModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Product Type"
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  saveStatus = 'SAVE'
  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false



  formFields = {
      prod_cat_description : '',
      validation_error:'',
      category_code:''
  }

  constructor(private fb:FormBuilder,private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private titleService: Title,private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.titleService.setTitle("Product Type")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    let remoteValidationConfig={
      url:this.apiUrl + 'org/product-specification/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'prod_cat_description',
      data : {
        prod_cat_id : function(controls){ return controls['prod_cat_id']['value']}
      }
    }

    let remoteValidationConfigCode={
      url:this.apiUrl + 'org/product-specification/validate?for=duplicate-code',
      formFields : this.formFields,
      fieldCode : 'category_code',
      data : {
        prod_cat_id : function(controls){ return controls['prod_cat_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      prod_cat_id : 0,
      category_code : [null , [Validators.required , PrimaryValidators.noSpecialCharactor], [primaryValidator.remote(remoteValidationConfigCode)]],
      prod_cat_description : [null , [Validators.required , PrimaryValidators.noSpecialCharactor], [primaryValidator.remote(remoteValidationConfig)]],
    })

    this.formValidator = new AppFormValidator(this.formGroup , {});
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    if(this.permissionService.hasDefined('PROD_SPEC_VIEW')){
      this.createTable()
    }
    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Master Data',
      'Product Type'
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
     this.datatable = $('#prod-specification-table').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[0,'desc']],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "org/product-specifications?type=datatable"
        },
        columns: [
            {
              data: "prod_cat_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('PROD_SPEC_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
                if(this.permissionService.hasDefined('PROD_SPEC_DELETE')){ //check delete permission
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
          { data: "category_code" },
          { data: "prod_cat_description" }

       ],
     });

     //listen to the click event of edit and delete buttons
     $('#prod-specification-table').on('click','i',e => {
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
      let transId = this.formGroup.get('prod_cat_id').value
      if(this.saveStatus == 'SAVE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'org/product-specifications', this.formGroup.getRawValue())
      }
      else if(this.saveStatus == 'UPDATE'){
        saveOrUpdate$ = this.http.put(this.apiUrl + 'org/product-specifications/' + transId , this.formGroup.getRawValue())
      }

      saveOrUpdate$.subscribe(
        (res) => {
          this.processing=false;
          if(res.data.status==0){
            AppAlert.showError({text:res.data.message})
            this.formGroup.reset();
            this.reloadTable()
            this.productSpecModel.hide()
          }
          else if(res.data.status=1){
          this.formGroup.reset();
          this.reloadTable()
          this.productSpecModel.hide()
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({text : res.data.message })
          } , 500)
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
      this.http.get(this.apiUrl + 'org/product-specifications/' + id)
      .pipe(map( data => data['data'] ))
      .subscribe(data => {
          if(data['status'] == '1') {
            this.productSpecModel.show()
            this.modelTitle = "Update Product Type"
            this.formGroup.setValue({
             'prod_cat_id' : data['prod_cat_id'],
             'category_code' : data['category_code'],
             'prod_cat_description' : data['prod_cat_description']
            })
            this.formGroup.get('category_code').disable()
            this.saveStatus = 'UPDATE'
          }
        })

    }
    delete(id,status) { //deactivate payment term
      if(status==0){
        return
      }
      AppAlert.showConfirm({
        'text' : 'Do you want to deactivate selected Product Type?'
      },
      (result) => {
        if (result.value) {
          this.http.delete(this.apiUrl + 'org/product-specifications/' + id)
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
      this.formGroup.get('prod_cat_id').enable()
      this.formGroup.get('category_code').enable()
      this.formGroup.get('prod_cat_description').enable()
      this.formGroup.reset();
      this.modelTitle = "New Product Type"
      this.saveStatus = 'SAVE'
    }

    formValidate(){ //validate the form on input blur event
      this.appValidator.validate();
    }


}
