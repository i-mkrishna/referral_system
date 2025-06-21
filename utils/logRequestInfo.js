module.exports = (req, label = 'Request') => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"];
  console.log(`${label} from IP: ${ip}, Device: ${userAgent}`);
};
