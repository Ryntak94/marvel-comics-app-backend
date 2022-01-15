const addRelationship = require("./addRelationship")
const match = require("./match")
const matchRelationship = require("./matchRelationship")
const { addVariantRelationships } = require("./addVariantRelationship")

function addComic(session, driver, comic) {
    console.log('here')
    return match(session, driver, 'Comic', 'marvelId', comic.id)
    .then(res   =>  {
        let urls = comic.urls.filter(url    =>  {
            return url.type === "detail"
        })
        
        let url = urls.length > 0 ? urls[0].url : comic.urls.length > 0 ? comic.urls[0].url : ''

        return session.writeTransaction(tx  =>  {
            if(res.records.length === 0)    {
                return tx.run(`
                    CREATE 
                        (a:Comic {
                            title:"${comic.title}", 
                            issueNumber: "${comic.issueNumber}", 
                            url: "${url}",
                            marvelId: "${comic.id}",
                            isbn: "${comic.isbn}"
                        })
                    RETURN 
                        a
                `)
            }   else    {
                return tx.run(
                    `MATCH 
                        (n:Comic {
                            marvelId: "${comic.id}"
                        }) 
                    SET 
                        n.issueNumber = ${comic.issueNumber}, 
                        n.urls = "${url}", 
                        n.series = "${comic.series.name}",
                        n.isbn = "${comic.isbn}"
                    RETURN 
                        n
                `)
            }
        })
        .then(()    =>  {
            let issueRegex = /[#]\d*/
            let issue = comic.title.match(issueRegex) ? comic.title.match(issueRegex)[0] : null
            console.log(comic.title)
            let nextIssueTitle = comic.title.replace(issue, `#${(Number(issue.slice(1))+1)}`)
            let prevIssueTitle = comic.title.replace(issue, `#${(Number(issue.slice(1))-1)}`)
            return match(session, driver, 'Comic', 'title', nextIssueTitle)
                .then(res   =>  {
                    if(res.records.length > 0)  {
                        return matchRelationship(session, driver, 
                            {
                                matchBy: 'marvelId',
                                matchMy: 'id',
                                label: "Comic",
                                id: comic.id
                            },
                            {
                                matchBy: 'title',
                                matchMy: 'title',
                                label: "Comic",
                                title: nextIssueTitle
                            },
                            'Next_Issue'
                        )
                        .then(res   =>  {
                            if(res.records.length === 0)    {
                                return addRelationship(session, driver, 
                                    {
                                        matchBy: 'marvelId',
                                        matchMy: 'id',
                                        label: "Comic",
                                        id: comic.id
                                    },
                                    {
                                        matchBy: 'title',
                                        matchMy: 'title',
                                        label: "Comic",
                                        title: nextIssueTitle
                                    },
                                    'Next_Issue'
                                )
                            }
                        })
                    }
                })
                .then(()    =>  {
                    return match(session, driver, 'Comic', 'title', prevIssueTitle)
                        .then(res   =>  {
                            if(res.records.length > 0)    {
                                return matchRelationship(session, driver, 
                                    {
                                        matchBy: 'title',
                                        matchMy: 'title',
                                        label: "Comic",
                                        title: prevIssueTitle
                                    },
                                    {
                                        matchBy: 'marvelId',
                                        matchMy: 'id',
                                        label: "Comic",
                                        id: comic.id
                                    },
                                    'Next_Issue'
                                )
                                .then(res   =>  {
                                    if(res.records.length === 0)    {
                                        return addRelationship(session, driver, 
                                            {
                                                matchBy: 'title',
                                                matchMy: 'title',
                                                label: "Comic",
                                                title: prevIssueTitle
                                            },
                                            {
                                                matchBy: 'marvelId',
                                                matchMy: 'id',
                                                label: "Comic",
                                                id: comic.id
                                            },
                                            'Next_Issue'
                                        ) 
                                    }
                                })
                            }
                        })
                })
        })
        .then(()    =>  {
            return addVariantRelationships(session, driver, comic)
        })
    })
}

module.exports.addComic = addComic