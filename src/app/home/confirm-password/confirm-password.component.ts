import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

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
  selector: 'app-confirm-password',
  templateUrl: './confirm-password.component.html',
  //styleUrls: ['./confirm-password.component.css']
})

export class ConfirmPasswordComponent implements OnInit {

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'

  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false
  token: string;
  //to manage form error messages
  formFields = {
    password : '',
    re_password : ''
  }

  constructor(private route: ActivatedRoute, private router: Router, private fb:FormBuilder , private http:HttpClient, private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      this.token = params.get('token');
    });

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      password:  [null, [Validators.required,Validators.pattern(/^(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/)]],
      re_password: [null, [Validators.required,Validators.pattern(/^(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/)]]
    })

    this.formValidator = new AppFormValidator(this.formGroup , {});
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.confirmLink()

  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

  resetAccount(){

    let formData = this.formGroup.getRawValue();
    if(formData['password']==formData['re_password']){

      this.processing = true
      AppAlert.showMessage('Processing...','Please wait while sending mail')
      this.http.post(this.apiUrl + 'auth/save_new_password',{'data':this.formGroup.getRawValue(), 'token': this.token }).subscribe(data => {
        this.processing = false
        AppAlert.closeAlert()
        if(data['data']['status'] == 'success'){
          AppAlert.showSuccess({text: data['data']['message']});
          this.formGroup.reset();

          setTimeout(() => {
            this.router.navigate(['/login'])
          }, 2000)

        }
        else{
          AppAlert.showError({text:data['data']['message']});
        }
      })

    }else{
      AppAlert.showError({text:"Passwod not match"})
    }

  }

  confirmLink(){
    this.http.post(this.apiUrl + 'auth/confirm_link',{'token': this.token }).subscribe(data => {
      if(data['count']==0){
        AppAlert.showError({text:"That link has already expired or is incorrect!"});
        this.formGroup.get('password').disable()
        this.formGroup.get('re_password').disable()
        this.processing=true
      }
    })
  }

}
