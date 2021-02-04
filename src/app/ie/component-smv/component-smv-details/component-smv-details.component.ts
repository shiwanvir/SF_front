import { Component, OnInit,ViewChild,AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';



//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../../core/validation/primary-validators';
import { BasicValidators } from '../../../core/validation/basic-validators';
import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';

import { AuthService } from '../../../core/service/auth.service';
import { PermissionsService } from '../../../core/service/permissions.service';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';

import { SmvService } from '../smv.service';
//

@Component({
  selector: 'app-component-smv-details',
  templateUrl: './component-smv-details.component.html',
  styleUrls: ['./component-smv-details.component.css']
})
export class ComponentSmvDetailsComponent implements OnInit {


  @ViewChild(ModalDirective) divisionModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "Copy Component SMV"
  readonly apiUrl = AppConfig.apiUrl()
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false

  styleFrom$: Observable<any[]>;//use to load styles list in ng-select
  styleTo$: Observable<any[]>;
  styleLoadingFrom = false;
  styleLoadingTo = false;
  styleInputFrom$ = new Subject<string>();
  styleInputTo$ = new Subject<string>();
  selectedStyleFrom: any[];
  selectedStyleTo: any[];

  bomStageFrom$:Observable<any[]>;
  bomStageTo$:Observable<any[]>;
  bomStageLoadingFrom=false;
  bomStageLoadingTo=false;
  bomStageInputFrom$=new Subject<string>();
  bomStageInputTo$=new Subject<string>();
  selectedBomSatageFrom:any[];
  selectedBomSatageTo:any[];

  colorOptionFrom$:Observable<any[]>;
  colorOptionTo$:Observable<any[]>;
  colorOptionLoadingFrom=false;
  colorOptionLoadingTo=false;
  colorOptionInputFrom$=new Subject<string>();
  colorOptionInputTo$=new Subject<string>();
  selectedColorOptionFrom:any[];
  selectedColorOptionTo:any[];


  formFields = {
    style_no_from: '',
    bom_stage_description_from:'',
    color_option_from:'',
    style_no_to: '',
    bom_stage_description_to:'',
    color_option_to:'',
    validation_error:'',

  }
  //private smvService:SmvService
  constructor(private router:Router, private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,private smvService:SmvService,
    private auth : AuthService,private layoutChangerService : LayoutChangerService) { }


    ngOnInit() {
      //   this.titleService.setTitle("Color")//set page title

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
      //
      let remoteValidationConfig = { //configuration for location code remote validation
        url:this.apiUrl + 'org/colors/validate?for=duplicate',
        formFields : this.formFields,
        fieldCode : 'validation_error',
        /*error : 'Dep code already exists',*/
        data : {

        }
      }
      let basicValidator = new BasicValidators(this.http)//create object of basic validation class
      this.formGroup = this.fb.group({
        id:0,
        style_no_from : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
        //bom_stage : [null , [Validators.required],[primaryValidator.remote(remoteValidationConfig)]],
        bom_stage_description_from:[null , [Validators.required],[primaryValidator.remote(remoteValidationConfig)]],
        color_option_from:[null , [Validators.required],[primaryValidator.remote(remoteValidationConfig)]],
        style_no_to : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
        //bom_stage : [null , [Validators.required],[primaryValidator.remote(remoteValidationConfig)]],
        bom_stage_description_to:[null , [Validators.required],[primaryValidator.remote(remoteValidationConfig)]],
        color_option_to:[null , [Validators.required],[primaryValidator.remote(remoteValidationConfig)]]
      })

      this.formValidator = new AppFormValidator(this.formGroup , {});

      if(this.permissionService.hasDefined('SMV_COMPONENT_VIEW')){
        this.createTable() //load data list
      }

      //change header nevigation pagePath
      /*   this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Master Data',
      'Color'
    ])*/

    //listten to the menu collapse and hide button
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      debugger
    if(this.datatable != null){
    this.datatable.draw(false);
  }
})


this.loadStyleFrom()
this.loadBomStagesFrom()
this.loadColorOptionsFrom();
this.loadStyleTo()
this.loadBomStagesTo()
this.loadColorOptionsTo();
}


//load size list
loadStyleFrom() {

  this.styleFrom$ = this.styleInputFrom$
  .pipe(
    debounceTime(200),
    distinctUntilChanged(),
    tap(() => this.styleLoadingFrom = true),
    switchMap(term => this.http.get<any[]>(this.apiUrl + 'ie/styles?type=auto' , {params:{search:term}})
    .pipe(
      //catchError(() => of([])), // empty list on error
      tap(() => this.styleLoadingFrom = false)
    ))
  );
}


//load size list
loadBomStagesFrom() {

  this.bomStageFrom$ = this.bomStageInputFrom$
  .pipe(
    debounceTime(200),
    distinctUntilChanged(),
    tap(() => this.bomStageLoadingFrom = true),
    switchMap(term => this.http.get<any[]>(this.apiUrl + 'ie/bomStages?type=auto' , {params:{search:term}})
    .pipe(
      //catchError(() => of([])), // empty list on error
      tap(() => this.bomStageLoadingFrom = false)
    ))
  );
}
loadColorOptionsFrom() {

  this.colorOptionFrom$= this.colorOptionInputFrom$
  .pipe(
    debounceTime(200),
    distinctUntilChanged(),
    tap(() => this.colorOptionLoadingFrom = true),
    switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/color-options?type=auto' , {params:{search:term}})
    .pipe(
      //catchError(() => of([])), // empty list on error
      tap(() => this.colorOptionLoadingFrom = false)
    ))
  );
}



//load size list
loadStyleTo() {

  this.styleTo$ = this.styleInputTo$
  .pipe(
    debounceTime(200),
    distinctUntilChanged(),
    tap(() => this.styleLoadingTo = true),
    switchMap(term => this.http.get<any[]>(this.apiUrl + 'ie/styles?type=auto' , {params:{search:term}})
    .pipe(
      //catchError(() => of([])), // empty list on error
      tap(() => this.styleLoadingTo = false)
    ))
  );
}


//load size list
loadBomStagesTo() {

  this.bomStageTo$ = this.bomStageInputTo$
  .pipe(
    debounceTime(200),
    distinctUntilChanged(),
    tap(() => this.bomStageLoadingTo = true),
    switchMap(term => this.http.get<any[]>(this.apiUrl + 'ie/bomStages?type=auto' , {params:{search:term}})
    .pipe(
      //catchError(() => of([])), // empty list on error
      tap(() => this.bomStageLoadingTo = false)
    ))
  );
}
loadColorOptionsTo() {

  this.colorOptionTo$= this.colorOptionInputTo$
  .pipe(
    debounceTime(200),
    distinctUntilChanged(),
    tap(() => this.colorOptionLoadingTo = true),
    switchMap(term => this.http.get<any[]>(this.apiUrl + 'merchandising/color-options?type=auto' , {params:{search:term}})
    .pipe(
      //catchError(() => of([])), // empty list on error
      tap(() => this.colorOptionLoadingTo = false)
    ))
  );
}


ngOnDestroy(){
    this.datatable = null
}

createTable() { //initialize datatable
  this.datatable = $('#color_tbl').DataTable({
    autoWidth: false,
    scrollY: "500px",
    scrollX: true,
    scrollCollapse: true,
    processing: true,
    responsive: true,
    serverSide: true,
    order : [[ 0, 'desc' ]],
    ajax: {
      headers: {
        'Authorization':`Bearer ${this.auth.getToken()}`,
      },
      dataType : 'JSON',
      "url": this.apiUrl + "ie/componentSMVDetails?type=datatable"
    },
    columnDefs: [
      { className: "text-right", targets: [6] }
    ],
    columns: [
      {
        data: "smv_component_header_id",
        orderable: true,
        width: '3%',
        render : (data,arg,full) => {
          var str = '';
          if(this.permissionService.hasDefined('SMV_COMPONENT_EDIT')){

          str += '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
        }
          if(this.permissionService.hasDefined('SMV_COMPONENT_DELETE')){ //check delete permission
            str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
            data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
          }
          return str;
        }
      },
      {
        data: "status",
        orderable: false,
        render : function(data){
          if(data == 1){
            return '<span class="label label-success">Active</span>';
          }
          else{
            return '<span class="label label-default">Inactive</span>';
          }
        }
      },
      {data: "style_no" },
      {data: "bom_stage_description" },
      {data:"color_option"},
      {data:"buy_name"},
      {
        data: "total_smv",
        render : function(data){
          return parseFloat(data).toFixed(2);
        }
      },
      // {data:"total_smv"},
      {data:"revision_no"}

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
  //this.colorOptionModel.hide()
  this.processing = true
  let saveOrUpdate$ = null;
  let colorId = this.formGroup.get('color_id').value
  if(this.saveStatus == 'SAVE'){
    saveOrUpdate$ = this.http.post(this.apiUrl + 'org/colors', this.formGroup.getRawValue())
  }
  else if(this.saveStatus == 'UPDATE'){
    saveOrUpdate$ = this.http.put(this.apiUrl + 'org/colors/' + colorId , this.formGroup.getRawValue())
  }

  saveOrUpdate$.subscribe(
    (res) => {
      this.processing = false
      AppAlert.showSuccess({text : res.data.message })
      this.formGroup.reset();
      this.reloadTable()
      this.divisionModel.hide()
    },
    (error) => {
      this.processing = false
      console.log(error)
    }
  );
}


edit(id) { //get payment term data and open the model

  this.http.get(this.apiUrl + 'ie/componentSMVDetails/' + id )
  .pipe( map(res => res['data']) )
  .subscribe(data => {

    //console.log(data[0][0]['status']);
    if(data[0][0]['status']=='0'){
      return 0
    }
    this.smvService.changeData(data);
  })
}


delete(id, status) { //deactivate payment term
  if(status == 0)
  return

  AppAlert.showConfirm({
    'text' : 'Do you want to deactivate selected Component?'
  },
  (result) => {
    if (result.value) {
      this.http.delete(this.apiUrl + 'ie/componentSMVDetails/' + id)
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
  // this.formGroup.get('color_code').enable()
  this.formGroup.reset();
  this.formFields.validation_error='';
  this.modelTitle = "Copy Component SMV"
  this.saveStatus = 'SAVE'
}
formValidate(){

}

}
