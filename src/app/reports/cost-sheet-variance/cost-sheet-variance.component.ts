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
  selector: 'app-cost-sheet-variance',
  templateUrl: './cost-sheet-variance.component.html',
  styleUrls: ['./cost-sheet-variance.component.css']
})

export class CostSheetVarianceComponent implements OnInit {

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

      this.titleService.setTitle("Cost Variation Report")
      this.layoutChangerService.changeHeaderPath([
        'Reports',
        'Costing',
        'Cost Variation Report'
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
          'excel'
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

      $('#cost_tbl tfoot th').not(":eq(0),:eq(1)").each( function () {
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
        order: [[ 3, "desc" ]],
        dom: 'Bfrtip',
        buttons: [
          'excel'
        ],
        columnDefs: [
          { className: "text-center", "targets": [0] },
          { className: "compare", "targets": [1] },
          { className: "text-right", targets: [2] },
          { className: "text-right", targets: [3] },
          { className: "text-left", targets: [4] },
          { className: "text-left", targets: [5] },
          { className: "text-left", targets: [6] },
          { className: "text-left", targets: [7] },
          { className: "text-left", targets: [8] },
          { className: "text-left", targets: [9] },
          { className: "text-right", targets: [10] },
          { className: "text-right", targets: [11] },
          { className: "text-left", targets: [12] },
          { className: "text-left", targets: [13] },
          { className: "text-left", targets: [14] },
          { className: "text-left", targets: [15] },
          { className: "text-left", targets: [16] }
        ],
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
        columns: [
          {
            data: "id",
            orderable: false,
            width: '3%',
            render : (data,arg,full) => {
              return '<i class="icon-printer2" style="cursor: pointer;" data-action="VIEW" data-id="'+data+'" sc="'+full['sc_no']+'"></i>';
            }
          },
          {
            data: {id : "id", revision_no : "revision_no"},
            orderable: true,
            width: '8%',
            render : function(data, type, full) {
              var version="<select id='sc_version"+data.id+"' class='select-menu' style='border:none; width:100%; height: 100%;'>";
              for(var x=0;x<=data.revision_no;x++)
              {
                if(data.revision_no>=0){
                  version+="<option value='"+x+"'>"+x+"</option>";
                }else{
                  version+="<option value=''></option>";
                }
              }
              version+="</select>"
              return version;
            }
          },
          {data: "id"},
          {data: "sc_no"},
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

      $('#cost_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if($("#sc_version"+att['data-id']['value']).val()==null){

        }else{
          let param = {ci:att['data-id']['value'],version:$("#sc_version"+att['data-id']['value']).val()};
          this.opentab.post(param,this.apiUrl + "reports/view-costing-variance");
        }
      });

    }


  }
