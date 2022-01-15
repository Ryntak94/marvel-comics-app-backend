module.exports  =   function (session, driver, sub, obj, relationship)    {
    return session.writeTransaction(tx =>  {
        if(obj.matchBy === 'title')    {
            return tx.run(`
            MATCH
                (s:${sub.label}),
                (o:${obj.label})
            WHERE
                s.${sub.matchBy} = "${sub.matchMy}"
            AND
                o.${obj.matchBy} = "${obj[obj.matchMy].replace(/[”'"]/g, "\'").trim()}"
            CREATE
                (s)-[r:${relationship}]->(o)
            RETURN
                r
        `)
        }   else    {
            return tx.run(`
            MATCH
                (s:${sub.label}),
                (o:${obj.label})
            WHERE
                s.${sub.matchBy} = "${sub[sub.matchMy]}"
            AND
                o.${obj.matchBy} = "${obj[obj.matchMy]}"
            CREATE
                (s)-[r:${relationship}]->(o)
            RETURN
                r
        `)
        }
    })
    .catch(err   =>  {
        console.log(err)
        session.close()
        driver.close()
    })
}
