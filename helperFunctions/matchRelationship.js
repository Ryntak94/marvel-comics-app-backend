module.exports = function (tx, sub, obj, relationship, variant)  {
    if(!sub.id) {
        
        return tx.run(
            `MATCH 
                (s:${sub.label})-[r:${relationship}]->(o:${obj.label})
            WHERE s.title = "${sub.title}" AND o.title = "${obj.title}"
            RETURN r
            `,
        )
    }   else    {
        
        return tx.run(
            `MATCH 
                (s:${sub.label})-[r:${relationship}]->(o:${obj.label})
            WHERE s.title = "${sub.title}" AND o.title = "${obj.title}" AND s.variantId = ${sub.id}
            RETURN r
            `,
        )
    }
}