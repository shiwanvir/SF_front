import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-error-not-authorize',
  templateUrl: './error-not-authorize.component.html',
  styleUrls: ['./error-not-authorize.component.css']
})
export class ErrorNotAuthorizeComponent implements OnInit {
    router_link="home/dashboard"
  constructor() { }

  ngOnInit() {
  }

}
