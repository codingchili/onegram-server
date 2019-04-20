/**
 * Created by krakenboss on 2015-08-02.
 *
 * sends mail with verification token
 */
const mailer = require('nodemailer');
const debug = require('debug')('anigram:mail');

// read credentials from file in .gitignore
const transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'eu.imagepool@gmail.com',
        pass: 'imagepoolpassword'
    }
});

module.exports = {
    send: (username, key, callback) => {
        let options = {
            from: 'ImagePool (tm) <eu.imagepool@gmail.com>',
            to: username,
            subject: '1Gram Account Verification',
            text: '',
            html: `Thank you for registering with 1Gram, <br><br>
          You may activate your account using this <a href="https://192.168.10.183:1443/register/verify?token=${key}">link</a>.
          <br><br>
          Regards,<br>
          1Gram.com`
        };

        let start = new Date().getTime();
        transporter.sendMail(options, function (err, info) {
            if (err) {
                debug(`failed to send email to ${username}; ${err.message}`);
            } else {
                debug(`email sent in ${new Date().getTime() - start}ms.`);
            }
            callback(err);
        });
    }
};