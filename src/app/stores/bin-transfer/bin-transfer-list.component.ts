
import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder,AbstractControl , FormGroup , Validators, FormControl} from '@angular/forms';
import { Router } from '@angular/router';
import { Observable , Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LayoutChangerService } from './../../core/service/layout-changer.service';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

declare var $:any;
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { AuthService } from '../../core/service/auth.service';
import { PermissionsService } from '../../core/service/permissions.service';
import { BinTransferService } from './bin-transfer.service';

@Component({
  selector: 'app-bin-transfer-list',
  templateUrl: './bin-transfer-list.component.html',
  //styleUrls: ['./bin-transfer-list.component.css']
})

export class BinTransferListComponent implements OnInit {

  formGroup : FormGroup
  readonly apiUrl = AppConfig.apiUrl()
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false
  colorQulity: Array<any>
  arr:Array<any>

  constructor(private router:Router, private http:HttpClient, private permissionService : PermissionsService, private auth : AuthService, private BinTransferService : BinTransferService, private layoutChangerService : LayoutChangerService ) { }

  ngOnInit() {
    this.createTable()
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      //debugger
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

    $('#data_tbl').on('click','i',e => {
       let att = e.target.attributes;
       if(att['data-action']['value'] == 'EDIT' && att['data-status']['value'] != 0){
           this.edit(att['data-id']['value']);
       }
    });




  }

  ngOnDestroy(){
      this.datatable = null
  }

  createTable() {
     this.datatable = $('#data_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollX: true,
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order : [[ 0, 'desc' ]],
       ajax: {
             dataType : 'JSON',
             "url": this.apiUrl + "store/bin-to-bin-transfer?type=datatable"
        },
        columns: [
          {
            data: "transfer_id",
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
            orderable: true,
            render : function(data){
              if(data == 1){
                  return '<span class="label label-success">Active</span>';
              }
              else{
                return '<span class="label label-default">Inactive</span>';
              }
            }
         },
          {data: "bin_transfer_no" },
          {data: "user_name" },
          {data: "loc_name" },
       ],
       columnDefs: [{
         orderable: false,
         width: '100px',
         targets: [ 0 ]
       }],

     });

  }

  reloadTable() {
    //
    //debugger
      this.datatable.ajax.reload(null, false);
  }

  edit(data){
    //this.BinTransferService.changeData(data)
  }

}
