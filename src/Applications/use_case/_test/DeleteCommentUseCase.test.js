const CommentRepository = require("../../../Domains/comments/CommentRepository");
const DeleteCommentUseCase = require("../DeleteCommentUseCase");

describe("DeleteCommentUseCase", () => {
  it("should orchestrating the create thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      owner: "user-123",
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAndOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.softDeleteComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const deletedComment = await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(deletedComment).toStrictEqual();
  });
});
