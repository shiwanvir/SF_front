import { Injectable } from '@angular/core';

@Injectable()
export class RedirectService {
  constructor() { }
  post(obj,url) {
    var mapForm = document.createElement("form");
    mapForm.target = "_blank";
    mapForm.method = "GET";
    mapForm.action = url;
    Object.keys(obj).forEach(function(param){
      var mapInput = document.createElement("input");
      mapInput.type = "hidden";
      mapInput.name = param;
      mapInput.setAttribute("value", obj[param]);
      mapForm.appendChild(mapInput);
  });
  document.body.appendChild(mapForm);
  mapForm.submit();
  return false;
}

}
