
import { Component, OnInit , ViewChild} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { AuthService } from '../../core/service/auth.service';

import { HotTableModule } from '@handsontable/angular';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';

import { ReturnSupplierService } from './return-to-supplier.service';
import { Grn } from '../../stores/models/grn.model';
import { Item } from '../../org/models/item.model';
import { Batch } from '../../stores/models/batch.model';
declare var $:any;

@Component({
  selector: 'app-return-to-supplier',
  templateUrl: 'return-to-supplier.component.html',
})

export class ReturnToSupplierComponent implements OnInit {

  @ViewChild(ModalDirective) detailModal: ModalDirective;

  formGroup : FormGroup
  formGroupGrid : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  modelTitle : string = "GRN Details"

  processing : boolean = false
  saveStatus = 'SAVE'

  tblDetail: string = 'hot_main'
  mainDataSet: any[] = [];
  detailTable: any

  modalDetail: string = 'hot_modal'
  modalDataSet: any[] = [];
  modalTable: any

  grn$: Observable<Grn[]>;
  grnLoading = false;
  grnInput$ = new Subject<string>();
  currentDataSetIndex : number = -1

  item$: Observable<Item[]>;//use to load style list in ng-select
  itemLoading = false;
  itemInput$ = new Subject<string>();

  batch$: Observable<Batch[]>;//use to load style list in ng-select
  batchLoading = false;
  batchInput$ = new Subject<string>();

  status$: Observable<Batch[]>;//use to load style list in ng-select
  statusLoading = false;
  statusInput$ = new Subject<string>();

  formFields = {
    grn_no : ""
  }

  constructor(private fb:FormBuilder , private http:HttpClient,private ReturnSupplierService : ReturnSupplierService,private hotRegisterer: HotTableRegisterer,
   private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Return to Supplier")//set page title
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

    this.load_grn_list()
    this.loadItemDes()
    this.loadBatch()
    this.loadStatus()
    this.initializeDetailTable()
    this.initializeModalTable()

    this.formGroup = this.fb.group({
      grn_no : [null , [Validators.required]],
      po_no : '',
      inv_no : '',
      supplier : ''
    })

    this.formGroupGrid = this.fb.group({
      roll_from : '',
      roll_to : '',
      lab_comments : '',
      shade : '',
      item_code : null,
      batch : null,
      ins_status : null,
    })

    //lisiten to the click event of orders table's edit button in cut docket listing
    this.ReturnSupplierService.id.subscribe(data => {
      if(data != null){
        console.log(data)
      }
    })

  }

  load_grn_header(e) {
      this.http.post(this.apiUrl + 'store/load_grn_header',{ 'grn_id' : e.grn_id })
      .pipe(map( data => data['data'] ))
      .subscribe(data => {
          if(data.length > 0){
            this.formGroup.controls['po_no'].setValue(data[0]['po_number']);
            this.formGroup.controls['inv_no'].setValue(data[0]['inv_number']);
            this.formGroup.controls['supplier'].setValue(data[0]['supplier_name']);
          }
        },
      )
   }

   loadItemDes() {
     this.item$ = this.itemInput$
     .pipe(
       debounceTime(200),
       distinctUntilChanged(),
       tap(() => this.itemLoading = true),
       switchMap(term => this.http.get<Item[]>(this.apiUrl + 'merchandising/items?type=auto_master_code' , {params:{search:term}})
       .pipe(
           tap(() => this.itemLoading = false)
       ))
     );
   }

   loadBatch() {
     this.batch$ = this.batchInput$
     .pipe(
       debounceTime(200),
       distinctUntilChanged(),
       tap(() => this.batchLoading = true),
       switchMap(term => this.http.get<Batch[]>(this.apiUrl + 'store/issue?type=auto_batch' , {params:{search:term}})
       .pipe(
           tap(() => this.batchLoading = false)
       ))
     );
   }

   loadStatus() {
     this.status$ = this.statusInput$
     .pipe(
       debounceTime(200),
       distinctUntilChanged(),
       tap(() => this.statusLoading = true),
       switchMap(term => this.http.get<any[]>(this.apiUrl + 'store/issue?type=auto_ins_status' , {params:{search:term}})
       .pipe(
           tap(() => this.statusLoading = false)
       ))
     );
  }

  searchFromData(){
    //debugger
    this.http.post(this.apiUrl + 'store/load_grn_details',{ search:this.formGroup.getRawValue(), details:this.formGroupGrid.getRawValue()})
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
        this.modalDataSet = data
    },
    )
  }

  showEvent(event){ //show event of the bs model
    setTimeout(() => {
      this.modalDataSet = []
      const hotInstance = this.hotRegisterer.getInstance(this.modalDetail);
      hotInstance.render()
    }, 200)
  }

  reset_feilds(){
    this.formGroup.reset();
    this.mainDataSet=[]
    this.modalDataSet=[]
  }

  reset_search_feilds(){
    this.formGroupGrid.reset();
    this.modalDataSet=[]
  }

  load_grn_list() {
    this.grn$ = this.grnInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.grnLoading = true),
      switchMap(term => this.http.get<Grn[]>(this.apiUrl + 'stores/grn?type=auto' , {params:{search:term}})
      .pipe(
          tap(() => this.grnLoading = false)
      ))
    );
  }

  initializeDetailTable(){
    this.detailTable = {
      data:this.mainDataSet,
      columns: [
        { type: 'text', title : 'GRN No', data: 'grn_number',className: "htLeft"},
        { type: 'text', title : 'Location', data: 'loc_name',className: "htLeft"},
        { type: 'text', title : 'Store', data: 'store_name',className: "htLeft"},
        { type: 'text', title : 'Sub Store', data: 'substore_name',className: "htLeft"},
        { type: 'text', title : 'Bin', data: 'store_bin_name',className: "htLeft"},
        { type: 'text', title : 'Roll No/Box No', data: 'roll_or_box_no',className: "htLeft"},
        { type: 'text', title : 'Batch', data: 'batch_no',className: "htLeft"},
        { type: 'text', title : 'Shade', data: 'shade',className: "htLeft"},
        { type: 'text', title : 'Item Code', data: 'master_code',className: "htLeft"},
        { type: 'text', title : 'Item Description', data: 'master_description',className: "htLeft"},
        { type: 'text', title : 'UOM', data: 'uom_code',className: "htLeft"},
        { type: 'text', title : 'Purchase UOM', data: 'purchase_uom',className: "htLeft"},
        { type: 'text', title : 'Inspection Status', data: 'inspection_status',className: "htLeft"},
        { type: 'numeric', title : 'Avalibale Qty', data: 'avaliable_qty',className: "htRight"},
        { type: 'text', title : 'Inspection Status', data: 'inspection_status',className: "htLeft"},
        { type: 'numeric', title : 'GRN Qty', readOnly:true, allowEmpty: true, data: 'actual_qty',className: "htRight" },
        { type: 'numeric', title : 'Return Qty', readOnly:false, allowEmpty: true, data: 'return_qty',className: "htRight" },
        { type: 'text', title : 'Comments', readOnly:false, colWidths:150, allowEmpty: true, data: 'comments',className: "htLeft"}
      ],
      contextMenu : {
          callback: function (key, selection, clickEvent) {
          },
          items : {

            'remove_row' : {
              name : 'Remove Line',
              disabled: function (key, selection, clickEvent) {

              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  this.removeLine(start.row)
                }
              }
            },
          }
      },
      afterChange : (changes, source) => {
        let hotInstance = this.hotRegisterer.getInstance(this.tblDetail);
        if(source != null && source.length > 0){
          debugger
          let _row = source[0][0]
          if(source[0][1]=='return_qty'){
          let _qty = (source[0][3] == '' || isNaN(source[0][3]) || source[0][3] < 0) ? 0 : source[0][3]
          if(this.countDecimals(_qty) > 4){
            _qty = this.formatDecimalNumber(_qty, 4)
              this.mainDataSet[_row]['return_qty']=_qty
          }

          else{
            this.mainDataSet[_row]['return_qty']=_qty
        }


        if(this.mainDataSet[_row]['return_qty']>this.mainDataSet[_row]['actual_qty'])
        {
            this.mainDataSet[_row]['return_qty']=0;
            AppAlert.showError({text : 'Cannot exceeded GRN quantity'})
        }

      /*  else if(this.mainDataSet[_row]['return_qty']>this.mainDataSet[_row]['avaliable_qty']){

          this.mainDataSet[_row]['return_qty']=0;
          AppAlert.showError({text : 'Cannot exceeded Avalibale quantity'})
        }*/

        //hotInstance.setDataAtCell(_row, 10, _qty)
        }

        if(source[0][1]=='comments'){
          let _comment=source[0][3]
          _comment=_comment.toUpperCase()
          this.mainDataSet[_row]['comments']=_comment
        }

          hotInstance.render()

        }
      },
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      colHeaders: true,
      filters: true,
      dropdownMenu: true,
      height: 250,
      copyPaste: true,
      stretchH: 'all',
      selectionMode: 'range',
      fixedColumnsLeft: 2,
      className: 'htMiddle',
      readOnly: true,
      disableVisualSelection: 'current',
      mergeCells:[],
    }
  }

  initializeModalTable(){
    this.modalTable = {
      data:this.modalDataSet,
      columns: [
        { type: 'text', title : 'GRN NO', data: 'grn_number',className: "htLeft"},
        { type: 'text', title : 'Location', data: 'loc_name',className: "htLeft"},
        { type: 'text', title : 'Store', data: 'store_name',className: "htLeft"},
        { type: 'text', title : 'Sub Store', data: 'substore_name',className: "htLeft"},
        { type: 'text', title : 'Bin', data: 'store_bin_name',className: "htLeft"},
        { type: 'text', title : 'Roll No/Box No', data: 'roll_or_box_no',className: "htLeft"},
        { type: 'text', title : 'Batch', data: 'batch_no',className: "htLeft"},
        { type: 'text', title : 'Shade', data: 'shade',className: "htLeft"},
        { type: 'text', title : 'Item Code', data: 'master_code',className: "htLeft"},
        { type: 'text', title : 'Item', data: 'master_description',className: "htLeft"},
        { type: 'text', title : 'UOM', data: 'uom_code',className: "htLeft"},
        { type: 'text', title : 'Purchase UOM', data: 'purchase_uom',className: "htLeft"},
        { type: 'text', title : 'Inspection Status', data: 'inspection_status',className: "htLeft"},
        { type: 'text', title : 'GRN Qty', data: 'actual_qty',className: "htRight"}
      ],
      afterChange : (changes, source) => {

      },
      contextMenu : {
          callback: function (key, selection, clickEvent) {
          },
          items : {
           'Add To Grid':{
              name:'Add Line',
              disabled: function (key, selection, clickEvent){
                /////
              },
              callback:(key, selection, clickEvent)=> {
                let start = selection[0].start;
                 this.addLine(key, selection, clickEvent)
                 this.spliceLine(start.row)
              }

            },

          }
      },
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      colHeaders: true,
      filters: true,
      dropdownMenu: true,
      height: 250,
      copyPaste: true,
      stretchH: 'all',
      selectionMode: 'range',
      fixedColumnsLeft: 2,
      className: 'htMiddle',
      readOnly: true,
      disableVisualSelection: 'current',
      mergeCells:[],
    }
  }

  addLine(key, selection, clickEvent){

    var row =selection[0]['end']['row']
    for(var i=0;i<this.mainDataSet.length;i++){
       if(this.mainDataSet[i]['stock_detail_id']==this.modalDataSet[row]['stock_detail_id']){
         AppAlert.showError({text:"Line Already Added"})
         return 0;
       }
    }
    console.log(this.modalDataSet[row]);
    this.mainDataSet.push(this.modalDataSet[row])
    const hotInstance = this.hotRegisterer.getInstance(this.tblDetail);
    hotInstance.render()

  }

  spliceLine(row){
    this.currentDataSetIndex = row
    this.modalDataSet.splice(row,1);
    const hotInstance = this.hotRegisterer.getInstance(this.modalDetail);
    hotInstance.render()
  }

  removeLine(row){
    this.currentDataSetIndex = row
    this.mainDataSet.splice(row,1);
    const hotInstance = this.hotRegisterer.getInstance(this.tblDetail);
    hotInstance.render()
  }

  capitalizeField(_comment){
    _comment.toUpperCase( );
    return _comment;
  }
  return_stock(){
    if(this.validate_grid_data()){
      AppAlert.showConfirm({//Confirm
        'text' : 'Do you want to return selected items?'
      },(result) => {
        if (result.value) {

          let formData = this.formGroup.getRawValue();
          this.processing = true
          //AppAlert.showMessage('Processing...','Please wait while saving details')
          this.saveStatus= 'SAVE'
          this.http.post(this.apiUrl + 'store/return-to-supplier',{'header':formData,'details':this.mainDataSet }).subscribe(data => {
          //  this.processing = false
            AppAlert.closeAlert()
            if(data['data']['status'] == 'success'){
              AppAlert.showSuccess({text: data['data']['message']});
              this.reset_feilds()
            }
            else{
              AppAlert.showError({text:data['data']['message']});
            }
          })

        }
      })// End confirm
    }
  }

  validate_grid_data(){

     if(this.mainDataSet.length==0){
       AppAlert.showError({text:"Please add data to grid"})
       return 0;
     }else{
       for(var i=0;i<this.mainDataSet.length;i++){
         if(this.mainDataSet[i]['return_qty']==null||this.mainDataSet[i]['return_qty']==0||this.mainDataSet[i]['return_qty']==""||isNaN(this.mainDataSet[i]['return_qty'])){
           AppAlert.showError({text:"Please fill mandatory fields"})
           return 0;
         }
       }
     }
     return 1;
  }



      countDecimals(_val) {
       if(Math.floor(_val) === _val) return 0;
       return _val.toString().split(".")[1].length || 0;
      }

      formatDecimalNumber(_number, _places){
        let num_val = parseFloat(_number+'e'+_places)//_number.toExponential(2)
        return Number(Math.round(num_val)+'e-'+_places);
      }




}
