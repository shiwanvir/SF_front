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
  selector: 'app-inc-cni',
  templateUrl: './inc-cni.component.html',
  styleUrls: ['./inc-cni.component.css']
})
export class IncCniComponent implements OnInit {
  @ViewChild(ModalDirective) cniIncentiveModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New CNI Incentive Factor"
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
      cni:''
  }

  constructor(private fb:FormBuilder,private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private titleService: Title,private layoutChangerService : LayoutChangerService) { }

    ngOnInit() {
      this.titleService.setTitle("CNI Incentive Factor")//set page title

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

      let remoteValidationConfig={
        url:this.apiUrl + 'pic-system/cni-incentive-factor/validate?for=duplicate',
        formFields : this.formFields,
        fieldCode : 'paid_rate',
        data : {
          inc_cni_id : function(controls){ return controls['inc_cni_id']['value']}
        }
      }

      let remoteValidationConfigCode={
        url:this.apiUrl + 'pic-system/cni-incentive-factor/validate?for=duplicate-code',
        formFields : this.formFields,
        fieldCode : 'cni',
        data : {
          inc_cni_id : function(controls){ return controls['inc_cni_id']['value']}
        }
      }

      let basicValidator = new BasicValidators(this.http)//create object of basic validation class

      this.formGroup = this.fb.group({
        inc_cni_id : 0,
        cni : [null , [Validators.required ], [primaryValidator.remote(remoteValidationConfigCode)]],
        paid_rate : [null , [Validators.required, Validators.min(0) ], [primaryValidator.remote(remoteValidationConfig)]],
      })

      this.formValidator = new AppFormValidator(this.formGroup , {});
      //create new validation object
      // this.appValidator = new AppValidator(this.formFields,{},this.formGroup);
      //
      // this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      //   this.appValidator.validate();
      // })

      if(this.permissionService.hasDefined('CNI_VIEW')){
        this.createTable()
      }
      //change header nevigation pagePath
      this.layoutChangerService.changeHeaderPath([
        'Production Incentive Calculation System',
        'Master Data',
        'CNI Incentive Factor'
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
       this.datatable = $('#cni-incentive-table').DataTable({
         autoWidth: false,
         scrollY: "500px",
         scrollCollapse: true,
         processing: true,
         serverSide: true,
         order:[[3,'desc']],
         ajax: {
              headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
              dataType : 'JSON',
              "url": this.apiUrl + "pic-system/cni-incentive-factor?type=datatable"
          },
          columns: [
              {
                data: "inc_cni_id",
                orderable: false,
                width: '3%',
                render : (data,arg,full) => {
                  var str = '';
                  if(this.permissionService.hasDefined('CNI_EDIT')){
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                }
                  if(this.permissionService.hasDefined('CNI_DELETE')){ //check delete permission
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
            { data: "cni" },
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
       $('#cni-incentive-table').on('click','i',e => {
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
        let transId = this.formGroup.get('inc_cni_id').value
        if(this.saveStatus == 'SAVE'){
          saveOrUpdate$ = this.http.post(this.apiUrl + 'pic-system/cni-incentive-factor', this.formGroup.getRawValue())
        }
        else if(this.saveStatus == 'UPDATE'){
          saveOrUpdate$ = this.http.put(this.apiUrl + 'pic-system/cni-incentive-factor/' + transId , this.formGroup.getRawValue())
        }

        saveOrUpdate$.subscribe(
          (res) => {
            this.processing=false;
            if(res.data.status==0){
              AppAlert.showError({text:res.data.message})
              this.formGroup.reset();
              this.reloadTable()
              this.cniIncentiveModel.hide()
            }
            else if(res.data.status=1){
            this.formGroup.reset();
            this.reloadTable()
            this.cniIncentiveModel.hide()
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
        this.http.get(this.apiUrl + 'pic-system/cni-incentive-factor/' + id)
        .pipe(map( data => data['data'] ))
        .subscribe(data => {
            if(data['status'] == '1') {
              this.cniIncentiveModel.show()
              this.modelTitle = "Update CNI Incentive Factor"
              this.formGroup.setValue({
               'inc_cni_id' : data['inc_cni_id'],
               'cni' : data['cni'],
               'paid_rate' : data['paid_rate']
              })
              this.formGroup.get('cni').disable()
              this.saveStatus = 'UPDATE'
            }
          })

      }
      delete(id,status) { //deactivate payment term
        if(status==0){
          return
        }
        AppAlert.showConfirm({
          'text' : 'Do you want to deactivate selected CNI Incentive Factor?'
        },
        (result) => {
          if (result.value) {
            this.http.delete(this.apiUrl + 'pic-system/cni-incentive-factor/' + id)
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
        this.formGroup.get('inc_cni_id').enable()
        this.formGroup.get('cni').enable()
        this.formGroup.get('paid_rate').enable()
        this.formGroup.reset();
        this.modelTitle = "New CNI Incentive Factor"
        this.saveStatus = 'SAVE'
      }

      keyPress(event: any) {
            const pattern = /^(([0-9]*)|(([0-9]*)\.([0-9]*)))$/;

            let inputChar = String.fromCharCode(event.charCode);
            if (event.keyCode != 8 && !pattern.test(inputChar)) {
              event.preventDefault();
            }
  }

      // formValidate(){ //validate the form on input blur event
      //   this.appValidator.validate();
      // }

}
