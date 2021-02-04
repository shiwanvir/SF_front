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
import { Item } from '../../org/models/item.model';
import { Supplier } from '../../org/models/supplier.model';
import { Cuspo } from '../../org/models/customerpo.model';
import { Division } from '../../org/models/division.model';
import { Style } from '../../merchandising/models/style.model';
import { Salesorder } from '../../merchandising/models/salesorder.model';
import { Po_type } from '../../merchandising/models/po_type.model';
import { Shoporder } from '../../merchandising/models/ShopOrder.model';
declare var $:any;

@Component({
  selector: 'app-msr-report',
  templateUrl: './msr-report.component.html',
  //styleUrls: ['./po-details.component.css']
})
export class MSRReportComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()

  datePickerConfig: Partial<BsDatepickerConfig>;
  today : Date;

  shopOrder$: Observable<Shoporder[]>;
  shopOrderLoading = false;
  shopOrderInput$ = new Subject<string>();

  cusPo$: Observable<Cuspo[]>;
  cusPoLoading = false;
  cusPoInput$ = new Subject<string>();

  constructor(private fb:FormBuilder , private http:HttpClient, private titleService: Title, private layoutChangerService : LayoutChangerService) {
    this.today = new Date();
  }

  ngOnInit() {

    this.titleService.setTitle("MSR report")
    this.layoutChangerService.changeHeaderPath([
      'Reports',
      'MSR Report'
    ])

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

    this.loadShopOrder()
    this.loadCustomerPo()
    this.createTable()

    this.formGroup = this.fb.group({
      rm_in_date : null,
      shop_order_id : null,
      po_no : null
    });

  }

  loadShopOrder() {
    this.shopOrder$ = this.shopOrderInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.shopOrderLoading = true),
      switchMap(term => this.http.get<Shoporder[]>(this.apiUrl + 'reports/load_shop_order?type=auto' , {params:{search:term}})
      .pipe(
        tap(() => this.shopOrderLoading = false)
      ))
    );
  }

  loadCustomerPo() {
    this.cusPo$ = this.cusPoInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.cusPoLoading = true),
      switchMap(term => this.http.get<Cuspo[]>(this.apiUrl + 'merchandising/customer-order-details?type=auto' , {params:{search:term}})
      .pipe(
        tap(() => this.cusPoLoading = false)
      ))
    );
  }

  createTable(){
    $('#msr_tbl').DataTable({
      autoWidth: true,
      scrollY: "500px",
      scrollX: true,
      scrollCollapse: true,
      processing: true,
      serverSide: false,
      // fixedColumns: {
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
    var table = $('#msr_tbl').DataTable();
    table
    .clear()
    .draw();
  }

  searchFrom() {
    $('#msr_tbl').DataTable().destroy();
    let formData = this.formGroup.getRawValue();
    let rm_in_date = formData['rm_in_date'];
    let rm_date = '';

    if(rm_in_date){
      rm_date = new Date(rm_in_date.getTime() - (rm_in_date.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
    }

    $('#msr_tbl tfoot th').each( function () {
      var title = $(this).text();
      $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
    });

    this.datatable = $('#msr_tbl').DataTable({
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
          rm_date:rm_date
        },
        dataType : 'JSON',
        "url": this.apiUrl + "reports/load_msr?type=datatable",
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
        { className: "text-left", targets: [4] },
        { className: "text-left", targets: [5] },
        { className: "text-right", targets: [6] },
        { className: "text-left", targets: [7] },
        { className: "text-left", targets: [8] },
        { className: "text-left", targets: [9] },
        { className: "text-left", targets: [10] },
        { className: "text-left", targets: [11] },
        { className: "text-right", targets: [12] },
        { className: "text-right", targets: [13] },
        { className: "text-right", targets: [14] },
        { className: "text-right", targets: [15] },
        { className: "text-left", targets: [16] },
        { className: "text-left", targets: [17] },
        { className: "text-left", targets: [18] },
        { className: "text-left", targets: [19] },
        { className: "text-left", targets: [20] },
        { className: "text-left", targets: [21] },
        { className: "text-right", targets: [22] },
        { className: "text-right", targets: [23] },
        { className: "text-right", targets: [24] },
        { className: "text-left", targets: [25] },
        { className: "text-left", targets: [26] },
        { className: "text-right", targets: [27] },
        { className: "text-right", targets: [28] }
      ],
      columns: [
        {data: "customer_name"},
        {data: "division_description"},
        {data: "fng_code"},
        {data: "fng_des"},
        {data: "product_component_description"},
        {data: "product_silhouette_description"},
        {data: "shop_order_id"},
        {data: "item_code"},
        {data: "bom_create_date"},
        {data: "item_des"},
        {data: "size_name"},
        {data: "loc_name"},
        {data: "gross_consumption"},
        {data: "order_qty"},
        {
          data: null,
          render : function(data, type, row) {

            return (row.gross_consumption*row.order_qty).toFixed(4);

          }
        },
        {
          data: null,
          render : function(data, type, row) {
            let req_qty = (row.gross_consumption*row.order_qty);
            if(row.order_qty==null)
            return req_qty;
            else
            return (req_qty - row.order_qty).toFixed(4);
          }
        },
        {data: "stock"},
        {data: "first_name"},
        {data: "rm_in_date"},
        {data: "po_no"},
        {data: "po_number"},
        {data: "po_date"},
        {data: "sup_po_order_qty"},
        {data: "asign_qty"},
        {
          data: null,
          render : function(data, type, row) {
            if(row.asign_qty==null){
              return row.sup_po_order_qty;
            }
            else{
              return (row.sup_po_order_qty-row.asign_qty).toFixed(4);
            }
          }
        },
        { "defaultContent": "" },
        {data: "grn_date"},
        {data: "issue_qty"},
        {
          data: null,
          render : function(data, type, row) {
            let req_qty = (row.gross_consumption*row.order_qty);
            if(req_qty == 0){
              return req_qty;
            }
            else{
              return (req_qty - row.issue_qty).toFixed(4);
            }
          }
        }
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
