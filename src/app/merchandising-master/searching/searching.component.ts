import { Component, OnInit, ViewChild, Input , Output ,EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { TabsetComponent } from 'ngx-bootstrap';

import { AppConfig } from '../../core/app-config';
//import { AppFormValidator } from '../../core/validation/app-form-validator';

@Component({
  selector: 'app-searching',
  templateUrl: './searching.component.html',
  styleUrls: ['./searching.component.css']
})
export class SearchingComponent implements OnInit {

  @Input('url') url : string = ''
  //@Input('fields') fields : Array<any> = []
  @Output('onSearch') searchEvent = new EventEmitter()

  @ViewChild('searchingModel') searchingModel: ModalDirective;
  @ViewChild('dataListModel') dataListModel: ModalDirective;

  modelTitle : string = 'Advamced Search'
  readonly apiUrl : string = AppConfig.apiUrl()
  formGroupSearching : FormGroup
  //formValidator : AppFormValidator
  objectKeys = Object.keys;
  currentField = null
  fields : Array<any> = []
  /*operators = {
    'string' : [
      { operator : '=', description : '= (equal)'},
      { operator : '!=', description : '!= (not equal)'},
      { operator : 'like', description : '% (like)'},
      { operator : 'like', description : '% (like)'}
    ],
    'number' : [
      { operator : '=', description : 'equal'},
      { operator : '>', description : 'grater than'},
      { operator : '<', description : 'less than'}
    ]
  }*/

  operators = [
    { operator : '=', description : '= (equal)'},
    { operator : '!=', description : '!= (not equal)'},
    { operator : '>', description : '> (grater than)'},
    { operator : '<', description : '< (less than)'},
    { operator : 'like', description : '% (like)'},
    { operator : 'like', description : '%% (contains)'}
  ]

/*  fields = [
    {
      field : 'merc_customer_order_header.order_id',
      //table : 'merc_customer_order_header',
      field_description : 'Order ID',
      type : 'number'
    },
    {
      field : 'merc_customer_order_header.order_code',
      //table : 'merc_customer_order_header',
      field_description : 'Order code',
      type : 'string'
    },
    {
      field : 'merc_customer_order_header.order_code',
    //  table : 'merc_customer_order_header',
      field_description : 'Order company',
      foreign_key : 'org_company.company_id',
      type : 'string'
    },
    {
      field : 'merc_customer_order_header.order_style',
      //table : 'merc_customer_order_header',
      field_description : 'Order style',
      type : 'string'
    }
  ]*/


  addedFields = []

//  queryObject = {}


  constructor(private http:HttpClient, private fb:FormBuilder) { }

  ngOnInit() {

    this.loadSearchFields()
  /*  this.formGroupSearching = this.fb.group({
      db_field : [null, [Validators.required]],
      operator : [null, [Validators.required]],
      operator_value : [null, [Validators.required]]
    })
    this.formValidator = new AppFormValidator(this.formGroupSearching , {})*/
  }

  openSearch(){
    this.searchingModel.show()
  }

  showEvent(e){

  }

  loadList(key, field_name){
    this.modelTitle = field_name + ' list'
    this.dataListModel.show()
  }

  addOperator(e, index){

    this.fields[index]['query'] = this.fields[index]['query'] + e.target.value
  }


  search(){
    /*let reqData = []
    for(let x = 0 ; x < this.fields.length ; x++){
      reqData.push({
        field : this.fields[x].field,
        query : this.fields[x].query
      })
    }
    this.searchEvent.emit(reqData)*/
    console.log(this.addedFields)
    this.searchEvent.emit(this.addedFields)


  }

  /*addNewCondition(){
    let formData = this.formGroupSearching.value
    if(!this.queryObject.hasOwnProperty(formData.db_field)){
    //  this.queryObject[formData.db_field]['description'] = formData
      this.queryObject[formData.db_field] = []
    }
    this.queryObject[formData.db_field].push({
      operator : formData.operator,
      operator_value : formData.operator_value
    })
    console.log(this.queryObject)
  }*/


  clear(){
    this.addedFields = []
  }


  addField(){

    this.addedFields.push({
      field : this.currentField.field,
      field_description : this.currentField.field_description,
      query : '',
      type : this.currentField.type
    })
  }

  changeField(e){
    this.currentField = e;
  }

  changeOperator(e, i){
    let operator = e.target.value
    if(operator != ''){
      this.addedFields[i].query = (this.addedFields[i].query == '') ? (this.addedFields[i].query + operator) : (this.addedFields[i].query + ';' + operator)
    }
  }


  loadSearchFields(){
    this.http.get(this.apiUrl + this.url)
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      this.fields = data
    })
  }


  countSearch(){

  }

}
