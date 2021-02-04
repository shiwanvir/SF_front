import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';


//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';


@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: []
})
export class ApprovalsComponent implements OnInit {

  readonly apiUrl = AppConfig.apiUrl()
  saveStatus = 'SAVE'
  datatable:any = null

  processing : boolean = false

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService:PermissionsService,
    private auth : AuthService, private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Approvals")//set page title

   if(this.permissionService.hasDefined('COUNTRY_VIEW')){
      this.createTable() //load data list
   }

   //change header nevigation pagePath
   this.layoutChangerService.changeHeaderPath([
     'Reports',
     'Approvals'
   ])
  }

  ngOnDestroy(){
      this.datatable = null
  }


  createTable() { //initialize datatable
     this.datatable = $('#approvals_tbl').DataTable({
       autoWidth: true,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[0,'desc']],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "reports/approvals?type=datatable"
        },
        columns: [
            {
              data: "id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                str = '<i class="icon-stack-check" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="APPROVE" data-id="'+data+'"></i>';
                str += '<i class="icon-close2" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="REJECT" data-id="'+data+'"></i>';
                return str;
             }
           },
           {
             data: "status",
             /*orderable: false,*/
             render : function(data){
               if(data == "APPROVED"){
                   return '<span class="label label-success">Approved</span>';
               }
               else if(data == "PENDING"){
                   return '<span class="label label-warning">Pending</span>';
               }
               else{
                 return '<span class="label label-danger">Rejected</span>';
               }
             }
          },
          { data: "process" },
          { data: "document_id" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#approvals_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'APPROVE'){
            this.approve(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'REJECT'){
            this.reject(att['data-id']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }



  approve(id) { //get payment term data and open the model

    AppAlert.showConfirm({
      'text' : 'Do you want to approve this request?'
    },
    (result) => {
      if (result.value) {
        AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while approving Request.')
        let _data = {
          'approval_id' : id,
          'status' : 'APPROVE'
        }

        this.http.post(this.apiUrl + 'reports/approvals', _data)
        .pipe(map(data => data['data']))
        .subscribe(data => {
          AppAlert.closeAlert();

          if(data.status == 'error'){
            AppAlert.showError({ text : data.message })
          }
          else {
            AppAlert.showSuccess({ text : data.message })
            this.reloadTable()
          }
        })
      }
    })
  }


  reject(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to reject this request?',
      'type' : 'warning'
    },
    (result) => {
      if (result.value) {
        AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while rejecting Request.')
        let _data = {
          'approval_id' : id,
          'status' : 'REJECT'
        }

        this.http.post(this.apiUrl + 'reports/approvals', _data)
        .pipe(map(data => data['data']))
        .subscribe(data => {
          AppAlert.closeAlert()

          if(data.status == 'error'){
            AppAlert.showError({ text : data.message })
          }
          else {
            //sorry for this
            AppAlert.showSuccess({ text:"Request Rejected Successfully" })
            this.reloadTable()
          }
        })
      }
    })
  }


}
