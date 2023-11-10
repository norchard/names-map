const fs = require("fs");

const states = JSON.parse(fs.readFileSync("./data/states.json"));
const stateNameMap = {};
states.forEach((state) => (stateNameMap[state.name] = state.abbreviation));

let geoJson = JSON.parse(fs.readFileSync("./data/state-boundaries.geojson"));
// console.log(geoJson);
let newData = "[";

geoJson.features.forEach((entity, i) => {
  const stateName = entity.properties.name;
  const stateAbbrev = stateNameMap[stateName];
  const filename = `./data/baby-names/STATE.${stateAbbrev}.TXT`;
  let names = {};

  if (fs.existsSync(filename)) {
    const csv = fs.readFileSync(filename);
    const nameArray = csv
      .toString()
      .split("\r")
      .map((nameLine) => {
        const nameInstance = nameLine.trim().split(",");
        return {
          gender: nameInstance[1],
          year: nameInstance[2],
          name: nameInstance[3],
          count: nameInstance[4],
        };
      })
      .forEach((nameObj) => {
        if (!names[nameObj.year]) {
          names[nameObj.year] = {};
        }
        if (!names[nameObj.year][nameObj.gender]) {
          names[nameObj.year][nameObj.gender] = [];
        }
        if (names[nameObj.year][nameObj.gender].length < 5)
          names[nameObj.year][nameObj.gender].push({
            name: nameObj.name,
            count: nameObj.count,
          });
      });

    entity.properties.abbrev = stateAbbrev;
    console.log(names);
    entity.properties.names = names;
    names = {};
  }
});
fs.writeFileSync(
  "./data/state-boundaries-and-names.geojson",
  JSON.stringify(geoJson)
);
