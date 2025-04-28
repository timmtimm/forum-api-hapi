const CreateThread = require("../../Domains/threads/entities/CreateThread");

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const createThread = new CreateThread(useCasePayload);
    const response = await this._threadRepository.addThread(createThread);
    return response;
  }
}

module.exports = AddThreadUseCase;
