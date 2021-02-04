import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime } from 'rxjs/operators';

import { Util } from './util';

interface RemoteConfig {//data structure for remote validation method
  url:string,
  /*formFields:Object,*/
  fieldCode?:string,
  error?:string,
  data?:Object
}

export class PrimaryValidators {

  debouncer: any;//use to clear time out feature in remote validation

  constructor(private http:HttpClient){ }

  //chek below link for more details
  //https://www.joshmorony.com/username-availability-with-an-asynchronous-validator-in-angular/
  //https://stackoverflow.com/questions/36919011/how-to-add-debounce-time-to-an-async-validator-in-angular-2
  public remote(config:RemoteConfig) : ValidatorFn {
    const validator = (control: AbstractControl): { [key: string]: any } => {
      clearTimeout(this.debouncer);//clear previous timeout function
      if (Util.isNotPresent(control)) return undefined;
      //generate ata to passed with request
      let remoteData:{} = (config.data == undefined || config.data == null) ? {} : Object.assign({}, config.data);
      for(var key in remoteData){
        if (typeof remoteData[key] == 'function'){
          //  console.log(control.parent.controls);
          remoteData[key] = remoteData[key](control.parent.controls)

        }
      }
      //add fiels value
      if(config.fieldCode != undefined)
      remoteData[config.fieldCode] = control.value;

      return new Promise((resolve, reject) => {
        this.debouncer = setTimeout(() => {//assign timeout function to debunser variable
          this.http.get(config.url ,{params: remoteData})
          .subscribe(
            data => {
              if(data['status'] == 'error'){
                ///config.formFields[config.fieldCode] = (config.error == undefined) ? data['message'] : config.error;
                let err = (config.error == undefined) ? data['message'] : config.error;
                resolve({'remoteValidation': err });
              }
              else{
                resolve(null);
              }
            },
            error => {
              resolve({'remoteValidation': 'Process Error' });
            });
            //  return {remoteValidation: false};
          }, 1000) //debouncer time is 1 second
        })
      };
      return validator;
    };


    //check for white space
    public static noWhitespace(control: AbstractControl): { [key: string]: boolean } {
      if (Util.isNotPresent(control)) return undefined;
      let pattern = '\\s';
      if (new RegExp(pattern).test(control.value)) {
        return { 'noWhitespaceRequired': true };
      }
      return undefined;
    };

    //only allow for charactors and numbers
    public static noSpecialCharactor(control: AbstractControl): { [key: string]: boolean } {
      if (Util.isNotPresent(control)) return undefined;
      let pattern = /[^\w\s-]/gi;
      if (new RegExp(pattern).test(control.value)) {
        return { 'noSpecialCharactor': true };
      }
      return undefined;
    };

    public static noSpecialCharactor_material(control: AbstractControl): { [key: string]: boolean } {
      if (Util.isNotPresent(control)) return undefined;
      let pattern = /['"]+/g;
      if (new RegExp(pattern).test(control.value)) {
        return { 'noSpecialCharactor': true };
      }
      return undefined;
    };


    //check is a valid currency
    public static isCurrency(control: AbstractControl): { [key: string]: boolean } {
      if (Util.isNotPresent(control)) return undefined;
      let pattern = /(?=.)^\$?(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+)?(\.[0-9]{1,4})?$/;
      if (!new RegExp(pattern).test(control.value)) {
        return { 'isCurrency': true };
      }
      return undefined;
    };


    //check empty field
    public static noEmptyString(control: AbstractControl): { [key: string]: boolean } {
      if (Util.isNotPresent(control)) return undefined;
      if (control.value.trim().length === 0) {
        return { 'noEmptyString': true };
      }
      return undefined;
    };

    //check is a number. work for integer and decimals
    public static isNumber(control: AbstractControl): { [key: string]: boolean } {
      if (Util.isNotPresent(control)) return undefined;
      if (isNaN(control.value)) {
        return { 'numberRequired': true };
      }
      return undefined;
    };

    //check value is in a range
    public static isInRange(minValue: number, maxValue: number): ValidatorFn {
      const validator = (control: AbstractControl): { [key: string]: any } => {
        if (Util.isNotPresent(control)) return undefined;
        if (isNaN(control.value)) {
          return { 'numberRequired': true };
        }
        if (+control.value < minValue) {
          return { 'rangeValueToSmall': { 'requiredMinValue': minValue, 'requiredMaxValue': maxValue, 'actual': control.value } };
        }

        if (+control.value > maxValue) {
          return { 'rangeValueToBig': { 'requiredMinValue': minValue, 'requiredMaxValue': maxValue, 'actual': control.value } };
        } else {
          return undefined;
        }
      };
      return validator;
    };

    public static minLength(minLength: number) {
      const validator = (control: AbstractControl): { [key: string]: any } => {
        if (Util.isNotPresent(control)) return undefined;
        let value: string = control.value;
        if (value.length >= minLength) {
          return undefined;
        }
        return { 'minLength': { 'requiredMinLength': minLength, 'actualLength': value.length } };
      };
      return validator;
    };

    public static maxLength(maxLength: number) {
      const validator = (control: AbstractControl): { [key: string]: any } => {
        if (Util.isNotPresent(control)) return undefined;
        let value: string = control.value;
        if (maxLength >= value.length) {
          return undefined;
        }
        return { 'maxLength': { 'requiredMaxLength': maxLength, 'actualLength': value.length } };
      };
      return validator;
    };

    public static min(min: number) {
      const validator = (control: AbstractControl): { [key: string]: any } => {
        if (Util.isNotPresent(control)) return undefined;
        let value: string = control.value;
        if (isNaN(control.value)) {
          return { 'numberRequired': true };
        }
        if (+value >= min) {
          return undefined;
        }
        return { 'min': { 'required': min, 'actual': control.value } };
      };
      return validator;
    };

    public static max(max: number) {
      const validator = (control: AbstractControl): { [key: string]: any } => {
        if (Util.isNotPresent(control)) return undefined;
        let value: string = control.value;
        if (isNaN(control.value)) {
          return { 'numberRequired': true };
        }
        if (max >= +value) {
          return undefined;
        }
        return { 'max': { 'required': max, 'actual': control.value } };
      };
      return validator;
    };


    //check number decimal places
    public static maxDecimalLength(maxLength: number): ValidatorFn {
      const validator = (control: AbstractControl): { [key: string]: any } => {
        if (Util.isNotPresent(control)) return undefined;
        let pattern = null
        switch(maxLength){
          case 0 :
          pattern = new RegExp(/^\s*-?\d+(\.\d{0,0})?\s*$/)
          break
          case 1 :
          pattern = new RegExp(/^\s*-?\d+(\.\d{0,1})?\s*$/)
          break
          case 2 :
          pattern = new RegExp(/^\s*-?\d+(\.\d{0,2})?\s*$/)
          break
          case 3 :
          pattern = new RegExp(/^\s*-?\d+(\.\d{0,3})?\s*$/)
          break
          case 4 :
          pattern = new RegExp(/^\s*-?\d+(\.\d{0,4})?\s*$/)
          break
          default :
          pattern = new RegExp(/^\s*-?\d+(\.\d{0,2})?\s*$/)
          break
        }

        if (!pattern.test(control.value)) {
          return { 'incorrectValue': true };
        }
        return undefined;
      };
      return validator;
    };


    //check is a valid integer
    public static isInteger(control: AbstractControl): { [key: string]: boolean } {
      if (Util.isNotPresent(control)) return undefined;
      let pattern = /^[0-9]+$/;
      if (!new RegExp(pattern).test(control.value)) {
        return { 'isInteger': true };
      }
      return undefined;
    };

  }
