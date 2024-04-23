import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  host: "localhost",
  port: "5432",
  user: "postgres",
  password: "1234567",
  database: "secrets"
});

db.connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch(err => console.error("Error connecting to PostgreSQL database", err));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register",async (req, res) => {
  const data = {
    email: req.body.username,
    password: req.body.password
  };
  console.log(data);

  const response = await db.query(`SELECT ID FROM USERS WHERE EMAIL = '${data.email}';`);
  console.log(response.rows);
  if (response.rows.length==0) {
    await db.query(`INSERT INTO USERS (EMAIL, PASSWORD) VALUES ('${data.email}', '${data.password}');`);
    res.render("secrets.ejs");
  } else {
    res.render("register.ejs", {error: "This email already exists"});
  }
});

app.post("/login", async (req, res) => {
  const data = {
    email: req.body.username,
    password: req.body.password
  };
  console.log("data= ",data);

  const response =  await db.query(`SELECT email,password FROM USERS WHERE EMAIL = '${data.email}';`);
  try {
    if (response.rows[0].email == data.email) {
      console.log(`Your email is valid`);
      if (response.rows[0].password == data.password) {
        console.log(`Your password is valid`);
        res.render("secrets.ejs");
      } else{
        console.log(`You entered invalid password`);
        res.render("login.ejs", {error: "You entered invalid password"});
      }
    }
  } catch (error) {
        console.log(`This email does not exists`);
        res.render("login.ejs", {error: "This email does not exist"});
  }
  res.render("login.ejs");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
