
// This file re-exports all finance-related services for backward compatibility
import { 
  fetchTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction 
} from './transactionService';

import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from './categoryService';

import {
  fetchAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  updateAccountBalance
} from './accountService';

import { generateReport } from './reportService';

export {
  // Transaction operations
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  
  // Category operations
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  
  // Account operations
  fetchAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  updateAccountBalance,
  
  // Report generation
  generateReport
};
