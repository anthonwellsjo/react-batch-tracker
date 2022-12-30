# react-batch-tracker
this is a react context based npm package for batching calls to a function. it supports creating several trackers that can track state change by following individual data objects. the goal with the lib is to facilitate autosave and undo functionality, and for optimising client -> API requests with callbacks containing a batched data set.

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
before anything doing else, you need to create a new batch tracker. you need to give it a name, a timeout (in ms) and a callback function. 
<img width="657" alt="Screenshot 2022-11-20 at 09 21 29" src="https://user-images.githubusercontent.com/58119759/202892534-c81ecea7-ecb9-4195-ac88-d3dd098e382a.png">

###### since this lib is based on react context, you will be able to get access to all the initiated trackers globally in your app. 
it makes sense to create a new tracker for each component or group of component whose state has some common goal. they might have a common state that needs to be CRUD:ed with a database with **autosave functionality**. or maybe it makes sense from a UX perspective to keep track of their combined history of states to implement something like an **undo/redo functionality**.

### register actions
whenever an event occurs that should trigger the countdown for the callback function, you need it to register an action. it makes sense to have this happen on an `onChange` type of event, as shown below.

<img width="472" alt="Screenshot 2022-11-20 at 07 48 08" src="https://user-images.githubusercontent.com/58119759/202889658-57e90445-d5ff-434e-ba25-3e9f73322887.png">

## specific use cases

### auto save
<img width="750" alt="Screenshot 2022-11-20 at 09 44 18" src="https://user-images.githubusercontent.com/58119759/202893270-3694c928-3319-40b8-a283-52665700226a.png">

the code above will produce a behaviour as shown in the gif below
![autosave](https://user-images.githubusercontent.com/58119759/202893636-2a2e979e-ab09-407d-8be5-7d006b68c6bb.gif)

### auto save with undo functionality
tbc
