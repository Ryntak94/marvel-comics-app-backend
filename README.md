## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
	- [Generator](#generator)
- [Badge](#badge)
- [Example Readmes](#example-readmes)
- [Related Efforts](#related-efforts)
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

run<br>
`node ./index.js`



## Maintainers

[@Ryan Matthews](https://github.com/Ryntak94).

## Contributing

Feel free to dive in! [Open an issue](https://github.com/Ryntak94/marvel-comics-app-backend/issues/new) or submit PRs.


## License

[MIT](LICENSE) © Ryan Matthews