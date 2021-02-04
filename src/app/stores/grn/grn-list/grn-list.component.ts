import { Component, OnInit,OnDestroy } from '@angular/core';
import { AppConfig } from '../../../core/app-config';
import {FormBuilder, FormGroup, FormControl, Validators, FormArray} from '@angular/forms';
import { AppAlert } from '../../../core/class/app-alert';
import { GrnServicesService } from '../grn-services.service';
import { HttpClient } from '@angular/common/http';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
import { Observable , Subject } from 'rxjs';
import { AuthService } from '../../../core/service/auth.service';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';


declare var $:any;

@Component({
  selector: 'app-grn-list',
  templateUrl: './grn-list.component.html'
})
export class GrnListComponent implements OnInit {
  httpClient: any;
  grnGroup : FormGroup
  datatable : any = null
  readonly apiUrl:string = AppConfig.apiUrl()
  summary:any[]
  grn_type:string;
  returnData:any;
  constructor(private grnService: GrnServicesService,private auth : AuthService,private http:HttpClient, private layoutChangerService : LayoutChangerService,private fb: FormBuilder) { }

  ngOnInit() {
  //this.grn_type="MANUAL"


    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

    this.grnGroup = this.fb.group({
      grn_type_code: ["AUTO"],

    });
  this.createTable() //load data list
  }

  ngOnDestroy(){
      this.datatable = null
  }


  createTable() { //initialize datatable
    //debugger
    this.datatable = $('#grn-list').DataTable({
      autoWidth: false,
      scrollY: "500px",
      scrollX: true,
      scrollCollapse: true,
      processing: true,
      serverSide: true,
      order : [[ 0, 'desc' ]],
        ajax: {
          headers: {
            'Authorization':`Bearer ${this.auth.getToken()}`,
          },
        dataType : 'JSON',
        "url": this.apiUrl + "stores/grn?type=datatable"+"&grn_type="+((

          this.grnGroup.get('grn_type_code').value == null ) ? "AUTO" : this.grnGroup.get('grn_type_code').value)
      },

      columns: [
        {
          data: "grn_id",
          width: '2%',
          render : (data,arg,full) =>{
            var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'" data-status="'+full['status']+'"></i>';

             str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
              data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';

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
        { data: "grn_number"},
        { data: "grn_type_code"},
        { data: "po_number" },
        {data:"inv_number"},
        { data: "substore_name"},
        { data: "supplier_name"},
        { data: "updated_date_"},
        {data:"user_name"}

      ],
      columnDefs: [{
        orderable: false,
        width: '100px',
        targets: [ 0 ]
      }],


    });

    //listen to the click event of edit and delete buttons
    $('#grn-list').on('click','i',e => {
      let att = e.target.attributes;
      if(att['data-action']['value'] === 'EDIT'){
        this.edit(att['data-id']['value'],att['data-status']['value']);
      }
      else if(att['data-action']['value'] === 'DELETE'){
          this.delete(att['data-id']['value'], att['data-status']['value']);
      }
    });
  }

filterData($event){
//debugger
  this.datatable.clear().destroy()
  this.createTable()

}

  edit(id,status){
    //debugger
    if(status==0){
      return 0
    }
    this.http.get(this.apiUrl+'stores/grn/'+id)
    .pipe(map(res=>res['data']))
    .subscribe(data=>{
      this.grnService.changeData(data)
    })


  }









    delete(id, status) { //deactivate GRN from Header level
//debugger
      if(status == 0)
        return

      AppAlert.showConfirm({
        'text' : 'Do you want to deactivate selected Inward Register?'
      },
      (result) => {
        if (result.value) {

          //this.sapRequest()
          //debugger
        this.http.delete(this.apiUrl + 'stores/grn/' + id)
          .pipe(map( data => data['data'] ))
          .subscribe(
              (data) => {
                if(data.status==0){
                   AppAlert.showError({text:data.message})
                    this.reloadTable()
                }
                else if(data.status==1){
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

    sapRequest() {

        var str = {"CompanyDB": "STYLE_DB",
        "Password": "@2019#",
        "UserName": "Admin"};

        var jsonObj = JSON.stringify(str);

        this.httpClient.post('https://172.23.1.232:50000/b1s/v1/Login', jsonObj).subscribe(data => {
          //this.postId = data.id;
          //console.log(data['SessionId']);

        });


        const httpOptions = {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          withCredentials: true,
          observe: 'response' as 'response'
        };

        return this.httpClient.post('https://172.23.1.232:50000/b1s/v1/PurchaseDeliveryNotes(340)/Cancel',null,httpOptions)
          .subscribe(data => {

          });
        }


  reloadTable() {//reload datatable
    //debugger
 //var abc=this.grnGroup.get('grn_type_code').value
    //debugger
      this.datatable.ajax.reload(null, false);
  }

}
