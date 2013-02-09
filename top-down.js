var AWS = require('aws-sdk'),
  Q = require('q');

var opts = {
  accessKeyId: process.env['AWS_ID'],
  secretAccessKey: process.env['AWS_SECRET'],
  region: 'us-east-1'
};
var c = new AWS.EC2.Client(opts);
var e = new AWS.ELB.Client(opts);
// following instructions in http://docs.aws.amazon.com/AmazonVPC/latest/GettingStartedGuide/ExerciseOverview.html:
// 1. create VPC
// 2. create internet gateway
// 3. attach internet gateway
// 4. create VPC subnet
// 5. config routing in VPC to let traffic flow between subnet + internet.
// 6. set a security group to control inbound & outboudn traffic.
// 7. launch an ec2 instance into the provisioned vpc. (it should get a private IP from the subnet's IP range)
// 8. assign an elastic IP to the instance, making it reachable from the internet
// --> rather than using an elastic IP, let's set up an ELB.
// 9. optional: clean up, deleting the instance and the vpc

// TODO callbacks are missing. use Q to manage flow control here
c.createVpc({CidrBlock: '10.0.0.0/16'}); // resp: requestId, vpc obj ({vpcId, state, cidrBlock...})
// TODO skipped DHCP and DNS config
c.createInternetGateway() // resp: requestId, internetGateway obj ({internetGatewayId, ...})
c.attachInternetGateway({InternetGatewayId: igid, VpcId: vpcid}) // resp: { String requestId, Boolean return }. 'return' is true if it succeeded.
c.createSubnet({CidrBlock: '10.0.1.0/24'}); // resp: {String requestId, Obj subnet}.
// route table docs: http://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/VPC_Route_Tables.html
// vpc has a default route table, we can also create them per-subnet.
c.createRouteTable({VpcID: vpcid}) // resp: {String requestId, Obj routeTable: { routeTableId, ...}}
// add routes to table. specify InstanceId or GatewayId, but not both.
c.createRoute({RouteTableId: rtid, GatewayId: igid, DestinationCidrBlock: '0.0.0.0/0'}); // resp: { String requestId, Boolean return }. 'return' is true if it succeeded.
// associate routes with vpc
c.associateRouteTable({RouteTableId: rtid, SubnetId: sid}) // resp: {requestId, associationId}, assocId identifies the association of route table to subnet.
c.runInstances({ImageId, MinCount: 1, MaxCount:5, SubnetId: sid,... }) // resp: {String ReservationId, Array instancesSet, ...}, where instance = {InstanceId
// TODO: add a static route for a VPN connection
c.deleteVpc();

// ELB fun, following http://docs.aws.amazon.com/ElasticLoadBalancing/latest/DeveloperGuide/GettingStarted.html
// 1. configure listeners
// 2. configure health check
// 3. register ec2 instances
// 4. review settings
// 5. create ELB
// 6. delete ELB

