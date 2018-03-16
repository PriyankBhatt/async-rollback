# async-rollback

A simple util to make rollback easy in complex nested promises.

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
  - Can be used to rollback update/create calls using update/delete call
  - transaction function can set what it needs to give child just like async waterfall
  - rollback receive it's own params as well as update's response.

### Example
```sh
$ npm i
$ cd examples
$ node basic   // For basic nest calls
$ node revert   // know how revert happens
```

### Installation
``npm install async-rollback --save``

### Usage
```javascript
import asyncRollback from 'async-rollback';

const updateObj = [
  {
    transaction: {funcToExec: () => Promise.resolve(), params: {} },
    rollback: {funcToExec: () => Promise.resolve(), params: {}}
  },
  {
    transaction: {funcToExec: () => Promise.reject(), params: {} },
    rollback: {funcToExec: () => Promise.resolve(), params: {}}
  }
];

asyncRollback(updateObj).then(onSuccess).catch(onError);
//...
```

### Contributing

If you'd like to see something added or changed to this module please open a new GitHub issue. Pull requests are always welcome.
