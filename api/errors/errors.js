app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.code === "22p02") {
    res.status(400).send({ msg: "invalid request" });
  } else {
    res.status(500).send({ msg: "internal server error" });
  }
});
