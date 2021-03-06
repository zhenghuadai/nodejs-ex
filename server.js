//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
var session = require('express-session');
var MongoStore = require('connect-mongo/es5')(session);
var sessionInstance;
var uefiws = require('./src/uefiws');
var bodyParser = require('body-parser');
var fs = require('fs');
//var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;
var marked = require('marked');
var os = require('os');
var http = require('http');
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/openshift', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

function createvhost(domainName)
{
    //var vhost = express();
    var vhost = app;
    //parses request body and populates request.body
    //vhost.use( express.bodyParser() );
    //checks request.body for HTTP method overrides
    //vhost.use( express.methodOverride() );
    //Show errors
    //vhost.use( express.errorHandler({ dumpExceptions: true, showStack: true }));
    
    // parse application/json
    vhost.use(bodyParser.json());                        

    // parse vhostlication/x-www-form-urlencoded
    vhost.use(bodyParser.urlencoded({ extended: true }));
//    vhost.use(function(request, response, next) {
//          console.log("In comes a " + request.method + " to " + request.url);
//          next();
//    });

    if(process.env.NODE_SESSION === "redis"){
        var RedisStore = require('connect-redis')(session);
        var redis = require("redis").createClient();
        sessionInstance = session({
            secret: 'Iabk() *&cat',

            store: new RedisStore({
                host: 'localhost',
            port: 6379,
            db: 2,
            pass: 'b&()*Fjl12<>AKJ;kjs#$a',
            client:redis
            }),

            cookie: { maxAge: 24*3600*1000 }
        });

    }else{
        var hostname = os.hostname();
        var mongohost = 'localhost';
        var mongouser = '';
        var mongopwd = '';
        var mongourl = 'mongodb://' +  mongohost + ':27017/bios';
        //if(hostname  === "ex-std-node614.prod.rhcloud.com"){
        if(hostname.indexOf("openshiftapps.com") > 0){
            //mongohost = process.env.OPENSHIFT_MONGODB_DB_HOST;
            //mongouser = 'admin';
            //mongopwd = 'l24nsSS6eFig';
            //mongourl = 'mongodb://' + mongouser + ':' + mongopwd + '@' + mongohost + ':27017/bios';
            mongouser = mongoUser; 
            mongohost = mongoHost; 
            mongopwd = mongoPassword ;
            mongourl = mongoURL; 

        }else{
            mongourl = 'mongodb://' +  mongohost + ':27017/bios';
        }
        sessionInstance = session({
            //genid: function(req) {
            //  return genuuid() // use UUIDs for session IDs
            //},
            secret: 'Iabk() *&cat',
            resave: false,

            store: new MongoStore({
                //        url: 'mongodb://root:myPassword@mongo.onmodulus.net:27017/3xam9l3'
                db: 'bios',
            host: mongohost,
            username: mongouser,
            password: mongopwd, 
            collection: 'session', 
            url: mongourl,
            auto_reconnect:true
            }),

            cookie: { maxAge: 24*3600*1000 }
        });
    }

    vhost.use(sessionInstance);

    return vhost ;// VirtualHost(domainName, vhost)
}


function InitUEFIvhost(vhost)
{
    var public_path = __dirname + "/public";
    marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
    });

    vhost.engine('md', function(path, options, fn){
        fs.readFile(path, 'utf8', function(err, str){
            if (err) return fn(err);
            try {
                var markedhtml = marked(str);
                var html = '<html><head> <LINK REL="stylesheet" TYPE="text/css" HREF="/css/md.css"> ' +
                           ' <SCRIPT SRC="/js/md.js" type="text/javascript"></script>'+
                           '</head><body>' + markedhtml + "</body></html>";
                fn(null, html);
            } catch(err) {
                fn(err);
            }
        });
    });

    vhost.set('views', public_path);
    vhost.set('view engine', 'md');

    vhost.get('/', function (req, res) {
        res.redirect("/index.html");
    });


    //vhost.use(require('express-markdown')({
    //    directory: __dirname + '/public'
    //}));

    vhost.get("/*.md", function(req, res,next){
        var param = req.params[0];
        res.render("" + param);
    });

    vhost.use(express.static(public_path));


    //test.init(vhost);
}

var server = http.createServer(app);
createvhost(app);
uefiws.init(server, sessionInstance);
InitUEFIvhost(app);

server.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
