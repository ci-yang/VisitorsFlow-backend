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

      try {
        connection = await mysql.connect(url);
        // rows = await connection.query(`SELECT * FROM ${tableName} ORDER BY time ASC LIMIT 2000`);
        query = 'SELECT COUNT(*) as peopleAmount, `ip`, `time`, `state` FROM `PeopleFlow` GROUP BY HOUR(time), WEEKDAY(time), `state` order by `time` ASC';
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
        }
        res.json({
          highChartDataOut,
          highChartDataIn
        });
      } catch (err) {
        debug(err.stack);
      }
      await connection.end();
    }());
  });

module.exports = visitorsFlowAPIRouter;