import mysql from "mysql2/promise";
import inquirer from "inquirer";
import consoleTable from "console.table";

start();

async function start() {
  // creates connection to sql database
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "employees_db",
  });

  // connects to sql server and sql database
  await connection.connect();

  while (true) {
    await options();
  }

  // prompts user with list of options to choose from
  async function options() {
    const answer = await inquirer.prompt({
      name: "action",
      type: "list",
      message: "Welcome to our employee database! What would you like to do?",
      choices: [
        "View all employees",
        "View all departments",
        "View all roles",
        "Add an employee",
        "Add a department",
        "Add a role",
        "Update employee role",
        "Delete an employee",
        "EXIT",
      ],
    });

    switch (answer.action) {
      case "View all employees":
        await viewEmployees();
        break;
      case "View all departments":
        await viewDepartments();
        break;
      case "View all roles":
        await viewRoles();
        break;
      case "Add an employee":
        await addEmployee();
        break;
      case "Add a department":
        await addDepartment();
        break;
      case "Add a role":
        await addRole();
        break;
      case "Update employee role":
        await updateRole();
        break;
      case "Delete an employee":
        await deleteEmployee();
        break;
      case "EXIT":
        await exitApp();
        break;
      default:
        break;
    }
  }

  // Shows a formatted table with department names and IDs
  async function viewDepartments() {
    const [data] = await connection.query(`
      SELECT * FROM department
    `);

    console.table(data);
  }

  // Shows a formatted table with role data
  async function viewRoles() {
    const [data] = await connection.query(`
      SELECT
        role.id, title, salary, department.name AS department
      FROM
        role INNER JOIN department
        ON( role.department_id = department.id )
    `);

    console.table(data);
  }

  // Shows a formatted table with employee data
  async function viewEmployees() {
    const [data] = await connection.query(`
      SELECT
        E.id,
        E.first_name AS 'first name',
        E.last_name AS 'last name',
        R.title AS 'job title',
        D.name AS department,
        R.salary,
        CONCAT(M.first_name, ' ', M.last_name) AS manager
      FROM
        employee AS E LEFT JOIN employee AS M
        ON( E.manager_id = M.id )
          INNER JOIN role as R
          ON( E.role_id = R.id )
          INNER JOIN department as D
          ON( R.department_id = D.id )
    `);

    console.table(data);
  }

  // Adds a department to the database
  async function addDepartment() {
    const answer = await inquirer.prompt({
      name: "name",
      type: "input",
      message: "Enter a department name: ",
    });

    await connection.query(
      `
      INSERT INTO department(\`name\`) VALUES(?)
    `,
      [answer.name]
    );
  }

  // Adds a role to the database
  async function addRole() {
    const answer = await inquirer.prompt([
      {
        name: "title",
        type: "input",
        message: "Enter a role title: ",
      },
      {
        name: "salary",
        type: "input",
        message: "Enter a role salary: ",
      },
      {
        name: "department",
        type: "input",
        message: "Enter a department: ",
      },
    ]);

    await connection.query(
      `
      INSERT INTO role(title, salary, department_id) 
      VALUES(?, ?, (SELECT id FROM department WHERE \`name\` = ?))
    `,
      [answer.title, answer.salary, answer.department]
    );
  }

  // Adds a employee to the database
  async function addEmployee() {
    const answer = await inquirer.prompt([
      {
        name: "firstName",
        type: "input",
        message: "Enter a first name: ",
      },
      {
        name: "lastName",
        type: "input",
        message: "Enter a last name: ",
      },
      {
        name: "role",
        type: "input",
        message: "Enter a role: ",
      },
      {
        name: "manager",
        type: "input",
        message: "Enter a manager: ",
      },
    ]);

    await connection.query(
      `
      INSERT INTO employee(first_name, last_name, role_id, manager_id) 
        SELECT
          ?, 
          ?, 
          role.id, 
          employee.id
        FROM
          role,
          employee
        WHERE
          role.title = ? AND (employee.first_name = ? AND employee.last_name = ?)
    `,
      [
        answer.firstName,
        answer.lastName,
        answer.role,
        answer.manager.split(" ")[0],
        answer.manager.split(" ")[1],
      ]
    );
  }

  async function updateRole() {
    const answer = await inquirer.prompt([
      {
        name: "name",
        type: "input",
        message: "Enter an employee to update: ",
      },
      {
        name: "newRole",
        type: "input",
        message: "Enter their new role: ",
      },
    ]);

    await connection.query(
      `
      UPDATE 
        employee
      SET
        role_id = (SELECT id FROM role WHERE title = ?)
      WHERE
        first_name = ? AND last_name = ?
    `,
      [answer.newRole, answer.name.split(" ")[0], answer.name.split(" ")[1]]
    );
  }

  async function deleteEmployee() {
    try {
      const answer = await inquirer.prompt([
        {
          name: "name",
          type: "input",
          message: "Enter an employee to delete: ",
        },
      ]);

      await connection.query(
        `
      DELETE FROM 
        employee
      WHERE
        first_name = ? AND last_name = ?
    `,
        [answer.name.split(" ")[0], answer.name.split(" ")[1]]
      );
    } catch (error) {
      if (error.errno == 1451) {
        console.log("Error: Cannot delete a manager.");
      } else {
        console.log(error);
      }
    }
  }

  async function exitApp() {
    process.exit();
  }
}
