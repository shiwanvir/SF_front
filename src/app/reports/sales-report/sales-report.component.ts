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
declare var $:any;

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html'
})
export class SalesReportComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()

  customer$: Observable<Customer[]>;//use to load style list in ng-select
  customerLoading = false;
  customerInput$ = new Subject<string>();
  getSize: any;
  getData:any;
  getTotal:Observable<Array<any>>;
  getSizeQ:Observable<Array<any>>;

  POStatus$: Observable<Array<any>>

  constructor(private fb:FormBuilder, private http:HttpClient, private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title) { }

  ngOnInit() {

    this.titleService.setTitle("OSR & Sales report")
    this.layoutChangerService.changeHeaderPath([
      'Reports',
      'OSR & Sales Report'
    ])

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      debugger
      if(data == false){return;}
      if(this.datatable != null){
       this.datatable.draw(false);
      }
    })

    this.loadCustomer();
    this.POStatus$ = this.getStatus();
   //

    this.formGroup = this.fb.group({
      customer_name : null,
      pcd_date: null,
      po_status:null
    })
   this.createTable();
  }

  getStatus(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'reports/load_status?active=1&fields=status,CUSTOMER_ORDER')
    .pipe(map(res => res['data']))
  }

  createTable(){
  //  debugger
    $('#sales_tbl').DataTable({
      autoWidth: false,
      scrollY : "1000px",
      scrollX: true,
      //sScrollXInner: "100%",
      scrollCollapse: true,
      processing: true,
      serverSide: false,
      paging:true,
      searching:true,
      order : [[ 0, 'desc' ]],
      dom: 'Bfrtip',
      buttons: [
        'excel'
      ],
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

  //reload datatable
  reloadTable() {
    this.datatable.ajax.reload(null, false);
  }

  reset_feilds() {
    // this.formGroup.reset()
    window.location.reload();
  }

  searchFrom() {
    // $('#sales_tbl').DataTable().destroy();
    let formData = this.formGroup.getRawValue();
    this.createTable()
    let pcd_from = "";
    let pcd_to = "";
    if(formData['pcd_date'] != null){
      let from = formData['pcd_date'][0];
      pcd_from = new Date(from.getTime() - (from.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];

      let to = formData['pcd_date'][1];
      pcd_to = new Date(to.getTime() - (to.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
    }

    let customer = "";
    if(formData['customer_name'] != null){
      customer = formData['customer_name']['customer_id'];
    }

    let status = "";
    if(formData['po_status'] != null){
      status = formData['po_status']['status'];
    }

    if(formData['pcd_date'] == null && formData['customer_name'] == null && formData['po_status'] == null){
      AppAlert.showError({text : 'Please Select Any Search Field!'});
    }else{
      //debugger
      this.http.get<any[]>(this.apiUrl + 'reports/load_sales?type=datatable' , {params:{from:pcd_from,to:pcd_to,customer:customer,status:status}})
      .subscribe(res => {
        this.getSizeQ = res['sizes'];
        this.getData = res['data'];
        // this.getTotal = res['total'];
      });

      $('#sales_tbl tfoot th').each( function () {
        var title = $(this).text();
        $(this).html( '<input type="text" class="form-control input-xxs" placeholder=" '+ title + '"/>' );
      });


        this.datatable = $('#sales_tbl').DataTable({
          autoWidth: false,
          scrollY : "500px",
          scrollX: true,
          sScrollXInner: "100%",
          scrollCollapse: true,
          //processing: true,
          serverSide: true,
          paging:true,
          searching:true,
          order : [[ 0, 'desc' ]],
          dom: 'Bfrtip',
          // buttons: [
          //   'copy', 'csv', 'excel', 'pdf', 'print'
          // ],
          buttons: [
            'excel'
            // {
            //   extend: 'pdf',
            //   orientation: 'landscape',
            //   pageSize: 'A1'
            // }
          ]
        });

      this.datatable.columns().every( function () {
        debugger
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

}
