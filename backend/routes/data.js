const express = require("express");
const router = express.Router();
const dbClient = require("../config/database");

router.post("/add", async (req, res) => {
  const { num1, num2 } = req.body;
  const n1 = parseFloat(num1);
  const n2 = parseFloat(num2);

  if (isNaN(n1) || isNaN(n2)) {
    return res.status(400).json({ error: "Invalid numbers" });
  }

  res.json({ result: n1 + n2 });
});

router.get("/fetchData", async (req, res) => {
  try {
    const result = await dbClient.query("SELECT * FROM demotable");
    res.json({ data: result.rows });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
