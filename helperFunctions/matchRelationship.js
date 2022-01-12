module.exports = function (tx, sub, obj, relationship)  {
    if(!sub.id) {
        
        return tx.run(
            `MATCH 
                (s:${sub.label})-[r:${relationship}]->(o:${obj.label})
            WHERE s.title = "${sub.title.replace(/['"”]/g, "\'")}" AND o.title = "${obj.title.replace(/['"”]/g, "\'")}"
            RETURN r
            `,
        )
    }   else    {
        
        return tx.run(
            `MATCH 
                (s:${sub.label})-[r:${relationship}]->(o:${obj.label})
            WHERE s.title = "${sub.title.replace(/['"”]/g, "\'")}" AND o.title = "${obj.title.replace(/['"”]/g, "\'")}" AND s.variantId = ${sub.id}
            RETURN r
            `,
        )
    }
}