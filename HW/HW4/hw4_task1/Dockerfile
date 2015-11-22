FROM    alpine:3.2
MAINTAINER  SvenDowideit@home.org.au

RUN apk update && \
    apk add socat && \
    rm -r /var/cache/

RUN echo "Hello. I live in the file : testing.txt" > testing.txt

EXPOSE 9001

CMD socat TCP-LISTEN:9001,fork,reuseaddr SYSTEM:"echo 'You are actually listening to 9001 port where the file resides';cat testing.txt"|sh
#CMD socat | grep _TCP= | sed 's/.*_PORT_\([0-9]*\)_TCP=tcp:\/\/\(.*\):\(.*\)/socat -t 100000000 TCP4-LISTEN:\1,fork,reuseaddr TCP4:\2:\3 \& wait/' | sh
