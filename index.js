var fs = require('fs');
var zlib = require('zlib');
var tar = require('tar');
var tarfs = require('tar-fs');
var exttar = require('ext-tar').tar;
var request = require('request');
var async = require('async');
var fsextra = require('fs-extra');

var filename = 'node-webkit-v0.9.2-linux-x64.tar.gz';

function mkdir (dirname) {
    if (fs.existsSync(dirname)) {
        fsextra.removeSync(dirname);
    }
    fs.mkdirSync(dirname);
}

function download(done) {
    if (!fs.existsSync(filename)) {
        console.log('downloading...');
        console.time('download');
        destStream = fs.createWriteStream(filename);
        request('http://s3.amazonaws.com/node-webkit/v0.9.2/' + filename)
            .on('error', console.error)
            .pipe(destStream)
            .on('error', console.error)
            .on('close', function () {
                console.timeEnd('download');
                done();
            });
    } else {
        console.log('download ... skip');
        done();
    }
}

function node_tar(done) {
    mkdir("node_tar");
    console.time('node-tar');
    fs.createReadStream(filename)
        .pipe(zlib.createGunzip())
        .pipe(tar.Extract({path: 'node_tar'}))
        .on('end', function () {
            console.timeEnd('node-tar');
            done();
        });
}

function tar_fs(done) {
    mkdir("tar-fs");
    console.time('tar-fs');
    fs.createReadStream(filename)
        .pipe(zlib.createGunzip())
        .pipe(tarfs.extract('./untar'))
        .on('finish', function() {
            console.timeEnd('tar-fs');
            done();
        });
}

function ext_tar(done) {
    mkdir("ext-tar");
    console.time('ext-tar');
    exttar.extract(filename, 'ext-tar', function () {
        console.timeEnd('ext-tar');
        done();
    });
}

function main() {
    async.series([
        download,
        node_tar,
        tar_fs,
        ext_tar
    ]);
}

main();
