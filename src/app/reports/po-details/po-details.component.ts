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

import { Customer } from '../../org/models/customer.model';
import { Item } from '../../org/models/item.model';
import { Supplier } from '../../org/models/supplier.model';
import { Cuspo } from '../../org/models/customerpo.model';
import { Division } from '../../org/models/division.model';
import { Style } from '../../merchandising/models/style.model';
import { Salesorder } from '../../merchandising/models/salesorder.model';
import { Po_type } from '../../merchandising/models/po_type.model';
declare var $:any;

@Component({
  selector: 'app-po-details',
  templateUrl: './po-details.component.html',
  //styleUrls: ['./po-details.component.css']
})
export class PoDetailsComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()

  customer$: Observable<Customer[]>;//use to load style list in ng-select
  customerLoading = false;
  customerInput$ = new Subject<string>();

  style$: Observable<Style[]>;//use to load style list in ng-select
  styleLoading = false;
  styleInput$ = new Subject<string>();

  item$: Observable<Item[]>;//use to load style list in ng-select
  itemLoading = false;
  itemInput$ = new Subject<string>();

  supplier$: Observable<Supplier[]>;//use to load style list in ng-select
  supplierLoading = false;
  supplierInput$ = new Subject<string>();

  cuspo$: Observable<Cuspo[]>;//use to load style list in ng-select
  cuspoLoading = false;
  cuspoInput$ = new Subject<string>();

  salesorder$: Observable<Salesorder[]>;//use to load style list in ng-select
  salesorderLoading = false;
  salesorderInput$ = new Subject<string>();

  BomStage$: Observable<Array<any>>
  POStatus$: Observable<Array<any>>

  constructor(private fb:FormBuilder , private http:HttpClient ,
    private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title) { }

    ngOnInit() {

      this.titleService.setTitle("Purchase order details report")
      this.layoutChangerService.changeHeaderPath([
        'Reports',
        'Purchase Order',
        'Purchase Order Details Report'
      ])

      this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){return;}
        if(this.datatable != null){
          this.datatable.draw(false);
        }
      })

      this.loadCustomer()
      this.loadStyles()
      this.BomStage$ = this.getBomStage();
      this.POStatus$ = this.getStatus();
      this.loadItemDes()
      this.loadSuppliers()
      this.loadSalesOrder()
      this.loadCustomerPo()
      this.createTable()

      this.formGroup = this.fb.group({
        customer_name : null,
        style_name : null,
        bom_stage : null,
        item_name : null,
        pcd_date : null,
        supplier_name : null,
        cuspo_no : null,
        salesorder_id : null,
        po_status : null
      })

    }

    getBomStage(): Observable<Array<any>> {
      return this.http.get<any[]>(this.apiUrl + 'merchandising/bomstages?active=1&fields=bom_stage_id,bom_stage_description')
      .pipe(map(res => res['data']))
    }
    getStatus(): Observable<Array<any>> {
      return this.http.get<any[]>(this.apiUrl + 'reports/load_status?active=1&fields=status,CUSTOMER_ORDER')
      .pipe(map(res => res['data']))
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

    loadStyles() {
      this.style$ = this.styleInput$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.styleLoading = true),
        switchMap(term => this.http.get<Style[]>(this.apiUrl + 'merchandising/customer-orders?type=style' , {params:{search:term}})
        .pipe(
          tap(() => this.styleLoading = false)
        ))
      );
    }

    loadItemDes() {
      this.item$ = this.itemInput$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.itemLoading = true),
        switchMap(term => this.http.get<Item[]>(this.apiUrl + 'merchandising/items?type=auto' , {params:{search:term}})
        .pipe(
          tap(() => this.itemLoading = false)
        ))
      );
    }

    loadSuppliers() {
      this.supplier$ = this.supplierInput$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.supplierLoading = true),
        switchMap(term => this.http.get<Supplier[]>(this.apiUrl + 'org/suppliers?type=auto' , {params:{search:term}})
        .pipe(
          tap(() => this.supplierLoading = false)
        ))
      );
    }

    loadCustomerPo() {
      this.cuspo$ = this.cuspoInput$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.cuspoLoading = true),
        switchMap(term => this.http.get<Cuspo[]>(this.apiUrl + 'merchandising/customer-order-details?type=auto' , {params:{search:term}})
        .pipe(
          tap(() => this.cuspoLoading = false)
        ))
      );
    }

    loadSalesOrder() {
      this.salesorder$ = this.salesorderInput$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.salesorderLoading = true),
        switchMap(term => this.http.get<Salesorder[]>(this.apiUrl + 'merchandising/customer-orders?type=auto' , {params:{search:term}})
        .pipe(
          tap(() => this.salesorderLoading = false)
        ))
      );
    }

    reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
    }

    createTable(){
      $('#po_tbl').DataTable({
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
      var table = $('#po_tbl').DataTable();
      table
      .clear()
      .draw();
    }

    searchFrom() {
      $('#po_tbl').DataTable().destroy();
      let formData = this.formGroup.getRawValue()

      let pcd_from = "";
      let pcd_to = "";
      if(formData['pcd_date']!="" && formData['pcd_date']!=null){
        pcd_from = formData['pcd_date'][0].toLocaleString();
        pcd_to = formData['pcd_date'][1].toLocaleString();
      }

      $('#po_tbl tfoot th').each( function () {
        var title = $(this).text();
        $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
      });
      this.datatable = $('#po_tbl').DataTable({
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
        order: [[ 0, "desc" ]],
        ajax: {
          data: {
            data : this.formGroup.getRawValue(),
            pcd_from :pcd_from,
            pcd_to :pcd_to
          },
          dataType : 'JSON',
          "url": this.apiUrl + "reports/load_po?type=datatable",
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
          { className: "text-right", targets: [3] },
          { className: "text-left", targets: [4] },
          { className: "text-left", targets: [5] },
          { className: "text-left", targets: [6] },
          { className: "text-right", targets: [7] },
          { className: "text-left", targets: [8] },
          { className: "text-left", targets: [9] },
          { className: "text-left", targets: [10] },
          { className: "text-left", targets: [11] },
          { className: "text-left", targets: [12] },
          { className: "text-left", targets: [13] },
          { className: "text-left", targets: [14] },
          { className: "text-left", targets: [15] },
          { className: "text-right", targets: [16] },
          { className: "text-right", targets: [17] },
          { className: "text-right", targets: [18] },
          { className: "text-right", targets: [19] },
          { className: "text-left", targets: [20] },
          { className: "text-left", targets: [21] },
        ],
        columns: [
          {data: "fng_number"},
          {data: "style_no"},
          {data: "color_name"},
          {data: "bom_id"},
          {data: "customer_name"},
          {data: "po_no"},
          {data: "bom_stage_description"},
          {data: "order_code"},
          {data: "order_status"},
          {data: "origin_type"},
          {data: "sfg_code"},
          {data: "category_name"},
          {data: "mat_code"},
          {data: "size_name"},
          {data: "uom_code"},
          {data: "supplier_name"},
          {data: "purchase_price"},
          {data: "required_qty"},
          {data: "po_qty"},
          {
            data: {required_qty : "required_qty", po_qty : "po_qty"},
            render : function(data, type, full) {
              if(data.po_qty==null)
              return data.required_qty;
              else if(data.required_qty==null)
              return 0;
              else
              return (data.required_qty-data.po_qty).toFixed(4);
            }
          },
          {data: "rm_in_date"},
          {data: "loc_name"},
        ],
      });

      // this.datatable.columns().every( function () {
      //   var that = this;
      //   $( 'input', this.footer() ).on( 'keyup change clear', function () {
      //       if ( that.search() !== this.value ) {
      //           that
      //           .search( this.value )
      //           .draw();
      //       }
      //   });
      // });

    }

  }
