import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { InspectionService } from './inspection.service';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import * as Handsontable from 'handsontable';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { NgOption } from '@ng-select/ng-select';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { HotTableRegisterer } from '@handsontable/angular';

@Component({
  selector: 'app-fabric-inspection',
  templateUrl: './fabric-inspection.component.html',
  styleUrls: ['./fabric-inspection.component.css']
})
export class FabricInspectionComponent implements OnInit {

  formGroup : FormGroup
  modelTitle : string = "New Transaction"
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  saveStatus = 'SAVE'
  appValidator : AppValidator
  formValidator : AppFormValidator = null

  invoiceNo$: Observable<any[]>;//use to load customer list in ng-select
  invoiceNoLoading = false;
  invoiceNoInput$ = new Subject<string>();
  selectedInvoiceNo: any[]

  batchNo$: Observable<any[]>;//use to load customer list in ng-select
  batchNoLoading = false;
  batchNoInput$ = new Subject<string>();
  selectedBatchNo: any[]

  item$: Observable<any[]>;//use to load style list in ng-select
  itemLoading = false;
  itemInput$ = new Subject<string>();
  selectedItem : any[];

    processing : boolean = false
    loading : boolean = false
    loadingCount : number = 0
    initialized : boolean = false

    instanceRollPlan: string = 'instanceRollPlan';
    hotOptionsRollPlan: any
    datasetRollPlan: any[] = [];
    inspectionSaved:boolean=false
    inspectionConfirmed:boolean=false
    masterDescription:string=""
    formFields={

    invoice_no : '',
    batch_no :'',
    item:'',
    validation_error :''

  }

  constructor(private http:HttpClient , private fb:FormBuilder, private titleService: Title,private hotRegisterer: HotTableRegisterer,private layoutChangerService : LayoutChangerService,private inspectionService:InspectionService) {


  }

  ngOnInit() {
    this.masterDescription='';
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
          const hotInstance = this.hotRegisterer.getInstance(this.instanceRollPlan);
          if(hotInstance != undefined && hotInstance != null){
            hotInstance.render(); //refresh fg items table
          }

    })
//debugger
    this.titleService.setTitle("Fabric inspection")//set page title
      let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
        id :0,
        invoice_no : [0, [Validators.required]],
        batch_no : [null , [Validators.required]],
        item:[null , [Validators.required]],
      //  item_description:[]

    })
     this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.loadInvoceNo();
    this.loadFilterdBatchNo();
    //this.loadItemCode();
    this.initializeRollPlanTable()
    //this.loadBatchNo();
    this.loadFilterdItemCode();

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.inspectionService.inspectionData.subscribe(data=>{
  //debugger()
  if(data!=null){
    this.formGroup.reset()
  this.datasetRollPlan=data['data']
  //debugger
  if(data['inspection_status']=="GRN_COMPLETED"||data['inspection_status']=="CONFIRMED"){
    this.inspectionSaved=true;
    this.inspectionConfirmed=true;


  }
  this.formGroup.setValue({
    //debugger
    'id': data['grn_detail_id'],
   'invoice_no' : data['invoiceNo'],
   'batch_no' : data['batchNo'],
   'item':data['item'],
  })
  this.masterDescription=data['item']['master_description']
  //debugger
  this.formGroup.get('invoice_no').disable()
  this.formGroup.get('batch_no').disable()
  this.formGroup.get('item').disable()
}

    }

  )
    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Warehouse Management',
      'Inspection',
      'Fabric Inspection'
    ])

  }
clear(){
  this.datasetRollPlan=[];
  this.formGroup.reset();
  this.formGroup.get('invoice_no').enable()
  this.formGroup.get('batch_no').enable()
  this.formGroup.get('item').enable()
  this.masterDescription=''
  this.inspectionSaved=false;
  this.inspectionConfirmed=false;
}

formValidate(){ //validate the form on input blur event
  this.appValidator.validate();
}

  loadInvoceNo(){
    //debugger
    this.invoiceNo$= this.invoiceNoInput$
    .pipe(
       debounceTime(200),
       distinctUntilChanged(),
       tap(() => this.invoiceNoLoading= true),
       switchMap(term => this.http.get<any[]>(this.apiUrl + 'stores/fabricInspection?type=autoInvoice' , {params:{search:term}})
       .pipe(
           //catchError(() => of([])), // empty list on error
           tap(() => this.invoiceNoLoading = false)
       ))
    );
  }

  loadFilterdBatchNo(){

    this.batchNo$= this.batchNoInput$

    .pipe(
       debounceTime(200),
       distinctUntilChanged(),

       tap(() => this.batchNoLoading= true),

       switchMap(term => this.http.get<any[]>(this.apiUrl + 'stores/fabricInspection?type=autoBatchNoFilter' , {params:{search:term,inv_no:((this.formGroup.get('invoice_no').value == null) ? null : this.formGroup.get('invoice_no').value.inv_number )}})
       .pipe(
           //catchError(() => of([])), // empty list on error
           tap(() => this.batchNoLoading = false)
       ))
    );


  }


      loadItemCode() {
           this.item$ = this.itemInput$
           .pipe(
              debounceTime(200),
              distinctUntilChanged(),
              tap(() => this.itemLoading = true),
              switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/items?type=auto_master_code' , {params:{search:term}})
              .pipe(
                  //catchError(() => of([])), // empty list on error
                  tap(() => this.itemLoading = false)
              ))
           );
       }


       loadFilterdItemCode() {
            this.item$ = this.itemInput$
            .pipe(
               debounceTime(200),
               distinctUntilChanged(),
               tap(() => this.itemLoading = true),
               switchMap(term => this.http.get<any[]>(this.apiUrl + 'stores/fabricInspection?type=autoItemCodeFilter' , {params:{search:term,inv_no:((this.formGroup.get('invoice_no').value == null) ? null : this.formGroup.get('invoice_no').value.inv_number ),batch_no:((this.formGroup.get('batch_no').value == null) ? null : this.formGroup.get('batch_no').value.batch_no)}})
               .pipe(
                   //catchError(() => of([])), // empty list on error
                   tap(() => this.itemLoading = false)
               ))
            );


        }

        lodaItemDescription(){

          //debugger
      let formData=  this.formGroup.getRawValue()
        this.masterDescription=formData['item']['master_description']
        }


  loadBatchNo(){
    //debugger
    this.batchNo$= this.batchNoInput$
    .pipe(
       debounceTime(200),
       distinctUntilChanged(),
       tap(() => this.batchNoLoading= true),
       switchMap(term => this.http.get<any[]>(this.apiUrl + 'stores/fabricInspection?type=autoBatchNO' , {params:{search:term}})
       .pipe(
           //catchError(() => of([])), // empty list on error
           tap(() => this.batchNoLoading = false)
       ))
    );

  }

  initializeRollPlanTable(){
    var clipboardCache = '';
  //var sheetclip = new sheetclip();
    this.hotOptionsRollPlan = {
      columns: [
        { type: 'text', title : 'GRN No' , data: 'grn_number',readOnly:true},
        { type: 'text', title : 'LOT No' , data: 'lot_no',readOnly:true},
        { type: 'text', title : 'Invoice No' , data: 'invoice_no',readOnly:true},
        { type: 'text', title : 'Batch No' , data: 'batch_no',readOnly:true},
        { type: 'text', title : 'Roll No' , data: 'roll_or_box_no',readOnly:true},
        { type: 'numeric', title : 'Actual Qty' , data: 'actual_qty',readOnly:false},
        { type: 'numeric', title : 'Received Qty' , data: 'received_qty',readOnly:true},
        { type: 'text', title : 'Bin' , data: 'store_bin_name',readOnly:true},
        { type: 'numeric', title : 'Spec Width' , data: 'width',readOnly:true},
        { type: 'numeric', title : 'Actual Width' , data: 'actual_width',readOnly:false},
        { type: 'text', title : 'Shade' , data: 'shade',readOnly:false},
        /*{ type: 'text', title : 'Status' , data: 'status',readOnly:false},*/
        {
          title : 'Status',
          type: 'autocomplete',
          width : 100,
          source:(query, process)=>{
            //debugger
            var url=$('#url').val();
            $.ajax({
              url:this.apiUrl+'stores/fabricInspection?type=autoStatusTypes',
              dataType: 'json',
              data: {
                query: query
              },
              success: function (response) {
                  //console.log(response);
                  process(response);
                },
             afterChange: function (changes, source) {
          //  console.log("adadadadadada");


             }
            });
          },
          strict: true,
          data:'inspection_status',
          readOnly: false
        },
        { type: 'text', title : 'RM Comment' , data: 'rm_comment',readOnly:false},
        { type: 'text', title : 'Lab Comment' , data: 'lab_comment',readOnly:false},





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
      this.statusValidation(surce)
        //let x=this.dataset;
        //this.setBalance(surce);
        //this.selectionValidation(surce);
        //this.calculateTotalSMV(surce);
        //debugger
        //this.calculateTotalSMV2(surce);
        //this.stylewiseTotalSMV(surce);
         //if(surce!=null)
         //this.checkSMVRange(surce);
         if(surce != null && surce.length > 0){
          // debugger
         const hotInstance = this.hotRegisterer.getInstance(this.instanceRollPlan);
         let _row = surce[0][0]
         if(surce[0][1]=='actual_qty'){
             let _qty = (surce[0][3] == '' || isNaN(surce[0][3]) || surce[0][3] < 0) ? 0 : surce[0][3]

           if(this.countDecimals(_qty) > 4){
             _qty = this.formatDecimalNumber(_qty, 2)

           }
           this.datasetRollPlan[_row]['actual_qty']=_qty
           hotInstance.render()
         }

            if(surce[0][1]=='actual_width'){
             let _width = (surce[0][3] == '' || isNaN(surce[0][3]) || surce[0][3] < 0) ? 0 : surce[0][3]
           if(this.countDecimals(_width) > 4){
             _width = this.formatDecimalNumber(_width, 2)

           }
           this.datasetRollPlan[_row]['actual_width']=_width
           hotInstance.render()
         }

       }

          },
        afterCreateRow:(index,amount,source)=>{
          //console.log(index);

          //l//et x=this.dataset;




        },
        afterPaste:(changes)=>{

        },

      cells : function(row, col, prop , value){ //table cell render event. works for every cell in the table
        var cellProperties = {};
      //de

       //debugger
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

          }
      }
    }
  }

  statusValidation(surce){
       if(surce!=null){
          let formData = this.formGroup.getRawValue();
         //debugger
         var row=surce["0"]["0"];
         if(surce["0"]["1"]=="status_name"){
           if(this.datasetRollPlan[row]['previous_status_name']=="PASS"&&formData.id!=0){
             AppAlert.showError({text:"Can't Change Status"})
             this.datasetRollPlan[row]['status_name']="PASS"
             const hotInstance = this.hotRegisterer.getInstance(this.instanceRollPlan);
             hotInstance.render();
             return 0
           }
         }


       }


  }


  searchRollPlanDetails(){
  //  debugger
     let formData = this.formGroup.getRawValue();
    formData['invoice_no']=formData['invoice_no']['inv_number'];
    formData['batch_no']=formData['batch_no']['batch_no'];
    formData['item_code']=formData['item']['master_id'];
    this.http.get(this.apiUrl + 'stores/searchRollPlanDetails?invoiceNo='+formData.invoice_no+'&batchNo='+formData.batch_no+'&itemCode='+formData.item_code)
.pipe( map(res => res['data']) )
 .subscribe(data=>{
   this.formGroup.disable();
   //this.isbalanceQtyNull(data)
    this.datasetRollPlan=data['data']
    if(data['grn_detail_id']!=0){
      this.formGroup.patchValue({
        'id':data['grn_detail_id']
      })
    }
    //debugger
    console.log(data)
     })


  }

  saveInspection(){
  //debugger
    var totQty=0;
    for(var i=0;i<this.datasetRollPlan.length;i++){
      totQty=this.datasetRollPlan[i]['actual_qty']+totQty;
      if(this.datasetRollPlan[i]['inspection_status']==undefined){
        AppAlert.showError({text:"please Select a Status"})
        return 0
      }
      //debugger
      if(this.datasetRollPlan[i]['lab_comment']==undefined||this.datasetRollPlan[i]['lab_comment']==''){
        AppAlert.showError({text:"Please Add Comment"})
        return 0
      }
    }
  /*  if(totQty!=parseFloat(this.datasetRollPlan[0]['grn_qty'])){
      AppAlert.showError({text:"Total GRN Qty Exceded.!"});
      return 0;
    */

    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
      let formData = this.formGroup.getRawValue();
      if(formData.id==0||formData.id==null){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'store/fabricInspection', {data:this.datasetRollPlan})
    }
    else if(formData.id!=0){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'store/fabricInspection/'+ formData.id,{data:this.datasetRollPlan})
    }
      saveOrUpdate$.subscribe(
        (res) => {
          this.processing = false
          if(res.data.status==1){
            AppAlert.showSuccess({text:res.data.message})
            this.inspectionSaved=true;
          }
          else if(res.data.status==0){
            AppAlert.showError({text:res.data.message})
            this.inspectionSaved=false;
            //this.inspectionConfirm=true;
            //this.formGroup.reset();
            //this.masterDescription='';
            //this.formGroup.enable();
            //this.datasetRollPlan=[];
          }
           },
       (error) => {
         this.processing = false
           console.log(error)
       }
     );


  }

  confirmInspection(){

     var i=0;

                 AppAlert.showConfirm({
                   'text' : 'Do You Want to Confirm Fabric Inspection?'
                 },
                 (result) => {
                   if (result.value) {
                    this.inspectionConfirmed=true;
                     for(i=0;i<this.datasetRollPlan.length;i++){
                       if(this.datasetRollPlan[i]['inspection_status']=="PENDING"||this.datasetRollPlan[i]['inspection_status']=="REJECT"){
                         AppAlert.showError({text:"Please Add Status as Pass or Fail"})
                         this.inspectionConfirmed=false;
                         this.inspectionSaved=false;
                         return 0;
                       }
                     }
                     this.http.post(this.apiUrl + 'stores/confrimFabInspection',{'dataset':this.datasetRollPlan})
                     .pipe( map(res => res['data']) )
                     .subscribe(
                         (data) => {
                           if(data.status==1)
                            AppAlert.showSuccess({text:data.message})
                            else if(data.status==0)
                            AppAlert.showError({text:data.message})
                            this.clear()
                         },
                         (error) => {
                           console.log(error)
                         }
                     )
                   }
                 })
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
