import { Component, OnInit,ViewChild } from '@angular/core';
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
import { ReturnSupplierService } from './return-to-supplier.service';

@Component({
  selector: 'app-return-to-supplier-list',
  templateUrl: './return-to-supplier-list.component.html',
  //styleUrls: ['./return-to-supplier-list.component.css']
})

export class ReturnToSupplierListComponent implements OnInit {

  formGroup : FormGroup
  readonly apiUrl = AppConfig.apiUrl()
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false
  colorQulity: Array<any>
  arr:Array<any>

  constructor(private router:Router, private http:HttpClient, private permissionService : PermissionsService, private auth : AuthService, private ReturnSupplierService : ReturnSupplierService ) { }

  ngOnInit() {

    $('#data_tbl').on('click','i',e => {
       let att = e.target.attributes;
       if(att['data-action']['value'] == 'EDIT' && att['data-status']['value'] != 0){
           this.edit(att['data-id']['value']);
       }
    });
    this.createTable()

  }

  createTable() {
     this.datatable = $('#data_tbl').DataTable({
       autoWidth: true,
       scrollY: "500px",
       scrollX: true,
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
             headers: {
               'Authorization':`Bearer ${this.auth.getToken()}`,
             },
             dataType : 'JSON',
             "url": this.apiUrl + "store/return-to-supplier?type=datatable"
        },
        columns: [
          {
            data: "return_id",
            orderable: false,
            width: '1%',
            render : (data,arg,full) => {
              var str = '';
              str += '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT"  data-status="'+full['status']+'" data-id="'+data+'"></i>';
              str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
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
          {data: "return_no" },
          {data: "grn_number" },
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
    //this.ReturnSupplierService.changeData(data)
  }

}
