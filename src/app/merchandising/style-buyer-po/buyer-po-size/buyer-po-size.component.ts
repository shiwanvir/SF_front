import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HotTableRegisterer } from '@handsontable/angular';

import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { BuyerPoService } from '../buyer-po.service';
import { AppFormValidator } from '../../../core/validation/app-form-validator';

//models
import { Size } from '../../../org2/models/size.model';

@Component({
  selector: 'app-buyer-po-size',
  templateUrl: './buyer-po-size.component.html',
  styleUrls: ['./buyer-po-size.component.css']
})
export class BuyerPoSizeComponent implements OnInit {

  @ViewChild(ModalDirective) sizeModel: ModalDirective;
  formSize : FormGroup
  readonly apiUrl = AppConfig.apiUrl()
  formValidatorSize : AppFormValidator
  modelTitle : string = 'Add New Size Breakup'
  detailsId : number = 0
  loading : boolean = false
  processing : boolean = false
  currentDataSetIndex : number = -1
  deliveryData = null
  showSizeForm = true

  totalOrderQty : number = 0
  totalPlannedQty : number = 0
  excessPresentage : number = 0

  size$: Observable<Size[]>;//use to load country list in ng-select
  sizeLoading = false;
  sizeInput$ = new Subject<string>();

  tosterConfig = { timeout: 5000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop}

  dataset: any[] = [];
  hotOptions: any
  instance: string = 'hot';

  constructor(private buyerPoService : BuyerPoService , private fb : FormBuilder , private http:HttpClient ,
    private hotRegisterer: HotTableRegisterer , private snotifyService: SnotifyService) { }

  ngOnInit() {
      this.formSize = this.fb.group({
      id : 0,
      size_id : [null , [Validators.required]],
      order_qty : [0 , [Validators.required,Validators.min(0)]],
      planned_qty : [0 , [Validators.required,Validators.min(0)]]
    })

    this.formValidatorSize = new AppFormValidator(this.formSize,{})

    this.loadSize()

    this.initializeSizeTable()

    //listen to split menu in StyleBuyerPoComponent
    this.buyerPoService.lineData.subscribe(data => {
      if(data != null){
        this.deliveryData = data;
        this.detailsId = data['details_id']
        this.excessPresentage = data['excess_presentage']
        this.formSize.reset()
        this.loadOrderSizes(this.detailsId)
        this.sizeModel.show()
      }
    })

  }


  initializeSizeTable(){
    this.hotOptions = {
      /*data: [{id: 1}],*/
      columns: [
        { type: 'text', title : 'Line No' , data: 'line_no',className: "htRight"},
        { type: 'text', title : 'Size' , data: 'size_name',className: "htLeft" },
        { type: 'text', title : 'Order Qty' , data: 'order_qty',className: "htRight" },
        { type: 'text', title : 'Planned Qty' , data: 'planned_qty',className: "htRight" }
      ],
      /*fixedColumnsLeft: 3,*/
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 170,
      stretchH: 'all',
      selectionMode: 'range',
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
      /*colWidths: 100,*/
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
            console.log(clickEvent);
          },
          items : {
            // 'add_row' : {
            //   name : 'Add Size',
            //   callback : (key, selection, clickEvent) => {
            //     this.formSize.reset()
            //     this.formSize.controls.size_id.enable()
            //     this.modelTitle = 'Add New Size'
            //     this.currentDataSetIndex = -1
            //   }
            // },
            'edit' : {
              name : 'Edit Size',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.instance);
                console.log(hotInstance.getSelectedLast())
                // let sel_row = hotInstance.getSelectedLast()[0];
                // if(this.dataset.length == 0){
                //
                //     return hotInstance.getSelectedLast()[0] === sel_row
                //
                // }
              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  this.modelTitle = 'Update Size'
                  let start = selection[0].start;
                  let id = this.dataset[start.row]['id']
                  this.currentDataSetIndex = start.row
                  this.viewSizeDetails(id)
                }
              }
            },
            'remove_row' : {
              name : 'Remove Size',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let row = selection[0].start.row;
                  this.contextMenuRemove(row)
                }
              }
            },
            // 'history' : {
            //   name : 'Size Revisions',
            //   callback : (key, selection, clickEvent) => {
            //
            //   }
            // }
          }
      }
    }
  }

  //model show event
  modelShowEvent(e){
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    hotInstance.render()
  }

  //save new size or update existing size
  saveSizes(e){
    if(!this.formValidatorSize.validate())//if validation faild return from the function
      return;

    let formData = this.formSize.getRawValue()
    //this.totalOrderQty += formData.order_qty;
    if((this.totalOrderQty + formData.order_qty) > this.deliveryData['order_qty'] ){
      AppAlert.showError({text : 'Total size order qty must be less than delivery order qty'})
      return;
    }

    formData.size_id = formData.size_id.size_id
    formData.details_id = this.detailsId
    if(formData.id <= 0){ //new size
      this.http.post(this.apiUrl + 'merchandising/customer-order-sizes' , formData)
      .pipe(map(res => res['data']) )
      .subscribe(
        (data) => {
        this.formSize.reset()
        this.loadOrderSizes(this.detailsId)
        this.snotifyService.success(data.message, this.tosterConfig);
        /*let sizeDetails = data.customerOrderSize

        this.dataset.push({
          id : sizeDetails.id,
          size_name : sizeDetails.size.size_name,
          order_qty : sizeDetails.order_qty,
          planned_qty : sizeDetails.planned_qty,
          line_no : sizeDetails.line_no
        })
        this.totalOrderQty += sizeDetails.order_qty;
        this.snotifyService.success(data.message, this.tosterConfig);
        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        hotInstance.loadData(this.dataset)
        hotInstance.render()*/
      },
      (error) => {
        //console.log(error)
        AppAlert.showError({text : error.error.data.message})
      }
    )
    }
    else{
      this.http.put(this.apiUrl + 'merchandising/customer-order-sizes/' + formData.id , formData)
      .pipe(map(res => res['data']) )
      .subscribe(data => {
        this.formSize.reset()
        this.formSize.controls.size_id.enable()
        this.loadOrderSizes(this.detailsId)
        this.modelTitle = 'Add New Size'
        /*let sizeDetails = data.customerOrderSize
        this.dataset[this.currentDataSetIndex] = {
          id : sizeDetails.id,
          size_name : sizeDetails.size.size_name,
          order_qty : sizeDetails.order_qty,
          planned_qty : sizeDetails.planned_qty,
          line_no : sizeDetails.line_no
        }
        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        hotInstance.render()*/
        this.snotifyService.success(data.message, this.tosterConfig);
      })
    }
  }

  //load and view size details
  viewSizeDetails(id){

    this.totalOrderQty = 0;
    this.totalPlannedQty = 0;
      for(let x = 0 ; x < this.dataset.length ; x++){ //calculate total size qty
        this.totalOrderQty += this.dataset[x]['order_qty']
        this.totalPlannedQty += this.dataset[x]['planned_qty']
      }

    this.loading = true
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading size details')
    this.http.get(this.apiUrl + 'merchandising/customer-order-sizes/' + id)
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      this.formSize.setValue({
        id : data.id,
        size_id : data.size,
        order_qty : data.order_qty,
        planned_qty : data.planned_qty
      })
      this.totalOrderQty = this.totalOrderQty - this.formSize.get('order_qty').value;
      this.totalPlannedQty = this.totalPlannedQty - this.formSize.get('order_qty').value;
      this.formSize.controls.size_id.disable()
      this.loading = false
      setTimeout(() => {
        AppAlert.closeAlert()
      } , 1000)
    })
  }

  //remove size from delivery
  contextMenuRemove(row){
    let data = this.dataset[row]
    AppAlert.showConfirm({text : 'Do you want to remove size - ' + data.size_name + ' from delivery?'},(result) => {
      if(result.value){
        this.http.delete(this.apiUrl + 'merchandising/customer-order-sizes/' + data.id)
        .subscribe(
          (data) => {
            this.snotifyService.success('Size Removed Successfully', this.tosterConfig);
            this.loadOrderSizes(this.detailsId)
          },
          (error) => {
            AppAlert.showError({text : 'Process Error'})
          }
        )
      }
    })
  }


  //calculate planned qty when change order qty
  calculatePlannedQty(){
    let orderQty = this.formSize.get('order_qty').value
    /*if(this.currentDataSetIndex <= 0 && (orderQty + this.totalOrderQty) > this.deliveryData.order_qty ){
      alert('Cannot exceed delivery order qty')
    }
    else{*/
      let excessPresentage = this.excessPresentage
      let plannedQty = Math.ceil(((orderQty * excessPresentage) / 100) + orderQty)
      this.formSize.patchValue({planned_qty : plannedQty})
    //}
  }


  //load delivery sizes
  loadOrderSizes(id){
    this.dataset = []
    this.totalOrderQty = 0;
    this.totalPlannedQty = 0;
    this.http.get(this.apiUrl + 'merchandising/customer-order-sizes?details_id=' + id)
    .pipe( map(data => data['data']) )
    .subscribe(data => {
      this.dataset = data
      for(let x = 0 ; x < this.dataset.length ; x++){ //calculate total size qty
        this.totalOrderQty += this.dataset[x]['order_qty']
        this.totalPlannedQty += this.dataset[x]['planned_qty']
      }
    })
  }

  //load country list
  loadSize() {
       this.size$ = this.sizeInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.sizeLoading = true),
          switchMap(term => this.http.get<Size[]>(this.apiUrl + 'org/sizes?type=auto' , {params:{search:term}})
          .pipe(
              //catchError(() => of([])), // empty list on error
              tap(() => this.sizeLoading = false)
          ))
       );
   }


   //clear form data
   clearForm(){
     AppAlert.showConfirm({text : 'Do you want to clear unsaved data?'},(result) => {
       if(result.value){
         this.totalOrderQty = 0;
         this.totalPlannedQty = 0;
         for(let x = 0 ; x < this.dataset.length ; x++){ //calculate total size qty
           this.totalOrderQty += this.dataset[x]['order_qty']
           this.totalPlannedQty += this.dataset[x]['planned_qty']
         }
         this.formSize.reset()
         this.formSize.controls.size_id.enable()
         this.modelTitle = 'Add New Size Breakup'
       }
     })
   }

   Model_hide(){

      this.sizeModel.hide()
      $('.modal-backdrop').hide();

    }

}
