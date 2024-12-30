require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Solution
const urlMap = {};
let id = 0; // Testing only!, use the id generator module instead.

app.post("/api/shorturl", function (req, res) {
  const longUrl = req.body.url;
  const regex =
    /^(https?):\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

  if (!longUrl) {
    return res.json({ error: "URL is required." });
  }
  if (regex.test(longUrl)) {
    return res.json({ error: "Invalid URL" });
  }

  try {
    const hostname = new URL(longUrl).hostname;
    dns.lookup(hostname, function (err) {
      if (err) {
        return res.json({ error: "Invalid URL" });
      }
      id++;
      urlMap[id] = longUrl;
      res.json({ original_url: longUrl, short_url: id });
    });
  } catch (err) {
    return res.json({ error: "Invalid URL" });
  }
});

app.get("/api/shorturl/:id", function (req, res) {
  const { id } = req.params;
  const longUrl = urlMap[id];

  if (longUrl) {
    res.redirect(longUrl);
  } else {
    res.status(404).json({ error: "Invalid URL" });
  }
});
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
