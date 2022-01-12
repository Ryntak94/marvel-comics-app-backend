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
    },
    json: true,
}

function requestRecurse(session, driver, offset, settings)    {
    return request(settings)
    .then(res   =>  {
        let results = res.data.results
        let total = res.data.total
        // console.log(res.data)
        return query(session, driver, results, offset)
        .then(()    =>  {
            return session.writeTransaction(tx =>  {
                return tx.run(`
                MATCH (o:Offset) SET o.value = ${offset+100} RETURN o.value
                `)
            })
            .then((res)    =>  {
                if(offset <= total)    {
                    let newSettings = settings
                    newSettings.qs.offset = res.records[0].get(0).low
                    return requestRecurse(session, driver, res.records[0].get(0).low, newSettings)
                }
            })
            .catch(err  =>  {
                console.log(err)
                return requestRecurse(session,driver,offset, settings)
            })
        })
        .catch(err  =>  {
            console.log(err)
            return requestRecurse(session,driver,offset, settings)
        })
    })
    .catch(err  =>  {
        console.log(err)
        return requestRecurse(session,driver,offset, settings)
    })
}


session.writeTransaction(tx =>  {
    return tx.run("MATCH (o:Offset) return o.value")
})
.then((res) =>  {
    if(res.records.length === 0)    {
        return session.writeTransaction(tx =>  {
            return tx.run("CREATE (o:Offset {value: 0}) return o.value")
        })
        .then((res)    =>  {
            let offset  =   res.records[0].get(0).low 
            options.qs.offset = offset
            return requestRecurse(session, driver, offset, options)
        })
    }   else    {
        let offset  =   res.records[0].get(0).low 
        options.qs.offset = offset
        return requestRecurse(session, driver, offset, options)

    }
})
// request(options)
//     .then(res   =>  {
//         let results = res.data.results
//         console.log(results)
//         // results.filter(comic   =>  {
//         //     return comic.title
//         // }).map(comic    =>  {
//         //     let arr = []
//         //     let title = comic.title
//         //     let number = title.match(/[#]\d*/) ? title.match(/[#]\d*/)[0] : null
//         //     if(number)  {
//         //         console.log(number)
//         //         arr.push(title.replace(number, "#" + (Number(number.slice(1))-1).toString()))
//         //         arr.push(title)
//         //         arr.push(title.replace(number, "#" + (Number(number.slice(1))+1).toString()))
//         //         console.log(arr)
//         //     }
//         // })
//         query(session, driver, results, 0)
//     })


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


