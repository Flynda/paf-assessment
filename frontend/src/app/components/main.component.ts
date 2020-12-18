import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import {CameraService} from '../camera.service';
import { ShareService } from '../share.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

	shareForm: FormGroup
	imagePath = '/assets/cactus.png'

	constructor(private cameraSvc: CameraService, private fb: FormBuilder, private shareSvc: ShareService, private authSvc: AuthenticationService) { }

	ngOnInit(): void {
	  if (this.cameraSvc.hasImage()) {
		  const img = this.cameraSvc.getImage()
		  this.imagePath = img.imageAsDataUrl
		  this.shareForm = this.mkForm(img)
	  } else {
		  this.shareForm = this.mkForm()
	  }
	}

	private mkForm(img?):FormGroup {
		return this.fb.group({
			title: ['', Validators.required],
			comments: ['', Validators.required],
			'share-img': [img, Validators.required]
		})
	}

	clear() {
		this.imagePath = '/assets/cactus.png'
		this.shareForm = this.mkForm()
	}

	share(){
		const shareData = new FormData()
		shareData.set('userName', this.authSvc.getUser())
		shareData.set('password', this.authSvc.getPw())
		shareData.set('title', this.shareForm.get('title').value)
		shareData.set('comments', this.shareForm.get('comments').value)
		shareData.set('share-img', this.cameraSvc.getImage().imageData)
		// console.info(this.imagePath)
		this.shareSvc.upload(shareData)
			.then(r => r)
			.catch(err => console.error(err)
			)
	}
}
