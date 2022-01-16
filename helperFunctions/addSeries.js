const addRelationship = require("./addRelationship")
const generalMatch = require("./generalMatch")
const match = require("./match")
const matchRelationship = require("./matchRelationship")

module.exports = function (session, driver, series, comic)  {
    let seriesId = Number(series.resourceURI.slice(series.resourceURI.indexOf('series/')).replace('series/', ''))
    return match(session, driver, 'Series', 'marvelId', seriesId)
        .then((res) =>  {
            if(res.records.length === 0)    {
                return session.writeTransaction(tx =>  {
                    return tx.run(
                        `CREATE 
                            (s:Series {
                                title: "${series.name.replace(/["]/g, "\'")}",
                                marvelId: "${seriesId}"
                            })
                        RETURN
                            s
                        `
                    )
                })
                .then(()    =>  {
                    return addRelationship(session, driver,
                        {
                            matchBy: 'marvelId',
                            matchMy: 'id',
                            label: "Comic",
                            id: comic.id
                        },
                        {
                            matchBy: 'marvelId',
                            matchMy: 'id',
                            label: "Series",
                            id: seriesId
                        },
                        "Part_Of_Series"
                    )
                })
            }   else    {
                return matchRelationship(session, driver,
                    {
                        matchBy: 'marvelId',
                        matchMy: 'id',
                        label: "Comic",
                        id: comic.id
                    },
                    {
                        matchBy: 'marvelId',
                        matchMy: 'id',
                        label: "Series",
                        id: seriesId
                    },
                    "Part_Of_Series"
                )
                .then(res   =>  {
                    if (res.records.length === 0)  {
                        return addRelationship(session, driver,
                            {
                                matchBy: 'marvelId',
                                matchMy: 'id',
                                label: "Comic",
                                id: comic.id
                            },
                            {
                                matchBy: 'marvelId',
                                matchMy: 'id',
                                label: "Series",
                                id: seriesId
                            },
                            "Part_Of_Series"
                        )
                    }   else    {
                        return generalMatch(session, driver)
                    }
                })
            }
        })
}