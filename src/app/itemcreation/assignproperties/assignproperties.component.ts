import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map } from 'rxjs/operators';

//third party components
import { ModalDirective } from 'ngx-bootstrap/modal';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

@Component({
  selector: 'app-assignproperties',
  templateUrl: './assignproperties.component.html',
  styleUrls: []
})
export class AssignpropertiesComponent implements OnInit {

  @ViewChild(ModalDirective) sourceModel: ModalDirective;
  //@ViewChild(ModalDirective) model_assignproperties: ModalDirective;

  formGroup:FormGroup = null
  formPopUp : FormGroup
  modelTitle : string = "New Item Property"
  serverURL = AppConfig.apiServerUrl()
  apiUrl = AppConfig.apiUrl()
  datatable:any = null
  processing : boolean = false


  mainCategory$ : Observable<any[]>
  subCategory$ : Observable<any[]>
  unassignProperties$ : Observable<any[]>
  assignProperties$: Observable<any[]>
  appFormValidator : AppFormValidator
  formValidator : AppFormValidator

  subCategory2 : Array<any[]>

  formFields = {
    category_code : '',
    sub_category_code : ''

  }
  saveStatus = 'SAVE'
  subCatList = []
  subCatList2 = []

  constructor(private fb:FormBuilder, private http:HttpClient, private titleService: Title,private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.titleService.setTitle("Items Property Assign")//set page title

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'merchandising/item-properties/validate?for=duplicate',
      /*formFields : this.formFields,*/
      fieldCode : 'property_name',
      error : 'Item Property Name Already Exists',
      data : {
        source_id : function(controls){ return controls['source_id']['value']}
      }
    }

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Master Data',
      'Item Property Assign'
    ])

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      category_code : [null, [Validators.required]],
      sub_category_code : [null, [Validators.required]]

    });

    this.appFormValidator = new AppFormValidator(this.formGroup, {});

    this.formPopUp = this.fb.group({
      source_id : 0,
      property_name : [null , [Validators.required, PrimaryValidators.noSpecialCharactor],[primaryValidator.remote(remoteValidationConfig)]],

    });

    this.formValidator = new AppFormValidator(this.formPopUp, {});

    this.loadMainCategoryList();
    //this.formGroup.patchValue({sub_category_code: 0 });

  }

  loadMainCategoryList(){
    this.mainCategory$ = this.http.get<any[]>(this.apiUrl + "merchandising/item-categories")
    .pipe(map(res => res['data']));
    //this.formGroup.patchValue({sub_category_code: null });
  }

  loadSubCategory(mainCode){
    this.formGroup.patchValue({sub_category_code: null });
    this.http.get<any[]>(this.apiUrl + 'merchandising/item-sub-categories',
    {params:{'category_id':mainCode,'type':'sub_category_by_category'}})
    .pipe( map(res => res['data'] ))
    .subscribe(
      data => {
        //console.log(data)
        this.subCategory2 = data
      },
      error => {
        //console.log(error)
      }

      )

  }


  loadUnAssignProperties(subCatCode){
    this.http.post(this.apiUrl + 'merchandising/load_un_assign_list',{ 'subCatCode' : subCatCode })
    .subscribe(
      data => {

        this.subCatList = []
        if(subCatCode != null){

          let count_ar =  data['count']
          for (var _i = 0; _i < count_ar; _i++)
         {
           this.subCatList.push(data['subCat'][_i])
         }
         this.loadAssignProperties(subCatCode);

       }else{
         this.subCatList = []
         //this.subCatList.push()
         //this.subCatList.splice(_index,1)

       }



      },
      error => {
        AppAlert.showError({text : 'Process Error' })
      }
    )
  }


  loadAssignProperties(subCatCode2){
    this.http.post(this.apiUrl + 'merchandising/load_un_assign_list2',{ 'subCatCode2' : subCatCode2 })
    .subscribe(
      data => {

        this.subCatList2 = []

        let count_ar =  data['count2']
        for (var _i = 0; _i < count_ar; _i++)
       {
         this.subCatList2.push(data['subCat2'][_i])
       }

       //this.loadAssignProperties(subCatCode);

      },
      error => {
        AppAlert.showError({text : 'Process Error' })
      }
    )
  }

  changeOrder(_index, type, propid){
    //console.log(_index + " " + type+ " " + propid)
    if(type == 'UP'){
      if(_index > 0) {
        let arrItem = this.subCatList2[_index - 1]
        this.subCatList2[_index - 1] = this.subCatList2[_index]
        this.subCatList2[_index] = arrItem
      }

    }
    else if(type == 'DOWN'){
      if(_index < (this.subCatList2.length - 1)) {
        let arrItem = this.subCatList2[_index + 1]
        this.subCatList2[_index + 1] = this.subCatList2[_index]
        this.subCatList2[_index] = arrItem
      }
    }
    else if(type == 'LEFT'){
      if(!this.appFormValidator.validate())//if validation faild return from the function
        return;
      this.processing = true
      let formData = this.formGroup.getRawValue();
      //console.log(formData['sub_category_code']);
      if(formData['sub_category_code'] != "null"){
      this.http.post(this.apiUrl + 'merchandising/save_assign',{ 'propid' : propid , 'formData' : formData })
      .subscribe(

        data => {
        //  console.log(data['data']['status'])
          if(data['status']=="error")
          {
             this.processing = false
             AppAlert.showError({text : data['message'] })
             //this.loadUnAssignProperties(data.proid)
          }else{
          this.processing = false
          this.loadUnAssignProperties(formData['sub_category_code'])
        }
        },
        error => {
          AppAlert.showError({text : 'Process Error' })
          this.processing = false
        }
      )

    }else{this.processing = false}

    }
  }

  save()
  {
    console.log(this.formGroup.getRawValue())
    if(!this.appFormValidator.validate())//if validation faild return from the function
      return;
    this.processing = true
    //console.log(this.subCatList2.length)
    if(this.subCatList2.length == 0){
       this.processing = false
       AppAlert.showError({text : "Can't save without assign any Item property.!" })
       return;
    }

    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let data = {
      'formData' : this.formGroup.getRawValue(),
      'Assign' : this.subCatList2
    }
    if(this.saveStatus == 'SAVE'){
    saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/final_save_assign', data)
    }
    else if(this.saveStatus == 'DELETE'){

    }

    saveOrUpdate$.
    pipe( map(res => res['data'] )).
    subscribe(
      (data) => {
        this.processing = false
        //this.loadUnAssignProperties(data.proid)
        this.formGroup.reset()
        this.subCatList2 = []
        this.subCatList = []

        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showSuccess({text : data.message })
        } , 500)

     },
     (error) => {
        this.processing = false
         AppAlert.closeAlert()
         AppAlert.showError({text : 'Process Error' })
     }
    );

    }



  OpenPop(){
    this.sourceModel.show();
  }

  showEvent(event){ //show event of the bs model
    this.formPopUp.reset();
    //this.popupHeaderTitle = "New Parent Company"
    //this.saveStatus = 'SAVE'
  }

  save_unassign(){

    if(!this.formValidator.validate())//if validation faild return from the function
      return;

    this.processing = true
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Processing...','Please wait while saving data')
    let saveOrUpdate$ = null;
    let data = {
      'formData' : this.formGroup.getRawValue(),
      'pro_name' : this.formPopUp.getRawValue()
    }

    saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/save_pro_name', data)
    saveOrUpdate$.subscribe(
      (res) => {
        console.log(res);
          this.formPopUp.reset();
          this.processing = false
          this.sourceModel.hide()
          this.loadUnAssignProperties(res.data.proid)

        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showSuccess({text : res.data.message })
        } , 1000)


     },
     (error) => {
       this.processing = false
       AppAlert.closeAlert()
       AppAlert.showError({text : 'Process Error' })
       //console.log(error)
     }
   );



  }

  removeUser(_index,proid){
    if(!this.appFormValidator.validate())//if validation faild return from the function
      return;
    this.processing = true
    let saveOrUpdate$ = null;
    let data = {
      'formData' : this.formGroup.getRawValue(),
      'UNAssign' : this.subCatList,
      'proid' : proid
    }
    saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/remove_assign', data)
    saveOrUpdate$.
    pipe( map(res => res['data'] )).
    subscribe(
      (data) => {
        //console.log(data.status)
        if(data.status=="error")
        {
           this.processing = false
           AppAlert.showError({text : data.message })
           //this.loadUnAssignProperties(data.proid)
        }else{

          this.processing = false
          this.loadUnAssignProperties(data.proid)

        }



     },
     (error) => {
        this.processing = false
         AppAlert.closeAlert()
         AppAlert.showError({text : 'Process Error' })
        // console.log(error)
     }
    );


  }


  removeUser1(_index,proid){
    if(!this.appFormValidator.validate())//if validation faild return from the function
      return;
    this.processing = true
    let saveOrUpdate$ = null;
    let data = {
      'formData' : this.formGroup.getRawValue(),
      'Assign' : this.subCatList2,
      'proid' : proid
    }
    saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/remove_unassign', data)
    saveOrUpdate$.
    pipe( map(res => res['data'] )).
    subscribe(
      (data) => {
        console.log(data)
        if(data['status'] == "0"){
            this.processing = false
            AppAlert.showError({text:"Property already in use"})
          }else{
            this.processing = false
            this.loadUnAssignProperties(data.proid)
          }

     },
     (error) => {
        this.processing = false
         AppAlert.closeAlert()
         AppAlert.showError({text : 'Process Error' })
        // console.log(error)
     }
    );


  }



/*

  loadUnAssignProperties(subCatCode){
    this.unassignProperties$ = this.http.get<any[]>(this.serverURL + 'itemproperty/load-unassign-bysubcat',{params:{'subcategory_code':subCatCode}}).pipe(map(res=>res));
    this.loadAssignProperties(subCatCode);
  }

  loadAssignProperties(subCatCode){
    this.assignProperties$ = this.http.get<any[]>(this.serverURL + 'itemproperty/load-assign-properties',{params:{'subcategory_code':subCatCode}}).pipe(map(res=>res));
  }

  assignProperty(){
    $("#multiselect1 option:selected").remove().appendTo("#multiselect1_to");
  }

  unAssignProperty(){
    $("#multiselect1_to option:selected").remove().appendTo("#multiselect1");
  }

  moveUP(){

    var selected = $("#multiselect1_to").find(":selected");
    var before = selected.prev();
    if(before.length > 0)
        selected.detach().insertBefore(before);
  }

  moveDown(){
    var selected = $("#multiselect1_to").find(":selected");
    var next = selected.next();
    if(next.length > 0)
        selected.detach().insertAfter(next);
 }

  saveNewProperty(){



    // Check property exist before save
    // ================================
    var _propertyName = this.formGroup.controls['property_name'].value;
    this.http.get(this.serverURL + "itemproperty/check_property",{params:{"property_name":_propertyName}})
    .subscribe(val=>{
        if(val['recordscount']>0){
            AppAlert.showWarning({title:"Property name already exist in the system"});
        }else{

            this.http.post(this.serverURL + 'itemproperty/save_itemproperty',this.formGroup.getRawValue())
            .subscribe(data=>{
              if(data['status'] == 'success'){
                AppAlert.showSuccess({text: data['message']});
                //this.formGroup.reset();
                this.loadUnAssignProperties($("#sub_category_code").val());
                this.model_new_properties.hide();

              }
            })

        }
    });
    // ==================================


  }

  saveNewAssignProperties(){

    if(!this.appFormValidator.validate())//if validation faild return from the function
      return;

    var iSequenceNo = 0;
    var arrayProeprties = [];
    var _subCode = $("#sub_category_code").val();
    var _catCode = $("#category_code").val();


    $("#multiselect1_to option").each(function(i){
      var proprtyId = $(this).val();

      iSequenceNo++;

      arrayProeprties.push({"property_id":proprtyId, "subcategory_code":_subCode, "sequence_no":iSequenceNo});
    });

    // Varify any properties assign in the assign list
    // ================================================
    if(iSequenceNo == 0){
        AppAlert.showWarning({title:"There are no any items, in the assign list"});return;
    }

    // Remove assign properties from table
    // ===================================
    //this.http.post(this.serverURL + 'itemproperty/delete-assign',{"sub_code":_subCode}).subscribe();

    for(var i=0; i<arrayProeprties.length; i++){
      this.http.post(this.serverURL + 'itemproperty/save-assign',arrayProeprties[i]).subscribe();

    }
    AppAlert.showSuccess({text: "Successfully Updated"});
  }

*/


}
