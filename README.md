# QCObjects QR Scanner

A QR Scanner App (PWA - TWA) powered by QCObjects

![demo](https://quickcorp.github.io/qcobjects-qr-scanner/img/qcobjects-live-demo-qr-scanner.gif)

# Project Structure

The following is the project structure of a Progressive Web App made in QCObjects

```shell
├── index.html
├── Dockerfile
├── README.md
├── VERSION
├── app.js
├── css
├── favicon.ico
├── humans.txt
├── img
├── js
├── localhost-cert.pem
├── localhost-privkey.pem
├── manifest.json
├── package-lock.json
├── package.json
├── robots.txt
├── spec
├── sw.js
└── templates
```

# Installing instructions

Install QCObjects Framework CLI Tool

```shell
> npm i -g qcobjects-cli
```

Then create a new folder for a new project using the command line

```shell
> mkdir mynew-qr-scanner && cd mynew-qr-scanner
```

Create a new app using this template

```shell
> qcobjects create --custom=qcobjects-qr-scanner mynew-qr-scanner
```

# Test on local

```shell
> qcobjects launch app
```

# Live demo

Do you want to see the live demo of this app? [check it out](https://quickcorp.github.io/qcobjects-qr-scanner/)
