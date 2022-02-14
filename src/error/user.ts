import {User} from "../model/user";
import {APIError} from "./index";

type UserErrorList = 'INVALID_PASSWORD' | 'USER_NOT_FOUND'

export class UserError extends APIError<UserErrorList> {
    public user: User | undefined

    /**
     * User error
     * @param error
     * @param user
     */
    constructor(error: UserErrorList, user?: User) {
        super(error, {
            statusCode: 400
        })
        this.user = user
    }
}