// Includes
var fs = require('fs');
var mutils = require('../utils/utils');

// Consts
var FILE_PREFIX = "/tmp/spookyfile";

// Admitting we are on a Unix system
var randomTempFile = function(filename_part) {
    filename_part = filename_part ? filename_part : "random";
    return FILE_PREFIX+"_"+mutils.randomInt()+"_"+filename_part;
};


// Exports
exports.randomTempFile = randomTempFile;