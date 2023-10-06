const app = require("./app"); //imports app

const { PORT = 9090 } = process.env;

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));

app.listen(9090, (err) => {
  //start listening for requests
  if (err) {
    console.log({ "error found": err });
  } else "listening on port 9090";
});
