# Meteor AWS Demo Project

##Getting started

Edit the settings.json to add your aws credentials

```
cd aws
meteor --settings settings.json
```

When you run the app, it will query AWS , using your credentials, and draw a tree of your EC2 servers.

It attempts to fetch RDS records, well it does retrieve them, and inserts into the collection, but for some reason the notification mechanism on the client is broken
