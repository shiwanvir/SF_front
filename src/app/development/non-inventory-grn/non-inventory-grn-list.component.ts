import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../core/app-config';
import { AuthService } from '../../core/service/auth.service';
import { AppAlert } from '../../core/class/app-alert';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import{ NonInvGrnService} from'./non-inv-grn-services.service';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

declare var $:any;

@Component({
  selector: 'app-non-inventory-grn-list',
  templateUrl: './non-inventory-grn-list.component.html',
  styleUrls: []
})
export class NonInventoryGrnListComponent implements OnInit {

  datatable : any = null
  queryData = []
  readonly apiUrl:string = AppConfig.apiUrl()

  constructor(private auth : AuthService,private layoutChangerService : LayoutChangerService ,private grnService: NonInvGrnService, private http:HttpClient) { }

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
    this.datatable = $('#non_inv_grn_list').DataTable({
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
        "url": this.apiUrl + "stores/non_inventory_grn_header?type=datatable",
        data : {
          'query_data' : () => {return JSON.stringify(this.queryData);}
        }
      },
      columns: [
        {
          data: "grn_id",
          width: '2%',
          render : (data,arg,full) =>{
          //  debugger
            var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'" data-status="'+full['status']+'" data-grn-status="'+full['grn_status']+'"></i>';

             str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
              data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';

            return str;
         }
        },
        {
          data: "grn_status",
          render : function(data , arg , full){
            if(data == 'PLANNED')
              return '<span class="label label-warning">PLANNED</span>';
            else if(data == 'PENDING')
              return '<span class="label label-danger">PENDING</span>';
            else if(data == 'CONFIRMED')
              return '<span class="label label-success">CONFIRMED</span>';
            else if(data == 'CANCELED')
                return '<span class="label label-default">CANCELLED</span>';
              else
              return '<span class="label label-default">NON</span>';
          }
        },
        { data: "grn_number" },
        { data: "po_number" },
        { data: "invoice_no" },
        { data: "supplier_name" },
        { data: "grn_date" },
        { data: "first_name" }
      ],
      columnDefs: [{
        orderable: false,
        width: '100px',
        targets: [ 0 ]
      }],

    });

    //listen to the click event of edit and delete buttons
    $('#non_inv_grn_list').on('click','i',e => {
      let att = e.target.attributes;
      if(att['data-action']['value'] === 'EDIT'){
      //  debugger
        this.edit(att['data-id']['value'],att['data-status']['value'],att['data-grn-status']['value']);
      }
    else if(att['data-action']['value'] === 'DELETE'){
        this.delete(att['data-id']['value']);
      }
    });

  }

  delete(data) {

    AppAlert.showConfirm({
      'text' : 'Do you want to cancel selected Non Inventory GRN?'
    },
    (result) => {
      if (result.value) {
        this.http.post(this.apiUrl + 'stores/non_inventory_grn_header/cancel_grn' , { 'grn_id' : data } )
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

  edit(id,status,grn_status){
    //debugger
    if(status==0||grn_status!="PLANNED"){
      return 0
    }
    this.http.get(this.apiUrl+'stores/non_inventory_grn_header/'+id)
    .pipe(map(res=>res['data']))
    .subscribe(headerData=>{
    //  debugger
      this.grnService.changeData(headerData)
    })


  }
}
