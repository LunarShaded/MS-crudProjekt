import { body, validationResult } from 'express-validator';


export const validateAuth = [
  body('login')
    .isLength({ min: 3, max: 50 })
    .withMessage('Login musi mieć od 3 do 50 znaków')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Login może zawierać tylko litery, cyfry i podkreślniki'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Hasło musi mieć co najmniej 6 znaków')
];


export const validateTask = [
  body('title')
    .notEmpty()
    .withMessage('Tytuł jest wymagany')
    .isLength({ min: 1, max: 255 })
    .withMessage('Tytuł może mieć maksymalnie 255 znaków'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Opis może mieć maksymalnie 1000 znaków'),
  
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Nieprawidłowy status zadania')
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const fieldErrors = errors.array().map(error => ({
      field: error.path,
      code: getErrorCode(error),
      message: error.msg
    }));

    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: "Bad Request",
      fieldErrors: fieldErrors
    });
  }
  
  next();
};


const getErrorCode = (error) => {
  switch (error.type) {
    case 'field':
      if (error.msg.includes('wymagany')) return 'REQUIRED';
      if (error.msg.includes('znaków')) return 'INVALID_LENGTH';
      if (error.msg.includes('format')) return 'INVALID_FORMAT';
      if (error.msg.includes('Nieprawidłowy')) return 'INVALID_VALUE';
      return 'VALIDATION_ERROR';
    default:
      return 'VALIDATION_ERROR';
  }
};