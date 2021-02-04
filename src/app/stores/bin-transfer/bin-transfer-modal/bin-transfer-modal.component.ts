import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormControl, FormBuilder, FormArray} from "@angular/forms";
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../../core/app-config';

@Component({
  selector: 'app-bin-transfer-modal',
  templateUrl: './bin-transfer-modal.component.html',
  styleUrls: ['./bin-transfer-modal.component.css']
})
export class BinTransferModalComponent implements OnInit {
  @Output() modalEmt = new EventEmitter();
  @Output() saveEvent = new EventEmitter();

  modalGroup : FormGroup

  binArr: Object = [];
  apiUrl = AppConfig.apiUrl()
  binTransferId: any;

  constructor(private fb:FormBuilder, private http:HttpClient) { }

  ngOnInit() {
    this.modalGroup = new FormGroup({
      binName: new FormControl(),
      binModalData: this.fb.array([])
    })
  }


  loadModalBinQty(){

     this.http.get(this.apiUrl + 'stores/load-bin-qty?id='+this.modalGroup.controls['binName'].value).subscribe(res => {

       var count = Object.keys(res['data']).length;

       for (var i = 0; i < count; i++) {
         const controls = new FormGroup({
           'style': new FormControl(res['data'][i]['style_no']),
           'item_code': new FormControl(res['data'][i]['master_id']),
           'item': new FormControl(res['data'][i]['master_description']),
           'colour': new FormControl(res['data'][i]['color_name']),
           'size': new FormControl(res['data'][i]['size_name']),
           'uom': new FormControl(res['data'][i]['uom_code']),
           'so': new FormControl(2000),
           'color_id': new FormControl(res['data'][i]['color_id']),
           'size_id': new FormControl(res['data'][i]['size_id']),
           'uom_id': new FormControl(res['data'][i]['uom_id']),
           'material_id': new FormControl(res['data'][i]['master_id']),
           'qty': new FormControl(res['data'][i]['total_qty']),
           'style_id': new FormControl(res['data'][i]['style_id']),
           'select_item': new FormControl()
         });


         (<FormArray>this.modalGroup.get('binModalData')).push(controls);
       }
     })

  }

  addToBinQty(){
    var binData = this.modalGroup.value;

    this.http.post(this.apiUrl + 'stores/add-bin-qty',binData).subscribe(data => {
      this.binTransferId = data;
      this.saveEvent.emit(binData)

    })
  }

}
