import { Component, OnInit , ViewChild} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';

import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { AuthService } from '../../core/service/auth.service';
import{BsDatepickerConfig} from 'ngx-bootstrap/datepicker';

import { Location } from '../models/location.model';

declare var $:any;

@Component({
  selector: 'app-daily-receiving-report',
  templateUrl: './daily-receiving-report.component.html'
})

export class DailyReceivingReportComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()

  location$: Observable<Location[]>;//use to load style list in ng-select
  locationLoading = false;
  locationInput$ = new Subject<string>();

  constructor(private fb:FormBuilder, private http:HttpClient, private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title) { }

  ngOnInit() {

    this.titleService.setTitle("Daily Receiving Report")
    this.layoutChangerService.changeHeaderPath([
      'Reports',
      'Store',
      'Daily Receiving Report'
    ])

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

    this.loadLocation();
    this.createTable();

    this.formGroup = this.fb.group({
      grn_date : null,
      loc_name: null
    })

  }

  loadLocation(){
    this.location$ = this.locationInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.locationLoading = true),
      switchMap(term => this.http.get<Location[]>(this.apiUrl + 'org/locations?type=auto' , {params:{search:term}})
      .pipe(
        tap(() => this.locationLoading = false)
      ))
    );
  }

  createTable(){
    $('#daily_rec_tbl').DataTable({
      autoWidth: true,
      scrollY: "500px",
      scrollX: true,
      scrollCollapse: true,
      processing: true,
      serverSide: false,
      // fixedColumns:   {
      //   leftColumns: 1,
      //   rightColumns: 0
      // },
      dom: 'Bfrtip',
      buttons: [
        'excel'
      ],
    });
  }

  reloadTable() {//reload datatable
    this.datatable.ajax.reload(null, false);
  }

  reset_feilds() {
    this.formGroup.reset();
  }

  searchFrom() {
    $('#daily_rec_tbl').DataTable().destroy();
    let formData = this.formGroup.getRawValue();

    let date_from = "";
    let date_to = "";
    if(formData['grn_date'] != null){
      let from = formData['grn_date'][0];
      date_from = new Date(from.getTime() - (from.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];

      let to = formData['grn_date'][1];
      date_to = new Date(to.getTime() - (to.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
    }

    $('#daily_rec_tbl tfoot th').each( function () {
      var title = $(this).text();
      $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
    });

    this.datatable = $('#daily_rec_tbl').DataTable({
      autoWidth: true,
      scrollY: "500px",
      scrollX: true,
      scrollCollapse: true,
      processing: true,
      serverSide: false,
      // fixedColumns:   {
      //   leftColumns: 1,
      //   rightColumns: 0
      // },
      dom: 'Bfrtip',
      buttons: [
        'excel'
        // {
        //   extend: 'pdf',
        //   orientation: 'landscape',
        //   pageSize: 'A1'
        // }
      ],
      ajax: {
        data: {
          data : this.formGroup.getRawValue(),
          date_from:date_from,
          date_to:date_to
        },
        dataType : 'JSON',
        "url": this.apiUrl + "reports/load_inward?type=datatable",
        beforeSend : function() {
          AppAlert.showMessage('Processing...','Please wait while loading details')
        },
        complete: function () {
          AppAlert.closeAlert()
        },
      },
      columns: [
        {data: "grn_date"},
        {data: "loc_name"},
        {data: "supplier_name"},
        {data: "customer_name"},
        {data: "first_name"},
        {data: "inv_number"},
        {data: "po_number"},
        {data: "master_code"},
        {data: "master_description"},
        {data: "batch_no"},
        {data: "po_qty"},
        {data: "style_no"}
      ],
    });

    this.datatable.columns().every( function () {
      var that = this;
      $( 'input', this.footer() ).on( 'keyup change clear', function () {
        if ( that.search() !== this.value ) {
          that
          .search( this.value )
          .draw();
        }
      });
    });

  }


}
