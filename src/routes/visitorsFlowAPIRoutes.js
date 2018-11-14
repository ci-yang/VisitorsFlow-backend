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

const visitorsFlowAPIRouter = express.Router();


visitorsFlowAPIRouter.route('/')
  .get((req, res) => {
    res.send({
      title: 'API Page in /visitorsFlow',
    });
  });

visitorsFlowAPIRouter.route('/visitors')
  .get((req, res) => {
    // let { articleMount, limit } = req.query;
    (async function mysqlAuthors() {
      const url = {
        host,
        user,
        password,
        database
      };
      let rows;
      let connection;
      const tableName = 'PeopleFlow';
      let highChartDataTemp = []
      let highChartDataIn = [];
      let highChartDataOut = [];
      let highChartDataStay = [];
      let timestampDict = {};

      try {
        connection = await mysql.connect(url);
        // rows = await connection.query(`SELECT * FROM ${tableName} ORDER BY time ASC LIMIT 2000`);
        query = 'SELECT COUNT(*) as peopleAmount, `ip`, `time`, `state` FROM `PeopleFlow` GROUP BY HOUR(time), DAYOFMONTH(time), MONTH(time), `state` order by `time` ASC';
        rows = await connection.query(query);
        
        for(let i = 0; i < rows.length; i += 1) {
          highChartDataTemp = [];
          let date = new Date(rows[i].time);
          date.setMinutes(0)
          date.setSeconds(0)
          rows[i].timestamp = date.getTime();
          highChartDataTemp[0] = rows[i].timestamp;
          highChartDataTemp[1] = rows[i].peopleAmount;
          if( rows[i].state === 1 ){
            highChartDataOut.push(highChartDataTemp);
          } else {
            highChartDataIn.push(highChartDataTemp);
          }

          if (!Object.prototype.hasOwnProperty.call(timestampDict, rows[i].timestamp)) {
            if( rows[i].state === 1 ){
              timestampDict[rows[i].timestamp] = {
                inCount: 0,
                outCount: rows[i].peopleAmount,
                stayCount: 0
              };
            } else {
              timestampDict[rows[i].timestamp] = {
                inCount: rows[i].peopleAmount,
                outCount: 0,
                stayCount: 0
              };
            }
          } else {
            if( rows[i].state === 1 ){
              timestampDict[rows[i].timestamp].outCount = rows[i].peopleAmount
            } else {
              timestampDict[rows[i].timestamp].inCount = rows[i].peopleAmount
            }
          }

        }
        // calculate the stay people count (累積)
        /*
        let stayCount = 0;
        let dayStored = 0;
        Object.keys(timestampDict).forEach((time) => {
          let stayPeopleCount = timestampDict[time].inCount - timestampDict[time].outCount;
          let temp = [];
          const dateTemp = new Date(parseInt(time));
          if(dayStored === dateTemp.getDay()){

          } else {
            // next day so set stayCount to zero
            stayCount = 0
          }
          dayStored = dateTemp.getDay();

          timestampDict[time].stayCount = (stayPeopleCount > 0) ? stayPeopleCount : 0;
          
          stayCount = stayCount + timestampDict[time].stayCount
          
          temp[0] = parseInt(time);
          temp[1] = stayCount;
          highChartDataStay.push(temp);
        });
        */

        // console.log(highChartDataStay);

        res.json({
          highChartDataOut,
          highChartDataIn
          //highChartDataStay
        });
      } catch (err) {
        debug(err.stack);
      }
      await connection.end();
    }());
  });

module.exports = visitorsFlowAPIRouter;