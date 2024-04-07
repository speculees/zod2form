# zod2form

This library was generated with [Nx](https://nx.dev).

zod2form is a library that allows you to create a form from a zod schema.
currently it only supports inline input names that match react-hook-form's input names. Example: `location.address.street`.

## Installation

Run `npm install @nx/zod2form` to install the library.

## Building

Run `nx build zod2form` to build the library.

## Running unit tests

Run `nx test zod2form` to execute the unit tests via [Jest](https://jestjs.io).

## TODO

- [ ] Add docs
- [ ] Add react examples
- [ ] Add support for grouped nested inputs
- [x] Add support for inline nested inputs
- [ ] Add support for array inputs
- [x] Add support for basic inputs