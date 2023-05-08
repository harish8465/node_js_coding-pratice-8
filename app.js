const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  const requestQuery = request.query;
  switch (true) {
    case requestQuery.priority !== undefined &&
      requestQuery.status !== undefined:
      getTodosQuery = `
        SELECT
            *
        FROM
            todo 
        WHERE
            todo LIKE '%${search_q}%'
            AND status = '${status}'
            AND priority = '${priority}';`;
      break;
    case requestQuery.priority !== undefined:
      getTodosQuery = `
        SELECT
            *
        FROM
            todo 
        WHERE
            todo LIKE '%${search_q}%'
            AND priority = '${priority}';`;
      break;
    case requestQuery.status !== undefined:
      getTodosQuery = `
        SELECT
            *
        FROM
            todo 
        WHERE
            todo LIKE '%${search_q}%'
            AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
        SELECT
            *
        FROM
            todo 
        WHERE
            todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
  SELECT * FROM todo WHERE id = ${todoId};
  `;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
    INSERT INTO todo (id, todo, priority, status) 
    VALUES (${id}, '${todo}','${priority}','${status}');
    `;
  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

//API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let sendResponse = null;
  const requestBody = request.body;
  const getPreviousQuery = `
    SELECT * FROM todo WHERE id = ${todoId};
    `;
  let { id, todo, priority, status } = await db.get(getPreviousQuery);
  switch (true) {
    case requestBody.status !== undefined:
      status = requestBody.status;
      sendResponse = "Status Updated";
      break;
    case requestBody.priority !== undefined:
      priority = requestBody.priority;
      sendResponse = "Priority Updated";
      break;
    case requestBody.todo !== undefined:
      todo = requestBody.todo;
      sendResponse = "Todo Updated";
      break;
  }
  const getUpdateQuery = `
  UPDATE todo 
  SET todo = '${todo}',
  priority = '${priority}',
  status = '${status}'
  WHERE id = ${todoId};
  `;
  await db.run(getUpdateQuery);
  response.send(sendResponse);
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo WHERE id = ${todoId};
    `;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
