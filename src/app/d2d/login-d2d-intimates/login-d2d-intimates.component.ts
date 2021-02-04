import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/service/auth.service';
import { AppConfig } from '../../core/app-config';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';

@Component({
  selector: 'app-login-d2d-intimates',
  templateUrl: './login-d2d-intimates.component.html',
  styleUrls: ['./login-d2d-intimates.component.css']
})
export class LoginD2dIntimatesComponent implements OnInit {

  readonly apiUrl = AppConfig.apiUrl()
  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}

  constructor(private authService:AuthService, private http:HttpClient, private snotifyService: SnotifyService) { }

  ngOnInit() {

    this.loadD2d()

  }

  loadD2d(){

    var str_un = this.authService.getUserData().d2d_epf

    this.http.post(this.apiUrl + 'd2d/load_d2d_user' ,{ 'epf' : str_un })
    .subscribe(data => {
      if(data['data']['load_list']['length'] !=0){
        var user_name = data['data']['load_list'][0]['uname']
        var password = data['data']['load_list'][0]['password']
        var url = 'http://172.17.10.61/surface_auto_login.php?un='+user_name+'&pd='+password+'';
        window.open(url, '_blank');
      }else{
        this.snotifyService.error('Not connected to D2D yet.Please contact MIS/IT Team..!', this.tosterConfig)
      }

      },
     error => {


     })


  }

}
