import {User} from "../model/user";
import {APIError} from "./index";

type AuthUserErrorList = 'INVALID_TOKEN'

export class AuthErrorUser extends APIError<AuthUserErrorList> {
    /**
     * User error
     * @param error
     */
    constructor(error: AuthUserErrorList) {
        super(error, {
            statusCode: 400
        })
    }
}