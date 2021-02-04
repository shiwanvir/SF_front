import Swal from 'sweetalert2';

export class AppAlert{

  constructor(){}

  //show success message
  static showSuccess(options,callbackFunction?){

    let defaultConfig = {
      type : 'success',
      title : 'Success',
      text : 'Success',
      confirmButtonColor: "#66BB6A"
    }
    //merge default  options with custom options
    const config = Object.assign(defaultConfig, options);
    Swal(config)
    .then((result) => {
      if(callbackFunction != undefined){
        callbackFunction(result)
      }
    })
  }

  //show error message
  static showError(options,callbackFunction?){

    let defaultConfig = {
      type : 'error',
      title : 'Error',
      text : 'Error',
      confirmButtonColor: "#d33"
    }
    //merge default  options with custom options
    const config = Object.assign(defaultConfig, options);
    Swal(config)
    .then((result) => {
      if(callbackFunction != undefined){
        callbackFunction(result)
      }
    })
  }


  static showConfirm(options , callbackFunction?) {
    let defaultOptions = {
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'info',
        showCancelButton: true,
        confirmButtonColor: '#26A69A',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Continue'
    }
    const config = Object.assign(defaultOptions, options);

    Swal(config)
    .then((result) => {
      if(callbackFunction != undefined){
        callbackFunction(result)
      }
    })
  }

  static showWarning(options , callbackFunction?) {
    let defaultOptions = {
        title: 'Are you sure?',
        text: "",
        type: 'warning',
        showCancelButton: false,
        cancelButtonColor: '#d33',
    }
    const config = Object.assign(defaultOptions, options);

    Swal(config)
    .then((result) => {
      if(callbackFunction != undefined){
        callbackFunction(result)
      }
    })
  }

  static showThreeButtons(options , callbackFunction?) {
    let defaultOptions = {
      title: 'Do you want to creat?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: `NEW`,
      denyButtonText: `HOLIDAY`,
    }
    const config = Object.assign(defaultOptions, options);

    Swal(config)
    .then((result) => {
      if(callbackFunction != undefined){
        callbackFunction(result)
      }
    })
  }


  static showInput(options , callbackFunction?) {
    let defaultOptions = {
        title: '',
        text: "",
        input: 'number',
        confirmButtonColor: '#26A69A',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        inputValidator: (value) => {
          if (!value || isNaN(value)) {
            return 'You need to enter valid BOM ID'
          }
        }
    }
    const config = Object.assign(defaultOptions, options);

    Swal(config)
    .then((result) => {
      if(callbackFunction != undefined){
        callbackFunction(result)
      }
    })
  }


  static showMessage(_title , _message){
    Swal({
      title: _title,
      text: _message,
      showConfirmButton : false,
      allowOutsideClick: false,
      allowEscapeKey : false
    });
  }

  static closeAlert(){
    Swal.close()
  }

}
