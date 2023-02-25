#!/usr/bin/env node

import { Complex } from ".";

process.stdin.on("data", (chunk) =>
	console.log(Complex.eval(String(chunk)).toString())
);
