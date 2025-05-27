class DeleteReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { threadId, replyId, commentId, owner } = payload;

    this.threadId = threadId;
    this.replyId = replyId;
    this.commentId = commentId;
    this.owner = owner;
  }

  _verifyPayload({ threadId, replyId, commentId, owner }) {
    if (!threadId || !replyId || !commentId || !owner) {
      throw new Error("DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof threadId !== "string" ||
      typeof replyId !== "string" ||
      typeof commentId !== "string" ||
      typeof owner !== "string"
    ) {
      throw new Error("DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = DeleteReply;
