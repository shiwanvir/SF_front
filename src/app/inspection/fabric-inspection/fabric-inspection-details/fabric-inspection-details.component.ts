import { Component, OnInit,ViewChild,AfterViewInit, OnDestroy } from '@angular/core';
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

import { InspectionService } from '../inspection.service';

@Component({
  selector: 'app-fabric-inspection-details',
  templateUrl: './fabric-inspection-details.component.html',
  styleUrls: ['./fabric-inspection-details.component.css']
})
export class FabricInspectionDetailsComponent implements OnInit {
    grnGroup : FormGroup
    readonly apiUrl = AppConfig.apiUrl()
    datatable:any = null

    constructor(private router:Router, private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,private inspectionService:InspectionService,
    private auth : AuthService , private layoutChangerService : LayoutChangerService ) { }

  ngOnInit() {



    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

    this.grnGroup = this.fb.group({
      grn_type_code: ["AUTO"],

    });
      this.createTable()
  }


  ngOnDestroy(){
      this.datatable = null
  }





           createTable() { //initialize datatable
            // debugger
              this.datatable = $('#inspection_table').DataTable({
                autoWidth: true,
                scrollY: "500px",
                scrollCollapse: true,
                processing: true,
                serverSide: true,
                scrollX: true,
                order : [[ 0, 'desc' ]],
                ajax: {
                     headers: {
                        'Authorization':`Bearer ${this.auth.getToken()}`,
                      },
                      dataType : 'JSON',
                      "url": this.apiUrl + "stores/fabricInspection?type=datatable"+"&grn_type="+((
                          this.grnGroup.get('grn_type_code').value == null ) ? "AUTO" : this.grnGroup.get('grn_type_code').value)
                 },
                 columns: [
                     {
                       data: "rm_plan_header_id",
                       orderable: true,
                       width: '3%',
                       render : (data,arg,full) => {
                           var str = '';
                           str += '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                           if(this.permissionService.hasDefined('FABRIC_INSPECTION_DELETE')){ //check delete permission
                           str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                           data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
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
                   {
                     data: "confirm_status",
                     orderable: true,
                     render : function(data){
                       if(data == "RECEIVED"){
                           return '<span class="label label-danger">RECEIVED</span>';
                       }
                       else if(data=="INSPECTION_SAVED"){
                         return '<span class="label label-primary">INSPECTION SAVED</span>';
                       }
                       else if(data=="CONFIRMED"){
                         return '<span class="label label-info">CONFIRMED</span>';
                       }
                       else if(data=="GRN_COMPLETED"){
                         return '<span class="label label-success">GRN COMPLETED</span>';
                       }
                     }
                  },
                   { data: "po_number" },
                   {data:"invoice_no"},
                   {data:"batch_no"},
                   {data:"master_code"},
                   {data:"grn_number"},
                   {data:"batch_wise_qty"},
                ],
              });
              //listen to the click event of edit and delete buttons
              $('#inspection_table').on('click','i',e => {
                 let att = e.target.attributes;
                 if(att['data-action']['value'] === 'EDIT'){
                   //debugger
                     this.edit(att['data-id']['value']);
                 }
                 else if(att['data-action']['value'] === 'DELETE'){
                     this.delete(att['data-id']['value'], att['data-status']['value']);
                 }
              });
              //this.datatable.fixedHeader.enable( true );
           }


           filterData($event){
           //debugger
             this.datatable.clear().destroy()
             this.createTable()

           }
           reloadTable() {//reload datatable
               this.datatable.ajax.reload(null, false);
           }


                    edit(id) { //get payment term data and open the model
//debugger
                      this.http.get(this.apiUrl + 'stores/fabricInspection/' + id )
                      .pipe( map(res => res['data']) )
                      .subscribe(data => {

                        //console.log(data[0][0]['status']);
                        if(data['data']==null){
                          return 0
                        }
                        this.inspectionService.changeData(data);
                      })
                    }
           delete(id, status) { //deactivate payment term
            /* if(status == 0)
               return

             AppAlert.showConfirm({
               'text' : 'Do you want to deactivate selected Component?'
             },
             (result) => {
               if (result.value) {
                 this.http.delete(this.apiUrl +'stores/fabricInspection/' + id)
                 .pipe( map(res => res['data']) )
                 .subscribe(
                     (data) => {
                       if(data.status==0){
                         AppAlert.showError({text:"Roll Plan Already in Use"})
                       }
                         this.reloadTable()
                     },
                     (error) => {
                       console.log(error)
                     }
                 )
               }
             })*/
           }


}
