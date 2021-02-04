// import { Component, OnInit } from '@angular/core';
import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators,FormControl,FormArray,ValidatorFn} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import Swal from 'sweetalert2'
//models
import { customer } from '../models/customer.model';
import { ProductCategory } from '../models/ProductCategory.model';
import { ProductType } from '../models/ProductType.model';
import { ProductFeature } from '../models/ProductFeature.model';
import { ProductSilhouette } from '../models/ProductSilhouette.model';
import { Division } from '../models/Division.model';


declare var $:any;
import { ModalDirective } from 'ngx-bootstrap/modal';
//import { KeysPipe } from '../pips/keys.pipe';

import { PermissionsService } from '../../core/service/permissions.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { StyleCreationService } from './style-creation.service';

import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-style-creation',
  templateUrl: './style-creation.component.html',
  styleUrls: ['./style-creation.component.css']
})

export class StyleCreationComponent implements OnInit {
  @ViewChild(ModalDirective) sectionModel: ModalDirective;

  modelTitle : string = "Create Style"
  saveStatus = 'SAVE'

  datatable:any = null;
  formGroup : FormGroup
  customer$:Observable<Array<any>>//observable to featch source list
  customerLoading = false;
  customerInput$ = new Subject<string>();
  selectedCustomer:customer

  appFormValidator : AppFormValidator

  checkStyleValue=0;
  checkStylemassage='';
  customerId = null;
  customerDivisions : Array<customer>

  processing : boolean = false
  serverUrl = AppConfig.apiServerUrl();
  apiUrl = AppConfig.apiUrl();
  constructor(private fb:FormBuilder , private http:HttpClient, private titleService: Title, private permissionService : PermissionsService,  private layoutChangerService : LayoutChangerService,
  private styleCreationService : StyleCreationService,private auth : AuthService) { }

  ngOnInit() {

    this.titleService.setTitle("Style Creation")//set page title
    this.createTable();

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
    this.datatable = $('#season_tbl').DataTable({
      autoWidth: true,
      scrollY: "500px",
      scrollCollapse: true,
      processing: true,
      serverSide: true,
      order : [[ 0, 'desc' ]],
      ajax: {
        headers: {
           'Authorization':`Bearer ${this.auth.getToken()}`,
         },
        dataType : 'JSON',
        "url": this.apiUrl + "merchandising/get-style?type=datatable"
      },
      columns: [
        {
          data: "style_id",
          orderable: false,
          width: '3%',
          render : (data,arg,full)=>{
            var str = '';
              if(this.permissionService.hasDefined('STYLE_EDIT')){
              str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-status="'+full['status']+'"  data-id="'+data+'"></i>';
          }
            if(this.permissionService.hasDefined('STYLE_DELETE')){
            str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-status="'+full['status']+'" data-id="'+data+'"></i>';
          }
            return str;
          }
        }, {
          data: "status",
          orderable: true,
          render : function(data){
            if(data == 1){
              var str = '<span class="label label-success">Active</span>';
              return str;
            }
            else{
              var str = '<span class="label label-default">Inactive</span>';
              return str;
            }
          }
        },
        { data: "style_no" },
        { data: "style_description" },
        { data: "remark_style" }
      ],

    });

    //listen to the click event of edit and delete buttons
    $('#season_tbl').on('click','i',e => {
      let att = e.target.attributes;
      if(att['data-action']['value'] === 'EDIT'){
        this.edit(att['data-id']['value'], att['data-status']['value']);
      }
      else if(att['data-action']['value'] === 'DELETE'){
        // this.delete(att['data-id']['value']);
       this.delete(att['data-id']['value'], att['data-status']['value']);
      }
    })
  }

  edit(data, status){
    if(status == 0)
      return
    this.styleCreationService.changeData(data)
  }

  delete(id, status)  {

    if(status == 0)
      return

  AppAlert.showConfirm({
          'text' : 'Do you want to deactivate selected Style ?'
        },
        (result) => {
          if (result.value) {
            this.http.delete(this.apiUrl + "merchandising/style/" + id)
                .subscribe(
                    (data) => {
                      if(data['data']['status'] == "0"){

                          AppAlert.showError({text:"Style already in use"})
                        }else{
                          this.reloadTable()
                          AppAlert.closeAlert()
                        }

                    },
                    (error) => {
                      //console.log(error)
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
