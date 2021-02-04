import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { AuthService } from '../../core/service/auth.service';
import { ItemService } from '../item.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { PermissionsService } from '../../core/service/permissions.service';

@Component({
  selector: 'app-inventory-item-list',
  templateUrl: './inventory-item-list.component.html',
  styleUrls: []
})
export class InventoryItemListComponent implements OnInit {

  modelTitle : string = "Item Listing"
  readonly apiUrl = AppConfig.apiUrl()
  datatable:any = null

  constructor(private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private itemService : ItemService, private layoutChangerService : LayoutChangerService,) { }

  ngOnInit() {

    this.itemService.itemList.subscribe(res => {
      if(res != null){
        this.reloadTable()
      }
    })

    this.createTable() //load data list

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
     this.datatable = $('#inventory_item_tbl').DataTable({
       autoWidth: false,
       scrollY : "500px",
       scrollX: true,
       sScrollXInner: "100%",
       scrollCollapse: true,
       //processing: true,
       serverSide: true,
       paging:true,
       searching:true,
       order : [[ 11, 'desc' ]],

       ajax: {
           headers: {
              'Authorization':`Bearer ${this.auth.getToken()}`,
            },
            dataType : 'JSON',
            "url": this.apiUrl + "merchandising/items?type=datatable&search_type=INVENTORY_ITEMS"
        },
        columns: [
            {
              data: "master_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                  //str += '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                  if(this.permissionService.hasDefined('ITEM_CREATION_DELETE')){ //check delete permission
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
          { data: "master_code",width: "150px"},
          { data: "master_description" },
          { data: "standard_price", className: 'dt-body-right'},
          { data: "category_name" },
          { data: "subcategory_name" },
          { data: "color_name" },
          { data: "size_name" },
          { data: "uom_code" },
          { data: "supplier_name" },
          { data : "created_at" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#inventory_item_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value'], att['data-status']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
    if(this.datatable != null){
      this.datatable.ajax.reload(null, false);
    }
  }

  drawTable(){
    if(this.datatable != null){
      this.datatable.draw( false );
    }
  }

  delete(id, status) { //deactivate payment term

    if(status == 0)
      return

    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Material?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'merchandising/items/' + id)
        .pipe(map( data => data['data'] ))
        .subscribe(
            (data) => {
              if(data['status'] == 'error'){
                  AppAlert.showError({text: data['message']})
              }
              else{
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
