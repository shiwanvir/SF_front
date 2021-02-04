import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

//third part components
declare var $:any;

import { AppConfig } from '../../core/app-config';
import { CustomerService } from './customer.service';
import { AppAlert } from '../../core/class/app-alert';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: []
})
export class CustomerListComponent implements OnInit {

  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()

  constructor(private http:HttpClient , private customerService:CustomerService, private permissionService : PermissionsService,
  private auth : AuthService,private layoutChangerService : LayoutChangerService ) { }

  ngOnInit() {

    this.createTable()

    this.customerService.status.subscribe(status => {
      if(status == 'RELOAD_TABLE'){
        this.reloadTable()
      }
    })

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'Merchandising',
      'Customer'
    ])
    //listten to the menu collapse and hide button
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      this.datatable.draw(false);
    }) //
  }

changeTableLign(){
  if(this.datatable!=null){
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      this.datatable.draw(false);
      console.log("cdhcdchd");
    })
  //this.reloadTable()
}
}

ngOnDestroy(){
    this.datatable = null
}

  createTable() { //initialize datatable
     this.datatable = $('#country_tbl').DataTable({
       autoWidth: false,
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
            //headers : {Authorization: `Bearer ${this.authService.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "org/customers?type=datatable"
        },
        columns: [
            {
              data: "customer_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full)=>{
                var str = '';
                if(this.permissionService.hasDefined('CUSTOMER_EDIT')){
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                }
                if(this.permissionService.hasDefined('CUSTOMER_DELETE')){
                str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'" data-status="'+full.status+'"></i>';
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
          { data: "customer_code" },
          { data: "customer_name" },
          { data: "customer_short_name" },
           ],
     });

     //listen to the click event of edit and delete buttons
     $('#country_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
             this.delete(att['data-id']['value'],att['data-status']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'org/customers/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1'){
        this.customerService.changeData(data)
      }
    })
  }



    delete(id,status) { //deactivate payment
      if(status==0){
        return;
      }
      else {
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Customer?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/customers/' + id)
        .subscribe(data => {
            this.reloadTable()
        })
      }
    })
  }

}
}
