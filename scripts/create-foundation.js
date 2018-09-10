#!/usr/bin/env node
'use strict';

const { foundationFactory, run } = require('..');

const foundation = foundationFactory();

run(foundation.create);
