
const e = require("express")
const { addCharacters } = require("./addCharacters")
const { addCollections, addCollection } = require("./addCollections")
const { addComic } = require("./addComic")
const { addCreators } = require("./addCreators")
const { addEvents } = require("./addEvents")
const addSeries = require("./addSeries")
const { addStories } = require("./addStories")
const { addVariant } = require("./addVariant")
const generalMatch = require("./generalMatch")
const match = require("./match")

let variantRegex = /[\\(][\w*\d*\s*]*(Variant)[\w*\d*\s*]*[\\)]/

module.exports.query = function query(session, driver, comics, number) {
    let newComics = comics
    let comic = newComics.shift()
    let variantMatch = comic.title.match(variantRegex)
    console.log(number)

    if(comic.format && comic.format !== 'Hardcover' && !comic.title.includes("Hardcover"))    {
        if(variantMatch !== null)    {
            let nonVariantTitle = comic.title.replace(variantRegex, '').trim()
            return addVariant(session, driver, comic, nonVariantTitle)
                .then(()    =>  {
                    if(newComics.length > 0)    {
                        return query(session, driver, newComics, number+1)
                    }   else    {
                        return generalMatch(session, driver)
                    }
                })
        }   else    {
            if(
                !comic.title.includes("Trade Paperback") && 
                !(comic.issueNumber === 0) && 
                !comic.title.includes("vol") && 
                !comic.title.includes("Vol") &&
                !comic.title.includes("VOL") &&
                !comic.title.includes("Volume") &&
                !comic.title.includes("volume") &&
                !comic.title.includes("Digest") &&
                !comic.title.includes("digest") &&
                !comic.title.includes("tpb") &&
                !comic.title.includes("TPB") &&
                !comic.title.includes("Graphic Novel")
            ) {
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
                                                }   else    {
                                                    return generalMatch(session, driver)
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
                let collectionId = Number(comic.resourceURI.slice(comic.resourceURI.indexOf('comics/')).replace('comics/', ''))
                return match(session, driver, "Collection", 'marvelId', collectionId)
                .then(res   =>  {
                    if(res.records.length === 0)    {
                        return addCollection(session, driver, {name: comic.title}, collectionId)
                    }   else    {
                        return generalMatch(session, driver)
                    }
                })
                .then(()    =>  {
                    if(newComics.length > 0)    {
                        return query(session, driver, newComics, number+1)
                    }   else    {
                        return generalMatch(session, driver)
                    }
                })
            }
        }
        
    }   else    {
        if(newComics.length > 0)    {
            return query(session, driver, newComics, number+1)
        }   else{
            return generalMatch(session, driver)
        }
    }
}
