import { Component, OnInit,OnDestroy } from '@angular/core';
import { AppConfig } from '../../../core/app-config';
import { AuthService } from '../../../core/service/auth.service';
declare var $:any;
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
import { ShopOrderService } from '../shop_order.service';

import { PermissionsService } from '../../../core/service/permissions.service';

@Component({
  selector: 'app-shop-order-list',
  templateUrl: './shop-order-list.component.html',
  styleUrls: ['./shop-order-list.component.css']
})
export class ShopOrderListComponent implements OnInit {

  datatable : any = null
  readonly apiUrl:string = AppConfig.apiUrl()
  constructor(private auth : AuthService,private layoutChangerService : LayoutChangerService, private permissionService : PermissionsService,
    private shopOrderService : ShopOrderService) { }


  ngOnInit() {

    this.createTable()

    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Merchandising',
      'Shop Order'
    ])

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
    this.datatable = $('#shop_order_list').DataTable({
    autoWidth: false,
    scrollY: "500px",
    scrollX: true,
    scrollCollapse: true,
    processing: true,
    serverSide: true,
    fixedColumns:   {
         leftColumns: 2
     },
    order : [[ 0, 'desc' ]],
    ajax: {
        headers: {
         'Authorization':`Bearer ${this.auth.getToken()}`,
        },
         dataType : 'JSON',
         "url": this.apiUrl + "merchandising/shop_order?type=datatable"
     },
      columns: [
           {
             data: "shop_order_id",
             render : (data,arg,full)=>{
               var str = '';
               if(this.permissionService.hasDefined('SHOP_ORDER_EDIT')){
                 str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
             }
             if(this.permissionService.hasDefined('SHOP_ORDER_DELETE')){
               str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
             }
               return str;
            }
          },
          {
            data: "order_status",
            render : function(data){
              if(data == 'PLANNED')
                return '<span class="label label-warning">PLANNED</span>';
              else if(data == 'RELEASED')
                return '<span class="label label-success">RELEASED</span>';
              else if(data == 'CONFIRMED')
                return '<span class="label label-success">CONFIRMED</span>';
            //else
            //  return '<span class="label label-success">Active</span>';
            }
         },

         { data: "shop_order_id" },
         { data: "bom_id" },
         { data: "costing_id" },
         { data: "style_no" },
         { data: "master_code" },
         { data: "bom_stage_description" },
         { data: "country_description" }

      ],
      columnDefs: [{
        orderable: false,
        width: '100px',
        targets: [ 0 ]
      }],


     });

     //listen to the click event of edit and delete buttons
     $('#shop_order_list').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
          this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value']);
        }
     });
  }

  edit(data){

    this.shopOrderService.changeData(data)
  }


  delete(data) {

  }





}
