class GetThreadUseCase {
  constructor({ commentRepository, threadRepository, userRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExists(threadId);
    const thread = await this._threadRepository.findById(threadId);
    thread.username = await this._userRepository.getUsernameById(thread.owner);
    delete thread.owner;

    const comments = await this._commentRepository.getCommentsByThreadId(
      threadId
    );

    return {
      ...thread,
      comments: await Promise.all(
        comments.map(async (comment) => ({
          id: comment.id,
          content: !comment.is_deleted
            ? comment.content
            : "**komentar telah dihapus**",
          date: comment.date,
          username: await this._userRepository.getUsernameById(comment.owner),
        }))
      ),
    };
  }
}

module.exports = GetThreadUseCase;
