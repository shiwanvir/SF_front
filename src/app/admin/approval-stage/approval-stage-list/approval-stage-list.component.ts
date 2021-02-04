import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { ApprovalStageService } from '../approval-stage.service';

import { PermissionsService } from '../../../core/service/permissions.service';
import { AuthService } from '../../../core/service/auth.service';

declare var $:any;

@Component({
  selector: 'app-approval-stage-list',
  templateUrl: './approval-stage-list.component.html',
  styleUrls: ['./approval-stage-list.component.css']
})
export class ApprovalStageListComponent implements OnInit {

  datatable : any = null
  readonly apiUrl:string = AppConfig.apiUrl()

  constructor(private approvalStageService:ApprovalStageService, private permissionService : PermissionsService,
    private auth : AuthService, private http:HttpClient, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Approval Stages")//set page title
    this.createTable()

  }


  createTable() { //initialize datatable
     this.datatable = $('#role_list').DataTable({
     autoWidth: false,
     scrollY: "500px",
     scrollX: true,
     scrollCollapse: true,
     processing: true,
     serverSide: true,
     fixedColumns:   {
       leftColumns: 2
     },
     ajax: {
          dataType : 'JSON',
          "url": this.apiUrl + "admin/approval-stages?type=datatable"
      },
       columns: [
            {
              data: "stage_id",
              render : (data,arg,full)=>{
              var str = ''
              if(this.permissionService.hasDefined('APPROVAL_STAGE_EDIT')){
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'" data-name="'+full['stage_name']+'"></i>';
              }
              if(this.permissionService.hasDefined('APPROVAL_STAGE_DELETE')){
                    str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
              }
                return str;
             }
           },
           {
             data: "status",
             render : function(data , arg , full){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
          { data: "stage_id" },
          { data: "stage_name" }
       ],
       columnDefs: [{
         orderable: false,
         width: '100px',
         targets: [ 0 ]
       }],

     });

     //listen to the click event of edit and delete buttons
     $('#role_list').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
          this.edit(att['data-id']['value'], att['data-name']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

  edit(stage_id, stage_name){
    this.approvalStageService.changeData({
      stage_id : stage_id,
      stage_name : stage_name
    })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected approval stage?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'admin/approval-stages/' + id)
        .subscribe(
            (data) => {
                this.reloadTable()
            },
            (error) => {
              console.log(error)
            }
        )
      }
    })
  }

}
