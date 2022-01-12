
const { addCharacters } = require("./addCharacters")
const { addCollections, addCollection } = require("./addCollections")
const { addComic } = require("./addComic")
const { addCreators } = require("./addCreators")
const { addEvents } = require("./addEvents")
const addSeries = require("./addSeries")
const { addStories } = require("./addStories")
const match = require("./match")

module.exports.query = function query(session, driver, comics, number) {
    let newComics = comics
    let comic = newComics.shift()
    console.log(number)
    if(comic.format && comic.format !== 'Hardcover')    {
        if(!comic.title.includes("Trade Paperback") || comic.issueNumber === 0) {
            let format = comic.format === '' ? 'Comic' : comic.format
            return addComic(session, driver, comic)
            .then(()    =>  {
                    return addSeries(session, driver, comic.series, comic)
                    .then(()    =>  {
                        return addCollections(session, driver, comic.collections, comic)
                        .then(()    =>  {
                            return addCreators(session, driver, comic.creators.items, comic)
                            .then(()    =>  {
                                return addCharacters(session, driver, comic.characters.items, comic)
                                .then(()    =>  {
                                    return addStories(session, driver, comic.stories.items, comic)
                                    .then(()    =>  {
                                        return addEvents(session, driver, comic.events.items, comic)
                                        .then(()    =>  {
                                            if(newComics.length > 0)    {
                                                return query(session, driver, newComics, number+1)
                                            }
                                        }).catch(err  =>  {
                                            console.log(err)
                                            session.close()
                                            driver.close()
                                        })
                                    }).catch(err  =>  {
                                        console.log(err)
                                        session.close()
                                        driver.close()
                                    })
                                }).catch(err  =>  {
                                    console.log(err)
                                    session.close()
                                    driver.close()
                                })
                            }).catch(err  =>  {
                                console.log(err)
                                session.close()
                                driver.close()
                            })
                        }).catch(err  =>  {
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
            return session.writeTransaction(tx =>  {
                return match(tx, comic.title, "Collection")
            })
            .then(res   =>  {
                return session.writeTransaction(tx =>  {
                    return addCollection(tx, [comic.title], res.records.length)
                })
            })
            .then(()    =>  {
                if(newComics.length > 0)    {
                    return query(session, driver, newComics, number+1)
                }
            })
        }
    }   else    {
        if(newComics.length > 0)    {
                    return query(session, driver, newComics, number+1)
                }
    }
}
