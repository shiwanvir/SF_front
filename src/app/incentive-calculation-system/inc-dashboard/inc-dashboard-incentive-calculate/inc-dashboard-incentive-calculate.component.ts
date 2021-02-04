import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
//third part Components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
declare var moment:any;
import { Observable , Subject } from 'rxjs';
import { HotTableRegisterer } from '@handsontable/angular';

import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../../core/validation/primary-validators';
import { AppValidator } from '../../../core/validation/app-validator';
import { BasicValidators } from '../../../core/validation/basic-validators';
import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';

import { PermissionsService } from '../../../core/service/permissions.service';
import { AuthService } from '../../../core/service/auth.service';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';

import { IncDashboardService } from '../inc_dashboard.service';

@Component({
  selector: 'app-inc-dashboard-incentive-calculate',
  templateUrl: './inc-dashboard-incentive-calculate.component.html',
  styleUrls: ['./inc-dashboard-incentive-calculate.component.css']
})
export class IncDashboardIncentiveCalculateComponent implements OnInit {
  @ViewChild('lineTransferModel') lineTransferModel: ModalDirective;
  @ViewChild('cadreModel') cadreModel: ModalDirective;

  formHeader : FormGroup
  formTranfer : FormGroup
  formcadre  : FormGroup
  formValidator : AppFormValidator = null
  formHeaderValidator : AppFormValidator = null
  formTranferValidator : AppFormValidator = null
  formCadreValidator  : AppFormValidator = null
  modelTitle : string = "Equation"
  cadreTitleView : string = "Create Cadre"
  modelTitleView  : string = ""
  buttonChange : string = "SAVE"
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  saveStatus = 'SAVE'
  saveCadreStatus = 'SAVE'
  processing : boolean = false
  processingcadre : boolean = false
  processingcadredetail : boolean = false
  processingtransfer : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false
  emp_processing : boolean = true
  btn_calculate : boolean = true
  btn_confirm : boolean = true

  facDate  = null
  facDate_2  = null
  readytocal = null
  add_cader = null
  facLocation = null
  attendance = null
  efficiency = null
  shift_duration = null
  work_duration = null
  emp_number = null
  empList = []
  calId = 0
  showTransferForm = true
  saved_lines:any;
  saved_lines_count = 0

  dataset: any[] = [];
  hotOptions: any
  instance: string = 'hot';

  cadredataset: any[] = [];
  cadrehotOptions: any
  cadreinstance: string = 'hot1';

  cadredetailsdataset: any[] = [];
  cadredetailshotOptions: any
  cadredetailsinstance: string = 'hot2';

  directcadredataset: any[] = [];
  directcadrehotOptions: any
  directcadreinstance: string = 'hot3';

  type_order$: Observable<Array<any>>
  type_section$: Observable<Array<any>>
  type_emp_list$: Observable<Array<any>>
  desig_list$: Observable<Array<any>>
  subDay$: Observable<Array<any>>



  constructor(private fb:FormBuilder,private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private titleService: Title,private layoutChangerService : LayoutChangerService,
    private incDashboardService : IncDashboardService, private hotRegisterer: HotTableRegisterer) { }

  ngOnInit() {
    this.initializeSizeTable()

    this.incDashboardService.loadData.subscribe(data => {
      if(data != null){
        this.formHeader.get('inc_order_id').enable()
        this.formHeader.get('qco_date_id').enable()
        this.formHeader.get('inc_section_id').enable()

        this.calId = data['id'];
        this.btn_calculate=true;
        this.btn_confirm=false;
        this.emp_processing=true;
        this.processing=false;
        if(this.permissionService.hasDefined('CALENDER_EVENT_OPEN')){
        this.loadHeader(data['id']);
        }


      }
    })
    this.facDate = null
    this.facDate_2 = null
    this.readytocal = null
    this.add_cader = null
    this.facLocation = null
    this.attendance = null
    this.efficiency = null
    this.calId = null
    this.shift_duration = null
    this.work_duration = null
    this.emp_number = null
    //this.loadHeaderData()
    //this.createCalander()
    this.titleService.setTitle("Incentive Calendar")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class



    this.formHeader = this.fb.group({
        inc_order_id : [null , [Validators.required ]],
        inc_section_id : [null , [Validators.required ]],
        efficiency_rate  : [null , [Validators.required ]],
        emp_count  : [null , [Validators.required ]],
        aql  : [null , [Validators.required, Validators.min(0)  ]],
        cni  : [null , [Validators.required, Validators.min(0)  ]],
        incentive  : [null , [Validators.required ]],
        qco_date_id : [null , [Validators.required ]],
        status : null,
    })

    this.formTranfer = this.fb.group({
        inc_production_incentive_line_id: 0,
        work_duration : [null , [Validators.required, Validators.min(0)  ]],
        from_line : [null , [Validators.required ]],
        to_line : [null , [Validators.required ]],

    })
    this.formcadre = this.fb.group({
        cadre_id: 0,
        cadre_name : [null , [Validators.required, Validators.maxLength(30) ]],
        cadre_emp_no : [null , [Validators.required ]],
        cadre_line_no : [null , [Validators.required ]],
        cadre_type : [null , [Validators.required ]],
        inc_designation_equation_id: [null , [Validators.required ]],

    })



    //this.formValidator = new AppFormValidator(this.formGroup , {});
    this.formHeaderValidator = new AppFormValidator(this.formHeader , {});
    this.formTranferValidator = new AppFormValidator(this.formTranfer , {});
    this.formCadreValidator = new AppFormValidator(this.formcadre , {});

    this.type_order$ = this.getTypeofOrder();
    this.type_section$ = this.getSection();



    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Production Incentive Calculation System',
      'Incentive Calendar'
    ])

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
          const hotInstance = this.hotRegisterer.getInstance(this.directcadreinstance);
          const hotInstance2 = this.hotRegisterer.getInstance(this.cadreinstance);
          const hotInstance3 = this.hotRegisterer.getInstance(this.cadredetailsinstance);
          const hotInstance4 = this.hotRegisterer.getInstance(this.instance);

          if(hotInstance != undefined && hotInstance != null){hotInstance.render();}
          if(hotInstance2 != undefined && hotInstance2 != null){hotInstance2.render();}
          if(hotInstance3 != undefined && hotInstance3 != null){hotInstance3.render();}
          if(hotInstance4 != undefined && hotInstance4 != null){hotInstance4.render();}

    })




  }



  initializeSizeTable(){
    this.hotOptions = {
      /*data: [{id: 1}],*/
      columns: [
        { type: 'text', title : 'From Line' , data: 'from_line_no',className: "htLeft"},
        { type: 'text', title : 'To Line' , data: 'to_line_no',className: "htLeft" },
        { type: 'text', title : 'Shift Duration (Hours)' , data: 'shift_duration',className: "htRight" },
        { type: 'text', title : 'Work Duration (Hours)' , data: 'work_duration',className: "htRight" }
      ],
      /*fixedColumnsLeft: 3,*/
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 170,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htCenter htMiddle',
      readOnly: true,

    },
    this.cadrehotOptions = {
      /*data: [{id: 1}],*/
      columns: [
        { type: 'checkbox', title : 'Action' , readOnly: false , checkedTemplate: 'yes',  uncheckedTemplate: 'no' },
        { type: 'text', title : 'Cadre name' , data: 'cadre_name',className: "htLeft"},
        { type: 'text', title : 'Cadre Type' , data: 'cadre_type',className: "htLeft" },

      ],
      /*fixedColumnsLeft: 3,*/
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 300,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htCenter htMiddle',
      readOnly: true,

      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
            console.log(clickEvent);
          },
          items : {

            'edit' : {
              name : 'Edit',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.cadreinstance);
                let sel_row = hotInstance.getSelectedLast()[0];
                let formData = this.formcadre.getRawValue();
                if(!this.permissionService.hasDefined('CALENDER_CADRE_EDIT')){
                  return hotInstance.getSelectedLast()[0] === sel_row
                }
                if(formData['cadre_id'] == 0 || formData['cadre_id'] == null)
                  { return }else{ return hotInstance.getSelectedLast()[0] === sel_row }

                // if(!this.permissionService.hasDefined('CALENDER_CADRE_EDIT')){
                //   return hotInstance.getSelectedLast()[0] === sel_row
                // }

              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  //this.modelTitle = 'Update Size'
                  let start = selection[0].start;
                  let id  = this.cadredataset[start.row]['cadre_id'];
                  let row = this.cadredataset[start.row];
                  if(this.permissionService.hasDefined('CALENDER_CADRE_EDIT')){
                    this.editcadredataset(id,row)
                  }
                }
              }
            },
            'remove_row' : {
              name : 'Remove',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.cadreinstance);
                let sel_row = hotInstance.getSelectedLast()[0];
                if(!this.permissionService.hasDefined('CALENDER_CADRE_DELETE')){
                  return hotInstance.getSelectedLast()[0] === sel_row
                }

              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let row = selection[0].start.row;
                  let data = this.cadredataset[row]
                  if(this.permissionService.hasDefined('CALENDER_CADRE_DELETE')){
                  this.contextMenuHeaderRemove(data)
                }
                }
              }
            },

            'load_row' : {
              name : 'Load to Current Incentive',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.cadreinstance);
                let sel_row = hotInstance.getSelectedLast()[0];
                if(!this.permissionService.hasDefined('CALENDER_CADRE_TRANSFER')){
                  return hotInstance.getSelectedLast()[0] === sel_row
                }

              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                //  let row = selection[0].start.row;
                //  let data = this.cadredataset[row]
                //  this.contextMenuLoadToIncentive(data)
                if(this.permissionService.hasDefined('CALENDER_CADRE_TRANSFER')){
                this.contextMenuLoad()
              }
                }
              }
            },

          }
      }

    },
    this.cadredetailshotOptions = {
      /*data: [{id: 1}],*/
      columns: [
        { type: 'checkbox', title : 'Action' , readOnly: false , checkedTemplate: 'yes',  uncheckedTemplate: 'no' },
        { type: 'text', title : 'EMP #' , data: 'emp_no',className: "htLeft"},
        { type: 'text', title : 'Full Name' , data: 'emp_name',className: "htLeft" },
        { type: 'text', title : 'Section' , data: 'line_no',className: "htRight" }
      ],
      /*fixedColumnsLeft: 3,*/
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 300,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htCenter htMiddle',
      readOnly: true,

      contextMenu : {
          callback: function (key, selection, clickEvent) {
          },
          items : {

            'remove_row' : {
              name : 'Remove',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.cadredetailsinstance);
                let sel_row = hotInstance.getSelectedLast()[0];
                if(!this.permissionService.hasDefined('CALENDER_CADRE_SECTION_DELETE')){
                  return hotInstance.getSelectedLast()[0] === sel_row
                }

              },
              callback : (key, selection, clickEvent) => {
                  if(selection.length > 0){
                    if(this.permissionService.hasDefined('CALENDER_CADRE_SECTION_DELETE')){
                    this.contextMenuRemove()
                  }
                  }
                }

            },


          }
      }

    },

    this.directcadrehotOptions = {
      /*data: [{id: 1}],*/
      columns: [
        { type: 'text', title : 'Cadre' , data: 'emp_status',className: "htLeft"},
        { type: 'text', title : 'EPF #' , data: 'emp_no',className: "htLeft" },
        { type: 'text', title : 'Cadre Type' , data: 'cadre_type',className: "htLeft" },
        { type: 'text', title : 'Section' , data: 'to_line_no',className: "htLeft" },
        { type: 'text', title : 'Incentive (LKR)' , data: 'incentive_payment',className: "htRight" },
        { type: 'text', title : 'Total (LKR)' , data: 'total',className: "htRight" }
      ],
      /*fixedColumnsLeft: 3,*/
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      //height: 170,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htCenter htMiddle',
      readOnly: true,
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            console.log(clickEvent);
          },
          items : {

            'remove_row' : {
              name : 'Remove Cadre',
              disabled:  (key, selection, clickEvent)=>{
                //console.log(this.directcadredataset)
                //debugger
                const hotInstance = this.hotRegisterer.getInstance(this.directcadreinstance);

                let sel_row = hotInstance.getSelectedLast()[0];
                if(!this.permissionService.hasDefined('CALENDER_INCENTIVE_CADRE_REMOVE')){
                  return hotInstance.getSelectedLast()[0] === sel_row
                }

                if(this.readytocal != 'PENDING'){
                  return hotInstance.getSelectedLast()[0] === sel_row
                }


              },
              callback : (key, selection, clickEvent) => {

                  if(selection.length > 0){
                    let row = selection[0].start.row;
                    let data = this.directcadredataset[row]
                    if(this.permissionService.hasDefined('CALENDER_INCENTIVE_CADRE_REMOVE')){
                    this.contextMenuRemoveCadre(data)
                    }
                  }
                }

            },


          }
      }

    }
  }


  contextMenuRemoveCadre(data){
    if(this.readytocal != 'PENDING'){
      AppAlert.showError({text:"Incentive Already Calculated."})
      return;
    }

    this.http.post(this.apiUrl + 'pic-system/remove_cadre_saved_lines' ,{ 'line' : data})
    .pipe(map( data => data['data'] ))
    .subscribe(
      (data) => {
        console.log(data)
        if(data['status']==0){
          AppAlert.showError({text:data['message']})
        }
        else if(data['status']==1){
          //this.clearForm2();
          setTimeout(() => {
            //AppAlert.closeAlert()
            AppAlert.showSuccess({text : data['message'] })
          } , 500)

          this.load_direct_incentive();
          //this.load_cadre_detail();

        }

      },
      (error) => {
        AppAlert.showError({text : 'Process Error'})
      }
    )


  }

  contextMenuLoad(){
    let arr = [];
    let str = '';
    for(let x = 0 ; x < this.cadredataset.length ; x++)
    {
      if(this.cadredataset[x]['0'] != undefined && this.cadredataset[x]['0'] == 'yes'){

           arr.push(this.cadredataset[x])
      }
    }

    console.log(arr)
    if(arr.length == 0)
    {
    AppAlert.showError({ text : 'Please Select Line/Lines, Which You Want To Load' })
    }
    if(arr.length >= 1)
    {
      AppAlert.showConfirm({
        'text' : 'Do You Want To Load Data For Selected Line(s)?'
            },(result) => {
        //console.log(result)
        if (result.value) {
          //this.removeSelectedLines(arr)
          this.contextMenuLoadToIncentive(arr)
        }
        if (result.dismiss) {
          //this.dataset = []
        }

      })
    }


  }

  contextMenuRemove(){
    let arr = [];
    let str = '';
    let emp_no = null

    for(let x = 0 ; x < this.cadredetailsdataset.length ; x++)
    {
      //console.log(this.cadredetailsdataset[x])
      if(this.cadredetailsdataset[x]['0'] != undefined && this.cadredetailsdataset[x]['0'] == 'yes'){

        if(emp_no != null && (emp_no != this.cadredetailsdataset[x]['emp_no'])){
           AppAlert.showError({text : 'Please select the same EMP #' })
           return
        }

           emp_no = this.cadredetailsdataset[x]['emp_no']
           arr.push(this.cadredetailsdataset[x])
        //str += this.dataset[x]['bom_id'] + ',';


      }
    }
    console.log(arr)
    if(arr.length == 0)
    {
    AppAlert.showError({ text : 'Please select Employee(s), Which need to Remove' })
    }
    if(arr.length >= 1)
    {
      AppAlert.showConfirm({
        'text' : 'Do You Want To Remove Employee For Selected Section(s)?'
            },(result) => {
        //console.log(result)
        if (result.value) {
          this.removeSelectedLines(arr)
        }
        if (result.dismiss) {
          //this.dataset = []
        }

      })
    }
  }

  removeSelectedLines(arr){

    this.http.post(this.apiUrl + 'pic-system/remove_cadre_details' ,{ 'lines' : arr})
    .pipe(map( data => data['data'] ))
    .subscribe(
      (data) => {
        console.log(data)
        if(data['status']==0){
          AppAlert.showError({text:data['message']})
        }
        else if(data['status']==1){

          setTimeout(() => {
            //AppAlert.closeAlert()
            AppAlert.showSuccess({text : data['message'] })
          } , 500)

          this.load_cadre_detail()

        }

      },
      (error) => {
        AppAlert.showError({text : 'Process Error'})
      }
    )



  }

  contextMenuHeaderRemove(row){

    //console.log(row)

    this.http.post(this.apiUrl + 'pic-system/remove_cadre_header' ,{ 'lines' : row})
    .pipe(map( data => data['data'] ))
    .subscribe(
      (data) => {
        console.log(data)
        if(data['status']==0){
          AppAlert.showError({text:data['message']})
        }
        else if(data['status']==1){
          this.clearForm2();
          setTimeout(() => {
            //AppAlert.closeAlert()
            AppAlert.showSuccess({text : data['message'] })
          } , 500)

          this.load_cadre_header();
          this.load_cadre_detail();

        }

      },
      (error) => {
        AppAlert.showError({text : 'Process Error'})
      }
    )
  }

  contextMenuLoadToIncentive(data){
    console.log(this.readytocal)
    if(this.readytocal != 'PENDING'){
      AppAlert.showError({text:"Incentive Already Calculated."})
      return;
    }
    let formData = this.formHeader.getRawValue();
    this.http.post(this.apiUrl + 'pic-system/load_to_incentive' ,{ 'lines' : data, 'id' : this.calId,'incentive_date' : this.facDate,'formData' : formData})
    .pipe(map( data => data['data'] ))
    .subscribe(
      (data) => {
        console.log(data)
        if(data['status']==0){
          AppAlert.showError({text:data['message']})
        }
        else if(data['status']==1){

          setTimeout(() => {
            //AppAlert.closeAlert()
            AppAlert.showSuccess({text : data['message'] })
          } , 500)

          this.load_cadre_header();
          this.load_cadre_detail();
          this.load_direct_incentive();

        }

      },
      (error) => {
        AppAlert.showError({text : 'Process Error'})
      }
    )



  }

  editcadredataset(id,row){

    console.log(id)
    console.log(row['cadre_type'])

    this.formcadre.reset();

    this.formcadre.patchValue({cadre_id : row['cadre_id'] })
    this.formcadre.patchValue({cadre_name : row['cadre_name'] })
    this.formcadre.patchValue({cadre_type : row['cadre_type']})

    this.formcadre.get('cadre_name').disable()
    this.formcadre.get('cadre_type').disable()

    this.formcadre.get('cadre_emp_no').enable()
    this.formcadre.get('inc_designation_equation_id').enable()

    if(row['cadre_type'] == "INDIRECT"){
      this.formcadre.get('cadre_line_no').disable()
    }else{
      this.formcadre.get('cadre_line_no').enable()
    }

    //this.type_emp_list$ = this.getEmpList();
    this.desig_list$ = this.getDesigList();

    this.load_cadre_detail()


  }



  line_transfer(e,d_id,p_i_line_id){
    this.modelTitleView = "Line Transfer EMP : "+e
    this.lineTransferModel.show()
    let formData = this.formHeader.getRawValue();

    this.dataset = []
    this.work_duration = 0;
    this.emp_number = e;
    this.http.post(this.apiUrl + 'pic-system/load_transfer_list',
    { 'emp_no' : e,'formData' : formData,'id' : this.calId,'incentive_date' : this.facDate,'emp_detail_id' : d_id,'inc_production_incentive_line_id' : p_i_line_id })
    .pipe( map(data => data['data']) )
    .subscribe(data => {
      this.formTranfer.patchValue({
       'from_line' : { from_line : data['selected_line']['inc_section_id'], line_no : data['selected_line']['line_no']}
      })
      this.formTranfer.patchValue({inc_production_incentive_line_id : data['inc_production_incentive_line_id'] })
      this.formTranfer.get('from_line').disable()
      this.dataset = data['line_emp']
      this.shift_duration = data['header_emp']['shift_duration']
      for(let x = 0 ; x < this.dataset.length ; x++){ //calculate total size qty

        this.work_duration += this.dataset[x]['work_duration']
      }
    })

  }

  saveTransfer(e){
    let formTranferData = this.formTranfer.getRawValue();
    let formData = this.formHeader.getRawValue();
    let emp = this.emp_number;
    //console.log(formTranferData)

    if(formTranferData['from_line']['from_line'] != formTranferData['to_line']['inc_section_id']){
      if((this.work_duration + formTranferData.work_duration) > this.shift_duration ){
        AppAlert.showError({text : 'Total work hours must be less than shift hours.'})
        return;
      }
    }else{
      if((this.work_duration - formTranferData.work_duration) < 0 ){
        AppAlert.showError({text : 'Total work hours must be less than shift hours.'})
        return;
      }
    }


    this.processingtransfer = true;
    this.http.post(this.apiUrl + 'pic-system/save_transfer' ,
    { 'id' : this.calId,'incentive_date' : this.facDate,'formTranferData' : formTranferData,'formData' : formData,'emp' : emp })
    .pipe(map( data => data['data'] ))
    .subscribe(data => {

      if(data['status']==0){
        AppAlert.showError({text:data['message']})
        this.processingtransfer = false;

      }
      else if(data['status']==1){
      this.formTranfer.patchValue({to_line : '' })
      this.formTranfer.patchValue({work_duration : '' })
      this.onLineChange(formData['inc_section_id'])
      this.line_transfer(emp,data['emp_detail_id'],data['inc_production_incentive_line_id'])
      this.formTranfer.reset();
      this.processingtransfer = false;

      setTimeout(() => {
        AppAlert.closeAlert()
        AppAlert.showSuccess({text : data['message'] })
        //this.lineTransferModel.hide()
      } , 500)

    }
          //console.log(data)
      })

  }

  clearForm(){
    this.formTranfer.reset();
  }

  showEvent(event){ //show event of the bs model
    //this.formGroup.get('excelfile').enable()
    this.formTranfer.reset();
    //this.modelTitleView = "Line Transfer"
    //this.saveStatus = 'SAVE'
  }

  getTypeofOrder(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'pic-system/production-incentive?type=to-list&active=1&fields=inc_order_id,order_type')
      .pipe(map(res => res['data']))
  }

  getSection(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'pic-system/production-incentive?type=section-list&active=1&fields=inc_section_id,line_no')
      .pipe(map(res => res['data']))
  }

  getDesigList(): Observable<Array<any>> {
    let cadreData = this.formcadre.getRawValue();
    return this.http.get<any[]>(this.apiUrl + 'pic-system/production-incentive?type=desig-list&active=1&fields=inc_designation_equation_id,emp_designation&inc_date='+this.facDate+'&caderdata='+cadreData['cadre_type'])
      .pipe(map(res => res['data']))
  }

  // getEmpList(): Observable<Array<any>> {
  //   let cadreData = this.formcadre.getRawValue();
  //   return this.http.get<any[]>(this.apiUrl + 'pic-system/production-incentive?type=emp-list&active=1&fields=emp_detail_id,emp_no,emp_name,shift_duration&inc_date='+this.facDate+'&desig='+cadreData['inc_designation_equation_id'])
  //
  //
  //     .pipe(map(res => res['data']))
  // }

  onEMPChange(e){

    //this.formcadre.patchValue({'cadre_emp_no' : { cadre_emp_no : null, emp_no : null}})
    this.formcadre.get('cadre_emp_no').reset( );

    this.type_emp_list$ =  this.http.get<any[]>(this.apiUrl + 'pic-system/production-incentive?type=emp-list&desig='+e['inc_designation_equation_id']+'&inc_date='+this.facDate)
      .pipe(map(res => res['data']))
  }

  onOrderTypeChange(e){
    this.formHeader.get('qco_date_id').reset( );
    this.subDay$ =  this.http.get<any[]>(this.apiUrl + 'pic-system/production-incentive?type=section-daylist&typeof_order='+e['inc_order_id'])
      .pipe(map(res => res['data']))

  }

  onLineChangeDay(e){
    let formData = this.formHeader.getRawValue();
    console.log(formData['inc_section_id'])
    //this.onLineChange(formData['inc_section_id'])

    if(this.formHeader['controls']['inc_order_id']['disabled'] == false){
      if(formData['inc_order_id'] == "" || formData['inc_order_id'] == null ){
        //AppAlert.showError({text:"Type of Order Cannot be empty."})
        this.formHeader.get('inc_order_id').reset( );
        this.formHeader.get('qco_date_id').reset( );
        return;
      }

      if(formData['qco_date_id'] == "" || formData['qco_date_id'] == null ){
        //AppAlert.showError({text:"Day Cannot be empty."})
        this.formHeader.get('inc_order_id').reset( );
        this.formHeader.get('qco_date_id').reset( );
        return;
      }
    }

    this.formHeader.get('inc_order_id').enable()
    this.formHeader.get('qco_date_id').enable()
    let saveOrUpdate$ = null;

    saveOrUpdate$ =this.http.post(this.apiUrl + 'pic-system/load_emp_list',{ 'line_details' : e,'formData' : formData,'id' : this.calId,'incentive_date' : this.facDate })

    saveOrUpdate$.subscribe(
      data => {

        //console.log(data)

          this.empList = []

          let count_ar =  data['count']
          for (var _i = 0; _i < count_ar; _i++)
         {
           this.empList.push(data['line_emp'][_i])
         }
         this.formHeader.patchValue({efficiency_rate : data['load_eff']['efficiency_rate']})
         this.formHeader.patchValue({emp_count : data['load_eff']['noemp']})

         this.formHeader.patchValue({incentive : data['order_type']['incentive_payment'] })
         this.formHeader.patchValue({aql : data['load_header']['AQL'] })
         this.formHeader.patchValue({cni : data['load_header']['CNI'] })
         this.formHeader.patchValue({status : data['load_header']['STATUS'] })
         if(data['load_header']['STATUS'] == 'PLANNED'){
           this.saveStatus = 'UPDATE'
           this.buttonChange  = 'UPDATE'
           this.processing=false;
           //this.btn_calculate=false;
           this.emp_processing=false;
           //this.formHeader.get('aql').disable()
           //this.formHeader.get('cni').disable()
           // this.formHeader.patchValue({
           //  'qco_date_id' : { qco_date_id : data['load_header']['qco_date'], qco_date : data['load_header']['qco_date']},
           //  'inc_order_id' : { inc_order_id : data['load_header']['order_type'], order_type : data['load_header']['order_type']},
           // })
         }else if(data['load_header']['STATUS'] == 'CONFIRMED'){

           this.processing=true;
           this.emp_processing=true;
           this.btn_confirm=true;
           this.btn_calculate=false;

           this.formHeader.get('inc_order_id').disable()
           this.formHeader.get('qco_date_id').disable()


         }else{
           this.processing=false;
           this.btn_calculate=true;
           this.emp_processing=true;
           this.saveStatus = 'SAVE'
           this.formHeader.get('aql').enable()
           this.formHeader.get('cni').enable()
         }

      },
      error => {
        this.empList = []
        AppAlert.showError({text : 'Process Error' })
      }
    )





  }

  onLineChange(e){

    // if(this.calId == null){
    //   AppAlert.showError({text:"Please select a Date to Change Section"})
    //   this.formHeader.reset();
    //   return;
    // }
    //console.log(e)

    let formData = this.formHeader.getRawValue();
    if(this.attendance == "NO"){
      AppAlert.showError({text:"Please Import the Employees."})
      return;
    }
    //console.log(formData['qco_date_id'])
    // if(this.formHeader['controls']['inc_order_id']['disabled'] == false){
    //   if(formData['inc_order_id'] == "" || formData['inc_order_id'] == null ){
    //     AppAlert.showError({text:"Type of Order Cannot be empty."})
    //     this.formHeader.reset();
    //     return;
    //   }
    //
    //   if(formData['qco_date_id'] == "" || formData['qco_date_id'] == null ){
    //     AppAlert.showError({text:"Day Cannot be empty."})
    //     this.formHeader.reset();
    //     return;
    //   }
    // }

    this.formHeader.get('inc_order_id').enable()
    this.formHeader.get('qco_date_id').enable()
    let saveOrUpdate$ = null;

    saveOrUpdate$ =this.http.post(this.apiUrl + 'pic-system/load_emp_list',{ 'line_details' : e,'formData' : formData,'id' : this.calId,'incentive_date' : this.facDate })

    saveOrUpdate$.subscribe(
      data => {

        //console.log(data)

          this.empList = []

          let count_ar =  data['count']
          for (var _i = 0; _i < count_ar; _i++)
         {
           this.empList.push(data['line_emp'][_i])
         }
         this.formHeader.patchValue({efficiency_rate : data['load_eff']['efficiency_rate']})
         this.formHeader.patchValue({emp_count : data['load_eff']['noemp']})
         this.formHeader.patchValue({incentive : data['order_type']['incentive_payment'] })
         this.formHeader.patchValue({aql : data['load_header']['AQL'] })
         this.formHeader.patchValue({cni : data['load_header']['CNI'] })
         this.formHeader.patchValue({status : data['load_header']['STATUS'] })
         if(data['load_header']['STATUS'] == 'PLANNED'){
           this.saveStatus = 'UPDATE'
           this.buttonChange  = 'UPDATE'
           this.processing=false;
           //this.btn_calculate=false;
           this.emp_processing=false;
           //this.formHeader.get('aql').disable()
           //this.formHeader.get('cni').disable()
           this.formHeader.patchValue({
            'qco_date_id' : { qco_date_id : data['load_header']['qco_date'], qco_date : data['load_header']['qco_date']},
            'inc_order_id' : { inc_order_id : data['load_header']['order_type'], order_type : data['load_header']['order_type']},
           })
           this.onLineChangeDay(e)
         }else if(data['load_header']['STATUS'] == 'CONFIRMED'){

           this.processing=true;
           this.emp_processing=true;
           this.btn_confirm=true;
           this.btn_calculate=false;

           this.formHeader.get('inc_order_id').disable()
           this.formHeader.get('qco_date_id').disable()


         }else{
           this.processing=false;
           this.btn_calculate=true;
           this.emp_processing=true;
           this.saveStatus = 'SAVE'
           this.formHeader.get('aql').enable()
           this.formHeader.get('cni').enable()
         }

      },
      error => {
        this.empList = []
        AppAlert.showError({text : 'Process Error' })
      }
    )

  }

  loadHeader(id){
    var currentDate = new Date();
    var d = new Date(currentDate),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    var cur_day =  [year, month, day].join('-');
  //  console.log(cur_day)
    this.formHeader.reset();
    this.empList = []
    this.http.post(this.apiUrl + 'pic-system/load_calender' ,{ 'id' : id })
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
          console.log(data)

          this.facDate = data['ladder_data'][0]['incentive_date']
          this.facDate_2 = data['ladder_data'][0]['incentive_date_2']
          this.facLocation = data['ladder_data'][0]['loc_name']
          this.attendance = (data['ladder_data'][0]['import_employee'] == null || data['ladder_data'][0]['import_employee'] == '') ? 'NO' : data['ladder_data'][0]['import_employee']
          this.efficiency = (data['ladder_data'][0]['import_efficiency'] == null || data['ladder_data'][0]['import_efficiency'] == '') ? 'NO' : data['ladder_data'][0]['import_efficiency']
          this.saved_lines = data['saved_lines']
          this.saved_lines_count = data['saved_lines_count']
          if(data['ladder_data'][0]['incentive_status'] == "READY TO CALCULATE"){
            this.formHeader.get('inc_order_id').disable()
            this.formHeader.get('qco_date_id').disable()
            this.formHeader.get('inc_section_id').enable()
            this.readytocal = "READY TO CALCULATE"
            this.add_cader = true;
            this.btn_confirm=true;
            this.btn_calculate=false;
          }

          if(data['ladder_data'][0]['incentive_status'] == "CALCULATED"){
            this.formHeader.get('inc_order_id').disable()
            this.formHeader.get('qco_date_id').disable()
            this.formHeader.get('inc_section_id').enable()
            this.readytocal = "CALCULATED"
            this.add_cader = true;
            this.btn_confirm=true;
            this.btn_calculate=true;
          }
          if(data['ladder_data'][0]['incentive_status'] == "READY TO SEND"){
            this.formHeader.get('inc_order_id').disable()
            this.formHeader.get('qco_date_id').disable()
            this.formHeader.get('inc_section_id').enable()
            this.readytocal = "READY TO SEND"
            this.add_cader = true;
            this.btn_confirm=true;
            this.btn_calculate=true;
          }
          if(data['ladder_data'][0]['incentive_status'] == "SENT FOR APPROVAL"){
            this.formHeader.get('inc_order_id').disable()
            this.formHeader.get('qco_date_id').disable()
            this.formHeader.get('inc_section_id').enable()
            this.readytocal = "SENT FOR APPROVAL"
            this.add_cader = true;
            this.btn_confirm=true;
            this.btn_calculate=true;
          }
          if(data['ladder_data'][0]['incentive_status'] == "HOLIDAY"){
            this.formHeader.get('inc_order_id').disable()
            this.formHeader.get('qco_date_id').disable()
            this.formHeader.get('inc_section_id').disable()
            this.readytocal = "HOLIDAY"
            this.add_cader = true;
            this.btn_confirm=true;
            this.btn_calculate=true;
            this.processing=true;
          }
          if(data['ladder_data'][0]['incentive_date'] > cur_day){
            this.formHeader.get('inc_order_id').disable()
            this.formHeader.get('qco_date_id').disable()
            this.formHeader.get('inc_section_id').disable()
            this.readytocal = "HOLIDAY"
            this.add_cader = true;
            this.btn_confirm=true;
            this.btn_calculate=true;
            this.processing=true;
          }
          if(data['ladder_data'][0]['incentive_status'] == "PENDING"){
            this.formHeader.get('inc_order_id').disable()
            this.formHeader.get('qco_date_id').disable()
            this.formHeader.get('inc_section_id').enable()
            this.readytocal = "PENDING"
            this.add_cader = false;
            this.btn_calculate=true;
          }
          if(data['ladder_data'][0]['incentive_status'] == "NEW"){
            this.formHeader.get('inc_order_id').disable()
            this.formHeader.get('qco_date_id').disable()
            this.formHeader.get('inc_section_id').enable()
            this.readytocal = "NEW"
            this.add_cader = false;
            this.btn_calculate=true;
          }

          this.load_direct_incentive()
      })

  }

  upload_employee(){
    console.log(this.calId)
    if(this.calId == null){
      AppAlert.showError({text:"Please select a Date to Import Employees"})
      return;
    }

    AppAlert.showMessage('Processing...','Please wait while saving details')
    this.processing=true
    this.http.post(this.apiUrl + 'pic-system/upload_employee' ,{ 'id' : this.calId,'incentive_date' : this.facDate })
    .pipe(map( data => data['data'] ))
    .subscribe(data => {

      this.processing=false;
      if(data['status']==0){
        AppAlert.showError({text:data['message']})

        this.loadHeader(this.calId)

      }
      else if(data['status']==1){

      this.loadHeader(this.calId)

      setTimeout(() => {
        AppAlert.closeAlert()
        AppAlert.showSuccess({text : data['message'] })
      } , 500)
    }
          //console.log(data)



      })
  }

  upload_efficiency(){

    if(this.calId == null){
      AppAlert.showError({text:"Please select a Date to Import Efficiency"})
      return;
    }
    this.processing=true
    AppAlert.showMessage('Processing...','Please wait while saving details')

    this.http.post(this.apiUrl + 'pic-system/upload_efficiency' ,{ 'id' : this.calId,'incentive_date' : this.facDate })
    .pipe(map( data => data['data'] ))
    .subscribe(data => {

      this.processing=false;
      if(data['status']==0){
        AppAlert.showError({text:data['message']})

        this.loadHeader(this.calId)

      }
      else if(data['status']==1){

      this.loadHeader(this.calId)

      setTimeout(() => {
        AppAlert.closeAlert()
        AppAlert.showSuccess({text : data['message'] })
      } , 500)
    }
          //console.log(data)
      })




  }

  save_production(){
    let formData = this.formHeader.getRawValue();
    let emp_list = this.empList;
    this.processing=true;
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    if(this.saveStatus == 'SAVE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'pic-system/save_production_inc' ,
        { 'id' : this.calId,'incentive_date' : this.facDate,'formData' : formData,'emp_list' : emp_list })
    }else if(this.saveStatus == 'UPDATE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'pic-system/update_production_inc' ,
        { 'id' : this.calId,'incentive_date' : this.facDate,'formData' : formData,'emp_list' : emp_list })
    }
    saveOrUpdate$.pipe(map( data => data['data'] ))
    .subscribe(data => {

      this.processing=false;
      if(data['status']==0){
        AppAlert.showError({text:data['message']})
        this.processing=false;
        this.btn_calculate=true;
        this.emp_processing=true;
        this.formHeader.get('aql').enable()
        this.formHeader.get('cni').enable()
        this.onLineChange(formData['inc_section_id'])
      }
      else if(data['status']==1){

        console.log(data)
        this.formHeader.patchValue({aql : data['header']['aql'] })
        this.formHeader.patchValue({cni : data['header']['cni'] })
        this.formHeader.patchValue({status : data['header']['status'] })
        this.saveStatus = 'UPDATE'
        this.buttonChange  = 'UPDATE'
        this.processing=false;
        //this.btn_calculate=false;
        this.emp_processing=false;
        this.onLineChange(formData['inc_section_id'])
        //this.formHeader.get('aql').disable()
        //this.formHeader.get('cni').disable()

      setTimeout(() => {
        AppAlert.closeAlert()
        AppAlert.showSuccess({text : data['message'] })
      } , 500)
    }
          //console.log(data)
      })


  }

  confirm_line_details(){

    if(this.efficiency == "NO"){
      AppAlert.showError({text:"Please Import the Efficiency."})
      return;
    }

    //console.log(this.directcadredataset)
    AppAlert.showConfirm({text : 'Do you want to Confirm ?'},(result) => {
      if(result.value){

    let cadreData = this.formcadre.getRawValue();
    AppAlert.showMessage('Processing...','Please wait while saving details')
    this.processingcadredetail=true;
    this.http.post(this.apiUrl + 'pic-system/confirm_line_details',{'id' : this.calId,'incentive_date' : this.facDate,'Dataset' : this.directcadredataset })
    .pipe( map(data => data['data']) )
    .subscribe(data => {


      if(data['status']==0){

        AppAlert.showError({text:data['message']})
        this.processingcadredetail=false;

      }
      else if(data['status']==1){

        //this.formcadre.reset();
        this.load_direct_incentive();
        this.processing=true;
        this.emp_processing=true;
        this.btn_confirm=true;
        this.btn_calculate=false;

        this.processingcadredetail=false;
        this.readytocal = "READY TO CALCULATE"

        this.formHeader.get('inc_order_id').disable()
        this.formHeader.get('qco_date_id').disable()
        this.formHeader.get('inc_section_id').disable()


      setTimeout(() => {
        AppAlert.closeAlert()
        AppAlert.showSuccess({text : data['message'] })
      } , 500)
    }

    })

  }})


  }

  close_model(){

    this.clearForm2()
    this.cadreModel.hide();
  }

  load_cadre(){
    if(this.readytocal != 'PENDING'){
      AppAlert.showError({text:"Incentive Already Confirmed."})
      this.formcadre.reset();
      return;
    }
    this.formcadre.reset();

    this.cadreModel.show();

    this.formcadre.get('cadre_name').enable()
    this.formcadre.get('cadre_type').enable()

    this.formcadre.get('cadre_emp_no').disable()
    this.formcadre.get('cadre_line_no').disable()
    this.formcadre.get('inc_designation_equation_id').disable()

    this.load_cadre_header();

  }

  savecadreHeader(){

    let formData = this.formHeader.getRawValue();
    let cadreData = this.formcadre.getRawValue();

    console.log(cadreData)

    this.processingcadre=true;
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    if(this.saveCadreStatus == 'SAVE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'pic-system/save_cadre_header' ,
        { 'formData' : formData,'cadreData' : cadreData })
    }else if(this.saveCadreStatus == 'UPDATE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'pic-system/update_cadre_header' ,
        { 'formData' : formData,'cadreData' : cadreData })
    }
    saveOrUpdate$.pipe(map( data => data['data'] ))
    .subscribe(data => {

      this.processingcadre=false;
      if(data['status']==0){

      }
      else if(data['status']==1){

        this.formcadre.reset();
        this.load_cadre_header();


      setTimeout(() => {
        AppAlert.closeAlert()
        AppAlert.showSuccess({text : data['message'] })
      } , 500)
    }
          //console.log(data)
      })

  }

  saveCadre(e){
    let cadreData = this.formcadre.getRawValue();
    console.log(cadreData)
    this.processingcadredetail=true;
    this.http.post(this.apiUrl + 'pic-system/save_cadre_detail',{'cadreData' : cadreData })
    .pipe( map(data => data['data']) )
    .subscribe(data => {

      this.processingcadredetail=false;
      if(data['status']==0){

        AppAlert.showError({text:data['message']})

      }
      else if(data['status']==1){

        this.formcadre.get('cadre_emp_no').reset( );
        this.formcadre.get('cadre_line_no').reset( );
        this.load_cadre_detail();


      setTimeout(() => {
        //AppAlert.closeAlert()
        AppAlert.showSuccess({text : data['message'] })
      } , 500)
    }

    })


  }

  load_cadre_header(){

    this.cadredataset = []
    this.cadredetailsdataset = []
    this.processingcadredetail= false;
    let formData = this.formHeader.getRawValue();
    let cadreData = this.formcadre.getRawValue();
    const hotInstance = this.hotRegisterer.getInstance(this.cadreinstance);

    this.http.post(this.apiUrl + 'pic-system/load_cadre_header',{ 'formData' : formData,'cadreData' : cadreData })
    .pipe( map(data => data['data']) )
    .subscribe(data => {

      this.cadredataset = data['cader_header']


      hotInstance.render();

    })
  }

  load_cadre_detail(){

    this.cadredetailsdataset = []
    let formData = this.formHeader.getRawValue();
    let cadreData = this.formcadre.getRawValue();


    this.http.post(this.apiUrl + 'pic-system/load_cadre_detail',{ 'formData' : formData,'cadreData' : cadreData })
    .pipe( map(data => data['data']) )
    .subscribe(data => {
      console.log(data['cader_detail'])
      this.cadredetailsdataset = data['cader_detail']




    })
  }

  load_direct_incentive(){
    //alert('A');
    this.directcadredataset = []
    let formData = this.formHeader.getRawValue();
    let cadreData = this.formcadre.getRawValue();


    this.http.post(this.apiUrl + 'pic-system/load_direct_incentive',{  'id' : this.calId,'incentive_date' : this.facDate,'formData' : formData,'cadreData' : cadreData })
    .pipe( map(data => data['data']) )
    .subscribe(data => {
      //console.log(data['cader_detail'])
      let count =  data['count']
      let count2 =  data['count2']
      //console.log(data['data']['load_list'])
      for (var _i = 0; _i < count; _i++)
     {
       //data['load_direct_inc'][_i]['emp_no']
       for (var _k = 0; _k < count2; _k++)
      {
        if(data['load_direct_inc'][_i]['emp_no'] == data['emp_total'][_k]['emp_no'])
        {
          data['load_direct_inc'][_i]['total'] = data['emp_total'][_k]['total_incentive'];
          this.directcadredataset.push(data['load_direct_inc'][_i])
        }

      }


     }
      //this.directcadredataset = data['load_direct_inc']

      this.mergeComponentCells();




    })
  }


  mergeComponentCells(){
    //debugger
   if(this.directcadredataset.length>0){

     let options
     const hotInstance = this.hotRegisterer.getInstance(this.directcadreinstance);
     var start=0;
     var count=0;
     var init_line_no=this.directcadredataset[0]['emp_status']
     let arr = []
      for(let x=0;x<this.directcadredataset.length;x++){
          count++;
          if(init_line_no!=this.directcadredataset[x]['emp_status']){
         arr.push({row: start, col: 0, rowspan: count-1, colspan: 1})
         init_line_no=this.directcadredataset[x]['emp_status']
         start =x;
         x--
           count=0;
         }

    }
    arr.push({row: start, col: 0, rowspan: count, colspan: 1})
    start=0;
    count=0;
    init_line_no=this.directcadredataset[0]['emp_no']
        for(let x=0;x<this.directcadredataset.length;x++){
        count++;
        if(init_line_no!=this.directcadredataset[x]['emp_no']){
       arr.push({row: start, col: 1, rowspan: count-1, colspan: 1})
       arr.push({row: start, col: 5, rowspan: count-1, colspan: 1})
       init_line_no=this.directcadredataset[x]['emp_no']
       start =x;
       x--
         count=0;
       }

  }
  arr.push({row: start, col: 1, rowspan: count, colspan: 1})
  arr.push({row: start, col: 5, rowspan: count, colspan: 1})


    //   start=0;
    //   count=0;
    //   init_line_no=this.directcadredataset[0]['total']
    //       for(let x=0;x<this.directcadredataset.length;x++){
    //       count++;
    //       if(init_line_no!=this.directcadredataset[x]['total']){
    //      arr.push({row: start, col: 1, rowspan: count-1, colspan: 1})
    //      init_line_no=this.directcadredataset[x]['total']
    //      start =x;
    //      x--
    //        count=0;
    //      }
    //
    // }
    // arr.push({row: start, col: 1, rowspan: count, colspan: 1})


  options = { mergeCells : arr  };

    hotInstance.updateSettings(options, false)
    hotInstance.render();
  }
  }


  // mergeComponentCells(){
  //       if(this.directcadredataset.length>0){
  //         let options
  //        const hotInstance = this.hotRegisterer.getInstance(this.directcadreinstance);
  //        var start=0;
  //        var count=0;
  //        var init_line_no=this.directcadredataset[0]['emp_status']
  //        let arr = []
  //          for(let x=0;x<this.directcadredataset.length;x++){
  //              count++;
  //              if(init_line_no!=this.directcadredataset[x]['emp_status']){
  //             arr.push({row: start, col: 0, rowspan: count-1, colspan: 1})
  //             init_line_no=this.directcadredataset[x]['emp_status']
  //             start =x;
  //             x--
  //               count=0;
  //             }
  //        }
  //        arr.push({row: start, col: 0, rowspan: count, colspan: 1})
  //
  //
  //        start=0;
  //        count=0;
  //        var new_count = 0;
  //        init_line_no=this.directcadredataset[0]['emp_no']
  //        var for_count = 0;
  //            for(let x=0;x<this.directcadredataset.length;x++){
  //            count++;
  //
  //            if(init_line_no!=this.directcadredataset[x]['emp_no']){
  //            new_count = count-1;
  //           arr.push({row: start, col: 1, rowspan: count-1, colspan: 1})
  //           init_line_no=this.directcadredataset[x]['emp_no']
  //           start =x;
  //           x--
  //             count=0;
  //           }
  //      }
  //      // arr.push({row: start, col: 1, rowspan: count, colspan: 1})
  //      //
  //      //   console.log(this.directcadredataset)
  //      //   start=0;
  //      //   count=0;
  //      //   init_line_no=this.directcadredataset[0]['total']
  //      //       for(let x=0;x<this.directcadredataset.length;x = x+new_count){
  //      //       arr.push({row: x, col: 5, rowspan: new_count, colspan: 1})
  //      //
  //      // }
  //
  //      options = { mergeCells : arr  };
  //
  //
  //
  //        hotInstance.updateSettings(options, false)
  //        hotInstance.render();
  //      }
  //      }



  clearForm2(){
    this.formcadre.reset();
    this.cadredataset = []
    this.cadredetailsdataset = []
    this.formcadre.get('cadre_name').enable()
    this.formcadre.get('cadre_type').enable()
    this.formcadre.get('cadre_emp_no').disable()
    this.formcadre.get('inc_designation_equation_id').disable()
    this.formcadre.get('cadre_line_no').disable()
    this.load_cadre_header()

  }

  clearForm3(){

    this.formHeader.get('inc_order_id').enable()
    this.formHeader.get('qco_date_id').enable()

    this.btn_calculate=true;
    this.btn_confirm=false;
    this.emp_processing=true;
    this.processing=false;

    this.loadHeader(this.calId);

  }

  calculate(){

    if(this.readytocal != "READY TO CALCULATE"){
      AppAlert.showError({text:"Please Confirm the Production Incentive."})
      return;
    }
    AppAlert.showConfirm({text : 'Are you sure of calculating production incentive ?'},(result) => {
      if(result.value){

    AppAlert.showMessage('Processing...','Please wait while saving details')
    this.processingcadredetail=true;

    this.http.post(this.apiUrl + 'pic-system/calculate',{'id' : this.calId,'incentive_date' : this.facDate})
    .pipe( map(data => data['data']) )
    .subscribe(data => {

      if(data['status']==0){
        AppAlert.closeAlert()
        AppAlert.showError({text:data['message']})
        this.processingcadredetail=false;

      }
      else if(data['status']==1){
        this.processingcadredetail=false;
        this.formHeader.get('inc_order_id').disable()
        this.formHeader.get('qco_date_id').disable()
        this.formHeader.get('inc_section_id').disable()
        this.btn_confirm=true;
        this.btn_calculate=true;
        this.readytocal = "CALCULATED"


      setTimeout(() => {
        AppAlert.closeAlert()
        AppAlert.showSuccess({text : data['message'] })
      } , 500)
    }

    })


  }
})


  }




}
