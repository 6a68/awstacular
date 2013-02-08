const
ec2 = require('./awesome.js'),
path = require('path'),
fs = require('fs'),
crypto = require('crypto'),
jsel = require('JSONSelect');

const keyPath = process.env['AWSBOX_PUBKEY'] || path.join(process.env['HOME'], ".ssh", "id_rsa.pub");

exports.read = function(cb) {
  fs.readFile(keyPath, cb);
};

exports.fingerprint = function(cb) {
  exports.read(function(err, buf) {
    if (err) return cb(err);
    var b = new Buffer(buf.toString().split(' ')[1], 'base64');
    var md5sum = crypto.createHash('md5');
    md5sum.update(b);
    cb(null, md5sum.digest('hex'));
  });
};

exports.getName = function(cb) {
  exports.fingerprint(function(err, fingerprint) {
    if (err) return cb(err);

    var keyName = "awstacular deploy key (" + fingerprint + ")";

    // is this fingerprint known?
    ec2.DescribeKeyPairs({}, function(err, result) {
      if (err) return cb(err);

      var found = jsel.match(":has(.keyName:val(?)) > .keyName", [ keyName ], result);
      if (found.length) return cb(null, keyName);

      // key isn't yet installed!
      exports.read(function(err, key) {
        if (err) return cb(err);

        ec2.ImportKeyPair({
          KeyName: keyName,
          PublicKeyMaterial: new Buffer(key).toString('base64')
        }, function(err, result) {
          console.log(err, result);
          if (!result) return cb('null result from ec2 on key addition');
          if (result.Errors) return cb(result.Errors.Error.Message);
          cb(null, keyName);
        });
      });
    });
  });
};

// test when invoked from the command line
if (require.main === module) {
  exports.getName(function() {
    console.log(arguments);
  });
}
