import { Component, OnInit , ViewChild} from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';

import { PrlService } from '../prl.service';
import { AppConfig } from '../../../core/app-config';
import { AuthService } from '../../../core/service/auth.service';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
import { AppAlert } from '../../../core/class/app-alert';
declare var $:any;

import { PermissionsService } from '../../../core/service/permissions.service';

@Component({
  selector: 'app-prl-po-list',
  templateUrl: './prl-po-list.component.html',
  styleUrls: ['./prl-po-list.component.css']
})
export class PrlPoListComponent implements OnInit {

  datatable : any = null
  readonly apiUrl:string = AppConfig.apiUrl()
  constructor(private fb:FormBuilder , private http:HttpClient, private prlService : PrlService,
    private permissionService : PermissionsService,
    private auth : AuthService,private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.createTable()
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
    this.datatable = $('#header_po_list').DataTable({
    autoWidth: false,
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
         "url": this.apiUrl + "merchandising/po-manual?type=datatable_2"
     },
      columns: [
           {
             data: "prl_id",
             render : (data,arg,full)=>{
               var str = '';

               if(this.permissionService.hasDefined('PO_EDIT')){
                 str = '<i class="icon-folder-open2" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="OPEN" data-id="'+data+'"></i>';
             }
             if(this.permissionService.hasDefined('PO_DELETE')){
               str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
             }
               return str;
            }
          },
          {
            data: "po_status",
            render : function(data){
              if(data == 'OPEN')
                return '<span class="label label-warning">NOT PLANNED</span>';
              else if(data == 'PLANNED')
                  return '<span class="label label-danger">PLANNED</span>';
              else if(data == 'CANCELED')
                  return '<span class="label label-other">CANCELED</span>';
            }
         },
         //{ data: "prl_id" },
         // { data: "bom_lines" },
         { data: "cd" },
         { data: "first_name" }

      ],
      columnDefs: [{
        orderable: false,
        width: '100px',
        targets: [ 0 ]
      }],


     });

     //listen to the click event of edit and delete buttons
     $('#header_po_list').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'OPEN'){
          this.open(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value']);
        }
     });
  }

  open(data){
    this.prlService.loadData(data)
  }


  delete(data) {

    AppAlert.showConfirm({
      'text' : 'Do You want to remove the selected line?'
    },
    (result) => {
      if (result.value) {

        this.http.post(this.apiUrl + 'merchandising/po-manual-details/remove_header' , { 'data' : data } )
        .pipe( map( res => res['data']) )
        .subscribe(
         data =>
         {
           //AppAlert.showSuccess({ text : data.message });
           this.reloadTable()
          },
           error => {
               setTimeout(() => {
               AppAlert.closeAlert()
               AppAlert.showError({ text : 'Process Error' });
             } , 1000)

          }
        )


      }
    })

  }

  reloadTable()
  {//reload datatable11
    this.datatable.ajax.reload(null, false);
  }

}
