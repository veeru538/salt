tomcat6:
   pkg:
     - installed
   service:
     - running
     - name: tomcat6
     - enable: True   
tomcat6-webapps:
   pkg:
     - installed
tomcat6-admin-webapps:
   pkg:
     - installed

/etc/tomcat6/tomcat-users.xml:
  file:
    - managed
    - source: salt://tomcat6/tomcat-users.xml
    - require:
      - pkg : tomcat6

/etc/tomcat6/tomcat6.conf:
  file:
    - managed
    - source: salt://tomcat6/tomcat6.conf
    - require:
      - pkg : tomcat6

permission:
  cmd.run:
    - name: |
         chmod -R g+w /var/log/tomcat6 /etc/tomcat6/Catalina /var/lib/tomcat6/webapps/ /var/log/tomcat6/ /var/cache/tomcat6/temp /var/cache/tomcat6/work


