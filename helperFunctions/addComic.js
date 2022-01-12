const { session } = require("neo4j-driver")
const addRelationship = require("./addRelationship")
const match = require("./match")
const matchRelationship = require("./matchRelationship")

function addComic(session, driver, comic) {
    const variantMatch = comic.title.match(/[\\(][\w*\d*\s*]*(Variant)[\w*\d*\s*]*[\\)]/)
    return session.writeTransaction(tx     =>  {
        if(variantMatch !== null) {
            return match(tx, comic.title, "Comic", comic.id)
        }   else    {
            return match(tx, comic.title, "Comic")
        }
    })
    .then(res   =>  {
        let urls = comic.urls.filter(url    =>  {
            return url.type === "detail"
        })
        urls = urls.length > 0 ? urls : comic.urls[0]
        return session.writeTransaction(tx  =>  {
            if(res.records.length === 0)    {
                if(variantMatch === null) {
                    return tx.run(`
                        CREATE 
                            (a:Comic {
                                title:"${comic.title}", 
                                issueNumber: ${comic.issueNumber}, 
                                url: "${urls ? urls.url : ''}"
                            }) 
                        RETURN a`
                    )
                }   else    {
                    return tx.run(`
                        CREATE 
                            (a:Comic {
                                title:"${comic.title}", 
                                issueNumber: ${comic.issueNumber}, 
                                url: "${urls ? urls.url : ''}",
                                variantId: ${comic.id}
                            }) 
                        RETURN a`
                    )
                }
            }   else    {
                return tx.run(
                    `MATCH 
                        (a:Comic {
                            title: "${comic.title}"
                        }) 
                    SET 
                        a.issueNumber = ${comic.issueNumber}, 
                        a.urls = "${urls ? urls.url : ''}", 
                        a.series = "${comic.series.name}" 
                    RETURN a`
                )
            }
        })
        .then(()    =>  {
            if(variantMatch !== null)   {
                let nonVariantTitle = comic.title.slice(0, variantMatch.index)
                
                return session.writeTransaction(tx  =>  {
                    return match(tx, nonVariantTitle, "Comic")
                })
                .then((res) =>  {
                    if(res.records.length === 0)    {
                            
                            return addComic(session, driver, {
                                    title: nonVariantTitle,
                                    issueNumber: comic.issueNumber,
                                    urls: []
                                })
                        .then(() =>  {
                            return session.writeTransaction(tx  =>  {
                                return addRelationship(tx,
                                    {
                                        label: "Comic",
                                        title: comic.title
                                    },
                                    {
                                        label: "Comic",
                                        title: nonVariantTitle
                                    },
                                    "Variant_Of")
                            })
                        })
                    }   else    {
                        
                        return session.writeTransaction(tx =>  {
                            return matchRelationship(tx,
                                {
                                    label: "Comic",
                                    title: comic.title
                                },
                                {
                                    label: "Comic",
                                    title: nonVariantTitle
                                },
                                "Variant_Of")
                        })
                        .then((res) =>  {
                            if(res.records.length === 0)    {
                                return session.writeTransaction(tx  =>  {
                                    return addRelationship(tx,
                                        {
                                            label: "Comic",
                                            title: comic.title
                                        },
                                        {
                                            label: "Comic",
                                            title: nonVariantTitle
                                        },
                                        "Variant_Of")
                                })
                            }
                        })
                    }
                })
            }   else    {
                let title = comic.title
                let regex = /[#]\d*/
                let issue = title.match(regex) ? title.match(regex)[0] : null
                if(issue !== "#1" && issue !== null && !comic.title.includes("#-1"))    {
                    let prevIssue = title.replace(issue, "#" + (Number(issue.slice(1)) - 1))
                    return session.writeTransaction(tx =>  {
                        return match(tx, prevIssue, "Comic")
                    })
                    .then((res) =>  {
                        if(res.records.length === 0)    {
                            let issueNumber = Number(issue.slice(1)) - 1
                            return addComic(session, driver, {
                                title: prevIssue,
                                issueNumber,
                                urls: []
                            })
                            .then(()    => {
                                return session.writeTransaction(tx  =>  {
                                    return addRelationship(tx,
                                        {
                                            label: "Comic",
                                            title: prevIssue
                                        },
                                        {
                                            label: "Comic",
                                            title: comic.title
                                        },
                                        "Next_Issue")
                                })
                            })
                        }   else    {
                            return session.writeTransaction(tx  =>  {
                                return matchRelationship(tx,
                                    {
                                        label: "Comic",
                                        title: prevIssue
                                    },
                                    {
                                        label: "Comic",
                                        title: comic.title
                                    },
                                    "Next_Issue")
                            })
                            .then((res)    =>  {
                                if(res.records.length === 0)    {
                                    return session.writeTransaction(tx  =>  {
                                        return addRelationship(tx,
                                            {
                                                label: "Comic",
                                                title: prevIssue
                                            },
                                            {
                                                label: "Comic",
                                                title: comic.title
                                            },
                                            "Next_Issue")
                                    })
                                }
                            })
                        }
                    })
                }
            }
        })
    })
}

module.exports.addComic = addComic

// if(urls.length > 0) {
//     return tx.run(
//         `CREATE (a:Comic {title: "${comic.title}", issueNumber: ${comic.issueNumber}, url: "${comic.urls[0].url}"}) RETURN a`
//     )
// }   else    {
//     return tx.run(
//         `CREATE (a:Comic {title: "${comic.title}", issueNumber: ${comic.issueNumber}, url: ""}) RETURN a`
//     )
// }