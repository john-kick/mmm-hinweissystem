const Service = require("node-windows").Service;

// Create a new service object
const svc = new Service({
  name: "MMM-Hinweissystem",
  description: "Web-App für die Soundeffekte in der MMM",
  script: require("path").join(__dirname, "src", "app.js"),
  startImmediately: true,
  restartOnError: true,
});

// Listen for the "install" event to configure the service
svc.on("install", () => {
  svc.start();
});

// Install the service
svc.install();
