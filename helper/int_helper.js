const redis = require("redis");

const client = redis.createClient({
    port:6379,
    host:"127.0.0.1"
});

client.on("connect", ()=>{
    console.log("Client is connected.");
})


client.on("ready", ()=>{
    console.log("Client connected is ready to use.");
})

client.on("error", (err)=>{
    console.log(err.message);
})


client.on("end", ()=>{
    console.log("Client is disconnected from redis.");
})

process.on('SIGINT',() =>{
    client.quit()
})

module.exports = client;