import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
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
import { Observable , Subject } from 'rxjs';
import { Size } from '../models/size.model';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-size-chart',
  templateUrl: './size-chart.component.html',
  //styleUrls: ['./size-chart.component.css']
})

export class SizeChartComponent implements OnInit {

    @ViewChild(ModalDirective) sizeChartModel: ModalDirective;

    formGroup : FormGroup
    formValidator : AppFormValidator = null
    modelTitle : string = "New quality grades"
    readonly apiUrl = AppConfig.apiUrl()
    appValidator : AppValidator
    datatable:any = null
    saveStatus = 'SAVE'

    processing : boolean = false
    loading : boolean = false
    loadingCount : number = 0
    initialized : boolean = false

    size$:Observable<Size[]>;//use to load size list in ng-select
    sizeLoading=false;
    sizeInput$=new Subject<string>();
    selectedSize:Size[];

    //to manage form error messages
    formFields = {
      description : '',
      size_name : ''
    }

    constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
      private auth : AuthService, private layoutChangerService : LayoutChangerService, private titleService: Title) { }

    ngOnInit() {
      this.titleService.setTitle("Size Chart")//set page title

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

      let remoteValidationConfig = {
        url:this.apiUrl + 'org/sizes-chart/validate?for=duplicate',
        formFields : this.formFields,
        fieldCode : 'description',
        data : {
          size_chart_id : function(controls){ return controls['size_chart_id']['value']}
        }
      }


      let basicValidator = new BasicValidators(this.http)

      this.formGroup = this.fb.group({
        size_chart_id : 0,
        description :   [null , [Validators.required, Validators.minLength(1), Validators.maxLength(50), PrimaryValidators.noSpecialCharactor],[primaryValidator.remote(remoteValidationConfig)]],
        size_name :   [null , [Validators.required]],
      })

      this.formValidator = new AppFormValidator(this.formGroup , {});
      this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

      this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
        this.appValidator.validate();
      })

      this.createTable() //load data list
      this.loadSize()

      //change header nevigation pagePath
      this.layoutChangerService.changeHeaderPath([
        'Product Development',
        'Master Data',
        'Size Chart'
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
       this.datatable = $('#size_chart_table').DataTable({
         autoWidth: false,
         scrollY: "500px",
         scrollCollapse: true,
         processing: true,
         serverSide: true,
         order : [[ 0, 'desc' ]],
         ajax: {
              dataType : 'JSON',
              "url": this.apiUrl + "org/sizes-chart?type=datatable"
          },
          columns: [
              {
                data: "size_chart_id",
                orderable: false,
                width: '3%',
                render : (data,arg,full)=>{
                  var str = '';
                  if(this.permissionService.hasDefined('SIZE_CHART_EDIT')){
                      str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                }
                if(this.permissionService.hasDefined('SIZE_CHART_DELETE')){
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
                }
                  if( full.status== 0 ) {
                    str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed;margin-right:3px" data-action="DISABLE" data-id="'+data+'">\n\
  </i><i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed" data-action="DISABLE" data-id="'+data+'"></i>';
                  }
                  return str;
               }
             },
             {
               data: "status",
               orderable: false,
               width: '5%',
               render : function(data){
                 if(data == 1){
                     return '<span class="label label-success">Active</span>';
                 }
                 else{
                   return '<span class="label label-default">Inactive</span>';
                 }
               }
            },
            { data: "chart_name" },
            { data: "description" }
         ],
       });

       //listen to the click event of edit and delete buttons
       $('#size_chart_table').on('click','i',e => {
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
    saveSizeChart(){
      if(!this.formValidator.validate())//if validation faild return from the function
      return;
      this.processing = true
      AppAlert.showMessage('Processing...','Please wait while saving details')
      let saveOrUpdate$ = null;
      let compId = this.formGroup.get('size_chart_id').value
      if(this.saveStatus == 'SAVE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'org/sizes-chart', this.formGroup.getRawValue())
      }
      else if(this.saveStatus == 'UPDATE'){
        saveOrUpdate$ = this.http.put(this.apiUrl + 'org/sizes-chart/' + compId , this.formGroup.getRawValue())
      }

      saveOrUpdate$.subscribe(
        (res) => {
          this.processing=false;
          this.formGroup.reset();
          this.reloadTable()
          this.sizeChartModel.hide()
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({text : res.data.message })
          } , 500)
       },
       (error) => {
         this.processing = false
         AppAlert.closeAlert()
         if(error.status == 422){ //validation error
           AppAlert.showError({title : 'Validation Error' , text : error.error.errors.validationErrorsText })
         }else{
           AppAlert.showError({text : 'Process Error' })
           console.log(error)
         }
       }
     );
    }

    loadSize() {
       this.size$ = this.sizeInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.sizeLoading = true),
          switchMap(term => this.http.get<Size[]>(this.apiUrl + 'org/sizes?type=auto' , {params:{search:term}})
          .pipe(
              tap(() => this.sizeLoading = false)
          ))
       );
     }

    edit(id) {
       this.http.get(this.apiUrl + 'org/sizes-chart/' + id)
       .pipe(map( data => data['data'] ))
       .subscribe(data => {
        if(data[0]['status'] == '1')
        {
          this.sizeChartModel.show()
          this.modelTitle = "Update size chart"
          this.formGroup.setValue({
           'size_chart_id' : data[0]['size_chart_id'],
           'description' : data[0]['chart_name'],
           'size_name' : data[0]['sizes']
          })
          this.formGroup.get('description').disable()
          this.saveStatus = 'UPDATE'
        }
      })
    }

    delete(id, status) { //deactivate payment term

      if(status == 0)
        return
      AppAlert.showConfirm({
        'text' : 'Do you want to deactivate selected size chart?'
      },
      (result) => {
        if (result.value) {
          this.http.delete(this.apiUrl + 'org/sizes-chart/' + id)
          .subscribe(
              (data) => {
                  this.reloadTable()
              },
              (error) => {
                  console.log(error)
              }
          )
        }
      })
    }

    showEvent(event){ //show event of the bs model
      this.formGroup.get('description').enable()
      this.formGroup.reset();
      this.modelTitle = "New Size Chart"
      this.saveStatus = 'SAVE'
    }

    formValidate(){ //validate the form on input blur event
      this.appValidator.validate();
    }

  }
