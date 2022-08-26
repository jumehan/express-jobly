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
    equity: "0.001",
    company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      ...newJob
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'New Job'`);

    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "New Job",
        salary: 10000,
        equity: "0.001",
        company_handle: "c1",
      },
    ]);
  });

  test("not allow duplicate openings for same company", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});


/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll({});
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 100,
        equity: "0.01",
        company_handle: "c1"
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 200,
        equity: "0",
        company_handle: "c2"
      },
      {
        id: expect.any(Number),
        title: "j3",
        salary: 300,
        equity: null,
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
        id: expect.any(Number),
        title: "j1",
        salary: 100,
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
        id: expect.any(Number),
        title: "j3",
        salary: 300,
        equity: null,
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
        id: expect.any(Number),
        title: "j1",
        salary: 100,
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
        id: expect.any(Number),
        title: "j1",
        salary: 100,
        equity: "0.01",
        company_handle: "c1"
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 200,
        equity: "0",
        company_handle: "c2"
      },
      {
        id: expect.any(Number),
        title: "j3",
        salary: 300,
        equity: null,
        company_handle: "c3"
      }
    ]);
  });
});

/************************************** get */



describe("get", function () {
  test("works", async function () {
    const result = await db.query(`SELECT id
                            FROM jobs
                            WHERE title = 'j1'`);
    const id = result.rows[0].id;
    let jobs = await Job.get(id);
    expect(jobs).toEqual({
      id: id,
      title: "j1",
      salary: 100,
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
    salary: 400,
    equity: "0.04"
  };

  test("works", async function () {
    const result = await db.query(`SELECT id
                            FROM jobs
                            WHERE title = 'j1'`);
    const id = result.rows[0].id;
    const job = await Job.update(id, updateData);
    expect(job).toEqual({
      id: id,
      title: "j4",
      salary: 400,
      equity: "0.04",
      company_handle: "c1"
    });

    const jResult = await db.query(
      `SELECT id, title, salary, equity, company_handle
          FROM jobs
          WHERE id = ${id}`);
    expect(jResult.rows[0]).toEqual({
      id: id,
      title: "j4",
      salary: 400,
      equity: "0.04",
      company_handle: "c1"
    });
  });

  test("cant update job that does not exist", async function () {
    try {
      await Job.update(0, updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    const result = await db.query(`SELECT id
                            FROM jobs
                            WHERE title = 'j1'`);
    const id = result.rows[0].id;
    try {
      await Job.update(id, {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  // test("bad request with immutable data", async function () {
  //   const badData = {
  //     id: 999,
  //     company_handle: "c3",
  //   };

  //   const result = await db.query(`SELECT id
  //                           FROM jobs
  //                           WHERE title = 'j1'`);
  //   const id = result.rows[0].id;
  //   try {
  //     await Job.update(id, badData);
  //     throw new Error("fail test, you shouldn't get here");
  //   } catch (err) {
  //     expect(err instanceof BadRequestError).toBeTruthy();
  //   }
  // });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    const result = await db.query(`SELECT id
                            FROM jobs
                            WHERE title = 'j1'`);
    const id = result.rows[0].id;

    await Job.remove(id);
    const res = await db.query(
      `SELECT id FROM jobs WHERE id = ${id}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Job.remove(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
