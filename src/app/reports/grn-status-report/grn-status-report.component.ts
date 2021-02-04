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
import { AppValidator } from '../../core/validation/app-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { AuthService } from '../../core/service/auth.service';

import { Customer } from '../../org/models/customer.model';
import { Sup_po } from '../../merchandising/models/Sup_po.model';

declare var $:any;

@Component({
  selector: 'app-grn-status-report',
  templateUrl: './grn-status-report.component.html',
})

export class GRNStatusReportComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  formValidatorHeader : AppFormValidator;
  appValidator : AppValidator;

  customer$: Observable<Customer[]>;//use to load style list in ng-select
  customerLoading = false;
  customerInput$ = new Subject<string>();

  po_no$: Observable<Sup_po[]>;
  poNoLoading = false;
  poNoInput$ = new Subject<string>();

  formFields = {
    delivery_date : '',
    customer : '',
    po_no : '',
    validation_error:''
  }

  constructor(private fb:FormBuilder , private http:HttpClient ,
    private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title,private opentab: RedirectService) { }

    ngOnInit() {

      this.titleService.setTitle("GRN Status Report")
      this.layoutChangerService.changeHeaderPath([
        'Reports',
        'Stores',
        'GRN Status Report'
      ])

      this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){return;}
        if(this.datatable != null){
          this.datatable.draw(false);
        }
      })

      this.loadCustomer()
      this.loadPOno()
      this.createTable()

      this.formGroup = this.fb.group({
        delivery_date : [null, [Validators.required]],
        customer : null,
        po_no : null
      })
      this.formValidatorHeader = new AppFormValidator(this.formGroup , {})

      //create new validation object
      this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

      this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
        this.appValidator.validate();
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

    loadPOno() {
      this.po_no$ = this.poNoInput$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.poNoLoading = true),
        switchMap(term => this.http.get<Sup_po[]>(this.apiUrl + 'reports/load_po?type=auto' , {params:{search:term}})
        .pipe(
          tap(() => this.poNoLoading = false)
        ))
      );
    }

    reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
    }

    createTable(){
      $('#grn_status_tbl').DataTable({
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
      var table = $('#grn_status_tbl').DataTable();
      table
      .clear()
      .draw();
    }

    searchFrom() {
      $('#grn_status_tbl').DataTable().destroy();
      let formData = this.formGroup.getRawValue()

      let date_from = "";
      let date_to = "";
      if(formData['delivery_date'] != null){
        let from = formData['delivery_date'][0];
        date_from = new Date(from.getTime() - (from.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];

        let to = formData['delivery_date'][1];
        date_to = new Date(to.getTime() - (to.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
      }

      $('#grn_status_tbl tfoot th').each( function () {
        var title = $(this).text();
        $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
      });
      this.datatable = $('#grn_status_tbl').DataTable({
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
          "url": this.apiUrl + "reports/load-grn-status",
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
          { className: "text-left", targets: [5] },
          { className: "text-left", targets: [6] },
          { className: "text-left", targets: [7] },
          { className: "text-left", targets: [8] },
          { className: "text-left", targets: [9] },
          { className: "text-right", targets: [10] },
          { className: "text-right", targets: [11] },
          { className: "text-right", targets: [12] },
          { className: "text-left", targets: [13] },
          { className: "text-right", targets: [14] }
        ],
        columns: [
          {data: "po_no"},
          {data: "ship_qty"},
          {data: "po_number"},
          {data: "supplier_name"},
          {data: "rm_in_date"},
          {data: "grn_date"},
          {data: "pcd_date"},
          {data: "planned_delivery_date"},
          {data: "customer_name"},
          {data: "master_code"},
          {data: "po_qty"},
          {data: "grn_qty"},
          {data: "issue_qty"},
          {data: "arrival_status"},
          {data: "maximum_tolarance"}
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
