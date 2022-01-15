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
Please note that this will attempt to copy the entirety of the Marvel Comics API.<br>
Run to copy all of the API<br>
`node ./request.js`<br>
If you do not want to copy the entire API, you can pass in an optional argument as an integer to the command as such<br>
`node ./request.js 800`<br>
This will copy the number you set, or all, of the comics from the Marvel API<br>

Run<br>
`node ./index.js`

Upon succesful execution of the above commands you can click open on the DBMS and run queries.<br>
Sample query<br>
`MATCH (n) RETURN n limit 200`

If you would like to play around with the Request you can modify the options block in index.js and learn from the [Marvel Comics API](https://developer.marvel.com/docs)

## Maintainers

[@Ryan Matthews](https://github.com/Ryntak94).

## Contributing

Feel free to dive in! [Open an issue](https://github.com/Ryntak94/marvel-comics-app-backend/issues/new) or submit PRs.


## License

[MIT](LICENSE) © Ryan Matthews