const express = require("express");
const pool = require("../modules/pool");
const {
  rejectUnauthenticated,
} = require("../modules/authentication-middleware");
const { query } = require("../modules/pool");

const router = express.Router();

/**
 * GET ALL BARRELS
 */
router.get("/", (req, res) => {
  queryText = `SELECT * FROM barrels ORDER BY city ASC LIMIT 7`;
  pool
    .query(queryText)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((error) => res.sendStatus(500));
});

router.get("/admin", (req, res) => {
  queryText = `SELECT * FROM barrels ORDER BY city ASC`;
  pool
    .query(queryText)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((error) => res.sendStatus(500));
});

/**
 * POST NEW BARREL LOCATION
 */
router.post("/", rejectUnauthenticated, (req, res) => {
  console.log(req.body);
  let hosts = req.body.host;
  let street = req.body.street;
  let city = req.body.city;
  let zipcode = req.body.zipcode;
  let description = req.body.description;
  let hours = req.body.hours;
  let queryText = `INSERT INTO barrels (hosts, street, city, zipcode, description, hours) VALUES ($1, $2, $3, $4, $5, $6);`;

  pool
    .query(queryText, [hosts, street, city, zipcode, description, hours])
    .then((result) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log("SERVER POST ERR", error);
      res.sendStatus(500);
    });
});

/**
 * UPDATE BARREL STATUS
 */
router.put("/update/:id", rejectUnauthenticated, (req, res) => {
  let status = req.body.status;
  let id = req.body.id;
  let statusUpdater = !status;
  const queryText = `UPDATE barrels set status = $2 WHERE id = $1;`;
  pool
    .query(queryText, [id, statusUpdater])
    .then((result) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log("ERROR IN SERVER PUT", error);
      res.sendStatus(500);
    });
});

router.get("/search/:search", rejectUnauthenticated, (req, res) => {
  let searchQuery = req.params.search;
  console.log(searchQuery);

  const queryText = `SELECT * FROM barrels WHERE city ~ '^${searchQuery}' OR hosts ~ '^${searchQuery}' OR hours ~ '^${searchQuery}' OR description ~ '^${searchQuery}' OR zipcode ~'^${searchQuery}';`;
  pool
    .query(queryText)
    .then((result) => {
      console.log(result.rows);
      res.send(result.rows);
    })
    .catch((error) => {
      console.log("ERROR IN SERVER SEARCH GET", error);
    });
});
module.exports = router;
