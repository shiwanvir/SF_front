import { Component, OnInit, ViewChild, Input, ElementRef  } from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators, FormArray} from '@angular/forms';
import { Http, HttpModule, Headers,  Response } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
import { AppConfig } from '../../core/app-config';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { AuthService } from '../../core/service/auth.service';
import { ModalDirective } from 'ngx-bootstrap';
import {AppAlert} from '../../core/class/app-alert';
import {AppValidator} from '../../core/validation/app-validator';
import { LayoutChangerService } from '../../core/service/layout-changer.service';


@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent implements OnInit {

  @ViewChild("filterModel") filterModel: ModalDirective;
  @ViewChild('binDetailModal') binDetailModal:ModalDirective

  constructor( private fb: FormBuilder, private http:HttpClient, private auth:AuthService,private hotRegisterer: HotTableRegisterer,private layoutChangerService : LayoutChangerService) { }

  serverUrl:string = AppConfig.apiServerUrl()
  apiUrl = AppConfig.apiUrl()

  issueGroup : FormGroup
  filterGroup:FormGroup
  soList$:Observable<Array<any>>
  mrnList$:Observable<Array<any>>
  secList$:Observable<Array<any>>
  subStoreList$:Observable<Array<any>>
  currentDataSetIndex : number = -1
  instanceSearchBox: string = 'instanceSearchBox';
  binDetalModelTitle:string="Bin Details"
  trimPackingModelTitle:string="Trim Packing Details";
  saveOrUpdate='Save';
  processing : boolean = false
  hotOptionsSearchBox: any
  datasetSearchBox: any[] = [];
  appValidator: AppValidator
  instance: string = 'instance';
  hotOptions: any
  barcodeModel:any
  dataset: any[] = [];
  barCodeData:any[]=[];

  instanceBinDetails:string='instanceBinDetails';
  hotOptionsBinDetails:any
  datasetBinDetails:any=[];


  mrnNo$: Observable<any[]>;//use to load customer list in ng-select
  mrnNoLoading = false;
  mrnNoInput$ = new Subject<string>();
  selectedmrnNo: any[]
  authdata: any;
  pending_qty:any=0;
  mrn_detail_id:any=0;
  issueable_qty:any=0;
  isSavebuttonDisable:boolean=true;
  islineticked:boolean=true;

  formFields={
    issue_no:'',
    mrn_no:'',
    validation_error:''

  }

  ngOnInit() {

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          if(hotInstance != undefined && hotInstance != null){
            hotInstance.render(); //refresh fg items table
          }

    })

    this.issueGroup = this.fb.group({
      issue_id:0,
      issue_no: 0,
      mrn_no:[0,[Validators.required]],
      section: [],
      sub_stores: [],
      issue_lines: []
    });

    this.filterGroup=this.fb.group({
      barcode:null,
    });

    this.appValidator = new AppValidator(this.formFields,{},this.issueGroup);
    this.issueGroup.valueChanges.subscribe(data => { //validate form when form value changes
    //  debugger
      //this.mrnGroup
      this.appValidator.validate();
    });

    this.soList$ = this.getSoList()
    //this.loadMrns(true)

    this.authdata = this.auth.getUserData()
    this.loadMrnNoList()
    this.initializeSearchBoxTable()
    this.initializeBinDetailsTable()
    this.initializeTable()
  }

  formValidate(){ //validate the form on input blur
    //debugger
    this.appValidator.validate();
  }

  getSoList(){
    return this.http.get(this.apiUrl + 'merchandising/customer-orders?fields=order_id,order_code&type=select', ).pipe( map( res => res['data']) )
  }

/*  loadMrns(event){
    this.mrnList$ = this.http.get(this.apiUrl + 'store/mrn?fields=mrn_id,mrn_no&type=mrn-select&so='+event.order_id, ).pipe( map( res => res['data']) )
  }
*/


initializeSearchBoxTable(){
  var clipboardCache = '';
//var sheetclip = new sheetclip();
  this.hotOptionsSearchBox = {
    columns: [
      { type: 'checkbox', title : 'Action' , readOnly: false, data : 'isEdited' , checkedTemplate: 1,  uncheckedTemplate: 0 },
      { type: 'text', title : 'Baracode' , data: 'barcode',className: "htLeft"},
      { type: 'text', title : 'Bin' , data: 'store_bin_name',className: "htLeft"},
      { type: 'text', title : 'Invoice No' , data: 'invoice_no',className: "htLeft"},
      { type: 'text', title : 'LOT No' , data: 'lot_no',className: "htLeft"},
      { type: 'text', title : 'Roll No' , data: 'roll_or_box_no',className: "htLeft"},
      { type: 'text', title : 'Shade' , data: 'shade',className: "htLeft"},
      { type: 'text', title : 'Width' , data: 'width',className: "htLeft"},
      { type: 'numeric', title : 'Qty' , data: 'avaliable_qty',className: "htRight"},
      {type:'numeric',title:'Issue Qty',data:'issue_qty',readOnly: false,className: "htRight"}

    ],
    manualColumnResize: true,
    autoColumnSize : true,
    rowHeaders: true,
    colHeaders: true,
    //nestedRows: true,
    height: 250,
    copyPaste: true,
    stretchH: 'all',
    selectionMode: 'range',
    fixedColumnsLeft: 3,
    /*columnSorting: true,*/
    className: 'htCenter htMiddle',
    readOnly: true,
    mergeCells:[],
    afterChange:(changes,surce,row,col,value,prop)=>{
      //debugger
      if(surce != null && surce.length > 0){
        const hotInstance = this.hotRegisterer.getInstance(this.instanceSearchBox);
        let _row = surce[0][0]
        if( surce[0][1] =='isEdited'){
          this.checkConfrimButtonStatus(this.datasetSearchBox)
        }
        if(surce[0][1]=='issue_qty'){
        let _qty = (surce[0][3] == '' || isNaN(surce[0][3])) ? 0 : surce[0][3]
        if(this.countDecimals(_qty) > 4){
          _qty = this.formatDecimalNumber(_qty, 4)

        }
        else{
          this.datasetSearchBox[_row]['issue_qty']=_qty
      }
      if(_qty>this.datasetSearchBox[_row]['avaliable_qty']){
        AppAlert.showError({text:"Availabale Qty Exceed"})
        _qty=0;
      }
      this.datasetSearchBox[_row]['issue_qty']=_qty
      hotInstance.render()
      //hotInstance.setDataAtCell(_row, 10, _qty)
      }

      }


        },
      afterCreateRow:(index,amount,source)=>{
        //console.log(index);

        //let x=this.dataset;



      },
      afterPaste:(changes)=>{

          const hotInstance = this.hotRegisterer.getInstance(this.instanceSearchBox);
            hotInstance.render();
            console.log('im here.....')
            //console.log(this.dataset)
      },

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

          'delete' : {
            name : 'Delete',
            disabled: function (key, selection, clickEvent) {
              // Disable option when first row was clicked
              return this.getSelectedLast() == undefined // `this` === hot3
            },
            callback : (key, selection, clickEvent) => {
              if(selection.length > 0){
                let start = selection[0].start;
                this.contextMenuDelete(start.row)
                this.checkConfrimButtonStatus(this.datasetSearchBox)
              }
            }
          },

        /* 'Add Line':{
            name:'Bin Details',
            disabled: function (key, selection, clickEvent){
               // Disable option when first row was clicked
               console.log("im firing")
               console.log(selection)
               console.log(this.getSelectedLast()[1])
              // var line=this.getSelectedLast()[1]
               //return this.checkCopyStatus()==false
               //this.testMethod(line, selection, clickEvent)
               //console.log(this.dataset)
               //const hotInstance = this.hotRegisterer.getInstance(this.instance);
               //console.log(this.instance)
               return this.getSelectedLast()[1]==0

             },
            callback:(key, selection, clickEvent)=> {
             //this.addLine(key, selection, clickEvent)
             this.loadBinDetails(key, selection, clickEvent)

            }

          },*/


//

          /*'remove_row' : {
            name : 'Remove Delivery',
            callback : (key, selection, clickEvent) => {
              if(selection.length > 0){
                let start = selection[0].start;
                this.contextMenuRemove(start.row)
              }
            }
          }*/
        }
    }
  }
}




initializeTable(){
  var clipboardCache = '';
//var sheetclip = new sheetclip();
  this.hotOptions = {
    columns: [
      { type: 'text', title : 'Shop Order ID' , data: 'shop_order_id',className: "htLeft"},
      { type: 'text', title : 'Shop Order Detail ID' , data: 'shop_order_detail_id',className: "htLeft"},
      { type: 'text', title : 'Item Code' , data: 'master_code',className: "htLeft"},
      { type: 'text', title : 'Item Description' , data: 'master_description',className: "htLeft"},
      { type: 'text', title : 'Item Color' , data: 'color_name',className: "htLeft"},
      { type: 'text', title : 'Size' , data: 'size_name',className: "htLeft"},
      { type: 'text', title : 'PO UOM' , data: 'uom_code',className: "htLeft"},
      { type: 'text', title : 'Inventory UOM' , data: 'inventory_uom',className: "htLeft"},
      { type: 'text', title : 'Order YY' , data: 'gross_consumption',className: "htLeft"},
      { type: 'text', title : 'Wastage%' , data: 'wastage',className: "htLeft"},
      { type: 'text', title : 'Order Qty' , data: 'order_qty',readOnly: true,className: "htRight"},
      //{ type: 'numeric', title : 'Required Qty' , data: 'required_qty',readOnly: false},
      { type: 'numeric', title : 'Requested Qty' , data: 'requested_qty',readOnly: true,className: "htRight"},
      { type: 'numeric', title : 'Total Issued form MRN Line' , data: 'total_issued_qty',readOnly: true,className: "htRight"},
      { type: 'numeric', title : 'Shop Order Asign Qty' , data: 'asign_qty',readOnly: true,className: "htRight"},
      { type: 'numeric', title : 'Balanced to Issue' , data: 'balance_to_issue_qty',readOnly: true,className: "htRight"},
      { type: 'numeric', title : 'Stock Qty' , data: 'total_qty_', readOnly:true,className: "htRight"},

//
    ],
    manualColumnResize: true,
    autoColumnSize : true,
    rowHeaders: true,
    colHeaders: true,
    //nestedRows: true,
    height: 250,
    copyPaste: true,
    stretchH: 'all',
    selectionMode: 'range',
    fixedColumnsLeft: 3,
    /*columnSorting: true,*/
    className: 'htCenter htMiddle',
    readOnly: true,
    mergeCells:[],
    afterChange:(changes,surce,row,col,value,prop)=>{

      //let x=this.dataset;


        },
      afterCreateRow:(index,amount,source)=>{
        //console.log(index);

        //let x=this.dataset;



      },
      afterPaste:(changes)=>{

          const hotInstance = this.hotRegisterer.getInstance(this.instanceSearchBox);
            hotInstance.render();
            console.log('im here.....')
            //console.log(this.dataset)
      },

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

        'Scan Barcode' : {
            name : 'Scan Barcode',
            disabled: function (key, selection, clickEvent) {
              // Disable option when first row was clicked
              return this.getSelectedLast() == undefined // `this` === hot3
            },
            callback : (key, selection, clickEvent) => {
              if(selection.length > 0){
                let start = selection[0].start;
                this.loadFilterModel(key, selection, clickEvent)
              }
            }
          },

         'Add Line':{
            name:'Bin Details',
            disabled: function (key, selection, clickEvent){
               // Disable option when first row was clicked
               console.log("im firing")
               console.log(selection)
               console.log(this.getSelectedLast()[1])
              // var line=this.getSelectedLast()[1]
               //return this.checkCopyStatus()==false
               //this.testMethod(line, selection, clickEvent)
               //console.log(this.dataset)
               //const hotInstance = this.hotRegisterer.getInstance(this.instance);
               //console.log(this.instance)
               return this.getSelectedLast()[1]==0

             },
            callback:(key, selection, clickEvent)=> {
             //this.addLine(key, selection, clickEvent)
             this.loadBinDetails(key, selection, clickEvent)

            }

          },


//

          /*'remove_row' : {
            name : 'Remove Delivery',
            callback : (key, selection, clickEvent) => {
              if(selection.length > 0){
                let start = selection[0].start;
                this.contextMenuRemove(start.row)
              }
            }
          }*/
        }
    }
  }
}


initializeBinDetailsTable(){
  var clipboardCache = '';
//var sheetclip = new sheetclip();
  this.hotOptionsBinDetails = {
    columns: [
      { type: 'checkbox', title : 'Action' , readOnly: false, data : 'isEdited' , checkedTemplate: 1,  uncheckedTemplate: 0 },
      { type: 'text', title : 'Baracode' , data: 'barcode',className: "htLeft"},
      { type: 'text', title : 'Bin' , data: 'store_bin_name',className: "htLeft"},
      { type: 'text', title : 'Invoice No' , data: 'invoice_no',className: "htLeft"},
      { type: 'text', title : 'LOT No' , data: 'lot_no',className: "htLeft"},
      { type: 'text', title : 'Roll No' , data: 'roll_or_box_no',className: "htLeft"},
      { type: 'text', title : 'Shade' , data: 'shade',className: "htLeft"},
      { type: 'text', title : 'Width' , data: 'width',className: "htLeft"},
      { type: 'numeric', title : 'Qty' , data: 'avaliable_qty',className: "htRight"},
      {type:'numeric',title:'Issue Qty',data:'issue_qty',readOnly: false,className: "htRight"}

    ],
    manualColumnResize: true,
    autoColumnSize : true,
    rowHeaders: true,
    colHeaders: true,
    //nestedRows: true,
    height: 250,
    copyPaste: true,
    stretchH: 'all',
    selectionMode: 'range',
    fixedColumnsLeft: 3,
    /*columnSorting: true,*/
    className: 'htCenter htMiddle',
    readOnly: true,
    mergeCells:[],
    afterChange:(changes,surce,row,col,value,prop)=>{
      //debugger
      if(surce != null && surce.length > 0){
        const hotInstance = this.hotRegisterer.getInstance(this.instanceBinDetails);
        let _row = surce[0][0]
        if( surce[0][1] =='isEdited'){
          this.checkConfrimButtonStatus(this.datasetBinDetails)
        }
        if(surce[0][1]=='issue_qty'){
        let _qty = (surce[0][3] == '' || isNaN(surce[0][3])) ? 0 : surce[0][3]
        if(this.countDecimals(_qty) > 4){
          _qty = this.formatDecimalNumber(_qty, 4)

        }
        else{
          this.datasetBinDetails[_row]['issue_qty']=_qty
      }
      if(_qty>this.datasetBinDetails[_row]['avaliable_qty']){
        AppAlert.showError({text:"Availabale Qty Exceed"})
        _qty=0;
      }
      this.datasetBinDetails[_row]['issue_qty']=_qty
      hotInstance.render()
      //hotInstance.setDataAtCell(_row, 10, _qty)
      }

      }


        },
      afterCreateRow:(index,amount,source)=>{
        //console.log(index);

        //let x=this.dataset;



      },
      afterPaste:(changes)=>{

          const hotInstance = this.hotRegisterer.getInstance(this.instanceSearchBox);
            hotInstance.render();
            console.log('im here.....')
            //console.log(this.dataset)
      },

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

          'delete' : {
            name : 'Delete',
            disabled: function (key, selection, clickEvent) {
              // Disable option when first row was clicked
              return this.getSelectedLast() == undefined // `this` === hot3
            },
            callback : (key, selection, clickEvent) => {
              if(selection.length > 0){
                let start = selection[0].start;
                //this.contextMenuDelete(start.row)
              }
            }
          },

         'Add Line':{
            name:'Bin Details',
            disabled: function (key, selection, clickEvent){
               // Disable option when first row was clicked
               console.log("im firing")
               console.log(selection)
               console.log(this.getSelectedLast()[1])
              // var line=this.getSelectedLast()[1]
               //return this.checkCopyStatus()==false
               //this.testMethod(line, selection, clickEvent)
               //console.log(this.dataset)
               //const hotInstance = this.hotRegisterer.getInstance(this.instance);
               //console.log(this.instance)
               return this.getSelectedLast()[1]==0

             },
            callback:(key, selection, clickEvent)=> {
             //this.addLine(key, selection, clickEvent)
             this.loadBinDetails(key, selection, clickEvent)

            }

          },


//

          /*'remove_row' : {
            name : 'Remove Delivery',
            callback : (key, selection, clickEvent) => {
              if(selection.length > 0){
                let start = selection[0].start;
                this.contextMenuRemove(start.row)
              }
            }
          }*/
        }
    }
  }
}


        addLine(key, selection, clickEvent){
        //debugger
          var addAll=0
        var row =selection[0]['end']['row']
        //console.log(this.dataset[row])
        /*
        for(var i=0;i<this.dataset.length;i++){
          if(this.dataset[i]['checked']=!undefined && this.dataset[i]['checked']==1){
            addAll=1
            break;
          }
        }*/
        if(addAll==1){
        /*  for(var j=0;j<this.dataset.length;j++){
              for(var i=0;i<this.datasetDetails.length;i++){

                if(this.datasetDetails[i]['id']==this.dataset[j]['id']){
                //this.snotifyService.error("Can't Delete", this.tosterConfig);
                break
                }
                if(this.datasetDetails[i]['id']!=this.dataset[j]['id']){
                   var ab=this.findId(this.dataset[j]['id'])
                if(ab==true){
                this.dataset[j]['bal_qty']=0
                this.datasetDetails.push(this.dataset[j])
                this.dataset.splice(j,1);
                this.dataset.length
                this.dataset
                break
              }
              }
              }



          }
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          hotInstance.render();*/
        }

        if(addAll==0){

        //debugger
        for(var i=0;i<this.dataset.length;i++){

          if(this.dataset[i]['shop_order_detail_id']==this.datasetSearchBox[row]['shop_order_detail_id']){
          AppAlert.showError({text:"Line Already Added"})

          return 0;
        }
        }
        //debugger
        //let formData = this.mrnGroup.getRawValue();
        //var cut_qty=formData['cut_qty'];
      //  this.datasetSearchBox[row]['requested_qty']=parseInt(cut_qty)*parseFloat(this.datasetSearchBox[row]['gross_consumption'])
        this.dataset.push(this.datasetSearchBox[row])

        if(selection.length > 0){
          let start = selection[0].start;
          this.contextMenuDelete(start.row)
        }

        }

        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        hotInstance.render();
        addAll=0



        }


        loadBinDetails(key, selection, clickEvent){
          //debugger
          this.binDetailModal.show()
          //this.newLine(selection)
          let row=selection[0]['start']['row'];
          let formData=this.issueGroup.getRawValue()
          let shop_order_id=this.dataset[row]['shop_order_id']
          let shop_order_detail_id=this.dataset[row]['shop_order_detail_id']
          let item_id=this.dataset[row]['item_id']
          let requested_qty=this.dataset[row]['requested_qty']
          this.mrn_detail_id=this.dataset[row]['mrn_detail_id']
          this.issueable_qty=requested_qty-this.dataset[row]['total_issued_qty'];
          formData['mrn_id']=formData['mrn_no']['mrn_id'];


          this.http.get(this.apiUrl + 'store/loadBinDetails?shop_order_id='+shop_order_id+'&shop_order_detail_id='+shop_order_detail_id+'&item_id='+item_id+'&requested_qty='+requested_qty+'&mrn_id='+formData.mrn_id)
        .pipe( map(res => res['data']) )
       .subscribe(data=>{
         if(data.status==1){
         this.datasetBinDetails=data.data;
         this.pending_qty=data.pending_qty
         //this.mrn_detail_id=
       }
        else if(data.status==0){
          this.datasetBinDetails=data.data;
          this.pending_qty=data.pending_qty
          AppAlert.showError({text:data.message})
        }
           })




        }

        loadBinDetailsFromBarcode($event){
        //  debugger
          var barCode=this.filterGroup.getRawValue()
        //  if(barCode.barcode!="")
        //  {
          this.http.get(this.apiUrl + 'store/loadBinDetailsfromBarcode?shop_order_id='+this.barCodeData['shop_order_id']+'&shop_order_detail_id='+this.barCodeData['shop_order_detail_id']+'&item_id='+this.barCodeData['item_id']+'&requested_qty='+this.barCodeData['requested_qty']+'&mrn_id='+this.barCodeData['mrn_id']+'&barCode='+barCode.barcode)
          .pipe( map(res => res['data']) )
           .subscribe(data=>{
             if(data.status==1){
              if(data.data!=null){
                debugger
                data.data.isEdited=1;
                this.islineticked=true;
                for(var i=0;i<this.datasetSearchBox.length;i++){
                  if(data.data.stock_detail_id==this.datasetSearchBox[i]['stock_detail_id']){
                  AppAlert.showError({text:"Barcode Already Scaned"})
                    return 0;
                  }
                }
             this.datasetSearchBox.push(data.data);
             this.pending_qty=data.pending_qty
             this.filterGroup.reset();
             this.setCursor()
           }
             //this.mrn_detail_id=
           }
            else if(data.status==0){
              this.datasetSearchBox=data.data;
              this.pending_qty=data.pending_qty
              AppAlert.showError({text:data.message})
               this.setCursor()
            }
           })
         //}
        }

        newLine(selection){
          let row=selection[0]['start']['row'];
          for(var i=0;i<this.dataset.length;i++){

              if(this.dataset[i]['shop_order_detail_id']==this.datasetSearchBox[row]['shop_order_detail_id']){
                return 0
              }
          }
            this.dataset.push(this.datasetSearchBox[row])
            const hotInstance = this.hotRegisterer.getInstance(this.instance);
            hotInstance.render();
        }


        contextMenuDelete(row){
          let selectedRowData = this.datasetSearchBox[row]
          this.currentDataSetIndex = row
          this.datasetSearchBox.splice(row,1);
          console.log(this.dataset);
          const hotInstance = this.hotRegisterer.getInstance(this.instanceSearchBox);
          hotInstance.render();



        }

  selectMrn(event){
    this.secList$ = this.http.get(this.apiUrl + 'org/sections?fields=section_id,section_name&loc='+this.authdata.location, ).pipe( map( res => res['data']))
  }

  loadSubStores(event){
    this.subStoreList$ = this.http.get(this.apiUrl + 'store/substore?fields=substore_id,substore_name&loc='+this.authdata.location, ).pipe( map( res => res['data']) )
  }

  loadMrnNoList(){
    //debugger
    this.mrnNo$= this.mrnNoInput$
    .pipe(
       debounceTime(200),
       distinctUntilChanged(),
       tap(() => this.mrnNoLoading = true),
       switchMap(term => this.http.get<any[]>(this.apiUrl + 'store/mrn?type=auto' , {params:{search:term}})
       .pipe(
           //catchError(() => of([])), // empty list on error
           tap(() => this.mrnNoLoading = false)
       ))
    );

  }

loadFilterModel(key, selection, clickEvent){
//  debugger
  this.filterModel.show()

  let row=selection[0]['start']['row'];
  let formData=this.issueGroup.getRawValue()
  this.barCodeData['shop_order_id']=this.dataset[row]['shop_order_id']
  this.barCodeData['shop_order_detail_id']=this.dataset[row]['shop_order_detail_id']
  this.barCodeData['item_id']=this.dataset[row]['item_id']
  this.barCodeData['mrn_id']=formData['mrn_no']['mrn_id']
  this.barCodeData['requested_qty']=this.dataset[row]['requested_qty']
  this.barCodeData['mrn_detail_id']=this.dataset[row]['mrn_detail_id']
  this.barCodeData['issueable_qty']=this.barCodeData['requested_qty']-this.dataset[row]['total_issued_qty'];
  let requested_qty=this.dataset[row]['requested_qty']
  this.mrn_detail_id=this.dataset[row]['mrn_detail_id']
  this.issueable_qty=requested_qty-this.dataset[row]['total_issued_qty'];
  //debugger

  this.datasetSearchBox=[]
}
setCursor(){
    $("#b").focus();
    const hotInstance = this.hotRegisterer.getInstance(this.instanceSearchBox);
    hotInstance.render()
}

savebarcodeWiseData(){
  this.saveBinData(this.datasetSearchBox)
}
saveBatchWiseData(){
  this.saveBinData(this.datasetBinDetails)
}



  saveBinData(data){
    //debugger
    this.processing = true
    let fromData=this.issueGroup.getRawValue()
    var saveOrUpdate$=null
    var _tot_issue_qty=0;
        for(var i=0;i<data.length;i++){
          if(data[i]['issue_qty']>0){
            if(data[i]['isEdited']==undefined||data[i]['isEdited']==0){
                this.processing =false
              AppAlert.showError({text:"please tick edited rows"})
              return 0;
            }
            }
             if(data[i]['isEdited']==1){
               if(data[i]['issue_qty']==undefined){
                   this.processing = false
                 AppAlert.showError({text:"Please add Issue Qty"})
                 return 0;
               }
               else if(data[i]['issue_qty']!=undefined){
                  _tot_issue_qty=_tot_issue_qty+data[i]['issue_qty']
               }
             }


        }
        if(this.issueable_qty<_tot_issue_qty){
        AppAlert.showError({text:"Exceed the requested qty"})
        return 0;
        }

    AppAlert.showMessage('Processing...','Please wait while saving details')
    saveOrUpdate$ =this.http.post(this.apiUrl + 'store/issue',{'header':fromData,'dataset':data,'mrn_detail_id':this.mrn_detail_id})

    //.pipe( map(res => res['data']) )
     .subscribe(data=>{
    /*  this.issueGroup.setValue({
        'issue_no':data['issue_no'],
      })*/

      this.issueGroup.patchValue({
     'issue_no':data['data']['issueNo'],
     'issue_id':data['data']['issueId']
      })
      //this.issueGroup.getRawValue()
       setTimeout(() => {
         AppAlert.showSuccess({text:data['data']['message1']+data['data']['issueNo']+data['data']['message2']});
       }, 20)
         })
         this.isSavebuttonDisable=false
      this.binDetailModal.hide()
      this.filterModel.hide()
  }

  confirmIssueData(){
    //debugger
    this.processing = true
  //  AppAlert.showMessage('Processing...','Please wait while confirming details')
    let formData=this.issueGroup.getRawValue()
    formData['mrn_id']=formData['mrn_no']['mrn_id']
    var test$=null;
    test$ =this.http.post(this.apiUrl + 'store/issue/confirm-issue-data',{'header':formData,'dataset':this.dataset})
    //.pipe( map(res => res['data']) )
     .subscribe(data=>{
    /*  this.issueGroup.patchValue({
     'issue_no':data['data']['issue_no']
   })*/
      //this.issueGroup.getRawValue()
       setTimeout(() => {
         AppAlert.showSuccess({text: data['data']['message']});
       }, 20)
         })
    this.clearDetails()
  }
  loadSoInfo(){

  }

  closeModal(){

  }

  saveIssue(){}


  closeBinModal(){}

  loadMrnData(){
    let formData=this.issueGroup.getRawValue()

    formData['mrn_id']=formData['mrn_no']['mrn_id'];
    formData['issue_no']=formData['issue_no'];
    this.http.get(this.apiUrl + 'store/loadMrnData?mrn_id='+formData.mrn_id+'&issue_no='+formData.issue_no)
.pipe( map(res => res['data']) )
 .subscribe(data=>{
   this.dataset=data;
     })
     this.issueGroup.disable();

  }

  clearDetails(){
    this.issueGroup.reset();
    this.issueGroup.enable();
    this.dataset=[]
    this.isSavebuttonDisable=true
    this.issueGroup.patchValue({
   'issue_no':0
    })
  }

  checkConfrimButtonStatus(data){
    //debugger
    var c=0;
    for(var i=0;i<data.length;i++){
      if(data[i]['isEdited']==1)
       c++
      //if()
    }
    if(c>0){
      this.islineticked=true
    }
    else if(c==0){
      this.islineticked=false
    }
  }

  showFilterModel(){

    this.filterModel.show()
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
