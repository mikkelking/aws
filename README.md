# Meteor AWS Demo Project

This is a simple Proof of Concept, knocked up to verify what could be done with the AWS API.

The first version does the following

* Queries AWS for a list of regions
* For each region, asks for EC2 instances
* For each region, asks for RDS instances

* Displays the list in a tree view
* Allows EC2 instances to be started/stopped

##Getting started

Edit the settings.json to add your aws credentials

```
git clone https://github.com/mikkelking/aws.git
cd aws
meteor --settings settings.json
```

When you run the app, it will query AWS, using your credentials, and draw a tree of your EC2 servers.

It attempts to fetch RDS records, well it does retrieve them, and inserts into the collection, but for some reason the notification mechanism on the client is broken

## Components
Built using Meteor 1.3 and the peerlibrary:aws-sdk package

On atmosphere: https://atmospherejs.com/peerlibrary/aws-sdk

They have added ...Sync methods so that you can avoid using callbacks, although I haven't used those.

The Amazon documentation for Javascript starts here

https://aws.amazon.com/javascript/

There are different server and client libraries, although given that Meteor doesn't make it difficult to to API calls from the server, I would recommend doing everything there (even though the first version doesn't)

