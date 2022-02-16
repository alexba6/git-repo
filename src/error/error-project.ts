import {APIError} from "./index";

type ProjectErrorList =
      'PROJECT_NOT_FOUND'
    | 'MAX_PROJECT_COUNT'
    | 'NAME_ALREADY_TAKEN'
    | 'ACTION_NOT_INIT'
    | 'ACTION_ALREADY_INIT'
    | 'CONTAINER_NOT_FOUND'
    | 'INVALID_CONTAINER_STATE'
    | 'COMMIT_NOT_FOUND'
    | 'ALREADY_SWITCH'

export class ProjectError extends APIError<ProjectErrorList> {
    /**
     * @param error
     */
    constructor(error: ProjectErrorList) {
        super(error, {
            statusCode: 400
        })
    }
}