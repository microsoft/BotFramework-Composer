const defaultResponse = { data: {} };

export default {
  get: jest.fn().mockResolvedValue(defaultResponse),
  post: jest.fn().mockResolvedValue(defaultResponse),
  put: jest.fn().mockResolvedValue(defaultResponse),
  patch: jest.fn().mockResolvedValue(defaultResponse),
  delete: jest.fn().mockResolvedValue(defaultResponse),
};
