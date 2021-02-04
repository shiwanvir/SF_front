import { Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { SnotifyService , SnotifyPosition} from 'ng-snotify';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';
import { HotTableRegisterer } from '@handsontable/angular';
import * as Handsontable from 'handsontable';

import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../../core/validation/primary-validators';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
import { AuthService } from '../../../core/service/auth.service';
import { ItemSelectorComponent } from '../../../shared/components/item-selector/item-selector.component';
import { ColorSelectorComponent } from '../../../shared/components/color-selector/color-selector.component';
import { CountrySelectorComponent } from '../../../shared/components/country-selector/country-selector.component';
import { PermissionsService } from '../../../core/service/permissions.service';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { Customer } from '../../../org/models/customer.model';
import { Style } from '../../../merchandising/models/style.model';
declare var $:any;

@Component({
  selector: 'app-bom-consumption-update',
  templateUrl: './bom-consumption-update.component.html',
  styleUrls: ['./bom-consumption-update.component.css']
})

export class BomConsumptionUpdateComponent implements OnInit {

  formGroup : FormGroup
  appValidator: AppFormValidator
  readonly apiUrl = AppConfig.apiUrl()
  readonly url = this.apiUrl + 'merchandising/costing'

  customer$: Observable<Customer[]>;//use to load style list in ng-select
  customerLoading = false;
  customerInput$ = new Subject<string>();
  selectedCustomer : any[];

  customerDivisions : Array<any> = []

  style$: Observable<Style[]>;//use to load style list in ng-select
  styleLoading = false;
  styleInput$ = new Subject<string>();
  selectedStyle : any[];

  bom$: Observable<Style[]>;//use to load costing list in ng-select
  bomLoading = false;
  bomInput$ = new Subject<string>();
  selectedBom : any[];

  color$: Observable<Style[]>;//use to load color list in ng-select
  colorLoading = false;
  colorInput$ = new Subject<string>();
  selectedColor : any[];

  bomStage$: Observable<Array<any>>
  selectedBOMStge : any[];

  itemCategories$: Observable<Array<any>>
  selectedItemCategory : any[];

  //seasonList$: Observable<Array<any>>
  //selectedSeason : any[];

  colorTypes$: Observable<Array<any>>
  selectedColorType : any[];

  productComponents$: Observable<Array<any>>
  selectedProductComponent : any[];

  buyNames$: Observable<Array<any>>
  selectedBuyName : any[];


  //RM tab grid
  tblRM: string = 'hot_rm'
  dataRM: any[] = [];
  settingsRM: any

  processing : boolean = false //use to disable and hide buttons while processing async requests

  showSaveButton : boolean = true
  showCloseButton : boolean = false
  showNotifyButton : boolean = false

  searchQueryData = null


  constructor(private fb:FormBuilder, private http:HttpClient, private snotifyService: SnotifyService,
    private layoutChangerService : LayoutChangerService,private authService : AuthService,
    private titleService: Title, private hotRegisterer: HotTableRegisterer,
    public permissionService:PermissionsService) { }


  ngOnInit() {

    this.titleService.setTitle("BOM YY Update")//set page title
    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Merchandising',
      'BOM YY Update'
    ])

    //listten to the menu collapse and hide button
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      const hotInstance = this.hotRegisterer.getInstance(this.tblRM);
      if(hotInstance != undefined && hotInstance != null){
        hotInstance.render() //refresh costing color table
      }
    })

    //this.seasonList$ = this.getSeasonList();
    this.bomStage$ = this.getBomStages()
    this.itemCategories$ = this.getItemCategories()
    this.buyNames$ = this.getBuyNames()
    this.colorTypes$ = this.getColorOption()
    this.productComponents$ = this.getProductComponents()
    this.getCustomers()
    this.getStyles()
    this.getBoms()
    this.getColors()

    this.formGroup = this.fb.group({
      style_id : [],
      bom_stage_id : [],
      division_id : null,
      color_type_id : [],
      buy_id : [[]/*, [Validators.required]*/],
      product_component : [],
      item_category : [],
      color_id : [],
      customer_id : [[], [Validators.required]],
      lot_no : '',
      bom_id : []
    })

    this.appValidator = new AppFormValidator(this.formGroup, []);

    this.initializeRMGrid()

  }


  ngOnDestroy() {

  }


  getBomStages(): Observable<Array<any>> {
      return this.http.get<any[]>(this.apiUrl + 'merchandising/bomstages?active=1&fields=bom_stage_id,bom_stage_description')
        .pipe(map(res => res['data']))
  }

  getItemCategories(): Observable<Array<any>> {
      return this.http.get<any[]>(this.apiUrl + 'merchandising/item-categories?active=1&fields=category_id,category_name')
        .pipe(map(res => res['data']))
  }

  //getSeasonList(): Observable<Array<any>> {
  //  return this.http.get<any[]>(this.apiUrl + 'org/seasons?active=1&fields=season_id,season_name')
  //    .pipe(map(res => res['data']))
  //}

  getColorOption(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'merchandising/color-options?active=1&fields=col_opt_id,color_option')
      .pipe(map(res => res['data']))
  }

  getProductComponents(): Observable<Array<any>> {
    return this.http.post<any[]>(this.apiUrl + 'merchandising/pro_listload', {})
      .pipe(map(res => res['subCat']))
  }

  getBuyNames(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'merchandising/buy-master?active=1&fields=buy_id,buy_name')
     .pipe(map(res => res['data']))
  }

  getDivisions(data) {
    if(data == undefined){
      this.customerDivisions = [];
    }
    else {
      this.http.get(this.apiUrl + 'org/customers/' + data.customer_id)
      .pipe( map(res => res['data'] ))
      .subscribe(
        data => {
          this.customerDivisions = data.divisions
        },
        error => {
          console.log(error)
        }
      )
    }
  }

  getPackTypes(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'org/pack-types?active=1&fields=style_type,style_type_name')
      .pipe(map(res => res['data']))
  }

  getStyles() {
    this.style$ = this.styleInput$
    .pipe(
       debounceTime(200),
       distinctUntilChanged(),
       tap(() => this.styleLoading = true),
       switchMap(term => this.http.get<Style[]>(this.apiUrl + 'merchandising/customer-orders?type=style' , {params:{search:term}})
       .pipe(
           tap(() => this.styleLoading = false)
       ))
    );
  }


  getBoms() {
    this.bom$ = this.bomInput$
    .pipe(
       debounceTime(200),
       distinctUntilChanged(),
       tap(() => this.bomLoading = true),
       switchMap(term => this.http.get<Style[]>(this.apiUrl + 'merchandising/bom?type=auto' , {params:{search:term}})
       .pipe(
           tap(() => this.bomLoading = false)
       ))
    );
  }

  getColors() {
    this.color$ = this.colorInput$
    .pipe(
       debounceTime(200),
       distinctUntilChanged(),
       tap(() => this.colorLoading = true),
       switchMap(term => this.http.get<Style[]>(this.apiUrl + 'org/colors?type=auto' , {params:{search:term}})
       .pipe(
           tap(() => this.colorLoading = false)
       ))
    );
  }


  getCustomers() {
    this.customer$ = this.customerInput$
    .pipe(
       debounceTime(200),
       distinctUntilChanged(),
       tap(() => this.customerLoading = true),
       switchMap(term => this.http.get<Customer[]>(this.apiUrl + 'org/customers?type=auto' , {params:{search:term}})
       .pipe(
           tap(() => this.customerLoading = false)
       ))
    );
  }


  resetAllData(){ //clear all data and set to default values
    AppAlert.showConfirm({
      'text' : 'Do you want to clear all data?'
    },(result) => {
        if (result.value) {
          this.formGroup.reset()
          this.processing = false
          this.showSaveButton = true
          this.showCloseButton = false
          this.showNotifyButton = false
          this.customerDivisions = []
          this.searchQueryData = null
          this.dataRM = []
        }
      })
  }




  //....................... Item Tab ...........................................
  //............................................................................

  initializeRMGrid(){

      if(this.settingsRM != null) {
        return
      }
      this.settingsRM = {
        columns: [
          { type: 'text', title : 'Product Component' , data: 'product_component_id' },
          { type: 'text', title : 'FNG' , data: 'fng_id' },
          { type: 'text', title : 'SFG Code' , data: 'fg_code' },
          { type: 'text', title : 'Style No' , data: 'style_id' },
          { type: 'text', title : 'Style Description' , data: 'style_description'},
          { type: 'text', title : 'Color Code' , data: 'color_code' },
          { type: 'text', title : 'Garment Option' , data: 'garment_options_description' },
          { type: 'text', title : 'Item Description' , data: 'master_description' },
          { type: 'text', title : 'Order Qty' , data: 'total_order_qty' },
          { type: 'numeric', title : 'Net Consumption' , data: 'net_consumption', readOnly : false, className: "htRight" },
          { type: 'text', title : 'UOM' , data: 'purchase_uom_id' },
          { type: 'numeric', title : 'Wastage %' , data: 'wastage', readOnly : false, className: "htRight" },
          { type: 'numeric', title : 'Gross Consumption' , data: 'gross_consumption' , readOnly: true, className: "htRight" },          {
            type: 'dropdown', title : 'Operation' , data: 'garment_operation_id' , readOnly: false, strict:true,
            source: (query, process) => {
              $.ajax({
                headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                data: { search: query },
                url: this.apiUrl + 'ie/garment_operations?type=handsontable' ,
                dataType: 'json',
                success: function (response) {
                  process(response['data']);
                }
              });
            }
          },
          //{ type: 'numeric', title : 'Operation Sequnce' , data: 'supplier_name', strict: true, },
          { type: 'numeric', title : 'Revision' , data: 'revision_no' },
          //{ type: 'text', title : 'Cost Sheet Created By' , data: 'user_name' },
          //{ type: 'text', title : 'Cost Sheet Created Date' , data: 'costing_created_date' },
        ],
        /*contextMenu : {
            callback: function (key, selection, clickEvent) {
              // Common callback for all options
            },
            items : {
              'Save' : {
                name : 'Save',
                hidden: (key, selection, clickEvent) => {
                  return !this.showSaveButton
                },
                callback : (key, selection, clickEvent) => {
                  //console.log(selection)
                  if(selection.length > 0){
                    let start = selection[0].start;
                    let end = selection[0].end;
                    if(start.row == end.row){ //chek user select only single row
                      //this.saveItem(start.row) //save single item
                      if(this.dataRM[start.row]['edited'] == true){
                        this.validateSingleItem(start.row) //validate item data and save
                      }
                    }
                    else{
                      AppAlert.showError({text : 'cannot select multiple rows to save'})
                    }
                  }
                }
              },
            }
          },*/
        mergeCells: [],
        cells: (row, col, prop) => {
          var cellProperties = {};

          if(this.dataRM[row] != undefined){
            if(this.dataRM[row]['edited'] == 1){ //chek row is edited by user and then change color
              cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
                var args = arguments;
                td.style.background = '#d1e0e0';
                Handsontable.renderers.TextRenderer.apply(this, args);
              }
            }
            else{
              cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
                var args = arguments;
                td.style.background = '#fff';
                Handsontable.renderers.TextRenderer.apply(this, args);
              }
            }
          }
          return cellProperties
        },
        afterChange : (changes, source) => {
          if(source != null && source.length > 0){
            const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
            //get changed cell value
            //let _cell_value = (source[0][3] == undefined || source[0][3] == null || source[0][3] == '') ? 0 : source[0][3]
            let _row = source[0][0]


            if(source[0][1] == 'net_consumption'){
              debugger
              // gross consumption = net consumption + (net consumption * wastage) / 100
              let _net_consumption = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
              let _wastage = hotInstance2.getDataAtCell(_row, 11)
              _wastage = (_wastage == '' || isNaN(_wastage)) ? 0 : _wastage

              let decimalCount = this.dataRM[_row]['is_decimal_allowed'] == 1 ? 4 : 0
              if(this.countDecimals(_net_consumption) > decimalCount){
                _net_consumption = this.formatDecimalNumber(_net_consumption, decimalCount)
                hotInstance2.setDataAtCell(_row, 9, _net_consumption)
              }

              let gross_consumption = _net_consumption + ((_net_consumption * _wastage) / 100) //net consumption * wastage
              gross_consumption = this.formatDecimalNumber(gross_consumption, 4)
              hotInstance2.setDataAtCell(_row, 12, gross_consumption)
              this.dataRM[_row]['total_cost'] = this.calculate_item_cost(_row)
            }
            else if(source[0][1] == 'wastage'){
              // gross consumption = net consumption + (net consumption * wastage) / 100
              let _wastage = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
              let _net_consumption = hotInstance2.getDataAtCell(_row, 9)
              _net_consumption = (_net_consumption == '' || isNaN(_net_consumption)) ? 0 : parseFloat(_net_consumption)

            if(this.countDecimals(_wastage) > 4){
              _wastage = this.formatDecimalNumber(_wastage, 4)
              hotInstance2.setDataAtCell(_row, 11, _wastage)
            }

              let gross_consumption = (_net_consumption + ((_net_consumption * _wastage) / 100)).toFixed(4)//net consumption * wastage
              gross_consumption = this.formatDecimalNumber(gross_consumption, 4)
              hotInstance2.setDataAtCell(_row, 12, gross_consumption)
              this.dataRM[_row]['total_cost'] = this.calculate_item_cost(_row)
            }

            if(_row != undefined && _row != null && this.dataRM.length > 0 && (source[0][2] != source[0][3])){
              this.dataRM[_row]['edited'] = true //change editaed row status to edit
              hotInstance2.render()
            }
          }
        },
        manualColumnResize: true,
        autoColumnSize : true,
        rowHeaders: true,
        height: 300,
        stretchH: 'all',
        selectionMode: 'single',
        //fixedColumnsLeft: 4,
        //className: 'htCenter htMiddle',
        className: "htLeft",
        readOnly: true,
      }

  }


  /*validateSingleItem(_row) {
    this.processing = true
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Saving...','Please wait while saving item')
    let _rowData =  this.dataRM[_row]

    if(this.validateData(_rowData) == true) {
      //check for duplicate items
      for(let x = 0 ; x < this.dataRM.length ; x++){
        if(x != _row){
          if(_rowData['master_description'] == this.dataRM[x]['master_description'] && _rowData['color_code'] == this.dataRM[x]['color_code']){
            this.processing = false
            AppAlert.closeAlert()
            AppAlert.showError({ text : 'Duplicate Item'})
            return
          }
        }
      }
      this.saveItem(_row)
    }
  }*/


  validateAllItems(){
    this.processing = true
    let errStatus = false
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Saving...','Please wait while saving items')
    let unsaved_items = []
    let unsaved_items_rows = []
    for(let x = 0 ; x < this.dataRM.length ; x++){
      if(this.dataRM[x]['edited'] == true){//get only edited rows
        //validate item data
        if(this.validateData(this.dataRM[x])){ //validate items
          //chek for duplicate items
          /*for(let y = 0 ; y < this.dataRM.length ; y++){
            if(x != y){
              if(this.dataRM[x]['inventory_part_id'] == this.dataRM[y]['inventory_part_id'] && this.dataRM[x]['color_code'] == this.dataRM[y]['color_code']){
                this.processing = false
                AppAlert.closeAlert()
                AppAlert.showError({ text : 'Duplicate Item'})
                return
              }
            }
          }*/
          unsaved_items.push(this.dataRM[x])
          unsaved_items_rows.push(x)
        }
        else{
          errStatus = true
          this.processing = false
          //setTimeout(() => { AppAlert.closeAlert() }, 500)
          return
        }
      }
    }

    this.saveAllItemChanges(unsaved_items)
  }


  validateData(_itemData) {//validate item list
    let errCount = 0
    let str = ''

    if(!this.validateNumber(_itemData.net_consumption) || _itemData.net_consumption <= 0){
      str += 'Incorrect Net Consumption <br>'
      errCount++
    }
    if(!this.validateNumber(_itemData.wastage)){
      str += 'Incorrect wastage <br>'
      errCount++
    }
    if(_itemData.garment_operation_id == null || _itemData.garment_operation_id == ''){
      str += 'Incorrect Operation <br>'
      errCount++
    }

    if(errCount > 0){
      AppAlert.closeAlert()
      AppAlert.showError({ html : '<span>' + str + '</span>'})
      return false
    }
    else {
      return true
    }
  }


  /*saveItem(_row){ //save single item
    let _itemData = this.dataRM[_row]

    let saveOrUpdate$ = null;
    if(_itemData.costing_item_id <= 0){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/costing-items', { item_data : _itemData } );
    }
    else{
      saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/costing-items/' + _itemData.costing_item_id , { item_data : _itemData });
    }

    saveOrUpdate$.subscribe(
      (res) => {
          this.processing = false
          //this.snotifyService.success(res.data.message, this.tosterConfig)
          this.dataRM[_row] = res.data.item
          const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
          hotInstance2.render()

            AppAlert.closeAlert()
            AppAlert.showSuccess({ text : res.data.message})

      },
      (error) => {
        this.processing = false
        AppAlert.closeAlert()
        AppAlert.showError({ text: 'Process Error'})
        console.log(error)
      }
    );
  }*/


  saveAllItemChanges(unsaved_items){ //save all items
    this.processing = true

    if(unsaved_items.length > 0){
      //AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Saving...','Please wait while saving items')
      this.http.post(this.apiUrl + 'merchandising/bom/save-items', { items : unsaved_items } )
      .subscribe(
        (res) => {
          this.processing = false
          this.loadItems(this.searchQueryData)

          AppAlert.closeAlert()
          if(res['data']['status'] == 'success'){
            //AppAlert.showSuccess({text : res['data']['message']})
            AppAlert.showSuccess({ text : 'BOM YY Updated Successfully' })
          }
          else {
            AppAlert.showError({text : res['data']['message']})
          }

        },
        error => {
          this.processing = false
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({text : error})
          }, 500)
        }
      )
    }
    else{
      this.processing = false
      setTimeout(() => {
        AppAlert.closeAlert()
      }, 500)
    }
  }





  calculate_item_cost(_row){
    const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
    // gross consumption = net consumption + (net consumption * wastage) / 100
    let net_consumption = hotInstance2.getDataAtCell(_row, 9)
    if(net_consumption == null || net_consumption == '' || isNaN(net_consumption)){ //check for incorect values
      //hotInstance2.setDataAtCell(_row, 10, 0)
      net_consumption = 0;
    }
    net_consumption = parseFloat(net_consumption)

    let wastage = hotInstance2.getDataAtCell(_row, 11)
    if(wastage == null || wastage == '' || isNaN(wastage)){ //check for incorect values
      //hotInstance2.setDataAtCell(_row, 11, 0)
      wastage = 0;
    }
    wastage = parseFloat(wastage)

    let gross_consumption = net_consumption + ((net_consumption * wastage) / 100)
    let unit_price = parseFloat(this.dataRM[_row]['purchase_price'])
    if(unit_price == null || isNaN(unit_price)){ //check for incorect values
    //  hotInstance2.setDataAtCell(_row, 9, 0)
      unit_price = 0;
    }
    //unit_price = parseFloat(unit_price)

    let freight_charges = parseFloat(this.dataRM[_row]['freight_charges'])
    if(freight_charges == null || isNaN(freight_charges)){ //check for incorect values
      //hotInstance2.setDataAtCell(_row, 14, 0)
      freight_charges = 0;
    }


    let surcharge = parseFloat(this.dataRM[_row]['surcharge'])
    if(surcharge == null || isNaN(surcharge)){ //check for incorect values
      //hotInstance2.setDataAtCell(_row, 16, 0)
      surcharge = 0;
    }

    let total_cost = ((gross_consumption * unit_price) + freight_charges + surcharge)
    total_cost = this.formatDecimalNumber(total_cost, 4)
    return total_cost
  }




  search(){
    let reqData = this.formGroup.getRawValue()
    reqData.style_id = (reqData.style_id == undefined || reqData.style_id == null) ? 0 : reqData.style_id.style_id
    reqData.bom_stage_id = (reqData.bom_stage_id == undefined || reqData.bom_stage_id == null) ? 0 : reqData.bom_stage_id.bom_stage_id
    reqData.division_id = (reqData.division_id == undefined || reqData.division_id == null) ? 0 : reqData.division_id.division_id
    reqData.color_type_id = (reqData.color_type_id == undefined || reqData.color_type_id == null) ? 0 : reqData.color_type_id.col_opt_id
    reqData.buy_id = (reqData.buy_id == undefined || reqData.buy_id == null) ? 0 : reqData.buy_id.buy_id
    reqData.product_component = (reqData.product_component == undefined || reqData.product_component== null) ? 0 : reqData.product_component.product_component_id
    reqData.item_category = (reqData.item_category == undefined || reqData.item_category == null) ? 0 : reqData.item_category.category_id
    reqData.bom_id = (reqData.bom_id == undefined || reqData.bom_id == null) ? 0 : reqData.bom_id.bom_id
    reqData.color_id = (reqData.color_id == undefined || reqData.color_id == null) ? 0 : reqData.color_id.color_id
    reqData.customer_id = reqData.customer_id.customer_id

    this.searchQueryData = reqData

    this.loadItems(reqData)
  }


  loadItems(reqData){
    let reqStr = `customer_id=${reqData.customer_id}&style_id=${reqData.style_id}&division_id=${reqData.division_id}&color_type_id=${reqData.color_type_id}
      &buy_id=${reqData.buy_id}&product_component=${reqData.product_component}&item_category=${reqData.item_category}&lot_no=${reqData.lot_no}
      &bom_id=${reqData.bom_id}&color_id=${reqData.color_id}&bom_stage_id=${reqData.bom_stage_id}`;

      //console.log(reqData)
      this.http.get<any[]>(this.apiUrl + 'merchandising/bom?type=get_items_for_yy_update&' + reqStr)
      .pipe(map(res => res['data']))
      .subscribe(
        res => {
          this.dataRM = res
        },
        error => {

        }
      )
  }



  //Notifications ..............................................................

  notifyMerchant(){
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Notifining Merchants...','Please wait while notifing merchants')
    this.processing = true
    let bomIdList = [];

    for(let x = 0 ;  x < this.dataRM.length ; x++){
      if(!bomIdList.includes(this.dataRM[x]['bom_id'])){
        bomIdList.push(this.dataRM[x]['bom_id'])
      }
    }


    this.http.post(this.apiUrl + 'merchandising/bom/notify-merchant', {bom_id_list : bomIdList})
    .subscribe(
      res => {
        this.processing = false
        AppAlert.closeAlert()
        if(res['status'] == 'success') {
          this.loadItems(this.searchQueryData)
          AppAlert.showSuccess({ text : res['message'] })
        }
        else if(res['status'] == 'warning') {
          this.loadItems(this.searchQueryData)
          AppAlert.showWarning({ text : res['message'] })
        }
        else {
          AppAlert.showError({ text : res['message'] })
        }
      },
      error => {
        AppAlert.closeAlert()
        this.processing = false
      }
    )
  }

  //............. local functions...............................................



  formatDecimalNumber(_number, _places){
    //let p = Math.pow(10, _places)
    //return Math.round(_number * p) / p
   // return Math.ceil(_number * p) / p
    let num_val = parseFloat(_number + 'e' + _places)//_number.toExponential(2)
    return Number(Math.round(num_val) + 'e-' + _places);
  }




  validateNumber(_value){
    if(_value === null || _value === ''){
      return false
    }
    else if(_value == 0){
      return true
    }
    else if(typeof _value != 'number'){
      if(isNaN(_value)){
        return false
      }
      else{
        return true
      }
    }
    else{
      return true
    }
  }

  countDecimals(_val) {
   if(Math.floor(_val) === _val) return 0;
   return _val.toString().split(".")[1].length || 0;
  }

}
