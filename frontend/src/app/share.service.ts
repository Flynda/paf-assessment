import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class ShareService {
    constructor(private http: HttpClient) {}
    upload(formData: FormData){
        return this.http.post('/share', formData)
            .toPromise()
    }
}