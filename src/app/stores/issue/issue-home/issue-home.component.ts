import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TabsetComponent,TabDirective } from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { IssueService}from'../issue.service';
import{IssueDetilsComponent}from '../issue-detils/issue-detils.component';
import{IssueComponent}from'../issue.component';

@Component({
  selector: 'app-issue-home',
  templateUrl: './issue-home.component.html',
  styleUrls: ['./issue-home.component.css']
})
export class IssueHomeComponent implements OnInit {

  @ViewChild('buyerPoTabs') tabs: TabsetComponent;
  @ViewChild(IssueDetilsComponent) childIssueDetils: IssueDetilsComponent;
  @ViewChild(IssueComponent) chilIssue: IssueComponent;

  constructor(private router: ActivatedRoute, private titleService: Title) { }


  ngOnInit() {
        this.titleService.setTitle("Material Issue")//set page title
  }


    onSelect(data: TabDirective): void {

      let pathArr = [
        'Warehouse Managemnt',
        'Stores'
      ];

      switch(data.heading){
        case 'Material Issue List' :
              if(this.childIssueDetils.datatable == null)
              {
              }
           this.childIssueDetils.reloadTable()

          break;
        case 'Material Issue' :

            this.chilIssue.clearDetails();
          break;


      }



    }

}
