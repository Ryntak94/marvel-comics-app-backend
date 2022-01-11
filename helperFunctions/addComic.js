module.exports = function (tx, comic, records) {
    let urls = comic.urls.filter(url    =>  {
        return url.type === "detail"
    })
    urls = urls.length > 0 ? urls : comic.urls[0]
    if(records === 0)   {
        if(urls.length > 0) {
            return tx.run(
                `CREATE (a:Comic {title: "${comic.title}", issueNumber: ${comic.issueNumber}, url: "${comic.urls[0].url}"}) RETURN a`
            )
        }   else    {
            return tx.run(
                `CREATE (a:Comic {title: "${comic.title}", issueNumber: ${comic.issueNumber}, url: ""}) RETURN a`
            )
        }
    }   else    {
        if(urls.length > 0) {
            return tx.run(
                `MATCH (a:Comic {title: "${comic.title}"}) SET a.issueNumber = ${comic.issueNumber}, a.urls = "${comic.urls}", a.series = "${comic.series.name}" RETURN a`
            )
        }   else    {
            return tx.run(
                `MATCH (a:Comic {title: "${comic.title}"}) SET a.issueNumber = ${comic.issueNumber}, a.urls = "", a.series = ${comic.series.name} RETURN a`
            )
        }
    }
}