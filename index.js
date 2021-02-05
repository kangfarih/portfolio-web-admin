const express = require('express');
const routes = require('./routes/api');
const mongoose = require('mongoose');

// set up express app
const app = express();

// connect to mongondb
mongoose.connect('mongodb://localhost/ninjago', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});
mongoose.Promise = global.Promise;

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(express.static('./public'))

// initialize routes
app.use('/api', routes);

// error handling middleware
app.use(function (err, req, res, next) {
    // console.log(err);
    res.status(422).send({
        error: err.message
    })
});

// listen for requests:
let listen_port = process.env.port;
app.listen(listen_port || 8000, function () {
    console.log('Now listening for request\nWeb Server is available at http://localhost:8000');
});