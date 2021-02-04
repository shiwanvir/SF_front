import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';


//third part components
import { NgOption } from '@ng-select/ng-select';
import { ModalDirective } from 'ngx-bootstrap/modal';
import {ComponentLoaderFactory} from 'ngx-bootstrap/component-loader';
import {PositioningService} from 'ngx-bootstrap/positioning';
declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { AuthService } from '../../core/service/auth.service';
//models
import { ProductSilhouette } from '../models/ProductSilhouette.model';
import { ProductCategory } from '../models/ProductCategory.model';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-product-average-efficiency-list',
  templateUrl: './product-average-efficiency-list.component.html',
  providers: []
})
export class ProductAverageEfficiencyListComponent implements OnInit {

  @ViewChild(ModalDirective) efficiencyModel: ModalDirective;

  formValidatorHeader : AppFormValidator;
  appValidator : AppValidator;
  formGroup : FormGroup
  modelTitle : string = "New Product Average Efficiency"
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  saveStatus = 'SAVE'
  processingHeader : boolean = false;

  pro_category$: Observable<ProductCategory[]>;
  proCategoryLoading = false;
  proCategoryInput$ = new Subject<string>();

  productSilhouette$: Observable<ProductSilhouette[]>;
  productSilhouetteLoading = false;
  productSilhouetteInput$ = new Subject<string>();

  constructor(private fb:FormBuilder , private http:HttpClient, private layoutChangerService : LayoutChangerService, private titleService: Title, private auth : AuthService ) { }

  ngOnInit() {
    this.titleService.setTitle("Product Average Efficiency")//set page title

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'Merchandising',
      'Product Average Efficiency'
    ])

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      id:0,
      product_category: [null, [Validators.required]],
      product_silhouette : [null, [Validators.required]],
      // date_range : null,
      version:null,
      qty_from : [null , [Validators.required, PrimaryValidators.isNumber, PrimaryValidators.isInteger]],
      qty_to:[null , [Validators.required, PrimaryValidators.isNumber, PrimaryValidators.isInteger]],
      efficiency:[null , [Validators.required, PrimaryValidators.isNumber, PrimaryValidators.isInteger]]
    })
    this.formValidatorHeader = new AppFormValidator(this.formGroup , {})

    this.loadProductCate();
    this.loadProSilhouette();
    this.createTable() //load data list
  }

  loadProductCate() {
    this.pro_category$ = this.proCategoryInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.proCategoryLoading = true),
      switchMap(term => this.http.get<ProductCategory[]>(this.apiUrl + 'getProductCategory' , {params:{search:term}})
      .pipe(
        //catchError(() => of([])), // empty list on error
        tap(() => this.proCategoryLoading = false)
      ))
    );
  }

  loadProSilhouette(){
    this.productSilhouette$ = this.productSilhouetteInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.productSilhouetteLoading = true),
      switchMap(term => this.http.get<ProductSilhouette[]>(this.apiUrl + 'getProductSilhouette' , {params:{search:term}})
      .pipe(
        //catchError(() => of([])), // empty list on error
        tap(() => this.productSilhouetteLoading = false)
      ))
    );
  }

  checkFromQty(e){
    let val = e['target'].value
    let formData = this.formGroup.getRawValue();
    let qtyFrom = formData['qty_from']

    if(val <= qtyFrom){
      AppAlert.showError({text : 'Value Must Be Greater Than Qty From'})
      e['target'].value = ''
    }
  }

  //save purchase order header
  saveEfficiency() {

    this.processingHeader = true
    AppAlert.showMessage('Processing...','Please wait while saving details')

    let saveOrUpdate$ = null;
    let saveOrUpdateHis$ = null;
    let formData = this.formGroup.getRawValue();
    let effId = this.formGroup.get('id').value

    formData['prod_cat_id'] = formData['product_category']['prod_cat_id']
    formData['product_silhouette_id'] = formData['product_silhouette']['product_silhouette_id']
    formData['qty_from'] = formData['qty_from']
    formData['qty_to'] = formData['qty_to']
    formData['efficiency'] = formData['efficiency']

    if(this.saveStatus == 'SAVE') {
      saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/pro_ave_efficiency', formData)
      saveOrUpdateHis$ = this.http.post(this.apiUrl + 'merchandising/pro_ave_efficiency_history', formData)
    }
    else if(this.saveStatus == 'UPDATE') {
      saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/pro_ave_efficiency/' + effId , formData)
      saveOrUpdateHis$ = this.http.put(this.apiUrl + 'merchandising/pro_ave_efficiency_history/updates', formData)
    }

    saveOrUpdateHis$.subscribe();
    saveOrUpdate$
    .pipe( map(res => res['data'] ) )
    .subscribe(
      (res) => {
        if(res.status == 1){
          this.formGroup.patchValue({version: res.efficiency['version'] });
          this.saveStatus = 'UPDATE'
          this.processingHeader = false
          this.reloadTable();

          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({text : res.message })
          } , 1000)

          this.efficiencyModel.hide();

        }else{
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({text : res.message })
            this.formGroup.patchValue({qty_to: null });
          } , 1000)
        }
      },
      (error) => {
        this.processingHeader = false
        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showError({text : 'Process Error' })
        } , 1000)
        console.log(error)
      },
    );

  }

  ngOnDestroy(){
    this.datatable = null
  }

  createTable() { //initialize datatable
    this.datatable = $('#efficiency_tbl').DataTable({
      autoWidth: false,
      scrollY: "500px",
      scrollCollapse: true,
      processing: true,
      serverSide: true,
      order:[[0,'desc']],
      ajax: {
        dataType : 'JSON',
        "url": this.apiUrl + "merchandising/pro_ave_efficiency?type=datatable"
      },
      columnDefs: [
        { className: "text-left", targets: [1] },
        { className: "text-left", targets: [2] },
        { className: "text-right", targets: [3] },
        { className: "text-right", targets: [4] },
        { className: "text-right", targets: [5] },
        { className: "text-right", targets: [6] }
      ],
      columns: [
        {
          data: "id",
          orderable: false,
          width: '3%',
          render : function(data,arg,full){
            var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
            // str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
            return str;
          }
        },
        { data: "prod_cat_description"},
        { data: "product_silhouette_description"},
        { data: "version"},
        { data: "qty_from"},
        { data: "qty_to"},
        { data: "efficiency"}
      ]
    });

    //listen to the click event of edit and delete buttons
    $('#efficiency_tbl').on('click','i',e => {
      let att = e.target.attributes;
      if(att['data-action']['value'] === 'EDIT'){
        this.edit(att['data-id']['value']);
      }
    });

  }

  reloadTable() {//reload datatable
    this.datatable.ajax.reload(null, false);
  }

  showEvent(event){ //show event of the bs model

    // this.formGroup.get('validation_error').enable()
    this.formGroup.enable();
    this.formGroup.get('version').disable()
    this.formGroup.reset();
    this.modelTitle = "New Product Average Efficiency"
    this.saveStatus = 'SAVE'

  }


  edit(id) { //get SMVUpdate data and open the model
    this.http.get(this.apiUrl + 'merchandising/pro_ave_efficiency/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.efficiencyModel.show()
        this.modelTitle = "Update Product Average Efficiency"

        this.formGroup.patchValue({
          'id' : data['id'],
          'product_category' : data['pro_category'],
          'product_silhouette' : data['silhouette'],
          'version' : data['version'],
          'qty_from' : data['qty_from'],
          'qty_to' : data['qty_to'],
          'efficiency' : data['efficiency']
        })

        this.formGroup.get('product_category').disable()
        this.formGroup.get('product_silhouette').disable()
        // this.formGroup.get('date_range').disable()
        this.formGroup.get('version').disable()
        this.formGroup.get('qty_from').disable()
        this.formGroup.get('qty_to').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }

}
