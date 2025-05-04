const successResponse = (data, message = 'Success') => {
    return {
      status: 'success',
      message: message,
      data: data,
    };
  };
  
  const errorResponse = (message = 'Error', details = null) => {
    return {
      status: 'error',
      message: message,
      details: details,
    };
  };
  
  module.exports = {
    successResponse,
    errorResponse,
  };
  
  