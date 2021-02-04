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
import * as moment from 'moment'

import { Supplier } from '../../org/models/supplier.model';

declare var $:any;

@Component({
  selector: 'app-yarn-count-detail-report',
  templateUrl: './yarn-count-detail-report.component.html',
})

export class YarnCountDetailReportComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  formValidatorHeader : AppFormValidator;
  appValidator : AppValidator;

  supplier$: Observable<Supplier[]>;
  supplierLoading = false;
  supplierInput$ = new Subject<string>();

  yearTotal: Array<Object>;

  formFields = {
    year : '',
    supplier : '',
    validation_error:''
  }

  constructor(private fb:FormBuilder , private http:HttpClient ,
    private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title) { }

    ngOnInit() {

      this.titleService.setTitle("Yarn Count Report")

      this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){return;}
        if(this.datatable != null){
          this.datatable.draw(false);
        }
      })

      this.loadSuppliers()
      this.loadYears()
      this.createTable()

      this.formGroup = this.fb.group({
        year: [null, [Validators.required]],
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
          'Sourcing',
          'Yarn Count Report'
        ]);
      }, 1);
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

    loadYears(){
      var max = moment().year()
      var min = max - 20,
      max = max + 1;

      var urls = [];
      for(var i=max; i>=min; i--){
        urls.push({
          "id":i ,
          "year_name":i
        });
      }
      this.yearTotal = urls;
    }

    reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
    }

    createTable(){
      $('#yarn_cou_det_tbl').DataTable({
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
      var table = $('#yarn_cou_det_tbl').DataTable();
      table
      .clear()
      .draw();
    }

    searchFrom() {
      $('#yarn_cou_det_tbl').DataTable().destroy();
      let formData = this.formGroup.getRawValue()

      $('#m_po_list_inv_tbl tfoot th').each( function () {
        var title = $(this).text();
        $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
      });

      this.datatable = $('#yarn_cou_det_tbl').DataTable({
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
            data : this.formGroup.getRawValue()
          },
          dataType : 'JSON',
          "url": this.apiUrl + "reports/load-yarn-count-detail",
          beforeSend : function() {
            AppAlert.showMessage('Processing...','Please wait while loading details')
          },
          complete: function () {
            AppAlert.closeAlert()
          },
        },
        columnDefs: [
        ],
        columns: [
          {data: "yarn_count"},
          {
            data: null,
            render : function(data, type, row) {
              if(row.month_1 != null && row.month_1 != undefined){
                return (row.month_1).toFixed(2);
              }else{
                return null;
              }
            }
          },
          {
            data: null,
            render : function(data, type, row) {
              if(row.month_2 != null && row.month_2 != undefined){
                return (row.month_2).toFixed(2);
              }else{
                return null;
              }
            }
          },
          {
            data: null,
            render : function(data, type, row) {
              if(row.month_3 != null && row.month_3 != undefined){
                return (row.month_3).toFixed(2);
              }else{
                return null;
              }
            }
          },
          {
            data: null,
            render : function(data, type, row) {
              if(row.month_4 != null && row.month_4 != undefined){
                return (row.month_4).toFixed(2);
              }else{
                return null;
              }
            }
          },
          {
            data: null,
            render : function(data, type, row) {
              if(row.month_5 != null && row.month_5 != undefined){
                return (row.month_5).toFixed(2);
              }else{
                return null;
              }
            }
          },
          {
            data: null,
            render : function(data, type, row) {
              if(row.month_6 != null && row.month_6 != undefined){
                return (row.month_6).toFixed(2);
              }else{
                return null;
              }
            }
          },
          {
            data: null,
            render : function(data, type, row) {
              if(row.month_7 != null && row.month_7 != undefined){
                return (row.month_7).toFixed(2);
              }else{
                return null;
              }
            }
          },
          {
            data: null,
            render : function(data, type, row) {
              if(row.month_8 != null && row.month_8 != undefined){
                return (row.month_8).toFixed(2);
              }else{
                return null;
              }
            }
          },
          {
            data: null,
            render : function(data, type, row) {
              if(row.month_9 != null && row.month_9 != undefined){
                return (row.month_9).toFixed(2);
              }else{
                return null;
              }
            }
          },
          {
            data: null,
            render : function(data, type, row) {
              if(row.month_10 != null && row.month_10 != undefined){
                return (row.month_10).toFixed(2);
              }else{
                return null;
              }
            }
          },
          {
            data: null,
            render : function(data, type, row) {
              if(row.month_11 != null && row.month_11 != undefined){
                return (row.month_11).toFixed(2);
              }else{
                return null;
              }
            }
          },
          {
            data: null,
            render : function(data, type, row) {
              if(row.month_12 != null && row.month_12 != undefined){
                return (row.month_12).toFixed(2);
              }else{
                return null;
              }
            }
          },
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
