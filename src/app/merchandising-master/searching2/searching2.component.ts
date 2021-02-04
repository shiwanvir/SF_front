import { Component, OnInit, ViewChild, Input , Output ,EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { QueryBuilderConfig, QueryBuilderClassNames } from 'angular2-query-builder';

import { AppConfig } from '../../core/app-config';
import { AppFormValidator } from '../../core/validation/app-form-validator';

@Component({
  selector: 'app-searching2',
  templateUrl: './searching2.component.html',
  styleUrls: ['./searching2.component.css']
})
export class Searching2Component implements OnInit {

  @Input('url') url : string = ''
  //@Input('selected') data2 : Array<any> = []
  @Output('onSearch') searchEvent = new EventEmitter()

  @ViewChild('searchingModel') searchingModel: ModalDirective;

  modelTitle : string = ''
  readonly apiUrl = AppConfig.apiUrl()

  query = {
    condition: 'or',
    rules: [
      /*{field: 'age', operator: '<=', value: 'Bob'},
      {field: 'gender', operator: '>=', value: 'm'}*/
    ]
  };

  config: QueryBuilderConfig = {
    fields: {
      'merc_customer_order_header.order_id': { name: 'Order Id', type: 'number' ,/* operators: ['equal', 'not_equal', 'in', 'not_in', 'is_null', 'is_not_null']*/},
      'merc_customer_order_header.order_code': { name: 'Order Code', type: 'string' },
      'merc_customer_order_header.order_style' : { name: 'Order Style', type: 'string' }
    }
  }

  classNames: QueryBuilderClassNames = {
  /*removeIcon: 'icon-bin',
  addIcon: 'fa fa-plus',
  arrowIcon: 'fa fa-chevron-right px-2',*/
  button: 'btn btn-xs',
  buttonGroup: 'btn-group',
  /*rightAlign: 'order-12 ml-auto',
  switchRow: 'd-flex px-2',
  switchGroup: 'd-flex align-items-center',
  switchRadio: 'custom-control-input',
  switchLabel: 'custom-control-label',
  switchControl: 'custom-control custom-radio custom-control-inline',
  row: 'row p-2 m-1',
  rule: 'border',
  ruleSet: 'border',
  invalidRuleSet: 'alert alert-danger',
  emptyWarning: 'text-danger mx-auto',*/
  operatorControl: 'form-control input-xxs',
  /*operatorControlSize: 'col-auto pr-0',*/
  fieldControl: 'form-control input-xxs',
  /*fieldControlSize: 'col-auto pr-0',*/
  entityControl: 'form-control input-xxs',
  /*entityControlSize: 'col-auto pr-0',*/
  inputControl: 'form-control input-xxs',
  /*inputControlSize: 'col-auto'*/
}

  constructor() { }

  ngOnInit() {
  }

  openSearch(){
    this.searchingModel.show()
  }

  search(){
    console.log(this.query)
    this.searchEvent.emit()
  }

  clear(){
  /*  this.formGroupSearching.reset()
    this.queryObject = {}*/
  }

  showEvent(e){

  }

}
