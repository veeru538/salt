make:
  pkg.installed
gcc-c++:
  pkg.installed
openssl-devel:
  pkg.installed
git:
  pkg.installed
wget:
  pkg.installed

nodejs:
  cmd.run:
    - name: |
        cd  /usr/src/
        wget -c http://nodejs.org/dist/v0.10.21/node-v0.10.21.tar.gz
        tar zxf node-v0.10.21.tar.gz
        cd node-v0.10.21
        ./configure
        make
        make install
        cd /usr/local/lib

/usr/local/lib/server.js:
  file:
    - managed
    - mode: 611
    - source: salt://node/server.js


