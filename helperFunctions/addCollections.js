const { session } = require("neo4j-driver")
const addRelationship = require("./addRelationship")
const generalMatch = require("./generalMatch")
const match = require("./match")
const matchRelationship = require("./matchRelationship")

function addCollection(session, driver, collection, collectionId) {
    return session.writeTransaction(tx =>  {
        return tx.run(`
            CREATE 
                (c:Collection {
                    title: "${collection.name}",
                    marvelId: "${collectionId}"
                })
            RETURN
                c
        `)
    })
}

module.exports.addCollection = addCollection

module.exports.addCollections = function addCollections(session, driver, collections, comic) {
    let newCollections = collections
    if(collections.length > 0)  {
        let collection = newCollections.shift()
        let collectionId = Number(collection.resourceURI.slice(collection.resourceURI.indexOf('comics/')).replace('comics/', ''))
        return match(session, driver, "Collection", 'marvelId', collectionId)
            .then((res)  =>  {
                if (res.records.length === 0)  {
                    return addCollection(session, driver, collection, collectionId)
                    .then(()  =>  {
                            return addRelationship(session, driver, 
                                {
                                    matchBy: 'marvelId',
                                    matchMy: 'id',
                                    label: "Comic",
                                    id: comic.id
                                },
                                {
                                    matchby: 'marvelId',
                                    matchMy: 'id',
                                    label: "Collection",
                                    id: collectionId
                                },
                                "Collected_By"
                            )
                
                    })
                }   else    {
                    return matchRelationship(session, driver, 
                        {
                            matchBy: 'marvelId',
                            matchMy: 'id',
                            label: "Comic",
                            id: comic.id
                        },
                        {
                            matchby: 'marvelId',
                            matchMy: 'id',
                            label: "Collection",
                            id: collectionId
                        }, 
                        'Collected_By'
                    )
                    .then(res   =>  {
                        if(res.records.length === 0)    {
                            return addRelationship(session, driver, 
                                {
                                    matchBy: 'marvelId',
                                    matchMy: 'id',
                                    label: "Comic",
                                    id: comic.id
                                },
                                {
                                    matchby: 'marvelId',
                                    matchMy: 'id',
                                    label: "Collection",
                                    id: collectionId
                                }, 
                                'Collected_By'
                            )
                        }   else    {
                            return generalMatch(session, driver)
                        }
                    })
                }
            })
            .then(()    =>  {
                if(newCollections.length > 0)   {
                    return addCollections(session, driver, newCollections, comic)
                }   else    {
                    return generalMatch(session, driver)
                }
            })
            .catch(err  =>  {
                console.log(err)
                session.close()
                driver.close()
            })
    }   else    {
        return generalMatch(session, driver)
    }
}