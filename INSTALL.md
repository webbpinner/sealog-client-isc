# Installation Instructions

### Prerequisites

 - [sealog-server-jason-shoreside](https://github.com/webbpinner/sealog-server-jason-shoreside)
 - [nodeJS](https://nodejs.org)
 - [npm](https://www.npmjs.com)
 - [git](https://git-scm.com)
 
#### Installing NodeJS/npm on Ubuntu 18.04LTS
The standard Ubuntu repositories for Ubuntu 18.04 only provide install packages for NodeJS v4.  Sealog-client-jason-shoreside (and Sealog-Server-Jason-Shoreside) require nodeJS >= v8.11
 
To install nodeJS v8.11 on Ubuntu 18.04LTS run the following commands:
 ```
sudo apt-get install curl build-essential
cd ~
curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt-get install nodejs

 ```

### Clone the repository

```
git clone https://github.com/webbpinner/sealog-client-isc.git
```

This should clone the repo to a directory called `sealog-client-isc`

### Create a new configuration file

```
cd ~/sealog-client-isc
cp ./src/client_config.js.dist ./src/client_config.js
```

### Modify the configuration file

Set the `API_ROOT_URL`, `WS_ROOT_URL`, `ROOT_PATH`, `IMAGES_PATH` and `RECAPTCHA_SITE_KEY` values in the `./sealog-client/src/client_config.js` file to meet your specific installation requirements.

By default the file assumes the sealog-server is available via http on port 8000 on the same server that is hosting the sealog-server.  If the sealog-server is run from a different server you will need to update the `API_ROOT_URL` and `WS_ROOT_URL` variables accordingly.

By default configuration file also assumes the client will be available at `http://<serverIP>/sealog` This is set with the `ROOT_PATH` variable (notice there is a starting `/` **AND** trailing `/`). If you want the webclient available at: `http://<serverIP>` you need to set `ROOT_PATH` to `/`.

For almost all cases the default `IMAGE_PATH` is correct.

The `RECAPTCHA_SITE_KEY` must be first setup via Google's admin console.  This key is needed to implement the reCaptcha bot prevention mechanisms.

`LOGIN_SCREEN_TXT` is the text displayed on the login page below the login image (if present).

`LOGIN_IMAGE` is the image displayed on the login page to the right of the login form.  The actual image file should be placed in the ./dist/images folder within the sealog-client-isc repository

`MAIN_SCREEN_TXT` is the text displayed at the top of the main page.

`HEADER_TITLE` is the text displayed on the left-side of the top navigation bar.

**Special Note for MTU Installations**
There is a `MTU` variable used to indicated whether the installation is for an MTU or not.  If this installation is for an MTU you will need to set this variable to `true`.

### Create a deployment file

```
cd ~/sealog-client-isc
cp ./webpack.config.js.dist ./webpack.config.js
```

If you are deploying the client to somewhere other than `http://<serverIP>/sealog` you need to set `ROOT_PATH` to the new location. (notice there is a starting `/` **AND** trailing `/`).  In most cases the `ROOT_PATH` in this deployment file should match the `ROOT_PATH` variable in the `client_config.js`.

### Install the nodeJS modules

From a terminal run:
```
cd ~/sealog-client-isc
npm install
```

### Build the bundle.js file

From a terminal run:

```
cd ~/sealog-client-isc
npm run build
```

### Configure Apache to host the client

Add the following to your Apache default vhost file `/etc/apache2/sites-available/000-default.conf`:

```
  Alias /sealog /var/www/html/sealog
  <Directory "/var/www/html/sealog">
    AllowOverride all
  </Directory>
```

If the client is to be hosted at the root of the webserver you will not need to add this code block but instead will need to set the `DocumentRoot` to `/var/www/html/sealog`

Create a symbolic link from the repository to the apache document root.
```
sudo ln -s /home/isc/sealog-client-isc/dist /var/www/html/sealog
```

You will need to tweak this configuration to match your exact installation.  This example assumes the client will live at `http://<serverIP>/sealog` and the git repo is located at: `/home/isc/sealog-client-isc`

**Be sure to reload Apache for these changes to take affect.**

The client should now be available at: `http://<serverIP>/sealog`

### Running in development mode ###
Optionally you can run the client using node's development web-server.  This removes the need to run Apache.  When run in development mode the client is only accessable from the local machine.

To run the client using development mode run the following commands in terminal:
```
cd ~/sealog-client-isc
npm start
```
