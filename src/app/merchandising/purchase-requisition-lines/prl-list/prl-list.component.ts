import { Component, OnInit , ViewChild} from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
//declare var $:any;

import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
//import { AppValidator } from '../../core/validation/app-validator';
import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../../core/validation/primary-validators';
import { PrlService } from '../prl.service';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
import { AuthService } from '../../../core/service/auth.service';

import { Customer } from '../../../org/models/customer.model';
import { Item } from '../../../org/models/item.model';
import { Supplier } from '../../../org/models/supplier.model';
import { Cuspo } from '../../../org/models/customerpo.model';
import { Division } from '../../../org/models/division.model';
import { Style } from '../../models/style.model';
import { Lot } from '../../models/lot.model';
import { Salesorder } from '../../models/salesorder.model';
import { Po_type } from '../../../merchandising/models/po_type.model';

@Component({
  selector: 'app-prl-list',
  templateUrl: './prl-list.component.html',
  styleUrls: ['./prl-list.component.css']
})
export class PrlListComponent implements OnInit {

  @ViewChild(ModalDirective) detailsModel: ModalDirective;
  instance: string = 'instance';
  readonly apiUrl = AppConfig.apiUrl()
  customerId = null;
  customerDivisions : Array<Customer>
  modelTableTitle = ''
  formHeader : FormGroup
  formValidatorHeader : AppFormValidator
  saveStatus = 'SAVE'
  initializedHeader : boolean = false
  loadingHeader : boolean = false
  loadingCountHeader : number = 0
  processingHeader : boolean = false
  currentDataSetIndex : number = -1

  dataset: any[] = [];
  hotOptions: any;

  customer$: Observable<Customer[]>;//use to load style list in ng-select
  customerLoading = false;
  customerInput$ = new Subject<string>();
  selectedCustomer : any[];

  categoryList$: Observable<Array<any>>
  subCategoryList$: Observable<any[]>;

  style$: Observable<Style[]>;//use to load style list in ng-select
  styleLoading = false;
  styleInput$ = new Subject<string>();
  selectedStyle : any[];

  lotNumber$: Observable<Lot[]>;//use to load style list in ng-select
  lotNumberLoading = false;
  lotNumberInput$ = new Subject<string>();
  selectedlotNumber : any[];

  item$: Observable<Item[]>;//use to load style list in ng-select
  itemLoading = false;
  itemInput$ = new Subject<string>();
  selectedItem : any[];

  supplier$: Observable<Supplier[]>;//use to load style list in ng-select
  supplierLoading = false;
  supplierInput$ = new Subject<string>();
  selectedSupplier : any[];

  cuspo$: Observable<Cuspo[]>;//use to load style list in ng-select
  cuspoLoading = false;
  cuspoInput$ = new Subject<string>();
  selectedCuspo : any[];

  salesorder$: Observable<Salesorder[]>;//use to load style list in ng-select
  salesorderLoading = false;
  salesorderInput$ = new Subject<string>();
  selectedSalesorder : any[];

  locations$ : Observable<Location[]>

  BomStage$: Observable<Array<any>> //used to load bom stages in ng-select

  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}


  constructor(private fb:FormBuilder , private http:HttpClient , private hotRegisterer: HotTableRegisterer ,
   private snotifyService: SnotifyService, private prlService : PrlService,private layoutChangerService : LayoutChangerService,private auth : AuthService) { }

  ngOnInit() {
    this.initializePRLTable()
    this.loadHeaderFormData()
    this.initializeHeaderForm() //create
    this.loadCategories()

    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Merchandising',
      'Purchase Order'
    ])

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          if(hotInstance != undefined && hotInstance != null){
            hotInstance.render(); //refresh fg items table
          }

    })


  }

  initializeHeaderForm(){
    this.formHeader = this.fb.group({

      bom_stage_id : [null , [Validators.required]],
      customer : [null , [Validators.required]],
      category : null,
      style : null,
      sub_category : null,
      supplier : null,
      division : null,
      lot_number : null,
      projection_location : [null , [Validators.required]]

    })
    this.formValidatorHeader = new AppFormValidator(this.formHeader , {})
  }

  //initialize handsontable for customer order line table
  initializePRLTable(){
    this.hotOptions = {
      columns: [
        { type: 'checkbox', title : 'Action' , readOnly: false , checkedTemplate: 'yes',  uncheckedTemplate: 'no' },
        { type: 'text', title : 'Type' , data: 'type_created',className: "htLeft" },
        { type: 'text', title : 'RM In Date' , data: 'rm_in_date' ,className: "htLeft",width:100 },
        { type: 'text', title : 'Revised RM In Date' , data: 'pcd_01',className: "htLeft",width:100  },
        { type: 'text', title : 'FNG #' , data: 'fng_number' , readOnly: true,className: "htLeft" },
        { type: 'text', title : 'FNG Color' , data: 'color_name',className: "htLeft" },
        { type: 'text', title : 'SFG #' , data: 'sfg_code' , readOnly: true,className: "htLeft" },
        { type: 'text', title : 'SFG Color' , data: 'SFG_COL' , readOnly: true,className: "htLeft" },
        { type: 'text', title : 'Item Code' , data: 'mat_code' , readOnly: true,className: "htLeft"},
        { type: 'text', title : 'Item Description' , data: 'master_description',className: "htLeft" },
        { type: 'text', title : 'Item Category' , data: 'category_name',className: "htLeft" },
        { type: 'text', title : 'Material Color' , data: 'material_color',className: "htLeft" },
        { type: 'text', title : 'Material Size' , data: 'size_name',className: "htLeft"  },
        { type: 'text', title : 'Inventory UOM' , data: 'uom_code',className: "htLeft"  },
        { type: 'text', title : 'Std Price $' , data: 'unit_price',className: "htRight"  },
        { type: 'text', title : 'Purchase Price $' , data: 'purchase_price',className: "htRight"  },
        { type: 'text', title : 'Required Qty' , data: 'total_qty',className: "htRight"  },
        { type: 'text', title : 'Supplier' , data: 'supplier_name' ,className: "htLeft"},
        { type: 'text', title : 'Currency' , data: 'currency_code' ,className: "htLeft"},
        { type: 'text', title : 'BOM ID' , data: 'bom_id' , readOnly: true,className: "htLeft" },
        { type: 'text', title : 'Origin Type' , data: 'origin_type',className: "htLeft"  },
        { type: 'text', title : 'Customer PO' , data: 'po_no' , readOnly: true,className: "htLeft"  },
        { type: 'text', title : 'PO Qty' , data: 'req_qty',className: "htRight"  },
        { type: 'text', title : 'Qty with MOQ' , data: 'moq',className: "htRight"  },
        { type: 'text', title : 'Qty with MCQ' , data: 'mcq',className: "htRight"  },
        { type: 'text', title : 'Balance to Order' , data: 'bal_oder',className: "htRight"  },
        { type: 'text', title : 'Factory' , data: 'loc_name',className: "htLeft",width:250 },
        { type: 'text', title : 'PO Numbers' , data: 'po_nos',className: "htLeft" }


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
        //var data = this.dataset;//this.instance.getData();
        if(col == 1){
          cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
            var args = arguments;
            if(prop == 'type_created' && value == 'GFM'){
              td.style.background = '#ffcccc';
            }
            else if(prop == 'type_created' && value == 'GFS'){
              td.style.background = '#b3ff66';
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
            'merge' : {
              name : 'Create Purchase Order',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  this.contextMenuMerge()
                }
              }
            },

          }
      }
    }
  }

  loadCategories(){
    this.categoryList$ =  this.http.get<any[]>(this.apiUrl + 'merchandising/item-categories')
      .pipe(map(res => res['data']))
  }

  loadSubCategories() {

    let _category = this.formHeader.get('category').value
    _category = (_category == null || _category == '') ? '' : _category.category_id

    this.subCategoryList$ =  this.http.get<any[]>(this.apiUrl + 'merchandising/item-sub-categories?type=sub_category_by_category&category_id='+_category)
      .pipe(map(res => res['data']))
  }

  onCategoryChange(e){
    this.loadSubCategories()
  }

  //context menu - merge
  contextMenuMerge(){
    let arr = [];
    let str = '';
    let supplier = null
    let ship = null
    let item_cat = null
    let origin_t = null
    let loc_name = null
    //console.log(this.dataset[0]['0'])
    for(let x = 0 ; x < this.dataset.length ; x++)
    {
      console.log(this.dataset[x])
      if(this.dataset[x]['0'] != undefined && this.dataset[x]['0'] == 'yes'){

        if(supplier != null && (supplier != this.dataset[x]['supplier_name'])){
           if(this.dataset[x]['supplier_name'] == null){
             this.dataset[x]['supplier_name'] = supplier
             //continue
           }else{
             AppAlert.showError({text : 'Purchase Order must have same Supplier ' })
             return
           }
        }
        if(origin_t != null && (origin_t != this.dataset[x]['origin_type'])){
           AppAlert.showError({text : 'Purchase Order must have same Origin Type ' })
           return
        }

        if(item_cat != null && (item_cat != this.dataset[x]['category_name'])){
           AppAlert.showError({text : 'Purchase Order must have same Item Category ' })
           return
        }
        if(ship != null && (ship != this.dataset[x]['ship_mode'])){
           AppAlert.showError({text : "Purchase Order must have same Ship Mode " })
           return
        }
        if(loc_name != null && (loc_name != this.dataset[x]['loc_name'])){
           AppAlert.showError({text : "Purchase Order must have same Factory Location " })
           return
        }

        origin_t = this.dataset[x]['origin_type']
        supplier = this.dataset[x]['supplier_name']
        ship = this.dataset[x]['ship_mode']
        item_cat = this.dataset[x]['category_name']
        loc_name = this.dataset[x]['loc_name']
        //console.log(this.dataset[x])
        arr.push(this.dataset[x])
        str += this.dataset[x]['bom_id'] + ',';


      }
    }
    console.log(arr)
    if(arr.length == 0)
    {
    AppAlert.showError({ text : 'Please Select Line/Lines, Which You Want To Create PO' })
    }
    if(arr.length >= 1)
    {
      AppAlert.showConfirm({
        'text' : 'Do You Want To Create Purchase Order For Selected Line(s)?'
            },(result) => {
        //console.log(result)
        if (result.value) {
          this.mergerLines(arr)
        }
        if (result.dismiss) {
          //this.dataset = []
        }

      })
    }
  }


  mergerLines(lines){
    //this.prlService.changeData(null)
    AppAlert.showMessage('Processing...','Please wait while creating details')
    this.http.post(this.apiUrl + 'merchandising/po-manual-details/merge_save' , { 'lines' : lines } )
    .pipe( map( res => res['data']) )
    .subscribe(
      data => {


        if(data.status == 'error'){
          setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showError({ text : data.message });
          } , 1000)
          //this.snotifyService.error(data.message, this.tosterConfig);
        }
        else if(data.status == 'success'){
            setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({ text : data.message });
          } , 1000)
          this.loadOrderLines(data.merge_no)
        }

        else{
          //this.snotifyService.error(data.message, this.tosterConfig);
            setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({ text : data.message });
          } , 1000)
        }
      },
       error => {
        //this.snotifyService.error('Process Error', this.tosterConfig);
           setTimeout(() => {
           AppAlert.closeAlert()
           AppAlert.showError({ text : 'Process Error' });
         } , 1000)
        console.log(error)
      }
    )
  }

  loadOrderLines(data){

    this.prlService.changeData(data)
    this.dataset = []
    //alert(data)
  }

  loadHeaderFormData(){
    this.loadingHeader = true
    this.loadingCountHeader = 0
    if(!this.initializedHeader){
      this.BomStage$ = this.getBomStage();
      this.initializedHeader = true;
    }
    this.loadCustomer()
    this.loadStyles()
    this.loadItemDes()
    this.loadSuppliers()
    this.loadCustomerPo()
    this.loadSalesOrder()
    this.loadLotNumber()
    this.loadLocations()

    //this.loadCustomerOrderTypes()
    //this.loadOrderStatus()
  }

  searchFrom(){
    this.dataset = []
    let formData = this.formHeader.getRawValue();
    //formData['pcd_date'] = formData['pcd_date'].toISOString().split("T")[0]
    //console.log(formData)

    AppAlert.showMessage('Processing...','Please wait while loading details')
    this.http.post(this.apiUrl + 'merchandising/po-manual-details/load_bom_Details' , formData)
    //this.http.get(this.apiUrl + 'merchandising/purchase-req-list' , formData)
    .subscribe(data => {

      console.log(data)
      //this.dataset[this.currentDataSetIndex] = data.customer_list
      let count_ar = data['data']['load_list']['CREAT']['length'];
      for (var _i = 0; _i < count_ar; _i++)
      {

        data['data']['load_list']['CREAT'][_i]['bal_oder'] = parseFloat( (data['data']['load_list']['CREAT'][_i]['total_qty'] - data['data']['load_list']['CREAT'][_i]['req_qty']).toString()).toFixed(4);
        //data['data']['load_list'][_i]['bal_oder'] = data['data']['load_list'][_i]['po_balance_qty']
        if(data['data']['load_list']['CREAT'][_i]['bal_oder'] != 0)
        {
          this.dataset.push(data['data']['load_list']['CREAT'][_i])

        }

      }


      let count_ar2 = data['data']['load_list']['GFS']['length'];
      for (var _j = 0; _j < count_ar2; _j++)
      {

        data['data']['load_list']['GFS'][_j]['bal_oder'] = parseFloat( (data['data']['load_list']['GFS'][_j]['total_qty'] - data['data']['load_list']['GFS'][_j]['req_qty']).toString()).toFixed(4);
        //data['data']['load_list'][_i]['bal_oder'] = data['data']['load_list'][_i]['po_balance_qty']
        if(data['data']['load_list']['GFS'][_j]['bal_oder'] != 0)
        {
          this.dataset.push(data['data']['load_list']['GFS'][_j])

        }

      }


      const hotInstance = this.hotRegisterer.getInstance(this.instance);
      hotInstance.render()


      this.prlService.changeData(null)
      this.prlService.loadData(null)
      this.prlService.changeContextMenuSplit(null)


    setTimeout(() => { AppAlert.closeAlert() } , 1000)
     },
    error => {
      //this.snotifyService.error('Inserting Error', this.tosterConfig)
      setTimeout(() => { AppAlert.closeAlert() } , 1000)
    })


  }

  getBomStage(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'merchandising/bomstages?active=1&fields=bom_stage_id,bom_stage_description')
        .pipe(map(res => res['data']))
  }


  loadCustomer() {
       this.customer$ = this.customerInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.customerLoading = true),
          switchMap(term => this.http.get<Customer[]>(this.apiUrl + 'org/customers?type=auto' , {params:{search:term}})
          .pipe(
              //catchError(() => of([])), // empty list on error
              tap(() => this.customerLoading = false)
          ))
       );
   }

   load_divition(data) {
     if(data == undefined){
       this.customerId = null;
     }
     else{
       this.customerId = data.customer_id;
       //this.styleDescription = data.style_description
       this.http.get(this.apiUrl + 'org/customers/'+this.customerId)
       .pipe( map(res => res['data'] ))
       .subscribe(
         data => {
           console.log(data.divisions)
           //this.customerDetails = data.customer_code + ' / ' + data.customer_name
           this.customerDivisions = data.divisions
         },
         error => {
           //console.log(error)
         }
       )
       //this.customerDetails = ''
     }
     //console.log(data)
   }

   loadStyles() {
        this.style$ = this.styleInput$
        .pipe(
           debounceTime(200),
           distinctUntilChanged(),
           tap(() => this.styleLoading = true),
           switchMap(term => this.http.get<Style[]>(this.apiUrl + 'merchandising/customer-orders?type=style' , {params:{search:term}})
           .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.styleLoading = false)
           ))
        );
    }

    loadLocations(){
      this.locations$ = this.http.get<string[]>(this.apiUrl + 'org/locations?active=1&fields=loc_id,loc_name')
      .pipe( tap(res => { }),
        map(res => res['data'])
      )
    }

    loadLotNumber() {
         this.lotNumber$ = this.lotNumberInput$
         .pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.lotNumberLoading = true),
            switchMap(term => this.http.get<Lot[]>(this.apiUrl + 'merchandising/customer-orders?type=lot' , {params:{search:term}})
            .pipe(
                //catchError(() => of([])), // empty list on error
                tap(() => this.lotNumberLoading = false)
            ))
         );
     }


    loadItemDes() {
         this.item$ = this.itemInput$
         .pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.itemLoading = true),
            switchMap(term => this.http.get<Item[]>(this.apiUrl + 'merchandising/items?type=auto' , {params:{search:term}})
            .pipe(
                //catchError(() => of([])), // empty list on error
                tap(() => this.itemLoading = false)
            ))
         );
     }


     loadSuppliers() {
          this.supplier$ = this.supplierInput$
          .pipe(
             debounceTime(200),
             distinctUntilChanged(),
             tap(() => this.supplierLoading = true),
             switchMap(term => this.http.get<Supplier[]>(this.apiUrl + 'org/suppliers?type=auto' , {params:{search:term}})
             .pipe(
                 //catchError(() => of([])), // empty list on error
                 tap(() => this.supplierLoading = false)
             ))
          );
      }


      loadCustomerPo() {
           this.cuspo$ = this.cuspoInput$
           .pipe(
              debounceTime(200),
              distinctUntilChanged(),
              tap(() => this.cuspoLoading = true),
              switchMap(term => this.http.get<Cuspo[]>(this.apiUrl + 'merchandising/customer-order-details?type=auto' , {params:{search:term}})
              .pipe(
                  //catchError(() => of([])), // empty list on error
                  tap(() => this.cuspoLoading = false)
              ))
           );
       }


       loadSalesOrder() {
            this.salesorder$ = this.salesorderInput$
            .pipe(
               debounceTime(200),
               distinctUntilChanged(),
               tap(() => this.salesorderLoading = true),
               switchMap(term => this.http.get<Salesorder[]>(this.apiUrl + 'merchandising/customer-orders?type=auto' , {params:{search:term}})
               .pipe(
                   //catchError(() => of([])), // empty list on error
                   tap(() => this.salesorderLoading = false)
               ))
            );
        }






}
