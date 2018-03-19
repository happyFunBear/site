import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  content: any;
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params.year && params.chapter) {
        this.http.get(`/files/y${params.year}c${params.chapter}.html`, { responseType: 'text'})
          .subscribe((data: string) => { this.content = data; });
        // Observable.of()
      }
    });
  }

}
