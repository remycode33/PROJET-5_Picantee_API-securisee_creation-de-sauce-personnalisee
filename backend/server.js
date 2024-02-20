const http = require("http");
const app = require("./app");

let normalizePort = (val) => {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

let port = normalizePort(process.env.PORT || 3000);
app.set("port", port);

let errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  let address = server.address();
  let bind = typeof address === "string" ? "pipe " + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADORINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

let server = http.createServer(app);

server.on("error", errorHandler);
server.on("listening", () => {
  let address = server.address();
  let bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log("Listening on " + bind);
});

server.listen(port);
