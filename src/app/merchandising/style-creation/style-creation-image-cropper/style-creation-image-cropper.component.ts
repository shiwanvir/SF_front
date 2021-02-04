import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';
import { ImageCroppedEvent } from 'ngx-image-cropper';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HotTableRegisterer } from '@handsontable/angular';

import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { StyleCreationService } from '../style-creation.service';
import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { ProductSilhouette } from '../../models/ProductSilhouette.model';
import { ProductType } from '../../models/ProductType.model';

@Component({
  selector: 'app-style-creation-image-cropper',
  templateUrl: './style-creation-image-cropper.component.html',
  styleUrls: ['./style-creation-image-cropper.component.css']
})
export class StyleCreationImageCropperComponent implements OnInit {
  @ViewChild(ModalDirective) splitModel: ModalDirective;
  modelTitle = 'Image Cropper'
  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop}
  formGroup : FormGroup
  imageChangedEvent: any = '';
  croppedImage: any = '';



  constructor(private styleCreationService : StyleCreationService,
    private fb : FormBuilder , private http:HttpClient ,
    private hotRegisterer: HotTableRegisterer,
    private snotifyService: SnotifyService)
  { }

  ngOnInit() {

    this.styleCreationService.popUpCrop.subscribe(data => {
    if(data != null){
      this.imageChangedEvent = ''
      this.croppedImage = ''
      this.splitModel.show()
    }
    })
  }

  modelShowEvent(e)
  {

  }

  Model_hide()
  {
    this.splitModel.hide()
  }

  fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }
  imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
    }
  imageLoaded() {
        // show cropper
    }
  cropperReady() {
        // cropper ready
    }
  loadImageFailed() {
        // show message
    }

}
