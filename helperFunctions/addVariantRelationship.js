const { session } = require("neo4j-driver")
const addRelationship = require("./addRelationship")
const generalMatch = require("./generalMatch")
const match = require("./match")
const matchRelationship = require("./matchRelationship")

function addVariantRelationshipRecurse(session, driver, comic, variantIds) {
    let newVariantIds = variantIds
    let variantId = newVariantIds.shift()
    return matchRelationship(session, driver,
        {
            matchBy: 'marvelId',
            matchMy: 'id',
            label: 'Variant',
            id: variantId
        },
        {
            matchBy: 'marvelId',
            matchMy: 'id',
            label: 'Comic',
            id: comic.id
        },
        'Variant_Of'
    )
    .then(res   =>  {
        if(res.records.length === 0)    {
            return addRelationship(session, driver,
                {
                    matchBy: 'marvelId',
                    matchMy: 'id',
                    label: 'Variant',
                    id: variantId
                },
                {
                    matchBy: 'marvelId',
                    matchMy: 'id',
                    label: 'Comic',
                    id: comic.id
                },
                'Variant_Of'
            )
        }
    })
    .then(()    =>  {
        if(newVariantIds.length > 0)    {
            return addVariantRelationshipRecurse(session, driver, comic, newVariantIds)
        }   else    {
            return generalMatch(session, driver)
        }
    })
}

function addVariantRelationships(session, driver, comic) {
    return session.writeTransaction(tx =>  {
        return tx.run(`
            MATCH
                (v:Variant)
            WHERE
                v.title
            CONTAINS
                "${comic.title.replace(/["]/g, '\'')}"
            RETURN
                v
        `)
    })
    .then((res) =>  {
        let recordIds = res.records.map(record  =>  {
            return record['_fields'][0].properties.marvelId
        })
        if(recordIds.length > 0)    {
            return addVariantRelationshipRecurse(session, driver, comic, recordIds)
        }   else    {
            return generalMatch(session, driver)
        }
    })
}

module.exports.addVariantRelationships = addVariantRelationships