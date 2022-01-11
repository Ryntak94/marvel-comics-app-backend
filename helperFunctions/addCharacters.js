const addComic = require("./addComic")
const addRelationship = require("./addRelationship")
const match = require("./match")
const matchRelationship = require("./matchRelationship")

function addCharacter(tx, character, records)    {
    if(records === 0)   {
        return tx.run(
            `CREATE (a:Character {title: "${character.name}"})`
        )
    }
}

module.exports.addCharacters = function addCharacters(session, driver, characters, comic) {
    let newCharacters = characters
    if(characters.length > 0)  {
        let character = newCharacters.shift()

        return session.writeTransaction(tx =>  {
            return match(tx, character, "Character")
        }).then((res)  =>  {
            if(res.records.length === 0)    {
                
            return session.writeTransaction(tx =>  {
                addCharacter(tx, character, res.records.length)
            })
            .then(()    =>  {
                return session.writeTransaction(tx  =>  {
                    return matchRelationship(tx, {
                        label: "Comic",
                        title: comic.title
                    },
                    {
                        label: "Character",
                        title: character.name
                    },
                    "Includes_Character")
                })
                .then((res) =>  {
                    if(res.records.length === 0)    {
                        return session.writeTransaction(tx  =>  {
                            return addRelationship(tx, {
                                label: "Comic",
                                title: comic.title
                            },
                            {
                                label: "Character",
                                title: character.name
                            },
                            "Includes_Character")
                        })
                    }   else    {
                        return session.writeTransaction(tx  =>  {
                            tx.run("MATCH (n) RETURN n")
                        })
                    }
                })
            })
            .then(()  =>  {
                if(newCharacters.length > 0)   {
                    return addCharacters(session, driver, newCharacters, comic)
                }
            })
            .catch(err  =>  {
                console.log(err)
                session.close()
                driver.close()
            })
            }
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