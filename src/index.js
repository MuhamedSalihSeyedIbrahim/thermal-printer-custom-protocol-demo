#! /usr/bin/env node
const path = require("path");
const ProtocolRegistry = require("protocol-registry");

console.log("Registering...");

// Registers the Protocol
ProtocolRegistry.register({
  protocol: "thermalPrinter", // sets protocol for your command , testproto://**
  command: `node ${path.join(__dirname, "./thermalPrinter.js")} $_URL_`, // this will be executed with a extra argument %url from which it was initiated
  override: true, // Use this with caution as it will destroy all previous Registrations on this protocol
  terminal: true, // Use this to run your command inside a terminal
  script: false,
}).then(async () => {
  console.log("Successfully registered");
});
