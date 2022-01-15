const e = require("express")
const { session } = require("neo4j-driver")
const addRelationship = require("./addRelationship")
const generalMatch = require("./generalMatch")
const match = require("./match")
const matchRelationship = require("./matchRelationship")

function addVariant(session, driver, variant, nonVariantTitle) {
    let urls = variant.urls.filter(url    =>  {
        return url.type === "detail"
    })
    
    url = urls.length > 0 ? urls[0].url : variant.urls.length > 0 ? variant.urls[0].url : ''
    return match(session, driver, 'Variant', 'marvelId', variant.id)
    .then(res   =>  {
        if(res.records.length === 0)    {
            return session.writeTransaction(tx =>  {
                return tx.run(`
                    CREATE
                        (n:Variant {
                            title: "${variant.title}",
                            isbn: "${variant.isbn}",
                            marvelId: "${variant.id}",
                            url: "${url}"
                        })
                    RETURN 
                        n
                `)
            })
            .then(()    =>  {
                return match(session, driver, 'Comic', 'title', nonVariantTitle)
                .then((res)    =>  {
                    if(res.records.length !== 0)    {
                        return matchRelationship(session, driver,
                            {
                                matchBy: 'marvelId',
                                matchMy: 'id',
                                id: variant.id,
                                label: 'Variant'
                            },
                            {
                                matchBy: 'title',
                                matchMy: 'id',
                                title: nonVariantTitle,
                                label: 'Comic'
                            },
                            'Variant_Of'
                        )
                        .then((res) =>  {
                            if(res.records.length === 0)    {
                                return addRelationship(session, driver,
                                    {
                                        matchBy: 'marvelId',
                                        matchMy: 'id',
                                        id: variant.id,
                                        label: 'Variant'
                                    },
                                    {
                                        matchBy: 'title',
                                        matchMy: 'title',
                                        title: nonVariantTitle,
                                        label: 'Comic',
                                    },
                                    'Variant_Of'
                                )
                            }
                        })
                    }
                })
            })
        }   else    {
            return session.writeTransaction(tx =>  {
                return tx.run(`
                    MATCH
                        (n:Variant)
                    WHERE 
                        n.marvelId = "${variant.id}"
                    SET
                        n.title = "${variant.title}",
                        n.isbn = "${variant.isbn}",
                        n.marvelId = "${variant.id}",
                        n.url = "${url}"
                    RETURN
                        n
                `)
            })
            .then(()    =>  {
                return match(session, driver, 'Comic', 'title', nonVariantTitle)
                .then((res)    =>  {
                    if(res.records.length !== 0)    {
                        return matchRelationship(session, driver,
                            {
                                id: variant.id,
                                label: 'Variant',
                            },
                            {
                                title: nonVariantTitle,
                                label: 'Comic',
                            },
                            'Variant_Of'
                        )
                        .then((res) =>  {
                            if(res.records.length === 0)    {
                                return addRelationship(session, driver,
                                    {
                                        id: variant.id,
                                        label: 'Variant',
                                    },
                                    {
                                        title: nonVariantTitle,
                                        label: 'Comic',
                                    },
                                    'Variant_Of'
                                )
                            }
                        })
                    }   else    {
                        return generalMatch(session, driver)
                    }
                })
            })
        }
    })
    .catch(err =>  {
        console.log(err)
    })
}

module.exports.addVariant = addVariant