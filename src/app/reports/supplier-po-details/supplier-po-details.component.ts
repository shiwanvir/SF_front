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

import { Cuspo } from '../../org/models/customerpo.model';
import { Division } from '../../org/models/division.model';
import { User } from '../../admin/models/user.model';
import { Supplier } from '../../org/models/supplier.model';
import { Sup_po } from '../../merchandising/models/Sup_po.model';

declare var $:any;

@Component({
  selector: 'app-supplier-po-details',
  templateUrl: './supplier-po-details.component.html'
})

export class SupplierPODetailsComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl();

  datePickerConfig: Partial<BsDatepickerConfig>;
  today : Date;

  po_no$: Observable<Sup_po[]>;
  poNoLoading = false;
  poNoInput$ = new Subject<string>();

  constructor(private fb:FormBuilder, private http:HttpClient, private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title,private opentab: RedirectService) {
    this.today = new Date();
  }

  ngOnInit() {

    this.titleService.setTitle("PO details report")

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

    this.loadPOno();
    this.createTable();

    this.formGroup = this.fb.group({
      po_no: null
    })

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.layoutChangerService.changeHeaderPath([
        'Reports',
        'Purchase Order',
        'PO Details Report'
      ]);
    }, 1);
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

  createTable(){
    $('#po_det_tbl').DataTable({
      autoWidth: true,
      scrollY: "500px",
      // scrollX: true,
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
    this.formGroup.reset();
    var table = $('#po_det_tbl').DataTable();
    table
    .clear()
    .draw();
  }

  searchFrom() {

    $('#po_det_tbl').DataTable().destroy();
    let formData = this.formGroup.getRawValue();

    $('#po_det_tbl tfoot th').each( function () {
      var title = $(this).text();
      $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
    });

    this.datatable = $('#po_det_tbl').DataTable({
      autoWidth: true,
      scrollY: "500px",
      // scrollX: true,
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
        "url": this.apiUrl + "reports/load_po_details?type=datatable",
        beforeSend : function() {
          AppAlert.showMessage('Processing...','Please wait while loading details')
        },
        complete: function () {
          AppAlert.closeAlert()
        },
      },
      columns: [
        {
          data:{
            po_id: "po_id"
          },
          orderable: false,
          width: '3%',
          render : (data,arg,full) => {
            // return '<i class="icon-printer2" style="cursor: pointer;" data-action="VIEW" data-id="'+data.po_id+'""></i>';
            var po_url = AppConfig.POReport()+"?po_no="+full.po_number;
            return '<a href="'+po_url+'" target="_blank" class="icon-printer" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="PRINT" data-id="'+data.po_id+'"></a>';
          }
        },
        {data: "po_number"},
        {data: "first_name"}
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

    $('#po_det_tbl').on('click','i',e => {
      let att = e.target.attributes;
      if(att['data-action']['value'] === 'VIEW'){
        let param = {ci:att['data-id']['value']};
        this.opentab.post(param,this.apiUrl + "reports/view-po-details");
      }
    });

  }

}
