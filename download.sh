#!/bin/sh
echo 'Fetching urls'
./phantomjs-2.1.1-linux-x86_64/bin/phantomjs app.js > url.txt
mkdir course
cd course
echo 'Downloading'
wget -i ../url.txt