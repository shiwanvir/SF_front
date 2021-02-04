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
  selector: 'app-color-selector',
  templateUrl: './color-selector.component.html',
  styleUrls: ['./color-selector.component.css']
})
export class ColorSelectorComponent implements OnInit {

  @ViewChild(ModalDirective) itemModel : ModalDirective;
  readonly apiUrl = AppConfig.apiUrl()
  formGroup : FormGroup
  hotOptions: any
  dataset: any = []
  instance: string = 'hot_color_selector'
  selectedColor = null

  @Output() onColorSelected = new EventEmitter<string>();

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
        { type: 'text', title : 'Color Code' , data: 'color_code',className: "htLeft"},
        { type: 'text', title : 'Color Name' , data: 'color_name',className: "htLeft"}
      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 300,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htLeft htMiddle',
      readOnly: true,
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
          },
          items : {
            'merge' : {
              name : 'Add Color',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  //this.dataset = []
                  this.selectColor()
                }
              }
            },

          }
      },
      afterSelection: (obj, row1, col1, row2, col2, selectionLayerLevel) => {
        if(row1 == row2){ //chek user select only single row
          this.selectedColor = this.dataset[row1]
        }
        else{
          AppAlert.showError({text : 'Cannot select multiple rows'})
        }
      }
    }
  }

  openModel(){
    document.getElementById('txt_search_color')['value'] = ''
    this.itemModel.show()
  }


  hideModel(){
    this.dataset = []
    document.getElementById('txt_search_color')['value'] = ''
    this.itemModel.hide()
  }

  selectColor() {
    //console.log(this.selectedColor)
    this.onColorSelected.emit(this.selectedColor)
  }


  search(e){
    //console.log(document.getElementById('txt_search')['value'])
    let searchText = document.getElementById('txt_search_color')['value']
    this.http.get(this.apiUrl + 'org/colors?type=color_selector&search=' + searchText)
    .subscribe(
      res => {
        //const hotInstance = this.hotRegisterer.getInstance(this.instance);
        //console.log(res)
        //this.dataset = []
        this.dataset = res['data']
        //setTimeout(() => {
        //hotInstance.render()
          document.getElementById("color-selector-table-div").click();
        //} , 500)
      },
      error => {
        console.error(error)
      }
    )
  }

  showEvent(e){

  }

  clearDataset(){
    this.dataset = []
    //const hotInstance = this.hotRegisterer.getInstance(this.instance);
    //hotInstance.render()
  }


}
