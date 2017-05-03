exports.Error = class DanbooruError extends Error {}

class HTTPError extends exports.Error {
  constructor(message, response, ...args) {
    super(...args)
    this.response = response
    this.statusCode = response.statusCode
    this.message = this.message || message
  }
}

exports.RedirectError = class RedirectError extends HTTPError {
  constructor(...args) {
    super('too many redirects', ...args)
  }
}

exports.BadRequestError = class BadRequestError extends HTTPError {
  constructor(...args) {
    super('parameters could not be parsed', ...args)
  }
}

exports.UnauthorizedError = class UnauthorizedError extends HTTPError {
  constructor(...args) {
    super('authentication failed', ...args)
  }
}

exports.ForbiddenError = class ForbiddenError extends HTTPError {
  constructor(...args) {
    super('access denied', ...args)
  }
}

exports.NotFoundError = class NotFoundError extends HTTPError {
  constructor(...args) {
    super('not found', ...args)
  }
}

exports.GoneError = class GoneError extends HTTPError {
  constructor(...args) {
    super('pagination limit', ...args)
  }
}

exports.InvalidRecordError = class InvalidRecordError extends HTTPError {
  constructor(...args) {
    super('record could not be saved', ...args)
  }
}

exports.LockedError = class LockedError extends HTTPError {
  constructor(...args) {
    super('resource is locked', ...args)
  }
}

exports.AlreadyExistsError = class AlreadyExistsError extends HTTPError {
  constructor(...args) {
    super('resource already exists', ...args)
  }
}

exports.InvalidParametersError = class InvalidParametersError extends HTTPError {
  constructor(...args) {
    super('parameters are invalid', ...args)
  }
}

exports.UserThrottledError = class UserThrottledError extends HTTPError {
  constructor(...args) {
    super('user is throttled', ...args)
  }
}

exports.InternalServerError = class InternalServerError extends HTTPError {
  constructor(...args) {
    super('internal server error', ...args)
  }
}

exports.ServiceUnavailableError = class ServiceUnavailableError extends HTTPError {
  constructor(...args) {
    super('downbooru', ...args)
  }
}

exports.StatusCodeError = class UnknownStatusCodeError extends HTTPError {
  constructor(...args) {
    super('unknown status code', ...args)
  }
}
