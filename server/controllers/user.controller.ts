require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import twilio from "twilio";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";
import { sendToken } from "../utils/send-token";
import nodemailer from "nodemailer"; // Import Nodemailer

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken, {
  lazyLoading: true,
});

// Register new user
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number } = req.body;
    try {
      await client.verify.v2
        ?.services(process.env.TWILIO_SERVICE_SID!)
        .verifications.create({
          channel: "sms",
          to: phone_number,
        });

      res.status(201).json({
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
    });
  }
};

// Verify OTP
export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number, otp } = req.body;

    try {
      await client.verify.v2
        .services(process.env.TWILIO_SERVICE_SID!)
        .verificationChecks.create({
          to: phone_number,
          code: otp,
        });

      // Check if user exists
      const isUserExist = await prisma.user.findUnique({
        where: {
          phone_number,
        },
      });

      if (isUserExist) {
        await sendToken(isUserExist, res);
      } else {
        // Create new user account
        const user = await prisma.user.create({
          data: {
            phone_number: phone_number,
          },
        });
        res.status(200).json({
          success: true,
          message: "OTP verified successfully!",
          user: user,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: "Something went wrong!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
    });
  }
};

// Sending OTP to email using Nodemailer
export const sendingOtpToEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name, userId } = req.body;

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const user = {
      userId,
      name,
      email,
    };
    const token = jwt.sign(
      {
        user,
        otp,
      },
      process.env.EMAIL_ACTIVATION_SECRET!,
      {
        expiresIn: "5m",
      }
    );

    // Create a Nodemailer transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your app-specific password
      },
    });

    // Email content
    const mailOptions = {
      from: `"RideSalone Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email address!",
      html: `
        <p>Hi ${name},</p>
        <p>Your RideSalone verification code is <b>${otp}</b>. If you didn't request this OTP, please ignore this email!</p>
        <p>Thanks,<br>RideSalone Team</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      token,
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    res.status(400).json({
      success: false,
      message: "Failed to send verification email.",
    });
  }
};

// Verifying email OTP
export const verifyingEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { otp, token } = req.body;

    const newUser: any = jwt.verify(
      token,
      process.env.EMAIL_ACTIVATION_SECRET!
    );

    if (newUser.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is not correct or expired!",
      });
    }

    const { name, email, userId } = newUser.user;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user?.email === null) {
      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name: name,
          email: email,
        },
      });
      await sendToken(updatedUser, res);
    } else {
      res.status(400).json({
        success: false,
        message: "Email already verified.",
      });
    }
  } catch (error) {
    console.log("Error verifying email OTP:", error);
    res.status(400).json({
      success: false,
      message: "Your OTP is expired or invalid!",
    });
  }
};

// Get logged-in user data
export const getLoggedInUserData = async (req: any, res: Response) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("Error fetching user data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data.",
    });
  }
};

// Getting user rides
export const getAllRides = async (req: any, res: Response) => {
  try {
    const rides = await prisma.rides.findMany({
      where: {
        userId: req.user?.id,
      },
      include: {
        driver: true,
        user: true,
      },
    });
    res.status(200).json({
      success: true,
      rides,
    });
  } catch (error) {
    console.log("Error fetching rides:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rides.",
    });
  }
};
