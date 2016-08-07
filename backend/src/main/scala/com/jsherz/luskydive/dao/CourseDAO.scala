/**
  * MIT License
  *
  * Copyright (c) 2016 James Sherwood-Jones <james.sherwoodjones@gmail.com>
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to deal
  * in the Software without restriction, including without limitation the rights
  * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  * copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included in all
  * copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  * SOFTWARE.
  */

package com.jsherz.luskydive.dao

import java.sql.Date
import java.util.UUID

import com.jsherz.luskydive.core.{Course, CourseSpace, CourseWithOrganisers}
import com.jsherz.luskydive.services.DatabaseService

import scala.concurrent.{ExecutionContext, Future}

/**
  * Access to courses.
  */
trait CourseDAO {

  /**
    * Try and find a course with the given UUID.
    *
    * @param uuid
    * @return
    */
  def get(uuid: UUID): Future[Option[CourseWithOrganisers]]

  /**
    * Attempt to find courses within the given dates (inclusive).
    *
    * @param startDate
    * @param endDate
    * @return
    */
  def find(startDate: Date, endDate: Date): Future[Seq[Course]]

  /**
    * Get the space(s) (if any) on a course.
    *
    * @param uuid
    * @return
    */
  def spaces(uuid: UUID): Future[Seq[CourseSpace]]

}

/**
  * Database backed access to courses.
  *
  * @param databaseService
  * @param ec
  */
class CourseDAOImpl(protected override val databaseService: DatabaseService)(implicit val ec: ExecutionContext)
  extends Tables(databaseService) with CourseDAO {

  import driver.api._

  /**
    * Try and find a course with the given UUID, including finding the primary and secondary organisers.
    *
    * @param uuid
    * @return
    */
  override def get(uuid: UUID): Future[Option[CourseWithOrganisers]] = {
    val courseLookup = Courses.filter(_.uuid === uuid)
      .join(CommitteeMembers)
      .on(_.organiserUuid === _.uuid)
      .joinLeft(CommitteeMembers)
      .on(_._1.secondaryOrganiserUuid === _.uuid)

    db.run(courseLookup.result.headOption).map {
      _.map { result =>
        CourseWithOrganisers(result._1._1, result._1._2, result._2)
      }
    }
  }

  /**
    * Attempt to find courses within the given dates (inclusive).
    * @param startDate
    * @param endDate
    * @return
    */
  override def find(startDate: Date, endDate: Date): Future[Seq[Course]] = {
    db.run(Courses.filter { course =>
      course.date >= startDate && course.date <= endDate
    }.result)
  }

  /**
    * Get the space(s) (if any) on a course.
    *
    * @param uuid
    * @return
    */
  override def spaces(uuid: UUID): Future[Seq[CourseSpace]] = {
    db.run(CourseSpaces.filter(_.courseUuid === uuid).result)
  }

}
