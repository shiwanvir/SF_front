import { FormGroup } from '@angular/forms';

interface RemoteConfig{ //structure to pass data remote validation method
  url : '',
  data : {}
}

export class AppValidation
{
    defaultMessages = {
      required : 'Field required',
      minlength : 'Value lese than minimum length',
      maxlength : 'Value grater than maximum length',
      asyncValidator : 'custom validation'
    }
    customMessages = {}

    fields = {}

    formGroup:FormGroup

    constructor(_fields:{},_customMessages:{} , _form:any){
      this.fields = _fields;
      this.customMessages = _customMessages;
      this.formGroup = _form;
    }

    validate()
    {
      for(let field in this.fields){
        this.fields[field] = '';
        let input = this.formGroup.get(field);
        if(input.invalid && (input.dirty || input.touched)){
          for(let error in input.errors){
            //console.log(field);
            this.fields[field] = (this.customMessages[field] != undefined && this.customMessages[field][error] != undefined) ? this.customMessages[field][error] : this.defaultMessages[error];
            //console.log(this.fields);
            break;
          }
        }
      }
    }

}
