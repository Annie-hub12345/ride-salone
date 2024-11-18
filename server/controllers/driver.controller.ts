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

// Sending OTP to driver phone number
export const sendingOtpToPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number } = req.body;
    console.log(phone_number);
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

// Verifying OTP for login
export const verifyPhoneOtpForLogin = async (
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

      const driver = await prisma.driver.findUnique({
        where: {
          phone_number,
        },
      });
      sendToken(driver, res);
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

// Verifying phone OTP for registration
export const verifyPhoneOtpForRegistration = async (
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

      await sendingOtpToEmail(req, res);
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
export const sendingOtpToEmail = async (req: Request, res: Response) => {
  try {
    const {
      name,
      country,
      phone_number,
      email,
      vehicle_type,
      registration_number,
      registration_date,
      driving_license,
      vehicle_color,
      rate,
    } = req.body;

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const driver = {
      name,
      country,
      phone_number,
      email,
      vehicle_type,
      registration_number,
      registration_date,
      driving_license,
      vehicle_color,
      rate,
    };
    const token = jwt.sign(
      {
        driver,
        otp,
      },
      process.env.EMAIL_ACTIVATION_SECRET!,
      {
        expiresIn: "5m",
      }
    );

    // Create a Nodemailer transporter
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

// Verifying email OTP and creating driver account
export const verifyingEmailOtp = async (req: Request, res: Response) => {
  try {
    const { otp, token } = req.body;

    const newDriver: any = jwt.verify(
      token,
      process.env.EMAIL_ACTIVATION_SECRET!
    );

    if (newDriver.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is not correct or expired!",
      });
    }

    const {
      name,
      country,
      phone_number,
      email,
      vehicle_type,
      registration_number,
      registration_date,
      driving_license,
      vehicle_color,
      rate,
    } = newDriver.driver;

    const driver = await prisma.driver.create({
      data: {
        name,
        country,
        phone_number,
        email,
        vehicle_type,
        registration_number,
        registration_date,
        driving_license,
        vehicle_color,
        rate,
      },
    });
    sendToken(driver, res);
  } catch (error) {
    console.log("Error verifying email OTP:", error);
    res.status(400).json({
      success: false,
      message: "Your OTP is expired!",
    });
  }
};

// Get logged-in driver data
export const getLoggedInDriverData = async (req: any, res: Response) => {
  try {
    const driver = req.driver;

    res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    console.log("Error fetching driver data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch driver data.",
    });
  }
};

// Updating driver status
export const updateDriverStatus = async (req: any, res: Response) => {
  try {
    const { status } = req.body;

    const driver = await prisma.driver.update({
      where: {
        id: req.driver.id!,
      },
      data: {
        status,
      },
    });
    res.status(200).json({
      success: true,
      driver,
    });
  } catch (error: any) {
    console.log("Error updating driver status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get drivers data by IDs
export const getDriversById = async (req: Request, res: Response) => {
  try {
    const { ids } = req.query as any;
    console.log(ids, "ids");
    if (!ids) {
      return res.status(400).json({ message: "No driver IDs provided" });
    }

    const driverIds = ids.split(",");

    // Fetch drivers from database
    const drivers = await prisma.driver.findMany({
      where: {
        id: { in: driverIds },
      },
    });

    res.json(drivers);
  } catch (error) {
    console.error("Error fetching driver data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Creating new ride
export const newRide = async (req: any, res: Response) => {
  try {
    const {
      userId,
      charge,
      status,
      currentLocationName,
      destinationLocationName,
      distance,
    } = req.body;

    const newRide = await prisma.rides.create({
      data: {
        userId,
        driverId: req.driver.id,
        charge: parseFloat(charge),
        status,
        currentLocationName,
        destinationLocationName,
        distance,
      },
    });
    res.status(201).json({ success: true, newRide });
  } catch (error) {
    console.log("Error creating new ride:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Updating ride status
export const updatingRideStatus = async (req: any, res: Response) => {
  try {
    const { rideId, rideStatus } = req.body;

    // Validate input
    if (!rideId || !rideStatus) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    const driverId = req.driver?.id;
    if (!driverId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Fetch the ride data to get the rideCharge
    const ride = await prisma.rides.findUnique({
      where: {
        id: rideId,
      },
    });

    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    const rideCharge = ride.charge;

    // Update ride status
    const updatedRide = await prisma.rides.update({
      where: {
        id: rideId,
        driverId,
      },
      data: {
        status: rideStatus,
      },
    });

    if (rideStatus === "Completed") {
      // Update driver stats if the ride is completed
      await prisma.driver.update({
        where: {
          id: driverId,
        },
        data: {
          totalEarning: {
            increment: rideCharge,
          },
          totalRides: {
            increment: 1,
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      updatedRide,
    });
  } catch (error: any) {
    console.error("Error updating ride status:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Getting driver's rides
export const getAllRides = async (req: any, res: Response) => {
  try {
    const rides = await prisma.rides.findMany({
      where: {
        driverId: req.driver?.id,
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
    console.error("Error fetching rides:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rides.",
    });
  }
};
