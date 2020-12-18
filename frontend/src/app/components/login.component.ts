import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';

import { Login } from '../share.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  errorMessage = ''
  loginForm: FormGroup

	constructor(private fb: FormBuilder, private authenticateSvc: AuthenticationService, private router: Router) { }

	ngOnInit(): void { 
    this.loginForm = this.fb.group({
      title: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  login(){
    const loginDetails: Login = {
      userName: this.loginForm.get('title').value.trim().toLowerCase(),
      password: this.loginForm.get('password').value
    }
    this.authenticateSvc.authentication(loginDetails)
      .then(r => {
        console.info(r)
        this.router.navigate(['/main'])
      })
      .catch(err => {
        console.error(err.error.errorMessage)
        this.errorMessage = err.error.errorMessage
      })
  }
}
