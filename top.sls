base:
    'os:(RedHat|CentOS)':
        - match: grain_pcre
        - epel
        - redis.server
        - mysql
        - mysql.server
        - rabbitmq
        - rabbitmq.config
        - tomcat6
        - node.nodejs
