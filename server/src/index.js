import express from "express";
import dotenv from "dotenv"

dotenv.config();
const app = express();
app.get("/health", (req, res) => {
    res.send("Running");
})

app.listen(process.env.PORT, () => {
    console.log("Listening at 3005")
});

