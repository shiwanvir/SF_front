import { Component, OnInit } from '@angular/core';
import { FormBuilder , FormGroup , Validators,FormControl,FormArray} from '@angular/forms';
import { AppConfig } from '../../core/app-config';
import { AppValidator } from '../../core/validation/app-validator';
import { HttpClient } from '@angular/common/http';
declare var $:any;

@Component({
  selector: 'app-transfer-order',
  templateUrl: './transfer-order.component.html',
  styleUrls: ['./transfer-order.component.css']
})
export class TransferOrderComponent implements OnInit {

  formGroup : FormGroup
  modelTitle : string = ""
  readonly apiUrl = AppConfig.apiUrl()
  saveStatus = 'SAVE'
  appValidator : AppValidator
  datatable:any = null


  form: FormGroup;
  constructor(private fb:FormBuilder , private http:HttpClient) {
    this.form = this.fb.group({
      item_info: this.fb.array([])
    });
  }


  // constructor() { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      item_code:null,
      description:null,
      color:null,
      size:null,
      bin:null,
      UOM:null,
      stock_bal:null,
      trasfer_qty:null,
      info: this.fb.array([])
    })
  }
  search(){
    this.http.get(this.apiUrl + 'store/orderTransfer')
        .subscribe(data => {
          var count = Object.keys(data).length;
          (<FormArray>this.form.get('item_info')).controls = [];
          if(count > 0) {
            for (var i = 0; i <= (count - 1); i++) {
              const control = new FormGroup({
                    item_code:new FormControl(data[i]['item_code']),
                    description:new FormControl(data[i]['itemCreation'][0]['master_description']),
                    color:new FormControl(null),
                    size:new FormControl(null),
                    bin:new FormControl(null),
                    UOM:new FormControl(null),
                    stock_bal:new FormControl(data[i]['total_qty']),
                    trasfer_qty:new FormControl(null)
              });
              (<FormArray>this.form.get('item_info')).push(control);

            }
          }

        });
  }
    selectedItem(e: any,i){
      console.log(e.target.attributes.id.nodeValue);
      var id=e.target.attributes.id.nodeValue;
        if(e.target.checked == true){
            $('#'+id+'_trasfer_qty').prop('readonly', false);
        }else{
            $('#'+id+'_trasfer_qty').prop('readonly', true);

        }
  }


  saveStyle(){
    
  }
}
