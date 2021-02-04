import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder,AbstractControl , FormGroup , Validators, FormControl} from '@angular/forms';
import { Router } from '@angular/router';
import { Observable , Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

declare var $:any;
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { AuthService } from '../../core/service/auth.service';
import { PermissionsService } from '../../core/service/permissions.service';

import { ReturnStoreService } from './return-to-stores.service';

@Component({
  selector: 'app-return-to-stores-list',
  templateUrl: './return-to-stores-list.component.html',
})
export class ReturnToStoresListComponent implements OnInit {

  formGroup : FormGroup
  readonly apiUrl = AppConfig.apiUrl()
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false
  colorQulity: Array<any>
  arr:Array<any>

  constructor(private router:Router, private http:HttpClient, private permissionService : PermissionsService, private auth : AuthService, private ReturnStoreService : ReturnStoreService ) { }

  ngOnInit() {

    $('#data_tbl').on('click','i',e => {
       let att = e.target.attributes;
       if(att['data-action']['value'] == 'EDIT' && att['data-status']['value'] != 0){
           this.edit(att['data-id']['value']);
       }
    });
    this.createTable()

  }

  ngOnDestroy(){
      this.datatable = null
  }

  createTable() {
     this.datatable = $('#data_tbl').DataTable({
       autoWidth: true,
       scrollY: "500px",
       scrollX: true,
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       //order : [[ 0, 'desc' ]],
       ajax: {
             headers: {
               'Authorization':`Bearer ${this.auth.getToken()}`,
             },
             dataType : 'JSON',
             "url": this.apiUrl + "store/return-to-stores?type=datatable"
        },
        columns: [
        /*  {
            data: "return_id",
            orderable: false,
            width: '1%',
            /*render : (data,arg,full) => {
             var str = '';
              str += '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT"  data-status="'+full['status']+'" data-id="'+data+'"></i>';
              str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
              return str;
            }
          },*/
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
          {data: "return_no" },
          {data: "issue_no" },
          {data: "master_code" },
          {data: "master_description" },
          {data: "return_qty" },
          {data: "user_name" },
          {data: "updated_date_" }
       ],
     });

  }

  reloadTable() {
      this.datatable.ajax.reload(null, false);
  }

  edit(data){
    //this.ReturnStoreService.changeData(data)
  }

}
