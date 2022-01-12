const addRelationship = require("./addRelationship")
const match = require("./match")
const matchRelationship = require("./matchRelationship")

function addCreator(tx, creator, records)    {
    if(records === 0)   {
        return tx.run(
            `CREATE (a:Creator {title: "${creator.name.replace(/"/g, "\'").replace(/”/g, "\'")}", name: "${creator.name.replace(/"/g, "\'").replace(/”/g, "\'")}", role: "${creator.role}"})`
        )
    }
}

module.exports.addCreators = function addCreators(session, driver, creators, comic) {
    let newCreators = creators
    if(creators.length > 0) {
        let creator = newCreators.shift()
        return session.writeTransaction(tx =>  {
            return match(tx, creator.name, "Creator")
        }).then((res)  =>  {
            return session.writeTransaction(tx =>  {
                addCreator(tx, creator, res.records.length)
            })
            .then(()    =>  {
                return session.writeTransaction(tx  =>  {
                    return matchRelationship(tx, {
                        label: "Comic",
                        title: comic.title
                    },
                    {
                        label: "Creator",
                        title: creator.name
                    },
                    "Created_By")
                })
                .then((res)    =>  {
                    if(res.records.length === 0)  {
                        return session.writeTransaction(tx  =>  {
                            addRelationship(tx, {
                                label: "Comic",
                                title: comic.title
                            },
                            {
                                label: "Creator",
                                title: creator.name
                            },
                            "Created_By"
                            )
                        })
                    }   else    {
                        return session.writeTransaction(tx  =>  {
                            tx.run("MATCH (n) RETURN n")
                        })
                    }
                })
            })
            .then(()  =>  {
                if(newCreators.length > 0)   {
                    return addCreators(session, driver, newCreators, comic)
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