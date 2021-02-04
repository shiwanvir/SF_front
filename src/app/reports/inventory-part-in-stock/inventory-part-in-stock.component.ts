import { Component, OnInit , ViewChild} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';
import { RedirectService } from '../redirect.service';

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
  selector: 'app-inventory-part-in-stock',
  templateUrl: './inventory-part-in-stock.component.html'
})

export class InventoryPartInStockComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl();

  location$: Observable<Location[]>;
  locationLoading = false;
  locationInput$ = new Subject<string>();

  constructor(private fb:FormBuilder, private http:HttpClient, private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title) { }

  ngOnInit() {

    this.titleService.setTitle("Inventory Part In Stock")
    this.layoutChangerService.changeHeaderPath([
      'Reports',
      'Stores',
      'Inventory Part In Stock '
    ])

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

    this.loadLocation();
    this.createTable();

    this.formGroup = this.fb.group({
      loc_name: null
    })

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

  createTable(){
    $('#inv_part_Stock_tbl').DataTable({
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
    this.formGroup.reset();
    var table = $('#inv_part_Stock_tbl').DataTable();
    table
    .clear()
    .draw();
  }

  searchFrom() {
    $('#inv_part_Stock_tbl').DataTable().destroy();
    let formData = this.formGroup.getRawValue();

    $('#inv_part_Stock_tbl tfoot th').each( function () {
      var title = $(this).text();
      $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
    });

    this.datatable = $('#inv_part_Stock_tbl').DataTable({
      autoWidth: true,
      scrollY: "500px",
      scrollX: true,
      scrollCollapse: true,
      processing: true,
      serverSide: false,
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
          data : this.formGroup.getRawValue()
        },
        dataType : 'JSON',
        "url": this.apiUrl + "reports/load_inv_part?type=datatable",
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
        { className: "text-right", targets: [6] },
        { className: "text-right", targets: [7] },
        { className: "text-left", targets: [8] },
        { className: "text-right", targets: [9] },
        { className: "text-left", targets: [10] },
        { className: "text-left", targets: [11] },
        { className: "text-left", targets: [12] },
        { className: "text-right", targets: [13] },
        { className: "text-right", targets: [14] },
        { className: "text-right", targets: [15] },
        { className: "text-right", targets: [16] }
      ],
      columns: [
        {data: "master_code"},
        {data: "master_description"},
        {data: "uom_code"},
        {data: "company_name"},
        {data: "loc_name"},
        {
          data: null,
          render : function(data, type, row) {
            return row.lot_no + '/' + row.batch_no;
          }
        },
        {data: "avble_stock"},
        {data: "asign_qty"},
        {data: "size_name"},
        {data: "shop_order_id"},
        {data: "substore_name"},
        {data: "store_bin_name"},
        {data: "grn_date"},
        {
          data: null,
          render : function(data, type, row) {
            return '$' + row.standard_price;
          }
        },
        {
          data: null,
          render : function(data, type, row) {
            return (row.avble_stock*row.standard_price).toFixed(2);

          }
        },
        {data: "division_description"},
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
