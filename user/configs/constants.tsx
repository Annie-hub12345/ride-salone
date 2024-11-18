import Images from "../utils/images";

export const slides = [
  {
    id: 0,
    image: Images.destination,
    text: "Chuz U Pickup Place",
    description: "Fos, chuz di place we u wan mek di car cam pick u!",
  },
  {
    id: 1,
    image: Images.trip,
    text: "Di Driver Dae Cam",
    description: "No worry, just wait le di driver cam pick u up. U go see how far e dae!",
  },
  {
    id: 2,
    image: Images.bookRide,
    text: "Enjoy U Travel",
    description:
      "Arrive safe, pay u driver, and enjoy di journey. Alltin easy!",
  },
];

export const ws = new WebSocket("ws://192.168.1.2:8080");