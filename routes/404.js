const router = require('express').Router();

router.get('/*', (req, res, next) => {
    res.displayError();
});

module.exports = router;