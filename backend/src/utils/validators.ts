import { NextFunction, Request, Response } from "express";
import { body, ValidationChain, validationResult } from "express-validator";

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        break;
      }
    }
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  };
};

export const loginValidator = [
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const signupValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  ...loginValidator,
];

export const chatCompletionValidator = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 5000 })
    .withMessage("Message cannot exceed 5000 characters"),
];

export const codeReviewValidator = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Code snippet is required")
    .isLength({ min: 5, max: 50000 })
    .withMessage("Code must be between 5 and 50000 characters"),
  body("fileName")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("File name cannot exceed 255 characters"),
  body("message")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Message cannot exceed 2000 characters"),
];

export const githubPrReviewValidator = [
  body("prUrl")
    .trim()
    .notEmpty()
    .withMessage("GitHub pull request URL is required")
    .isURL({ protocols: ["https"], require_protocol: true })
    .withMessage("A valid GitHub pull request URL is required")
    .custom((value) => {
      const url = new URL(value);
      return url.hostname === "github.com" && /\/pull\/\d+\/?$/.test(url.pathname);
    })
    .withMessage("URL must be a github.com pull request URL"),
  body("message")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Message cannot exceed 2000 characters"),
  body("postToGithub")
    .optional()
    .isBoolean()
    .withMessage("postToGithub must be true or false"),
  body("githubToken")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("GitHub token is too long"),
];


