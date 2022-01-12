## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background

This is the backend to be used to build out the marvel comics graph database.

The project currently utilizes:<br>
- Node.js
- Neo4j
- Cypher

## Install
It is recommended that before cloning this repo, which is to be only one half of the project, you should create a folder to hold both the backend and frontend<br>
`mkdir marvel-comics-app`<br>
`cd marvel-comics-app`<br>
`mkdir frontend`<br>
`mkdir backend`

To get the project up and running first clone the repository<br>
`git clone https://github.com/Ryntak94/marvel-comics-app-backend`

If you have created a backend repo you can instead from the parent folder use<br>
`git clone https://github.com/Ryntak94/marvel-comics-app-backend backend`

Next, cd into the project directory (no backend folder)<br>
`cd marvel-comics-app-backend`

Or (backendfolder)<br>
`cd backend`

Then install the dependencies<br>
`npm install`

Next, we will need to install neo4j<br>
[neo4j](https://neo4j.com/download/?ref=get-started-dropdown-cta)

After you install the desktop client, you will need to create a new database

First, click the New button in the top left of the window next to Project.

Then, rename the project to something you like.

After you rename the project, you should click on it and then click the Add button and add a Local DBMS

Once you do this, we need to get an API key from the Marvel Comics API
When you click on the link it will likely prompt you to login. Once you do this, you should be able to see your public and private keys<br>
[Marvel Comics API](https://developer.marvel.com/account)

Now, create a `.env` file. Inside the file set the following keys
Do not use password for password in a production setting.
Click Start on the DBMS
In the neo4j desktop application, click on DBMS you created in your project. A sidebar will open that says:<br>
`Details | Plugins | Upgrade`<br>
Your port for the URI is the `Bolt port`
```
PUBLICKEY=################################
PRIVATEKEY=########################################
URI=neo4j://localhost:[PORT]
USER=neo4j
PASSWORD=password
```

## Usage
Please note that this will attempt to copy the entirety of the Marvel Comics API.
If you do not wish for this to happen, please comment out lines 35 - 48 in index.js by appending each line with `//`

This means the following block of code
```
.then(()    =>  {
    return session.writeTransaction(tx =>  {
        return tx.run(`
            MATCH (o:Offset) SET o.value = ${offset+100} RETURN o.value
        `)
    })
    .then((res)    =>  {
        if(offset <= total)    {
            let newSettings = settings
            newSettings.qs.offset = res.records[0].get(0).low
            return requestRecurse(session, driver, res.records[0].get(0).low, newSettings)
        }
    })
})
```
Should appear as
```
// .then(()    =>  {
//     return session.writeTransaction(tx =>  {
//         return tx.run(`
//         MATCH (o:Offset) SET o.value = ${offset+100} RETURN o.value
//         `)
//     })
//     .then((res)    =>  {
//         if(offset <= total)    {
//             let newSettings = settings
//             newSettings.qs.offset = res.records[0].get(0).low
//             return requestRecurse(session, driver, res.records[0].get(0).low, newSettings)
//         }
//     })
// })
```
Run<br>
`node ./index.js`

Upon succesful execution of the above command you can click open on the DBMS and run queries.
Sample query<br>
`MATCH (n) RETURN n`

If you would like to play around with the Request you can modify the options block in index.js and following along with the [Marvel Comics API](https://developer.marvel.com/docs)

## Maintainers

[@Ryan Matthews](https://github.com/Ryntak94).

## Contributing

Feel free to dive in! [Open an issue](https://github.com/Ryntak94/marvel-comics-app-backend/issues/new) or submit PRs.


## License

[MIT](LICENSE) © Ryan Matthews