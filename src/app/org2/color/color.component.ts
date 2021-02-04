import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder,AbstractControl , FormGroup , Validators, FormControl} from '@angular/forms';
import { Router } from '@angular/router';
import { Observable , Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';


//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { AuthService } from '../../core/service/auth.service';
import { PermissionsService } from '../../core/service/permissions.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-color',
  templateUrl: './color.component.html',
  styleUrls: []
})
export class ColorComponent implements OnInit {

  @ViewChild(ModalDirective) divisionModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Color"
  readonly apiUrl = AppConfig.apiUrl()
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false
  appValidator : AppValidator
  colorQulity: Array<any>
  arr:Array<any>
  //colorQulity1: Array<any>
  colorCategory$:Observable<any>
  isShown: boolean = true
  //codeMaxlength=5
  formFields = {
    color_code: '',
    color_name : '',
    color_category:'',
    color_qulity:'',
    validation_error:''
  }
  constructor(private router:Router, private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.titleService.setTitle("Color")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
//
    /*let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/colors/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'validation_error',
      data : {
        color_id : function(controls){ return controls['color_id']['value']},
        color_code:function(controls){if(controls['color_code']['value']!=null) {return (controls['color_code']['value'])}
        else
        return null;
      },
      color_name:function(controls){if(controls['color_name']['value']!=null) {return (controls['color_name']['value'])}
      else
      return null;
        },
        color_category:function(controls){if(controls['color_category']['value']!=null) {return (controls['color_category']['value'])}
        else
        return null;
      },
      col_quality:function(controls){if(controls['col_quality']['value']!=null) {return (controls['color_category']['value'])}
      else
      return null;
    },
      }
    }*/

    let remoteValidationConfig1 = { //configuration for location code remote validation
      url:this.apiUrl + 'org/colors/validate?for=duplicate_code',
      fieldCode : 'color_code',
      data : {
        color_id : function(controls){ return controls['color_id']['value'] }
      }
    }

    let remoteValidationConfig2 = { //configuration for location code remote validation
      url:this.apiUrl + 'org/colors/validate?for=duplicate_name',
      fieldCode : 'color_name',
      data : {
        color_id : function(controls){ return controls['color_id']['value'] }
      }
    }

 let basicValidator = new BasicValidators(this.http)//create object of basic validation class
    this.formGroup = this.fb.group({
      color_id : 0,
      color_code :[null , [Validators.required,PrimaryValidators.minLength(0),Validators.maxLength(16),this.colorCodeValidation()],[primaryValidator.remote(remoteValidationConfig1)]],
      color_name : [null , [Validators.required, Validators.maxLength(100), this.colorCodeValidation()/*PrimaryValidators.noSpecialCharactor*/],[primaryValidator.remote(remoteValidationConfig2)]],
      color_category:[null , [Validators.required, Validators.maxLength(100), PrimaryValidators.noSpecialCharactor]/*,[basicValidator.remote(remoteValidationConfig)]*/],
      col_quality:[null , [Validators.required, Validators.maxLength(100), PrimaryValidators.noSpecialCharactor]/*,[basicValidator.remote(remoteValidationConfig)]*/],
    })

    this.formValidator = new AppFormValidator(this.formGroup , {color_code:{IncorrectColorCode:"Incorrect Color Code"}});
  //  this.formValidator = new AppFormValidator(this.formGroup , {});
//
    if(this.permissionService.hasDefined('COLOR_VIEW')){
      this.createTable() //load data list
    }
        this.appValidator = new AppValidator(this.formFields,{},this.formGroup);
        this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
          this.appValidator.validate();
        });
    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Master Data',
      'Color'
    ])

    //listten to the menu collapse and hide button
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

    this.load_color_category()

  }



   colorCodeValidation() {
     //debugger
        const validator = (control:FormControl): { [key: string]: any } => {

              if(control != undefined && control != null && control.parent != undefined){

                let value: string = control.value
             var col_cat= control.parent.get('color_category') == null ? null : control.parent.get('color_category').value;

             var str = new String(value)
             let patternNoSpecChar = /[^\w\s-]/gi;
              console.log(col_cat)
             if(col_cat==1){
               if(str.length>10){

               return { 'IncorrectColorCode': true };
             }
            }
             else if(col_cat==2){
               if(str.length>12){
                //this.formData.form.controls['col_quality'].setErrors({'required': false});
                return { 'IncorrectColorCode': true };
              }
             }
             else if(col_cat==3){
               if(str.length>10||new RegExp(patternNoSpecChar).test(value)){
                return { 'IncorrectColorCode': true };
             }
             }
             else if(col_cat==4){
               if(str.length>10||new RegExp(patternNoSpecChar).test(value)){
               return { 'IncorrectColorCode': true };
             }
             }


           }

        };
        return validator;
    };

/*colorQualityValidation(){
   //debugger
     const validator = (control: this.formGroup): { [key: string]: any } => {
             let value: string = control.value;
         if(this.formGroup!=undefined){
          var col_cat=control.parent.controls.color_category.value;
          var col_quality=control.parent.controls.col_quality.value;
          console.log("quality")
          console.log(col_quality)

          var str = new String(value)
          let patternNoSpecChar = /[^\w\s-]/gi;
           console.log(col_quality)
          if(col_cat==2){
            if(col_quality==null){
             return { 'required': false };
           }
          }
          else if(col_cat==3){
            if(col_quality==null){
             return { 'required': false };
          }
          }
          else if(col_cat==4){
            if(col_quality==null){
             return { 'required': false };
          }
          }


        }

     };
     return validator;
 };
*/

  //load color_category
  load_color_category() {

    this.colorCategory$ = this.http.get<any>(this.apiUrl + "org/colors?type=colorCategoryloding&active=1&fields=color_category_id,color_category")
    .pipe( map(res => res['data']) )
    }
  //load color_qulity
/*  load_color_category() {
    this.colorQulity$ = this.http.get<any>(this.apiUrl + "org/colors?type=colorQulityloding&active=1&fields=color_qulity_id,col_quality")
    .pipe( map(res => res['data']) )
  }
*/
load_color_qulity(data) {
  if(data == undefined){
    this.colorCategory$ = null;
  }
  else if(data != undefined){
    //this.customerId = data.customer_id;
    let formData = this.formGroup.getRawValue();
    var color_category_id = formData['color_category']
    //this.styleDescription = data.style_description
    this.http.get(this.apiUrl + 'org/colors?type=colorqulityloding&id='+color_category_id)
    .pipe( map(res => res['data'] ))
    .subscribe(
      data => {
        //console.log(data.divisions)
        //this.customerDetails = data.customer_code + ' / ' + data.customer_name
        //debugger
        if(color_category_id!=1){
          this.formGroup.patchValue({
         'col_quality':data[0]['col_quality']
          })
          this.colorQulity = data
           //this.formGroup.controls['col_quality'].disable();
           this.formGroup.get('col_quality').disable()
           this.formGroup.get('color_code').reset()
           //this.formGroup.get('color_name').reset()
        }
        else if(color_category_id==1){
        console.log(data)
        this.colorQulity = data
        this.formGroup.get('col_quality').enable()
        this.formGroup.get('color_code').enable()
        //this.formGroup.get('color_name').enable()
      }
        },
      error => {
        //console.log(error)
      }
    )
    //this.customerDetails = ''
  }

}

ngOnDestroy(){
    this.datatable = null
}

  createTable() { //initialize datatable
     this.datatable = $('#color_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order : [[ 0, 'desc' ]],
       ajax: {
             headers: {
               'Authorization':`Bearer ${this.auth.getToken()}`,
             },
             dataType : 'JSON',
             "url": this.apiUrl + "org/colors?type=datatable"
        },
        columns: [
            {
              data: "color_id",
              orderable: true,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('COLOR_EDIT')){
                  str += '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                }
                  if(this.permissionService.hasDefined('COLOR_DELETE')){ //check delete permission
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                  data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
                }
                return str;
             }
           },
           {
             data: "status",
             orderable: true,
             render : function(data){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
          { data: "color_code" },
          { data: "color_name" },
          {data:"color_category"},
          {data:"col_quality"},
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#color_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value'], att['data-status']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

  //save and update source details
  saveColor(){
    //this.appValidation.validate();

    //this.colorQulity
    let formData = this.formGroup.getRawValue();
    var e = document.getElementById("ddlViewBy");
    formData['col_quality'] = e['options'][e['selectedIndex']]['text'];
    this.processing = true
    let saveOrUpdate$ = null;
    let colorId = this.formGroup.get('color_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/colors', formData)
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/colors/' + colorId , formData)
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.processing = false
        if(res.data.status=='0'){
          AppAlert.showError({text:res.data.message})
          this.formGroup.reset();
          this.reloadTable()
          this.divisionModel.hide()
        }
        if(res.data.status=='1'){
          AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.divisionModel.hide()
      }
     },
     (error) => {
       this.processing = false
       AppAlert.closeAlert()
       console.log(error)
       if(error.status == 422){ //validation error
         AppAlert.showError({title : 'Validation Error' , text : error.error.errors.validationErrorsText })
       }
       else{
         AppAlert.showError({text : 'Process Error' })
       }
     }
   );
  }


  edit(id) { //get payment term data and open the model

    this.http.get(this.apiUrl + 'org/colors/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.isShown = true;
        this.divisionModel.show()
        this.modelTitle = "Update Color"

        this.formGroup.setValue({
         'color_id' : data['color_id'],
         'color_code' : data['color_code'],
         'color_name' : data['color_name'],
         'color_category':data['color_category'],
         'col_quality':data['col_quality']
        })
        this.colorQulity=data['quality']

        //debugger

        console.log(this.formGroup.get('col_quality').value)

        //this.load_color_qulity(data);
          console.log(this.colorQulity)

        //this.colorQulity=[data]

        //debugger
        this.formGroup.get('color_code').disable()
        this.formGroup.get('color_category').disable()
        this.formGroup.get('col_quality').disable()

        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id, status) { //deactivate payment term
    if(status == 0)
      return

    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Color?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/colors/' + id)
        .pipe(map( data => data['data'] ))
        .subscribe(
            (data) => {
                if(data.status==0){
                  AppAlert.showError({text:data.message})
                }
                else if(data.status==1){
                  this.reloadTable()
                }

            },
            (error) => {
              console.log(error)
            }
        )
      }
    })
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

  showEvent(event){ //show event of the bs model
    this.formGroup.get('color_code').enable()
    this.formGroup.get('color_category').enable()
    this.formGroup.get('col_quality').enable()
    this.formGroup.reset();
    this.formFields.validation_error='';
    this.modelTitle = "New Color"
    this.saveStatus = 'SAVE'
  }

}
