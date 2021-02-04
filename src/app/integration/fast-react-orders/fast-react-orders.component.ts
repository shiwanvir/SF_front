import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../core/app-config';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-fast-react-orders',
  templateUrl: './fast-react-orders.component.html',
  styleUrls: ['./fast-react-orders.component.css']
})
export class FastReactOrdersComponent implements OnInit {

  constructor(private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.layoutChangerService.changeHeaderPath([
      'Integration Services',
      'Fast React',
      'Orders'
    ])
  }

  exportCSV()
  {
        window.open(AppConfig.FROrderEX());
  }

}
