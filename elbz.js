// plan o' attack
// 1. spin up 1 generic instance. start some trivial node app on there.
// 2. spin up ELB in front of it.
// 3. get traffic to the instance.
//
// 4. make it 2 generic instances, both returning some different string.
// 5. ELB sends traffic to both.
//
// 2 ELBs? do we need that for failover?
// 6. if so, add a 2nd ELB, in front of both boxen, verify both get traffic.
//
// we can verify by doing a node http get. so let's get mocha in here.
