module.exports  =   function (tx, sub, obj, relationship)    {
    return tx.run(`
        MATCH
            (s:${sub.label}),
            (o:${obj.label})
        WHERE s.title = "${sub.title}" AND o.title = "${obj.title}"
        CREATE (s)-[r:${relationship}]->(o)
        RETURN type(r)
    `)
}
