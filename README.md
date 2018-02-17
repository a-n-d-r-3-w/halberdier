# Halberdier
A local (offline) password manager for Mac based on [Electron](https://electronjs.org/) (via
[electron-quick-start](https://github.com/electron/electron-quick-start)),
[Node.js crypto](https://nodejs.org/api/crypto.html), [React](https://reactjs.org/), and
[Material UI](https://material-ui-next.com/).

![Screenshot](screenshot.png)

# How to use this repo
1. `git clone https://github.com/a-n-d-r-3-w/halberdier.git`
1. `cd halberdier`
1. `yarn install` or `npm install`
1. Run webpack in watch mode: `yarn run build` or `npm run build`
1. In another terminal, launch app: `yarn start` or `npm start`

# How to create a ZIP file for distribution
1. Follow the instructions [here](https://electronjs.org/docs/tutorial/application-distribution#application-distribution)
to create a `.app` file
1. Follow the instructions [here](https://electronjs.org/docs/tutorial/application-distribution#rebranding-with-downloaded-binaries)
to rebrand the `.app` file
1. Copy `icons/halberdier.icns` into the `.app` file inside `Contents/Resources/` and
replace any references to `electron.icns` with `halberdier.icns` in the `Info.plist` files
1. ZIP the `.app` file
1. Create a new release on GitHub and attach the ZIP file to it