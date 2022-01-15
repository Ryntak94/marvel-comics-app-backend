module.exports = function (session, driver, dataType, matchBy, matchVal)  {
    let val = matchVal
    if(typeof val === 'string')    {
        val = val.replace(/\\/, "").replace(/['"]/g, "\\'")
    }
    return session.writeTransaction(tx =>  {
        return tx.run(
            `MATCH 
                (a:${dataType.split(" ").join("")}) 
            WHERE 
                a.${matchBy} = "${val}" 
            RETURN 
                a
            `,
        )
    })
    .catch(err  =>  {
        console.log(err)
        session.close()
        driver.close()
    })
    
}