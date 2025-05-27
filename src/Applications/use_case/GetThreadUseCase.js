class GetThreadUseCase {
  constructor({
    replyRepository,
    commentRepository,
    threadRepository,
    userRepository,
  }) {
    this._replyRepository = replyRepository;
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
          replies: await Promise.all(
            (
              await this._replyRepository.getRepliesByCommentId(comment.id)
            ).map(async (reply) => ({
              id: reply.id,
              content: !reply.is_deleted
                ? reply.content
                : "**balasan telah dihapus**",
              date: reply.date,
              username: await this._userRepository.getUsernameById(reply.owner),
            }))
          ),
        }))
      ),
    };
  }
}

module.exports = GetThreadUseCase;
