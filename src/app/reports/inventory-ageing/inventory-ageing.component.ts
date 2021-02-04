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
import { Factory } from '../../org/models/factory.model';
declare var $:any;

@Component({
  selector: 'app-inventory-ageing',
  templateUrl: './inventory-ageing.component.html',
  //styleUrls: ['./inventory-ageing.component.css']
})

export class InventoryAgeingComponent implements OnInit {

  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()

  factory$: Observable<Factory[]>
  loc_name_loading = false;
  loc_name_input$ = new Subject<string>();

  formFields = {
    loc_name : ""
  }

  constructor(private fb:FormBuilder , private http:HttpClient ,
    private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title) { }

    ngOnInit() {

      this.titleService.setTitle("Inventory ageing report")
      this.layoutChangerService.changeHeaderPath([
        'Reports',
        'Stores',
        'Inventory Ageing Report'
      ])

      this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){return;}
        if(this.datatable != null){
          this.datatable.draw(false);
        }
      })

      this.load_factory_list()
      this.createTable()

      this.formGroup = this.fb.group({
        loc_name : [null , [Validators.required]],
      })

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
      $('#inv_tbl').DataTable({
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
      var table = $('#inv_tbl').DataTable();
      table
      .clear()
      .draw();
    }

    searchFrom() {
      $('#inv_tbl').DataTable().destroy();
      let formData = this.formGroup.getRawValue()

      // $('#inv_tbl tfoot th').each( function () {
      //    var title = $(this).text();
      //    $(this).html( '<input type="text" class="form-control input-xxs" placeholder="'+title+'"/>' );
      // });

      this.datatable = $('#inv_tbl').DataTable({
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
          'copy', 'csv', 'excel', 'print',
          {
            extend: 'pdf',
            orientation: 'landscape',
            pageSize: 'A2'
          }
        ],
        footerCallback: function ( row, data, start, end, display ) {
          /*
          var api = this.api();
          var i;
          var data;

          //Remove the formatting to get integer data for summation
          var intVal = function (i) {
          return typeof i === 'string' ?
          +i.replace(/[\$,]/g, '')*1 :
          typeof i === 'number' ?
          i : 0;
        };

        var total = function(x) {
        return api
        .column(x)
        .data()
        .reduce( function (a, b) {
        ///console.log(a,b)
        return intVal(a) + intVal(b);
      }, 0 );
    };

    $(api.column(16).footer()).html(total(16).toFixed(4));
    $(api.column(17).footer()).html(total(17).toFixed(4));
    */
  },
  columnDefs: [
    { className: "text-left", targets: [0] },
    { className: "text-right", targets: [7] },
    { className: "text-right", targets: [8] },
    { className: "text-right", targets: [9] },
    { className: "text-right", targets: [10] },
    { className: "text-right", targets: [11] },
    { className: "text-right", targets: [12] },
    { className: "text-right", targets: [13] },
    { className: "text-right", targets: [14] },
    { className: "text-right", targets: [15] },
    { className: "text-right", targets: [16] },
    { className: "text-right", targets: [17] },
    { className: "text-right", targets: [18] },
  ],
  ajax: {
    data: {
      data : this.formGroup.getRawValue()
    },
    dataType : 'JSON',
    "url": this.apiUrl + "reports/inv-ageing?type=datatable",
    beforeSend : function() {
      AppAlert.showMessage('Processing...','Please wait while loading details')
    },
    complete: function () {
      AppAlert.closeAlert()
    },
  },
  columns: [
    {data: "loc_name"},
    {data: "store_name"},
    {data: "category_name"},
    {data: "subcategory_name"},
    {data: "master_description"},
    {data: "master_code"},
    {data: "uom_description"},
    {
      data: "zeroTOthirty",
      defaultContent: "",
      render : function(zeroTOthirty){
        return zeroTOthirty['total_qty'];
      }
    },
    {
      data: "zeroTOthirty",
      defaultContent: "",
      render : function(zeroTOthirty){
        return zeroTOthirty['total_value'];
      }
    },
    {
      data: "thirtyTOsixty",
      defaultContent: "",
      render : function(thirtyTOsixty){
        return thirtyTOsixty['total_qty'];
      }
    },
    {
      data: "thirtyTOsixty",
      defaultContent: "",
      render : function(thirtyTOsixty){
        return thirtyTOsixty['total_value'];
      }
    },
    {
      data: "sixtyTOninety",
      defaultContent: "",
      render : function(sixtyTOninety){
        return sixtyTOninety['total_qty'];
      }
    },
    {
      data: "sixtyTOninety",
      defaultContent: "",
      render : function(sixtyTOninety){
        return sixtyTOninety['total_value'];
      }
    },
    {
      data: "ninetyTOhuntwenty",
      defaultContent: "",
      render : function(ninetyTOhuntwenty){
        return ninetyTOhuntwenty['total_qty'];
      }
    },
    {
      data: "ninetyTOhuntwenty",
      defaultContent: "",
      render : function(ninetyTOhuntwenty){
        return ninetyTOhuntwenty['total_value'];
      }
    },
    {
      data: "huntwentyPlus",
      defaultContent: "",
      render : function(huntwentyPlus){
        return huntwentyPlus['total_qty'];
      }
    },
    {
      data: "huntwentyPlus",
      defaultContent: "",
      render : function(huntwentyPlus){
        return huntwentyPlus['total_value'];
      }
    },
    {data: "total_qty"},
    {data: "total_std_price"},
  ],
});

}




}
