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
  selector: 'app-country-selector',
  templateUrl: './country-selector.component.html',
  styleUrls: ['./country-selector.component.css']
})
export class CountrySelectorComponent implements OnInit {

  @ViewChild(ModalDirective) countryModel : ModalDirective;
  readonly apiUrl = AppConfig.apiUrl()
  formGroup : FormGroup
  hotOptions: any
  dataset: any = []
  instance: string = 'tbl_country_selector'
  selectedCountry = null

  @Output() onCountrySelected = new EventEmitter<string>();

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
        { type: 'text', title : 'Country Code' , data: 'country_code'},
        { type: 'text', title : 'Country Name' , data: 'country_description'}
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
              name : 'Add Country',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  //this.dataset = []
                  this.selectCountry()
                }
              }
            },

          }
      },
      afterSelection: (obj, row1, col1, row2, col2, selectionLayerLevel) => {
        if(row1 == row2){ //chek user select only single row
          this.selectedCountry = this.dataset[row1]
        }
        else{
          AppAlert.showError({text : 'Cannot select multiple rows'})
        }
      }
    }
  }

  openModel(){
    this.dataset = []
    document.getElementById('txt_search_size')['value'] = ''
    this.countryModel.show()
  }

  hideModel(){
    this.dataset = []
    document.getElementById('txt_search_size')['value'] = ''
    this.countryModel.hide()
  }

  selectCountry() {
    //console.log(this.selectedCountry)
    this.onCountrySelected.emit(this.selectedCountry)
  }


  search(e){
    //console.log(document.getElementById('txt_search')['value'])
    let searchText = document.getElementById('txt_search_size')['value']
    this.http.get(this.apiUrl + 'org/countries?type=country_selector&search=' + searchText)
    .subscribe(
      res => {
        //const hotInstance = this.hotRegisterer.getInstance(this.instance);
        //console.log(res)
        //this.dataset = []
        this.dataset = res['data']
        document.getElementById('country-selector-table-div').click()
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
    //this.dataset = []
    setTimeout(()=> {
      const hotInstance = this.hotRegisterer.getInstance(this.instance);
      hotInstance.render()
    }, 200)
  }

}
