require('dotenv').config();
const md5 = require('md5')
const request = require('request-promise');
const neo4j = require('neo4j-driver')
const fs = require('fs');
const { query } = require('./helperFunctions/query.js')

const uri = process.env.URI
const user = process.env.USER
const password = process.env.PASSWORD


const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
const session = driver.session()

function requestRecurse(session, driver, offset)    {
    let tenTInc = Math.floor(offset / 10000)*10000
    let oneTInc = Math.floor(offset / 1000)*1000

    let parent = `${tenTInc+1} - ${tenTInc + 10000}`
    let child = `${oneTInc+1} - ${oneTInc+1000}`
    let file = `${offset+1}-${offset+100}.json`
    let filePath = `jsonFiles/post2013/${parent}/${child}/${file}`
    if(fs.existsSync(filePath))    {
        let results = JSON.parse(fs.readFileSync(filePath))
        return query(session, driver, results, offset)
        .then(()    =>  {
            return session.writeTransaction(tx =>  {
                return tx.run(`
                    MATCH 
                        (o:Offset) 
                    SET 
                        o.value = ${offset+100} 
                    RETURN 
                        o.value
                `)
            })
            .then((res)    =>  {
                offset = res.records[0].get(0).low
                return requestRecurse(session, driver, res.records[0].get(0).low)
            })
            .catch(err  =>  {
                console.log(err)
                return requestRecurse(session,driver,offset)
            })
        })
        .catch(err  =>  {
            console.log(err)
            // return requestRecurse(session,driver,offset)
        })
    }
    return '.fin'
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
            return requestRecurse(session, driver, offset)
        })
    }   else    {
        let offset  =   res.records[0].get(0).low 
        return requestRecurse(session, driver, offset)

    }
})