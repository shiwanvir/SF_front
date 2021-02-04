import { Component, OnInit , ViewChild} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';

import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { AppValidator } from '../../core/validation/app-validator';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { AuthService } from '../../core/service/auth.service';

import { Customer } from '../../org/models/customer.model';

declare var $:any;

@Component({
  selector: 'app-sales-rmc-report',
  templateUrl: './sales-rmc-report.component.html'
})
export class SalesRMCReportComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  formValidatorHeader : AppFormValidator;
  appValidator : AppValidator;

  customer$: Observable<Customer[]>;//use to load style list in ng-select
  customerLoading = false;
  customerInput$ = new Subject<string>();

  formFields = {
    delivery_date : '',
    customer : '',
    validation_error:''
  }

  constructor(private fb:FormBuilder, private http:HttpClient, private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title) { }

  ngOnInit() {

    this.titleService.setTitle("Sales RMC Report")
    this.layoutChangerService.changeHeaderPath([
      'Reports',
      'Sales',
      'Sales RMC Report'
    ])

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

    this.loadCustomer();
    this.createTable();

    this.formGroup = this.fb.group({
      delivery_date : [null, [Validators.required]],
      customer : null
    })
    this.formValidatorHeader = new AppFormValidator(this.formGroup , {})

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    });

  }


  createTable(){
    $('#sales_rmc_tbl').DataTable({
      autoWidth: true,
      scrollY: "500px",
      scrollX: true,
      scrollCollapse: true,
      processing: true,
      dom: 'Bfrtip',
      buttons: [
        'excel'
      ],
    });
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


  reloadTable() {//reload datatable
    this.datatable.ajax.reload(null, false);
  }

  reset_feilds() {
    this.formGroup.reset();
    var table = $('#sales_rmc_tbl').DataTable();
    table
    .clear()
    .draw();
  }

  searchFrom() {
    $('#sales_rmc_tbl').DataTable().destroy();
    let formData = this.formGroup.getRawValue();

    let date_from = "";
    let date_to = "";
    if(formData['delivery_date'] != null){
      let from = formData['delivery_date'][0];
      date_from = new Date(from.getTime() - (from.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];

      let to = formData['delivery_date'][1];
      date_to = new Date(to.getTime() - (to.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
    }

    $('#sales_rmc_tbl tfoot th').each( function () {
      var title = $(this).text();
      $(this).html('<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
    });

    this.datatable = $('#sales_rmc_tbl').DataTable({
      autoWidth: false,
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
          date_from:date_from,
          date_to:date_to
        },
        dataType : 'JSON',
        "url": this.apiUrl + "reports/load-sales-rmc",
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
        { className: "text-right", targets: [2] },
        { className: "text-left", targets: [3] },
        { className: "text-left", targets: [4] },
        { className: "text-left", targets: [5] },
        { className: "text-right", targets: [6] },
        { className: "text-left", targets: [7] },
        { className: "text-left", targets: [8] },
        { className: "text-right", targets: [9] },
        { className: "text-right", targets: [10] },
        { className: "text-right", targets: [11] },
        { className: "text-right", targets: [12] },
        { className: "text-right", targets: [13] },
        { className: "text-right", targets: [14] },
        { className: "text-right", targets: [15] },
        { className: "text-right", targets: [16] },
        { className: "text-right", targets: [17] },
        { className: "text-right", targets: [18] },
        { className: "text-right", targets: [19] }
      ],
      columns: [
        {data: "customer_name"},
        {data: "po_no"},
        {data: "shop_order_id"},
        {data: "prod_cat_description"},
        {data: "style_no"},
        {data: "master_description"},
        {data: "planned_qty"},
        {data: "country_description"},
        {data: "loc_name"},
        {data: "ship_qty"},
        {
          data: null,
          render : function(data, type, row) {
            if(row.category_code == 'FAB'){
              return (row.po_qty*row.purchase_price).toFixed(4);
            }
            else{
              return (0);
            }
          }
        },
        {
          data: null,
          render : function(data, type, row) {
            if(row.category_code == 'TRM'){
              return (row.po_qty*row.purchase_price).toFixed(4);
            }
            else{
              return (0);
            }
          }
        },
        {
          data: null,
          render : function(data, type, row) {
            if(row.category_code == 'PAC'){
              return (row.po_qty*row.purchase_price).toFixed(4);
            }
            else{
              return (0);
            }
          }
        },
        {
          data: null,
          render : function(data, type, row) {
            if(row.category_code == 'ELA'){
              return (row.po_qty*row.purchase_price).toFixed(4);
            }
            else{
              return (0);
            }
          }
        },
        {data: "fob"},
        {
          data: null,
          render : function(data, type, row) {
            return (row.ship_qty*row.fob).toFixed(4);
          }
        },
        {
          data: null,
          render : function(data, type, row) {
            if(row.category_code == 'FAB'){
              return (row.issue_qty*row.purchase_price).toFixed(4);
            }
            else{
              return (0);
            }
          }
        },
        {
          data: null,
          render : function(data, type, row) {
            if(row.category_code == 'TRM'){
              return (row.issue_qty*row.purchase_price).toFixed(4);
            }
            else{
              return (0);
            }
          }
        },
        {
          data: null,
          render : function(data, type, row) {
            if(row.category_code == 'PAC'){
              return (row.issue_qty*row.purchase_price).toFixed(4);
            }
            else{
              return (0);
            }
          }
        },
        {
          data: null,
          render : function(data, type, row) {
            if(row.category_code == 'ELA'){
              return (row.issue_qty*row.purchase_price).toFixed(4);
            }
            else{
              return (0);
            }
          }
        },
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
