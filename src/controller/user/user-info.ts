import {Request, Response} from "express";
import {AuthenticationTokenLocalsResponse} from "../../middleware/middleware-authentication-token";

/**
 * @param req
 * @param res
 */
export const getUserInfoController = async (req: Request, res: Response<any, AuthenticationTokenLocalsResponse>) => {
    const {user} = res.locals

    res.status(200).json({
        user: user.info
    })
}