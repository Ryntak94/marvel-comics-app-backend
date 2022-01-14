const addComic = require("./addComic")
const addRelationship = require("./addRelationship")
const match = require("./match")
const matchRelationship = require("./matchRelationship")

function addStory(tx, story, records)  {
    if(records === 0)   {
        return tx.run(
            `CREATE (a:Story {title: "${story.name.replace(/['"]/g, "\'")}", type: "${story.type}"})`
        )
    }
}

module.exports.addStories = function addStories(session, driver, stories, comic) {
    let newStories = stories
    if(stories.length > 0)  {
        let story = newStories.shift()

        return session.writeTransaction(tx =>  {
            return match(tx, story.name, "Story")
        }).then((res)  =>  {
            return session.writeTransaction(tx =>  {
                addStory(tx, story, res.records.length)
            })
            .then(()    =>  {
                return session.writeTransaction(tx  =>  {
                    return matchRelationship(tx, {
                        label: "Comic",
                        title: comic.title
                    },
                    {
                        label: "Story",
                        title: story.name
                    },
                    "Part_Of_Story")
                })
                .then(res   =>  {
                    if(res.records.length === 0)    {
                        return session.writeTransaction(tx =>  {
                            return addRelationship(tx, {
                                label: "Comic",
                                title: comic.title
                            },
                            {
                                label: "Story",
                                title: story.name
                            },
                            "Part_Of_Story")
                        })
                    }   else    {
                        return session.writeTransaction(tx  =>  {
                            tx.run("MATCH (n) RETURN n")
                        })
                    }
                })
            })
            .then(()  =>  {
                if(newStories.length > 0)   {
                    return addStories(session, driver, newStories, comic)
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