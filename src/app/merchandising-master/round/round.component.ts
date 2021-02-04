import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class RoundComponent implements OnInit {

  formGroup : FormGroup
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'

  //to manage form error messages
  formFields = {
    round_id : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Round")//set page title

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'merchandising/rounds/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'round_id',
      /*error : 'Dep code already exists',*/
      data : {
        round_id : function(controls){ return controls['round_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      round_id : [0 , [Validators.required]]
    })

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    if(this.permissionService.hasDefined('ROUND_MANAGE')){
      this.createTable() //load data list
    }


  }

  ngOnDestroy(){
      this.datatable = null
  }

  createTable() { //initialize datatable
     this.datatable = $('#round_tbl').DataTable({
       autoWidth: true,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "merchandising/rounds?type=datatable"
        },
        columns: [
            {
              data: "round_id",
              orderable: false,

           }
       ],
     });
   }

     reloadTable() {//reload datatable
         this.datatable.ajax.reload(null, false);
     }

     //save and update source details
     saveRound(){
       //this.appValidation.validate();
       let saveOrUpdate$ = null;
       let roundId = this.formGroup.get('round_id').value
       if(this.saveStatus == 'SAVE'){
         saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/rounds', this.formGroup.getRawValue())
       }

       saveOrUpdate$.subscribe(
         (res) => {
           AppAlert.showSuccess({text : res.data.message })
           // this.formGroup.reset();
           this.reloadTable()
        },
        (error) => {
            console.log(error)
        }
      );
     }

     formValidate(){ //validate the form on input blur event
       this.appValidator.validate();
     }

}
