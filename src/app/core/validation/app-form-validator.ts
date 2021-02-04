import { FormGroup } from '@angular/forms';

export class AppFormValidator
{
    defaultMessages = {
      required : 'Field required',
      email:'Incorrect email',
      minlength : 'Value less than minimum length',
      maxlength : 'Value greater than maximum length',
      min : 'value is less than minimum value',
      max : 'value is grater than max value',
      asyncValidator : 'custom validation',
      numberRequired : 'Incorrect number',//primary validator
      noSpecialCharactor : 'Incorrect character',//primary validator
      isCurrency : 'Incorrect currency value',//primary validator
      bsDate : 'Incorrect date', //ngx-bootstrap date picker plugin - pre defiened error,
      IncorrectColorCode:'Incorrect Color Code',
      incorrectValue : 'Incorrect value',
      isInteger : 'Incorrect value',
      IncorrectRollNumber:'Incorrect Roll Number',
      IncorrectRollQty:'Incorrect Roll Qty',
      InCorrectDeliveryLoaction:'Incorrect Delivery Location',
      pattern : 'Incorrect Data',
      noWhitespaceRequired:"Invalid Code"
    }
    customMessages = {}

    formGroup:FormGroup

    initialized = false

    constructor( _form:any , _customMessages:{}){

      this.customMessages = _customMessages;
      this.formGroup = _form;

      for(let control in this.formGroup.controls){
        if(this.formGroup.controls[control]['errors'] != null || this.formGroup.controls[control]['asyncValidator'] != null){
        }
      }
    }


    validate_field(control){
      let input = this.formGroup.get(control);
      if(input.touched || input.dirty){
        let err = '';
        for(let error in input.errors){
          err = (this.customMessages[control] != undefined && this.customMessages[control][error] != undefined) ? this.customMessages[control][error] : this.defaultMessages[error];
          break;
        }
        return err;
      }
      return '';
    }


    validate(){
      for(let field in this.formGroup.controls){
      this.formGroup.controls[field].markAsTouched()
      }
      return !this.formGroup.invalid
    }

}
