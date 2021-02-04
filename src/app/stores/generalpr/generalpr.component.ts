import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { genmrnService } from './genmrn.service';
import { TabsetComponent } from 'ngx-bootstrap';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { NgOption } from '@ng-select/ng-select';
declare var $:any;


import { AppValidator } from '../../core/validation/app-validator';
import { AppConfig } from '../../core/app-config';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppAlert } from '../../core/class/app-alert';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-generalpr',
  templateUrl: './generalpr.component.html',
  styleUrls: ['./generalpr.component.css']
})
export class GeneralprComponent implements OnInit {

  @ViewChild(ModalDirective) pr_detailModel: ModalDirective;
  @ViewChild('tabs') tabs: TabsetComponent;

  apiUrl:string = AppConfig.apiUrl()
  popupHeaderTitle : string = "Add Details"
  formGroup:FormGroup = null
  formGroup_details:FormGroup = null
  //formGroup:formGroup_details = null
  appValidator = null
  datatable:any = null
  saveStatus = 'SAVE'
  saveDetailStatus = 'SAVE'
/*
  @ViewChild(ModalDirective) sourceModel: ModalDirective;

  formGroup : FormGroup2
  popupHeaderTitle : string = "New Source" */





  mainLocationList$:Observable<Array<any>>
  main_category$:Observable<Array<any>>
  sub_category$:Observable<Array<any>>
  //load_sub_category$:Observable<Array<any>>
  load_sub_category$:Observable<Array<any>>
  departments$:Observable<Array<any>> //observable to featch source list

  formFields = { // store form validation errors
    request_no :'',
    location :'',
    department : '',
    Item_wanted_date : ''

  }

  constructor(private fb:FormBuilder , private http:HttpClient, private generalpr:genmrnService) { }
  ngOnInit() {

    //this.mainLocationList$ = this.loadCompanies(),
    //this.departments$ = this.getDepartments()
    //this.mainLocationList$();

    this.loadCompanies()
    this.getDepartments()
    this.main_category()
    this.sub_category()
    //this. sub_category_uom()

    this.generalpr.genmrnData.subscribe(data => {
      if(data != null && data != ''){
          this.tabs.tabs[1].active = true;
      }
      //this.message = data
    })



    this.formGroup = this.fb.group({ //generate angular reactive form

      request_no : [null],
      prId : [null],
      location : [null , [Validators.required]],
      Item_wanted_date : [null , [Validators.required]],
      department : [null , [Validators.required]],

    })

    this.formGroup_details = this.fb.group({ //generate angular reactive form

      main_category : [null , [Validators.required]],
      sub_category_code :[null , [Validators.required]],
      req_qty : [null , [Validators.required]],
      /* unit_value : [null , [Validators.required]],
      total_value : [null , [Validators.required]], */
      //load_sub_category:'',
      request_id :'',
      uom : [null , [Validators.required]]
    })




    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);//form validation class

    this.formGroup.valueChanges.subscribe(data => { //listen to changes of the form and validate fields
      //console.log(this.formGroup.value)
      this.appValidator.validate();
    })

    //this.createTable() //load data list when load page
  }

  ngOnDestroy(){
      this.datatable = null
  }

  createTable() { //initialize datatable

    let gen_req_no=$("#request_no").val()
    //alert("AA"+gen_req_no);

    this.datatable = $('#item_tbl').DataTable({
      autoWidth: false,
      scrollY: "500px",
      scrollCollapse: true,
      processing: true,
      serverSide: true,
      ajax: {
           dataType : 'JSON',
           "url": this.apiUrl + "stores/get_genpr?type=datatable&id="+gen_req_no

       },
       columns: [
           {
             data: "id",
             orderable: false,
             width: '3%',
             render : function(data,arg,full){
               /* var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
               str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>'; */
                var str ='<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';

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
         { data: "request_no" },
         { data: "loc_name" },
         { data: "dep_name" },
         { data: "Item_wanted_date" },
         { data: "itemDecs" },
         { data: "req_qty" },
         { data: "uom" }
      ],
    });

    //listen to the click event of edit and delete buttons
    $('#item_tbl').on('click','i',e => {
       let att = e.target.attributes;
      /*  if(att['data-action']['value'] === 'EDIT'){
           this.edit(att['data-id']['value']);
       }
       else  */
       if(att['data-action']['value'] === 'DELETE'){
           this.delete(att['data-id']['value']);
       }
    });
 }

 reloadTable() {//reload datatable
     this.datatable.ajax.reload(null, false);
 }

 saveHeader(){
     //this.appValidator.validate();
    let saveOrUpdate$ = null;
    let formData = this.formGroup.getRawValue();


    if(this.saveStatus == 'SAVE') {
      saveOrUpdate$ = this.http.post(this.apiUrl + 'stores/generalpr', formData );
    }
    else if(this.saveStatus == 'UPDATE') {
      //saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/customer-orders/' + ordId , formData)
    }


    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })

          this.formGroup.patchValue({request_no:res.data.generalPR['request_no']});
          this.formGroup_details.patchValue({request_id:res.data.generalPR['request_no']});

          },
     (error) => {
         console.log(error)
     }
   );


  }


  saveDetails(){
    let saveOrUpdateDetail$ = null;
    let formDetail = this.formGroup_details.getRawValue();

    if(this.saveDetailStatus == 'SAVE'){
    let saveOrUpdateDetail$ = null;
    saveOrUpdateDetail$ = this.http.post(this.apiUrl + 'stores/generalpr_details', formDetail );
    saveOrUpdateDetail$.subscribe(
        (res) => {
          AppAlert.showSuccess({text : res.data.message })
          this.formGroup_details.controls['main_category'].reset();
          this.formGroup_details.controls['sub_category_code'].reset();
          this.formGroup_details.controls['req_qty'].reset();
          this.formGroup_details.controls['uom'].reset();

          /* this.formGroup.controls['location'].reset();
          this.formGroup.controls['Item_wanted_date'].reset();
          this.formGroup.controls['department'].reset();
          this.formGroup.controls['request_no'].reset(); */


          if(this.datatable==null){
            this.createTable();
          }else{
            this.reloadTable();
          }

       },
       (error) => {
           console.log(error)
       }
     );

    }



  }

  /* reloadTable() {//reload datatable
    this.datatable.ajax.reload(null, false);
  } */


  delete(id) { //deactivate payment
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected General MRN?'
    },(result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'stores/generalpr_details/' + id)
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



  loadCompanies(){
    this.mainLocationList$ = this.http.get<any[]>(this.apiUrl + 'org/locations?active=1&fields=loc_id,loc_name')
    .pipe( map(res => res['data']) )
  }

  getDepartments(){
    this.departments$ = this.http.get<any[]>(this.apiUrl + 'org/departments?active=1&fields=dep_id,dep_name')
    .pipe( map(res => res['data']) )
  }

  onClickMe(){

   let req_qty= this.formGroup_details.controls['req_qty'].value;
   let unit_value= this.formGroup_details.controls['unit_value'].value;

    if(req_qty>=0){
        this.formGroup_details.patchValue({total_value:req_qty*unit_value});
    }else{
      this.formGroup_details.patchValue({total_value:'0'});
    }

    if(unit_value>=0){
      this.formGroup_details.patchValue({total_value:req_qty*unit_value});
  }else{
    this.formGroup_details.patchValue({total_value:'0'});
  }

  }

  main_category(){
    this.main_category$ = this.http.get<any[]>(this.apiUrl + 'finance/mat_main?active=1&fields=category_id,category_name')
    .pipe( map(res => res['data']) )
  }

  sub_category(){
    this.sub_category$ = this.http.get<any[]>(this.apiUrl + 'finance/mat_sub?active=1&fields=category_id,category_code,category_name')
    .pipe( map(res => res['data']) );
  }

  sub_category_uom(id){
    //alert(sub_code);
    this.http.get<any[]>(this.apiUrl + 'finance/get_mat_sub/' + id)
          .subscribe(
            (data) => {
              //console.log(data['uom']);
              this.formGroup_details.patchValue({uom:data[0].uom})
            },
            (error) => {
              console.log(error)
            }
        )
  }

  load_sub_category(id){
    //alert(sub_code);
    this.http.get<any[]>(this.apiUrl + 'finance/load_mat_sub?type=load_sub_category&id='+id)
          .subscribe(
            (data) => {

              // this.load_sub_category$ = data;
              /* console.log(data['uom']);
              this.formGroup_details.patchValue({uom:data[0].uom}) */
            },
            (error) => {
              console.log(error)
            }
        )
  }


  // showEvent(event){ //show event of the bs model
  //   let req_no= $("#request_no").val();
  //
  //   if(req_no!==''){
  //     this.formGroup.get('sourceModel').enable()
  //     this.formGroup.reset();
  //     this.popupHeaderTitle = "New Source"
  //     this.saveStatus = 'SAVE'
  //     this.reloadTable()
  //   }else{
  //       AppAlert.showError({
  //     'text' : 'Save Header First'
  //     }
  //
  //     //this.sourceModel.hide()
  //     //return false;
  //     //location.reload()
  //   }
  //
  // }

showEvent(event){
}

saveCluster(){

}


  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }



}
