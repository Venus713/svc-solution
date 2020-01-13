# Guidelines

I am writing few quick things here. A code without coding style will not be
accepted or merged into base branch.

#### No semicolons
```
yield* increment();    // ✗ avoid
yield * increment()   // ✓ ok

let cars = await server.getCars(); // ✗ avoid
let cars = await server.getCars() // ✓ ok
```

#### Use *const* always and only *let* whenever needed
```
var someVar   // ✗ avoid
const someVar // ✓ ok
let someVar // ✓ ok
```
#### Use 2 spaces for indentation.
#### Use single quotes for strings except to avoid escaping.
```
console.log('hello there')
```
#### No unused variables.
#### Add a space after keywords.
```
if (condition) { ... }   // ✓ ok
```
#### Add a space before a function declaration's parentheses.
```
function name (arg) { ... }   // ✓ ok
```
#### Always use === instead of ==.
#### Commas should have a space after them.
```
const list = [1, 2, 3, 4]
function greet (name, options) { ... }
```
#### For the ternary operator in a multi-line setting, place ? and : on their own lines.
```
// ✓ ok
var location = env.development
  ? 'localhost'
  : 'www.api.com'
```
#### Use camelcase when naming variables and functions.
```
function myFunction () { }     // ✓ ok
let myVar = 'hello'            // ✓ ok
```

Please refer to [Standard.js](https://standardjs.com/rules.html) here.
