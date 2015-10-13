var subject = require('./subject.js')
var mock = require('mock-fs');
subject.inc(1,undefined);
subject.inc(1,"mutated123982832AXZ");
subject.inc(-1,undefined);
subject.inc(-1,"mutated123982832AXZ");
