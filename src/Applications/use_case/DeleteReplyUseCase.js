const DeleteReply = require("../../Domains/replies/entities/DeleteReply");

class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const createReply = new DeleteReply(useCasePayload);
    await this._threadRepository.verifyThreadExists(createReply.threadId);
    await this._commentRepository.verifyCommentAndThreadExists(
      createReply.commentId,
      createReply.threadId
    );
    await this._replyRepository.verifyCommentReplyAndOwner(
      createReply.commentId,
      createReply.replyId,
      createReply.owner
    );
    await this._replyRepository.softDeleteReply(createReply.replyId);
  }
}

module.exports = DeleteReplyUseCase;
