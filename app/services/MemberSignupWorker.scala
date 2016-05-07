package services

import java.util

import com.twilio.sdk.TwilioRestClient
import com.twilio.sdk.resource.factory.MessageFactory
import com.twilio.sdk.resource.instance.Message
import org.apache.http.NameValuePair
import org.apache.http.message.BasicNameValuePair
import net.greghaines.jesque.{Config, ConfigBuilder}
import net.greghaines.jesque.worker.{MapBasedJobFactory, Worker, WorkerImpl}
import play.api.Logger

import scala.collection.JavaConverters._

/**
  * Handles texting new members if they signed up with a phone number.
  */
object MemberSignupWorker {
  /**
    * The main account identifier for Twilio. Found at https://www.twilio.com/user/account/settings
    */
  private val ACCOUNT_SID: String = sys.env.getOrElse("TWILIO_ACCOUNT_SID", null)

  /**
    * The Twilio API key (auth token). Found at https://www.twilio.com/user/account/settings
    */
  private val AUTH_TOKEN: String = sys.env.getOrElse("TWILIO_AUTH_TOKEN", null)

  /**
    * The number that messages are sent from. Acquire one at https://www.twilio.com/user/account/messaging/phone-numbers
    */
  private val FROM: String = sys.env.getOrElse("FROM_NUMBER", null)

  /**
    * The Twilio API client.
    */
  private var twilioRestClient: TwilioRestClient = null

  /**
    * The mapping of queue actions that are handled to the class that handles them.
    */
  val queueJobFactory: MapBasedJobFactory = new MapBasedJobFactory(Map(
    (Queues.SIGNUP_ACTION, classOf[MemberSignupAction])
  ).asJava)

  /**
    * Ensure the required configuration has been entered by the user.
    */
  private def configIsValid() = {
    ACCOUNT_SID != null && !"".equals(ACCOUNT_SID) &&
      AUTH_TOKEN != null && !"".equals(AUTH_TOKEN) &&
      FROM != null && !"".equals(FROM)
  }

  /**
    * Starts the worker, registering it with the resque queue.
    */
  private def start(): Unit = {
    if (configIsValid()) {
      twilioRestClient = new TwilioRestClient(ACCOUNT_SID, AUTH_TOKEN)

      // Jesque configuration
      val config = new ConfigBuilder().build()

      // Jesque worker
      val worker: Worker = new WorkerImpl(config, util.Arrays.asList(Queues.SIGNUP), queueJobFactory)

      // Thread to run the worker
      val workerThread: Thread = new Thread(worker)

      workerThread.start()

      // Ensure that the worker is removed properly when shutdown
      sys.addShutdownHook({
        Logger.info("Shutting down...")

        workerThread.interrupt()
        worker.end(true)
        workerThread.join()

        Logger.info("Stopped.")
      })

      Logger.info("Started member sign-up queue worker.")
    } else {
      throw new IllegalArgumentException("You must specify the TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and FROM_NUMBER" +
        "environment variables.")
    }
  }

  /**
    * Ensures a UK mobile number is in the format:
    *
    * +447123123123
    *
    * @param phoneNumber
    * @return
    */
  private def formatPhoneNumber(phoneNumber: String): String = {
    if (phoneNumber.startsWith("07")) {
      "+447" + phoneNumber.substring(2)
    } else if (phoneNumber.startsWith("447")) {
      "+" + phoneNumber
    } else {
      phoneNumber
    }
  }

  /**
    * Sends a welcome text message.
    *
    * @param name Member's name
    * @param phoneNumber Member's UK mobile number
    */
  private def sendSMS(name: String, phoneNumber: String) {
    val params = new util.ArrayList[NameValuePair]()
    params.add(new BasicNameValuePair("Body", s"Hey, ${name}! Thanks for coming to see Leeds Skydivers!"))
    params.add(new BasicNameValuePair("To", formatPhoneNumber(phoneNumber)))
    params.add(new BasicNameValuePair("From", FROM))

    val messageFactory: MessageFactory = twilioRestClient.getAccount().getMessageFactory
    val message: Message = messageFactory.create(params)

    Logger.debug(s"Sent message sid '${message.getSid}' to '${name}' (${phoneNumber})")
  }

  /**
    * Called by the queue worker listener. Sends a welcome text if the user specified their phone number.
    *
    * @param name
    * @param phoneNumber
    */
  def signupMember(name: String, phoneNumber: String) {
    if (phoneNumber != null && phoneNumber != "") {
      sendSMS(name, phoneNumber)
    } else {
      Logger.debug("Member doesn't have phone number - not sending message.")
    }
  }

  /**
    * Called when the worker is started. Used to configure and run the queue worker.
    *
    * @param args
    */
  def main(args: Array[String]): Unit = {
    val worker = MemberSignupWorker
  }

  start()
}

/**
  * An action that handles member sign-up queue messages.
  */
class MemberSignupAction extends Runnable {
  /**
    * The member's name.
    */
  private var name: String = null

  /**
    * The member's phone number.
    */
  private var phoneNumber: String = null

  /**
    * The member's e-mail address.
    */
  private var email: String = null

  /**
    * Sets the member's name. Called (using reflection) by Jesque before the action is run.
    * @param name
    */
  def setName(name: String): Unit = {
    this.name = name
  }

  /**
    * Sets the member's phone number. Called (using reflection) by Jesque before the action is run.
    * @param phoneNumber
    */
  def setPhoneNumber(phoneNumber: String): Unit = {
    this.phoneNumber = phoneNumber
  }

  /**
    * Sets the member's e-mail address. Called (using reflection) by Jesque before the action is run.
    * @param email
    */
  def setEmail(email: String): Unit = {
    this.email = email
  }

  /**
    * Called when a new queue item is received by this worker. Used to send the member a text message.
    */
  override def run(): Unit = {
    MemberSignupWorker.signupMember(name, phoneNumber)
  }
}