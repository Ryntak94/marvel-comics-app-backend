module.exports = function (session, driver, title, series)  {
    return session.writeTransaction(tx =>  {
        return tx.run(
            `MATCH 
                (c:Comic)-[r]->(s:Series) 
            WHERE 
                c.title = "${title.replace(/['""]/g, "\\'")}"
            AND
                s.title = "${series.replace(/['""]/g, "\\'")}"
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