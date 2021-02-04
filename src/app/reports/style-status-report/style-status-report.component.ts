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

import { Style } from '../../merchandising/models/style.model';
import { Location } from '../../org/models/location.model';
import { Division } from '../../org/models/division.model';

declare var $:any;

@Component({
  selector: 'style-status-report',
  templateUrl: './style-status-report.component.html',
  //styleUrls: ['./po-details.component.css']
})
export class StyleStatusReportComponent implements OnInit {

  division$: Observable<Division[]>;
  divisionLoading = false;
  divisionInput$ = new Subject<string>();

  location$: Observable<Location[]>;
  locationLoading = false;
  locationInput$ = new Subject<string>();

  style$: Observable<Style[]>;
  styleLoading = false;
  styleInput$ = new Subject<string>();

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl();

  constructor(private fb:FormBuilder , private http:HttpClient, private titleService: Title, private layoutChangerService : LayoutChangerService) {
  }

  ngOnInit() {

    this.titleService.setTitle("Style status report")
    this.layoutChangerService.changeHeaderPath([
      'Reports',
      'Style',
      'Style Status Report'
    ])

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

    this.loadStyle();
    this.loadLocation();
    this.createTable();

    this.formGroup = this.fb.group({
      rm_in_date : null,
      style : null,
      location : null
    });

  }

  createTable(){
    $('#style_status_tbl').DataTable({
      autoWidth: true,
      scrollY: "500px",
      scrollX: true,
      scrollCollapse: true,
      processing: true,
      serverSide: false,
      dom: 'Bfrtip',
      buttons: [
        'copy', 'csv', 'excel', 'pdf', 'print'
      ],
    });
  }

  loadStyle() {
    this.style$ = this.styleInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.styleLoading = true),
      switchMap(term => this.http.get<Style[]>(this.apiUrl + 'ie/styles?type=auto' , {params:{search:term}})
      .pipe(
        tap(() => this.styleLoading = false)
      ))
    );
  }

  loadLocation() {
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

  reset_feilds() {
    this.formGroup.reset();
    var table = $('#style_status_tbl').DataTable();
    table
    .clear()
    .draw();
  }

  searchFrom() {

    $('#style_status_tbl').DataTable().destroy();

    let formData = this.formGroup.getRawValue();
    let rm_in_date = formData['rm_in_date'];
    let rm_date = '';

    if(rm_in_date){
      rm_date = new Date(rm_in_date.getTime() - (rm_in_date.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
    }

    $('#style_status_tbl tfoot th').each( function () {
      var title = $(this).text();
      $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
    });

    this.datatable = $('#style_status_tbl').DataTable({
      autoWidth: true,
      scrollY: "500px",
      scrollX: true,
      scrollCollapse: true,
      processing: true,
      serverSide: false,
      dom: 'Bfrtip',
      buttons: [
        'copy', 'csv', 'excel', 'print',
        {
          extend: 'pdf',
          orientation: 'landscape',
          pageSize: 'A1'
        }
      ],
      ajax: {
        data: {
          data : this.formGroup.getRawValue(),
          rm_date:rm_date
        },
        dataType : 'JSON',
        "url": this.apiUrl + "reports/load_style_status?type=datatable",
        beforeSend : function() {
          AppAlert.showMessage('Processing...','Please wait while loading details')
        },
        complete: function () {
          AppAlert.closeAlert()
        },
      },
      columns: [
        {data: "style_no"},
        {data: "rm_in_date"},
        {data: "master_code"},
        {data: "master_description"},
        {data: "order_qty"},
        {data: "po_no"},
        {data: "grn_number"},
        {data: "issue_no"},
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
