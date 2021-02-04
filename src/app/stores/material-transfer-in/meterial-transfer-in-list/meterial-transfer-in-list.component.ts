import { Component, OnInit,ViewChild,AfterViewInit,OnDestroy} from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { AuthService } from '../../../core/service/auth.service';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;


import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
//service to commiunicate between two tabs
import { MeterialTranferService } from '.././meterial-transfer.service';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';

@Component({
  selector: 'app-meterial-transfer-in-list',
  templateUrl: './meterial-transfer-in-list.component.html',
  styleUrls: ['./meterial-transfer-in-list.component.css']
})
export class MeterialTransferInListComponent implements OnInit {

  datatable:any=null
  readonly apiUrl = AppConfig.apiUrl()

  constructor(private http:HttpClient ,private materialTransferService:MeterialTranferService ,private layoutChangerService : LayoutChangerService,private auth : AuthService) { }

  ngOnInit() {

    this.createTable()

    this.materialTransferService.status.subscribe(status=>{
      if(status=='RELOAD_TABLE'){
          this.reloadTable()

      }

    })

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
       this.datatable = $('#gatepassTable_tbl').DataTable({
       autoWidth: true,
       scrollY: "500px",
       //scrollX:true,
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order : [[ 0, 'desc' ]],
       ajax: {
            'Authorization':`Bearer ${this.auth.getToken()}`,
            dataType : 'JSON',
            "url": this.apiUrl + "stores/material-transfer?type=datatable"
        },
        columns: [

          {
            data: "gate_pass_id",
            width: '2%',
            render : (data,arg,full) =>{
              var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'" data-status="'+full['status']+'"></i>';

               str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';

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
          { data: "gate_pass_no" },
          { data: "loc_name" },
          { data: "send_date" },
          { data: "received_date" },
          {data:"user_name"}
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#gatepassTable_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value']);
        }
     });
  }



  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

  edit(id) { //get payment term data and open the model

  }


  delete(id) { //deactivate payment term

  }






}
