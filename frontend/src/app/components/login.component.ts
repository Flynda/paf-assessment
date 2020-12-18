import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../authenticationtication.service';
import { Login } from '../share.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  errorMessage = ''
  loginForm: FormGroup

	constructor(private fb: FormBuilder, private authenticateSvc: AuthenticationService) { }

	ngOnInit(): void { 
    this.loginForm = this.fb.group({
      title: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required])
    })
  }

  login(){
    const loginDetails: Login = {
      userName: this.loginForm.get('title').value.trim().toLowerCase(),
      password: this.loginForm.get('password').value
    }
    this.authenticateSvc.authentication(loginDetails)
      .then(r => r)
      .catch(err => this.errorMessage = err.errorMessage)
  }
}
