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


