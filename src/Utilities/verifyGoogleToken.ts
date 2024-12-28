import ApiError from "../App/Error/ApiError";

const { OAuth2Client } = require("google-auth-library");

const CLIENT_ID = process.env.GoogleClientId;
const client = new OAuth2Client(CLIENT_ID);

export const verifyGoogleToken = async (token: any) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    throw new ApiError(405, "Invalid token!");
  }
};
