import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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
  selector: 'app-uom',
  templateUrl: './uom.component.html',
  styleUrls: []
})
export class UomComponent implements OnInit {

  @ViewChild(ModalDirective) uomModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = "New UOM"
  readonly apiUrl = AppConfig.apiUrl()
  formValidator : AppFormValidator = null
  datatable:any = null
  saveStatus = 'SAVE'

  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  constructor(private fb:FormBuilder , private http:HttpClient, private router:Router, private permissionService : PermissionsService,
    private auth : AuthService,  private layoutChangerService : LayoutChangerService, private titleService: Title) { }

    ngOnInit() {
      this.titleService.setTitle("Unit Of Measure")//set page title

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
      let remoteValidationConfig = { //configuration for location code remote validation
        url:this.apiUrl + 'org/uom/validate?for=duplicate',
        fieldCode : 'uom_code',
        /*error : 'Dep code already exists',*/
        data : {
          uom_id : function(controls){ return controls['uom_id']['value']}
        }
      }

      this.formGroup = this.fb.group({
        uom_id : 0,
        uom_code :  [null , [Validators.required, Validators.maxLength(10), PrimaryValidators.noSpecialCharactor] , [primaryValidator.remote(remoteValidationConfig)]],
        uom_description :  [null , [Validators.required, Validators.maxLength(100), PrimaryValidators.noSpecialCharactor] ],
      })

      this.formValidator = new AppFormValidator(this.formGroup , {});//create new validation object

      if(this.permissionService.hasDefined('UOM_VIEW')){
        this.createTable() //load data list
      }

      //change header nevigation pagePath
      this.layoutChangerService.changeHeaderPath([
        'Catalogue',
        'Application Basic Setup',
        'Unit Of Measure'
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
      this.datatable = $('#uom_tbl').DataTable({
        autoWidth: true,
        scrollY: "500px",
        scrollCollapse: true,
        processing: true,
        serverSide: true,
        order : [[ 0, 'desc' ]],
        ajax: {
          headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
          dataType : 'JSON',
          "url": this.apiUrl + "org/uom?type=datatable"
        },
        columns: [
          {
            data: "uom_id",
            orderable: false,
            width: '3%',
            render : (data,arg,full) => {
              var str = '';
              if(this.permissionService.hasDefined('UOM_EDIT')){
                str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
              if(this.permissionService.hasDefined('UOM_DELETE')){
                str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'"></i>';
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
          { data: "uom_code" },
          { data: "uom_description" }
        ],
      });

      //listen to the click event of edit and delete buttons
      $('#uom_tbl').on('click','i',e => {
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
    saveUOM(){
      if(!this.formValidator.validate())//if validation faild return from the function
      return;
      this.processing = true
      AppAlert.showMessage('Processing...','Please wait while saving details')
      let saveOrUpdate$ = null;
      let uomId = this.formGroup.get('uom_id').value
      if(this.saveStatus == 'SAVE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'org/uom', this.formGroup.getRawValue())
      }
      else if(this.saveStatus == 'UPDATE'){
        saveOrUpdate$ = this.http.put(this.apiUrl + 'org/uom/' + uomId , this.formGroup.getRawValue())
      }

      saveOrUpdate$.subscribe(
        (res) => {
          //AppAlert.showSuccess({text : res.data.message })
          this.processing = false
          this.formGroup.reset();
          this.reloadTable()
          this.uomModel.hide()
          setTimeout(() => {
            AppAlert.closeAlert();
            if(res.data.status == 'error'){
              AppAlert.showError({text : res.data.message })
            }
            else{
              AppAlert.showSuccess({text : res.data.message })
            }
          } , 500)
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
      this.http.get(this.apiUrl + 'org/uom/' + id )
      .pipe( map(res => res['data']) )
      .subscribe(data => {
        if(data['status'] == '1')
        {
          this.uomModel.show()
          this.modelTitle = "Update UOM"
          this.formGroup.setValue({
            'uom_id' : data['uom_id'],
            'uom_code' : data['uom_code'],
            'uom_description' : data['uom_description']
          })
          this.formGroup.get('uom_code').disable()
          this.saveStatus = 'UPDATE'
        }
      })
    }


    delete(id, status) { //deactivate payment term

      if(status == 0)
      return

      AppAlert.showConfirm({
        'text' : 'Do you want to deactivate selected UOM ?'
      },
      (result) => {
        if (result.value) {
          this.http.delete(this.apiUrl + 'org/uom/' + id)
          .subscribe(
            (data) => {
              if(data != null && data['data']['status'] == 'error'){
                AppAlert.showError({text : data['data']['message']  })
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
      this.formGroup.get('uom_code').enable()
      this.formGroup.reset();
      this.modelTitle = "New UOM"
      this.saveStatus = 'SAVE'
    }


  }
