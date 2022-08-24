const { BadRequestError } = require("../expressError");
const { SEARCH_FILTERS } = require("../config")

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

/** Helper function that takes in object {filters = req.query}
 * returns obj {conditons, values}
 * conditions is string: "SQL conditional query for WHERE clause"
 * values is array: [conditional values]
*/

function sqlForFiltering(filters) {
  let conditions = [];
  let keys = Object.keys(filters);
  let values = Object.values(filters); //[name, minNum, maxNum]

  if (keys.every(e => SEARCH_FILTERS.includes(e)) === false) {
   throw new BadRequestError("invalid search")
  }

  if (filters.minEmployees > filters.maxEmployees) {
    throw new BadRequestError(`minimum employee number must be less
                               than maximum employee number`);
  }

  if (filters.nameLike) {
    conditions.push('name ILIKE $1');
    values[0] = `%${filters.nameLike}%`;
  }

  if (filters.minEmployees) {
    conditions.push(`num_employees >= $${keys.indexOf("minEmployees") + 1}`);
  }

  if (filters.maxEmployees) {
    conditions.push(`num_employees <= $${keys.indexOf("maxEmployees") + 1}`);
  }

  if (conditions.length > 1) {
    conditions = conditions.join(" AND ");
  } else {
    conditions = conditions.toString();
  }

  return {
    conditions,
    values
  };
}


module.exports = {
  sqlForPartialUpdate,
  sqlForFiltering
};
