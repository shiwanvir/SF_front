import { Component, OnInit , ViewChild} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { PermissionsService } from '../../core/service/permissions.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { AuthService } from '../../core/service/auth.service';
declare var $:any;

@Component({
  selector: 'app-inc-payment-summary-report',
  templateUrl: './inc-payment-summary-report.component.html',
  styleUrls: ['./inc-payment-summary-report.component.css']
})
export class IncPaymentSummaryReportComponent implements OnInit {

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  processing : boolean = false
  month_select$: Observable<Array<any>>
  getMonth = null
  getDates:any;
  user_list:any;
  date_wise_user_list:any;
  getCountDates = null
  getTotal:Observable<Array<any>>;
  getSizeQ:Observable<Array<any>>;

  POStatus$: Observable<Array<any>>

  formFields = {
    month_of_year : ''
  }

  constructor(private fb:FormBuilder, private http:HttpClient, private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,
    private auth : AuthService,private titleService: Title) { }


  ngOnInit() {
    this.titleService.setTitle("Incentive Payment Summary Report")
    this.layoutChangerService.changeHeaderPath([
      'Production Incentive Calculation System',
      'Reports',
      'Incentive Payment Summary Report'
    ])

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
       this.datatable.draw(false);
      }
    })

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class
    this.formGroup = this.fb.group({
      month_of_year : [null , [Validators.required]],
    })
    this.formValidator = new AppFormValidator(this.formGroup , {});


   //this.createTable();
   this.month_select$ = this.getMonthdata();
  }

  getMonthdata(): Observable<Array<any>> {
    //debugger
    return this.http.get<any[]>(this.apiUrl + 'pic-system/inc_report?type=inc-list&active=1&fields=month_of_year,user_loc_id')
      .pipe(map(res => res['data']))
  }


  createTable(){
  //  debugger
    $('#sales_tbl').DataTable({
      autoWidth: false,
      scrollY: "500px",
      scrollCollapse: true,
      processing: true,
      serverSide: true,
      paging:true,
      searching:true,
      buttons: [
        'excel'
      ],
    });
  }

 reset_feilds(){
   this.formGroup.reset();

 }


  searchFrom(){
    //this.appValidation.validate();
    if(!this.formValidator.validate())//if validation faild return from the function
      return;

    let formData = this.formGroup.getRawValue();
    console.log(formData)

    window.open(AppConfig.IncentiveMonthDataExport()+"?date="+formData['month_of_year']['month_of_year']+"&loc="+formData['month_of_year']['user_loc_id'], '_blank');


    //this.processing = true
    //AppAlert.showMessage('Processing...','Please wait while saving details')

    // this.http.post(this.apiUrl + 'pic-system/inc_report_data_load' ,{ 'formData' : formData})
    // .pipe(map( data => data['data'] ))
    // .subscribe(
    //   (data) => {
    //
    //
    //       console.log(data)
    //       this.getDates = data['dates'];
    //       this.getCountDates = data['count_dates'];
    //       this.getMonth = data['month']['month'];
    //       this.user_list = data['user_list'];
    //       this.date_wise_user_list = data['date_wise_user_list'];
    //
    //
    //   },
    //   (error) => {
    //     AppAlert.showError({text : 'Process Error'})
    //   }
    // )

  }

}
