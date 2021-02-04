// import { Component, OnInit } from '@angular/core';
import { Component, OnInit,ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators,FormControl,FormArray,ValidatorFn} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { Router } from '@angular/router'

import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../../core/validation/primary-validators';
import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import Swal from 'sweetalert2'
//models
import { customer } from '../../models/customer.model';
import { ProductCategory } from '../../models/ProductCategory.model';
import { ProductType } from '../../models/ProductType.model';
import { ProductFeature } from '../../models/ProductFeature.model';
import { ProductSilhouette } from '../../models/ProductSilhouette.model';
import { Division } from '../../models/Division.model';

declare var $:any;
import { ModalDirective } from 'ngx-bootstrap/modal';
//import { KeysPipe } from '../../pips/keys.pipe';

import { PermissionsService } from '../../../core/service/permissions.service';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
import { StyleCreationService } from '../style-creation.service';


@Component({
  selector: 'app-style-creation-main',
  templateUrl: './style-creation-main.component.html',
  styleUrls: ['./style-creation-main.component.css']
})

export class StyleCreationMainComponent implements OnInit {

//  @ViewChild(ModalDirective) sectionModel: ModalDirective;


  modelTitle : string = "Create Style"
  saveStatus = 'SAVE'

  datatable:any = null;
  formGroup : FormGroup
  customer$:Observable<Array<any>>//observable to featch source list
  customerLoading = false;
  customerInput$ = new Subject<string>();
  selectedCustomer:customer

  productType$:Observable<Array<any>>//observable to featch source list
  productTypeLoading = false;
  productTypeInput$ = new Subject<string>();
  selectedproductType:ProductType

  ProductCategory$:Observable<Array<any>>//observable to featch source list
  ProductCategoryLoading = false;
  ProductCategoryInput$ = new Subject<string>();
  selectedProductCategory:ProductCategory

  ProductFeature$:Observable<Array<any>>//observable to featch source list
  ProductFeatureLoading = false;
  ProductFeatureInput$ = new Subject<string>();
  selectedProductFeature:ProductFeature[] = <any>[]
  // selectedProductFeature:ProductFeature

  ProductSilhouette$:Observable<Array<any>>//observable to featch source list
  ProductSilhouetteLoading = false;
  ProductSilhouetteInput$ = new Subject<string>();
  selectedProductSilhouette:ProductSilhouette

  Division$:Observable<Array<any>>//observable to featch source list
  DivisionLoading = false;
  DivisionInput$ = new Subject<string>();
  selectedDivision:Division

  appFormValidator : AppFormValidator

  checkStyleValue=0;
  orderId = 0
  checkStylemassage='';
  customerId = null;
  customerDivisions : Array<customer>

  processing : boolean = false
  loadingHeader : boolean = false
  loadingCountHeader : number = 0
  canNotify : boolean = false

  public imgSrc = AppConfig.StayleImage()+'dif.png';
  serverUrl = AppConfig.apiServerUrl();
  apiUrl = AppConfig.apiUrl();

  constructor(private router: Router,private fb:FormBuilder , private http:HttpClient, private titleService: Title,  private layoutChangerService : LayoutChangerService,
  private styleCreationService : StyleCreationService) { }


  ngOnInit() {

    this.styleCreationService.styleCreation.subscribe(data => {
      //debugger

      if(data != null){
        console.log(data)
        this.saveStatus = 'UPDATE'
        this.orderId = data
        this.loadingHeader = true
        this.loadingCountHeader = 0
        this.loadDetails(this.orderId)

      }
      else{
        this.saveStatus = 'SAVE'
        this.orderId = 0
        //this.formGroup.reset()

       }
    })
    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Merchandising',
      'Style Creation'
    ])

    //listten to the menu collapse and hide button
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

    this.titleService.setTitle("Style Creation")//set page title
    //this.checkStyle();
    this.getClusterList();
    this.getProductCategory();
    this.getProductType();
    this.getProductFeature();
    this.getProductSilhouette();
    //this.createTable();

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'merchandising/style/validate?for=duplicate',
      //formFields : this.formFields,
      fieldCode : 'style_no',
      error : 'Style No Already Exits',
      data : {
        style_id : function(controls){ return controls['style_id']['value']}
      }
    }


    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      customer : [null , [Validators.required]],
      ProductCategory :[null , [Validators.required]],
      //ProductType : [null , [Validators.required]],
      ProductFeatureDes : null,
      ProductFeature : null,
      ProductPackType : null,
      ProductSilhouette : [null , [Validators.required]],
      style_no : [null , [Validators.required,Validators.maxLength(15)],[primaryValidator.remote(remoteValidationConfig)]],
      style_description: [null , [Validators.required]],
      division: [null , [Validators.required]],
      Remarks: null,
      Remarks_pack: null,
      // items: new FormArray(controls, minSelectedCheckboxes(1)),
      avatar: [null , [Validators.required]],
      style_id:null,
      avatarHidden:[]
      //error:[null , [Validators.required]]
    })

    this.appFormValidator = new AppFormValidator(this.formGroup, {});


  }

  newStyle() {
    //if(this.formGroup.touched || this.formGroup.dirty) {
      AppAlert.showConfirm({
        'text' : 'Do you want to clear all unsaved data?'
      },(result) => {
        if (result.value) {
          this.saveStatus = 'SAVE'
          this.formGroup.reset()
          this.imgSrc = AppConfig.StayleImage()+'dif.png';
        }
      })
  //  }
  }




  loadDetails(id){

    //vconsole.log(id)
    this.http.get(this.apiUrl + "merchandising/style/" + id)
        .pipe(map( data => data['data'] ))
        .subscribe(data => {
          if(data['status'] == '1')
          {

            console.log(data)
            //this.sectionModel.show()
            this.formGroup.setValue({
              customer : data['customer'],
              ProductCategory : data['ProductCategory'],
              //ProductType : data['productType'],
              ProductFeature : data['product_feature_id'],
              ProductFeatureDes : data['product_f']['product_feature_description'],
              ProductPackType : data['product_f_pack_c'],
              ProductSilhouette : data['ProductSilhouette'],
              style_no : data['style_no'],
              style_description: data['style_description'],
              division: data['division'][0]['division_id'],
              Remarks_pack: data['remarks_pack'],
              Remarks: data['remark_style'],
              avatar: data['image'],
              style_id:data['style_id'],
              avatarHidden:null

            })

            //this.formGroup.get('style_no').disable()
            this.customerDivisions = data['division']
            this.formGroup.get('style_no').enable()
            this.saveStatus = 'UPDATE'
            this.canNotify = data['notification_status'] == 1 ? true : false

            var d = new Date();
            var n = d.getTime();

            if(data['upload_status'] == 1)
              {
                this.imgSrc = AppConfig.StayleImage()+data['image']+'?code='+n;
              }else
              {
                this.imgSrc = AppConfig.StayleImage()+'dif.png';
              }


          }
          //this.reloadTable()
        })



  }

//  reloadTable() {//reload datatable11
//    this.datatable.ajax.reload(null, false);
//  }


  getClusterList() {
    this.customer$ = concat(
        of([]), // default items
        this.customerInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.customerLoading = true),
            switchMap(term => this.http.get<customer[]>(this.serverUrl + 'api/getCustomer',{params:{search:term}}).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.customerLoading = false)
            ))
        )
    );
        //this.getDivision();
  }

  load_divition(data) {
    if(data == undefined){
      this.customerId = null;
    }
    else{
      this.customerId = data.customer_id;
      //this.styleDescription = data.style_description
      this.http.get(this.apiUrl + 'org/customers/'+this.customerId)
      .pipe( map(res => res['data'] ))
      .subscribe(
        data => {
          console.log(data.divisions)
          //this.customerDetails = data.customer_code + ' / ' + data.customer_name
          this.customerDivisions = data.divisions
        },
        error => {
          //console.log(error)
        }
      )
      //this.customerDetails = ''
    }
    //console.log(data)
  }

  getProductCategory() {
    this.ProductCategory$ = concat(
        of([]), // default items
        this.ProductCategoryInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.ProductCategoryLoading = true),
            switchMap(term => this.http.get<customer[]>(this.serverUrl + 'api/getProductCategory',{params:{search:term}}).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.ProductCategoryLoading = false)
            ))
        )
    );
  }


  getProductType() {
    this.productType$ = concat(
        of([]), // default items
        this.productTypeInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.productTypeLoading = true),
            switchMap(term => this.http.get<ProductType[]>(this.serverUrl + 'api/getProductType',{params:{search:term}}).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.productTypeLoading = false)
            ))
        )
    );
  }

  getProductFeature() {
    this.ProductFeature$ = concat(
        of([]), // default items
        this.ProductFeatureInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.ProductFeatureLoading = true),
            switchMap(term => this.http.get<ProductType[]>(this.serverUrl + 'api/getProductFeature',{params:{search:term}}).pipe(
                // map(res => res['items']),
                catchError(() => of([])), // empty list on error
                tap(() => this.ProductFeatureLoading = false)
            ))
        )
    );

  }


  getProductSilhouette() {
    this.ProductSilhouette$ = concat(
        of([]), // default items
        this.ProductSilhouetteInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.ProductSilhouetteLoading = true),
            switchMap(term => this.http.get<ProductType[]>(this.serverUrl + 'api/getProductSilhouetteHome',{params:{search:term}})
            .pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.ProductSilhouetteLoading = false)
            ))
        )
    );
  }

  onResize(event) {
    if(this.datatable!=null){
    //  this.reloadTable()
      //event.target.innerWidth;
    }
  }

  OpenPop(){
    //debugger
    var data = 1;
    this.styleCreationService.popup(data)

  }

  imageCrop(){
    //debugger
    var data = 1;
    this.styleCreationService.popupimagecrop(data)

  }

  saveStyle(){

    if(!this.appFormValidator.validate()) //if validation faild return from the function
      return;
    let formData = this.formGroup.getRawValue();
    formData['ProductFeature'] = (<HTMLInputElement>document.getElementById('ProductFeature')).value;
    formData['ProductFeatureDes'] = (<HTMLInputElement>document.getElementById('ProductFeatureDes')).value;
    //console.log(formData);
    if(formData['ProductFeature'] == "" || formData['ProductFeatureDes'] == "" ){
      AppAlert.showError({text:"Product Feature Cannot be empty.Please add features."})
      this.OpenPop();
      return;
    }
    if(formData['avatar'] == ""){
      if(formData['avatar']['filetype'] != "image/png" && formData['avatar']['filetype'] != "image/jpeg"){
        AppAlert.showError({text:"Image can be upload only png and jpg ."})
        return;
      }
    }



    AppAlert.showMessage('Processing...','Please wait while saving details')
    this.processing = true
    this.http.post(this.serverUrl + 'api/style-creation.save',formData)
    .subscribe(
          (res) => {

            if(res['data']['status']=="0")
            {
              AppAlert.showError({text:"Style already in use.Style No 2 updated."})
              this.processing = false
              this.formGroup.reset();
              this.imgSrc = AppConfig.StayleImage()+'dif.png';

            }else{

              this.processing = false
              //this.formGroup.reset();
              //this.imgSrc = AppConfig.StayleImage()+'dif.png';

              setTimeout(() => {
                AppAlert.closeAlert()
                AppAlert.showSuccess({text : res['data']['message'] })
              } , 1000)

              this.saveStatus = 'UPDATE'
              this.canNotify = true
              this.formGroup.patchValue({style_id : res['data']['style_id']})
              //this.styleCreationService.changeData(null)

            }


        },
        (error) => {
            this.processing = false
            if(error.status == 422){ //validation error
              AppAlert.showError({title : 'Validation Error' , text : error.error.errors.validationErrorsText })
            }else{
              AppAlert.closeAlert()
              AppAlert.showError({text : 'Process Error' })
              //console.log(error)
            }
        });
    //console.log(this.formGroup.getRawValue())
  }


  onFileChange(event) {

    let reader = new FileReader();
    if(event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];

      if(file['type'] != 'image/jpeg' && file['type'] != 'image/jpg' && file['type'] != 'image/png'){
        AppAlert.showError({text:"Image format must be jpg jpeg png"})
        return;
      }
      if(file['size'] > 2000000 ){
        AppAlert.showError({text:"Image size must be less than 2MB "})
        return;
      }

      this.formGroup.get('avatarHidden').setValue({ value: file.name })
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgSrc = reader.result;
        this.formGroup.get('avatar').setValue({ filename: file.name,filetype: file.type,value: reader.result.split(',')[1]})
      };



    }
  }


  showEvent(event){ //show event of the bs model
    if(this.saveStatus == 'SAVE'){
    this.imgSrc = AppConfig.StayleImage()+'dif.png';
    this.formGroup.reset();
    this.modelTitle = "Create Style"
    this.saveStatus = "SAVE"
    this.formGroup.get('style_no').enable()
  }
  else if(this.saveStatus == 'UPDATE') {

    this.modelTitle = "Update Style"
    this.formGroup.get('style_no').disable()

  }
  }



  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event) => { // called once readAsDataURL is completed
        // this.imgSrc = event.target.result;
      }
    }
  }


  notifyUsers(){
    AppAlert.showConfirm({
      'text' : 'Do you want to send notifications to users?'
    },(result) => {
      if (result.value) {
        this.processing = true
        this.http.post(this.apiUrl + 'merchandising/style/notify-users', {style_id : this.formGroup.get('style_id').value})
        .subscribe(
          res => {
            this.processing = false
            if(res['status'] == 'success'){
              AppAlert.showSuccess({ text : res['message']})
              this.canNotify = false
              this.styleCreationService.changeData(null)
            }
            else {
              AppAlert.showError({ text : res['message']})
            }
          },
          error => {
            this.processing = false
            console.log(error)
            AppAlert.showError({ text : 'Error occured while notifying users'})
          }
        )
      }
    })
  }
}

function minSelectedCheckboxes(min = 1) {
  const validator: ValidatorFn = (formArray: FormArray) => {
    const totalSelected = formArray.controls
        .map(control => control.value)
        .reduce((prev, next) => next ? prev + next : prev, 0);

    return totalSelected >= min ? null : { required: true };
  };

  return validator;
}
