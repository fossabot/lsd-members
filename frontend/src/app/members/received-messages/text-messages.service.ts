import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {JwtService} from '../login/jwt.service';
import {Observable} from 'rxjs/Observable';
import {TextMessage} from './text-message';
import {environment} from '../../../environments/environment';

export abstract class TextMessagesService {

  abstract getReceivedMessages(): Observable<TextMessage[]>

}

@Injectable()
export class TextMessagesServiceImpl extends TextMessagesService {

  private getReceivedUrl: string = environment.apiUrl + '/api/v1/text-messages/received';

  constructor(private http: Http, private jwtService: JwtService) {
    super();
  }

  getReceivedMessages(): Observable<TextMessage[]> {
    const headers = new Headers({'X-JWT': this.jwtService.getJwt()});

    return this.http.get(this.getReceivedUrl, {headers})
      .map(r => r.json() as TextMessage[]);
  }

}
