import { Component, OnInit,ViewChild, Input, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {FormBuilder, FormGroup, FormControl, Validators, FormArray} from '@angular/forms';
import { Http, HttpModule, Headers,  Response } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../core/app-config';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';
import {GrnModalComponent} from "./grn-modal/grn-modal.component";
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppAlert } from '../../core/class/app-alert';
import { AuthService } from '../../core/service/auth.service';
import { GrnServicesService } from './grn-services.service';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';

import { GrnListComponent } from './grn-list/grn-list.component';
import { AbstractControl } from '@angular/forms';


@Component({
  selector: 'app-grn',
  templateUrl: './grn.component.html',
  styleUrls: ['./grn.component.css']
  //directives:['GrnModalComponent']
})

export class GrnComponent implements OnInit {
  [x: string]: any;
  @ViewChild(ModalDirective) grnModel: ModalDirective;
  @ViewChild("rollPlanModel") rollPlanModel: ModalDirective;
  @ViewChild("trimPackingModel") trimPackingModel: ModalDirective;
  @ViewChild("grnConfirmationModel") grnConfirmationModel: ModalDirective;
  @ViewChild(ModalDirective) binModal: ModalDirective;
  @ViewChild(GrnModalComponent) private grnSerch: GrnModalComponent;
  @ViewChild('potabs') potabs: TabsetComponent;
  @ViewChild(GrnListComponent) childGrnList: GrnListComponent;

//
  message = "Hellow";
savedStatus:boolean=false;
  grnGroup : FormGroup
  filterDataGroup:FormGroup
  rollPlanGroup:FormGroup
  trimPackingGroup:FormGroup
  //processing : boolean
 modelTitle : string = "ADD Details"
 rollPlanModelTitle:string="Roll Plan Details"
 trimPackingModelTitle:string="Trim Packing Details"
 grnConfirmationModelTitle:string="Roll Plan Details"
  name = new FormControl('');
  serverUrl:string = AppConfig.apiServerUrl()
  apiUrl = AppConfig.apiUrl()
  res : string = '';
  private currentLine
  //processing : boolean = false
  instance: string = 'instance';
  instanceDetails: string = 'instanceDetails';
  hotOptions: any
  dataset: any[] = [];

  hotOptionsDetails: any
  datasetDetails: any[] = [];
  grnSaveLineDetails:any[]=[];
  //forRollPlanModel
  instanceRollPlan: string = 'instanceRollPlan';
  hotOptionsRollPlan: any
  datasetRollPlan: any[] = [];

  instanceTrimPacking: string = 'instanceTrimPacking';
  hotOptionsTrimPacking: any
  datasetTrimPacking: any[] = [];

  instanceGrnConfirm: string = 'instanceGrnConfirm';
  hotOptionsGrnConfirmDetails: any
  datasetGrnConfirm: any[] = [];

  arr:any[]=[];
  savedGrnModel:any[]=[];
  formData$ : Observable<Array<any>>
//  poList$ : Observable<Array<any>>
  stores$ : Observable<Array<any>>
  childVal:string;
  authdata: any;
  currentDataSetIndex : number = -1
  currentDataSetIndexMaintable:number=-1

  customer$: Observable<any[]>;//use to load customer list in ng-select
  customerLoading = false;
  customerInput$ = new Subject<string>();
  selectedCustomer: any[]

  color$: Observable<any[]>;//use to load customer list in ng-select
  colorLoading = false;
  colorInput$ = new Subject<string>();
  selectedColor: any[]

  customerPo$: Observable<any[]>;//use to load customer list in ng-select
  customerPoLoading = false;
  customerPoInput$ = new Subject<string>();
  selectedCustomerPo: any[]

  item$: Observable<any[]>;//use to load customer list in ng-select
  itemLoading = false;
  itemInput$ = new Subject<string>();
  selectedItem: any[]

  bin$: Observable<any[]>;//use to load customer list in ng-select
  binLoading = false;
  binInput$ = new Subject<string>();
  selectedBin: any[]

  poList$: Observable<any[]>;//use to load customer list in ng-select
  poLoading = false;
  poNoInput$ = new Subject<string>();
  selectedPoNo: any[]

  grnTypelist$: Observable<any[]>;//use to load customer list in ng-select
  grnTypeLoading = false;
  grnTypeInput$ = new Subject<string>();
  selectedGrnType: any[]


  processing : boolean = false
  saved:boolean=false
  grnReveived:boolean=false
  confrimedGrn:boolean=false
  dataNullforconfirm:boolean=false;
  grnSavedAndReceived:boolean=false
  updateStatus:boolean=false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false
  islineticked:boolean=false
  saveStatus = 'SAVE'
  saveOrUpdate='Save'
  mode="SAVE"
  grnId = null
  $_store_id:any
  $_sub_store_id:any
  current_location:any=null;
  delivery_loc_id:any
  formValidator : AppFormValidator = null
  formValidatorGrn : AppFormValidator = null
  AppFormValidatorGrn:AppFormValidator = null
  AppFormValidatorTrimPacking:AppFormValidator = null
  formValidatorTrimPacking:AppFormValidator=null
  appValidator : AppValidator
  appValidatorGrn:AppValidator
  appValidatorTrimPacking:AppValidator
  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop}
  formFields = {
    roll_plan_from:'',
    roll_plan_to:'',
    lot_no:'',
   batch_no:'',
    bin:'',
    width:'',
    shade:'',
    comment:'',
    qty:'',
    validation_error:''
  }

  formFieldsTrimpacking = {
    box_no_from:'',
    box_no_to:'',
    lot_no:'',
    batch_no:'',
    bin:'',
    shade:'',
    comment:'',
    qty:'',
    validation_error:''
  }

  formFieldsHeader = {
    po_no:'',
    grn_type_code:'',
    sup_name:'',
    lot_no:'',
    //batch_no:'',
    bin:'',
    width:'',
    shade:'',
    comment:'',
    qty:'',
    validation_error:'',
    po_deli_loc:''
  }
  constructor(private http:HttpClient, private grnService: GrnServicesService,private fb: FormBuilder,private hotRegisterer: HotTableRegisterer, private auth:AuthService,private layoutChangerService : LayoutChangerService,private titleService: Title,  private snotifyService: SnotifyService) { }

  ngOnInit() {
    //lisiten to the click event of orders table's edit button in StyleBuyerPoListComponent
      this.titleService.setTitle("Inward Register")//set page title
      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

      this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){return;}
            const hotInstance = this.hotRegisterer.getInstance(this.instanceDetails);
            if(hotInstance != undefined && hotInstance != null){
              hotInstance.render(); //refresh fg items table
            }

      })

  /*    let remoteValidationConfig = { //configuration for location code remote validation
        url:this.apiUrl + 'stores/grns/validate?for=duplicate',
        formFields : this.formFieldsHeader,
        fieldCode : 'invoice_no',
        error : 'Dep code already exists',
        data : {
          invoice_no : function(controls){ return controls['invoice_no']['value']},
          grn_id:function(controls){if(controls['grn_id']['value']!=null) {return (controls['grn_id']['value'])}
          else
          return null;
        },
        }
      }*/
    this.grnService.grnData.subscribe(data => {
      //debugger
       //this.datasetDetails=[]
       //this.saveOrUpdate="dhdhd"
      if(data != null){
      this.saved=false
      this.clearData()
     //debugger
     const hotInstance = this.hotRegisterer.getInstance(this.instanceDetails);
     this.mode="EDIT";
        if(data.headerData['arrival_status']=="RECEIVED"||data.headerData['arrival_status']=="PENDING_GRN"){
          this.grnReveived=true;
          this.saved=true;
          for(var i=0;i<this.datasetDetails.length;i++){
            hotInstance.setCellMeta(i, 10, 'readOnly' , 'true')
          }
        }
        if(data.headerData['arrival_status']=="PLANNED"){
          //this.grnReveived=true;
          this.grnSavedAndReceived=true;
          this.grnReveived=false;
        }
      if(data.headerData['arrival_status']=="CONFIRMED"){
        this.saved=true;
        this.grnReveived=true;
        this.confrimedGrn=true;
        for(var i=0;i<this.datasetDetails.length;i++){
          hotInstance.setCellMeta(i, 10, 'readOnly' , 'true')
        }
        }

        this.saveStatus = 'UPDATE'
        this.updateStatus=true
        this.potabs.tabs[1].active = true;
        //this.isbalanceQtyNull(data.detailsData)
        this.datasetDetails=data.detailsData
        //show loading alert befor loading customer order header
        //debugger


          this.grnGroup.setValue({
           'po_no':data.headerData,
           'sup_name':data.headerData['supplier_name'],
           'sup_id':data.headerData['sup_id'],
           'grn_id':data.headerData['grn_id'],
           //'batch_no':data.headerData['batch_no'],
           'invoice_no':data.headerData['inv_number'],
           'sub_store':data.sub_store,
           'note':data.headerData['note'],
           'po_deli_loc':data.headerData['loc_name'],
           'grn_type_code':data.grn_type_code


         })
        //this.stores$=data.sub_store

         this.grnGroup.get('po_no').disable()
         this.grnGroup.get('sup_name').disable()
         this,this.grnGroup.get('po_deli_loc').disable()
         this.grnGroup.get('invoice_no').disable()
         this.saveOrUpdate="Update"
         setTimeout(() => {
           const hotInstance = this.hotRegisterer.getInstance(this.instanceDetails);
           if(data.headerData['arrival_status']=="RECEIVED"||data.headerData['arrival_status']=="PENDING_GRN"){
             for(var i=0;i<this.datasetDetails.length;i++){
               hotInstance.setCellMeta(i, 10, 'readOnly' , 'true')
             }
           }
           if(data.headerData['arrival_status']=="PLANNED"){
             //this.grnReveived=true;
             this.grnSavedAndReceived=true;
             this.grnReveived=false;
           }
         if(data.headerData['arrival_status']=="CONFIRMED"){
           for(var i=0;i<this.datasetDetails.length;i++){
             hotInstance.setCellMeta(i, 10, 'readOnly' , 'true')
           }
           }

            hotInstance.render();
         }, 200)





      }
      else{//clear data if incorrect customer order selected
        /*this.saveStatus = 'SAVE'
        this.orderId = 0
        this.formHeader.reset()*/
      }
    })




    this.grnGroup = this.fb.group({
      grn_type_code: [null, [Validators.required]],
      po_no: [null, [Validators.required]],
      sup_name:[null, [Validators.required]],
      po_deli_loc:[null, [Validators.required,this.isDeliveryLocationCurrentLocation()]],
      sup_id: [null],
      invoice_no: [null, [Validators.required], /*[primaryValidator/*.remote(remoteValidationConfig)]*/],
      //batch_no:[null, [Validators.required]],
      note : [null],
      grn_id: new FormControl(null),
      sub_store: new FormControl(null, [Validators.required]),
    //  grn_lines: this.fb.array([])
    });

    this.filterDataGroup=new FormGroup({
      //

      color:new FormControl(null),
      item_description:new FormControl(null),
      pcd_date:new FormControl(null),
      rm_in_date:new FormControl(null),
      customer_name:new FormControl(null),
      customer_po:new FormControl(null),

    });


    this.rollPlanGroup=this.fb.group({
      //
      i_rec_qty:new FormControl(null , [Validators.required]),
      excess_qty:new FormControl(null , [Validators.required]),
      roll_plan_from:new FormControl(null , [Validators.required,this.rollNumberFromValidation(),PrimaryValidators.isNumber]),
      roll_plan_to:new FormControl(null , [Validators.required,this.rollNumberTOValidation(),PrimaryValidators.isNumber],),
      lot_no:new FormControl(null , [Validators.required]),
      batch_no:new FormControl(null , [Validators.required]),
      bin:new FormControl(null , [Validators.required]),
      width:new FormControl(null , [PrimaryValidators.isNumber]),
      shade:new FormControl(null ),
      comment:new FormControl(null),
      qty:new FormControl(null , [Validators.required,/*this.isQtyInGrnQty()*/,PrimaryValidators.isNumber]),
      is_excess:new FormControl(0 )

    });


    this.trimPackingGroup=this.fb.group({
      i_rec_qty:new FormControl(null , [Validators.required]),
      excess_qty:new FormControl(null , [Validators.required]),
      box_no_from:new FormControl(null , [Validators.required,this.boxNumberFromFromValidation(),PrimaryValidators.isNumber]),
      box_no_to:new FormControl(null , [Validators.required,this.boxNumberToValidation(),PrimaryValidators.isNumber],),
      lot_no:new FormControl(null , [Validators.required]),
      batch_no:new FormControl(null , [Validators.required]),
      bin:new FormControl(null , [Validators.required]),
      shade:new FormControl(null),
      comment:new FormControl(null),
      qty:new FormControl(null , [Validators.required,/*this.isQtyInGrnQtyTrimPacking()*/,PrimaryValidators.isNumber]),
      is_excess:new FormControl(0 )

    });
    this.formValidator = new AppFormValidator(this.rollPlanGroup , {roll_plan_from:{IncorrectRollNumber:"Incorrect Roll Number"},roll_plan_to:{IncorrectRollNumber:"Incorrect Roll Number"},i_rec_qty:{IncorrectRollQty:"Incorrect Roll Qty"}});
    this.formValidatorTrimPacking = new AppFormValidator(this.trimPackingGroup , {box_no_from:{IncorrectBoxNumber:"Incorrect Box Number"},box_no_to:{IncorrectBoxNumber:"Incorrect Box Number"},i_rec_qty:{IncorrectBoxQty:"Incorrect Box Qty"}});

    this.formValidator = new AppFormValidator(this.rollPlanGroup , {});
    this.formValidatorTrimPacking = new AppFormValidator(this.trimPackingGroup , {});
    //this.formValidatorGrn = new AppFormValidator(this.grnGroup , {});
    this.formValidatorGrn = new AppFormValidator(this.grnGroup , {po_deli_loc:{InCorrectDeliveryLoaction:"Incorrect Delivery Location"}});
    this.AppFormValidatorGrn = new AppFormValidator(this.grnGroup , {});
    //this.AppFormValidatorTrimPacking = new AppFormValidator(this.trimPackingGroup , {});
    this.appValidator = new AppValidator(this.formFields,{},this.rollPlanGroup);
    this.rollPlanGroup.valueChanges.subscribe(data => { //validate form when form value changes
        this.appValidator.validate();
    });
    this.appValidatorTrimPacking = new AppValidator(this.formFieldsTrimpacking,{},this.trimPackingGroup);
    this.trimPackingGroup.valueChanges.subscribe(data => { //validate form when form value changes
        this.appValidatorTrimPacking.validate();
    });
    this.appValidatorGrn = new AppValidator(this.formFieldsHeader,{},this.grnGroup);
    this.grnGroup.valueChanges.subscribe(data => { //validate form when form value changes
        this.appValidatorGrn.validate();
    });

    this.loadPoList()
    this.loadSubSores()
    this.loadCustomer()
    this.loadColor()
    this.loadCustomerPo()
    this.loadItems()
    this.authdata = this.auth.getUserData()
    this.initializeOrderLinesTable()
    this.initializeDetailsTable()
    this.initializeRollPlanTable()
    this.loadSubstoreWiseBin()
    this.initializeTrimPackingTable()
    this.initializeGrnConfirmationTable()
    this.loadGrnType()

    this.layoutChangerService.changeHeaderPath([
      'Warehouse Management',
      'Stores',
      'Inward Register'
    ])

  }


  getOutPutVal(selected: string){
    if(selected){
      this.childVal = "Value from child : " + selected;
    }
  }


     isDeliveryLocationCurrentLocation() {

          const validator = (control:FormControl): { [key: string]: any } => {

                if(control != undefined && control != null && control.parent != undefined){
                  //debugger
                  this.current_location
                  //this.delivery_loc_id=25
                  if(this.current_location!=null){
                 if(this.current_location!=this.delivery_loc_id){
                  control.parent.get('po_deli_loc').markAsTouched()
                //  this.grnGroup.get('po_deli_loc').disable()
                 return { 'InCorrectDeliveryLoaction': true };
               }
             }
             }

          };
          return validator;
      };






  saveGrn(){
  //  debugger
    if(this.datasetDetails.length==0){
      AppAlert.showError({text:"No Details to Save"})
      return 0;
    }
    for(var i=0;i<this.datasetDetails.length;i++){
      if(this.datasetDetails[i]['qty']<=0){
       AppAlert.showError({text:"Please Add Vlaues Grater then zero"});
        return 0;
      }
    }
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    this.saved=true
    const hotInstance = this.hotRegisterer.getInstance(this.instanceDetails);
    for(var i=0;i<this.datasetDetails.length;i++){
      hotInstance.setCellMeta(i, 10, 'readOnly' , 'true')
    }

    let formData = this.grnGroup.getRawValue();
    formData['po_id']=formData['po_no']['po_id']
    formData['substore_id']=formData['sub_store']['substore_id']
    var grn_id=formData['grn_id']
    this.arr.push(formData)
    this.arr.push(this.datasetDetails)
  var  saveOrUpdate$=null
  //this.savedStatus=true
    if(grn_id!=null){
      saveOrUpdate$=this.http.put(this.apiUrl + 'stores/grn/'+grn_id,{'header':formData,'dataset':this.datasetDetails})
    }
    else if(grn_id==null){
  saveOrUpdate$ =this.http.post(this.apiUrl + 'stores/grn',{'header':formData,'dataset':this.datasetDetails})
   }
    saveOrUpdate$.subscribe(data => {
    this.processing = false
  //this.http.post(this.apiUrl + 'stores/grn',grn_lines).subscribe(data => {

      console.log()
      if(data['data']['type'] == 'error'){
          setTimeout(() => {
            AppAlert.showError({text:data['data']['message']});
          }, 200)

      }else{

        this.grnGroup.controls['grn_id'].setValue(data['data']['grnId']);
         this.saveOrUpdate="Update"
          //this.datasetDetails=[]
        var responseData=data['data']['detailData']
      //  debugger
       for(var i=0;i<this.datasetDetails.length;i++){
          if(responseData[i]['po_details_id']==this.datasetDetails[i]['id']){
          this.datasetDetails[i]['grn_id']=responseData[i]['grn_id']
          this.datasetDetails[i]['arrival_status']=responseData[i]['arrival_status']
        }
        }
        this.saved=true;
        //debugger
        const hotInstance = this.hotRegisterer.getInstance(this.instanceDetails);
        hotInstance.render();

        setTimeout(() => {
          AppAlert.showSuccess({text: data['data']['message']});
        }, 20)
      }

    })
  }


  receivedGrn(){
    var formGroup=this.grnGroup.getRawValue();
    var grn_id=FormData['grn_id']
    AppAlert.showConfirm({
      'text' : 'Do You Want to Receive Materials?'
    },
    (result) => {
    if (result.value) {
    let $received
    $received=this.http.post(this.apiUrl + 'stores/grn/received_grn',{'grnGroup':formGroup})

    $received.subscribe(data => {
    this.processing = false
  //this.http.post(this.apiUrl + 'stores/grn',grn_lines).subscribe(data => {

      console.log()
      if(data['data']['type'] == 'Error'){
          setTimeout(() => {
            AppAlert.showError({text:data['data']['message']});
          }, 200)




      }else{
        setTimeout(() => {
          AppAlert.showSuccess({text: data['data']['message']});
        }, 20)

        var responseData=data['data']['responceData']
       //debugger
       for(var i=0;i<this.datasetDetails.length;i++){
          if(responseData[i]['po_details_id']==this.datasetDetails[i]['id']){
          this.datasetDetails[i]['grn_id']=responseData[i]['grn_id']
          this.datasetDetails[i]['arrival_status']=responseData[i]['arrival_status']

        }
        }
        this.grnReveived=true;
        this.grnSavedAndReceived=false;
        const hotInstance = this.hotRegisterer.getInstance(this.instanceDetails);
        hotInstance.render();
      }

    })
  }

       })
  }

   addPoLineGroup(){
    return this.fb.group({
      poLineId: [],
      balQty: [],
      qty: []
    })
  }

 rollNumberFromValidation() {
//debugger
       const validator = (control:FormControl): { [key: string]: any } => {

             if(control != undefined && control != null && control.parent != undefined){
              // debugger
              let roll_plan_from: number = parseInt(control.value)
            var roll_plan_to= control.parent.get('roll_plan_from') == null ? null : control.parent.get('roll_plan_to').value;
            roll_plan_to=parseInt(roll_plan_to);

             console.log(roll_plan_to)
            if(roll_plan_from>roll_plan_to){
              return { 'IncorrectRollNumber': true };
             }
            else if(roll_plan_from<1){

               //this.formData.form.controls['col_quality'].setErrors({'required': false});
               return { 'IncorrectRollNumber': true };

            }
            }

       };
       return validator;
   };


   rollNumberTOValidation() {

         const validator = (control:FormControl): { [key: string]: any } => {

               if(control != undefined && control != null && control.parent != undefined){
                // debugger
                let roll_plan_to: number = parseInt(control.value)
              var roll_plan_from= control.parent.get('roll_plan_to') == null ? null : control.parent.get('roll_plan_from').value;
              roll_plan_from=parseInt(roll_plan_from);

               console.log(roll_plan_to)
              if(roll_plan_from>roll_plan_to){
                return { 'IncorrectRollNumber': true };
               }
              else if(roll_plan_to<1){

                 //this.formData.form.controls['col_quality'].setErrors({'required': false});
                 return { 'IncorrectRollNumber': true };

              }
              }

         };
         return validator;
     };
     isQtyInGrnQty(){
       //debugger
       const validator = (control:FormControl): { [key: string]: any } => {

             if(control != undefined && control != null && control.parent != undefined){
            let qty: number = parseFloat(control.value)
            var i_rec_qty= control.parent.get('qty') == null ? null : control.parent.get('i_rec_qty').value;
            var from_No=control.parent.get('qty') == null ? null : control.parent.get('roll_plan_from').value;
            var to_No=control.parent.get('qty') == null ? null : control.parent.get('roll_plan_to').value;
                    i_rec_qty=parseFloat(i_rec_qty)
                    from_No=parseInt(from_No)
                    to_No=parseInt(to_No)

             if((to_No-from_No+1)*qty!=i_rec_qty){

               return { 'IncorrectRollQty': true };

            }
            }

       };
       return validator;





     }



     boxNumberFromFromValidation() {
//debugger
           const validator = (control:FormControl): { [key: string]: any } => {

                 if(control != undefined && control != null && control.parent != undefined){
                  // debugger
                  let box_no_from: number = parseInt(control.value)
                var box_no_to= control.parent.get('box_no_from') == null ? null : control.parent.get('box_no_to').value;
                box_no_to=parseInt(box_no_to);

                 //console.log(roll_plan_to)
                if(box_no_from>box_no_to){
                  return { 'IncorrectBoxNumber': true };
                 }
                else if(box_no_from<1){

                   //this.formData.form.controls['col_quality'].setErrors({'required': false});
                   return { 'IncorrectBoxNumber': true };

                }
                }

           };
           return validator;
       };




          boxNumberToValidation() {

                const validator = (control:FormControl): { [key: string]: any } => {

                      if(control != undefined && control != null && control.parent != undefined){
                       // debugger
                       let box_no_to: number = parseInt(control.value)
                     var box_no_from= control.parent.get('box_no_to') == null ? null : control.parent.get('box_no_from').value;
                     box_no_from=parseInt(box_no_from);

                    //  console.log(roll_plan_to)
                     if(box_no_from>box_no_to){
                       return { 'IncorrectBoxNumber': true };
                      }
                     else if(box_no_to<1){

                        //this.formData.form.controls['col_quality'].setErrors({'required': false});
                        return { 'IncorrectBoxNumber': true };

                     }
                     }

                };
                return validator;
            };



            isQtyInGrnQtyTrimPacking(){
          //debugger
              const validator = (control:FormControl): { [key: string]: any } => {

                    if(control != undefined && control != null && control.parent != undefined){
                    //  debugger
                   let qty: number = parseFloat(control.value)
                   var i_rec_qty= control.parent.get('qty') == null ? null : control.parent.get('i_rec_qty').value;
                   var from_No=control.parent.get('qty') == null ? null : control.parent.get('box_no_from').value;
                   var to_No=control.parent.get('qty') == null ? null : control.parent.get('box_no_to').value;
                           i_rec_qty=parseFloat(i_rec_qty)
                           from_No=parseInt(from_No)
                           to_No=parseInt(to_No)

                    if((to_No-from_No+1)*qty!=i_rec_qty){

                      return { 'IncorrectBoxQty': true };

                   }
                   }

              };
              return validator;





            }
  /*get poLineArray(){
  //  return <FormArray>this.grnGroup.get('grn_lines')
  }
*/
  loadSubSores(){
    this.stores$ = this.http.get(this.apiUrl + 'store/substore?type=getLoaction_wise_substores', ).pipe( map( res => res['data']) )
   // this.subStoreList$ = this.http.get(this.apiUrl + 'store/substore?fields=substore_id,substore_name&loc='+this.authdata.location, ).pipe( map( res => res['data']) )
  }

  loadPoList(){
    //this.poList$ = this.http.get(this.apiUrl + 'merchandising/purchase-order-data?fields=po_id,po_number', ).pipe( map( res => res['data']) )
    this.poList$= this.poNoInput$
    .pipe(
       debounceTime(200),
       distinctUntilChanged(),
       tap(() => this.poLoading = true),
       switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/purchase-order-data?type=auto_for_grn' , {params:{search:term,grn_type:((this.grnGroup.get('grn_type_code').value == null) ? null : this.grnGroup.get('grn_type_code').value.grn_type_code)}})
       .pipe(
           //catchError(() => of([])), // empty list on error
           tap(() => this.poLoading = false)
       ))
    );

  }

  formValidate(){ //validate the form on input blur
    //debugger
    this.appValidator.validate();
  }

  searchDetails(){
      let search$ = null;
      this.dataset=[];
      const hotInstance = this.hotRegisterer.getInstance(this.instance);
      hotInstance.render();
      let formData = this.grnGroup.getRawValue();
      //debugger
      formData['po_id']=formData['po_no']['po_id']
      formData['supplier_id']=formData['sup_id']
      formData['grn_type_code']=formData['grn_type_code']['grn_type_code']
      this.http.get(this.apiUrl + 'merchandising/loadPoLineData?id='+formData.po_id+'&sup_id='+formData.supplier_id+'&grn_type_code='+formData.grn_type_code)
  .pipe( map(res => res['data']) )
   .subscribe(data=>{
     this.grnGroup.disable();
     this.isbalanceQtyNull(data)
      this.dataset=data

      //console.log(this.dataset['length'])
       })
}
/*  showEvent(event){ //show event of the bs model
    this.modelTitle = "GRN Item"
    this.grnSerch.clearModelData()
    this.loadData()
    //this.grnSerch.showModal()
    this.grnSerch.setSelectedPo(this.grnSerch.modelForm.controls['po_no'].value, this.grnGroup.controls['sup_id'].value)
    //this.grnGroup.controls['sup_id'].setValue(data['data'][0].supplier_id);
  }*/
settableNull(){
  this.filterDataGroup.reset()
  this.dataset=[];
  const hotInstance = this.hotRegisterer.getInstance(this.instance);
  hotInstance.render();
}

  showEvent(event){ //show event of the bs model
    //this.formGroup.get('des_code').enable()
    //this.formGroup.reset();
    this.modelTitle = "Inward Register"
    //this.saveStatus = "SAVE"
  }

  showEventGrnConfirm(event){ //show event of the bs model
    //this.grnConfirmationModel.show()
    //this.formGroup.reset();
    this.modelTitle = "Confirm GRN"
    //this.saveStatus = "SAVE"
  }
  //load customer list
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
   loadColor(){

     this.color$ = this.colorInput$
     .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.colorLoading = true),
        switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/colors?type=auto' , {params:{search:term}})
        .pipe(
            //catchError(() => of([])), // empty list on error
            tap(() => this.colorLoading = false)
        ))
     );


   }

   loadGrnType(){

     this.grnTypelist$ = this.grnTypeInput$
     .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.grnTypeLoading = true),
        switchMap(term => this.http.get<any[]>(this.apiUrl + 'stores/grn?type=load_grn_type' , {params:{search:term}})
        .pipe(
            //catchError(() => of([])), // empty list on error
            tap(() => this.grnTypeLoading = false)
        ))
     );


   }

loadCustomerPo(){

  this.customerPo$= this.customerPoInput$
  .pipe(
     debounceTime(200),
     distinctUntilChanged(),
     tap(() => this.customerPoLoading = true),
     switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/customer-order-details?type=auto' , {params:{search:term}})
     .pipe(
         //catchError(() => of([])), // empty list on error
         tap(() => this.customerPoLoading = false)
     ))
  );


}
loadItems(){
  this.item$= this.itemInput$
  .pipe(
     debounceTime(200),
     distinctUntilChanged(),
     tap(() => this.itemLoading = true),
     switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/items?type=auto' , {params:{search:term}})
     .pipe(
         //catchError(() => of([])), // empty list on error
         tap(() => this.itemLoading = false)
     ))
  );

}
isbalanceQtyNull(tableData){
 //debugger
  for(var i=0;i<tableData.length;i++){
    tableData[i]['excess_qty']=0;
    //tableData[i]['checked']=1;
    tableData[i]['original_axcess_qty']=0;
    var t_balance=tableData[i]['req_qty']-tableData[i]['tot_i_rec_qty'];
    tableData[i]['bal_qty']=this.formatDecimalNumber(t_balance,4)
    if(tableData[i]['bal_qty']>0)
    tableData[i]['qty']=tableData[i]['bal_qty'];//add for set qty as the balnace qty on the details dable
    //var b=tableData[i]['maximum_tolarance']
    //var c  = (parseFloat(tableData[i]['bal_qty'])*parseFloat(tableData[i]['maximum_tolarance']))/100;
    //tableData[i]['maximum_tolarance']=c
    tableData[i]['original_bal_qty']=tableData[i]['bal_qty']
    if(tableData[i]['bal_qty']==null){
      tableData[i]['bal_qty']=tableData[i]['req_qty']
      tableData[i]['qty']=tableData[i]['bal_qty'];//add for set qty as the balnace qty on the details dable
      tableData[i]['original_bal_qty']=tableData[i]['bal_qty']
    }
  }
}
filterData(){
  //debugger
    let formData2 = this.grnGroup.getRawValue();

if(formData2['po_no']!=null){
  //console.log(this.filterDataGroup)
  let formData = this.filterDataGroup.getRawValue();
  //console.log(formData)
  if(formData['rm_in_date']!=null)
  formData['rm_in_date']=formData['rm_in_date'].toISOString().split("T")[0]
  if(formData['pcd_date']!=null)
  formData['pcd_date']=formData['pcd_date'].toISOString().split("T")[0]
  //debugger

  formData['po_id']=formData2['po_no']['po_id']
  formData['supplier_id']=formData2['sup_id']
  formData['grn_type_code']=formData2['grn_type_code']['grn_type_id']
  this.http.post(this.apiUrl + 'stores/grn/filterData' ,formData )
  .pipe( map(res => res['data']) )
  .subscribe(data => {
    this.isbalanceQtyNull(data)
    this.dataset=data
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    hotInstance.render();
    //console.log(formData)

});
}
}

  contextMenuDelete(row){
    let selectedRowData = this.dataset[row]
    this.currentDataSetIndex = row
    this.dataset.splice(row,1);
    console.log(this.dataset);
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    hotInstance.render();

  }

  contextMenuMainTableDelete(row){
    let selectedRowData = this.datasetDetails[row]
    this.currentDataSetIndexMaintable = row
    this.datasetDetails.splice(row,1);
  /*  if(this.saveStatus=='UPDATE'){

      this.http.get(this.apiUrl + 'stores/grns/deleteGrnLine?line='+selectedRowData['id'])
      .pipe( map(res => res['data']) )
      .subscribe(data=>{
          AppAlert.showError({text:data.message})
         })
         this.datasetDetails.splice(row,1);
    }
    else {
    this.datasetDetails.splice(row,1);
  }*/
    console.log(this.dataset);
    const hotInstance = this.hotRegisterer.getInstance(this.instanceDetails);
    hotInstance.render();

  }

  initializeOrderLinesTable(){
    var clipboardCache = '';
  //var sheetclip = new sheetclip();
    this.hotOptionsDetails = {
      columns: [

        { type: 'text', title : 'Customer' , data: 'customer_name',className: "htLeft"},
        { type: 'text', title : 'Style' , data: 'style_no',className: "htLeft"},
        { type: 'text', title : 'Item Code' , data: 'master_code',className: "htLeft"},
        { type: 'text', title : 'Item Description' , data: 'master_description',className: "htLeft"},
        { type: 'checkbox', title : 'Inspection Required' , readOnly: false, data : 'inspection_allowed' , checkedTemplate: 1,  uncheckedTemplate: 0 },
        { type: 'text', title : 'Item Color' , data: 'color_name',className: "htLeft"},
        { type: 'text', title : 'Size' , data: 'size_name',className: "htLeft"},
        { type: 'text', title : 'Purchase UOM' , data: 'uom_code',className: "htLeft"},
        { type: 'numeric', title : 'PO Qty' , data: 'req_qty',className: "htRight"},
        { type: 'numeric', title : 'Balance Qty' , data: 'bal_qty' ,className: "htRight"},
        { type: 'numeric', title : 'Received Qty', data: 'qty',className: "htRight",readOnly:false},
        { type: 'numeric', title : 'Maximum Qty with Tolerance', data: 'maximum_tolarance',className: "htRight",readOnly:true},
        { type: 'numeric', title : 'Excess Qty', data: 'excess_qty',className: "htRight",readOnly:true},
        { type: 'text', title : 'GRN Status', data: 'arrival_status',readOnly:true},

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
      // fixedColumnsLeft: 3,
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
      mergeCells:[],
      afterChange:(changes,surce,row,col,value,prop)=>{
        if(surce != null && surce.length > 0){
        const hotInstance = this.hotRegisterer.getInstance(this.instanceDetails);
        //this.saved=false;
        let _row = surce[0][0]
        if(surce[0][1]=='qty'){
        let _qty = (surce[0][3] == '' || isNaN(surce[0][3])) ? 0 : surce[0][3]
        if(this.countDecimals(_qty) > 4){
          _qty = this.formatDecimalNumber(_qty, 4)

        }
        else{
          this.datasetDetails[_row]['qty']=_qty
      }
      this.datasetDetails[_row]['qty']=_qty
      hotInstance.render()
      //hotInstance.setDataAtCell(_row, 10, _qty)
      }
        if(surce!=null&&surce[0][1]=='inspection_allowed'){
        this.checkInspectionStatus(changes,surce,row,col,value,prop)
      }
      //  debugger
        let x=this.datasetDetails;
        var cal_type=null;
        if(this.datasetDetails[_row]['grn_detail_id']==undefined||this.datasetDetails[_row]['grn_detail_id']==null){
          cal_type="SAVE"
        }
        else
        cal_type="EDIT"

        this.setBalanceMainTable(surce,cal_type);

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
                //debugger
                const hotInstance = this.hotRegisterer.getInstance(this.instanceDetails);
                var _line=hotInstance.getSelectedLast()[0]
                var type="_delete" ;
                if(hotInstance.getSelectedLast()[0]==undefined)
                return
                else
                return  this.contextMenuOptions(_line,type) == false // `this` === hot3
              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  this.contextMenuMainTableDelete(start.row)
                }
              }
            },


          'Add Roll Plan Details' : {
                          name : 'Add Roll Plan Details',
                            disabled:(key, selection, clickEvent)=>{
                            //debugger
                            const hotInstance = this.hotRegisterer.getInstance(this.instanceDetails);
                            var _line=hotInstance.getSelectedLast()[0]
                            var type="_rool_plan" ;
                            if(hotInstance.getSelectedLast()[0]==undefined)
                            return
                            else
                            return  this.contextMenuOptions(_line,type) == false // `this` === hot3
                          },
                          callback : (key, selection, clickEvent) => {
                            if(selection.length > 0){
                              let start = selection[0].start;
                              //debugger

                            this.loadRollPlanModel(key, selection, clickEvent);
                          }
                        },


      },
      'Add Trim Packing Details' : {
                      name : 'Add Trim Packing Details',
                      disabled:(key, selection, clickEvent)=> {
                        //debugger
                        const hotInstance = this.hotRegisterer.getInstance(this.instanceDetails);
                        var _line=hotInstance.getSelectedLast()[0]
                        var type="_trim_packing" ;
                        if(hotInstance.getSelectedLast()[0]==undefined)
                        return
                        else
                        return  this.contextMenuOptions(_line,type) == false // `this` === hot3
                      },
                      callback : (key, selection, clickEvent) => {
                        if(selection.length > 0){
                          let start = selection[0].start;
                          //debugger

                        this.loadTrimPackingModel(key, selection, clickEvent);
                      }
                    },


  },


    }
  }
}
}
contextMenuOptions(line,type){
  //debugger
  if(type=="_rool_plan"){
    if(this.datasetDetails[line]['category_id']!="FAB"||this.datasetDetails[line]['arrival_status']=="CONFIRMED"||this.datasetDetails[line]['arrival_status']=="RECEIVED")
      return false
  }
  else if(type=="_trim_packing"){
    if(this.datasetDetails[line]['category_id']=="FAB"||this.datasetDetails[line]['arrival_status']=="CONFIRMED"||this.datasetDetails[line]['arrival_status']=="RECEIVED")
      return false
  }
  else if(type=="_delete"){
    this.datasetDetails[line];
    if(this.datasetDetails[line]['arrival_status']=="CONFIRMED"||this.datasetDetails[line]['arrival_status']=="RECEIVED"||this.datasetDetails[line]['arrival_status']=="PLANNED")
      return false
  }
    //this.datasetDetails[_line];
}

checkInspectionStatus(changes,surce,row,col,value,prop){
  //debugger
  var row=surce[0][0]
  if(this.datasetDetails[row]['grn_detail_id']!=undefined&&this.datasetDetails[row]['grn_detail_id']!=null){
    var pre_value=surce[0][2]
      if(pre_value==undefined){
        pre_value=0
      }
      this.datasetDetails[row]['inspection_allowed']=pre_value;

       AppAlert.showError({text:"Can't Change the Inspection Status"})
       //debugger
      const hotInstance = this.hotRegisterer.getInstance(this.instanceDetails);
       hotInstance.render();

  }
  //console.log(this.datasetDetails[row]['grn_detail_id'])
}

showGrn(){
  this.rollPlanModel.show()
}

loadSubstoreWiseBin(){
var formDataHeader=this.grnGroup.getRawValue()
//debugger

if(formDataHeader['sub_store']!=null){
var substore_id=formDataHeader['sub_store']['substore_id']
this.$_store_id=formDataHeader['sub_store']['store_id']
this.$_sub_store_id=substore_id
}
  this.bin$= this.binInput$
  .pipe(
     debounceTime(200),
     distinctUntilChanged(),
     tap(() => this.binLoading = true),
     switchMap(term => this.http.get<any[]>(this.apiUrl + 'store/storebin?type=autoStoreWiseBin&substore_id='+ substore_id , {params:{search:term}})
     .pipe(
         //catchError(() => of([])), // empty list on error
         tap(() => this.binLoading = false)
     ))
  );


}

loadRollPlanModel(key, selection, clickEvent){
//debugger
this.loadSubstoreWiseBin()
var row=selection[0]['end']['row']
var formDataHeader=this.grnGroup.getRawValue()
var invoice_no=formDataHeader['invoice_no']
    invoice_no=encodeURI(invoice_no)
//var batch_no=formDataHeader['batch_no']
var grn_id=formDataHeader['grn_id']
var substore_id=formDataHeader['sub_store']['substore_id']
var po_id=this.datasetDetails[row]['po_id']
var po_line_id=this.datasetDetails[row]['id']
var qty=this.datasetDetails[row]['qty']
var category_id=this.datasetDetails[row]['category_id']
var width=this.datasetDetails[row]['width']
var excess_qty=this.datasetDetails[row]['excess_qty'];
//excess_qty=5;
if(grn_id==null){
  AppAlert.showError({text:"Please Save Grn Details"})
  return
}
//var url=this.apiUrl + 'stores/isreadyForRollPlan?invoice_no='+invoice_no+'&po_id='+po_id+'&po_line_id='+po_line_id+'&qty='+qty+'&category_id='+category_id+'&substore_id='+substore_id+'&grn_id='+grn_id
//debugger

this.http.get(this.apiUrl + 'stores/isreadyForRollPlan?invoice_no='+invoice_no+'&po_id='+po_id+'&po_line_id='+po_line_id+'&qty='+qty+'&category_id='+category_id+'&substore_id='+substore_id+'&grn_id='+grn_id)
.pipe( map(res => res['data']) )
.subscribe(data=>{

if(data.status=='1'){
  //debugger
  this.rollPlanModel.show()
  this.savedGrnModel=data.dataModel
  console.log(data.dataModel)
  this.rollPlanGroup.patchValue({
   'i_rec_qty':qty,
   'width':width,
   'excess_qty':excess_qty
      })
      this.rollPlanGroup.get('width').disable()
   //this.rollPlanGroup.get('batch_no').disable()
  // =data.substoreWiseBin

}
else if(data.status=='0'){
  AppAlert.showError({text:data.message})
}
 })




}




loadTrimPackingModel(key, selection, clickEvent){
//debugger
this.loadSubstoreWiseBin()
var row=selection[0]['end']['row']
var formDataHeader=this.grnGroup.getRawValue()
var invoice_no=formDataHeader['invoice_no']
//var batch_no=formDataHeader['batch_no']
var grn_id=formDataHeader['grn_id']
var substore_id=formDataHeader['sub_store']['substore_id']
var po_id=this.datasetDetails[row]['po_id']
var po_line_id=this.datasetDetails[row]['id']
var qty=this.datasetDetails[row]['qty']
var category_id=this.datasetDetails[row]['category_id']
var excess_qty=this.datasetDetails[row]['excess_qty'];
//excess_qty=5;
if(grn_id==null){
  AppAlert.showError({text:"Please Save Grn Details"})
  return
}
this.http.get(this.apiUrl + 'stores/isreadyForTrimPackingDetails?invoice_no='+invoice_no+'&po_id='+po_id+'&po_line_id='+po_line_id+'&qty='+qty+'&category_id='+category_id+'&substore_id='+substore_id+'&grn_id='+grn_id)
.pipe( map(res => res['data']) )
.subscribe(data=>{

if(data.status=='1'){
  this.trimPackingModel.show()
  this.savedGrnModel=data.dataModel
  console.log(data.dataModel)
  this.trimPackingGroup.patchValue({
   //'batch_no' : batch_no,
   'i_rec_qty':qty,
   'excess_qty':excess_qty
      })
   //this.trimPackingGroup.get('batch_no').disable()
  // =data.substoreWiseBin

}
else if(data.status=='0'){
  AppAlert.showError({text:data.message})
}
 })




}

setRollPlanData(){
  //debugger
  let formData = this.rollPlanGroup.getRawValue();
  let formDataHeader=this.grnGroup.getRawValue();
  this.$_store_id=formDataHeader['sub_store']['store_id']
  this.$_sub_store_id=formDataHeader['sub_store']['substore_id']

  var rollPlanData=[]
  var k=0;
  console.log(formData)
  formData['received_qty']=formData['qty']
  formData['store_bin_name']=formData['bin']['store_bin_name']
  var dataLength=parseFloat(formData['roll_plan_to'])-parseFloat(formData['roll_plan_from'])
  //debugger
  for(var i=0;i<dataLength+1;i++){
    let data = JSON.parse(JSON.stringify(formData));
    for(var x=0;x<this.datasetRollPlan.length;x++){
        if(this.datasetRollPlan[x]['batch_no']==data['batch_no']){
          if(this.datasetRollPlan[x]['roll_no']==i+parseFloat(formData['roll_plan_from'])){
          AppAlert.showError({text:"Roll No duplicate for same Batch No"})
          return 0;
          }
        }
    }
  //  debugger
    data['batch_no']=data['batch_no'].toUpperCase()
    data['lot_no']=data['lot_no'].toUpperCase()
    if(data['shade']!=null)
    data['shade']=data['shade'].toUpperCase()
    if(data['comment']!=null)
    data['comment']=data['comment'].toUpperCase()
    this.datasetRollPlan.push(data)

         this.datasetRollPlan[this.datasetRollPlan.length-1]['roll_no']=i+parseFloat(formData['roll_plan_from'])

  }
  formData['roll_plan_from']=0;
  const hotInstance = this.hotRegisterer.getInstance(this.instanceRollPlan);
  hotInstance.render();

}
setTrimPackingData(){
//  debugger
  //
  let formData = this.trimPackingGroup.getRawValue();
  let formDataHeader=this.grnGroup.getRawValue();
  this.$_store_id=formDataHeader['sub_store']['store_id']
  this.$_sub_store_id=formDataHeader['sub_store']['substore_id']
  var rollPlanData=[]
  var k=0;
  //console.log(formData)
  formData['received_qty']=formData['qty']
  formData['store_bin_name']=formData['bin']['store_bin_name']
  var dataLength=parseFloat(formData['box_no_to'])-parseFloat(formData['box_no_from'])
  //debugger
  for(var i=0;i<dataLength+1;i++){
    let data = JSON.parse(JSON.stringify(formData));
    for(var x=0;x<this.datasetTrimPacking.length;x++){
        if(this.datasetTrimPacking[x]['batch_no']==data['batch_no']){
          if(this.datasetTrimPacking[x]['box_no']==i+parseFloat(formData['box_no_from'])){
          AppAlert.showError({text:"Box No duplicate for same Batch No"})
          return 0;
          }
        }
    }
    //debugger
    this.datasetTrimPacking.push(data)

         this.datasetTrimPacking[this.datasetTrimPacking.length-1]['box_no']=i+parseFloat(formData['box_no_from'])
  }



  formData['box_no_from']=0;
  const hotInstance = this.hotRegisterer.getInstance(this.instanceTrimPacking);
  hotInstance.render();
 //var a=false
}

resetRollPlanPopUp(){
this.datasetRollPlan=[]
this.rollPlanGroup.reset()
const hotInstance = this.hotRegisterer.getInstance(this.instanceRollPlan);
hotInstance.render();

}
resetTrimpackingPopUp(){
this.datasetTrimPacking=[]
this.trimPackingGroup.reset()
const hotInstance = this.hotRegisterer.getInstance(this.instanceTrimPacking);
hotInstance.render();

}
clearData(){
  this.grnGroup.enable()
  this.grnGroup.reset()
  this.datasetDetails=[]
  this.saved=false
  this.grnReveived=false
  this.confrimedGrn=false
  this.grnSavedAndReceived=false
  this.current_location=null;
  this.mode="SAVE";
  const hotInstance = this.hotRegisterer.getInstance(this.instanceDetails);
  hotInstance.render();
}

clearPoList(e){
 //debugger
  this.selectedPoNo=undefined
  this.setupfilterfrom()
  this.loadPoList()
}
  initializeDetailsTable(){
    var clipboardCache = '';
  //var sheetclip = new sheetclip();
    this.hotOptions = {
      columns: [
        { type: 'checkbox', title : 'Action' , readOnly: false, data : 'checked' , checkedTemplate: 1,  uncheckedTemplate: 0 },
        { type: 'text', title : 'Revised RM In Date' , data: 'pcd',className: "htLeft"},
        { type: 'text', title : 'RM In Date' , data: 'rm_in_date',className: "htLeft"},
        { type: 'text', title : 'Customer' , data: 'customer_name',className: "htLeft"},
        { type: 'text', title : 'Customer PO' , data: 'po_no',className: "htLeft"},
        { type: 'text', title : 'Style' , data: 'style_no',className: "htLeft"},
        { type: 'text', title : 'Item Code' , data: 'master_code',className: "htLeft"},
        { type: 'text', title : 'Item Description' , data: 'master_description',className: "htLeft"},
        { type: 'text', title : 'Item Color' , data: 'color_name',className: "htLeft"},
        { type: 'text', title : 'Size' , data: 'size_name',className: "htLeft"},
        { type: 'text', title : 'Purchase UOM' , data: 'uom_code',className: "htLeft"},
        { type: 'numeric', title : 'PO Qty' , data: 'req_qty',className: "htRight"},
        { type: 'numeric', title : 'Balance Qty' , data: 'bal_qty',className: "htRight"},
        { type: 'numeric', title : 'Maximum Qty with Tolerance', data: 'maximum_tolarance',readOnly:true,className: "htRight"},


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
      // fixedColumnsLeft: 3,
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
      mergeCells:[],
      afterChange:(changes,surce,row,col,value,prop)=>{

        let x=this.dataset;
        this.setBalance(surce);
          },
        afterCreateRow:(index,amount,source)=>{
          let x=this.dataset;

      },
        afterPaste:(changes)=>{

            const hotInstance = this.hotRegisterer.getInstance(this.instance);
              hotInstance.render();
              console.log('im here.....')
              console.log(this.dataset)
        },

      cells : function(row, col, prop , value){ //table cell render event. works for every cell in the table
        var cellProperties = {};
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

             'Add Line':{
              name:'Add Line',
              disabled:  (key, selection, clickEvent)=>{
                // Disable option when first row was clicked
                const hotInstance = this.hotRegisterer.getInstance(this.instance);
                let sel_row = hotInstance.getSelectedLast()[0];
                if(this.dataset.length == 0){

                    return hotInstance.getSelectedLast()[0] === sel_row

                }
              },
              callback:(key, selection, clickEvent)=> {
               this.addLine(key, selection, clickEvent)


              }

            },

          }
      }
    }
  }


  initializeRollPlanTable(){
    var clipboardCache = '';
  //var sheetclip = new sheetclip();
    this.hotOptionsRollPlan = {
      columns: [
        { type: 'checkbox', title : 'Is Excess' , readOnly: false, data : 'is_excess' , checkedTemplate: 1,  uncheckedTemplate: 0 },
        { type: 'text', title : 'LOT No' , data: 'lot_no',className: "htleft",readOnly:true},
        { type: 'text', title : 'Batch No' , data: 'batch_no',className: "htleft",readOnly:false},
        { type: 'numeric', title : 'Roll No' , data: 'roll_no',className: "htleft",readOnly:false},
      /*  { type: 'text', title : 'Actual Qty' , data: 'qty',readOnly:false},*/
        { type: 'numeric', title : 'Received Qty' , data: 'received_qty',className: "htRight",readOnly:false},
        {
          title : 'Bin',
          type: 'autocomplete',
          source:(query, process)=> {
            var url=$('#url').val();
            $.ajax({
                url:this.apiUrl+'stores/material-transfer?type=getBinsById',
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
        { type: 'numeric', title : 'Width' , data: 'width',className: "htRight",readOnly:false},
        { type: 'text', title : 'Shade' , data: 'shade',className: "htleft",readOnly:false},
        { type: 'text', title : 'Comment' , data: 'comment',className: "htleft",readOnly:false},





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
      // fixedColumnsLeft: 3,
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
      mergeCells:[],
      afterChange:(changes,surce,row,col,value,prop)=>{
        if(surce != null && surce.length > 0){
        const hotInstance = this.hotRegisterer.getInstance(this.instanceRollPlan);
        let x=this.dataset;
        let _row = surce[0][0]
        let _pre_value=surce[0][2]
        if(surce[0][1]=='roll_no'){
          //debugger
        let _roll_no = (surce[0][3] == '' || isNaN(surce[0][3])) ? _pre_value : surce[0][3]
        _roll_no=this.isDuplicatedRollNum(_pre_value,_roll_no,_row);

        this.datasetRollPlan[_row]['roll_no']=_roll_no
          hotInstance.render()
        }
        if(surce[0][1]=='received_qty'){
          let _received_qty=    (surce[0][3] == '' || isNaN(surce[0][3])) ? 0 : surce[0][3]
          if(this.countDecimals(_received_qty) > 4){
            _received_qty = this.formatDecimalNumber(_received_qty, 4)
            this.datasetRollPlan[_row]['received_qty']=_received_qty

          }
          else{
            this.datasetRollPlan[_row]['received_qty']=_received_qty
        }
          hotInstance.render()
        }
        if(surce[0][1]=='batch_no'){
          if(this.datasetRollPlan[_row]['batch_no']==''||this.datasetRollPlan[_row]['batch_no']==null){
            AppAlert.showError({text:"Please Add a valid Batch No"})
            this.datasetRollPlan[_row]['batch_no']=_pre_value
            hotInstance.render()
          }
        }

       }

          },
        afterCreateRow:(index,amount,source)=>{
          //console.log(index);

          let x=this.dataset;




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

    }
  }


isDuplicatedRollNum(_pre_value,_roll_no,_row){
  //debugger
  for(var i=0;i<this.datasetRollPlan.length;i++){
    if(i!=_row && this.datasetRollPlan[i]['roll_no']==_roll_no){
      AppAlert.showError({text:"Roll No Already Exists"})
      return _pre_value;
    }

  }
  return _roll_no;

}
isDuplicatedBoxNum(_pre_value,_box_no,_row){
  //debugger
  for(var i=0;i<this.datasetTrimPacking.length;i++){
    if(i!=_row && this.datasetTrimPacking[i]['box_no']==_box_no){
      AppAlert.showError({text:"Box No Already Exists"})
      return _pre_value;
    }

  }
  return _box_no;

}

    initializeTrimPackingTable(){
      var clipboardCache = '';
    //var sheetclip = new sheetclip();
      this.hotOptionsTrimPacking = {
        columns: [
          { type: 'checkbox', title : 'Is Excess' , readOnly: false, data : 'is_excess' , checkedTemplate: 1,  uncheckedTemplate: 0 },
          { type: 'text', title : 'LOT No' , data: 'lot_no',className: "htleft",readOnly:true},
          { type: 'text', title : 'Batch No' , data: 'batch_no',className: "htleft",readOnly:false},
          { type: 'text', title : 'Box No' , data: 'box_no',className: "htRight",readOnly:false},
        /*  { type: 'text', title : 'Actual Qty' , data: 'qty',readOnly:false},*/
          { type: 'numeric', title : 'Received Qty' , data: 'received_qty',className: "htRight",readOnly:false},

          {
            title : 'Bin',
            type: 'autocomplete',
            source:(query, process)=> {
              var url=$('#url').val();
              $.ajax({
                  url:this.apiUrl+'stores/material-transfer?type=getBinsById',
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


        //  { type: 'text', title : 'Width' , data: 'width',readOnly:false},
          { type: 'text', title : 'Shade' , data: 'shade',className: "htleft",readOnly:false},
          { type: 'text', title : 'Comment' , data: 'comment',className: "htleft",readOnly:false},





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
        // fixedColumnsLeft: 3,
        /*columnSorting: true,*/
        className: 'htCenter htMiddle',
        readOnly: true,
        mergeCells:[],
        afterChange:(changes,surce,row,col,value,prop)=>{
          if(surce != null && surce.length > 0){
          const hotInstance = this.hotRegisterer.getInstance(this.instanceTrimPacking);
          let x=this.dataset;
          let _row = surce[0][0]
          let _pre_value=surce[0][2]
          if(surce[0][1]=='box_no'){
            //debugger
          let _box_no = (surce[0][3] == '' || isNaN(surce[0][3])) ? _pre_value : surce[0][3]
          _box_no=this.isDuplicatedBoxNum(_pre_value,_box_no,_row);

          this.datasetTrimPacking[_row]['box_no']=_box_no
            hotInstance.render()
          }
          if(surce[0][1]=='received_qty'){
            //debugger
            let _received_qty=    (surce[0][3] == '' || isNaN(surce[0][3])) ? 0 : surce[0][3]
            if(this.countDecimals(_received_qty) > 4){
              _received_qty = this.formatDecimalNumber(_received_qty, 4)
              this.datasetTrimPacking[_row]['received_qty']=_received_qty

            }
            else{
              this.datasetTrimPacking[_row]['received_qty']=_received_qty
          }
            hotInstance.render()
          }
          if(surce[0][1]=='batch_no'){
            if(this.datasetTrimPacking[_row]['batch_no']==''||this.datasetTrimPacking[_row]['batch_no']==null){
              AppAlert.showError({text:"Please Add a valid Batch No"})
              this.datasetTrimPacking[_row]['batch_no']=_pre_value
              hotInstance.render()
            }
          }

         }

            },
          afterCreateRow:(index,amount,source)=>{
            //console.log(index);

            let x=this.dataset;




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
      /*  contextMenu : {
            callback: function (key, selection, clickEvent) {
              // Common callback for all options
            },
            items : {

            }
        }
        */
      }
    }
  findId(id){
      for(var i=0;i<this.datasetDetails.length;i++){
        if(this.datasetDetails[i]['id']==id)
        return false
      }
      return true
  }

  addLine(key, selection, clickEvent){
    //debugger
  if(selection.length > 0){//
  var _temArr=[];
    var addAll=0
  var row =selection[0]['end']['row']
  console.log(this.dataset[row])
  var _dumydataset=JSON.parse(JSON.stringify(this.dataset))

  for(var i=0;i<this.dataset.length;i++){
    if(this.dataset[i]['checked']==1){
      addAll=1
      break;
    }
  }
  if(addAll==1){
   var  falid_line_c=0
    for(var j=0;j<this.dataset.length;j++){
    if(this.dataset[j]['checked']==1){
      var islineAddable=true;
        for(var i=0;i<this.datasetDetails.length;i++){
          if(this.datasetDetails[i]['id']==this.dataset[j]['id']){
          falid_line_c++
          islineAddable=false
          this.dataset[j]['checked']=0;
          break
          }

        }
        if(islineAddable==true){
          if(this.dataset[j]['bal_qty']>0){
          this.dataset[j]['bal_qty']=0
        }
          this.dataset[j]['inspection_allowed']=1;
          this.dataset[j]['_removeable_row']=j;
          this.dataset[j]['checked']=0;
          _temArr.push(this.dataset[j])
        }

     }
    }
    for(var i=0;i<_temArr.length;i++){
    this.datasetDetails.push(_temArr[i])
      for(var j=0;j<this.dataset.length;j++){
       this.dataset[j]['checked']=0;
      if(_temArr[i]['id']==this.dataset[j]['id']){
        this.dataset.splice(j,1)
      }
    }
    }
    if(falid_line_c>0){
      AppAlert.showError({text:falid_line_c+" Lines Already Exsist"})
    }
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    hotInstance.render();
  }

  if(addAll==0){

  //debugger
  for(var i=0;i<this.datasetDetails.length;i++){

    if(this.datasetDetails[i]['id']==this.dataset[row]['id']){
    AppAlert.showError({text:"Line Already Exists"})

    return 0;
  }
  }
  if(this.dataset[row]['bal_qty']>0){
  this.dataset[row]['bal_qty']=0
}
  this.dataset[row]['inspection_allowed']=1;
  this.datasetDetails.push(this.dataset[row])

  if(selection.length > 0){
    let start = selection[0].start;
    this.contextMenuDelete(start.row)
  }

  }

  const hotInstance = this.hotRegisterer.getInstance(this.instanceDetails);
  hotInstance.render();
  addAll=0
}
  }


  initializeGrnConfirmationTable(){
    var clipboardCache = '';
  //var sheetclip = new sheetclip();
    this.hotOptionsGrnConfirmDetails = {
      columns: [
        { type: 'checkbox', title : 'Confirm Line' , readOnly: false, data : 'confirm_status' , checkedTemplate: 1,  uncheckedTemplate: 0 },
        { type: 'text', title : 'Item Code',className: "htleft" , data: 'master_code'},
        { type: 'text', title : 'Inspection Status' ,className: "htleft", data: 'inspection_status'},
        { type: 'text', title : 'Batch No' ,className: "htleft", data: 'batch_no'},
        { type: 'numeric', title : 'Qty' ,className: "htRight", data: 'batch_wise_actual_qty'},
        { type: 'numeric', title : 'Batch Wise Excess Qty',className: "htRight" ,readOnly: true, data: 'total_actual_excess_qty'},


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
      // fixedColumnsLeft: 3,
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
      mergeCells:[],
      afterChange:(changes,surce,row,col,value,prop)=>{

        if(surce != null && surce.length > 0){
        const hotInstance = this.hotRegisterer.getInstance(this.instanceGrnConfirm);
        //debugger
        let _row = surce[0][0]
        if(surce[0][1]=='confirm_status'){
          this.checkConfrimButtonStatus()
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



    }
  }
}
}
searchBatchDetails(){
//debugger
  let search$ = null;
  this.datasetGrnConfirm=[];
  const hotInstance = this.hotRegisterer.getInstance(this.instanceGrnConfirm);
  hotInstance.render();
  let formData = this.grnGroup.getRawValue();
  formData['po_id']=formData['po_no']['po_id']
  formData['supplier_id']=formData['sup_id']
  this.http.get(this.apiUrl + 'stores/grn?type=load_batch_details&grn_id='+formData.grn_id)
.pipe( map(res => res['data']) )
.subscribe(data=>{
 if(data.length==0){
   this.dataNullforconfirm=true;
 }
 else {
   this.dataNullforconfirm=false;
 }
  this.datasetGrnConfirm=data

  console.log(this.dataset)
   })



}
checkConfrimButtonStatus(){
  //debugger
  var c=0;
  for(var i=0;i<this.datasetGrnConfirm.length;i++){
    if(this.datasetGrnConfirm[i]['confirm_status']==1)
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

saveConfirmedData(){
  //debugger
  this.processing = true
  AppAlert.showMessage('Processing...','Please wait while Confirm details')


  this.http.post(this.apiUrl + 'stores/grn/confirmGrn' ,{"data":this.datasetGrnConfirm} )
  .pipe( map(res => res['data']) )
  .subscribe(data => {
    if(data.status==1){
      AppAlert.showSuccess({text:data.message})
      this.datasetGrnConfirm=[];
      this.grnConfirmationModel.hide()
      this.clearData()
      this.processing = false
    }
});


}

resetGrnConfirmationpopUp(){
  this.datasetGrnConfirm=[];
  this.grnConfirmationModel.hide()
}

setBalance(surce){
  if(surce!=null&&surce["0"]["1"]=='qty'){

  console.log(surce)
  var row=surce["0"]["0"]
  var value=surce["0"]["3"]
  if(this.dataset[row]['req_qty']<value){
    AppAlert.showError({text:"Exceed Limit "});
    this.dataset[row]['qty']=null
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    hotInstance.render();
  }
  else {
    var oldValue=this.dataset[row]['req_qty']
  this.dataset[row]['bal_qty']=oldValue-value;
  const hotInstance = this.hotRegisterer.getInstance(this.instance);
  hotInstance.render();


}

}

}

setBalanceMainTable(surce,cal_type){
 debugger
  if(surce!=null&&surce["0"]["1"]=='qty'){
  var row=surce["0"]["0"]
  var value=this.datasetDetails[row]['qty']
  if(cal_type=="EDIT"){
  var pre_qty=parseFloat(this.datasetDetails[row]['pre_qty'])
  if(pre_qty==undefined||isNaN(pre_qty)==true){
    pre_qty=0;
  }
  var oldValue=this.datasetDetails[row]['original_bal_qty']
  var tot_i_rec_qty=parseFloat(this.datasetDetails[row]['tot_i_rec_qty']);
  var maximum_tolarance=parseFloat(this.datasetDetails[row]['maximum_tolarance']);
  //if(oldValue<)
  var bal_qty=this.datasetDetails[row]['req_qty']-(tot_i_rec_qty-pre_qty+value);
  if(this.countDecimals(bal_qty) > 4){
    bal_qty = this.formatDecimalNumber(bal_qty, 4)
  }
  this.datasetDetails[row]['bal_qty']=bal_qty;

if(maximum_tolarance==this.datasetDetails[row]['req_qty']){
    if(this.datasetDetails[row]['bal_qty']<0){
      if(this.datasetDetails[row]['pre_excess_qty']==0){
    this.datasetDetails[row]['excess_qty']=-1*(this.datasetDetails[row]['bal_qty'])
  }
  else if(this.datasetDetails[row]['pre_excess_qty']>0){
      this.datasetDetails[row]['excess_qty']=value
    }
}
else{
    this.datasetDetails[row]['excess_qty']=0
}
}
else if(maximum_tolarance>this.datasetDetails[row]['req_qty']){

if(value+tot_i_rec_qty-pre_qty>maximum_tolarance){
//  if(this.datasetDetails[row]['pre_excess_qty']==0){
  this.datasetDetails[row]['excess_qty']=(tot_i_rec_qty-pre_qty+value)-maximum_tolarance
//}
  // else if(this.datasetDetails[row]['pre_excess_qty']>0){
  //     this.datasetDetails[row]['excess_qty']=value+tot_i_rec_qty-pre_qty-maximum_tolarance
  //   }
}
else{
    this.datasetDetails[row]['excess_qty']=0
}
}
}
else if(cal_type=="SAVE"){
  var pre_qty=parseFloat(this.datasetDetails[row]['pre_qty'])
  if(pre_qty==undefined||isNaN(pre_qty)==true){
    pre_qty=0;
  }
  var oldValue=this.datasetDetails[row]['original_bal_qty']
  var tot_i_rec_qty=parseFloat(this.datasetDetails[row]['tot_i_rec_qty']);
  var maximum_tolarance=parseFloat(this.datasetDetails[row]['maximum_tolarance']);
  //if(oldValue<)
  var bal_qty=this.datasetDetails[row]['req_qty']-(tot_i_rec_qty-pre_qty+value);
  if(this.countDecimals(bal_qty) > 4){
    bal_qty = this.formatDecimalNumber(bal_qty, 4)
  }
  this.datasetDetails[row]['bal_qty']=bal_qty;

if(maximum_tolarance==this.datasetDetails[row]['req_qty']){
    if(this.datasetDetails[row]['bal_qty']<0){

    this.datasetDetails[row]['excess_qty']=-1*(this.datasetDetails[row]['bal_qty'])
      this.datasetDetails[row]['excess_qty']=value

}
else{
    this.datasetDetails[row]['excess_qty']=0
}
}
else if(maximum_tolarance>this.datasetDetails[row]['req_qty']){

if(value+tot_i_rec_qty>maximum_tolarance){

  this.datasetDetails[row]['excess_qty']=(tot_i_rec_qty-pre_qty+value)-maximum_tolarance

      this.datasetDetails[row]['excess_qty']=value

}
else{
    this.datasetDetails[row]['excess_qty']=0
}
}

}
const hotInstance = this.hotRegisterer.getInstance(this.instanceDetails);
hotInstance.render();
  //this.dataset[row]['']
  //if()
}

}


clearList(e){
//debugger
this.selectedPoNo=null;
this.grnGroup.controls['sup_name'].setValue(null);
this.grnGroup.controls['sup_id'].setValue(null);
this.grnGroup.controls['po_deli_loc'].setValue(null);
this.grnGroup.get('po_no').enable()
this.grnGroup.get('sup_name').enable()
this.grnGroup.get('po_deli_loc').enable()

}

  loadPoInfo(e){
//debugger
  let formData = this.grnGroup.getRawValue();
//this.grnSerch.modelForm.controls['po_no'].setValue(e.po_id);
 var po_id=formData['po_no']['po_id']
 var grn_type=formData['grn_type_code']['grn_type_code']
  this.http.get(this.apiUrl + 'merchandising/purchase-order-data?status=1&fields=details_id,po_no&type=get-invoice-and-supplier&id='+po_id+'&grn_type='+grn_type,).subscribe(data => {
//debugger
    this.current_location=data['current_location'];
    this.delivery_loc_id=data['data'][0].loc_id;
    this.grnGroup.controls['sup_name'].setValue(data['data'][0].supplier_name);
    this.grnGroup.controls['sup_id'].setValue(data['data'][0].supplier_id);
    this.grnGroup.controls['po_deli_loc'].setValue(data['data'][0].loc_name);
    //this.grnSerch.modelForm.controls['sup_id'].setValue(data['data'][0].supplier_id);
    this.grnGroup.get('sup_name').disable()
    //

    })

  }
  filterStoresAgainstPo($event){
    let formData = this.grnGroup.getRawValue();
    var po_id=formData['po_no']['po_id'];

    this.stores$ = this.http.get(this.apiUrl + 'stores/grn?type=filter-stores-aginst-po&po_id='+po_id, ).pipe( map( res => res['data']) )
  }

  loadData(){
    //debugger
    this.grnSerch.loadModal(this.grnGroup.controls['po_no'].value.po_id)
    //this.loadDataSavedLines()
  }

/*  closeModal(){
    this.grnModel.hide()
    this.clearModelData()
  }

  /*clearModelData(){
    const control = <FormArray>this.grnGroup.controls['grn_lines'];
    for(let i = control.length-1; i >= 0; i--) {
      control.removeAt(i)
    }
  }*/


  onSelect(data: TabDirective): void {

      switch(data.heading){
      case 'Inward Register List' :
        //this.component_name="Parent Company"
        this.childGrnList.reloadTable()
        this.updateStatus=false
        this.clearData()
        break;

        case 'Inward Register Form' :
          //this.component_name="Parent Company

          this.grnGroup.reset()
          this.grnGroup.enable()
          this.datasetDetails=[]
          const hotInstance = this.hotRegisterer.getInstance(this.instanceDetails);
          hotInstance.render();

          break;

    }


  }
  rollPlanshowEvent($event){
    //debugger
this.rollPlanModelTitle="Roll Plan Details"

  }

  trimPackingShowEvent($event){
    //debugger
this.rollPlanModelTitle="Roll Plan Details"

  }
  saveRollPlanData(){
  //debugger
    var rollData=this.rollPlanGroup.getRawValue()
    var total_with_out_excess=0;
    var total_excess_qty=0
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let formData = this.grnGroup.getRawValue();
    for(var i=0;i<this.datasetRollPlan.length;i++){
        if(parseFloat(this.datasetRollPlan[i]['is_excess'])==0||this.datasetRollPlan[i]['is_excess']==null){
        total_with_out_excess=parseFloat(this.datasetRollPlan[i]['received_qty'])+total_with_out_excess
        }
        if(parseFloat(this.datasetRollPlan[i]['is_excess'])==1){
        total_excess_qty=parseFloat(this.datasetRollPlan[i]['received_qty'])+total_excess_qty
        }
          }
          //debugger
          if(total_with_out_excess!=parseFloat(rollData['i_rec_qty'])-parseFloat(rollData['excess_qty'])){
            AppAlert.showError({text:"Qty is Not within the GRN Qty"})
            this.processing = false
            return
          }

          if(total_excess_qty!=parseFloat(rollData['excess_qty'])){
            AppAlert.showError({text:"Add Roll Details for Excess Qty"})
            this.processing = false
            return
          }

    //var invoce_no=formGroup['invoice_no']

    //console.log(this.datasetRollPlan)
  let saveOrUpdate$=null
  saveOrUpdate$ = this.http.post(this.apiUrl + 'store/roll', {'dataset':this.datasetRollPlan,'invoiceNo':formData['invoice_no'],'grn_detail_id':this.savedGrnModel['grn_detail_id']})

      saveOrUpdate$
      .pipe( map(res => res['data']) )
      .subscribe(
        (res) => {
          if(res.status==1){
          AppAlert.showSuccess({text : res.message })
          this.rollPlanGroup.reset();
          this.datasetRollPlan=[]
          this.rollPlanModel.hide()
          //this.clearData()
          //this.reloadTable()
          //this.matSizeModel.hide()
            this.processing = false
            this.saved=true;
          }
          else if(res.status==0){
            AppAlert.showError({text:res.message})
            this.processing = false
            this.saved=true;
          }
       },
       (error) => {
           console.log(error)
       }
     );


  }

saveTrimPackigData(){
//debugger

var trimpackingData=this.trimPackingGroup.getRawValue()
var total_with_out_excess=0;
var total_excess_qty=0
this.processing = true
AppAlert.showMessage('Processing...','Please wait while saving details')
let formData = this.grnGroup.getRawValue();
for(var i=0;i<this.datasetTrimPacking.length;i++){
    if(parseFloat(this.datasetTrimPacking[i]['is_excess'])==0||this.datasetTrimPacking[i]['is_excess']==null){
    total_with_out_excess=parseFloat(this.datasetTrimPacking[i]['received_qty'])+total_with_out_excess
    }
    if(parseFloat(this.datasetTrimPacking[i]['is_excess'])==1){
    total_excess_qty=parseFloat(this.datasetTrimPacking[i]['received_qty'])+total_excess_qty
    }
      }
      //debugger
      if(total_with_out_excess!=parseFloat(trimpackingData['i_rec_qty'])-parseFloat(trimpackingData['excess_qty'])){
        AppAlert.showError({text:"Qty is Not within the GRN Qty"})
        this.processing = false
        return
      }

      if(total_excess_qty!=parseFloat(trimpackingData['excess_qty'])){
        AppAlert.showError({text:"Add Box Details for Excess Qty"})
        this.processing = false
        return
      }




let saveOrUpdate$=null
saveOrUpdate$ = this.http.post(this.apiUrl + 'store/trimPacking', {'dataset':this.datasetTrimPacking,'invoiceNo':formData['invoice_no'],'grn_detail_id':this.savedGrnModel['grn_detail_id']})

    saveOrUpdate$.subscribe(
      (res) => {

        AppAlert.showSuccess({text : res.data.message })
        this.trimPackingGroup.reset();
        this.datasetTrimPacking=[]
        this.trimPackingModel.hide()
        //this.clearData()
        //this.reloadTable()
        //this.matSizeModel.hide()
          this.processing = false
          this.saved=true;
     },
     (error) => {
         console.log(error)
     }
   );




}

setupfilterfrom(){
  //debugger
  var fromData=this.grnGroup.getRawValue();
  var grn_id=fromData['grn_type_code']['grn_type_id']
  this.filterDataGroup.enable()
  if(grn_id=="MANUAL"){
    this.filterDataGroup.get('pcd_date').disable()
    this.filterDataGroup.get('rm_in_date').disable()
    this.filterDataGroup.get('customer_name').disable()
    this.filterDataGroup.get('customer_po').disable()
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
