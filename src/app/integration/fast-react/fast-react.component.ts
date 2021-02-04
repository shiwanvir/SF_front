import { Component, OnInit , ViewChild} from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';
import { Title } from '@angular/platform-browser';
//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';

//declare var $:any;
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-fast-react',
  templateUrl: './fast-react.component.html',
  styleUrls: ['./fast-react.component.css']
})
export class FastReactComponent implements OnInit {

  instance: string = 'instance';
  readonly apiUrl = AppConfig.apiUrl()
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  dataset: any[] = [];
  hotOptions: any;

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
  private auth : AuthService, private layoutChangerService : LayoutChangerService, private titleService: Title,
  private hotRegisterer: HotTableRegisterer) { }

  ngOnInit() {
    this.titleService.setTitle("Designation")//set page title

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Integration Services',
      'Fast React',
      'Products'
    ])

    //this.searchFrom()
    //this.initializePRLTable()

  }

  initializePRLTable(){
    this.hotOptions = {
      columns: [
        { type: 'text', title : 'P.CODE' , data: 'p_code' , readOnly: true},
        { type: 'text', title : 'P.TYPE' , data: 'p_type' , readOnly: true },
        { type: 'text', title : 'P.DESCRIP' , data: 'Product_type' },
        { type: 'text', title : 'P^WC:10' , data: 'p_10' },
        { type: 'text', title : 'P^WC:20' , data: 'p_20' },
        { type: 'text', title : 'P^WC:30' , data: 'p_30' },
        { type: 'text', title : 'P^WC:40' , data: 'p_40' },
        { type: 'text', title : 'P^WC:50' , data: 'p_50' },
        { type: 'text', title : 'P^WC:60' , data: 'p_60' },
        { type: 'numeric', title : 'P^WC:70' , data: 'total_smv', numericFormat: {pattern: '0.000'} },
        { type: 'text', title : 'P^WC:80' , data: 'p_80' },
        { type: 'text', title : 'P^WC:90' , data: 'p_90' },
        { type: 'text', title : 'P^WC:100', data: 'p_100' },
        { type: 'text', title : 'END' , data: 'end' }

      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 250,
      stretchH: 'all',
      selectionMode: 'range',
      /*fixedColumnsLeft: 3,*/
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
      cells : function(surce,row, col, prop , value){ //table cell render event. works for every cell in the table
        var cellProperties = {};
        return cellProperties;
      },

    }
  }

  searchFrom(){
    let fData = null
    AppAlert.showMessage('Processing...','Please wait while loading details')
    this.http.post(this.apiUrl + 'fastreact/load_fr_Details', fData)
    .subscribe(data => {

      console.log(data)
      //this.dataset[this.currentDataSetIndex] = data.customer_list
       let count_ar = data['data']['count'];
       for (var _i = 0; _i < count_ar; _i++)
       {
         var style = data['data']['load_list'][_i]['style']
         var silhouette = data['data']['load_list'][_i]['silhouette']
         var color_option = data['data']['load_list'][_i]['color_option']
         var component = data['data']['load_list'][_i]['component']
         if(data['data']['load_list'][_i]['print'] == 1){var print = 1 }else{var print = 0}
         if(data['data']['load_list'][_i]['pad_print'] == 1){var pad_print = 1 }else{var pad_print = 0}
         if(data['data']['load_list'][_i]['heat_seal'] == 1){var heat_seal = 1 }else{var heat_seal = 0}
         if(data['data']['load_list'][_i]['emblishment'] >= 1){var emblishment = 1 }else{var emblishment = 0}
         if(data['data']['load_list'][_i]['washing'] >= 1){var washing = 1 }else{var washing = 0}

         data['data']['load_list'][_i]['p_code'] = style+'::'+silhouette+'_'+component+'::'+color_option
         data['data']['load_list'][_i]['p_type'] = silhouette+'_'+component
         data['data']['load_list'][_i]['p_10']   = 1
         data['data']['load_list'][_i]['p_20']   = print
         data['data']['load_list'][_i]['p_30']   = pad_print
         data['data']['load_list'][_i]['p_40']   = heat_seal
         data['data']['load_list'][_i]['p_50']   = emblishment
         data['data']['load_list'][_i]['p_60']   = 1
         data['data']['load_list'][_i]['p_80']   = washing
         data['data']['load_list'][_i]['p_90']   = 1
         data['data']['load_list'][_i]['p_100']  = 1
         data['data']['load_list'][_i]['end']    = 'END'

         this.dataset.push(data['data']['load_list'][_i])
         const hotInstance = this.hotRegisterer.getInstance(this.instance);
         hotInstance.render()
       }


    setTimeout(() => { AppAlert.closeAlert() } , 1000)
     },
    error => {
      //this.snotifyService.error('Inserting Error', this.tosterConfig)
      setTimeout(() => { AppAlert.closeAlert() } , 1000)
    })


  }

  exportCSV()
  {
        window.open(AppConfig.FRProductEX());
  }







}
