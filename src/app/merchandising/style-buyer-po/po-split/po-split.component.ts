import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HotTableRegisterer } from '@handsontable/angular';

import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { BuyerPoService } from '../buyer-po.service';
import { AppFormValidator } from '../../../core/validation/app-form-validator';

//models
import { Country } from '../../../org/models/country.model';
import { Location } from '../../../org/models/location.model';


@Component({
  selector: 'app-po-split',
  templateUrl: './po-split.component.html',
  styleUrls: ['./po-split.component.css']
})
export class PoSplitComponent implements OnInit {

  @ViewChild(ModalDirective) splitModel: ModalDirective;
  formGroup : FormGroup
  formSplit : FormGroup
  readonly apiUrl = AppConfig.apiUrl()
  modelTitle = 'Split Sales Order Line'
  formValidatorDetails : AppFormValidator
  formValidatorSplit : AppFormValidator
  //splitList : boolean = true
  orderLineData = null

  dataset: any[] = [];
  hotOptions: any
  instance: string = 'hot';
  currentSplitLine : number = -1

  locations$ : Observable<Location[]>
  country$: Observable<Country[]>;//use to load country list in ng-select
  countryLoading = false;
  countryInput$ = new Subject<string>();
  orderStatus$ : Observable<Array<string>>
  shipModes$ : Observable<Array<string>>

  constructor(private buyerPoService : BuyerPoService , private fb : FormBuilder , private http:HttpClient , private hotRegisterer: HotTableRegisterer) { }

  ngOnInit() {

    this.initializeSplitForm()
    this.initializeTable()

    //listen to split menu in StyleBuyerPoComponent
    this.buyerPoService.splitLineData.subscribe(data => {
      if(data != null){
        this.orderLineData = data
        this.formSplit.setValue({
          planned_qty : data['planned_qty'],
          split_line_no : 1
        })
        var element1 = <HTMLInputElement> document.getElementById("sum_total");
        element1.value = '0';
        var element2 = <HTMLInputElement> document.getElementById("sum_total_2");
        element2.value = '0';

        this.splitModel.show()
      }
      else{
        this.orderLineData = null;
      }
    })

  }

  //initialize split form
  initializeSplitForm(){
      this.formSplit = this.fb.group({
        planned_qty : 0,
        split_line_no : [1 , [Validators.required,Validators.min(1)]]
      });
      this.formValidatorSplit = new AppFormValidator(this.formSplit,{})
  }


  initializeTable(){
    this.hotOptions = {
      /*data: [{id: 1}],*/
      // columns: [
      //   /*{ type: 'text', title : '#' , data: 'details_id' , readOnly: false},*/
      //   { type: 'text', title : 'Style Color' , data: 'color_name',className: "htLeft" },
      //   { type: 'text', title : 'PCD' , data: 'pcd_01',className: "htLeft" },
      //   { type: 'text', title : 'RM In Date' , data: 'rm_in_date_01',className: "htLeft" },
      //   { type: 'text', title : 'PO No' , data: 'po_no' ,className: "htLeft"},
      //   { type: 'text', title : 'Customer Wanted Date' , data: 'planned_delivery_date_01',className: "htLeft" },
      //   { type: 'text', title : 'Ship Mode' , data: 'ship_mode' ,className: "htLeft"},
      //   { type: 'text', title : 'FOB $' , data: 'fob',className: "htLeft" },
      //   { type: 'text', title : 'Country' , data: 'country_description',className: "htLeft" },
      //   { type: 'text', title : 'Delivery Status' , data: 'delivery_status' ,className: "htLeft"},
      //   { type: 'text', title : 'Projection Location' , data: 'loc_name',className: "htLeft" },
      //   { type: 'text', title : 'Order Qty' , data: 'order_qty' , readOnly: false,className: "htRight" },
      //   { type: 'text', title : 'Excess Percentage %' , data: 'excess_presentage',className: "htRight" },
      //   { type: 'text', title : 'Planned Qty' , data: 'planned_qty',className: "htRight" }
      // ],

      columns: [
        { type: 'text', title : 'Type' , data: 'type_created',className: "htLeft"},
        { type: 'text', title : 'Delivery Status' , data: 'delivery_status',className: "htLeft" },
        { type: 'text', title : 'FNG #' , data: 'master_code',className: "htLeft" },
        { type: 'text', title : 'Description' , data: 'master_description',className: "htLeft" },
        { type: 'text', title : 'Line No' , data: 'line_no' , readOnly: true},
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
        { type: 'text', title : 'Order Qty Pack' , data: 'order_qty', readOnly: false,className: "htRight" },
        { type: 'text', title : 'Excess %' , data: 'excess_presentage',className: "htRight" },
        { type: 'text', title : 'Planned Qty' , data: 'planned_qty',className: "htRight" }

      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 200,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htCenter htMiddle',
      readOnly: true,
      afterChange:(changes,surce,row,col,value,prop)=>{

      let x=this.dataset;
      if(surce!=null){
      let y=surce["0"]["0"];

      if(surce["0"]["3"] < 1){
        this.dataset[y]['order_qty'] = surce["0"]["2"];
        var planqt = (this.dataset[y]['order_qty'] / 100) * this.dataset[y]['excess_presentage'];
        this.dataset[y]['planned_qty'] = parseFloat(this.dataset[y]['order_qty'].toString()) + parseFloat(planqt.toString());
      }else{
        var planqt = (this.dataset[y]['order_qty'] / 100) * this.dataset[y]['excess_presentage'];
        this.dataset[y]['planned_qty'] = parseFloat(this.dataset[y]['order_qty'].toString()) + parseFloat(planqt.toString());
      }

        var sum_value = 0;
        for (var _i = 0; _i < x.length; _i++)
      {
           sum_value += parseFloat(x[_i].order_qty);
      }

        var k = parseFloat(sum_value.toString()).toFixed(2);
        var element1 = <HTMLInputElement> document.getElementById("sum_total_2");
        element1.value = Number(k).toLocaleString('en');

        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        hotInstance.render()

        }

      },
      contextMenu : {
          callback: function (key, selection, clickEvent) {
                // Common callback for all options
            console.log(clickEvent);
          },
          items : {
            'remove_all' : {
              name : 'Remove All Rows',
              disabled: function (key, selection, clickEvent) {
                // Disable option when first row was clicked
                return this.getSelectedLast() == undefined // `this` === hot3
              },
              callback : (key, selection, clickEvent) => {
                AppAlert.showConfirm({
                  'text' : 'Do you want to delete all split lines?'
                },(result) => {
                  if (result.value) {
                    this.dataset = []
                    const hotInstance = this.hotRegisterer.getInstance(this.instance);
                    hotInstance.render()
                  }
                })
              }
            }
          }
      }
    }
  }

  //split delivery and show in table
  addNewSplit(){
    if(!this.formValidatorSplit.validate())//if validation faild return from the function
      return;

    var orderQty = this.orderLineData.order_qty;

    console.log(this.orderLineData)
    //var plannedQty = this.orderLineData.planned_qty;//this.formSplit.get('planned_qty').value
    var excessPresentage = this.orderLineData.excess_presentage;
    var splitNo = this.formSplit.get('split_line_no').value
    //alert(this.orderLineData.excess_presentage);
    var splitOrderQty = Math.ceil(orderQty / splitNo)
    // splitPlannedQty = Math.ceil(plannedQty / splitNo)
    var splitPlannedQty = Math.ceil(((splitOrderQty * excessPresentage) / 100) + splitOrderQty)
    for(let x = 0 ; x < splitNo ; x++){
      var data = Object.assign({}, this.orderLineData);
      data.order_qty = splitOrderQty
      data.planned_qty = splitPlannedQty
      this.dataset.push(data)
    }

    var element1 = <HTMLInputElement> document.getElementById("sum_total");
    element1.value = Number(orderQty).toLocaleString('en');
    var element2 = <HTMLInputElement> document.getElementById("sum_total_2");
    element2.value = Number(splitOrderQty*splitNo).toLocaleString('en');
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    hotInstance.render()
  }


  //clear form data
  clearData(){
    AppAlert.showConfirm({
      'text' : 'Do you want to clear split lines?'
    },
    (result) => {
      if (result.value) {
        this.dataset = []
        const hotInstance = this.hotRegisterer.getInstance(this.instance)
        hotInstance.render()
      }
    })
  }

  //model show event
  modelShowEvent(e){
      this.dataset = [];
  }


  //save split line details
  saveSplitLines(){
    var lineQty = (<HTMLInputElement>document.getElementById("sum_total")).value;
    var sumQty  = (<HTMLInputElement>document.getElementById("sum_total_2")).value;
    if(lineQty != sumQty)
    {
      AppAlert.showError({ text : "Total Qty must be equal to Line Qty." })
      return;
    }

    AppAlert.showConfirm({
      'text' : 'Do you want to save split lines?'
    },
    (result) => {
      if (result.value) {
        if(this.dataset.length <= 0)//if validation faild return from the function
          return;
        var data = {
          split_count : this.dataset.length,
          delivery_id : this.orderLineData.details_id,
          lines       : this.dataset
        }
        AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Processing...',
        'Please wait while splitting delivery')

        this.http.post(this.apiUrl + 'merchandising/customer-order-details/split-delivery' , data)
        .pipe( map(res => res['data']) )
        .subscribe(
          data => {
            this.dataset = []
            this.buyerPoService.changeSplitStatus(true)
            this.splitModel.hide()
            $('.modal-backdrop').hide();
            setTimeout(() => {
              AppAlert.closeAlert()
              AppAlert.showSuccess({ text : data.message })
            } , 1000)
         },
        err => {
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({ text : 'Process Error' })
          } , 1000)
        })
      }
    })
  }

  Model_hide(){

     this.splitModel.hide()
     $('.modal-backdrop').hide();

   }



}
