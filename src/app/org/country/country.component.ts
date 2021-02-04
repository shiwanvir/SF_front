import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';


//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';


@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: []
})
export class CountryComponent implements OnInit {

  @ViewChild(ModalDirective) countryModel: ModalDirective;
  formValidator : AppFormValidator = null
  formGroup : FormGroup
  modelTitle : string = "New Country"
  readonly apiUrl = AppConfig.apiUrl()
  saveStatus = 'SAVE'
  datatable:any = null

  processing : boolean = false

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService:PermissionsService,
    private auth : AuthService, private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Country")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/countries/validate?for=duplicate',
      fieldCode : 'country_code',
      /*error : 'Dep code already exists',*/
      data : {
        country_id : function(controls){ return controls['country_id']['value']}
      }
    }


    this.formGroup = this.fb.group({
      country_id : 0,
      country_code :  [null , [Validators.required,Validators.minLength(0), Validators.maxLength(3)],[primaryValidator.remote(remoteValidationConfig)]],
      country_description :  [null , [Validators.required, Validators.maxLength(100), PrimaryValidators.noSpecialCharactor]],
    })
    this.formValidator = new AppFormValidator(this.formGroup , {});
    //create new validation object
    //this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    /*this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })*/

   if(this.permissionService.hasDefined('COUNTRY_VIEW')){
      this.createTable() //load data list
   }

   //change header nevigation pagePath
   this.layoutChangerService.changeHeaderPath([
     'Catalogue',
     'Application Basic Setup',
     'Country'
   ])

   //listten to the menu collapse and hide button
   this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
     if(data == false){return;}
     if(this.datatable != null){
       this.datatable.draw(false);
     }
   })

  }

  ngOnDestroy(){
      this.datatable = null
  }


  createTable() { //initialize datatable
     this.datatable = $('#country_tbl').DataTable({
       autoWidth: true,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[0,'desc']],
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "org/countries?type=datatable"
        },
        columns: [
            {
              data: "country_id",
              orderable: false,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('COUNTRY_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
                if(this.permissionService.hasDefined('COUNTRY_DELETE')){
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                  data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
                }
                return str;
             }
           },
           {
             data: "status",
             /*orderable: false,*/
             render : function(data){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
          { data: "country_code" },
          { data: "country_description" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#country_tbl').on('click','i',e => {
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
  saveCountry(){
    //this.appValidation.validate();
    this.processing = true
    let saveOrUpdate$ = null;
    let countryId = this.formGroup.get('country_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/countries',this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/countries/' + countryId,this.formGroup.getRawValue())
    }

    saveOrUpdate$
    .pipe( map(res => res['data']) )
    .subscribe(
      data => {
        this.processing = false
        if(data.status=='0'){
          AppAlert.showError({text:data.message})
          this.formGroup.reset();
          this.reloadTable()
          this.countryModel.hide()
        }
        else if(data.status=='1'){
        AppAlert.showSuccess({text : data['message'] })
        this.formGroup.reset();
        this.reloadTable()
        this.countryModel.hide()
      }
      },
      error => {
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
    this.http.get(this.apiUrl + 'org/countries/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
        if(data['status'] == '1') {
          this.countryModel.show()
          this.modelTitle = "Update Country"
          this.formGroup.setValue({
           'country_id' : data['country_id'],
           'country_code' : data['country_code'],
           'country_description' : data['country_description']
          })
          this.formGroup.get('country_code').disable()
          this.saveStatus = 'UPDATE'
        }
      })

  }


  delete(id, status) { //deactivate payment term

    if(status == 0)
      return

    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Country?'
    },
    (result) => {
      if (result.value) {
        //let data = {'country_id' : id , 'status' : '0'}
        this.http.delete(this.apiUrl + 'org/countries/' + id/*,{ params : data }*/)
        .pipe(map(data=>data['data']))
        .subscribe(data => {
          if(data.status=='0'){
            AppAlert.showError({text:data.message})
          }
          else{
            this.reloadTable()
          }
        })
      }
    })
  }


  showEvent(event){ //show event of the bs model
    this.formGroup.get('country_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Country"
    this.saveStatus = 'SAVE'
  }

}
