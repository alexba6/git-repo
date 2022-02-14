import {APIError} from "./index";

type AuthReposErrorList =
      'INVALID_LOGIN'
    | 'INVALID_PASSWORD'
    | 'MUST_BASIC_AUTH'
    | 'PROJECT_NOT_FOUND'
    | 'CANNOT_ACCESS_TO_THIS_REPOSITORY'

export class AuthRepoError extends APIError<AuthReposErrorList> {
    /**
     * User error
     * @param error
     */
    constructor(error: AuthReposErrorList) {
        super(error, {
            json: false,
            statusCode: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="authorization needed"',
                'Content-Type': 'text/plain'
            }
        })
    }
}