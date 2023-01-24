const notes = require("express").Router();
const util = require("util");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const readFromFile = util.promisify(fs.readFile);

// function uuid() {
//   Math.floor((1 + Math.random()) * 0x10000)
//     .toString(16)
//     .substring(1);
// }

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (error) =>
    error ? console.error(error) : console.log(`Data written to ${destination}`)
  );

const readAndAppend = (content, file) => {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

notes.get("/", (req, res) => {
  readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});

notes.get("/:id", (req, res) => {
  const noteID = req.params.id;
  readFromFile("./db/db.json")
    .then((data) => JSON.parse(data))
    .then((json) => {
      const result = json.filter((note) => note.id === noteID);
      return result.length > 0 ? result : res.json("No note found");
    });
});

notes.post("/", (req, res) => {
  const { title, text } = req.body;

  if (req.body) {
    const newNote = {
      title,
      text,
      id: uuidv4(),
    };

    readAndAppend(newNote, "./db/db.json");
    res.json("Note added successfully!");
  } else {
    res.error("Please try again.");
  }
});

module.exports = notes;
