import { Component, OnInit , ViewChild} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppValidator } from '../../core/validation/app-validator';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { AuthService } from '../../core/service/auth.service';
declare var $:any;

@Component({
  selector: 'app-inventory-scarp-summery',
  templateUrl: './inventory-scarp-summery.component.html'
})

export class InventoryScarpSummeryComponent implements OnInit {

  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  disabled: boolean = false;

  formValidator : AppFormValidator = null
  appValidator : AppValidator
  processing : boolean = false

  constructor(private fb:FormBuilder , private http:HttpClient ,
   private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title) { }

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
       columnDefs: [
         { className: "text-right", "targets": [13] },
         { className: "text-right", "targets": [14] },
         { className: "text-right", targets: [15] }
       ],
       //order : [[ 0, 'desc' ]],
       ajax: {
             headers: {
               'Authorization':`Bearer ${this.auth.getToken()}`,
             },
             dataType : 'JSON',
             "url": this.apiUrl + "reports/load_scarp_header?type=datatable"
        },
        columns: [
          {
            data: "scarp_id",
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
          {data: "scarp_no" },
          {data: "loc_name" },
          {data: "store_name" },
          {data: "style_no" },
          {data: "shop_order_id" },
          {data: "master_code" },
          {data: "master_description" },
          {data: "store_bin_name" },
          {data: "roll_box_no" },
          {data: "batch" },
          {data: "shade" },
          {data: "standard_price" },
          {data: "scarp_qty" },
          {data: "total_amount" },
          {data: "user_name" },
          {data: "create_date" }
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
