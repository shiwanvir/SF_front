import { Component, OnInit, ViewChild, TemplateRef, Directive, Output, EventEmitter, ChangeDetectionStrategy, AfterViewInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map } from 'rxjs/operators';

//third party components
import { HotTableRegisterer } from '@handsontable/angular';
import * as Handsontable from 'handsontable';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { ItemService } from '../item.service';
import { ItemSelectorComponent } from '../../shared/components/item-selector/item-selector.component';
import { ColorSelectorComponent } from '../../shared/components/color-selector/color-selector.component';
import { SizeSelectorComponent } from '../../shared/components/size-selector/size-selector.component';

@Component({
  selector: 'app-itemcreationwizard',
  templateUrl: './itemcreationwizard.component.html',
  styleUrls: [],
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class ItemcreationwizardComponent implements AfterViewInit {

  @ViewChild(ItemSelectorComponent) itemSelectorComponent: ItemSelectorComponent;
  @ViewChild(ColorSelectorComponent) colorSelectorComponent: ItemSelectorComponent;
  @ViewChild(SizeSelectorComponent) sizeSelectorComponent: SizeSelectorComponent;

  readonly apiUrl = AppConfig.apiUrl()
  formGroup : FormGroup = null
  formValidator : AppFormValidator
  processing : boolean = false
  saveStatus : string = 'SAVE'

  colorOption$ : Observable<any[]>
  sizeChart$ : Observable<any[]>

  inventoryUom$: Observable<Array<any>>;
  inventoryUomLoading = false;
  //inventoryUomInput$ = new Subject<string>();
  inventoryUomInput$: Observable<any[]>;
  CuttableUomInput$: Observable<any[]>;

  supplier$: Observable<Array<any>>;
  supplierLoading = false;
  supplierInput$ = new Subject<string>();

  hotOptionsColor: any
  datasetColor: any = []
  instanceColor: string = 'hotColor'

  hotOptionsSize: any
  datasetSize: any = []
  instanceSize: string = 'hotSize'

  hotOptionsItem: any
  datasetItem: any = []
  instanceItem: string = 'hotItem'

  default_val = []

  constructor(private fb:FormBuilder, private http:HttpClient, private hotRegisterer: HotTableRegisterer,
  private itemService : ItemService) {
   }


  ngOnInit() {


  /*  this.datasetColor = [
      {color_code : 'BLK', colorName : 'BLACK'}
    ]*/

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      parent_item_id : [null/*, [Validators.required]*/],
      color_option : [null, [Validators.required]],
      inventory_uom : [null, [Validators.required]],
      gsm : [null , [Validators.required , Validators.min(0.0001)]],
      width : [null , [Validators.required , Validators.min(0.0001)]],
      Cuttable_uom : [null , [Validators.required , Validators.min(0.0001)]],
      supplier_id : [null, [Validators.required]],
      //supplier_reference : [null, [Validators.required]],
      supplier_reference:[null , [Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9/]*$/)/*PrimaryValidators.noSpecialCharactor*/]],
      material_description : null,
      main_category : null,
      sub_category : null,
      //fabric_composition : null,
      supplier_code : null,
      color_wise : null,
      size_wise : null,
      group_id : null
    })
    this.formValidator = new AppFormValidator(this.formGroup, []);

    /*this.datasetItem = [
      {
        color_code: "",
        color_id: null,
        color_option: "PRINTTED",
        master_code: "",
        master_description: "65% POLYESTER 35% COTTON GSM 10 160_500",
        mcq: 0,
        moq: 0,
        size_id: null,
        size_name: "",
        standard_price: 0,
        supplier_name: null,
        supplier_reference: "500",
      }
    ]*/



    this.initializeColorTable()
    this.initializeSizeTable()
    this.initializeItemTable()

    this.loadColorOptions()
    this.loadSizeChart()
  //  this.loadInventoryUom()
    this.loadSupplier()

    //this.formGroup.get('supplier_id').disable()
  }



  ngAfterViewInit(){
  }


  initializeColorTable() {

    if(this.hotOptionsColor != null) {
      return
    }
    this.hotOptionsColor = {
      columns: [
        { type: 'text', title : 'Color Code' , data: 'color_code',className: "htLeft"},
        { type: 'text', title : 'Color Name' , data: 'color_name',className: "htLeft"}
      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 200,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htCenter htMiddle',
      readOnly: true,
      afterSelection: (obj, row1, col1, row2, col2, selectionLayerLevel) => {

      },
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
          },
          items : {
            'add' : {
              name : 'Add Color',
              disabled: (key, selection, clickEvent) => {
                return (this.formGroup.get('color_wise').value == true) ? false : true
              },
              callback : (key, selection, clickEvent) => {
                this.colorSelectorComponent.openModel()
                //this.colorSelectorComponent.clearDataset()
              }
            },
            'remove' : {
              name : 'Remove',
              disabled: (key, selection, clickEvent) => {
                return (this.formGroup.get('color_wise').value == true) ? false : true
              },
              callback : (key, selection, clickEvent) => {
                let start = selection[0].start;
                let end = selection[0].end;
                if(start.row == end.row){ //chek user select only single row
                  this.datasetColor.splice(start.row, 1) //delete from array
                  const hotInstanceColor = this.hotRegisterer.getInstance(this.instanceColor);
                  hotInstanceColor.render()
                }
              }
            },
          }
      }
    }
  }


  renderColorTable(){
    const hotInstanceColor = this.hotRegisterer.getInstance(this.instanceColor);
    hotInstanceColor.render()
  }


  initializeSizeTable() {
    if(this.hotOptionsSize != null) {
      return
    }
    this.hotOptionsSize = {
      columns: [
        { type: 'text', title : 'Size' , data: 'size_name',className: "htLeft"}
      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 200,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htCenter htMiddle',
      readOnly: true,
      afterSelection: (obj, row1, col1, row2, col2, selectionLayerLevel) => {

      },
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
          },
          items : {
            'add' : {
              name : 'Add Size',
              disabled: (key, selection, clickEvent) => {
                return (this.formGroup.get('size_wise').value == true) ? false : true
              },
              callback : (key, selection, clickEvent) => {
                this.sizeSelectorComponent.openModel()
              }
            },
            'remove' : {
              name : 'Remove',
              disabled: (key, selection, clickEvent) => {
                return (this.formGroup.get('size_wise').value == true) ? false : true
              },
              callback : (key, selection, clickEvent) => {
                let start = selection[0].start;
                let end = selection[0].end;
                if(start.row == end.row){ //chek user select only single row
                  this.datasetSize.splice(start.row, 1) //delete from array
                  const hotInstanceSize = this.hotRegisterer.getInstance(this.instanceSize);
                  hotInstanceSize.render()
                }
              }
            },
          }
      }
    }
  }


  renderSizeTable(){
    const hotInstanceColor = this.hotRegisterer.getInstance(this.instanceSize);
    hotInstanceColor.render()
  }

  initializeItemTable() {
    if(this.hotOptionsItem != null) {
      return
    }
    this.hotOptionsItem = {
      columns: [
        //{ type: 'text', title : 'Item Code' , data: 'master_code'},
        { type: 'text', title : 'Item Description' , data: 'master_description',className: "htLeft"},
        { type: 'text', title : 'Color' , data: 'color_code',className: "htLeft"},
        { type: 'text', title : 'Size' , data: 'size_name',className: "htLeft"},
        { type: 'text', title : 'Color Type' , data: 'color_option',className: "htLeft"},
        { type: 'text', readOnly:false , title : 'Supplier Reference' , data: 'supplier_reference',className: "htLeft"},
        { type: 'text', title : 'Supplier' , data: 'supplier_name',className: "htLeft"},
        { type: 'numeric', readOnly:false, title : 'Std Price $' , data: 'standard_price',className: "htRight"},
        { type: 'numeric', readOnly:false, title : 'MCQ' , data: 'mcq',className: "htRight"},
        { type: 'numeric', readOnly:false, title : 'MOQ' , data: 'moq',className: "htRight"}
      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 200,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htCenter htMiddle',
      readOnly: true,
      /*afterSelection: (obj, row1, col1, row2, col2, selectionLayerLevel) => {

      },*/
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
          },
          items : {
            'remove' : {
              name : 'Remove Item',
              disabled: function (key, selection, clickEvent) {
                return false
              },
              callback : (key, selection, clickEvent) => {
                let start = selection[0].start;
                let end = selection[0].end;
                if(start.row == end.row){ //chek user select only single row
                  this.datasetItem.splice(start.row, 1) //delete from array
                  const hotInstanceItem = this.hotRegisterer.getInstance(this.instanceItem);
                  hotInstanceItem.render()
                }
              }
            },
          }
      },
      cells: (row, col, prop) => {
        var cellProperties = {};

        if(this.datasetItem[row] != undefined){
          if(this.datasetItem[row]['save_status'] != undefined && this.datasetItem[row]['save_status'] == 'EXISTS'){ //chek row is edited by user and then change color
            cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
              var args = arguments;
              td.style.background = '#ffcccc';
              Handsontable.renderers.TextRenderer.apply(this, args);
            }
          }
        }
        return cellProperties;
      },
      afterChange: (change, source, surce) => {

        let x=this.datasetItem;

        if(source != null && source.length > 0){
            const hotInstance = this.hotRegisterer.getInstance(this.instanceItem);
            let _row = source[0][0]
            let y=source["0"]["0"];

            if(source[0][1] == 'supplier_reference')
            {
               let formData = this.formGroup.getRawValue()
               console.log(formData)

               if(this.datasetItem[y]['supplier_name']==null || this.datasetItem[y]['supplier_name']== ''){
                 AppAlert.showError({ text : 'Supplier name cannot be empty !'})
                 this.datasetItem[y]['supplier_reference'] = '';
                 const hotInstance = this.hotRegisterer.getInstance(this.instanceItem);
                 hotInstance.render()
                 return
               }

              var str = this.datasetItem[y]['master_description'];
              //console.log(formData['supplier_reference'])
              if(formData['color_wise']==true && formData['size_wise']==true )
                {

                  if(formData['supplier_reference'] == '' || formData['supplier_reference'] == null)
                  {
                      var splitted = str.split("_");
                      var reverseArray = splitted.reverse();
                      reverseArray.splice(2, 0, this.datasetItem[y]['supplier_reference'].toUpperCase());
                      //reverseArray[0] =  this.datasetItem[y]['supplier_reference'].toUpperCase();
                      var sup_ref = this.datasetItem[y]['supplier_reference'].toUpperCase();
                      var re_reverseArray = reverseArray.reverse();
                      var myString = re_reverseArray.join('_');
                      //console.log(myString)
                   }else{
                      var splitted = str.split("_");
                      var reverseArray = splitted.reverse();
                      reverseArray[2] =  this.datasetItem[y]['supplier_reference'].toUpperCase();
                      var sup_ref = reverseArray[2];
                      var re_reverseArray = reverseArray.reverse();
                      var myString = re_reverseArray.join('_');
                      //console.log(myString)
                   }


               }
               else if((formData['color_wise']==true && formData['size_wise']!=true) || (formData['color_wise']!=true && formData['size_wise']==true))
               {
                   if(formData['supplier_reference'] == '' || formData['supplier_reference'] == null)
                   {
                       var splitted = str.split("_");
                       var reverseArray = splitted.reverse();
                       reverseArray.splice(1, 0, this.datasetItem[y]['supplier_reference'].toUpperCase());
                       //reverseArray[0] =  this.datasetItem[y]['supplier_reference'].toUpperCase();
                       var sup_ref = this.datasetItem[y]['supplier_reference'].toUpperCase();
                       var re_reverseArray = reverseArray.reverse();
                       var myString = re_reverseArray.join('_');
                       //console.log(myString)
                    }else{
                       var splitted = str.split("_");
                       var reverseArray = splitted.reverse();
                       reverseArray[1] =  this.datasetItem[y]['supplier_reference'].toUpperCase();
                       var sup_ref = reverseArray[1];
                       var re_reverseArray = reverseArray.reverse();
                       var myString = re_reverseArray.join('_');
                       //console.log(myString)
                    }

               }
               else{


                 if(formData['supplier_reference'] == '' || formData['supplier_reference'] == null)
                 {
                     var myString:any = str+"_"+this.datasetItem[y]['supplier_reference'].toUpperCase();
                     var sup_ref = this.datasetItem[y]['supplier_reference'].toUpperCase();
                   }else{

                     var splitted = str.split("_");
                     var reverseArray = splitted.reverse();
                     reverseArray[0] =  this.datasetItem[y]['supplier_reference'].toUpperCase();
                     var sup_ref = reverseArray[0];
                     var re_reverseArray = reverseArray.reverse();
                     var myString = re_reverseArray.join('_');
                     //console.log(myString)
                   }




              }





              this.datasetItem[y]['supplier_reference'] = sup_ref;
              this.datasetItem[y]['master_description'] = myString;

              hotInstance.setDataAtCell(_row, 0, myString)
              hotInstance.setDataAtCell(_row, 4, sup_ref)


            }

            else if(source[0][1] == 'standard_price'){
              if(source[0][3] < 0)
              {
                AppAlert.showError({text:"Cannot Decrease"});
                this.datasetItem[y]['standard_price'] = 0
                hotInstance.setDataAtCell(_row, 7, 0)

              }
              let _standardPrice = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
              if(this.countDecimals(_standardPrice) > 4){

                _standardPrice = this.formatDecimalNumber(_standardPrice, 4)
                hotInstance.setDataAtCell(_row, 6, _standardPrice)
              }
            }
            else if(source[0][1] == 'mcq'){
              //console.log(source[0][3])
              if(source[0][3] < 0)
              {
                AppAlert.showError({text:"Cannot Decrease"});
                this.datasetItem[y]['mcq'] = 0
                hotInstance.setDataAtCell(_row, 7, 0)

              }

              let _mcq = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
              if(this.countDecimals(_mcq) > 4){
                _mcq = this.formatDecimalNumber(_mcq, 4)
                //console.log(_mcq)
                hotInstance.setDataAtCell(_row, 7, _mcq)
              }
            }
            else if(source[0][1] == 'moq'){

              if(source[0][3] < 0)
              {
                AppAlert.showError({text:"Cannot Decrease"});
                this.datasetItem[y]['moq'] = 0
                hotInstance.setDataAtCell(_row, 8, 0)

              }

              let _moq = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
              if(this.countDecimals(_moq) > 4){
                _moq = this.formatDecimalNumber(_moq, 4)
                //console.log(_moq)
                hotInstance.setDataAtCell(_row, 8, _moq)
              }
            }


        }
      },
    }
  }


  renderItemTable(){
    const hotInstanceColor = this.hotRegisterer.getInstance(this.instanceItem);
    hotInstanceColor.render()
  }


  loadColorOptions(){
    this.colorOption$ = this.http.get<any[]>(this.apiUrl + "merchandising/color-options?active=1")
    .pipe(map(res => res['data']));
  }

  loadSizeChart(){
    this.sizeChart$ = this.http.get<any[]>(this.apiUrl + "org/sizes-chart?active=1")
    .pipe(map(res => res['data']));
  }


  /*loadInventoryUom() {
    this.inventoryUom$ = concat(
        of([]), // default items
        this.inventoryUomInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.inventoryUomLoading = true),
            switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/uom?type=auto_2', { params: { search: term } }).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.inventoryUomLoading = false)
            ))
        )
    );
  }*/

  loadSupplier() {
    this.supplier$ = concat(
        of([]), // default items
        this.supplierInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.supplierLoading = true),
            switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/suppliers?type=auto', { params: { search: term } }).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.supplierLoading = false)
            ))
        )
    );
  }

  loadSizeChartSizes(e){
    let sizeChartId = e.target.value
    this.http.get(this.apiUrl + 'org/sizes-chart/' + sizeChartId)
    .subscribe(
      res => {
        console.log(res)
      },
      error => {
        console.error(error)
      }
    )
  }


  onSupplierChange(data){
    this.formGroup.patchValue({
      supplier_code : (data == undefined || data == null) ? '' : data.supplier_code
    })
  }

  supplierDisable(){

    // let formData = this.formGroup.getRawValue()
    //
    // if(formData['supplier_reference'] != ''){ this.formGroup.get('supplier_id').enable() }
    // else{
    //   this.formGroup.patchValue({'supplier_id': ''})
    //   this.formGroup.get('supplier_id').disable()
    // }

  }


  openModel(){
    this.itemSelectorComponent.openModel()
  }

  changeMainItem(data){

    console.log(data)
    if(data != null) {
      this.itemSelectorComponent.hideModel()
      this.formGroup.patchValue({
        parent_item_id : data.master_id,
        material_code : data.master_code,
        material_description : data.master_description,
        main_category : data.category_name,
        sub_category : data.subcategory_name
      })

      if(data.category_code == 'FAB'){
        this.formGroup.get('color_option').enable()
        this.formGroup.get('gsm').enable()
        this.formGroup.get('width').enable()
        this.formGroup.get('Cuttable_uom').enable()
        this.formGroup.get('size_wise').disable()
        this.formGroup.patchValue({ color_option : null, inventory_uom : null, gsm : null, width : null, Cuttable_uom : null  })
        let mat_master_id = data.master_id
        this.inventoryUomInput$ =  this.http.get<any[]>(this.apiUrl + 'org/uom?type=auto_2&master_id='+mat_master_id+'&category=yd')
        .pipe(map(res => res['data']))
      }
      else if(data.category_code == 'OTH'){this.formGroup.get('size_wise').disable()}
      else{
        this.formGroup.get('color_option').disable()
        this.formGroup.get('gsm').disable()
        this.formGroup.get('width').disable()
        this.formGroup.get('Cuttable_uom').disable()
        this.formGroup.get('size_wise').enable()
        this.formGroup.patchValue({ color_option : null, inventory_uom : null, gsm : null, width : null, Cuttable_uom : null  })
        let mat_master_id = data.master_id
        this.inventoryUomInput$ =  this.http.get<any[]>(this.apiUrl + 'org/uom?type=auto_2&master_id='+mat_master_id+'&category=null')
        .pipe(map(res => res['data']))
      }


      this.CuttableUomInput$ =  this.http.get<any[]>(this.apiUrl + 'org/uom?type=auto_3')
      .pipe(map(res => res['data']))




    }
  }

  onAddColor(data){
    if(data != null) {
      for(let x = 0 ; x < this.datasetColor.length ; x++){
        if(this.datasetColor[x].color_id == data.color_id) {
          AppAlert.showError({ text : data.color_name + ' Color already added'})
          return
        }
      }
      this.datasetColor.push(data)
      const hotInstanceColor = this.hotRegisterer.getInstance(this.instanceColor);
      hotInstanceColor.render()
    }
  }

  onAddSize(data){
    if(data != null) {
      for(let x = 0 ; x < this.datasetSize.length ; x++){
        if(this.datasetSize[x].size_id == data.size_id) {
          AppAlert.showError({ text : data.size_name + ' Size already added'})
          return
        }
      }
      this.datasetSize.push(data)
      const hotInstanceSize = this.hotRegisterer.getInstance(this.instanceSize);
      hotInstanceSize.render()
    }
  }


  createItems() {
    if(!this.formValidator.validate()){
      AppAlert.showError({ text : 'Incorrect Item Details'})
      return
    }
    this.datasetItem = []
    let formData = this.formGroup.getRawValue()
    console.log(formData)
    let supp_des = formData['supplier_reference']

    if(supp_des==null || supp_des=='')
      {
        //supp_des=''
        supp_des='_'+formData['supplier_id']['supplier_code']
      }
    else
      {
        if(formData['supplier_id']==null || formData['supplier_id']== ''){
          AppAlert.showError({ text : 'Supplier name cannot be empty'})
          return
        }
        //supp_des='_' + formData['supplier_reference'].trim().toUpperCase() +'_'+formData['supplier_id']['supplier_code']
        supp_des='_' + formData['supplier_id']['supplier_code'] + '_' + formData['supplier_reference'].trim().toUpperCase()
      }

      var new_mat_description = "";
    if(formData['main_category'] == "FABRIC"){
       new_mat_description =  formData['material_description']+'_'+formData['gsm']+'GSM_'+formData['width']+'INCH'
    }else{
       new_mat_description = formData['material_description']
    }

    var splitted = new_mat_description.split(" ");
    var mat_dis = splitted.join('_');
    //console.log(splitted)
    let materialDescription = mat_dis +  supp_des

    if(this.formGroup.get('color_wise').value == true){//has colors
      if(this.datasetColor.length > 0) {//has selected colors
        for(let x = 0 ; x < this.datasetColor.length ; x++){
          if(this.formGroup.get('size_wise').value == true) {//color wise
            if(this.datasetSize.length > 0) { //has selected sizes
              for(let y = 0 ; y < this.datasetSize.length ; y++){
                let item = {
                  master_code : '',
                  master_description : materialDescription + '_' + this.datasetColor[x].color_code + '_' + this.datasetSize[y].size_name,
                  color_code : this.datasetColor[x].color_code,
                  color_id : this.datasetColor[x].color_id,
                  size_name : this.datasetSize[y].size_name,
                  size_id : this.datasetSize[y].size_id,
                  color_option : (formData.color_option == null) ? null : formData.color_option.color_option,
                  supplier_name : (formData.supplier_id == null) ? null : formData.supplier_id.supplier_name,
                  supplier_reference :  (formData.supplier_reference == null) ? null : formData.supplier_reference.toUpperCase(),
                  standard_price : 0,
                  mcq : 0,
                  moq : 0
                }
                //item.master_description += ((JSON.parse(JSON.stringify(item.master_description)))+ '_' + this.datasetSize[y].size_name)
                //item.size_name = this.datasetSize[y].size_name
                //this.datasetItem.push(JSON.parse(JSON.stringify(item)))
                this.datasetItem.push(item)
              }
            }
            else {// no selected colors
              AppAlert.showError({ text : 'You must select a size' })
            }
          }
          else {
            let item = {
              master_code : '',
              master_description : materialDescription + '_' + this.datasetColor[x].color_code,
              color_code : this.datasetColor[x].color_code,
              color_id : this.datasetColor[x].color_id,
              size_name : '',
              size_id : null,
              color_option : (formData.color_option == null) ? null : formData.color_option.color_option,
              supplier_name : (formData.supplier_id == null) ? null : formData.supplier_id.supplier_name,
              supplier_reference : (formData.supplier_reference == null) ? null : formData.supplier_reference.toUpperCase(),
              standard_price : 0,
              mcq : 0,
              moq : 0
            }
            //this.datasetItem.push(JSON.parse(JSON.stringify(item)))3
            this.datasetItem.push(item)
          }
        }
      }
      else { //no selected colors
        AppAlert.showError({ text : 'You must select a color' })
      }
    }
    else {//no colors
      if(this.formGroup.get('size_wise').value == true) {//has colors
        if(this.datasetSize.length > 0){ //has selected sizes
          for(let y = 0 ; y < this.datasetSize.length ; y++){
            let item = {
              master_code : '',
              master_description : (JSON.parse(JSON.stringify(materialDescription))) + '_' + this.datasetSize[y].size_name,
              color_code : '',
              color_id : null,
              size_name : this.datasetSize[y].size_name,
              size_id : this.datasetSize[y].size_id,
              color_option : (formData.color_option == null) ? null : formData.color_option.color_option,
              supplier_name : (formData.supplier_id == null) ? null : formData.supplier_id.supplier_name,
              supplier_reference : (formData.supplier_reference == null) ? null : formData.supplier_reference.toUpperCase(),
              standard_price : 0,
              mcq : 0,
              moq : 0
            }
            this.datasetItem.push(item)
          }
        }
        else { // no size selected
          AppAlert.showError({ text : 'You must select a size' })
        }
      }
      else {
        let item = {
          master_code : '',
          master_description : (JSON.parse(JSON.stringify(materialDescription))),
          color_code : '',
          color_id : null,
          size_name : '',
          size_id : null,
          color_option : (formData.color_option == null) ? null : formData.color_option.color_option,
          supplier_name : (formData.supplier_id == null) ? null : formData.supplier_id.supplier_name,
          supplier_reference : (formData.supplier_reference == null) ? null : formData.supplier_reference.toUpperCase(),
          standard_price : 0,
          mcq : 0,
          moq : 0
        }
        this.datasetItem.push(item)
      }
    }
  }

  saveItems() {

    if(!this.formValidator.validate()){
      AppAlert.showError({ text : 'Incorrect Item Details'})
      this.datasetItem = []
      return
    }

    if(this.datasetItem.length > 0){
      //validate items
      if(!this.validateItem()){
        return
      }

      //console.log(this.datasetItem)
      AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Saving...','Please wait while saving items')
      let data = {
        item_data : this.formGroup.getRawValue(),
        items : this.datasetItem
      }
      this.saveStatus = 'UPDATE'
      console.log(data)
      this.http.post(this.apiUrl + 'merchandising/items/create-inventory-items', data)
      .pipe(map(res => res['data']))
      .subscribe(
        res => {
          //this.processing = false

          console.log(res)
          if(res.count == 0){
            AppAlert.closeAlert()
            AppAlert.showError({text : 'This item/items already exists'})
            this.saveStatus = 'SAVE'
          }else{
            this.formGroup.get('group_id').setValue(res.group_id)
            AppAlert.closeAlert()
            AppAlert.showSuccess({text : +res.count+' Item/Items created successfully.'})
            //document.getElementById('sss').click()
            this.itemService.reloadItemList('RELOAD')//reload item table

            this.formGroup.reset()
            this.datasetItem = []
            this.datasetSize = []
            this.datasetColor = []
            this.itemSelectorComponent.clearitem()
            this.saveStatus = 'SAVE'

          }

        },
        error => {
          AppAlert.closeAlert()
          AppAlert.showError({text : error})
          //this.processing = false
        }
      )
    }
  }




  clearAll() {
    AppAlert.showConfirm({
      'text' : 'Do you want to clear all unsaved data?'
    },(result) => {
      if (result.value) {
        this.formGroup.reset()
        this.datasetItem = []
        this.datasetSize = []
        this.datasetColor = []
        this.itemSelectorComponent.clearitem()
        this.saveStatus = 'SAVE'
        //this.colorSelectorComponent.clearDataset()
        //this.sizeSelectorComponent.clearDataset()
        //clearitem
      }
    })
  }

  BuildGrids() {
    this.formGroup.reset()
    this.datasetItem = []
    this.datasetSize = []
    this.datasetColor = []
  }

  changeColor(data){

  }


  validateItem() {//validate finish good item list
    for(let x = 0 ; x < this.datasetItem.length ; x++){
      let _itemData = this.datasetItem[x]
      let errCount = 0
      let str = ''

      if(_itemData.master_description == null || _itemData.master_description == ''){
        str += 'Incorrect item description <br>'
        errCount++
      }
      if(!this.validateNumber(_itemData.standard_price)){
        str += 'Incorrect standard price <br>'
        errCount++
      }
      if(!this.validateNumber(_itemData.moq)){
        str += 'Incorrect moq <br>'
        errCount++
      }
      if(!this.validateNumber(_itemData.mcq)){
        str += 'Incorrect mcq <br>'
        errCount++
      }

      if(errCount > 0){
        AppAlert.showError({ title : 'Error in line ' + (x+1), html : '<span>' + str + '</span>'})
        return false
      }
    }
    return true
  }

  //utility functions ***************************************************

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

  formatDecimalNumber(_number, _places){
    let num_val = parseFloat(_number+'e'+_places)//_number.toExponential(2)
    return Number(Math.round(num_val)+'e-'+_places);
  }



}
