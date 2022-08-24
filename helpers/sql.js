const { BadRequestError } = require("../expressError");


/** takes in two object params
 * dataToUpdate is equal to request.body json object
 * jsToSql is equal to JS key and db table name pair
 * returns obj {setCols: “db colum name + $idx",
 *              values: [array of values to update]}
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
