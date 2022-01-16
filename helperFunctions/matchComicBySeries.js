module.exports = function (session, driver, title, series)  {
    return session.writeTransaction(tx =>  {
        console.log(series)
        return tx.run(
            `MATCH 
                (c:Comic)-[r]->(s:Series) 
            WHERE 
                c.title = "${title}"
            AND
                s.title = "${series}"
            RETURN 
                c.marvelId
            `
        )
    })
    .catch(err  =>  {
        console.log(err)
        session.close()
        driver.close()
    })
    
}