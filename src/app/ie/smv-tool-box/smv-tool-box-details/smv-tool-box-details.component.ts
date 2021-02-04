import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import {ComponentLoaderFactory} from 'ngx-bootstrap/component-loader';
import {PositioningService} from 'ngx-bootstrap/positioning';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
declare var $:any;

import { AppValidator } from '../../../core/validation/app-validator';
import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { BasicValidators } from '../../../core/validation/basic-validators';
import { PrimaryValidators } from '../../../core/validation/primary-validators';
import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { PermissionsService } from '../../../core/service/permissions.service';
import { AuthService } from '../../../core/service/auth.service';
import { Observable, Subject } from 'rxjs';
import { SmvToolBoxService } from '../smv-tool-box.service';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { tap } from 'rxjs/internal/operators/tap';
import { switchMap } from 'rxjs/internal/operators/switchMap';

@Component({
  selector: 'app-smv-tool-box-details',
  templateUrl: './smv-tool-box-details.component.html',
  styleUrls: ['./smv-tool-box-details.component.css']
})
export class SmvToolBoxDetailsComponent implements OnInit {

    readonly apiUrl = AppConfig.apiUrl()
      datatable:any = null

  constructor( private http:HttpClient,private permissionService : PermissionsService,
    private auth : AuthService,private layoutChangerService : LayoutChangerService, private titleService: Title,private smvService:SmvToolBoxService) { }

  ngOnInit() {
        this.titleService.setTitle("SMV Tool Box")//set page title

        if(this.permissionService.hasDefined('SMV_TOOL_BOX_VIEW')){
        this.createTable() //load data list
      }

      //change header nevigation pagePath
      this.layoutChangerService.changeHeaderPath([
        'Catalogue',
        'IE',
        'SMV Tool Box Details'
      ])

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
     this.datatable = $('#garment_operation_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       scrollX: true,
       processing: true,
       serverSide: true,
       paging:true,
       searching:true,
       order:[[6,'desc']],
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "ie/smv_tool_box?type=datatable"
        },
        columns: [
            {
              data: "smv_reading_id",
              orderable: true,
              width: '3%',
              render : (data,arg,full)=>{
                var str = '';
                if(this.permissionService.hasDefined('SMV_TOOL_BOX_EDIT')){
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'" data-status="'+full['status']+'"></i>';
                    if( full.status== 0) {
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed;margin-right:3px" data-action="DISABLE" data-id="'+data+'">\n\
                  </i><i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed" data-action="DISABLE" data-id="'+data+'"></i>';
                }
              }
                if(this.permissionService.hasDefined('SMV_TOOL_BOX_DELETE')){
                   str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'"></i>';
                   if( full.status== 0) {
                   str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed;margin-right:3px" data-action="DISABLE" data-id="'+data+'">\n\
                 </i><i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed" data-action="DISABLE" data-id="'+data+'"></i>';
               }
              }

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
          //{ data: "service_type_code" },
          { data: "product_silhouette_id"},
          { data: "customer_name"},
          { data: "total_smv"},
          { data: "version"},
          {data:"created_date",
           visible: false,
        }

       ],
     });

     //listen to the click event of edit and delete buttons
     $('#garment_operation_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
          //debugger
            this.edit(att['data-id']['value'],att['data-status']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value'],att['data-status']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

  edit(id,status){
    //debugger
    if(status==0){
      return
    }
    this.http.get(this.apiUrl + 'ie/smv_tool_box/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      //debugger
      if(data!=null){
        //debugger
        this.smvService.changeData(data);
      }

    })
  }

  delete(id,status){
    if(status==0){
      return
    }
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected SMV Details?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'ie/smv_tool_box/' + id)
        .pipe(map( data => data['data'] ))
        .subscribe(
            (data) => {
              if(data.status=='1'){
                this.reloadTable()
              }
              else if(data.status=='0'){
                AppAlert.showError({text:data.message})
                this.reloadTable()
              }

            },
            (error) => {
              console.log(error)
            }
        )
      }
    })
  }

}
