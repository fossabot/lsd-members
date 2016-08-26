import { Injectable } from '@angular/core';
import { Http       } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

import { BaseService   } from '../../utils/base.service';
import { ApiKeyService } from '../../utils/api-key.service';

export class Course {
  uuid: String;
  date: moment.Moment;
  organiserUuid: String;
  secondaryOrganiserUuid: String;
  status: number;

  constructor (uuid: String, date: moment.Moment, organiserUuid: String, secondaryOrganiserUuid: String, status: number) {
    this.uuid = uuid;
    this.date = date;
    this.organiserUuid = organiserUuid;
    this.secondaryOrganiserUuid = secondaryOrganiserUuid;
    this.status = status;
  }
}

export class CourseWithNumSpaces {
  course: Course;
  totalSpaces: number;
  spacesFree: number;

  constructor (course: Course, totalSpaces: number, spacesFree: number) {
    this.course = course;
    this.totalSpaces = totalSpaces;
    this.spacesFree = spacesFree;
  }
}

export class CommitteeMember {
  name: string;
  uuid: string;

  constructor (name: string, uuid: string) {
    this.name = name;
    this.uuid = uuid;
  }
}

export class CourseWithOrganisers {
  course: Course;
  organiser: CommitteeMember;
  secondaryOrganiser: CommitteeMember;

  constructor (course: Course, organiser: CommitteeMember, secondaryOrganiser: CommitteeMember) {
    this.course = course;
    this.organiser = organiser;
    this.secondaryOrganiser = secondaryOrganiser;
  }
}

export class StrippedMember {
  name: string;
  uuid: string;
  createdAt: moment.Moment;

  constructor (name: string, uuid: string, createdAt: moment.Moment) {
    this.name = name;
    this.uuid = uuid;
    this.createdAt = createdAt;
  }
}

export class CourseSpaceWithMember {
  uuid: string;
  courseUuid: string;
  number: number;
  member: StrippedMember;

  constructor(uuid: string, courseUuid: string, number: number, member: StrippedMember) {
    this.uuid = uuid;
    this.courseUuid = courseUuid;
    this.number = number;
    this.member = member;
  }
}

/**
 * Describes a service capable of retrieving course information.
 */
export abstract class CourseService extends BaseService {

  constructor(http: Http, apiKeyService: ApiKeyService) {
    super(http, apiKeyService);
  }

  abstract find(startDate: moment.Moment, endDate: moment.Moment): Observable<CourseWithNumSpaces[]>

  abstract getByUuid(uuid: string): Observable<CourseWithOrganisers>

  abstract spaces(uuid: string): Observable<CourseSpaceWithMember[]>

}

/**
 * A CourseService backed by the REST API.
 */
@Injectable()
export class CourseServiceImpl extends CourseService {

  private coursesFindUrl = 'http://localhost:8080/api/v1/courses';
  private coursesGetUrl = 'http://localhost:8080/api/v1/courses/{{uuid}}';
  private courseSpacesUrl = 'http://localhost:8080/api/v1/courses/{{uuid}}/spaces';

  constructor(http: Http, apiKeyService: ApiKeyService) {
    super(http, apiKeyService);
  }

  /**
   * Look for course(s) between the given dates (inclusive).
   *
   * @param startDate
   * @param endDate
   * @returns {Observable<R>}
   */
  find(startDate: moment.Moment, endDate: moment.Moment): Observable<CourseWithNumSpaces[]> {
    let body = {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD')
    };

    return this.post(this.coursesFindUrl, body)
      .map(this.extractJson)
      .catch(this.handleError);
  }

  /**
   * Get the course with the given UUID.
   *
   * @param uuid
   * @returns {undefined}
   */
  getByUuid(uuid: string): Observable<CourseWithOrganisers> {
    return this.get(this.coursesGetUrl.replace('{{uuid}}', uuid))
      .map(this.extractJson)
      .catch(this.handleError);
  }

  /**
   * Get the spaces on the given course.
   *
   * @param uuid
   * @returns {undefined}
   */
  spaces(uuid: string): Observable<CourseSpaceWithMember[]> {
    return this.get(this.courseSpacesUrl.replace('{{uuid}}', uuid))
      .map(this.extractJson)
      .catch(this.handleError);
  }

}
