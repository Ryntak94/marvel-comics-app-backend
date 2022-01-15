module.exports = function (session, driver)  {
    return session.writeTransaction(tx  =>  {
        return tx.run(`
            MATCH
                (n)
            RETURN
                n
            LIMIT
                1
        `)
    })
    
}