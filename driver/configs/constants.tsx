import { Driving, SmallCard, SmartCar, Wallet } from "@/utils/icons";
import Images from "../utils/images";
import color from "@/themes/app.colors";
import React from "react";

export const slides = [
  {
    id: 0,
    image: Images.destination,
    text: "Choose Your rate",
    description: "Earn to your expectations",
  },
  {
    id: 1,
    image: Images.trip,
    text: "Wait for your passenger",
    description: "Just wait for a while now until your passenger is picking you!",
  },
  {
    id: 2,
    image: Images.bookRide,
    text: "Enjoy Your Trip",
    description:
      "Drive safely and collect you money upon arrival!",
  },
];

export const rideData = [
  { id: "1", totalEarning: "NLe 1200", title: "Total Earning" },
  { id: "2", totalEarning: "12", title: "Complete Ride" },
  { id: "3", totalEarning: "1", title: "Pending Ride" },
  { id: "4", totalEarning: "04", title: "Cancel Ride" },
];

export const rideIcons = [
  <Wallet colors={color.primary} />,
  <SmartCar />,
  <SmallCard color={color.primary} />,
  <Driving color={color.primary} />,
];

export const recentRidesData: recentRidesTypes[] = [
  {
    id: "1",
    user: "Annie Blessing",
    rating: "5",
    earning: "142",
    pickup: "52 Kissy Road, Freetown",
    dropoff: "28 Newcastle Street, Kissy Shell",
    time: "14 July 01:34 pm",
    distance: "8km",
  },
];
