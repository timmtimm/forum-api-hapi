const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const AddReplyUseCase = require("../AddReplyUseCase");

describe("AddReplyCase", () => {
  it("should orchestrating the create reply action correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      content: "a reply",
      commentId: "comment-123",
      owner: "user-123",
    };

    const expectCreatedReply = {
      id: "reply-123",
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAndThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: "reply-123",
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      })
    );

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const createdReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.verifyCommentAndThreadExists).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId
    );
    expect(mockReplyRepository.addReply).toBeCalledWith({
      content: useCasePayload.content,
      owner: useCasePayload.owner,
      commentId: useCasePayload.commentId,
      threadId: useCasePayload.threadId,
    });
    expect(createdReply).toStrictEqual(expectCreatedReply);
  });
});
