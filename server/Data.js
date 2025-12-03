"use strict";
import { readFileSync } from "fs";

// Store data in an object to keep the global namespace clean. In an actual implementation this would be interfacing a database...
class Data {
  constructor() {}
}

/***********************************************
For performance reasons, methods are added to the
prototype of the Data object/class
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
***********************************************/

export { Data };
