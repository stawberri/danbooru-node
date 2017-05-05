exports.Error = class DanbooruError extends Error {}

exports.UserInitiatedError = class UserInitiatedError extends exports.Error {}

exports.APIError = class APIError extends exports.Error {
  constructor(message, response, ...args) {
    super(...args)
    this.response = response
    this.statusCode = response.statusCode
    if(!this.message) {
      if(response.json && response.json.success === false)
        this.message = response.json.message
      else this.message = message
    }
  }
}

exports.RedirectError = class RedirectError extends exports.APIError {
  constructor(...args) {
    super('too many redirects', ...args)
  }
}

exports.BadRequestError = class BadRequestError extends exports.APIError {
  constructor(...args) {
    super('parameters could not be parsed', ...args)
  }
}

exports.UnauthorizedError = class UnauthorizedError extends exports.APIError {
  constructor(...args) {
    super('authentication failed', ...args)
  }
}

exports.ForbiddenError = class ForbiddenError extends exports.APIError {
  constructor(...args) {
    super('access denied', ...args)
  }
}

exports.NotFoundError = class NotFoundError extends exports.APIError {
  constructor(...args) {
    super('not found', ...args)
  }
}

exports.GoneError = class GoneError extends exports.APIError {
  constructor(...args) {
    super('pagination limit', ...args)
  }
}

exports.InvalidRecordError = class InvalidRecordError extends exports.APIError {
  constructor(...args) {
    super('record could not be saved', ...args)
  }
}

exports.LockedError = class LockedError extends exports.APIError {
  constructor(...args) {
    super('resource is locked', ...args)
  }
}

exports.AlreadyExistsError = class AlreadyExistsError extends exports.APIError {
  constructor(...args) {
    super('resource already exists', ...args)
  }
}

exports.InvalidParametersError = class InvalidParametersError extends exports.APIError {
  constructor(...args) {
    super('parameters are invalid', ...args)
  }
}

exports.UserThrottledError = class UserThrottledError extends exports.APIError {
  constructor(...args) {
    super('user is throttled', ...args)
  }
}

exports.InternalServerError = class InternalServerError extends exports.APIError {
  constructor(...args) {
    super('internal server error', ...args)
  }
}

exports.ServiceUnavailableError = class ServiceUnavailableError extends exports.APIError {
  constructor(...args) {
    super('downbooru', ...args)
  }
}

exports.StatusCodeError = class UnknownStatusCodeError extends exports.APIError {
  constructor(...args) {
    super('unknown status code', ...args)
  }
}
