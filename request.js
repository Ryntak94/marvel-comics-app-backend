require('dotenv').config();
const md5 = require('md5')
const request = require('request-promise');
const fs = require('fs');
const neo4j = require('neo4j-driver')

const uri = process.env.URI
const user = process.env.USER
const password = process.env.PASSWORD
let max = process.argv[2] || 999999999

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
const session = driver.session()

const timestamp = Date.now()
const options = {
    uri: "http://gateway.marvel.com/v1/public/comics",
    method: "GET",
    qs: {
        ts: timestamp,
        apikey: process.env.PUBLICKEY,
        hash: md5(timestamp+process.env.PRIVATEKEY+process.env.PUBLICKEY),
        limit: 100,
        offset: 0,
    },
    json: true,
}

const requestRecurse = (settings    =>  {
    request(settings)
    .then((res)   =>  {
        let data = JSON.stringify(res.data.results)
        let offset = settings.qs.offset

        let tenTInc = Math.floor(offset / 10000)*10000
        let oneTInc = Math.floor(offset / 1000)*1000
    
        let parent = `${tenTInc+1} - ${tenTInc + 10000}`
        let child = `${oneTInc+1} - ${oneTInc+1000}`
        let file = `${offset+1}-${offset+100}.json`
        
        fs.existsSync('jsonFiles') ?  null : fs.mkdirSync('jsonFiles')
        fs.existsSync(`jsonFiles/${parent}`)   ? null : fs.mkdirSync(`jsonFiles/${parent}`)
        fs.existsSync(`jsonFiles/${parent}/${child}`) ? null : fs.mkdirSync(`jsonFiles/${parent}/${child}`)
        fs.writeFileSync(`jsonFiles/${parent}/${child}/${file}`, data)
        console.log(res)
        if(res.data.total >= offset && offset < max) {
            let newSettings = settings
            newSettings.qs.offset = offset+100
            requestRecurse(newSettings)
        }   else    {
            return console.log('fin.')
        }
        
    })
    .catch(()   =>  {
        requestRecurse(settings)
    })
})

// requestRecurse(options)
