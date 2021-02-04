import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HotTableRegisterer } from '@handsontable/angular';
import { AuthService } from '../../../core/service/auth.service';
import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { StyleCreationService } from '../style-creation.service';
import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { ProductSilhouette } from '../../models/ProductSilhouette.model';
import { ProductType } from '../../models/ProductType.model';

@Component({
  selector: 'app-style-creation-popup',
  templateUrl: './style-creation-popup.component.html',
  styleUrls: ['./style-creation-popup.component.css']
})
export class StyleCreationPopupComponent implements OnInit {

  @ViewChild(ModalDirective) splitModel: ModalDirective;
  formGroup : FormGroup
  formSplit : FormGroup
  readonly apiUrl = AppConfig.apiUrl()
  serverUrl = AppConfig.apiServerUrl();
  modelTitle = 'Product Feature'
  formValidatorSplit : AppFormValidator
  processing : boolean = false
  saveStatus = 'SAVE'
  //splitList : boolean = true
  orderLineData = null
  totalOrderQty : number = 0
  totalPlannedQty : number = 0

  dataset: any[] = [];
  hotOptions: any
  instance:string = 'instance';
  subCatList = []
  subCatList2 = []
  //instance: string = 'hot';

  currentSplitLine : number = -1
  currentDataSetIndex : number = -1

  ProductSilhouette$:Observable<Array<any>>//observable to featch source list
  ProductSilhouetteLoading = false;
  ProductSilhouetteInput$ = new Subject<string>();
  selectedProductSilhouette:ProductSilhouette

  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop}

  constructor(private styleCreationService : StyleCreationService,
    private fb : FormBuilder , private http:HttpClient ,
    private hotRegisterer: HotTableRegisterer,
    private snotifyService: SnotifyService,private authService : AuthService)
  { }

  ngOnInit() {

    this.initializeTable()
    //this.getProductSilhouette();

    this.styleCreationService.popUpLoad.subscribe(data => {
    if(data != null){
    this.splitModel.show()
    let fe_data = (<HTMLInputElement>document.getElementById('ProductFeature')).value;
    //console.log(fe_data);
    this.loadProductComponent(fe_data)
    }
    })


  }


  modelShowEvent(e)
  {
    //  let fe_data = (<HTMLInputElement>document.getElementById('ProductFeature')).value;
      //console.log(fe_data);
    //  this.loadProductComponent(fe_data)

      //this.getProductSilhouette();
  }

  initializeTable(){
    this.hotOptions = {
      columns: [

        { type: 'text', title : 'Assigned' , data: 'assign' ,className: "htLeft"},
        { type: 'text', title : 'Name' , data: 'display', readOnly: false,className: "htLeft"},
        {
          type: 'autocomplete', title : 'Product Silhouette' , data: 'product_silhouette_description',className: "htLeft" , readOnly: false,strict: true,
          source: (query, process) => {
            $.ajax({
              url:this.apiUrl+'merchandising/pro-silhouette?type=auto',
              dataType: 'json',
              data: {query: query},
              success: function (response) {
                process(response);
              }
            });
          }
        },

        { type: 'autocomplete', title : 'Emblishment' , data: 'emb', readOnly: false ,strict: false,
          source: ['YES', 'NO'],className: "htLeft"},
        { type: 'autocomplete', title : 'Washing' , data: 'wash', readOnly: false ,strict: false,
          source: ['YES', 'NO'],className: "htLeft"}

      ],

      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 280,
      stretchH: 'all',
      selectionMode: 'range',
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
      afterChange:(changes,surce,row,col,value,prop)=>{

        let x=this.dataset;
        if(surce!=null){
        let y=surce["0"]["0"];
        //console.log(surce["0"]["1"])
        if(surce["0"]["1"] == 'emb')
        {
          if(this.dataset[y]["emb"] != 'YES'){
            if(this.dataset[y]["emb"] != 'NO'){
              AppAlert.showError({text:"Please Select Correct Emblishment."});
              this.dataset[y]['emb']=''
            }

          }

          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          hotInstance.render()

        }

        if(surce["0"]["1"] == 'wash')
        {
          if(this.dataset[y]["wash"] != 'YES'){
            if(this.dataset[y]["wash"] != 'NO'){
              AppAlert.showError({text:"Please Select Correct Washing."});
              this.dataset[y]['wash']=''
            }

          }

          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          hotInstance.render()

        }


      }

      },
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
          },
          items : {
            'remove' : {
              name : 'Delete Line',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let row = selection[0].start.row;
                  this.contextLineRemove(row)
                }
              }
            },

          }
      },
      mergeCells: [],
      cells: (row, col, prop) => {
        var cellProperties = {};

        if(col == 2){
        if(this.dataset[row] != undefined){
                //console.log(this.dataset[row]['pro_com_id'])
                  cellProperties['readOnly'] = false;
                    cellProperties['source'] = (query, process) => {
                      $.ajax({
                        headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                        data: { search: query, comp_id : this.dataset[row]['pro_com_id']},
                        url:this.apiUrl+'merchandising/pro-silhouette?type=auto_2',
                        //url: this.apiUrl + 'merchandising/items?type=handsontable' ,
                        dataType: 'json',
                        success: function (response) {
                          process(response['data']);
                        }
                      });
                    }
         }
            return cellProperties;
        }

      },
    }
  }

  contextLineRemove(row){
    this.processing = true
    if(this.saveStatus == 'SAVE')
    {
      let selectedRowData = this.dataset[row]
      this.currentDataSetIndex = row
      this.dataset.splice(row,1);

      const hotInstance = this.hotRegisterer.getInstance(this.instance);
      hotInstance.render()
      this.processing = false
    }
    if(this.saveStatus == 'UPDATE')
    {

      let data = this.dataset[row]
      if(data.feature_component_id == null){

        let selectedRowData = this.dataset[row]
        this.currentDataSetIndex = row
        this.dataset.splice(row,1);
        this.processing = false
        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        hotInstance.render()
        return;

      }
      //console.log(data)
     AppAlert.showConfirm({text : 'Do you want to remove this line ?'},(result) => {
        if(result.value){
          this.http.delete(this.apiUrl + 'merchandising/product_feature/' + data.feature_component_id)
          .subscribe(
            (data) => {

              if(data['data']['status']=="0"){

              this.snotifyService.error("Can't Delete ,Product Feature already in use", this.tosterConfig);
              this.processing = false
              }else{

              this.snotifyService.success('Line removed successfully', this.tosterConfig);
              this.dataset.splice(row, 1)
              const hotInstance = this.hotRegisterer.getInstance(this.instance);
              hotInstance.render()
              var element1 = <HTMLInputElement> document.getElementById("ProductFeature");
              element1.value = data['data']['max_f'];
              var element2 = <HTMLInputElement> document.getElementById("ProductFeatureDes");
              element2.value = data['data']['max_f_d'];
              var element3 = <HTMLInputElement> document.getElementById("ProductPackType");
              element3.value = data['data']['max_f_c'];
              this.processing = false
              }

            },
            (error) => {
              this.processing = false
              AppAlert.showError({text : 'Process Error'})
            }
          )
        }
     })

    }

  }

  savedetails(){

    let savedetais$
    let arr=[]
    let fe_data = (<HTMLInputElement>document.getElementById('ProductFeature')).value;
    this.processing = true

    if(this.dataset.length == 0){
      this.processing = false
      this.snotifyService.error("Assigned values can't be empty ..!", this.tosterConfig);
      return;
    }

    if(this.saveStatus == 'SAVE')
    {
       savedetais$=this.http.post(this.apiUrl + 'merchandising/save_product_feature' ,
       { 'lines' : this.dataset });
    }

    if(this.saveStatus == 'UPDATE')
    {
       savedetais$=this.http.post(this.apiUrl + 'merchandising/update_product_feature' ,
       { 'lines' : this.dataset ,'fe_data':fe_data });
    }

    savedetais$.subscribe(
        (res) => {
         if(res.data.status == 'error'){
           this.processing = false
           this.snotifyService.error(res.data.message, this.tosterConfig);

         }else{
         this.processing = false

         this.snotifyService.success(res.data.message, this.tosterConfig);

         this.saveStatus = 'UPDATE'
         var element1 = <HTMLInputElement> document.getElementById("ProductFeature");
         element1.value = res.data.max_f;
         var element2 = <HTMLInputElement> document.getElementById("ProductFeatureDes");
         element2.value = res.data.max_f_d;
         var element3 = <HTMLInputElement> document.getElementById("ProductPackType");
         element3.value = res.data.max_f_c;
         this.dataset = []
         this.splitModel.hide()
         $('.modal-backdrop').hide();

         }

        },
        (error)=>{
          this.processing = false
          console.log(error)
        }

    );



  }

  loadProductComponent(id){
    this.processing = true
    if(id != '')
    {
      this.saveStatus = 'UPDATE'
      this.modelTitle = 'Update Product Feature'
    }else{

      this.saveStatus = 'SAVE'
      this.modelTitle = 'New Product Feature'

    }

    let savedetais$
    let arr=[]
    if(this.saveStatus == 'SAVE')
    {
        savedetais$=this.http.post(this.apiUrl + 'merchandising/pro_listload', id)
    }
    if(this.saveStatus == 'UPDATE')
    {
       savedetais$=this.http.post(this.apiUrl + 'merchandising/pro_listload_edit' ,
       { 'id' : id });
    }

    savedetais$.subscribe(
      data => {
        this.dataset = []

        if(this.saveStatus == 'SAVE')
        {
          this.subCatList = []
          let count_ar =  data['count']
          for (var _i = 0; _i < count_ar; _i++)
         {
           this.subCatList.push(data['subCat'][_i])
         }
         this.processing = false
        }
        if(this.saveStatus == 'UPDATE')
        {
          this.subCatList = []
          let count_ar =  data['count2']
          for (var _i = 0; _i < count_ar; _i++)
         {
           this.subCatList.push(data['subCat2'][_i])
         }

          let count_ar2 =  data['count']

          for (var _j = 0; _j < count_ar2; _j++)
         {

           if(data['subCat'][_j]['emb'] == '1')
           {data['subCat'][_j]['emb'] = 'YES'}else{data['subCat'][_j]['emb'] = 'NO'}
           if(data['subCat'][_j]['wash'] == '1')
           {data['subCat'][_j]['wash'] = 'YES'}else{data['subCat'][_j]['wash'] = 'NO'}

           this.dataset.push(data.subCat[_j])
           const hotInstance = this.hotRegisterer.getInstance(this.instance);
           hotInstance.render()
         }

         this.processing = false

        }



      },
      error => {
        AppAlert.showError({text : 'Process Error' })
      }
    )
  }


  changeOrder(_index, type, propid, des){

    if(type == 'DOWN'){

      if(this.saveStatus == 'SAVE')
      {
        this.dataset.push({ assign: des, pro_com_id: propid })
        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        hotInstance.render()

      }
      if(this.saveStatus == 'UPDATE')
      {
        /*let fe_data = (<HTMLInputElement>document.getElementById('ProductFeature')).value;
        this.processing = true
        this.http.post(this.apiUrl + 'merchandising/save_line_fe',{ 'assign' : des , 'pro_com_id' : propid , 'fe_data' : fe_data})
        .subscribe(
          data => {
            this.processing = false

               if(data['subCat'][0]['emb'] == '0'){data['subCat'][0]['emb'] = ''}
               if(data['subCat'][0]['wash'] == '0'){data['subCat'][0]['wash'] = ''}
               this.dataset.push(data['subCat'][0])
               const hotInstance = this.hotRegisterer.getInstance(this.instance);
               hotInstance.render()

          },
          error => {
            this.processing = true
            AppAlert.showError({text : 'Process Error' })
          }
        )
        */

        this.dataset.push({ assign: des, pro_com_id: propid })
        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        hotInstance.render()


      }

    }


  }



  Model_hide(){
    //debugger
    //this.styleCreationService.changeData(null)
    var _x = 0;
    for (var _i = 0; _i < this.dataset.length; _i++)
    {
      if(this.dataset[_i]['feature_component_id'] == null)
      {
        //console.log(123)
        _x++;
        AppAlert.showConfirm({text : 'Do you want to remove empty lines?'},(result) => {
           if(result.value)
              {

                 this.splitModel.hide()
                   $('.modal-backdrop').hide();
              }
              })
      }

    }

    if(_x == 0)
    {
      this.splitModel.hide()
      $('.modal-backdrop').hide();
    }







}





}
