const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */

describe("create", function () {
  const newJob = {
    title: "New Job",
    salary: 10000,
    equity: 0.001,
    company_handle: "New Company",
  };

  test("works", async function () {
    let job = await Job.create(newjob);
    expect(job).toEqual(newjob);

    const result = await db.query(
      `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'New Job'`);
    expect(result.rows).toEqual([
      {
        title: "New Job",
        salary: 10000,
        equity: 0.001,
        company_handle: "New Company",
      },
    ]);
  });


});


/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Jobs.findAll({});
    expect(jobs).toEqual([
      {
        title: "j1",
        salary: "100",
        equity: "0.01",
        company_handle: "c1"
      },
      {
        title: "j2",
        salary: "200",
        equity: "0",
        company_handle: "c2"
      },
      {
        title: "j3",
        salary: "300",
        equity: undefined,
        company_handle: "c3"
      },
    ]);
  });
});


/************************************** filter jobs */

describe("findAll", function () {
  test("works: filter by job title", async function () {
    let jobs = await Job.findAll({ title: "j1" });
    expect(jobs).toEqual([
      {
        title: "j1",
        salary: "100",
        equity: "0.01",
        company_handle: "c1"
      },
    ]);
  });
});

describe("findAll", function () {
  test("filter by salary", async function () {
    let jobs = await Job.findAll({ minSalary: 300 });
    expect(jobs).toEqual([
      {
        title: "j3",
        salary: "300",
        equity: undefined,
        company_handle: "c3"
      }
    ]);
  });
});


describe("findAll", function () {
  test("works: filter by equity", async function () {
    let jobs = await Job.findAll({ hasEquity: true });
    expect(jobs).toEqual([
      {
        title: "j1",
        salary: "100",
        equity: "0.01",
        company_handle: "c1"
      }
    ]);
  });
});

describe("findAll", function () {
  test("works: filter by zero or null equity", async function () {
    let jobs = await Job.findAll({ hasEquity: false });
    expect(jobs).toEqual([
      {
        title: "j1",
        salary: "100",
        equity: "0.01",
        company_handle: "c1"
      },
      {
        title: "j2",
        salary: "200",
        equity: "0",
        company_handle: "c2"
      },
      {
        title: "j3",
        salary: "300",
        equity: undefined,
        company_handle: "c3"
      }
    ]);
  });
});

/************************************** get */



describe("get", function () {
  test("works", async function () {
    const result = await db.query(`SELECT id,
                            FROM jobs
                            WHERE title = j1`);
    const id = result[0].id;
    let jobs = await Job.get(id);
    expect(jobs).toEqual({
      title: "j1",
      salary: "100",
      equity: "0.01",
      company_handle: "c1"
    });
  });

  test("not found if no such jobs", async function () {
    try {
      await Job.get(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});


/************************************** update job */


describe("update", function () {
  const updateData = {
    title: "j4",
    salary: "400",
    equity: "0.04",
  };

  test("works", async function () {
    const result = await db.query(`SELECT id,
                            FROM jobs
                            WHERE title = j1`);
    const id = result[0].id;
    let jobs = await Job.get(id);
    expect(job).toEqual({
      id: id,
      title: "j4",
      salary: "400",
      equity: "0.04",
      company_handle: "c1",
    });
  });


});