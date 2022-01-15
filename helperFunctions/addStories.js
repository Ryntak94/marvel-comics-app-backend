const { session } = require("neo4j-driver")
const addComic = require("./addComic")
const addRelationship = require("./addRelationship")
const generalMatch = require("./generalMatch")
const match = require("./match")
const matchRelationship = require("./matchRelationship")

function addStory(session, driver, story, storyId)  {
    return session.writeTransaction(tx  =>  {
        return tx.run(
            `CREATE 
                (a:Story {
                    title: "${story.name.replace(/['"]/g, "\'")}",
                    type: "${story.type}",
                    marvelId: '${storyId}'
                })`
        )
    })   
}

module.exports.addStories = function addStories(session, driver, stories, comic) {
    let newStories = stories
    if(stories.length > 0)  {
        let story = newStories.shift()
        let storyId = Number(story.resourceURI.slice(story.resourceURI.indexOf('stories/')).replace('stories/', ''))
        return match(session, driver, 'Story', 'marvelId', storyId)
        .then(res   =>  {
            if(res.records.length === 0)    {
                return addStory(session, driver, story, storyId)
            }
        })
        .then(()    =>  {
            return matchRelationship(session, driver, 
                {
                    matchBy: 'marvelId',
                    matcyMy: 'id',
                    label: 'Comic',
                    id: comic.id
                },
                {
                    matchBy: 'marvelId',
                    matcyMy: 'id',
                    label: 'Story',
                    id: storyId
                }, 
                'Part_Of_Story'
            )
            .then(res   =>  {
                if(res.records.lenght === 0)    {
                    return addRelationship(session, driver, 
                        {
                            matchBy: 'marvelId',
                            matcyMy: 'id',
                            label: 'Comic',
                            id: comic.id
                        },
                        {
                            matchBy: 'marvelId',
                            matcyMy: 'id',
                            label: 'Story',
                            id: storyId
                        }, 
                        'Part_Of_Story'
                    )
                }
            })
            .then(()    =>  {
                if(newStories.length > 0)   {
                    return addStories(session, driver, newStories, comic)
                }   else    {
                    return generalMatch(session, driver)
                }
            })
        })
    }   else    {
        return generalMatch(session, driver)
    }
}