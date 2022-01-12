const e = require("express")

module.exports = function (tx, title, dataType, variantId)  {
    if(variantId)   {
        return tx.run(
            `MATCH (a:${dataType.split(" ").join("")}) WHERE a.variantId = ${variantId} RETURN a`,
        )
    }   else    {
        if(typeof title === "object")   {
            return tx.run(
                `MATCH (a:${dataType.split(" ").join("")}) WHERE a.title = '${title.name.replace("'", "\\'")}' RETURN a`,
            )    
        }   else    {
            return tx.run(
                `MATCH (a:${dataType.split(" ").join("")}) WHERE a.title = '${title.replace("'", "\\'")}' RETURN a`,
            )
        }
    }
    
}