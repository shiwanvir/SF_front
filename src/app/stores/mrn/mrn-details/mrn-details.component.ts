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

import { MRNService } from '../mrn.service';
//added new line
import { RedirectService } from '../../../reports/redirect.service';

@Component({
  selector: 'app-mrn-details',
  templateUrl: './mrn-details.component.html',
  styleUrls: ['./mrn-details.component.css']
})
export class MrnDetailsComponent implements OnInit {
 grnGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  constructor(private router:Router,private http:HttpClient,private permissionService : PermissionsService,private mrnService:MRNService,
    private auth : AuthService, private opentab: RedirectService, private layoutChangerService : LayoutChangerService,private fb: FormBuilder) { }

    ngOnInit() {

      this.grnGroup = this.fb.group({
        grn_type_code: ["AUTO"],

      });
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
      this.datatable = $('#color_tbl').DataTable({
        autoWidth: false,
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
          "url": this.apiUrl + "store/mrn?type=datatable"+"&grn_type="+((

            this.grnGroup.get('grn_type_code').value == null ) ? "AUTO" : this.grnGroup.get('grn_type_code').value)
        },
        columnDefs: [
           { className: "text-center", targets: 1 }
        ],
        columns: [
          {
            data: "mrn_id",
            orderable: true,
            width: '3%',
            render : (data,arg,full) => {
              var mrn_url = AppConfig.MRNReport()+"?ci="+data+"&bi="+full['mrn_no'];
              var str = '';
              str += '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'" data-status="'+full['status']+'"></i>';
              if(this.permissionService.hasDefined('COLOR_DELETE')){ //check delete permission
                str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                data-action="DELETE" data-id="'+ data +'" data-status="'+ full['status'] +'" ></i>';
              }
              str += ' <a href="'+mrn_url+'" target="_blank" class="icon-printer" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="PRINT" data-id="'+data+'"></a>';
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
          {data: "mrn_no"},
          {data: "style_no"},
          {data:"request_type"},
          {data:"user_name"},
          {data:"updated_date_"}
        ],
      });

      //listen to the click event of edit and delete buttons
      $('#color_tbl').on('click','i',e => {
        //2  debugger
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
          this.edit(att['data-id']['value'],att['data-status']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
          this.delete(att['data-id']['value'], att['data-status']['value']);
        }
        //added new code
        /*else if(att['data-action']['value'] === 'VIEW'){
          let param = {ci:att['data-mrn-id']['value'],bi:att['data-mrn-no']['value']};
          this.opentab.post(param,this.apiUrl + "reports/load_mrn_note");
        }*/
      });
    }

    reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
    }
    filterData($event){
    //debugger
      this.datatable.clear().destroy()
      this.createTable()

    }

    edit(id,status) { //get payment term data and open the model
      if(status==0){
        return 0;
      }
      this.http.get(this.apiUrl + 'store/mrn/' + id )
      .pipe( map(res => res['data']) )
      .subscribe(data => {

        //console.log(data[0][0]['status']);
        this.mrnService.changeData(data);
      })
    }


    delete(id, status) { //deactivate payment term
      if(status == 0)
      return

      AppAlert.showConfirm({
        'text' : 'Do you want to deactivate selected MRN?'
      },
      (result) => {
        if (result.value) {
          this.http.delete(this.apiUrl + 'store/mrn/' + id)
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
