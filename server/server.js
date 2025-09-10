const connectDB = require("./db");
const PROTO_PATH = "./restaurant.proto";

var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");
var Menu = require("./menu");

connectDB();

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

var restaurantProto = grpc.loadPackageDefinition(packageDefinition);

const { v4: uuidv4 } = require("uuid");

const server = new grpc.Server();

server.addService(restaurantProto.RestaurantService.service, {
  getAllMenu: async (_, callback) => {
    const menu = await Menu.find();
    callback(null, { menu });
  },
  get: async (call, callback) => {
    const menuItem = await Menu.findById(call.request.id);
    if (menuItem) {
      callback(null, menuItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  insert: async (call, callback) => {
    let menuItem = call.request;
    menuItem.id = uuidv4();
    await Menu.create(menuItem);
    callback(null, menuItem);
  },
  update: async (call, callback) => {
    let existingMenuItem = await Menu.findById(call.request.id);
    if (existingMenuItem) {
      existingMenuItem.name = call.request.name;
      existingMenuItem.price = call.request.price;
      callback(null, existingMenuItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not Found",
      });
    }
  },
  remove: async (call, callback) => {
    const id = call.request.id;
    const name = call.request.name;
    const price = call.request.price;
    try {
      const menuItem = await Menu.findByIdAndDelete(id, {
        name: name,
        price: price,
      });

      if (!menuItem) {
        callback({
          code: grpc.status.NOT_FOUND,
          details: "Menu not found",
        });
      }

      callback(null, menuItem);
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        details: "Error occured",
      });
    }
  },
});

server.bindAsync(
  "127.0.0.1:30043",
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start();
  }
);
console.log("Server running at http://127.0.0.1:30043");
