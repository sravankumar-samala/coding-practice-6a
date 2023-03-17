const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");
let db;

(async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server started at port : 3000");
    });
  } catch (err) {
    console.log(err.message);
  }
})();

const turnStateToResponseObj = (obj) => {
  return {
    stateId: obj.state_id,
    stateName: obj.state_name,
    population: obj.population,
  };
};
//District     TABLE    state
// district_id          state_id
// district_name        state_name
// state_id             population
// cases
// cured
// active
// deaths

app.get("/states/", async (req, res) => {
  try {
    const getStatesQuery = `SELECT * FROM state;`;
    const statesArr = await db.all(getStatesQuery);
    res.send(statesArr.map((obj) => turnStateToResponseObj(obj)));
  } catch (err) {
    console.log(err.message);
  }
});

app.get("/states/:Id/", async (req, res) => {
  const stateID = req.params.Id;
  const Query = `
    SELECT * FROM state WHERE state_id = ${stateId};
    `;
  const state = db.get(Query);
  res.send(state);
});
