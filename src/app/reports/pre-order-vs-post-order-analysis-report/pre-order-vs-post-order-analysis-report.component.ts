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
import { Division } from '../../org/models/division.model';

declare var $:any;

@Component({
  selector: 'app-pre-order-vs-post-order-analysis-report',
  templateUrl: './pre-order-vs-post-order-analysis-report.component.html'
})
export class PreOrderVsPostOrderAnalysisReportComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  formValidatorHeader : AppFormValidator;
  appValidator : AppValidator;

  customer$: Observable<Customer[]>;//use to load style list in ng-select
  customerLoading = false;
  customerInput$ = new Subject<string>();

  divisionList$: Observable<any[]>;

  formFields = {
    delivery_date : '',
    customer : '',
    validation_error:''
  }

  constructor(private fb:FormBuilder, private http:HttpClient, private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title) { }

  ngOnInit() {

    this.titleService.setTitle("Pre Order vs Post Order Analysis Report")
    this.layoutChangerService.changeHeaderPath([
      'Reports',
      'Finance',
      'Pre Order vs Post Order Analysis Report'
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
      customer : null,
      division : null
    })
    this.formValidatorHeader = new AppFormValidator(this.formGroup , {})

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    });

  }


  createTable(){
    $('#pre_post_tbl').DataTable({
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

  onCustomerChange(e){
    this.loadDivisions()
  }

  loadDivisions(){
    let _customer = this.formGroup.get('customer').value
    _customer = (_customer == null || _customer == '') ? '' : _customer.customer_id

    this.divisionList$ =  this.http.get<any[]>(this.apiUrl + 'reports/load-preorder-postorder?type=division_by_customer&customer_id='+_customer)
    .pipe(map(res => res['data']))
  }

  reloadTable() {//reload datatable
    this.datatable.ajax.reload(null, false);
  }

  reset_feilds() {
    this.formGroup.reset();
    var table = $('#pre_post_tbl').DataTable();
    table
    .clear()
    .draw();
  }

  searchFrom() {
    $('#pre_post_tbl').DataTable().destroy();
    let formData = this.formGroup.getRawValue();

    let date_from = "";
    let date_to = "";
    if(formData['delivery_date'] != null){
      let from = formData['delivery_date'][0];
      date_from = new Date(from.getTime() - (from.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];

      let to = formData['delivery_date'][1];
      date_to = new Date(to.getTime() - (to.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
    }

    $('#pre_post_tbl tfoot th').each( function () {
      var title = $(this).text();
      $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
    });

    this.datatable = $('#pre_post_tbl').DataTable({
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
        "url": this.apiUrl + "reports/load-preorder-postorder-tbl",
        beforeSend : function() {
          AppAlert.showMessage('Processing...','Please wait while loading details')
        },
        complete: function () {
          AppAlert.closeAlert()
        },
      },
      columnDefs: [
        { className: "text-left", targets: [0] },
        { className: "text-right", targets: [1] },
        { className: "text-left", targets: [2] },
        { className: "text-left", targets: [3] },
        { className: "text-left", targets: [4] },
        { className: "text-right", targets: [5] },
        { className: "text-right", targets: [6] },
        { className: "text-right", targets: [7] },
        { className: "text-right", targets: [8] },
        { className: "text-left", targets: [9] },
        { className: "text-right", targets: [10] },
        { className: "text-right", targets: [11] },
        { className: "text-right", targets: [12] },
        { className: "text-right", targets: [13] },
        { className: "text-right", targets: [14] },
        { className: "text-right", targets: [15] },
        { className: "text-right", targets: [16] },
        { className: "text-right", targets: [17] },
        { className: "text-right", targets: [18] },
        { className: "text-right", targets: [19] },
        { className: "text-right", targets: [20] }
      ],
      columns: [
        {data: "customer_name"},
        {data: "order_code"},
        {data: "prod_cat_description"},
        {data: "style_no"},
        {data: "master_description"},
        {data: "order_qty"},
        {data: "fob"},
        {
          data: null,
          render : function(data, type, row) {
            return (row.order_qty*row.fob).toFixed(4);

          }
        },
        {data: "planned_qty"},
        {data: "country_description"},
        {data: "loc_name"},
        {
          data: null,
          render : function(data, type, row) {
            if(row.category_code == 'FAB'){
              let pre_val = (row.po_qty*row.purchase_price);
              let post_val = (row.issue_qty*row.purchase_price);
              return (pre_val).toFixed(4) + ' + ' + (post_val).toFixed(4);
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
              let pre_val = (row.po_qty*row.purchase_price);
              let post_val = (row.issue_qty*row.purchase_price);
              return (pre_val).toFixed(4) + ' + ' + (post_val).toFixed(4);
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
              let pre_val = (row.po_qty*row.purchase_price);
              let post_val = (row.issue_qty*row.purchase_price);
              return (pre_val).toFixed(4) + ' + ' + (post_val).toFixed(4);
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
              let pre_val = (row.po_qty*row.purchase_price);
              let post_val = (row.issue_qty*row.purchase_price);
              return (pre_val).toFixed(4) + ' + ' + (post_val).toFixed(4);
            }
            else{
              return (0);
            }
          }
        },
        { "defaultContent": "" },
        {
          data: null,
          render : function(data, type, row) {
            let pre_cost = (row.po_qty*row.labour_cost);
            let post_cost = (row.issue_qty*row.labour_cost);
            return (pre_cost).toFixed(4) + ' + ' + (post_cost).toFixed(4);
          }
        },
        {
          data: null,
          render : function(data, type, row) {
            let pre_cost = (row.po_qty*row.finance_cost);
            let post_cost = (row.issue_qty*row.finance_cost);
            return (pre_cost).toFixed(4) + ' + ' + (post_cost).toFixed(4);
          }
        },
        {
          data: null,
          render : function(data, type, row) {
            let pre_cost = (row.po_qty*row.coperate_cost);
            let post_cost = (row.issue_qty*row.coperate_cost);
            return (pre_cost).toFixed(4) + ' + ' + (post_cost).toFixed(4);
          }
        },
        {
          data: null,
          render : function(data, type, row) {
            let pre_cost = (row.po_qty*row.epm);
            let post_cost = (row.issue_qty*row.epm);
            return (pre_cost).toFixed(4) + ' + ' + (post_cost).toFixed(4);
          }
        },
        {
          data: null,
          render : function(data, type, row) {
            let pre_cost = (row.po_qty*row.np_margine);
            let post_cost = (row.issue_qty*row.np_margine);
            return (pre_cost).toFixed(4) + ' + ' + (post_cost).toFixed(4);
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
