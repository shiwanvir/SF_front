import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third party components
import { ModalDirective } from 'ngx-bootstrap/modal';
import {ComponentLoaderFactory} from 'ngx-bootstrap/component-loader';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import {PositioningService} from 'ngx-bootstrap/positioning';
import{BsDatepickerConfig} from 'ngx-bootstrap/datepicker';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';



@Component({
  selector: 'app-cost',
  templateUrl: './cost.component.html',
  styleUrls: []
})
export class CostComponent implements OnInit {

  @ViewChild(ModalDirective) costModel: ModalDirective;

  datePickerConfig: Partial<BsDatepickerConfig>;
  formGroup : FormGroup
  hisFormGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Finance Cost"
  datatable:any = null
  hisDatatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  saveStatus = 'SAVE'
  appValidator : AppValidator
  appHisValidator : AppValidator
  today : Date
  minimumDate : Date
  disable: boolean
  rowCount: number

  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  //to manage form error messages
  formFields = {
    finance_cost : '',
    cpmfront_end : '',
    cpum : '',
    effective_from : '',
    effective_to : ''
  }

  // hisFormFields = {
  //   finance_cost : '',
  //   cpmfront_end : '',
  //   cpum : '',
  //   effective_from : '',
  //   effective_to :''
  // }

  constructor(private fb:FormBuilder , private http:HttpClient, private titleService: Title, private permissionService : PermissionsService,
    private auth : AuthService, private layoutChangerService : LayoutChangerService) {
    this.minimumDate = new Date();
    this.minimumDate.setDate(this.minimumDate.getDate()-1);
    this.today = new Date();




    // this.datePickerConfig = Object.assign({},
    //   {
    //       this.today = new Date();
    //       // minDate: new Date(this.today.getDate() - 1)
    //   }
    // );
  }

  ngOnInit() {
    this.titleService.setTitle("Finance Cost")//set page title
    // let remoteValidationConfig = { //configuration for location code remote validation
    //   url:this.apiUrl + 'ie/smvupdates/validate?for=duplicate',
    //   formFields : this.formFields,
    //
    //   /*error : 'Dep code already exists',*/
    //   data : {
    //     smv_id : function(controls){ return controls['fin_cost_id']['value']},
    //   }
    // }

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    // let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
       fin_cost_id : 0 ,
       fin_cost_his_id : 0 ,
       finance_cost : [null , [Validators.required, PrimaryValidators.isNumber, ]],
       cpmfront_end :  [null , [Validators.required,PrimaryValidators.isNumber, ]],
       cpum :  [null , [Validators.required,PrimaryValidators.isNumber,]],
       effective_from : [null, Validators.required],
       effective_to : [null , Validators.required]
    })

    // this.hisFormGroup = this.fb.group({
    //    finance_cost : [null , [Validators.required] ],
    //    cpmfront_end : [null , [Validators.required]],
    //    cpum : [null , [Validators.required]],
    //    effective_from : [null, [Validators.required]],
    //    effective_to : [null , [Validators.required] ]
    //
    // })

    this.formValidator = new AppFormValidator(this.formGroup , {});//create new validation object


    //create new validation object
    this.appValidator = new AppValidator(this.formFields,[],this.formGroup);

    // this.appHisValidator = new AppValidator(this.hisFormFields,[],this.hisFormGroup);


    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    // this.hisFormGroup.valueChanges.subscribe(data => { //validate form when form value changes
    //   this.appHisValidator.validate();
    // })



    this.createTable() //load data list
    this.createHisTable() //Load history data list
    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'Finance',
      'Finance Cost'
    ])

  }

  ngOnDestroy(){
    this.datatable = null
    this.hisDatatable = null
  }

  createTable() { //initialize datatable
     this.datatable = $('#cost_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       paging: false,
       searching:false,
       info:false,
       order:[[0,'desc']],
       //aLengthMenu: [[1], [1]],
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "finance/finCost?type=datatable"
        },
        columns: [
            {
              data: "fin_cost_id",
              orderable: true,
              width: '3%',
              render : (data,arg,full)=>{
                var str = ''
                if(this.permissionService.hasDefined('FINANCE_COST_EDIT')){
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
                return str;
             }
           },
           {
             data: "status",
             orderable: false,
             render : function(data){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
          { data: "finance_cost", className: 'dt-body-right'},
          { data: "cpmfront_end", className: 'dt-body-right'},
          { data: "cpum", className: 'dt-body-right' },
          { data: "from_date" },
          { data: "to_date" }
       ],
       "initComplete": (settings,json)=>{
         var table = $('#cost_tbl').dataTable();
         this.rowCount = table.fnGetData().length;
         // alert(this.rowCount);
          if(this.rowCount != 0){
              this.disable = true;
          } else if(this.rowCount==0) {
              this.disable = false;
          }
       }

     });



     //listen to the click event of edit and delete buttons
     $('#cost_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value']);
        }

     });


}

createHisTable() { //initialize datatable
   this.hisDatatable = $('#cost_his_tbl').DataTable({
     autoWidth: true,
     scrollY: "500px",
     scrollCollapse: true,
     processing: true,
     serverSide: true,
     searching: true,
     order:[[0,'desc']],
     ajax: {
          dataType : 'JSON',
          "url": this.apiUrl + "finance/finCostHis?type=datatable"
      },
      columns: [

        { data: "finance_cost", className: 'dt-body-right'},
        { data: "cpmfront_end", className: 'dt-body-right' },
        { data: "cpum", className: 'dt-body-right' },
        { data: "from_date" },
        { data: "to_date" }
     ],
   });

 }



  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

  reloadHisTable() {//reload datatable
      this.hisDatatable.ajax.reload(null, false);
  }

  //save and update source details
  saveCost(){
    //this.appValidation.validate();
    //debugger
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let saveOrUpdateHis$ = null;
    let finCostId = this.formGroup.get('fin_cost_id').value
    let finCostHisId = this.formGroup.get('fin_cost_his_id').value
    let formData = this.formGroup.getRawValue();
    formData.effective_from_ = this.formatFormDate(formData.effective_from)
    formData.effective_to_ = this.formatFormDate(formData.effective_to)
        // let hisFormData = this.hisFormGroup.getRawValue();

      //debugger

    if(this.saveStatus == 'SAVE'){
    //  debugger
      saveOrUpdate$ = this.http.post(this.apiUrl + 'finance/finCost', this.formGroup.getRawValue())
      saveOrUpdateHis$ = this.http.post(this.apiUrl + 'finance/finCostHis', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      //debugger
      saveOrUpdate$ = this.http.put(this.apiUrl + 'finance/finCost/' + finCostId , formData)
      //saveOrUpdateHis$ = this.http.put(this.apiUrl + 'finance/finCostHis/updates' ,formData)
    }

    //saveOrUpdate$.subscribe();
    saveOrUpdate$.subscribe(
      (res) => {
        this.processing = false
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.reloadHisTable()
        this.costModel.hide()
        this.disable = true;
        //
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




  edit(id) { //get Finance cost data and open the model
    this.http.get(this.apiUrl + 'finance/finCost/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.costModel.show()
        this.modelTitle = "Update Finance Cost"
        this.formGroup.setValue({
         'fin_cost_id' : data['fin_cost_id'],
         'fin_cost_his_id' : data['history'],
         'finance_cost' : data['finance_cost'],
         'cpmfront_end' : data['cpmfront_end'],
         'cpum' : data['cpum'],
         'effective_from' : new Date(data['effective_from']),
         'effective_to' : new Date(data['effective_to'])
        })
        this.saveStatus = 'UPDATE'
      }
    })
  }



  showEvent(event){ //show event of the bs model

    // this.formGroup.get('validation_error').enable()
    this.formGroup.reset();
    this.modelTitle = "New Finance Cost"
    this.saveStatus = 'SAVE'

}

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

  onmouseover($event) {
    //debugger
    let formData = this.formGroup.getRawValue();
    if(formData['finance_cost']!="")
    var fcoust=parseFloat(formData['finance_cost']).toFixed(4);
      if(formData['cpmfront_end']!="")
    var fpumFront=parseFloat(formData['cpmfront_end']).toFixed(4);
      if(formData['cpum']!="")
    var fcpum=parseFloat(formData['cpum']).toFixed(4);
    this.formGroup.patchValue({
      finance_cost:fcoust,
      cpmfront_end:fpumFront,
      cpum:fcpum

    })
    };

    formatFormDate(_dateObj){
      if(_dateObj != null && _dateObj != ''){
        let _year = _dateObj.getFullYear()
        let _month = (_dateObj.getMonth() < 9) ? '0' + (_dateObj.getMonth() + 1) : (_dateObj.getMonth() + 1)
        let _day = _dateObj.getDate()
        let dateStr = _year + '-' + _month + '-' + _day
        return dateStr
      }
      else{
        return null
      }
    }


}
