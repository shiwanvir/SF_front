import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../core/app-config';
import { ManualPoService } from './manual-po.service';
import { AuthService } from '../../core/service/auth.service';
import { AppAlert } from '../../core/class/app-alert';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

declare var $:any;

@Component({
  selector: 'app-inventory-part-po-list',
  templateUrl: './inventory-part-po-list.component.html',
  styleUrls: []
})
export class InventoryPartListPoComponent implements OnInit {

  datatable : any = null
  queryData = []
  readonly apiUrl:string = AppConfig.apiUrl()
  // searchingFieldsUrl = 'merchandising/customer-orders?type=search_fields';

  constructor(private manualPoService : ManualPoService,private auth : AuthService,private layoutChangerService : LayoutChangerService, private http:HttpClient) { }

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
    this.datatable = $('#inventory_po_list').DataTable({
      autoWidth: false,
      scrollY: "500px",
      scrollX: true,
      scrollCollapse: true,
      processing: true,
      serverSide: true,
      order : [[ 0, 'desc' ]],
      // fixedColumns:   {
      //   leftColumns: 2
      // },
      ajax: {
        headers: {
          'Authorization':`Bearer ${this.auth.getToken()}`,
        },
        dataType : 'JSON',
        "url": this.apiUrl + "merchandising/po_manual_header?type=datatable",
        data : {
          'query_data' : () => {return JSON.stringify(this.queryData);}
        }
      },
      columns: [
        {
          data: "po_id",
          width: '2%',
          render : function(data,arg,full){
            var po_url = AppConfig.ManualPOReport()+"?po_no="+full['po_number'];
            var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px;" data-action="EDIT" data-id="'+data+'" data-status="'+ full.po_status +'"></i>';
            str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;" data-action="DELETE" data-id="'+data+'"></i>';
            str += ' <a href="'+po_url+'" target="_blank" class="icon-printer" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="PRINT" data-id="'+data+'"></a>'

            if( full.po_status == 'CANCELLED' ) {

                str = '<i class="icon-eye" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'" data-status="'+ full.po_status +'"></i>';

            }
            return str;
          }
        },
        {
          data: "po_status",
          render : function(data , arg , full){

            if(data == 'PLANNED')
              return '<span class="label label-warning">PLANNED</span>';
            else if(data == 'PENDING')
              return '<span class="label label-danger">PENDING</span>';
            else if(data == 'CONFIRMED')
              return '<span class="label label-success">CONFIRMED</span>';
            else if(data == 'CANCELLED')
                return '<span class="label label-default">CANCELLED</span>';

          }
        },
        { data: "po_number" },
        { data: "po_type" },
        { data: "supplier_name" },
        { data: "del_date" },
        { data: "loc_name" }
      ],
      columnDefs: [{
        orderable: false,
        width: '100px',
        targets: [ 0 ]
      }],

    });

    //listen to the click event of edit and delete buttons
    $('#inventory_po_list').on('click','i',e => {
      let att = e.target.attributes;
      if(att['data-action']['value'] === 'EDIT'){
        let confm = att['data-status']['value'];
        this.edit(att['data-id']['value'],confm);
      }
      else if(att['data-action']['value'] === 'DELETE'){
        this.delete(att['data-id']['value']);
      }
    });

  }

  edit(data,confm){
    this.manualPoService.changeData(data,confm)
  }

  delete(data) {

    AppAlert.showConfirm({
      'text' : 'Do you want to cancel selected Manual Purchase Order ?'
    },
    (result) => {
      if (result.value) {
        this.http.post(this.apiUrl + 'merchandising/po_manual_header/cancel_po' , { 'grn_id' : data } )
        .pipe( map( res => res['data']) )
        .subscribe(
          data =>
          {
            if(data.status == 'success'){
              this.reloadTable()
              AppAlert.showSuccess({ text : data.message });
            }
            else{
              AppAlert.showError({ text : data.message });
            }
          },
          error => {
            setTimeout(() => {
              AppAlert.closeAlert()
              AppAlert.showError({ text : 'Process Error' });
            } , 1000)

          }
        )
      }
    })

  }

  reloadTable() {//reload datatable
    this.datatable.ajax.reload(null, false);
  }
}
