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
import { RedirectService } from '../redirect.service';

import { Mrn } from '../mrn.model';
import { Customer } from '../../org/models/customer.model';
import { Factory } from '../../org/models/factory.model';
import { Style } from '../../merchandising/models/style.model';
import { Issue } from '../../stores/models/issue.model';
declare var $:any;

@Component({
  selector: 'app-pick-list',
  templateUrl: './pick-list.component.html',
  //styleUrls: ['./pick-list.component.css']
})

export class PickListComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()

  style$: Observable<Style[]>;//use to load style list in ng-select
  styleLoading = false;
  styleInput$ = new Subject<string>();

  factory$: Observable<Factory[]>
  loc_name_loading = false;
  loc_name_input$ = new Subject<string>();

  customer$: Observable<Customer[]>;
  customerLoading = false;
  customerInput$ = new Subject<string>();

  mrn$: Observable<Mrn[]>;
  mrnLoading = false;
  mrnInput$ = new Subject<string>();

  issue$: Observable<Issue[]>;
  issueLoading = false;
  issueInput$ = new Subject<string>();

  categoryList$: Observable<Array<any>>

  constructor(private fb:FormBuilder , private http:HttpClient ,
    private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title, private opentab: RedirectService) { }

    ngOnInit() {

      this.titleService.setTitle("Pick list")
      this.layoutChangerService.changeHeaderPath([
        'Reports',
        'Stores',
        'Pick List'
      ])

      this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){return;}
        if(this.datatable != null){
          this.datatable.draw(false);
        }
      })

      this.loadCustomer()
      this.loadStyles()
      this.loadCategories()
      this.load_factory_list()
      this.load_mrn_list()
      this.load_issue_list()
      this.createTable()

      this.formGroup = this.fb.group({
        customer_name : null,
        style_name : null,
        loc_name : null,
        date : null,
        mrn_no : null,
        issue_no : null,
        category : null,
      })

    }

    loadCategories(){
      this.categoryList$ =  this.http.get<any[]>(this.apiUrl + 'merchandising/item-categories')
      .pipe(map(res => res['data']))
    }

    load_mrn_list() {
      this.mrn$ = this.mrnInput$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.mrnLoading = true),
        switchMap(term => this.http.get<Mrn[]>(this.apiUrl + 'store/mrn?type=auto' , {params:{search:term}})
        .pipe(
          tap(() => this.mrnLoading = false)
        ))
      );
    }

    load_issue_list() {
      this.issue$ = this.issueInput$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.issueLoading = true),
        switchMap(term => this.http.get<Issue[]>(this.apiUrl + 'store/issue?type=auto' , {params:{search:term}})
        .pipe(
          tap(() => this.issueLoading = false)
        ))
      );
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
      $('#mrn_tbl').DataTable({
        autoWidth: true,
        scrollY: "500px",
        scrollX: true,
        scrollCollapse: true,
        processing: true,
        serverSide: false,
        fixedColumns:   {
          leftColumns: 0,
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
      var table = $('#mrn_tbl').DataTable();
      table
      .clear()
      .draw();
    }

    searchFrom() {
      $('#mrn_tbl').DataTable().destroy();
      let formData = this.formGroup.getRawValue()

      let date_from = "";
      let date_to = "";
      if(formData['date']!="" && formData['date']!=null){
        date_from = formData['date'][0].toLocaleString();
        date_to = formData['date'][1].toLocaleString();
      }

      $('#mrn_tbl tfoot th').each( function () {
        var title = $(this).text();
        $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
      });
      this.datatable = $('#mrn_tbl').DataTable({
        autoWidth: false,
        scrollY: "500px",
        scrollX: true,
        scrollCollapse: true,
        processing: true,
        serverSide: false,
        fixedColumns:   {
          leftColumns: 3,
          rightColumns: 0
        },
        order: [[ 1, "desc" ]],
        columnDefs: [
          { className: "text-center", targets: [0] },
          { className: "text-right", targets: [1] },
          { className: "text-right", targets: [2] },
          { className: "text-left", targets: [3] },
          { className: "text-left", targets: [4] },
          { className: "text-right", targets: [5] },
          { className: "text-left", targets: [6] },
          { className: "text-left", targets: [7] },
          { className: "text-left", targets: [8] }
        ],
        dom: 'Bfrtip',
        buttons: [
          'excel'
        ],
        ajax: {
          data: {
            data : this.formGroup.getRawValue(),
            date_from :date_from,
            date_to :date_to
          },
          dataType : 'JSON',
          "url": this.apiUrl + "reports/load_pick_list?type=datatable",
          beforeSend : function() {
            AppAlert.showMessage('Processing...','Please wait while loading details')
          },
          complete: function () {
            AppAlert.closeAlert()
          },
        },
        // columnDefs: [
        //    { className: "text-right", targets: [3] },
        // ],
        columns: [
          {
            data: "mrn_id",
            orderable: false,
            width: '3%',
            render : (data,arg,full) => {
              return '<i class="icon-printer2" style="cursor: pointer;" data-action="VIEW" data-id="'+data+'" data-issue="'+full['issue_no']+'"></i>';
            }
          },
          {data: "mrn_no"},
          {data: "issue_no"},
          {data: "customer_name"},
          {data: "style_no"},
          {data: "cut_qty"},
          {data: "loc_name"},
          {data: "user_name"},
          {data: "created_date"},
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

      // Onclick event
      $('#mrn_tbl').on('click','i',e => {
        var duplicate=0;
        var category = 0;
        let formData = this.formGroup.getRawValue();
        if(formData['category']!=null){
          category = formData['category']['category_id'];
        }
        AppAlert.showMessage('Processing...','Please wait while loading details')
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'VIEW'){
          let param = {mrn:att['data-id']['value'], issue:att['data-issue']['value'], category:category, print_status:duplicate };
          this.opentab.post(param,this.apiUrl + "reports/view-pick_list");
        }
        this.http.post(this.apiUrl + 'reports/update-issue-status',{ 'mrn':att['data-id']['value'], 'issue':att['data-issue']['value'] }).subscribe(data => {
          if(data['print_status']==true){
            duplicate=1;
          }
          AppAlert.closeAlert()
          return false;
        })
      });


    }







  }
