import { Component, OnInit,ViewChild,AfterViewInit,OnDestroy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../../core/validation/primary-validators';
import { BasicValidators } from '../../../core/validation/basic-validators';
import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';

import { AuthService } from '../../../core/service/auth.service';
import { PermissionsService } from '../../../core/service/permissions.service';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
import { IssueService } from '../issue.service';

@Component({
  selector: 'app-issue-detils',
  templateUrl: './issue-detils.component.html',
  styleUrls: ['./issue-detils.component.css']
})
export class IssueDetilsComponent implements OnInit {
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  ngOnInit() {

 this.createTable() //load data list
 this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
   if(data == false){return;}
   if(this.datatable != null){
     this.datatable.draw(false);
   }
 })

 this.layoutChangerService.changeHeaderPath([
   'Warehouse Management',
   'Stores',
   'Material Issue'
 ])

  }
  constructor(private router:Router,private issueService:IssueService,private http:HttpClient,private permissionService : PermissionsService,
  private auth : AuthService,private layoutChangerService : LayoutChangerService   ) { }


  ngOnDestroy(){
      this.datatable = null
  }
             createTable() { //initialize datatable
                this.datatable = $('#color_tbl').DataTable({
                  autoWidth: false,
                  scrollY: "500px",
                  scrollX: true,
                  scrollCollapse: true,
                  processing: true,
                  serverSide: true,
                  fixedColumns:   {
                       leftColumns: 2
                   },
                  order : [[ 0, 'desc' ]],
                  ajax: {
                       headers: {
                          'Authorization':`Bearer ${this.auth.getToken()}`,
                        },
                        dataType : 'JSON',
                        "url": this.apiUrl + "store/issue?type=datatable"
                   },
                   columns: [
                       {
                         data: "issue_detail_id",
                         orderable: true,
                         width: '3%',
                         render : (data,arg,full) => {
                          // debugger
                           var str = '';
                             str += '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'" data-status="'+full['status']+'"></i>';
                             if(this.permissionService.hasDefined('COLOR_DELETE')){ //check delete permission
                             str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                             data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
                           }
                           return str;
                        }
                      },
                    /*  {
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
                     },*/
                     {
                       data: "issue_status",
                       orderable: false,
                       render : function(data){
                        //debugger
                         if(data == "CONFIRM"){
                             return '<span class="label label-info">CONFIRM</span>';
                         }
                         else if (data == "PENDING"){
                           return '<span class="label label-warning">PENDING</span>';
                         }
                       }
                    },

                     { data: "issue_no" },
                     { data: "grn_type_code"},
                     {data:"master_description"},
                     {data:"qty"},
                     {data:"st_updated_date"},

                    ],
                });

                //listen to the click event of edit and delete buttons
                $('#color_tbl').on('click','i',e => {
                   let att = e.target.attributes;
                   if(att['data-action']['value'] === 'EDIT'){
                       this.edit(att['data-id']['value'],att['data-status']['value']);
                   }
                   else if(att['data-action']['value'] === 'DELETE'){
                       //this.delete(att['data-id']['value'], att['data-status']['value']);
                   }
                });
             }

             reloadTable() {//reload datatable
                 this.datatable.ajax.reload(null, false);
             }


               edit(id,status){
                 //debugger
                 if(status==0){
                   return 0
                 }
                 this.http.get(this.apiUrl+'store/issue/'+id)
                 .pipe(map(res=>res['data']))
                 .subscribe(data=>{
                   this.issueService.changeData(data)
                 })


               }
}
