# node-with-revert

A simple util to make reverting easy in complex nested promises.

Every now and then we have a problem wherein we db/micro service call depends on eachother
For eg.

create a collection and on success update second collection. so out functions start nesting like
```javascript

function updateSomeDoc2() {
  return call() // call some async api/db call
}

function updateSomeDoc3() {
  return call() // call some async api/db call
}

func1().then(updateSomeDoc2).then(updateSomeDoc3)
```

This seems fine but over here we forgot if updateSomeDoc3 fails we need to revert updateSomeDoc2
changes as well as func1 update.This library provides a much better interface to solve this issue.

Features

  - Can be used to nest multiple update/create call which depend on each other
  - Can be used for reverting update/create calls with update/delete call

### Example
```sh
$ npm i
$ cd examples
$ node basic   // For basic nest calls
$ node revert   // know how revert happens
```

### Installation
``npm install node-with-revert --save``

### Usage
```javascript
import executeInSeries from 'node-with-revert';

const updateObj = [
  {
    updater: {funcToExec: () => Promise.resolve(), params: {} },
    reverter: {funcToExec: () => Promise.resolve(), params: {}}
  },
  {
    updater: {funcToExec: () => Promise.reject(), params: {} },
    reverter: {funcToExec: () => Promise.resolve(), params: {}}
  }
];

executeInSeries(updateObj).then(onSuccess).catch(onError);
//...
```

### Contributing

If you'd like to see something added or changed to this module please open a new GitHub issue. Pull requests are always welcome.
