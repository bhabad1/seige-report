import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import Debug from 'debug';
import express from 'express';
import logger from 'morgan';
import sassMiddleware from 'node-sass-middleware';
import path from 'path';
import mongoose from 'mongoose';
// import favicon from 'serve-favicon';

import index from './routes/index';

const app = express();
const debug = Debug('siege-report-tool:app');
const server = app.listen(app.get('port'), () => {
    console.warn(`Express server listening on port ${app.get('port')} `);
});
let mongoConnectUrl;

if (app.get('env') === 'production') {
    mongoConnectUrl = `mongodb://abcd:${encodeURIComponent('abcd123')}@192.168.1.241:27020/Test?connectTimeoutMS=300000`;
    // mongoConnectUrl = 'mongodb://kesari:kesari123@192.168.1.241:27020,192.168.1.242:27020,192.168.1.243:27020/ERP/?replicaSet=rs0&connectTimeoutMS=300000';
} else {
    mongoConnectUrl = `mongodb://abcd:${encodeURIComponent('abcd')}@192.168.1.213:27018/test?connectTimeoutMS=300000`;

    //mongoConnectUrl = 'mongodb://devadmin:mongo123@192.168.1.213:27018/ERP1';
}
console.warn(`----------------------- This is ${app.get('env')} environment-----------------------`);
mongoose.connect(mongoConnectUrl);
mongoose.Promise = global.Promise
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB Connection Error'))

app.set('views', path.join(__dirname, 'views'));
// view engine setup
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieParser());
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
/* eslint no-unused-vars: 0 */
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// Handle uncaughtException
process.on('unhandledRejection', (err) => {
    console.log('unhandledRejection Error: ', err)
})

process.on('uncaughtException', function(err) {
    if (process.env.NODE_ENV === 'production') {
        var obj = {}
        obj.date_time = new Date() // set the users facebook id
        obj.message = err.message
        obj.stack = err.stack
        obj.status = 'pending'


        console.log(' Error In API Project Is : ', obj)

    } else {
        console.error((new Date()).toUTCString() + ' uncaughtException: ' + err.message)
        console.error(err.stack)
        process.exit(1)
    }
})

app.get('*', function(req, res) {
    res.send('Sorry, this is an invalid URL.')
})

export default app;
