const addRelationship = require("./addRelationship")
const generalMatch = require("./generalMatch")
const match = require("./match")
const matchRelationship = require("./matchRelationship")

function addCreator(session, driver, creator, creatorId)    {
    return session.writeTransaction(tx  =>  {
        return tx.run(
            `CREATE 
                (c:Creator {
                    title: "${creator.name.replace(/["”']/g, "\'")}", 
                    name: "${creator.name.replace(/["”']/g, "\'")}", 
                    role: "${creator.role}",
                    marvelId: "${creatorId}"
                })
            RETURN
                c
            `
        )
    })
}

module.exports.addCreators = function addCreators(session, driver, creators, comic) {
    let newCreators = creators
    if(creators.length > 0) {
        let creator = newCreators.shift()
        let creatorId = Number(creator.resourceURI.slice(creator.resourceURI.indexOf('creators/')).replace('creators/', ''))
        return match(session, driver, "Creator", 'marvelId', creatorId)
        .then((res)  =>  {
            if(res.records.length === 0)    {
                return addCreator(session, driver, creator, creatorId)
            }   else    {
                return generalMatch(session, driver)
            }
        })
        .then(()    =>  {
            return matchRelationship(session, driver, 
                {
                    matchBy: 'marvelId',
                    matchMy: 'id',
                    label: 'Comic',
                    id: comic.id
                },
                {
                    matchBy: 'marvelId',
                    matchMy: 'id',
                    label: 'Creator',
                    id: creatorId
                },
                'Created_By'
            )
            .then(res   =>  {
                if(res.records.length === 0)    {
                    return addRelationship(session, driver,
                        {
                            matchBy: 'marvelId',
                            matchMy: 'id',
                            label: 'Comic',
                            id: comic.id
                        },
                        {
                            matchBy: 'marvelId',
                            matchMy: 'id',
                            label: 'Creator',
                            id: creatorId
                        },
                        'Created_By'
                    )
                }   else    {
                    return generalMatch(session, driver)
                }
            })
        })
        .then(()    =>  {
            if(newCreators.length > 0)  {
                return addCreators(session, driver, newCreators, comic)
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