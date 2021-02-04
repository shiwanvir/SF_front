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
//import { AppValidator } from '../../core/validation/app-validator';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { BuyerPoService } from './buyer-po.service';

//models
import { Fng } from '../../org/models/fng.model';
import { Country } from '../../org/models/country.model';
import { Division } from '../../org/models/division.model';
import { Customer } from '../../org/models/customer.model';
import { Location } from '../../org/models/location.model';
import { Style } from '../models/style.model';
import { OrderType } from '../models/order-type.model';


/*interface ProductDetails {
  details_id : number,
  style_color : string,
  style_description : string,
  pcd : any,
  rm_in_date : any,
  po_no : any,
  planned_delivery_date : any,
  fob : any,
  country : any,
  projection_location : any,
  order_qty : any,
  excess_presentage : any,
  planned_qty : any,
  delivery_status : any,
  ship_mode : any
}*/



@Component({
  selector: 'app-style-buyer-po',
  templateUrl: './style-buyer-po.component.html',
  styleUrls: []
})
export class StyleBuyerPoComponent implements OnInit {

    @ViewChild(ModalDirective) detailsModel: ModalDirective;
    instance: string = 'instance';
    readonly apiUrl = AppConfig.apiUrl()


    //header variables ........................................
    orderId = 0
    Split_user_vali = null
    new_order = 1
    orderCode = ''
    customerId = null;
    customerDetails : string = ''
    styleDescription : string = ''
    divisionId = null
    divisionDescription : string = ''
    //customerDivisions : Array<Customer>
    formHeader : FormGroup

    formValidatorHeader : AppFormValidator
    saveStatus = 'SAVE'
    initializedHeader : boolean = false
    loadingHeader : boolean = false
    loadingCountHeader : number = 0
    processingHeader : boolean = false
    userPermision : boolean = false

    style$: Observable<Style[]>;//use to load style list in ng-select
    styleLoading = false;
    styleInput$ = new Subject<string>();
    divisions$: Observable<Division[]>;
    orderTypes$ : Observable<OrderType[]>;
    //orderStatus$ : Observable<Array<string>>

    //orer details variables ...................................
    formDetails : FormGroup
    saveStatusDetails : string = 'SAVE'
    formValidatorDetails : AppFormValidator
    initializedDetails : boolean = false
    loadingDetails : boolean = false
    loadingCountDetails : number = 0
    processingDetails : boolean = false
    modelTitle = 'Add New Sales Order Line'
    currentDataSetIndex : number = -1
    deliveryStatus : string = ''
    today : Date
    rmdate : Date
    acdate : Date
    pcdDate : Date
    exfdate : Date
    acDate2 : Date
    wantdate : Date
    exf_Date : Date


    loadBomStage : Array<any>
    loadBuyName : Array<any>
    loadSeason : Array<any>

    loadColorType : Array<any>
    colors : Array<any>
    loadFngType : Array<any>
    loadFngcolour : Array<any>
    masterDescription = null

    loadFngcountry : Array<any>


    shipModes$ : Observable<Array<string>>
    //colors$ : Observable<Array<any>>
    locations$ : Observable<Location[]>

    //country$: Observable<Country[]>;//use to load country list in ng-select
    country$: Observable<any[]>;
    countryLoading = false;
    countryInput$ = new Subject<string>();
    selectedCountry: Country[]

    fng$: Observable<Fng[]>;//use to load country list in ng-select
    fngLoading = false;
    fngInput$ = new Subject<string>();
    selectedfng: Country[]

    //hot table variables ...............................................
    dataset: any[] = [];
    hotOptions: any

    billtoList$: Observable<Array<any>>
    shiptoList$: Observable<Array<any>>

    //toster plugin
    tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}


  constructor(private fb:FormBuilder , private http:HttpClient , private hotRegisterer: HotTableRegisterer ,
    private buyerPoService : BuyerPoService, private snotifyService: SnotifyService,private layoutChangerService : LayoutChangerService) {

    this.today = new Date();
    this.today.setDate(this.today.getDate() + 1);
   }


    onValueChangerm(value: Date) : void{

      if(value != null){
        this.formDetails.patchValue({
             ac_date : null,
             ex_factory_date : null,
             planned_delivery_date : null,
             pcd : new Date(value.getTime())
        })
        //this.exfdate = new Date(this.pcdDate.getTime())
        this.exfdate =  new Date(value.getTime())
        this.exfdate.setDate(this.pcdDate.getDate() + 1)
      }
    }


    onValueChange(value: Date) : void{
      if(value != null){
        this.pcdDate = value
        // this.formDetails.patchValue({
        //      rm_in_date : null,
        //      ac_date : null,
        //      ex_factory_date : null,
        //      planned_delivery_date : null
        // })
        this.rmdate = new Date(value.getTime())
        this.rmdate.setDate(this.rmdate.getDate() - 1)
      }
    }

    onValueChangeexfd(value: Date) : void{
      if(value != null){
        this.exf_Date = value
      //  console.log(this.exf_Date)
      //  console.log(this.formDetails.get('ac_date').value)
        if(this.exf_Date > this.formDetails.get('ac_date').value){
          this.formDetails.patchValue({
               ac_date : null,
               planned_delivery_date : null
          })
        }else{

        }

        this.acdate = new Date(this.exf_Date.getTime())
        this.acdate.setDate(this.exf_Date.getDate() + 1)
      }
    }

     onValueChangecwdac(value: Date) : void{
       if(value != null){
         this.acDate2 = value
         if(this.acDate2 > this.formDetails.get('planned_delivery_date').value){
           this.formDetails.patchValue({
                planned_delivery_date : null
           })
         }else{

         }

         //this.exfdate = new Date(this.acDate2.getTime())
         //this.exfdate.setDate(this.acDate2.getDate() + 1)
         this.wantdate = new Date(this.acDate2.getTime())
         this.wantdate.setDate(this.acDate2.getDate() + 1)
       }
     }



  ngOnInit() {
    this.new_order = 0
    console.log(this.new_order)

    this.initializeHeaderForm() //create order header form group
    this.initializeDetailsForm() // create delivery form group
    this.loadHeaderFormData() //load order header data
    this.initializeOrderLinesTable() //initialize handson table for order lines
    this.loadBillTo()
    this.loadShipTo()
    this.formHeader.get('lot_number').enable()
    //console.log(this.new_order)
    //lisiten to the click event of orders table's edit button in StyleBuyerPoListComponent
    this.buyerPoService.poData.subscribe(data => {
      if(data != null && data.id != null){

        this.Split_user_vali = data.check
        this.new_order = 1
        console.log(this.new_order)
        if(this.Split_user_vali != 1){
            this.userPermision = true
        }else{
            this.userPermision = false
        }

        this.saveStatus = 'UPDATE'
        this.orderId = data.id
        //show loading alert befor loading customer order header
        AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading Sales order')
        this.loadingHeader = true
        this.loadingCountHeader = 0

          this.loadOrderHeaderDetails(this.orderId)
          this.loadOrderLines(this.orderId)


      }
      else{//clear data if incorrect customer order selected
        this.saveStatus = 'SAVE'
        this.orderId = 0
        this.formHeader.reset()
        this.masterDescription = ''
      }
    })

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Merchandising',
      'Sales Order'
    ])

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          if(hotInstance != undefined && hotInstance != null){
            hotInstance.render(); //refresh fg items table
          }

    })

    //listen to the save button's click event of PoSplitComponent
    this.buyerPoService.splitStatus.subscribe(data => {
      if(data == true){
          AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading Sales Order lines')
          this.loadOrderLines(this.orderId)
          this.buyerPoService.changeSplitStatus(false)
      }
    })


    //console.log(this.new_order)

  }

  //initialize form group for customer order header
  initializeHeaderForm(){
    this.formHeader = this.fb.group({
      order_id : 0,
      order_style : [null , [Validators.required]],
      order_customer : [null , [Validators.required]],
      order_division : [null , [Validators.required]],
      //order_type : [null , [Validators.required]],
      order_season : [null , [Validators.required]],
      order_stage : [null , [Validators.required]],
      order_status : null,
    //  order_buy_name :  [null , [Validators.required]],
      order_buy_name :   null,
      lot_number :  [null , [Validators.min(0)]],
      pack_count : null,
      bill_to : [null , [Validators.required]],
      ship_to : [null , [Validators.required]],
    })
    this.formValidatorHeader = new AppFormValidator(this.formHeader , {})
  }

  //initialize form group for customer order line
  initializeDetailsForm(){
    this.formDetails = this.fb.group({
      details_id : 0,
      style_color : [null , [Validators.required]],
      style_description : [null/*,[Validators.required]*/],
      pcd : [null , [Validators.required]],
      rm_in_date : [null , [Validators.required]],
      po_no : [null , [Validators.required]],
      planned_delivery_date : [null , [Validators.required]],
      fob : [null , [Validators.required, PrimaryValidators.isNumber , Validators.min(0)]],
      country : [null , [Validators.required]],
      projection_location : [null , [Validators.required]],
      order_qty : [0 , [Validators.required , Validators.min(0)]],
      excess_presentage : [0 , [Validators.required , Validators.min(0)]],
      planned_qty : [0 , [Validators.required , Validators.min(0)]],
      fng_id : [null , [Validators.required]],
      ship_mode : [null , [Validators.required]],
      ex_factory_date : [null , [Validators.required]],
      colour_type : [null , [Validators.required]],
      ac_date : [null , [Validators.required]],
      cus_style_manual: null,
      order_qty_pcs : null
    })
    let customErrorMessages = {
      fob : {  'min' : 'Value must be greater than 0'  },
      order_qty : { 'min' : 'Value must be greater than 0' },
      planned_qty : { 'min' : 'Value must be greater than 0' },
      excess_presentage : { 'min' : 'Value must be greater than 0' }
    }
    this.formValidatorDetails = new AppFormValidator(this.formDetails,customErrorMessages)
  }

  //initialize handsontable for customer order line table
  initializeOrderLinesTable(){
    this.hotOptions = {
      columns: [
        // { type: 'checkbox', title : 'Action' , readOnly: false , checkedTemplate: 'yes',  uncheckedTemplate: 'no' },
        { type: 'text', title : 'Type' , data: 'type_created',className: "htLeft"},
        { type: 'text', title : 'Delivery Status' , data: 'delivery_status' },
        { type: 'text', title : 'FNG #' , data: 'master_code',className: "htLeft" },
        { type: 'text', title : 'Description' , data: 'master_description',className: "htLeft" },
        { type: 'text', title : 'Line No' , data: 'line_no' , readOnly: true,className: "htRight"},
        { type: 'text', title : 'FNG Color' , data: 'color_code' , readOnly: true,className: "htLeft" },
        { type: 'text', title : 'RM In Date' , data: 'rm_in_date_01',className: "htLeft" },
        { type: 'text', title : 'Revised RM In Date' , data: 'pcd_01',className: "htLeft" },
        { type: 'text', title : 'Customer Wanted Date' , data: 'planned_delivery_date_01' ,className: "htLeft"},
        { type: 'text', title : 'Ex-factory Date' , data: 'ex_factory_date_01',className: "htLeft" },
        { type: 'text', title : 'AC Date' , data: 'ac_date_01',className: "htLeft" },
        { type: 'text', title : 'PO No' , data: 'po_no',className: "htLeft" },
        { type: 'text', title : 'Shipment Mode' , data: 'ship_mode',className: "htLeft" },
        { type: 'text', title : 'FOB $' , data: 'fob' ,className: "htRight"},
        { type: 'text', title : 'Country' , data: 'country_description' ,className: "htLeft"},
        { type: 'text', title : 'Projection Location' , data: 'loc_name' ,className: "htLeft"},
        { type: 'text', title : 'Customer Style' , data: 'cus_style_manual',className: "htLeft" },
        { type: 'text', title : 'Order Qty Pack' , data: 'order_qty',className: "htRight" },
        { type: 'text', title : 'Excess %' , data: 'excess_presentage',className: "htRight" },
        { type: 'text', title : 'Planned Qty' , data: 'planned_qty',className: "htRight" },
        { type: 'text', title : 'PCS Qty' , data: 'ord_qty_pcs',className: "htRight" },
        { type: 'numeric', title : 'Total Value $' , data: 'total_value',className: "htRight",
          numericFormat:{ pattern: '0,0.0000', culture: 'en-US' /* this is the default culture, set up for USD*/ },
        }
      ],
      width: '100%',
      colHeaders: true,
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
        if(col == 0){
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
        if(col == 1){
          cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
            var args = arguments;

            if(prop == 'delivery_status' && value == 'PLANNED'){
              td.style.background = '#9DFF98';
            }else if(prop == 'delivery_status' && value == 'CANCELLED'){
              td.style.background = '#C6C8C4';
            }else if(prop == 'delivery_status' && value == 'RELEASED'){
              td.style.background = '#FFD298';
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
              name : 'New Delivery',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.instance);
                debugger
                let sel_row = hotInstance.getSelectedLast()[0];
                console.log(hotInstance.getSelectedLast())
                if(this.dataset.length != 0){
                   if(this.Split_user_vali == 0){
                    return hotInstance.getSelectedLast()[0] === sel_row
                  }
                }
              },
              callback : (key, selection, clickEvent) => {
                this.contextMenuAdd()
              }
            },
            'edit' : {
              name : 'View / Edit Delivery',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.instance);
                let sel_row = hotInstance.getSelectedLast()[0];

                if(this.dataset.length != 0){
                  let dible_row= this.dataset[sel_row]['delivery_status'];
                  if(dible_row == 'CANCELLED'){
                    return hotInstance.getSelectedLast()[0] === sel_row

                  }else if(this.Split_user_vali == 0){
                    return hotInstance.getSelectedLast()[0] === sel_row
                  }

                }else{return hotInstance.getSelectedLast()[0] === sel_row}
              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  this.contextMenuEdit(start.row)
                }
              }
            },
            'size' : {
              name : 'Size Breakup',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.instance);
                let sel_row = hotInstance.getSelectedLast()[0];
                if(this.dataset.length != 0){
                  let dible_row= this.dataset[sel_row]['delivery_status'];
                  if(dible_row == 'CANCELLED'){
                    return hotInstance.getSelectedLast()[0] === sel_row

                  }/*else if(dible_row == 'RELEASED'){
                    return hotInstance.getSelectedLast()[0] === sel_row

                  }*/else if(this.Split_user_vali == 0){
                    return hotInstance.getSelectedLast()[0] === sel_row
                  }
                }else{return hotInstance.getSelectedLast()[0] === sel_row}
              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  this.contextMenuSize(start.row)
                }
              }
            },
            'revison' : {
              name : 'Revisions / Origin',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.instance);
                let sel_row = hotInstance.getSelectedLast()[0];
                if(this.dataset.length != 0){

                }else{return hotInstance.getSelectedLast()[0] === sel_row}
              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  let data = this.dataset[start.row]
                  this.buyerPoService.changeRevisionLineData(data)
                }
              }
            },
            'split' : {
              name : 'Split Delivery',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.instance);
                let sel_row = hotInstance.getSelectedLast()[0];
                if(this.dataset.length != 0){
                  let dible_row= this.dataset[sel_row]['delivery_status'];
                  if(dible_row == 'CANCELLED'){
                    return hotInstance.getSelectedLast()[0] === sel_row

                  }else if(this.Split_user_vali == 0){
                    return hotInstance.getSelectedLast()[0] === sel_row
                  }
                  else if(dible_row != 'RELEASED'){
                    return hotInstance.getSelectedLast()[0] === sel_row
                  }
                }else{return hotInstance.getSelectedLast()[0] === sel_row}
              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  let data = this.dataset[start.row]
                  this.buyerPoService.changeSplitLineData(data)
                }
              }
            },
            /*
            'merge' : {
              name : 'Merge Deliveries',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.instance);
                let sel_row = hotInstance.getSelectedLast()[0];
                if(this.dataset.length != 0){
                  let dible_row= this.dataset[sel_row]['delivery_status'];
                  if(dible_row == 'CANCELLED'){
                    return hotInstance.getSelectedLast()[0] === sel_row

                  }else if(this.Split_user_vali == 0){
                    return hotInstance.getSelectedLast()[0] === sel_row
                  }
                }
              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  this.contextMenuMerge()
                }
              }
            },*/

            'Duplicate' : {
              name : 'Duplicate Delivery',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.instance);
                let sel_row = hotInstance.getSelectedLast()[0];
                if(this.dataset.length != 0){
                   if(this.Split_user_vali == 0){
                    return hotInstance.getSelectedLast()[0] === sel_row
                  }
                }else{return hotInstance.getSelectedLast()[0] === sel_row}
              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  this.contextMenuDuplicate(start.row)
                }
              }
            },
            'remove_row' : {
              name : 'Line Cancellation',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.instance);
                let sel_row = hotInstance.getSelectedLast()[0];
                if(this.dataset.length != 0){
                  let dible_row= this.dataset[sel_row]['delivery_status'];
                  if(dible_row == 'CANCELLED'){
                    return hotInstance.getSelectedLast()[0] === sel_row

                  }/*else if(dible_row == 'RELEASED'){
                    return hotInstance.getSelectedLast()[0] === sel_row

                  }*/else if(this.Split_user_vali == 0){
                    return hotInstance.getSelectedLast()[0] === sel_row
                  }
                }else{return hotInstance.getSelectedLast()[0] === sel_row}
              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  this.contextMenuRemove(start.row)
                }
              }
            },

            'released' : {
              name : 'Release',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.instance);
                let sel_row = hotInstance.getSelectedLast()[0];
                if(this.dataset.length != 0){
                  let dible_row= this.dataset[sel_row]['delivery_status'];
                  if(dible_row == 'CANCELLED'){
                    return hotInstance.getSelectedLast()[0] === sel_row

                  }else if(dible_row == 'RELEASED'){
                    return hotInstance.getSelectedLast()[0] === sel_row

                  }else if(this.Split_user_vali == 0){
                    return hotInstance.getSelectedLast()[0] === sel_row
                  }
                }else{return hotInstance.getSelectedLast()[0] === sel_row}
              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  let data = this.dataset[start.row]
                    this.contextMenuReleased(data)
                }
              }
            },
            /*
            'released_all' : {
              name : 'Released All',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  let data = this.dataset
                  this.contextMenuReleasedAll(data)
                }
              }
            },
            */

          }
      }
    }
  }



  //load customer order header data
  loadHeaderFormData(){
    this.loadingHeader = true
    this.loadingCountHeader = 0
    if(!this.initializedHeader){
      this.loadStyles()
      this.initializedHeader = true;
    }
    //this.loadDivisions()
    this.loadCustomerOrderTypes()
    //this.loadOrderStatus()
  }




  //load customer order line data
  loadDetailsFormData(){
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading data')
    this.loadingDetails = true;
    this.loadingCountDetails = 0
    if(!this.initializedDetails){
      //this.loadCountry()
      this.initializedDetails = true
    }
    this.formDetails.patchValue({ship_mode : 'SEA'})
    this.loadShipModes()
    this.loadLocations()
    //this.loadOrderStatus()
    //this.loadStyleColors(this.formHeader.get('order_style').value.style_id)
    //this.loadCostingStyleColours(this.formHeader.get('order_style').value.style_id,this.formHeader.get('order_season').value,this.formHeader.get('order_stage').value)
    this.loadColourType(this.formHeader.get('order_style').value.style_id)

    //console.log(this.formHeader.value)
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
    if(this.loadingCountDetails >= 3){
      this.loadingDetails = false
      this.loadingCountDetails = 0
      setTimeout(() => {
        AppAlert.closeAlert()
      } , 1000)
    }
  }

  //check header data was loaded for selected customer order
  checkOrderOpenStatus(){
    if(this.loadingCountHeader >= 1){
      this.loadingHeader = false
      this.loadingCountHeader = 0
      setTimeout(() => {
        AppAlert.closeAlert()
      } , 1000)
    }
  }


  //fire when click context menu - add
  contextMenuAdd(){
    this.formDetails.reset()
    this.masterDescription = ''
    this.loadColorType = []
    this.colors = []
    this.loadFngType = []
    this.saveStatusDetails = 'SAVE'
    this.modelTitle = 'Add Sales Order Line Details'
    this.currentDataSetIndex = -1
    this.deliveryStatus = ''
    this.formDetails.get('rm_in_date').enable()
    this.formDetails.get('colour_type').enable()
    this.formDetails.get('fng_id').enable()
    this.formDetails.get('style_color').enable()
    this.formDetails.get('country').enable()
    this.formDetails.get('order_qty').enable()
    this.formDetails.get('excess_presentage').enable()
    this.formDetails.get('ac_date').enable()
    this.formDetails.get('ex_factory_date').enable()
    this.formDetails.get('planned_delivery_date').enable()
    //create date validation
    //this.setDateValidation()
    this.detailsModel.show()

  }


  //context menu - edit
  contextMenuEdit(row){
    this.formDetails.reset()
    let selectedRowData = this.dataset[row]
    this.currentDataSetIndex = row
    if(this.dataset[row]['delivery_status']=='RELEASED')
    {
      console.log(this.formDetails.getRawValue())
      this.formDetails.get('rm_in_date').disable()
      this.formDetails.get('colour_type').disable()
      this.formDetails.get('fng_id').disable()
      this.formDetails.get('style_color').disable()
      this.formDetails.get('country').disable()
      this.formDetails.get('order_qty').disable()
      this.formDetails.get('excess_presentage').disable()
      this.formDetails.get('ac_date').disable()
      this.formDetails.get('ex_factory_date').disable()
      //this.formDetails.get('planned_delivery_date').disable()

    }else{

      this.formDetails.get('rm_in_date').enable()
      this.formDetails.get('colour_type').enable()
      this.formDetails.get('fng_id').enable()
      this.formDetails.get('style_color').enable()
      this.formDetails.get('country').enable()
      this.formDetails.get('order_qty').enable()
      this.formDetails.get('excess_presentage').enable()
      this.formDetails.get('ac_date').enable()
      this.formDetails.get('ex_factory_date').enable()
      this.formDetails.get('planned_delivery_date').enable()

    }






    this.loadOrderLineDetails(selectedRowData['details_id'])
    this.saveStatusDetails = 'UPDATE'

    //create date validation
    //this.setDateValidation()

    this.detailsModel.show()
  }



  //context menu - size
  contextMenuSize(row){
    let data = {
      details_id : this.dataset[row]['details_id'],
      order_qty : this.dataset[row]['order_qty'],
      planned_qty : this.dataset[row]['planned_qty'],
      excess_presentage : this.dataset[row]['excess_presentage']
    }
    this.buyerPoService.changeLineData(data)
  }


  //context menu - merge
  contextMenuMerge(){
    let arr = [];
    let str = '';
    let previousColor = null
    let previousCountry = null
    let rminDate = null
    let pcdDate = null
    let cwDate = null
    let exfacDate = null
    let acfacDate = null
    let poNumber = null
    let shipMode = null
    let fob = null
    let location = null
    let custStyle = null
    let excessPre = null
    let coloueType = null

    for(let x = 0 ; x < this.dataset.length ; x++){
      if(this.dataset[x]['0'] != undefined && this.dataset[x]['0'] == 'yes'){
        //console.log(this.dataset[x])
        /*if(previousColor != null && ((previousColor != this.dataset[x]['style_color']) || (previousCountry != this.dataset[x]['country']))){
           AppAlert.showError({text : 'Sales order delivers must have same style color and country' })
           return
        }*/
        if(previousCountry != null && (previousCountry != this.dataset[x]['country'])){
           AppAlert.showError({text : " Country should be equal !" })
           return
        }
        if(coloueType != null && (coloueType != this.dataset[x]['colour_type'])){
           AppAlert.showError({text : " Colour Type should be equal !" })
           return
        }
        if(previousColor != null && (previousColor != this.dataset[x]['style_color'])){
           AppAlert.showError({text : " Style Color should be equal !" })
           return
        }
        if(rminDate != null && (rminDate != this.dataset[x]['rm_in_date_01'])){
           AppAlert.showError({text : " Rm in dates should be equal !" })
           return
        }
        if(pcdDate != null && (pcdDate != this.dataset[x]['pcd_01'])){
           AppAlert.showError({text : " PCD dates should be equal !" })
           return
        }
        if(cwDate != null && (cwDate != this.dataset[x]['planned_delivery_date_01'])){
           AppAlert.showError({text : " Customer Wanted dates should be equal !" })
           return
        }
        if(exfacDate != null && (exfacDate != this.dataset[x]['ex_factory_date_01'])){
           AppAlert.showError({text : " Ex-factory dates should be equal !" })
           return
        }
        if(acfacDate != null && (acfacDate != this.dataset[x]['ac_date_01'])){
           AppAlert.showError({text : " AC dates should be equal !" })
           return
        }
        if(poNumber != null && (poNumber != this.dataset[x]['po_no'])){
           AppAlert.showError({text : " Po Number should be equal !" })
           return
        }
        if(shipMode != null && (shipMode != this.dataset[x]['ship_mode'])){
           AppAlert.showError({text : " Ship Mode should be equal !" })
           return
        }
        if(fob != null && (fob != this.dataset[x]['fob'])){
           AppAlert.showError({text : " FOB should be equal !" })
           return
        }
        if(location != null && (location != this.dataset[x]['loc_name'])){
           AppAlert.showError({text : " Projection Locations should be equal !" })
           return
        }
        if(custStyle != null && (custStyle != this.dataset[x]['cus_style_manual'])){
           AppAlert.showError({text : " Customer Style should be equal !" })
           return
        }
        if(excessPre != null && (excessPre != this.dataset[x]['excess_presentage'])){
           AppAlert.showError({text : " Excess Percentage should be equal !" })
           return
        }
        if(this.dataset[x]['delivery_status'] == 'CANCELLED'){
           AppAlert.showError({text : "Can't merge canceled order !" })
           return
        }
        coloueType = this.dataset[x]['colour_type']
        excessPre = this.dataset[x]['excess_presentage']
        custStyle = this.dataset[x]['cus_style_manual']
        location = this.dataset[x]['loc_name']
        fob = this.dataset[x]['fob']
        shipMode = this.dataset[x]['ship_mode']
        poNumber = this.dataset[x]['po_no']
        acfacDate = this.dataset[x]['ac_date_01']
        exfacDate = this.dataset[x]['ex_factory_date_01']
        cwDate = this.dataset[x]['planned_delivery_date_01']
        pcdDate = this.dataset[x]['pcd_01']
        rminDate = this.dataset[x]['rm_in_date_01']
        previousColor = this.dataset[x]['style_color']
        previousCountry = this.dataset[x]['country']
        arr.push(this.dataset[x]['details_id'])
        str += this.dataset[x]['line_no'] + ',';
      }
    }
  //  console.log(arr)
    if(arr.length > 1) {
      AppAlert.showConfirm({
        'text' : 'Do you want to merge (' + str + ') lines?'
      },(result) => {
        if (result.value) {
          this.mergerLines(arr)
        }
      })
    }
  }

  //context menu - remove
  contextMenuRemove(line_id){
    if(this.dataset['length'] == 0){return;}

     AppAlert.showConfirm({
       'text' : 'Do you want to Cancel selected Sales Order Line?'
     },(result) => {
       if (result.value) {

        this.removeLines(this.dataset[line_id]['details_id'],this.dataset[line_id]['delivery_status'],this.dataset[line_id]['order_id'])


       }
     })

  }

  contextMenuReleasedAll(line_details){
    if(this.dataset['length'] == 0){return;}
    let formData = this.formHeader.getRawValue();
    //console.log(formData['order_id'])
    AppAlert.showConfirm({
      'text' : 'Do you want to release all selected Sales Order Line?'
      },(result) => {
      if (result.value) {

        this.processingDetails = true

        this.http.post(this.apiUrl + 'merchandising/released_SO_All' ,{ 'details' : line_details  } )
        .pipe( map( res => res['data']) )
        .subscribe(
          data => {
            if(data.status == 'success'){
              setTimeout(() => {AppAlert.closeAlert()} , 1000)
              this.snotifyService.success(data.message, this.tosterConfig)
              this.processingDetails = false
              this.loadOrderLines(formData['order_id'])

            }
            else{
              setTimeout(() => {AppAlert.closeAlert()} , 1000)
              this.snotifyService.error(data.message, this.tosterConfig)
              this.processingDetails = false
              this.loadOrderLines(formData['order_id'])

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
    })

  }





  contextMenuReleased(line_details)
  {
    if(this.dataset['length'] == 0){return;}

    AppAlert.showConfirm({
      'text' : 'Do you want to release selected Sales Order Line?'
    },(result) => {
      if (result.value) {
        AppAlert.showMessage('Processing...','Please wait while releasing details')
        this.processingDetails = true

        this.http.post(this.apiUrl + 'merchandising/released_SO' ,{ 'details' : line_details  } )
        .pipe( map( res => res['data']) )
        .subscribe(
          data => {
            if(data.status == 'success'){

                this.loadOrderLines(line_details['order_id'])
                this.processingDetails = false
                this.snotifyService.success(data.message, this.tosterConfig)
                //AppAlert.showSuccess({text:data.message})
                const hotInstance = this.hotRegisterer.getInstance(this.instance);
                hotInstance.render();

                setTimeout(() => { AppAlert.closeAlert() } , 1000)
                this.formHeader.get('lot_number').disable()



            }
            else{

                AppAlert.closeAlert()
                this.snotifyService.error(data.message, this.tosterConfig)
                this.processingDetails = false
                this.loadOrderLines(line_details['order_id'])

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
    })

  }

  removeLines(details_id,status,order_id){

    this.processingDetails = true
    AppAlert.showMessage('Processing...','Please wait while deleting details')
    this.http.post(this.apiUrl + 'merchandising/cod/delete_line' ,
    { 'details_id' : details_id , 'status' : status, 'order_id' : order_id } )
    .pipe( map( res => res['data']) )
    .subscribe(
      data => {
        if(data.status == 'success'){
          AppAlert.closeAlert()
          this.snotifyService.success(data.message, this.tosterConfig)
          this.processingDetails = false
          this.loadOrderLines(order_id)

        }
        else{
          AppAlert.closeAlert()
          this.snotifyService.error(data.message, this.tosterConfig)
          this.processingDetails = false
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


  contextMenuDuplicate(line_id){
    if(this.dataset['length'] == 0){return;}
    AppAlert.showConfirm({
      'text' : 'Do you want to Copy (' + this.dataset[line_id]['line_no'] + ') line?',
      'input': 'checkbox',
      'inputPlaceholder': 'I WANT SIZE BREAKUP.',
      'confirmButtonText': "Yes, Copy it!"
    },(result) => {
      if (result.value) {
        //console.log(arr)
        this.copyLines(result.value,this.dataset[line_id]['details_id'],this.dataset[line_id]['order_id'])

      } else if (result.value === 0) {
        //console.log(arr)
        this.copyLines(result.value,this.dataset[line_id]['details_id'],this.dataset[line_id]['order_id'])

      }
    })

  }


  copyLines(check,line_id,order_id){

    this.processingDetails = true
    AppAlert.showMessage('Processing...','Please wait while copying details')
    this.http.post(this.apiUrl + 'merchandising/cod/copy_line' , { 'check' : check , 'line_id' : line_id } )
    .pipe( map( res => res['data']) )
    .subscribe(
      data => {
        if(data.status == 'success'){
          AppAlert.closeAlert()
          this.snotifyService.success(data.message, this.tosterConfig)
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







  //save customer order header details
  saveHeader() {

    if(!this.formValidatorHeader.validate())//if validation faild return from the function
      return;
    this.processingHeader = true
    AppAlert.showMessage('Processing...','Please wait while saving details')

    let saveOrUpdate$ = null;
    let formData = this.formHeader.getRawValue();
    //console.log(this.formHeader['value']['bill_to'])
    formData['order_style'] = formData['order_style']['style_id']
    formData['bill_to'] = formData['bill_to']['bill_to']
    formData['ship_to'] = formData['ship_to']['ship_to']



    if(this.saveStatus == 'SAVE') {
      saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/customer-orders', formData)
      this.dataset = [] //clear order details table
    }
    else if(this.saveStatus == 'UPDATE') {
      saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/customer-orders/' + formData.order_id , formData)
    }

    saveOrUpdate$
    .pipe( map(res => res['data'] ) )
    .subscribe(
      (res) => {
        //console.log(res)
        if(res.status=="error"){

          AppAlert.closeAlert()
          this.processingHeader = false
          this.snotifyService.error(res.message, this.tosterConfig)

        }else{
          this.orderId = res.customerOrder.order_id
          this.orderCode = res.customerOrder.order_code
          this.formHeader.controls.order_status.setValue(res.customerOrder.order_status)
          this.formHeader.controls.order_id.setValue(res.customerOrder.order_id)
          this.saveStatus = 'UPDATE'
          this.processingHeader = false
          //this.new_order = 1
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({text : res.message })
          } , 1000)
        }


     },
     (error) => {
       this.processingHeader = false
       setTimeout(() => {
         AppAlert.closeAlert()
         AppAlert.showError({text : 'Process Error' })
       } , 1000)
         //console.log(error)
     }
   );
  }


  //load customer order header
  loadOrderHeaderDetails(id) {
    //console.log(id)
    this.http.get(this.apiUrl + 'merchandising/customer-orders/' + id)
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      console.log(data)
      //debugger
      this.formHeader.setValue({
        order_id : data.order_id,
        order_style : data.style,
        order_customer : data.order_customer,
        order_division : data.order_division,
        //order_type : data.order_type,
        order_status : data.order_status,
        order_buy_name : data.order_buy_name,
        order_season : data.order_season,
        order_stage : data.order_stage,
        lot_number : data.lot_number,
        pack_count : null,
        bill_to : data.bill_to_list[0],
        ship_to : data.ship_to_list[0]
      })
      //this.customerDivisions = data.customer.divisions
      //this.loadBomStage = data['bom_stage']
      //this.loadSeason = data['season']
      this.loadSeason = data.season1
      this.loadBomStage = data.bom_stage1
      this.loadBuyName = data.buy_name
      //console.log(data.season)
      this.orderCode = data.order_code
      this.styleDescription = data.style.style_description
      //this.customerDetails = data.customer.customer_code + ' / ' + data.customer.customer_name
      this.customerDetails = data.customer.customer_name
      this.divisionDescription = data.division.division_description

      this.loadingCountHeader++;//use to view and hide loading message
      this.formHeader.get('order_style').disable()
      this.formHeader.get('order_season').disable()
      this.formHeader.get('order_stage').disable()
      this.formHeader.get('lot_number').disable()
      this.checkOrderOpenStatus()

      this.formHeader.patchValue({'pack_count' : data['pack_count'][0]['count']})

    })
  }


  //clear all data for new customer order
  newOrder() {
    if(this.formHeader.touched || this.formHeader.dirty || this.orderId > 0) {
      AppAlert.showConfirm({
        'text' : 'Do you want to clear all unsaved data?'
      },(result) => {
        if (result.value) {
          this.saveStatus = 'SAVE'
          this.formHeader.reset()
          this.masterDescription = ''
          this.formDetails.reset()
          this.orderId = 0
          this.orderCode = ''
          this.customerDetails = ''
          this.styleDescription = ''
          this.divisionDescription = ''
          this.loadSeason = []
          this.loadColorType = []
          this.loadBomStage = []
          this.loadBuyName = []
          this.dataset = []
          this.formHeader.get('order_style').enable()
          this.formHeader.get('order_season').enable()
          this.formHeader.get('order_stage').enable()
          this.formHeader.get('lot_number').enable()
          this.formDetails.get('rm_in_date').enable()
          this.formDetails.get('colour_type').enable()
          this.formDetails.get('fng_id').enable()
          this.formDetails.get('style_color').disable()
          this.formDetails.get('country').disable()
          this.formDetails.get('order_qty').enable()
          this.formDetails.get('excess_presentage').enable()
          this.formDetails.get('ac_date').enable()
          this.formDetails.get('ex_factory_date').enable()
          this.formDetails.get('planned_delivery_date').enable()
          this.userPermision = false
        //  this.new_order = 1
        }

      })
    }
  }


  //save customer order line
  saveDetails()
  {
      if(!this.formValidatorDetails.validate())//if validation faild return from the function
        return;
      this.processingDetails = true
      AppAlert.showMessage('Processing...','Please wait while saving details')

      let formData = this.formDetails.getRawValue()
      formData['pcd'] = this.formatFormDate(formData.pcd)
      formData['rm_in_date'] = this.formatFormDate(formData.rm_in_date)
      formData['planned_delivery_date'] = this.formatFormDate(formData.planned_delivery_date)
      formData['ex_factory_date'] = this.formatFormDate(formData.ex_factory_date)
      formData['ac_date'] = this.formatFormDate(formData.ac_date)
      formData['order_name'] = formData['country']['country_name'],
      //formData['country'] = formData['country']['country_id']
      formData['order_id'] = this.orderId;

      //console.log(formData);

      if(this.saveStatusDetails == 'SAVE'){
          this.http.post(this.apiUrl + 'merchandising/customer-order-details' , formData)
          .pipe( map(res => res['data']) )
          .subscribe(data => {
            //console.log(data)
            if(data['status']=="error"){

              AppAlert.closeAlert()
              this.processingDetails = false
              this.snotifyService.error(data['message'], this.tosterConfig)

            }else{

            if(data.customerOrderDetails.delivery_status != 'CANCELLED'){ //add new line to table if it's status != CANCEL

            var tot_val = parseFloat(data['customerOrderDetails']['fob']) * parseFloat(data['customerOrderDetails']['order_qty'])
            data['customerOrderDetails']['total_value'] = parseFloat(tot_val.toString()).toFixed(4);
            this.dataset.push(data.customerOrderDetails)

            }
            this.loadOrderLines(data.order_id)
            this.formDetails.reset()
            this.masterDescription = ''
            this.snotifyService.success(data.message, this.tosterConfig)
            this.processingDetails = false
            this.formDetails.patchValue({ship_mode : 'SEA'})

            setTimeout(() => {
              AppAlert.closeAlert()
              const hotInstance = this.hotRegisterer.getInstance(this.instance);
              hotInstance.render();
            } , 1000)



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
      }
      else if(this.saveStatusDetails == 'UPDATE') {
        this.http.put(this.apiUrl + 'merchandising/customer-order-details/' + formData['details_id']  , formData)
        .pipe( map(res => res['data']) )
        .subscribe(
          data => {
            if(data['status']=="error"){

              AppAlert.closeAlert()
              this.processingDetails = false
              this.snotifyService.error(data['message'], this.tosterConfig)

            }else{

            if(data.customerOrderDetails.delivery_status == 'CANCELLED'){ //remove line from table if status = CANCEL
              this.dataset.splice(this.currentDataSetIndex,1);
            }
            else{
              console.log(data['customerOrderDetails'])
              var tot_val = parseFloat(data['customerOrderDetails']['fob']) * parseFloat(data['customerOrderDetails']['order_qty'])
              data['customerOrderDetails']['total_value'] = parseFloat(tot_val.toString()).toFixed(4);
              data['customerOrderDetails']['ord_qty_pcs'] = data['customerOrderDetails']['order_qty'] * this.formHeader.get('pack_count').value;
              this.dataset[this.currentDataSetIndex] = data.customerOrderDetails

            }
            this.formDetails.reset()
            this.masterDescription = ''
            this.detailsModel.hide()
            this.snotifyService.success(data.message, this.tosterConfig);
            this.processingDetails = false
            setTimeout(() => {
              AppAlert.closeAlert()
              const hotInstance = this.hotRegisterer.getInstance(this.instance);
              hotInstance.render();
            } , 1000)

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

  //calculate planned qty when change order qty and excess presentage
  calculatePlannedQty(){
    let pack_count = this.formHeader.get('pack_count').value
    let orderQty = this.formDetails.get('order_qty').value
    let excessPresentage = this.formDetails.get('excess_presentage').value
    let plannedQty = Math.ceil(((orderQty * excessPresentage) / 100) + orderQty)
    this.formDetails.patchValue({planned_qty : plannedQty})

    let packCount = Math.ceil(orderQty * pack_count)
    this.formDetails.patchValue({order_qty_pcs : packCount})
  }


  loadOrderLineDetails(id){
    let pack_count = this.formHeader.get('pack_count').value

    this.http.get(this.apiUrl + 'merchandising/customer-order-details/' + id)
    .pipe( map(res => res['data']))
    .subscribe(data => {
        console.log(data)
        this.modelTitle = 'Update Sales Order Line Details'
        this.saveStatusDetails = 'UPDATE'
        this.formDetails.setValue({
          details_id : data['details_id'],
          style_description : data['style_description'],
          rm_in_date : new Date(data['rm_in_date']),
          pcd : new Date(data['pcd']),
          po_no : data['po_no'],
          fob : data['fob'][0]['fob'],
          fng_id : data['style_fng'][0]['master_id'],
          style_color : data['style_colour'][0]['color_id'],
          country : data['country'][0]['country_id'],
          projection_location : data['projection_location'],
          order_qty : data['order_qty'],
          excess_presentage : data['excess_presentage'],
          planned_qty : data['planned_qty'],
          ship_mode : data['ship_mode'],
          colour_type : data['colour_type'],
          ex_factory_date : new Date(data['ex_factory_date']),
          ac_date : new Date(data['ac_date']),
          planned_delivery_date : new Date(data['planned_delivery_date']),
          cus_style_manual : data['cus_style_manual'],
          order_qty_pcs : ( data['order_qty'] * pack_count )
        })
        this.formDetails.get('pcd').setErrors(null)
        this.loadFngType = data['style_fng']
        this.loadFngcolour = data['style_colour']
        this.loadFngcountry = data['country']
        this.loadColorType = data.col_type
        this.deliveryStatus = data['delivery_status']
        this.formDetails.get('fob').disable()
        if(data['type_created'] == "GFS"){
          this.formDetails.get('order_qty').disable()
          this.formDetails.get('excess_presentage').disable()
        }else{
          //this.formDetails.get('order_qty').enable()
          //this.formDetails.get('excess_presentage').enable()
        }
        this.masterDescription = data['item_des'][0];
        this.detailsModel.show()
    })
  }

  //merge multiple
  mergerLines(lines){
    AppAlert.showMessage('Processing...','Please wait while merging details')
    this.http.post(this.apiUrl + 'merchandising/customer-order-details/merge' , { 'lines' : lines } )
    .pipe( map( res => res['data']) )
    .subscribe(
      data => {
        if(data.status == 'success'){
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({ text : data.message });
          } , 1000)
          this.loadOrderLines(this.orderId)
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


  //model show event
  modelShowEvent(e) {
//    debugger
    this.loadDetailsFormData()
    document.getElementById('aaaa').click()
  }


  //customer order header style change event
  changeStyle(data) {
    if(data == undefined){
      //clear fields
      this.customerId = null;
      this.customerDetails = ''
      this.styleDescription = ''
      this.divisionId = null
      this.divisionDescription = ''
      this.loadSeason = []
      this.loadBomStage = []
      this.loadBuyName = []
      this.loadColorType = []
    }
    else{
      this.customerId = data.customer_id;
      this.styleDescription = data.style_description
      this.divisionId = data.division_id
      this.divisionDescription = data.division_description
      this.customerDetails = data.customer_code + ' / ' + data.customer_name

      console.log(data)

      this.http.post(this.apiUrl + 'merchandising/load_header_season' ,{ 'style_id' : data.style_id })
      .pipe( map(res => res['data'] ))
      .subscribe(
        data => {
          //console.log(data['bom_stage'])
          //this.loadBomStage = data['bom_stage']
          //console.log(data['season'])
          this.loadSeason = data['season']
        },
        error => {
        }
      )

    }
    //console.log(data)
  }

  changeStage(data){

    let formData = this.formHeader.getRawValue();
    //console.log(formData['order_style']['style_id'])
    this.http.post(this.apiUrl + 'merchandising/load_header_stage' ,{ 'style_id' : formData['order_style']['style_id'], 'season_id' : formData['order_season'] })
    .pipe( map(res => res['data'] ))
    .subscribe(
      data => {
        //console.log(data)
        this.loadBomStage = data['bom_stage']
        this.loadingHeader = false
        //this.loadSeason = data['season']
      },
      error => {
      }
    )

  }

  changeBuyName(data){

    let formData = this.formHeader.getRawValue();
    //console.log(formData)
    this.http.post(this.apiUrl + 'merchandising/load_header_buy_name' ,{
      'style_id' : formData['order_style']['style_id'],
      'season_id' : formData['order_season'],
      'order_id' : formData['order_stage']
     })
    .pipe( map(res => res['data'] ))
    .subscribe(
      data => {
        console.log(data['buy_name']['length'])
        if(data['buy_name']['length'] > 0){
          this.formHeader.get('order_buy_name').enable()
        }else{
          this.formHeader.get('order_buy_name').disable()
        }

        this.formHeader.patchValue({'order_buy_name' : data['buy_name'][0]['buy_id']})
        this.loadBuyName = data['buy_name']
        this.loadingHeader = false
        this.formHeader.patchValue({'pack_count' : data['pack_count'][0]['count']})
        //this.loadSeason = data['season']
      },
      error => {
      }
    )

  }





  /*changeStyleCol(w){
    //console.log();
    let style  = this.formHeader.get('order_style').value.style_id
    let season = this.formHeader.get('order_season').value
    let stage  = this.formHeader.get('order_stage').value
    let c_type  = w['target'].value

    this.http.post(this.apiUrl + 'merchandising/change_style_colour' ,
    { 'color_t' : c_type, 'style_id' : style, 'season_id' : season, 'stage_id' : stage })
    .pipe( map(res => res['data'] ))
    .subscribe(
      data => {
        //console.log(data['fob'][0])
        this.colors = data['style_colour']
        this.formDetails.patchValue({fob : data['fob'][0]['fob']})
        this.formDetails.get('fob').disable()
        //this.loadingHeader = false
        //this.loadSeason = data['season']
      },
      error => {
      }
    )


  }*/

  loadFng(w){
    //console.log();
    let style  = this.formHeader.get('order_style').value.style_id
    let season = this.formHeader.get('order_season').value
    let stage  = this.formHeader.get('order_stage').value
    let c_type  = w['target'].value

    this.http.post(this.apiUrl + 'merchandising/load_fng' ,
    { 'color_t' : c_type, 'style_id' : style, 'season_id' : season, 'stage_id' : stage })
    .pipe( map(res => res['data'] ))
    .subscribe(
      data => {

        //console.log(this.formDetails)
        this.loadFngType = data['item_fng_details']
        //this.masterDescription = data['item_fng_details'][0];
        //this.formDetails.patchValue({fng_id : data['item_fng_details'][0]['master_id']})
        //this.formDetails.patchValue({style_color : data['item_fng_details'][0]['color_id']})
        //this.country$ = []

        this.formDetails.get('fob').disable()
        this.formDetails.get('style_color').disable()
        this.formDetails.get('country').disable()

      },
      error => {
      }
    )


  }

  loadStyleColour(w){

    let fng  = w['target'].value
    console.log(fng)

    this.http.post(this.apiUrl + 'merchandising/load_fng_colour' ,{ 'fng' : fng })
    .pipe( map(res => res['data'] ))
    .subscribe(
      data => {
        console.log(data)
        this.formDetails.get('country').reset()
        this.formDetails.patchValue({style_color : data['item_fng_colour'][0]['color_id']})
        this.formDetails.patchValue({country : data['country'][0]['country_id']})

        this.loadFngcolour = data['item_fng_colour']
        this.loadFngcountry = data['country']
        this.formDetails.patchValue({fob : data['fob'][0]['fob']})
        this.masterDescription = data['descrip'][0];

        //this.country$ =  this.http.get<any[]>(this.apiUrl + 'org/countries?type=auto_2&master_id='+fng)
        //.pipe(map(res => res['data']))

      },
      error => {
      }
    )

  }

  //load styles list
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

   //load country list
   /*loadCountry() {
        this.country$ = this.countryInput$
        .pipe(
           debounceTime(200),
           distinctUntilChanged(),
           tap(() => this.countryLoading = true),
           switchMap(term => this.http.get<Country[]>(this.apiUrl + 'org/countries?type=auto' , {params:{search:term}})
           .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.countryLoading = false)
           ))
        );
    }*/


   /*formValidateHeader(){ //validate the form on input blur event
       this.appValidatorHeader.validate();
   }*/

   /*formValidateDetails(){ //validate the form on input blur event
       this.appValidatorDetails.validate();

   }*/

   //show style color discription when code chane
   styleColorChange() {
     this.formDetails.get('style_description').setValue('Test style description')
   }


   //load customer order lines
   loadOrderLines(id){
     this.dataset = []
     this.http.get(this.apiUrl + 'merchandising/customer-order-details?order_id='+id)
     .pipe( map(res => res['data']) )
     .subscribe(data => {


       this.dataset = data
       console.log(this.dataset)
       this.formDetails.get('fob').disable()
       /*const hotInstance = this.hotRegisterer.getInstance(this.instance)
       hotInstance.render()*/
       /*setTimeout(() => {
         AppAlert.closeAlert()
       } , 1000)*/
     })
   }


   //load customer order header divisions
   loadDivisions(){
     this.divisions$ = this.http.get<Division[]>(this.apiUrl + 'org/divisions?active=1&fields=division_id,division_description')
     .pipe(
       tap(res => {
         this.loadingCountHeader++;
         this.checkHeaderLoadingStatus()
       }),
       map(res => res['data'])
     )
   }

   //load customer order types
   loadCustomerOrderTypes(){
     this.orderTypes$ = this.http.get<OrderType[]>(this.apiUrl + 'merchandising/customer-order-types?active=1')
     .pipe(
       tap(res => {
         this.loadingCountHeader++;
         this.checkHeaderLoadingStatus()
       }),
       map(res => res['data'])
     )
   }


   /*loadOrderStatus(){
     this.orderStatus$ = this.http.get<string[]>(this.apiUrl + 'core/status?type=CUSTOMER_ORDER')
     .pipe(
       tap(res => {
         this.loadingCountDetails++;
         this.checkDetailsLoadingStatus()
       }),
       map(res => res['data'])
     )
   }*/


   //load order line ship modes
   loadShipModes(){
     this.shipModes$ = this.http.get<string[]>(this.apiUrl + 'org/ship-modes?active=1&fields=ship_mode')
     .pipe(
       tap(res => {
         this.loadingCountDetails++;
         this.checkDetailsLoadingStatus()
       }),
       map(res => res['data'])
     )
   }

   //load order line projection locations
   loadLocations(){
     this.locations$ = this.http.get<string[]>(this.apiUrl + 'org/locations?active=1&fields=loc_id,loc_name')
     .pipe(
       tap(res => {
         this.loadingCountDetails++;
         this.checkDetailsLoadingStatus()
       }),
       map(res => res['data'])
     )
   }

   loadBillTo(){
     this.billtoList$ =  this.http.get<any[]>(this.apiUrl + 'merchandising/customer-orders?type=load_bill_to')
       .pipe(map(res => res['data']))
   }

   loadShipTo(){
     this.shiptoList$ =  this.http.get<any[]>(this.apiUrl + 'merchandising/customer-orders?type=load_ship_to')
       .pipe(map(res => res['data']))
   }

   //load order line style colors
   // loadStyleColors(style){
   //   this.colors$ = this.http.get<Array<any>>(this.apiUrl + 'merchandising/customer-order-details?type=style_colors&style='+style)
   //   .pipe(
   //     tap(res => {
   //       this.loadingCountDetails++;
   //       this.checkDetailsLoadingStatus()
   //     }),
   //     map(res => res['data'])
   //   )
   // }

   //load colour types

   loadColourType(style){

     this.http.post(this.apiUrl + 'merchandising/load_colour_type' ,{ 'style_id' : style })
     .pipe( map(res => res['data'] ))
     .subscribe(
       data => {
         this.loadingCountDetails++;
         this.loadColorType = data['colour_type']
         this.checkDetailsLoadingStatus()
       },
       error => {
       }
     )

   }


   formatFormDate(_dateObj){
     if(_dateObj != null && _dateObj != ''){
       let _year = _dateObj.getFullYear()
       let _month = (_dateObj.getMonth() < 9) ? '0' + (_dateObj.getMonth() + 1) : (_dateObj.getMonth() + 1)
       let _day = _dateObj.getDate()
       let dateStr = _year + '-' + _month + '-' + _day
       return dateStr
     }
     else{
       return null
     }
   }



   //pcd change event
   /*onPcdChange(value: Date) : void{
     if(value != null){
       //this.pcdMinDate = value
       this.formDetails.patchValue({
         rm_in_date : null,
         planned_delivery_date : null
       })
       debugger
      console.log(value.getDate())
       console.log(value.getDate() + 1)
       this.rmMaxDate = new Date(value.getTime())
       //this.deliveryMindate = value
       this.rmMaxDate.setDate(this.rmMaxDate.getDate() - 1)
       this.deliveryMindate.setDate(this.deliveryMindate.getDate() + 1)
     }
   }*/

   //rm in date change event
   /*onRmDateChange(value : Date) : void {
     if(value != null){
       //this.rmMaxDate = value
       this.formDetails.patchValue({
         pcd : null,
         planned_delivery_date : null
       })
      // debugger
       //this.pcdMinDate = value
       //this.deliveryMindate = value
       let d = new Date(value.getTime())
       this.pcdMinDate.setDate(d.getDate() + 1)
       this.deliveryMindate.setDate(d.getDate() + 2)
     }
   }*/

   /*setDateValidation(){
     //disable previous dates for pcd
     this.pcdMinDate = new Date()
     this.pcdMinDate.setDate(this.pcdMinDate.getDate() + 1);
     //disable previous dates for rm in date
   //  this.rmMaxDate = date
     this.rmMinDate = new Date()
   //  this.rmMaxDate.setDate(this.pcdMinDate.getDate() - 1)
     //set delivery min date
     this.deliveryMindate = new Date()
     this.deliveryMindate.setDate(this.pcdMinDate.getDate() + 1)
   }*/

}
