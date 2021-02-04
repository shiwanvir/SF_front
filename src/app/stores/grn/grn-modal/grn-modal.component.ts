import { Component, OnInit,ViewChild, Input, ElementRef , Output, EventEmitter} from '@angular/core';
import {
  FormBuilder, FormGroup, FormControl, Validators, FormArray,
  ValidationErrors
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { AppConfig } from '../../../core/app-config';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {strictEqual} from "assert";
import { AppFormValidator } from '../../../core/validation/app-form-validator';
//import { ModalDirective } from 'ngx-bootstrap/modal';



@Component({
  selector: 'app-grn-modal',
  templateUrl: './grn-modal.component.html',
  styleUrls: ['./grn-modal.component.css']
})
export class GrnModalComponent implements OnInit {
  @ViewChild(ModalDirective) grnModel: ModalDirective;
  @Input() message: string;
  @Output() modalEmt = new EventEmitter();
  //@ViewChild(ModalDirective) grnModel: ModalDirective;

  htmlToAdd: string='';
  po_no: string='';
  sup_id: string='';
  processing : boolean = false;
  modalGroup : FormGroup
  apiUrl = AppConfig.apiUrl()
  appValidator: AppFormValidator
  poData$ : Observable<Array<any>>
  scList$ : Observable<Array<any>>
  colorList$ : Observable<Array<any>>
  modalLine$ : Observable<Array<any>>

  poLineHtml: string;
  modelForm:FormGroup

  @Output() opened = new EventEmitter<number>();

  constructor(private http:HttpClient, private fb:FormBuilder) {
    /*this.modelForm = this.fb.group({
      grn_model: this.fb.array([])
    });*/
  }


  ngOnInit() {

    this.modelForm = this.fb.group({
      po_no: new FormControl(),
      id: new FormControl(),
      sup_id: new FormControl(),
      item_list: this.fb.array([]),
      style_no:null
    })

    let customErrorMessages = {
      qty : {
        required : 'Quantity is empty'
      }
    }

    this.appValidator = new AppFormValidator(this.modelForm, customErrorMessages);


  }

  setSelectedPo(list, supId){
    this.modelForm.controls['po_no'].setValue(list);
    this.po_no = list;
    this.sup_id = supId;
  }

  addPoLineGroup(){
    return this.fb.group({
      sc_no: [],
      bpo: [],
      master_description: [],
      colour: [],
      size: [],
      uom: [],
      bal_qty: []
    })
  }

  saveGrnLines() {
    if (!this.appValidator.validate())//if validation faild return from the function
      return;

    var grn_lines = this.modelForm.value;

    this.modalEmt.emit();

    /*this.http.post(this.apiUrl + 'stores/save-grn-lines',grn_lines).subscribe(data => {
      this.modelForm.reset();
      this.modelForm.controls['id'].setValue(data['id']);
      this.modalEmt.emit();
    })*/

  }

  loadModal(id){
    this.http.get(this.apiUrl + 'merchandising/loadPoLineData?id='+id).subscribe( res => {
      //console.log(res['data'])
      var count = Object.keys(res['data']).length;

      for (var i = 0; i < count; i++) {
        const controll = new FormGroup({
          'po_line_id': new FormControl(res['data'][i]['id']),
          'cus_order': new FormControl(res['data'][i]['combine_id']),
          'customer': new FormControl(res['data'][i]['customer_name']),
          'bpo': new FormControl(res['data'][i]['bpo']),
          'master_description': new FormControl(res['data'][i]['master_description']),
          'colour': new FormControl(res['data'][i]['color_name']),
          'size': new FormControl(res['data'][i]['size_name']),
          'uom': new FormControl(res['data'][i]['uom_description']),
          'po_qty': new FormControl(res['data'][i]['tot_qty']),
          'bal_qty': new FormControl(res['data'][i]['tot_qty']),
          //'qty': new FormControl(res['data'][i]['qty'], [Validators.required, ValidateUrl]),
          'qty': new FormControl(res['data'][i]['qty'], [Validators.max(res['data'][i]['tot_qty'])]),
          'item_code': new FormControl(res['data'][i]['item_code']),
          'item_select': new FormControl(res['data'][i]['item_select'])
        });

        //console.log(this.modelForm);
        (<FormArray>this.modelForm.get('item_list')).push(controll);

      }

    })

    //var d1 = this.elementRef.nativeElement.querySelector('.html');

  }

  clearModelData(){
    const control = <FormArray>this.modelForm.controls['item_list'];
    for(let i = control.length-1; i >= 0; i--) {
      control.removeAt(i)
    }
  }

  closeModal(){

  }


  loadPoLines(){
      this.http.get(this.apiUrl + 'merchandising/loadPoLineData',{ params : {'id' : this.po_no }}).subscribe(data => {
        this.poData$ = data['data'];
        var count = Object.keys(this.poData$).length;

      })

  }

}
