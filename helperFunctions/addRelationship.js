module.exports  =   function (tx, sub, obj, relationship)    {
    if(!sub.id)  {
        return tx.run(`
        MATCH
            (s:${sub.label}),
            (o:${obj.label})
        WHERE s.title = "${sub.title.replace(/[”'"]g/, "\'")}" AND o.title = "${obj.title.replace(/[”'"]/g, "\'")}"
        CREATE (s)-[r:${relationship}]->(o)
        RETURN type(r)
    `)
    }   else    {
        return tx.run(`
        MATCH
            (s:${sub.label}),
            (o:${obj.label})
            WHERE s.title = "${sub.title.replace(/[”'"]g/, "\'")}" AND o.title = "${obj.title.replace(/[”'"]/g, "\'")}" AND s.variantId = ${sub.id}
        CREATE (s)-[r:${relationship}]->(o)
        RETURN type(r)
    `)
    }
}
