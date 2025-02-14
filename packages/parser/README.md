# @codemod/parser

Wrapper around `@babel/parser` that allows parsing everything.

## Install

Install from [npm](https://npmjs.com/):

```sh
$ npm install @codemod/parser
```

## Usage

```ts
import { parse } from '@codemod/parser';

console.log(parse('a ?? b').program.body[0].expression.operator); // '??'
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for information on setting up the project for development and on contributing to the project.

## Status

[![Build Status](https://travis-ci.com/codemod-js/codemod.svg?branch=master)](https://travis-ci.com/codemod-js/codemod)

## License

Copyright 2019 Brian Donovan

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
