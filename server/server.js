const PROTO_PATH="./restaurant.proto";

//var grpc = require("grpc");
var grpc = require("@grpc/grpc-js");

var protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH,{
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

var restaurantProto =grpc.loadPackageDefinition(packageDefinition);

const {v4: uuidv4}=require("uuid");

const server = new grpc.Server();
const menu=[
    {
        id: "a68b823c-7ca6-44bc-b721-fb4d5312cafc",
        name: "Tomyam Gung",
        price: 500
    },
    {
        id: "34415c7c-f82d-4e44-88ca-ae2a1aaa92b7",
        name: "Somtam",
        price: 60
    },
    {
        id: "8551887c-f82d-4e44-88ca-ae2a1ccc92b7",
        name: "Pad-Thai",
        price: 120
    }
];

server.addService(restaurantProto.RestaurantService.service,{
    getAllMenu: (_,callback)=>{
        callback(null, {menu});
    },
    get: (call,callback)=>{
        let menuItem = menu.find(n=>n.id==call.request.id);

        if(menuItem) {
            callback(null, menuItem);
        }else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not found"
            });
        }
    },
    insert: (call, callback)=>{
        let menuItem=call.request;

        menuItem.id=uuidv4();
        menu.push(menuItem);
        callback(null,menuItem);
    },
    update: (call,callback)=>{
        let existingMenuItem = menu.find(n=>n.id==call.request.id);

        if(existingMenuItem){
            existingMenuItem.name=call.request.name;
            existingMenuItem.price=call.request.price;
            callback(null,existingMenuItem);
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not Found"
            });
        }
    },
    remove: (call, callback) => {
        let existingMenuItemIndex = menu.findIndex(n=>n.id==call.request.id);

        if(existingMenuItemIndex != -1){
            menu.splice(existingMenuItemIndex,1);
            callback(null,{});
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "NOT Found"
            });
        }
    }
});

server.bindAsync("127.0.0.1:30043",grpc.ServerCredentials.createInsecure(), ()=>{server.start();});
console.log("Server running at http://127.0.0.1:30043");
