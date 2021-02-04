import { Component, OnInit, ViewChild, NgModule  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { FormBuilder , FormGroup , Validators, AbstractControl, ValidatorFn} from '@angular/forms';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';
import { ConsoleService } from '@ng-select/ng-select/ng-select/console.service';

import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { AppAlert } from '../../../core/class/app-alert';
import { AppConfig } from '../../../core/app-config';
import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { BomService } from '../bom.service';

import { Colors } from '../../models/Colors.model';
import { Sizes } from '../../models/Sizes.model';

@Component({
  selector: 'app-matratio',
  templateUrl: './matratio.component.html',
  styleUrls: ['./matratio.component.css']
})
export class MatratioComponent implements OnInit {

  @ViewChild(ModalDirective) ratioModel: ModalDirective;
  //materialRatioForm : FormGroup
  //ratiodetails$ : Observable<any[]>;

  apiUrl = AppConfig.apiUrl()

  /*BOMId             = "";
  MatItemCode       = "";
  ComponentId       = "";
  SalesOrderId      = "";
  ItemDescription   = "";
  TotalReqQty       = 0;*/

  selectedItem = {}

  ColorList$:Observable<Array<any>>//observable to featch source list
  ColorListLoading = false;
  ColorListInput$ = new Subject<string>();
  selectedColors:Colors;

  SizeList$:Observable<Array<any>>//observable to featch source list
  SizeListLoading = false;
  SizeListInput$ = new Subject<string>();
  selectedSizes:Sizes;

  dataset: any = [];
  //arrayColors: any[] = [];
  //arraySizes: any[] = [];
  hotOptions: any
  instance: string = 'hot4';

  //MaterialRatioExist = false;
  materialRatioForm : FormGroup
  //bomRequiredQty = 0
  currentQty = 0
  formValidator : AppFormValidator
  processing : boolean = false

  constructor(private bomService : BomService, private fb : FormBuilder , private http:HttpClient ,
    private hotRegisterer: HotTableRegisterer , private snotifyService: SnotifyService) { }

  ngOnInit() {

    this.materialRatioForm = this.fb.group({
      color_id : [null, [this.colorSizeRequired('COLOR WISE')]],
      size_id : [null , [this.colorSizeRequired('SIZE WISE')]],
      required_qty : [0 , [Validators.required, Validators.min(0)]]
    });

    this.formValidator = new AppFormValidator(this.materialRatioForm, {})

    this.loadColorsList()
    this.loadSizeList()
    this.initializeRatioTable()


    this.bomService.lineData.subscribe(data => {
      if(data != null) {
        this.selectedItem = data

        this.materialRatioForm.reset()
        if(this.selectedItem['meterial_type'] == 'SIZE WISE'){
          this.materialRatioForm.get('color_id').disable()
          this.materialRatioForm.get('size_id').enable()
        }
        else if(this.selectedItem['meterial_type'] == 'COLOR WISE'){
          this.materialRatioForm.get('size_id').disable()
          this.materialRatioForm.get('color_id').enable()
        }
        else{
          this.materialRatioForm.get('size_id').enable()
          this.materialRatioForm.get('color_id').enable()
        }
        //this.loadMaterialRatio();
        //this.dataset = []
        //const hotInstance = this.hotRegisterer.getInstance(this.instance);
        //hotInstance.render();
        this.loadMaterialRatio(this.selectedItem['id'])
        this.ratioModel.show();
      }
    })
  }


  initializeRatioTable(){
    if(this.hotOptions != null){
      return
    }

    this.hotOptions = {
        columns: [
            { type: 'text', title : 'Color' , data: 'color_name'},
            { type: 'text', title : 'Size' , data: 'size_name' },
            { type: 'text', title : 'Required Qty' , data: 'required_qty', className:'htRight'}
        ],
        cells: (row, col, prop) => {
          var cellProperties = {};
          if(this.dataset[row] != undefined){
            if(this.dataset[row]['id'] == 0){ //chek row is edited by user and then change color
              cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
                var args = arguments;
                td.style.background = '#d1e0e0';
                Handsontable.renderers.TextRenderer.apply(this, args);
              }
            }
            else{
              cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
                var args = arguments;
                td.style.background = '#fff';
                Handsontable.renderers.TextRenderer.apply(this, args);
              }
            }
          }
          return cellProperties;
        },
        contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
          },
          items : {
            'remove' : {
              name : 'Remove',
              disabled: function (key, selection, clickEvent) {
                //  return this.getSelectedLast() == undefined // `this` === hot3
                return false
              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  let end = selection[0].end;
                  if(start.row == end.row){ //chek selected same row cells
                    AppAlert.showConfirm({
                      'text' : 'Do you want to remove this line?'
                    },(result) => {
                      if (result.value) {
                        this.currentQty -= parseFloat(this.dataset[start.row]['required_qty'])//calculate ratio summery
                        this.dataset.splice(start.row, 1) //delete from array
                        const hotInstance2 = this.hotRegisterer.getInstance(this.instance);
                        hotInstance2.render()
                      }
                    })
                  }
                }
              }
            }
          }
        },
        manualColumnResize: true,
        autoColumnSize : true,
        selectionMode: 'single',
        rowHeaders: true,
        height: 170,
        stretchH: 'all',
        colWidths: 100,
        readOnly : true
    }
  }

  //model show event
  modelShowEvent(e){

  }

  // Load color list to the dropdown
  loadColorsList(){

  /*  this.http.get<any[]>(this.serverUrl + 'api/org/colors',{params:{'type':'colorListing'}}).subscribe(data=>{

        for(let colorLen = 0; colorLen<data.length; colorLen++){
            this.arrayColors.push(data[colorLen]["color_name"],data[colorLen]["color_id"]);
        }
    });*/

    this.ColorList$ = concat(
        of([]), // default items
        this.ColorListInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.ColorListLoading = true),
            //switchMap(term => this.http.get<any[]>(this.serverUrl + 'api/org/colors?type=colorListing').pipe(
            switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/colors?type=auto', {params:{search:term}}).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.ColorListLoading = false)
            ))
        )
    );
  }

 loadSizeList(){

    /*this.http.get<any[]>(this.serverUrl + 'api/org/sizes',{params:{'type':'loadsizes'}}).subscribe(data=>{
        for(let sizeLen = 0; sizeLen<data.length; sizeLen++){
            this.arraySizes.push(data[sizeLen]["size_name"],data[sizeLen]["size_id"]);
        }

    });*/

    this.SizeList$ = concat(
        of([]), // default items
        this.SizeListInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.SizeListLoading = true),
            switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/sizes?type=auto&size_type=M',
              {params:{search:term, category_id : this.selectedItem['category_id'], subcategory_id : this.selectedItem['subcategory_id']}})
            .pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.SizeListLoading = false)
            ))
        )
    );
 }


  loadMaterialRatio(_bomDetailId){
    //this.http.get<any[]>(this.apiUrl + 'merchandising/bom/getratio',{params:{'bom_id':this.BOMId,'item_id':this.MatItemCode, 'component_id':this.ComponentId}}).subscribe(data =>{
    this.currentQty = 0
    this.processing = true
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading ratio')
    this.http.get<any[]>(this.apiUrl + 'merchandising/bom?type=bom_item_details',{params:{'bom_detail_id' : _bomDetailId }})
    .pipe( map(res => res['data']) )
    .subscribe(
        data => {
          this.processing = false
          this.dataset = []
          this.dataset = data['ratio']
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          hotInstance.render();
          //calculate ratio sum
          for(let x = 0 ; x < this.dataset.length ; x++){
            this.currentQty += this.dataset[x]['required_qty']
          }
          AppAlert.closeAlert()
          //this.MaterialRatioExist = true;
          //this.LoadActualRequiredQty();
      },
      error => {
        this.processing = false
        console.log(error)
        AppAlert.closeAlert()
      }
    );
  }


  addRatio(){
    let formData = this.materialRatioForm.getRawValue();
    if(this.validateNewRatio(formData) == true){
      this.dataset.push({
        id : 0,//used for ratio auto increment id
        color_id : (formData.color_id == null) ? null : formData.color_id.color_id,
        color_name : (formData.color_id == null) ? null : formData.color_id.color_name,
        size_id : (formData.size_id == null) ? null : formData.size_id.size_id,
        size_name : (formData.size_id == null) ? null : formData.size_id.size_name,
        required_qty : formData.required_qty
      })
    //  this.dataset.push({"color_name":selectedColor, "size_name":selectedSize, "required_qty":requiredQty});
      this.currentQty += parseFloat(formData.required_qty)
      this.materialRatioForm.reset()
      const hotInstance = this.hotRegisterer.getInstance(this.instance);
      hotInstance.render();
    }
  }


  validateNewRatio(_formData){
    let reqQty = 0
    if(this.selectedItem['meterial_type'] == 'SIZE WISE'){ //check size already exixts, if meterial type = SIZE WISE
      for(let x = 0 ; x < this.dataset.length ; x++){
        if(this.dataset[x]['size_id'] == _formData.size_id.size_id){
          AppAlert.showError({ text : 'Size already exists' })
          return false
        }
        reqQty += parseFloat(this.dataset[x]['required_qty'])
      }
    }
    else if(this.selectedItem['meterial_type'] == 'COLOR WISE'){//check color already exixsts, if meterial type = COLOR WISE
      for(let x = 0 ; x < this.dataset.length ; x++){
        if(this.dataset[x]['color_id'] == _formData.color_id.color_id){
          AppAlert.showError({ text : 'Color already exists' })
          return false
        }
        reqQty += parseFloat(this.dataset[x]['required_qty'])
      }
    }
    else if(this.selectedItem['meterial_type'] == 'BOTH'){ //chek color and size exists, if meterial type = BOTH
      for(let x = 0 ; x < this.dataset.length ; x++){
        if(this.dataset[x]['color_id'] == _formData.color_id.color_id && this.dataset[x]['size_id'] == _formData.size_id.size_id){
          AppAlert.showError({ text : 'Color size combination already exists' })
          return false
        }
        reqQty += parseFloat(this.dataset[x]['required_qty'])
      }
    }
    //chek sum of ratio qty is grater than bom required qty
    let ratioSum = reqQty + parseFloat(_formData.required_qty)
    if(ratioSum > parseFloat(this.selectedItem['required_qty'])) {
      AppAlert.showError({ text : 'Incorrect qty. Cannot increse BOM required qty' })
      return false
    }

    return true //no validation error
  }


  validateRatioQty(){
    let reqQty = 0;
    for(let x = 0 ; x < this.dataset.length ; x++){
      reqQty += parseFloat(this.dataset[x]['required_qty'])
    }

    if(reqQty > parseFloat(this.selectedItem['required_qty'])) {
      AppAlert.showError({ text : 'Incorrect qty. Cannot increse BOM required qty' })
      return false
    }
    else if(reqQty < parseFloat(this.selectedItem['required_qty'])) {
      AppAlert.showError({ text : 'Incorrect qty. Ratio qty must be equal to bom required qty' })
      return false
    }
    else{
      return true
    }
  }

  saveRatio() {
    if(this.dataset.length > 0){
      this.processing = true

      if(this.validateRatioQty() == true) {
        AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Saving...','Please wait while saving ratio')
        let reqData = {
          ratio : this.dataset,
          bom_detail_id : this.selectedItem['id']
        }
        this.http.post(this.apiUrl + 'merchandising/bom/ratio/save', reqData)
        .pipe( map(res => res['data']) )
        .subscribe(
          res => {
            if(res.status == 'success'){
              this.processing = false
              this.dataset = []
              this.dataset = res.ratio
              const hotInstance = this.hotRegisterer.getInstance(this.instance);
              hotInstance.render();
              AppAlert.closeAlert()
              AppAlert.showSuccess({ text : res.message })
            }
            else{
              this.processing = false
              AppAlert.closeAlert()
              AppAlert.showError({ text : res.message })
            }
          },
          error => {
            this.processing = false
            console.log(error)
            AppAlert.closeAlert()
            AppAlert.showError({ text : 'Process Error' })
          }
        )
      }
      else{
        this.processing = false
      }
    }
  }



  /*saveRatio(){
    //Before add or update set status '0' in material ratio
    let clearMatRatio = [];
  //  clearMatRatio.push({"bom_id":this.BOMId,"component_id":this.ComponentId,"master_id":this.MatItemCode});

    this.http.post(this.apiUrl + 'merchandising/bom/setzeromaterialratio', clearMatRatio[0]).subscribe(data=>{
        console.log(data);

    });

    for(var gridCount = 0; gridCount < this.dataset.length; gridCount++){

       let materialRatioDetails = [];

       var gridColor = this.dataset[gridCount]['color_name'];
       var gridSize = this.dataset[gridCount]['size_name'];
       var gridQty = this.dataset[gridCount]['required_qty'];

       var colorIndex = this.arrayColors.indexOf(gridColor);
       var colorId = this.arrayColors[colorIndex + 1];

       var sizeIndex = this.arraySizes.indexOf(gridSize);
       var sizeId = this.arraySizes[sizeIndex+1];

    //   materialRatioDetails.push({"bom_id":this.BOMId,"component_id":this.ComponentId,"master_id":this.MatItemCode,"color_id":colorId,"size_id":sizeId,"required_qty":gridQty,"orderid":this.SalesOrderId});

       this.http.post(this.apiUrl + 'merchandising/bom/savesmaterialratio', materialRatioDetails[0]).subscribe(data=>{
            console.log(data);

        });
       AppAlert.showSuccess({text : "Ratio save successfully" });
    }
  }*/

/*  LoadActualRequiredQty(){

    var actualReqQty = 0;

    for(var gridCount = 0; gridCount < this.dataset.length; gridCount++){

        var gridQty = this.dataset[gridCount]['required_qty'];

        actualReqQty+= gridQty;
    }

    this.materialRatioForm.patchValue({ctrlTotRequiredQty:actualReqQty});
  }*/


  //check for meterial type
  public colorSizeRequired(itemType: string): ValidatorFn {
      const validator = (control: AbstractControl): { [key: string]: any } => {
      if(this.selectedItem['meterial_type'] == 'SIZE WISE' && itemType == 'SIZE WISE'){
        if(control.value == null || control.value == ''){
          return { 'required': true }
        }
      }
      else if (this.selectedItem['meterial_type'] == 'COLOR WISE' && itemType == 'COLOR WISE') {
        if(control.value == null || control.value == ''){
          return { 'required': true }
        }
      }
      else if (this.selectedItem['meterial_type'] == 'BOTH') {
        if(control.value == null || control.value == ''){
          return { 'required': true }
        }
      }
      return undefined;
  }
  return validator;
 }


 hideRatioModel(){
   //chek for unsaved data
   let hasUnsavedData = false
   for(let x = 0 ; x < this.dataset.length ; x++){
     if(this.dataset[x]['id'] == 0){//get only edited rows
        hasUnsavedData = true
        break
     }
   }
   //if has unsaved data asked to save them
   if(hasUnsavedData){
     AppAlert.showConfirm({
       'text' : 'You have unsaved data. Do you want to continue without saving data?'
     },(result) => {
       if (result.value) {
         this.ratioModel.hide()
       }
     })
   }
   else{
     this.ratioModel.hide()
   }
 }

}
