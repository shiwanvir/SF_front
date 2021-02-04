
import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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

import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-buy-master',
  templateUrl: './buy-master.component.html',
})

export class BuyMasterComponent implements OnInit {

  @ViewChild(ModalDirective) buyModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "Buy"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'

  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  //to manage form error messages
  formFields = {
    buy_name : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService, private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  ngOnInit() {

    this.titleService.setTitle("Buy Master")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'merchandising/buy-master/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'buy_name',
      data : {
        buy_id : function(controls){ return controls['buy_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      buy_id : 0,
      buy_name :   [null , [Validators.required, Validators.minLength(3), Validators.maxLength(50), PrimaryValidators.noSpecialCharactor],[primaryValidator.remote(remoteValidationConfig)]],
    })

    this.formValidator = new AppFormValidator(this.formGroup , {});
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.createTable() //load data list

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Master Data',
      'Buy Master'
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
    this.datatable = $('#buy_names_tbl').DataTable({
      autoWidth: false,
      scrollY: "500px",
      scrollCollapse: true,
      processing: true,
      order : [[ 0, 'desc' ]],
      serverSide: true,
      ajax: {
        dataType : 'JSON',
        "url": this.apiUrl + "merchandising/buy-master?type=datatable"
      },
      columns: [
        {
          data: "buy_id",
          orderable: false,
          width: '3%',
          render : (data,arg,full)=>{
            var str = '';
            if(this.permissionService.hasDefined('BUY_MASTER_EDIT')){
                str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
          }
          if(this.permissionService.hasDefined('BUY_MASTER_DELETE')){
            str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
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
          width: '20%',
          render : function(data){
            if(data == 1){
              return '<span class="label label-success">Active</span>';
            }
            else{
              return '<span class="label label-default">Inactive</span>';
            }
          }
        },
        { data: "buy_name" }
      ],
    });

    //listen to the click event of edit and delete buttons
    $('#buy_names_tbl').on('click','i',e => {
      let att = e.target.attributes;
      if(att['data-action']['value'] === 'EDIT'){
        this.edit(att['data-id']['value']);
      }
      else if(att['data-action']['value'] === 'DELETE'){
        this.delete(att['data-id']['value'], att['data-status']['value']);
      }
    });

  }
  reloadTable() {
    this.datatable.ajax.reload(null, false);
  }

  //save and update source details
  saveMarkerType(){
    if(!this.formValidator.validate())//if validation faild return from the function
    return;
    this.processing = true
    // AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let compId = this.formGroup.get('buy_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/buy-master', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/buy-master/' + compId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        console.log(res)
        this.processing = false
        if(res.data.status=='0'){
          AppAlert.showError({text:res.data.message})
        }
        if(res.data.status=='1'){
          AppAlert.showSuccess({text : res.data.message })
        }
        this.formGroup.reset();
        this.reloadTable()
        this.buyModel.hide()
      },
      (error) => {
        this.processing = false
        AppAlert.closeAlert()
        AppAlert.showError({text : 'Process Error' })
        console.log(error)
      }
    );
  }

  edit(id) {
    this.http.get(this.apiUrl + 'merchandising/buy-master/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.buyModel.show()
        this.modelTitle = "Update Buy"
        this.formGroup.setValue({
          'buy_id' : data['buy_id'],
          'buy_name' : data['buy_name']
        })
        this.saveStatus = 'UPDATE'
      }
    })
  }

  delete(id, status) {

    if(status == 0)
    return
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Buy?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'merchandising/buy-master/' + id)
        .subscribe(
          (res) => {
            console.log(res);
            if(res['data']['status'] == '1')
            {
              //AppAlert.showSuccess({text:res['data']['message']});
              this.reloadTable();
            }
            else if(res['data']['status'] == '0'){
              AppAlert.showError({text:res['data']['message']})
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


  showEvent(event){
    this.formGroup.get('buy_name').enable()
    this.formGroup.reset();
    this.modelTitle = "Buy"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

}
