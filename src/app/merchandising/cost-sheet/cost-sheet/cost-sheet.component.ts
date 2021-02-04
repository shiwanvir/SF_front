import { Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { SnotifyService , SnotifyPosition} from 'ng-snotify';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';
import { HotTableRegisterer } from '@handsontable/angular';
import * as Handsontable from 'handsontable';

import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../../core/validation/primary-validators';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
import { AuthService } from '../../../core/service/auth.service';
import { ItemSelectorComponent } from '../../../shared/components/item-selector/item-selector.component';
import { ColorSelectorComponent } from '../../../shared/components/color-selector/color-selector.component';
import { CountrySelectorComponent } from '../../../shared/components/country-selector/country-selector.component';
import { CostingService } from '../costing.service';
import { PermissionsService } from '../../../core/service/permissions.service';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { Customer } from '../../../org/models/customer.model';
import { Style } from '../../../merchandising/models/style.model';
declare var $:any;

@Component({
  selector: 'app-cost-sheet',
  templateUrl: './cost-sheet.component.html',
  styleUrls: ['./cost-sheet.component.css']
})

export class CostSheetComponent implements OnInit {

  @ViewChild('tabGroup') tabs: TabsetComponent;
  @ViewChild(ItemSelectorComponent) itemSelectorComponent: ItemSelectorComponent;
  @ViewChild(ColorSelectorComponent) colorSelectorComponent: ColorSelectorComponent;
  @ViewChild(CountrySelectorComponent) countrySelectorComponent: CountrySelectorComponent;
  @ViewChild('revisionReasonModel') revisionReasonModel: ModalDirective;

  formGroup : FormGroup
  formUpchargeReason : FormGroup
  formRevisionReason : FormGroup
  formSizeChart : FormGroup
  appValidator: AppFormValidator
  appUpchargeValidator: AppFormValidator
  appSizeChartValidator: AppFormValidator
  appRevisionValidator: AppFormValidator
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  readonly url = this.apiUrl + 'merchandising/costing'

  customer$: Observable<Customer[]>;//use to load style list in ng-select
  customerLoading = false;
  customerInput$ = new Subject<string>();
  selectedCustomer : any[];

  style$: Observable<Style[]>;//use to load style list in ng-select
  styleLoading = false;
  styleInput$ = new Subject<string>();
  selectedStyle : any[];

  BomStage$: Observable<Array<any>>
  selectedBOMStge : any[];

  seasonList$: Observable<Array<any>>
  selectedSeason : any[];

  colorTypes$: Observable<Array<any>>
  selectedColorType : any[];

  buyNames$: Observable<Array<any>>
  selectedBuyName : any[];

  designSource$: Observable<Array<any>>
  selectedDesignSource : any[];

  packType$: Observable<Array<any>>
  selectedPackType : any[];

  upchargeReason$: Observable<any[]>;//use to load upcharge reason in ng-select
  upchargeReasonLoading = false;
  upchargeReasonInput$ = new Subject<string>();

  sizeChart$: Observable<any[]>;//use to load upcharge reason in ng-select
  sizeChartLoading = false;
  sizeChartInput$ = new Subject<string>();

  reason$: Observable<any[]>;//use to load revision reason list in ng-select
  reasonLoading = false;
  reasonInput$ = new Subject<string>();

  //currency$: Observable<Array<any>>
  //selectedCurrency : any[];

  //Color table
  tblColor: string = 'hot_Color'
  dataColor: any[] = [];
  settingsColor: any

  //Country tab grid
  tblCountry: string = 'hot_country'
  dataCountry: any[] = [];
  settingsCountry: any

  //Size tab grid
  tblSize: string = 'hot_country'
  dataSize: any[] = [];
  settingsSize: any

  //SMV tab grid
  tblSMV: string = 'hot_smv'
  dataSMV: any[] = [];
  settingsSMV: any

  //Operation tab grid
  tblOperation: string = 'hot_operation'
  dataOperation: any[] = [];
  settingsOperation: any

  //Pre-pack tab grid
  tblPP: string = 'hot_PP'
  dataPP: any[] = [];
  settingsPP: any

  //RM tab grid
  tblRM: string = 'hot_rm'
  dataRM: any[] = [];
  settingsRM: any
  //rm tab components list
  tblProductComponents: string = 'hot_product_components'
  dataProductComponents: any[] = [];
  settingsProductComponents: any

  //RM tab grid
  tblFG: string = 'hot_fg'
  dataFG: any[] = [];
  settingsFG: any

  imgSrc : string = '';
  processing : boolean = false //use to disable and hide buttons while processing async requests
  processingAddColor : boolean = false
  hasSMV : boolean = false
  hasFinanceCost : boolean = false //to chek has finance cost for current time

  //for item summary calculations
  fabricCost : number = 0
  elastcCost : number = 0
  packingCost : number = 0
  trimCost : number = 0
  rmCost : number = 0

  saveStatus = 'SAVE' //header saving status
  saveButtonLabel : string = 'Save' //used to chnage form submit buttons's text

  showSaveButton : boolean = true
  showNewButton : boolean = false
  showSendButton : boolean = false
  showEditButton : boolean = false
  showExitButton : boolean = false

  tblColorSelectedRange = null
  tblCountrySelectedRange = null
  tblItemSelectedRange = null
  featureComponentCount = 2

  selectedProductFeatureComponent = null //to store selected product feature details in item tab
  currentlyOpenTab : string = 'COLOR'
  copiedProductFeatureComponent = null //to store copy and paste items between product components
  selectedItemType = 'COMPONENT'

  showNotifyButton : boolean = false

  minDate : Date

  @ViewChild('upchargeReasonModel') upchargeReasonModel: ModalDirective;

  constructor(private fb:FormBuilder, private http:HttpClient, private snotifyService: SnotifyService,
    private layoutChangerService : LayoutChangerService,private authService : AuthService,
    private titleService: Title, private hotRegisterer: HotTableRegisterer, private costingService : CostingService,
    public permissionService:PermissionsService) { }


  ngOnInit() {

    this.titleService.setTitle("Costing")//set page title
    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Merchandising',
      'Costing'
    ])

    //listten to the menu collapse and hide button
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(this.currentlyOpenTab == 'COLOR') {
          const hotInstance = this.hotRegisterer.getInstance(this.tblColor);
          if(hotInstance != undefined && hotInstance != null){
            hotInstance.render() //refresh costing color table
          }
        }
        else if(this.currentlyOpenTab == 'SIZE'){
          const hotInstance = this.hotRegisterer.getInstance(this.tblSize);
          if(hotInstance != undefined && hotInstance != null){
            hotInstance.render() //refresh costing color table
          }
        }
        else if(this.currentlyOpenTab == 'COUNTRY'){
          const hotInstance = this.hotRegisterer.getInstance(this.tblCountry);
          if(hotInstance != undefined && hotInstance != null){
            hotInstance.render() //refresh costing color table
          }
        }
        else if(this.currentlyOpenTab == 'ITEM'){
          const hotInstance = this.hotRegisterer.getInstance(this.tblRM);
          if(hotInstance != undefined && hotInstance != null){
            hotInstance.render() //refresh costing color table
          }
        }
        else if(this.currentlyOpenTab == 'FG_ITEM'){
          const hotInstance = this.hotRegisterer.getInstance(this.tblFG);
          if(hotInstance != undefined && hotInstance != null){
            hotInstance.render() //refresh costing color table
          }
        }
        else if(this.currentlyOpenTab == 'SMV'){
          const hotInstance = this.hotRegisterer.getInstance(this.tblSMV);
          if(hotInstance != undefined && hotInstance != null){
            hotInstance.render() //refresh costing color table
          }
        }
    })

    this.costingService.costingId.subscribe(data => { //listning to the costing list show button event
      if(data != null){

        if(this.saveStatus == 'UPDATE') { //has already opend costing
          AppAlert.showConfirm({
            'text' : 'You have already opened costing. Do you want to clear previous one and open costing ('+data+')?'
          },(result) => {
            if (result.value) {
              this.resetAllData()
              this.formGroup.disable()
              this.saveStatus = 'UPDATE'
              this.saveButtonLabel = 'Update'
              this.selectedItemType = 'COMPONENT'
              this.loadCosting(data)
              //this.loadSizeChart(data)
              this.loadCountries(data)
            }
          })
        }
        else {
          this.formGroup.disable()
          this.saveStatus = 'UPDATE'
          this.saveButtonLabel = 'Update'
          this.selectedItemType = 'COMPONENT'
          this.loadCosting(data)
          //this.loadSizeChart(data)
          this.loadCountries(data)
        }
      }
    })

    this.loadStyles()
    this.checkFinanceCost() //chek finace cost is avaliable
    this.loadUpchargeReason() //load upcharge reasons
    //this.getSizeChart()
    //this.BomStage$ = this.getBomStage();
    this.seasonList$ = this.getSeasonList();
    //this.colorTypes$ = this.getColorOption();
    //this.buyNames$ = this.getBuyNames();
    this.designSource$ = this.getDesignSource();
    this.packType$ = this.getPackTypes()
    //this.currency$ = this.getCurrencies()

    this.minDate = new Date()
    this.minDate.setDate(this.minDate.getDate() + 1);

    this.formGroup = this.fb.group({
      id : 0,
      style_id : [[], [Validators.required]],
      bom_stage_id : [[], [Validators.required]],
      season_id : [[], [Validators.required]],
      color_type_id : [[], [Validators.required]],
      buy_id : [[]/*, [Validators.required]*/],
      style_type : [[], [Validators.required]],
      design_source_id : [[], [Validators.required]],
      total_smv : 0,
      total_cost: 0,
      total_order_qty: [0, [Validators.required, PrimaryValidators.isInteger]],
      fob: [0, [Validators.required, Validators.min(0), PrimaryValidators.maxDecimalLength(2)]],
      planned_efficiency: [0, [Validators.required, Validators.min(0.00001), Validators.max(100), PrimaryValidators.isInteger]],
      cost_per_std_min: [0, [Validators.required, Validators.min(0), PrimaryValidators.maxDecimalLength(2)]],
      epm:0,
      np_margine: 0,
      cost_per_utilised_min: [0, [Validators.required]],
      cpm_factory : 0,
      total_rm_cost : 0,
      labour_cost : 0,
      finance_cost : 0,
      finance_charges : 0,
      coperate_cost : 0,
      upcharge_reason : null,
      upcharge_reason_description : null,
      upcharge : [null, [/*Validators.required,*/ Validators.min(0), this.upchargeValidation(), PrimaryValidators.maxDecimalLength(4)]],
      pcd : null,
      //edited : false,
      cpm_front_end : 0,
      division : "",
      style_description : "",
      style_remarks : "",
      fabric_cost : 0,
      elastic_cost : 0,
      trim_cost : 0,
      packing_cost : 0,
      other_cost : 0,
      // cpum : "",
      //rm_cost : "",
      //cooperate_cost : "",
      customer : "",
      //up_charge : "",
      currency_code : ['$', [Validators.required]],
      lot_no : ['', [/*this.lotValidation2()*/]],
      status : "",
      revision_no : ''
    })

    this.appValidator = new AppFormValidator(this.formGroup, []);

    //upcharge reason form and validator
    this.formUpchargeReason = this.fb.group({
      'upcharge_reason' : [null, [Validators.required]]
    })
    this.appUpchargeValidator = new AppFormValidator(this.formUpchargeReason, [])

    //revision reason form and validator
    this.formRevisionReason = this.fb.group({
      'revision_reason' : [null, [Validators.required]]
    })
    this.appRevisionValidator = new AppFormValidator(this.formRevisionReason, [])

    /*this.formSizeChart = this.fb.group({
      size_chart_id : [null, [Validators.required]],
      chart_description : null
    })
    this.appSizeChartValidator = new AppFormValidator(this.formSizeChart, [])*/

    this.initializeColorGrid()
    //this.initializeSizeGrid()
    this.initializeCountryGrid()
    this.initializeSMVGrid()
    this.initializeOperationGrid()
    this.initializePPGrid()
    this.initializeRMGrid()
    this.initializeProductComponentGrid()
    this.initializeFGGrid()
  }


  ngOnDestroy() {
    this.costingService.changeCostingId(null)
  }



  onSelect(data: TabDirective): void {
    let hotInstance = null;
    switch(data.heading){
    case 'Color':
      this.currentlyOpenTab = 'COLOR'
      hotInstance = this.hotRegisterer.getInstance(this.tblColor);
      if(hotInstance != undefined && hotInstance != null){
        setTimeout(() => {
          hotInstance.render() //refresh costing color table
        }, 500)

      }
    break;
    case 'Size Chart':
      this.currentlyOpenTab = 'SIZE'
      hotInstance = this.hotRegisterer.getInstance(this.tblSize);
      setTimeout(() => {
        hotInstance.render() //refresh costing color table
      }, 500)
    break;
    case 'Country':
       this.currentlyOpenTab = 'COUNTRY'
       hotInstance = this.hotRegisterer.getInstance(this.tblCountry);
       setTimeout(() => {
         hotInstance.render() //refresh costing color table
       }, 500)
    break;
    case 'SMV':
       this.currentlyOpenTab = 'SMV'
       hotInstance = this.hotRegisterer.getInstance(this.tblSMV);
       setTimeout(() => {
         hotInstance.render() //refresh costing color table
       }, 500)
    break;
    case 'Operation':
      this.currentlyOpenTab = 'OPERATION'
    break;
    case 'Pre-Pack':
       this.currentlyOpenTab = 'PRE_PACK'
    break;
    case 'Item':
       this.currentlyOpenTab = 'ITEM'
       hotInstance = this.hotRegisterer.getInstance(this.tblProductComponents);
       setTimeout(() => {
         hotInstance.render() //refresh costing color table
       }, 500)
    break;
    case 'Finish Good Items':
       this.currentlyOpenTab = 'FG_ITEM'
       hotInstance = this.hotRegisterer.getInstance(this.tblFG);
       setTimeout(() => {
         hotInstance.render() //refresh costing color table
       }, 500)
    break;
    }

  }


  getBomStage(): Observable<Array<any>> {
    /*return this.http.get<any[]>(this.apiUrl + 'merchandising/bomstages?active=1&fields=bom_stage_id,bom_stage_description')
      .pipe(map(res => res['data']))*/
      let style = this.formGroup.get('style_id').value == null ? null : this.formGroup.get('style_id').value.style_id
      return this.http.get<any[]>(this.apiUrl + 'merchandising/costing?type=get_bom_stages&style=' + style)
        .pipe(map(res => res['data']))
  }

  getSeasonList(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'org/seasons?active=1&fields=season_id,season_name')
      .pipe(map(res => res['data']))
  }

  getColorOption(): Observable<Array<any>> {
    //return this.http.get<any[]>(this.apiUrl + 'merchandising/color-options?active=1&fields=col_opt_id,color_option')
    //  .pipe(map(res => res['data']))
    let style = this.formGroup.get('style_id').value == null ? null : this.formGroup.get('style_id').value.style_id
    return this.http.get<any[]>(this.apiUrl + 'merchandising/costing?type=get_color_types&style=' + style)
      .pipe(map(res => res['data']))
  }

  getBuyNames(): Observable<Array<any>> {
    //return this.http.get<any[]>(this.apiUrl + 'merchandising/buy-master?active=1&fields=buy_id,buy_name')
    //  .pipe(map(res => res['data']))
    let style = this.formGroup.get('style_id').value == null ? null : this.formGroup.get('style_id').value.style_id
    return this.http.get<any[]>(this.apiUrl + 'merchandising/costing?type=get_buy_names&style=' + style)
      .pipe(map(res => res['data']))
  }

  getDesignSource(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'merchandising/costing-design-sources?active=1&fields=design_source_id,design_source_name')
      .pipe(map(res => res['data']))
  }

  getPackTypes(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'org/pack-types?active=1&fields=style_type,style_type_name')
      .pipe(map(res => res['data']))
  }

  loadStyles() {
    this.style$ = this.styleInput$
    .pipe(
       debounceTime(200),
       distinctUntilChanged(),
       tap(() => this.styleLoading = true),
       switchMap(term => this.http.get<Style[]>(this.apiUrl + 'merchandising/customer-orders?type=style' , {params:{search:term}})
       .pipe(
           tap(() => this.styleLoading = false)
       ))
    );
  }

  loadUpchargeReason(){
     this.upchargeReason$ = this.upchargeReasonInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.upchargeReasonLoading = true),
          switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/cancellation-reasons?type=auto' , {params:{search:term, category_code : 'COSTING_UPCHARGE'}})
          .pipe(
              tap(() => this.upchargeReasonLoading = false)
          ))
       );
   }


   getCurrencies(): Observable<Array<any>> {
     return this.http.get<any[]>(this.apiUrl + 'finance/currencies?active=1&fields=currency_id,currency_code')
       .pipe(map(res => res['data']))
   }

  initializeOperationGrid(){
    this.settingsOperation = {
      data:this.dataOperation,
      columns:[
      {
          data:'',
          renderer: 'html',
          readOnly:true,
          className:'htLeft'
      },
      {
          data:'',
          className:'htLeft'
      },
      {
          data:'',
          className:'htLeft'
      },
      {
          data:'',
          className:'htLeft'
      }
      ],
      rowHeaders: true,
      colHeaders: ['Operation','Component','Quality','Price'],
      filters: true,
      dropdownMenu: true,
      manualColumnResize: true,
      autoColumnSize : true,
      height: 150,
      copyPaste: true,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htMiddle',
      readOnly: true
    }
  }

  initializePPGrid(){
    this.settingsPP = {
      data:this.dataPP,
      columns:[
      {
          data:'',
          renderer: 'html',
          readOnly:true,
          className:'htLeft'
      },
      {
          data:'',
          className:'htLeft'
      },
      {
          data:'',
          className:'htLeft'
      },
      {
          data:'',
          className:'htLeft'
      }
      ],
      rowHeaders: true,
      colHeaders: ['Finished Good','FG Color Code','Component','Component Color Code'],
      filters: true,
      dropdownMenu: true,
      manualColumnResize: true,
      autoColumnSize : true,
      height: 150,
      copyPaste: true,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htMiddle',
      readOnly: true
    }
  }


  onStyleChange(e){
    //clear fields
     this.formGroup.patchValue({
        bom_stage_id : null,
        color_type_id : null,
        buy_id : null
      })

    if(e != null){
      this.loadStyleData(e.style_id)
      this.checkSMV()

      this.BomStage$ = this.getBomStage()
      this.colorTypes$ = this.getColorOption()
      this.buyNames$ = this.getBuyNames()
    }
  }


  onStyleClear(){
    this.formGroup.patchValue({
      bom_stage_id : null,
      color_type_id : null,
      buy_id : null
    })
  }


  loadStyleData(_style_id) {
    this.http.get(this.url + '?type=getStyleData&style_id=' + _style_id)
    .subscribe(data => {
        this.imgSrc = AppConfig.StayleImage() + data['image'];
        this.formGroup.patchValue({
          division : data['division_name'],
          style_description : data['style_desc'],
          style_remarks : data['remark_style'],
          customer : data['cust_name']
        })
    });
    //load order qty effiency
    this.onOrderQtyChange()
  }


  checkFinanceCost(){ //check and load finance cost
    this.processing = true
    this.http.get(this.url + '?type=finance_cost').subscribe(
      res => {
        this.processing = false
        if(res['status'] == 'success'){
        //  let _cpm_factory = (parseFloat(res['finance_details']['cpum']) / 100) * this.formHeaderGroup.controls['planned_efficiency'].value
        let _cpm_factory = (parseFloat(res['finance_details']['cpum']) * this.formGroup.controls['planned_efficiency'].value) / 100
          this.formGroup.patchValue({
            finance_charges : res['finance_details']['finance_cost'],
            cost_per_utilised_min : res['finance_details']['cpum'],
            cpm_front_end : res['finance_details']['cpmfront_end'],
            total_smv : res['total_smv'],
            cpm_factory : this.formatDecimalNumber(_cpm_factory, 4)
          })
          this.calculateLabourCost()
          this.calculateCoperateCost()
          this.hasFinanceCost = true
        }
        else{
          this.hasFinanceCost = false
          AppAlert.showError({title : '<span style="color:red">Invalid Data :(</span>', text : res['message']})
        }
      },
      error => {
        this.processing = false
        this.hasFinanceCost = false
        AppAlert.showError({title :'<span style="color:red">Invalid Data :(</span>', text :  'Finance Cost Find Error'})
        console.log(error)
      }
    )
  }


  checkSMV(){//check total smv
    this.processing = true
    let style_id = this.formGroup.controls['style_id'].value
    let bom_stage_id = this.formGroup.controls['bom_stage_id'].value
    let color_type_id = this.formGroup.controls['color_type_id'].value
    let buy_id = this.formGroup.controls['buy_id'].value

    if(style_id == null || style_id == '' || bom_stage_id == null || bom_stage_id == '' || color_type_id == null || color_type_id == '') {
      this.formGroup.patchValue({
        total_smv : 0,
      })
      return
    }
    style_id = style_id.style_id
    bom_stage_id = bom_stage_id.bom_stage_id
    color_type_id = color_type_id.col_opt_id
    buy_id = (buy_id == null || buy_id == '') ? 0 : buy_id.buy_id

    this.http.get(this.url + '?type=total_smv&style_id=' + style_id + '&bom_stage_id=' + bom_stage_id +
    '&color_type_id=' + color_type_id + '&buy_id=' + buy_id)
    .subscribe(
      res => {
        this.processing = false
        if(res['data']['status'] == 'success'){
          this.hasSMV = true
          this.formGroup.patchValue({ total_smv : res['data']['total_smv'] })
          this.calculateLabourCost()
          this.calculateCoperateCost()
        }
        else{
          this.hasSMV = false
          this.formGroup.patchValue({ total_smv : 0 })
          AppAlert.showError({ title : '<span style="color:red">Invalid Data :(</span>', html : res['data']['message']})
        }
      },
      error => {
        this.processing = false
        this.hasSMV = false
        this.formGroup.patchValue({ total_smv : 0 })
        console.log(error)
      }
    )
  }

  calculateLabourCost(){
    let smv = this.formGroup.controls['total_smv'].value
    let cpm_factory = this.formGroup.controls['cpm_factory'].value
    if(smv != null && smv != '' && cpm_factory != null && cpm_factory != ''){
      this.formGroup.controls['labour_cost'].setValue(this.formatDecimalNumber(smv * cpm_factory, 4))
    }
    else{
      this.formGroup.controls['labour_cost'].setValue(0)
    }
  }


  calculateCoperateCost(){
    let smv = this.formGroup.controls['total_smv'].value
    let cpm_front_end = this.formGroup.controls['cpm_front_end'].value
    if(smv != null && smv != '' && cpm_front_end != null && cpm_front_end != ''){
      this.formGroup.controls['coperate_cost'].setValue(this.formatDecimalNumber((smv * cpm_front_end), 4))
    }
    else{
      this.formGroup.controls['coperate_cost'].setValue(0)
    }
  }

  onBomStageChange(e){
    /*if(this.formGroup.get('bom_stage_id').value.bom_stage_description == 'BULK'){
      this.formGroup.get('total_order_qty').setValue(1)
      this.formGroup.get('total_order_qty').disable()
    }
    else{
      this.formGroup.get('total_order_qty').setValue(0)
      this.formGroup.get('total_order_qty').enable()
    }*/
    this.checkSMV()
  }

  onColorTypeChange(){
    this.checkSMV()
    this.BomStage$ = this.getBomStage()
  }

  onBuyChange(){
    this.checkSMV()
    this.BomStage$ = this.getBomStage()
  }


  onPlannedEffiencyChanged(e) {//planned efficiency field value change
    let cpum = this.formGroup.getRawValue().cost_per_utilised_min
    //let _cpm_factory = this.formatDecimalNumber((e.target.value * (cpum / 100)), 4)
    let _cpm_factory = this.formatDecimalNumber(((e.target.value * cpum) / 100), 4)
    this.formGroup.get('cpm_factory').setValue(_cpm_factory)
    this.calculateLabourCost()
  }


  save(){
    if(this.formGroup.get('status').value == 'APPROVED'){
      AppAlert.showConfirm({
        'text' : 'This is an approved costing. So costing will be saved as a new version. Do you want to continue?'
      },(result) => {
        if (result.value) {
          this.formRevisionReason.reset()
          this.loadRevisionReason()
          this.revisionReasonModel.show()
          //this.saveHeaderData()
        }
      })
    }
    else {
      //chek for unsaves data
      if(this.checkForUnsavedData() == true){
        this.saveHeaderData()
      }
    }
  }


  saveHeaderData() { //save costing header data with finish goods
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Saving...','Please wait while saving costing')
    let formData = this.formGroup.getRawValue();
    formData.style_id = formData.style_id.style_id
    formData.bom_stage_id = formData.bom_stage_id.bom_stage_id
    formData.season_id = formData.season_id.season_id
    formData.color_type_id = formData.color_type_id.col_opt_id
    formData.buy_id = (formData.buy_id == undefined || formData.buy_id == null) ? null :  formData.buy_id.buy_id
    formData.design_source_id = formData.design_source_id.design_source_id
    formData.style_type = formData.style_type.style_type
    formData.pcd = this.formatFormDate(formData.pcd)
    //formData.currency_code = formData.currency_code.currency_id

    let saveOrUpdate$ = null;
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.url, formData);
    }
    else {
      saveOrUpdate$ = this.http.put(this.url + '/' + formData.id , formData);
    }
    this.processing = true
    saveOrUpdate$.subscribe(
      (res) => {
          this.processing = false
          if(res.data.status == 'success'){
            this.revisionReasonModel.hide()//hide revision reason model
            if(this.saveStatus == 'SAVE'){ //disable main fields
              this.formGroup.controls['style_id'].disable()
              this.formGroup.controls['bom_stage_id'].disable()
              this.formGroup.controls['season_id'].disable()
              this.formGroup.controls['color_type_id'].disable()
              this.formGroup.get('id').setValue(res.data.costing.id)

              this.loadProductComponents(this.formGroup.get('style_id').value.style_id)
              this.loadSMVDetails(this.formGroup.get('id').value)

              this.saveStatus = 'UPDATE'
              this.saveButtonLabel = 'Update'

              this.showSaveButton = true
              this.showNewButton = true
              this.showSendButton = (res.data.costing.status == 'CREATE' && res.data.costing.consumption_required_notification_status == 0 && res.data.costing.consumption_added_notification_status == 0) ? true : false
              this.showNotifyButton = res.data.costing.consumption_required_notification_status == 1 ? true : false
              this.showEditButton = false
              this.showExitButton = false

              setTimeout(()=>{
                this.initializeColorGrid()
                const hotInstance = this.hotRegisterer.getInstance(this.tblColor);
                hotInstance.render()
              },200)
            }
            else {
              this.showSaveButton = true
              this.showNewButton = true
              this.showSendButton = (res.data.costing.status == 'CREATE' && res.data.costing.consumption_required_notification_status == 0 && res.data.costing.consumption_added_notification_status == 0) ? true : false
              this.showExitButton = true//(res.data.revision_no > 0) ? true : false
              this.showEditButton = false
            }
            this.featureComponentCount = res.data.feature_component_count
            this.formGroup.patchValue({
              id : res.data.costing.id,
              revision_no : res.data.costing.revision_no,
              status : res.data.costing.status,
              fabric_cost : res.data.costing.fabric_cost,
              trim_cost : res.data.costing.trim_cost,
              elastic_cost : res.data.costing.elastic_cost,
              packing_cost : res.data.costing.packing_cost,
              other_cost : res.data.costing.other_cost,
              total_cost : res.data.costing.total_cost,
              epm : res.data.costing.epm,
              np_margine : res.data.costing.np_margine,
              total_rm_cost : res.data.costing.total_rm_cost,
              labour_cost : res.data.costing.labour_cost,
              finance_cost : res.data.costing.finance_cost,
              coperate_cost : res.data.costing.coperate_cost,
            })
            //this.showNotifyButton = true
          // this.canSendToApproval = (this.costingStatus == 'CREATE') ? true : false
          // this.costingService.reloadCostingList('RELOAD')//reload costing list table
            AppAlert.showSuccess({ text: res.data.message })

          }
          else{
            AppAlert.closeAlert()
            AppAlert.showError({ text: res.data.message })
          }
      },
      (error) => {
        this.processing = false
        AppAlert.closeAlert()
        if(error.status == 401){ //validation error
          AppAlert.showError({title : 'Access Denied' , text : "You don't have permissions to access this functionality"})
        }
        else {
          AppAlert.showError({ text: 'Process Error'})
        }
        console.log(error)
      }
    );
  }


  exitEditMode(){
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Exit...','Please wait while exit from edit mode')
    this.http.post(this.apiUrl + 'merchandising/costing/edit-mode', {costing_id : this.formGroup.get('id').value, edit_status : 0})
    .subscribe(
      res => {
        if(res['status'] == 'success'){
          this.showEditButton = true
          this.showNewButton = true
          this.showSaveButton = false
          this.showSendButton = false
          this.showExitButton = false

          this.formGroup.disable()
          AppAlert.closeAlert()
        }
        else {
          AppAlert.closeAlert()
          AppAlert.showError({ text : res['message'] })
        }
      },
      error => {
        console.log(error)
        AppAlert.closeAlert()
        AppAlert.showError({text : 'Error occured while exit from edit mode'})
      }
    )
  }


  loadRevisionReason(){
     this.reason$ = this.reasonInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.reasonLoading = true),
          switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/cancellation-reasons?type=auto' , {params:{search:term, category_code : 'COSTING'}})
          .pipe(
              tap(() => this.reasonLoading = false)
          ))
       );
   }


  onUpchargeReasonClick(){
    if(this.showSaveButton){
      this.formUpchargeReason.reset()
      this.upchargeReasonModel.show()
    }
  }

  addUpchargeReason(){
    let reason = this.formUpchargeReason.get('upcharge_reason').value
    this.formGroup.patchValue({
      upcharge_reason : reason.reason_id,
      upcharge_reason_description : reason.reason_description
    })
    this.upchargeReasonModel.hide()
  }


  edit(){
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading edit mode')
    this.http.post(this.apiUrl + 'merchandising/costing/edit-mode', {costing_id : this.formGroup.get('id').value, edit_status : 1})
    .subscribe(
      res => {
        if(res['status'] == 'success'){

          //can only edit below fields, if user is a merchant
          //if(!this.permissionService.hasDefined('COSTING_NET_CONSUMPTION_CHANGE')){
            this.formGroup.controls['design_source_id'].enable()
            this.formGroup.controls['total_order_qty'].enable()
            this.formGroup.controls['fob'].enable()
            this.formGroup.controls['pcd'].enable()
            this.formGroup.controls['upcharge'].enable()
            this.formGroup.controls['planned_efficiency'].enable()
            this.formGroup.controls['style_type'].enable()
          //}

          this.showSaveButton = (this.formGroup.get('status').value != 'PENDING') ? true : false
          this.showNewButton = true
          this.showSendButton = (res['costing']['status'] == 'CREATE' && res['costing']['consumption_required_notification_status'] == 0 && res['costing']['consumption_added_notification_status'] == 0) ? true : false
          this.showNotifyButton = res['costing']['consumption_required_notification_status'] == 1 ? true : false
          this.showEditButton = false
          this.showExitButton = true

          AppAlert.closeAlert()
        }
        else {
          AppAlert.closeAlert()
          AppAlert.showError({ text : res['message'] })
        }
      },
      error => {
        console.log(error)
        AppAlert.closeAlert()
        AppAlert.showError({text : 'Error occured while loading edit mode'})
      }
    )
  }


  resetAllData(){ //clear all data and set to default values
    this.saveStatus = 'SAVE'
    this.formGroup.reset()
    //this.formSizeChart.reset()

    this.formGroup.patchValue({
      id : 0,
      total_smv : 0,
      total_cost: 0,
      total_order_qty:0,
      fob: 0,
      planned_efficiency: 0,
      cost_per_std_min: 0,
      epm:0,
      np_margine: 0,
      cost_per_utilised_min: 0,
      cpm_factory : 0,
      total_rm_cost : 0,
      labour_cost : 0,
      finance_cost : 0,
      finance_charges : 0,
      coperate_cost : 0,
      upcharge_reason : null,
      upcharge_reason_description : null,
      upcharge : 0,
      pcd : null,
      edited : false,
      cpm_front_end : 0,
      currency_code : '$'
    })

    this.dataColor = [];
    this.dataCountry = [];
    this.dataSize = [];
    this.dataSMV = [];
    this.dataOperation = [];
    this.dataPP = [];
    this.dataRM = [];
    this.dataProductComponents = [];
    this.dataFG = [];

    this.imgSrc = '';
    this.processing = false
    this.hasSMV = false
    this.hasFinanceCost = false

    //for item summary calculations
    this.fabricCost = 0
    this.elastcCost = 0
    this.packingCost = 0
    this.trimCost = 0
    this.rmCost = 0

    this.saveButtonLabel = 'Save'

    this.tblColorSelectedRange = null
    this.tblCountrySelectedRange = null
    this.tblItemSelectedRange = null
    this.featureComponentCount = 0

    this.selectedProductFeatureComponent = null
    this.currentlyOpenTab = 'COLOR'

    this.showSaveButton = true
    this.showNewButton = false
    this.showSendButton = false
    this.showEditButton = false
    this.showExitButton = false
    this.showNotifyButton = false

    this.formGroup.controls['style_id'].enable()
    this.formGroup.controls['bom_stage_id'].enable()
    this.formGroup.controls['season_id'].enable()
    this.formGroup.controls['color_type_id'].enable()
    this.formGroup.controls['buy_id'].enable()
    this.formGroup.controls['style_type'].enable()
    this.formGroup.controls['design_source_id'].enable()
    this.formGroup.controls['fob'].enable()
    this.formGroup.controls['total_order_qty'].enable()
    this.formGroup.controls['pcd'].enable()
    this.formGroup.controls['planned_efficiency'].enable()
    this.formGroup.controls['upcharge'].enable()
    //this.formGroup.controls['currency_code'].enable()
  }


  loadCosting(_id){//load costing details
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading costing')

    this.http.get(this.url + '/' + _id).subscribe(
      res => {
        let data = res['data']['costing']
        this.loadStyleData(data.style_id)

        this.formGroup.patchValue({
          id : data.id,
          style_id : data.style,
          bom_stage_id: data.bom_stage,
          season_id : data.season,
          buy_id : data.buy,
          color_type_id: data.color_type,
          total_smv : data.total_smv,
          fabric_cost : data.fabric_cost,
          trim_cost : data.trim_cost,
          elastic_cost : data.elastic_cost,
          packing_cost : data.packing_cost,
          other_cost : data.other_cost,
          total_cost : data.total_cost,
          total_order_qty : data.total_order_qty,
          fob : data.fob,
          planned_efficiency : data.planned_efficiency,
          cost_per_std_min : data.cost_per_std_min,
          epm : data.epm,
          np_margine : data.np_margine,
          cost_per_utilised_min : data.cost_per_utilised_min,
          cpm_factory : data.cpm_factory,
          total_rm_cost : data.total_rm_cost,
          labour_cost : data.labour_cost,
          finance_cost : data.finance_cost,
          finance_charges : data.finance_charges,
          coperate_cost : data.coperate_cost,
          upcharge_reason : (data.upcharge_reason == null) ? null : data.upcharge_reason.reason_id,
          upcharge_reason_description : (data.upcharge_reason == null) ? null : data.upcharge_reason.reason_description,
          revision_reason : data.revision_reason,
          upcharge : data.upcharge,
          pcd : (data.pcd == null || data.pcd == '') ? null : new Date(data.pcd),
          cpm_front_end : data.cpm_front_end,
          design_source_id : data.design_source,
          status : data.status,
          revision_no : data.revision_no,
          style_type : data.pack_type,
          lot_no :data.lot_no,
          currency_code : data.currency.currency_id//data.currency
        })

        this.formGroup.get('pcd').setErrors(null)//set null to remove date plugin min date error
        this.featureComponentCount = res['data']['feature_component_count']
        this.loadProductComponents(data.style.style_id)
        this.loadCostingColors(data.id, this.featureComponentCount)
        this.loadFinishGoods(data.id)
        this.loadSMVDetails(data.id)
        //this.revisionNo = data.revision_no
        //this.costingStatus = data.status

        //this.showSaveButton = (data.edit_status == 1 && data.status != 'PENDING') ? true : false
        if(data.edit_status == 1 && data.status != 'PENDING'){
          this.showSaveButton = true
          this.formGroup.controls['design_source_id'].enable()
          this.formGroup.controls['total_order_qty'].enable()
          this.formGroup.controls['fob'].enable()
          this.formGroup.controls['pcd'].enable()
          this.formGroup.controls['upcharge'].enable()
          this.formGroup.controls['planned_efficiency'].enable()
          this.formGroup.controls['style_type'].enable()
        }
        else {
          this.showSaveButton = false
          this.formGroup.controls['style_id'].disable()
          this.formGroup.controls['bom_stage_id'].disable()
          this.formGroup.controls['season_id'].disable()
          this.formGroup.controls['color_type_id'].disable()
          this.formGroup.controls['buy_id'].disable()
        }

        this.showNewButton = true
        this.showSendButton = (data.edit_status == 1 && data.status == 'CREATE' && data.consumption_required_notification_status == 0 && data.consumption_added_notification_status == 0) ? true : false
        this.showEditButton = (data.edit_status == 0 && data.status != 'PENDING') ? true : false
        this.showExitButton = (data.edit_status == 1) ? true : false
        this.showNotifyButton = data.consumption_required_notification_status == 1 ? true : false

        this.hasSMV = true // must be true to show update button
      //  this.dataset = []
      //  this.dataset = res['data']['finish_goods']
        setTimeout(() => {
        //  this.loadFinishGoodTable(this.dataset, this.featureComponentCount)
          AppAlert.closeAlert()
        },500)
    },
    error => {
      console.log(error)
      AppAlert.closeAlert()
      //setTimeout(() => { AppAlert.closeAlert() }, 500)
    }
    )
  }


  sentToApproval(){
    AppAlert.showConfirm({
      'text' : 'Do you want to send this costing for approval?'
    },(result) => {
      if (result.value) {
        this.processing = true
        AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Sending...','Please wait while sending for approval')

        if(this.checkForUnsavedData() == true){
          this.http.post(this.url + '/approval/send', {costing_id : this.formGroup.get('id').value })
          .subscribe(
            res => {
              if(res['data']['status'] == 'success'){

                this.showSaveButton = false
                this.showNewButton = true
                this.showSendButton = false
                this.showExitButton = false
                this.showEditButton = false

                this.formGroup.get('status').setValue(res['data']['costing']['status'])
                setTimeout(() => {
                  AppAlert.closeAlert()
                  AppAlert.showSuccess({ text : res['data']['message'] })
                }, 500)
              }
              else{
                setTimeout(() => {
                  AppAlert.closeAlert()
                  AppAlert.showError({ text : res['data']['message'] })
                }, 500)
              }
              this.processing = false
            },
            error => {
              console.log(error)
              this.processing = false
              AppAlert.closeAlert()
              AppAlert.showError({ text : 'Error occured while send for approval' })
            }
          )
        }
        else {
          this.processing = false
        }
      }
    })
  }


  newCosting() {
    AppAlert.showConfirm({
      'text' : 'Do you want to create new costing?'
    },(result) => {
      if (result.value) {
        this.resetAllData()
        this.checkFinanceCost()//load finance charges
      }
    })
  }


  onOrderQtyChange(){
    let style_id = this.formGroup.get('style_id').value == undefined ? 0 : this.formGroup.get('style_id').value.style_id
    let order_qty = this.formGroup.get('total_order_qty').value;

    if(style_id != 0 && order_qty != null && order_qty != '' && order_qty != 0){
      this.http.get(this.url + '?type=order_qty_efficiency&style_id=' + style_id + '&order_qty=' + order_qty)
      .subscribe(
        res => {
          if(res['data'] == 0){
            AppAlert.showError({ text : 'Incorrect Planned Efficiency' })
          }
          this.formGroup.patchValue({ planned_efficiency : res['data'] })
          let cpum = this.formGroup.getRawValue().cost_per_utilised_min
          //let _cpm_factory = this.formatDecimalNumber((e.target.value * (cpum / 100)), 4)
          let _cpm_factory = this.formatDecimalNumber(((parseInt(res['data']) * cpum) / 100), 4)
          this.formGroup.get('cpm_factory').setValue(_cpm_factory)
          this.calculateLabourCost()
        },
        error => {
          AppAlert.showError({ text : 'Error occured while loading efficiency'})
          this.formGroup.patchValue({ order_qty : 0 })
        }
      )
    }
    else {
      this.formGroup.patchValue({ order_qty : 0 })
    }
  }
  //Revisions...................................................................
  //............................................................................

  /*loadRevisionReason(){
     this.reason$ = this.reasonInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.reasonLoading = true),
          switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/cancellation-reasons?type=auto' , {params:{search:term, category_code : 'COSTING'}})
          .pipe(
              tap(() => this.reasonLoading = false)
          ))
       );
   }*/

  //..................... Color tab ............................................
  //............................................................................

  initializeColorGrid(){
    this.settingsColor = {
      data:this.dataColor,
      columns:[
        { title : 'FNG Color Code', data : 'fng_color_code', type: 'text' },
        { title : 'FNG Color Name', data : 'fng_color_name', type: 'text' },
        { type: 'text', title : 'Product Feature' , data: 'product_feature_description' , readOnly: true},
        { type: 'text', title : 'Product Component' , data: 'product_component_description' , readOnly: true},
        { type: 'text', title : 'Product Silhouette' , data: 'product_silhouette_description' , readOnly: true},
        { title : 'SFG Color Code', data: 'sfg_color_code', type: 'text' },
        { title : 'SFG Color Name', data: 'sfg_color_name', type: 'text' },
      ],
      contextMenu : {
        callback: (key, selection, clickEvent) => {
          // Common callback for all options
        },
        items : {
          'add' : {
            name : 'Add Line',
            hidden: (key, selection, clickEvent) => {
              if(this.showSaveButton == false || this.processingAddColor == true){
                return true;
              }
              else {
                return false;
              }
            },
            callback : (key, selection, clickEvent) => {
              this.processingAddColor = true
              this.http.get(this.apiUrl + 'merchandising/costing?type=get_finish_good_color&style_id=' + this.formGroup.get('style_id').value.style_id)
              .subscribe(
                res => {
                  this.loadColorTable(res['data'], res['data'].length)
                  this.processingAddColor = false
                }
              )
            }
          },
          'Copy' : {
            name : 'Copy',
            hidden: (key, selection, clickEvent) => {
              if(!this.showSaveButton || this.processingAddColor == true){
                return true
              }
              else {
                return false
              }
            },
            callback : (key, selection, clickEvent) => {
              if(selection.length > 0){
                let start = selection[0].start;
                let end = selection[0].end;
                //chek user right click on merged cell
                if(start.col == end.col && (start.col == 0 || start.col == 1 || start.col == 2)){
                  let arr = []
                  for(let x = start.row ; x <= end.row ; x++){
                    let obj = JSON.parse(JSON.stringify(this.dataColor[x]))
                    obj['fng_color_id'] = 0
                    obj['sfg_color_id'] = 0
                    obj['edited'] = 1
                    arr.push(obj)
                  }
                  this.loadColorTable(arr, arr.length)
                }
              }
            }
          },
          'setColor' : {
            name : 'Set Color',
            hidden: (key, selection, clickEvent) => {
              if(!this.showSaveButton || this.processingAddColor == true){
                return true
              }
              else {
                return false
              }
            },
            callback : (key, selection, clickEvent) => {
              if(selection.length > 0){
                let start = selection[0].start;
                let end = selection[0].end;

                if(start.col == end.col){
                  if(start.col == 0 || start.col == 1 || start.col == 2){
                    this.tblColorSelectedRange = {
                      start : start,
                      end : end
                    }
                    this.colorSelectorComponent.openModel()
                  }
                  else if(start.col == 5 || start.col == 6){
                    if(this.featureComponentCount > 1){
                      this.tblColorSelectedRange = {
                        start : start,
                        end : end
                      }
                      this.colorSelectorComponent.openModel()
                    }
                  }
                }
              }
            }
          },
          'Remove' : {
            name : 'Remove',
            hidden: (key, selection, clickEvent) => {
              if(!this.showSaveButton || this.processingAddColor == true){
                return true
              }
              else {
                return false
              }
            },
            callback : (key, selection, clickEvent) => {
              if(selection.length > 0){
                let start = selection[0].start;
                let end = selection[0].end;
                //chek user right click on merged cell
                if(start.col == end.col && (start.col == 0 || start.col == 1 || start.col == 2)) {
                  AppAlert.showConfirm({
                    'text' : 'Do you want to remove this FNG colors?'
                  },(result) => {
                    if (result.value) {
                      if(this.dataColor[start.row]['fng_color_id'] == 0) {//chek is a not saved color
                        let cc = 0
                        for(let x = end.row ; x >= start.row ; x--){
                          this.dataColor.splice(x, 1) //delete from array
                          cc++
                        }
                        this.loadColorTable([], cc)
                      }
                      else {
                        this.removeColor(this.dataColor[start.row]['fng_color_id'])
                      }
                    }
                  })

                }

              }
            }
          },
        }
      },
      /*afterSelection : (data, row1, col1, row2, col2) =>{
        console.log(row1 + ' ' + col1 + ' ' + row2 + ' ' + col2)
        if(!(col1 == 0 && col1 == 0)){
          this.colorSelectorComponent.openModel()
        }
      },*/
      mergeCells: [],
      cells : (row, col, prop) => {
          var cellProperties = {};

          if(this.dataColor[row] != undefined){
            if(this.dataColor[row]['edited'] == 1){ //chek row is edited by user and then change color
              cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
                var args = arguments;
                td.style.background = '#d1e0e0';
                Handsontable.renderers.TextRenderer.apply(this, args);
              }
            }
            else{
              cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
                var args = arguments;
                td.style.background = '#fff';
                Handsontable.renderers.TextRenderer.apply(this, args);
              }
            }
          }
          return cellProperties;
      },
      rowHeaders: true,
      colHeaders: ['Finish Good','FG Color','Semi FG Code','Semi FG Color'],
      filters: true,
      dropdownMenu: true,
      manualColumnResize: true,
      autoColumnSize : true,
      height: 350,
      copyPaste: true,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htMiddle',
      readOnly: true
    }
  }


  loadColorTable(_dataSet, _componentCount){ //load finish good table with merged cells
    this.dataColor = this.dataColor.concat(_dataSet);
    const hotInstance = this.hotRegisterer.getInstance(this.tblColor);
    let mcells = []
    for(let x = 0 ; x < this.dataColor.length ; (x = x + _componentCount)){
      mcells.push(
        {row: x, col: 0, rowspan: _componentCount, colspan: 1},
        {row: x, col: 1, rowspan: _componentCount, colspan: 1},
        {row: x, col: 2, rowspan: _componentCount, colspan: 1}
      )
    }
    let options = {
       mergeCells : mcells
    };
    hotInstance.updateSettings(options, false);
    hotInstance.render()
  }


  onSelectColor(data){
    if(this.tblColorSelectedRange != null){
      const hotInstance = this.hotRegisterer.getInstance(this.tblColor);
        for(let x = this.tblColorSelectedRange.start.row ; x <=  this.tblColorSelectedRange.end.row ; x++){
          if(this.tblColorSelectedRange.start.col == 0 || this.tblColorSelectedRange.start.col == 1){ //fng color
            this.dataColor[x]['fng_color'] = data.color_id
            this.dataColor[x]['edited'] = 1
            hotInstance.setDataAtCell(x, 0, data.color_code)
            hotInstance.setDataAtCell(x, 1, data.color_name)
          }
          else if(this.tblColorSelectedRange.start.col == 5 || this.tblColorSelectedRange.start.col == 6){ //sfg color
            this.dataColor[x]['sfg_color'] = data.color_id
              this.dataColor[x]['edited'] = 1
            hotInstance.setDataAtCell(x, 5, data.color_code)
            hotInstance.setDataAtCell(x, 6, data.color_name)
          }
        }
        this.colorSelectorComponent.hideModel()
    }
  }


  validateColors(){
    //validate for empty and duplicates
    for(let x = 0 ; x < this.dataColor.length ; x = (x + this.featureComponentCount)){
      //check color is empty
      if(this.dataColor[x].fng_color_code == null || this.dataColor[x].fng_color_code == '' ){
        AppAlert.closeAlert();
        AppAlert.showError({ text : 'FNG color cannot be empty. Line - ' + (x + 1) })
        return false;
      }

      //chek sfg colors are empty
      if(this.featureComponentCount > 1){
        for(let z = x ; z < (x + this.featureComponentCount) ; z++){
          if(this.dataColor[z].sfg_color_code == null || this.dataColor[z].sfg_color_code == '' ){
            AppAlert.closeAlert();
            AppAlert.showError({ text : 'SFG color cannot be empty. Line - ' + (z + 1) })
            return false;
          }
        }
      }

      if(x <= (this.dataColor.length - 1)){
        for(let y = (x + this.featureComponentCount) ; y < this.dataColor.length ; y = (y + this.featureComponentCount)){
            //check for duplicate fng colors
            if(this.dataColor[y]['fng_color_code'] != null && this.dataColor[y]['fng_color_code'] != '' && this.dataColor[y]['fng_color_code'] == this.dataColor[x]['fng_color_code']){
              AppAlert.closeAlert();
              AppAlert.showError({ text : 'Duplicate FNG color. Line - ' + (x+1) + ' and ' + (y+1) })
              return false
            }
        }
      }
    }
    return true
  }


  saveColors(){
    if(this.dataColor.length > 0){ //if only have colors
      let data = {
        costing_id : this.formGroup.get('id').value,
        colors : this.dataColor
      }
      this.processing = true
      AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Saving...','Please wait while saving costing colors')

      if(!this.validateColors()){
        this.processing = false
        return
      }

      this.http.post(this.apiUrl + 'merchandising/costing/save-costing-colors', data)
      .pipe(map(res => res['data']))
      .subscribe(
        res => {
          console.log(res)
          this.processing = false
          AppAlert.closeAlert()
          if(res.status == 'success'){
            this.dataColor = []
            this.loadColorTable(res.colors, res.component_count)
            AppAlert.showSuccess({ text : res.message })
          }
        },
        error => {
          this.processing = false
          AppAlert.closeAlert()
          console.error(error)
          AppAlert.showError({ text : error })
        }
      )
    }
  }


  removeColor(fng_color_id){
    this.processing = true
    this.http.post(this.apiUrl + 'merchandising/costing/remove-costing-color', {fng_color_id : fng_color_id})
    .pipe(map(res => res['data']))
    .subscribe(
      res => {
        this.processing = false
        if(res.status == 'success'){
          this.dataColor = []
          this.loadColorTable(res['colors'], this.featureComponentCount)
          AppAlert.showSuccess({ text : res.message })
        }
        else {
          AppAlert.showError({ text : res.message })
        }
      },
      error => {
        this.processing = false
        console.error(error)
        AppAlert.showError({ text : error })
      }
    )
  }


  loadCostingColors(_costing_id, _feature_component_count){
    this.http.get(this.apiUrl + 'merchandising/costing?type=costing_colors&costing_id=' + _costing_id + '&feature_component_count=' + _feature_component_count)
    .subscribe(
      res => {
        this.dataColor = []
        this.loadColorTable(res['data'], this.featureComponentCount)
      },
      error => {
        console.error(error)
        AppAlert.showError({ text : 'Error occured while loading costing colors' })
      }
    )
  }

  //..................... Size chart tab ---------------------------------------
  //............................................................................

  /*initializeSizeGrid(){
    this.settingsSize = {
      data:this.dataSize,
      columns:[
        { type: 'checkbox', title : ' ' , readOnly: false, data : 'status' , checkedTemplate: 1,  uncheckedTemplate: 0 },
        { type : 'text', title : 'Size', data : 'size_name'}
      ],
      rowHeaders: true,
      //colHeaders: ['Size Chart Name','Size'],
      colWidths: [10],
      filters: true,
      dropdownMenu: true,
      manualColumnResize: true,
      autoColumnSize : true,
      height: 250,
      copyPaste: true,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htMiddle',
      readOnly: true
    }
  }*/

  /*getSizeChart(){
    this.sizeChart$ = this.sizeChartInput$
      .pipe(
         debounceTime(200),
         distinctUntilChanged(),
         tap(() => this.sizeChartLoading = true),
         switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/sizes-chart?type=auto' , {params:{search:term}})
         .pipe(
             tap(() => this.sizeChartLoading = false)
         ))
      );
  }*/

  /*onSizeChartChange(data){
      this.formSizeChart.patchValue({
        chart_description : (data == null) ? null : data.description
      })
      if(data != null){
        this.loadSizeCharSizes(data.size_chart_id)
      }
      else{
        this.dataSize = []
      }
  }*/

  /*loadSizeCharSizes(_size_chart_id){
    this.http.get(this.apiUrl + 'org/sizes-chart?type=chart_sizes&size_chart_id=' + _size_chart_id)
    .subscribe(res => {
      console.log(res)
      for(let x = 0 ; x < res['data'].length ; x++){
        res['data'][x]['status'] = 0
      }
      this.dataSize = res['data']
    },
    error => {
      console.error(error)
    }
   )
 }*/

  /*saveSizeChart() {
    this.processing = true
    let data = {
      costing_id : this.formGroup.get('id').value,
      size_chart_id : this.formSizeChart.get('size_chart_id').value.size_chart_id,
      sizes : this.dataSize
    }

    this.http.post(this.apiUrl + 'merchandising/costing/update-size-chart', data)
    .pipe( map(res => res['data']) )
    .subscribe(
      res => {
        if(res.status == 'success'){
          AppAlert.showSuccess({ text : res.message })
        }
        else {
          AppAlert.showError({ text : res.message })
        }
        this.processing = false
      },
      error => {
        this.processing = false
        console.error(error)
        AppAlert.showError({ text : 'Process error occured while saving' })
      }
    )
  }*/


  /*loadSizeChart(_costing_id){
    this.http.get(this.apiUrl + 'merchandising/costing?type=get_saved_size_chart&costing_id=' + _costing_id)
    .pipe(map(res => res['data']))
    .subscribe(
      res => {
        if(res.size_chart != null) {
          this.formSizeChart.patchValue({
            size_chart_id : res.size_chart,
            chart_description : res.size_chart.description
          })
          this.dataSize = res.sizes
          const hotInstance = this.hotRegisterer.getInstance(this.tblSize);
          hotInstance.render()
        }
        else {
            this.formSizeChart.reset()
            this.dataSize = []
            const hotInstance = this.hotRegisterer.getInstance(this.tblSize);
            hotInstance.render()
        }
      },
      error => {
        AppAlert.showError({ text : 'Error occured while loadin size chart'})
        console.error(error)
      }
    )
  }*/


  //.......................... Country tab .....................................
  //............................................................................

  initializeCountryGrid(){
    this.settingsCountry = {
      data:this.dataCountry,
      columns:[
        { type : 'text', title : 'Country Name', data : 'country_description'},
        { type : 'numeric', title : 'FOB', data : 'fob', readOnly : false, className: 'htRight'}
      ],
      contextMenu : {
        callback: function (key, selection, clickEvent) {
          // Common callback for all options
        },
        items : {
          'add' : {
            name : 'Add Country',
            hidden: (key, selection, clickEvent) => {
              return !this.showSaveButton
            },
            callback : (key, selection, clickEvent) => {
              this.dataCountry.push({
                costing_country_id : 0,
                country_id : 0,
                country_description : '',
                fob : 0,
                edited : 1
              })
              const hotInstance = this.hotRegisterer.getInstance(this.tblCountry);
              hotInstance.render()

              if(selection.length > 0){
                //debugger
                let row = (this.dataCountry.length - 1)
                let start = { row : row, col : 0 }
                let end = { row : row, col : 0 }
                //opem popup automatically
                this.tblCountrySelectedRange = { start : start, end : end }
                this.countrySelectorComponent.openModel()
              }
            }
          },
          'setCountry' : {
            name : 'Set Country',
            hidden: (key, selection, clickEvent) => {
              return !this.showSaveButton
            },
            callback : (key, selection, clickEvent) => {
              if(selection.length > 0){
                let start = selection[0].start;
                let end = selection[0].end;

                if(start.col == end.col && start.col == 0){
                  this.tblCountrySelectedRange = {
                    start : start,
                    end : end
                  }
                  this.countrySelectorComponent.openModel()
                }
              }
            }
          },
          'Remove' : {
            name : 'Remove',
            hidden: (key, selection, clickEvent) => {
              return !this.showSaveButton
            },
            callback : (key, selection, clickEvent) => {
              if(selection.length > 0){
                let start = selection[0].start;
                let end = selection[0].end;
                //chek user right click on merged cell
                if(start.col == end.col && (start.col == 0 || start.col == 1 || start.col == 2)) {
                  AppAlert.showConfirm({
                    'text' : 'Do you want to remove this country?'
                  },(result) => {
                    if (result.value) {
                      if(this.dataCountry[start.row]['costing_country_id'] == 0) {//chek is a not saved color
                        this.dataCountry.splice(start.row, 1) //delete from array
                        const hotInstance = this.hotRegisterer.getInstance(this.tblCountry);
                        hotInstance.render()
                      }
                      else {
                        this.removeCountry(this.dataCountry[start.row]['costing_country_id'])
                      }
                    }
                  })

                }

              }
            }
          },
        }
      },
      cells : (row, col, prop) => {
          var cellProperties = {};

          if(this.dataCountry[row] != undefined){
            if(this.dataCountry[row]['edited'] == 1){ //chek row is edited by user and then change color
              cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
                var args = arguments;
                td.style.background = '#d1e0e0';
                Handsontable.renderers.TextRenderer.apply(this, args);
              }
            }
            else{
              cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
                var args = arguments;
                td.style.background = '#fff';
                Handsontable.renderers.TextRenderer.apply(this, args);
              }
            }
          }
          return cellProperties;
      },
      afterChange : (changes, source) => {
        if(source != null && source.length > 0){
          const hotInstance2 = this.hotRegisterer.getInstance(this.tblCountry);
          //get changed cell value
          let _row = source[0][0]

          if(source[0][1] == 'fob'){
            if(source[0][3] != 0 && (source[0][3] == '' || isNaN(source[0][3]) || source[0][3] < 0)){
              hotInstance2.setDataAtCell(_row, 1, 0)
            }
            else {
              let _fob = source[0][3]
              if(this.countDecimals(_fob) > 2){
                _fob = this.formatDecimalNumber(_fob, 2)
                hotInstance2.setDataAtCell(_row, 1, _fob)
              }
            }
          }
        }
      },
      rowHeaders: true,
      colHeaders: ['Country','FOB'],
      filters: true,
      dropdownMenu: true,
      manualColumnResize: true,
      autoColumnSize : true,
      height: 150,
      copyPaste: true,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htLeft',
      readOnly: true
    }
  }

  onSelectCountry(data){
    if(this.tblCountrySelectedRange != null){
      const hotInstance = this.hotRegisterer.getInstance(this.tblCountry);
      if(this.tblCountrySelectedRange.start.col == 0){ //fng color
        this.dataCountry[this.tblCountrySelectedRange.start.row]['edited'] = 1
        this.dataCountry[this.tblCountrySelectedRange.start.row]['country_id'] = data.country_id
        hotInstance.setDataAtCell(this.tblCountrySelectedRange.start.row , 0, data.country_description)
      }
      this.countrySelectorComponent.hideModel()
    }
  }

  validateCountries(){
    //validate countries
    for(let x = 0 ; x < this.dataCountry.length ; x++){
      if(this.dataCountry[x]['country_id'] == null || this.dataCountry[x]['country_id'] == 0){
        AppAlert.showError({ text : 'Country cannot be empty' })
        return false
      }
      for(let y = (x + 1) ; y < this.dataCountry.length ; y++){
        if(this.dataCountry[x]['country_id'] == this.dataCountry[y]['country_id']){ //has duplicate countries
          AppAlert.showError({ text : 'Duplicate countries' })
          return false
        }
      }
    }
    return true
  }

S
  saveCountries(){
    if(this.dataCountry.length > 0){ //if only have colors
      this.processing = true

      if(!this.validateCountries()){
        this.processing = false
        return
      }
      AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Saving...','Please wait while saving costing countries')

      //const hotInstance1 = this.hotRegisterer.getInstance(this.tblCountry);
      //console.log(hotInstance1.getData())

      let data = {
        costing_id : this.formGroup.get('id').value,
        countries : this.dataCountry
      }

      this.http.post(this.apiUrl + 'merchandising/costing/save-costing-countries', data)
      .pipe(map(res => res['data']))
      .subscribe(
        res => {
          this.processing = false
          AppAlert.closeAlert()
          if(res.status == 'success'){
            this.dataCountry = res.countries
            const hotInstance = this.hotRegisterer.getInstance(this.tblCountry);
            hotInstance.render()
            AppAlert.showSuccess({ text : res.message })
          }
        },
        error => {
          this.processing = false
          AppAlert.closeAlert()
          console.error(error)
          AppAlert.showError({ text : error })
        }
      )
    }
  }

  removeCountry(costing_country_id){
    this.processing = true
    this.http.post(this.apiUrl + 'merchandising/costing/remove-costing-country', {costing_country_id : costing_country_id})
    .pipe(map(res => res['data']))
    .subscribe(
      res => {
        this.processing = false
        if(res.status == 'success'){
          this.dataCountry = res.countries
          const hotInstance = this.hotRegisterer.getInstance(this.tblCountry);
          hotInstance.render()
          AppAlert.showSuccess({ text : res.message })
        }
        else {
          AppAlert.showError({ text : res.message })
        }
      },
      error => {
        this.processing = false
        console.error(error)
        AppAlert.showError({ text : error })
      }
    )
  }

  loadCountries(_costing_id){
    this.http.get(this.apiUrl + 'merchandising/costing?type=get_saved_countries&costing_id=' + _costing_id)
    .subscribe(
      res => {
        this.dataCountry = res['data']
        const hotInstance = this.hotRegisterer.getInstance(this.tblCountry);
        hotInstance.render()
      },
      error => {
        AppAlert.showError({ text : 'Error occured while loading countries'})
        console.error(error)
      }
    )
  }

  //....................... Item Tab ...........................................
  //............................................................................

  initializeRMGrid(){

      if(this.settingsRM != null) {
        return
      }
      this.settingsRM = {
        columns: [
          { type: 'text', title : 'Material Type' , data: 'category_name',strict: true, allowEmpty:false, colWidths : '120px'},
          {
            type: 'text', title : 'Artical Number' , data: 'supplier_reference',
            /*source: (query, process) => {
              $.ajax({
                headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                data: { search: query },
                url: this.url + '?type=artical_numbers' ,
                dataType: 'json',
                success: function (response) {
                  process(response['data']);
                }
              });
            }*/
          },
          { type: 'text', title : 'Item Code' , data: 'master_code', strict: true, allowEmpty:false },
          { type: 'text', title : 'Item Description' , data: 'master_description', strict: true, allowEmpty:false, className: "htLeft" },
          {
            title : 'Fabric Position',
            type: 'autocomplete',
            source: (query, process) => {
              $.ajax({
                url: this.apiUrl + 'merchandising/position?type=handsontable' ,
                dataType: 'json',
                data: { search: query },
                success: function (response) {
                  process(response['data']);
                }
              });
            },
            strict: true,
            data: 'position',
            readOnly: false
          },
          {type: 'dropdown', title : 'UOM' , data: 'uom_code', allowEmpty:false},
          {
            type: 'text', title : 'Color' , data: 'color_name' , /*readOnly: false,strict: true,*/
            /*source: (query, process) => {
              $.ajax({
                url: this.url + '?type=getColorForDivision' ,
                dataType: 'json',
                data: {query: query},
                success: function (response) {
                  process(response);
                }
              });
            }*/
          },
          {
            type: 'text', title : 'Supplier' , data: 'supplier_name', strict: true,
            /*type: 'autocomplete', title : 'Supplier' , data: 'supplier_name' , readOnly: false,strict: true,
            source: (query, process) => {
              $.ajax({
                headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                data: { search: query },
                url: this.apiUrl + 'org/suppliers?type=handsontable' ,
                dataType: 'json',
                success: function (response) {
                  process(response['data']);
                }
              });
            }*/
          },
          {
            type: 'autocomplete', title : 'Origin Type' , data: 'origin_type' , readOnly: false, strict:true, allowEmpty:false,
            source: (query, process) => {
              $.ajax({
                headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                data: { search: query },
                url: this.apiUrl + 'org/origin-types?type=handsontable' ,
                dataType: 'json',
                success: function (response) {
                  process(response['data']);
                }
              });
            }
          },
          {
            type: 'autocomplete', title : 'Garment Option' , data: 'garment_options_description' , readOnly: false, strict:true,
            source: (query, process) => {
              $.ajax({
                headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                data: { search: query },
                url: this.apiUrl + 'org/garmentoptions?type=handsontable' ,
                dataType: 'json',
                success: function (response) {
                  process(response['data']);
                }
              });
            }
          },
          {
            type: 'numeric', title : 'Purchase Price' , data: 'purchase_price' , readOnly: false, allowEmpty:false, className: "htRight"
            /*numericFormat: {
              pattern: '$0,0.0000',
              culture: 'en-US' // this is the default culture, set up for USD
            }*/
          },
          {
            type: 'numeric', title : 'Net Consumption' , data: 'net_consumption' , /*readOnly: false,*/ allowEmpty:false, className: "htRight",
            numericFormat: {pattern: '$0,0.0000'}
          },
          {
            type: 'numeric', title : 'Wastage %' , data: 'wastage', allowEmpty:false, className: "htRight"
          },
          {
            type: 'numeric', title : 'Gross Consumption' , data: 'gross_consumption' , readOnly: true, className: "htRight"
            /*numericFormat: {pattern: '0,0.000000'}*/
          },
          {
            type: 'dropdown', title : 'Operation' , data: 'garment_operation_id' , readOnly: false, strict:true,
            source: (query, process) => {
              $.ajax({
                headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                data: { search: query },
                url: this.apiUrl + 'ie/garment_operations?type=handsontable' ,
                dataType: 'json',
                success: function (response) {
                  process(response['data']);
                }
              });
            }
          },
          /*{
            type: 'dropdown', title : 'Order Type' , data: 'meterial_type' , readOnly: false, strict:true, allowEmpty:false,
            source : ['NONE', 'COLOR WISE', 'SIZE WISE', 'BOTH']
          },*/
          { type: 'numeric', title : 'Freight' , data: 'freight_charges' , readOnly: false, allowEmpty:false, className: "htRight"/*numericFormat: {pattern: '$0,0.0000'}*/},
          { type: 'numeric', title : 'MCQ' , data: 'mcq' , allowEmpty:false, className: "htRight"/*numericFormat: {pattern: '0,0.00'}*/},
          { type: 'numeric', title : 'MOQ' , data: 'moq' , allowEmpty:false, className: "htRight"/*numericFormat: {pattern: '0,0.00'}*/},
          { type: 'numeric', title : 'Surcharge' , data: 'surcharge' , readOnly: false, allowEmpty:false, className: "htRight"/*numericFormat: {pattern: '$0,0.0000'}*/},
          { type: 'numeric', title : 'Total Cost' , data: 'total_cost' , readOnly: true, className: "htRight" /*numericFormat: {pattern: '$0,0.0000'}*/},
          {
            type: 'dropdown', title : 'Shipment Mode' , data: 'ship_mode' , readOnly: false, strict:true,
            source: (query, process) => {
              $.ajax({
                headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                data: { search: query },
                url: this.apiUrl + 'org/ship-modes?type=handsontable' ,
                dataType: 'json',
                success: function (response) {
                  process(response['data']);
                }
              });
            }
          },
          {
            type: 'autocomplete', title : 'Shipment Term' , data: 'ship_term_id' , readOnly: false, strict:true,
            source: (query, process) => {
              $.ajax({
                headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                data: { search: query },
                url: this.apiUrl + 'finance/ship-terms?type=handsontable',
                dataType: 'json',
                success: function (response) {
                  process(response['data']);
                }
              });
            }
          },
          { type: 'numeric', title : 'Lead Time' , data: 'lead_time' , readOnly: false, className: "htRight" /*numericFormat: {pattern: '0,0.00'}*/},
          {
            type: 'autocomplete', title : 'Country Of Origin' , data: 'country_description' , readOnly: false, strict:true,
            source: (query, process) => {
              $.ajax({
                headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                data: { search: query },
                url: this.apiUrl + 'org/countries?type=handsontable' ,
                dataType: 'json',
                success: function (response) {
                  process(response['data']);
                }
              });
            }
          },
          { type: 'text', title : 'Comments' , data: 'comments' , readOnly: false}
        ],
        contextMenu : {
            callback: function (key, selection, clickEvent) {
              // Common callback for all options
            },
            items : {
              'Add' : {
                name : 'Add Item',
                hidden: (key, selection, clickEvent) => {
                  return !this.showSaveButton
                },
                callback : (key, selection, clickEvent) => {
                  let item = {
                    costing_item_id : 0,
                    inventory_part_id : 0,
                    costing_id : this.formGroup.get('id').value,
                    category_code : '',
                    category_name : '',
                    supplier_reference : '',
                    master_description : '',
                    position : '',
                    uom_code : '',
                    color_code : '',
                    supplier_name : '',
                    origin_type : '',
                    garment_options_description : '',
                    unit_price : 0,
                    net_consumption : 0,
                    wastage : 0,
                    gross_consumption : 0,
                    //meterial_type : 'NONE',
                    freight_charges : '0',
                    mcq : 0,
                    surcharge : 0,
                    total_cost : 0,
                    ship_mode : '',
                    ship_term_id : '',
                    lead_time : 0,
                    country_description : '',
                    comments : '',
                    edited : true
                  }

                  if(this.selectedItemType == 'COMPONENT'){
                    item['feature_component_id'] = this.selectedProductFeatureComponent.feature_component_id
                    item['product_component_id'] = this.selectedProductFeatureComponent.product_component_id
                    item['product_silhouette_id'] = this.selectedProductFeatureComponent.product_silhouette_id
                    item['product_component_line_no'] = this.selectedProductFeatureComponent.line_no
                    item['item_type'] = 'COMPONENT'
                  }
                  else {
                    item['feature_component_id'] = null
                    item['product_component_id'] = null
                    item['product_silhouette_id'] = null
                    item['product_component_line_no'] = null
                    item['item_type'] = 'FNG'
                  }
                  this.dataRM.push(item)

                  const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
                /*  let _cell = hotInstance2.getSettings().cell
                  _cell.push({row: (this.dataset2.length - 1), col: 4, readOnly: true})
                  let options = { cell : _cell}
                  hotInstance2.updateSettings(options, false);*/
                  hotInstance2.render()

                  if(selection.length > 0){
                    //debugger
                    let row = (this.dataRM.length - 1)
                    let start = { row : row, col : 0 }
                    let end = { row : row, col : 0 }

                    this.tblItemSelectedRange = { start : start, end : end }
                    hotInstance2.selectRows((this.dataRM.length - 1), )
                    this.itemSelectorComponent.openModel()
                  }
                }
              },
              'Find' : {
                name : 'Find',
                hidden: (key, selection, clickEvent) => {
                  return !this.showSaveButton
                },
                disabled: function () {
                  let selection = this.getSelectedLast()
                  if(selection[0] == selection[2] && selection[1] == selection[3]){
                    if(selection[1] == 0 || selection[1] == 1 || selection[1] == 2){
                      return false
                    }
                    else{
                      return true
                    }
                  }
                  else
                    return true
                },
                callback : (key, selection, clickEvent) => {
                  //console.log(selection)
                  if(selection.length > 0){
                    let start = selection[0].start;
                    let end = selection[0].end;
                    if(start.row == end.row){ //chek user select only single row
                      //this.saveItem(start.row) //save single item
                      this.tblItemSelectedRange = {
                        start : start,
                        end : end
                      }
                      this.itemSelectorComponent.openModel()
                    }

                  }
                }
              },
              'Save' : {
                name : 'Save',
                hidden: (key, selection, clickEvent) => {
                  return !this.showSaveButton
                },
                callback : (key, selection, clickEvent) => {
                  //console.log(selection)
                  if(selection.length > 0){
                    let start = selection[0].start;
                    let end = selection[0].end;
                    if(start.row == end.row){ //chek user select only single row
                      //this.saveItem(start.row) //save single item
                      if(this.dataRM[start.row]['edited'] == true){
                        this.validateSingleItem(start.row) //validate item data and save
                      }
                    }
                    else{
                      AppAlert.showError({text : 'cannot select multiple rows to save'})
                    }
                  }
                }
              },
              'Copy' : {
                name : 'Copy',
                hidden: (key, selection, clickEvent) => {
                  return !this.showSaveButton
                },
                callback : (key, selection, clickEvent) => {
                  if(selection.length > 0){
                    let start = selection[0].start;
                    let end = selection[0].end;
                    if(start.row == end.row){//chek only select single row
                      let obj = JSON.parse(JSON.stringify(this.dataRM[start.row]))
                      debugger
                      obj['edited'] = 1
                      obj['costing_item_id'] = 0
                      this.dataRM.push(obj)
                      const hotInstance = this.hotRegisterer.getInstance(this.tblRM);
                      hotInstance.render()
                      //this.copyItem(this.dataRM[start.row]['costing_item_id']) //copy single item
                    }
                  }
                }
              },
              'Remove' : {
                name : 'Remove',
                hidden: (key, selection, clickEvent) => {
                    return !this.showSaveButton
                },
                callback : (key, selection, clickEvent) => {
                  if(selection.length > 0){
                    let start = selection[0].start;
                    let end = selection[0].end;
                    if(start.row == end.row){//check user select single row
                      //cannot remove item
                      if(this.formGroup.get('revision_no').value > 0 && this.dataRM[start.row].costing_item_id > 0){
                        AppAlert.showError({ text : 'Cannot remove item. BOM alreday created.'})
                      }
                      else {//can remove item
                        AppAlert.showConfirm({
                          'text' : 'Do you want to remove this item?'
                        },(result) => {
                          if (result.value) {
                            if(this.dataRM[start.row]['costing_item_id'] == 0) {//chek is a not saved item
                              this.dataRM.splice(start.row, 1) //delete from array
                              const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
                              hotInstance2.render()
                              this.calculate_rm_cost()
                            }
                            else {
                              this.deleteItem(this.dataRM[start.row]['costing_item_id']) //delete item from db
                            }
                          }
                        })
                      }

                    }
                  }
                }
              },
            }
          },
        mergeCells: [],
        cells: (row, col, prop) => {
          var cellProperties = {};

          if(this.dataRM[row] != undefined){
            if(this.dataRM[row]['edited'] == 1){ //chek row is edited by user and then change color
              cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
                var args = arguments;
                td.style.background = '#d1e0e0';
                Handsontable.renderers.TextRenderer.apply(this, args);
              }
            }
            else{
              cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
                var args = arguments;
                td.style.background = '#fff';
                Handsontable.renderers.TextRenderer.apply(this, args);
              }
            }
          }

          if(this.dataRM[row] != undefined){
            if(this.formGroup.get('revision_no').value > 0 && this.dataRM[row]['costing_item_id']  != null && this.dataRM[row]['costing_item_id']  > 0) { //can not edit item line
              cellProperties['readOnly'] = true;
              return cellProperties;
            }
            else {//can edit the item
              if(col == 5){ //change item uom cell settings
                    //if item description cell not empty, load item uoms
                    if(this.dataRM[row] != undefined && this.dataRM[row]['costing_item_id']  != null && this.dataRM[row]['master_description'] != null && this.dataRM[row]['master_description'] != ''){
                    cellProperties['readOnly'] = false;
                    cellProperties['strict'] = true
                    cellProperties['source'] = (query, process) => {
                      $.ajax({
                        url: this.url + '?type=item_uom',
                        dataType: 'json',
                        data: { item_description : this.dataRM[row]['master_description'] },
                        success: function (response) {
                          process(response['data']);
                        }
                      });
                    }
                  }
                  return cellProperties;
              }
              else if(col == 11){ //change net consumption cell settings//
                //if(this.dataRM[row] != undefined && this.dataRM[row]['category_code'] != 'PAC' && this.permissionService.hasDefined('COSTING_NET_CONSUMPTION_CHANGE')){
                //  cellProperties['readOnly'] = false;
              //  }
                if(this.dataRM[row] != undefined && (this.dataRM[row]['uom_code'] == 'PCS' || this.dataRM[row]['uom_code'] == 'pcs')){
                  cellProperties['readOnly'] = false;
                }
                return cellProperties;
              }
              else if(col == 12){
                if(this.dataRM[row] != undefined && (this.dataRM[row]['uom_code'] == 'PCS' || this.dataRM[row]['uom_code'] == 'pcs')){
                  cellProperties['readOnly'] = false;
                }
                return cellProperties;
              }
              /*else if(col == 7){ //change item supplier cell settings
                if(this.dataRM[row] != undefined && (this.dataRM[row]['supplier_reference'] == null ||  this.dataRM[row]['supplier_reference'] == '')){
                  cellProperties['readOnly'] = false;
                }
                return cellProperties;
              }*/
              else {
                return cellProperties;
              }
            }
          }
        },
        afterChange : (changes, source) => {
          if(source != null && source.length > 0){
            const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
            //get changed cell value
            //let _cell_value = (source[0][3] == undefined || source[0][3] == null || source[0][3] == '') ? 0 : source[0][3]
            let _row = source[0][0]


            if(source[0][1] == 'net_consumption'){
              // gross consumption = net consumption + (net consumption * wastage) / 100
              let _net_consumption = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
              let _wastage = hotInstance2.getDataAtCell(_row, 12)
              _wastage = (_wastage == '' || isNaN(_wastage)) ? 0 : _wastage
              //  if(_net_consumption == '' || isNaN(_net_consumption)){//chek value and if not a number, then set cell value to 0
              //    _net_consumption = 0
              //    //hotInstance2.setDataAtCell(_row, 10, 0)
              //  }
              let decimalCount = this.dataRM[_row]['is_decimal_allowed'] == 1 ? 4 : 0
              if(_net_consumption < 0){
                hotInstance2.setDataAtCell(_row, 11, 0)
              }
              else if(this.countDecimals(_net_consumption) > decimalCount){
                _net_consumption = this.formatDecimalNumber(_net_consumption, decimalCount)
                hotInstance2.setDataAtCell(_row, 11, _net_consumption)
              }

              let gross_consumption = _net_consumption + ((_net_consumption * _wastage) / 100) //net consumption * wastage
              gross_consumption = this.formatDecimalNumber(gross_consumption, 4)
              hotInstance2.setDataAtCell(_row, 13, gross_consumption)
              hotInstance2.setDataAtCell(_row, 19, this.calculate_item_cost(_row))
            }
            else if(source[0][1] == 'wastage'){
              // gross consumption = net consumption + (net consumption * wastage) / 100
              let _wastage = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
              let _net_consumption = hotInstance2.getDataAtCell(_row, 11)
              _net_consumption = (_net_consumption == '' || isNaN(_net_consumption)) ? 0 : parseFloat(_net_consumption)
              // *if(_wastage == '' || isNaN(_wastage)){//chek value and if not a number, then set cell value to 0
              //  _wastage = 0
            //    //hotInstance2.setDataAtCell(_row, 11, 0)
            //  }
            if(_wastage < 0 ){
              hotInstance2.setDataAtCell(_row, 12, 0)
            }
            else if(this.countDecimals(_wastage) > 4){
              _wastage = this.formatDecimalNumber(_wastage, 4)
              hotInstance2.setDataAtCell(_row, 12, _wastage)
            }

              let gross_consumption = (_net_consumption + ((_net_consumption * _wastage) / 100)).toFixed(4)//net consumption * wastage
              gross_consumption = this.formatDecimalNumber(gross_consumption, 4)
              hotInstance2.setDataAtCell(_row, 13, gross_consumption)
              hotInstance2.setDataAtCell(_row, 19, this.calculate_item_cost(_row))
            }
            else if(source[0][1] == 'freight_charges'){
              let _freight_charges = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]

              if(_freight_charges < 0){
                hotInstance2.setDataAtCell(_row, 15, 0)
              }
              else if(this.countDecimals(_freight_charges) > 4){
                _freight_charges = this.formatDecimalNumber(_freight_charges, 4)
                hotInstance2.setDataAtCell(_row, 15, _freight_charges)
              }
              hotInstance2.setDataAtCell(_row, 19, this.calculate_item_cost(_row))
            }
            else if(source[0][1] == 'surcharge'){
              let _surcharge = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]

              if(_surcharge < 0){
                hotInstance2.setDataAtCell(_row, 18, 0)
              }
              else if(this.countDecimals(_surcharge) > 4){
                _surcharge = this.formatDecimalNumber(_surcharge, 4)
                hotInstance2.setDataAtCell(_row, 18, _surcharge)
              }
              hotInstance2.setDataAtCell(_row, 19, this.calculate_item_cost(_row))
            }
            else if(source[0][1] == 'purchase_price'){
              let _purchase_price = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
              let _unit_price = (this.dataRM[_row].unit_price == null || this.dataRM[_row].unit_price == '') ? 0 : parseFloat(this.dataRM[_row].unit_price)
              //chek purchae price with unit price, cannot exceed unit price
              if(_purchase_price > _unit_price || _purchase_price < 0){
                _purchase_price = source[0][2]
                _purchase_price = this.formatDecimalNumber(_purchase_price, 4)
                hotInstance2.setDataAtCell(_row, 10, _purchase_price)
              }
              else {
                if(this.countDecimals(_purchase_price) > 4){
                  _purchase_price = this.formatDecimalNumber(_purchase_price, 4)
                  hotInstance2.setDataAtCell(_row, 10, _purchase_price)
                }
              }
              hotInstance2.setDataAtCell(_row, 19, this.calculate_item_cost(_row))
            }
            else if(source[0][1] == 'mcq'){
              let _mcq = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
              if(this.countDecimals(_mcq) > 4){
                _mcq = this.formatDecimalNumber(_mcq, 4)
                hotInstance2.setDataAtCell(_row, 16, _mcq)
              }
            }
            else if(source[0][1] == 'lead_time'){
              let _lead_time = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]

              if(_lead_time < 0){
                hotInstance2.setDataAtCell(_row, 22, 0)
              }
              else if(this.countDecimals(_lead_time) > 4){
                _lead_time = this.formatDecimalNumber(_lead_time, 4)
                hotInstance2.setDataAtCell(_row, 22, _lead_time)
              }
            }
            else if(source[0][1] == 'total_cost'){
              this.calculate_rm_cost()
            }
            else if(source[0][1] == 'category_name'){
              if(source[0][2] != source[0][3]){//chek new value and old value
                hotInstance2.setDataAtCell(_row, 3, null)
                hotInstance2.setDataAtCell(_row, 5, null)
              }
              this.calculate_rm_cost()
            }
            else if(source[0][1] == 'master_description'){
              if(source[0][2] != source[0][3]){//chek new value and old value
                hotInstance2.setDataAtCell(_row, 5, null)
              }
            }
            /*else if(source[0][1] == 'meterial_type'){
              if(source[0][2] != 'NONE' && source[0][2] != 'COLOR WISE' && source[0][2] != 'SIZE WISE' && source[0][2] != 'BOTH'){//chek new value and old value
                hotInstance2.setDataAtCell(_row, 14, 'NONE')
              }
            }*/
            else if(source[0][1] == 'origin_type'){
              if(source[0][3] == 'IMPORT'){
                hotInstance2.setDataAtCell(_row, 20, 'SEA')
              }
              else{
                hotInstance2.setDataAtCell(_row, 20, null)
              }
            }
            else if(source[0][1] == 'ship_mode'){
              if(source[0][3] == 'SEA'){
                hotInstance2.setDataAtCell(_row, 21, 'FOB')
              }
              else{
                hotInstance2.setDataAtCell(_row, 21, null)
              }
            }
            else if(source[0][1] == 'supplier_reference'){
              if(source[0][3] == null || source[0][3] == ''){ //enable supplier name column
                hotInstance2.setCellMeta(_row, 7, 'readOnly' , 'false')
              }
              else { //disable supplier column
                hotInstance2.setCellMeta(_row, 7, 'readOnly' , 'true')
              }
            }
            else if(source[0][1] == 'uom_code'){
              if(source[0][3] == null || source[0][3] == ''){
                this.dataRM[_row]['is_decimal_allowed'] = 1
              }
              else {
                this.http.get(this.apiUrl + 'org/uom/' + source[0][3])
                .pipe(map(res => res['data']))
                .subscribe(
                  res => {
                    this.dataRM[_row]['is_decimal_allowed'] = res.is_decimal_allowed
                  },
                  error => {
                    this.dataRM[_row]['is_decimal_allowed'] = 1
                  }
                )

              }
            }
            /*else if(source[0][1] == 'uom_code'){
              debugger
              if(source[0][3] == null || source[0][3] == '' || source[0][3] != 'PCS'){
                hotInstance2.setDataAtCell(_row, 11, 0)
                hotInstance2.setDataAtCell(_row, 12, 0)
                hotInstance2.setCellMeta(_row, 11, 'readOnly' , 'true')
                hotInstance2.setCellMeta(_row, 12, 'readOnly' , 'true')
              }
              else {
                hotInstance2.setCellMeta(_row, 11, 'readOnly' , 'false')
                hotInstance2.setCellMeta(_row, 12, 'readOnly' , 'false')
              }
            }*/
            else if(source[0][1] == 'comments'){
              if(source[0][3] != null && source[0][3] != ''){ //enable supplier name column
                let str = source[0][3].toUpperCase()
                if(!(str === source[0][3])){
                  hotInstance2.setDataAtCell(_row, 24, str)
                }
              }
            }

            if(_row != undefined && _row != null && this.dataRM.length > 0 && (source[0][2] != source[0][3])){
              this.dataRM[_row]['edited'] = true //change editaed row status to edit
              hotInstance2.render()
            }
          }
        },
        manualColumnResize: true,
        autoColumnSize : true,
        rowHeaders: true,
        height: 300,
        stretchH: 'all',
        selectionMode: 'single',
        //fixedColumnsLeft: 4,
        //className: 'htCenter htMiddle',
        className: "htLeft",
        readOnly: true,
      }

  }


  validateSingleItem(_row) {
    this.processing = true
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Saving...','Please wait while saving item')
    let _rowData =  this.dataRM[_row]

    if(this.validateData(_rowData) == true) {
      //check for duplicate items
      /*for(let x = 0 ; x < this.dataRM.length ; x++){
        if(x != _row){
          if(_rowData['master_description'] == this.dataRM[x]['master_description'] && _rowData['color_code'] == this.dataRM[x]['color_code']){
            this.processing = false
            AppAlert.closeAlert()
            AppAlert.showError({ text : 'Duplicate Item'})
            return
          }
        }
      }*/
      //this.saveItem(_row)
      const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);//run handson table inbuilt validation
      hotInstance2.validateCells( (valid) => {
        if (valid) {
         this.saveItem(_row)
        }
        else {
          setTimeout(() => {
          this.processing = false
          AppAlert.closeAlert()
           AppAlert.showError({ html : '<span> Incorrect Item Details </span>'})
          }, 500)
        }
      })
    }
    else {
      this.processing = false
    }
  }


  validateAllItems(){
    this.processing = true
    let errStatus = false
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Saving...','Please wait while saving items')
    let unsaved_items = []
    let unsaved_items_rows = []
    for(let x = 0 ; x < this.dataRM.length ; x++){
      if(this.dataRM[x]['edited'] == true){//get only edited rows
        //validate item data
        if(this.validateData(this.dataRM[x])){ //validate items
          //chek for duplicate items
          /*for(let y = 0 ; y < this.dataRM.length ; y++){
            if(x != y){
              if(this.dataRM[x]['inventory_part_id'] == this.dataRM[y]['inventory_part_id'] && this.dataRM[x]['color_code'] == this.dataRM[y]['color_code']){
                this.processing = false
                AppAlert.closeAlert()
                AppAlert.showError({ text : 'Duplicate Item'})
                return
              }
            }
          }*/
          unsaved_items.push(this.dataRM[x])
          unsaved_items_rows.push(x)
        }
        else{
          errStatus = true
          this.processing = false
          //setTimeout(() => { AppAlert.closeAlert() }, 500)
          return
        }
      }
    }

    //this.saveAllItemChanges(unsaved_items)
    if(!errStatus){
      const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
      hotInstance2.validateCells((valid) => {
        if (valid) {
          this.saveAllItemChanges(unsaved_items)
        }
        else{
          this.processing = false
          AppAlert.closeAlert()
          AppAlert.showError({ html : '<span> Incorrect Item Details </span>'})
        }
      })
    }
  }


  validateData(_itemData) {//validate finish good item list
    let errCount = 0
    let str = ''
    if(_itemData.category_name == null || _itemData.category_name == ''){
      str += 'Incorrect item category name <br>'
      errCount++
    }
    if(_itemData.master_description == null || _itemData.master_description == ''){
      str += 'Incorrect master description <br>'
      errCount++
    }
    if(_itemData.uom_code == null || _itemData.uom_code == ''){
      str += 'Incorrect UOM <br>'
      errCount++
    }
    if(_itemData.supplier_name == null || _itemData.supplier_name == ''){
      str += 'Incorrect Supplier <br>'
      errCount++
    }
    if(_itemData.origin_type == null || _itemData.origin_type == ''){
      str += 'Incorrect Origin Type <br>'
      errCount++
    }
    else if(_itemData.origin_type == 'IMPORT' && (_itemData.ship_mode == null || _itemData.ship_mode == '')){
      str += 'Incorrect shipment mode <br>'
      errCount++
    }

    /*if(_itemData.meterial_type == null || _itemData.meterial_type == ''){
      str += 'Incorrect order type <br>'
      errCount++
    }*/
    if(_itemData.ship_mode == 'SEA' && (_itemData.ship_term_id == null || _itemData.ship_term_id == '')){
      str += 'Incorrect shipment term <br>'
      errCount++
    }
    if(!this.validateNumber(_itemData.unit_price)){
      str += 'Incorrect unit price <br>'
      errCount++
    }
    if(!this.validateNumber(_itemData.net_consumption)){
      str += 'Incorrect Net Consumption <br>'
      errCount++
    }
    if(!this.validateNumber(_itemData.wastage)){
      str += 'Incorrect wastage <br>'
      errCount++
    }
    if(!this.validateNumber(_itemData.gross_consumption)){
      str += 'Incorrect gross consumption <br>'
      errCount++
    }
    if(!this.validateNumber(_itemData.freight_charges)){
      str += 'Incorrect Freight Charges <br>'
      errCount++
    }
    if(!this.validateNumber(_itemData.mcq)){
      str += 'Incorrect MCQ <br>'
      errCount++
    }
    if(!this.validateNumber(_itemData.surcharge)){
      str += 'Incorrect Surcharge <br>'
      errCount++
    }
    if(!this.validateNumber(_itemData.total_cost)){
      str += 'Incorrect total cost <br>'
      errCount++
    }

    if(errCount > 0){
      AppAlert.closeAlert()
      AppAlert.showError({ html : '<span>' + str + '</span>'})
      return false
    }
    else {
      return true
    }
  }


  saveItem(_row){ //save single item
    let _itemData = this.dataRM[_row]
    /*if(this.validateData(_itemData) == false) //validate item
      return
    this.processing = true
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Saving...','Please wait while saving item')*/
    let saveOrUpdate$ = null;
    if(_itemData.costing_item_id <= 0){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/costing-items', { item_data : _itemData } );
    }
    else{
      saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/costing-items/' + _itemData.costing_item_id , { item_data : _itemData });
    }

    saveOrUpdate$.subscribe(
      (res) => {
          this.processing = false
          //this.snotifyService.success(res.data.message, this.tosterConfig)
          this.dataRM[_row] = res.data.item
          const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
          hotInstance2.render()

          let data = res.data.costing

          this.formGroup.patchValue({
            fabric_cost : data.fabric_cost,
            trim_cost : data.trim_cost,
            elastic_cost : data.elastic_cost,
            packing_cost : data.packing_cost,
            other_cost : data.other_cost,
            total_cost : data.total_cost,
            epm : data.epm,
            np_margine : data.np_margine,
            total_rm_cost : data.total_rm_cost,
            labour_cost : data.labour_cost,
            finance_cost : data.finance_cost,
            coperate_cost : data.coperate_cost,
          })

          this.showSendButton = (this.formGroup.get('status').value == 'CREATE' && data.consumption_required_notification_status == 0 && data.consumption_added_notification_status == 0) ? true : false
          this.showNotifyButton = data.consumption_required_notification_status == 1 ? true : false
          //setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({ text : res.data.message})
        //  }, 500)
      },
      (error) => {
        this.processing = false
        AppAlert.closeAlert()
        AppAlert.showError({ text: 'Process Error'})
        console.log(error)
      }
    );
  }


  saveAllItemChanges(unsaved_items){ //save all items
  //  this.processing = true

    if(unsaved_items.length > 0){
      //AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Saving...','Please wait while saving items')
      this.http.post(this.apiUrl + 'merchandising/costing-items-save', { items : unsaved_items } )
      .subscribe(
        (res) => {
          this.processing = false
          this.dataRM = []
          this.dataRM = res['data']['items']
          const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
          hotInstance2.render()

          let data = res['data']['costing']
          this.formGroup.patchValue({
            fabric_cost : data.fabric_cost,
            trim_cost : data.trim_cost,
            elastic_cost : data.elastic_cost,
            packing_cost : data.packing_cost,
            other_cost : data.other_cost,
            total_cost : data.total_cost,
            epm : data.epm,
            np_margine : data.np_margine,
            total_rm_cost : data.total_rm_cost,
            labour_cost : data.labour_cost,
            finance_cost : data.finance_cost,
            coperate_cost : data.coperate_cost,
          })

          this.showSendButton = (this.formGroup.get('status').value == 'CREATE' && data.consumption_required_notification_status == 0 && data.consumption_added_notification_status == 0) ? true : false
          this.showNotifyButton = data.consumption_required_notification_status == 1 ? true : false
          //setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({text : res['data']['message']})
          //}, 500)
        },
        error => {
          this.processing = false
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({text : error})
          }, 500)
        }
      )
    }
    else{
      this.processing = false
      setTimeout(() => {
        AppAlert.closeAlert()
      }, 500)
    }
  }


  copyItem(_id){ //copy single item
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Copying...','Please wait while copying item')

    this.http.post(this.apiUrl + 'merchandising/costing-items-copy', {id : _id})
    .subscribe(res => {
      if(res['data']['status'] == 'success'){
        this.dataRM.push(res['data']['item'])
        const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
        hotInstance2.render()
        this.calculate_rm_cost()
        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showSuccess({ text : res['data']['message'] })
        }, 500)
      }
      else{
        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showError({ text : 'Process Error'})
        }, 500)
      }
    },
    error => {
      console.log(error)
      setTimeout(() => {
        AppAlert.closeAlert()
        AppAlert.showError({ text : error})
      }, 500)
    }
  )
  }


  calculate_item_cost(_row){
    const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
    // gross consumption = net consumption + (net consumption * wastage) / 100
    let net_consumption = hotInstance2.getDataAtCell(_row, 11)
    if(net_consumption == null || net_consumption == '' || isNaN(net_consumption)){ //check for incorect values
      //hotInstance2.setDataAtCell(_row, 10, 0)
      net_consumption = 0;
    }
    net_consumption = parseFloat(net_consumption)

    let wastage = hotInstance2.getDataAtCell(_row, 12)
    if(wastage == null || wastage == '' || isNaN(wastage)){ //check for incorect values
      //hotInstance2.setDataAtCell(_row, 11, 0)
      wastage = 0;
    }
    wastage = parseFloat(wastage)

    let gross_consumption = net_consumption + ((net_consumption * wastage) / 100)
    let unit_price = hotInstance2.getDataAtCell(_row, 10)
    if(unit_price == null || unit_price == '' || isNaN(unit_price)){ //check for incorect values
    //  hotInstance2.setDataAtCell(_row, 9, 0)
      unit_price = 0;
    }
    unit_price = parseFloat(unit_price)

    let freight_charges = hotInstance2.getDataAtCell(_row, 15)//parseFloat(hotInstance2.getDataAtCell(_row, 14))
    if(freight_charges == null || freight_charges == '' || isNaN(freight_charges)){ //check for incorect values
      //hotInstance2.setDataAtCell(_row, 14, 0)
      freight_charges = 0;
    }
    else{
      freight_charges = parseFloat(hotInstance2.getDataAtCell(_row, 15))
    }

    let surcharge = hotInstance2.getDataAtCell(_row, 18)//parseFloat(hotInstance2.getDataAtCell(_row, 16))
    if(surcharge == null || surcharge == '' || isNaN(surcharge)){ //check for incorect values
      //hotInstance2.setDataAtCell(_row, 16, 0)
      surcharge = 0;
    }
    else{
      surcharge = parseFloat(hotInstance2.getDataAtCell(_row, 18))
    }

    let total_cost = ((gross_consumption * unit_price) + freight_charges + surcharge)
    total_cost = this.formatDecimalNumber(total_cost, 4)
    return total_cost
  }


  calculate_rm_cost(){
    const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
    let _fabricCost = 0
    let _elastcCost = 0
    let _packingCost = 0
    let _trimCost = 0
    let _rmCost = 0
    for(let x = 0 ; x < this.dataRM.length ; x++){
      let itemCost = parseFloat(hotInstance2.getDataAtCell(x, 19))
      if(/*hotInstance2.getDataAtCell(x, 0)*/this.dataRM[x]['category_code'] == 'FAB'){
        _fabricCost += itemCost
      }
      else if(/*hotInstance2.getDataAtCell(x, 0)*/this.dataRM[x]['category_code'] == 'ELA'){
        _elastcCost += itemCost
      }
      else if(/*hotInstance2.getDataAtCell(x, 0)*/this.dataRM[x]['category_code'] == 'PAC'){
        _packingCost += itemCost
      }
      else if(this.dataRM[x]['category_code'] == 'TRM'){
        _trimCost += itemCost
      }
      _rmCost += itemCost
    }
    this.fabricCost = this.formatDecimalNumber(_fabricCost, 4)
    this.elastcCost = this.formatDecimalNumber(_elastcCost, 4)
    this.packingCost = this.formatDecimalNumber(_packingCost, 4)
    this.trimCost = this.formatDecimalNumber(_trimCost, 4)
    this.rmCost = this.formatDecimalNumber(_rmCost, 4)
  }


  deleteItem(_id){ //delete single item
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Deleting...','Please wait while deleting item')

    this.http.delete(this.apiUrl + 'merchandising/costing-items/' + _id)
    .subscribe(res => {
      this.dataRM = res['data']['items']
      const hotInstance2 = this.hotRegisterer.getInstance(this.tblRM);
      hotInstance2.render()
      this.calculate_rm_cost()

      let data = res['data']['costing']
      this.formGroup.patchValue({
        fabric_cost : data.fabric_cost,
        trim_cost : data.trim_cost,
        elastic_cost : data.elastic_cost,
        packing_cost : data.packing_cost,
        other_cost : data.other_cost,
        total_cost : data.total_cost,
        epm : data.epm,
        np_margine : data.np_margine,
        total_rm_cost : data.total_rm_cost,
        labour_cost : data.labour_cost,
        finance_cost : data.finance_cost,
        coperate_cost : data.coperate_cost,
      })

      this.showSendButton = (this.formGroup.get('status').value == 'CREATE' && data.consumption_required_notification_status == 0 && data.consumption_added_notification_status == 0) ? true : false
      this.showNotifyButton = data.consumption_required_notification_status == 1 ? true : false

      setTimeout(() => {
        AppAlert.closeAlert()
        AppAlert.showSuccess({ text : res['data']['message'] })
      }, 500)
    },
    error => {
      console.log(error)
      setTimeout(() => {
        AppAlert.closeAlert()
        AppAlert.showError({ text : error})
      }, 500)
    }
  )
  }


  onSelectItem(data){
    //console.log(data)
    const hotInstance = this.hotRegisterer.getInstance(this.tblRM);
    let rowIndex = this.tblItemSelectedRange.start.row
    hotInstance.setDataAtCell(rowIndex, 0, data.category_name)
    hotInstance.setDataAtCell(rowIndex, 1, data.supplier_reference)
    hotInstance.setDataAtCell(rowIndex, 2, data.master_code)
    hotInstance.setDataAtCell(rowIndex, 3, data.master_description)
    hotInstance.setDataAtCell(rowIndex, 10, data.standard_price)
    hotInstance.setDataAtCell(rowIndex, 16, data.mcq)
    hotInstance.setDataAtCell(rowIndex, 17, data.moq)
    hotInstance.setDataAtCell(rowIndex, 11, 0)
    //set color if exists
    if(data.color_code != undefined && data.color_code != null){
      hotInstance.setDataAtCell(rowIndex, 6, data.color_name)
    }
    else{
      hotInstance.setDataAtCell(rowIndex, 6, '')
    }
    hotInstance.setDataAtCell(rowIndex, 7, (data.supplier_name == undefined || data.supplier_name == null) ? '' : data.supplier_name)

    this.dataRM[rowIndex]['inventory_part_id'] = data.master_id
    this.dataRM[rowIndex]['category_code'] = data.category_code
    this.dataRM[rowIndex]['color_id'] = data.color_id
    this.dataRM[rowIndex]['supplier_id'] = data.supplier_id
    this.dataRM[rowIndex]['unit_price'] = data.standard_price
    this.itemSelectorComponent.hideModel()
    this.calculate_rm_cost()
  }


  loadProductComponents(_style_id){
    this.http.get(this.apiUrl + 'merchandising/costing?type=get_product_feature_components&style_id=' + _style_id)
    .subscribe(
      res => {
        this.dataProductComponents = res['data']
        const hotInstance = this.hotRegisterer.getInstance(this.tblProductComponents);
        hotInstance.render()
      },
      error => {
        console.error(error)
      }
    )
  }


  initializeProductComponentGrid(){
    this.settingsProductComponents = {
      data : this.dataProductComponents,
      columns:[
        /*{ type: 'text', title : 'Feature' , data: 'product_feature_description' , readOnly: true},*/
        { type: 'text', title : 'Product Component' , data: 'product_component_description' , readOnly: true},
        { type: 'text', title : 'Product Silhouette' , data: 'product_silhouette_description' , readOnly: true},
      ],
      /*afterSelectionEnd : (obj, row1, col1, row2, col2) => {
        if(row1 == row2){
          this.selectedProductFeatureComponent = JSON.parse(JSON.stringify(this.dataProductComponents[row1]))
          const hotInstance = this.hotRegisterer.getInstance(this.tblProductComponents);
          hotInstance.render()
          this.loadCostingItems(this.formGroup.get('id').value, this.selectedProductFeatureComponent.feature_component_id)
        }
      },*/
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
          },
          items : {
            'view_items' : {
              name : 'View Items',
              /*hidden: (key, selection, clickEvent) => {
                return !this.showSaveButton
              },*/
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  let end = selection[0].end;
                  if(start.row == end.row){ //same row selected
                    this.selectedProductFeatureComponent = JSON.parse(JSON.stringify(this.dataProductComponents[start.row]))
                    const hotInstance = this.hotRegisterer.getInstance(this.tblProductComponents);
                    hotInstance.render()
                    this.loadCostingItems(this.formGroup.get('id').value, this.selectedProductFeatureComponent.feature_component_id)
                  }
                }
              }
            },
            'copy_items' : {
              name : 'Copy Items',
              hidden: (key, selection, clickEvent) => {
                if(this.showSaveButton == false || this.selectedProductFeatureComponent == null){
                  return true;
                }
                else { return false; }
              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  let end = selection[0].end;
                  if(start.row == end.row){ //same row selected
                    if(this.selectedProductFeatureComponent != null){
                      this.copiedProductFeatureComponent = JSON.parse(JSON.stringify(this.selectedProductFeatureComponent))
                    }
                  }
                }
              }
            },
            'paste_items' : {
              name : 'Paste Items',
              hidden: (key, selection, clickEvent) => {
                if(this.showSaveButton == false || this.copiedProductFeatureComponent == null || this.copiedProductFeatureComponent.feature_component_id == this.selectedProductFeatureComponent.feature_component_id){
                  return true;
                }
                else { return false; }
              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  let end = selection[0].end;
                  if(start.row == end.row){ //same row selected
                    //check selected the same feature component id
                    if(this.copiedProductFeatureComponent != null &&  this.selectedProductFeatureComponent != null){
                      if(this.selectedProductFeatureComponent.feature_component_id != this.copiedProductFeatureComponent.feature_component_id){
                        this.copyComponentItems(this.copiedProductFeatureComponent.feature_component_id, this.selectedProductFeatureComponent.feature_component_id);
                      }
                    }
                  }
                }
              }
            },
          }
      },
      cells : (row, col, prop) => {
          var cellProperties = {};

          if(this.dataProductComponents[row] != undefined){
            if(this.selectedProductFeatureComponent != null && this.selectedProductFeatureComponent.feature_component_id == this.dataProductComponents[row]['feature_component_id']){ //chek row is edited by user and then change color
              cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
                var args = arguments;
                td.style.background = '#d1e0e0';
                Handsontable.renderers.TextRenderer.apply(this, args);
              }
            }
            else{
              cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
                var args = arguments;
                td.style.background = '#fff';
                Handsontable.renderers.TextRenderer.apply(this, args);
              }
            }
          }
          return cellProperties;
      },
      rowHeaders: true,
      colHeaders: ['Finish Good','FG Color','Semi FG Code','Semi FG Color'],
      filters: true,
      dropdownMenu: true,
      manualColumnResize: true,
      autoColumnSize : true,
      height: 150,
      copyPaste: true,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htMiddle',
      readOnly: true
    }
  }


  loadCostingItems(_costing_id, _feature_component_id){
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading items')
    this.http.get(this.apiUrl + 'merchandising/costing-items?type=costing_items&costing_id='+_costing_id+"&feature_component_id="+_feature_component_id)
    .subscribe(
      res => {
        this.dataRM = res['data']
        const hotInstance = this.hotRegisterer.getInstance(this.tblRM);
        hotInstance.render()
        setTimeout(()=>{
          this.calculate_rm_cost()
          AppAlert.closeAlert()
        }, 500)
      },
      error => {
        AppAlert.closeAlert()
        AppAlert.showError('Error occured while loading items')
        console.error(error)
      }
    )
  }


  copyComponentItems(_fromFeatureComponentId, _toFeatureComponentId){
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Copping...','Please wait while copping items')
    let reqData = {
      costing_id : this.formGroup.get('id').value,
      from_feature_component_id : _fromFeatureComponentId,
      to_feature_component_id : _toFeatureComponentId
    }
    this.http.post(this.apiUrl + 'merchandising/costing-items/copy-component-items', reqData)
    .subscribe(
      res => {
        if(res['status'] == 'success'){
          this.copiedProductFeatureComponent = null //clear coopied feature component
          //load new items
          this.dataRM = res['items']
          const hotInstance = this.hotRegisterer.getInstance(this.tblRM);
          hotInstance.render() //load new items
          //update header dataFG
          let costing = res['costing']
          this.formGroup.patchValue({
            fabric_cost : costing.fabric_cost,
            trim_cost : costing.trim_cost,
            elastic_cost : costing.elastic_cost,
            packing_cost : costing.packing_cost,
            other_cost : costing.other_cost,
            total_cost : costing.total_cost,
            epm : costing.epm,
            np_margine : costing.np_margine,
            total_rm_cost : costing.total_rm_cost,
            labour_cost : costing.labour_cost,
            finance_cost : costing.finance_cost,
            coperate_cost : costing.coperate_cost,
          })

          setTimeout(()=>{
            this.calculate_rm_cost() //calculate summery
            AppAlert.closeAlert()
            AppAlert.showSuccess({text : res['message']})
          }, 500)
        }
        else {
          AppAlert.closeAlert()
          AppAlert.showError({text : res['message']})
        }
      },
      error => {
        AppAlert.closeAlert()
        AppAlert.showError({text : 'Error occured while copping items'})
      }
    )
  }


  onItemsTypeChange(_type){
    this.selectedItemType = _type
    this.dataRM = []
    if(_type == 'FNG'){
      this.selectedProductFeatureComponent = null
      this.copiedProductFeatureComponent = null
      this.loadFinishgoodItems(this.formGroup.get('id').value)
    }
  }


  loadFinishgoodItems(_costing_id){
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading items')
    this.http.get(this.apiUrl + 'merchandising/costing-items?type=costing_finish_good_items&costing_id='+_costing_id)
    .subscribe(
      res => {
        this.dataRM = res['data']
        const hotInstance = this.hotRegisterer.getInstance(this.tblRM);
        hotInstance.render()
        setTimeout(()=>{
          this.calculate_rm_cost()
          AppAlert.closeAlert()
        }, 500)
      },
      error => {
        AppAlert.closeAlert()
        AppAlert.showError('Error occured while loading items')
        console.error(error)
      }
    )
  }

  //finish goods and semi finish finish_goods...................................

  initializeFGGrid(){
    if(this.settingsFG != null) {
      return
    }
    this.settingsFG = {
      data:this.dataFG,
      columns:[
        { type: 'text', title : 'Country' , data: 'country_description'},
        { type: 'text', title : 'FNG Code' , data: 'fng_code'},
        { type: 'text', title : 'FNG Description' , data: 'fng_description'},
        { type: 'text', title : 'FNG Color Code' , data: 'fng_color_code'},
        { type: 'text', title : 'FNG Color Name' , data: 'fng_color_name'},
        { type: 'text', title : 'SFG Code' , data: 'sfg_code'},
        { type: 'text', title : 'SFG Description' , data: 'sfg_description'},
        { type: 'text', title : 'SFG Color Code' , data: 'sfg_color_code'},
        { type: 'text', title : 'SFG Color Name' , data: 'sfg_color_name'}
      ],
      rowHeaders: true,
      //colHeaders: ['FG Code','SFG Code','Description','Color','Country'],
      //filters: true,
      dropdownMenu: true,
      manualColumnResize: true,
      autoColumnSize : true,
      height: 300,
      copyPaste: true,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htMiddle',
      readOnly: true
    }
  }


  loadFinishGoods(_costing_id){
    this.http.get(this.apiUrl + 'merchandising/costing?type=costing_finish_goods&costing_id=' + _costing_id)
    .subscribe(
      res => {
        this.dataFG = []
        this.loadFinishGoodTable(res['data'], this.featureComponentCount)
      },
      error => {
        console.error(error)
        AppAlert.showError({ text : 'Error occured while loading finish goods' })
      }
    )
  }


  loadFinishGoodTable(_dataSet, _componentCount){ //load finish good table with merged cells
    this.dataFG = _dataSet//this.dataColor.concat(_dataSet);
    const hotInstance = this.hotRegisterer.getInstance(this.tblFG);
    let mcells = []
    for(let x = 0 ; x < this.dataFG.length ; (x = x + _componentCount)){
      mcells.push(
        {row: x, col: 0, rowspan: _componentCount, colspan: 1},
        {row: x, col: 1, rowspan: _componentCount, colspan: 1},
        {row: x, col: 2, rowspan: _componentCount, colspan: 1},
        {row: x, col: 3, rowspan: _componentCount, colspan: 1},
        {row: x, col: 4, rowspan: _componentCount, colspan: 1}
      )
    }
    let options = {
       mergeCells : mcells
    };
    hotInstance.updateSettings(options, false);
    hotInstance.render()
  }

  //SMV Details ................................................................

  initializeSMVGrid(){
    this.settingsSMV = {
      data:this.dataSMV,
      columns:[
        { type: 'text', title : 'Product Component' , data: 'product_component_description'},
        { type: 'text', title : 'Product Silhouette' , data: 'product_silhouette_description'},
        { type: 'text', title : 'Operation' , data: 'garment_operation_name'},
        { type: 'text', title : 'SMV' , data: 'smv', className: "htRight"},
      ],
      rowHeaders: true,
      //colHeaders: ['Operation','Component','SMV'],
      //filters: true,
      //dropdownMenu: true,
      manualColumnResize: true,
      autoColumnSize : true,
      height: 250,
      copyPaste: true,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htMiddle',
      readOnly: true
    }
  }


  loadSMVDetails(_costing_id){
    this.http.get(this.apiUrl + 'merchandising/costing?type=costing_smv_details&costing_id=' + _costing_id)
    .subscribe(
      res => {
        this.dataSMV = []
        this.loadSMVTable(res['data'], this.featureComponentCount)
      },
      error => {
        console.error(error)
        AppAlert.showError({ text : 'Error occured while loading SMV details' })
      }
    )
  }


  loadSMVTable(_dataSet, _componentCount){ //load finish good table with merged cells
    this.dataSMV = _dataSet
    const hotInstance = this.hotRegisterer.getInstance(this.tblSMV);
    /*let mcells = []
    for(let x = 0 ; x < this.dataSMV.length ; (x = x + _componentCount)){
      mcells.push(
        {row: x, col: 0, rowspan: _componentCount, colspan: 1},
        {row: x, col: 1, rowspan: _componentCount, colspan: 1},
        {row: x, col: 2, rowspan: _componentCount, colspan: 1},
        {row: x, col: 3, rowspan: _componentCount, colspan: 1},
        {row: x, col: 4, rowspan: _componentCount, colspan: 1}
      )
    }
    let options = {
       mergeCells : mcells
    };
    hotInstance.updateSettings(options, false);*/
    hotInstance.render()
  }

  //Bom generation .............................................................

  generateBom(){
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Genarating...','Please wait while genarating BOM')
    this.http.post(this.apiUrl + 'merchandising/costing/generate-bom', {costing_id : this.formGroup.get('id').value})
    .pipe(map(res => res['data']))
    .subscribe(
      res => {
        AppAlert.closeAlert()
        if(res.status == 'success'){
          AppAlert.showSuccess({text : res.message})
        }
      },
      error => {
        AppAlert.closeAlert()
        AppAlert.showError({text : 'Error occured while generating BOM'})
      }
    )
  }

  //Notifications ..............................................................

  notifyCadTeam(){
    AppAlert.showConfirm({
      'text' : 'Do you want to notify CAD / IE team?'
    },(result) => {
        if (result.value) {
          this.processing = true

          if(this.checkForUnsavedData() == true){
            this.http.post(this.apiUrl + 'merchandising/costing/notify-cad-team', {costing_id : this.formGroup.get('id').value})
            .subscribe(
              res => {
                this.processing = false
                if(res['status'] == 'success') {
                  this.showNotifyButton = false
                  AppAlert.showSuccess({ text : res['message'] })
                }
                else {
                  AppAlert.showError({ text : res['message'] })
                }
              },
              error => {
                this.processing = false
              }
            )
          }
          else {
            this.processing = false
          }
        }
      }
    )
  }


  checkForUnsavedData(){
    //check color table
    for(let x = 0 ; x < this.dataColor.length ; x++){
      if(this.dataColor[x].edited == 1){
        AppAlert.showError({ text : 'You have unsaved colors' })
        return false
      }
    }

    //check country table
    for(let x = 0 ; x < this.dataCountry.length ; x++){
      if(this.dataCountry[x].edited == 1){
        AppAlert.showError({ text : 'You have unsaved countries' })
        return false
      }
    }

    //check items table
    for(let x = 0 ; x < this.dataRM.length ; x++){
      if(this.dataRM[x].edited == 1){
        AppAlert.showError({ text : 'You have unsaved items' })
        return false
      }
    }

    return true
  }

  /*notifyMerchant(){
    this.processing = true
    this.http.post(this.apiUrl + 'merchandising/costing/notify-merchant', {costing_id : this.formGroup.get('id').value})
    .subscribe(
      res => {
        this.processing = false
        if(res['status'] == 'success') {
          this.canNotifyMerchant = false
          AppAlert.showSuccess({ text : res['message'] })
        }
        else {
          AppAlert.showError({ text : res['message'] })
        }
      },
      error => {
        this.processing = false
      }
    )
  }*/

  //............. local functions...............................................

  //custom validation for validate upcharge reason
  public upchargeValidation(): ValidatorFn {
      const validator = (control: AbstractControl): { [key: string]: any } => {
      if(control.value != null) {
        if(control.value != 0 && control.parent.get('upcharge_reason').value == null){
          control.parent.get('upcharge_reason_description').setErrors({'required' : true})
          control.parent.get('upcharge_reason_description').markAsTouched()
          return undefined;
        }
        else{
          control.parent.get('upcharge_reason_description').setErrors(null)
          control.parent.get('upcharge_reason_description').markAsTouched()
          return undefined;
        }
      }
      else {
        if(control.parent != undefined && control.parent != null){
          if(control.value <= 0){
            control.parent.get('upcharge_reason_description').setValue(null)
            control.parent.get('upcharge_reason').setValue(null)
          }
          control.parent.get('upcharge_reason_description').setErrors(null)
          control.parent.get('upcharge_reason_description').markAsTouched()
        }

        return undefined;
      }
  }
  return validator;
 }


 //custom validation for validate upcharge reason
 /*public lotValidation2(): ValidatorFn {
     const validator = (control: AbstractControl): { [key: string]: any } => {
     if(control.parent != undefined && control.parent != null && control.value != undefined && control.value != '' ) {
         control.setErrors({'required' : true})
         control.markAsTouched()
         return undefined;
     }
     else{
       control.setErrors(null)
       control.markAsTouched()
       return undefined;
     }
 }
 return validator;
}*/


  formatDecimalNumber(_number, _places){
    //let p = Math.pow(10, _places)
    //return Math.round(_number * p) / p
   // return Math.ceil(_number * p) / p
    let num_val = parseFloat(_number + 'e' + _places)//_number.toExponential(2)
    return Number(Math.round(num_val) + 'e-' + _places);
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


  validateNumber(_value){
    if(_value === null || _value === ''){
      return false
    }
    else if(_value == 0){
      return true
    }
    else if(typeof _value != 'number'){
      if(isNaN(_value)){
        return false
      }
      else{
        return true
      }
    }
    else{
      return true
    }
  }

  countDecimals(_val) {
   if(Math.floor(_val) === _val) return 0;
   return _val.toString().split(".")[1].length || 0;
  }

}
