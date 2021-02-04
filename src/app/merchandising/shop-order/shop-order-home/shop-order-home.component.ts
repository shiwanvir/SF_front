import { Component, OnInit , ViewChild} from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';
import Swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
import { TabsetComponent,TabDirective } from 'ngx-bootstrap';

import { Style } from '../../models/Style.model';
//declare var $:any;

import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../../core/validation/primary-validators';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';

import { ShopOrderService } from '../shop_order.service';

@Component({
  selector: 'app-shop-order-home',
  templateUrl: './shop-order-home.component.html',
  styleUrls: ['./shop-order-home.component.css']
})
export class ShopOrderHomeComponent implements OnInit {
  @ViewChild(ModalDirective) detailsModel: ModalDirective;
  @ViewChild('sotabs') tabs: TabsetComponent;



  instance: string = 'instance';
  instance2: string = 'instance2';
  instance3: string = 'instance3';
  readonly apiUrl = AppConfig.apiUrl()
  formGroup : FormGroup
  formValidatorHeader : AppFormValidator
  saveStatus = 'SAVE'
  initializedHeader : boolean = false
  loadingHeader : boolean = false
  loadingCountHeader : number = 0
  processingHeader : boolean = false
  userPermision : boolean = false

  dataset: any[] = [];
  dataset2: any[] = [];
  dataset3: any[] = [];
  hotOptions: any
  hotOptions2: any
  hotOptions3: any
  loadSONumber : Array<any>

  processdetails : boolean = false

  fng$: Observable<Style[]>;//use to load style list in ng-select
  fngLoading = false;
  fngInput$ = new Subject<string>();

  shopOrderCode = null;
  desCription = null;
  country = null;
  orderTypes = null;
  orderQty = null;
  planQty = null;
  deliveryDate = null;
  orderStatus = null;
  shoporder_id = null;
  fngnumber = null;
  shopOrderId = 0

  //toster plugin
  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}

  constructor(private fb:FormBuilder , private http:HttpClient , private hotRegisterer: HotTableRegisterer ,
     private snotifyService: SnotifyService,private layoutChangerService : LayoutChangerService,
   private shopOrderService : ShopOrderService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Shop Order")//set page title
    this.initializeSOMTable()
    this.initializeHeaderForm()
    this.loadHeaderFormData()
     this.shopOrderService.loadData.subscribe(data => {
       if(data != null){
              //this.formHeader.disable()

              this.shopOrderId = data
              //this.formHeader.patchValue({fg_id: data });
              //this.loadSoData(data)
              this.changeFngLoadData(data)
              //console.log(data)
       }
     })

    //this.dataset3=[];


    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Merchandising',
      'Shop Order'
    ])
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          const hotInstance2 = this.hotRegisterer.getInstance(this.instance2);
          const hotInstance3 = this.hotRegisterer.getInstance(this.instance3);

          if(hotInstance != undefined && hotInstance != null){
            hotInstance.render(); //refresh fg items table
          }else if(hotInstance2 != undefined && hotInstance2 != null){
            hotInstance2.render(); //refresh fg items table
          }else if(hotInstance3 != undefined && hotInstance3 != null){
            hotInstance3.render(); //refresh fg items table
          }

    })
  }

  loadHeaderFormData()
  {

    this.loadFngList()

  }

  initializeHeaderForm(){
    this.formGroup = this.fb.group({

      fg_id : null,
      shop_order_id : null

    })
    this.formValidatorHeader = new AppFormValidator(this.formGroup , {})
  }


  initializeSOMTable(){
    this.hotOptions = {
      columns: [
        // { type: 'checkbox', title : 'Action' , readOnly: false , checkedTemplate: 'yes',  uncheckedTemplate: 'no' },
        { type: 'text', title : 'Product Component' , data: 'product_component_description' , readOnly: true,className: "htLeft"},
        { type: 'text', title : 'SFG Code' , data: 'sfg_code' , readOnly: true,className: "htLeft" },
        { type: 'text', title : 'SFG Color' , data: 'color_name' , readOnly: true,className: "htLeft" },
        { type: 'text', title : 'Item Code' , data: 'master_code' , readOnly: true,className: "htLeft" },
        { type: 'text', title : 'Item Description' , data: 'master_description',className: "htLeft" },
        { type: 'text', title : 'Inventory UOM' , data: 'inv_uom' ,className: "htLeft"},
        { type: 'text', title : 'Purchase UOM' , data: 'pur_uom' ,className: "htLeft"},
        { type: 'text', title : 'Supplier' , data: 'supplier_name',className: "htLeft" },
        { type: 'text', title : 'Currency' , data: 'currency_code',className: "htLeft" },
        { type: 'text', title : 'Inventory Price ' , data: 'unit_price',className: "htRight"  },
        { type: 'text', title : 'Purchase Price ' , data: 'purchase_price',className: "htRight"  },
        { type: 'text', title : 'Artical Number' , data: 'article_no',className: "htLeft" },
        { type: 'text', title : 'Fabric Position' , data: 'position',className: "htLeft" },
        { type: 'text', title : 'Net Consumption' , data: 'net_consumption',className: "htRight"  },
        { type: 'text', title : 'Wastage %' , data: 'wastage' ,className: "htRight" },
        { type: 'text', title : 'Gross Consumption' , data: 'gross_consumption' ,className: "htRight" },
        { type: 'text', title : 'Required Qty' , data: 'required_qty' ,className: "htRight" },
        { type: 'numeric', title : 'Actual Consumption' , data: 'actual_con', readOnly: false ,className: "htRight" },
        { type: 'text', title : 'Actual Qty' , data: 'actul_qty' ,className: "htRight" },
        { type: 'text', title : 'PO Qty' , data: 'po_qty' ,className: "htRight" },
        { type: 'text', title : 'GRN Qty' , data: 'grn_qty' ,className: "htRight" },
        { type: 'text', title : 'MRN Qty' , data: 'mrn_qty' ,className: "htRight" },
        { type: 'text', title : 'Issued Qty' , data: 'issued_qty' ,className: "htRight" }

      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 250,
      stretchH: 'all',
      selectionMode: 'range',
      fixedColumnsLeft: 3,
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
      afterChange:(changes,surce,row,col,value,prop)=>{

      let x=this.dataset;
      if(surce!=null){
      let y=surce["0"]["0"];

      console.log(surce["0"]["1"]);
      let formData = this.formGroup.getRawValue();
      console.log(formData)

      if(surce["0"]["1"] == 'actual_con')
      {

        this.dataset[y]['actul_qty'] = (this.dataset[y]['order_qty'] * this.dataset[y]['actual_con']).toFixed(4);

        var sum_value = 0;
        for (var _i = 0; _i < x.length; _i++)
        {
             if(x[_i].actul_qty == '' || x[_i].actul_qty == null){ x[_i].actul_qty = 0; }
             sum_value += parseFloat(x[_i].actul_qty);
        }
        // var k = parseFloat(sum_value.toString()).toFixed(4);
        // var element1 = <HTMLInputElement> document.getElementById("sum_total");
        // element1.value = Number(k).toLocaleString('en');

        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        hotInstance.render()

        if(this.dataset[y]["gross_consumption"]<surce["0"]["3"]){
          AppAlert.showError({text:"Cannot Exceeded more than Gross Consumption "});
          this.dataset[y]['actual_con'] = this.dataset[y]['gross_consumption'];
          this.dataset[y]['actul_qty'] = (this.dataset[y]['order_qty'] * this.dataset[y]['actual_con']).toFixed(4);

          var sum_value = 0;
          for (var _i = 0; _i < x.length; _i++)
          {
               if(x[_i].actul_qty == '' || x[_i].actul_qty == null){ x[_i].actul_qty = 0; }
               sum_value += parseFloat(x[_i].actul_qty);
          }
          // var k = parseFloat(sum_value.toString()).toFixed(4);
          // var element1 = <HTMLInputElement> document.getElementById("sum_total");
          // element1.value = Number(k).toLocaleString('en');

          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          hotInstance.render()

            }
        if(surce["0"]["3"] <= 0){
          AppAlert.showError({text:'invalid qty'});
          this.dataset[y]['actual_con'] = this.dataset[y]['gross_consumption'];
          this.dataset[y]['actul_qty'] = (this.dataset[y]['order_qty'] * this.dataset[y]['actual_con']).toFixed(4);

          var sum_value = 0;
          for (var _i = 0; _i < x.length; _i++)
          {
               if(x[_i].actul_qty == '' || x[_i].actul_qty == null){ x[_i].actul_qty = 0; }
               sum_value += parseFloat(x[_i].actul_qty);
          }
          // var k = parseFloat(sum_value.toString()).toFixed(4);
          // var element1 = <HTMLInputElement> document.getElementById("sum_total");
          // element1.value = Number(k).toLocaleString('en');

          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          hotInstance.render()

        }


      }


        }

      },
      cells : function(row, col, prop , value){ //table cell render event. works for every cell in the table
        var cellProperties = {};
        //var data = this.dataset;//this.instance.getData();
        if(col == 17){
          cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
            var args = arguments;
            if(prop == 'actual_con'){
              td.style.background = '#D1E0E0';
            }
            Handsontable.renderers.TextRenderer.apply(this, args);
          }
        }


        return cellProperties;
      },

      // contextMenu : {
      //     callback: function (key, selection, clickEvent) {
      //       // Common callback for all options
      //     },
      //     items : {
      //       'split' : {
      //         name : 'Delivery Split',
      //         callback : (key, selection, clickEvent) => {
      //           if(selection.length > 0){
      //             let start = selection[0].start;
      //             let data = this.dataset[start.row]
      //             //this.prlService.changeContextMenuSplit(data)
      //           }
      //         }
      //       },
      //
      //     }
      // }

    }

    this.hotOptions2 = {
      columns: [
        { type: 'text', title : 'Version No' , data: 'version' },
        { type: 'text', title : 'FNG No' , data: 'master_code',className: "htLeft" },
        { type: 'text', title : 'Item Description' , data: 'master_description',className: "htLeft" },
        { type: 'text', title : 'Inventory UOM' , data: 'inv_uom' },
        { type: 'text', title : 'Gross Consumption' , data: 'gross_consumption' },
        { type: 'text', title : 'Required Qty' , data: 'required_qty' },
        { type: 'text', title : 'Actual Consumption' , data: 'actual_consumption' },
        { type: 'text', title : 'Actual Qty' , data: 'actual_qty' },
        { type: 'text', title : 'Date' , data: 'soh_date' }

      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 250,
      stretchH: 'all',
      selectionMode: 'range',
      fixedColumnsLeft: 0,
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,

    }



    this.hotOptions3 = {
      columns: [
        { type: 'text', title : 'Sales Order No' , data: 'order_code' },
        { type: 'text', title : 'Line No' , data: 'details_id' },
        { type: 'text', title : 'PO No' , data: 'po_no' },
        { type: 'text', title : 'Order Qty' , data: 'order_qty' },
        { type: 'text', title : 'Excess Percentage %' , data: 'excess_presentage' },
        { type: 'text', title : 'Planned Qty' , data: 'planned_qty' },
        { type: 'text', title : 'Delivery Status' , data: 'delivery_status' },
        { type: 'text', title : 'Export', data: 'ship_qty'   },
        { type: 'text', title : 'Export Return' }

      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 250,
      stretchH: 'all',
      selectionMode: 'range',
      fixedColumnsLeft: 0,
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,

    }




  }

  updatedetails() {
    let formData = this.formGroup.getRawValue();
    this.processdetails = true
    AppAlert.showMessage('Processing...','Please wait while updating details')

      this.http.post(this.apiUrl + 'merchandising/update_shop_order_details' ,{ 'lines' : this.dataset ,'so_id':this.shopOrderId  })
      .pipe( map(res => res['data'] ))
      .subscribe(
        data => {
          console.log(data)
          this.processdetails = false
          AppAlert.closeAlert()

          AppAlert.showSuccess({text:data.message})

        },
        error => {

          this.processdetails = false
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({text : 'Process Error' })
          } , 1000)

        }
      )



  }

  loadFngList(){

    this.fng$ = this.fngInput$
    .pipe(
       debounceTime(200),
       distinctUntilChanged(),
       tap(() => this.fngLoading = true),
       switchMap(term => this.http.get<Style[]>(this.apiUrl + 'merchandising/shop-orders?type=style' ,
       {params:{search:term}})
       .pipe(
           //catchError(() => of([])), // empty list on error
           tap(() => this.fngLoading = false)
       ))
    );


  }

  loadSoData(data){

        this.http.post(this.apiUrl + 'merchandising/load_shop_order_list' ,{ 'fng_id' : data })
        .pipe( map(res => res['data'] ))
        .subscribe(
          data => {
            //console.log(data)
            this.loadSONumber = data.so_list

          },
          error => {
          }
        )


  }

  //customer order header style change event
  changeFngLoadData(data) {
    if(data == undefined){
      this.dataset=[];
      this.desCription = null;
      this.country = null;
      this.orderTypes = null;
      this.orderQty = null;
      this.planQty = null;
      this.deliveryDate = null;
      this.orderStatus = null;

    }
    else{
      this.dataset=[];
      this.tabs.tabs[0].active = true;
      let formData = this.formGroup.getRawValue();
      this.http.post(this.apiUrl + 'merchandising/load_shop_order_header' ,{ 'so_id' : data })
      .pipe( map(res => res['data'] ))
      .subscribe(
        data => {

          this.desCription = data['header_data'][0]['master_description'];
          this.country = data['header_data'][0]['country_description'];
          this.orderTypes = data['header_data'][0]['bom_stage_description'];
          this.orderQty = data['header_data'][0]['order_qty'];
          this.planQty = data['header_data'][0]['planned_qty'];
          this.deliveryDate = data['header_data'][0]['delivery_date'];
          this.orderStatus = data['header_data'][0]['order_status'];
          this.shoporder_id= data['header_data'][0]['shop_order_id'];
          this.fngnumber= data['header_data'][0]['master_code'];

          //this.formHeader.patchValue({fg_id: data['header_data'][0]['master_id'] });

          let count_ar =  data['details_count']
          var required_qty = 0;
          var actul_qty = 0;
          var sum_value_load = 0;
          for (var _i = 0; _i < count_ar; _i++)
              {

                if(data['details_data'][_i]['required_qty'] == null)
                {
                  var required_qty = parseFloat(data['details_data'][_i].order_qty) * parseFloat(data['details_data'][_i].gross_consumption)
                  data['details_data'][_i]['required_qty'] = parseFloat(required_qty.toString()).toFixed(4);
                }else{
                  data['details_data'][_i]['required_qty'] = data['details_data'][_i]['required_qty'];
                }

                if(data['details_data'][_i]['actual_consumption'] == null)
                {
                  data['details_data'][_i]['actual_con'] = data['details_data'][_i].gross_consumption;
                }else{
                  data['details_data'][_i]['actual_con'] = data['details_data'][_i]['actual_consumption'];
                }

                if(data['details_data'][_i]['actual_qty'] == null)
                {
                  var actul_qty = parseFloat(data['details_data'][_i].order_qty) * parseFloat(data['details_data'][_i].actual_con)
                  data['details_data'][_i]['actul_qty'] = parseFloat(actul_qty.toString()).toFixed(4);
                }else{
                  data['details_data'][_i]['actul_qty'] = data['details_data'][_i]['actual_qty'];
                }

                this.dataset.push(data['details_data'][_i])
                console.log('a')

                // sum_value_load += parseFloat(data['details_data'][_i].actul_qty);
                // var k = parseFloat(sum_value_load.toString()).toFixed(4);
                // var element1 = <HTMLInputElement> document.getElementById("sum_total");
                // element1.value = Number(k).toLocaleString('en');
              }

              const hotInstance = this.hotRegisterer.getInstance(this.instance);
              hotInstance.render()
        },
        error => {
        }
      )

    }
    //console.log(data)
  }


  onSelect(data: TabDirective): void {
    console.log(data.heading);

    if(data.heading == 'Meterial'){
      //debugger
      setTimeout(() => {
        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        hotInstance.render()
      } , 1000)

    }

    if(data.heading == 'Sales Orders'){

      this.dataset3=[];
      console.log(this.shopOrderId)
      let formData = this.formGroup.getRawValue();
      if(this.shopOrderId != null)
      {
      this.http.post(this.apiUrl + 'merchandising/load_shop_order_header' ,{ 'so_id' : this.shopOrderId })
      .pipe( map(res => res['data'] ))
      .subscribe(
        data => {


            let count_his =  data['sales_order_count']
            for (var _l = 0; _l < count_his; _l++)
                {
                  this.dataset3.push(data['sales_order'][_l])
                }

            const hotInstance3 = this.hotRegisterer.getInstance(this.instance3);
            hotInstance3.render()


            },
            error => {
            }
          )

        }

    }

    if(data.heading == 'Material History'){

      this.dataset2=[];

      let formData = this.formGroup.getRawValue();
      console.log(formData);
      if(this.shopOrderId != null)
      {
      this.http.post(this.apiUrl + 'merchandising/load_shop_order_header' ,{ 'so_id' : this.shopOrderId })
      .pipe( map(res => res['data'] ))
      .subscribe(
        data => {

          let count_his =  data['history_count']
            for (var _k = 0; _k < count_his; _k++)
                {
                  this.dataset2.push(data['history_data'][_k])
                }

            const hotInstance2 = this.hotRegisterer.getInstance(this.instance2);
            hotInstance2.render()

            },
            error => {
            }
          )

        }

    }

  }




}
