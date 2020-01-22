var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");
require("dotenv").config();

var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

var dbResults = [];

function readProducts() {
  console.log("\n" + "Welcome to Bamazon. Fetching all products...");
  connection.query(
    "SELECT item_id, product_name, department_name, price, quantity FROM products",
    function(err, res) {
      if (err) throw err;
      var table = new Table({
        head: ["ID", "Product Name", "Price", "Quantity"],
        colWidths: [10, 30, 10, 10]
      });
      for (var i = 0; i < res.length; i++) {
        var dbObj = {
          id: res[i].item_id,
          productName: res[i].product_name,
          price: res[i].price,
          quantity: res[i].quantity
        };
        var tableArray = [
          res[i].item_id,
          res[i].product_name,
          res[i].price,
          res[i].quantity
        ];
        dbResults.push(dbObj);
        table.push(tableArray);
      }
      console.log(table.toString());
      userPurchase();
    }
  );
}

function userPurchase() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Ready to purchase? Please tell me your name.",
        name: "username"
      },
      {
        type: "list",
        name: "choiceID",
        message: "Please choose product ID.",
        choices: ["1", "2", "3", "4", "5", "6", "7", "8"]
      },
      {
        type: "input",
        name: "quantity",
        message: "How many units would you like to buy?"
      }
    ])
    .then(function(inquirerResponse) {
      console.log("\n" + "Checking inventory now...\n");

      var selectedProduct = dbResults.filter(function(thing) {
        return thing.id === parseInt(inquirerResponse.choiceID);
      })[0];

      if (parseInt(inquirerResponse.quantity) <= selectedProduct.quantity) {
        console.log("***********YOUR ORDER HAS BEEN PLACED************\n");
        var msg = `Congrats, ${inquirerResponse.username}! You just purchased ${inquirerResponse.quantity} ${selectedProduct.productName}`;
        if (inquirerResponse.quantity > 1) msg = msg + "s";
        console.log(msg + "\n");
        connection.query(
          "UPDATE products SET quantity = ? WHERE item_id = ?",
          [
            selectedProduct.quantity - inquirerResponse.quantity,
            inquirerResponse.choiceID
          ],
          function(err, res) {
            if (err) throw err;
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
            console.log(
              "Your total cost is $" +
                parseInt(selectedProduct.price * inquirerResponse.quantity) +
                "\n"
            );
            restart();
          }
        );
      } else {
        console.log(
          "\n" +
            "Sorry, " +
            inquirerResponse.username +
            "," +
            " insufficient quantity! Please try again.\n"
        );
        readProducts();
      }
    });
}

function restart() {
  inquirer
    .prompt([
      {
        type: "confirm",
        message: "Would you like to make another purchase?",
        name: "newPurchase"
      }
    ])
    .then(function(inquirerResponse) {
      if (inquirerResponse.newPurchase === true) {
        console.log("\n" + "Let's take you back to the main menu...\n");
        readProducts();
      } else {
        console.log(
          "\n" +
            "Thank you for shopping today! Please visit again soon. Good-bye!\n"
        );
        connection.end();
      }
    });
}
readProducts();
