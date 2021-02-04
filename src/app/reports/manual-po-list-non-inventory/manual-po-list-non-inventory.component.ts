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
import { AppValidator } from '../../core/validation/app-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { AuthService } from '../../core/service/auth.service';

import { Department } from '../../org/models/department.model';
//import { CostCenter } from '../models/cost-center.model';
import { Supplier } from '../../org/models/supplier.model';

declare var $:any;

@Component({
  selector: 'app-manual-po-list-non-inventory',
  templateUrl: './manual-po-list-non-inventory.component.html',
})

export class ManualPOListNonInventoryComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  formValidatorHeader : AppFormValidator;
  appValidator : AppValidator;

  cost_center$: Observable<any[]>;
  costCenterLoading = false;
  costCenterInput$ = new Subject<string>();

  department$: Observable<Department[]>;
  departmentLoading = false;
  departmentInput$ = new Subject<string>();

  supplier$: Observable<Supplier[]>;
  supplierLoading = false;
  supplierInput$ = new Subject<string>();

  formFields = {
    po_date : '',
    cost_center : '',
    department : '',
    supplier : '',
    validation_error:''
  }

  constructor(private fb:FormBuilder , private http:HttpClient ,
    private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title) { }

    ngOnInit() {

      this.titleService.setTitle("Manual Purchase Order List - Non Inventory")

      this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){return;}
        if(this.datatable != null){
          this.datatable.draw(false);
        }
      })

      this.loadCostCenter()
      this.loadDepartments()
      this.loadSuppliers()
      this.createTable()

      this.formGroup = this.fb.group({
        po_date : [null, [Validators.required]],
        cost_center : null,
        department : null,
        supplier : null
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
          'Manual Purchase Order',
          'Manual Purchase Order List - Non Inventory'
        ]);
      }, 1);
    }

    loadCostCenter() {
      this.cost_center$ = this.costCenterInput$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.costCenterLoading = true),
        switchMap(term => this.http.get<any[]>(this.apiUrl + 'finance/accounting/cost-centers?type=auto' , {params:{search:term}})
        .pipe(
          tap(() => this.costCenterLoading = false)
        ))
      );
    }

    loadDepartments(){
      this.department$ = this.departmentInput$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.departmentLoading = true),
        switchMap(term => this.http.get<Department[]>(this.apiUrl + 'org/departments?type=auto' , {params:{search:term}})
        .pipe(
          tap(() => this.departmentLoading = false)
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

    reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
    }

    createTable(){
      $('#m_po_list_non_inv_tbl').DataTable({
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
      var table = $('#m_po_list_non_inv_tbl').DataTable();
      table
      .clear()
      .draw();
    }

    searchFrom() {
      $('#m_po_list_non_inv_tbl').DataTable().destroy();
      let formData = this.formGroup.getRawValue()

      let date_from = "";
      let date_to = "";
      if(formData['po_date'] != null){
        let from = formData['po_date'][0];
        date_from = new Date(from.getTime() - (from.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];

        let to = formData['po_date'][1];
        date_to = new Date(to.getTime() - (to.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
      }

      $('#m_po_list_non_inv_tbl tfoot th').each( function () {
        var title = $(this).text();
        $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
      });

      this.datatable = $('#m_po_list_non_inv_tbl').DataTable({
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
          "url": this.apiUrl + "reports/load-m-po-non-inv-list",
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
          { className: "text-left", targets: [7] },
          { className: "text-right", targets: [8] },
          { className: "text-right", targets: [9] },
          { className: "text-left", targets: [10] },
          { className: "text-left", targets: [11] },
          { className: "text-left", targets: [12] }
        ],
        columns: [
          {data: "company_name"},
          {data: "description"},
          {data: "purchase_uom_code"},
          {data: "purchase_price"},
          {data: "supplier_name"},
          {data: "po_no"},
          {data: "created_date"},
          {data: "po_status"},
          {data: "qty"},
          {data: "grn_qty"},
          {data: "first_name"},
          {data: "dep_name"},
          {data: "cost_center_name"}
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
