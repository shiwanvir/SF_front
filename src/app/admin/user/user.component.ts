import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AppAlert } from '../../core/class/app-alert';
import { Router } from '@angular/router'
import { AppConfig } from '../../core/app-config';
import { HttpClient } from '@angular/common/http';
declare var $:any;
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

import { PermissionsService } from '../../core/service/permissions.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { AuthService } from '../../core/service/auth.service';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  serverUrl:string = AppConfig.apiServerUrl()
  datatable:any = null
  saveStatus = 'SAVE'
  apiUrl = AppConfig.apiUrl()

  constructor(private router: Router,
    private auth : AuthService, private http:HttpClient, private permissionService:PermissionsService, private titleService: Title,private layoutChangerService : LayoutChangerService) { }

  redirectRegister() {
    this.router.navigate(['admin/user/']);
  }

  ngOnInit() {
    this.titleService.setTitle("Users")//set page title

    this.createTable() //load data list

    console.log('add permission - user')
    console.log(this.permissionService.store)

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'Admin',
      'Users'
    ])

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })
  }

  createTable() { //initialize datatable
    this.datatable = $('#user-tbl').DataTable({
      autoWidth: true,
      scrollY : "500px",
      scrollX: true,
      sScrollXInner: "100%",
      scrollCollapse: true,
      //processing: true,
      serverSide: true,
      paging:true,
      searching:true,
      order : [[ 0, 'desc' ]],
      ajax: {
        headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
        dataType : 'JSON',
        "url": this.apiUrl + "admin/users?type=datatable"
      },
      columns: [
        {
          data: "user_id",
          orderable: false,
          width: '10%',
          render : (data,arg,full)=>{
            var str = ''
            if(this.permissionService.hasDefined('USERS_EDIT'))
            {
             str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px ;margin-left:7px" data-action="EDIT" data-id="'+data+'" data-status="'+full['status']+'"></i>';
            }
            if(this.permissionService.hasDefined('USERS_DELETE'))
            {
            str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px; cursor:pointer" data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
            }
            return str;
          }
        },
        {
          data: "status",
          //orderable: false,
          render : function(data){
            if(data == 1){
              return '<span class="label label-success">Active</span>';
            }
            else{
              return '<span class="label label-default">Inactive</span>';
            }
          }
        },
        { data: "first_name" },
        { data: "last_name" },
        { data: "emp_number" },
        { data: "email" },
        //{ data: "loc_name" },
        { data: "dep_name" },
        { data: "des_name" }
      ],
    });

    //listen to the click event of edit and delete buttons
    $('#user-tbl').on('click','i',e => {
      let att = e.target.attributes;
      if(att['data-action']['value'] === 'EDIT'){
        this.edit(att['data-id']['value'], att['data-status']['value']);
      }
      else if(att['data-action']['value'] === 'DELETE'){
        this.delete(att['data-id']['value'], att['data-status']['value']);
      }
    });

  }

  //submit data for edit
  edit(id, status) {
    if(status == 0)
    return
    this.router.navigate(['admin/user/', id]);
  }

  delete(id, status) { //deactivate payment term

    if(status == 0)
    return
    AppAlert.showConfirm({
      'text' : 'Do You Want To Deactivate Selected User?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'admin/users/' + id)
        .pipe( map(res => res['data']) )
        .subscribe(
          (data) => {
            if(data.status==0 ){
              AppAlert.showError({'text':data.message})
              this.reloadTable()
            }
            else if(data.status==1){
              //AppAlert.showSuccess({'text':data.message})
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

  reloadTable() {//reload datatable
    this.datatable.ajax.reload(null, false);
  }

}
