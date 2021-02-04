import { Component, OnInit , ViewChild} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators , FormArray} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';
import { RedirectService } from '../redirect.service';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { AuthService } from '../../core/service/auth.service';

import { HotTableModule } from '@handsontable/angular';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';

import { Factory } from '../../org/models/factory.model';
import { Store } from '../../org/models/store.model';
import { SubStore } from '../../org/models/sub-store.model';
import { Item } from '../../org/models/item.model';

declare var $:any;

@Component({
  selector: 'app-inventory-scarp',
  templateUrl: './inventory-scarp.component.html',
  //styleUrls: ['./inventory-scarp.component.css']
})
export class InventoryScarpComponent implements OnInit {

  @ViewChild("popUpModel") popUpModel: ModalDirective;
  @ViewChild("parameterModal") parameterModal: ModalDirective;
  @ViewChild("detailModal") detailModal: ModalDirective;

  formGroup : FormGroup
  searchFormGroup : FormGroup
  parameterForm : FormGroup
  dataTableForm : FormGroup
  modalForm : FormGroup

  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  disabled: boolean = false;

  formValidator : AppFormValidator = null
  appValidator : AppValidator

  searchFormValidator : AppFormValidator = null
  searchValidator : AppValidator

  modelTitle : string = "Select Store"

  factory$: Observable<Factory[]>
  loc_name_loading = false;
  loc_name_input$ = new Subject<string>();

  store$: Observable<Store[]>
  store_loading = false;
  store_input$ = new Subject<string>();

  to_sub_store$: Observable<SubStore[]>
  to_sub_store_loading = false;
  to_sub_store_input$ = new Subject<string>();

  sub_store$: Observable<SubStore[]>
  sub_store_loading = false;
  sub_store_input$ = new Subject<string>();

  locType = ''
  getParameter:any = []

  tblDetail: string = 'hot_detail'
  detailDataSet: any[] = [];
  detailTable: any

  modalDetail: string = 'hot_modal'
  modalDataSet: any[] = [];
  modalTable: any
  currentDataSetIndex : number = -1

  code$: Observable<Item[]>;//use to load style list in ng-select
  codeLoading = false;
  codeInput$ = new Subject<string>();

  codeTo$: Observable<Item[]>;//use to load style list in ng-select
  codeToLoading = false;
  codeToInput$ = new Subject<string>();

  categoryList$: Observable<any[]>;

  processing : boolean = false
  saveStatus = 'SAVE'

  formFields = {
    from_sub_store : '',
    to_sub_store : ''
  }

  searchFields = {
    loc_name : '',
    loc_store : '',
    loc_sub_store : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient,private hotRegisterer: HotTableRegisterer,
   private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title,private opentab: RedirectService) { }

  ngOnInit() {

    this.layoutChangerService.changeHeaderPath([
      ' Warehouse Management',
      'Stores',
      'Inventory Scarp',
      ])

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

    this.formGroup = this.fb.group({
      loc_name : [null , [Validators.required]],
      loc_store : [null , [Validators.required]],
      loc_sub_store : [null , [Validators.required]],
    })

    this.parameterForm = this.fb.group({
    })

    this.modalForm = this.fb.group({
    })

    this.dataTableForm = this.fb.group({
    })

    this.searchFormGroup = this.fb.group({
      from_sub_store : [null , [Validators.required]],
      to_sub_store : [null , [Validators.required]],
      item_category : null,
      item_code : null,
      item_code_to : null,
    })

    this.formValidator = new AppFormValidator(this.formGroup , {});
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);
    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.searchFormValidator = new AppFormValidator(this.searchFormGroup , {});
    this.searchValidator = new AppValidator(this.searchFields,{},this.searchFormGroup);
    this.searchFormGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.searchValidator.validate();
    })

    this.load_factory_list()
    this.initializeDetailTable()
    this.loadCategories()
    this.loadItemCodes()
    //this.loadItemCodeTo()
    this.load_parameters()
    this.initializeModalTable()
  }

  loadCategories(){
    this.categoryList$ =  this.http.get<any[]>(this.apiUrl + 'merchandising/item-categories')
      .pipe(map(res => res['data']))
  }

  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

  showEvent(event){
  }

  showEventData(event){ //show event of the bs model
    setTimeout(() => {
      this.modalDataSet = []
      const hotInstance = this.hotRegisterer.getInstance(this.modalDetail);
      hotInstance.render()
    }, 200)
  }

  show_location_modal(type){
    this.locType = type
    this.formGroup.reset();
    this.searchFormGroup.controls['from_sub_store'].reset()
    this.searchFormGroup.controls['to_sub_store'].reset()
    this.popUpModel.show()
  }

  load_factory_list() {
       this.factory$ = this.loc_name_input$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.loc_name_loading = true),
          switchMap(term => this.http.get<Factory[]>(this.apiUrl + 'common/user_locations?type=user_loc' , {params:{search:term}})
          .pipe(
              tap(() => this.loc_name_loading = false)
          ))
       );
  }

  load_stores(e) {
     this.store$ = this.store_input$
     .pipe(
        debounceTime(200),
        tap(() => this.store_loading = true),
        switchMap(term => this.http.get<Store[]>(this.apiUrl + 'common/user_locations?type=loc_stores' , {params:{search:term,location:e.loc_id}})
        .pipe(
            tap(() => this.store_loading = false)
        ))
     );
  }

  load_sub_stores(e) {
     this.sub_store$ = this.sub_store_input$
     .pipe(
        debounceTime(200),
        tap(() => this.sub_store_loading = true),
        switchMap(term => this.http.get<SubStore[]>(this.apiUrl + 'common/user_locations?type=loc_sub_stores' , {params:{search:term,store:e.store_id}})
        .pipe(
            tap(() => this.sub_store_loading = false)
        ))
     );
  }

  set_sub_store(){
    let formData = this.formGroup.getRawValue();
    this.searchFormGroup.patchValue({
      from_sub_store : {substore_id : formData['loc_sub_store']['substore_id'] ,sub_store_name : formData['loc_sub_store']['substore_name']}
    })
    this.popUpModel.hide()
    this.load_to_sub_stores()
  }

  load_to_sub_stores() {
     let formData = this.formGroup.getRawValue();
     this.to_sub_store$ = this.to_sub_store_input$
     .pipe(
        debounceTime(200),
        tap(() => this.to_sub_store_loading = true),
        switchMap(term => this.http.get<SubStore[]>(this.apiUrl + 'common/user_locations?type=loc_sub_stores' , {params:{search:term,store:formData['loc_store']['store_id']}})
        .pipe(
            tap(() => this.to_sub_store_loading = false)
        ))
     );
  }

  reset_feilds(){
    this.formGroup.reset();
    this.searchFormGroup.reset();
    this.detailDataSet=[]
    this.modalDataSet=[]
  }

  load_parameters(){
    this.http.post(this.apiUrl + 'common/load_advance_parameters',{ })
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
        this.getParameter = data;
      },
    )
  }

  showAdvance(){
    this.parameterModal.show()
  }

  initializeDetailTable(){
    this.detailTable = {
      data:this.detailDataSet,
      columns: [
        { type: 'text', title : 'Style', data: 'style_no'},
        { type: 'text', title : 'Customer', data: 'customer_name'},
        { type: 'numeric', title : 'Shop Order', data: 'shop_order_id'},
        { type: 'numeric', title : 'Item Code', data: 'master_code'},
        { type: 'text', title : 'Item Description', data: 'master_description'},
        { type: 'text', title : 'Inventory UOM', data: 'uom_code'},
        { type: 'text', title : 'Bin', data: 'store_bin_name'},
        { type: 'numeric', title : 'Roll No/Box No', data: 'roll_or_box_no'},
        { type: 'numeric', title : 'Batch', data: 'batch_no'},
        { type: 'numeric', title : 'Inv Qty', data: 'avaliable_qty'},
        { type: 'numeric', title : 'Std Price', data: 'standard_price'},
        { type: 'numeric', title : 'Purchase Price', data: 'purchase_price'},
        { type: 'numeric', title : 'Total Value', data: 'total_value'},
        { type: 'numeric', title : 'Qty Counted', readOnly:false, data: 'scarp_qty', allowEmpty: true},
        { type: 'text', title : 'Comments', readOnly:false, colWidths:200, data: 'comments', allowEmpty: true }
      ],
      afterChange : (changes, source) => {
        if(source != null && source.length > 0){
          let hotInstance = this.hotRegisterer.getInstance(this.tblDetail);
          let row = source[0][0]
          let col = source[0][1]
          // let oldVal = parseFloat(this.detailDataSet[row]['avaliable_qty'])
          let oldVal = this.detailDataSet[row]['avaliable_qty']
          // let newVal = source[0][3]
          if(col=='scarp_qty'){
            let newVal = source[0][3]
            // let newVal = (surce[0][3] == '' || isNaN(surce[0][3])) ? 0 : surce[0][3]
            if(newVal > oldVal){
              AppAlert.showError({text : 'Cannot exceeded inventory quantity'})
              hotInstance.setDataAtCell(row, 13, 0)
            }else if(isNaN(newVal)){
              AppAlert.showError({text : 'Enter only numeric values in this field'})
              hotInstance.setDataAtCell(row, 13, 0)
            } else if(newVal<0){
              AppAlert.showError({text : 'Enter positive real numbers in this field'})
              hotInstance.setDataAtCell(row, 13, 0)
            }
          }
        }
      },
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
      rowHeaders: true,
      filters: true,
      dropdownMenu: true,
      manualColumnResize: true,
      autoColumnSize : true,
      height: 350,
      copyPaste: true,
      stretchH: 'all',
      selectionMode: 'range',
      fixedColumnsLeft: 0,
      className: 'htMiddle',
      readOnly: true,
      disableVisualSelection: 'current',
    }
  }

  removeLine(row){
    this.currentDataSetIndex = row
    this.detailDataSet.splice(row,1);
    const hotInstance = this.hotRegisterer.getInstance(this.tblDetail);
    hotInstance.render()
  }

  loadItemCodes() {
    var d=this.searchFormGroup.getRawValue();
    this.code$ = this.codeInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.codeLoading = true),
      switchMap(term => this.http.get<any[]>(this.apiUrl + 'common/load_item_code_by_category?type=load_item_code_by_category' , {params:{search:term,item_category:((this.searchFormGroup.get('item_category').value == null) ? null : this.searchFormGroup.get('item_category').value.category_code)}})
      .pipe(
          tap(() => this.codeLoading = false)
      ))
    );
  }



  clearItemList(e){
    //debugger
    this.searchFormGroup.controls['item_code'].setValue(null);
  }

  load_code_to(e){
    this.codeTo$ = this.codeToInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.codeToLoading = true),
      switchMap(term => this.http.get<Item[]>(this.apiUrl + 'common/load_item_code?type=codeTo' , {params:{search:term,item:e.master_id,category:e.category_id}})
      .pipe(
          tap(() => this.codeToLoading = false)
      ))
    );
  }

  searchFrom(){
    //debugger
      this.detailModal.show()
      let formData = this.formGroup.getRawValue();
      const hotInstance = this.hotRegisterer.getInstance(this.modalDetail);
      hotInstance.render();
      var options = [];
      $("#tbl_param input[type=checkbox]:checked").each(function () {
          options.push($(this).val())
      });
      AppAlert.showMessage('Processing...','Please wait while loading details')
      this.http.post(this.apiUrl + 'reports/load_scarp_details',{ search:this.searchFormGroup.getRawValue(), options:options, store:formData['loc_store']['store_id'] })
      .pipe(map( data => data['data'] ))
      .subscribe(data => {
          AppAlert.closeAlert()
          debugger
          this.modalDataSet = data
          hotInstance.render();
        },
      )
  }

  initializeModalTable(){
    this.modalTable = {
      data:this.modalDataSet,
      columns: [
        { type: 'text', title : 'Style', data: 'style_no'},
        { type: 'text', title : 'Customer', data: 'customer_name'},
        { type: 'numeric', title : 'Shop Order', data: 'shop_order_id'},
        { type: 'numeric', title : 'Item', data: 'master_code'},
        { type: 'text', title : 'Item Description', data: 'master_description'},
        { type: 'text', title : 'Inventory UOM', data: 'uom_code'},
        { type: 'text', title : 'Bin', data: 'store_bin_name'},
        { type: 'numeric', title : 'Roll No/Box No', data: 'roll_or_box_no'},
        { type: 'numeric', title : 'Batch', data: 'batch_no'},
        { type: 'numeric', title : 'Inv Qty', data: 'avaliable_qty'},
        { type: 'numeric', title : 'Std Price', data: 'standard_price'},
        { type: 'numeric', title : 'Purchase Price', data: 'purchase_price'},
        { type: 'numeric', title : 'Total Value', data: 'total_value'},
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

              },
              callback:(key, selection, clickEvent)=> {
                 this.addLine(key, selection, clickEvent)
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
    for(var i=0;i<this.detailDataSet.length;i++){
       if(this.detailDataSet[i]['stock_detail_id']==this.modalDataSet[row]['stock_detail_id']){
         AppAlert.showError({text:"Line Already Added"})
         return 0;
       }
    }

    this.detailDataSet.push(this.modalDataSet[row])
    const hotInstance = this.hotRegisterer.getInstance(this.tblDetail);
    hotInstance.render()
  }

  eject_stock(){
    if(this.validate_grid_data()){
      AppAlert.showConfirm({
        'text' : 'Do you want to Scarp selected items?'
      },(result) => {
        if (result.value) {

          let formData = this.searchFormGroup.getRawValue();
          let locData = this.formGroup.getRawValue();
          this.processing = true
          AppAlert.showMessage('Processing...','Please wait while saving details')
          this.saveStatus= 'SAVE'
          this.http.post(this.apiUrl + 'reports/eject_stock',{'locData':locData,'header':formData,'details':this.detailDataSet}).subscribe(data => {
          this.processing = false
            AppAlert.closeAlert()
            if(data['data']['result'] == 'success'){
              AppAlert.showSuccess({text: data['data']['message']});
              this.reset_feilds()
            }else{
              AppAlert.showError({text: data['data']['message']});
            }

          })

        }
      })
    }
  }

  validate_grid_data(){
     if(this.detailDataSet.length==0){
       AppAlert.showError({text:"Please add data to grid"})
       return 0;
     }else{
       for(var i=0;i<this.detailDataSet.length;i++){
         if(this.detailDataSet[i]['scarp_qty']==null||this.detailDataSet[i]['scarp_qty']==0||this.detailDataSet[i]['scarp_qty']==""||isNaN(this.detailDataSet[i]['scarp_qty'])){
           AppAlert.showError({text:"Please fill mandatory fields"})
           return 0;
         }
       }
     }
     return 1;
  }


}
