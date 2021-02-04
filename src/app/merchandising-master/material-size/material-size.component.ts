import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { AppValidator } from '../../core/validation/app-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

//models
import { MainCategory } from '../../merchandising/models/MainCategory.model';
import { SubCategory } from '../../merchandising/models/SubCategory.model';
import { PermissionsService } from '../../core/service/permissions.service';


@Component({
  selector: 'app-material-size',
  templateUrl: './material-size.component.html',
  styleUrls: ['./material-size.component.css']
})
export class MaterialSizeComponent implements OnInit {

  @ViewChild(ModalDirective) matSizeModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = "New Material Size"
  readonly apiUrl = AppConfig.apiUrl()
  serverURL = AppConfig.apiServerUrl()
  formValidator : AppFormValidator = null
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false

  // processing : boolean = false
  // loading : boolean = false
  // loadingCount : number = 0
  // initialized : boolean = false

  mainCat$: Observable<MainCategory[]>;//use to load main category list in ng-select
  mainCatLoading = false;
  mainCatInput$ = new Subject<string>();
  selectedMainCat: MainCategory[];

  subCat$: Observable<SubCategory[]>;//use to load main category list in ng-select
  subCatLoading = false;
  subCatInput$ = new Subject<string>();
  selectedSubCat: SubCategory[];

  //to manage form error messages
  formFields = {
    category_id : '',
    subcategory_id : '',
    size_name : '',
    validation_error:''
  }

  constructor(private fb:FormBuilder , private permissionService : PermissionsService, private http:HttpClient, private titleService: Title,private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.titleService.setTitle("Material Size")//set page title

     let primaryValidator = new PrimaryValidators(this.http)
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'merchandising/matsize/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'size_name',
      /*error : 'Dep code already exists',*/
      data : {
        size_id : function(controls){ return controls['size_id']['value']},
        size_name : function(controls){ return controls['size_name']['value']},
        // category_id : function(controls){
        //   if(controls['category_id']['value'] != null)
        //   {
        //     return controls['category_id']['value']['category_id']
        //   }else{
        //     return null;
        //   }
        // },
        // subcategory_id : function(controls){
        //   if(controls['subcategory_id']['value'] != null)
        //   {
        //     return controls['subcategory_id']['value']['subcategory_id']
        //   }else{
        //     return null;
        //   }
        // }
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      size_id : 0,
      // category_id :  [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
      // subcategory_id :  [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
      size_name :  [null , [Validators.required, PrimaryValidators.noSpecialCharactor_material],[primaryValidator.remote(remoteValidationConfig)] ]
    })

    this.formValidator = new AppFormValidator(this.formGroup , {});//create new validation object
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.createTable() //load data list
    this.loadCategory()//Load Main Category List
    this.loadSubCategory()//Load Sub Category list

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Master Data',
      'Material Size'
    ])

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
     this.datatable = $('#mat_size_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order : [[ 0, 'desc' ]],
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "merchandising/matsize?type=datatable"
        },
        columns: [
            {
              data: "size_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full)=>{
                var str = '';
              if(this.permissionService.hasDefined('MATERIAL_SIZE_EDIT')){
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
              if(this.permissionService.hasDefined('MATERIAL_SIZE_DELETE')){
                    str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
              }
                if( full.status== 0 ) {
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px;cursor:not-allowed" data-action="DISABLE"></i>';
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;cursor:not-allowed" data-action="DISABLE"></i>';
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
          //{ data: "category_name" },
        //  { data: "subcategory_name" },
          { data: "size_name" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#mat_size_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }


  //save and update source details
  saveMatSize(){
    //this.appValidation.validate();
    this.processing = true
    let saveOrUpdate$ = null;
    let matSizeId = this.formGroup.get('size_id').value
    let formData = this.formGroup.getRawValue();
     // debugger
    //formData['category_id'] = formData['category_id']['category_id']
    //formData['subcategory_id'] = formData['subcategory_id']['subcategory_id']

    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/matsize', formData)
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/matsize/' + matSizeId , formData)
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.processing = false
        console.log(res)
        if(res.data.status == 'success'){
          AppAlert.showSuccess({text : res.data.message })
          this.formGroup.reset();
          this.reloadTable()
          this.matSizeModel.hide()
        }
        else{
          AppAlert.showError({text : res.data.message })
          this.reloadTable()
          this.matSizeModel.hide()
        }
     },
     (error) => {
       this.processing = false
       if(error.status == 422){ //validation error
         AppAlert.showError({title : 'Validation Error' , text : error.error.errors.validationErrorsText })
       }else{
         AppAlert.showError({text : 'Procee Error' })
       }
     }
   );
  }




      loadCategory(){
        this.mainCat$ =  this.http.get<any[]>(this.apiUrl + 'merchandising/get_material_items_list')
          .pipe(map(res => res['data']))
      }
      onCategoryChange(e){
        this.formGroup.get('category_id').disable()
        this.loadSubCategory()
      }

      loadSubCategory() {

        let _category = this.formGroup.get('category_id').value
        console.log(_category)
        _category = (_category == null || _category == '') ? '' : _category.category_id

        this.subCat$ =  this.http.get<any[]>(this.apiUrl + 'merchandising/item-sub-categories?type=sub_category_by_category&category_id='+_category)
          .pipe(map(res => res['data']))
      }




  edit(id) {

    this.http.get(this.apiUrl + 'merchandising/matsize/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.matSizeModel.show()
        this.modelTitle = "Update Material Size"
        this.formGroup.setValue({
         'size_id' : data['size_id'],
         // 'category_id' : data['category'],
         // 'subcategory_id' : data['sub_category'],
         'size_name' : data['size_name']
        })
        // this.formGroup.get('category_id').disable()
        // this.formGroup.get('subcategory_id').disable()
        // this.formGroup.get('uom_code').disable()
        this.saveStatus = 'UPDATE'
      }

    })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Material Size?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'merchandising/matsize/' + id)
        .subscribe(
            (data) => {
                if(data != null && data['data']['status'] == 'error'){
                  AppAlert.showError({text : data['data']['message']})
                  this.reloadTable()
                }
                else{
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
    // this.formGroup.get('uom_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Material Size"
    this.saveStatus = 'SAVE'
    this.formGroup.get('category_id').enable()
      this.formGroup.get('subcategory_id').enable()
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }



}
