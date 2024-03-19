import { Router } from 'express';
import authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.use(authController.protect);
router.post(
  '/register-phone',
  authController.checkPhoneNumber,
  authController.registerPhone
);
router.post(
  '/resend-sms-code',
  authController.checkPhoneNumber,
  authController.resendSMSCode
);
router.post('/verify-sms-code', authController.verifySMSCode);
router.patch(
  '/update-my-phone',
  authController.checkPhoneNumber,
  authController.updatePhone
);
router.patch('/update-my-password', authController.updatePassword);

export default router;

/**
 * @swagger
 * components:
 *  schemas:
 *   User:
 *    type: object
 *    required:
 *      - firstname
 *      - lastname
 *      - gender
 *      - email
 *      - phone
 *      - password
 *      - passwordConfirm
 *    properties:
 *      id:
 *        type: string
 *        description: The auto-generated id of the user
 *      firstname:
 *        type: string
 *        description: The first name of the user
 *      lastname:
 *        type: string
 *        description: The last name of the user
 *      gender:
 *        type: string
 *        description: The gender of the user
 *      email:
 *        type: string
 *        description: The email of the user
 *      phone:
 *        type: string
 *        description: The phone number of the user
 *      role:
 *        type: string
 *        description: The role of the user
 *      password:
 *        type: string
 *        description: The password of the user
 *      passwordConfirm:
 *        type: string
 *        description: The password user confirmed password
 *   Error:
 *      type: object
 *      properties:
 *         status:
 *           type: string
 *           default: 'error'
 *           description: The status of the error
 *         error:
 *           type: object
 *           properties:
 *              statusCode:
 *                type: integer
 *                description: The status code of the error
 *              status:
 *                type: string
 *                description: The status or the error code
 *         message:
 *           type: string
 *           description: The error message
 *
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication management
 * /auth/register:
 *    post:
 *       summary: Register a new user
 *       tags: [Authentication]
 *       requestBody:
 *          required: true
 *          content:
 *             application/json:
 *                schema:
 *                  $ref: '#/components/schemas/User'
 *       responses:
 *         200:
 *            description: The newly registered user
 *            content:
 *               application/json:
 *                 schema:
 *                   $ref: '#/components/schemas/User'
 *         500:
 *           description: Some server error
 *           content:
 *             application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 * /auth/login:
 *    post:
 *       summary: Login an existing user
 *       tags: [Authentication]
 *       requestBody:
 *          required: true
 *          content:
 *             application/json:
 *               schema:
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 *       responses:
 *         200:
 *            description: The login user was successfully
 *            content:
 *               application/json:
 *                 schema:
 *                   $ref: '#/components/schemas/User'
 *         400:
 *             description: Email or password not provided, Invalid email or password
 *             content:
 *                application/json:
 *                   schema:
 *                     $ref: '#/components/schemas/Error'
 *         500:
 *             description: Some internal server error
 *             content:
 *               application/json:
 *                 schema:
 *                   $ref: '#/components/schem/Error'
 */
