import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { AppConfig } from '../../../core/app-config';
import { CostingService } from '../costing.service';
import { AppAlert } from '../../../core/class/app-alert';
import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
import { AuthService } from '../../../core/service/auth.service';

import { PermissionsService } from '../../../core/service/permissions.service';

declare var $:any;

@Component({
  selector: 'app-cost-sheet-list',
  templateUrl: './cost-sheet-list.component.html',
  styleUrls: ['./cost-sheet-list.component.css']
})
export class CostSheetListComponent implements OnInit {

  datatable : any = null
  readonly apiUrl:string = AppConfig.apiUrl()
  selectedCostingId = ''
  formGroup : FormGroup = null
  appValidator : AppFormValidator
  processing : boolean = false

  bomStages$: Observable<Array<any>>
  seasons$: Observable<Array<any>>
  colorTypes$: Observable<Array<any>>
  buyNames$: Observable<Array<any>>

  @ViewChild(ModalDirective) copyModel: ModalDirective;

  constructor(private costingService : CostingService, private http:HttpClient, private permissionService : PermissionsService, private fb:FormBuilder,
  private layoutChangerService : LayoutChangerService, private auth : AuthService) { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      bom_stage_id : [null, [Validators.required]],
      season_id : [null, [Validators.required]],
      color_type_id : [null, [Validators.required]],
      buy_id : [null],
      lot_no : ''
    })
    this.appValidator = new AppFormValidator(this.formGroup, {});
    this.createTable()

    this.costingService.costingList.subscribe(res => {
      if(res != null){
        this.reloadTable()
      }
    })

    //listten to the menu collapse and hide button
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){ return; }
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })
  }


  ngOnDestroy() {
    this.datatable = null
  }

  createTable() { //initialize datatable
     this.datatable = $('#costing_list').DataTable({
     autoWidth: false,
     scrollY: "500px",
     scrollX: true,
     scrollCollapse: true,
     processing: true,
     serverSide: true,
     order : [[ 0, 'desc' ]],
     //fixedColumns:   {
      // leftColumns: 2
    // },
     ajax: {
          headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
          dataType : 'JSON',
          "url": this.apiUrl + "merchandising/costing?type=datatable"
      },
       columns: [
          {
            data: "id",
            render : (data,arg,full)=>{
                var costing_url = AppConfig.CostingReport()+"?ci="+data;
                var str = '';
                if(this.permissionService.hasDefined('COSTING_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                }
                if(this.permissionService.hasDefined('COSTING_DELETE')){
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="DELETE" data-id="'+data+'"></i>';
                }
                str += '<i class="icon-copy4" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="COPY" data-id="'+data+'"></i>';
                str += ' <a href="'+costing_url+'" target="_blank" class="icon-printer" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="PRINT" data-id="'+data+'"></a>';
                return str;
           }
         },
         {
           data: "status",
           render : function(data , arg , full){
             if(data == 'CREATE'){
                 return '<span class="label label-warning">'+data+'</span>';
             }
             else if(data == 'PENDING'){
               return '<span class="label label-danger">'+data+'</span>';
             }
             else{
               return '<span class="label label-success">'+data+'</span>';
             }
           }
        },
        { data: "id" },
        { data: "style_no" },
        { data: "bom_stage_description" },
        { data: "season_name" },
        { data: "color_option" },
        { data: "fob" }
       ],
       columnDefs: [{
         orderable: false,
         width: '100px',
         targets: [ 0 ]
       },
       {
          targets: -1,
          className: 'dt-body-right'
      }],

     });

     //listen to the click event of edit and delete buttons
     $('#costing_list').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
          this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'COPY'){
          this.copy(att['data-id']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

  edit(data){
    this.costingService.changeCostingId(data)
  }


  delete(data) {

  }

  copy(costingId) {
    this.selectedCostingId = costingId
    this.formGroup.reset()
    this.copyModel.show()

    if(this.bomStages$ == null) {
      this.loadBomstages()
    }
    if(this.seasons$ == null) {
      this.loadSeasons()
    }
    if(this.colorTypes$ == null) {
      this.loadColorTypes()
    }
    if(this.buyNames$ == null) {
      this.loadBuyNames()
    }
  }


  copyCosting(){
    if(!this.appValidator.validate()){
      return
    }
    this.processing = true
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Copying...','Please wait while copping costing')
    let formData = this.formGroup.getRawValue()
    formData['costing_id'] = this.selectedCostingId
    //formData['buy_id'] = formData['buy_id'] == null ? 0 : formData['buy_id']
    formData['lot_no'] = formData['lot_no'] == null ? 0 : formData['lot_no']

    this.http.post(this.apiUrl + 'merchandising/costing/copy', formData)
    .pipe(map(res => res['data']))
    .subscribe(
      res => {
        if(res.status == 'success'){
          this.processing = false
          setTimeout(() => {
            AppAlert.closeAlert()
            this.copyModel.hide()
            AppAlert.showSuccess({text : res.message })
          } , 500)
          this.reloadTable()
        }
        else {
          this.processing = false
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({ text : res.message })
          } , 500)
        }
    },
    error => {
      this.processing = false
      setTimeout(() => {
        AppAlert.closeAlert()
        AppAlert.showError({ text : error })
      } , 500)
    }
  )
  }


  loadBomstages(){
    this.bomStages$ = this.http.get<any[]>(this.apiUrl + 'merchandising/bomstages?active=1&fields=bom_stage_id,bom_stage_description')
        .pipe(map(res => res['data']))
  }

  loadSeasons(){
    this.seasons$ = this.http.get<any[]>(this.apiUrl + 'org/seasons?active=1&fields=season_id,season_name')
      .pipe(map(res => res['data']))
  }

  loadColorTypes(){
    this.colorTypes$ = this.http.get<any[]>(this.apiUrl + 'merchandising/color-options?active=1&fields=col_opt_id,color_option')
      .pipe(map(res => res['data']))
  }

  loadBuyNames(){
    this.buyNames$ = this.http.get<any[]>(this.apiUrl + 'merchandising/buy-master?active=1&fields=buy_id,buy_name')
      .pipe(map(res => res['data']))
  }


}
