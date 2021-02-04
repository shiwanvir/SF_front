import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import {ComponentLoaderFactory} from 'ngx-bootstrap/component-loader';
import {PositioningService} from 'ngx-bootstrap/positioning';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { Observable, Subject } from 'rxjs';
import { SmvToolBoxService } from './smv-tool-box.service';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { tap } from 'rxjs/internal/operators/tap';
import { switchMap } from 'rxjs/internal/operators/switchMap';


@Component({
  selector: 'app-smv-tool-box',
  templateUrl: './smv-tool-box.component.html',
  styleUrls: ['./smv-tool-box.component.css']
})
export class SmvToolBoxComponent implements OnInit {
  @ViewChild(ModalDirective) garmentOperationModel: ModalDirective;
  formValidator : AppFormValidator = null
  formGroup : FormGroup
  modelTitle : string = "New Operation Sub Component"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  saveStatus = 'SAVE'
  processing : boolean = false
  printToXl:boolean=false
  loading : boolean = false
  disableAddButton:boolean=false;
  loadingCount : number = 0
  initialized : boolean = false

  operationCompoent$: Observable<any[]>;//use to load customer list in ng-select
  operationCompoentLoading = false;
  operationCompoentInput$ = new Subject<string>();
  selectedOperationCompoent: any[]

  operationSubCompoent$: Observable<any[]>;//use to load customer list in ng-select
  operationSubCompoentLoading = false;
  operationSubCompoentInput$ = new Subject<string>();
  selectedOperationSubCompoent: any[]

  silhouette$:Observable<any[]>;//use tp load customer list in ng-select
  silhouetteLoading=false;
  silhouetteInput$ =new Subject<string>();
  selectedSilhouette:any[]

  customer$: Observable<any[]>;//use to load customer list in ng-select
  customerLoading = false;
  customerInput$ = new Subject<string>();
  selectedCustomer: any[]


  instance: string = 'instance';
  hotOptions: any
  dataset: any[] = [];
  currentDataSetIndexMaintable:number=-1

  instanceSummary: string = 'instanceSummary';
  hotOptionsSummary: any
  datasetSummary: any[] = [];
  columns_ie:any[]= [

    { type: 'text', title : 'Operation Component' , data: 'operation_component_name',className: "htLeft",readOnly:true},
    { type: 'text', title : 'Operation  Sub Component' , data: 'operation_sub_component_name',className: "htLeft",readOnly:true},
    { type: 'checkbox', title : 'Action' , readOnly: false, data : 'checked' , checkedTemplate: 1,  uncheckedTemplate: 0 },
    { type: 'text', title : 'Operation' , data: 'operation_name',className: "htLeft",readOnly:true},
    { type: 'text', title : 'Machine Type' , data: 'machine_type_name',className: "htLeft",readOnly:true},
    { type: 'numeric', title : 'Cost SMV', data: 'cost_smv',className: "htRight",readOnly:true},
    { type: 'numeric', title : 'GSD SMV', data: 'gsd_smv',className: "htRight",readOnly:true},
     { type: 'text', title : 'Code' , data: 'operation_code',className: "htLeft",readOnly:true}

  ];
  columns_merchant:any[]= [

    { type: 'text', title : 'Operation Component' , data: 'operation_component_name',className: "htLeft",readOnly:true},
    { type: 'text', title : 'Operation  Sub Component' , data: 'operation_sub_component_name',className: "htLeft",readOnly:true},
    { type: 'checkbox', title : 'Action' , readOnly: false, data : 'checked' , checkedTemplate: 1,  uncheckedTemplate: 0 },
    { type: 'text', title : 'Operation' , data: 'operation_name',className: "htLeft",readOnly:true},
    { type: 'text', title : 'Machine Type' , data: 'machine_type_name',className: "htLeft",readOnly:true},
    { type: 'numeric', title : 'Cost SMV', data: 'cost_smv',className: "htRight",readOnly:true}

  ]
  //to manage form error messages
  formFields = {
        customer_code:'',
        silhouette_code: '',
        operation_component_id:'',
        operation_sub_component_id:'',
        validation_error:''
  }
  constructor(private fb:FormBuilder , private http:HttpClient,private hotRegisterer: HotTableRegisterer,private permissionService : PermissionsService,
    private auth : AuthService,private layoutChangerService : LayoutChangerService, private titleService: Title,private smvService:SmvToolBoxService) { }

    ngOnInit() {
      this.titleService.setTitle("SMV Tool Box")//set page title

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
      let remoteValidationConfig = { //configuration for location code remote validation
        url:this.apiUrl + 'ie/garment_operation_sub_components/validate?for=duplicate',
        formFields : this.formFields,
        fieldCode : 'operation_sub_component_code',
        /*error : 'Dep code already exists',*/
        data : {

          customer_code:function(controls){ return controls['customer_code']['value']},
          silhouette_code : function(controls){ return controls['silhouette_code']['value']},
          operation_component_id:function(controls){ return controls['customer_code']['value']},
          operation_sub_component_id:function(controls){ return controls['customer_code']['value']},
        }
      }

      this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){return;}
      //  debugger
            const hotInstance = this.hotRegisterer.getInstance(this.instance);
            if(hotInstance != undefined && hotInstance != null){
              hotInstance.render(); //refresh fg items table
            }

      })

          let basicValidator = new BasicValidators(this.http)//create object of basic validation class

          this.formGroup = this.fb.group({
            smv_reading_id: 0,
            customer_code : [null , [Validators.required]],
            silhouette_code : [null , [Validators.required]],
            operation_component_id:[null , [Validators.required]],
            operation_sub_component_id:[null , [Validators.required]],
            total_smv:[null]
                    })
          this.formGroup.get('total_smv').disable();
          this.formValidator = new AppFormValidator(this.formGroup , {});
          //create new validation object
          this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

          this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
            this.appValidator.validate();
          })



          //change header nevigation pagePath
          this.layoutChangerService.changeHeaderPath([
            'Catalogue',
            'IE',
            'SMV Tool Box'
          ])



        this.loadOperationComponaent();
        this.initializeOrderLinesTable();
        this.initializeSummaryTable();
        this.loadSilhouette()
        this.loadOperationSubComponaent();
        this.loadCustomer();


                this.smvService.smvData.subscribe(data=>{
                  //this.formGroup.reset()
                //  debugger
                 this.viewSMV(data);
                   //this.loadCancellationReason();

                })

    }
    ngOnDestroy(){

    }




    viewSMV(data){
      if(data!=null){
      //debugger
      this.dataset=data.detail
      this.datasetSummary=data.summary
      this.formGroup.patchValue({
        'smv_reading_id': data.header.smv_reading_id,
        'customer_code' : data.header,
        'silhouette_code' : data.header,
        //'operation_component_id':data.operationCopmponent,
        //'operation_sub_component_id':data.subComponentsList,
        'total_smv':data.header.total_smv
      })
      this.saveStatus = 'UPDATE'
      this.formGroup.disable()
      this.formGroup.get('operation_sub_component_id').enable()
      this.formGroup.get('operation_component_id').enable()
      this.mergeComponentCells()
      this.calculateTotalSmv(this.dataset,this.datasetSummary)
      if(this.dataset.length>0){
        this.printToXl=true;
        //this.disableAddButton=true;
      }
  }

    }

      searchData(){
      //  debugger
        AppAlert.showMessage('Loding...','Please wait while Loading details')
        var formData=this.formGroup.getRawValue();
        let searchData$=null;

        searchData$=this.http.post(this.apiUrl+'ie/smv_tool_box/searchDetails',{header:formData});
        searchData$.subscribe(

        (res)=>{
        //  debugger
         AppAlert.closeAlert();
         this.checkDataAlreadyAvaliable(res.data.details)
           if(this.dataset.length==0){
          this.dataset=res.data.details
          this.datasetSummary=res.data.summary
        }
        else{
          for(var i=0;i<res.data.details.length;i++){
            this.dataset.push(res.data.details[i])
          }
        }

          this.formGroup.disable()
          this.formGroup.get('operation_sub_component_id').enable()
          this.formGroup.get('operation_component_id').enable()
          this.mergeComponentCells()
          const hotInstance = this.hotRegisterer.getInstance(this.instanceSummary);
          hotInstance.render()
          this.calculateTotalSmv(this.dataset,this.datasetSummary)
          if(this.dataset.length>0){
            this.printToXl=true;
            //this.disableAddButton=true;
          }

        },


        (error)=>{



        }
      );
      }
      calculateTotalSmv(details,summary){
        //debugger
        var total=0;
        for(var i=0;i<details.length;i++){
          total+=parseFloat(details[i]['cost_smv']);
        }

        for(var i=0;i<summary.length;i++){
          if(summary[i]['cost_smv']!=undefined){
            total+=parseFloat(summary[i]['cost_smv']);
          }
        }
        var x=this.countDecimals(total) ;
        if(this.countDecimals(total) > 4){
        total = this.formatDecimalNumber(total, 4)
        }
        else{
         total=total;
      }
        this.formGroup.patchValue({
          total_smv:total
        })
        //this.formGroup.
      }

        saveBeforeprint(){
        debugger
        // var id;
        for(var i=0;i<this.datasetSummary.length;i++){
          if(this.datasetSummary[i]['cost_smv']==undefined){
            AppAlert.showError({text:"Please Complete the Summary Table"});
            return 0;
          }
        }
        //  debugger
          var a=this.dataset;
          this.processing = true
         AppAlert.showMessage('Processing...','Please wait while Printing details')
          let saveOrUpdate$ = null;
        //  debugger
          let smvReadingId = this.formGroup.get('smv_reading_id').value
          let formData=this.formGroup.getRawValue();
          formData['customer_id']=formData['customer_code']['customer_id'];
          formData['product_silhouette_id']=formData['silhouette_code']['product_silhouette_id'];
          //formData['operation_component_id']=formData['operation_component_id']['operation_component_id'];
          //formData['operation_sub_component_id']=formData['operation_sub_component_id']['operation_component_id'];

          if(this.saveStatus == 'SAVE'){
            saveOrUpdate$ = this.http.post(this.apiUrl + 'ie/smv_tool_box',{'header': formData,'detail':this.dataset,'summary':this.datasetSummary})
          }
          else if(this.saveStatus == 'UPDATE'){
            saveOrUpdate$ = this.http.put(this.apiUrl + 'ie/smv_tool_box/' + smvReadingId ,{'header': formData,'detail':this.dataset,'summary':this.datasetSummary})
          }
          saveOrUpdate$.subscribe(
            (res) => {
            //  debugger
              if(res.data.status==1){
              this.processing=false;
              AppAlert.closeAlert();
              this.clear()
              //debugger
             window.open(AppConfig.OperationDataExport(res.data.id),"_blank");

            }
            else if(res.data.status==0){
              this.processing=false;
              AppAlert.showError({text : res.data.message })
              this.clear()


            }
           },
           (error) => {
             if(error.status == 422){ //validation error
               AppAlert.showError({title : 'Validation Error' , text : error.error.errors.validationErrorsText })
             }else{
               console.log(error)
               AppAlert.showError({text : 'Process Error' })
             }
           }
         );



        }


        showEvent(event){ //show event of the bs model
          this.formGroup.get('operation_sub_component_name').enable()
          this.formGroup.reset();
          this.saveStatus = 'SAVE'
          this.dataset=[{operation_name:'',detail_id:'',machine_type_id:'',cost_smv:'',gsd_smv:'',operation_code:''}];
        //  debugger
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          setTimeout(() => {
            hotInstance.render();
                 }, 200)
        }

        formValidate(){ //validate the form on input blur event
          this.appValidator.validate();
        }

      clear(){
      //  debugger

        //this.formGroup.get('operation_component_id').enable()
        //this.formGroup.get('operation_sub_component_code').enable()
        this.formGroup.enable()
        this.formGroup.reset();
        this.dataset=[]
        this.datasetSummary=[]
        this.formGroup.get('total_smv').disable()
        this.printToXl=false;
        //this.disableAddButton=false;
        this.saveStatus="SAVE";

      }

      removetableLines(e){
      //  debugger
        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        var tem=[];
        var removed_sub_component=e.value.operation_sub_component_id;
        for(var i=0;i<this.dataset.length;i++){
          if(this.dataset[i]['operation_sub_component_id']!=removed_sub_component){
            tem.push(this.dataset[i])
          }
        }
        this.dataset=tem
        this.mergeComponentCells()
        this.calculateTotalSmv(this.dataset,this.datasetSummary)
        hotInstance.render()
        if(this.dataset.length>0){
          this.printToXl=true;
        }
        else
        this.printToXl=false;
      }
      //load silhouette list
      loadSilhouette() {
           this.silhouette$ = this.silhouetteInput$
           .pipe(
              debounceTime(200),
              distinctUntilChanged(),
              tap(() => this.silhouetteLoading = true),
              switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/silhouettes?type=auto' , {params:{search:term}})
              .pipe(
                  //catchError(() => of([])), // empty list on error
                  tap(() => this.silhouetteLoading = false)
              ))
           );
       }

         loadOperationComponaent(){

           this.operationCompoent$ = this.operationCompoentInput$
           .pipe(
              debounceTime(200),
              distinctUntilChanged(),
              tap(() => this.operationCompoentLoading = true),
              switchMap(term => this.http.get<any[]>(this.apiUrl + 'ie/garment_operation_components?type=auto' , {params:{search:term}})
              .pipe(
                  //catchError(() => of([])), // empty list on error
                  tap(() => this.operationCompoentLoading = false)
              ))
           );


         }


         loadOperationSubComponaent(){

           this.operationSubCompoent$ = this.operationSubCompoentInput$
           .pipe(
              debounceTime(200),
              distinctUntilChanged(),
              tap(() => this.operationSubCompoentLoading = true),
              switchMap(term => this.http.get<any[]>(this.apiUrl + 'ie/garment_sub_operation_components?type=auto_o_component_wise' , {params:{search:term,o_component:((this.formGroup.get('operation_component_id').value == null) ? null : this.formGroup.get('operation_component_id').value.operation_component_id)}})
              .pipe(
                  //catchError(() => of([])), // empty list on error
                  tap(() => this.operationSubCompoentLoading = false)
              ))
           );


         }

         LoadsubOperationlist(e){
           /*if(this.checkDataAlreadyAvaliable()==false){
              AppAlert.showError({text:"Operation Component already exists"})
              return 0;
           }*/
          //this.operationSubCompoent$ =null;
           this.processing = true
           AppAlert.showMessage('Processing...','Please wait while loding details')
            this.http.get(this.apiUrl + 'ie/garment_sub_operation_components?type=auto_o_component_wise_all',{params:{o_component:((this.formGroup.get('operation_component_id').value == null) ? null : this.formGroup.get('operation_component_id').value.operation_component_id)}}).subscribe(data=>{
              //debugger
              this.formGroup.patchValue({
                'operation_sub_component_id':data
              })
              this.processing = false
              AppAlert.closeAlert()
           })
         }

         loadCustomer() {
              this.customer$ = this.customerInput$
              .pipe(
                 debounceTime(200),
                 distinctUntilChanged(),
                 tap(() => this.customerLoading = true),
                 switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/customers?type=auto' , {params:{search:term}})
                 .pipe(
                     //catchError(() => of([])), // empty list on error
                     tap(() => this.customerLoading = false)
                 ))
              );
          }
         initializeOrderLinesTable(){
           var x=0;
          var clipboardCache = '';
         if(this.permissionService.hasDefined('SMV_TOOL_BOX_IE_PERMISSION')==false){
             this.hotOptions = {
               columns:this.columns_merchant,
               manualColumnResize: true,
               autoColumnSize : true,
               rowHeaders: true,
               colHeaders: true,
               //nestedRows: true,
               height: 250,
               copyPaste: true,
               stretchH: 'all',
               selectionMode: 'range',
               // fixedColumnsLeft: 3,
               /*columnSorting: true,*/
               className: 'htCenter htMiddle',
               readOnly: true,
               mergeCells:[],
               afterChange:(changes,surce,row,col,value,prop)=>{
                 var a=this.dataset;
                if(surce != null && surce.length > 0){
                 const hotInstance = this.hotRegisterer.getInstance(this.instance);

                 let _row = surce[0][0]
                 if(surce[0][1]=='cost_smv'){
                 let _cost_smv = (surce[0][3] == '' || surce[0][3] <0 ||  isNaN(surce[0][3])) ? 0 : surce[0][3]
                 var x=this.countDecimals(_cost_smv) ;
                 if(this.countDecimals(_cost_smv) > 4){
                   _cost_smv = this.formatDecimalNumber(_cost_smv, 4)
                   this.dataset[_row]['cost_smv']=_cost_smv
                 }
                 else{
                  this.dataset[_row]['cost_smv']=_cost_smv
               }

               hotInstance.render()
               //hotInstance.setDataAtCell(_row, 10, _qty)
               }
               if(surce[0][1]=='gsd_smv'){
               let _gsd_smv = (surce[0][3] == '' || surce[0][3] <0 || isNaN(surce[0][3])) ? 0 : surce[0][3]
               if(this.countDecimals(_gsd_smv) > 4){
                 _gsd_smv = this.formatDecimalNumber(_gsd_smv, 4)
                 this.dataset[_row]['gsd_smv']=_gsd_smv
               }
               else{
                this.dataset[_row]['gsd_smv']=_gsd_smv
             }
        //     this.datasetDetails[_row]['qty']=_qty
             hotInstance.render()
             //hotInstance.setDataAtCell(_row, 10, _qty)
             }
             if(surce[0][1]=='operation_code'){
               let _operation_code= surce[0][3]
               if(_operation_code!=null){
               this.dataset[_row]['operation_code']=_operation_code.toUpperCase();
               hotInstance.render()
             }
             }
             if(surce[0][1]=='operation_name'){
               let _operation_name= surce[0][3]
               if(_operation_name!=null){
               this.dataset[_row]['operation_name']=_operation_name.toUpperCase();
               hotInstance.render()
             }
             }

               }
                   },
                 afterCreateRow:(index,amount,source)=>{
                   //console.log(index);


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
                       disabled:(key, selection, clickEvent)=> {
                         const hotInstance = this.hotRegisterer.getInstance(this.instance);
                         let sel_col = hotInstance.getSelectedLast()[1];
                         if(sel_col!=2){
                           return hotInstance.getSelectedLast()[1] === sel_col
                         }
                       },
                       callback : (key, selection, clickEvent) => {
                         if(selection.length > 0){
                           let start = selection[0].start;
                           this.contextMenuMainTableDelete(start.row)
                         }
                       }
                     }


             }
           }
         }
            }
        if(this.permissionService.hasDefined('SMV_TOOL_BOX_IE_PERMISSION')){
          this.hotOptions = {
            columns:this.columns_ie,
            manualColumnResize: true,
            autoColumnSize : true,
            rowHeaders: true,
            colHeaders: true,
            //nestedRows: true,
            height: 250,
            copyPaste: true,
            stretchH: 'all',
            selectionMode: 'range',
            // fixedColumnsLeft: 3,
            /*columnSorting: true,*/
            className: 'htCenter htMiddle',
            readOnly: true,
            mergeCells:[],
            afterChange:(changes,surce,row,col,value,prop)=>{
            var a=this.dataset;
             if(surce != null && surce.length > 0){
              const hotInstance = this.hotRegisterer.getInstance(this.instance);

              let _row = surce[0][0]
              if(surce[0][1]=='cost_smv'){
              let _cost_smv = (surce[0][3] == '' || surce[0][3] <0 ||  isNaN(surce[0][3])) ? 0 : surce[0][3]
              var x=this.countDecimals(_cost_smv) ;
              if(this.countDecimals(_cost_smv) > 4){
                _cost_smv = this.formatDecimalNumber(_cost_smv, 4)
                this.dataset[_row]['cost_smv']=_cost_smv
              }
              else{
               this.dataset[_row]['cost_smv']=_cost_smv
            }

            hotInstance.render()
            //hotInstance.setDataAtCell(_row, 10, _qty)
            }
            if(surce[0][1]=='gsd_smv'){
            let _gsd_smv = (surce[0][3] == '' || surce[0][3] <0 || isNaN(surce[0][3])) ? 0 : surce[0][3]
            if(this.countDecimals(_gsd_smv) > 4){
              _gsd_smv = this.formatDecimalNumber(_gsd_smv, 4)
              this.dataset[_row]['gsd_smv']=_gsd_smv
            }
            else{
             this.dataset[_row]['gsd_smv']=_gsd_smv
          }
     //     this.datasetDetails[_row]['qty']=_qty
          hotInstance.render()
          //hotInstance.setDataAtCell(_row, 10, _qty)
          }
          if(surce[0][1]=='operation_code'){
            let _operation_code= surce[0][3]
            if(_operation_code!=null){
            this.dataset[_row]['operation_code']=_operation_code.toUpperCase();
            hotInstance.render()
          }
          }
          if(surce[0][1]=='operation_name'){
            let _operation_name= surce[0][3]
            if(_operation_name!=null){
            this.dataset[_row]['operation_name']=_operation_name.toUpperCase();
            hotInstance.render()
          }
          }

            }
                },
              afterCreateRow:(index,amount,source)=>{
                //console.log(index);


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
                    disabled:(key, selection, clickEvent)=> {
                    //  debugger
                      const hotInstance = this.hotRegisterer.getInstance(this.instance);
                      let sel_col = hotInstance.getSelectedLast()[1];
                      if(sel_col!=2){
                        return hotInstance.getSelectedLast()[1] === sel_col
                      }
                    },
                    callback : (key, selection, clickEvent) => {
                      //debugger
                      if(selection.length > 0){
                        let start = selection[0].start;
                        this.contextMenuMainTableDelete(start.row)
                      }
                    }
                  }


          }
        }
      }

        }
           //debugger

       }

       mergeComponentCells(){
        if(this.dataset.length>0){
          let options
         const hotInstance = this.hotRegisterer.getInstance(this.instance);
         var start=0;
         var count=0;
         var init_line_no=this.dataset[0]['operation_component_id']
         let arr = []
           for(let x=0;x<this.dataset.length;x++){
               count++;
               if(init_line_no!=this.dataset[x]['operation_component_id']){
              this.calComponentWiseSmv(start,count-1)
              arr.push({row: start, col: 0, rowspan: count-1, colspan: 1})
              init_line_no=this.dataset[x]['operation_component_id']
              start =x;
              x--
                count=0;
              }

         }
        this.calComponentWiseSmv(start,count)
         arr.push({row: start, col: 0, rowspan: count, colspan: 1})
         start=0;
         count=0;
         init_line_no=this.dataset[0]['operation_sub_component_id']
             for(let x=0;x<this.dataset.length;x++){
             count++;
             if(init_line_no!=this.dataset[x]['operation_sub_component_id']){
            this.calSubComponentWiseSmv(start,count-1)
            arr.push({row: start, col: 1, rowspan: count-1, colspan: 1})
            init_line_no=this.dataset[x]['operation_sub_component_id']
            start =x;
            x--
              count=0;
            }

       }
       this.calSubComponentWiseSmv(start,count)
       arr.push({row: start, col: 1, rowspan: count, colspan: 1})
       options = { mergeCells : arr  };

         hotInstance.updateSettings(options, false)
         hotInstance.render();
       }
       }
       calComponentWiseSmv(start,numberOfrows){
         //debugger
         var str=this.dataset[start]['ori_operation_component_name'].concat(" (")
         var tot=0;
          for(let x=start;x<start+numberOfrows;x++){
          //  debugger
              tot=tot+parseFloat(this.dataset[x]['cost_smv']);
            }
            for(let x=start;x<start+numberOfrows;x++){
              if(this.countDecimals(tot) > 4){
                tot = this.formatDecimalNumber(tot, 4)
              }
            this.dataset[x]['operation_component_name']=str.concat(tot.toString()).concat(")")
          }
       }
       calSubComponentWiseSmv(start,numberOfrows){
         //debugger
         var str=this.dataset[start]['ori_operation_sub_component_name'].concat(" (")
         var tot=0;
          for(let x=start;x<start+numberOfrows;x++){
          //  debugger
              tot=tot+parseFloat(this.dataset[x]['cost_smv']);
            }
            for(let x=start;x<start+numberOfrows;x++){
              if(this.countDecimals(tot) > 4){
                tot = this.formatDecimalNumber(tot, 4)
              }
            this.dataset[x]['operation_sub_component_name']=str.concat(tot.toString()).concat(")")
          }
       }
       initializeSummaryTable(){
         var clipboardCache = '';
       //var sheetclip = new sheetclip();
         this.hotOptionsSummary = {
           columns: [

             { type: 'text', title : 'Garment Operation ' , data: 'garment_operation_name',className: "htLeft",readOnly:true},
             { type: 'numeric', title : 'Cost SMV', data: 'cost_smv',className: "htRight",readOnly:false},
           ],
           manualColumnResize: true,
           autoColumnSize : true,
           rowHeaders: true,
           colHeaders: true,
           //nestedRows: true,//
           height: 250,
           copyPaste: true,
           stretchH: 'all',
           selectionMode: 'range',
           // fixedColumnsLeft: 3,
           /*columnSorting: true,*/
           className: 'htCenter htMiddle',
           readOnly: true,
           mergeCells:[],
           afterChange:(changes,surce,row,col,value,prop)=>{
             //debugger
             var a=this.dataset;
            if(surce != null && surce.length > 0){
             const hotInstance = this.hotRegisterer.getInstance(this.instanceSummary);
             //this.saved=false;
             let _row = surce[0][0]
             if(surce[0][1]=='cost_smv'){
              // debugger
             let _cost_smv = (surce[0][3] == '' || surce[0][3] <0 || isNaN(surce[0][3])) ? 0 : surce[0][3]
             var x=this.countDecimals(_cost_smv) ;
             if(this.countDecimals(_cost_smv) > 4){
               _cost_smv = this.formatDecimalNumber(_cost_smv, 4)
               this.datasetSummary[_row]['cost_smv']=_cost_smv
             }
             else{
              this.datasetSummary[_row]['cost_smv']=_cost_smv
           }
            this.  calculateTotalSmv(this.dataset,this.datasetSummary)
           hotInstance.render()
           //hotInstance.setDataAtCell(_row, 10, _qty)
           }
           if(surce[0][1]=='gsd_smv'){
           let _gsd_smv = (surce[0][3] == ''  ||  surce[0][3] <0 || isNaN(surce[0][3])) ? 0 : surce[0][3]
           if(this.countDecimals(_gsd_smv) > 4){
             _gsd_smv = this.formatDecimalNumber(_gsd_smv, 4)
             this.datasetSummary[_row]['gsd_smv']=_gsd_smv
           }
           else{
            this.datasetSummary[_row]['gsd_smv']=_gsd_smv
         }
    //     this.datasetDetails[_row]['qty']=_qty
         hotInstance.render()
         //hotInstance.setDataAtCell(_row, 10, _qty)
         }
         if(surce[0][1]=='operation_code'){
           let _operation_code= surce[0][3]
           if(_operation_code!=null){
           this.datasetSummary[_row]['operation_code']=_operation_code.toUpperCase();
           hotInstance.render()
         }
         }
         if(surce[0][1]=='operation_name'){
           let _operation_name= surce[0][3]
           if(_operation_name!=null){
           this.datasetSummary[_row]['operation_name']=_operation_name.toUpperCase();
           hotInstance.render()
         }
         }

           }
               },
             afterCreateRow:(index,amount,source)=>{
               //console.log(index);


             },
             afterPaste:(changes)=>{

                 const hotInstance = this.hotRegisterer.getInstance(this.instanceSummary);
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
                   disabled:(key, selection, clickEvent)=> {
                     //debugger
                     const hotInstance = this.hotRegisterer.getInstance(this.instanceSummary);
                     var _line=hotInstance.getSelectedLast()[0]
                   },
                   callback : (key, selection, clickEvent) => {
                     if(selection.length > 0){
                       let start = selection[0].start;
                       this.contextMenuSummaryTableDelete(start.row)
                     }
                   }
                 }


         }
       }
     }
     }
       contextMenuOptions(line,type){
         //debugger
         return false;
           //this.datasetDetails[_line];
       }

       contextMenuMainTableDelete(row){
         let selectedRowData = this.dataset[row]
        /* if(this.checkinitDataset(row)==false){
           debugger
           var tem=[];
           var id=this.dataset[row]['operation_sub_component_id']
          //  this.selectedOperationSubCompoent = this.selectedOperationSubCompoent.filter(s => s === id);
            for(var i=0;i<this.selectedOperationSubCompoent.length;i++){
              if(this.selectedOperationSubCompoent[i]['operation_sub_component_id']!=id){
                tem.push((this.selectedOperationSubCompoent[i]));
              }
            }
            this.selectedOperationSubCompoent =tem;

         }*/
        var   tempArr: any[] = [];
         for(var k=0;k<this.dataset.length;k++){
           if(this.dataset[k]['checked']==undefined){
             this.dataset[k]['checked']=0
           }
           if(this.dataset[k]['checked']==1)
           tempArr.push(this.dataset[k])
       }
       debugger
        this.dataset=tempArr
       var l=this.dataset;
         this.mergeComponentCells()
         const hotInstance = this.hotRegisterer.getInstance(this.instance);
         hotInstance.render()
         this.calculateTotalSmv(this.dataset,this.datasetSummary)
         if(this.dataset.length==0){
           this.printToXl=false;
         }

       }
       contextMenuSummaryTableDelete(row){

         let selectedRowData = this.datasetSummary[row]

         this.datasetSummary.splice(row,1);

        //  this.mergeComponentCells()
          this.calculateTotalSmv(this.dataset,this.datasetSummary)
           const hotInstance = this.hotRegisterer.getInstance(this.instanceSummary);
           hotInstance.render()
       }

       checkinitDataset(row){
         var count=0;
         var lineNo=this.dataset[row]['operation_sub_component_id'];
         for(let x=0;x<this.dataset.length;x++){
            if(this.dataset[x]['operation_sub_component_id']==lineNo)
              count++
         }
         if(count==1)
            return false;
            else
            return true;

       }

       countDecimals(_val) {
        if(Math.floor(_val) === _val) return 0;
        return _val.toString().split(".")[1].length || 0;
       }

       formatDecimalNumber(_number, _places){
         let num_val = parseFloat(_number+'e'+_places)//_number.toExponential(2)
         return Number(Math.round(num_val)+'e-'+_places);
       }

         addLine(key, selection, clickEvent){
           this.dataset.push({operation_name:"",detail_id:""});
           const hotInstance = this.hotRegisterer.getInstance(this.instance);
             hotInstance.render();

         }


         checkDataAlreadyAvaliable(_new_data){
            var temArr=[]
		        var _sub_component=null;
            var _sub_com_detail=null;
            var _component=this.formGroup.get('operation_component_id').value.operation_component_id
            for(var i=0;i<_new_data.length;i++){
             _sub_component=_new_data[i]['operation_component_id'];
             _sub_com_detail=_new_data[i]['sub_component_detail_id'];
              for(var k=0;k<this.dataset.length;k++){
                if(this.dataset[k]['sub_component_detail_id']==_sub_com_detail){
                  this.dataset.splice(k,1)
                  break;
                }
              }

            }

         }

         LoadMapedOperations(e){
           var data=this.formGroup.getRawValue()
           //debugger
           if(data.customer_code==null){
             AppAlert.showError({text:"Please Select a Customer"})
             this.formGroup.patchValue({
               'silhouette_code':null
             })
             return 0;
           }
           this.processing = true
           AppAlert.showMessage('Processing...','Please wait while loding details')
              let searchData$=null;
            searchData$=  this.http.post(this.apiUrl + 'ie/smv_tool_box/searchDetailsAll',{silhouette:((this.formGroup.get('silhouette_code').value == null) ? null : this.formGroup.get('silhouette_code').value.product_silhouette_id)})
            searchData$.subscribe(
              (res)=>{
                //debugger
                AppAlert.closeAlert();
                //this.checkDataAlreadyAvaliable(res.data.details)
                this.dataset=res.data.details;
                this.datasetSummary=res.data.summary;
                 this.formGroup.disable()
                 this.formGroup.get('operation_sub_component_id').enable()
                 this.formGroup.get('operation_component_id').enable()
                 this.mergeComponentCells()
                 const hotInstance = this.hotRegisterer.getInstance(this.instanceSummary);
                 hotInstance.render()
                 this.calculateTotalSmv(this.dataset,this.datasetSummary)
                 if(this.dataset.length>0){
                   this.printToXl=true;
                   //this.disableAddButton=true;
                 }

           },
           (error)=>{



          }
         )

       }
}
