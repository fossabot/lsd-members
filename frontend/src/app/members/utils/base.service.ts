import {Headers, Http, RequestOptions, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {ErrorObservable} from 'rxjs/observable/ErrorObservable';
import {JwtService} from '../login/jwt.service';
import {Inject, Injectable, InjectionToken} from '@angular/core';
import {APP_VERSION} from '../../app.module';

/**
 * Basic methods shared across services.
 */
export class BaseService {

  http: Http;
  jwtService: JwtService;
  appVersion: string;

  constructor(http: Http, jwtService: JwtService, appVersion: string) {
    this.http = http;
    this.jwtService = jwtService;
    this.appVersion = appVersion;
  }

  /**
   * Extract the JSON body of a response.
   *
   * @param res
   * @returns
   */
  protected extractJson<T>(res: Response): T {
    const body = res.json();
    return body || [];
  }

  /**
   * Handle a generic error encountered when performing an AJAX request.
   */
  protected handleError = (response: Response): Response => {
    if (response.status === 401) {
      this.jwtService.setJwt('', false);
    }

    return response;
  };

  /**
   * Build a post request to the given URL with the given data (serialized as JSON).
   *
   * The request is sent with a content type of 'application/json'.
   *
   * @param url
   * @param data
   * @returns {Observable<Response>}
   */
  protected post(url: string, data: any) {
    const body = JSON.stringify(data);

    return this.http.post(url, body, this.makeRequestOptions())
      .map(r => this.handleError(r));
  }

  /**
   * Build a PUT request to the given URL with the given data (serialized as JSON).
   *
   * The request is sent with a content type of 'application/json'.
   *
   * @param url
   * @param data
   * @returns {Observable<Response>}
   */
  protected put(url: string, data: any) {
    const body = JSON.stringify(data);

    return this.http.put(url, body, this.makeRequestOptions())
      .map(r => this.handleError(r));
  }

  /**
   * Send a GET request.
   *
   * @param url
   * @returns {Observable<Response>}
   */
  protected get(url: string) {
    return this.http.get(url, this.makeRequestOptions())
      .map(r => this.handleError(r));
  }

  private makeRequestOptions(): RequestOptions {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-App-Version': this.appVersion,
      'X-JWT': this.jwtService.getJwt()
    });

    return new RequestOptions({headers});
  }

}
