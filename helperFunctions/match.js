module.exports = function (tx, title, dataType)  {
    return tx.run(
        `MATCH (a:${dataType.split(" ").join("")} {title: "${title}"}) RETURN a`,
    )
}