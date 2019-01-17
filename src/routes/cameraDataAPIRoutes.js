const express = require('express');
const mysql = require('async-mysql');
const debug = require('debug')('app:visitorsFlowAPIRoutes');
const {
  db: {
    host,
    user,
    password,
    database
  }
} = require('../../config.js');
let Camera = require('../controllers/Camera');

const cameraDataAPIRouter = express.Router();

// get the data from the specific ip
getData = async (ip, date) => {
  const url = {
    host,
    user,
    password,
    database
  };
  let rows;
  const ipString = 'ip';
  const timeString = 'time';
  const stateString = 'state';
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  nextDateString = nextDate.toLocaleDateString();

  try {
    connection = await mysql.connect(url);
    // rows = await connection.query(`SELECT * FROM ${tableName} ORDER BY time ASC LIMIT 2000`);
    // query = `SELECT COUNT(*) as peopleAmount, ${ipString} FROM PeopleFlow WHERE ${ipString}=${ip}`;
    query = `SELECT COUNT(*) as peopleAmount, ${ipString}, ${timeString}, ${stateString} FROM PeopleFlow WHERE ${ipString} = ${ip} and ${timeString} >= '${date}' and ${timeString} < '${nextDateString}' GROUP BY HOUR(time), DAYOFMONTH(time), MONTH(time), ${stateString} order by ${timeString} ASC`
    rows = await connection.query(query);
    return rows;
  } catch (err) {
    debug(err.stack);
  }
  await connection.end();
};

// get the data from the 5zone includes ip 23, 24, 32
get5ZoneData = async (date) => {
  const url = {
    host,
    user,
    password,
    database
  };
  let rows;
  const ipString = 'ip';
  const timeString = 'time';
  const stateString = 'state';
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  nextDateString = nextDate.toLocaleDateString();

  try {
    connection = await mysql.connect(url);
    // rows = await connection.query(`SELECT * FROM ${tableName} ORDER BY time ASC LIMIT 2000`);
    // query = `SELECT COUNT(*) as peopleAmount, ${ipString} FROM PeopleFlow WHERE ${ipString}=${ip}`;
    query = `SELECT COUNT(*) as peopleAmount, ${ipString}, ${timeString}, ${stateString} FROM PeopleFlow WHERE ${ipString} = '23' or ${ipString} = '24' or ${ipString} = '32' and ${timeString} >= '${date}' and ${timeString} < '${nextDateString}' GROUP BY HOUR(time), DAYOFMONTH(time), MONTH(time), ${stateString} order by ${timeString} ASC`
    rows = await connection.query(query);
    return rows;
  } catch (err) {
    debug(err.stack);
  }
  await connection.end();
};

// get all data
getAllData = async (date) => {
  const url = {
    host,
    user,
    password,
    database
  };
  let rows;
  const ipString = 'ip';
  const timeString = 'time';
  const stateString = 'state';
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  nextDateString = nextDate.toLocaleDateString();

  try {
    connection = await mysql.connect(url);
    // rows = await connection.query(`SELECT * FROM ${tableName} ORDER BY time ASC LIMIT 2000`);
    // query = `SELECT COUNT(*) as peopleAmount, ${ipString} FROM PeopleFlow WHERE ${ipString}=${ip}`;
    query = `SELECT COUNT(*) as peopleAmount, ${ipString}, ${timeString}, ${stateString} FROM PeopleFlow WHERE ${timeString} >= '${date}' and ${timeString} < '${nextDateString}' GROUP BY HOUR(time), DAYOFMONTH(time), MONTH(time), ${stateString} order by ${timeString} ASC`
    rows = await connection.query(query);
    return rows;
  } catch (err) {
    debug(err.stack);
  }
  await connection.end();
};

cameraDataAPIRouter.route('/tableAPI')
  .get((req, res) => {
    let { date } = req.query;
    if (!date) {
      date = '2018-11-03';
    }

    (async function mysqlAuthors() {
      // const startTime = '2018-11-03';
      // const endTime = new Date().toLocaleDateString();
      const data32 = await getData('32', date);
      const data12 = await getData('12', date);
      const data23 = await getData('23', date);
      const data24 = await getData('24', date);
      const data5zone = await get5ZoneData(date);
      const allData= await getAllData(date);

      const camera12 = new Camera(12, '一區', date);
      camera12.setData(data12);
      camera12.generateTableData(); 

      const camera23 = new Camera(23, '五區東1', date);
      camera23.setData(data23);
      camera23.generateTableData(); 

      const camera24 = new Camera(24, '五區東2', date);
      camera24.setData(data24);
      camera24.generateTableData(); 

      const camera32 = new Camera(32, '五區西', date);
      camera32.setData(data32);
      camera32.generateTableData(); 

      const camera5zone = new Camera(232432, '五區', date);
      camera5zone.setData(data5zone);
      camera5zone.generateTableData(); 

      const cameraAll = new Camera(12232432, '全部', date);
      cameraAll.setData(allData);
      cameraAll.generateTableData(); 

      res.send({
            camera12:{
              ip: camera12.ip,
              name: camera12.name,
              peopleflowObject: camera12.peopleflowObject
            },
            camera23:{
              ip: camera23.ip,
              name: camera23.name,
              peopleflowObject: camera23.peopleflowObject
            },
            camera24:{
              ip: camera24.ip,
              name: camera24.name,
              peopleflowObject: camera24.peopleflowObject
            },
            camera32:{
              ip: camera32.ip,
              name: camera32.name,
              peopleflowObject: camera32.peopleflowObject
            },
            camera5zone:{
              ip: camera5zone.ip,
              name: camera5zone.name,
              peopleflowObject: camera5zone.peopleflowObject
            },
            cameraAll:{
              ip: cameraAll.ip,
              name: cameraAll.name,
              peopleflowObject: cameraAll.peopleflowObject
            }
          });
    }())
  });

cameraDataAPIRouter.route('/')
  .get((req, res) => {
    const date = '2018-11-03';
    const startTime = new Date(date);
    const today = new Date();
    const days = (today.getDate() - startTime.getDate()) + 1;
    const dateArray = [];
    const passYear = today.getFullYear() - startTime.getFullYear();
    const passMounths = today.getMonth() - startTime.getMonth() + (passYear * 12);
    let tempDate;
    let tempMonth;

    for(let i = 0; i < days + passMounths * 30 + 1; i += 1) {
      if(startTime.getDate() < 10){
        tempDate = `0${startTime.getDate()}`;
      }
      else{
        tempDate = startTime.getDate();
        //dateArray.push(startTime.toLocaleDateString());
      }
      if(startTime.getMonth() < 10){
        tempMonth = `0${startTime.getMonth()+1}`;
      }
      else{
        tempMonth = startTime.getMonth()+1;
      }
      dateArray.push(`${startTime.getFullYear()}-${tempMonth}-${tempDate}`);
      startTime.setDate(startTime.getDate()+1);
    }
    (async function mysqlAuthors() {
      const todayString = new Date().toLocaleDateString()
      const data12 = await getData('12', todayString);

      const camera12 = new Camera(12, '一區', todayString);
      camera12.setData(data12);
      camera12.generateTableData(); 

      debug(dateArray)


      res.render('table',
        {
          title: 'Camera Data',
          data: {
            camera12,
          },
          dateArray
        });
    }())
  });

module.exports = cameraDataAPIRouter;