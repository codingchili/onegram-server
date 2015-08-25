/**
 * Created by krakenboss on 2015-08-02.
 */

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/anigram');


module.exports = {
  get: function get() {
      return mongoose;
  }
};