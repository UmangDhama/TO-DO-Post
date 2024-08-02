import express from "express";
import bodyParser from "body-parser";
import pg from "pg"

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "Umang@21",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];


app.get("/", async(req, res) => {
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  items = result.rows;
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  items = result.rows;
  try{
    await db.query("insert into items (id,title) values ($1,$2)",[items.length+1,item]);
    res.redirect("/");
  }
  catch(err){
    console.log(err);
  }
  // items.push({ title: item });
  // res.redirect("/");
});

app.post("/edit", async(req, res) => {
  const id = req.body.updatedItemId;
  const title = req.body.updatedItemTitle;
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  items = result.rows;
  try{
    await db.query("update items set title = $1 where id = $2",[title,id]);
    res.redirect("/");
  }
  catch(err){
    console.log(err);
  }
  
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    await db.query("UPDATE items SET id = id - 1 WHERE id > $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
