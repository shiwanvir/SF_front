import { Component, OnInit, ViewChild , AfterViewInit} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';

import {CancellationCategoryComponent } from "./cancellation-category.component";
import {CancellationReasonComponent }from "./cancellation-reason.component";

import { PermissionsService } from '../../core/service/permissions.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-cancellation',
  templateUrl: './cancellation.component.html',
  styleUrls: []
})
export class CancellationComponent implements OnInit {

  @ViewChild('cancellationTabs') cancellationTabs: TabsetComponent;
  @ViewChild(CancellationCategoryComponent) childCancellationCategory: CancellationCategoryComponent;
  @ViewChild(CancellationReasonComponent) childCancellationReason: CancellationReasonComponent;

  pageHeader:string = ''

  constructor(private router: ActivatedRoute, private permissionService:PermissionsService,
    private layoutChangerService : LayoutChangerService, private titleService: Title) { }


      ngOnInit() {
        this.router.data
        .subscribe(res => {

            let pathArr = ['Catalogue', 'Application Basic Setup']

            if(res.tabName == 'CANCELLATIONCATEGORY'){
              this.cancellationTabs.tabs[0].active = true;
              this.pageHeader = 'Cancellation Category';
              this.titleService.setTitle("Cancellation Category")//set page title
              pathArr.push('Cancellation Category')
              //check user permission
              if(this.permissionService.hasDefined('CANCEL_CAT_MANAGE')){
                this.childCancellationCategory.createTable()
              }
            }
            else if(res.tabName == 'CANCELLATIONREASON'){
              this.cancellationTabs.tabs[1].active = true;
              this.pageHeader = 'Cancellation Reason';
              this.titleService.setTitle("Cancellation Reason")//set page title
              pathArr.push('Cancellation Reason')
              //check user permissions
              if(this.permissionService.hasDefined('CANCEL_REASON_MANAGE')){
                this.childCancellationReason.createTable()
                  this.childCancellationReason.loadCancellationCategoryList()
                //this.router.navigateByUrl('/CancellationReasonComponent', {skipLocationChange: true}).then(()=>
                //this.router.navigate(["CancellationReasonComponent"]));
              }
            }

            //change header nevigation pagePath
            this.layoutChangerService.changeHeaderPath(pathArr)

        });
      }
      ngAfterViewInit(){

      }

      onSelect(data: TabDirective): void {
        if(data.heading == 'Cancellation Category'){
            this.childCancellationCategory.reloadTable()
        }
        if(data.heading == 'Cancellation Reason'){
            this.childCancellationReason.reloadTable()
        }

        let pathArr = ['Catalogue', 'Application Basic Setup']

        switch(data.heading){
          case 'Cancellation Category' :

            this.titleService.setTitle("Cancellation Category")//set page title
            pathArr.push('Cancellation Category')
            this.pageHeader = 'Cancellation Category';
            if(this.childCancellationCategory.datatable == null){
              if(this.permissionService.hasDefined('CANCEL_CAT_MANAGE')){
                this.childCancellationCategory.createTable()
              }
            }
            break;
          case 'Cancellation Reason' :

              this.titleService.setTitle("Cancellation Reason")//set page title
              pathArr.push('Cancellation Reason')
              this.pageHeader = 'Cancellation Reason';
              this.childCancellationReason.loadCancellationCategoryList()
            if(this.childCancellationReason.datatable == null){
              if(this.permissionService.hasDefined('CANCEL_REASON_MANAGE')){

                this.childCancellationReason.createTable()
                  //this.childCancellationReason.reload()
                //this.router.navigateByUrl('/CancellationReasonComponent', {skipLocationChange: true}).then(()=>
                //this.router.navigate(["CancellationReasonComponent"]));
              }
            }
            break;
        }

        //change header nevigation pagePath
        this.layoutChangerService.changeHeaderPath(pathArr)
      }

}
