var express = require('express');
var router = express.Router();

/* GET maps. */
router.get('/', function(req, res, next) {
  const defaultParams = {
    page: 1,
    limit: 30,
    zoom: 13,
    delay: 500
  }
  const params = Object.assign({}, defaultParams, req.query);

  console.log(params)
  res.render('stream', { limit: params.limit, page: params.page, zoom: params.zoom, delay: params.delay });
});

module.exports = router;
