import jwt from "jsonwebtoken";
import { promisify } from "util";
import Randomstring from "randomstring";
import moment from "moment";
import sendMessage from "../../utilities/sms.js";
import AppError from "../../utilities/appError.js";
import catchAsync from "../../utilities/catchAsync.js";
import utils from "../../utilities/utils.js";

/**
 * @breif Generate member jwt token from member object
 * @param {Object} member -> Member (user or provider) object
 * @returns JWT
 */
const signToken = (member) =>
  jwt.sign({ member }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

/**
 * @breif Create and send member(user or provider) login token with response status code
 * @param {Object} member -> Stored member object
 * @param {Number} statusCode -> Response status code
 * @param {Response} res -> Response object
 */
const createSendToken = (member, statusCode, req, res) => {
  const token = signToken(member);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // remove password in output
  member.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      member,
    },
  });
};

/**
 * @breif Generate and send user tel authentication sms
 * @param {Object} user -> User model object
 * @returns {Function}
 */
const generateAndSendCode = catchAsync(async (Model, member, next) => {
  // 1. Generate random sms code
  let code = Randomstring.generate({
    length: 5,
    charset: "numeric",
  });
  let codeExpires = new Date(Date.now() + 20 * 60 * 1000);

  // 2. Build message
  const message = `Your Jaqq authentication code is ${code}.\nSubmit this code to verify your phone number`;

  // 3. Send message to member
  try {
    await sendMessage(message, `+237${member.contact.telephone}`); // TODO: This dialer code shouldn't be appended
  } catch (err) {
    // 4. Reset values if error in sending sms
    code = null;
    codeExpires = null;
    return next(
      new AppError("Invalid contact or unable to validate telephone", 500)
    );
  }

  // 5. Save generated code and expiry date
  await Model.findByIdAndUpdate(member.id, {
    code,
    codeExpires,
  }); // ? Look for a better way to save this
});

/**
 * @breif Resend member verification code
 * @param {Object} member
 * @returns {Function}
 */
const resendcode = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. Make sure member is not verified before resend code
    if (req.member.contact.verified) {
      return next(
        new AppError("Invalid request, your are already authenticated", 400)
      );
    }

    // 2. Generate and send code
    generateAndSendCode(Model, req.member, next);

    // 3. Send response
    res.status(200).json({ status: "success", data: null });
  });

/**
 * @breif register a new member (user/provider) in the database
 * @param {Collection} Model
 * @returns Function
 */
const register = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. Get filtered value
    const filteredBody = utils.filterObj(
      req.body,
      "firstName",
      "lastName",
      "email",
      "contact",
      "password",
      "passwordConfirm",
      "device",
      "dateOfBirth"
    );
    // filter values
    moment(filteredBody.dateOfBirth, "DD/MM/YYYY HH:mm:ss").toISOString(); // set date of birth to ISOS string
    if (req.body.contact.verified) filteredBody.contact.verified = undefined;

    // 2. Create new member (user or provider)
    const newMember = await Model.create(filteredBody);

    // 3. Generate and send verification sms
    generateAndSendCode(Model, newMember, next);

    // 4. Send response
    createSendToken(newMember, 201, req, res);
  });

/**
 * @breif Login a member into the system, this is done after member provides
 * email or contact with password, if the email or contact and password provided
 * as the same as the one stored in the database, then the member is login
 * @param {Collection} Model -> Member Collection model
 * @returns Function
 */
const login = (Model) =>
  catchAsync(async (req, res, next) => {
    const { contact, password } = req.body;

    // 1) Check if contact and password exist
    if (!contact || !password) {
      return next(
        new AppError("Please provide email or contact and password!", 400)
      );
    }

    // 2) Check if member exists && password is correct
    const member = await Model.findOne({
      $or: [{ email: contact }, { "contact.telephone": contact }],
    }).select("+password");

    if (!member || !(await member.correctPassword(password, member.password))) {
      return next(new AppError("Incorrect email or contact or password", 401));
    }

    // 3) If everything ok, send token to client
    createSendToken(member, 200, req, res);
  });

const verifyMe = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. Get code
    const { code } = req.body;
    if (!code) {
      return next(new AppError("Please provide code", 400));
    }
    // 2. Get member
    const member = await Model.findOne({
      $or: [
        { email: req.member.email },
        { "contact.telephone": req.member.contact.telephone },
      ],
    });
    // 3. Verify if code has expire
    if (Date.now() > member.codeExpires) {
      return next(new AppError("Your code has expired", 400));
    }
    // 4. Check if code matches
    if (!member.correctCode(code, member.code)) {
      return next(new AppError("Codes did not match", 401));
    }
    // 4. Update user verification status to true
    // ? Check if there is a better way to do this
    await Model.findByIdAndUpdate(member.id, {
      "contact.verified": true,
    });
    // Remove from output
    member.code = undefined;
    member.codeExpires = undefined;

    // 5. Send response
    res.status(200).json({
      status: "success",
      data: null,
    });
  });

const logout = (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

/**
 * @breif middleware function to protect routes, this middleware
 * function ensures only login members can access certain routes
 * @param {Collection} Model -> member collection model
 * @return Function
 */
const protect = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentMember = await Model.findById(decoded.member._id);

    if (!currentMember) {
      return next(
        new AppError(
          "The member belonging to this token does no longer exist.",
          401
        )
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentMember.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.member = currentMember;
    next();
  });

/**
 * @breif Restrict access only to members with verified contacts
 * @returns
 */
const restrictToVerified = (req, res, next) => {
  if (!req.member.contact.verified) {
    return next(
      new AppError(
        "Your are not allowed to performed this action, please authenticate your contact /verifyMe",
        403
      )
    );
  }
  next();
};

/**
 * @breif Update member contacts telephone and set the verified status to FALSE.
 * The a new code is generate for the member to authenticate their contact
 */
const updateContact = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. Modify contact
    const updatedMember = await Model.findByIdAndUpdate(req.member.id, {
      "contact.telephone": req.body.telephone,
      "contact.verified": false,
    });

    // 2. Generate and send contact verification code
    generateAndSendCode(Model, updatedMember, next);

    // 3. Reload data
    await updatedMember.reload();

    // 3. Send response
    res.status(200).json({
      status: "success",
      data: updatedMember,
    });
  });

/**
 * @breif Update member(user/provider) password
 * @param {Collection} Model -> Member collection model
 * @returns Function
 */
const updatePassword = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1) Get member from collection
    const member = await Model.findById(req.member.id).select("+password");

    // 2) Check if POSTed current password is correct
    if (
      !(await member.correctPassword(req.body.passwordCurrent, member.password))
    ) {
      return next(new AppError("Your current password is wrong.", 401));
    }

    // 3) If so, update password
    member.password = req.body.password;
    member.passwordConfirm = req.body.passwordConfirm;
    await member.save();
    // member.findByIdAndUpdate will NOT work as intended!

    // 4) Log member in, send JWT
    createSendToken(member, 200, req, res);
  });

export default {
  resendcode,
  register,
  login,
  verifyMe,
  logout,
  protect,
  restrictToVerified,
  updateContact,
  updatePassword,
};
