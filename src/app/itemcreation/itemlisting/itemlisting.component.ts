import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat} from 'rxjs';
import { map } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
//import { AuthService } from '../../core/service/auth.service';
import { ItemService } from '../item.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-itemlisting',
  templateUrl: './itemlisting.component.html',
  styleUrls: []
})
export class ItemlistingComponent implements OnInit {

  @ViewChild('uomModel') uomModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = "Add UOM"
  readonly apiUrl = AppConfig.apiUrl()
  formValidator : AppFormValidator = null
  datatable:any = null
  processing : boolean = false
  UOMList$ : Observable<any[]>
  selectedUOMList = []
  disabled = true

  //to manage form error messages
  /*formFields = {
    season_code : '',
    season_name : ''
  }*/

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private itemService : ItemService,private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {

    this.itemService.materialList.subscribe(res => {
      if(res != null){
        this.reloadTable()
      }
    })

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })
    /*let remoteValidationConfig = { //configuration for location code remote validation
      //url:this.apiUrl + 'org/seasons/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'season_code',
      error : 'Dep code already exists',
      data : {
         master_id : function(controls){ return controls['master_id']['value']}
      }
    }*/

  //  let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      item_id : 0,
      uom_list : [null , [Validators.required]]
    })

    this.formValidator = new AppFormValidator(this.formGroup , {});

    this.loadUOM()
    this.createTable() //load data list
  }

  ngOnDestroy(){
      this.datatable = null
  }


  createTable() { //initialize datatable
     this.datatable = $('#item_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       paging:true,
       searching:true,
       order : [[ 0, 'desc' ]],
       ajax: {
           headers: {
              'Authorization':`Bearer ${this.auth.getToken()}`,
            },
            dataType : 'JSON',
            "url": this.apiUrl + "merchandising/items?type=datatable&search_type=MATERIAL_ITEMS"
        },
        columns: [
            {
              data: "master_id",
              orderable: false,
              width: '11%',
              render : (data,arg,full) => {
                var str = '';
                  //str += '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                if(this.permissionService.hasDefined('ITEM_CREATION_EDIT')){ //check edit permission
                  str += '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                  data-action="EDIT" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
                }

                if(this.permissionService.hasDefined('ITEM_CREATION_DELETE')){ //check delete permission
                  str += ' <i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                  data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
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
          { data: "category_name" },
          { data: "subcategory_name" },
          { data: "master_description" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#item_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value'], att['data-status']['value']);
        }
        else if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value'], att['data-status']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

  drawTable(){
    this.datatable.draw( false );
  }


  edit(id, status){
    this.formGroup.get('item_id').setValue(id)

    this.http.get(this.apiUrl + 'merchandising/items?type=get_item_uoms&item_id=' + id)
    .pipe(map(res => res['data']))
    .subscribe(
      res => {
        this.selectedUOMList = [];
        for(let x = 0 ; x < res.length; x++){
          res[x].disabled = true
          res[x].status = 'SAVED'
        }
        console.log(res)
        this.selectedUOMList = res
        this.uomModel.show()
      },
      error => {

      }
    )

  }


  delete(id, status) { //deactivate payment term

    if(status == 0)
      return

    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Material?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'merchandising/items/' + id)
        .pipe(map( data => data['data'] ))
        .subscribe(
            (data) => {
              if(data['status'] == 'error'){
                  AppAlert.showError({text: data['message']})
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


  saveUoms(){
    this.processing = true
    let formData = this.formGroup.getRawValue();

    this.http.post(this.apiUrl + 'merchandising/items/save_item_uoms',this.formGroup.getRawValue())
    .pipe( map(res => res['data']) )
    .subscribe(
      data => {
        this.processing = false
        AppAlert.showSuccess({text : data.message})
      },
      error => {
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


  loadUOM(){
    this.UOMList$ = this.http.get<any[]>(this.apiUrl + "org/uom?active=1&fields=uom_id").pipe(map(res=>res['data']));
  }

  showEvent(event){ //show event of the bs model

  }

/*  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }*/

}
