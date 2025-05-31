const ReplyRepository = require("../../Domains/replies/ReplyRepository");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const CreatedReply = require("../../Domains/replies/entities/CreatedReply");

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply({ content, commentId, owner }) {
    const id = `reply-${this._idGenerator()}`;
    const query = {
      text: "INSERT INTO replies VALUES($1, $2, $3, $4) RETURNING id, content, owner",
      values: [id, content, commentId, owner],
    };

    const result = await this._pool.query(query);
    return new CreatedReply({ ...result.rows[0] });
  }

  async verifyReplyAndOwner(id, owner) {
    const query = {
      text: "SELECT id, owner FROM replies WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("balasan tidak ditemukan");
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError("tidak berhak mengakses resource ini");
    }

    return result.rows[0];
  }

  async softDeleteReply(id) {
    const query = {
      text: "UPDATE replies SET is_deleted = true WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("balasan tidak ditemukan");
    }
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: "SELECT * FROM replies WHERE comment_id = $1 ORDER BY date ASC",
      values: [commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      return [];
    }

    return result.rows;
  }

  async verifyCommentReplyAndOwner(commentId, replyId, owner) {
    const query = {
      text: "SELECT replies.id, replies.owner FROM replies WHERE id = $1 AND comment_id = $2",
      values: [replyId, commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("balasan tidak ditemukan");
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError("tidak berhak mengakses resource ini");
    }
  }
}

module.exports = ReplyRepositoryPostgres;
