import express from "express";

const PORT = 5000;

const app: express.Application = express();

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello world!");
});

app.listen(PORT, () => {
  console.log("Server listening on http://localhost:" + PORT);
});
