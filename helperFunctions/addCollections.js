const addRelationship = require("./addRelationship")
const match = require("./match")
const matchRelationship = require("./matchRelationship")

function addCollection(tx, collection, records) {
    if(records === 0)   {
        return tx.run(
            `CREATE (a:Collection {title: "${collection.name}"})`
        )
    }
}

module.exports.addCollections = function addCollections(session, driver, collections, comic) {
    let newCollections = collections
    if(collections.length > 0)  {
        let collection = newCollections.shift()

        return session.writeTransaction(tx =>  {
            return match(tx, collection, "Collection")
        }).then((res)  =>  {
            return session.writeTransaction(tx =>  {
                addCollection(tx, collection, res.records.length)
            })
            .then(()  =>  {
                return session.writeTransaction(tx  =>  {
                    return matchRelationship(tx, {
                        label: "Comic",
                        title: comic.title
                    },
                    {
                        label: "Collection",
                        title: collection.name
                    },
                    "Collected_By")
                })
                
            })
            .then(res   =>  {
                if(res.records.length === 0)    {
                    return session.writeTransaction(tx  =>  {
                        return addRelationship(tx, {
                            label: "Comic",
                            title: comic.title
                        },
                        {
                            label: "Collection",
                            title: collection.name
                        },
                        "Collected_By")
                    })
                }   else    {
                    return session.writeTransaction(tx  =>  {
                        tx.run("MATCH (n) RETURN n")
                    })
                }
            })
            .then(()    =>  {
                if(newCollections.length > 0)   {
                    return addCollections(session, driver, newCollections, comic)
                }
            })
            .catch(err  =>  {
                console.log(err)
                session.close()
                driver.close()
            })
        })
        .catch(err  =>  {
            console.log(err)
            session.close()
            driver.close()
        })
    }   else    {
        return session.writeTransaction(tx  =>  {
            return tx.run("MATCH (n) return n")
        })
    }
}