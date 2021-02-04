import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
//third part Components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
declare var moment:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { IncDashboardService } from './inc_dashboard.service';

@Component({
  selector: 'app-inc-dashboard',
  templateUrl: './inc-dashboard.component.html',
  styleUrls: ['./inc-dashboard.component.css']
})
export class IncDashboardComponent implements OnInit {

  formGroup : FormGroup
  formHeader : FormGroup
  formValidator : AppFormValidator = null
  formHeaderValidator : AppFormValidator = null
  modelTitle : string = "Equation"
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  saveStatus = 'SAVE'
  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  // facDate  = null
  // facLocation = null

  formFields = {
      start_date : '',
      end_date:''
  }

  constructor(private fb:FormBuilder,private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private titleService: Title,private layoutChangerService : LayoutChangerService,
    private incDashboardService : IncDashboardService) { }

  ngOnInit() {
    // this.facDate = null
    // this.facLocation = null
    // this.attendance = null
    // this.efficiency = null
    //this.loadHeaderData()
    if(this.permissionService.hasDefined('CALENDER_VIEW')){
    this.createCalander()
  }

    this.titleService.setTitle("Incentive Calendar")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
        start_date :null,
        end_date :null
    })

    // this.formHeader = this.fb.group({
    //     order_type :null,
    //     line_no : null,
    //     efficiency_rate  : null
    // })

    this.formValidator = new AppFormValidator(this.formGroup , {});
    // this.formHeaderValidator = new AppFormValidator(this.formHeader , {});

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Production Incentive Calculation System',
      'Incentive Calendar'
    ])




  }



  createCalander() {
   var currentDate = moment(new Date()).add(1, 'days');;
   //console.log(currentDate)
   var calendar = $('#calendar').fullCalendar({
    disableDragging: true,
    editable: false,
    height: 650,
    initialView: 'dayGridMonth',
    header:{
     left:'month',
     center:'title',
     right:' prev,next',

    },
    validRange: { end: currentDate },
    eventSources: [
        {
            url: this.apiUrl + "pic-system/production-incentive?type=calender",
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`}
        }
    ],
    selectable:true,
    selectHelper:true,
    select: (start, end, allDay, calendar) => {

        this.formGroup.reset();
        //check_buttons();
        $('#calendarModal').modal();
        var start = $.fullCalendar.formatDate(start, "Y-MM-DD");
        var end   = $.fullCalendar.formatDate(end, "Y-MM-DD");
        console.log(calendar);
        this.formGroup.patchValue({
         'start_date' : start,
         'end_date' : end
        })

    },
    eventClick: (info) => {
    if(this.permissionService.hasDefined('CALENDER_EVENT_OPEN')){
      this.incDashboardService.changeData(info)
    }


  }

   });

   $("#save_new").on("click", (event) => {
     let formData = this.formGroup.getRawValue();
     let dArray = [];
     let dateArray = [];
     let currentDate = moment(formData['start_date']);
     let currentDate2 = moment(formData['start_date']);
     let stopDate = moment(formData['end_date']).add(-1, 'days');
     let count = 0;
     let status = 'NEW';
     let colour = '#00bcd4';
      while (currentDate <= stopDate) {
          dateArray.push( moment(currentDate).format('YYYY-MM-DD') )
          currentDate = moment(currentDate).add(1, 'days');
          count ++;
      }

    let currentMonth = moment(currentDate2).format('YYYY-MM');

     this.processing = true

     this.http.post(this.apiUrl + 'pic-system/production-incentive',{ 'dates' : dateArray,'length' : count,'status' : status,'colour' : colour, 'current_month' : currentMonth })
     .pipe( map(res => res['data'] ))
     .subscribe(
       data => {

             if(data['status']==0){
               this.processing = false
               AppAlert.showError({text:data['message']})
               this.formGroup.reset();
               $('#calendarModal').modal("hide");
             }
             else if(data['status']=1){
               this.processing = false
               this.formGroup.reset();
               $('#calendar').fullCalendar('refetchEvents');
               $('#calendarModal').modal("hide");
             setTimeout(() => {
               AppAlert.closeAlert()
               AppAlert.showSuccess({text : data['message'] })
             } , 500)
           }

        }, error => {


           }
        )




   });


   $("#save_holiday").on("click", (event) => {
     let formData = this.formGroup.getRawValue();
     let dArray = [];
     let dateArray = [];
     let currentDate = moment(formData['start_date']);
      let currentDate2 = moment(formData['start_date']);
     let stopDate = moment(formData['end_date']).add(-1, 'days');
     let count = 0;
     let status = 'HOLIDAY';
     let colour = '#ed4135';
      while (currentDate <= stopDate) {
          dateArray.push( moment(currentDate).format('YYYY-MM-DD') )
          currentDate = moment(currentDate).add(1, 'days');
          count ++;
      }

      let currentMonth = moment(currentDate2).format('YYYY-MM');

     this.processing = true


     this.http.post(this.apiUrl + 'pic-system/production-incentive',{ 'dates' : dateArray,'length' : count,'status' : status,'colour' : colour , 'current_month' : currentMonth   })
     .pipe( map(res => res['data'] ))
     .subscribe(
       data => {

             if(data['status']==0){
               this.processing = false
               AppAlert.showError({text:data['message']})
               this.formGroup.reset();
               $('#calendarModal').modal("hide");
             }
             else if(data['status']=1){
               this.processing = false
               this.formGroup.reset();
               $('#calendar').fullCalendar('refetchEvents');
               $('#calendarModal').modal("hide");
             setTimeout(() => {
               AppAlert.closeAlert()
               AppAlert.showSuccess({text : data['message'] })
             } , 500)
           }

        }, error => {


           }
        )




   });


   $("#save_full_cal").on("click", (event) => {
     let formData = this.formGroup.getRawValue();
     let dArray = [];
     let dateArray = [];
     let currentDate = moment(formData['start_date']);
     let currentMonth = moment(currentDate).format('YYYY-MM');

     AppAlert.showConfirm({text : 'Are you sure of calculating production incentive ?'},(result) => {
       if(result.value){


     AppAlert.showMessage('Processing...','Please wait while Calculating details ')
     this.processing = true

     this.http.post(this.apiUrl + 'pic-system/final_calculation',{ 'current_month' : currentMonth})
     .pipe( map(res => res['data'] ))
     .subscribe(
       data => {

             if(data['status']==0){
               this.processing = false
               AppAlert.showError({text:data['message']})
               this.formGroup.reset();
               $('#calendarModal').modal("hide");
             }
             else if(data['status']=1){
               this.processing = false
               this.formGroup.reset();
               $('#calendar').fullCalendar('refetchEvents');
               $('#calendarModal').modal("hide");
             setTimeout(() => {
               AppAlert.closeAlert()
               AppAlert.showSuccess({text : data['message'] })
             } , 500)
           }

        }, error => {


           }
        )


      }})

   });




   $("#send_to_app").on("click", (event) => {
     let formData = this.formGroup.getRawValue();
     let dArray = [];
     let dateArray = [];
     let currentDate = moment(formData['start_date']);
     let currentMonth = moment(currentDate).format('YYYY-MM');

     AppAlert.showConfirm({text : 'Are You sure Of Sending for Approval from the IE Manager?'},(result) => {
       if(result.value){

     //console.log(currentMonth)
     AppAlert.showMessage('Processing...','Please wait while Sending for Approval')
     this.processing = true

     this.http.post(this.apiUrl + 'pic-system/final_calculation_email',{ 'current_month' : currentMonth})
     .pipe( map(res => res['data'] ))
     .subscribe(
       data => {

             if(data['status']==0){
               this.processing = false
               AppAlert.closeAlert()
               AppAlert.showError({text:data['message']})
               //
               this.formGroup.reset();
               $('#calendarModal').modal("hide");
             }
             else if(data['status']=1){
               this.processing = false
               this.formGroup.reset();
               $('#calendar').fullCalendar('refetchEvents');
               $('#calendarModal').modal("hide");
             setTimeout(() => {
               AppAlert.closeAlert()
               AppAlert.showSuccess({text : data['message'] })
             } , 500)
           }

        }, error => {


           }
        )


}})

   });


  }

  reloadTable() {//reload datatable
      $('#calendar').fullCalendar('refetchEvents');
  }







}
