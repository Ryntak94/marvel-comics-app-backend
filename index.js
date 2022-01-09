require('dotenv').config();
const md5 = require('md5')
const request = require('request-promise');
const neo4j = require('neo4j-driver')

const comicKeys = ['series', 'collections', 'creators', 'characters', 'stories', 'events']

const uri = process.env.uri
const user = process.env.user
const password = process.env.password


const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
const session = driver.session()

function match(tx, title, dataType)  {
    return tx.run(
        `MATCH (a:${dataType.split(" ").join("")} {title: '${title}'}) RETURN a`,
    )
}

function addComic(tx, comic) {
    return tx.run(
        `CREATE (a:Comic {title: ${comic.title}, issueNumber: ${comic.issueNumber}, urls: ${comic.urls}, series: ${comic.series.name}}) RETURN a`
    )
}

function updateComic(tx, comic) {
    return tx.run(
        `MATCH (a:Comic {title: ${comic.title}}) SET a.issueNumber: ${comic.issueNumber}, a.urls: ${comic.urls}, a.series: ${comic.series.name} RETURN a`
    )
}

function addSeries(tx, series)  {
    console.log(series)
    return tx.run(
        `CREATE (a:Series {title: ${series.name}})`
    )
}

function addCollection(tx, collection) {
    return tx.run(
        `CREATE (a:Collection {title: ${collection.name}})`
    )
}

function addCollections(collections) {
    let newCollections = collections
    let collection = newCollections.shift()
    session.writeTransaction(tx =>  {
        addCollection(tx, collection)
    })
    .then(()  =>  {
        if(newCollections.length > 0)   {
            addCollections(tx, newCollections)
        }
    })
    .catch(err  =>  {
        console.log(err)
        session.close()
        driver.close()
    })
}

function addCreator(tx, creator)    {
    return tx.run(
        `CREATE (a:Creator {title: ${creator.name}, role: ${creator.role}})`
    )
}

function addCreators(creators) {
    let newCreators = creators
    let creator = newCreators.shift()
    session.writeTransaction(tx =>  {
        addCreator(tx, creator)
    })
    .then(()  =>  {
        if(newCreators.length > 0)   {
            addCreators(tx, newCreators)
        }
    })
    .catch(err  =>  {
        console.log(err)
        session.close()
        driver.close()
    })
}

function addCharacter(tx, character)    {
    return tx.run(
        `CREATE (a:Character {title: ${character.name}})`
    )
}

function addCharacters(characters) {
    let newCharacters = characters
    let character = newCharacters.shift()
    session.writeTransaction(tx =>  {
        addCharacter(tx, character)
    })
    .then(()  =>  {
        if(newCharacters.length > 0)   {
            addCharacters(tx, newCharacters)
        }
    })
    .catch(err  =>  {
        console.log(err)
        session.close()
        driver.close()
    })
}

function addStory(tx, story)  {
    return tx.run(
        `CREATE (a:Story {title: ${story.name}, type: ${story.type}})`
    )
}

function addStories(tx, stories) {
    let newStories = stories
    let story = newStories.shift()
    session.writeTransaction(tx =>  {
        addStory(tx, story)
    })
    .then(()  =>  {
        if(newStories.length > 0)   {
            addStories(tx, newStories)
        }
    })
    .catch(err  =>  {
        console.log(err)
        session.close()
        driver.close()
    })
}

function addEvent(tx, event)   {
    return tx.run(
        `CREATE (a:Event {title: ${event.name}})`
    )
}

function addEvents(tx, stories) {
    let newEvents = events
    let event = newEvents.shift()
    session.writeTransaction(tx =>  {
        addEvent(tx, event)
    })
    .then(()  =>  {
        if(newEvents.length > 0)   {
            addEvents(tx, newEvents)
        }
    })
    .catch(err  =>  {
        console.log(err)
        session.close()
        driver.close()
    })
}

const timestamp = Date.now()
const options = {
    uri: "http://gateway.marvel.com/v1/public/comics",
    method: "GET",
    qs: {
        ts: timestamp,
        apikey: process.env.PUBLICKEY,
        hash: md5(timestamp+process.env.PRIVATEKEY+process.env.PUBLICKEY),
        limit: 10,
    },
    json: true
}

function query(comics)    {
    let newComics = comics
    let comic = newComics.shift()
    if(comic.format !== 'Hardcover')    {
        let format = comic.format ? comic.format : 'comic'
        session.writeTransaction(tx =>  {
            return match(tx, comic.title, format)
        })
        .then((res)   =>  {
            if(res.records.length === 0)    {
                session.writeTransaction(tx =>  {
                    return addComic(tx, comic)
                })
            }   else    {
                session.writeTransaction(tx =>  {
                    return updateComic(tx, comic)
                })
            }
            if(comic.series)    {
                console.log('here')
                session.writeTransaction(tx =>  {
                    return addSeries(tx, comic.series)
                })
                .then(()    =>  {
                    if(comic.collections.length > 0)   {
                        addCollections(comic.collections)
                    }
                    if(comic.creators.length > 0)   {
                        addCreators(comic.creators)
                    }
                    if(comic.characters.length > 0)   {
                        addCharacters(comic.characters)
                    }
                    if(comic.stories.length > 0)   {
                        addStories(comic.stories)
                    }
                    if(comic.events.length > 0)   {
                        addEvents(comic.events)
                    }
                    if(newComics.length > 0)    {
                        query(newComics)
                    }   else    {
                        session.close()
                        driver.close()
                    }
                })
                .catch(err  =>  {
                    console.log(err)
                    session.close()
                    driver.close()
                })
                
            }   else    {
                if(comic.collections.length > 0)   {
                    addCollections(comic.collections)
                }
                if(comic.creators.length > 0)   {
                    addCreators(comic.creators)
                }
                if(comic.characters.length > 0)   {
                    addCharacters(comic.characters)
                }
                if(comic.stories.length > 0)   {
                    addStories(comic.stories)
                }
                if(comic.events.length > 0)   {
                    addEvents(comic.events)
                }
                if(newComics.length > 0)    {
                    query(newComics)
                }   else    {
                    session.close()
                    driver.close()
                }
            }
        })
        .catch(err  =>  {
            console.log(err)
            session.close()
            driver.close()
        })
    }
}

request(options)
    .then(res   =>  {
        let results = res.data.results
        query(results)
    })



// Donny Cates ID: 12712
// Venom by Donny Cates Vol. 1: Rex (2018) id 25560