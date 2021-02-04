import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { BomService } from '../bom.service';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';

import { PermissionsService } from '../../../core/service/permissions.service';

declare var $:any;

@Component({
  selector: 'app-bom-list',
  templateUrl: './bom-list.component.html',
  styleUrls: ['./bom-list.component.css']
})
export class BomListComponent implements OnInit {

  datatable : any = null
  readonly apiUrl:string = AppConfig.apiUrl()

  constructor(private http:HttpClient, private permissionService : PermissionsService, private bomService : BomService,private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {

    this.createTable()

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
    if(this.datatable != null){
    this.datatable.draw(false);
  }
})

  }

  ngOnDestroy(){
      this.datatable = null
  }

  createTable() { //initialize datatable
     this.datatable = $('#bom_list').DataTable({
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
          dataType : 'JSON',
          "url": this.apiUrl + "merchandising/bom?type=datatable"
      },
       columns: [
          {
            data: "bom_id",
            render : (data,arg,full)=>{
              var str = '';
              var bom_url = AppConfig.BomReport()+"?bom="+data;
              if(this.permissionService.hasDefined('BOM_EDIT')){
                str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
            }
            if(this.permissionService.hasDefined('BOM_DELETE')){
              str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="DELETE" data-id="'+data+'"></i>';
            }
              str += '<a href="'+bom_url+'" target="_blank" class="icon-printer" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="PRINT" data-id="'+data+'"></a>';
              return str;
           }
         },
         {
           data: "status",
           render : function(data , arg , full){
             if(data == 'RELEASED'){
                 return '<span class="label label-success">RELEASED</span>';
             }
             else if(data == 'PENDING'){
               return '<span class="label label-danger">PENDING</span>';
             }
             else if(data == 'CONFIRM'){
               return '<span class="label bg-blue">CONFIRM</span>';
             }
             else if(data == 'PLANNED'){
               return '<span class="label bg-info">PLANNED</span>';
             }
             else{
               return '<span class="label label-other">CANCEL</span>';
             }
           }
        },
        { data: "bom_id" },
        { data: "costing_id" },
        { data: "master_code" },
        { data: "master_description" },
        { data: "style_no" },
        {data:"color_name"},
        { data: "bom_stage_description" },
        { data: "season_name" },
        { data: "color_option" },
        { data: "country_description" },
       ],
       //columnDefs: [{
      //   orderable: false,
      //   width: '100px',
      //   targets: [ 0 ]
      // }],

     });

     //listen to the click event of edit and delete buttons
     $('#bom_list').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
          this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value']);
        }
     });
  }


  drawTable(){
    if(this.datatable != null){
      this.datatable.draw( false );
    }
  }

  edit(data){
    this.bomService.changeBomId(data)
  }


  delete(data) {

  }


}
