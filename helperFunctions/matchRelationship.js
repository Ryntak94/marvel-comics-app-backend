module.exports = function (session, driver, sub, obj, relationship)  {
    return session.writeTransaction(tx =>  {     
        if(obj.matchMy === 'title') {
            return tx.run(
                `MATCH 
                    (s:${sub.label})-[r:${relationship}]->(o:${obj.label})
                WHERE 
                    s.${sub.matchBy} = "${sub[sub.matchMy]}"
                AND 
                    o.${obj.matchBy} = "${obj[obj.matchMy].replace(/['"”]/g, "\'").trim()}"
                RETURN 
                    r
                `,
            )
        }
        if(sub.matchMy === 'title') {
            return tx.run(
                `MATCH 
                    (s:${sub.label})-[r:${relationship}]->(o:${obj.label})
                WHERE 
                    s.${sub.matchBy} = "${sub[sub.matchMy].replace(/['"”]/g, "\'").trim()}"
                AND 
                    o.${obj.matchBy} = "${obj[obj.matchMy]}"
                RETURN 
                    r
                `,
            )
        }
        if(sub.matchMy === 'title' && obj.matchMy === 'title')  {
            return tx.run(
                `MATCH 
                    (s:${sub.label})-[r:${relationship}]->(o:${obj.label})
                WHERE 
                    s.${sub.matchBy} = "${sub[sub.matchMy].replace(/['"”]/g, "\'").trim()}"
                AND 
                    o.${obj.matchBy} = "${obj[obj.matchMy].replace(/['"”]/g, "\'").trim()}"
                RETURN 
                    r
                `,
            )
        }   else    {
            return tx.run(
                `MATCH 
                    (s:${sub.label})-[r:${relationship}]->(o:${obj.label})
                WHERE 
                    s.${sub.matchBy} = "${sub[sub.matchMy]}"
                AND 
                    o.${obj.matchBy} = "${obj[obj.matchMy]}"
                RETURN 
                    r
                `,
            )
        }

    })
    .catch(err  =>  {
        console.log(err)
        session.close()
        driver.close()
    })
}