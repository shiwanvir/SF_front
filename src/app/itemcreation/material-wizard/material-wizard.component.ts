import { Component, OnInit, ViewChild, TemplateRef, Directive, Output, EventEmitter, ChangeDetectionStrategy, AfterViewInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat} from 'rxjs';
import { map } from 'rxjs/operators';

//third party components
import { ModalDirective, BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
declare var $:any;

//import { AppValidator } from '../../core/validation/app-validator';
import { AppFormValidator } from '../../core/validation/app-form-validator';
//import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { ItemService } from '../item.service';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-material-wizard',
  templateUrl: './material-wizard.component.html',
  styleUrls: ['./material-wizard.component.css']
})
export class MaterialWizardComponent implements AfterViewInit {

  @ViewChild("compositionModel")compositionModel : ModalDirective;
 @ViewChild("contentModel")contentModel : ModalDirective;
 @ViewChild("propertyValueModel")propertyValueModel: ModalDirective;

 composition_modal:BsModalRef;
 content_modal:BsModalRef;
 propertyValue_modal:BsModalRef;
 //propertyValue_modal=null
 readonly apiUrl = AppConfig.apiUrl()
 itemForm:FormGroup = null
 contentForm:FormGroup = null
 propertyValueForm:FormGroup = null
 contentFormValidator : AppFormValidator = null
 propertyValueFormValidator : AppFormValidator = null
 itemFormValidator : AppFormValidator = null

 serverURL = AppConfig.apiServerUrl()
 compositionTitle = "New Composition"
 contentTitle = "New Content"
 propertyTitle = "New Property Value"

 mainCategory$ : Observable<any[]>
 subCategory$ : Observable<any[]>
 assignProperties$ : Observable<any[]>
 contentTypeList$ : Observable<any[]>
 compositionsList$ : Observable<any[]>
 propertyValueList$ : Observable<any[]>
 UOMList$ : Observable<any[]>
 rsSubCategory$ : Observable<any[]>
 rsMainCtegory$ : Observable<any[]>

 tempPropertyValue : TemplateRef<any[]>
 propertyId = -1;

 currentlyOppendPropertyIndex = -1
 contentTypeList = []
 assignedPropertyList = []
 propertyValueList = []
 default_val = []

 formFields = {
   category_code : '-1',
   sub_category_code : '-1',
   btn_save_property:'',
   btn_add_content:'',
   content_type:'',
   property_value:'',
   uomCtrl : '-1',
   validation_error :''

 }

 constructor(private fb:FormBuilder, private http:HttpClient, private modalService: BsModalService,
 private itemService : ItemService) {

  }


 ngOnInit() {

 /*  this.itemForm = new FormGroup({
     category_code : new FormControl(-1),
     sub_category_code : new FormControl(-1),
     uomCtrl : new FormControl(-1)
   })*/

   /*this.contentForm = new FormGroup({
     content_type : new FormControl(null)
   });*/

   this.itemForm = this.fb.group({
     category_code : [null, [Validators.required]],
     sub_category_code : [null, [Validators.required]],
     uom : [null, [Validators.required]],
     fabric_composition : null
   })

   this.propertyValueForm = this.fb.group({
     assign_value : [null, [Validators.required]],
     property_id : null
   })

   /*this.propertyValueForm = new FormGroup({
     property_value : new FormControl(null)
   });*/


   //let basicValidator = new BasicValidators(this.http)//create object of basic validation class

/*  let remoteValidationConfig = { //configuration for location code remote validation
   url:this.apiUrl + 'items/itemCreation/validate?for=duplicate',
   formFields : this.formFields,
   fieldCode : 'validation_error',
   data:{
      id:{},
      category_code:'',
      sub_category_code:'',
   }


 }*/


 /*  this.itemForm = this.fb.group({

     category_code : [null , [Validators.required]],
     sub_category_code :[null , [Validators.required]],
     //property_value : [null,[Validators.required]],
     uomCtrl : [null , [Validators.required]],
   });*/

   this.contentForm = this.fb.group({
     type_description :[null , [Validators.required]],
   });

   /*this.propertyValueForm = this.fb.group({
     property_value : [null , [Validators.required]],
   });*/

   this.contentFormValidator = new AppFormValidator(this.contentForm , {});
   this.propertyValueFormValidator = new AppFormValidator(this.propertyValueForm, {})
   this.itemFormValidator = new AppFormValidator(this.itemForm, {})
   //$("#trComposition").css('display','none');

   this.loadMainCategoryList();
   this.loadContentList();
   this.loadCompositionsList();
   this.loadUOM();

 }



 ngAfterViewInit(){

 }

 popUpFabricComposition(/*template: TemplateRef<any>*/){
   this.compositionModel.show()
   this.loadContentList()
   //this.composition_modal =  this.modalService.show("compositionModel");
 }

 popUpContent(/*template: TemplateRef<any>*/){
  this.contentModel.show()
   //this.content_modal = this.modalService.show(template, { class: 'second'});
 }

 popupAddPropertyValue(_property_id, _index/*template: TemplateRef<any>*/){
   this.propertyValueForm.reset()
   this.propertyValueForm.controls['property_id'].setValue(_property_id)
   this.currentlyOppendPropertyIndex = _index
   this.propertyValueModel.show()
   //this.propertyId = property_id;
   //this.propertyValue_modal = this.modalService.show(template,{class: 'propertvalue'});
   //$("#propertyValue").dialog();
 }

 loadMainCategoryList(){
   this.mainCategory$ = this.http.get<any[]>(this.apiUrl + "merchandising/item-categories").pipe(map(res => res['data']));
 }

 loadUOM(){
   this.UOMList$ = this.http.get<any[]>(this.apiUrl + "org/uom?active=1&fields=uom_id,uom_code,uom_description").pipe(map(res=>res['data']));
 }

 loadSubCategory(_category){
   //console.log(this.itemForm)
   this.itemForm.patchValue({sub_category_code : null})

   this.clearPropertyTable();
   if(_category == 'FAB'){
     $("#trComposition").fadeIn();
     this.default_val = [{ uom_id: 'yd', uom_code: 'yd', uom_description: 'YARD' }];
   }else{
     $("#trComposition").fadeOut();
     this.default_val = [];
   }
   this.subCategory$ = this.http.get<any[]>(this.apiUrl + 'merchandising/item-sub-categories?type=sub_category_by_category',
   {params:{'category_id':_category}})
   .pipe(map(res => res['data']));
 }

 clearPropertyTable(){
 //  $("#tblPropertyValues > tbody > tr").remove();
   this.assignedPropertyList = []
 }

 loadAssignProperties(subCatCode){

   this.http.get<any[]>(this.apiUrl + 'merchandising/item-properties?type=assigned_properties',
   {params:{'sub_category':subCatCode}})
   .pipe(map(res=>res['data']))
   .subscribe(data => {
     this.assignedPropertyList = data
     document.getElementById('sub_category_code').blur()
   });


 }

 setPropertyId(evt){

   var _arr_propertyID = evt.currentTarget.id.split("_");
   this.propertyId = _arr_propertyID[1];

   $("#hndPropertyId").val(this.propertyId);
 }

 closePropertyValue(){
   $("#propertyValue").fadeOut();
 }

 saveNewContent(){
   this.http.post(this.apiUrl + 'merchandising/item-content-types', this.contentForm.getRawValue())
   .subscribe(data =>{
     if(data['data']['status'] == 'success'){
       AppAlert.showSuccess({text:data['data']['message']});
       this.contentForm.reset()
     //  this.contentModel.hide()
       this.loadContentList()
       //this.itemForm.reset();
       //document.getElementById('type_description').focus()
       //this.compositionModel.show()
     }
     else if(data['data']['status'] == 'error'){
       AppAlert.showError({text: data['data']['message']});
     }
   });
 }

 loadContentList(){
 //  this.contentTypeList$ = this.http.get<any[]>(this.apiUrl + 'merchandising/item-content-types').pipe(map(res=>res['data']))
 this.http.get<any[]>(this.apiUrl + 'merchandising/item-content-types').pipe(map(res=>res['data']))
   .subscribe(data => {
     this.contentTypeList = data
     for(let x = 0 ; x < this.contentTypeList.length ; x++){
       this.contentTypeList[x]['value'] = 0;
     }
   });;
 }

 loadCompositionsList(){
   this.compositionsList$ = this.http.get<any[]>(this.apiUrl + 'merchandising/item-compositions')
   .pipe(map(res=>res['data']))

 }

 loadPropertyValues(_propertyId){
   //alert(_propertyId);
   /*this.propertyValueList$ =*/
   return this.http.get<any[]>(this.apiUrl + 'merchandising/item-properties?type=property_values',{params:{'property_id':_propertyId}})
   .pipe(map(res=>res['data']));

   /*this.propertyValueList$.forEach(element =>{
     for(var i =0; i<element.length;i++){
       var  _AssignValue = element[i]["assign_value"];

       $("#tblPropertyValues > tbody > tr").each(function(){
         var objSelect = $(this).find('td').eq(1).find('select');
         var objSelectId = $(this).find('td').eq(1).find('select').attr('id');

         if(_propertyId==objSelectId){
           objSelect.append("<option class='space-option'>"+_AssignValue+"</option>");
         }
       });
     }
   });*/
 }

 /*ClearLoadPropertyValues(_propertyId){
   $("#tblPropertyValues > tbody > tr").each(function(){
     var objSelect = $(this).find('td').eq(1).find('select');

     var objSelectId = $(this).find('td').eq(1).find('select').attr('id');

     if(_propertyId==objSelectId){
       objSelect.find('option').remove();
     }
   });
 }*/


 saveComposition(){

   var totalCompositionVal = 0;
   var compositionDescription      = "";
   var contentDescription          = "";
   var arrayCompostionDescription  = [];
   var arrayComposition            = [];
   let tmp = [];

   for(let x = 0 ; x < this.contentTypeList.length ; x++){
       let compositionVal = parseInt((this.contentTypeList[x].value == '') ? 0 : this.contentTypeList[x].value);
       totalCompositionVal += compositionVal

       let contentType = this.contentTypeList[x].type_description;
       if(compositionVal > 0){
         compositionDescription = " " + compositionVal + "% " + contentType;
         //arrayComposition.push({"contentval":compositionVal, "contenttype":contentType, "content":compositionVal});
         arrayComposition.push({"content":compositionDescription, "contentval":compositionVal});
       }

   }

   if(totalCompositionVal != 100){
     AppAlert.showError({text:"Content value must be equal to 100%"});
     return;
   }


   // ==========================================

   /*$("#tblComposition > tbody > tr").each(function(){

     var contentType = $(this).find('td').eq(1).html();
     var compositionVal = parseInt($(this).find('td').eq(2).find(':text').val());

     if(compositionVal > 0){
       compositionDescription = " " + compositionVal + "% " + contentType;
       //arrayComposition.push({"contentval":compositionVal, "contenttype":contentType, "content":compositionVal});
       arrayComposition.push({"content":compositionDescription, "contentval":compositionVal});
     }
   });*/

   // Sort array in descending order
   const arr = arrayComposition.sort((t1, t2)=>{
       if(t1.contentval > t2.contentval){return -1;}
       if(t1.contentval < t2.contentval){return 1;}
       return 0;
   });

   for(let i = 0 ; i <arr.length ; i++){
      contentDescription += arr[i]["content"];
   }

   // Save composition to the item_content table
   // =============================================
   //arrayCompostionDescription.push({"comp_description":contentDescription});
   let formData = {
     content_description : contentDescription
   }
   //console.log(arrayCompostionDescription[0]);
   this.http.post(this.apiUrl + 'merchandising/item-compositions', formData)
     .subscribe(data =>{
       if(data['data']['status'] == 'success'){
         this.loadCompositionsList();
         AppAlert.showSuccess({ text: data['data']['message']});
       }
       else{
         AppAlert.showError({ text: data['data']['message']});
       }
   });

 }

 savePropertyValue(){

   if(!this.propertyValueFormValidator.validate())//if validation faild return from the function
     return;

   let formData = this.propertyValueForm.getRawValue()
   this.http.post(this.apiUrl + "merchandising/item-property-values", formData)
     .subscribe(data => {
       if(data['data']['status'] == 'success'){
         AppAlert.showSuccess({ text : data['data']['message'] });

         this.loadAssignProperties(this.itemForm.get('sub_category_code').value)

       }
       else {
           AppAlert.showError({ text : data['data']['message'] });
       }
     });

 }

 saveItem(){

   if(!this.itemFormValidator.validate())//if validation faild return from the function
   return;

   let form_data = this.itemForm.getRawValue()
   
   if(form_data['category_code'] == 'FAB'){

     if(form_data['fabric_composition'] == null){
       AppAlert.showError({ text : 'Fabric Composition cannot be Empty.'})
       return;
     }

     var count = 0;
     for (var _i = 0; _i < form_data['uom']['length']; _i++)
     {
       console.log(form_data['uom'][_i]['uom_code'])
       if(form_data['uom'][_i]['uom_code'] == "yd")
       {
         count++;
       }
     }
      if(count != 1)
      {
        AppAlert.showError({ text : 'You will have to add yd as mandatory uom'})
        //this.default_val = [{ uom_id: 1, uom_code: 'yd', uom_description: 'YARD' }];
        return;
      }

   }


   let property_data = [];
   //check composition is selected if category is fabric
   if(form_data.category_code == 1 && form_data.fabric_composition == null){
     AppAlert.showError({ text : 'You must select fabric composition for fabric category'})
     return
   }
   //check all property fields are filled
   for(let x = 0 ; x < this.assignedPropertyList.length ; x++){
     if(this.assignedPropertyList[x]['selected_property_value_id'] == undefined || this.assignedPropertyList[x]['selected_property_value_id'] == ''){
       AppAlert.showError({ text : 'You must select values for all properties'})
       return
     }

     let obj = {
       property_id : this.assignedPropertyList[x]['property_id'],
       selected_property_value_id : this.assignedPropertyList[x]['selected_property_value_id'],
       selected_property_value : this.assignedPropertyList[x]['selected_property_value'],
       selected_property_value_data : this.assignedPropertyList[x]['selected_property_value_data'],
       other_data_type : this.assignedPropertyList[x]['other_data_type']
     }

     if(obj['selected_property_value_data'] == undefined){
       obj['selected_property_value_data'] = '';
     }

     if(obj['other_data_type'] == undefined){
       obj['other_data_type'] = 'AFTER';
     }
     property_data.push(obj)
   }

   let request_data = {
     'item_data' : form_data,
     'property_data' : property_data
   }
   this.http.post(this.apiUrl + "merchandising/items/check_and_generate_item_description", request_data)
   .pipe(map(res => res['data']))
   .subscribe(data => {
     if(data['status'] == 'success'){
       AppAlert.showConfirm({
         'text' : data['item_description'] + ' | Do you want to save this Material ?'
       },
       (result) => {
         if (result.value) {

           let form_data2 = {
             category_id : form_data['category_code'],
             subcategory_id : form_data['sub_category_code'],
             master_description : data['item_description'],
             uom : form_data['uom'],
             property_data : property_data
           }
           this.http.post(this.apiUrl + 'merchandising/items' , form_data2)
           .subscribe(
               (data) => {
                 if(data['data']['status'] == 'success'){
                   AppAlert.showSuccess({ text : data['data']['message']})
                   this.itemForm.reset()
                   this.contentForm.reset()
                   this.propertyValueForm.reset()
                   this.assignedPropertyList = []
                   //reload item list
                   this.itemService.reloadMaterialList('RELOAD')
                 }
                 else{
                   AppAlert.showError({ text : data['data']['message']})
                 }
               },
               (error) => {
                 console.log(error)
               }
           )
         }
       })
     }
     else{
       AppAlert.showError({ text : data['message']})
     }
   })




   /*var Is_Display = -1;
   var _subCatName = '';
   var _fabComposition = '';
   var _itemDescription = '';
   var _mainItemPrefix = '';
   var _subCatPrefix = '';
   var _itemPrefix = '';
   var _arrCompoistion = [];

   var objFormValues =(this.itemForm.getRawValue());
   var _subCatCode = objFormValues["sub_category_code"];
   var _mainCatCode = objFormValues["category_code"];
   var _uom_code = objFormValues["uomCtrl"];

   console.log(objFormValues)

   console.log(this.assignedPropertyList)*/
   // Get details of the main Category
   // ========================================
 /*  this.rsMainCtegory$ = this.http.get<any[]>(this.serverURL + "itemCreation/get-maincat",{params:{'categoryId':_mainCatCode}}).pipe(map(res=>res));
   this.rsMainCtegory$.forEach(mainElements=>{

     _mainItemPrefix = mainElements[0]['category_code'];*/

     // Get details of the subcategory
     // ===============================
   /*  this.rsSubCategory$ = this.http.get<any[]>(this.serverURL + "finance/item/get",{params:{'subcategory_id':_subCatCode}}).pipe(map(res=>res));

       this.rsSubCategory$.forEach(element=>{
         Is_Display = (element[0]['is_display']);
         _subCatPrefix = element[0]['subcategory_code'];

         _itemPrefix = _mainItemPrefix + "#" + _subCatPrefix + "#";

         if(Is_Display == 1){
             _subCatName = $("#sub_category_code option:selected").text();
         }

         if(_subCatName != ''){
           _itemDescription += _subCatName;
         }

         if(_mainCatCode == 1){
           _fabComposition = $("#cmbFabComposition option:selected").text();

           if(_fabComposition != '------ Select Fabric Composition ------'){
             _itemDescription += _fabComposition;
             _arrCompoistion = _fabComposition.split(" ")

             for(var arrlen = 0; arrlen < _arrCompoistion.length; arrlen++){
               if(_arrCompoistion[arrlen].length > 3){
                 _itemPrefix += _arrCompoistion[arrlen].substring(0,3) + "#";
               }else{
                 _itemPrefix += _arrCompoistion[arrlen] + "#";
               }
             }

           }
         }*/

         /*$("#tblPropertyValues > tbody > tr").each(function(){

           //var proprtyValue = $(this).find('td').eq(1).find('select').text();
           var _proprtyValue = $(this).children('td:nth-child(2)').find('option:selected').val();
           var _optionalValue = $(this).children('td:nth-child(6)').find(':text').val()
           var _displayOption = $(this).children('td:nth-child(8)').find('option:selected').val();


           if(_proprtyValue != '..........'){
             _itemPrefix += _proprtyValue.substring(0,3) + "#";
             if(_optionalValue != ""){
               if(_displayOption == "AFTER"){
                 _itemDescription += " " + _proprtyValue + " " + _optionalValue;
               }else{
                 _itemDescription += " " + _optionalValue + " " + _proprtyValue ;
               }
             }else{
               _itemDescription += " " + _proprtyValue;
             }
           }

         });*/

       /*  AppAlert.showConfirm({
           text:_itemDescription
         },
         (result) =>{
           if(result.value){

             var _arrItem = [];

             // ====== Varify Item ===================
             // Varify item exist before save the item
             // ======================================

             this.http.get(this.serverURL + "itemCreation/check-item",{params:{"master_description":_itemDescription}})
             .subscribe(val=>{
               if(val['recordscount']>0){
                 AppAlert.showWarning({title:"Item already exist in the system"});
               }else{

                 // ====== Save Item ================
                 _arrItem.push({"subcategory_id":_subCatCode, "master_code" : _itemPrefix, "master_description": _itemDescription, "uom_id":_uom_code, "status":1});

                 this.http.post(this.serverURL + "itemCreation/saveItem", _arrItem[0])
                 .subscribe(data=>{
                   if(data['status'] == 'success'){
                     AppAlert.showSuccess({text:"Successfully Saved"});

                   }
                 });
                 // ====== EOF Save Item ================
               }
             });
             // ======= EOF Verify Item ==============
           }
         }loadUOM


         );
       });



   });*/
 }

 onContentModelHidden(e){
   document.getElementById('div-composition-model').click()
 }

 onPropertyValueModelHidden(e){
   document.getElementById('tbl-properties').click()
 }

}
