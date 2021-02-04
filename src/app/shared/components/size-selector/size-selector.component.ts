import { Component, OnInit, ViewChild,Output, EventEmitter } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { HotTableRegisterer } from '@handsontable/angular';
import * as Handsontable from 'handsontable';

import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';

@Component({
  selector: 'app-size-selector',
  templateUrl: './size-selector.component.html',
  styleUrls: ['./size-selector.component.css']
})
export class SizeSelectorComponent implements OnInit {

  @ViewChild(ModalDirective) itemModel : ModalDirective;
  readonly apiUrl = AppConfig.apiUrl()
  formGroup : FormGroup
  hotOptions: any
  dataset: any = []
  instance: string = 'hot'
  selectedSize = null

  @Output() onSizeSelected = new EventEmitter<string>();

  constructor(private fb:FormBuilder, private http:HttpClient, private hotRegisterer: HotTableRegisterer) { }

  ngOnInit() {
      this.initializeTable()
  //  const hotInstance = this.hotRegisterer.getInstance(this.instance);
  //  hotInstance.render()
  }

  initializeTable() {
    if(this.hotOptions != null) {
      return
    }
    this.hotOptions = {
      columns: [
      /*  { type: 'text', title : 'Size Code' , data: 'color_code'},*/
        { type: 'text', title : 'Size Name' , data: 'size_name',className: "htLeft"}
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
              name : 'Add Size',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  //this.dataset = []
                  this.selectSize()
                }
              }
            },

          }
      },
      afterSelection: (obj, row1, col1, row2, col2, selectionLayerLevel) => {
        if(row1 == row2){ //chek user select only single row
          this.selectedSize = this.dataset[row1]
        }
        else{
          AppAlert.showError({text : 'Cannot select multiple rows'})
        }
      }
    }
  }

  openModel(){
    document.getElementById('txt_search_size')['value'] = ''
    this.itemModel.show()
  }

  hideModel(){
    this.dataset = []
    this.itemModel.hide()
  }

  selectSize() {
    //this.dataset = []
    //console.log(this.selectedSize)
    this.onSizeSelected.emit(this.selectedSize)
  }


  search(e){
    //console.log(document.getElementById('txt_search')['value'])
    let searchText = document.getElementById('txt_search_size')['value']
    this.http.get(this.apiUrl + 'org/sizes?type=size_selector&search=' + searchText)
    .subscribe(
      res => {
        //const hotInstance = this.hotRegisterer.getInstance(this.instance);
        //console.log(res)
        //this.dataset = []
        this.dataset = res['data']
        document.getElementById('size-selector-table-div').click()
        //setTimeout(() => {
        //  hotInstance.render()
        //  hotInstance.render()
        //} , 500)
      },
      error => {

      }
    )
  }

  showEvent(e){

  }

  clearDataset(){

    this.dataset = []
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    hotInstance.render()
  }

}
