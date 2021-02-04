import { Component, OnInit , ViewChild} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { SnotifyService , SnotifyPosition } from 'ng-snotify';
import { RedirectService } from '../redirect.service';

import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { AppValidator } from '../../core/validation/app-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { AuthService } from '../../core/service/auth.service';

import { Customer } from '../../org/models/customer.model';
import { Location } from '../../org/models/location.model';
declare var $:any;

@Component({
  selector: 'app-issuing-status-report',
  templateUrl: './issuing-status-report.component.html',
})

export class IssuingStatusReportComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  formValidatorHeader : AppFormValidator;
  appValidator : AppValidator;

  customer$: Observable<Customer[]>;//use to load style list in ng-select
  customerLoading = false;
  customerInput$ = new Subject<string>();

  location$: Observable<Location[]>;
  locationLoading = false;
  locationInput$ = new Subject<string>();

  formFields = {
    delivery_date : '',
    customer : '',
    location_name : '',
    validation_error:''
  }

  constructor(private fb:FormBuilder , private http:HttpClient ,
    private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title,private opentab: RedirectService) { }

    ngOnInit() {

      this.titleService.setTitle("Issuing Status Report")

      this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){return;}
        if(this.datatable != null){
          this.datatable.draw(false);
        }
      })

      this.loadCustomer()
      this.loadLocation()
      this.createTable()

      this.formGroup = this.fb.group({
        delivery_date : [null, [Validators.required]],
        customer : null,
        location_name : null
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
          'Stores',
          'Issuing Status Report'
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

    reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
    }

    createTable(){
      $('#issuing_status_tbl').DataTable({
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
      var table = $('#issuing_status_tbl').DataTable();
      table
      .clear()
      .draw();
    }

    searchFrom() {
      $('#issuing_status_tbl').DataTable().destroy();
      let formData = this.formGroup.getRawValue()

      let date_from = "";
      let date_to = "";
      if(formData['delivery_date'] != null){
        let from = formData['delivery_date'][0];
        date_from = new Date(from.getTime() - (from.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];

        let to = formData['delivery_date'][1];
        date_to = new Date(to.getTime() - (to.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
      }

      $('#issuing_status_tbl tfoot th').each( function () {
        var title = $(this).text();
        $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
      });

      this.datatable = $('#issuing_status_tbl').DataTable({
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
          "url": this.apiUrl + "reports/load-issuing-status",
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
          { className: "text-right", targets: [9] },
          { className: "text-right", targets: [10] },
          { className: "text-right", targets: [11] },
          { className: "text-left", targets: [12] }
        ],
        columns: [
          {data: "po_no"},
          {data: "ship_qty"},
          {data: "po_number"},
          {data: "supplier_name"},
          {data: "rm_in_date"},
          {data: "grn_date"},
          {data: "planned_delivery_date"},
          {data: "customer_name"},
          {data: "master_code"},
          {data: "po_qty"},
          {data: "grn_qty"},
          {data: "qty"},
          {data: "issue_status"}
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
