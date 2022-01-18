const { session } = require("neo4j-driver")
const addComic = require("./addComic")
const addRelationship = require("./addRelationship")
const generalMatch = require("./generalMatch")
const match = require("./match")
const matchRelationship = require("./matchRelationship")

function addCharacter(session, driver, character, characterId)    {
    return session.writeTransaction(tx =>  {
        return tx.run(
            `CREATE 
                (c:Character {
                    title: "${character.name}",
                    marvelId: "${characterId}"
                })
            RETURN
                c
            `
        )
    })
}

module.exports.addCharacters = function addCharacters(session, driver, characters, comic) {
    let newCharacters = characters
    if(characters.length > 0)  {
        let character = newCharacters.shift()
        let characterId = Number(character.resourceURI.slice(character.resourceURI.indexOf('characters/')).replace('characters/', ''))
            return match(session, driver, "Character", "marvelId", characterId)
            .then(res   =>  {
                if(res.records.length === 0)    {
                    return addCharacter(session, driver, character, characterId)
                }   else    {
                    return generalMatch(session, driver)
                }
            })
            .then(()    =>  {
                return matchRelationship(session, driver, 
                    {
                        matchBy: 'marvelId',
                        matchMy: 'id',
                        label: "Character",
                        id: characterId
                    },
                    {
                        matchBy: 'marvelId',
                        matchMy: 'id',
                        label: "Comic",
                        id: comic.id
                    },
                    "Character_In"
                )
                .then(res   =>  {
                    if(res.records.length === 0)    {
                        return addRelationship(session, driver, 
                            {
                                matchBy: 'marvelId',
                                matchMy: 'id',
                                label: "Character",
                                id: characterId
                            },
                            {
                                matchBy: 'marvelId',
                                matchMy: 'id',
                                label: "Comic",
                                id: comic.id
                            },
                            "Character_In"
                        )
                    }   else    {
                        return generalMatch(session, driver)
                    }
                })
            })
            .then(()    =>  {
                if(newCharacters.length > 0)    {
                    return addCharacters(session, driver, newCharacters, comic)
                }   else    {
                    return generalMatch(session, driver)
                }
            })
            
    }   else    {
        return generalMatch(session, driver)
    }
}