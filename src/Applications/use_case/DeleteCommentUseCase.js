const DeleteComment = require("../../Domains/comments/entities/DeleteComment");

class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const createComment = new DeleteComment(useCasePayload);
    await this._threadRepository.verifyThreadExists(createComment.threadId);
    await this._commentRepository.verifyCommentAndOwner(
      createComment.commentId,
      createComment.owner
    );
    await this._commentRepository.softDeleteComment(createComment.commentId);
  }
}

module.exports = DeleteCommentUseCase;
