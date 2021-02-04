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
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  //styleUrls: ['./forgot-password.component.css']
})

export class ForgotPasswordComponent implements OnInit {

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Buy"
  readonly apiUrl = AppConfig.apiUrl()
  readonly passwordUrl = AppConfig.passwordUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'

  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  //to manage form error messages
  formFields = {
    email : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient, private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  ngOnInit() {

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'auth/validate_mail?for=active',
      formFields : this.formFields,
      fieldCode : 'email',
      // data : {
      //   user_id : function(controls){ return controls['user_id']['value']}
      // }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      email : [null , [Validators.required,Validators.email],[primaryValidator.remote(remoteValidationConfig)]],
    })

    this.formValidator = new AppFormValidator(this.formGroup , {});
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })


  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

  sendConfirmation(){

    this.processing = true
    this.saveStatus= 'SAVE'
    this.http.post(this.apiUrl + 'auth/send_confirmation',{'data':this.formGroup.getRawValue(),'baseUrl' : this.passwordUrl }).subscribe(data => {
      this.processing = false
      if(data['data']['status'] == 'success'){
        AppAlert.showSuccess({text: data['data']['message']});
        this.formGroup.reset();
      }
      else{
        AppAlert.showError({text:data['data']['message']});
      }
    })

  }



}
