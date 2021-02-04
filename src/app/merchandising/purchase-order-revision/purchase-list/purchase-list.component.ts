import { Component, OnInit, OnDestroy } from '@angular/core';
import { PorevisionService } from '../po-revision.service';
import { AppConfig } from '../../../core/app-config';
import { AuthService } from '../../../core/service/auth.service';
declare var $:any;

import { LayoutChangerService } from '../../../core/service/layout-changer.service';
import { PermissionsService } from '../../../core/service/permissions.service';

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.css']
})
export class PurchaseListComponent implements OnInit {
  datatable : any = null
  readonly apiUrl:string = AppConfig.apiUrl()
  constructor(private porevisionService : PorevisionService, private permissionService : PermissionsService,private auth : AuthService,private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.createTable()

    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Merchandising',
      'Purchase Order Revision'
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
    this.datatable = $('#revision_po_list').DataTable({
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
         "url": this.apiUrl + "merchandising/po-manual?type=datatable"
     },
      columns: [
           {
             data: "po_id",
             render : (data,arg,full)=>{
               var po_url = AppConfig.POReport()+"?po_no="+full['po_number'];
               var str = '';
               if(this.permissionService.hasDefined('PO_REVISION_EDIT')){
                 str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
             }
             if(this.permissionService.hasDefined('PO_REVISION_DELETE')){
               str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
             }
               str += ' <a href="'+po_url+'" target="_blank" class="icon-printer" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="PRINT" data-id="'+data+'"></a>';

               if( full.po_status == 'CANCELLED' ) {

                   str = '<i class="icon-eye" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';

               }
               return str;
            }
          },
          {
            data: "po_status",
            render : function(data){
              if(data == 'PLANNED')
                return '<span class="label label-warning">PLANNED</span>';
              else if(data == 'PENDING')
                return '<span class="label label-danger">PENDING</span>';
              else if(data == 'CONFIRMED')
                return '<span class="label label-success">CONFIRMED</span>';
              else if(data == 'CANCELLED')
                  return '<span class="label label-default">CANCELLED</span>';
            //else
            //  return '<span class="label label-success">Active</span>';
            }
         },

         { data: "bom_stage_description" },
         { data: "po_number" },
         { data: "new_date" },
         { data: "first_name" },
         { data: "loc_name" }

      ],
      columnDefs: [{
        orderable: false,
        width: '100px',
        targets: [ 0 ]
      }],


     });

     //listen to the click event of edit and delete buttons
     $('#revision_po_list').on('click','i',e => {
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
    this.porevisionService.changeData(data)
  }


  delete(data) {

  }

  reloadTable()
  {//reload datatable11
    this.datatable.ajax.reload(null, false);
  }




}
