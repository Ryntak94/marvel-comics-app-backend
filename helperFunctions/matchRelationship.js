module.exports = function (tx, sub, obj, relationship)  {
    return tx.run(
        `MATCH 
            (s:${sub.label})-[r:${relationship}]->(o:${obj.label})
        WHERE s.title = "${sub.title}" AND o.title = "${obj.title}"
        RETURN r
        `,
    )
}