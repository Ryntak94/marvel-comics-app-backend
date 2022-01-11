
const { addCharacters } = require("./addCharacters")
const { addCollections } = require("./addCollections")
const addComic = require("./addComic")
const { addCreators } = require("./addCreators")
const { addEvents } = require("./addEvents")
const addSeries = require("./addSeries")
const { addStories } = require("./addStories")
const match = require("./match")

module.exports.query = function query(session, driver, comics, number) {
    let newComics = comics
    let comic = newComics.shift()
    console.log(number)
    if(comic.format !== 'Hardcover')    {
        let format = comic.format === '' ? 'Comic' : comic.format
        session.writeTransaction(tx =>  {
            return match(tx, comic.title, format)
        })
        .then((res)    =>  {
            session.writeTransaction(tx =>  {      
                return addComic(tx, comic, res.records.length)
            })
            .then(()    =>  {
                    addSeries(session, driver, comic.series, comic)
                    .then(()    =>  {
                        addCollections(session, driver, comic.collections, comic)
                        .then(()    =>  {
                            addCreators(session, driver, comic.creators.items, comic)
                            .then(()    =>  {
                                addCharacters(session, driver, comic.characters.items, comic)
                                .then(()    =>  {
                                    addStories(session, driver, comic.stories.items, comic)
                                    .then(()    =>  {
                                        addEvents(session, driver, comic.events.items, comic)
                                        .then(()    =>  {
                                            if(newComics.length > 0)    {
                                                query(session, driver, newComics, number+1)
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
        })
        .catch(err  =>  {
            console.log(err)
            session.close()
            driver.close()
        })
    }   else    {
        query(session, driver, newComics, number+1)
    }
}
