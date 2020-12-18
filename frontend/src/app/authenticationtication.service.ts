import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Login } from "./share.model";

@Injectable()
export class AuthenticationService{
    constructor(private http: HttpClient){}
    authentication(loginDetails: Login): Promise<any>{
        return this.http.post('/authentication', loginDetails)
            .toPromise()
    }
}