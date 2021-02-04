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
import { TransferLocationService } from '.././transfer-location.service';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
@Component({
  selector: 'app-transfer-location-details',
  templateUrl: './transfer-location-details.component.html',
  styleUrls: ['./transfer-location-details.component.css']
})
export class TransferLocationDetailsComponent implements OnInit {
  datatable:any=null
  readonly apiUrl = AppConfig.apiUrl()

  constructor(private http:HttpClient ,private transferLocationService:TransferLocationService ,private layoutChangerService : LayoutChangerService,private auth : AuthService) { }

  ngOnInit() {

    this.createTable()

    this.transferLocationService.status.subscribe(status=>{
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
            "url": this.apiUrl + "stores/location-transfer?type=datatable"
        },
        columns: [

          {
            data: "gate_pass_id",
            width: '2%',
            render : (data,arg,full) =>{
              //debugger
              var str ='<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" data-transfer-status="'+full['transfer_status']+'" ></i>';

              return str;
           }
          },
          {
            data: "status",
            render : function(data,arg,full){
              if(data == 1){
                  return '<span class="label label-success">Active</span>';
              }else{
                return '<span class="label label-default">Inactive</span>';
              }
            }
         },

          {
            data: "transfer_status",
            orderable: false,
            render : function(data){
             //debugger
              if(data == "CONFIRMED"){
                  return '<span class="label label-warning">CONFIRMED</span>';
              }
              else if (data == "PENDING"){
                return '<span class="label label-danger">PENDING</span>';
              }
              else if (data == "TRANSFERED"){
                return '<span class="label label-success">TRANSFERED</span>';
              }
            }
         },
          { data: "gate_pass_no" },
          { data: "loc_receiver" },
          { data: "updated_date_" },
          {data:"created_user"},
          {data:"received_user"}
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#gatepassTable_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
          //debugger
            this.delete(att['data-id']['value'],att['data-status']['value'],att['data-transfer-status']['value']);
        }
     });
  }



  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'stores/transfer-location/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1'){
        this.transferLocationService.changeData(data)
      }
    })
  }


  delete(id,status,transfer_status) { //deactivate payment term
    //debugger
    if((status==0 )||(transfer_status!="PENDING")){
      return 0;
    }
    else{
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Location Transfer?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'stores/transfer-location/' + id)
        .subscribe(data => {
            this.reloadTable()
        })
      }
    })
  }
  }


}
