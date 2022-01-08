const express = require("express");
const Redis = require("ioredis");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


const app = express();
const redis = new Redis();


const cache = (req,res,next) =>{
    const {username} = req.params;
    redis.get(username, (error,result) =>{
        if(error) throw error;
        if(result !== null){
            console.log('cached')
            return res.json(JSON.parse(result));
        }else{
            return next();
        }
    });
};

app.get("/repos/:username",cache,async(req,res)=>{

    console.log('Fetching data...');
    const {username} = req.params;
    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();
    redis.set(username,JSON.stringify(data),"ex",3600);
    return res.json(data);

});

app.listen(3000);