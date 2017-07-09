import {Headers, Http, HttpModule, RequestOptions, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {ErrorObservable} from 'rxjs/observable/ErrorObservable';
import {environment} from '../../../environments/environment';
import {BaseService} from './base.service';
import {async, inject, TestBed} from '@angular/core/testing';
import {JwtService} from '../login/jwt.service';
import {StubJwtService} from '../login/jwt.service.stub';

describe('Members: base service', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        {provide: JwtService, useValue: new StubJwtService('12345', true)}
      ]
    }).compileComponents();
  }));

  it('sends a get request with the correct options', inject([Http, JwtService], (http: Http, jwtService: JwtService) => {
    const appVersion = Math.random().toString();

    class MyService extends BaseService {
      constructor() {
        super(http, jwtService, appVersion);
      }

      get(url: string): Observable<Response> {
        return super.get(url);
      }
    }

    const service = new MyService();

    // TODO: Spy on HTTP method and return dummy value and verify sent data
    // TODO: Spy on JWT service

    service.get('https://www.example.com/new-pics');
  }));

  it('sends a post request with the correct JSON body & options', () => {

  });

  it('clears the JWT if the request fails with a 401 error code', () => {

  });

  it('deserialises JSON correctly', () => {

  });

});
