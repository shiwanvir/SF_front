import { Component, OnInit,OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

//third part components
declare var $:any;

import { AppConfig } from '../../core/app-config';
import { genmrnService } from './genmrn.service';
import { AppAlert } from '../../core/class/app-alert';

@Component({
  selector: 'app-genmrn-list',
  templateUrl: './genmrn-list.component.html',
  styleUrls: []
})
export class GenmrnListComponent implements OnInit {

  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()

  constructor(private http:HttpClient , private genmrnService:genmrnService) { }

  ngOnInit() {

    this.createTable()

    this.genmrnService.status.subscribe(status => {
      if(status == 'RELOAD_TABLE'){
        this.reloadTable()
      }
    })

  }

  ngOnDestroy(){
      this.datatable = null
  }

  createTable() { //initialize datatable
    let gen_req_no =  0;
    //alert("AA"+gen_req_no);

    this.datatable = $('#item_tbl2').DataTable({
      autoWidth: false,
      scrollY: "500px",
      scrollCollapse: true,
      processing: true,
      serverSide: true,
      ajax: {
           dataType : 'JSON',
           "url": this.apiUrl + "stores/get_genpr?type=datatable&id="+gen_req_no

       },
       columns: [
           {
             data: "id",
             orderable: false,
             width: '3%',
             render : function(data,arg,full){
               /* var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
               str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>'; */
                var str ='<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';

               return str;
            }
          },
          {
            data: "status",
            orderable: false,
            render : function(data){
              if(data == 1){
                  return '<span class="label label-success">Active</span>';
              }
              else{
                return '<span class="label label-default">Inactive</span>';
              }
            }
         },
         { data: "request_no" },
         { data: "loc_name" },
         { data: "dep_name" },
         { data: "Item_wanted_date" },
         { data: "itemDecs" },
         { data: "req_qty" },
         { data: "uom" }
      ],
    });

    //listen to the click event of edit and delete buttons
    $('#item_tbl2').on('click','i',e => {
       let att = e.target.attributes;
       /* if(att['data-action']['value'] === 'EDIT'){
           this.edit(att['data-id']['value']);
       }
       else  */
       if(att['data-action']['value'] === 'DELETE'){
           this.delete(att['data-id']['value']);
       }
    });
 }



  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

  /* edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'stores/generalpr_details/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1'){
        this.supplierService.changeData(data)
      }
    })
  }  */


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected MRN?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'stores/generalpr_details/' + id)
        .subscribe(data => {
            this.reloadTable()
        })
      }
    })
  }

}
