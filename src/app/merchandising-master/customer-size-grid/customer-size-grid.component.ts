import { Component, OnInit,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { NgOption } from '@ng-select/ng-select';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
//models
import { customer } from '../../merchandising/models/customer.model';
import { Silhouette } from '../../org/models/silhouette.model';
import { Size } from '../../org2/models/size.model';
import { LayoutChangerService } from '../../core/service/layout-changer.service';




@Component({
  selector: 'app-customer-size-grid',
  templateUrl: './customer-size-grid.component.html',
  styleUrls: ['./customer-size-grid.component.css']
})
export class CustomerSizeGridComponent implements OnInit {


  formGroup : FormGroup
  modelTitle : string = "New Transaction"
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  saveStatus = 'SAVE'
  appValidator : AppValidator
  formValidator : AppFormValidator = null

  customer$: Observable<customer[]>;//use to load customer list in ng-select
  customerLoading = false;
  customerInput$ = new Subject<string>();
  selectedCustomer: customer[]

  silhouette$:Observable<Silhouette[]>;//use tp load customer list in ng-select
  silhouetteLoading=false;
  silhouetteInput$ =new Subject<string>();
  selectedSilhouette:Silhouette[]

  size$:Observable<Size[]>;//use to load size list in ng-select
  sizeLoading=false;
  sizeInput$=new Subject<string>();
  selectedSize:Size[];

  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false


    //to manage form error messages
    formFields={

    customer_name : '',
    product_silhouette_description :'',
    size_name :'',
    validation_error :''

  }

  constructor(private http:HttpClient , private fb:FormBuilder, private titleService: Title,private layoutChangerService : LayoutChangerService)  {


  }

  ngOnInit() {
    this.titleService.setTitle("Customer Size Grid")//set page title

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

   let remoteValidationConfig = { //configuration for location code remote validation
  url:this.apiUrl + 'org/customerSizeGrids/validate?for=duplicate',
  formFields : this.formFields,
  fieldCode : 'validation_error',
  data : {
    id : function(controls){ return controls['id']['value'] },
    customer_name: function(controls){ if(controls['customer_name']['value']!=null){return (controls['customer_name']['value']['customer_id'])}
    else
    return null;
  },
    product_silhouette_description: function(controls){if(controls['product_silhouette_description']['value']!=null){ return controls['product_silhouette_description']['value']['product_silhouette_id']}
  else
  return null;
},
    size_name : function(controls){ if(controls['size_name']['value']!=null){return controls['size_name']['value']['size_id']}
    else
    return null;
  }
  }
}



  let basicValidator = new BasicValidators(this.http)//create object of basic validation class

        this.formGroup = this.fb.group({
            id :0,
            customer_name : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
            product_silhouette_description : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
            size_name : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
        })
           this.formValidator = new AppFormValidator(this.formGroup , {});
        //create new validation object
        this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

        this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
          this.appValidator.validate();
        })
        this.createTable()
        this.loadCustomer()
        this.loadSilhouette()
        this.loadSize()

        //change header nevigation pagePath
        this.layoutChangerService.changeHeaderPath([
          'Product Development',
          'Master Data',
          'Customer Size Grid'
        ])


  }


  ngOnDestroy(){
      this.datatable = null
  }


  createTable() { //initialize datatable
     this.datatable = $('#customer-size-grid-table').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       order:[[0,'desc']],
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "org/customerSizeGrids?type=datatable"
        },
        columns: [
            {
              data: "id",
              orderable: false,
              width: '3%',
              render : function(data,arg,full){
                var str = '';
                //var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                 str = '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
                if( full.status== 0 ) {
                str = '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;cursor:not-allowed" data-action="DISABLE"></i>';
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
           { data: "customer_name" },
           { data: "product_silhouette_description" },
           { data: "size_name" }


       ],
     });

     //listen to the click event of edit and delete buttons
     $('#customer-size-grid-table').on('click','i',e => {
        let att = e.target.attributes;
        /*if(att['data-action']['value'] === 'EDIT'){
          this.edit(att['data-id']['value']);
        }*/
         if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value']);
        }
     });
    }


    reloadTable() {//reload datatable
        this.datatable.ajax.reload(null, false);
    }

    //save and update source details
    saveTm(){
      //this.appValidation.validate();

      if(!this.formValidator.validate())//if validation faild return from the function
        return;
      this.processing = true
      AppAlert.showMessage('Processing...','Please wait while saving details')
      let saveOrUpdate$ = null;
      let Id = this.formGroup.get('id').value
      let formData = this.formGroup.getRawValue();

      formData['customer_id'] = formData['customer_name']['customer_id']
      formData['product_silhouette_id'] = formData['product_silhouette_description']['product_silhouette_id']
      formData['size_id'] = formData['size_name']['size_id']

      if(this.saveStatus == 'SAVE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'org/customerSizeGrids', formData)
      }
      else if(this.saveStatus == 'UPDATE'){
        saveOrUpdate$ = this.http.put(this.apiUrl + 'org/customerSizeGrids/' + Id , formData)
      }




      saveOrUpdate$.subscribe(
        (res) => {
        //  AppAlert.showSuccess({text : res.data.message })
          this.processing=false;
          this.formGroup.reset();
          this.reloadTable()
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({text : res.data.message })
          } , 500)
          //this.transactionModel.hide()
       },
       (error) => {
         this.processing = false
         AppAlert.closeAlert()
         AppAlert.showSuccess({text : 'Process Error' })
         console.log(error)
       }
     );
    }



//show event
  /*showEvent(event){ //show event of the bs model
    this.formGroup.get('trans_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Transaction"
    this.saveStatus = 'SAVE'
  }*/

  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected transaction?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/customerSizeGrids/' + id)
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

  //load country list
  loadCustomer() {
       this.customer$ = this.customerInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.customerLoading = true),
          switchMap(term => this.http.get<customer[]>(this.apiUrl + 'org/customers?type=auto' , {params:{search:term}})
          .pipe(
              //catchError(() => of([])), // empty list on error
              tap(() => this.customerLoading = false)
          ))
       );
   }

   //load silhouette list
   loadSilhouette() {
        this.silhouette$ = this.silhouetteInput$
        .pipe(
           debounceTime(200),
           distinctUntilChanged(),
           tap(() => this.silhouetteLoading = true),
           switchMap(term => this.http.get<Silhouette[]>(this.apiUrl + 'org/silhouettes?type=auto' , {params:{search:term}})
           .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.silhouetteLoading = false)
           ))
        );
    }

    //load size list
    loadSize() {
         this.size$ = this.sizeInput$
         .pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.sizeLoading = true),
            switchMap(term => this.http.get<Size[]>(this.apiUrl + 'org/sizes?type=auto' , {params:{search:term}})
            .pipe(
                //catchError(() => of([])), // empty list on error
                tap(() => this.sizeLoading = false)
            ))
         );
     }

     formValidate(){ //validate the form on input blur event
       this.appValidator.validate();
     }



}
