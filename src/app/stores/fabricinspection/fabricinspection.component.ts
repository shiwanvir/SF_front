import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { FormBuilder , FormGroup , Validators,FormControl,FormArray} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';


import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;


import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

@Component({
  selector: 'app-fabricinspection',
  templateUrl: './fabricinspection.component.html',
  styleUrls: ['./fabricinspection.component.css']
})
export class FabricinspectionComponent implements OnInit {
  selectedColor: any;
  result = [
    {id: 1, name: 'Hold'},
    {id: 2, name: 'Reject'},
    {id: 3, name: 'Pass'}
  ];

  @ViewChild(ModalDirective) countryModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = ""
  readonly apiUrl = AppConfig.apiUrl()
  saveStatus = 'SAVE'
  appValidator : AppValidator
  datatable:any = null


  form: FormGroup;
  constructor(private fb:FormBuilder , private http:HttpClient) {
    this.form = this.fb.group({
      roll_info: this.fb.array([])
    });
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      po_no:null,
      sc_no:null,
      invoice_no:null,
      batch_no:null,
      part_no:null,
      description:null,
      info: this.fb.array([])
    })
   // this.createTable()
  }

  ngOnDestroy(){
      this.datatable = null
  }


  createTable() {
    this.datatable = $('#fabricinspection_tbl').DataTable({
      "scrollX": true,
      ajax:{
        dataType:'JSON',
        "url": this.apiUrl + "stores/get-all-fabric?type=datatable"
      },columns: [
        {
          data: "id",
          orderable: false,
          width: '3%',
          render : function(data,arg,full){
            var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
            str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
            return str;
          }
        },
        {
          data: "status",
          orderable: false,
          render : function(data){
            if(data == 1){
              return '<span class="label label-success">Active</span>';
            }
            else{
              return '<span class="label label-default">Inactive</span>';
            }
          }
        },
        { data: "invoice" },
        { data: "po_no" },
      ],
    });
  }

  saveStyle(){}

  search(){
    this.formGroup = this.fb.group({
      po_no:$('#po_no').val(),
      sc_no:$('#sc_no').val(),
      invoice_no:$('#invoice_no').val(),
      batch_no:$('#batch_no').val(),
      part_no:$('#part_no').val(),
      description:$('#description').val(),
      info: this.fb.array([])
    })

    this.http.get(this.apiUrl + 'store/fabricInspection',{ params: this.formGroup.getRawValue() })
        .subscribe(data => {
          var count = Object.keys(data).length;

          (<FormArray>this.form.get('roll_info')).controls = [];
          if(count > 0) {
            for (var i = 0; i <= (count - 1); i++) {

              const control = new FormGroup({
                'roll_no': new FormControl(data[i]['roll_no']),
                'purchase_weight': new FormControl(data[i]['purchase_weight']),
                'actual_weight': new FormControl(data[i]['actual_weight']),
                'purchase_width': new FormControl(data[i]['purchase_width']),
                'actual_width': new FormControl(data[i]['actual_width']),
                'po_color': new FormControl((data[i]['po_color'])),
                'shade': new FormControl(data[i]['shade']),
                'p_gsm': new FormControl(data[i]['p_gsm']),
                'a_gsm': new FormControl(data[i]['a_gsm']),
                'fault_rate': new FormControl(data[i]['fault_rate']),
                'length_y': new FormControl(data[i]['length_y']),
                'uom': new FormControl(data[i]['uom']),
                'fresh_length': new FormControl(data[i]['fresh_length']),
                'relaxing_length': new FormControl(data[i]['relaxing_length']),
                'color_inspection': new FormControl(data[i]['color_inspection']),
                'defect_grading': new FormControl(data[i]['defect_grading']),
                'total_grading': new FormControl(data[i]['total_grading']),
                'reason': new FormControl(data[i]['reason']),
                'shade_grading': new FormControl(data[i]['shade_grading']),
                'comments': new FormControl(data[i]['comments'])
              });
              (<FormArray>this.form.get('roll_info')).push(control);

            }
          }

        });
  }

  clear(){}

}
