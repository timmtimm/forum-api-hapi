const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const UserRepository = require("../../../Domains/users/UserRepository");
const GetThreadUseCase = require("../GetThreadUseCase");

describe("GetThreadUseCase", () => {
  it("should orchestrating the get thread action correctly", async () => {
    // Arrange
    const useCasePayload = "thread-123";

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();

    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.findById = jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: "thread-123",
        title: "sebuah judul",
        body: "sebuah body",
        date: "2023-01-01T00:00:00.000Z",
        owner: "user-123",
      })
    );
    mockUserRepository.getUsernameById = jest
      .fn()
      .mockImplementation(() => Promise.resolve("dicoding"));

    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([
          {
            id: "comment-123",
            content: "sebuah comment",
            date: "2023-01-01T00:00:00.000Z",
            owner: "user-123",
          },
        ])
      );

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(thread).toStrictEqual({
      id: "thread-123",
      title: "sebuah judul",
      body: "sebuah body",
      date: "2023-01-01T00:00:00.000Z",
      username: "dicoding",
      comments: [
        {
          id: "comment-123",
          content: "sebuah comment",
          date: "2023-01-01T00:00:00.000Z",
          username: "dicoding",
        },
      ],
    });
  });

  it("should throw one deleted comment as '**komentar telah dihapus**'", async () => {
    // Arrange
    const useCasePayload = "thread-123";

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();

    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.findById = jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: "thread-123",
        title: "sebuah judul",
        body: "sebuah body",
        date: "2023-01-01T00:00:00.000Z",
        owner: "user-123",
      })
    );
    mockUserRepository.getUsernameById = jest
      .fn()
      .mockImplementation(() => Promise.resolve("dicoding"));

    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([
          {
            id: "comment-123",
            content: "sebuah comment",
            date: "2023-01-01T00:00:00.000Z",
            owner: "user-123",
            is_deleted: true,
          },
        ])
      );

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(thread).toStrictEqual({
      id: "thread-123",
      title: "sebuah judul",
      body: "sebuah body",
      date: "2023-01-01T00:00:00.000Z",
      username: "dicoding",
      comments: [
        {
          id: "comment-123",
          content: "**komentar telah dihapus**",
          date: "2023-01-01T00:00:00.000Z",
          username: "dicoding",
        },
      ],
    });
  });
});
