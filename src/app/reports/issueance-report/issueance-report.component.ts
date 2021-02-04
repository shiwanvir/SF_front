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

import { Customer } from '../../org/models/customer.model';
import { Location } from '../../org/models/location.model';
import { Style } from '../../merchandising/models/style.model';

declare var $:any;

@Component({
  selector: 'app-issueance-report',
  templateUrl: './issueance-report.component.html'
})

export class IssueanceReportComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()

  customer$: Observable<Customer[]>;
  customerLoading = false;
  customerInput$ = new Subject<string>();

  location$: Observable<Location[]>;
  locationLoading = false;
  locationInput$ = new Subject<string>();

  style$: Observable<Style[]>;
  styleLoading = false;
  styleInput$ = new Subject<string>();

  constructor(private fb:FormBuilder, private http:HttpClient, private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title) { }

  ngOnInit() {

    this.titleService.setTitle("Issue report")
    this.layoutChangerService.changeHeaderPath([
      'Reports',
      'Stores',
      'Issue Report'
    ])

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

    this.loadCustomer();
    this.loadLocation();
    this.loadStyle();
    this.createTable();

    this.formGroup = this.fb.group({
      customer_name : null,
      date_range: '',
      loc_name: null,
      style_no: null
    })

  }

  loadCustomer() {
    this.customer$ = this.customerInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.customerLoading = true),
      switchMap(term => this.http.get<Customer[]>(this.apiUrl + 'org/customers?type=auto' , {params:{search:term}})
      .pipe(
        tap(() => this.customerLoading = false)
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

  createTable(){
    $('#issue_tbl').DataTable({
      autoWidth: true,
      scrollY: "500px",
      scrollX: true,
      scrollCollapse: true,
      processing: true,
      serverSide: false,
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
    this.formGroup.reset()
  }

  searchFrom() {
    $('#issue_tbl').DataTable().destroy();
    let formData = this.formGroup.getRawValue();
    let from_date = '';
    let to_date = '';

    if(formData['date_range'] != ''){
      let from = formData['date_range'][0];
      from_date = new Date(from.getTime() - (from.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];

      let to = formData['date_range'][1];
      to_date = new Date(to.getTime() - (to.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
    }

    $('#issue_tbl tfoot th').each( function () {
      var title = $(this).text();
      $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
    });

    this.datatable = $('#issue_tbl').DataTable({
      autoWidth: true,
      scrollY: "500px",
      scrollX: true,
      scrollCollapse: true,
      processing: true,
      serverSide: false,
      dom: 'Bfrtip',
      buttons: [
        'excel'
      ],
      ajax: {
        data: {
          data : this.formGroup.getRawValue(),
          from_date:from_date,
          to_date:to_date
        },
        dataType : 'JSON',
        "url": this.apiUrl + "reports/load_issue?type=datatable",
        beforeSend : function() {
          AppAlert.showMessage('Processing...','Please wait while loading details')
        },
        complete: function () {
          AppAlert.closeAlert()
        },
      },
      columnDefs: [
        { className: "text-left", targets: [0] },
        { className: "text-left", targets: [1] },
        { className: "text-left", targets: [2] },
        { className: "text-left", targets: [3] },
        { className: "text-right", targets: [4] },
        { className: "text-right", targets: [5] },
        { className: "text-left", targets: [6] },
        { className: "text-left", targets: [7] },
        { className: "text-left", targets: [8] },
        { className: "text-left", targets: [9] },
        { className: "text-right", targets: [10] },
        { className: "text-right", targets: [11] },
        { className: "text-left", targets: [12] },
        { className: "text-right", targets: [13] },
        { className: "text-right", targets: [14] },
        { className: "text-right", targets: [15] },
        { className: "text-left", targets: [16] },
        { className: "text-right", targets: [19] },
        { className: "text-left", targets: [20] }
      ],
      columns: [
        {data: "master_code"},
        {data: "master_description"},
        {data: "category_name"},
        {data: "style_no"},
        {data: "shop_order_id"},
        {data: "issue_detail_id"},
        {data: "po_number"},
        {data: "po_date"},
        {data: "customer_name"},
        {data: "po_no"},
        {data: "bal_qty"},
        {data: "grn_qty"},
        {data: "grn_date"},
        {data: "mrn_no"},
        {data: "issue_no"},
        {data: "issue_qty"},
        {data: "issue_date"},
        { "defaultContent": "" },
        { "defaultContent": "" },
        {data: "original_bal_qty"},
        {data: "first_name"}
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
