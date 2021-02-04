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

import { Customer } from '../../org/models/customer.model';
import { Item } from '../../org/models/item.model';
import { Supplier } from '../../org/models/supplier.model';
import { Cuspo } from '../../org/models/customerpo.model';
import { Division } from '../../org/models/division.model';
import { Style } from '../../merchandising/models/style.model';
import { Salesorder } from '../../merchandising/models/salesorder.model';
import { Po_type } from '../../merchandising/models/po_type.model';
import { Factory } from '../../org/models/factory.model';
import { CostingID } from '../models/costing.model';

declare var $:any;

@Component({
  selector: 'app-cost-sheet',
  templateUrl: './cost-sheet.component.html',
})

export class CostSheetComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()

  customer$: Observable<Customer[]>;//use to load style list in ng-select
  customerLoading = false;
  customerInput$ = new Subject<string>();

  style$: Observable<Style[]>;//use to load style list in ng-select
  styleLoading = false;
  styleInput$ = new Subject<string>();

  factory$: Observable<Factory[]>
  loc_name_loading = false;
  loc_name_input$ = new Subject<string>();

  costing_id$: Observable<CostingID[]>
  costingLoading = false;
  costingInput$ = new Subject<string>();

  CostingStatus$: Observable<Array<any>>

  constructor(private fb:FormBuilder , private http:HttpClient ,
    private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title,private opentab: RedirectService) { }

    ngOnInit() {

      this.titleService.setTitle("Costing Report")
      this.layoutChangerService.changeHeaderPath([
        'Reports',
        'Costing',
        'Costing Report'
      ])

      this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){return;}
        if(this.datatable != null){
          this.datatable.draw(false);
        }
      })

      this.loadCustomer()
      this.loadCostingID()
      this.loadStyles()
      this.CostingStatus$ = this.getStatus();
      this.load_factory_list()
      this.createTable()

      this.formGroup = this.fb.group({
        customer_name : null,
        style_name : null,
        date : null,
        loc_name : null,
        costing_status : null,
        costing_id : null,
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

    loadCostingID() {
      this.costing_id$ = this.costingInput$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.costingLoading = true),
        switchMap(term => this.http.get<CostingID[]>(this.apiUrl + 'common/load_costing_id?type=costing_id' , {params:{search:term}})
        .pipe(
          tap(() => this.costingLoading = false)
        ))
      );
    }

    getStatus(): Observable<Array<any>> {
      return this.http.get<any[]>(this.apiUrl + 'reports/load_status?active=1&fields=status,COSTING')
      .pipe(map(res => res['data']))
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

    load_factory_list() {
      this.factory$ = this.loc_name_input$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.loc_name_loading = true),
        switchMap(term => this.http.get<Factory[]>(this.apiUrl + 'org/locations?type=auto' , {params:{search:term}})
        .pipe(
          tap(() => this.loc_name_loading = false)
        ))
      );
    }

    reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
    }

    createTable(){
      $('#cost_tbl').DataTable({
        autoWidth: true,
        scrollY: "500px",
        scrollX: true,
        scrollCollapse: true,
        processing: true,
        serverSide: false,
        fixedColumns:   {
          leftColumns: 1,
          rightColumns: 0
        },
        dom: 'Bfrtip',
        buttons: [
          'copy', 'csv', 'excel', 'pdf', 'print'
        ],
      });
    }

    reset_feilds() {
      this.formGroup.reset()
      var table = $('#cost_tbl').DataTable();
      table
      .clear()
      .draw();
    }

    searchFrom() {
      $('#cost_tbl').DataTable().destroy();
      let formData = this.formGroup.getRawValue()

      let date_from = "";
      let date_to = "";
      if(formData['date']!="" && formData['date']!=null){
        date_from = formData['date'][0].toLocaleString();
        date_to = formData['date'][1].toLocaleString();
      }

      $('#cost_tbl tfoot th').each( function () {
        var title = $(this).text();
        $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
      });
      this.datatable = $('#cost_tbl').DataTable({
        autoWidth: true,
        scrollY: "500px",
        scrollX: true,
        scrollCollapse: true,
        processing: true,
        serverSide: false,
        fixedColumns:   {
          leftColumns: 2,
          rightColumns: 0
        },
        dom: 'Bfrtip',
        buttons: [
          // 'copy', 'csv', 'excel', 'print','pdf',
          {
            extend: 'copy',
            exportOptions: {
              columns: ':gt(0)'
            }
          },
          {
            extend: 'csv',
            exportOptions: {
              columns: ':gt(0)'
            }
          },
          {
            extend: 'excel',
            exportOptions: {
              columns: ':gt(0)'
            }
          },
          {
            extend: 'pdf',
            exportOptions: {
              columns: ':gt(0)'
            }
          },
          'print'
        ],
        order: [[ 1, "desc" ]],
        ajax: {
          data: {
            data : this.formGroup.getRawValue(),
            date_from :date_from,
            date_to :date_to
          },
          dataType : 'JSON',
          "url": this.apiUrl + "reports/costing/costing_details?type=datatable",
          beforeSend : function() {
            AppAlert.showMessage('Processing...','Please wait while loading details')
          },
          complete: function () {
            AppAlert.closeAlert()
          },
        },
        columnDefs: [
          { className: "text-right", targets: [1] },
          { className: "text-left", targets: [2] },
          { className: "text-left", targets: [3] },
          { className: "text-left", targets: [4] },
          { className: "text-left", targets: [5] },
          { className: "text-left", targets: [6] },
          { className: "text-left", targets: [7] },
          { className: "text-right", targets: [8] },
          { className: "text-right", targets: [9] },
          { className: "text-left", targets: [10] },
          { className: "text-left", targets: [11] },
          { className: "text-left", targets: [12] },
          { className: "text-left", targets: [13] },
          { className: "text-left", targets: [14] }
        ],
        columns: [
          {
            data: "id",
            orderable: false,
            width: '3%',
            render : (data,arg,full) => {
              return '<i class="icon-printer2" style="cursor: pointer;" data-action="VIEW" data-id="'+data+'" sc="'+full['sc_no']+'"></i>';
            }
          },
          {data: "id"},
          {data: "bom_stage_description"},
          {data: "season_name"},
          {data: "style_no"},
          {data: "created_date"},
          {data: "costing_status"},
          {data: "prod_cat_description"},
          {data: "total_order_qty"},
          {data: "total_smv"},
          {data: "customer_name"},
          {
            data: "app_by_date",
            render : function(data){
              if(data == null){
                return '';
              }
              else{
                return data.split("|")[0];
              }
            }
          },
          {
            data: "app_by_date",
            render : function(data){
              if(data == null){
                return '';
              }
              else{
                return data.split("|")[1];
              }
            }
          },
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

      ///////////////////////
      $('#cost_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'VIEW'){
          let param = {ci:att['data-id']['value']};
          this.opentab.post(param,this.apiUrl + "reports/view-costing");
        }
      });

    }





  }
