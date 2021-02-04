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
import { PorevisionService } from '../po-revision.service';
import { AppFormValidator } from '../../../core/validation/app-form-validator';

@Component({
  selector: 'app-por-split',
  templateUrl: './por-split.component.html',
  styleUrls: ['./por-split.component.css']
})
export class PorSplitComponent implements OnInit {

  @ViewChild(ModalDirective) splitModel: ModalDirective;
  formGroup : FormGroup
  formSplit : FormGroup
  readonly apiUrl = AppConfig.apiUrl()
  modelTitle = 'Delivery Split'
  formValidatorSplit : AppFormValidator
  processingHeader : boolean = false
  saveStatus = 'SAVE'
  currentDataSetIndex : number = -1
  orderLineData = null
  totalOrderQty : number = 0
  totalPlannedQty : number = 0

  dataset: any[] = [];
  hotOptions: any
  instance: any;
  //instance: string = 'hot';
  currentSplitLine : number = -1

  constructor(private porevisionService : PorevisionService, private fb : FormBuilder , private http:HttpClient , private hotRegisterer: HotTableRegisterer)
  { }


  ngOnInit() {

    this.initializeSplitForm()
    this.initializeTable()

    this.porevisionService.contextMenuSplit.subscribe(data => {
      if(data != null){
        this.dataset = [];
        this.orderLineData = data
        if(this.orderLineData.po_status != null)
        {
          this.loadSplitTable(data['id'])
          this.formSplit.reset()
          this.splitModel.show()
          this.saveStatus = 'SAVE'
        }else{
          AppAlert.showError({text:"Details not saved yet ! "})
        }

      }
    })


  }

  initializeSplitForm(){
      this.formSplit = this.fb.group({
        split_qty : [null , [Validators.required,Validators.min(1)]],
        delivery_date : [null , [Validators.required]]
      });
      this.formValidatorSplit = new AppFormValidator(this.formSplit,{})
  }

  initializeTable(){
    this.hotOptions = {
      columns: [

        { type: 'text', title : 'Date' , data: 'delivery_date2',className: "htLeft"},
        { type: 'text', title : 'Qty' , data: 'split_qty',className: "htRight"}

      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 150,
      stretchH: 'all',
      selectionMode: 'range',
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
            console.log(clickEvent);
          },
          items : {

            'edit' : {
              name : 'Edit',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  let id = this.dataset[start.row]['split_id']
                  this.currentDataSetIndex = start.row
                  this.viewDetails(id)
                }
              }
            },
            'remove_row' : {
              name : 'Remove',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let row = selection[0].start.row;
                  this.contextLineRemove(row)
                }
              }
            },

          }
      }
    }
  }

  viewDetails(id){
    //console.log(id)
    this.processingHeader = true
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading delivert split')
    this.http.get(this.apiUrl + 'merchandising/load-po-delivery?line_id='+id)
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      console.log(data)
      this.formSplit.setValue({ split_qty : data['0']['split_qty'], delivery_date : new Date(data['0']['delivery_date']) })
      this.processingHeader = false
      this.saveStatus = 'UPDATE'
      setTimeout(() => { AppAlert.closeAlert() } , 1000)
    })

  }

  contextLineRemove(row){

    let data = this.dataset[row]
    console.log(data['po_details_id'])
    AppAlert.showConfirm({text : 'Do you want to remove this line ?'},(result) => {
      if(result.value){

        this.http.get(this.apiUrl + 'merchandising/delete-po-delivery?row='+data['split_id'])
        .pipe( map(res => res['data']) )
        .subscribe(data => {
          console.log(data)
          AppAlert.showSuccess({text:data['message']})

          this.loadSplitTable(data['po_details_id'])

        })


      }
    })


  }

  addNewSplit()
  {
    if(!this.formValidatorSplit.validate())//if validation faild return from the function
      return;

    this.processingHeader = true
    let saveOrUpdate$ = null;
    let formData = this.formSplit.getRawValue();
    //formData['delivery_date'] = formData['delivery_date'].toISOString().split("T")[0]
    formData['delivery_date'] =this.formatFormDate(formData.delivery_date)
    formData['po_details_id'] = this.orderLineData.id
    formData['line_no'] = this.orderLineData.line_no

  //console.log(formData)

    if((this.totalPlannedQty + formData.split_qty) > this.orderLineData.tra_qty ){
        AppAlert.showError({text : 'Total qty must be Less than Total Delivered Qty'})
        this.processingHeader = false
        return;
      }

    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/po-delivery-split' ,
      {'formData':formData , 'status': this.saveStatus });
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/po-delivery-split' ,
      {'formData':formData , 'status': this.saveStatus });
    }


    saveOrUpdate$
    //.pipe( map(res => res['data'] ) )
    .subscribe(
      (res) => {

        //console.log(res)
        this.processingHeader = false
        AppAlert.showSuccess({text:res.data.message})
        this.loadSplitTable(this.orderLineData.id)
        this.formSplit.reset()
        this.saveStatus = 'SAVE'

     },
     (error) => {
        this.processingHeader = false
        console.log(error)
     }
   );

  }

  loadSplitTable(id){
    this.dataset = []
    this.http.get(this.apiUrl + 'merchandising/po-delivery-split-load?line_id='+id)
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      console.log(data)
      this.dataset = data['delivery']
      this.totalPlannedQty = data['delivery_sum'][0]['split_qty_sum']
      //const hotInstance = this.hotOptions.getInstance(this.instance)
      //hotInstance.render()
    })
  }

  Model_hide(){

     this.splitModel.hide()
     $('.modal-backdrop').hide();

   }


  modelShowEvent(e)
  {
      //this.dataset = [];
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

}
