/**
 * Created by krakenboss on 2015-08-02.
 *
 * sends mail with verification token
 */

var mailer = require('nodemailer');

// read credentials from file in .gitignore

var transporter = mailer.createTransport({service: 'gmail',
    auth: {
        user: 'eu.imagepool@gmail.com',
        pass: 'imagepoolpassword'
    }
});

module.exports = {
  send: function send(username, key, callback) {
      var options = {
          from: 'ImagePool (tm) <eu.imagepool@gmail.com>',
          to: username,
          subject: '1Gram Account Verification',
          text: '',
          html: 'Thank you for registering with 1Gram,' +
          '<br><br>' +
          'You may activate your account using this <a href="https://192.168.10.183/register/verify?token=' + key + '">link</a>.' +
          '<br><br>' +
          'Regards,<br>' +
          '1Gram.com'
      };

      transporter.sendMail(options, function (err, info) {
          callback(err);
      });
  }
};