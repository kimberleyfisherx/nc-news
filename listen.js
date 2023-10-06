const app = require("./app"); //imports app

app.listen(9090, (err) => {
  //start listening for requests
  if (err) {
    console.log({ "error found": err });
  } else "listening on port 9090";
});
