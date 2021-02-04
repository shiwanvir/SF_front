import { Component, OnInit,OnDestroy,ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject,BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { NgOption } from '@ng-select/ng-select';
declare var $:any;

import { ModalDirective } from 'ngx-bootstrap/modal';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';


import {ComponentLoaderFactory} from 'ngx-bootstrap/component-loader';
import {PositioningService} from 'ngx-bootstrap/positioning';
import { SmvService } from './smv.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';


import { AppValidator } from '../../core/validation/app-validator';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';




@Component({
  selector: 'app-component-smv',
  templateUrl: './component-smv.component.html',
  styleUrls: ['./component-smv.component.css']
})
export class ComponentSmvComponent implements OnInit{
  @ViewChild(ModalDirective) detailsModel: ModalDirective;
  @ViewChild(ModalDirective) colorOptionModel: ModalDirective;
  instance: string = 'instance';
  instanceSum:string='instanceSum';
  //apiUrl = AppConfig.apiUrl()
  formValidator : AppFormValidator = null
  formGroup : FormGroup
  formGroup1:FormGroup
  formGroupReason : FormGroup
  formValidatorReason : AppFormValidator = null
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  appValidaterReason:AppValidator
  datatable:any = null
  saveStatus = 'SAVE'
  Disable_add_new = 0

  style$: Observable<any[]>;//use to load styles list in ng-select
  styleLoading = false;
  styleInput$ = new Subject<string>();
  selectedStyle: any[];

  bomStage$:Observable<any[]>;
  bomStageLoading=false;
  bomStageInput$=new Subject<string>();
  selectedBomSatage:any[];

  colorOption$:Observable<any[]>;
  colorOptionLoading=false;
  colorOptionInput$=new Subject<string>();
  selectedColorOption:any[];


  buyName$:Observable<any[]>;
  buyNameLoading=false;
  buyNameInput$=new Subject<string>();
  selectedBuyName:any[];
  dataset: any[] = [];
  datasetSum:any[]=[];
  tempArry: any[] = [];
  hotOptions: any
  hotOptionsSum:any
  temp:any=null;
  processing : boolean = false
  //hansontable variables
  currentDataSetIndex : number = -1
  orderId = 0
  componentSmvHeaderId=0
  copyStatus=0;
  revisionNo=-1
  comments=""
  lineNo:any[]=[];
  //to manage form error messages
  modelTitle : string = "New Fabric Position"

  reason$: Observable<any[]>;//use to load main sub category list in ng-select
  reasonLoading = false;
  reasonInput$ = new Subject<string>();
  selectedReason: any[]

  formFields = {

  style_no: '',
  bom_stage_description:'',
  color_option:'',
  validation_error:'',
  style_wise_total_smv:'',
  buy_name:''
  //reason_description:''
  }
  formFieldsReason={
    comments:'',
    validation_error:''
  }


constructor(private fb:FormBuilder , private http:HttpClient, private hotRegisterer: HotTableRegisterer,private titleService: Title,private smvService : SmvService,private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {

      this.Disable_add_new = 0

      this.initializeOrderLinesTable()
      this.initializeSummationTable()
    this.titleService.setTitle("Component SMV")//set page title
    //var sheetclip = new SheetClip();
    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'ie/garment_operations/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'garment_operation_name',
      /*error : 'Dep code already exists',*/
      data : {
        //garment_operation_id : function(controls){ return controls['garment_operation_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class
    this.formGroup = this.fb.group({
      style_no : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
      //bom_stage : [null , [Validators.required],[primaryValidator.remote(remoteValidationConfig)]],
      bom_stage_description:[null , [Validators.required],[primaryValidator.remote(remoteValidationConfig)]],
      color_option:[null , [Validators.required],[primaryValidator.remote(remoteValidationConfig)]],
      buy_name:[null , ],
    })

    this.formGroup1=this.fb.group({
      style_wise_total_smv:[null],
    })
    this.formGroupReason = this.fb.group({
      position_id: 0,
      comments :  [null , [Validators.required , Validators.maxLength(100)]],

    })
    this.formGroup1.get('style_wise_total_smv').disable()

    this.formValidator = new AppFormValidator(this.formGroup , {});
    this.formValidatorReason = new AppFormValidator(this.formGroupReason , {});

 //create new validation object
 this.appValidator = new AppValidator(this.formFields,{},this.formGroup);
 this.appValidaterReason=new AppValidator(this.formFieldsReason,{},this.formGroupReason);

 this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
   this.appValidator.validate();
 })

 this.formGroupReason.valueChanges.subscribe(data => { //validate form when form value changes
   this.appValidaterReason.validate();
 })

  this.loadStyle()
  this.loadBomStages()
  this.loadColorOptions();
  this.loadCancellationReason();
  this.loadBuyName();


 this.smvService.smvData.subscribe(data=>{
   this.formGroup.reset()
   this.Disable_add_new = 1
   console.log(data)
   this.viewSMV(data);
    //this.loadCancellationReason();

 }

 )
 this.layoutChangerService.changeHeaderPath([
   'Catalogue',
   'IE',
   'Component SMV'
 ])

  }
  OnDestroy(){
    this.smvService.changeData(null);
  }

  //load size list
  loadStyle() {
      this.setNullAll()
       this.style$ = this.styleInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.styleLoading = true),
          switchMap(term => this.http.get<any[]>(this.apiUrl + 'ie/styles?type=auto' , {params:{search:term}})
          .pipe(
              //catchError(() => of([])), // empty list on error
              tap(() => this.styleLoading = false)
          ))
       );
   }

   //load size list
   loadBomStages() {
     this.setNullAll()
        this.bomStage$ = this.bomStageInput$
        .pipe(
           debounceTime(200),
           distinctUntilChanged(),
           tap(() => this.bomStageLoading = true),
           switchMap(term => this.http.get<any[]>(this.apiUrl + 'ie/bomStages?type=auto' , {params:{search:term}})
           .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.bomStageLoading = false)
           ))
        );
    }
    loadColorOptions() {
      this.setNullAll()
         this.colorOption$= this.colorOptionInput$
         .pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.colorOptionLoading = true),
            switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/color-options?type=auto' , {params:{search:term}})
            .pipe(
                //catchError(() => of([])), // empty list on error
                tap(() => this.colorOptionLoading = false)
            ))
         );
     }

     loadBuyName() {
       this.setNullAll()
          this.buyName$= this.buyNameInput$
          .pipe(
             debounceTime(200),
             distinctUntilChanged(),
             tap(() => this.buyNameLoading = true),
             switchMap(term => this.http.get<any[]>(this.apiUrl + 'ie/componentSMVDetails?type=auto_buy' , {params:{search:term}})
             .pipe(
                 //catchError(() => of([])), // empty list on error
                 tap(() => this.buyNameLoading = false)
             ))
          );
      }

     loadCancellationReason(){
        this.reason$ = this.reasonInput$
          .pipe(
             debounceTime(200),
             distinctUntilChanged(),
             tap(() => this.reasonLoading = true),
             switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/cancellation-reasons?type=reasonforsmv' , {params:{search:term}})
             .pipe(
                 //catchError(() => of([])), // empty list on error
                 tap(() => this.reasonLoading = false)
             ))
          );
      }

   formValidate(){ //validate the form on input blur event
     this.appValidator.validate();
   }

formValidateReason(){
  this.appValidaterReason.validate();
}
   viewSMV(data){
     if(data=="Error"){
       AppAlert.showError({text:"please set SMV Range to All Silhouettes"})
     }
     else if(data!=null){
     console.log(data[0][0])
     //this.formGroup.setValue(data[0][0]);
     var valueSet=data[0][0]
        var style:any={};
        var bomStage:any={};
        var colorOption:any={};
        var buyName:any={};
        style.style_id=valueSet['style_id']
        style.style_no=valueSet['style_no']
        bomStage.bom_stage_id=valueSet['bom_stage_id']
        bomStage.bom_stage_description=valueSet['bom_stage_description']
        colorOption.col_opt_id=valueSet['col_opt_id']
        colorOption.color_option=valueSet['color_option']
        buyName.buy_id=valueSet['buy_id']
        buyName.buy_name=valueSet['buy_name']
        this.componentSmvHeaderId=valueSet['smv_component_header_id']
        this.revisionNo=valueSet['revision_no']
        //console.log(style)
     var valueSetComponentSmv=data[1]
     var valueSetSummarySmv=data[2]

     this.formGroup.setValue({
      'style_no' : style,
      'bom_stage_description' :bomStage,
      'color_option' : colorOption,
      'buy_name':buyName

     })
     this.formGroup1.setValue({
       'style_wise_total_smv':valueSet['total_smv']
     })
     //this.checkCopyStatus();
     this.formGroup.get('style_no').disable()
     this.formGroup.get('bom_stage_description').disable()
     this.formGroup.get('color_option').disable()
      this.formGroup.get('buy_name').disable()
       console.log(valueSetComponentSmv)
       console.log(valueSetSummarySmv)
       this.dataset=valueSetComponentSmv;
       //console.log("dattaatatatattata")
         let formData = this.formGroup.getRawValue();
       console.log(formData['bom_stage_description']['bom_stage_id'])
       this.datasetSum=valueSetSummarySmv;
       this.mergeComponentCells();

}
   }


   //initialize handsontable for customer order line table
   initializeOrderLinesTable(){
     var clipboardCache = '';
   //var sheetclip = new sheetclip();
     this.hotOptions = {
       columns: [
         { type: 'text', title : 'Product Component' , data: 'product_component_description',className: "htLeft"},
         { type: 'text', title : 'Product Silhouette' , data: 'product_silhouette_description',className: "htLeft"},
         {
           title : 'Operation',
           type: 'autocomplete',
           source:(query, process)=>{
             var url=$('#url').val();
             $.ajax({
               url:this.apiUrl+'ie/garment_operations?type=auto',
               dataType: 'json',
               data: {
                 query: query
               },
               success: function (response) {
                   //console.log(response);
                   process(response);
                 },
              afterChange: function (changes, source) {
                console.log("ddxdd");
              }
             });
           },
           strict: true,
           data:'garment_operation_name',
           readOnly: false,
           className: "htLeft"
         },
         { type: 'numeric', title : 'SMV' , data: 'smv' , readOnly: false, format: '0.00',className: "htRight"  },

       ],
       manualColumnResize: true,
       autoColumnSize : true,
       rowHeaders: true,
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
         //changes.validateCell
         let x=this.dataset;
         this.RoundSMV(surce)
         this.selectionValidation(surce);
         //this.calculateTotalSMV(surce);

         this.calculateTotalSMV2(surce);
         this.stylewiseTotalSMV(surce);
          //if(surce!=null)
          //this.checkSMVRange(surce);

           },
         afterCreateRow:(index,amount,source)=>{
           //console.log(index);

           let x=this.dataset;
           //console.log(amount);
           console.log(source);
           //console.log(x['length']);
           var currentRow =amount-1;
           var component_id=this.dataset[currentRow]["product_component_id"];
           var product_component_description=this.dataset[currentRow]["product_component_description"];
           var product_silhouette_description=this.dataset[currentRow]['product_silhouette_description'];
           var product_silhouette_id=this.dataset[currentRow]['product_silhouette_id'];
           var product_feature_id=this.dataset[currentRow]['product_feature_id'];
           var line_no=this.dataset[currentRow]['line_no'];
           //console.log(component_id);
           //console.log(product_component_description);
           //console.log(product_silhouette_id);
           this.dataset[currentRow+1]['product_component_id']=component_id;
           this.dataset[currentRow+1]['product_component_description']=product_component_description;
           this.dataset[currentRow+1]['product_silhouette_description']=product_silhouette_description;
           this.dataset[currentRow+1]['product_silhouette_id']=product_silhouette_id;
           this.dataset[currentRow+1]['product_feature_id']=product_feature_id;
           this.dataset[currentRow+1]['line_no']=line_no;
           this.dataset[currentRow+1]['smv']=0;
           this.mergeComponentCells()



         },
         afterPaste:(changes)=>{

             const hotInstance = this.hotRegisterer.getInstance(this.instance);
               hotInstance.render();
               console.log('im here.....')
               console.log(this.dataset)
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
                 }
               }
             },
             'row_below' : {
               name : 'Add Operation',
               disabled:  (key, selection, clickEvent)=>{
                    const hotInstance = this.hotRegisterer.getInstance(this.instance);
                    let sel_row = hotInstance.getSelectedLast()[0];
                    if(this.Disable_add_new == 0)
                      {
                          return hotInstance.getSelectedLast()[0] === sel_row
                      }

               },
              /* callback :(key, selection, clickEvent) => {
                 console.log("im ftpppp")
                 console.log(selection)
                 console.log(clickEvent)
               }*/
             },

            /* 'copy':{
               disabled: function (key, selection, clickEvent) {

                  return this.getSelectedLast()[1]==0

                },
               callback:(key, selection, clickEvent)=> {

                var endline=selection[0]['end']['row'];
                this.copyMulitipleRows(endline)

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

   RoundSMV(surce){
   if(surce!=null&&surce[0][1]=='smv'){
     //debugger
     var roundedValue=surce[0][3];
     var line;
     let _qty = (surce[0][3] == '' || isNaN(surce[0][3])) ? 0 : surce[0][3]
     if(this.countDecimals(_qty) > 2){
       _qty = this.formatDecimalNumber(_qty, 2)

     }
     //surce[0][3]=roundedValue.toFixed(2)
      line=surce[0][0]
     this.dataset[line]['smv']=_qty
     const hotInstance = this.hotRegisterer.getInstance(this.instance);
      hotInstance.render();

    }

   }

mergeComponentCells(){
  //debugger
   let options
  const hotInstance = this.hotRegisterer.getInstance(this.instance);
  var start=0;
  var count=0;
  var init_line_no=this.dataset[0]['line_no']
   console.log("Init line_no: "+init_line_no)
   let arr = []
    for(let x=0;x<this.dataset.length;x++){
        count++;
        if(init_line_no!=this.dataset[x]['line_no']){
        console.log("start:"+start)
       console.log(count-1)
       arr.push({row: start, col: 0, rowspan: count-1, colspan: 1})
        //hotInstance.updateSettings(options, false);
        //hotInstance.render();

        init_line_no=this.dataset[x]['line_no']
        console.log("new line No: "+init_line_no)

         start =x;
         x--
         count=0;
       }

  }

  console.log("new line No: "+init_line_no)
  console.log("at The end start: "+start)
  //var temCount=count
  console.log("at the end end:"+temCount)
  arr.push({row: start, col: 0, rowspan: count, colspan: 1})
  options = { mergeCells : arr  };
  /* options = { mergeCells : [
   {row: start, col: 0, rowspan: temCount, colspan: 1},
   ]
  };*/
  hotInstance.updateSettings(options, false)
  hotInstance.render();
  //const hotInstance = this.hotRegisterer.getInstance(this.instance);
  hotInstance.render();
    //console.log(x);
    var temCount=0;

}


copyMulitipleRows(endline){
  //debugger
  if(this.copyStatus==0){
    AppAlert.showError({text:"Function Disabled"})
    return
  }
  for(let x=0;x<=endline;x++){
    if(this.dataset[x]['garment_operation_name']==null||this.dataset[x]['smv']==0){
      AppAlert.showError({text:"Please Fill All Fields Before Copy"});
      return false
    }
  }
   var arr=[]
 var subDataset=[]
 for(let x=0;x<this.dataset.length;x++){
    if(x<=endline)
    subDataset.push(this.dataset[x]);
    if(x>endline){
      this.dataset.splice(x,1);
      x--
    }

 }
 console.log("after deleting");
 console.log(this.dataset)
 console.log("sub dataSet")
 console.log(subDataset)
 console.log(this.dataset[0]);
console.log(this.lineNo);
//var num=endline+1;
//debugger

for(let x=1;x<this.lineNo.length;x++){
  var val=this.lineNo[x];
  //console.log("value")
  //console.log(val)

  for(let y=0;y<subDataset.length;y++){

    let arr = JSON.parse(JSON.stringify(subDataset[y]));
    arr['line_no'] = val;
    this.dataset.push(arr);

  }

  //console.log("endline");

}
//endline=0;
this.mergeComponentCells()
this.calculateTotalSMV2(0);
this.stylewiseTotalSMV(0);
console.log(this.dataset);
const hotInstance = this.hotRegisterer.getInstance(this.instance);
hotInstance.render();


}
checkCopyStatus(){
  let formData = this.formGroup.getRawValue();
  formData['style_id'] = formData['style_no']['style_id'];
    this.http.post(this.apiUrl+'ie/componentSMVDetails/checkCopyStatus',{'styleId':formData['style_id']})
  .pipe(map(res=>res['data']))
  .subscribe(data=>{
    if(data.status=='0'){
      //AppAlert.showError({text:"This Function can be use Only for Same type of Components"})
  this.copyStatus=0;
    }
    else if(data.status=='1'){
    //AppAlert.showSuccess({text:data.status});
  this.copyStatus=1;
  }
  })
}

/*  this.hotOptions.updateSettings({
 mergeCells: [
      {row: 1, col: 1, rowspan: 3, colspan: 0},
 ]
)};*/
//

   //initialize handsontable for customer order line table
   initializeSummationTable(){

     this.hotOptionsSum = {
       columns: [
         { type: 'text', title : 'Style' , data: 'style_no',className: "htLeft"},
         { type: 'text', title : 'Product Component' , data: 'product_component_description',className: "htLeft"},
         { type: 'text', title : 'Product Silhouette' , data: 'product_silhouette_description',className: "htLeft"},
         { type: 'numeric', title : 'Total SMV' , data: 'total_smv' , readOnly: true,className: "htRight" },

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
       /*contextMenu : {
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
                 }
               }
             },
                     /*'remove_row' : {
               name : 'Remove Delivery',
               callback : (key, selection, clickEvent) => {
                 if(selection.length > 0){
                   let start = selection[0].start;
                   this.contextMenuRemove(start.row)
                 }
               }
             }
           }
       } */
     }
   }

   //fire when click context menu - add
   contextMenuAddOperations(row){
     let selectedRowData = this.dataset[row]
     this.currentDataSetIndex = row
     //this.dataset[this.dataset.length+1]
     console.log(this.dataset);


   }
   //context menu - edit
   contextMenuDelete(row){
     let selectedRowData = this.dataset[row]
     this.currentDataSetIndex = row
     console.log(row);

     //this.updateCalculatedSMV(row);
     //tempArry
     //this.dataset[row]=null;
     if(this.checkinitDataset(row)==false){
       AppAlert.showError({text:"Can't Delete Initial Data"})

     }
     else if(this.checkinitDataset(row)==true){
     this.dataset.splice(row,1);
     console.log(this.dataset);
     }
     //const hotInstance = this.hotRegisterer.getInstance(this.instance);
      //hotInstance.render()
      console.log("cal.................")
      this.mergeComponentCells()
      this.calculateTotalSMV2(1)
      this.stylewiseTotalSMV(1)


     //this.dataset=temp;

       //this.loadOrderLineDetails(selectedRowData['details_id'])
     //this.saveStatusDetails = 'UPDATE'
   }

   checkinitDataset(row){
     var count=0;
     var lineNo=this.dataset[row]['line_no'];
     for(let x=0;x<this.dataset.length;x++){
        if(this.dataset[x]['line_no']==lineNo)
          count++
     }
     if(count==1)
        return false;
        else
        return true;

   }
/*   updateCalculatedSMV(row){
     var smv_value=this.dataset[row]['smv'];
     var line_no=this.dataset[row]['product_feature_description'];
     for(let x = 0 ; x < this.datasetSum.length ; x++){
         if(this.datasetSum[x]['product_feature_description']==product_feature){
           this.datasetSum[x]['total_smv']=this.datasetSum[x]['total_smv']-smv_value;
     }
     const hotInstance = this.hotRegisterer.getInstance(this.instanceSum);
      hotInstance.render()
   }
}*/
  selectionValidation(surce){
   //console.log("daadde");
   if(surce!=null){

    var row=surce["0"]["0"];
    //console.log("source----------");
    //console.log(surce[0][0]);
    var selected_line_no=this.dataset[row]['line_no']
    var selected_pc=this.dataset[row]['product_component_id'];
    var selected_operation=surce[0][3];
    //console.log("source");//
    //console.log(surce);
    //console.log("selected_operation: "+selected_operation);
     for(let x = 0 ; x < this.dataset.length ; x++){
      if(row!=x){
      var current_line_no=this.dataset[x]['line_no']
      var current_pc=this.dataset[x]['product_component_id'];
     var current_operation=this.dataset[x]['garment_operation_name'];
     if(selected_line_no==current_line_no){
     if(selected_pc==current_pc){
        if(selected_operation!= undefined){
        if(selected_operation==current_operation){
          this.dataset[row]['garment_operation_name']=null;
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          hotInstance.render();
          AppAlert.showError({text:"Operation already added. "});
        }
      }
      }
    }
      }
     }
  }

   }

   //context menu - size
   contextMenuSize(row){

     }



   //context menu - merge
   contextMenuMerge(){

     }


   changeRevisionLineData(data){

   }

   changeSplitLineData(data){

   }

   changeLineData(data){

   }
   checkNullValuaes(){
     for(let x=0;x<this.dataset.length;x++){
       if(this.dataset[x]['garment_operation_name']==null||this.dataset[x]['smv']==0){
         AppAlert.showError({text:"please fill All fields"});
         return false
       }
       }
       return true;
   }
   searchDetails(){
       let search$ = null;
       this.dataset=[];
       const hotInstance = this.hotRegisterer.getInstance(this.instance);
       hotInstance.render();
       this.datasetSum=[];
       this.revisionNo=-1;
         this.componentSmvHeaderId=0;
       this.componentSmvHeaderId=0;
       let formData = this.formGroup.getRawValue();
       formData['style_id'] = formData['style_no']['style_id'];
       formData['bom_stage_id']=formData['bom_stage_description']['bom_stage_id'];
       formData['col_opt_id']=formData['color_option']['col_opt_id'];
       if(formData['buy_name']!=null)
       formData['buy_id']=formData['buy_name']['buy_id'];
       if(formData['buy_name']==null)
       formData['buy_id']=null;

       //console.log(formData);
       this.dataset=[];
      // var value=[];
   this.http.get(this.apiUrl+'ie/componentSMVDetails?type=searchDetails&styleId='+formData.style_id+'&bomStageId='+formData.bom_stage_id+"&colorOptionId="+formData.col_opt_id+"&buyId="+formData.buy_id)
   .pipe( map(res => res['data']) )
    .subscribe(data=>{

      this.Disable_add_new = 1
    if(data[3]=='0'){ //check selected style vs bom stage vs color option is alredy in the sytem
      this.viewSMV(data)
      this.copyStatus=0;
    }
  else if(data[3]=='1'){
    AppAlert.showError({text:data[2]})
  }
      else{

        this.formGroup.get('style_no').disable()
        this.formGroup.get('bom_stage_description').disable()
        this.formGroup.get('color_option').disable()
        this.formGroup.get('buy_name').disable()
      for(let x = 0 ; x <data.length ; x++){
        data[x]['smv']=0;
      this.lineNo.push(data[x]['line_no']);
      }
      this.dataset=data
      const clone = JSON.parse(JSON.stringify(data));
      this.datasetSum=clone;
      //value=data
      console.log(this.datasetSum);
      for(let x = 0 ; x < this.datasetSum.length ; x++){
        this.datasetSum[x]['style_id']=formData['style_id'];
        this.datasetSum[x]['style_no']=formData['style_no']['style_no'];
        this.datasetSum[x]['total_smv']=0;
        //this.datasetSum[x]['style_id']=formData['style']
        console.log("avdjhagdjh");
      console.log(this.datasetSum);
      }
      //console.log("after added..");
      //console.log(this.datasetSum);
    }
    })
    this.checkCopyStatus()

   }
   // saveTableData(){
   //
   //   let formData = this.formGroup.getRawValue();
   //   formData['style_id'] = formData['style_no']['style_id'];
   //   formData['bom_stage_id']=formData['bom_stage_description']['bom_stage_id'];
   //   console.log(this.dataset);
   //   this.http.post(this.apiUrl+'ie/componentSMVDetails/saveDataset',{'data':this.dataset,'styleId':formData.style_id,'bomStageId':formData.bom_stage_id})
   //   .pipe(map(res=>res['data']))
   //   .subscribe(data=>{
   //     AppAlert.showSuccess({text:"Saved...! "});
   //   })
   // }

   calculateTotalSMV(surce){

     if(surce!=null){

      var row=surce["0"]["0"];
      //console.log(row);
      var smv_value=this.dataset[row]['smv'];
      var product_feture=this.dataset[row]['product_feature_description'];
      //console.log(product_feture);
      for(let x = 0 ; x < this.datasetSum.length ; x++){
        console.log(product_feture);
      if(this.datasetSum[x]['product_feature_description']==product_feture){
        //console.log("cvcvcvvvcvc");
        //var q=0;
        this.datasetSum[x]['total_smv']=this.datasetSum[x]['total_smv']+smv_value;
        console.log(this.datasetSum[x]['total_smv']);
        const hotInstance = this.hotRegisterer.getInstance(this.instanceSum);
        hotInstance.render();
      }
      //console.log(this.datasetSum);
    }
    }
   }


   calculateTotalSMV2(surce){

     if(surce!=null){
       //debugger
       var currentLineNo=null;
       var componentwiseSmv=0;
       var line;
       this.dataset


       for(let x=0;x<this.dataset.length;x++){
         if(x==0){
           currentLineNo=this.dataset['0']['line_no'];
         }
            if(this.dataset[x]['line_no']==currentLineNo){
              this.dataset[x]['smv'].toFixed(2);
              componentwiseSmv=componentwiseSmv+this.dataset[x]['smv'];
          }
          else if(this.dataset[x]['line_no']!=currentLineNo){
            for(let x = 0 ; x < this.datasetSum.length ; x++){
              if(this.datasetSum[x]['line_no']==currentLineNo){
                this.datasetSum[x]['total_smv']=componentwiseSmv.toFixed(2);
              }
            }
            currentLineNo=this.dataset[x]['line_no']
            componentwiseSmv=0;
            const hotInstance = this.hotRegisterer.getInstance(this.instanceSum);
            hotInstance.render();
            x--;
          }

       }
       for(let x = 0 ; x < this.datasetSum.length ; x++){
         if(this.datasetSum[x]['line_no']==currentLineNo){
           this.datasetSum[x]['total_smv']=componentwiseSmv.toFixed(2);;
         }
       }

       const hotInstance = this.hotRegisterer.getInstance(this.instanceSum);
       hotInstance.render();


     }


   }
stylewiseTotalSMV(surce){
  if(surce!=null){
    //debugger
  var total=0;
  for(let x = 0 ; x < this.datasetSum.length ; x++){
  this.datasetSum[x]['total_smv']=parseFloat(this.datasetSum[x]['total_smv'])
    total=total+this.datasetSum[x]['total_smv'];

  }
   total=this.formatDecimalNumber(total, 2)
  //total.toFixed(2);
  this.formGroup1.setValue({
    'style_wise_total_smv':total
  })
}
}

setNullAll(){
  this.formGroup1.setValue({
    'style_wise_total_smv':0
  })

    this.dataset=[];
    //const hotInstance = this.hotRegisterer.getInstance(this.instance);
    //hotInstance.render();
   this.datasetSum=[];
  //const hotInstance = this.hotRegisterer.getInstance(this.instanceSum);
  //hotInstance.render();
}
save(){
  //this.processing = true
  if(this.revisionNo!=-1){
    //console.log("hshshshshhshshshsh")
    this.processing =false
    this.colorOptionModel.show()
  }
  else if(this.revisionNo==-1)
  this.saveTableData();

}
saveTableData(){
  this.processing = true
  if(this.dataset.length==0){
  AppAlert.showError({text:"No any Data to Save"})
    this.processing = false
  return;
}
//var row=surce["0"]["0"];
  //this.colorOptionModel.hide()

let formData = this.formGroup.getRawValue();
formData['style_id'] = formData['style_no']['style_id'];

let totalSMV=this.formGroup1.get('style_wise_total_smv').value;
if(this.checkNullValuaes()==true){

  AppAlert.showMessage('Processing...','Please wait while saving details')
  let formData = this.formGroup.getRawValue();
  let formDataReason=this.formGroupReason.getRawValue();
  let totalSMV=this.formGroup1.get('style_wise_total_smv').value;
  if(this.revisionNo!=-1){
    this.comments=formDataReason['comments']['reason_id'];
 }
 //debugger
  formData['style_id'] = formData['style_no']['style_id'];
  formData['bom_stage_id']=formData['bom_stage_description']['bom_stage_id'];
  formData['col_opt_id']=formData['color_option']['col_opt_id'];
  formData['product_feature_id'] = this.dataset[0]['product_feature_id'];
  if(formData['buy_name']!=null)
  formData['buy_id']=formData['buy_name']['buy_id'];
  if(formData['buy_name']==null)
  formData['buy_id']=null;

  //console.log(formData['col_opt_id']);

  console.log(this.dataset);
  console.log(this.datasetSum);
  this.http.post(this.apiUrl+'ie/componentSMVDetails/saveDataset',{'data':this.dataset,'dataSum':this.datasetSum,'styleId':formData.style_id,'bomStageId':formData.bom_stage_id,'colOptId':formData.col_opt_id,'buyId':formData.buy_id,'productFeatureID':formData.product_feature_id,'totalSMV':totalSMV,'componentSmvHeaderId':this.componentSmvHeaderId,'revisionNo':this.revisionNo,'comments':this.comments})
  .pipe(map(res=>res['data']))
  .subscribe(data=>{
    this.processing=false;
    this.clear()
    this.revisionNo=-1
    this.componentSmvHeaderId=0;
    //this.formGroup.reset();
    this.colorOptionModel.hide();
    if(data.status==1){
      AppAlert.showSuccess({text:data.message});
    //  this.processing=false
    }
    else if(data.status==0){
      AppAlert.showError({text:data.message});
      //this.processing=false
      }
  })
/*if(totalSMV!=0){
 this.http.get(this.apiUrl+'ie/componentSMVDetails?type=checkSMVRange&styleId='+formData.style_id+'&styleWiseTotalSMV='+totalSMV)
 .pipe(map(res=>res['data']))
 .subscribe(data=>{
   if(data.status==0){
   AppAlert.showError({text:data.message});
   //console.log(row);
   }
 else if(data.status==1) {
   let formData = this.formGroup.getRawValue();
   let totalSMV=this.formGroup1.get('style_wise_total_smv').value;
   formData['style_id'] = formData['style_no']['style_id'];
   formData['bom_stage_id']=formData['bom_stage_description']['bom_stage_id'];
   formData['col_opt_id']=formGroup['color_option']['col_opt_id'];
   console.log(this.dataset);
   this.http.post(this.apiUrl+'ie/componentSMVDetails/saveDataset',{'data':this.dataset,'dataSum':this.datasetSum,'styleId':formData.style_id,'bomStageId':formData.bom_stage_id,'colOptId':formData.col_opt_id,'totalSMV':totalSMV})
   .pipe(map(res=>res['data']))
   .subscribe(data=>{
     AppAlert.showSuccess({text:data.message});
   })
 }

 })
}
*/
}
  this.processing=false;
}
//
// saveTableData(){
// if(this.checkSMVRange()==true){
//
//   let formData = this.formGroup.getRawValue();
//   let totalSMV=this.formGroup1.get('style_wise_total_smv').value;
//   formData['style_id'] = formData['style_no']['style_id'];
//   formData['bom_stage_id']=formData['bom_stage_description']['bom_stage_id'];
//   console.log(this.dataset);
//   this.http.post(this.apiUrl+'ie/componentSMVDetails/saveDataset',{'data':this.dataset,'dataSum':this.datasetSum,'styleId':formData.style_id,'bomStageId':formData.bom_stage_id,'totalSMV':totalSMV})
//   .pipe(map(res=>res['data']))
//   .subscribe(data=>{
//     AppAlert.showSuccess({text:"Saved...! "});
//   })
// }
//
// }
checkSMVRange(surce){
  console.log("surce")
  console.log(surce)
  if(surce[0][1]=='smv'){
  var row=surce[0][0]
  var productSilhouetteId=this.dataset[row]['product_silhouette_id']
  var smv=surce[0][3]
 let formData = this.formGroup.getRawValue();
 var styleId=formData['style_no']['style_id']
 console.log(styleId)
  this.http.get(this.apiUrl+'ie/componentSMVDetails?type=checkSMVRange&styleId='+styleId+'&productSilhouetteId='+productSilhouetteId+'&smv='+smv)
  .pipe(map(res=>res['data']))
  .subscribe(data=>{
    AppAlert.showSuccess({text:data.message});
  })
}

}

showEvent(event){ //show event of the bs model
  this.formGroupReason.get('comments').enable()
  this.formGroupReason.reset();
  this.modelTitle = "Revision Reason"
  //this.colorOptionModel.show()
  //this.saveStatus = 'SAVE'
  //this.loadCancellationReason();
}

checkSilhouetteSmvRanage(){
  console.log(this.datasetSum)
  this.processing=true
  //this.http.post(this.apiUrl+'ie/componentSMVDetails/saveDataset',{'data':this.dataset,'dataSum':this.datasetSum,'styleId':formData.style_id,'bomStageId':formData.bom_stage_id,'colOptId':formData.col_opt_id,'productFeatureID':formData.product_feature_id,'totalSMV':totalSMV,'componentSmvHeaderId':this.componentSmvHeaderId,'revisionNo':this.revisionNo,'comments':this.comments})
  //.pipe(map(res=>res['data']))
  this.http.post(this.apiUrl+'ie/componentSMVDetails/checkSMVRange',{'data':this.datasetSum})
  .pipe(map(res=>res['data']))
  .subscribe(data=>{
    if(data.status==1){
      console.log(this.revisionNo)
      this.save()
    }else if(data.status==0){
    AppAlert.showError({text:data.append+data.silhouette+data.message});
      this.processing=false
  }
  })
}


clear(){
  this.Disable_add_new = 0
  this.revisionNo=-1;
  this.componentSmvHeaderId=0;
  this.formGroup.enable()
  this.formGroup.reset();
  this.formGroup1.reset();
  this.dataset=[];
  this.datasetSum=[];
  this.copyStatus=0;
  var arr=[];
  var  options = { mergeCells : arr  };

  const hotInstance = this.hotRegisterer.getInstance(this.instance);
  hotInstance.updateSettings(options, false);
  ////hotInstance.render();
  hotInstance.render();
   //hotInstance = this.hotRegisterer.getInstance(this.instanceSum);
  //hotInstance.render();
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
