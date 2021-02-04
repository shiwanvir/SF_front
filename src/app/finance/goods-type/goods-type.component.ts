import { Component, OnInit , ViewChild, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';


import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { BasicValidators } from '../../core/validation/basic-validators';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-goods-type',
  templateUrl: './goods-type.component.html',
  styleUrls: []
})
export class GoodsTypeComponent implements OnInit {

  @ViewChild(ModalDirective) goodsTypeModel: ModalDirective;

  formGroup : FormGroup
  formGroupPopup:FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Goods Type"
  apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'

  processing : boolean = false
  //to manage form error messages
  formFields = {
    goods_type_description : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Goods Type")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for goods type description remote validation
      url:this.apiUrl + 'finance/goods-types/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'goods_type_description',
      /*error : 'Goods type description already exists',*/
      data : {
        goods_type_id : function(controls){ return controls['goods_type_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({ // create the form
      goods_type_id : 0,
      goods_type_description : [null , [Validators.required,Validators.minLength(3), Validators.maxLength(100)],[primaryValidator.remote(remoteValidationConfig)]],
    })

      this.formValidator = new AppFormValidator(this.formGroup , {});//new validation object
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,[],this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    if(this.permissionService.hasDefined('GOODS_TYPE_VIEW')){
      this.createTable(); //initialize datatable
    }

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'Finance',
      'Goods Types'
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
     this.datatable = $('#goods_type_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[0,'desc']],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "finance/goods-types?type=datatable"
        },
        columns: [
            {
              data: "goods_type_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = ''
                if(this.permissionService.hasDefined('GOODS_TYPE_EDIT')){
                   str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                }
                if(this.permissionService.hasDefined('GOODS_TYPE_DELETE')){
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
          { data: "goods_type_description" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#goods_type_tbl').on('click','i',e => {
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


  saveGoodsType() { //save and update goods type
    this.processing = true
    let saveOrUpdate$ = null;
    let goodsTypeId = this.formGroup.get('goods_type_id').value

    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'finance/goods-types',this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'finance/goods-types/' + goodsTypeId,this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.processing = false
        if(res.data.status==0){
          AppAlert.showError({text:res.data.message})
          this.formGroup.reset();
          this.reloadTable()
          this.goodsTypeModel.hide()

        }
        else if(res.data.status=1)
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.goodsTypeModel.hide()
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
    this.http.get(this.apiUrl + 'finance/goods-types/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
        if(data['status'] == '1') {
          this.goodsTypeModel.show()
          this.modelTitle = "Update Goods Type"
          this.formGroup.setValue({
           'goods_type_id' : data['goods_type_id'],
           'goods_type_description' : data['goods_type_description']
          })
          this.formGroup.get('goods_type_description')
          this.saveStatus = 'UPDATE'
        }
      })
  }


  delete(id, status) { //deactivate payment term
    if(status == 0)
      return

    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Goods Type?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'finance/goods-types/' + id)
        .pipe(map(data=>data['data']))
        .subscribe(
          (data) => {
                if(data.status==0){
                  AppAlert.showError({text:data.message})
                    this.reloadTable()
                }
                else if(data.status==1)
                this.reloadTable()
            },
            (error) => {
              console.log(error)
            }
        )
      }
    })
  }

  showEvent(event){ //show event of the bs model
    this.formGroup.get('goods_type_description').enable()
    this.formGroup.reset();
    this.modelTitle = "New Goods Type"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }


}
