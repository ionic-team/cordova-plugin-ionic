#! /usr/bin/env bash

cat<<EOF>dist/ngx/package.json
{
  "name": "ionic-cordova-plugin",
  "main": "ngx/index.js",
  "module": "ngx/index.js",
  "typings": "ngx/index.d.ts"
}
EOF
