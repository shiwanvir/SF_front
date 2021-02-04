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
import { AppValidator } from '../../core/validation/app-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { AuthService } from '../../core/service/auth.service';

import { Customer } from '../../org/models/customer.model';
import { Division } from '../../org/models/division.model';

declare var $:any;

@Component({
  selector: 'app-customer-po-status-report',
  templateUrl: './customer-po-status-report.component.html',
})

export class CustomerPOStatusReportComponent implements OnInit {

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
    division : '',
    validation_error:''
  }

  constructor(private fb:FormBuilder , private http:HttpClient ,
    private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title) { }

    ngOnInit() {

      this.titleService.setTitle("Customer PO Status Report")

      this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){return;}
        if(this.datatable != null){
          this.datatable.draw(false);
        }
      })

      this.loadCustomer()
      this.createTable()

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

    ngAfterViewInit() {
      setTimeout(() => {
        this.layoutChangerService.changeHeaderPath([
          'Reports',
          'Sales',
          'Customer PO Status Report'
        ]);
      }, 1);
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

    createTable(){
      $('#cus_po_status_tbl').DataTable({
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

    reset_feilds() {
      this.formGroup.reset()
      var table = $('#cus_po_status_tbl').DataTable();
      table
      .clear()
      .draw();
    }

    searchFrom() {
      $('#cus_po_status_tbl').DataTable().destroy();
      let formData = this.formGroup.getRawValue()

      let date_from = "";
      let date_to = "";
      if(formData['delivery_date'] != null){
        let from = formData['delivery_date'][0];
        date_from = new Date(from.getTime() - (from.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];

        let to = formData['delivery_date'][1];
        date_to = new Date(to.getTime() - (to.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
      }

      $('#cus_po_status_tbl tfoot th').each( function () {
        var title = $(this).text();
        $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
      });
      this.datatable = $('#cus_po_status_tbl').DataTable({
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
            date_from:date_from,
            date_to:date_to
          },
          dataType : 'JSON',
          "url": this.apiUrl + "reports/load-cus-po-status",
          beforeSend : function() {
            AppAlert.showMessage('Processing...','Please wait while loading details')
          },
          complete: function () {
            AppAlert.closeAlert()
          },
        },
        columnDefs: [
          { className: "text-right", targets: [0] },
          { className: "text-right", targets: [1] },
          { className: "text-right", targets: [2] },
          { className: "text-right", targets: [3] },
          { className: "text-right", targets: [4] },
          { className: "text-right", targets: [5] },
          { className: "text-right", targets: [6] },
          { className: "text-right", targets: [7] },
          { className: "text-right", targets: [8] },
          { className: "text-left", targets: [9] },
          { className: "text-left", targets: [10] },
          { className: "text-left", targets: [11] },
          { className: "text-left", targets: [12] },
          { className: "text-left", targets: [13] },
          { className: "text-right", targets: [14] },
          { className: "text-right", targets: [15] },
          { className: "text-right", targets: [16] },
          { className: "text-right", targets: [17] },
          { className: "text-right", targets: [18] },
        ],
        columns: [
          {data: "po_number"},
          {data: "order_qty"},
          {data: "ship_qty"},
          { "defaultContent": "" },
          {
            data: null,
            render : function(data, type, row) {
              if(row.category_code == 'FAB' && row.grn_qty != null){
                return row.grn_qty;
              }
              else{
                return (0);
              }
            }
          },
          {
            data: null,
            render : function(data, type, row) {
              if(row.category_code == 'FAB'){
                return row.po_qty;
              }
              else{
                return (0);
              }
            }
          },
          {
            data: null,
            render : function(data, type, row) {
              if(row.category_code == 'TRM' && row.grn_qty != null){
                return row.grn_qty;
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
                return row.po_qty;
              }
              else{
                return (0);
              }
            }
          },
          {
            data: null,
            render : function(data, type, row) {
              if(row.category_code == 'PAC' && row.grn_qty != null){
                return row.grn_qty;
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
                return row.po_qty;
              }
              else{
                return (0);
              }
            }
          },
          {data: "pcd_date"},
          {data: "grn_date"},
          { "defaultContent": "" },
          { "defaultContent": "" },
          {data: "delivery_date"},
          { "defaultContent": "" },
          { "defaultContent": "" },
          {
            data: null,
            render : function(data, type, row) {
              if(row.category_code == 'FAB'){
                return (row.po_qty - row.issue_qty);
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
                return (row.po_qty - row.issue_qty);
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
                return (row.po_qty - row.issue_qty);
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
