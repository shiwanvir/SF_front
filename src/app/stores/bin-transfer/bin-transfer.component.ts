BinTransferService
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
import { AppValidator } from '../../core/validation/app-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { AuthService } from '../../core/service/auth.service';

import { HotTableModule } from '@handsontable/angular';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';

import { Item } from '../../org/models/item.model';
import { BinTransferService } from './bin-transfer.service';
import { Issue } from '../../stores/models/issue.model';
import { Mrn } from '../../stores/models/mrn.model';
import { Batch } from '../../stores/models/batch.model';
declare var $:any;

@Component({
  selector: 'app-bin-transfer',
  templateUrl: './bin-transfer.component.html',
  //styleUrls: ['./bin-transfer.component.css']
})

export class BinTransferComponent implements OnInit {

  @ViewChild(ModalDirective) detailModal: ModalDirective;

  formGroup : FormGroup
  formGroupGrid : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  instance: string = 'hot';
  modelTitle : string = "Bin Details"
  appValidator : AppValidator
  formValidator : AppFormValidator = null
  processing : boolean = false
  saveStatus = 'SAVE'

  tblDetail: string = 'hot_main'
  mainDataSet: any[] = [];
  detailTable: any

  modalDetail: string = 'hot_modal'
  modalDataSet: any[] = [];
  modalTable: any

  currentDataSetIndex : number = -1

  storeList$ : Observable<Array<any>>
  subStoreList$ : Observable<Array<any>>
  bin$: Observable<any[]>;//use to load customer list in ng-select
  binLoading = false;
  binInput$ = new Subject<string>();
  selectedBin: any[]

  item$: Observable<Item[]>;//use to load style list in ng-select
  itemLoading = false;
  itemInput$ = new Subject<string>();

  selected_sub_store: any[] = [];

  $_userLocation:any
  $_store_id:any
  $_sub_store_id:any

  formFields = {
    store : "",
    sub_store : "",
    store_bin : "",
  }

  constructor(private fb:FormBuilder , private http:HttpClient,private BinTransferService : BinTransferService,private hotRegisterer: HotTableRegisterer,
   private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Bin Transfer")//set page title
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          if(hotInstance != undefined && hotInstance != null){
            hotInstance.render(); //refresh fg items table
          }

    })

    this.formGroup = this.fb.group({
      store : [null , [Validators.required]],
      sub_store : [null , [Validators.required]],
      store_bin : [null , [Validators.required]],
    })

    this.formGroupGrid = this.fb.group({
      item_code : null,
    })

    this.formValidator = new AppFormValidator(this.formGroup , {});

    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);
    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    });

    //lisiten to the click event of orders table's edit button in cut docket listing
    this.BinTransferService.id.subscribe(data => {
      if(data != null){
        console.log(data)
      }
    })

    this.loadSubSores()
    this.loadItemDes()
    this.initializeDetailTable()
    this.initializeModalTable()
    this.loadSubstoreWiseBin()
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
    this.selected_sub_store.splice(0, this.selected_sub_store.length)
  }

  reset_search_feilds(){
    this.formGroupGrid.reset();
    this.modalDataSet=[]
    this.selected_sub_store.splice(0, this.selected_sub_store.length)
  }

  searchFromData(){
  //  debugger
    this.loadSubStoreBin()
    let formData=this.formGroup.getRawValue();
    this.$_userLocation=formData['store']['loc_id']
    setTimeout(() => {
      this.http.post(this.apiUrl + 'store/load_bin_items',{ search:this.formGroup.getRawValue(), details:this.formGroupGrid.getRawValue()})
      .pipe(map( data => data['data'] ))
      .subscribe(data => {
          this.modalDataSet=[]
          const hotInstance = this.hotRegisterer.getInstance(this.modalDetail);
          hotInstance.render()
          this.formGroupGrid.reset()
          this.modalDataSet = data
        },
      )
    }, 100)
  }

  loadItemDes() {
    this.item$ = this.itemInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.itemLoading = true),
      switchMap(term => this.http.get<Item[]>(this.apiUrl + 'store/bin-to-bin-transfer?type=auto_master_code' , {params:{search:term}})
      .pipe(
          tap(() => this.itemLoading = false)
      ))
    );
  }

  loadSubSores(){
    this.storeList$ = this.http.get(this.apiUrl + 'org/stores?type=loc-stores&fields=store_id,store_name', ).pipe( map( res => res['data']) )
  }

  loadSubStore(e){
    this.subStoreList$ = this.http.get(this.apiUrl + 'store/substore?type=loc-sub-stores&fields='+e.store_id, ).pipe( map( res => res['data']) )
  }

  /*loadStoreBin(e){
    let formData = this.formGroup.getRawValue();
    this.storeBinList$ = this.http.get(this.apiUrl + 'store/storebin?type=autoStoreWiseBin&fields='+formData['store']['store_id']+','+e.substore_id, ).pipe( map( res => res['data']) )
  }*/
  clear(e){
    //debugger
    this.selectedBin=null;
  }

  loadSubstoreWiseBin(){
    this.bin$= this.binInput$
    .pipe(
       debounceTime(200),
       distinctUntilChanged(),
       tap(() => this.binLoading = true),
       //switchMap(term => this.http.get<any[]>(this.apiUrl + 'store/storebin?type=autoStoreWiseBin&substore_id='+ substore_id , {params:{search:term}})
        switchMap(term => this.http.get<any[]>(this.apiUrl + 'store/storebin?type=autoStoreWiseBin' , {params:{search:term,substore_id:((this.formGroup.get('sub_store').value == null) ? null : this.formGroup.get('sub_store').value.substore_id )}})
       .pipe(
           //catchError(() => of([])), // empty list on error
           tap(() => this.binLoading = false)
       ))
    );


  }


  initializeDetailTable(){
    let formData = this.formGroup.getRawValue();
    this.detailTable = {
      data:this.mainDataSet,
      columns: [
        { type: 'text', title : 'GRN No', data: 'grn_number',className: "htLeft"},
        { type: 'text', title : 'Roll No/Box No', data: 'roll_or_box_no',className: "htLeft"},
        { type: 'text', title : 'Batch', data: 'batch_no',className: "htLeft"},
        { type: 'text', title : 'Shade', data: 'shade',className: "htLeft"},
        { type: 'text', title : 'Item Code', data: 'master_code',className: "htLeft"},
        { type: 'text', title : 'Item Description', data: 'master_description',className: "htLeft"},
        { type: 'text', title : 'UOM', data: 'uom_code',className: "htLeft"},
        { type: 'text', title : 'From Bin', data: 'store_bin_name_from',className: "htLeft"},
        { type: 'text', title : 'Bin Qty', data: 'avaliable_qty',className: "htRight"},
        {
          title : 'Store',
          type: 'autocomplete',
          source:(query, process)=>{
            var url=$('#url').val();
            $.ajax({
              url:this.apiUrl+'stores/material-transfer?type=getStores',
              dataType: 'json',
              data: {
                query: query,
                location:this.$_userLocation,
              },
              success: function (response) {
                  //console.log(response);
                  process(response);
                  }
            });
          },
          strict: true,
          data:'store_name',
          readOnly: false
        },

        {
          title : 'Sub Store',
          type: 'autocomplete',
          source:(query, process)=> {
            var url=$('#url').val();
            //debugger
          //var ve=surce
            $.ajax({
              url:this.apiUrl+'stores/material-transfer?type=getSubStores',
              dataType: 'json',
              data: {
                query: query,
                location:this.$_userLocation,
                store:this.$_store_id
              },
              success: function (response) {
                process(response);

              }
            });
          },
          strict: true,
          data: 'substore_name',
          readOnly: false
        },
        {
          title : 'To Bin',
          type: 'autocomplete',
          source:(query, process)=> {
            var url=$('#url').val();
            $.ajax({
                url:this.apiUrl+'stores/material-transfer?type=getBins',
              dataType: 'json',
              data: {
                query: query,
                store:this.$_store_id,
                substore:this.$_sub_store_id
              },
              success: function (response) {
                process(response);

              }
            });
          },
          strict: true,
          data: 'store_bin_name',
          readOnly: false
        },
        { type: 'numeric', title : 'Transfer Qty', readOnly:false, allowEmpty: false, data: 'transfer_qty', fillHandle: false ,className: "htRight"},

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
        //  debugger
          let row = source[0][0]
          let col = source[0][1]
          let oldVal = parseFloat(this.mainDataSet[row]['avaliable_qty'])
          let newVal = source[0][3]
          if(col=='transfer_qty'){
            let newVal = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
            if(this.countDecimals(newVal) > 4){
              newVal = this.formatDecimalNumber(newVal, 4)
              this.mainDataSet[row]['transfer_qty']=newVal
            }
            else{
            newVal=newVal
            this.mainDataSet[row]['transfer_qty']=newVal
          }
            if(newVal > oldVal){
              AppAlert.showError({text : 'Cannot exceeded bin quantity'})
              this.mainDataSet[row]['transfer_qty']=oldVal;

            }
              hotInstance.render();
          }
          if(col=='store_name'){
            this.$_store_id=this.mainDataSet[row]['store_name']
            if(  this.$_store_id==undefined)
            this.$_store_id=""
          }
          if(col=='substore_name'){
            this.$_store_id=this.mainDataSet[row]['store_name']
            this.$_sub_store_id=this.mainDataSet[row]['substore_name']
            if(this.$_store_id==undefined)
            this.$_store_id=""
            if(this.$_sub_store_id==undefined)
            this.$_sub_store_id=""
          }

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
      //fixedColumnsLeft: 1,
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
        { type: 'text', title : 'Bin', data: 'store_bin_name_from',className: "htLeft"},
        { type: 'text', title : 'Roll/Box', data: 'roll_or_box_no',className: "htLeft"},
        { type: 'text', title : 'Batch', data: 'batch_no',className: "htLeft"},
        { type: 'text', title : 'Shade', data: 'shade',className: "htLeft"},
        { type: 'text', title : 'Item Code', data: 'master_code',className: "htLeft"},
        { type: 'text', title : 'Item Description', data: 'master_description',className: "htLeft"},
        { type: 'text', title : 'UOM', data: 'uom_code',className: "htLeft"},
        { type: 'text', title : 'Bin Qty', data: 'avaliable_qty',className: "htRight"}
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

  removeLine(row){
    this.currentDataSetIndex = row
    this.mainDataSet.splice(row,1);
    const hotInstance = this.hotRegisterer.getInstance(this.tblDetail);
    hotInstance.render()
  }

  spliceLine(row){
    this.currentDataSetIndex = row
    this.modalDataSet.splice(row,1);
    const hotInstance = this.hotRegisterer.getInstance(this.modalDetail);
    hotInstance.render()
  }

  loadSubStoreBin(){
    this.selected_sub_store.splice(0, this.selected_sub_store.length)
    this.http.post(this.apiUrl + 'store/load_sub_store_bin',{ search:this.formGroup.getRawValue()})
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
        for(let i=0;i<data.length;i++){
      		this.selected_sub_store.push(data[i]);
      	}
      },
    )
  }

  return_stock(){
    if(this.validate_grid_data()){
      let formData = this.formGroup.getRawValue();
    //  AppAlert.showMessage('Processing...','Please wait while saving details')
      this.processing = true
      this.http.post(this.apiUrl + 'store/bin-to-bin-transfer',{'header':formData,'details':this.mainDataSet }).subscribe(data => {
        this.processing = false
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
  }

  validate_grid_data(){

     if(this.mainDataSet.length==0){
       AppAlert.showError({text:"Please add data to grid"})
       return 0;
     }else{
       for(var i=0;i<this.mainDataSet.length;i++){
         if(this.mainDataSet[i]['transfer_qty']==null||this.mainDataSet[i]['transfer_qty']==0||this.mainDataSet[i]['transfer_qty']==""||isNaN(this.mainDataSet[i]['transfer_qty'])){
           AppAlert.showError({text:"Please complete transfer quantity"})
           return 0;
         }else if(this.mainDataSet[i]['store_bin_name']==null||this.mainDataSet[i]['store_bin_name']==0){
           AppAlert.showError({text:"Please select transfer bin"})
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
