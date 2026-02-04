const express = require("express");
const { readFile } = require("fs").promises;

const cors = require("cors");
const corsOption = {
  origin: ["http://localhost:5173", "https://yourdomain.com"],
};

const app = express();
app.use(cors(corsOption));
app.use(express.json());

app.post("/add", async (request, response) => {
  const { num1, num2 } = request.body;
  const n1 = parseFloat(num1);
  const n2 = parseFloat(num2);

  if (isNaN(n1) || isNaN(n2)) {
    return response.status(400).json({ error: "Invalid numbers" });
  }

  response.json({ result: n1 + n2 });
});

app.listen(process.env.PORT || 3000, () => console.log("Server is running..."));
