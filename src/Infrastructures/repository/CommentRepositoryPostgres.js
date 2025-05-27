const CommentRepository = require("../../Domains/comments/CommentRepository");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment({ content, threadId, owner }) {
    const id = `comment-${this._idGenerator()}`;
    const query = {
      text: "INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner",
      values: [id, content, threadId, owner],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async verifyCommentAndOwner(id, owner) {
    const query = {
      text: "SELECT id, owner FROM comments WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("komentar tidak ditemukan");
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError("tidak berhak mengakses resource ini");
    }

    return result.rows[0];
  }

  async softDeleteComment(id) {
    const query = {
      text: "UPDATE comments SET is_deleted = true WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("komentar tidak ditemukan");
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: "SELECT * FROM comments WHERE thread_id = $1 ORDER BY date ASC",
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      return [];
    }

    return result.rows;
  }

  async verifyCommentExists(id) {
    const query = {
      text: "SELECT id FROM comments WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("komentar tidak ditemukan");
    }
  }

  async verifyCommentAndThreadExists(commentId, threadId) {
    const query = {
      text: "SELECT id FROM comments WHERE id = $1 AND thread_id = $2",
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("komentar tidak ditemukan pada thread ini");
    }
  }
}

module.exports = CommentRepositoryPostgres;
