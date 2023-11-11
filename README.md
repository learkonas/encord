# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## How to use
1. Run `git clone https://github.com/learkonas/encord`
2. Run `npm install`
3. Run `npm start`
4. If an error occurs with the 'Submit' button, run `json-server --watch db.json --port 3001`

You can monitor background operations with `netstat -ano | findstr :3000`, where 3000 represents the port (the database runs on port 3001). Tasks can be killed with `taskkill /PID XXXXX /F`, where XXXXX represents the five-digit task ID.

## Available Scripts

In the project directory, you can run:

### `npm start`

This builds the app (in development mode) and runs the db.json server locally.\ Running `npm start &` will achieve the same but in the background.

#### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
