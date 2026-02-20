const { body, param } = require('express-validator');

exports.createTaskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),

  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description too long'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority value'),

  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),

  body('client_id')
    .notEmpty().withMessage('Client ID is required')
    .isInt().withMessage('Client ID must be a number'),

  body('assigned_to')
    .optional()
    .isInt().withMessage('Assigned user must be numeric')
];

exports.updateTaskValidation = [
  param('id')
    .isInt().withMessage('Task ID must be numeric'),

  body('title')
    .optional()
    .isLength({ min: 3 }).withMessage('Title too short'),

  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed'])
    .withMessage('Invalid status'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),

  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
];