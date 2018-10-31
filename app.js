const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const bodyParser = require('body-parser');
const port = process.env.port || 5858;


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.set('views', './src/views');
app.set('view engine', 'ejs');

let name_id_dict = {};
status = {
    "12": "無狀態",
    "23": "無狀態",
    "24": "無狀態",
    "32": "無狀態",
}
const nameList = ['12', '23', '24', '32']

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('username', (username, cb) => {
        console.log("connect: " + socket.id + ', ' + username);
        //stored user info
        //room.

        if (nameList.includes(username)) {
            io.emit('handle', 'normal', username);
            status[username] = "上線中";
        }

        name_id_dict[username] = socket.id;

    })

    socket.on('message', (msg) => {
        let id = socket.id;
        let username = "";
        io.emit('message', msg);
        console.log('message: ' + msg);

        for (const key in name_id_dict) {
            const value = name_id_dict[key];
            if (value === id) {
                username = key;      //key
                break;
            }
        }
        if (nameList.includes(username)) {
            console.log(username + ' 的狀態是： ' + msg);
            io.emit('handle', msg, username);
        } else {
            console.log('我不認識你~~');
        }
    });

    socket.on('disconnect', () => {
        let id = socket.id;
        let username = "";

        for (const key in name_id_dict) {
            const value = name_id_dict[key];
            if (value === id) {
                username = key;      //key
                break;
            }
        }

        console.log('user ' + username + ' disconnected');
        if (nameList.includes(username)) {
            io.emit('handle', 'problem', username);
            status[username] = "出問題啦";
        }
    });
})

app.get('/', (req, res) => {
    // res.send("Welcome to my world~");
    debug(chalk.green(__dirname));
    // path.join() -> don't care about how many slach(-)
    // e.g. path.join(__dirname, '/views/', '/index.hhtml/')
    // res.sendFile(path.join(__dirname, 'views/index.html'));
    res.render(
        'index',
        {
            status,
            nameList,
            title: 'Socket NodeJS'
        }
    );
});

//取得線上人

http.listen(port, function (err) {
    if (err) {
        console.log(err);
    }
    console.log('listen on port ' + port);
});

