const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddCommentUseCase = require("../AddCommentUseCase");
const CreateComment = require("../../../Domains/comments/entities/CreateComment");
const CreatedComment = require("../../../Domains/comments/entities/CreatedComment");

describe("AddCommentUseCase", () => {
  it("should orchestrating the create comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "a comment",
      threadId: "thread-123",
      owner: "user-123",
    };

    const expectCreatedComment = new CreatedComment({
      id: "comment-123",
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new CreatedComment({
          id: "comment-123",
          content: useCasePayload.content,
          owner: useCasePayload.owner,
        })
      )
    );

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new CreateComment({
        content: useCasePayload.content,
        owner: useCasePayload.owner,
        threadId: useCasePayload.threadId,
      })
    );
    expect(createdComment).toStrictEqual(expectCreatedComment);
  });
});
