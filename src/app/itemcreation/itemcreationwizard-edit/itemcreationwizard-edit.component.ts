import { Component, OnInit, ViewChild, TemplateRef, Directive, Output, EventEmitter, ChangeDetectionStrategy, AfterViewInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map } from 'rxjs/operators';

//third party components
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
import { TabsetComponent,TabDirective } from 'ngx-bootstrap';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';


@Component({
  selector: 'app-itemcreationwizard-edit',
  templateUrl: './itemcreationwizard-edit.component.html',
  styleUrls: ['./itemcreationwizard-edit.component.css']
})
export class ItemcreationwizardEditComponent implements OnInit {

  @ViewChild(ModalDirective) itemModel : ModalDirective;
  readonly apiUrl = AppConfig.apiUrl()
  formGroup : FormGroup
  hotOptions: any
  dataset: any = []

  hotOptionsItem: any
  datasetItem: any = []
  instanceItem: string = 'hotItem'

  instance: string = 'hot'
  selectedItem = null

  categoryList$: Observable<Array<any>>
  subCategoryList$: Observable<any[]>;

  supplier$: Observable<Array<any>>;
  supplierLoading = false;
  supplierInput$ = new Subject<string>();
  //processing : boolean = false
  processdetails : boolean = false


  searchType : string = null
  //@Output() onItemSelected = new EventEmitter<string>();


  constructor(private fb:FormBuilder, private http:HttpClient, private hotRegisterer: HotTableRegisterer) { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      search_text : '',
      category : null,
      sub_category : null,
      supplier_id : null
    })
    this.initializeTable()
    this.loadCategories()
    this.loadSupplier()
    this.initializeItemTable()
    this.dataset = []
    this.datasetItem  = []
  }

  initializeTable() {
    if(this.hotOptions != null) {
      return
    }
    this.hotOptions = {
      columns: [
        { type: 'checkbox', title : 'Action' , readOnly: false , checkedTemplate: 'yes',  uncheckedTemplate: 'no' },

        { type: 'text', title : 'Supplier' , data: 'supplier_name',className: "htLeft"},
        { type: 'text', title : 'Item Code' , data: 'master_code',className: "htLeft"},
        { type: 'text', title : 'Std Price $' , data: 'standard_price',className: "htRight"},

        { type: 'text', title : 'Category' , data: 'category_name',className: "htLeft"},
        { type: 'text', title : 'Sub Category' , data: 'subcategory_name',className: "htLeft"},
        { type: 'text', title : 'Item Description' , data: 'master_description',className: "htLeft"},
      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 300,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htCenter htMiddle',
      readOnly: true,
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
          },
          items : {
            'merge' : {
              name : 'Add Line',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  this.loadItamAllData()
                }
              }
            },

          }
      },
      afterSelection: (obj, row1, col1, row2, col2, selectionLayerLevel) => {
        /*if(row1 == row2){
          this.selectedItem = this.dataset[row1]
        }
        else{
          AppAlert.showError({text : 'Cannot select multiple rows'})
        }*/
      }
    }
  }


  initializeItemTable() {
    if(this.hotOptionsItem != null) {
      return
    }
    this.hotOptionsItem = {
      columns: [
        { type: 'text', title : 'Item Code' , data: 'master_code',className: "htLeft"},
        { type: 'text', title : 'Item Description' , data: 'master_description',className: "htLeft"},
        { type: 'text', title : 'Color' , data: 'color_code',className: "htLeft"},
        { type: 'text', title : 'Size' , data: 'size_name',className: "htLeft"},
        { type: 'text', title : 'Color Type' , data: 'color_option',className: "htLeft"},
        { type: 'text', title : 'Supplier Reference' , data: 'supplier_reference',className: "htLeft"},
        //{ type: 'dropdown', title : 'Supplier' , data: 'supplier_name'},
        {
          title : 'Supplier',
          type: 'autocomplete',
          source:(query, process)=>{
            var url=$('#url').val();
            $.ajax({
              url:this.apiUrl+'org/suppliers?type=auto2',
              dataType: 'json',
              data: {
                query: query
              },
              success: function (response) {
                  //console.log(response);
                  process(response);
                }
            });
          },
          strict: false,
          data:'supplier_name',
          readOnly: true,
          width:150,
          className: "htLeft"
        },
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
      afterChange: (change, source) => {
        if(source != null && source.length > 0){
            const hotInstance = this.hotRegisterer.getInstance(this.instanceItem);
            let _row = source[0][0]
            let y=source["0"]["0"];

            if(source[0][1] == 'standard_price'){
              if(source[0][3] < 0)
              {
                AppAlert.showError({text:"Cannot Decrease"});
                this.datasetItem[y]['standard_price'] = 0
                hotInstance.setDataAtCell(_row, 7, 0)

              }

              let _standardPrice = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
              if(this.countDecimals(_standardPrice) > 4){
                _standardPrice = this.formatDecimalNumber(_standardPrice, 4)
                hotInstance.setDataAtCell(_row, 7, _standardPrice)
              }
            }
            else if(source[0][1] == 'mcq'){
              if(source[0][3] < 0)
              {
                AppAlert.showError({text:"Cannot Decrease"});
                this.datasetItem[y]['mcq'] = 0
                hotInstance.setDataAtCell(_row, 8, 0)

              }
              let _mcq = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
              if(this.countDecimals(_mcq) > 4){
                _mcq = this.formatDecimalNumber(_mcq, 4)
                hotInstance.setDataAtCell(_row, 8, _mcq)
              }
            }
            else if(source[0][1] == 'moq'){
              if(source[0][3] < 0)
              {
                AppAlert.showError({text:"Cannot Decrease"});
                this.datasetItem[y]['moq'] = 0
                hotInstance.setDataAtCell(_row, 9, 0)

              }
              let _moq = (source[0][3] == '' || isNaN(source[0][3])) ? 0 : source[0][3]
              if(this.countDecimals(_moq) > 4){
                _moq = this.formatDecimalNumber(_moq, 4)
                hotInstance.setDataAtCell(_row, 9, _moq)
              }
            }
        }
      },
    }
  }

  updateDetails(){
    console.log(this.datasetItem)

    this.processdetails = true
    AppAlert.showMessage('Processing...','Please wait while updating details')

      this.http.post(this.apiUrl + 'merchandising/items/update_item_edit' ,{ 'lines' : this.datasetItem })
      .pipe( map(res => res['data'] ))
      .subscribe(
        data => {
          //console.log(data)
          //this.processdetails = false
          AppAlert.closeAlert()

          AppAlert.showSuccess({text:data.message})
          this.datasetItem=[]
          this.formGroup.reset()
        },
        error => {

          this.processdetails = false
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({text : 'Invalid Item Details' })
          } , 1000)

        }
      )

  }

  loadCategories(){
    this.categoryList$ =  this.http.get<any[]>(this.apiUrl + 'merchandising/item-categories')
      .pipe(map(res => res['data']))
  }

  loadSubCategories() {

    let _category = this.formGroup.get('category').value
    _category = (_category == null || _category == '') ? '' : _category.category_id

    this.subCategoryList$ =  this.http.get<any[]>(this.apiUrl + 'merchandising/item-sub-categories?type=sub_category_by_category&category_id='+_category)
      .pipe(map(res => res['data']))
  }


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

  onCategoryChange(e){
    this.loadSubCategories()
  }

  search(e){
    this.dataset = []
    this.datasetItem  = []

    let formData = this.formGroup.getRawValue()
    //console.log(formData)
    formData.category = formData.category == null ? '' : formData.category.category_id
    formData.sub_category = formData.sub_category == null ? '' : formData.sub_category.subcategory_id
    formData.supplier_id = formData.supplier_id == null ? '' : formData['supplier_id']['supplier_id']
    formData.search_type = this.searchType

    //console.log(formData)

    this.http.get(this.apiUrl + 'merchandising/items?type=item_selector_2', {params : formData})
    .subscribe(
      res => {

      //  this.openModel()
        this.dataset = res['data']
        this.processdetails = false

        //console.log(res['data'])

      },
      error => {

      }
    )
  }


  openModel(){
    this.itemModel.show()

  }

  hideModel(){
    this.itemModel.hide()
  }

  showEvent(e){

  }



  loadItamAllData(){
    let arr = [];
    let str = '';

    for(let x = 0 ; x < this.dataset.length ; x++)
    {
      if(this.dataset[x]['0'] != undefined && this.dataset[x]['0'] == 'yes')
      {
        arr.push(this.dataset[x])
        str += this.dataset[x]['master_id'] + ',';
      }
    }
    //console.log(arr)
    if(arr.length == 0)
    {
    AppAlert.showError({ text : 'Please select line/lines, which you want to Add' })
    }
    if(arr.length >= 1)
    {
      AppAlert.showConfirm({
        'text' : 'Do you want to add (' + str + ') Lines?'
            },(result) => {
        //console.log(result)
        if (result.value) {
          this.loadItemLines(arr)
        }
        if (result.dismiss) {
          //this.dataset = []
        }

      })
    }

  }

  loadItemLines(lines){
    //console.log(lines)
    for (var _i = 0; _i < lines['length']; _i++)
        {
          let item_id =  lines[_i]['master_id']

          this.http.post(this.apiUrl + 'merchandising/items/load_item_edit' ,{ 'item_id' : item_id })
          .pipe( map(res => res['data'] ))
          .subscribe(
            data => {

              console.log(data['list'][0])
              //this.datasetItem = data['list'][0]
              this.datasetItem.push(data['list'][0])
              const hotInstanceItem = this.hotRegisterer.getInstance(this.instanceItem);
              hotInstanceItem.render()

            },
            error => {
            }
          )


        }

        this.hideModel()

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
