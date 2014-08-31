var express = require('express');
var router = express.Router();
var pg = require('pg.js');
var conString = "postgres://postgres:DJo328iuwjCwa@SESTATSRV01/statistics";

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/controllers', function(req, res) {
  sendQuery("select * from usbcontrollers", function(result) {
    res.json(result.rows);
  });
});

router.get('/eyetrackers', function(req, res) {
  sendQuery("select model, firmware, count(model) as count from eyetrackers group by model, firmware order by model, firmware desc", function(result) {
    res.json(result.rows);
  });
});

router.get('/connections', function(req, res) {
	var queryFound = "select count(distinct(machine)) from session s inner join entry e on e.session = s.id where app='EyeXEngine' and key='eyetracker.usb.found'";
	var queryAll = "select count(distinct(machine))	from session where app='EyeXEngine'";

	sendQuery(queryFound + " UNION " + queryAll, function(result) {
		res.json({ 
      		found: result.rows[0].count,
      		total: result.rows[1].count
    	});
	});
});

var sendQuery = function(query, handler) {
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    
    client.query(query, function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }

      handler(result);
    });
  });
};

module.exports = router;
