import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map } from 'rxjs/operators';
import { HotTableRegisterer } from '@handsontable/angular';
import * as Handsontable from 'handsontable';

import {SnotifyService , SnotifyPosition} from 'ng-snotify';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgOption } from '@ng-select/ng-select';

import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { BasicValidators } from '../../../core/validation/basic-validators';
import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { Style } from '../../models/style.model';

declare var $: any;

@Component({
  selector: 'app-report-flash',
  templateUrl: './report-flash.component.html',
  styleUrls: ['./report-flash.component.css']
})
export class ReportFlashComponent implements OnInit {

  @ViewChild(ModalDirective) sectionModel: ModalDirective;

  formGroup : FormGroup
  readonly apiUrl = AppConfig.apiUrl()
  url = this.apiUrl + 'merchandising/bulk-costing'
    hotOptions: any
  dataset: any = [];
  instance: string = 'hot';
  imgSrc = 'http://surface/assets/styleImage/dif.png';


  style$: Observable<Array<any>>;
  styleLoading = false;
  styleInput$ = new Subject<string>();
  selectedstyle:Style;

  order_qty='';
  order_smv='';
  order_fob='';
  sewing_smv='';
  packing_smv='';
  finance_cost='';
  corporate_cost='';
  epm_rate='';
  netprofit='';
  factory_cpm='';
  frontend_cpm='';
  finance_rate='';

  constructor(private fb:FormBuilder , private http:HttpClient, private hotRegisterer: HotTableRegisterer, private snotifyService: SnotifyService) {
    this.formGroup = this.fb.group({
      Style: [[], [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadStyle();
  }

  loadStyle() {

    this.style$ = concat(
        of([]),
        this.styleInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.styleLoading = true),
            switchMap(term => this.http.get<Style[]>(this.url + '?type=auto', { params: { search: term } }).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.styleLoading = false)
            ))
        )
    );
  }

  loadStyleData() {

    this.dataset = [];
    this.http.get(this.url + '?type=report-flash&style_id=' + this.formGroup.get('Style').value.style_id)
        .pipe( map(data => data) )
        .subscribe(data => {
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          this.imgSrc = AppConfig.StayleImage()+data['image'];
          this.dataset = data['details'];
          this.order_qty=data['data']['order_qty']
          this.order_smv=data['data']['order_smv']
          this.order_fob=data['data']['order_fob']
          this.sewing_smv=data['data']['sewing_smv']
          this.packing_smv=data['data']['packing_smv']
          this.finance_cost=data['data']['finance_cost']
          this.corporate_cost=data['data']['corporate_cost']
          this.epm_rate=data['data']['epm_rate']
          this.epm_rate=data['data']['epm_rate']
          this.netprofit=data['data']['netprofit']
          this.factory_cpm=data['data']['factory_cpm']
          this.frontend_cpm=data['data']['frontend_cpm']
          this.finance_rate=data['data']['finance_rate']
          hotInstance.updateSettings({
            // cells : function (row,  col) {
            //   var cellProp = {};
            //
            //   this.renderer = negativeValueRenderer;
            //   if(row ===0){
            //     this.renderer = firstRowRenderer;
            //   }
            //   return cellProp
            // },
              stretchH: 'all',
              autoWrapRow: true,
            columns:[
              { type: 'text', title : 'CATEGORY' , data: 'category_name'},
              { type: 'text', title : 'SUB CATEGORY' , data: 'subcategory_name'},
              { type: 'text', title : 'ITEM CODE' , data: 'master_code'},
              { type: 'text', title : 'ITEM DESCRIPTION' , data: 'master_description'},
              { type: 'text', title : 'REQ QTY' , data: 'req_qty'},
              { type: 'text', title : 'TOT REQ QTY' , data: 'tot_req_qty'},
              { type: 'text', title : 'TOTAL VALUE' , data: 'total_value'}
            ],

          },false);



        })

  }



}
