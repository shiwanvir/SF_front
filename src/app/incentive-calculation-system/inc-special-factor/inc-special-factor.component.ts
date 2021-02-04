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
  selector: 'app-inc-special-factor',
  templateUrl: './inc-special-factor.component.html',
  styleUrls: ['./inc-special-factor.component.css']
})
export class IncSpecialFactorComponent implements OnInit {
  @ViewChild(ModalDirective) specialFacModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Special Factor"
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  saveStatus = 'SAVE'
  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false



  formFields = {
      paid_rate : '',
      validation_error:'',
      special_factor:''
  }

  constructor(private fb:FormBuilder,private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private titleService: Title,private layoutChangerService : LayoutChangerService) { }


    ngOnInit() {
      this.titleService.setTitle("Special Factor")//set page title

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

      let remoteValidationConfig={
        url:this.apiUrl + 'pic-system/special-factor/validate?for=duplicate',
        formFields : this.formFields,
        fieldCode : 'paid_rate',
        data : {
          inc_special_factor_id : function(controls){ return controls['inc_special_factor_id']['value']}
        }
      }

      let remoteValidationConfigCode={
        url:this.apiUrl + 'pic-system/special-factor/validate?for=duplicate-code',
        formFields : this.formFields,
        fieldCode : 'special_factor',
        data : {
          inc_special_factor_id : function(controls){ return controls['inc_special_factor_id']['value']}
        }
      }

      let basicValidator = new BasicValidators(this.http)//create object of basic validation class

      this.formGroup = this.fb.group({
        inc_special_factor_id : 0,
        special_factor : [null , [Validators.required ], [primaryValidator.remote(remoteValidationConfigCode)]],
        paid_rate : [null , [Validators.required, Validators.min(0)  ], [primaryValidator.remote(remoteValidationConfig)]],
      })

      this.formValidator = new AppFormValidator(this.formGroup , {});
      //create new validation object
      // this.appValidator = new AppValidator(this.formFields,{},this.formGroup);
      //
      // this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      //   this.appValidator.validate();
      // })

      if(this.permissionService.hasDefined('SPECIAL_FACTOR_VIEW')){
        this.createTable()
      }
      //change header nevigation pagePath
      this.layoutChangerService.changeHeaderPath([
        'Production Incentive Calculation System',
        'Master Data',
        'Special Factor'
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
       this.datatable = $('#special-table').DataTable({
         autoWidth: false,
         scrollY: "500px",
         scrollCollapse: true,
         processing: true,
         serverSide: true,
         order:[[4,'desc']],
         ajax: {
              headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
              dataType : 'JSON',
              "url": this.apiUrl + "pic-system/special-factor?type=datatable"
          },
          columns: [
              {
                data: "inc_special_factor_id",
                orderable: false,
                width: '3%',
                render : (data,arg,full) => {
                  var str = '';
                  if(this.permissionService.hasDefined('SPECIAL_FACTOR_EDIT')){
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                }
                  if(this.permissionService.hasDefined('SPECIAL_FACTOR_DELETE')){ //check delete permission
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
            { data: "special_factor" },
            { data: "paid_rate" },
            { data: "created_date" }

         ],
         columnDefs: [
            {
                targets: [ 4 ],visible: false,searchable: false
            }
        ]
       });

       //listen to the click event of edit and delete buttons
       $('#special-table').on('click','i',e => {
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
        let transId = this.formGroup.get('inc_special_factor_id').value
        if(this.saveStatus == 'SAVE'){
          saveOrUpdate$ = this.http.post(this.apiUrl + 'pic-system/special-factor', this.formGroup.getRawValue())
        }
        else if(this.saveStatus == 'UPDATE'){
          saveOrUpdate$ = this.http.put(this.apiUrl + 'pic-system/special-factor/' + transId , this.formGroup.getRawValue())
        }

        saveOrUpdate$.subscribe(
          (res) => {
            this.processing=false;
            if(res.data.status==0){
              AppAlert.showError({text:res.data.message})
              this.formGroup.reset();
              this.reloadTable()
              this.specialFacModel.hide()
            }
            else if(res.data.status=1){
            this.formGroup.reset();
            this.reloadTable()
            this.specialFacModel.hide()
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
        this.http.get(this.apiUrl + 'pic-system/special-factor/' + id)
        .pipe(map( data => data['data'] ))
        .subscribe(data => {
            if(data['status'] == '1') {
              this.specialFacModel.show()
              this.modelTitle = "Update Special Factor"
              this.formGroup.setValue({
               'inc_special_factor_id' : data['inc_special_factor_id'],
               'special_factor' : data['special_factor'],
               'paid_rate' : data['paid_rate']
              })
              this.formGroup.get('special_factor').disable()
              this.saveStatus = 'UPDATE'
            }
          })

      }
      delete(id,status) { //deactivate payment term
        if(status==0){
          return
        }
        AppAlert.showConfirm({
          'text' : 'Do you want to deactivate selected Special Factor?'
        },
        (result) => {
          if (result.value) {
            this.http.delete(this.apiUrl + 'pic-system/special-factor/' + id)
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
        this.formGroup.get('inc_special_factor_id').enable()
        this.formGroup.get('special_factor').enable()
        this.formGroup.get('paid_rate').enable()
        this.formGroup.reset();
        this.modelTitle = "New Special Factor"
        this.saveStatus = 'SAVE'
      }


      keyPress(event: any) {
            const pattern = /^(([0-9]*)|(([0-9]*)\.([0-9]*)))$/;

            let inputChar = String.fromCharCode(event.charCode);
            if (event.keyCode != 8 && !pattern.test(inputChar)) {
              event.preventDefault();
            }
    }


}
