"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs */

class Job {

  /** Create a new job from input data, update db and return job data
   *
   * data is obj { title, salary, equity, company_handle }
   *
   * returns { id, title, salary, equity, company_handle }
   *
   * throw BadRequestError if the job title (job opening) already exists
   * "assuming only 1 opening per position"
   */

  static async create({ title, salary, equity, company_handle }) {
    const duplicateCheck = await db.query(
      `SELECT title
          FROM jobs
          WHERE company_handle = $1 AND title = $2`,
      [company_handle, title]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job opening: ${title}
                                at company ${company_handle}`);

    const result = await db.query(
      `INSERT INTO jobs (
          title,
          salary,
          equity,
          company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, salary, equity, company_handle`,
      [title, salary, equity, company_handle]);

    const job = result.rows[0];

    return job;
  }

  /** Find all jobs
   *
   * allow filtering by title, minSalary,
   */

  static async findAll(filters) {
    let { conditions, values } = Job._sqlForFilteringJobs(filters);
    if (conditions.length < 1) conditions = "";
    else {
      conditions = `WHERE ${conditions}`;
    }

    const jobResults = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle
          FROM jobs
          ${conditions}
          ORDER BY title`,
      [...values]);
    return jobResults.rows;
  }


  /** Creates SQL queries for filtering jobs with obj {filters} input
   *
   * returns condition = SQL query strings `title ILIKE $1...`
   * and values = array of values to sanitize query params [...values]
  */
  static _sqlForFilteringJobs(filters) {
    let conditions = [];
    let values = [];
    let idx = values.length;

    if (filters.title) {
      values[idx] = `%${filters.title}%`;
      conditions[idx] = `title ILIKE $${idx + 1}`;
    }

    if (filters.minSalary) {
      values[idx] = `${filters.minSalary}`;
      conditions[idx] = `salary >= $${idx + 1}`;
    }

    if (filters.hasEquity) {
      conditions[idx] = `(equity IS NOT NULL AND equity > 0)`;
    }

    conditions = conditions.length > 1 ? conditions.join(" AND ") :
      conditions.toString();

    return {
      conditions,
      values
    };
  }
}

module.exports = Job;