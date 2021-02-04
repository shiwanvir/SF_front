import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder , FormGroup , FormControl,Validators, FormArray} from '@angular/forms';

import { Subject, Observable, of, concat } from 'rxjs';
import { AppConfig } from '../../../core/app-config';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

@Component({
  selector: 'app-grn-bin',
  templateUrl: './grn-bin.component.html',
  styleUrls: ['./grn-bin.component.css']
})

export class GrnBinComponent implements OnInit {
  apiUrl = AppConfig.apiUrl()
  binForm : FormGroup
  items: FormArray;

  binList$ : Observable<Array<any>>
  binListSelected$ : Observable<Array<any>>
  @Output() binEmt = new EventEmitter();

  constructor(private fb:FormBuilder, private http:HttpClient) { }

  ngOnInit() {
    this.binForm = this.fb.group({
      bin_list : this.fb.array([]),
      line_id: new FormControl(),
      id: new FormControl()
    })

    //this.createBinItem()
  }

  loadBinList(){
    this.binList$ = this.http.get(this.apiUrl + 'stores/loadPoBinList?id=4').pipe(map( res => res['data']))
  }

  addItem() {
    this.items = this.binForm.get('items') as FormArray;
   // this.items.push(this.createBinItem())
  }

  addNewBinRow(){
    const controll = new FormGroup({
      'bin': new FormControl(this.binListSelected$),
      'qty': new FormControl()
    });

    (<FormArray>this.binForm.get('bin_list')).push(controll);
  }

  createBinItem(lineId){
    const control = <FormArray>this.binForm.controls['bin_list'];
    for(let i = control.length-1; i >= 0; i--) {
      control.removeAt(i)
    }

    //this.binListSelected$ = this.http.get(this.apiUrl + 'stores/loadAddedBins?lineId='+lineId).pipe(map( res => res['data']))
    this.http.get(this.apiUrl + 'stores/loadAddedBins?id='+lineId).subscribe( res => {
      var count = Object.keys(res['data']).length;

      if(count == 0){
         const controll = new FormGroup({
         'bin': new FormControl(this.binListSelected$),
         'qty': new FormControl()
         });

        (<FormArray>this.binForm.get('bin_list')).push(controll);
       }else {
        for (var i = 0; i < count; i++) {
          const controll = new FormGroup({
            'bin': new FormControl(res['data'][i]['store_bin_id']),
            'qty': new FormControl(res['data'][i]['qty'])
          });
          (<FormArray>this.binForm.get('bin_list')).push(controll);
        }
      }

    })
  }

  addBinAllocation(){
    this.binEmt.emit();
  }

}
