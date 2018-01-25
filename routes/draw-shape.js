var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  const defaultParams = {
    page: 1,
    limit: 30,
    zoom: 13,
    delay: 500
  }
  const params = Object.assign({}, defaultParams, req.query);

  console.log(params)
  res.render('draw-shape', { limit: params.limit, page: params.page, zoom: params.zoom });
});

module.exports = router;
