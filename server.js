const express = require('express')
const app = express()
const PORT = process.env.SERVERPORT || 8080
const cors = require('cors')
const neo4j = require('neo4j-driver')
require('dotenv').config();
const uri = process.env.URI
const user = process.env.USER
const password = process.env.PASSWORD

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

app.use(cors())

app.listen(PORT,    ()  =>  {
    console.log(` ========Listening on http://localhost:${PORT}======== `)
})

app.get('/',    (req, res)  =>  {
    const session = driver.session()
    session.writeTransaction(tx =>  {
        return tx.run(`
        MATCH 
            (n:Comic)-[r:Next_Issue]-(c:Comic), 
            (n:Comic)-[e]-(d:Creator) 
        WHERE n.title CONTAINS 'Venom' 
        AND c.title CONTAINS "Venom"
        AND d.title CONTAINS 'Donny'
        RETURN n, r
        `)
    }).then(response =>  {
        // console.log(response.records.length)
        let nodesFilterArr = []
        let linksFilterArr = []
        let nodeArr = []
        let nodes = response.records.map(record => {
            // console.log(record['_fields'])
            let node = {}
            node.id = record['_fields'][0].identity.low
            node.properties = {}
            node.name = record['_fields'][0].properties.title
            node.read = record['_fields'][0].identity.low % 2
            node.properties.issueNumber = record['_fields'][0].properties.issueNumber.low

            return node
        }).filter(node  =>  {
            let bool = !nodesFilterArr.includes(node.id)
            nodesFilterArr.push(node.id)
            bool ? nodeArr.push(node.id) : null
            return bool
        })
        let links = response.records.map(record => {
            let link = {}
            link.id = record['_fields'][1].identity.low,
            link.source = record['_fields'][1].start.low,
            link.target = record['_fields'][1].end.low,
            link.linkLabel = record['_fields'][1].type
            // node.issueNumber = record['_fields'][1].properties.issueNumber.low
            return link
        }).filter(link  =>  {
            if(nodeArr.includes(link.source) && nodeArr.includes(link.target) && !linksFilterArr.includes(link.id))  {
                linksFilterArr.push(link.id)
                return true
            }   else    {
                return false
            }
        })
        console.log(nodeArr)
        // console.log({nodes, links})
        return res.status(200).json({nodes, links})
    })
    .then(()    =>  {
        session.close()
    })
})