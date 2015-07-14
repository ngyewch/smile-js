Javascript Smile implementation
===============================

[![bitHound Score](https://www.bithound.io/github/ngyewch/smile-js/badges/score.svg)](https://www.bithound.io/github/ngyewch/smile-js)
[![Status](https://img.shields.io/badge/Status-Alpha-red.svg)](https://img.shields.io/badge/Status-Work%20in%20progress-yellow.svg)


Overview
--------

This project is an implementation of Jackson's [Smile format](http://wiki.fasterxml.com/SmileFormat). The library currently only supports decoding.

Install
-------
Via bower:

	bower install ngyewch/smile-js --save

Setup
-----
Via bower:

	<script src="bower_components/smile-js/dist/smile.min.js"></script>

Usage
-----

    var data = Smile.Parser.parse(buffer);

Where:

* ``buffer`` contains the Smile encoded data to be decoded **(REQUIRED)**
  * Type: ``Array``, ``ArrayBuffer`` or ``Uint8Array``
