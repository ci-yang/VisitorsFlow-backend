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
      // console.log(data);
      // console.log(data2.length);
      // console.log(data2);
      // console.log(data24);

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

    for(let i = 0; i < days; i += 1) {
      if(startTime.getDate() < 10){
        dateArray.push(`${startTime.getFullYear()}-${startTime.getMonth()+1}-0${startTime.getDate()}`);
      }
      else{
        dateArray.push(startTime.toLocaleDateString());
      }
      startTime.setDate(startTime.getDate()+1);
    }    

    (async function mysqlAuthors() {
      const data12 = await getData('12', date);

      const camera12 = new Camera(12, '一區', date);
      camera12.setData(data12);
      camera12.generateTableData(); 

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