import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
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

import { Router } from '@angular/router';
declare var $:any;




@Component({
  selector: 'app-subcategory',
  templateUrl: './subcategory.component.html',
  styleUrls: []
})
export class SubcategoryComponent implements OnInit {

    @ViewChild(ModalDirective) model_sub_category: ModalDirective;

    formGroup:FormGroup
    formValidator : AppFormValidator = null
    modelTitle : string = "New Sub Category"
    readonly apiUrl = AppConfig.apiUrl()
    serverUrl = AppConfig.apiServerUrl()
    appValidator : AppValidator
    datatable:any = null
    saveStatus = 'SAVE'
    processing : boolean = false
    loading : boolean = false
    loadingCount : number = 0
    initialized : boolean = false


    mainCategory$ : Observable<any[]>

    //to manage form error messages
    formFields = {

      subcategory_id: 0,
      category_code:'',
      subcategory_code: '',
      subcategory_name: '',
      is_display:'',
      is_inspectiion_allowed:'',
      validation_error:''
    }

  constructor(private fb:FormBuilder , private http:HttpClient,private router:Router, private auth : AuthService, private permissionService : PermissionsService, private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.titleService.setTitle("Sub Category")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    this.layoutChangerService.changeHeaderPath([
     'Product Development',
     'Master Data',
     'Sub Category'
   ])

   //listten to the menu collapse and hide button
   this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
     if(data == false){return;}
     if(this.datatable != null){
       this.datatable.draw(false);
     }
   })

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class


    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'finance/subcategory/validate',
      formFields : this.formFields,
      fieldCode :'subcategory_code',
      //error : 'Dep code already exists',
      data : {
        subcategory_id : function(controls){ return controls['subcategory_id']['value']}
      }

    }

    this.formGroup = this.fb.group({
      subcategory_id: '0',
      category_code : [null, [Validators.required]],
      subcategory_code :  [null , [Validators.required,Validators.minLength(3)],[primaryValidator.remote(remoteValidationConfig)]],
      subcategory_name: [null , [Validators.required,PrimaryValidators.noSpecialCharactor] ],
      is_display:[null],
      is_inspectiion_allowed:[null]
    });




    this.formValidator = new AppFormValidator(this.formGroup , {});


    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(
      data => { this.appValidator.validate();
    });

    this.loadMainCategoryList();

   if(this.permissionService.hasDefined('SUB_CATEGORY_VIEW')){
    this.createTable();
  }


  }

    LoadPopUp(){
      this.formGroup.get('category_code').enable();
      this.formGroup.get('subcategory_code').enable();
      this.formGroup.reset();
      this.model_sub_category.show();
      this.modelTitle = "New Sub Category";
      //$('#model_sub_category').modal('show');
      //$("#sub_category_form :input").val('');
      //$(':checkbox').prop('checked', false);
      //$("#sub_category_code").prop('disabled', false);

      $('#btn_save').html('<b><i class="icon-floppy-disk"></i></b> Save');
    }

    ngOnDestroy(){
        this.datatable = null
    }






   createTable() { //initialize datatable
     var data = [];
     this.datatable = $('#tbl_sub_category').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.serverUrl + "finance/item/subcategorylist",
        },
        order : [[ 0, 'desc' ]],
        columns: [
            {
              data: "subcategory_id",
              //orderable: false,
              width: '10%',
              render : (data,arg,full) => {
                var str = '';
                // if(this.permissionService.hasDefined('SUB_CATEGORY_EDIT')){
                // var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';              }
                // if(this.permissionService.hasDefined('SUB_CATEGORY_DELETE')){
                // <i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
                // }
                if(this.permissionService.hasDefined('SUB_CATEGORY_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                }
                if(this.permissionService.hasDefined('SUB_CATEGORY_DELETE')){
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
           { data: "status",
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
           { data: "subcategory_name" },
           { data: "subcategory_code" },
           { data: "category_name" },
           {
              data: "is_inspectiion_allowed",
              render : function(data){
                if(data == 1){
                    return '<span class="label label-success">Yes</span>';
                }
                else{
                  return '<span class="label label-default">No</span>';
                }
              }
            },
            {
              data: "is_display",
              render : function(data){
                if(data == 1){
                    return '<span class="label label-success">Yes</span>';
                }
                else{
                  return '<span class="label label-default">No</span>';
                }
              }
            }
            /*
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
           }*/
       ],
       columnDefs: [{
            orderable: false,
            width: '100px',
            targets: [ 0 ]
        }],
        /*data: dataSet,
	dom: '<"datatable-header"fl><"datatable-scroll"t><"datatable-footer"pi>'*/
     });

     //listen to the click event of edit and delete buttons
     $('#tbl_sub_category').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value']);
        }
     });
  }

  edit(id) { //get payment term data and open the model
    this.http.get(this.serverUrl + 'finance/item/get',{ params : {'subcategory_id' : id }})
    .subscribe(data => {
      console.log(data[0])
      this.model_sub_category.show()
      this.modelTitle = "Update Sub Category"
      this.formGroup.setValue({
       'subcategory_id' : data[0]['subcategory_id'],
       'subcategory_code' : data[0]['subcategory_code'],
       'category_code' : data[0]['category_id'],
       'subcategory_name' : data[0]['subcategory_name'],
       'is_display' : data[0]['is_display'],
       'is_inspectiion_allowed' : data[0]['is_inspectiion_allowed']
      })
      this.formGroup.get('subcategory_code').disable()
    })
  }

  delete(id){
    AppAlert.showConfirm({
      'text':'Do you want to deactivate selected Sub Category? '
    },
    (result) => {
      if(result.value){
        let data = {'subcategory_id':id, 'status' : '0'}
        this.http.get(this.serverUrl + 'finance/item/sub-category-change-status',{params : data})
        .subscribe(data => {
          if(data['status'] == 'success'){
            this.reloadTable();
          }
          else{
            AppAlert.showError({ text : data['message'] })
          }
        })
      }
    })
  }

  loadMainCategoryList(){
      this.mainCategory$ = this.http.get<any[]>(this.serverUrl + "finance/item/maincategorylist").pipe(map(res => res));
  }

  saveSubCategory(){
      this.appValidator.validate();
      this.processing = true
      AppAlert.showMessage('Processing...','Please wait while saving details')
    this.http.post(this.serverUrl + "finance/item/sub-category-save", this.formGroup.getRawValue())
    .subscribe(data => {
      this.processing=false;
        if(data['status'] == 'success'){
          AppAlert.showSuccess({text: data['message']});
          this.formGroup.reset();
          this.reloadTable();
          this.model_sub_category.hide();
          //$("#model_sub_category").hide();

        }
        if(data['status'] == 'error'){
          AppAlert.showError({text: data['message']});
          this.formGroup.reset();
          this.reloadTable();
          this.model_sub_category.hide();
        }
    });

  }

  reloadTable() {//reload datatable
    this.datatable.ajax.reload(null, false);
}

  formValidate(){
    this.appValidator.validate();
  }

}
