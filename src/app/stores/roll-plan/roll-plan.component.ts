import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators,FormControl,FormArray} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Subject, Observable, of, concat } from 'rxjs';
//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

// import { AppValidator } from '../../core/validation/app-validator';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
@Component({
  selector: 'app-roll-plan',
  templateUrl: './roll-plan.component.html',
  styleUrls: ['./roll-plan.component.css']
})

export class RollPlanComponent implements OnInit {
  formGroup : FormGroup
  datatable:any = null
  apiUrl = AppConfig.apiUrl();
  htmlToAdd: string='';
  itemCone:number=0;
  poNo$: Observable<any[]>;//use to load customer list in ng-select
  poLoading = false;
  poInput$ = new Subject<string>();
  selectedPo: any[]
     values =  [];
     valuesY =  [];
    styleValue='';
  hotOptions: any
  instance: string = 'instance';
  dataset: any[] = [];
  form: FormGroup;
  config: any[] = [];
    constructor(private fb:FormBuilder , private http:HttpClient,private elementRef: ElementRef,  private titleService: Title) {
    this.form = this.fb.group({
      roll_info: this.fb.array([])
    });
  }
  ngOnInit() {
    this.titleService.setTitle("Roll Plan Update")//set page title

    this.formGroup = this.fb.group({
      surgeries: this.fb.array([]),
      style_no:null,
      po_no:null
    })
  }

  createTable(text) {
console.log(text);
    this.datatable = $('#main_po_tbl').DataTable({
      autoWidth: false,
      scrollY: "500px",
      scrollCollapse: true,
      processing: true,
      serverSide: true,
        scrollX: true,
        paging: false,
        // paging: false,
        searching: false,
        destroy: true,
        // filter: false,
        // info: false,
        // ordering: false,
        // processing: true,
        // retrieve: true,
        ajax: {
        dataType : 'JSON',
        "url": this.apiUrl + "stores/po-load?type=datatable&text="+text
      },
      columns: [
        {
          data: "po_id",
          orderable: false,
          width: '3%',
          render : function(data,arg,full){
            var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
            return str;
          }

        },

         // { data: "po_id" },
        { data: "sc_no" },
        { data: "line_no" },
        { data: "colour" },
        { data: "unit_price" },
        { data: "uom" },
        { data: "req_qty" }

      ],

    });
      // this.reloadTable();

    //listen to the click event of edit and delete buttons
    $('#main_po_tbl').on('click','i',e => {
      let att = e.target.attributes;
      if(att['data-action']['value'] === 'EDIT'){
        this.edit(att['data-id']['value']);
      }

    })


  }
  edit(id) { //get payment term data and open the model
    var item_code=0;

    this.http.get(this.apiUrl + 'stores/po-load?type=loadPo',{ params : {'poId' : id }})
        .subscribe(data => {

            console.log(count);
            console.log(data['po'])
            var po=data['po'];
            var roll=data['roll'];
            var count = Object.keys(roll).length;

            item_code = po[0]['item_code'];
            this.itemCone = item_code;

        console.log(count);
          var d1 = this.elementRef.nativeElement.querySelector('.html');
          d1.innerHTML ='';
          d1.insertAdjacentHTML('beforeend', '<div  class="col-md-3"><label>Style No :</label><label>'+po[0]['sc_no']+'</label></div><div class="col-md-3"><input type="hidden" id="item_code" value="'+po[0]['item_code']+'"><label>Po Number</label>'+po[0]['po_id']+'</div>' +
              '<div class="col-md-3"><label>Line No :</label><label>'+po[0]['line_no']+'</label></div><div class="col-md-3"><div class="col-md-4"><label>NOF Rolls</label></div><div class="col-md-4"><input type="text" id="nof_roll" formControlName="nof_roll"  #nof_roll class="form-control"></div><div class="col-md-4"><i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="setRollData" id="setRollData" (keydown)="keyDownFunction($event)"  data-id="nof_roll.value"></i></div></div>');
            (<FormArray>this.form.get('roll_info')).controls = [];
         if(count > 0) {
             for (var i = 0; i <= (count - 1); i++) {

                 const control = new FormGroup({
                     'roll_id': new FormControl(roll[i]['id']),
                     'item_code': new FormControl(roll[i]['item_code']),
                     'lot': new FormControl(roll[i]['lot_no']),
                     'roll': new FormControl(roll[i]['roll_no']),
                     'qty_y': new FormControl(roll[i]['qty_yardage']),
                     'qty_m': new FormControl((roll[i]['qty_yardage'])*0.9144),
                     'comment': new FormControl(roll[i]['comment'])
                 });
                 this.values[i]=(roll[i]['qty_yardage'])*0.9144;
                 this.valuesY[i] =roll[i]['qty_yardage'];
                 (<FormArray>this.form.get('roll_info')).push(control);

             }
         }

        })



    //listen to the click event of edit and delete buttons
    $('#po_details').on('click','i',e => {
          let att = e.target.attributes;
          console.log(att);
          if(att['data-action']['value'] === 'setRollData'){
              this.setRollData($('#nof_roll').val());
          }
      })
  }
   setRollData(noOfRoll){
        if(noOfRoll > 0){
  for(var i = 0; i <= (noOfRoll-1); i++){

      const control = new FormGroup({
      'roll_id': new FormControl(0),
      'item_code': new FormControl(this.itemCone),
      'lot': new FormControl(null),
      'roll': new FormControl(null),
      'qty_y': new FormControl(null),
      'qty_m': new FormControl(null),
      'comment': new FormControl(null)
    });
    (<FormArray>this.form.get('roll_info')).push(control);

  }
}
  }

    deleteline(lineNo: number){
        if(confirm("Are you sure to delete "+lineNo)) {
            (<FormArray>this.form.get('roll_info')).removeAt(lineNo)
        }
    }

    reloadTable() {//reload datatable
        this.datatable.ajax.reload(null, false);
    }

    onKey(event: any,i) {
       console.log((<FormArray>this.form.get('roll_info')).controls[0].value.qty_m);
        this.values[i] = (event.target.value)*0.9144 ;
    }

    onKeyY(event: any,i) {
        this.valuesY[i] = (event.target.value)*1.09361 ;
    }
    checkSilhouetteSmvRanage(){

    }
}
