import { FormGroup } from '@angular/forms';

interface RemoteConfig{ //structure to pass data remote validation method
  url : '',
  data : {}
}

export class AppFormValidator3
{
    defaultMessages = {
      required : 'Field required',
      minlength : 'Value lese than minimum length',
      maxlength : 'Value grater than maximum length',
      asyncValidator : 'custom validation'
    }
    customMessages = {}

    //fields = {}

    formGroup:FormGroup

    errorMessages = {}

    initialized = false
    /*constructor(_fields:{},_customMessages:{} , _form:any){
      this.fields = _fields;
      this.customMessages = _customMessages;
      this.formGroup = _form;
    }*/

    clearErrorMessages(){
      for(let em in this.errorMessages){
        this.errorMessages[em] = ''
      }
    }

    constructor(/*_fields:{},*/_customMessages:{} , _form:any){
    //  this.fields = _fields;
      this.customMessages = _customMessages;
      this.formGroup = _form;


      for(let control in this.formGroup.controls){
        if(this.formGroup.controls[control]['errors'] != null || this.formGroup.controls[control]['asyncValidator'] != null){
          this.errorMessages[control] = ''
        }

        /*if(this.formGroup.get(control) != null){
          this.formGroup.get(control).statusChanges.subscribe(data => { //validate form when form value changes
            if(this.formGroup.get(control).touched == true){
              this.validate_field(control)
          }
            console.log(data)
          })
        }*/

      }



    /*  this.formGroup.statusChanges.subscribe(data => { //validate form when form value changes
        //this.appValidator.validate();
        console.log(data)
      })*/

    //  debugger
      console.log(this.formGroup)
    }



    validate_field(control){

      let input = this.formGroup.get(control);
      if(input.touched){
        let err = '';
        /*if(input.errors != null && input.errors.length > 0){
          err = this.defaultMessages[input.errors[0]];
        }*/

        for(let error in input.errors){
          //this.errorMessages[control] =
          err= (this.customMessages[control] != undefined && this.customMessages[control][error] != undefined) ? this.customMessages[control][error] : this.defaultMessages[error];
          break;
        }
        return err;
      }
      return '';
    }

    /*validate()
    {

      for(let field in this.fields){
        this.fields[field] = '';
        let input = this.formGroup.get(field);
        if(input != null && input.invalid && (input.dirty || input.touched)){
          for(let error in input.errors){
            //console.log(field);
            this.fields[field] = (this.customMessages[field] != undefined && this.customMessages[field][error] != undefined) ? this.customMessages[field][error] : this.defaultMessages[error];
            //console.log(this.fields);
            break;
          }
        }
      }
    }*/


    validate(){
      for(let field in this.errorMessages){
        this.errorMessages[field] = '';
        let input = this.formGroup.get(field);
      //  if(input != null && input.invalid /*&& (input.dirty || input.touched)*/){
          for(let error in input.errors){
            //console.log(field);
            input.markAsTouched()
            this.errorMessages[field] = (this.customMessages[field] != undefined && this.customMessages[field][error] != undefined) ? this.customMessages[field][error] : this.defaultMessages[error];
            //console.log(this.fields);
            break;
          }
        //}
      }
    }

}
