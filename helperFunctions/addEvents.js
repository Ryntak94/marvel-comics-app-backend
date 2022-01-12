const addComic = require("./addComic")
const addRelationship = require("./addRelationship")
const match = require("./match")
const matchRelationship = require("./matchRelationship")
function addEvent(tx, event, records)   {
    if(records === 0)   {
        return tx.run(
            `CREATE (a:Event {title: '${event.name}'})`
        )
    }
}

module.exports.addEvents = function addEvents(session, driver, events, comic) {
    let newEvents = events
    if(events.length > 0)  {
        let event = newEvents.shift()

        return session.writeTransaction(tx =>  {
            return match(tx, event, 'Events')
        }).then((res)  =>  {
            return session.writeTransaction(tx =>  {
                addEvent(tx, event, res.records.length)
            })
            .then(()    =>  {
                return session.writeTransaction(tx  =>  {
                    return matchRelationship(tx,
                        {
                            label: "Comic",
                            title: comic.title
                        },
                        {
                            label: "Event",
                            title: event.name
                        },
                        "Part_Of_Event")
                })
                .then(res   =>  {
                    if(res.records.length === 0)    {
                        return session.writeTransaction(tx  =>  {
                            return addRelationship(tx,
                                {
                                    label: "Comic",
                                    title: comic.title
                                },
                                {
                                    label: "Event",
                                    title: event.name
                                },
                                "Part_Of_Event")
                        })
                    }   else    {
                        return session.writeTransaction(tx  =>  {
                            tx.run("MATCH (n) RETURN n")
                        })
                    }
                })
            })
            .then(()  =>  {
                if(newEvents.length > 0)   {
                    return addEvents(session, driver, newEvents, comic)
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
            return tx.run('MATCH (n) return n')
        })
    }
}