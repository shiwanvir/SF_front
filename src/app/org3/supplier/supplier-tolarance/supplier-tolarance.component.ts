import { Component, OnInit,ViewChild,AfterViewInit,OnDestroy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';



//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppValidator } from '../../../core/validation/app-validator';
import { BasicValidators } from '../../../core/validation/basic-validators';
import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { SupplierService } from '.././supplier.service';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
//models
//import { supplier } from '../../models/supplier.model';

import { PermissionsService } from '../../../core/service/permissions.service';

@Component({
  selector: 'app-supplier-tolarance',
  templateUrl: './supplier-tolarance.component.html',
  styleUrls: ['./supplier-tolarance.component.css']
})
export class SupplierTolaranceComponent implements OnInit {

 @ViewChild(ModalDirective) tabaleMoldel: ModalDirective;


  formGroup : FormGroup
  modelTitle : string = "New Tolarance"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'


  suplier$: Observable<any[]>;//use to load customer list in ng-select
  suplierLoading = false;
  suplierInput$ = new Subject<string>();
  selectedsuplier: any[]

  mainCategory$: Observable<any[]>;//use to load main category list in ng-select
  mainCategoryLoading = false;
  mainCategoryInput$ = new Subject<string>();
  selectedmainCategory: any[]

  subCategory$: Observable<any[]>;//use to load main sub category list in ng-select
  subCategoryLoading = false;
  subCategoryInput$ = new Subject<string>();
  selectedsubCategory: any[]

  uom$: Observable<any[]>;//use to load main sub category list in ng-select
  uomLoading = false;
  uomInput$ = new Subject<string>();
  selecteduom: any[]

  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false



  //to manage form error messages
  formFields = {
    supplier_name : '',
    category_name: '',
    subcategory_name:'',
    uom_code:'',
    qty:'',
    min:'',
    max:'',
    min_qty:'',
    max_qty:'',
    validation_error:''


  }

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,private customerService:SupplierService,private layoutChangerService : LayoutChangerService) { }



  ngOnInit() {
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'stores/supplier-tolarance/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'validation_error',
      /*error : 'Dep code already exists',*/
      data : {
        id : function(controls){ return controls['id']['value'] },
        supplier_id: function(controls){ if(controls['supplier_id']['value']!=null){return (controls['supplier_id']['value'])}
        else
        return null;
      },
          category_id: function(controls){if(controls['category_name']['value']!=null){ return controls['category_name']['value']['category_id']}
      else
      return null;
    },
          subcategory_id : function(controls){ if(controls['subcategory_name']['value']!=null){return controls['subcategory_name']['value']['subcategory_id']}
        else
        return null;
      },
      uom_id : function(controls){ if(controls['uom_code']['value']!=null){return controls['uom_code']['value']['uom_id']}
      else
      return null;
    },

    qty : function(controls){ if(controls['qty']['value']!=null){return controls['qty']['value']}
    else
    return null;
    },
  min : function(controls){ if(controls['min']['value']!=null){return controls['min']['value']}

  else

  return null;
  },
  max : function(controls){ if(controls['max']['value']!=null){return controls['max']['value']}

  else

  return null;
  }
      }
    }

let basicValidator = new BasicValidators(this.http)//create object of basic validation class

this.formGroup = this.fb.group({

  id : 0,
  supplier_id:0,
  supplier_name : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
  category_name : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
  subcategory_name : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
  uom_code : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
  qty : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
  min : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
  max : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
  min_qty : [null , [Validators.required],/*[basicValidator.remote(remoteValidationConfig)]*/],
  max_qty : [null , [Validators.required],/*[basicValidator.remote(remoteValidationConfig)]*/]
})
//create new validation object
this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
  this.appValidator.validate();
})



this.createTable() //load data list
this.loadMaincategory()
this.loadSubcategory()
this.loadUOM()

//if user click view button of the customer table, this will fire
this.customerService.supplierData.subscribe(data => {
  this.formGroup.reset()
  this.viewSupplier(data)
})


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
     this.datatable = $('#tolarance_table').DataTable({
       autoWidth: false,
       scrollY: "500px",
        scrollX: true,
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[0,'desc']],
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "stores/supplier-tolarance?type=datatable"
        },
        columns: [
            {
              data: "id",
              orderable: false,
              width: '3%',
              render : function(data,arg,full){
                var str = '';
                //var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              //if(this.permissionService.hasDefined('SUPPLIER_DELETE')){
                  str = '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
              //  }
              if( full.status== 0 ) {

                str = '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;cursor:not-allowed" data-action="DISABLE"></i>';
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
          { data: "supplier_name" },

          
          { data: "min"},
          { data: "max"},
          { data: "min_qty"},
          { data: "max_qty"}
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#tolarance_table').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value']);
        }
     });
  }




  viewSupplier(data)
  {
      // console.log(data);
      if(data != null)
      {
        this.saveStatus = 'UPDATE'

        delete data['approved_by']
        delete data['created_by']
        delete data['created_date']
        delete data['status']
        delete data['system_updated_by']
        delete data['updated_by']
        delete data['updated_date']
        delete data['country']
        this.formGroup.get("supplier_name").setValue(data['supplier_name']);
        this.formGroup.get("supplier_id").setValue(data['supplier_id']);

    }
  }


  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }


saveTolarance(){
  //this.appValidation.validate();
  //this.appValidation.validate();
  this.processing = true
  AppAlert.showMessage('Processing...','Please wait while saving details')
  this.saveStatus = 'SAVE'
  let saveOrUpdate$ = null;
  let Id = this.formGroup.get('id').value
  let formData = this.formGroup.getRawValue();


  formData['category_id'] = formData['category_name']['category_id']
  formData['subcategory_id'] = formData['subcategory_name']['subcategory_id']
  formData['uom_id'] = formData['uom_code']['uom_id']
  if(this.saveStatus == 'SAVE'){
    saveOrUpdate$ = this.http.post(this.apiUrl + 'stores/supplier-tolarance', formData)
  }
  else if(this.saveStatus == 'UPDATE'){
    saveOrUpdate$ = this.http.put(this.apiUrl + 'stores/supplier-tolarance/' + Id , formData)
  }

  saveOrUpdate$.subscribe(
    (res) => {
      this.processing = false
      AppAlert.showSuccess({text : res.data.message })
      this.formGroup.reset();
      this.reloadTable()
      //this.transactionModel.hide()
   },
   (error) => {
       console.log(error)
   }
 );

}


edit(id) { //get payment term data and open the model
  this.http.get(this.apiUrl + 'stores/supplier-tolarance/' + id )
  .pipe( map(res => res['data']) )
  .subscribe(data => {
    if(data['status'] == '1')
    {
      this.tabaleMoldel.show()
      this.modelTitle = "Update Tolarance"
      this.formGroup.setValue({
       'supplier_name' : data['supplier_name'],
       'category_name' : data['category_name'],
       'subcategory_name' : data['subcategory_name'],
       'uom_code' : data['uom_code'],
       'qty' : data['qty'],
       'min' : data['min'],
       'max' : data['max'],
       'min_qty' : data['min_qty'],
       'max_qty' : data['max-qty'],
      })
      this.formGroup.get('supplier_name').disable()
      this.saveStatus = 'UPDATE'
    }
  })
}



  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Tolerance?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'stores/supplier-tolarance/' + id)
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




showEvent(event){ //show event of the bs
  this.formGroup.get('supplier_name').enable()
  this.formGroup.reset();
  this.modelTitle = "New Tolarance"
  this.saveStatus = 'SAVE'
}


formValidate(){ //validate the form on input blur event
  this.appValidator.validate();
}

//load main category list
loadMaincategory(){
  this.mainCategory$ = this. mainCategoryInput$
  .pipe(
     debounceTime(200),
     distinctUntilChanged(),
     tap(() => this.mainCategoryLoading = true),
     switchMap(term => this.http.get<any[]>(this.apiUrl + 'stores/supplier-tolarance?type=auto_main_cat' , {params:{search:term}})
     .pipe(
         //catchError(() => of([])), // empty list on error
         tap(() => this.mainCategoryLoading = false)
     ))
  );


}


loadSubcategory(){

  this.subCategory$= this.subCategoryInput$
  .pipe(
     debounceTime(200),
     distinctUntilChanged(),
     tap(() => this.subCategoryLoading = true),
     switchMap(term => this.http.get<any[]>(this.apiUrl + 'stores/supplier-tolarance?type=auto_sub_cat' , {params:{search:term}})
     .pipe(
         //catchError(() => of([])), // empty list on error
         tap(() => this.subCategoryLoading = false)
     ))
  );


}


loadUOM(){

  this.uom$= this.uomInput$
  .pipe(
     debounceTime(200),
     distinctUntilChanged(),
     tap(() => this.uomLoading = true),
     switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/uom?type=auto' , {params:{search:term}})
     .pipe(
         //catchError(() => of([])), // empty list on error
         tap(() => this.uomLoading  = false)
     ))
  );


}

}
