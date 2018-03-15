# node-with-revert

A simple util to make reverting easy in complex nested promises.

Every now and then we have a problem wherein db/micro service call depends on each other
For eg.

```javascript

function updateSomeDoc2() {
  return call() // call some async api/db call
}

function updateSomeDoc3() {
  return call() // call some async api/db call
}

updateSomeDoc1().then(updateSomeDoc2).then(updateSomeDoc3)
```

This seems fine but over here we forgot if updateSomeDoc3 fails we need to revert updateSomeDoc2
changes as well as updateSomeDoc1 update, this library provides a much better interface to solve this issue.

Features

  - Can be used to nest multiple update/create call which depend on each other
  - Can be used for reverting update/create calls with update/delete call
  - update function can set what it needs to give child just like async waterfall
  - reverter can either receive it's own params or update's response or it can use valueGetter's response.

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
    valueGetter: {funcToExec: () => Promise.resolve(), params: {}},
    updater: {funcToExec: () => Promise.resolve(), params: {} },
    reverter: {funcToExec: () => Promise.resolve(), params: {}, useUpdaterResponse: false, useValueGetterResponse: false}
  },
  {
    valueGetter: {funcToExec: () => Promise.resolve(), params: {}},
    updater: {funcToExec: () => Promise.reject(), params: {} },
    reverter: {funcToExec: () => Promise.resolve(), params: {}, useUpdaterResponse: false, useValueGetterResponse: false}
  }
];

executeInSeries(updateObj).then(onSuccess).catch(onError);
//...
```

### Contributing

If you'd like to see something added or changed to this module please open a new GitHub issue. Pull requests are always welcome.
