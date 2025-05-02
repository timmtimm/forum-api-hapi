const pool = require("../../database/postgres/pool");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UserTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const EndpointTestHelper = require("../../../../tests/EndpointTestHelper");

describe("/threads endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UserTableTestHelper.cleanTable();
  });

  describe("when POST /threads", () => {
    it("should respond with 400 when request payload not meet data type specification", async () => {
      const server = await createServer(container);
      const { accessToken } = await EndpointTestHelper.generateAccessToken(
        server
      );
      const requestPayload = {
        title: 123,
        body: true,
      };
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat thread baru karena tipe data tidak sesuai"
      );
    });
    it("should respond with 201 and persisted thread", async () => {
      const server = await createServer(container);
      const { accessToken } = await EndpointTestHelper.generateAccessToken(
        server
      );
      const requestPayload = {
        title: "Thread Title",
        body: "Thread Body",
      };
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedThread).toBeDefined();
    });
  });
});
