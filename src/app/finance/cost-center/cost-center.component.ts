import { Component, OnInit , ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { Title } from '@angular/platform-browser';
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
import { LayoutChangerService } from '../../core/service/layout-changer.service';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-cost-center',
  templateUrl: './cost-center.component.html',
  styleUrls: []
})
export class CostCenterComponent implements OnInit {

  @ViewChild(ModalDirective) costCenterModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Cost Center"
  apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  //to manage form error messages
  formFields = {
    cost_center_code : '',
    cost_center_name : '',
    validation_error:''
  }

  constructor(private fb:FormBuilder,private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService,private titleService: Title,private layoutChangerService : LayoutChangerService) { }
    //
    ngOnInit() {
      //this.titleService.setTitle("Cost Center")
      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
      let remoteValidationConfig = { //configuration for payment term code remote validation
        url:this.apiUrl + 'finance/accounting/cost-centers/validate?for=duplicate',
        formFields : this.formFields,
        fieldCode : 'cost_center_code',
        //error : 'Cost center code already exists',
        data : {
          cost_center_id : function(controls){ return controls['cost_center_id']['value']}
        }
      }

      let basicValidator = new BasicValidators(this.http)//create object of basic validation class

      this.formGroup = this.fb.group({ // create the form
        cost_center_id : 0,
        cost_center_code : [null , [Validators.required,Validators.minLength(3)],[primaryValidator.remote(remoteValidationConfig)]],
        cost_center_name : [null , [Validators.required,PrimaryValidators.noSpecialCharactor] ],
      })

      let customErrorMessages  = { //custom error messages
        cost_center_code : { required : 'Cost center code cannot be empty'},
        cost_center_name : { required : 'Cost center name cannot be empty' }
      }

      this.formValidator = new AppFormValidator(this.formGroup , {});
      //create new validation object
      this.appValidator = new AppValidator(this.formFields,customErrorMessages,this.formGroup);

      this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
        //console.log(data)
        this.appValidator.validate();
      })

      /*  //change header nevigation pagePath
      this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'Finance',
      'Cost Center'
    ])*/
  this.createTable(); //initialize datatable
  //listten to the menu collapse and hide button
  this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
    if(data == false){return;}
    if(this.datatable != null){
      this.datatable.draw(false);
    }
  })

  }

  saveCostCenter() { //save and update payment term
    this.appValidator.validate();
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let costCenterId = this.formGroup.get('cost_center_id').value


    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'finance/accounting/cost-centers',this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'finance/accounting/cost-centers/' + costCenterId,this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.processing = false
        if(res.data.status == '1'){
          AppAlert.showSuccess({text : res.data.message });
        }
        else{
          AppAlert.showError({text : res.data.message })
        }
        this.formGroup.reset();
        this.reloadTable()
        this.costCenterModel.hide()
      },
      (error) => {
        AppAlert.closeAlert()
        console.log(error)
        if(error.status == 422){ //validation error
          AppAlert.showError({title : 'Validation Error' , text : error.error.errors.validationErrorsText })
        }
        else{
          AppAlert.showError({text : 'Process Error' })
        }
      })
    }

    ngOnDestroy(){
      this.datatable = null
    }

    createTable() { //initialize datatable
      this.datatable = $('#tbl_cost_center').DataTable({
        autoWidth: true,
        scrollY: "500px",
        scrollCollapse: true,
        processing: true,
        serverSide: true,
        order:[[0,'desc']],
        ajax: {
          headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
          dataType : 'JSON',
          "url": this.apiUrl + "finance/accounting/cost-centers?type=datatable"
        },
        columns: [
          {
            data: "cost_center_id",
            width: '8%',
            render : (data,arg,full) => {
              var str = ''

              if(this.permissionService.hasDefined('COST_CENTER_EDIT')){
                str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
              if(this.permissionService.hasDefined('COST_CENTER_DELETE')){ //check delete permission
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
            render : function(data){
              if(data == 1){
                return '<span class="label label-success">Active</span>';
              }
              else{
                return '<span class="label label-default">Inactive</span>';
              }
            }
          },
          { data: "cost_center_code" },
          { data: "cost_center_name" },

        ]
      });

      //listen to the click event of edit and delete buttons
      $('#tbl_cost_center').on('click','i',e => {
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


    edit(id) { //get payment term data and open the model
      this.http.get(this.apiUrl + 'finance/accounting/cost-centers/' + id)
      .pipe( map(res => res['data']))
      .subscribe(data => {
        if(data['status'] == '1') {
          this.costCenterModel.show()
          this.modelTitle = 'Update Cost Center'
          this.formGroup.setValue({
            'cost_center_id' : data['cost_center_id'],
            'cost_center_code' : data['cost_center_code'],
            'cost_center_name' : data['cost_center_name']
          })
          this.formGroup.get('cost_center_code').disable()
          this.saveStatus = 'UPDATE'
        }
      })
    }

    delete(id,status) { //deactivate payment term
      if(status == 0)
      return
      AppAlert.showConfirm({
        'text' : 'Do you want to deactivate selected Cost Center?'
      },(result) => {
        if (result.value) {
          this.http.delete(this.apiUrl + 'finance/accounting/cost-centers/' + id)
          .subscribe(
            (res) => {
              if(res['data']['status'] == '0'){
                AppAlert.showError({text : res['data']['message'] })
              }else{
                this.reloadTable();
              }
            },
            (error) => {
              console.log(error)
            }
          )
        }
      })
    }

    //show event of the bs model
    showEvent(event){
      this.formGroup.get('cost_center_code').enable()
      this.formGroup.reset();
      this.modelTitle = 'New Cost Center'
      this.saveStatus = 'SAVE'
    }

    formValidate(){ //validate the form on input blur event
      this.appValidator.validate();
    }

  }
