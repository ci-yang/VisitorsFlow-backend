const fs = require('fs');
const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const schedule = require('node-schedule');
const port = process.env.port || 5858;

let name_id_dict = {};
status = {
  "12": "無狀態",
  "23": "無狀態",
  "24": "無狀態",
  "32": "無狀態",
};
status2server = {
  "12_server": "無狀態",
  "23_server": "無狀態",
  "24_server": "無狀態",
  "32_server": "無狀態",
};
const nameList = ['12', '23', '24', '32', '12_server', '23_server', '24_server', '32_server'];
let messages = [];
let currentMessageObj = {
  signal: 'None',
  info: 'None',
  status: 'None'
};

const today = new Date();
/*
const mySchedule = schedule.scheduleJob({hour: 23, minute: 59}, function(){
  //console.log('The answer to life, the universe, and everything!');
  messages = [];
  console.log(`message is empty`);
  io.emit('emptyHistory', messages);
});
*/


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/jsonFIles', express.static('public/jsonFIles'));

app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.set('views', './src/views');
app.set('view engine', 'ejs');

function setupCORS(req, res, next) {
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-type,Accept,X-Access-Token,X-Key');
  res.header('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
}

app.all('/*', setupCORS);

// Store config
function specificDir(name) {
  try {
    // Configuring appropriate storage 
    let storage = multer.diskStorage({
      // Absolute path
      destination: function (req, file, cb) {
        cb(null, 'public/jsonFiles/' + name);
      },
      // Match the field name in the request body
      filename: function (req, file, cb) {
        cb(null, file.originalname);
      }
    });
    if (!fs.existsSync('public/jsonFiles/' + name)) {
      fs.mkdirSync('public/jsonFiles/' + name);
    }
    return storage;
  } catch (ex) {
    console.log("Error :\n" + ex);
  }
}

/*
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/jsonFiles/')
    },

    filename: function (req, file, cb) {
        let fileFormat = (file.originalname).split(".");
        cb(null, file.originalname);
        // cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
        // cb(null, fileFormat[0] + "." + fileFormat[fileFormat.length - 1]);
    }
});
*/
// const upload = multer({ storage: storage });
const upload_12 = multer({ storage: specificDir('12') });
const upload_23 = multer({ storage: specificDir('23') });
const upload_24 = multer({ storage: specificDir('24') });
const upload_32 = multer({ storage: specificDir('32') });

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

  });

  socket.on('message', (msgObj) => {
    // handle API message
    let id = socket.id;
    let username = "";

    
    for (const key in name_id_dict) {
      const value = name_id_dict[key];
      if (value === id) {
        username = key;      //key
        break;
      }
    }
    if (username === 'callAPI') {
      messages.push(msgObj);
      currentMessageObj = msgObj;
      io.emit('messageClient', msgObj, messages);
    } else {
      console.log('我不認識你~~');
    }
  });

  socket.on('getSecond', (second) => {
    let id = socket.id;
    let username = "";
    //console.log('second: ' + second);

    for (const key in name_id_dict) {
      const value = name_id_dict[key];
      if (value === id) {
        username = key;      //key
        break;
      }
    }
    if (nameList.includes(username)) {
      io.emit('showSecond', second, username);
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

const visitorsFlowAPIRouter = require('./src/routes/visitorsFlowAPIRoutes');
app.use('/visitorsFlow', visitorsFlowAPIRouter);

app.get('/', (req, res) => {
  // res.send("Welcome to my world~");
  debug(chalk.green(__dirname));
  // path.join() -> don't care about how many slach(-)
  // e.g. path.join(__dirname, '/views/', '/index.hhtml/')
  // res.sendFile(path.join(__dirname, 'views/index.html'));
  res.render(
    'index',
    {
      currentMessageObj,
      messages,
      status,
      nameList,
      title: 'Socket NodeJS'
    }
  );
});

function uploadCallback(req, res, next) {
  var file = req.file;

  try {
    console.log('文件類型：%s', file.mimetype);
    console.log('原始文件名：%s', file.originalname);
    console.log('文件大小：%s', file.size);
    console.log('文件保存路徑：%s', file.path);

    res.send({
      msg: "上傳成功",
      mimetype: file.mimetype,
      originalname: file.originalname,
      size: file.size,
      path: file.path,
      // imageURL: "localhost:5858/" + file.path.split("/")[1] + "/" + file.path.split("/")[2]
    });
  } catch (err) {
    console.log(err);
    res.send({
      msg: "error",
      code: 0,
      status: 400
    });
  }
}

// 上傳 JSON
app.post('/upload_12', upload_12.single('json'), uploadCallback);
app.post('/upload_23', upload_23.single('json'), uploadCallback);
app.post('/upload_24', upload_24.single('json'), uploadCallback);
app.post('/upload_32', upload_32.single('json'), uploadCallback);

app.get('/form', function (req, res, next) {
  var form = fs.readFileSync('./public/form.html', { encoding: 'utf8' });
  res.send(form);
});

http.listen(port, function (err) {
  if (err) {
    console.log(err);
  }
  console.log('listen on port ' + port);
});

