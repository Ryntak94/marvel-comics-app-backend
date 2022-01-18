const addComic = require("./addComic")
const addRelationship = require("./addRelationship")
const generalMatch = require("./generalMatch")
const match = require("./match")
const matchRelationship = require("./matchRelationship")
function addEvent(session, driver, event, eventId)   {
        return session.writeTransaction(tx  =>  {
            return tx.run(
                `CREATE 
                    (e:Event {
                        title: "${event.name.replace(/['"]/g, "\'")}",
                        marvelId: '${eventId}'
                    })
                RETURN
                    e
                `
            )
        })
}

module.exports.addEvents = function addEvents(session, driver, events, comic) {
    let newEvents = events
    if(events.length > 0)  {
        let event = newEvents.shift()
        let eventId = Number(event.resourceURI.slice(event.resourceURI.indexOf('events/')).replace('events/', ''))
        console.log('event')
        return match(session, driver, 'Event', 'marvelId', eventId)
        .then(res   =>  {
            if(res.records.length === 0)    {
                return addEvent(session, driver, event, eventId)
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
                    label: 'Event',
                    id: eventId
                }, 
                'Part_Of_Event'
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
                            label: 'Event',
                            id: eventId
                        }, 
                        'Part_Of_Event'
                    )
                }
            })
        })
        .then(()    =>  {
            if(newEvents.length > 0)    {
                return addEvents(session, driver, newEvents, comic)
            }
        })
    }   else    {
        return session.writeTransaction(tx  =>  {
            return tx.run('MATCH (n) return n')
        })
    }
}