# react-batch-tracker
React Context based npm package for batching calls to a function, somewhat like lodash debounce, but more eccentric. Supports creating several trackers that can track state change by following individual data objects. Goal is to facilitate autosave and undo functionality, and for optimising client -> API requests.

# getting started

## installation
```
npm install
```
```
yarn install
```
## usage

### first wrap your app with the provider
<img width="380" alt="Screenshot 2022-11-20 at 06 36 23" src="https://user-images.githubusercontent.com/58119759/202887335-db37a67c-482a-45d8-a6aa-2665681a8c9a.png">


### then get access to the api in a component by using the `useBatchTracker` function
<img width="588" alt="Screenshot 2022-11-20 at 06 39 09" src="https://user-images.githubusercontent.com/58119759/202887390-0854447d-d0ba-46bf-8a1c-8c27811d3f09.png">

### create a batch tracker
before anything doing else, you need to create a new batch tracker. since this lib is based on react context, you will be able to get access to all the initiated trackers globally in your app. it makes sense to create a new tracker for each component or group of component whose state has some common goal, either it being that they have 
