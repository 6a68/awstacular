var ec2 = require('./lib/awesome.js'),
    key = require('./lib/key.js');


var AMI = 'ami-89c249e0',
    VPC = 'vpc-08d35f65',
    SUBNET = 'subnet-c257dbaf',
    SG  = 'sg-02ac5e6d',
    INSTANCE_TYPE = 'c1.medium';

exports.createImage = function(opts, cb) {
  key.getName(function (err, keyName) {
    if (err) return cb(err);
    ec2.RunInstances({
      ImageId: AMI,
      SubnetId: SUBNET,
      keyName: keyName,
      InstanceType: INSTANCE_TYPE,
      MinCount: 1,
      MaxCount: 1
    }, function(err, rez) {
      if (err) cb(err);
      else if (!rez || !rez.Body || !rez.Body.RunInstancesResponse) {
        cb("malformed response: " + JSON.stringfy(rez, null, "    "));
      } else {
        cb(null, rez.Body.RunInstancesResponse);
      }
    });
  });
};

// test when invoked from the command line
if (require.main === module) {
  exports.createImage({}, function(err, rez) {
    if (err) console.log("failed:", err);
    else console.log(rez);
  });
}

