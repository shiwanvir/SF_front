import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HotTableRegisterer } from '@handsontable/angular';
import { NgOption } from '@ng-select/ng-select';
declare var $: any;

import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-bin-config',
  templateUrl: './bin-config.component.html',
  styleUrls: ['./bin-config.component.css']
})
export class BinConfigComponent implements OnInit {

  @ViewChild(ModalDirective) binModel: ModalDirective;

  formGroup: FormGroup
  formCapacity: FormGroup
  items: FormArray;

  modelTitle: string = "Bin Configuration"
  apiUrl = AppConfig.apiUrl()

  appValidator: AppValidator
  appValidatorCapacity: AppValidator

  datatable: any = null
  saveStatus = 'SAVE'
  url = this.apiUrl + 'store/bin-config'

  dataset: any[] = [];
  datasetSaved:any[]=[];
  hotOptions: any
  hotOptionsSaved:any
  instance:string = 'instance';
  instanceSaved:string='instanceSum';

  storeList$: Observable<Array<any>>
  subStoreList$: Observable<Array<any>>
  binList$: Observable<Array<any>>
  categoryList$: Observable<Array<any>>
  itemCategory$: Observable<Array<any>>

  appFormValidator : AppFormValidator
  appFormValidator2 : AppFormValidator

  binId = 0
  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop}

  formFields = {
    store_id: '',
    substore_id: '',
    category_name:''
  }

  formFieldCapacity = {
    category_name: '',
    bin_id: 0,
    allocation_id: 0
  }

  constructor(private fb: FormBuilder, private http: HttpClient, private titleService: Title,
    private layoutChangerService : LayoutChangerService,private hotRegisterer: HotTableRegisterer,
    private snotifyService: SnotifyService,private authService : AuthService) { }

  ngOnInit() {

    this.initializeTable()
    this.titleService.setTitle("Bin Configuration")//set page title

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({ // create the form
      store_id: [null, [Validators.required]],
      substore_id: [null, [Validators.required]],
      category_name : null
    })

    this.formCapacity = this.fb.group({
      bin_id: null,
      category_name: [null, [Validators.required]],
      allocation_id: null,
      items: this.fb.array([]),
      zone_name :  [null, [Validators.required]],
      rack_name :  [null, [Validators.required]]
    });

    this.storeList$ = this.getStoreList()
    //this.subStoreList$ = this.getSubStoreList()

    this.appValidator = new AppValidator(this.formFields, [], this.formGroup);
    this.appValidatorCapacity = new AppValidator(this.formFieldCapacity, [], this.formCapacity);
    this.appFormValidator = new AppFormValidator(this.formGroup, {});
    this.appFormValidator2 = new AppFormValidator(this.formCapacity, {});

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'Warehouse',
      'Bin Configuration'
    ])
  }

  initializeTable(){
    this.hotOptions = {
      columns: [
        { type: 'checkbox', title : 'Action' , readOnly: false , checkedTemplate: 'yes',  uncheckedTemplate: 'no' },
        { type: 'text', title : 'Sub Category' , data: 'subcategory_name'},
        {
          type: 'autocomplete', title : 'Inventory UOM' , data: 'uom_code' , readOnly: false,strict: true,
          source: (query, process) => {
            $.ajax({
              url:this.apiUrl+'org/uom?type=auto3',
              dataType: 'json',
              data: {query: query},
              success: function (response) {
                process(response);
              }
            });
          }
        },
        { type: 'numeric', title : 'Min Qty' , data: 'min', readOnly: false},
        { type: 'numeric', title : 'Max Qty' , data: 'max', readOnly: false},

      ],

      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 280,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htCenter htMiddle',
      readOnly: true,
      mergeCells: [],
      cells: (row, col, prop) => {
        var cellProperties = {};

        if(col == 2){
        if(this.dataset[row] != undefined){
                //console.log(this.dataset[row]['category_id'])
                  cellProperties['readOnly'] = false;
                    cellProperties['source'] = (query, process) => {
                      $.ajax({
                        headers: {'Authorization':`Bearer ${this.authService.getToken()}`},
                        data: { search: query, category_id : this.dataset[row]['category_id']},
                        url:this.apiUrl+'org/uom?type=auto4',
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
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
          },
          items : {
            'merge' : {
              name : 'Add',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  this.contextMenuAdd()
                }
              }
            },

          }
      }
    }


    this.hotOptionsSaved = {
      columns: [
        { type: 'text', title : 'Category' , data: 'category_name'},
        { type: 'text', title : 'Sub Category' , data: 'subcategory_name'},
        { type: 'text', title : 'Inventory UOM' , data: 'inventory_uom'},
        { type: 'numeric', title : 'Min Qty' , data: 'min_qty', readOnly: false},
        { type: 'numeric', title : 'Max Qty' , data: 'max_qty', readOnly: false},

      ],

      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 280,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htCenter htMiddle',
      readOnly: true,
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
          },
          items : {
            'delete' : {
              name : 'Line Cancellation',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let row = selection[0].start.row;
                  this.contextLineRemove(row)
                }
              }
            },

          }
      }

    }
  }

  getStoreList(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'store/stores?active=1&fields=store_id,store_name')
      .pipe(map(res => res['data']))
  }

  // getSubStoreList(): Observable<Array<any>> {
  //   return this.http.get<any[]>(this.apiUrl + 'store/substore?active=1&fields=substore_id,substore_name')
  //     .pipe(map(res => res['data']))
  // }

  getCategoryList(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'store/storebin?type=getCategory')
      .pipe(map(res => res))
  }

  loadSubCat(e) {
    console.log(e['store_id'])
    // let _category = this.formGroup.get('category').value
    // _category = (_category == null || _category == '') ? '' : _category.category_id
    //
     this.subStoreList$ =  this.http.get<any[]>(this.apiUrl + 'store/substore?type=load-sub-cata&store_id='+e['store_id'])
       .pipe(map(res => res['data']))
  }

  loadBins() {
    let getBinlist$ = null;
    let store = this.formGroup.get('store_id').value;
    let substore = this.formGroup.get('substore_id').value;
    if (store != null && substore != null) {
      getBinlist$ = this.http.get(this.apiUrl + 'store/storebin?type=getBins&storeId=' + store.store_id + "&substoreId=" + substore.substore_id);
      getBinlist$.subscribe(
        (res) => {
          this.binList$ = res['data']
        },
        (error) => {
          //  console.log(error)
        }
      );

    }

  }

  configurPopup(id: number) {
    if(!this.appFormValidator.validate()) //if validation faild return from the function
      return;
    this.categoryList$ = this.getCategoryList();
    this.binId = id

    this.edit(id);
    this.binModel.show()
  }

  hideModel(){
      this.formCapacity.reset()
      this.dataset = [];
      this.binModel.hide()
  }

  contextMenuAdd(){
    if(!this.appFormValidator2.validate()) //if validation faild return from the function
      return;


    let arr = [];
    let str = '';
    let uom = null

    for(let x = 0 ; x < this.dataset.length ; x++)
    {
      if(this.dataset[x]['0'] != undefined && this.dataset[x]['0'] == 'yes')
      {
        console.log(this.dataset[x])
        arr.push(this.dataset[x])
      }

    }

    if(arr.length == 0)
    {
    AppAlert.showError({ text : 'Please select line/lines, which you want to Add !' })
    }

    if(arr.length >= 1)
    {
      AppAlert.showConfirm({
        'text' : 'Do you want to Add the selected line(S)?'
            },(result) => {
        //console.log(result)
        if (result.value) {
          this.addLines(arr)
        }
        if (result.dismiss) {
          this.dataset = []
        }

      })
    }


  }

  addLines(lines){
    let bin_id = this.formCapacity.get('bin_id').value;
    let zone_name = this.formCapacity.get('zone_name').value;
    let rack_name = this.formCapacity.get('rack_name').value;
    AppAlert.showMessage('Processing...','Please wait while creating details')
    this.http.post(this.apiUrl + 'store/bin-config/save_details' , { 'lines' : lines , 'bin_id' : bin_id, 'zone_name' : zone_name, 'rack_name' : rack_name} )
    .pipe( map( res => res['data']) )
    .subscribe(
      data => {

        if(data.status == 'error'){
            setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({ text : data.message });
            } , 1000)
            //this.snotifyService.error(data.message, this.tosterConfig);
        }
        else if(data.status == 'success'){
            setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({ text : data.message });
          } , 1000)
            this.edit(bin_id)
        }

        else{
            //this.snotifyService.error(data.message, this.tosterConfig);
            setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({ text : data.message });
          } , 1000)
        }
      },
       error => {
             //this.snotifyService.error('Process Error', this.tosterConfig);
            setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({ text : 'Process Error' });
         } , 1000)
        console.log(error)
      }
    )
  }



  //remove Lines
  contextLineRemove(row){
    let data = this.datasetSaved[row]

    //console.log(data['allocation_id'])

    AppAlert.showConfirm({text : 'Do you want to remove this line ?'},(result) => {
      if(result.value){
        this.http.post(this.apiUrl + 'store/bin-config/delete_details' , { 'line_id' : data['allocation_id'] } )
        .pipe( map( res => res['data']) )
        .subscribe(
          (data) => {
            console.log(data)
            if(data['status']=="error")
            {
                 AppAlert.showError({text:data['message']})
            }
            else if(data['status']=="succes")
            {
              AppAlert.showSuccess({text:data['message']})
              this.datasetSaved.splice(row, 1)
              const hotInstance = this.hotRegisterer.getInstance(this.instanceSaved);
              hotInstance.render()
            }


          },
          (error) => {
            AppAlert.showError({text : 'Process Error'})
          }
        )
      }
    })
  }




  loadItemGategories() {
    let getItemCategory$ = null;
    let category = this.formCapacity.get('category_name').value;


    if (category != null && category.category_id != null) {
      getItemCategory$ = this.http.get(this.apiUrl + 'store/storebin?type=getItemCategory&category_id=' + category.category_id);
      getItemCategory$.subscribe(
        (res) => {

          this.itemCategory$ = res['data']
          var item = res['data']
          var count = Object.keys(item).length;
          //console.log(item);
          this.dataset = [];
          for (var _j = 0; _j < count; _j++)
         {

           this.dataset.push(item[_j])
           const hotInstance = this.hotRegisterer.getInstance(this.instance);
           hotInstance.render()
         }




        },
        (error) => {
          //  console.log(error)
        }
      );

    }

  }



  edit(bin_id) { //get payment term data and open the model

    this.http.post(this.apiUrl + 'store/bin-config/load_details' , { 'bin_id' : bin_id} )
    .pipe( map( res => res['data']) )
    .subscribe(
      data => {
        //console.log(data['load_header']['zone_name'])

        if(data['count'] != 0){
          this.formCapacity.patchValue({'zone_name' : data['load_header'][0]['zone_name']})
          this.formCapacity.patchValue({'rack_name' : data['load_header'][0]['rack_name']})
          this.formCapacity.get('zone_name').disable()
          this.formCapacity.get('rack_name').disable()
        }else{
          this.formCapacity.get('zone_name').enable()
          this.formCapacity.get('rack_name').enable()
        }

        this.datasetSaved = [];
        for (var _j = 0; _j < data['count']; _j++)
       {

         this.datasetSaved.push(data['load_list'][_j])
         const hotInstance = this.hotRegisterer.getInstance(this.instanceSaved);
         hotInstance.render()
       }

      },
       error => {
        console.log(error)
      }
    )

  }


  saveCapacity() {
    let saveOrUpdate$ = null;
    let id = this.formCapacity.get('allocation_id').value
    let objectArr = null;


    objectArr = this.formCapacity.getRawValue();
    objectArr['category_name'] = objectArr['category_name']['category_id'];

    if (this.saveStatus == 'SAVE') {
      saveOrUpdate$ = this.http.post(this.url, objectArr);
      saveOrUpdate$.subscribe(
        (res) => {
          AppAlert.showSuccess({ text: res.data.message })

          this.loadBins();

        },
        (error) => {
          console.log(error)
        }
      );
    }

    console.log(this.formCapacity.getRawValue());
  }

}
