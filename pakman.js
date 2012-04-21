/**
 * pakman - the file packager
 * Takes in a config (json) file to tell it which files to merge, and how
 */

var argv = require('optimist')
    .usage('Package files.\nUsage: $0 -c path/to/myconfig.json')
    .demand('c')
    .alias('c', 'config')
    .describe('c', 'Path to the config file to use')
    .boolean('v')
    .alias('v', 'verbose')
    .describe('v', 'Be all verbose about it')
    .default('v', false)
    .argv
;

var config = require("./libs/config.js").get(argv.c)
config.argv = argv;

var isEnvReady = require("./libs/env.js").prepare(config.destination, config.eraseIfExists);

if(isEnvReady) {
    var allSourceFiles = require("./libs/finder.js").getAllSourceFiles(config.source);
    var resolvedPackages = require("./libs/clone.js").clone(config.packages);
    resolvedPackages = require("./libs/resolver.js").resolveFilePaths(resolvedPackages, allSourceFiles);
    config.resolvedPackages = resolvedPackages;

    if(argv.v) {
        console.log("\n  Source: " + config.source);
        console.log("  Destination: " + config.destination);
        console.log("  Erase if exists: " + config.eraseIfExists);
    }

    var merger = require("./merger.js");
    merger.multiMerge(config, argv.v);

    console.log("\nPakman did it again! Have a great day!");
} else {
    console.warn("\nPakman could not prepare the destination directory, there's an existing file at " + config.destination);
    console.warn("Make sure you configure the proper destination directory path or set the 'eraseIfExists' config flag to true.");
}
