"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { isAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobFilterBySchema = require("../schemas/jobFilterBy.json");
const jobNewSchema = require("../schemas/jobNew.json");


const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

 router.post("/", isAdmin, async function (req, res, next) {

  const validator = jsonschema.validate(
    req.body,
    jobNewSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.create(req.body);
  return res.status(201).json({ job });
});


module.exports = router;