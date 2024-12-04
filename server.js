// Import required libraries
const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const fs = require('fs');  // For file operations (optional, if you want to persist data)

// Initialize Express app
const app = express();
const port = 3000;

// Use body-parser to parse JSON requests
app.use(bodyParser.json());

// Sample in-memory expenses array (replace this with file reading if you want persistent storage)
let expenses = [];

// Endpoint to add new expenses
app.post('/expenses', (req, res) => {
  const { category, amount, date } = req.body;

  // Validate input
  if (!category || !amount || !date) {
    return res.status(400).json({
      status: 'error',
      error: 'Missing fields',
    });
  }

  // Add new expense to the array
  const newExpense = {
    id: expenses.length + 1,
    category,
    amount,
    date,
  };
  expenses.push(newExpense);

  // Respond with success
  res.status(201).json({
    status: 'success',
    data: newExpense,
    error: null,
  });
});

// Endpoint to get all expenses (for viewing)
app.get('/expenses', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: expenses,
    error: null,
  });
});

// Function to generate the summary report
function generateSummary(period) {
  let summary = {
    period: period,
    totalAmount: 0,
    expensesByCategory: {},
  };

  // Loop through the expenses and calculate totals
  expenses.forEach((expense) => {
    summary.totalAmount += expense.amount;
    
    if (summary.expensesByCategory[expense.category]) {
      summary.expensesByCategory[expense.category] += expense.amount;
    } else {
      summary.expensesByCategory[expense.category] = expense.amount;
    }
  });

  // Log the generated summary (you can modify this to email or save it to a file)
  console.log(`Summary for ${period}:`);
  console.log(`Total Amount: $${summary.totalAmount}`);
  console.log('Expenses by Category:');
  for (let category in summary.expensesByCategory) {
    console.log(`${category}: $${summary.expensesByCategory[category]}`);
  }
  console.log('---------------------------------');
}

// Set up CRON job to generate daily, weekly, and monthly reports

// Daily summary (runs every day at midnight)
cron.schedule('0 0 * * *', () => {
  generateSummary('daily');
});

// Weekly summary (runs every Sunday at midnight)
cron.schedule('0 0 * * 0', () => {
  generateSummary('weekly');
});

// Monthly summary (runs on the 1st day of each month at midnight)
cron.schedule('0 0 1 * *', () => {
  generateSummary('monthly');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
generateSummary('daily');
// Endpoint to analyze spending
app.get('/expenses/analysis', (req, res) => {
    if (expenses.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          message: 'No expenses to analyze',
        },
        error: null,
      });
    }
  
    // Analyze spending patterns
    let totalAmount = 0;
    let categoryTotals = {};
  
    expenses.forEach((expense) => {
      totalAmount += expense.amount;
  
      if (categoryTotals[expense.category]) {
        categoryTotals[expense.category] += expense.amount;
      } else {
        categoryTotals[expense.category] = expense.amount;
      }
    });
  
    // Prepare analysis result
    const analysis = {
      totalAmount,
      categoryTotals,
    };
  
    // Send response
    res.status(200).json({
      status: 'success',
      data: analysis,
      error: null,
    });
  });
  