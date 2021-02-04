import { Component, OnInit,ViewChild, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';

import { AppConfig } from '../../core/app-config';
import { BuyerPoService } from './buyer-po.service';
import { AuthService } from '../../core/service/auth.service';
import { AppAlert } from '../../core/class/app-alert';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

import { PermissionsService } from '../../core/service/permissions.service';

declare var $:any;

@Component({
  selector: 'app-style-buyer-po-list',
  templateUrl: './style-buyer-po-list.component.html',
  styleUrls: []
})
export class StyleBuyerPoListComponent implements OnInit {

  datatable : any = null
  queryData = []
  readonly apiUrl:string = AppConfig.apiUrl()
  //searchingFieldsUrl = 'merchandising/customer-orders?type=search_fields';

  constructor(private buyerPoService : BuyerPoService,private auth : AuthService, private permissionService : PermissionsService,
    private layoutChangerService : LayoutChangerService,private http:HttpClient, private fb:FormBuilder) { }

  ngOnInit() {

    this.createTable()
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        console.log('test')
        this.reloadTable()
        //this.datatable.draw(false);
        //this.datatable.ajax.reload(null, false);
      }
    })


  }

  ngOnDestroy(){
      this.datatable = null
  }

  createTable() { //initialize datatable
     this.datatable = $('#buyer_po_list').DataTable({
     autoWidth: false,
     scrollY: "500px",
     scrollX: true,
     scrollCollapse: true,
     processing: true,
     serverSide: true,
     order : [[ 0, 'desc' ]],
     ajax: {
          headers: {
          'Authorization':`Bearer ${this.auth.getToken()}`,
          },
          dataType : 'JSON',
          "url": this.apiUrl + "merchandising/customer-orders?type=datatable",
          data : {
            'query_data' : () => {return JSON.stringify(this.queryData);}
          }
      },
       columns: [
            {
               data: "order_id",
               width: '2%',
               render : (data,arg,full)=>{

                   if(full['usr_vali']==1){
                     var usr_vali = 'visibility: visible;';
                     var icon = 'icon-pencil';
                   }else{
                     var usr_vali = 'visibility: hidden;';
                     var icon = 'icon-eye';
                   }

                   var str = '';

                   if(this.permissionService.hasDefined('SALES_ORDER_EDIT')){
                     str = '<i class="'+icon+'" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px;" data-action="EDIT" data-id="'+data+'" data-validate="'+full['usr_vali']+'" data-status="'+full['order_status']+'"></i>';
                 }
                 if(this.permissionService.hasDefined('SALES_ORDER_DELETE')){
                   str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;'+usr_vali+'" data-action="DELETE" data-id="'+data+'" data-status="'+full['order_status']+'"></i>';
                 }
                   if( full.order_status == 'CANCELLED' ) {

                       str =  '<i class="'+icon+'" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed;margin-right:3px;" data-action="DISABLE" data-id="'+data+'" data-validate="'+full['usr_vali']+'" data-status="'+full['order_status']+'"></i>';
                       str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed;'+usr_vali+'" data-action="DISABLE" data-id="'+data+'" data-status="'+full['order_status']+'"></i>';
                   }
                   return str;
               }
           },
           {
             data: "order_status",
             render : function(data , arg , full){
               return '<span class="label" style="background-color:'+full['color']+'">'+data+'</span>';
             }
          },
          { data: "order_code" },
          //{ data: "order_company" },
          { data: "style_no" },
          { data: "customer_name" },
          { data: "division_description" },
          //{ data: "order_type_name" }
       ],
       columnDefs: [{
         orderable: true,
         width: '100px',
         targets: [ 0 ]
       }],

     });

     //listen to the click event of edit and delete buttons
     $('#buyer_po_list').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
          this.edit(att['data-id']['value'],att['data-validate']['value'],att['data-status']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value'],att['data-status']['value']);
        }
     });
  }

  edit(data,validation,status){
    if(status == 'CANCELLED')
    return
    this.buyerPoService.changeData(data,validation)
  }

  reloadTable() {//reload datatable

      this.datatable.ajax.reload(null, false);
  }


  delete(data,status) {

    if(status == 'CANCELLED')
    return

    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Sales Order ?'
    },
    (result) => {
      if (result.value) {
        this.http.post(this.apiUrl + 'merchandising/full_deactivate' ,{ 'order_id' : data } )
        .pipe(map( data => data['data'] ))
        .subscribe(
            (data) => {
              console.log(data)
              if(data['status']=='success'){
                AppAlert.showSuccess({text : data['message'] })
                this.reloadTable();

              }else{
                AppAlert.showError({text : data['message'] })
                this.reloadTable();
              }

            },
            (error) => {
              console.log(error)
            }
        )
      }
    })

  }


  /*search(emittedData){
    console.log(emittedData)
    this.queryData = emittedData
    this.datatable.search("").draw();
    this.http.post(this.apiUrl + 'app/search', {fields : queryData})
    .subscribe(
      data => {
        console.log(data)
      }
    )
  }*/

}
