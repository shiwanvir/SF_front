import { Component, OnInit , ViewChild} from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';
import Swal from 'sweetalert2';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
//declare var $:any;

import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { AppValidator } from '../../core/validation/app-validator';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { ManualPoService } from './manual-po.service';

//models
import { Division } from '../../org/models/division.model';
import { Customer } from '../../org/models/customer.model';
import { Suppliers } from '../../merchandising/models/Suppliers.model';
import { Location } from '../../org/models/location.model';
import { Style } from '../../merchandising/models/style.model';
import { Deliverto } from '../../merchandising/models/deliverto.model';
import { Invoiceto } from '../../merchandising/models/invoiceto.model';
import { Item } from '../../org/models/item.model';

@Component({
  selector: 'app-non-inventory-po',
  templateUrl: './non-inventory-po.component.html',
  styleUrls: []
})

export class NonInventoryPoComponent implements OnInit {

  @ViewChild(ModalDirective) detailsModel2: ModalDirective;
  readonly apiUrl = AppConfig.apiUrl()
  formHeader : FormGroup;
  formValidatorHeader : AppFormValidator;
  appValidator : AppValidator;
  processingHeader : boolean = false;
  saveStatus = 'SAVE';

  formValidatorDetails : AppFormValidator;
  saveStatusDetails = 'SAVE';
  modelTitle = 'Add Order Line'
  deliveryStatus : string = ''
  currentDataSetIndex : number = -1
  processingDetails : boolean = false
  hotOptions: any
  instancee: string = 'instance'
  dataset: any[] = []
  orderId = 0;
  poStatus = ''
  poNumber = ''
  detailId = 0;
  loadingHeader : boolean = false
  loadingCountHeader : number = 0
  formDetails : FormGroup;
  loadingDetails : boolean = false
  loadingCountDetails : number = 0
  initializedDetails : boolean = false

  partDes$: Observable<Item[]>;
  partDesLoading = false;
  partDesInput$ = new Subject<string>();

  supplier$: Observable<Suppliers[]>;//use to load style list in ng-select
  supplierLoading = false;
  supplierInput$ = new Subject<string>();

  customerId = null;
  customerDivisions : Array<Customer>
  currencyDivisions : Array<Customer>
  costDepartments : Array<Customer>
  invoiceTo : Observable<Array<any>>
  partNos : Array<Customer>

  currencyId = null;
  today : Date;
  supplierId = null;
  partDescription : string = ''
  partCode : string = ''
  partDes : string = ''
  partUOM : string = ''
  standPrice = null
  reqdate : Date

  deliverto$: Observable<Deliverto[]>;//use to load style list in ng-select
  delivertoLoading = false;
  delivertoInput$ = new Subject<string>();

  // invoiceto$: Observable<Invoiceto[]>;//use to load style list in ng-select
  // invoicetoLoading = false;
  // invoicetoInput$ = new Subject<string>();
  processingConfirm = ''

  categoryList$: Observable<Array<any>>
  subCategoryList$: Observable<any[]>;
  uomList$:Observable<any[]>;

  formFields = {
    cost_center_id : '',
    dept_id : '',
    po_type : '',
    supplier : '',
    currency : '',
    delivery_date : '',
    deliverto : '',
    invoiceto : '',
    pay_mode : '',
    pay_term : '',
    ship_term : '',
    validation_error:''
  }

  //toster plugin
  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}

  constructor(private fb:FormBuilder , private http:HttpClient , private manualPoService : ManualPoService, private layoutChangerService : LayoutChangerService, private hotRegisterer: HotTableRegisterer, private snotifyService: SnotifyService) {
    this.today = new Date();
  }

  ngOnInit() {
    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Development',
      'Manual Purchase Order'
    ])

    this.initializeHeaderForm() //create order header form group
    this.initializeDetailsForm() //initilize order details form group
    this.initializeOrderLinesTable() //initialize handson table for order lines

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      const hotInstance = this.hotRegisterer.getInstance(this.instancee);
      if(hotInstance != undefined && hotInstance != null){
        hotInstance.render();
      }
    })

    this.loadCostDivision();
    this.loadSuppliers();
    this.loadCompany();
    // this.loadLocation();
    // this.loadCategories();

    //lisiten to the click event of orders table's edit button in StyleBuyerPoListComponent
    this.manualPoService.poData2.subscribe(data => {
      if(data != null && data.id != null){

        this.saveStatus = 'UPDATE'
        this.orderId = data.id
        this.processingConfirm = data.status
        //show loading alert befor loading purchase order header
        AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading Manual purchase order')
        this.loadingHeader = true
        this.loadingCountHeader = 0
        this.dataset = []
        this.loadOrderHeaderDetails(this.orderId)
        this.loadOrderLines(this.orderId)
      }
      else{//clear data if incorrect customer order selected
        this.saveStatus = 'SAVE'
        this.orderId = 0
        this.formHeader.reset()
      }
    })

  }

  loadCategories(){
    let _po_type = this.formHeader.get('po_type').value

    this.categoryList$ =  this.http.get<any[]>(this.apiUrl + 'merchandising/po_manual_details_non?type=loadCategory&po_type='+_po_type)
    .pipe(map(res => res['data']))
  }

  loadSubCategories() {
    let _category = this.formDetails.get('category').value
    _category = (_category == null || _category == '') ? '' : _category.category_id

    this.subCategoryList$ =  this.http.get<any[]>(this.apiUrl + 'merchandising/item-sub-categories?type=sub_category_by_category&category_id='+_category)
    .pipe(map(res => res['data']))
  }

  onCategoryChange(e){
    this.loadSubCategories()
  }

  onSubCategoryChange(e){
    this.loadpartDescription()
  }

  onItemChange(e){
    this.loadUOM()
  }

  loadUOM(){
    let _item = this.formDetails.get('description').value
    _item = (_item == null || _item == '') ? '' : _item.master_id

    this.uomList$ =  this.http.get<any[]>(this.apiUrl + 'merchandising/po_manual_details_non?type=loadUOM&item_id='+_item)
    .pipe(map(res => res['data']))
  }

  //load customer order header
  loadOrderHeaderDetails(id) {
    this.http.get(this.apiUrl + 'merchandising/po_manual_header/' + id)
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      this.formHeader.setValue({
        po_id : data.po_id,
        po_number : data.po_number,
        cost_center_id : data.cost_center_id,
        dept_id : data.dept_id,
        po_type : data.po_type,
        supplier : data.supplier,
        currency : data.po_def_cur,
        delivery_date : new Date(data.delivery_date),
        deliverto : data.location,
        // invoiceto : data.company,
        invoiceto : data.invoice_to,
        pay_mode : data.pay_mode,
        pay_term : data.pay_term,
        ship_term : data.ship_term,
        po_status : data.po_status,
        po_inv_type : data.po_inv_type,
        status : data.status,
        remark_header : data.remark_header
      })
      this.orderId = data.po_id
      this.supplierId = data.po_sup_id;
      this.currencyDivisions = data.currency_det;
      this.poNumber = data.po_number;
      this.poStatus = data.po_status;
      this.saveStatus = 'UPDATE'

      this.loadingCountHeader++;//use to view and hide loading message
      this.formHeader.get('supplier').disable();
      this.formHeader.get('po_type').disable();
      this.checkOrderOpenStatus()

    })
  }

  //load customer order lines
  loadOrderLines(id){
    this.dataset = []
    this.http.get(this.apiUrl + 'merchandising/po_manual_details?order_id='+id)
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      this.dataset = data
    })
  }

  //initialize form group for purchase order header
  initializeHeaderForm(){
    this.formHeader = this.fb.group({
      po_id:0,
      po_number:null,
      cost_center_id : null,
      dept_id: null,
      po_type:[null, [Validators.required]],
      supplier:[null, [Validators.required]],
      currency:null,
      delivery_date : [null , [Validators.required]],
      deliverto:[null , [Validators.required]],
      invoiceto:[null , [Validators.required]],
      pay_mode:null,
      pay_term:null,
      ship_term:null,
      po_status:null,
      po_inv_type:null,
      status:1,
      remark_header:null
    })
    this.formValidatorHeader = new AppFormValidator(this.formHeader , {})
  }

  //initialize form group for purchase order line
  initializeDetailsForm(){

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    this.formDetails = this.fb.group({
      id:0,
      po_header_id :0,
      po_no:null,
      line_no:0,
      category:[null, [Validators.required]],
      sub_category:[null, [Validators.required]],
      details_id : 0,
      inventory_part_id: null,
      description:[null, [Validators.required]],
      uom:[null, [Validators.required]],
      uom_id:null,
      item_currency:null,
      purchase_price:[null , [Validators.required, Validators.min(0), PrimaryValidators.isNumber, PrimaryValidators.maxDecimalLength(4)]],
      qty:[0 , [Validators.required , Validators.min(0), PrimaryValidators.isNumber, PrimaryValidators.maxDecimalLength(4)]],
      req_date:[null, [Validators.required]],
      total_value:null,
      po_status:null,
      po_inv_type:null,
      status: 1,
      remark_detail:null
    })
    let customErrorMessages = {
      qty : {  'min' : 'Value must be Greater than 0'  },
      purchase_price : {  'min' : 'Value must be Greater than 0'  }
    }
    this.formValidatorDetails = new AppFormValidator(this.formDetails,customErrorMessages)
  }

  //initilize details HotTableRegisterer
  initializeOrderLinesTable(){
    this.hotOptions = {
      columns: [
        { type: 'checkbox', title : 'Action' , readOnly: false , checkedTemplate: 'yes',  uncheckedTemplate: 'no' },
        { type: 'text', title : 'Status' , data: 'po_status' , readOnly: true, className: "htLeft"},
        { type: 'text', title : 'Line No' , data: 'line_no' , readOnly: true, className: "htRight"},
        { type: 'text', title : 'Material Description' , data: 'description', className: "htLeft" },
        { type: 'text', title : 'Delivery Date' , data: 'req_date', className: "htLeft" },
        { type: 'text', title : 'Purchase UOM' , data: 'uom', className: "htLeft" },
        { type: 'text', title : 'Currency' , data: 'item_currency', className: "htLeft"},
        { type: 'text', title : 'Purchase Price' , data: 'purchase_price', className: "htRight" },
        { type: 'text', title : 'Qty' , data: 'qty', className: "htRight" },
        { type: 'text', title : 'Total Value' , data: 'total_value', className: "htRight" },
        { type: 'text', title : 'Remark' , data: 'remark_detail', className: "htLeft" }
      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 250,
      stretchH: 'all',
      selectionMode: 'range',
      // fixedColumnsLeft: 5,
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
      cells : function(row, col, prop , value){ //table cell render event. works for every cell in the table
        var cellProperties = {};

        if(col == 1){
          cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
            var args = arguments;
            if(prop == 'po_status' && value == 'PLANNED'){
              td.style.background = '#9DFF98';
            }
            if(prop == 'po_status' && value == 'CANCELLED'){
              td.style.background = '#C6C8C4';
            }
            if(prop == 'po_status' && value == 'CONFIRMED'){
              td.style.background = '#9DFF98';
            }
            Handsontable.renderers.TextRenderer.apply(this, args);
          }
        }
        return cellProperties;
      },
      contextMenu : {
        callback: function (key, selection, clickEvent) {
          // Common callback for all options
        },
        items : {
          'add' : {
            name : 'Add New Detail',
            disabled:  (key, selection, clickEvent)=>{
              //Disable option when first row was clicked
              let formData = this.formHeader.getRawValue();
              const hotInstance = this.hotRegisterer.getInstance(this.instancee);
              console.log(hotInstance.getSelectedLast()[0])
              let sel_row = hotInstance.getSelectedLast()[0];
              if(formData['po_status'] == 'CANCELLED'){
                return hotInstance.getSelectedLast()[0] === sel_row
              }
              if(this.dataset.length != 0){
                let dible_row= this.dataset[sel_row]['po_status'];
                if(dible_row == 'CANCELLED'){
                  return hotInstance.getSelectedLast()[0] === sel_row
                }else if(dible_row == 'CONFIRMED'){
                  return hotInstance.getSelectedLast()[0] === sel_row
                }
              }
            },
            callback : (key, selection, clickEvent) => {
              this.contextMenuAdd();
            }
          },
          'edit' : {
            name : 'View / Edit Detail',
            disabled:  (key, selection, clickEvent)=>{
              // Disable option when first row was clicked
              let formData = this.formHeader.getRawValue();
              const hotInstance = this.hotRegisterer.getInstance(this.instancee);
              let sel_row = hotInstance.getSelectedLast()[0];
              if(formData['po_status'] == 'CANCELLED'){
                return hotInstance.getSelectedLast()[0] === sel_row
              }
              if(this.dataset.length != 0){
                let dible_row= this.dataset[sel_row]['po_status'];
                if(dible_row == 'CANCELLED'){
                  return hotInstance.getSelectedLast()[0] === sel_row
                }else if(dible_row == 'CONFIRMED'){
                  return hotInstance.getSelectedLast()[0] === sel_row
                }
              }
              else{
                return hotInstance.getSelectedLast()[0] === sel_row
              }
            },
            callback : (key, selection, clickEvent) => {
              if(selection.length > 0){
                let start = selection[0].start;
                this.contextMenuEdit(start.row)
              }
            }
          },
          'remove_row' : {
            name : 'Cancel Detail',
            disabled:  (key, selection, clickEvent)=>{
              // Disable option when first row was clicked
              let formData = this.formHeader.getRawValue();
              const hotInstance = this.hotRegisterer.getInstance(this.instancee);
              let sel_row = hotInstance.getSelectedLast()[0];
              if(formData['po_status'] == 'CANCELLED'){
                return hotInstance.getSelectedLast()[0] === sel_row
              }
              if(this.dataset.length != 0){
                let dible_row= this.dataset[sel_row]['po_status'];
                if(dible_row == 'CANCELLED'){
                  return hotInstance.getSelectedLast()[0] === sel_row
                }
                else if(dible_row == 'CONFIRMED'){
                  return hotInstance.getSelectedLast()[0] === sel_row
                }
              }
              else{
                return hotInstance.getSelectedLast()[0] === sel_row
              }
            },
            callback : (key, selection, clickEvent) => {
              if(selection.length > 0){
                let start = selection[0].start;
                this.contextMenuRemove(start.row)
              }
            }
          },
          'Duplicate' : {
            name : 'Duplicate Detail',
            disabled:  (key, selection, clickEvent)=>{
              // Disable option when first row was clicked
              let formData = this.formHeader.getRawValue();
              const hotInstance = this.hotRegisterer.getInstance(this.instancee);
              let sel_row = hotInstance.getSelectedLast()[0];
              if(formData['po_status'] == 'CANCELLED'){
                return hotInstance.getSelectedLast()[0] === sel_row
              }
              if(this.dataset.length != 0){
                let dible_row= this.dataset[sel_row]['po_status'];
                if(dible_row == 'CANCELLED'){
                  return hotInstance.getSelectedLast()[0] === sel_row
                }
                else if(dible_row == 'CONFIRMED'){
                  return hotInstance.getSelectedLast()[0] === sel_row
                }
              }
              else{
                return hotInstance.getSelectedLast()[0] === sel_row
              }
            },
            callback : (key, selection, clickEvent) => {
              if(selection.length > 0){
                let start = selection[0].start;
                this.contextMenuDuplicate(start.row)
              }
            }
          }
        }
      }
    }
  }

  //fire when click context menu - add
  contextMenuAdd(){
    this.formDetails.reset()
    this.saveStatusDetails = 'SAVE'
    this.modelTitle = 'Add Order Line'
    this.formDetails.get('uom').enable()
    this.formDetails.get('category').enable()
    this.formDetails.get('sub_category').enable()
    this.formDetails.get('description').enable()
    this.currentDataSetIndex = -1
    this.detailsModel2.show();
    //add new
    let currency = this.currencyDivisions[0]['currency_code'];
    this.formDetails.patchValue({item_currency:currency})
  }

  //context menu - edit
  contextMenuEdit(row){
    this.formDetails.reset()
    this.formDetails.get('uom').disable()
    this.formDetails.get('category').disable()
    this.formDetails.get('sub_category').disable()
    this.formDetails.get('description').disable()
    let selectedRowData = this.dataset[row]
    this.currentDataSetIndex = row
    this.loadOrderLineDetails(selectedRowData['id'])
    //add new
    let currency = this.currencyDivisions[0]['currency_code'];
    this.formDetails.patchValue({item_currency:currency})

    this.saveStatusDetails = 'UPDATE'
    this.detailsModel2.show()
  }

  //context menu - remove
  contextMenuRemove(line_id){

    AppAlert.showConfirm({
      'text' : 'Do you want to Cancel selected Manual Purchase Order Line'
    },(result) => {
      if (result.value) {
        this.removeLines(this.dataset[line_id]['id'],this.dataset[line_id]['po_status'],this.dataset[line_id]['po_header_id'])
      }
    })

  }

  removeLines(details_id,status,order_id){

    this.processingDetails = true
    AppAlert.showMessage('Processing...','Please wait while deleting details')
    this.http.post(this.apiUrl + 'merchandising/po_manual_header/remove_po_line' ,
    { 'id' : details_id , 'status' : status, 'po_header_id' : order_id } )
    .pipe( map( res => res['data']) )
    .subscribe(
      data => {
        if(data.status == 'success'){
          AppAlert.closeAlert()
          AppAlert.showSuccess({ text : data.message });
          this.processingDetails = false
          this.loadOrderHeaderDetails(order_id)
          this.loadOrderLines(order_id)

        }
        else{
          AppAlert.closeAlert()
          AppAlert.showError({ text : data.message });
          this.processingDetails = false
          this.loadOrderHeaderDetails(order_id)
          this.loadOrderLines(order_id)
        }
      },
      error => {
        //this.snotifyService.error('Process Error', this.tosterConfig);
        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showError({ text : 'Process Error' });
        } , 1000)
        this.processingDetails = false

      }
    )

  }

  //context menu - copy
  contextMenuDuplicate(line_id){

    AppAlert.showConfirm({
      'text' : 'Do you want to Copy (' + this.dataset[line_id]['line_no'] + ') line?',
      'confirmButtonText': "Yes, Copy it!"
      },(result) =>
      {
        if (result.value) {
          this.copyLines(this.dataset[line_id]['id'],this.dataset[line_id]['po_header_id'])

        } else if (result.value === 0) {

        }
      })

      }

  copyLines(line_id,order_id){

    this.processingDetails = true
    AppAlert.showMessage('Processing...','Please wait while copying details')
    this.http.post(this.apiUrl + 'merchandising/po_manual_details_non/copy_po_line' , {'line_id' : line_id } )
    .pipe( map( res => res['data']) )
    .subscribe(
      data => {
        if(data.status == 'success'){
          AppAlert.closeAlert()
          AppAlert.showSuccess({ text : data.message });
          this.processingDetails = false
          this.loadOrderLines(order_id)

        }
        else{
          //this.snotifyService.error(data.message, this.tosterConfig);
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({ text : data.message });
          } , 1000)
          this.processingDetails = false
        }
      },
      error => {
        //this.snotifyService.error('Process Error', this.tosterConfig);
        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showError({ text : 'Process Error' });
        } , 1000)
        this.processingDetails = false

      }
    )

  }

  loadOrderLineDetails(id){

    this.http.get(this.apiUrl + 'merchandising/po_manual_details_non/' + id)
    .pipe( map(res => res['data']))
    .subscribe(data => {
      this.modelTitle = 'Update Order Line'
      this.saveStatusDetails = 'UPDATE'
      var req_date = null
      if(data['req_date'] != null){
        req_date = new Date(data['req_date'])
      }
      let currency = this.currencyDivisions[0]['currency_code'];
      this.formDetails.patchValue({
        id: data['id'],
        po_header_id : data['po_header_id'],
        po_no : data['po_no'],
        line_no: data['line_no'],
        category: data['category'],
        sub_category: data['sub_category'],
        details_id : data['id'],
        req_date : req_date,
        inventory_part_id : data['inventory_part_id'],
        description : data['item'],
        uom_id: data['uom'],
        uom : data['uom']['uom_code'],
        item_currency : currency,
        purchase_price : data['purchase_price'],
        qty : data['qty'],
        total_value: data['total_value'],
        po_status : data['po_status'],
        po_inv_type : data['po_inv_type'],
        status: data['status'],
        // new line
        remark_detail: data['remark_detail']
      })
      this.loadUOM()
      this.detailsModel2.show()
    })

  }

  //check header data was loaded for selected purchase order
  checkOrderOpenStatus(){
    if(this.loadingCountHeader >= 1){
      this.loadingHeader = false
      this.loadingCountHeader = 0
      setTimeout(() => {
        AppAlert.closeAlert()
      } , 1000)
    }
  }

  //chek all data were loaded, if loaded active save button
  checkHeaderLoadingStatus(){
    if(this.loadingCountHeader >= 1){
      this.loadingHeader = false
      this.loadingCountHeader = 0
      setTimeout(() => {
        AppAlert.closeAlert()
      } , 1000)
    }
  }


  //chek all data were loaded, if loaded active save button
  checkDetailsLoadingStatus(){
    if(this.loadingCountDetails >= 1){
      this.loadingDetails = false
      this.loadingCountDetails = 0
      setTimeout(() => {
        AppAlert.closeAlert()
      } , 1000)
    }
  }

  //model show event
  modelShowEvent(e) {
    this.loadDetailsFormData();
  }

  //load customer order line data
  loadDetailsFormData(){
    // AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading data')
    this.loadingDetails = true;
    this.loadingCountDetails = 0
    if(!this.initializedDetails){
      this.initializedDetails = true
    }
    this.loadCategories();
    // this.loadpartDescription();
  }

  loadpartDescription(){
    let _category = this.formDetails.get('category').value
    let sub_category = this.formDetails.get('sub_category').value

    this.loadingCountDetails++;
    _category = (_category == null || _category == '') ? '' : _category.category_id
    sub_category = (sub_category == null || sub_category == '') ? '' : sub_category.subcategory_id

    this.partDes$ =  this.http.post<any[]>(this.apiUrl + 'merchandising/load_description', {_category:_category, sub_category:sub_category})
    .pipe(map(res => res['data']))
  }

  loadCostDivision() {
    this.http.get(this.apiUrl + 'merchandising/cost_dep_load')
    .pipe( map(res => res['data'] ))
    .subscribe(
      data => {
        this.costDepartments = data.cost;
        this.formHeader.setValue({
          po_id:0,
          po_number:null,
          cost_center_id: data.cost[0]['cost_center_id'],
          dept_id : data.cost[0]['dep_id'],
          po_type:null,
          supplier:null,
          currency:null,
          delivery_date : null,
          deliverto:null,
          invoiceto:data.cost[0]['company_id'],
          pay_mode:null,
          pay_term:null,
          ship_term:null,
          po_status:null,
          po_inv_type:null,
          status: 1,
          remark_header:null
        })
        let formData = this.formHeader.getRawValue();
      },
      error => {
        //console.log(error)
      }
    )
  }

  loadSuppliers() {
    this.supplier$ = this.supplierInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.supplierLoading = true),
      switchMap(term => this.http.get<Suppliers[]>(this.apiUrl + 'org/suppliers?type=currency' , {params:{search:term}})
      .pipe(
        //catchError(() => of([])), // empty list on error
        tap(() => this.supplierLoading = false)
      ))
    );
  }

  load_currency(data) {
    if(data == undefined){
      this.currencyId = null;
    }
    else{

      this.currencyId = data.supplier_id;
      this.supplierId = data.supplier_id;
      this.http.post(this.apiUrl + 'org/suppliers/load_currency' , { 'curid' : this.currencyId } )
      .pipe( map(res => res['data'] ))
      .subscribe(
        data => {
          this.currencyDivisions = data.currency
        },
        error => {
          console.log(error)
        }
      )
    }
  }

  loadCompany() {
    this.deliverto$ = this.delivertoInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.delivertoLoading = true),
      switchMap(term => this.http.get<Deliverto[]>(this.apiUrl + 'org/locations?type=auto' , {params:{search:term}})
      .pipe(
        //catchError(() => of([])), // empty list on error
        tap(() => this.delivertoLoading = false)
      ))
    );
  }

  // loadLocation() {
  //   this.invoiceto$ = this.invoicetoInput$
  //   .pipe(
  //     debounceTime(200),
  //     distinctUntilChanged(),
  //     tap(() => this.invoicetoLoading = true),
  //     switchMap(term => this.http.get<Invoiceto[]>(this.apiUrl + 'merchandising/load_company' , {params:{search:term}})
  //     .pipe(
  //       //catchError(() => of([])), // empty list on error
  //       tap(() => this.invoicetoLoading = false)
  //     ))
  //   );
  // }

  //save purchase order header
  saveHeader() {

    this.processingHeader = true
    //AppAlert.showMessage('Processing...','Please wait while saving details')

    let saveOrUpdate$ = null;
    let formData = this.formHeader.getRawValue();
    let del_date = new Date(formData['delivery_date']);

    formData['delivery_date'] = new Date(del_date.getTime() - (del_date.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
    formData['deliver_to'] = formData['deliverto']['loc_id']
    formData['po_sup_id'] = formData['supplier']['supplier_id']

    if(this.saveStatus == 'SAVE') {
      formData['po_def_cur'] = formData['supplier']['currency']
      formData['invoice_to'] = formData['invoiceto']
      formData['pay_mode'] = formData['supplier']['payment_mode']
      formData['pay_term'] = formData['supplier']['payemnt_terms']
      formData['ship_term'] = formData['supplier']['ship_terms_agreed']
      this.processingDetails = true
      saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/po_manual_header_non', formData)
      this.dataset = [] //clear order details table
    }
    else if(this.saveStatus == 'UPDATE') {
      formData['po_def_cur'] = formData['currency']
      formData['status'] = 1
      saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/po_manual_header_non/' + this.orderId , formData)
    }

    saveOrUpdate$
    .pipe( map(res => res['data'] ) )
    .subscribe(
      (res) => {

        this.formHeader.patchValue({po_number: res.newpo });
        this.formHeader.patchValue({po_status: res.savepo['po_status'] });
        this.formHeader.patchValue({po_id: res.savepo['po_id'] });
        this.orderId = res.savepo['po_id'];
        this.poStatus = res.savepo['po_status'];
        this.poNumber = res.newpo;
        this.saveStatus = 'UPDATE'
        this.processingHeader = false

        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showSuccess({text : res.message })
        } , 1000)

      },
      (error) => {
        this.processingHeader = false
        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showError({text : 'Process Error' })
        } , 1000)
        console.log(error)
      }
    );
  }

  //save purchase order details
  saveDetails(){
    if(!this.formValidatorDetails.validate())//if validation faild return from the function
    return;
    this.processingDetails = true
    AppAlert.showMessage('Processing...','Please wait while saving details')

    let formData = this.formDetails.getRawValue()
    if(formData['qty'] <= 0){
      AppAlert.showError({text : 'Qty Must Be Greater Than 0'})
      return;
    }

    console.log(formData)

    formData['po_header_id'] = this.orderId
    if(formData['req_date'] != null){
      formData['req_date'] = new Date(formData['req_date'].getTime() - (formData['req_date'].getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
    }else{
      formData['req_date'] = ''
    }
    formData['po_status'] = this.poStatus
    formData['po_no'] = this.poNumber
    formData['status'] = 1
    //new
    formData['category'] = formData['category']['category_id']
    formData['sub_category'] = formData['sub_category']['subcategory_id']
    //end new
    formData['inventory_part_id'] = formData['description']['master_id']
    formData['description'] = formData['description']['master_description']
    formData['uom_id'] = formData['uom']['uom_id']
    formData['uom'] = formData['uom']['uom_code']

    var tot_val = parseFloat(formData['purchase_price']) * parseFloat(formData['qty'])
    formData['total_value'] = parseFloat(tot_val.toString()).toFixed(4);
    formData['purchase_price'] = parseFloat(formData['purchase_price'].toString()).toFixed(4);

    if(this.saveStatusDetails == 'SAVE'){
      this.http.post(this.apiUrl + 'merchandising/po_manual_details_non' , formData)
      .pipe( map(res => res['data']) )
      .subscribe(data => {
        if(data['status']=="error"){

          AppAlert.closeAlert()
          this.processingDetails = false
          this.snotifyService.error(data['message'], this.tosterConfig)

        }else{

          if(data.PurchaseOrderDetails.po_status != 'CANCELLED'){ //add new line to table if it's status != CANCEL
          this.dataset.push(data.PurchaseOrderDetails)

        }
        this.formDetails.reset()
        //add new
        let currency = this.currencyDivisions[0]['currency_code'];
        this.formDetails.patchValue({item_currency:currency})
        //
        this.snotifyService.success(data.message, this.tosterConfig)
        this.processingDetails = false
        const hotInstance = this.hotRegisterer.getInstance(this.instancee);
        hotInstance.render();
        this.loadOrderLines(this.orderId)
        setTimeout(() => { AppAlert.closeAlert()   } , 1000)

      }
    },
    error => {
      this.processingDetails = false
      setTimeout(() => {
        AppAlert.closeAlert()
        AppAlert.showError({ text : 'Process Error' })
      } , 1000)
      //this.snotifyService.error('Inserting Error', this.tosterConfig)
    }
  )
}else if(this.saveStatusDetails == 'UPDATE') {
  this.http.put(this.apiUrl + 'merchandising/po_manual_details_non/' + formData['id']  , formData)
  .pipe( map(res => res['data']) )
  .subscribe(
    data => {
      if(data['status']=="error"){

        AppAlert.closeAlert()
        this.processingDetails = false
        this.snotifyService.error(data['message'], this.tosterConfig)

      }else{

        if(data.PurchaseOrderDetails.po_status == 'CANCELLED'){ //remove line from table if status = CANCEL
          this.dataset.splice(this.currentDataSetIndex,1);
        }
        else{
          this.dataset[this.currentDataSetIndex] = data.PurchaseOrderDetails
        }
        this.formDetails.reset()
        //add new
        let currency = this.currencyDivisions[0]['currency_code'];
        this.formDetails.patchValue({item_currency:currency})
        //
        this.detailsModel2.hide()
        this.snotifyService.success(data.message, this.tosterConfig);
        this.processingDetails = false
        setTimeout(() => { AppAlert.closeAlert()   } , 1000)
        const hotInstance = this.hotRegisterer.getInstance(this.instancee);
        hotInstance.render();
      }

    },
    error => {
      this.processingDetails = false
      setTimeout(() => {
        AppAlert.closeAlert()
        AppAlert.showError({ text : 'Process Error' })
      } , 1000)
      //this.snotifyService.error('Updating Error', this.tosterConfig);
    }
  )
}

}

//clear all data for new purchase order
newOrder() {
  if(this.formHeader.touched || this.formHeader.dirty || this.orderId > 0) {
    AppAlert.showConfirm({
      'text' : 'Do you want to clear all unsaved data?'
    },(result) => {
      if (result.value) {
        this.saveStatus = 'SAVE'
        this.formHeader.reset()
        this.formDetails.reset()
        this.formHeader.get('supplier').enable()
        this.formHeader.get('po_type').enable()
        this.orderId = 0
        this.poNumber = '';
        this.poStatus = '';
        this.supplierId = 0
        this.currencyDivisions = []
        this.processingConfirm = ''
        this.dataset = []
        this.loadCostDivision();
      }

    })
  }
}

//confirm purchase order
confirmOrder(){
  let formData = this.formHeader.getRawValue();

  if(formData['po_status'] == 'CANCELLED'){
    AppAlert.showError({ text : 'Non Inventory PO Already Cancelled.' });
    return;
  }
  AppAlert.showConfirm({
    'text' : 'Do you want to confirm this purchase order ?'
  },(result) => {
    if (result.value) {

      this.http.post(this.apiUrl + 'merchandising/po_manual_header/confirm_po' , { 'formData' : formData } )
      .pipe( map( res => res['data']) )
      .subscribe(
        data =>
        {
          AppAlert.showSuccess({ text : data.message });
          this.formHeader.patchValue({po_status: 'CONFIRMED' });
          this.processingDetails = true
          this.saveStatus = 'SAVE'
          this.formHeader.reset()
          this.formDetails.reset()
          this.formHeader.get('supplier').enable()
          this.formHeader.get('po_type').enable()
          this.orderId = 0
          this.poNumber = '';
          this.poStatus = '';
          this.supplierId = 0
          this.currencyDivisions = []
          this.dataset = []
          this.loadCostDivision();
        },
        error => {
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({ text : 'Process Error' });
          } , 1000)

        }
      )

    }
    if (result.dismiss) {

    }

  })
}


cancelOrder(){
  let formData = this.formHeader.getRawValue();
  AppAlert.showConfirm({
    'text' : 'Do you want to cancel this purchase order ?'
  },(result) => {
    if (result.value) {

      this.http.post(this.apiUrl + 'merchandising/po_manual_header/cancel_po' , { 'formData' : formData } )
      .pipe( map( res => res['data']) )
      .subscribe(
        data =>
        {
          AppAlert.showSuccess({ text : data.message });
          this.formHeader.patchValue({po_status: 'CANCELED' });
          this.formHeader.patchValue({status: 0 });
          this.processingDetails = true
          this.saveStatus = 'SAVE'
          this.formHeader.reset()
          this.formDetails.reset()
          this.formHeader.get('supplier').enable()
          this.formHeader.get('po_type').enable()
          this.orderId = 0
          this.poNumber = '';
          this.poStatus = '';
          this.supplierId = 0
          this.currencyDivisions = []
          this.dataset = []
          this.loadCostDivision();
          this.loadOrderLines(this.orderId)
        },
        error => {
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({ text : 'Process Error' });
          } , 1000)

        }
      )

    }
    if (result.dismiss) {

    }

  })
}

}
