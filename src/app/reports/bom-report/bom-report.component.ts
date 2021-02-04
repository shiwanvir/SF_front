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

import { Item } from '../../org/models/item.model';
import { Style } from '../../merchandising/models/style.model';
import { CostingID } from '../models/costing.model';
declare var $:any;

@Component({
  selector: 'app-bom-report',
  templateUrl: './bom-report.component.html',
  //styleUrls: ['./bom-report.component.css']
})
export class BomReportComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()

  style$: Observable<Style[]>;//use to load style list in ng-select
  styleLoading = false;
  styleInput$ = new Subject<string>();

  fng$: Observable<any[]>;//use to load style list in ng-select
  fngLoading = false;
  fngInput$ = new Subject<string>();

  costing_id$: Observable<CostingID[]>
  costingLoading = false;
  costingInput$ = new Subject<string>();

  BomStage$: Observable<Array<any>>
  bomStatus$: Observable<Array<any>>

  constructor(private fb:FormBuilder , private http:HttpClient ,
    private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title,private opentab: RedirectService) { }

    ngOnInit() {

      this.titleService.setTitle("BOM Report")
      this.layoutChangerService.changeHeaderPath([
        'Reports',
        'BOM Report'
      ])

      this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){return;}
        if(this.datatable != null){
          this.datatable.draw(false);
        }
      })

      this.createTable()
      this.loadStyles()
      this.loadFNG()
      this.loadCostingID()
      this.BomStage$ = this.getBomStage();
      this.bomStatus$ = this.getStatus();

      this.formGroup = this.fb.group({
        style_name : null,
        bom_stage : null,
        bom_status : null,
        fng_code : null,
        costing_id : null,
      })

    }

    reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
    }

    createTable(){
      $('#bom_tbl').DataTable({
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
          // 'copy', 'csv', 'excel', 'pdf', 'print'
          {
            extend: 'excel',
            exportOptions: {
              columns: ':gt(0)'
            }
          },
        ],
      });
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

    loadFNG() {
      this.fng$ = this.fngInput$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.fngLoading = true),
        switchMap(term => this.http.get<any[]>(this.apiUrl + 'common/load_fng_code?type=fng-code' , {params:{search:term}})
        .pipe(
          tap(() => this.fngLoading = false)
        ))
      );
    }

    getBomStage(): Observable<Array<any>> {
      return this.http.get<any[]>(this.apiUrl + 'merchandising/bomstages?active=1&fields=bom_stage_id,bom_stage_description')
      .pipe(map(res => res['data']))
    }

    reset_feilds() {
      this.formGroup.reset()
      var table = $('#bom_tbl').DataTable();
      table
      .clear()
      .draw();
    }

    searchFrom() { //initialize datatable
      $('#bom_tbl').DataTable().destroy();

      $('#bom_tbl tfoot th').each( function () {
        var title = $(this).text();
        $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
      });

      this.datatable = $('#bom_tbl').DataTable({
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
          // 'copy', 'csv', 'excel', 'print','pdf'
          {
            extend: 'excel',
            exportOptions: {
              columns: ':gt(0)'
            }
          },
        ],
        order: [[ 1, "desc" ]],
        columnDefs: [
          { className: "text-center", targets: 0 }
        ],
        ajax: {
          data: {
            data : this.formGroup.getRawValue()
          },
          dataType : 'JSON',
          "url": this.apiUrl + "reports/load_bom_report?type=datatable",
          beforeSend : function() {
            AppAlert.showMessage('Processing...','Please wait while loading details')
          },
          complete: function () {
            AppAlert.closeAlert()
          },
        },
        columns: [
          {
            data: "bom_id",
            orderable: false,
            width: '1%',
            render : (data,arg,full) => {
              return '<i class="icon-printer2" style="cursor: pointer;" data-action="VIEW" data-id="'+data+'"></i>';
            }
          },
          { data: "bom_id" },
          { data: "costing_id" },
          { data: "status" },
          { data: "sc_no" },
          { data: "master_code" },
          { data: "style_no" },
          { data: "country_description" },
          { data: "bom_stage_description" },
          { data: "season_name" },
          { data: "color_option" },
          { data: "user_name" },
          { data: "created_date" },
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

      $('#bom_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'VIEW'){
          let param = {bom:att['data-id']['value']};
          this.opentab.post(param,this.apiUrl + "reports/view-bom");
        }
      });


    }





  }
