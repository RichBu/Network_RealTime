# Network_RealTime
Real time network for production / machine monitoring

Demonstration of a real time production monitoring system.
Full system is multiple machines and different types.

One option is to use a pre-packaged software package. Besides
the high costs, most are just limited.  By using full stack
web development skills, it's really easy to upload the data
to a mySQL database backend. At the same time data is sent
to FireBase, which is Google's real-time database.

So, if there is a data change, it is pushed to the user
as fast as the network allows.


require .env file
variables needed
NODE_ENV= (development, production)
JAWSDB_URL=
BASE_URL =  (used in index.js, that is used for the front end )
PORT = (port for the backend)


after downloading
written for node version v6.9.1  v18.14.0
it's best to use nvm to handle old versions of node and npm
nvm install 6.9.1      change to 18.14.0
npm install

