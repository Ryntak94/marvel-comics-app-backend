module.exports  =   function (tx, sub, obj, relationship)    {
    if(!sub.id)  {
        return tx.run(`
        MATCH
            (s:${sub.label}),
            (o:${obj.label})
        WHERE s.title = "${sub.title}" AND o.title = "${obj.title}"
        CREATE (s)-[r:${relationship}]->(o)
        RETURN type(r)
    `)
    }   else    {
        return tx.run(`
        MATCH
            (s:${sub.label}),
            (o:${obj.label})
            WHERE s.title = "${sub.title}" AND o.title = "${obj.title}" AND s.variantId = ${sub.id}
        CREATE (s)-[r:${relationship}]->(o)
        RETURN type(r)
    `)
    }
}
