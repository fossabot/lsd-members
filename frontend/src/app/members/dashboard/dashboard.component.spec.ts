import {TestBed, inject} from '@angular/core/testing';
import {Http, Response, ResponseOptions} from '@angular/http';
import {ErrorObservable} from 'rxjs/observable/ErrorObservable';

import {DashboardService, DashboardServiceImpl} from './dashboard.service';
import {APP_VERSION} from '../../app.module';
import {StubJwtService} from '../login/jwt.service.stub';
import {JwtService} from '../login/jwt.service';
import {DashboardComponent} from './dashboard.component';

const failingHttp: any = {
  get() {
    return ErrorObservable.of(new Response(new ResponseOptions({
      status: 500,
      body: 'DOES NOT COMPUTE! DOES NOT COMPUTE!',
      url: 'https://aaaahhhhhhhh.example.com'
    })))
  }
};

describe('DashboardComponent', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: JwtService, useValue: new StubJwtService('341234.12412312.1213', true)},
        {provide: APP_VERSION, useValue: 'version.8888'},
        {provide: Http, useValue: failingHttp},
        {provide: DashboardService, useClass: DashboardServiceImpl}
      ]
    });
  });

  it('shows an error message when getting the dashboard information fails', inject([JwtService, APP_VERSION],
    (jwtService: JwtService, appVersion: string) => {
      const service = new DashboardServiceImpl(failingHttp, jwtService, appVersion);

      const component = new DashboardComponent(service);
      component.ngOnInit();

      expect(component.dashboardLoadFailed).toEqual(true);
    }));

});
