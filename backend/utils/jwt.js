import jwt from "jsonwebtoken";

export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            type: user.type,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    );
};