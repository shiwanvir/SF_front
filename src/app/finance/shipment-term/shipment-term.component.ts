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
  selector: 'app-shipment-term',
  templateUrl: './shipment-term.component.html',
  styleUrls: []
})
export class ShipmentTermComponent implements OnInit {

    @ViewChild(ModalDirective) shipTermModel: ModalDirective;

    formGroup : FormGroup
    formValidator : AppFormValidator = null
    modelTitle : string = "New Shipment Term"
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
      ship_term_code : '',
      ship_term_description : ''
    }

    constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
      private auth : AuthService, private titleService: Title,private layoutChangerService : LayoutChangerService) { }

    ngOnInit() {
      this.titleService.setTitle("Shipment Term")//set page title

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

      let remoteValidationConfig = { //configuration for goods type description remote validation
        url:this.apiUrl + 'finance/ship-terms/validate?for=duplicate',
        formFields : this.formFields,
        fieldCode : 'ship_term_code',
        /*error : 'Goods type description already exists',*/
        data : {
          ship_term_id : function(controls){ return controls['ship_term_id']['value']}
        }
      }

      let basicValidator = new BasicValidators(this.http)//create object of basic validation class

      this.formGroup = this.fb.group({ // create the form
        ship_term_id : 0,
        ship_term_code :  [null , [Validators.required,Validators.minLength(3)],[primaryValidator.remote(remoteValidationConfig)]],
        ship_term_description : [null , [Validators.required,PrimaryValidators.noSpecialCharactor]]
      })
        this.formValidator = new AppFormValidator(this.formGroup , {});
      //create new validation object
      this.appValidator = new AppValidator(this.formFields,[],this.formGroup);

      this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
        this.appValidator.validate();
      })

      if(this.permissionService.hasDefined('SHIP_TERM_VIEW')){
        this.createTable(); //initialize datatable
      }

      this.layoutChangerService.changeHeaderPath([
        'Catalogue',
        'Finance',
        'Shipment Term'
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
       this.datatable = $('#ship_term_tbl').DataTable({
         autoWidth: true,
         scrollY: "500px",
         scrollCollapse: true,
         processing: true,
         serverSide: true,
         order:[[0,'desc']],
         ajax: {
              headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
              dataType : 'JSON',
              "url": this.apiUrl + "finance/ship-terms?type=datatable"
          },
          columns: [
              {
                data: "ship_term_id",
                orderable: false,
                width: '8%',
                render : (data,arg,full) => {
                  var str = ''
                  if(this.permissionService.hasDefined('SHIP_TERM_EDIT')){
                      str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                  }
                  if(this.permissionService.hasDefined('SHIP_TERM_DELETE')){
                      str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
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
             { data: "ship_term_code" },
             { data: "ship_term_description" },

         ],
       });

       //listen to the click event of edit and delete buttons
       $('#ship_term_tbl').on('click','i',e => {
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


    saveShipTerm() { //save and update goods type
      this.processing = true
      AppAlert.showMessage('Processing...','Please wait while saving details')
      let saveOrUpdate$ = null;
      let shipTermId = this.formGroup.get('ship_term_id').value

      if(this.saveStatus == 'SAVE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'finance/ship-terms',this.formGroup.getRawValue())
      }
      else if(this.saveStatus == 'UPDATE'){
        saveOrUpdate$ = this.http.put(this.apiUrl + 'finance/ship-terms/' + shipTermId,this.formGroup.getRawValue())
      }

      saveOrUpdate$.subscribe(

        (res) => {
          this.processing=false
          if(res.data.status==0){
            AppAlert.showError({text:res.data.message});
            this.formGroup.reset();
            this.reloadTable()
            this.shipTermModel.hide()
          }
          else if(res.data.status==1){
          AppAlert.showSuccess({text : res.data.message })
          this.formGroup.reset();
          this.reloadTable()
          this.shipTermModel.hide()
        }
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
      this.http.get(this.apiUrl + 'finance/ship-terms/' + id)
      .pipe(map( data => data['data'] ))
      .subscribe(data => {
          if(data['status'] == '1') {
            this.shipTermModel.show()
            this.modelTitle = "Update Shipment Term"
            this.formGroup.setValue({
             'ship_term_id' : data['ship_term_id'],
             'ship_term_code' : data['ship_term_code'],
             'ship_term_description' : data['ship_term_description']
            })
            this.formGroup.get('ship_term_code').disable()
            this.saveStatus = 'UPDATE'
          }
        })
    }


    delete(id,status) { //deactivate payment term
      if(status==0){
        return;
      }
      AppAlert.showConfirm({
        'text' : 'Do you want to deactivate selected Shipment Term?'
      },
      (result) => {
        if (result.value) {
          this.http.delete(this.apiUrl + 'finance/ship-terms/' + id)
          .pipe(map(data=>data['data']))
          .subscribe(
              (data) => {
                if(data.status==0){
                  AppAlert.showError({text:data.message})
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
      this.formGroup.get('ship_term_code').enable()
      this.formGroup.reset();
      this.modelTitle = "New Shipment Term";
      this.saveStatus = 'SAVE'
    }

    formValidate(){ //validate the form on input blur event
      this.appValidator.validate();
    }


  }
