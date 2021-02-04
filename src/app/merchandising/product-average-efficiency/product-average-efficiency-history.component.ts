import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../core/app-config';
import { AuthService } from '../../core/service/auth.service';
import { AppAlert } from '../../core/class/app-alert';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

declare var $:any;

@Component({
  selector: 'app-product-average-efficiency-history',
  templateUrl: './product-average-efficiency-history.component.html',
  styleUrls: []
})
export class ProductAverageEfficiencyHistoryComponent implements OnInit {

  datatable : any = null
  queryData = []
  readonly apiUrl:string = AppConfig.apiUrl()
  // searchingFieldsUrl = 'merchandising/customer-orders?type=search_fields';

  constructor(private auth : AuthService,private layoutChangerService : LayoutChangerService, private http:HttpClient) { }

  ngOnInit() {

    this.createTable()
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

  }

  ngOnDestroy(){
    this.datatable = null
  }

  createTable() { //initialize datatable
    this.datatable = $('#efficiency_his_tbl').DataTable({
      autoWidth: false,
      scrollY: "500px",
      scrollX: true,
      scrollCollapse: true,
      processing: true,
      serverSide: true,
      // order : [[ 0, 'desc' ]],
      // fixedColumns:   {
      //   leftColumns: 2
      // },
      ajax: {
        headers: {
          'Authorization':`Bearer ${this.auth.getToken()}`,
        },
        dataType : 'JSON',
        "url": this.apiUrl + "merchandising/pro_ave_efficiency_history?type=datatable",
        data : {
          'query_data' : () => {return JSON.stringify(this.queryData);}
        }
      },
      columnDefs: [
        { className: "text-left", targets: [0] },
        { className: "text-left", targets: [1] },
        { className: "text-right", targets: [2] },
        { className: "text-right", targets: [3] },
        { className: "text-right", targets: [4] },
        { className: "text-right", targets: [5] }
      ],
      columns: [
        { data: "prod_cat_description"},
        { data: "product_silhouette_description"},
        { data: "version"},
        { data: "qty_from"},
        { data: "qty_to"},
        { data: "efficiency"}
      ]
    });

  }

  reloadTable() {//reload datatable
    this.datatable.ajax.reload(null, false);
  }
}
