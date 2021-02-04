import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder , FormGroup , Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';


//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { HotTableRegisterer } from '@handsontable/angular';
import * as Handsontable from 'handsontable';

import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';

@Component({
  selector: 'app-item-selector',
  templateUrl: './item-selector.component.html',
  styleUrls: ['./item-selector.component.css']
})
export class ItemSelectorComponent implements OnInit {

  @ViewChild(ModalDirective) itemModel : ModalDirective;
  readonly apiUrl = AppConfig.apiUrl()
  formGroup : FormGroup
  hotOptions: any
  dataset: any = []
  instance: string = 'hot_item_selector'
  selectedItem = null

  categoryList$: Observable<Array<any>>
  subCategoryList$: Observable<any[]>;

  supplier$: Observable<Array<any>>;
  supplierLoading = false;
  supplierInput$ = new Subject<string>();


  @Input('searchType') searchType : string = null
  @Output() onItemSelected = new EventEmitter<string>();

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

  //  const hotInstance = this.hotRegisterer.getInstance(this.instance);
  //  hotInstance.render()
  }

  initializeTable() {
    if(this.hotOptions != null) {
      return
    }
    this.hotOptions = {
      columns: [
        { type: 'text', title : 'Item Code' , data: 'master_code'},
        { type: 'text', title : 'Supplier' , data: 'supplier_name',className: "htLeft"},

        { type: 'text', title : 'Category' , data: 'category_name',className: "htLeft"},
        { type: 'text', title : 'Sub Category' , data: 'subcategory_name',className: "htLeft"},
        { type: 'text', title : 'Std Price $' , data: 'standard_price',className: "htRight"},
        { type: 'text', title : 'Item Description' , data: 'master_description',className: "htLeft"},
      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 300,
      stretchH: 'all',
      selectionMode: 'range',
      //className: 'htCenter htMiddle',
      className: 'htLeft htMiddle',
      readOnly: true,
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
          },
          items : {
            'merge' : {
              name : 'Add Material',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  this.dataset = []
                  this.selectItem()
                }
              }
            },

          }
      },
      afterSelection: (obj, row1, col1, row2, col2, selectionLayerLevel) => {
        if(row1 == row2){ //chek user select only single row
          this.selectedItem = this.dataset[row1]
        }
        else{
          AppAlert.showError({text : 'Cannot select multiple rows'})
        }
      }
    }
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

  openModel(){
    this.formGroup.reset()
    this.itemModel.show()
  }

  hideModel(){
    this.itemModel.hide()
  }

  selectItem() {
    //console.log(this.selectedItem)
    this.onItemSelected.emit(this.selectedItem)
  }


  search(e){

    //console.log(document.getElementById('txt_search')['value'])
    let formData = this.formGroup.getRawValue()
    formData.category = formData.category == null ? '' : formData.category.category_id
    formData.sub_category = formData.sub_category == null ? '' : formData.sub_category.subcategory_id
    formData.supplier_id = formData.supplier_id == null ? '' : formData['supplier_id']['supplier_id']
    formData.search_type = this.searchType

    this.http.get(this.apiUrl + 'merchandising/items?type=item_selector', {params : formData})
    .subscribe(
      res => {
        //const hotInstance = this.hotRegisterer.getInstance(this.instance);
        //console.log(res)
        //this.dataset = []
        this.dataset = res['data']
        document.getElementById('item-selector-table-div').click()
        //setTimeout(() => {
        //  hotInstance.render()
        //  hotInstance.render()
      //  } , 500)

      },
      error => {

      }
    )
  }

  showEvent(e){

  }

  hideEvent(e){
    this.dataset = []
  }

  clearitem() {

  this.formGroup.reset()

  }

}
