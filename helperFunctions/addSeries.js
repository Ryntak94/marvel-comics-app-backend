const addRelationship = require("./addRelationship")
const match = require("./match")
const matchRelationship = require("./matchRelationship")

module.exports = function (session, driver, series, comic)  {
    return session.writeTransaction((tx) =>  {
        return match(tx, series.name, 'Series')
    })
    .then((res) =>  {
        if(res.records.length === 0)    {
            return session.writeTransaction(tx =>  {
                return tx.run(
                    `CREATE (a:Series {title: "${series.name}"})`
                )
            })
            .then(()    =>  {
                return session.writeTransaction(tx =>  {
                    return matchRelationship(tx, {
                        label: "Comic",
                        title: comic.title
                    },
                    {
                        label: "Series",
                        title: series.name
                    },
                    "Part_Of")
                })
                .then((res)    =>  {
                    if(res.records.length === 0)    {
                        return session.writeTransaction(tx  =>  {
                            return addRelationship(tx, {
                                label: "Comic",
                                title: comic.title
                            },
                            {
                                label: "Series",
                                title: series.name
                            },
                            "Part_Of")
                        })
                    }   else    {
                        return session.writeTransaction(tx  =>  {
                            tx.run("MATCH (n) RETURN n")
                        })
                    }
                })
            })
        }   
    })
}