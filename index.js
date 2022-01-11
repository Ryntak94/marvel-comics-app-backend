require('dotenv').config();
const md5 = require('md5')
const request = require('request-promise');
const neo4j = require('neo4j-driver')
const { query } = require('./helperFunctions/query.js')

const uri = process.env.URI
const user = process.env.USER
const password = process.env.PASSWORD


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
        creators: 12712
    },
    json: true,
}

request(options)
    .then(res   =>  {
        let results = res.data.results
        // console.log(results[0].stories)
        query(session, driver, results, 0)
    })



// Donny Cates ID: 12712
// Venom by Donny Cates Vol. 1: Rex (2018) id 25560

// if(comic.series)    {
//     session.writeTransaction(tx =>  {
//         return addSeries(tx, comic.series)
//     })
//     .then(()    =>  {
//         if(comic.collections.length > 0)   {
//             addCollections(comic.collections)
//         }
//         if(comic.creators.length > 0)   {
//             addCreators(comic.creators)
//         }
//         if(comic.characters.length > 0)   {
//             addCharacters(comic.characters)
//         }
//         if(comic.stories.length > 0)   {
//             addStories(comic.stories)
//         }
//         if(comic.events.length > 0)   {
//             addEvents(comic.events)
//         }
//         if(newComics.length > 0)    {
//             query(newComics)
//         }   else    {
//             session.close()
//             driver.close()
//         }
//     })
//     .catch(err  =>  {
//         console.log(err)
//         session.close()
//         driver.close()
//     })
    
// }   else    {
//     if(comic.collections.length > 0)   {
//         addCollections(comic.collections)
//     }
//     if(comic.creators.length > 0)   {
//         addCreators(comic.creators)
//     }
//     if(comic.characters.length > 0)   {
//         addCharacters(comic.characters)
//     }
//     if(comic.stories.length > 0)   {
//         addStories(comic.stories)
//     }
//     if(comic.events.length > 0)   {
//         addEvents(comic.events)
//     }
//     if(newComics.length > 0)    {
//         query(newComics)
//     }   else    {
//         session.close()
//         driver.close()
//     }
// }


