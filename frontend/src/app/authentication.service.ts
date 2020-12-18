import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Login } from "./share.model";

@Injectable()
export class AuthenticationService{

    userName: string = null
    password: string = null

    constructor(private http: HttpClient){}
    authentication(loginDetails: Login): Promise<any>{
        return this.http.post('/authentication', loginDetails)
            .toPromise()
            .then(() => {
                this.userName = loginDetails.userName
                this.password = loginDetails.password
                console.info('user: ', this.userName)
            })
    }

    getUser () {
        return this.userName
    }

    getPw () {
        return this.password
    }
}