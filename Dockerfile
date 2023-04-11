FROM debian:stable-slim

USER root

RUN apt-get update && \
    apt-get install -y nodejs npm
RUN npm install -g forever

ADD express /app/
ADD flags /app/flags
WORKDIR "/app"
RUN npm install

EXPOSE 80

CMD [ "forever", "server.js" ]

# Keet it running
# ENTRYPOINT ["tail", "-f", "/dev/null"]
