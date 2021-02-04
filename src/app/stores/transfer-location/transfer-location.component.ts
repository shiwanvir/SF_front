import { Component, OnInit , ViewChild} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { Http, HttpModule, Headers,  Response } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject,BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third pirt routingComponents
//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';


import { NgOption } from '@ng-select/ng-select';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppAlert } from '../../core/class/app-alert';
import { AppConfig } from '../../core/app-config';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
//models
//import {Location} from'../org/models/loction';

@Component({
  selector: 'app-transfer-location',
  templateUrl: './transfer-location.component.html',
  styleUrls: ['./transfer-location.component.css']
})
export class TransferLocationComponent implements OnInit {
  @ViewChild(ModalDirective) detailsModel: ModalDirective;
    @ViewChild("filterModel") filterModel: ModalDirective;
  instance: string = 'instance';
  //form group for po seraching
  formGroup : FormGroup
 filterModelTitle:string="Item Details"
  formValidator : AppFormValidator = null
  formGroupDetails:FormGroup
  saveStatusDetails : string = 'SAVE'
  modelTitle : string = "New Silhouette Classification"
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  formdetailsValidator:AppValidator
  saveStatus = 'SAVE'
  processing : boolean = false
  style_to_error :string
  style_from_error:string
  //hansontable variables
  currentDataSetIndex : number = -1
  orderId = 0

  location$: Observable<Location[]>;//use to load customer list in ng-select
  locationLoading = false;
  locationInput$ = new Subject<string>();
  selectedLocation: Location[]

  shopOrderFrom$: Observable<any[]>;//use to load customer list in ng-select
  shopOrderFromLoading = false;
  shopOrderFromInput$ = new Subject<string>();
  selectedShopOrderFrom: Location[]

  shopOrderTo$: Observable<any[]>;//use to load customer list in ng-select
  shopOrderToLoading = false;
  shopOrderToInput$ = new Subject<string>();
  selectedShopOrderTo: Location[]

  transferType$: Observable<Location[]>;//use to load customer list in ng-select
  typeLoading = false;
  typeInput$ = new Subject<string>();
  selectedType: Location[]
  islineticked:boolean=false
  isSaved:boolean=false

  private lineSource = new BehaviorSubject<string>(null)
  lineData = this.lineSource.asObservable()

  private splitLineSource = new BehaviorSubject<string>(null)
  splitLineData = this.splitLineSource.asObservable()

  private revisionLineSource = new BehaviorSubject<string>(null)
  revisionLineData = this.revisionLineSource.asObservable()

    instanceSearchBox: string = 'instanceSearchBox';
    hotOptionsSearchBox: any
    datasetSearchBox: any[] = [];

  //hot table variables ...............................................
  dataset: any[] = [];
  hotOptions: any
  temp:any=null;
  formFields = {
      shop_order_from: '',
      style_from:'',
      shop_order_to:'',
      style_to:'',
      validation_error :'',
      loc_name:'',
      transfer_type:''

  }

  formValidatorDetails={
    item_code:'',
    description:'',
    color:'',
    size:'',
    bin:'',
    uom:'',
    stock_balance:'',
    trns_qty:''

  }


  constructor(private fb:FormBuilder,private http:HttpClient,private hotRegisterer: HotTableRegisterer, private titleService: Title,private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {

    this.titleService.setTitle("Material Transfer")//set page title
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          if(hotInstance != undefined && hotInstance != null){
            hotInstance.render(); //refresh fg items table
          }

    })

    this.layoutChangerService.changeHeaderPath([
      'Warehouse Management',
      'Stores',
      'Material Transfer'
    ])


    this.initializeOrderLinesTable()
    debugger
    this.formGroup = this.fb.group({
        gate_pass_id :0,
        shop_order_from : [null , [Validators.required]],
        style_id:[null],
        style_from : [null],
        shop_order_to:  [null , [Validators.required]],
        transfer_type : [null , [Validators.required]],
        loc_name : [null , [Validators.required]/*,[basicValidator.remot  e(remoteValidationConfig)]*/]
    })
     this.loadLocations()
     this.loadShopOrderFrom()
     this.loadShopOrderTo()
     this.initializeBinDetailsTable()
     this.loadTransfertype()
     //this.loadCurrentLocation()
      // this.formValidator = new AppFormValidator(this.formGroup , {});
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

  //this.createTable()
  this.formGroupDetails=this.fb.group({
    details_id:[0],
    item_code:[null , [Validators.required]],
    description:[null , [Validators.required]],
    color:[null , [Validators.required]],
    size:[null , [Validators.required]],
    bin:[null , [Validators.required]],
    uom:[null , [Validators.required]],
    stock_balance:[null , [Validators.required]],
    trans_qty:[null , [Validators.required]],





  })



    this.formValidator = new AppFormValidator(this.formGroupDetails , {})
  //create new validation object
  this.formdetailsValidator = new AppValidator(this.formValidatorDetails,{},this.formGroupDetails);

  this.formGroupDetails.valueChanges.subscribe(data => { //validate form when form value changes
    this.formdetailsValidator.validate();
  })

  }



  loadLocations() {
       this.location$ = this.locationInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.locationLoading = true),
          switchMap(term => this.http.get<Location[]>(this.apiUrl + 'org/locations?type=auto_with_out_current_loc' , {params:{search:term}})
          .pipe(
              //catchError(() => of([])), // empty list on error
              tap(() => this.locationLoading = false)
          ))
       );
   }

   loadTransfertype(){
     this.transferType$ = this.typeInput$
     .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.typeLoading = true),
        switchMap(term => this.http.get<Location[]>(this.apiUrl + 'stores/transfer-location?type=auto' , {params:{search:term}})
        .pipe(
            //catchError(() => of([])), // empty list on error
            tap(() => this.typeLoading = false)
        ))
     );

   }
   changeLocation(){
     //debugger
     let formData=this.formGroup.getRawValue()
     if(formData['transfer_type']['transfer_type']=="INTER-LOCATION"){
       this.loadCurrentLocation()
     }
     else if(formData['transfer_type']['transfer_type']=="LOCATION-LOCATION"){
       this.selectedLocation=null;
       this.formGroup.get('loc_name').enable()
     }

   }

   loadCurrentLocation(){

       var location=this.http.get<Location[]>(this.apiUrl + 'org/locations?type=auto_current_loc')
       .pipe( map(res => res['data']) )
       .subscribe(data=>{
         //debugger
         this.formGroup.patchValue({
           'loc_name':data
         })
           this.formGroup.get('loc_name').disable()
          })



   }

   initializeBinDetailsTable(){
     var clipboardCache = '';
   //var sheetclip = new sheetclip();
     this.hotOptionsSearchBox = {
       columns: [
         { type: 'checkbox', title : 'Action' , readOnly: false, data : 'isEdited' , checkedTemplate: 1,  uncheckedTemplate: 0 },
         { type: 'text', title : 'Barcode' , data: 'barcode'},
         { type: 'text', title : 'Bin' , data: 'store_bin_name'},
         { type: 'text', title : 'Comment' , data: 'comment'},
         { type: 'text', title : 'Invoice NO' , data: 'invoice_no'},
         { type: 'text', title : 'LOT NO' , data: 'lot_no'},
         { type: 'text', title : 'Roll No/Box NO' , data: 'roll_no'},
         { type: 'text', title : 'Shade' , data: 'shade'},
         { type: 'text', title : 'Width' , data: 'width'},
         { type: 'text', title : 'Qty' , data: 'qty'},
         {type:'text',title:'Issue Qty',data:'issue_qty',readOnly: false}

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
                //this.loadBinDetails(key, selection, clickEvent)

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


   //initialize handsontable for customer order line table
   initializeOrderLinesTable(){

     this.hotOptions = {
       columns: [
         { type: 'checkbox', title : 'Action' , readOnly: false, data : 'isEdited' , checkedTemplate: 1,  uncheckedTemplate: 0 },
         { type: 'text', title : 'Barcode' , data: 'barcode',className: "htLeft"},
         { type: 'text', title : 'Bin' , data: 'store_bin_name',className: "htLeft"},
         { type: 'text', title : 'Comment' , data: 'inspection_status',className: "htLeft"},
         { type: 'text', title : 'Invoice NO' , data: 'invoice_no',className: "htLeft"},
         { type: 'text', title : 'Item Code' , data: 'master_code',className: "htLeft"},
         { type: 'text', title : 'LOT NO' , data: 'lot_no',className: "htLeft"},
         { type: 'text', title : 'Roll No/Box NO' , data: 'roll_or_box_no'},
         { type: 'text', title : 'Shade' , data: 'shade',className: "htLeft"},
         { type: 'numeric', title : 'Width' , data: 'width',className: "htRight"},
         { type: 'numeric', title : 'Qty' , data: 'avaliable_qty',className: "htRight"},
         {type:'numeric',title:'Transfer Qty',data:'trans_qty',readOnly: false,className: "htRight"}

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
         if(surce!=null && surce.length > 0){
           let _row=surce[0][0];
           const hotInstance = this.hotRegisterer.getInstance(this.instance);
           debugger
           if(surce[0][1]=='trans_qty'){
              let _qty = (surce[0][3] == '' || isNaN(surce[0][3])||surce[0][3] <0) ? 0 : surce[0][3]
                 this.dataset[_row]['trans_qty'] = _qty;
              if(this.countDecimals(_qty) > 4){
                _qty = this.formatDecimalNumber(_qty, 4)
                    this.dataset[_row]['trans_qty'] = _qty;
              }

           else if(this.dataset[_row]["total_qty"]<surce["0"]["3"]){
             AppAlert.showError({text:"Stock Qty Exceeded"});
             this.dataset[_row]['trans_qty'] = 0;
             hotInstance.render();
           }
            hotInstance.render();
         }
           else if(surce[0][1]=='isEdited'){
              this.checkConfrimButtonStatus()
           }






       }

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

     }
   }

   //fire when click context menu - add
   contextMenuAdd(){
     this.formGroupDetails.reset()
     this.saveStatusDetails = 'SAVE'
     this.modelTitle = 'Add Order Line'
     this.detailsModel.show()
     this.currentDataSetIndex = -1
   }

   //context menu - edit
   contextMenuEdit(row){
     let selectedRowData = this.dataset[row]
     this.currentDataSetIndex = row
     this.loadOrderLineDetails(selectedRowData['details_id'])
     this.saveStatusDetails = 'UPDATE'
   }


   //context menu - size
   contextMenuSize(row){
     let data = {
       details_id : this.dataset[row]['details_id'],
       order_qty : this.dataset[row]['order_qty'],
       planned_qty : this.dataset[row]['planned_qty'],
       excess_presentage : this.dataset[row]['excess_presentage']
     }
     this.changeLineData(data)
   }

   //context menu - merge
   contextMenuMerge(){
     let arr = [];
     let str = '';
     for(let x = 0 ; x < this.dataset.length ; x++){
       if(this.dataset[x]['0'] != undefined && this.dataset[x]['0'] == 'yes'){
         arr.push(this.dataset[x]['details_id'])
         str += this.dataset[x]['line_no'] + ',';
       }
     }
     console.log(arr)
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

   changeRevisionLineData(data){
     this.revisionLineSource.next(data)
   }

   changeSplitLineData(data){
     this.splitLineSource.next(data)
   }

   changeLineData(data){
     this.lineSource.next(data)
   }


     loadOrderLineDetails(id){
         this.http.get(this.apiUrl + 'merchandising/customer-order-details/' + id)
       .pipe( map(res => res['data']))
       .subscribe(data => {
           this.modelTitle = 'Update Order Details'
           this.saveStatusDetails = 'UPDATE'
           this.formGroupDetails.setValue({
             details_id : data['details_id'],
             style_color : data['style_color'],
             style_description : data['style_description'],
             pcd : new Date(data['pcd']),
             rm_in_date : new Date(data['rm_in_date']),
             po_no : data['po_no'],
             planned_delivery_date : new Date(data['planned_delivery_date']),
             fob : data['fob'],
             country : data['order_country'],
             projection_location : data['projection_location'],
             order_qty : data['order_qty'],
             excess_presentage : data['excess_presentage'],
             planned_qty : data['planned_qty'],
             delivery_status : data['delivery_status'],
             ship_mode : data['ship_mode']
           })
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
             this.loadOrderLines()
           }
           else{
             //this.snotifyService.error(data.message, this.tosterConfig);
             setTimeout(() => {
               AppAlert.closeAlert()
               AppAlert.showError({ text : data.message });
             } , 1000)
             this.dataset=[];
             this.formGroup.reset();
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



     //load customer order lines
     loadOrderLines(){
       //debugger
        //this.filterModel.show()
       let style_id=null
       let shop_order_id=null;
      let    FormData=this.formGroup.getRawValue()
       style_id=FormData['style_id'];
       shop_order_id=FormData['shop_order_from']['shop_order_id']


       this.dataset = []
       this.http.get(this.apiUrl+ 'stores/transfer-location?type=loadDetails&searchFrom='+style_id+'&shopOrderId='+shop_order_id)
       .pipe( map(res => res['data']) )
       .subscribe(data => {
         this.dataset = data
         //var x=this.dataset.length;
         var i;
         /*for(i=0;i<x;i++){
           this.dataset[i]['trns_qty']=0;

         }
         */
           //console.log(this.dataset);
          if(data==""){
            AppAlert.showError({text:"No any Record to Load"})
            return 0;
          }
          this.formGroup.disable();


       })
     }

     loadShopOrderFrom(){

       this.shopOrderFrom$ = this.shopOrderFromInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.shopOrderFromLoading = true),
          switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/shop-orders?type=auto' , {params:{search:term}})
          .pipe(
              //catchError(() => of([])), // empty list on error
              tap(() => this.shopOrderFromLoading = false)
          ))
       );

     }

     loadShopOrderTo(){

       this.shopOrderTo$ = this.shopOrderToInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.shopOrderToLoading = true),
          switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/shop-orders?type=auto' , {params:{search:term}})
          .pipe(
              //catchError(() => of([])), // empty list on error
              tap(() => this.shopOrderToLoading = false)
          ))
       );

     }

  searchFrom(){
  //  debugger
  this.dataset = []
    let formData=this.formGroup.getRawValue()
    let shopOrderFrom=formData['shop_order_from']['shop_order_id']
    let shopOrderTo=formData['shop_order_to']['shop_order_id']
    let location = this.formGroup.getRawValue();

      if(location['loc_name']==undefined){
        AppAlert.showError({text:"please Select Location"})

      }
      else{
    this.http.get(this.apiUrl + 'stores/transfer-location?type=style&searchFrom='+shopOrderFrom+'&searchTo='+shopOrderTo)

    .subscribe(data => {
      /*
          if(data['styleFrom']==null&&data['styleTo']!=null){
            this.style_from_error="No record exist";
            this.style_to_error=""
            this.formGroup.patchValue({
             style_from :"",
             style_to: data['styleTo']['style_no'],

            })
          this.loadOrderLines()
          }
          else if(data['styleTo']==null&&data['styleFrom']!=null){
            this.style_from_error="";
            this.style_to_error="No record exist"
            this.formGroup.patchValue({
             style_from : data['styleFrom']['style_no'],
             style_to :""

            })
            this.loadOrderLines()
          }
          else if(data['styleTo']==null&&data['styleFrom']==null){
            this.style_from_error="No record exist";
            this.style_to_error="No record exist"
            this.formGroup.patchValue({
             style_from : "",
             style_to :""

            })
            this.loadOrderLines()

          }
          else{
            this.style_to_error="";
            this.style_from_error=""
          this.formGroup.patchValue({
           style_from : data['styleFrom']['style_no'],
           style_to :data['styleTo']['style_no'],

          })
          this.loadOrderLines()
        }*/
        if(data['status']==0){
          AppAlert.showError({text:"Selected Shop Orders are from Diffrent Styles"})
          return
        }
        else if(data['status']==1){
        //  debugger
          this.formGroup.patchValue({
            style_from:data['styleFrom']['style_no'],
            style_id:data['style_id']
          })
          this.loadOrderLines()
        }

      })

}
  }
  saveDetails(){
  //  debugger
    let savedetais$
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let arr=[]
    let formData = this.formGroup.getRawValue();
    let receiver_location=formData['loc_name']['loc_id'];
    var x=this.dataset.length;
    var i;
   //debugger
    if(formData['gate_pass_id']!=null){
      AppAlert.showError({text:"Details Already Saved"})
      return 0
    }
    for(i=0;i<x;i++){
      //debugger
      if(this.dataset[i]['isEdited']==1&&this.dataset[i]['trans_qty']==undefined){
        AppAlert.showError({text:"Please Select the Edited Row(s)"})
        return 0
        }
        else if(this.dataset[i]['isEdited']==1&&this.dataset[i]['trans_qty']<0){
          AppAlert.showError({text:"Please Select the Edited Row(s)"})
            return 0
        }
        else if(this.dataset[i]['isEdited']==0&&this.dataset[i]['trans_qty']>0){
          AppAlert.showError({text:"Please Select the Edited Row(s)"})
            return 0
        }
        else if(this.dataset[i]['isEdited']==undefined&&this.dataset[i]['trans_qty']>0){
          AppAlert.showError({text:"Please Select the Edited Row(s)"})
            return 0
        }

    }
      var count=0;
        for(i=0;i<x;i++){
          if(this.dataset[i]['isEdited']==1&&this.dataset[i]['trans_qty']>0){
            count++;
          }

        }
        if(count==0){
          AppAlert.showError({text:"Invalid Data"})
          return 0
        }
        count=0;
        savedetais$=this.http.post(this.apiUrl+'stores/transfer-location-store',{'data':this.dataset,'formData':formData});
        savedetais$.subscribe(
          (res) =>{

            AppAlert.showSuccess({text:res.data.message})
            //this.dataset=[];
            this.formGroup.patchValue({
           'gate_pass_id':res.data.gate_pass_id
            })
            this.isSaved=true;
          },
            (error)=>{
              console.log(error)
            }

        );
        //return;

    //AppAlert.showError({text:"please Enter Transfer Qty"})


}


  searchLocation(){

  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }


  modelShowEvent(e){

  }
  clearDetails(){
    this.formGroup.get('shop_order_from').enable()
    this.formGroup.get('shop_order_to').enable()
    this.formGroup.get('loc_name').enable()
    this,this.formGroup.get('transfer_type').enable()
    this.dataset=[];
    this.formGroup.reset();
    this.isSaved=false;
    this.islineticked=false;

  }

  sendToAprproval(){
    let savedetais$
    this.processing = true
    //debugger
   AppAlert.showMessage('Processing...','Please wait while Sending Approval')
    let formData=this.formGroup.getRawValue()
    if(formData['gate_pass_id']==0){
      AppAlert.showError({text:"Please Save Details first"})
    }
    savedetais$=this.http.post(this.apiUrl+'stores/transfer-location/approval/send',{'formData':formData});
    savedetais$.subscribe(
      (res) =>{

        AppAlert.showSuccess({text:res.data.message})
        this.clearDetails()
      /*  this.dataset=[];
        this.formGroup.reset();
        this.formGroup.enable();
        debugger
        this.formGroup.get('style_id').disable()
*/
      },
        (error)=>{
          console.log(error)
        }

    );

  }

  checkConfrimButtonStatus(){
  //  debugger
    var c=0;
    for(var i=0;i<this.dataset.length;i++){
      if(this.dataset[i]['isEdited']==1)
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
  countDecimals(_val) {
   if(Math.floor(_val) === _val) return 0;
   return _val.toString().split(".")[1].length || 0;
  }

  formatDecimalNumber(_number, _places){
    let num_val = parseFloat(_number+'e'+_places)//_number.toExponential(2)
    return Number(Math.round(num_val)+'e-'+_places);
  }

}
