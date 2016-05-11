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

package controllers

import javax.inject._

import dao.SettingsDAO
import models.{Setting, Settings, Validators}
import play.api.data.Forms._
import play.api.data._
import play.api.i18n.{I18nSupport, MessagesApi}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.mvc._


/**
 * Handles the administration interface.
 */
@Singleton
class AdminController @Inject() (val messagesApi: MessagesApi, val settingsDao: SettingsDAO) extends Controller with I18nSupport {
  private val settingsForm = Form(
    mapping(
      "welcomeText" -> text.verifying(Validators.welcomeTextValidator)
    )((welcomeText: String) => {
      (welcomeText)
    })((welcomeText: String) => {
      Some(welcomeText)
    })
  )

  /**
    * Shows the main admin screen.
    */
  def index: Action[AnyContent] = Action { implicit request =>
    Ok(views.html.admin.index())
  }

  /**
    * Update the saved settings.
    *
    * @return
    */
  def settings: Action[AnyContent] = Action.async { implicit request =>
    settingsDao.getOrElse(Settings.WelcomeText, "Hello, @@name@@, this is an example text!").map { welcomeTextMessage =>
      Ok(views.html.admin.settings(settingsForm.fill(welcomeTextMessage), welcomeTextMessage))
    }
  }

  /**
    * Shows the settings edit form.
    *
    * @return
    */
  def updateSettings: Action[AnyContent] = Action.async { implicit request =>
    settingsDao.getOrElse(Settings.WelcomeText, "Hello, @@name@@, this is an example text!").map { welcomeTextMessage =>
      settingsForm.bindFromRequest.fold(formWithErrors => {
        BadRequest(views.html.admin.settings(formWithErrors, welcomeTextMessage))
      }, (welcomeText: String) => {
        settingsDao.put(Setting(Settings.WelcomeText, welcomeText))

        Redirect(routes.AdminController.index())
      })
    }
  }
}
