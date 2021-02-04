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
import { Sup_po } from '../../merchandising/models/Sup_po.model';
declare var $:any;

@Component({
  selector: 'app-po-header',
  templateUrl: './po-header.component.html',
  //styleUrls: ['./po-header.component.css']
})

export class PoHeaderComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()

  supplier$: Observable<Supplier[]>;//use to load style list in ng-select
  supplierLoading = false;
  supplierInput$ = new Subject<string>();

  po_no$: Observable<Sup_po[]>;//use to load style list in ng-select
  POLoading = false;
  POInput$ = new Subject<string>();

  POStatus$: Observable<Array<any>>

  constructor(private fb:FormBuilder , private http:HttpClient ,
    private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title) { }

    ngOnInit() {

      this.titleService.setTitle("Purchase order summary report")
      this.layoutChangerService.changeHeaderPath([
        'Reports',
        'Purchase Order',
        'Purchase Order Summary Report'
      ])

      this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){return;}
        if(this.datatable != null){
          this.datatable.draw(false);
        }
      })

      this.loadSuppliers()
      this.POStatus$ = this.getStatus();
      this.loadPONumbers()
      this.createTable()

      this.formGroup = this.fb.group({
        po_date : null,
        supplier_name : null,
        po_status : null,
        po_no : null
      })

    }

    getStatus(): Observable<Array<any>> {
      return this.http.get<any[]>(this.apiUrl + 'reports/load_status?active=1&fields=status,CUSTOMER_ORDER')
      .pipe(map(res => res['data']))
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

    loadPONumbers() {
      this.po_no$ = this.POInput$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.POLoading = true),
        switchMap(term => this.http.get<Sup_po[]>(this.apiUrl + 'reports/load_po?type=auto' , {params:{search:term}})
        .pipe(
          tap(() => this.POLoading = false)
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

      let po_from = "";
      let po_to = "";
      if(formData['po_date']!="" && formData['po_date']!=null){
        po_from = formData['po_date'][0].toLocaleString();
        po_to = formData['po_date'][1].toLocaleString();
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
        order: [[ 0, "desc" ]],
        dom: 'Bfrtip',
        buttons: [
          'excel'
        ],
        ajax: {
          data: {
            data : this.formGroup.getRawValue(),
            po_from :po_from,
            po_to :po_to
          },
          dataType : 'JSON',
          "url": this.apiUrl + "reports/load_po?type=header",
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
          { className: "text-right", targets: [5] },
          { className: "text-left", targets: [6] },
          { className: "text-left", targets: [7] }
        ],
        columns: [
          {data: "po_number"},
          {data: "supplier_name"},
          {data: "PurOrder_date"},
          {data: "del_date"},
          {data: "po_status"},
          {data: "total_amount"},
          {data: "user_name"},
          {data: "loc_name"}
        ],
      });

      // this.datatable.columns().every( function () {
      //   var that = this;
      //   $( 'input', this.footer() ).on( 'keyup change clear', function () {
      //     if ( that.search() !== this.value ) {
      //       that
      //       .search( this.value )
      //       .draw();
      //     }
      //   });
      // });

    }




  }
