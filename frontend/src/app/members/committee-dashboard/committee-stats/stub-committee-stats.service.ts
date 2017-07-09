import {Observable} from 'rxjs/Observable';
import {CommitteeStatsService} from './committee-stats.service';
import {Subject} from 'rxjs/Subject';

export class StubCommitteeStatsService extends CommitteeStatsService {

  constructor() {
    super(null, null, null);
  }

  numReceived: Subject<number> = new Subject<number>();

  getNumReceivedMessages(): Observable<number> {
    return this.numReceived;
  }

}
