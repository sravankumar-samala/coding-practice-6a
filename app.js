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

const turnDistToResObj = (obj) => {
  return {
    districtId: obj.district_id,
    districtName: obj.district_name,
    stateId: obj.state_id,
    cases: obj.cases,
    cured: obj.cured,
    active: obj.active,
    deaths: obj.deaths,
  };
};

// getting all the states

app.get("/states/", async (req, res) => {
  try {
    const getStatesQuery = `SELECT * FROM state;`;
    const statesArr = await db.all(getStatesQuery);
    res.send(statesArr.map((obj) => turnStateToResponseObj(obj)));
  } catch (err) {
    console.log(err.message);
  }
});

// getting specific state

app.get("/states/:Id/", async (req, res) => {
  const stateId = req.params.Id;
  const Query = `
    SELECT * FROM state WHERE state_id = ${stateId};
    `;
  const stateObj = await db.get(Query);
  const state = [stateObj].map((obj) => turnStateToResponseObj(obj));
  res.send(state[0]);
});

// Posting new district details into db

app.post("/districts/", async (req, res) => {
  try {
    const { districtName, stateId, cases, cured, active, deaths } = req.body;
    const query = `
        INSERT INTO district (
            district_name, state_id, cases, cured, active, deaths
        )
        VALUES (
            '${districtName}',
            '${stateId}',
            '${cases}',
            '${cured}',
            '${active}',
            '${deaths}'
        );
        `;
    await db.run(query);
    res.send("District Successfully Added");
  } catch (err) {
    console.log(err.message);
  }
});

app.get("/districts/:Id/", async (req, res) => {
  try {
    const districtId = req.params.Id;
    const getDistQuery = `
        SELECT * FROM district WHERE district_id = ${districtId};
        `;
    const districtObj = await db.get(getDistQuery);
    const district = [districtObj].map((obj) => turnDistToResObj(obj));
    res.send(district[0]);
  } catch (err) {
    console.log(err.message);
  }
});

app.delete("/districts/:distId", async (req, res) => {
  try {
    const districtId = req.params.distId;
    const delDistQuery = `
        DELETE FROM district WHERE district_id = ${districtId};
        `;
    await db.run(delDistQuery);
    res.send("District Removed");
  } catch (err) {
    console.log(err.message);
  }
});

app.put("/districts/:distId", async (req, res) => {
  try {
    const districtId = req.params.distId;
    const { districtName, stateId, cases, cured, active, deaths } = req.body;
    const updateQuery = `
        UPDATE district SET 
        district_name = '${districtName}',
        state_id = '${stateId}',
        cases = '${cases}',
        cured = '${cured}',
        active = '${active}',
        deaths = '${deaths}'
        WHERE district_id = ${districtId};
        `;
    await db.run(updateQuery);
    res.send("District Details Updated");
  } catch (err) {
    console.log(err.message);
  }
});

app.get("/states/:stId/stats/", async (req, res) => {
  try {
    const stateId = req.params.stId;
    const getCountQuery = `
        SELECT 
        SUM(cases) AS totalCases,
        SUM(cured) AS totalCured,
        SUM(active) AS totalActive,
        SUM(deaths) AS totalDeaths
        FROM district 
        WHERE state_id = ${stateId};
        `;
    const dataObj = await db.get(getCountQuery);
    const data = [dataObj];
    res.send(data[0]);
  } catch (err) {
    console.log(err.message);
  }
});

//Returns an object containing the state name of a district based on the district ID
app.get("/districts/:distId/details/", async (req, res) => {
  try {
    const districtId = req.params.distId;
    const getStateNameQuery = `
    SELECT state.state_name
    FROM state JOIN district ON state.state_id = district.state_id
    WHERE district_id = ${districtId};
    `;
    const stateNameObj = await db.get(getStateNameQuery);
    const stateName = [stateNameObj].map((obj) => {
      return { stateName: obj.state_name };
    });
    res.send(stateName[0]);
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = app;
//District     TABLE    state
// district_id          state_id
// district_name        state_name
// state_id             population
// cases
// cured
// active
// deaths
