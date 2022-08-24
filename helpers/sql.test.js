const { sqlForPartialUpdate, sqlForFiltering } = require("./sql");
const { BadRequestError } = require("../expressError");


describe("sqlForPartialUpdate", function () {
  test("works", function () {
    const dataToUpdate = { firstName: 'Aliya', age: 32 };
    const jsToSql = { firstName: "first_name", age: "age" };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual(
      { setCols: '"first_name"=$1, "age"=$2', values: ['Aliya', 32] }
    );
  });

  test("no data", function () {
    const dataToUpdate = {};
    const jsToSql = {};
    try {
      sqlForPartialUpdate(dataToUpdate, jsToSql);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }

  });
});


describe("sqlForFiltering", function () {
  test("correct search", function () {
    const searchObj = {
      nameLike: "burton",
      minEmployees: 400,
      maxEmployees: 900
    };
    const results = sqlForFiltering(searchObj);
    expect(results).toEqual({
      conditions: 'name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3',
      values: ['%burton%', 400, 900]
    });
  });

  test("out of bound search terms", function () {
    const searchObj = { logo: "burton" };
    try {
      const results = sqlForFiltering(searchObj);
      throw new Error("search test failed");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    };
  });

  test("out of bound search terms", function () {
    const searchObj = {
      minEmployees: 900,
      maxEmployees: 400
    };
    try {
      const results = sqlForFiltering(searchObj);
      throw new Error("search test failed");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    };
  });

})
