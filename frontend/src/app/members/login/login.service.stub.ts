import {Observable} from 'rxjs/Observable';

import {JwtLoginService} from './login.service';
import {LoginResult} from './login-result';

export class JwtLoginServiceStub extends JwtLoginService {

  constructor() {
    super(null);
  }

  login(signedFbRequest: String): Observable<LoginResult> {
    return Observable.of(new LoginResult(true, null, 'jwt.1.23'));
  }

}
