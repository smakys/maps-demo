var express = require('express');
var router = express.Router();

/* GET maps. */
router.get('/', function(req, res, next) {

  const defaultParams = {
    page: 1,
    limit: 30,
    zoom: 12
  }
  const params = Object.assign({}, defaultParams, req.query);
  res.render('zoom-pan', { limit: params.limit, page: params.page, zoom: params.zoom });
});

module.exports = router;
