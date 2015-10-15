import express from "express";
import routes from "./express/routes/";

let app = express();
const port = process.env.PORT || 3000;

app.use(require('connect-livereload')());

/* Set up static files */
app.use(express.static(__dirname + '/dist'));

app.use(routes);

app.listen(port, () => {
  console.log(`Server running on port :${port}`);
});
